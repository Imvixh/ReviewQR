'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message || 'Invalid email or password.');
      }

      if (!data.user) {
        throw new Error('Authentication failed. No user session returned.');
      }

      // Check if user has Super Admin authorization and if MFA is challenged
      const statusRes = await fetch('/api/admin/auth/status');
      const statusData = await statusRes.json();

      if (statusData.reason === 'MFA_CHALLENGE_REQUIRED') {
        setMfaRequired(true);
        setMfaFactorId(statusData.factorId || null);
        setIsLoading(false);
        return;
      }

      if (!statusData.ok) {
        if (statusData.reason === 'FORBIDDEN') {
          await supabase.auth.signOut();
          throw new Error('Access Denied: This account is not registered in the Super Admin registry.');
        } else if (statusData.reason === 'MFA_ENROLLMENT_REQUIRED') {
          router.push('/admin/setup-2fa');
          return;
        } else {
          throw new Error(statusData.error || 'Super Admin authorization failed.');
        }
      }

      // Successfully authenticated & verified as Super Admin
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode || mfaCode.length < 6 || !mfaFactorId) {
      setErrorMessage('Please enter a valid 6-digit authenticator code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const challenge = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
      if (challenge.error) throw new Error(challenge.error.message);

      const verify = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.data.id,
        code: mfaCode.trim(),
      });

      if (verify.error) throw new Error(verify.error.message);

      // Successfully verified AAL2 TOTP
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '2FA verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-white flex flex-col justify-center items-center p-4 selection:bg-[#1A73E8]">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md bg-[#1C2541]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl space-y-6">
        {/* Brand & Security Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#005BBF] to-[#1A73E8] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-1">
            <span className="material-symbols-outlined text-3xl">shield_person</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight text-white">REVELY</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/60 text-[10px] font-bold uppercase tracking-wider">
              Super Admin
            </span>
          </div>

          <h1 className="text-lg font-bold text-slate-100">
            {mfaRequired ? 'Multi-Factor Challenge' : 'Platform Administration Portal'}
          </h1>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            {mfaRequired
              ? 'Enter the 6-digit code from your authenticator app.'
              : 'Restricted access gateway for platform governance and user QR management.'}
          </p>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-start gap-2.5">
            <span className="material-symbols-outlined text-base text-red-400 shrink-0 mt-0.5">
              error
            </span>
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* MFA Step */}
        {mfaRequired ? (
          <form onSubmit={handleVerifyMfa} className="space-y-4">
            <div>
              <label htmlFor="mfaCode" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Authenticator Code (TOTP)
              </label>
              <div className="relative">
                <input
                  id="mfaCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  disabled={isLoading}
                  autoFocus
                  className="w-full h-11 px-4 text-center tracking-[0.5em] text-lg font-mono bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || mfaCode.length < 6}
              className="w-full h-11 rounded-xl bg-[#1A73E8] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">sync</span>
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">verified_user</span>
                  <span>Verify &amp; Enter Console</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMfaRequired(false);
                setMfaCode('');
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              &larr; Back to login
            </button>
          </form>
        ) : (
          /* Normal Password Login Form */
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="adminEmail" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500 text-base">
                  mail
                </span>
                <input
                  id="adminEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@revely.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full h-11 pl-10 pr-4 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="adminPassword" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500 text-base">
                  lock
                </span>
                <input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full h-11 pl-10 pr-10 text-xs bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 text-base"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 mt-2 rounded-xl bg-[#1A73E8] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">sync</span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>Sign In as Super Admin</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Security Notice: NO SIGNUP ALLOWED */}
        <div className="pt-4 border-t border-slate-700/60 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <span className="material-symbols-outlined text-sm text-emerald-400">lock</span>
            <span>AAL2 TOTP Enforced · Internal Gateway Only</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            Platform Security Notice: Unauthorized access attempts are monitored and recorded. Public registration is permanently disabled on this gateway.
          </p>
        </div>
      </div>
    </div>
  );
}
