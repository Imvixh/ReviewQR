import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  getSuperAdminBootstrapStatus,
  initializeBootstrapSuperAdmin,
} from '../src/lib/auth/super-admin';
import { POST as registerSuperAdmin } from '../src/app/api/super-admin/register/route';

describe('Super Admin One-Time Bootstrap Registration & Security', () => {
  const mockAdminFrom = vi.fn();
  const mockGetUserById = vi.fn();
  const mockServerSignUp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(createAdminClient).mockReturnValue({
      from: mockAdminFrom,
      auth: {
        admin: {
          getUserById: mockGetUserById,
        },
      },
    } as never);

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        signUp: mockServerSignUp,
      },
    } as never);
  });

  it('allows bootstrap registration when no records exist in platform_super_admins', async () => {
    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const status = await getSuperAdminBootstrapStatus();
    expect(status.registrationAllowed).toBe(true);
    expect(status.adminCount).toBe(0);
  });

  it('rejects bootstrap registration if active confirmed super admins already exist', async () => {
    const originalEnv = process.env.ALLOW_SUPER_ADMIN_BOOTSTRAP;
    delete process.env.ALLOW_SUPER_ADMIN_BOOTSTRAP;

    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ user_id: 'active-admin-1' }],
        error: null,
      }),
    });

    mockGetUserById.mockResolvedValue({
      data: {
        user: {
          id: 'active-admin-1',
          email: 'admin@revvly.app',
          email_confirmed_at: '2026-11-20T10:00:00Z',
        },
      },
      error: null,
    });

    const status = await getSuperAdminBootstrapStatus();
    expect(status.registrationAllowed).toBe(false);
    expect(status.reason).toBe('SUPER_ADMIN_INITIALIZED');

    process.env.ALLOW_SUPER_ADMIN_BOOTSTRAP = originalEnv;
  });

  it('rejects registration API permanently with 403 Forbidden', async () => {
    const res = await registerSuperAdmin();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('closed');
  });

  it('fails initialization if user email is not yet confirmed', async () => {
    mockGetUserById.mockResolvedValue({
      data: {
        user: {
          id: 'user-unconfirmed',
          email: 'unconfirmed@admin.com',
          email_confirmed_at: null,
        },
      },
      error: null,
    });

    const result = await initializeBootstrapSuperAdmin('user-unconfirmed');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Email verification required');
  });

  it('successfully initializes Super Admin when user email is confirmed', async () => {
    mockGetUserById.mockResolvedValue({
      data: {
        user: {
          id: 'user-confirmed',
          email: 'confirmed@admin.com',
          email_confirmed_at: '2026-11-21T12:00:00Z',
        },
      },
      error: null,
    });

    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      upsert: mockUpsert,
    });

    const result = await initializeBootstrapSuperAdmin('user-confirmed');
    expect(result.success).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-confirmed' }),
      expect.objectContaining({ onConflict: 'user_id' })
    );
  });
});
