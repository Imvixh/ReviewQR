import { NextResponse } from 'next/server';
import { getSuperAdminAuthContext, getSuperAdminBootstrapStatus } from '@/lib/auth/super-admin';

export async function GET(): Promise<NextResponse> {
  const [auth, bootstrap] = await Promise.all([
    getSuperAdminAuthContext(),
    getSuperAdminBootstrapStatus(),
  ]);

  if (!auth.ok) {
    return NextResponse.json({
      ok: false,
      reason: auth.reason,
      user: 'user' in auth ? { id: auth.user.id, email: auth.user.email } : null,
      factorId: 'factorId' in auth ? auth.factorId : null,
      bootstrapAllowed: bootstrap.registrationAllowed,
    });
  }

  return NextResponse.json({
    ok: true,
    reason: 'AUTHORIZED',
    aal: auth.aal,
    user: { id: auth.user.id, email: auth.user.email },
    factorId: auth.factorId,
    bootstrapAllowed: bootstrap.registrationAllowed,
  });
}
