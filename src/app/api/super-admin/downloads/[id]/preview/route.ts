import { NextResponse } from 'next/server';
import { getSuperAdminAuthContext } from '@/lib/auth/super-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext): Promise<Response> {
  const auth = await getSuperAdminAuthContext();
  if (!auth.ok) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 403 });
  if (!isSupabaseConfigured) return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ code: 'DOWNLOAD_NOT_FOUND' }, { status: 404 });

  const admin = createAdminClient();
  const { data: record, error } = await admin
    .from('qr_downloads')
    .select('storage_path')
    .eq('id', id)
    .not('downloaded_at', 'is', null)
    .maybeSingle();
  if (error || !record) return NextResponse.json({ code: 'DOWNLOAD_NOT_FOUND' }, { status: 404 });
  const { data: image, error: imageError } = await admin.storage.from('qr-downloads').download(record.storage_path);
  if (imageError || !image) return NextResponse.json({ code: 'PREVIEW_UNAVAILABLE' }, { status: 404 });

  return new Response(image, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
