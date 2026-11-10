import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { publicQrTokenSchema, safeHttpsUrlSchema } from '@/lib/validation';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  const { token } = await params;
  const parsedToken = publicQrTokenSchema.safeParse({ token });
  if (!parsedToken.success) {
    return NextResponse.json({ code: 'QR_NOT_FOUND' }, { status: 404 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_public_qr_by_token', {
    p_token: parsedToken.data.token,
  });

  if (error) {
    console.error('Failed to resolve a public QR token:', error);
    return NextResponse.json({ code: 'PUBLIC_QR_LOOKUP_FAILED' }, { status: 503 });
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return NextResponse.json({ code: 'QR_NOT_FOUND' }, { status: 404 });
  if (!safeHttpsUrlSchema.safeParse(row.google_review_url).success) {
    console.error('A public QR token resolves to an unsafe stored destination.');
    return NextResponse.json({ code: 'PUBLIC_DESTINATION_INVALID' }, { status: 503 });
  }

  let logoUrl: string | undefined;
  let thumbnailUrl: string | undefined;

  try {
    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch {
      adminClient = null;
    }
    const queryClient = adminClient || supabase;
    const { data: businessData } = await queryClient
      .from('qr_codes')
      .select('businesses!qr_codes_business_id_fkey(logo_path, thumbnail_path, logo_url, thumbnail_url)')
      .eq('token', parsedToken.data.token)
      .maybeSingle();

    const business = businessData?.businesses as {
      logo_path?: string | null;
      thumbnail_path?: string | null;
      logo_url?: string | null;
      thumbnail_url?: string | null;
    } | null;

    if (business) {
      const storage = queryClient.storage.from('business-assets');
      if (business.logo_path) {
        const { data: signed } = await storage
          .createSignedUrl(business.logo_path, 60 * 60 * 24 * 365)
          .catch(() => ({ data: null }));
        logoUrl = signed?.signedUrl || storage.getPublicUrl(business.logo_path).data?.publicUrl;
      } else if (business.logo_url) {
        logoUrl = business.logo_url;
      }

      if (business.thumbnail_path) {
        const { data: signed } = await storage
          .createSignedUrl(business.thumbnail_path, 60 * 60 * 24 * 365)
          .catch(() => ({ data: null }));
        thumbnailUrl = signed?.signedUrl || storage.getPublicUrl(business.thumbnail_path).data?.publicUrl;
      } else if (business.thumbnail_url) {
        thumbnailUrl = business.thumbnail_url;
      }
    }
  } catch (assetErr) {
    console.warn('Failed to resolve business asset URLs for public QR:', assetErr);
  }

  return NextResponse.json({
    qr: {
      businessName: row.business_name,
      city: row.business_city,
      googleReviewUrl: row.google_review_url,
      headline: row.headline,
      tagline: row.tagline,
      supportingText: row.supporting_text,
      accentColor: row.accent_color,
      businessCategory:
        typeof row.business_category === 'string' ? row.business_category : '',
      businessSubcategory:
        typeof row.business_subcategory === 'string' ? row.business_subcategory : '',
      logoUrl,
      thumbnailUrl,
    },
  });
}

