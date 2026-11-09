import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('../src/lib/supabase/env', () => ({ isSupabaseConfigured: true }));

import { createClient } from '../src/lib/supabase/server';
import { GET, POST } from '../src/app/api/business/review-destination/route';

interface BusinessRow {
  id: string;
  owner_id: string;
  name: string;
  city: string;
  google_review_url: string;
  category?: string;
  subcategory?: string | null;
  slug?: string;
}

function createSupabaseMock(initialRows: BusinessRow[], initialUser: { id: string } | null) {
  const rows = [...initialRows];
  const queries: Array<{ table: string; filters: Array<[string, string]> }> = [];
  let user = initialUser;

  const client = {
    auth: {
      getUser: vi.fn(async () => ({ data: { user }, error: null })),
    },
    from: vi.fn((table: string) => {
      const filters: Array<[string, string]> = [];
      let action: 'select' | 'update' | 'insert' = 'select';
      let values: Partial<BusinessRow> = {};
      const query = {
        select: vi.fn(() => query),
        eq: vi.fn((column: string, value: string) => {
          filters.push([column, value]);
          return query;
        }),
        order: vi.fn(() => query),
        limit: vi.fn(() => query),
        maybeSingle: vi.fn(async () => {
          queries.push({ table, filters: [...filters] });
          const row = rows.find((item) =>
            filters.every(([column, value]) => item[column as keyof BusinessRow] === value)
          );
          return { data: row || null, error: null };
        }),
        update: vi.fn((update: Partial<BusinessRow>) => {
          action = 'update';
          values = update;
          return query;
        }),
        insert: vi.fn((insert: Partial<BusinessRow>) => {
          action = 'insert';
          values = insert;
          return query;
        }),
        single: vi.fn(async () => {
          queries.push({ table, filters: [...filters] });
          if (action === 'update') {
            const row = rows.find((item) =>
              filters.every(([column, value]) => item[column as keyof BusinessRow] === value)
            );
            if (!row) return { data: null, error: new Error('No owner-matching row') };
            Object.assign(row, values);
            return { data: row, error: null };
          }
          if (action === 'insert') {
            const row = {
              id: `business-${rows.length + 1}`,
              ...values,
            } as BusinessRow;
            rows.push(row);
            return { data: row, error: null };
          }
          return { data: null, error: null };
        }),
      };
      return query;
    }),
  };

  return {
    client,
    rows,
    queries,
    setUser: (nextUser: { id: string } | null) => {
      user = nextUser;
    },
  };
}

const requestFor = (body: unknown) =>
  new Request('http://localhost/api/business/review-destination', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('Business review destination API', () => {
  let mock: ReturnType<typeof createSupabaseMock>;

  beforeEach(() => {
    mock = createSupabaseMock(
      [
        {
          id: 'owned-business',
          owner_id: 'owner-1',
          name: 'Cafe',
          city: 'Bettiah',
          google_review_url: 'https://g.page/old/review',
          category: 'Cafe',
        },
      ],
      { id: 'owner-1' }
    );
    vi.mocked(createClient).mockResolvedValue(mock.client as never);
  });

  it('requires an authenticated Supabase user', async () => {
    mock.setUser(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mock.client.from).not.toHaveBeenCalled();
  });

  it('saves and reloads a confirmed destination through the owner-scoped business row', async () => {
    const saveResponse = await POST(
      requestFor({
        destinationUrl: 'https://www.google.com/maps/place/Cafe',
        confirmed: true,
        businessName: 'Cafe',
        city: 'Bettiah',
      })
    );
    const saved = await saveResponse.json();

    expect(saveResponse.status).toBe(200);
    expect(saved.business.googleReviewUrl).toBe('https://www.google.com/maps/place/Cafe');
    expect(mock.rows[0].owner_id).toBe('owner-1');
    expect(mock.queries.some((query) =>
      query.filters.some(([column, value]) => column === 'owner_id' && value === 'owner-1')
    )).toBe(true);

    const reloadResponse = await GET();
    const reloaded = await reloadResponse.json();

    expect(reloadResponse.status).toBe(200);
    expect(reloaded.business.googleReviewUrl).toBe(saved.business.googleReviewUrl);
  });

  it('persists and restores a custom business category and optional hotel subcategory', async () => {
    const response = await POST(
      requestFor({
        destinationUrl: 'https://g.page/example/review',
        confirmed: true,
        businessName: 'Example Hotel',
        city: 'Bettiah',
        category: 'Hotel',
        subcategory: 'Accommodation',
      })
    );
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(mock.rows[0].category).toBe('Hotel');
    expect(mock.rows[0].subcategory).toBe('Accommodation');
    expect(result.business.category).toBe('Hotel');
    expect(result.business.subcategory).toBe('Accommodation');

    const customResponse = await POST(
      requestFor({
        destinationUrl: 'https://g.page/example/review',
        confirmed: true,
        category: 'Boutique Stay',
        subcategory: '',
      })
    );
    expect(customResponse.status).toBe(200);
    expect(mock.rows[0].category).toBe('Boutique Stay');
    expect(mock.rows[0].subcategory).toBeNull();
  });

  it('rejects a subcategory that conflicts with the saved business category', async () => {
    const response = await POST(
      requestFor({
        destinationUrl: 'https://g.page/example/review',
        confirmed: true,
        subcategory: 'Dining',
      })
    );

    expect(response.status).toBe(400);
    expect(mock.rows[0].subcategory).toBeUndefined();
  });

  it('does not return an unsafe legacy destination from storage', async () => {
    mock.rows[0].google_review_url = 'javascript:alert(1)';

    const response = await GET();
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.code).toBe('DESTINATION_LOAD_FAILED');
  });

  it('does not update another owner business and creates an owner-scoped business instead', async () => {
    mock = createSupabaseMock(
      [
        {
          id: 'other-business',
          owner_id: 'owner-2',
          name: 'Other Cafe',
          city: 'Other City',
          google_review_url: 'https://g.page/other/review',
        },
      ],
      { id: 'owner-1' }
    );
    vi.mocked(createClient).mockResolvedValue(mock.client as never);

    const response = await POST(
      requestFor({
        destinationUrl: 'https://maps.app.goo.gl/example',
        confirmed: true,
        businessName: 'My Cafe',
        city: 'Bettiah',
      })
    );
    const result = await response.json();

    expect(response.status).toBe(201);
    expect(mock.rows[0].google_review_url).toBe('https://g.page/other/review');
    expect(mock.rows[1].owner_id).toBe('owner-1');
    expect(result.business.googleReviewUrl).toBe('https://maps.app.goo.gl/example');
  });

  it('rejects unconfirmed and unsafe destinations before persistence', async () => {
    const response = await POST(
      requestFor({
        destinationUrl: 'javascript:alert(1)',
        confirmed: false,
        businessName: 'Cafe',
        city: 'Bettiah',
      })
    );

    expect(response.status).toBe(400);
    expect(mock.client.from).not.toHaveBeenCalled();
  });

  it('requires business details when the authenticated user has no business yet', async () => {
    mock = createSupabaseMock([], { id: 'owner-1' });
    vi.mocked(createClient).mockResolvedValue(mock.client as never);

    const response = await POST(
      requestFor({
        destinationUrl: 'https://g.page/business/review',
        confirmed: true,
      })
    );
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.code).toBe('BUSINESS_DETAILS_REQUIRED');
  });
});
