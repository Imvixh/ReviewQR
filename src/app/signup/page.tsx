'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setStoredOrg, setStoredUser } from '@/lib/data-store';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('Rajesh Kumar');
  const [businessName, setBusinessName] = useState('Royal Palace Hotel');
  const [email, setEmail] = useState('manager@royalpalacehotel.in');
  const [password, setPassword] = useState('RoyalReview#2026');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Security requirements checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9\s]/.test(password);

  const satisfiedCount = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthLabel =
    satisfiedCount === 4
      ? 'Strong Password'
      : satisfiedCount >= 2
      ? 'Medium Password'
      : 'Weak Password';

  const strengthColor =
    satisfiedCount === 4
      ? 'bg-green-600'
      : satisfiedCount >= 2
      ? 'bg-amber-500'
      : 'bg-red-500';

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    if (satisfiedCount < 4) {
      setError('Please fulfill all security requirements before proceeding.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              business_name: businessName,
            },
          },
        });

        if (authError) {
          throw authError;
        }

        if (data.user) {
          setStoredUser({
            id: data.user.id,
            email: data.user.email || email,
            displayName: fullName,
            orgId: 'org_royal_palace',
            role: 'admin',
          });
        }
      } else {
        // Local mode fallback
        setStoredUser({
          id: 'usr_' + Date.now(),
          email,
          displayName: fullName,
          orgId: 'org_' + Date.now(),
          role: 'admin',
        });
      }

      setStoredOrg({
        name: businessName,
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setIsLoading(true);
    setTimeout(() => {
      setStoredUser({
        id: 'usr_google_' + Date.now(),
        email: 'rajesh.kumar@gmail.com',
        displayName: 'Rajesh Kumar (Google)',
        orgId: 'org_royal_palace',
        role: 'admin',
      });
      setStoredOrg({ name: businessName });
      setIsLoading(false);
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#F8F9FF]/80 backdrop-blur-xl border-b border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-6 lg:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#005BBF] font-bold text-xl tracking-tight">
            <span className="material-symbols-outlined text-[26px]">qr_code_2</span>
            <span>Review<span className="text-[#0B1C30]">QR</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#565E74] hidden sm:inline">Already have an account?</span>
            <Link
              href="/login"
              className="px-4 py-2 bg-white text-[#0B1C30] border border-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              Log In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="w-full pt-16 flex-1 flex flex-col justify-center">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-10 min-h-[calc(100vh-5rem)] flex items-center justify-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Panel: Product Benefits & Trust (7 cols) */}
            <div className="lg:col-span-7 bg-[#EFF4FF] border border-[#DCE9FF] rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between shadow-sm">
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#005BBF] text-xs font-bold tracking-wider uppercase shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#1A73E8] animate-pulse"></span>
                  Start in 60 seconds • Zero hardware lock-in
                </div>
                <div className="space-y-2 max-w-xl">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1C30] tracking-tight">
                    Turn Physical Visits Into <span className="text-[#005BBF]">5-Star Google Reviews.</span>
                  </h1>
                  <p className="text-base text-[#414754] leading-relaxed">
                    Generate custom branded tabletop QR stands, eliminate customer review friction, and automate your venue reputation.
                  </p>
                </div>
              </div>

              {/* Showcase Cards Composition */}
              <div className="relative z-10 my-8 w-full flex items-center justify-center">
                <div className="relative w-full max-w-lg min-h-[380px] flex items-center justify-center">
                  {/* Stand Card Mockup */}
                  <div className="absolute left-2 top-2 w-64 bg-white rounded-2xl p-5 shadow-xl border border-slate-100 -rotate-2">
                    <div className="text-center space-y-1">
                      <div className="w-8 h-8 mx-auto rounded-full bg-blue-50 text-[#1A73E8] flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">hotel</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{businessName || 'Business'}</p>
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

                  {/* Telemetry Card */}
                  <div className="absolute right-2 bottom-2 w-72 bg-white rounded-2xl p-5 shadow-2xl border border-slate-100 rotate-2 z-10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#0B1C30]">Live Telemetry</span>
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Total QR Scans</span>
                        <span className="font-bold text-[#0B1C30]">—</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Google Clicks</span>
                        <span className="font-bold text-[#1A73E8]">—</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Conversion Rate</span>
                        <span className="font-bold text-slate-500">—</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lower Trust Strip */}
              <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between gap-3 bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white text-xs text-[#0B1C30]">
                <div className="flex items-center gap-1.5 font-semibold">
                  <span className="material-symbols-outlined text-green-600 text-lg">verified</span>
                  <span>Google destination is not verified</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <span className="material-symbols-outlined text-[#1A73E8] text-lg">lock</span>
                  <span>Bank-Grade SSL Encryption</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <span className="material-symbols-outlined text-amber-500 text-lg">policy</span>
                  <span>Anti-Gating Policy Compliant</span>
                </div>
              </div>
            </div>

            {/* Right Panel: Sign Up Form (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center items-center">
              <div className="w-full max-w-[460px] bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-100 space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-[#0B1C30] tracking-tight">Create your account</h2>
                  <p className="text-xs text-[#414754] mt-1">
                    Get started with ReviewQR in just a few steps. Free 14-day trial, no credit card required.
                  </p>
                </div>

                {/* Google OAuth Quick Action */}
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all flex items-center justify-center gap-3 font-semibold text-xs text-[#0B1C30] shadow-sm active:scale-[0.99]"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" fill="#4285F4"></path>
                    <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.36 7.35 24 12 24z" fill="#34A853"></path>
                    <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05"></path>
                    <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
                  </svg>
                  <span>Sign up with Google</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="w-full bg-slate-200 h-[1px]"></div>
                  <span className="absolute px-3 bg-white text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    OR REGISTER WITH EMAIL
                  </span>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  {/* Full Name & Business Name Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#0B1C30] mb-1" htmlFor="fullName">
                        Full Name
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-slate-400 text-lg">person</span>
                        <input
                          id="fullName"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0B1C30] focus:outline-none focus:bg-white focus:border-[#1A73E8]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0B1C30] mb-1" htmlFor="businessName">
                        Business Name
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-slate-400 text-lg">store</span>
                        <input
                          id="businessName"
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Royal Palace Hotel"
                          className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0B1C30] focus:outline-none focus:bg-white focus:border-[#1A73E8]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Work Email */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-[#0B1C30]" htmlFor="email">
                        Work Email Address
                      </label>
                      <span className="inline-flex items-center gap-1 text-[11px] text-green-700 font-semibold">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        <span>Corporate email</span>
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-slate-400 text-lg">mail</span>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="manager@company.com"
                        className="w-full h-10 pl-9 pr-9 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0B1C30] focus:outline-none focus:bg-white focus:border-[#1A73E8]"
                      />
                      <span className="material-symbols-outlined absolute right-3 text-green-600 text-lg">check</span>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1C30] mb-1" htmlFor="password">
                      Create Password
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-slate-400 text-lg">lock</span>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full h-10 pl-9 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0B1C30] focus:outline-none focus:bg-white focus:border-[#1A73E8]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">Password Strength</span>
                        <span className={`font-semibold ${satisfiedCount === 4 ? 'text-green-700' : 'text-amber-600'}`}>
                          {strengthLabel}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            className={`h-full w-1/4 rounded-full transition-colors ${
                              satisfiedCount >= bar ? strengthColor : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Checklist Requirements */}
                    <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        SECURITY REQUIREMENTS
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                        <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-green-700 font-medium' : 'text-slate-400'}`}>
                          <span className="material-symbols-outlined text-sm">{hasMinLength ? 'check_circle' : 'radio_button_unchecked'}</span>
                          <span>At least 8 characters</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-green-700 font-medium' : 'text-slate-400'}`}>
                          <span className="material-symbols-outlined text-sm">{hasUppercase ? 'check_circle' : 'radio_button_unchecked'}</span>
                          <span>Uppercase letter</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-green-700 font-medium' : 'text-slate-400'}`}>
                          <span className="material-symbols-outlined text-sm">{hasNumber ? 'check_circle' : 'radio_button_unchecked'}</span>
                          <span>Number included</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-green-700 font-medium' : 'text-slate-400'}`}>
                          <span className="material-symbols-outlined text-sm">{hasSpecial ? 'check_circle' : 'radio_button_unchecked'}</span>
                          <span>Special character</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-[#1A73E8] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-xs text-[#565E74] leading-snug cursor-pointer select-none">
                      I agree to the ReviewQR{' '}
                      <span className="text-[#1A73E8] font-semibold hover:underline">Terms of Service</span> and{' '}
                      <span className="text-[#1A73E8] font-semibold hover:underline">Privacy Policy</span>.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-xl bg-[#005BBF] hover:bg-[#1A73E8] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Creating Account...</span>
                    ) : (
                      <>
                        <span>Start Free 14-Day Trial</span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-1">
                  <p className="text-xs text-[#565E74]">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[#1A73E8] font-bold hover:underline ml-1">
                      Log In
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
