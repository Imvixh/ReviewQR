import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  if (!isSupabaseConfigured) return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  const { id } = await params;
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!/^[0-9a-f-]{36}$/i.test(id) || !token || token.length > 100) {
    return NextResponse.json({ code: 'DOWNLOAD_NOT_FOUND' }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: record, error } = await admin
    .from('qr_downloads')
    .select('delivery_token_hash, downloaded_at, file_served_at')
    .eq('id', id)
    .maybeSingle();
  const candidate = createHash('sha256').update(token).digest();
  const expected = record?.delivery_token_hash ? Buffer.from(record.delivery_token_hash, 'hex') : Buffer.alloc(candidate.length);
  if (error || !record || expected.length !== candidate.length || !timingSafeEqual(candidate, expected)) {
    return NextResponse.json({ code: 'DOWNLOAD_NOT_FOUND' }, { status: 404 });
  }
  if (record.downloaded_at) return NextResponse.json({ ok: true, alreadyCompleted: true });
  if (!record.file_served_at) return NextResponse.json({ code: 'FILE_NOT_DELIVERED' }, { status: 409 });

  const { data: updated, error: updateError } = await admin
    .from('qr_downloads')
    .update({ downloaded_at: new Date().toISOString() })
    .eq('id', id)
    .is('downloaded_at', null)
    .select('id')
    .maybeSingle();
  if (updateError || !updated) {
    return NextResponse.json({ code: 'DOWNLOAD_COMPLETION_FAILED' }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
