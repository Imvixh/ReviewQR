import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const FILE_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
} as const;

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { code: 'SUPABASE_NOT_CONFIGURED', message: 'Cloud storage is not configured.' },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ code: 'INVALID_FORM_DATA', message: 'Invalid form submission.' }, { status: 400 });
  }

  const file = formData.get('file');
  const type = formData.get('type');

  if (!(file instanceof File)) {
    return NextResponse.json({ code: 'FILE_REQUIRED', message: 'No image file uploaded.' }, { status: 400 });
  }

  if (type !== 'logo' && type !== 'thumbnail') {
    return NextResponse.json({ code: 'INVALID_TYPE', message: 'Asset type must be logo or thumbnail.' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ code: 'FILE_TOO_LARGE', message: 'File size exceeds 5 MB limit.' }, { status: 400 });
  }

  const extension = FILE_TYPES[file.type as keyof typeof FILE_TYPES];
  if (!extension) {
    return NextResponse.json(
      { code: 'UNSUPPORTED_FILE_TYPE', message: 'Only PNG, JPEG, WebP, and SVG images are supported.' },
      { status: 400 }
    );
  }

  try {
    const adminClient = createAdminClient();
    const uniqueId = crypto.randomUUID();
    const filePath = `guest-uploads/${type}-${Date.now()}-${uniqueId}.${extension}`;

    const { error: uploadError } = await adminClient.storage
      .from('business-assets')
      .upload(filePath, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Failed to upload public asset to storage:', uploadError);
      return NextResponse.json(
        { code: 'STORAGE_UPLOAD_FAILED', message: uploadError.message || 'Storage upload failed.' },
        { status: 502 }
      );
    }

    const { data: publicAsset } = adminClient.storage
      .from('business-assets')
      .getPublicUrl(filePath);

    if (!publicAsset?.publicUrl) {
      return NextResponse.json(
        { code: 'URL_GENERATION_FAILED', message: 'Failed to generate public URL for asset.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      url: publicAsset.publicUrl,
      path: filePath,
      type,
    });
  } catch (error) {
    console.error('Unexpected error in public upload:', error);
    return NextResponse.json(
      { code: 'UPLOAD_FAILED', message: error instanceof Error ? error.message : 'Upload failed.' },
      { status: 500 }
    );
  }
}

