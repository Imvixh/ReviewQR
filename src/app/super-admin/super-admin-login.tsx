'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface SuperAdminLoginPortalProps {
  initialMfaRequired?: boolean;
  initialMfaFactorId?: string;
}

export default function SuperAdminLoginPortal({
  initialMfaRequired = false,
  initialMfaFactorId = undefined,
}: SuperAdminLoginPortalProps) {
  const router = useRouter();

  // Authentication states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // MFA states
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(initialMfaRequired);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(initialMfaFactorId || null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both administrative email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUnconfirmedEmail(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setUnconfirmedEmail(email.trim().toLowerCase());
          throw new Error('Email address has not been confirmed. Please verify your email before entering.');
        }
        throw new Error(error.message || 'Invalid administrative credentials.');
      }

      if (!data.user) {
        throw new Error('Authentication failed. No user session returned.');
      }

      // Verify Super Admin status and MFA requirements on the server
      const statusRes = await fetch('/api/super-admin/auth/status');
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
          throw new Error('Access Denied: This account is not registered in the platform super admin registry.');
        } else {
          throw new Error(statusData.error || 'Super Admin authorization failed.');
        }
      }

      // Successfully authorized as Super Admin
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async (targetEmail: string) => {
    if (!targetEmail) return;

    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/super-admin/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend verification email.');
      }
      setSuccessMessage('Verification email re-dispatched. Please check your inbox.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Resend failed.');
    } finally {
      setIsResending(false);
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

      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '2FA challenge verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080E1A] text-white flex flex-col justify-center items-center p-4 selection:bg-[#0284C7] relative overflow-hidden font-sans">
      {/* Background ambient security lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-[#0F172A]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl space-y-6">
        {/* Brand & Security Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] flex items-center justify-center text-white shadow-lg shadow-sky-500/20 mb-1">
            <span className="material-symbols-outlined text-3xl">verified_user</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight text-white">Revvly</span>
            <span className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-bold uppercase tracking-wider">
              Super Admin
            </span>
          </div>

          <h1 className="text-lg font-bold text-slate-100">
            {mfaRequired
              ? 'Multi-Factor Challenge (AAL2)'
              : 'Platform Executive Portal'}
          </h1>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            {mfaRequired
              ? 'Enter your 6-digit authenticator verification code.'
              : 'Restricted administrative gateway for global platform governance and QR touchpoint control.'}
          </p>
        </div>

        {/* Success notification banner */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5">
            <span className="material-symbols-outlined text-base text-emerald-400 shrink-0 mt-0.5">
              check_circle
            </span>
            <div className="flex-1 leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex flex-col gap-2">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-base text-red-400 shrink-0 mt-0.5">
                error
              </span>
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
            {unconfirmedEmail && (
              <button
                type="button"
                onClick={() => handleResendVerification(unconfirmedEmail)}
                disabled={isResending}
                className="mt-1 self-start px-3 py-1 bg-red-900/60 hover:bg-red-800 text-red-200 rounded-lg text-[11px] font-semibold border border-red-700/60 transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">forward_to_inbox</span>
                <span>{isResending ? 'Sending...' : 'Resend Verification Email'}</span>
              </button>
            )}
          </div>
        )}

        {mfaRequired ? (
          /* MFA TOTP Challenge Step */
          <form onSubmit={handleVerifyMfa} className="space-y-4">
            <div>
              <label htmlFor="mfaCode" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Authenticator Security Code
              </label>
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
                className="w-full h-12 px-4 text-center tracking-[0.5em] text-xl font-mono bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || mfaCode.length < 6}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">sync</span>
                  <span>Verifying Token...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">lock_open</span>
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
          /* Standard Super Admin Login Form */
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="adminEmail" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Super Admin Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500 text-base">
                  admin_panel_settings
                </span>
                <input
                  id="adminEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@revvly.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full h-11 pl-10 pr-4 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="adminPassword" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500 text-base">
                  key
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
                  className="w-full h-11 pl-10 pr-10 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
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
              className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">sync</span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>Access Super Admin Console</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Security Notice Footer */}
        <div className="pt-4 border-t border-slate-800 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-400">
            <span className="material-symbols-outlined text-sm">shield</span>
            <span>AAL2 TOTP Enforced · Strictly Internal Gateway</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Notice: Public user self-registration is permanently disabled on this domain. Only pre-authorized cryptographic keys and administrative identities can access this terminal.
          </p>
        </div>
      </div>
    </div>
  );
}
