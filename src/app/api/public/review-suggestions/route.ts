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
    items: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          topic: {
            type: 'string',
            description: 'Short 2-4 word theme or category pill label, e.g. Hospitality & Staff, Food & Ambience, Overall Impression',
          },
          text: {
            type: 'string',
            description: 'Natural review text phrased according to the customer experience',
          },
        },
        required: ['topic', 'text'],
      },
    },
  },
  required: ['items'],
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

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ code: 'AI_NOT_CONFIGURED' }, { status: 503 });
  }

  const isRouter = Boolean(process.env.OPENROUTER_API_KEY || apiKey.startsWith('sk-or-'));
  const apiUrl = isRouter
    ? (process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1/chat/completions')
    : (process.env.AI_BASE_URL || 'https://api.openai.com/v1/chat/completions');

  // Candidate free models in order of response speed & quality
  const candidateModels = isRouter
    ? [
        process.env.OPENROUTER_MODEL || 'liquid/lfm-3-1.7b:free',
        'liquid/lfm-3-1.7b:free',
        'nvidia/nemotron-3.5-lightning:free',
        'liquid/lfm-2.5-2.6b:free',
      ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i)
    : [process.env.OPENAI_MODEL || 'gpt-4o-mini'];

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  if (isRouter) {
    headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    headers['X-Title'] = 'ReviewQR';
  }

  let completionContent: string | null = null;

  for (const model of candidateModels) {
    const requestBody: Record<string, unknown> = {
      model,
      temperature: 0.6,
      messages: [
        {
          role: 'system',
          content:
            'Rephrase only the customer-provided experience into exactly three distinct, natural review phrasings in the requested language. For each suggestion, provide a short topic pill label (2-4 words, such as "Hospitality & Staff", "Food & Ambience", "Overall Impression", or matching the specific theme of what the customer discussed) and the review text. Treat the rating, business category, and optional topic filter as context, never evidence. Do not add any service, event, product, feeling, or fact that the customer did not state. Do not infer a positive or negative experience from the rating. Keep the same meaning and sentiment as the customer. Return ONLY a valid JSON object with the key "items", containing an array of 3 objects with "topic" and "text".',
        },
        {
          role: 'user',
          content: JSON.stringify({
            language: parsed.data.language === 'hi' ? 'Hindi' : 'English',
            rating: parsed.data.rating,
            businessCategory: businessCategory || 'not provided',
            topicFilter: parsed.data.filter || undefined,
            customerExperience: parsed.data.experience,
          }),
        },
      ],
    };

    if (!isRouter) {
      requestBody.response_format = {
        type: 'json_schema',
        json_schema: {
          name: 'review_suggestions',
          strict: true,
          schema: suggestionResponseSchema,
        },
      };
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.warn(`Model ${model} returned HTTP ${response.status}, attempting fallback if available...`);
        continue;
      }

      const json = (await response.json()) as {
        choices?: Array<{ message?: { content?: string | null } }>;
      };
      const text = json.choices?.[0]?.message?.content;
      if (text && text.trim().length > 10) {
        completionContent = text;
        break;
      }
    } catch (modelErr) {
      console.warn(`Model ${model} request failed or timed out:`, modelErr);
    }
  }

  if (!completionContent) {
    return NextResponse.json(
      { code: 'AI_PROVIDER_ERROR', message: 'Suggestions could not be generated. Please retry.' },
      { status: 502 }
    );
  }

  let parsedItemsData: Array<{ topic: string; text: string }> | null = null;

  try {
    const match = completionContent.match(/\{[\s\S]*\}/);
    const jsonStr = match ? match[0] : completionContent.replace(/```(?:json)?\s*([\s\S]*?)\s*```/i, '$1').trim();
    const output = JSON.parse(jsonStr) as { items?: Array<{ topic?: unknown; text?: unknown }>; suggestions?: unknown };
    const rawList = Array.isArray(output.items)
      ? output.items
      : Array.isArray(output.suggestions)
      ? output.suggestions.map((s) => ({ topic: 'General Experience', text: s }))
      : [];

    const parsedItems = z
      .array(
        z.object({
          topic: z.string().trim().min(2).max(60),
          text: z.string().trim().min(8).max(500),
        })
      )
      .length(3)
      .safeParse(rawList);

    if (parsedItems.success && new Set(parsedItems.data.map((item) => item.text.toLowerCase())).size === 3) {
      parsedItemsData = parsedItems.data;
    }
  } catch (parseErr) {
    console.warn('Failed to parse model JSON completion:', parseErr);
  }

  if (!parsedItemsData) {
    return NextResponse.json(
      { code: 'AI_RESPONSE_INVALID', message: 'Suggestions could not be generated. Please retry.' },
      { status: 502 }
    );
  }

  return NextResponse.json({
    suggestions: parsedItemsData.map((item) => item.text),
    items: parsedItemsData,
  });
}
