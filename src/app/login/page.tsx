'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setStoredUser } from '@/lib/data-store';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('rajesh.kumar@royalpalace.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    // Authenticate and save user session
    setTimeout(() => {
      setStoredUser({
        id: 'usr_rajesh_kumar',
        email,
        displayName: 'Rajesh Kumar',
        orgId: 'org_royal_palace',
        role: 'admin',
      });
      setIsLoading(false);
      router.push('/dashboard');
    }, 400);
  };

  const handleGoogleSSO = () => {
    setIsLoading(true);
    setTimeout(() => {
      setStoredUser({
        id: 'usr_google_' + Date.now(),
        email: 'rajesh.kumar@gmail.com',
        displayName: 'Rajesh Kumar (Google)',
        orgId: 'org_royal_palace',
        role: 'admin',
      });
      setIsLoading(false);
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#F8F9FF]/80 backdrop-blur-xl border-b border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-[#005BBF] font-bold text-xl tracking-tight">
              <span className="material-symbols-outlined text-[26px]">qr_code_2</span>
              <span>Review<span className="text-[#0B1C30]">QR</span></span>
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF4FF] text-[#006D2C] text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>256-bit SSL Encrypted</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 bg-[#1A73E8] text-white font-semibold text-xs rounded-xl shadow-sm"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#414754] hover:bg-slate-100 hover:text-[#0B1C30] transition-colors"
              >
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="w-full pt-16 flex-1 bg-[#F8F9FF] flex flex-col justify-center">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-10 min-h-[calc(100vh-5rem)] flex items-center justify-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Panel: Brand Experience & Composition (7 cols) */}
            <div className="lg:col-span-7 bg-[#EFF4FF] border border-[#DCE9FF] rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between shadow-sm">
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#005BBF] text-xs font-bold tracking-wider uppercase shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#1A73E8] animate-pulse"></span>
                  Verified SaaS Authentication
                </div>
                <div className="space-y-2 max-w-xl">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1C30] tracking-tight">
                    Welcome back to <span className="text-[#005BBF]">smarter reviews.</span>
                  </h1>
                  <p className="text-base text-[#414754] leading-relaxed">
                    Manage your QR posters, customize your brand experience, and understand customer engagement from one place.
                  </p>
                </div>
              </div>

              {/* Center: Layered Mockups */}
              <div className="relative z-10 my-8 w-full flex items-center justify-center">
                <div className="relative w-full max-w-lg min-h-[380px] flex items-center justify-center">
                  {/* Layer 1: Dashboard Analytics Card */}
                  <div className="absolute left-2 top-2 w-72 sm:w-80 bg-white rounded-2xl p-5 shadow-lg border border-slate-100 -rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="flex items-center justify-between pb-3 mb-3 bg-slate-50 px-3 py-1.5 rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">dashboard.preview</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Total Scans (30d)</span>
                        <span className="text-xl font-bold text-[#0B1C30]">—</span>
                      </div>
                      {/* SVG Sparkline */}
                      <svg className="w-full h-8 text-[#1A73E8]" preserveAspectRatio="none" viewBox="0 0 100 24">
                        <path d="M0,20 Q15,18 28,12 T50,8 T72,14 T100,2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
                        <path d="M0,20 Q15,18 28,12 T50,8 T72,14 T100,2 L100,24 L0,24 Z" fill="currentColor" fillOpacity="0.12" />
                      </svg>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-[10px] text-slate-500 block">Active Stands</span>
                          <span className="text-xs font-bold text-slate-500">Not connected</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-[10px] text-slate-500 block">Conversion</span>
                          <span className="text-xs font-bold text-slate-500">—</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Layer 2: Tabletop QR Stand */}
                  <div className="absolute right-2 bottom-2 w-48 sm:w-56 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 rotate-3 z-10 hover:rotate-0 transition-transform duration-300">
                    <div className="text-center space-y-1">
                      <div className="w-7 h-7 mx-auto rounded-full bg-blue-50 text-[#1A73E8] flex items-center justify-center">
                        <span className="material-symbols-outlined text-base">hotel</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Royal Palace</p>
                      <p className="text-xs font-bold text-[#0B1C30]">Review us on Google</p>
                      <div className="p-2 bg-slate-50 rounded-xl my-2 flex justify-center">
                        <span className="material-symbols-outlined text-5xl text-[#0B1C30]">qr_code_2</span>
                      </div>
                      <div className="flex items-center justify-center gap-0.5 text-[#FBBC04]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lower Trust Indicator */}
              <div className="relative z-10 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white">
                <div className="flex items-center gap-2 text-[#0B1C30]">
                  <span className="material-symbols-outlined text-[#006D2C] text-xl">verified_user</span>
                  <span className="text-xs font-semibold">Your review experience, beautifully organized.</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[15px] text-[#1A73E8]">lock</span>
                  <span>SOC-2 Type II & Google API Compliant</span>
                </div>
              </div>
            </div>

            {/* Right Panel: Authentication Form (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center items-center">
              <div className="w-full max-w-[440px] bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-100 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#0B1C30] tracking-tight">Welcome back</h2>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" title="All Services Operational"></span>
                  </div>
                  <p className="text-sm text-[#414754] mt-1">
                    Log in to your ReviewQR account to continue.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    <span>{error}</span>
                  </div>
                )}

                {showRecoveryBanner && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-left flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#1A73E8] text-lg mt-0.5">mark_email_read</span>
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-[#0B1C30]">Reset Link Sent</p>
                      <p className="text-[#414754] mt-0.5">Check your inbox for a magic link to reset credentials safely.</p>
                    </div>
                    <button onClick={() => setShowRecoveryBanner(false)} className="text-slate-400 hover:text-slate-700">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] mb-1.5" htmlFor="email">
                      Email address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined text-slate-400 text-lg absolute left-3.5 pointer-events-none">
                        mail
                      </span>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@business.com"
                        className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-sm text-[#0B1C30] focus:outline-none focus:bg-white focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] transition-all"
                      />
                      <span className="material-symbols-outlined text-green-600 text-lg absolute right-3 pointer-events-none">
                        check_circle
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#0B1C30]" htmlFor="password">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowRecoveryBanner(true)}
                        className="text-xs text-[#1A73E8] font-semibold hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined text-slate-400 text-lg absolute left-3.5 pointer-events-none">
                        lock
                      </span>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-sm text-[#0B1C30] focus:outline-none focus:bg-white focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-700"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#0B1C30]">
                      <input defaultChecked type="checkbox" className="w-4 h-4 rounded text-[#1A73E8] focus:ring-0 cursor-pointer" />
                      <span>Remember this device for 30 days</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-[#005BBF] hover:bg-[#1A73E8] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Signing in...</span>
                    ) : (
                      <>
                        <span>Log In</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="w-full bg-slate-200 h-[1px]"></div>
                  <span className="absolute px-3 bg-white text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    Or continue with
                  </span>
                </div>

                {/* Google SSO */}
                <button
                  type="button"
                  onClick={handleGoogleSSO}
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0B1C30] font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.99]"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z" fill="#4285F4"></path>
                    <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" fill="#34A853"></path>
                    <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05"></path>
                    <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-[#414754]">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-[#1A73E8] font-bold hover:underline ml-1">
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
