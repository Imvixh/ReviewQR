'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function SuperAdminVerify2FAPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkFactors() {
      if (!isSupabaseConfigured) {
        setError('Supabase is not configured on the client.');
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push('/login?redirectTo=/admin');
          return;
        }

        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData?.currentLevel === 'aal2') {
          router.push('/admin');
          return;
        }

        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) throw factorsError;

        const verifiedFactor = factors?.totp?.find((f) => f.status === 'verified');
        if (!verifiedFactor) {
          // If no verified factor is enrolled yet, redirect to setup
          router.push('/admin/setup-2fa');
          return;
        }

        if (!cancelled) {
          setFactorId(verifiedFactor.id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load MFA factors.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void checkFactors();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;

    const cleaned = verifyCode.replace(/\s+/g, '');
    if (cleaned.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: cleaned,
      });

      if (verifyError) {
        throw verifyError;
      }

      // Session successfully upgraded to AAL2
      router.push('/admin');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid authentication code. Please check your authenticator app and try again.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#0B1C30] text-white flex items-center justify-center font-black text-sm">
            R
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#0B1C30]">
              REVELY Super Admin
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Two-Factor Authentication Challenge
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-3xl text-[#1A73E8] animate-spin mb-3">
              sync
            </span>
            <p className="text-xs text-slate-500 font-semibold">
              Checking authentication status…
            </p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
              Open your authenticator app (Google Authenticator, Microsoft Authenticator, etc.) and enter the current 6-digit code for <span className="font-bold text-slate-900">REVELY</span>.
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Authentication Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="123456"
                autoFocus
                className="w-full h-12 text-center font-mono text-2xl tracking-widest rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent font-bold"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || verifyCode.replace(/\s+/g, '').length !== 6}
              className="w-full h-11 rounded-xl bg-[#005BBF] text-white hover:bg-[#1A73E8] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">
                    sync
                  </span>
                  <span>Verifying Code…</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">
                    lock_open
                  </span>
                  <span>Verify Code &amp; Enter</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link href="/dashboard" className="hover:text-slate-800 transition-colors">
            Return to Dashboard
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-red-600 hover:text-red-700 font-semibold"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

