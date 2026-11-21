import { redirect } from 'next/navigation';
import {
  getSuperAdminAuthContext,
  getPlatformOverviewMetrics,
} from '@/lib/auth/super-admin';
import AdminDashboardClient from './admin-dashboard-client';
import { AdminAccessDenied, AdminUnconfigured } from './access-denied';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const auth = await getSuperAdminAuthContext();

  if (!auth.ok) {
    switch (auth.reason) {
      case 'UNCONFIGURED':
        return <AdminUnconfigured />;
      case 'UNAUTHENTICATED':
        redirect('/login?redirectTo=/admin');
      case 'FORBIDDEN':
        return <AdminAccessDenied userEmail={auth.user.email} />;
      case 'MFA_ENROLLMENT_REQUIRED':
        redirect('/admin/setup-2fa');
      case 'MFA_CHALLENGE_REQUIRED':
        redirect('/admin/verify-2fa');
    }
  }

  const metrics = await getPlatformOverviewMetrics();

  return (
    <AdminDashboardClient
      userEmail={auth.user.email || 'Super Admin'}
      userId={auth.user.id}
      initialMetrics={metrics}
    />
  );
}

