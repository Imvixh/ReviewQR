import React from 'react';
import Link from 'next/link';

export function AdminAccessDenied({ userEmail }: { userEmail?: string }) {
  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">block</span>
        </div>
        <h1 className="text-xl font-black text-[#0B1C30] tracking-tight">
          Super Admin Access Denied
        </h1>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          {userEmail ? (
            <>
              The signed-in account (<span className="font-semibold text-slate-700">{userEmail}</span>) is not registered in the platform super admin registry (<code>public.platform_super_admins</code>).
            </>
          ) : (
            'Your account is not authorized to access the Super Admin Console.'
          )}
        </p>
        <div className="my-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-[11px] text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">Security Rule:</p>
          <p>
            Standard business owner accounts and org roles (<code>profiles.role = &apos;admin&apos;</code>) do not have access to platform-level administrative tools.
          </p>
        </div>
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full h-11 rounded-xl bg-[#005BBF] text-white hover:bg-[#1A73E8] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>Go to Business Dashboard</span>
          </Link>
          <Link
            href="/create-qr"
            className="w-full h-10 rounded-xl bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold border border-slate-200 transition-all flex items-center justify-center"
          >
            Create Your QR
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AdminUnconfigured() {
  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-2xl">warning</span>
        </div>
        <h1 className="text-lg font-bold text-[#0B1C30]">
          Admin Unavailable
        </h1>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          Authentication is not configured on the server. Please verify your Supabase configuration.
        </p>
      </div>
    </div>
  );
}

