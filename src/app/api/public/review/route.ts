import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { publicQrTokenSchema } from '@/lib/validation';

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = publicQrTokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('record_public_destination_click', {
    p_token: parsed.data.token,
  });

  if (error) {
    console.error('Failed to record a public destination click:', error);
    return NextResponse.json({ code: 'DESTINATION_CLICK_RECORDING_FAILED' }, { status: 503 });
  }
  if (data !== true) return NextResponse.json({ code: 'QR_NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
