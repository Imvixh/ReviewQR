import { NextResponse } from 'next/server';
import { getSuperAdminAuthContext } from '@/lib/auth/super-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export async function GET(): Promise<NextResponse> {
  const auth = await getSuperAdminAuthContext();
  if (!auth.ok) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 403 });
  if (!isSupabaseConfigured) return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });

  try {
    const admin = createAdminClient();
    const downloads = [];
    for (let offset = 0; ; offset += 1000) {
      const { data: page, error } = await admin
        .from('qr_downloads')
        .select('id, qr_code_id, qr_name, business_name, business_city, qr_type, template, destination_url, prepared_at, downloaded_at')
        .not('downloaded_at', 'is', null)
        .order('downloaded_at', { ascending: false })
        .range(offset, offset + 999);
      if (error) {
        console.error('Failed to load QR download history:', error);
        return NextResponse.json({ code: 'DB_ERROR' }, { status: 500 });
      }
      downloads.push(...(page || []));
      if (!page || page.length < 1000) break;
    }

    const linkedIds = [...new Set((downloads || [])
      .filter((item) => item.qr_code_id)
      .map((item) => item.qr_code_id as string))];
    const engagementCounts = new Map<string, { scans: number; handoffs: number }>();
    const qrStatuses = new Map<string, string>();
    if (linkedIds.length) {
      const { data: qrRows, error: qrError } = await admin
        .from('qr_codes')
        .select('id, status')
        .in('id', linkedIds);
      if (qrError) {
        console.error('Failed to load saved QR status values:', qrError);
        return NextResponse.json({ code: 'QR_STATUS_UNAVAILABLE' }, { status: 503 });
      }
      for (const row of qrRows || []) qrStatuses.set(row.id, row.status);

      const guidedIds = [...new Set((downloads || [])
        .filter((item) => item.qr_code_id && item.qr_type === 'guided')
        .map((item) => item.qr_code_id as string))];
      if (guidedIds.length) {
        const { data: counts, error: countsError } = await admin.rpc('get_admin_qr_engagement_counts', {
          p_qr_ids: guidedIds,
        });
        if (countsError) {
          console.error('Failed to load recorded QR scan and handoff totals:', countsError);
          return NextResponse.json({ code: 'ANALYTICS_UNAVAILABLE' }, { status: 503 });
        }
        for (const row of counts || []) {
          engagementCounts.set(row.qr_code_id, {
            scans: Number(row.scan_count),
            handoffs: Number(row.handoff_count),
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      downloads: (downloads || []).map((item) => {
        const analyticsAvailable = item.qr_type === 'guided' && Boolean(item.qr_code_id);
        return {
          id: item.id,
          qrCodeId: item.qr_code_id,
          qrStatus: item.qr_code_id ? qrStatuses.get(item.qr_code_id) || null : null,
          qrName: item.qr_name,
          businessName: item.business_name,
          businessCity: item.business_city,
          qrType: item.qr_type,
          template: item.template,
          destinationUrl: item.destination_url,
          preparedAt: item.prepared_at,
          downloadedAt: item.downloaded_at,
          scanCount: analyticsAvailable ? engagementCounts.get(item.qr_code_id as string)?.scans || 0 : null,
          handoffCount: analyticsAvailable ? engagementCounts.get(item.qr_code_id as string)?.handoffs || 0 : null,
          analyticsNote: analyticsAvailable
            ? null
            : item.qr_type === 'direct'
              ? 'Direct-to-Google scans and handoffs are not observable by Revvly.'
              : 'This guest QR is self-contained, so scan and handoff events are not recorded.',
        };
      }),
    });
  } catch (error) {
    console.error('Unexpected error loading QR downloads:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
