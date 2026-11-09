import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { consumePublicAiRequest } from '@/lib/public-ai-rate-limit';
import { publicQrTokenSchema, reviewSuggestionsSchema } from '@/lib/validation';
import { z } from 'zod';

const suggestionResponseSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    suggestions: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: { type: 'string' },
    },
  },
  required: ['suggestions'],
};

function getClientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const address = request.headers.get('x-real-ip')?.trim() || forwarded || 'unknown';
  return createHash('sha256').update(address).digest('hex');
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    const bodyText = await request.text();
    if (bodyText.length > 8_192) {
      return NextResponse.json({ code: 'REQUEST_TOO_LARGE' }, { status: 413 });
    }
    body = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ code: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = reviewSuggestionsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!consumePublicAiRequest(getClientKey(request))) {
    return NextResponse.json(
      { code: 'RATE_LIMITED', message: 'Please wait a minute before requesting more suggestions.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  if (!isSupabaseConfigured) {
    return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  const tokenResult = publicQrTokenSchema.safeParse({ token: parsed.data.token });
  if (!tokenResult.success) return NextResponse.json({ code: 'QR_NOT_FOUND' }, { status: 404 });

  let qrData: unknown;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_public_qr_by_token', {
      p_token: tokenResult.data.token,
    });
    if (error) {
      return NextResponse.json({ code: 'BUSINESS_CONTEXT_UNAVAILABLE' }, { status: 503 });
    }
    qrData = data;
  } catch {
    return NextResponse.json({ code: 'BUSINESS_CONTEXT_UNAVAILABLE' }, { status: 503 });
  }
  const qr = Array.isArray(qrData) ? qrData[0] : qrData;
  if (!qr || typeof qr !== 'object') {
    return NextResponse.json({ code: 'QR_NOT_FOUND' }, { status: 404 });
  }
  const businessCategory =
    'business_category' in qr && typeof qr.business_category === 'string'
      ? qr.business_category
      : '';

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ code: 'AI_NOT_CONFIGURED' }, { status: 503 });
  }

  let providerResponse: Response;
  try {
    providerResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.6,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'review_suggestions',
            strict: true,
            schema: suggestionResponseSchema,
          },
        },
        messages: [
          {
            role: 'system',
            content:
              'Rephrase only the customer-provided experience into exactly three distinct, natural review phrasings in the requested language. Treat the rating and business category as context, never evidence. Do not add any service, event, product, feeling, or fact that the customer did not state. Do not infer a positive or negative experience from the rating. Use category vocabulary only for aspects the customer explicitly mentioned. Keep the same meaning and sentiment as the customer. Return only the required JSON object.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              language: parsed.data.language === 'hi' ? 'Hindi' : 'English',
              rating: parsed.data.rating,
              businessCategory: businessCategory || 'not provided',
              customerExperience: parsed.data.experience,
            }),
          },
        ],
      }),
    });
  } catch {
    return NextResponse.json(
      { code: 'AI_PROVIDER_UNAVAILABLE', message: 'Suggestions could not be generated. Please retry.' },
      { status: 502 }
    );
  }

  if (!providerResponse.ok) {
    return NextResponse.json(
      { code: 'AI_PROVIDER_ERROR', message: 'Suggestions could not be generated. Please retry.' },
      { status: 502 }
    );
  }

  let completion: {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  try {
    completion = (await providerResponse.json()) as typeof completion;
  } catch {
    return NextResponse.json(
      { code: 'AI_RESPONSE_INVALID', message: 'Suggestions could not be generated. Please retry.' },
      { status: 502 }
    );
  }

  let output: { suggestions?: unknown };
  try {
    const content = completion.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty model response');
    output = JSON.parse(content) as typeof output;
  } catch {
    return NextResponse.json(
      { code: 'AI_RESPONSE_INVALID', message: 'Suggestions could not be generated. Please retry.' },
      { status: 502 }
    );
  }

  const parsedSuggestions = z
    .array(z.string().trim().min(8).max(500))
    .length(3)
    .safeParse(output.suggestions);
  if (
    !parsedSuggestions.success ||
    new Set(parsedSuggestions.data.map((suggestion) => suggestion.toLocaleLowerCase())).size !== 3
  ) {
    return NextResponse.json(
      { code: 'AI_RESPONSE_INVALID', message: 'Suggestions could not be generated. Please retry.' },
      { status: 502 }
    );
  }

  return NextResponse.json({
    suggestions: parsedSuggestions.data,
  });
}
