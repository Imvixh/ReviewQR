import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/supabase/authenticated-client', () => ({
  getAuthenticatedClient: vi.fn(),
}));

import { GET } from '../src/app/api/analytics/route';
import { getAuthenticatedClient } from '../src/lib/supabase/authenticated-client';

describe('Owner-scoped QR analytics API', () => {
  const rpc = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthenticatedClient).mockResolvedValue({
      ok: true,
      supabase: { rpc } as never,
      user: { id: 'owner-1' } as never,
    });
  });

  it('returns only the authenticated analytics RPC data and calculates the click rate', async () => {
    rpc.mockResolvedValue({
      data: [
        {
          qr_code_id: 'qr-1',
          placement_name: 'Front desk',
          scan_count: '20',
          destination_click_count: '8',
        },
        {
          qr_code_id: 'qr-2',
          placement_name: 'Counter',
          scan_count: 0,
          destination_click_count: 0,
        },
      ],
      error: null,
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith('get_owner_qr_analytics');
    expect(body).toMatchObject({
      scans: 20,
      uniqueVisitors: null,
      destinationClicks: 8,
      clickThroughRate: 40,
      byQr: [
        {
          qrCodeId: 'qr-1',
          placementName: 'Front desk',
          scans: 20,
          destinationClicks: 8,
          clickThroughRate: 40,
        },
        {
          qrCodeId: 'qr-2',
          placementName: 'Counter',
          scans: 0,
          destinationClicks: 0,
          clickThroughRate: 0,
        },
      ],
    });
  });

  it('does not expose analytics when authentication is unavailable', async () => {
    vi.mocked(getAuthenticatedClient).mockResolvedValue({
      ok: false,
      response: Response.json({ code: 'UNAUTHENTICATED' }, { status: 401 }) as never,
    });

    const response = await GET();

    expect(response.status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('surfaces database aggregation failures without success-shaped data', async () => {
    rpc.mockResolvedValue({ data: null, error: new Error('RPC failed') });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({ code: 'ANALYTICS_LOAD_FAILED' });
  });
});
