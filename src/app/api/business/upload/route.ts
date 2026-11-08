import { NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'logo';
    const orgId = (formData.get('orgId') as string) || 'org_royal_palace';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided in form data' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file format: ${file.type}. Allowed formats are PNG, JPEG, WebP, and SVG.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 5 MB limit.`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop() || (type === 'logo' ? 'png' : 'jpg');
    const fileName = `${orgId}/${type}_${Date.now()}.${fileExt}`;

    // Check if Supabase storage is accessible
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error: uploadError } = await supabase.storage
          .from('business-assets')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('business-assets')
            .getPublicUrl(fileName);

          return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
            path: fileName,
            type,
            storage: 'supabase',
          });
        }
      } catch (storageErr) {
        console.warn('Supabase upload attempt failed, falling back to data URL:', storageErr);
      }
    }

    // Fallback: Return Base64 Data URL for immediate responsive preview and local storage
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      path: `local/${fileName}`,
      type,
      storage: 'local',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to process file upload' },
      { status: 500 }
    );
  }
}
