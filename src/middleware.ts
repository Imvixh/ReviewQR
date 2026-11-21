import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured, supabasePublishableKey, supabaseUrl } from '@/lib/supabase/env';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Any legacy attempt to access public login or signup permanently redirects to home
  if (pathname === '/login' || pathname === '/signup' || pathname.startsWith('/login/') || pathname.startsWith('/signup/')) {
    return NextResponse.redirect(new URL('/', request.url), 307);
  }

  // 2. Legacy /admin redirects to /super-admin
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return NextResponse.redirect(new URL('/super-admin', request.url), 308);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 3. /super-admin manages its own authentication directly inside the page component
  if (pathname.startsWith('/super-admin')) {
    return response;
  }

  // 4. Protected legacy business routes
  const isProtectedLegacyRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/business-profile') ||
    pathname.startsWith('/my-qr-codes') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/settings');

  if (!isProtectedLegacyRoute) {
    return response;
  }

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
