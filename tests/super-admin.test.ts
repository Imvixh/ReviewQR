import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock dependencies for super-admin library and API
vi.mock('../src/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('../src/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

vi.mock('../src/lib/supabase/env', () => ({
  isSupabaseConfigured: true,
  supabaseUrl: 'https://test.supabase.co',
  supabasePublishableKey: 'test-key',
}));

import { createClient } from '../src/lib/supabase/server';
import { createAdminClient } from '../src/lib/supabase/admin';
import {
  checkIsSuperAdmin,
  getSuperAdminAuthContext,
  getPlatformOverviewMetrics,
} from '../src/lib/auth/super-admin';
import { GET as getAdminOverview } from '../src/app/api/admin/overview/route';
import { GET as getAdminAuthStatus } from '../src/app/api/admin/auth/status/route';

describe('Public Landing Page & Creator Rebranding & Cleanup', () => {
  it('confirms the landing page has no login or signup links and uses REVELY', () => {
    const landingHtml = fs.readFileSync(
      path.resolve(__dirname, '../src/app/page.tsx'),
      'utf-8'
    );

    // Verify brand is REVELY
    expect(landingHtml).toContain('REVELY');
    expect(landingHtml).not.toContain('Review<span className="text-primary-container">QR</span>');

    // Verify no login or signup URLs
    expect(landingHtml).not.toContain('href="/login"');
    expect(landingHtml).not.toContain('href="/signup"');
    expect(landingHtml).not.toContain('Log In');
    expect(landingHtml).not.toContain('Sign Up');
    expect(landingHtml).not.toContain('Get Started Free');

    // Verify primary creation action
    expect(landingHtml).toContain('Create Your QR');
    expect(landingHtml).toContain('href="/create-qr"');
  });

  it('confirms the public creator has no login or signup links', () => {
    const creatorHtml = fs.readFileSync(
      path.resolve(__dirname, '../src/app/create-qr/page.tsx'),
      'utf-8'
    );

    expect(creatorHtml).toContain('REVELY');
    expect(creatorHtml).not.toContain('href="/login"');
    expect(creatorHtml).not.toContain('href="/signup"');
  });
});

describe('Super Admin Server Authorization & MFA Enforcement', () => {
  const mockAdminFrom = vi.fn();
  const mockUserAuth = vi.fn();
  const mockMfaAal = vi.fn();
  const mockMfaFactors = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(createAdminClient).mockReturnValue({
      from: mockAdminFrom,
    } as never);

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: mockUserAuth,
        mfa: {
          getAuthenticatorAssuranceLevel: mockMfaAal,
          listFactors: mockMfaFactors,
        },
      },
    } as never);
  });

  it('checkIsSuperAdmin returns true only when UUID is in public.platform_super_admins', async () => {
    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { user_id: 'super-admin-uuid' },
            error: null,
          }),
        }),
      }),
    });

    const isSuper = await checkIsSuperAdmin('super-admin-uuid');
    expect(isSuper).toBe(true);
    expect(mockAdminFrom).toHaveBeenCalledWith('platform_super_admins');
  });

  it('checkIsSuperAdmin returns false when UUID is not in platform_super_admins', async () => {
    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    });

    const isSuper = await checkIsSuperAdmin('regular-user-uuid');
    expect(isSuper).toBe(false);
  });

  it('rejects unauthenticated requests to admin API with 401', async () => {
    mockUserAuth.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not logged in' },
    });

    const res = await getAdminOverview();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.code).toBe('UNAUTHENTICATED');
  });

  it('rejects authenticated non-super-admin users with 403 Forbidden even if profiles.role is admin', async () => {
    // Regular business owner has profiles.role = 'admin', but is NOT in platform_super_admins
    mockUserAuth.mockResolvedValue({
      data: {
        user: {
          id: 'business-owner-1',
          email: 'owner@example.com',
          role: 'admin', // Org role
        },
      },
      error: null,
    });

    // platform_super_admins lookup returns null
    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    const res = await getAdminOverview();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe('FORBIDDEN');
  });

  it('requires MFA enrollment if Super Admin has no verified TOTP factor', async () => {
    mockUserAuth.mockResolvedValue({
      data: {
        user: { id: 'super-admin-1', email: 'admin@revely.io' },
      },
      error: null,
    });

    // Found in platform_super_admins
    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { user_id: 'super-admin-1' },
            error: null,
          }),
        }),
      }),
    });

    // No factors
    mockMfaAal.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal1' },
      error: null,
    });
    mockMfaFactors.mockResolvedValue({
      data: { all: [], totp: [] },
      error: null,
    });

    const res = await getAdminOverview();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe('MFA_ENROLLMENT_REQUIRED');
  });

  it('requires MFA challenge when Super Admin has factor but session is at aal1', async () => {
    mockUserAuth.mockResolvedValue({
      data: {
        user: { id: 'super-admin-1', email: 'admin@revely.io' },
      },
      error: null,
    });

    // Found in platform_super_admins
    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { user_id: 'super-admin-1' },
            error: null,
          }),
        }),
      }),
    });

    // Enrolled factor exists, but session is aal1
    mockMfaAal.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal2' },
      error: null,
    });
    mockMfaFactors.mockResolvedValue({
      data: {
        all: [{ id: 'factor-totp-1', status: 'verified', factor_type: 'totp' }],
        totp: [{ id: 'factor-totp-1', status: 'verified', factor_type: 'totp' }],
      },
      error: null,
    });

    const res = await getAdminOverview();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe('MFA_CHALLENGE_REQUIRED');
    expect(body.factorId).toBe('factor-totp-1');
  });

  it('authorizes Super Admin at aal2 and returns truthful platform overview metrics', async () => {
    mockUserAuth.mockResolvedValue({
      data: {
        user: { id: 'super-admin-1', email: 'admin@revely.io' },
      },
      error: null,
    });

    // Found in platform_super_admins
    mockAdminFrom.mockImplementation((tableName: string) => {
      if (tableName === 'platform_super_admins') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { user_id: 'super-admin-1' },
                error: null,
              }),
            }),
          }),
        };
      }
      if (tableName === 'profiles') {
        return {
          select: vi.fn().mockImplementation((_cols, opts) => {
            if (opts?.count === 'exact') {
              return Promise.resolve({ count: 12, error: null });
            }
            return {
              in: vi.fn().mockResolvedValue({
                data: [{ id: 'biz-owner-1', email: 'owner@test.com' }],
                error: null,
              }),
            };
          }),
        };
      }
      if (tableName === 'businesses') {
        return {
          select: vi.fn().mockImplementation((_cols, opts) => {
            if (opts?.count === 'exact') {
              return Promise.resolve({ count: 8, error: null });
            }
            return {
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'biz-1',
                      name: 'Cafe Luna',
                      category: 'Coffee & Bakery',
                      city: 'Seattle',
                      google_review_url: 'https://g.page/r/test/review',
                      created_at: '2026-11-20T10:00:00Z',
                      owner_id: 'biz-owner-1',
                    },
                  ],
                  error: null,
                }),
              }),
            };
          }),
        };
      }
      if (tableName === 'qr_codes') {
        return {
          select: vi.fn().mockResolvedValue({ count: 15, error: null }),
        };
      }
      if (tableName === 'qr_scan_events') {
        return {
          select: vi.fn().mockImplementation((_cols, opts) => {
            if (opts?.count === 'exact') {
              return Promise.resolve({ count: 100, error: null });
            }
            return {
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: 1,
                      scanned_at: '2026-11-21T11:00:00Z',
                      qr_code_id: 'qr-1',
                      business_id: 'biz-1',
                    },
                  ],
                  error: null,
                }),
              }),
            };
          }),
        };
      }
      if (tableName === 'review_destination_clicks') {
        return {
          select: vi.fn().mockResolvedValue({ count: 42, error: null }),
        };
      }
      return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
    });

    // Session is fully verified at aal2
    mockMfaAal.mockResolvedValue({
      data: { currentLevel: 'aal2', nextLevel: 'aal2' },
      error: null,
    });
    mockMfaFactors.mockResolvedValue({
      data: {
        all: [{ id: 'factor-totp-1', status: 'verified', factor_type: 'totp' }],
        totp: [{ id: 'factor-totp-1', status: 'verified', factor_type: 'totp' }],
      },
      error: null,
    });

    const res = await getAdminOverview();
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.ok).toBe(true);
    expect(body.admin.email).toBe('admin@revely.io');
    expect(body.admin.aal).toBe('aal2');
    expect(body.metrics.totalBusinesses).toBe(8);
    expect(body.metrics.totalUsers).toBe(12);
    expect(body.metrics.totalQrCodes).toBe(15);
    expect(body.metrics.totalScans).toBe(100);
    expect(body.metrics.totalDestinationClicks).toBe(42);
    // 42 clicks / 100 scans = 42%
    expect(body.metrics.conversionRate).toBe(42);
    expect(body.metrics.recentBusinesses[0].name).toBe('Cafe Luna');
  });

  it('admin auth status route reflects exact session status', async () => {
    mockUserAuth.mockResolvedValue({
      data: {
        user: { id: 'super-admin-1', email: 'admin@revely.io' },
      },
      error: null,
    });
    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { user_id: 'super-admin-1' },
            error: null,
          }),
        }),
      }),
    });
    mockMfaAal.mockResolvedValue({
      data: { currentLevel: 'aal2', nextLevel: 'aal2' },
      error: null,
    });
    mockMfaFactors.mockResolvedValue({
      data: {
        all: [{ id: 'factor-1', status: 'verified', factor_type: 'totp' }],
        totp: [{ id: 'factor-1', status: 'verified', factor_type: 'totp' }],
      },
      error: null,
    });

    const res = await getAdminAuthStatus();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.reason).toBe('AUTHORIZED');
    expect(body.aal).toBe('aal2');
  });
});

