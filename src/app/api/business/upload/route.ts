import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const FILE_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
} as const;
const BUSINESS_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ code: 'UNAUTHENTICATED' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ code: 'INVALID_FORM_DATA' }, { status: 400 });
  }

  const file = formData.get('file');
  const businessId = formData.get('orgId');
  const type = formData.get('type');
  if (!(file instanceof File) || typeof businessId !== 'string') {
    return NextResponse.json({ code: 'UPLOAD_FIELDS_REQUIRED' }, { status: 400 });
  }
  if (type !== 'logo' && type !== 'thumbnail') {
    return NextResponse.json({ code: 'INVALID_ASSET_TYPE' }, { status: 400 });
  }
  if (!BUSINESS_ID_PATTERN.test(businessId)) {
    return NextResponse.json({ code: 'INVALID_BUSINESS_ID' }, { status: 400 });
  }

  const extension = FILE_TYPES[file.type as keyof typeof FILE_TYPES];
  if (!extension) {
    return NextResponse.json({ code: 'UNSUPPORTED_IMAGE_TYPE' }, { status: 415 });
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ code: 'INVALID_FILE_SIZE' }, { status: 400 });
  }

  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (businessError) {
    console.error('Failed to authorize business branding upload:', businessError);
    return NextResponse.json({ code: 'BUSINESS_LOOKUP_FAILED' }, { status: 500 });
  }
  if (!business) {
    return NextResponse.json({ code: 'BUSINESS_NOT_FOUND' }, { status: 404 });
  }

  const path = `${user.id}/${business.id}/${type}-${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from('business-assets')
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Failed to upload business branding asset:', uploadError);
    return NextResponse.json({ code: 'ASSET_UPLOAD_FAILED' }, { status: 502 });
  }

  const { data: signedAsset, error: signedAssetError } = await supabase.storage
    .from('business-assets')
    .createSignedUrl(path, 60 * 60);
  if (signedAssetError || !signedAsset) {
    console.error('Failed to create a private business asset URL:', signedAssetError);
    const { error: cleanupError } = await supabase.storage.from('business-assets').remove([path]);
    if (cleanupError) {
      console.error('Failed to clean up branding asset after URL signing failed:', cleanupError);
    }
    return NextResponse.json({ code: 'ASSET_URL_CREATION_FAILED' }, { status: 502 });
  }

  const update = type === 'logo'
    ? { logo_url: null, logo_path: path }
    : { thumbnail_url: null, thumbnail_path: path };
  const { error: saveError } = await supabase
    .from('businesses')
    .update(update)
    .eq('id', business.id)
    .eq('owner_id', user.id);

  if (saveError) {
    console.error('Failed to save business branding asset metadata:', saveError);
    const { error: cleanupError } = await supabase.storage.from('business-assets').remove([path]);
    if (cleanupError) {
      console.error('Failed to clean up branding asset after metadata persistence failed:', cleanupError);
    }
    return NextResponse.json({ code: 'ASSET_METADATA_SAVE_FAILED' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    url: signedAsset.signedUrl,
    path,
    type,
    storage: 'supabase',
  });
}
