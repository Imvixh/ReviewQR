'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function SuperAdminSetup2FAPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initEnrollment() {
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

        // Check if user already has an active verified factor
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const verifiedFactor = factors?.totp?.find((f) => f.status === 'verified');

        if (verifiedFactor) {
          // Already enrolled, go to challenge verify
          router.push('/admin/verify-2fa');
          return;
        }

        // Enroll new TOTP factor
        const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          issuer: 'REVELY',
        });

        if (enrollError) {
          throw enrollError;
        }

        if (!cancelled && enrollData?.totp) {
          setFactorId(enrollData.id);
          setQrSvg(enrollData.totp.qr_code);
          setSecret(enrollData.totp.secret);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to initialize two-factor authentication enrollment.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void initEnrollment();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleCopySecret = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;

    const cleaned = verifyCode.replace(/\s+/g, '');
    if (cleaned.length !== 6) {
      setError('Please enter a valid 6-digit code from your authenticator app.');
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

      // Session is now upgraded to AAL2
      router.push('/admin');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid authentication code. Please check your app and try again.'
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
              Two-Factor Authentication Setup
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-3xl text-[#1A73E8] animate-spin mb-3">
              sync
            </span>
            <p className="text-xs text-slate-500 font-semibold">
              Preparing secure TOTP enrollment…
            </p>
          </div>
        ) : error && !qrSvg ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-6">
            <p className="font-bold mb-1">Enrollment Error</p>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold text-[11px]"
            >
              Retry
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
              <span className="font-bold">Required Security:</span> Super Admin
              access requires hardware or app-based 2FA (Google Authenticator, Microsoft Authenticator, or 1Password).
            </div>

            {/* Step 1: Scan QR */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Step 1: Scan QR Code
              </span>
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                {qrSvg && (
                  <div
                    className="w-48 h-48 bg-white p-2 rounded-xl shadow-xs flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                )}
                {secret && (
                  <div className="w-full mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-slate-600 select-all truncate mr-2">
                      {secret}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="px-2.5 py-1 rounded bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copied ? 'check' : 'content_copy'}
                      </span>
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Verification Code */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Step 2: Enter 6-Digit Code
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="123456"
                className="w-full h-12 text-center font-mono text-xl tracking-widest rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
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
                    verified_user
                  </span>
                  <span>Complete Setup &amp; Access Admin</span>
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

