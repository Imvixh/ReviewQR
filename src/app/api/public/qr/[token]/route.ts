import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
    },
  });
}
