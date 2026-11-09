import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { publicQrTokenSchema } from '@/lib/validation';

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(_request: Request, { params }: RouteContext): Promise<NextResponse> {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  const { token } = await params;
  const parsedToken = publicQrTokenSchema.safeParse({ token });
  if (!parsedToken.success) {
    return NextResponse.json({ code: 'QR_NOT_FOUND' }, { status: 404 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('record_public_qr_scan', {
    p_token: parsedToken.data.token,
  });

  if (error) {
    console.error('Failed to record a public QR scan:', error);
    return NextResponse.json({ code: 'SCAN_RECORDING_FAILED' }, { status: 503 });
  }
  if (data !== true) return NextResponse.json({ code: 'QR_NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
