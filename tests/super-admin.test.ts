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
import { GET as getSuperAdminOverview } from '../src/app/api/super-admin/overview/route';
import { GET as getSuperAdminAuthStatus } from '../src/app/api/super-admin/auth/status/route';

describe('Revvly Branding & Public Authentication Cleanup', () => {
  it('confirms the landing page has no login or signup links and uses Revvly brand', () => {
    const landingHtml = fs.readFileSync(
      path.resolve(__dirname, '../src/app/page.tsx'),
      'utf-8'
    );

    // Verify brand is Revvly
    expect(landingHtml).toContain('Revvly');

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

  it('confirms public creator uses Revvly and has no login or signup links', () => {
    const creatorHtml = fs.readFileSync(
      path.resolve(__dirname, '../src/app/create-qr/page.tsx'),
      'utf-8'
    );

    expect(creatorHtml).toContain('Revvly');
    expect(creatorHtml).not.toContain('href="/login"');
    expect(creatorHtml).not.toContain('href="/signup"');
  });

  it('confirms public login and signup routes have been permanently removed', () => {
    const loginExists = fs.existsSync(path.resolve(__dirname, '../src/app/login'));
    const signupExists = fs.existsSync(path.resolve(__dirname, '../src/app/signup'));
    expect(loginExists).toBe(false);
    expect(signupExists).toBe(false);
  });

  it('confirms new /super-admin portal files exist', () => {
    const superAdminPage = fs.existsSync(path.resolve(__dirname, '../src/app/super-admin/page.tsx'));
    const superAdminLogin = fs.existsSync(path.resolve(__dirname, '../src/app/super-admin/super-admin-login.tsx'));
    const superAdminDashboard = fs.existsSync(path.resolve(__dirname, '../src/app/super-admin/super-admin-dashboard.tsx'));
    expect(superAdminPage).toBe(true);
    expect(superAdminLogin).toBe(true);
    expect(superAdminDashboard).toBe(true);
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

  it('returns UNAUTHENTICATED when user is not signed in', async () => {
    mockUserAuth.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const res = await getSuperAdminAuthContext();
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe('UNAUTHENTICATED');
    }
  });

  it('returns FORBIDDEN when signed in user is not in public.platform_super_admins', async () => {
    mockUserAuth.mockResolvedValue({
      data: {
        user: { id: 'regular-user-1', email: 'owner@biz.com' },
      },
      error: null,
    });
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

    const res = await getSuperAdminAuthContext();
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe('FORBIDDEN');
    }
  });

  it('authorizes super admin at aal1 when no verified TOTP factor is enrolled yet', async () => {
    mockUserAuth.mockResolvedValue({
      data: {
        user: { id: 'super-admin-1', email: 'admin@revvly.app' },
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
    mockMfaFactors.mockResolvedValue({
      data: { all: [], totp: [] },
      error: null,
    });

    const res = await getSuperAdminAuthContext();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.aal).toBe('aal1');
    }
  });

  it('returns MFA_CHALLENGE_REQUIRED when TOTP factor exists but session is only aal1', async () => {
    mockUserAuth.mockResolvedValue({
      data: {
        user: { id: 'super-admin-1', email: 'admin@revvly.app' },
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
      data: { currentLevel: 'aal1', nextLevel: 'aal2' },
      error: null,
    });
    mockMfaFactors.mockResolvedValue({
      data: {
        all: [{ id: 'factor-1', status: 'verified', factor_type: 'totp' }],
        totp: [{ id: 'factor-1', status: 'verified', factor_type: 'totp' }],
      },
      error: null,
    });

    const res = await getSuperAdminAuthContext();
    expect(res.ok).toBe(false);
    if (!res.ok && res.reason === 'MFA_CHALLENGE_REQUIRED') {
      expect(res.factorId).toBe('factor-1');
    }
  });

  it('authorizes Super Admin at aal2 and returns truthful platform overview metrics', async () => {
    mockUserAuth.mockResolvedValue({
      data: {
        user: { id: 'super-admin-1', email: 'admin@revvly.app' },
      },
      error: null,
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

      return {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const res = await getSuperAdminOverview();
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.ok).toBe(true);
    expect(body.admin.email).toBe('admin@revvly.app');
    expect(body.admin.aal).toBe('aal2');
    expect(body.metrics.totalBusinesses).toBe(8);
    expect(body.metrics.totalUsers).toBe(12);
    expect(body.metrics.totalQrCodes).toBe(15);
    expect(body.metrics.totalScans).toBe(100);
    expect(body.metrics.totalDestinationClicks).toBe(42);
    expect(body.metrics.conversionRate).toBe(42);
  });

  it('super admin auth status route reflects exact session status', async () => {
    mockUserAuth.mockResolvedValue({
      data: {
        user: { id: 'super-admin-1', email: 'admin@revvly.app' },
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

    const res = await getSuperAdminAuthStatus();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.reason).toBe('AUTHORIZED');
    expect(body.aal).toBe('aal2');
  });
});
