import React from 'react';
import Link from 'next/link';

export function SuperAdminAccessDenied({ userEmail }: { userEmail?: string }) {
  return (
    <div className="min-h-screen bg-[#080E1A] text-white flex flex-col justify-center items-center p-4 selection:bg-[#0284C7]">
      <div className="max-w-md w-full bg-[#0F172A] rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-900/50 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/60 text-red-400 border border-red-800/60 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">gpp_bad</span>
        </div>

        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold uppercase tracking-wider">
            Access Denied
          </span>
          <h1 className="text-xl font-black text-white mt-2 tracking-tight">
            Super Admin Authorization Failed
          </h1>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {userEmail ? (
            <>
              The signed-in account (<strong className="text-slate-200">{userEmail}</strong>) is not registered in the platform super admin registry (<code>public.platform_super_admins</code>).
            </>
          ) : (
            'Your account is not authorized to access this platform administration portal.'
          )}
        </p>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-left text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-200">Security Rule:</p>
          <p>
            Standard business accounts and organization roles do not have platform governance privileges. Unauthorized access attempts are monitored and logged.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Return to Revvly Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SuperAdminUnconfigured() {
  return (
    <div className="min-h-screen bg-[#080E1A] text-white flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-[#0F172A] rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-900/50 text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-950/60 text-amber-400 border border-amber-800/60 flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl">warning</span>
        </div>
        <h1 className="text-lg font-bold text-white">
          Authentication Configuration Unavailable
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Supabase environment credentials are not configured on the server.
        </p>
      </div>
    </div>
  );
}
