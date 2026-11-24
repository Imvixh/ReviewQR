import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export const runtime = 'nodejs';
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext): Promise<Response> {
  if (!isSupabaseConfigured) return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  const { id } = await params;
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!/^[0-9a-f-]{36}$/i.test(id) || !token || token.length > 100) {
    return NextResponse.json({ code: 'DOWNLOAD_NOT_FOUND' }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: record, error } = await admin
    .from('qr_downloads')
    .select('storage_path, delivery_token_hash, file_served_at')
    .eq('id', id)
    .is('downloaded_at', null)
    .is('file_served_at', null)
    .maybeSingle();
  const candidate = createHash('sha256').update(token).digest();
  const expected = record?.delivery_token_hash ? Buffer.from(record.delivery_token_hash, 'hex') : Buffer.alloc(candidate.length);
  if (error || !record || expected.length !== candidate.length || !timingSafeEqual(candidate, expected)) {
    return NextResponse.json({ code: 'DOWNLOAD_NOT_FOUND' }, { status: 404 });
  }

  const { data: claimed, error: claimError } = await admin
    .from('qr_downloads')
    .update({ file_served_at: new Date().toISOString() })
    .eq('id', id)
    .is('downloaded_at', null)
    .is('file_served_at', null)
    .select('id')
    .maybeSingle();
  if (claimError || !claimed) return NextResponse.json({ code: 'DOWNLOAD_ALREADY_SERVED' }, { status: 409 });

  const { data: file, error: fileError } = await admin.storage.from('qr-downloads').download(record.storage_path);
  if (fileError || !file) {
    await admin.from('qr_downloads').update({ file_served_at: null }).eq('id', id).is('downloaded_at', null);
    return NextResponse.json({ code: 'DOWNLOAD_FILE_UNAVAILABLE' }, { status: 404 });
  }

  return new Response(file, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${id}.png"`,
      'Cache-Control': 'no-store, private',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
