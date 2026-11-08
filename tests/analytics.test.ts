import { describe, it, expect } from 'vitest';
import { getAnalyticsStats } from '../src/lib/data-store';
import { GET } from '../src/app/api/analytics/route';

describe('Analytics Calculations', () => {
  it('does not fabricate analytics during server rendering', () => {
    const stats = getAnalyticsStats();
    expect(stats.totalScans).toBe(0);
    expect(stats.uniqueVisitors).toBeNull();
    expect(stats.googleClicks).toBe(0);
    expect(stats.ctr).toBeNull();
  });

  it('reports the analytics API as unavailable until events are persisted', async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      ok: false,
      code: 'ANALYTICS_UNAVAILABLE',
    });
  });
});
