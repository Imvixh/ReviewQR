'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function OtpSetup() {
  const router = useRouter();
  const [qr, setQr] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedQr = sessionStorage.getItem('mfa_qr') ?? '';
    const storedSecret = sessionStorage.getItem('mfa_secret') ?? '';
    const storedFactor = sessionStorage.getItem('mfa_factor') ?? '';
    if (!storedQr && !storedFactor) {
      router.push('/super-admin');
    } else {
      setQr(storedQr);
      setSecret(storedSecret);
      setFactorId(storedFactor);
    }
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: code.trim(),
      });
      if (verifyError) throw verifyError;

      sessionStorage.removeItem('mfa_qr');
      sessionStorage.removeItem('mfa_secret');
      sessionStorage.removeItem('mfa_factor');
      router.push('/super-admin');
    } catch (err: any) {
      setError(err.message ?? 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080E1A] text-white flex flex-col justify-center items-center p-4 selection:bg-[#0284C7] relative overflow-hidden font-sans">
      <div className="relative w-full max-w-md bg-[#0F172A]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <span className="material-symbols-outlined text-3xl">qr_code_2</span>
          </div>
          <h1 className="text-lg font-bold text-slate-100">Configure Authenticator (TOTP)</h1>
          <p className="text-xs text-slate-400">
            Scan the QR code with Google Authenticator, 1Password, or Authy.
          </p>
        </div>

        {qr && (
          <div className="p-4 bg-white rounded-2xl flex justify-center shadow-inner">
            <img src={qr} alt="TOTP QR Code" className="w-48 h-48" />
          </div>
        )}

        {secret && (
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Manual Secret Key</p>
            <code className="text-xs font-mono text-sky-300 select-all tracking-wider">{secret}</code>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Enter 6-Digit Authenticator Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full h-12 text-center text-xl font-mono tracking-[0.5em] bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Enable MFA'}
          </button>
        </form>
      </div>
    </div>
  );
}
