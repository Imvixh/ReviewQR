import { NextResponse } from 'next/server';
import {
  getSuperAdminAuthContext,
  getPlatformOverviewMetrics,
} from '@/lib/auth/super-admin';

export async function GET(): Promise<NextResponse> {
  const auth = await getSuperAdminAuthContext();

  if (!auth.ok) {
    switch (auth.reason) {
      case 'UNCONFIGURED':
        return NextResponse.json(
          { code: 'SUPABASE_NOT_CONFIGURED', error: 'Authentication is not configured on the server.' },
          { status: 503 }
        );
      case 'UNAUTHENTICATED':
        return NextResponse.json(
          { code: 'UNAUTHENTICATED', error: 'Authentication required.' },
          { status: 401 }
        );
      case 'FORBIDDEN':
        return NextResponse.json(
          {
            code: 'FORBIDDEN',
            error: 'Access denied. Account is not registered in public.platform_super_admins.',
          },
          { status: 403 }
        );
      case 'MFA_ENROLLMENT_REQUIRED':
        return NextResponse.json(
          {
            code: 'MFA_ENROLLMENT_REQUIRED',
            error: 'Authenticator 2FA enrollment is required for Super Admin access.',
          },
          { status: 403 }
        );
      case 'MFA_CHALLENGE_REQUIRED':
        return NextResponse.json(
          {
            code: 'MFA_CHALLENGE_REQUIRED',
            factorId: auth.factorId,
            error: 'Two-factor authentication challenge required (session assurance level below aal2).',
          },
          { status: 403 }
        );
    }
  }

  try {
    const metrics = await getPlatformOverviewMetrics();
    return NextResponse.json({
      ok: true,
      admin: {
        id: auth.user.id,
        email: auth.user.email,
        aal: auth.aal,
        factorId: auth.factorId,
      },
      metrics,
    });
  } catch (err) {
    console.error('Failed to load platform overview metrics:', err);
    return NextResponse.json(
      { code: 'METRICS_LOAD_FAILED', error: 'Failed to aggregate platform metrics.' },
      { status: 500 }
    );
  }
}

