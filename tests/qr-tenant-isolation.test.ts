import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('../src/lib/supabase/env', () => ({ isSupabaseConfigured: true }));

import { createClient } from '../src/lib/supabase/server';
import { GET as listQrs, POST as createQr } from '../src/app/api/qr/route';
import {
  DELETE as deleteQr,
  GET as getQr,
  PATCH as patchQr,
} from '../src/app/api/qr/[id]/route';
import { GET as getPublicQr } from '../src/app/api/public/qr/[token]/route';
import { POST as recordScan } from '../src/app/api/public/qr/[token]/scan/route';
import { POST as recordReviewClick } from '../src/app/api/public/review/route';

const ownerBusinessId = '11111111-1111-4111-8111-111111111111';
const otherBusinessId = '22222222-2222-4222-8222-222222222222';
const ownerQrId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const otherQrId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ownerToken = '33333333-3333-4333-8333-333333333333';
const otherToken = '44444444-4444-4444-8444-444444444444';

interface BusinessRow {
  id: string;
  owner_id: string;
  name: string;
  city: string;
  google_review_url: string;
}

interface QrRow {
  id: string;
  business_id: string;
  owner_id: string;
  token: string;
  placement_name: string;
  headline: string;
  tagline: string | null;
  supporting_text: string;
  accent_color: string;
  preset: string;
  geometry: 'classic' | 'rounded' | 'dots' | 'premium-eye';
  center_emblem: 'google-g' | 'business-logo';
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

function createSupabaseMock() {
  const businesses: BusinessRow[] = [
    {
      id: ownerBusinessId,
      owner_id: 'owner-1',
      name: 'Owner Cafe',
      city: 'Bettiah',
      google_review_url: 'https://g.page/owner/review',
    },
    {
      id: otherBusinessId,
      owner_id: 'owner-2',
      name: 'Other Cafe',
      city: 'Other City',
      google_review_url: 'https://g.page/other/review',
    },
  ];
  const qrRows: QrRow[] = [
    {
      id: ownerQrId,
      business_id: ownerBusinessId,
      owner_id: 'owner-1',
      token: ownerToken,
      placement_name: 'Front desk',
      headline: 'Review Owner Cafe',
      tagline: null,
      supporting_text: '',
      accent_color: '#1A73E8',
      preset: 'google-classic',
      geometry: 'rounded',
      center_emblem: 'google-g',
      status: 'active',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: otherQrId,
      business_id: otherBusinessId,
      owner_id: 'owner-2',
      token: otherToken,
      placement_name: 'Counter',
      headline: 'Review Other Cafe',
      tagline: null,
      supporting_text: '',
      accent_color: '#1A73E8',
      preset: 'google-classic',
      geometry: 'rounded',
      center_emblem: 'google-g',
      status: 'active',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
  ];
  const queryLog: Array<{ table: string; filters: Array<[string, string]>; action: string }> = [];
  const rpc = vi.fn(async (name: string, args: Record<string, string>) => {
    if (name === 'get_public_qr_by_token') {
      return {
        data: args.p_token === ownerToken
          ? [{
              business_name: 'Owner Cafe',
              business_city: 'Bettiah',
              google_review_url: 'https://g.page/owner/review',
              business_category: 'Cafe',
              business_subcategory: null,
              headline: 'Review Owner Cafe',
              tagline: null,
              supporting_text: '',
              accent_color: '#1A73E8',
              id: ownerQrId,
              owner_id: 'owner-1',
            }]
          : [],
        error: null,
      };
    }
    if (name === 'record_public_qr_scan' || name === 'record_public_destination_click') {
      return { data: args.p_token === ownerToken, error: null };
    }
    return { data: null, error: new Error('Unexpected RPC') };
  });

  const client = {
    auth: {
      getUser: vi.fn(async () => ({ data: { user: { id: 'owner-1' } }, error: null })),
    },
    rpc,
    from: vi.fn((table: string) => {
      const filters: Array<[string, string]> = [];
      let action = 'select';
      let values: Record<string, unknown> = {};
      let selected = false;
      let expectsSingleResult = false;
      const getRows = () => (table === 'businesses' ? businesses : qrRows) as Array<
        BusinessRow | QrRow
      >;
      const findRow = () =>
        getRows().find((row) =>
          filters.every(([column, value]) => row[column as keyof typeof row] === value)
        ) || null;
      const execute = async () => {
        queryLog.push({ table, filters: [...filters], action });
        if (action === 'delete') {
          const row = findRow();
          if (!row) return { data: null, error: null };
          const rows = getRows();
          rows.splice(rows.indexOf(row), 1);
          return { data: selected ? { id: row.id } : null, error: null };
        }
        if (action === 'update') {
          const row = findRow();
          if (!row) return { data: null, error: null };
          Object.assign(row, values);
          return { data: row, error: null };
        }
        if (action === 'insert') {
          const row = {
            id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
            created_at: '2026-01-02T00:00:00.000Z',
            updated_at: '2026-01-02T00:00:00.000Z',
            ...values,
          } as unknown as QrRow;
          qrRows.push(row);
          return { data: row, error: null };
        }
        if (expectsSingleResult) {
          const row = findRow();
          return { data: row, error: null };
        }
        return {
          data: getRows().filter((row) =>
            filters.every(([column, value]) => row[column as keyof typeof row] === value)
          ),
          error: null,
        };
      };
      const query = {
        select: vi.fn(() => {
          selected = true;
          return query;
        }),
        eq: vi.fn((column: string, value: string) => {
          filters.push([column, value]);
          return query;
        }),
        order: vi.fn(() => query),
        limit: vi.fn(() => query),
        maybeSingle: vi.fn(() => {
          expectsSingleResult = true;
          return execute();
        }),
        single: vi.fn(() => {
          expectsSingleResult = true;
          return execute();
        }),
        insert: vi.fn((input: Record<string, unknown>) => {
          action = 'insert';
          values = input;
          return query;
        }),
        update: vi.fn((input: Record<string, unknown>) => {
          action = 'update';
          values = input;
          return query;
        }),
        delete: vi.fn(() => {
          action = 'delete';
          return query;
        }),
        then: (resolve: (value: Awaited<ReturnType<typeof execute>>) => unknown) =>
          Promise.resolve(execute()).then(resolve),
      };
      return query;
    }),
  };

  return { client, businesses, qrRows, queryLog, rpc };
}

const routeContext = (id: string) => ({ params: Promise.resolve({ id }) });
const tokenContext = (token: string) => ({ params: Promise.resolve({ token }) });
const qrRequest = (body: unknown, method = 'POST') =>
  new Request('http://localhost/api/qr', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
const eventRequest = (body: unknown) =>
  new Request('http://localhost/api/public/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('QR tenant isolation and public token flow', () => {
  let mock: ReturnType<typeof createSupabaseMock>;

  beforeEach(() => {
    mock = createSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(mock.client as never);
  });

  it('lists only the authenticated owner QR records', async () => {
    const response = await listQrs();
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.qrs).toHaveLength(1);
    expect(result.qrs[0].id).toBe(ownerQrId);
    expect(mock.queryLog.some((query) =>
      query.table === 'qr_codes' &&
      query.filters.some(([column, value]) => column === 'owner_id' && value === 'owner-1')
    )).toBe(true);
  });

  it('requires authentication before querying QR records', async () => {
    mock.client.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as never);

    const response = await listQrs();

    expect(response.status).toBe(401);
    expect(mock.client.from).not.toHaveBeenCalled();
  });

  it('creates a QR under the authenticated owner business, not client-supplied identity', async () => {
    const response = await createQr(qrRequest({
      placementName: 'Lobby',
      headline: 'Share your experience',
      tagline: 'Tell us how we did',
      supportingText: '',
      accentColor: '#1A73E8',
      preset: 'google-classic',
      geometry: 'rounded',
      centerEmblem: 'google-g',
      businessId: otherBusinessId,
      ownerId: 'owner-2',
    }));
    const result = await response.json();
    const inserted = mock.qrRows[mock.qrRows.length - 1];

    expect(response.status).toBe(201);
    expect(inserted?.owner_id).toBe('owner-1');
    expect(inserted?.business_id).toBe(ownerBusinessId);
    expect(result.qr.publicToken).toBeTruthy();
  });

  it('returns not found and leaves another owner QR unchanged on read, update, and delete', async () => {
    const getResponse = await getQr(new Request('http://localhost'), routeContext(otherQrId));
    const patchResponse = await patchQr(
      qrRequest({ headline: 'Changed by foreign owner' }, 'PATCH'),
      routeContext(otherQrId)
    );
    const deleteResponse = await deleteQr(new Request('http://localhost'), routeContext(otherQrId));

    expect([getResponse.status, patchResponse.status, deleteResponse.status]).toEqual([404, 404, 404]);
    expect(mock.qrRows.find((row) => row.id === otherQrId)?.headline).toBe('Review Other Cafe');
    expect(mock.qrRows.some((row) => row.id === otherQrId)).toBe(true);
  });

  it('allows the owner to read, update, and delete their own QR design', async () => {
    const getResponse = await getQr(new Request('http://localhost'), routeContext(ownerQrId));
    const patchResponse = await patchQr(
      qrRequest({ headline: 'Updated by owner' }, 'PATCH'),
      routeContext(ownerQrId)
    );

    expect(getResponse.status).toBe(200);
    expect(patchResponse.status).toBe(200);
    expect(mock.qrRows.find((row) => row.id === ownerQrId)?.headline).toBe('Updated by owner');

    const deleteResponse = await deleteQr(new Request('http://localhost'), routeContext(ownerQrId));

    expect(deleteResponse.status).toBe(200);
    expect(mock.qrRows.some((row) => row.id === ownerQrId)).toBe(false);
  });

  it('returns only public customer fields for a valid QR token', async () => {
    const response = await getPublicQr(
      new Request(`http://localhost/qr/${ownerToken}`) as never,
      tokenContext(ownerToken)
    );
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.qr).toEqual({
      businessName: 'Owner Cafe',
      city: 'Bettiah',
      googleReviewUrl: 'https://g.page/owner/review',
      headline: 'Review Owner Cafe',
      tagline: null,
      supportingText: '',
      accentColor: '#1A73E8',
      businessCategory: 'Cafe',
      businessSubcategory: '',
    });
    expect(result.qr).not.toHaveProperty('id');
    expect(result.qr).not.toHaveProperty('owner_id');
  });

  it('rejects invalid public tokens without making a database request', async () => {
    const response = await getPublicQr(
      new Request('http://localhost/qr/not-a-token') as never,
      tokenContext('not-a-token')
    );

    expect(response.status).toBe(404);
    expect(mock.rpc).not.toHaveBeenCalled();
  });

  it('derives scan and review-click attribution from the QR token, not request-supplied IDs', async () => {
    const scanResponse = await recordScan(
      eventRequest({ qrCodeId: otherQrId, businessId: otherBusinessId }) as never,
      tokenContext(ownerToken)
    );
    const clickResponse = await recordReviewClick(eventRequest({ token: ownerToken }));

    expect(scanResponse.status).toBe(201);
    expect(clickResponse.status).toBe(201);
    expect(mock.rpc).toHaveBeenCalledWith('record_public_qr_scan', { p_token: ownerToken });
    expect(mock.rpc).toHaveBeenCalledWith('record_public_destination_click', {
      p_token: ownerToken,
    });
  });
});
