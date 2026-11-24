import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/auth/super-admin', () => ({
  getSuperAdminAuthContext: vi.fn(),
}));
vi.mock('../src/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));
vi.mock('../src/lib/supabase/env', () => ({
  isSupabaseConfigured: true,
}));

import { getSuperAdminAuthContext } from '../src/lib/auth/super-admin';
import { createAdminClient } from '../src/lib/supabase/admin';
import { GET as getDownloads } from '../src/app/api/super-admin/downloads/route';
import { GET as getPreview } from '../src/app/api/super-admin/downloads/[id]/preview/route';
import { PATCH as patchDownload } from '../src/app/api/super-admin/downloads/[id]/route';

describe('QR download admin routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSuperAdminAuthContext).mockResolvedValue({
      ok: false,
      response: new Response(null, { status: 403 }),
    } as never);
  });

  it('denies download history to non-admin users before database access', async () => {
    const response = await getDownloads();
    expect(response.status).toBe(403);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it('denies private poster previews to non-admin users', async () => {
    const response = await getPreview(new Request('https://example.test'), {
      params: Promise.resolve({ id: '2e1d7f8b-f2e2-45d9-bae1-3ac8db9d7560' }),
    });
    expect(response.status).toBe(403);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it('denies metadata edits to non-admin users', async () => {
    const request = new Request('https://example.test', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName: 'Changed name' }),
    });
    const response = await patchDownload(request as never, {
      params: Promise.resolve({ id: '2e1d7f8b-f2e2-45d9-bae1-3ac8db9d7560' }),
    });
    expect(response.status).toBe(403);
    expect(createAdminClient).not.toHaveBeenCalled();
  });
});
