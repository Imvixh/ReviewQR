import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/authenticated-client';

interface AnalyticsRow {
  qr_code_id: string;
  placement_name: string;
  scan_count: number | string;
  destination_click_count: number | string;
}

export async function GET(): Promise<NextResponse> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase.rpc('get_owner_qr_analytics');
  if (error) {
    console.error('Failed to load owner-scoped QR analytics:', error);
    return NextResponse.json({ code: 'ANALYTICS_LOAD_FAILED' }, { status: 503 });
  }

  const byQr = ((data || []) as AnalyticsRow[]).map((row) => {
    const scans = Number(row.scan_count);
    const destinationClicks = Number(row.destination_click_count);
    return {
      qrCodeId: row.qr_code_id,
      placementName: row.placement_name,
      scans,
      destinationClicks,
      clickThroughRate: scans > 0 ? (destinationClicks / scans) * 100 : 0,
    };
  });
  const scans = byQr.reduce((total, row) => total + row.scans, 0);
  const destinationClicks = byQr.reduce((total, row) => total + row.destinationClicks, 0);

  return NextResponse.json({
    scans,
    uniqueVisitors: null,
    destinationClicks,
    clickThroughRate: scans > 0 ? (destinationClicks / scans) * 100 : 0,
    byQr,
  });
}
