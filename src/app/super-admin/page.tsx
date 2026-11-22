import { redirect } from 'next/navigation';
import {
  getSuperAdminAuthContext,
  getSuperAdminBootstrapStatus,
  getPlatformOverviewMetrics,
} from '@/lib/auth/super-admin';
import SuperAdminDashboard from './super-admin-dashboard';
import SuperAdminLoginPortal from './super-admin-login';
import { SuperAdminAccessDenied, SuperAdminUnconfigured } from './access-denied';

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  const auth = await getSuperAdminAuthContext();

  if (!auth.ok) {
    switch (auth.reason) {
      case 'UNCONFIGURED':
        return <SuperAdminUnconfigured />;
      case 'UNAUTHENTICATED':
      case 'MFA_CHALLENGE_REQUIRED': {
        return (
          <SuperAdminLoginPortal
            initialMfaRequired={auth.reason === 'MFA_CHALLENGE_REQUIRED'}
            initialMfaFactorId={'factorId' in auth ? auth.factorId : undefined}
          />
        );
      }
      case 'FORBIDDEN':
        return <SuperAdminAccessDenied userEmail={auth.user.email} />;
      case 'MFA_ENROLLMENT_REQUIRED':
        redirect('/super-admin/otp-setup');
    }
  }

  const metrics = await getPlatformOverviewMetrics();

  return (
    <SuperAdminDashboard
      userEmail={auth.user.email || 'Super Admin'}
      userId={auth.user.id}
      initialMetrics={metrics}
    />
  );
}
