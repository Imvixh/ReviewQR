import { redirect } from 'next/navigation';
import {
  getSuperAdminAuthContext,
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
      case 'MFA_CHALLENGE_REQUIRED':
        // Renders dedicated Super Admin Login directly on /super-admin (zero signup, restricted portal)
        return <SuperAdminLoginPortal />;
      case 'FORBIDDEN':
        return <SuperAdminAccessDenied userEmail={auth.user.email} />;
      case 'MFA_ENROLLMENT_REQUIRED':
        redirect('/admin/setup-2fa');
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
