import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import type { User } from '@supabase/supabase-js';

export type SuperAdminAuthResult =
  | { ok: false; reason: 'UNCONFIGURED' }
  | { ok: false; reason: 'UNAUTHENTICATED' }
  | { ok: false; reason: 'FORBIDDEN'; user: User }
  | { ok: false; reason: 'MFA_ENROLLMENT_REQUIRED'; user: User }
  | { ok: false; reason: 'MFA_CHALLENGE_REQUIRED'; user: User; factorId: string }
  | { ok: true; user: User; factorId: string; aal: 'aal2' };

/**
 * Verifies whether a given user ID exists in public.platform_super_admins.
 * Never relies on client-supplied data or profiles.role = 'admin'.
 */
export async function checkIsSuperAdmin(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) {
    return false;
  }

  try {
    const adminClient = createAdminClient();

    // 1. Check with column name 'user_id'
    const { data: byUserId, error: err1 } = await adminClient
      .from('platform_super_admins')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!err1 && byUserId) {
      return true;
    }

    // 2. If 'user_id' column failed or was empty, check with column name 'id'
    const { data: byId, error: err2 } = await adminClient
      .from('platform_super_admins')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!err2 && byId) {
      return true;
    }

    return false;
  } catch (err) {
    console.warn('Super Admin lookup failed or service key not available:', err);
    return false;
  }
}

/**
 * Evaluates the full Super Admin authorization and MFA assurance level on the server.
 */
export async function getSuperAdminAuthContext(): Promise<SuperAdminAuthResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, reason: 'UNCONFIGURED' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, reason: 'UNAUTHENTICATED' };
  }

  // Strictly verify membership in public.platform_super_admins
  const isSuperAdmin = await checkIsSuperAdmin(user.id);
  if (!isSuperAdmin) {
    return { ok: false, reason: 'FORBIDDEN', user };
  }

  // Check Supabase MFA Assurance Level and Factors
  try {
    const { data: mfaData, error: mfaError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (mfaError) {
      console.warn('Error fetching MFA assurance level:', mfaError);
    }

    const { data: factorsData, error: factorsError } =
      await supabase.auth.mfa.listFactors();

    if (factorsError) {
      console.warn('Error listing MFA factors:', factorsError);
    }

    const verifiedTotp = factorsData?.totp?.find((f) => f.status === 'verified');

    // Case 1: No verified TOTP factor enrolled
    if (!verifiedTotp) {
      return { ok: false, reason: 'MFA_ENROLLMENT_REQUIRED', user };
    }

    // Case 2: Verified TOTP enrolled, but current session is below aal2
    if (mfaData?.currentLevel !== 'aal2') {
      return {
        ok: false,
        reason: 'MFA_CHALLENGE_REQUIRED',
        user,
        factorId: verifiedTotp.id,
      };
    }

    // Case 3: Verified Super Admin with active aal2 assurance
    return {
      ok: true,
      user,
      factorId: verifiedTotp.id,
      aal: 'aal2',
    };
  } catch (mfaCatch) {
    console.error('MFA context check error:', mfaCatch);
    return { ok: false, reason: 'MFA_ENROLLMENT_REQUIRED', user };
  }
}

export interface PlatformOverviewMetrics {
  totalUsers: number;
  totalBusinesses: number;
  totalQrCodes: number;
  totalScans: number;
  totalDestinationClicks: number;
  conversionRate: number; // percentage
  recentBusinesses: Array<{
    id: string;
    name: string;
    category: string;
    city: string;
    googleReviewUrl: string;
    createdAt: string;
    ownerEmail?: string;
  }>;
  recentScans: Array<{
    id: number | string;
    scannedAt: string;
    qrCodeId: string;
    businessId: string;
  }>;
}

/**
 * Retrieves aggregate platform metrics for authorized Super Admins.
 * Uses the service role client server-side.
 */
export async function getPlatformOverviewMetrics(): Promise<PlatformOverviewMetrics> {
  if (!isSupabaseConfigured) {
    return {
      totalUsers: 0,
      totalBusinesses: 0,
      totalQrCodes: 0,
      totalScans: 0,
      totalDestinationClicks: 0,
      conversionRate: 0,
      recentBusinesses: [],
      recentScans: [],
    };
  }

  const admin = createAdminClient();

  const [usersRes, bizRes, qrRes, scansRes, clicksRes] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('businesses').select('*', { count: 'exact', head: true }),
    admin.from('qr_codes').select('*', { count: 'exact', head: true }),
    admin.from('qr_scan_events').select('*', { count: 'exact', head: true }),
    admin.from('review_destination_clicks').select('*', { count: 'exact', head: true }),
  ]);

  const totalUsers = usersRes.count ?? 0;
  const totalBusinesses = bizRes.count ?? 0;
  const totalQrCodes = qrRes.count ?? 0;
  const totalScans = scansRes.count ?? 0;
  const totalDestinationClicks = clicksRes.count ?? 0;

  const conversionRate =
    totalScans > 0 ? Number(((totalDestinationClicks / totalScans) * 100).toFixed(1)) : 0;

  // Recent businesses (latest 10)
  const { data: businessesData } = await admin
    .from('businesses')
    .select('id, name, category, city, google_review_url, created_at, owner_id')
    .order('created_at', { ascending: false })
    .limit(10);

  // Map owner emails
  const ownerIds = Array.from(new Set((businessesData || []).map((b) => b.owner_id).filter(Boolean)));
  let profileEmailMap = new Map<string, string>();
  if (ownerIds.length > 0) {
    const { data: profilesData } = await admin
      .from('profiles')
      .select('id, email')
      .in('id', ownerIds);
    if (profilesData) {
      profileEmailMap = new Map(profilesData.map((p) => [p.id, p.email]));
    }
  }

  const recentBusinesses = (businessesData || []).map((b) => ({
    id: b.id,
    name: b.name,
    category: b.category,
    city: b.city,
    googleReviewUrl: b.google_review_url,
    createdAt: b.created_at,
    ownerEmail: profileEmailMap.get(b.owner_id) || undefined,
  }));

  // Recent scans (latest 15)
  const { data: scansData } = await admin
    .from('qr_scan_events')
    .select('id, scanned_at, qr_code_id, business_id')
    .order('scanned_at', { ascending: false })
    .limit(15);

  const recentScans = (scansData || []).map((s) => ({
    id: s.id,
    scannedAt: s.scanned_at,
    qrCodeId: s.qr_code_id,
    businessId: s.business_id,
  }));

  return {
    totalUsers,
    totalBusinesses,
    totalQrCodes,
    totalScans,
    totalDestinationClicks,
    conversionRate,
    recentBusinesses,
    recentScans,
  };
}

