import { NextResponse } from 'next/server';
import { getSuperAdminAuthContext } from '@/lib/auth/super-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export async function GET(): Promise<NextResponse> {
  const auth = await getSuperAdminAuthContext();
  if (!auth.ok) {
    return NextResponse.json({ code: 'UNAUTHORIZED', error: 'Super Admin access required.' }, { status: 403 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  try {
    const admin = createAdminClient();

    // Query profiles
    const { data: profiles, error: profileErr } = await admin
      .from('profiles')
      .select('id, full_name, email, role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (profileErr) {
      console.error('Failed to load users/profiles for super admin:', profileErr);
      return NextResponse.json({ code: 'DB_ERROR', error: profileErr.message }, { status: 500 });
    }

    // Query businesses to count per user
    const { data: businesses } = await admin
      .from('businesses')
      .select('id, owner_id, name, city, category');

    // Query super admin registry to mark super admins
    const { data: superAdmins } = await admin
      .from('platform_super_admins')
      .select('user_id');

    const superAdminSet = new Set((superAdmins || []).map((sa) => sa.user_id));

    const businessCountMap = new Map<string, number>();
    const businessNamesMap = new Map<string, string[]>();
    if (businesses) {
      for (const b of businesses) {
        if (b.owner_id) {
          businessCountMap.set(b.owner_id, (businessCountMap.get(b.owner_id) || 0) + 1);
          const list = businessNamesMap.get(b.owner_id) || [];
          list.push(b.name);
          businessNamesMap.set(b.owner_id, list);
        }
      }
    }

    const formattedUsers = (profiles || []).map((p) => ({
      id: p.id,
      name: p.full_name || 'User',
      email: p.email,
      role: p.role || 'user',
      isSuperAdmin: superAdminSet.has(p.id),
      businessCount: businessCountMap.get(p.id) || 0,
      businesses: businessNamesMap.get(p.id) || [],
      createdAt: p.created_at,
      status: 'active',
    }));

    return NextResponse.json({ ok: true, users: formattedUsers });
  } catch (err) {
    console.error('Unexpected error in super admin users GET:', err);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
