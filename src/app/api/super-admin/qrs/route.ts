import { NextResponse } from 'next/server';
import { getSuperAdminAuthContext } from '@/lib/auth/super-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export async function GET(): Promise<NextResponse> {
  const auth = await getSuperAdminAuthContext();
  if (!auth.ok) {
    return NextResponse.json({ code: 'UNAUTHORIZED', error: 'Super Admin access required.' }, { status: 403 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  try {
    const admin = createAdminClient();

    // Query QR codes with business details
    const { data: qrs, error: qrError } = await admin
      .from('qr_codes')
      .select(`
        id,
        token,
        placement_name,
        headline,
        tagline,
        status,
        created_at,
        updated_at,
        destination_mode,
        business:businesses!qr_codes_business_id_fkey(
          id,
          name,
          city,
          category,
          google_review_url,
          logo_url,
          thumbnail_url
        )
      `)
      .order('created_at', { ascending: false });

    if (qrError) {
      console.error('Failed to load super admin QRs:', qrError);
      return NextResponse.json({ code: 'DB_ERROR', error: qrError.message }, { status: 500 });
    }

    // Get scan counts per QR
    const { data: scanEvents } = await admin
      .from('qr_scan_events')
      .select('qr_code_id');

    const scanCountMap = new Map<string, number>();
    if (scanEvents) {
      for (const ev of scanEvents) {
        if (ev.qr_code_id) {
          scanCountMap.set(ev.qr_code_id, (scanCountMap.get(ev.qr_code_id) || 0) + 1);
        }
      }
    }

    const formattedQrs = (qrs || []).map((q) => {
      const biz = Array.isArray(q.business) ? q.business[0] : q.business;
      return {
        id: q.id,
        token: q.token,
        placementName: q.placement_name,
        headline: q.headline,
        tagline: q.tagline,
        status: q.status || 'active',
        subscriptionStatus: q.status === 'active' ? 'active' : 'expired',
        createdAt: q.created_at,
        updatedAt: q.updated_at,
        destinationMode: q.destination_mode || 'guided',
        scanCount: scanCountMap.get(q.id) || 0,
        business: biz
          ? {
              id: biz.id,
              name: biz.name || 'Untitled Business',
              city: biz.city || '',
              category: biz.category || 'General',
              googleReviewUrl: biz.google_review_url || '',
              logoUrl: biz.logo_url || undefined,
              thumbnailUrl: biz.thumbnail_url || undefined,
            }
          : {
              id: '',
              name: q.placement_name || 'Business',
              city: '',
              category: 'General',
              googleReviewUrl: '',
            },
      };
    });

    return NextResponse.json({ ok: true, qrs: formattedQrs });
  } catch (error) {
    console.error('Unexpected error in super admin QRs GET:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
