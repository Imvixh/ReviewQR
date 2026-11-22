import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.searchParams.get('path');
  if (!path || path.includes('..') || path.startsWith('/') || path.startsWith('\\')) {
    return new NextResponse('Invalid asset path', { status: 400 });
  }

  if (!isSupabaseConfigured) {
    return new NextResponse('Cloud storage is not configured', { status: 503 });
  }

  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.storage
      .from('business-assets')
      .download(path);

    if (error || !data) {
      return new NextResponse('Asset not found', { status: 404 });
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    const ext = path.split('.').pop()?.toLowerCase();
    const contentType =
      ext === 'png'
        ? 'image/png'
        : ext === 'jpg' || ext === 'jpeg'
        ? 'image/jpeg'
        : ext === 'webp'
        ? 'image/webp'
        : ext === 'svg'
        ? 'image/svg+xml'
        : 'application/octet-stream';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('Failed to stream public asset:', err);
    return new NextResponse('Failed to retrieve asset', { status: 500 });
  }
}
