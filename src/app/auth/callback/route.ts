import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initializeBootstrapSuperAdmin, checkIsSuperAdmin } from '@/lib/auth/super-admin';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as any;
  const next = requestUrl.searchParams.get('next') || '/super-admin';

  const supabase = await createClient();

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      // Check if user is a super admin or eligible for bootstrap initialization
      const isSuperAdmin = await checkIsSuperAdmin(data.user.id);
      if (!isSuperAdmin) {
        await initializeBootstrapSuperAdmin(data.user.id);
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  } else if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });
    if (!error && data?.user) {
      const isSuperAdmin = await checkIsSuperAdmin(data.user.id);
      if (!isSuperAdmin) {
        await initializeBootstrapSuperAdmin(data.user.id);
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Redirect to requested destination or super-admin entry
  return NextResponse.redirect(new URL(next, request.url));
}
