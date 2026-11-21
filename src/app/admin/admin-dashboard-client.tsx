'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { PlatformOverviewMetrics } from '@/lib/auth/super-admin';

interface AdminDashboardClientProps {
  userEmail: string;
  userId: string;
  initialMetrics: PlatformOverviewMetrics;
}

export default function AdminDashboardClient({
  userEmail,
  userId,
  initialMetrics,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [metrics, setMetrics] = useState<PlatformOverviewMetrics>(initialMetrics);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      const res = await fetch('/api/admin/overview');
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to refresh metrics.');
      }
      setMetrics(data.metrics);
    } catch (err) {
      setRefreshError(err instanceof Error ? err.message : 'Refresh failed.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const filteredBusinesses = metrics.recentBusinesses.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      (b.ownerEmail && b.ownerEmail.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans">
      {/* Super Admin Console Header */}
      <header className="sticky top-0 z-40 bg-[#0B1C30] text-white px-4 md:px-8 py-3.5 border-b border-slate-800 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1A73E8] flex items-center justify-center font-black text-sm text-white shadow-xs">
            R
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-tight text-white leading-tight">
                REVELY
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">
                Super Admin Console
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Read-Only Platform Governance
            </span>
          </div>
        </div>

        {/* Right Admin Profile & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] text-slate-300 font-medium truncate max-w-[180px]">
              {userEmail}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[9px] font-bold border border-emerald-800/80 uppercase tracking-wider">
              AAL2 Verified
            </span>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span
              className={`material-symbols-outlined text-[16px] ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              refresh
            </span>
            <span className="hidden md:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        {refreshError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{refreshError}</span>
            <button
              onClick={() => setRefreshError(null)}
              className="text-red-900 font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Governance & Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-700 text-xl">
              security
            </span>
            <div>
              <span className="font-bold">Verified Super Admin Session: </span>
              <span>
                Authorized via <code>public.platform_super_admins</code> and protected by native TOTP two-factor authentication (AAL2).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-700 shrink-0">
            <span className="material-symbols-outlined text-sm">shield</span>
            <span>Tenant RLS Preserved</span>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <section aria-label="Key Performance Indicators">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Registered Businesses */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Businesses
                </span>
                <p className="text-3xl font-black text-[#0B1C30]">
                  {metrics.totalBusinesses}
                </p>
              </div>
              <p className="mt-3 text-[11px] text-slate-500 font-medium">
                {metrics.totalUsers} registered users
              </p>
            </div>

            {/* 2. QR Codes */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  QR Touchpoints
                </span>
                <p className="text-3xl font-black text-[#0B1C30]">
                  {metrics.totalQrCodes}
                </p>
              </div>
              <p className="mt-3 text-[11px] text-slate-500 font-medium">
                Saved touchpoint posters
              </p>
            </div>

            {/* 3. Physical Scans */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Physical Scans
                </span>
                <p className="text-3xl font-black text-[#1A73E8]">
                  {metrics.totalScans}
                </p>
              </div>
              <p className="mt-3 text-[11px] text-slate-500 font-medium">
                Logged at touchpoint
              </p>
            </div>

            {/* 4. Google Review Handoffs */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Google Handoffs
                </span>
                <p className="text-3xl font-black text-emerald-700">
                  {metrics.totalDestinationClicks}
                </p>
              </div>
              <p className="mt-3 text-[11px] text-slate-500 font-medium">
                Tapped &ldquo;Go to Google&rdquo;
              </p>
            </div>

            {/* 5. Handoff Conversion */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Handoff Rate
                </span>
                <p className="text-3xl font-black text-amber-600">
                  {metrics.conversionRate}%
                </p>
              </div>
              <p className="mt-3 text-[11px] text-slate-500 font-medium">
                Handoffs &divide; Scans
              </p>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-500 italic">
            * Note on Handoffs: Measures customer taps that opened Google Reviews. External published reviews cannot be verified by Google API or webhooks.
          </p>
        </section>

        {/* Main Content Grid: Businesses Directory & Recent Scans */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Businesses Directory (7 cols) */}
          <section className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#0B1C30]">
                  Registered Businesses Directory
                </h2>
                <p className="text-xs text-slate-500">
                  Platform-wide business destinations and categories
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search businesses…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                />
              </div>
            </div>

            {filteredBusinesses.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No businesses found matching your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
                      <th className="pb-3 font-semibold">Business</th>
                      <th className="pb-3 font-semibold">Category / City</th>
                      <th className="pb-3 font-semibold">Owner</th>
                      <th className="pb-3 font-semibold text-right">Destination</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredBusinesses.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 font-bold text-[#0B1C30]">
                          {b.name}
                        </td>
                        <td className="py-3 text-slate-500">
                          <div>{b.category}</div>
                          <div className="text-[11px] text-slate-400">{b.city}</div>
                        </td>
                        <td className="py-3 font-mono text-[11px] text-slate-500">
                          {b.ownerEmail || '—'}
                        </td>
                        <td className="py-3 text-right">
                          {b.googleReviewUrl ? (
                            <a
                              href={b.googleReviewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#1A73E8] hover:underline font-semibold text-[11px]"
                            >
                              <span>Inspect</span>
                              <span className="material-symbols-outlined text-[13px]">
                                open_in_new
                              </span>
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Right Column: Recent Scans & Security Status (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Recent Scans Activity */}
            <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0B1C30]">
                    Recent Touchpoint Scans
                  </h2>
                  <p className="text-xs text-slate-500">
                    Latest customer scan events
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[11px]">
                  {metrics.recentScans.length} recent
                </span>
              </div>

              {metrics.recentScans.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No scan events recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.recentScans.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                          qr_code_scanner
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800">
                            Scan Event
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            QR: {String(s.qrCodeId).slice(0, 8)}…
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(s.scannedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Admin Security & Account Details */}
            <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#0B1C30]">
                Admin Security &amp; Identity
              </h2>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Admin Email</span>
                  <span className="font-bold text-slate-800">{userEmail}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">User ID</span>
                  <span className="font-mono text-[11px] text-slate-700 truncate max-w-[190px]">
                    {userId}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Authorization Source</span>
                  <span className="font-mono text-[11px] text-emerald-700 font-bold">
                    platform_super_admins
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Assurance Level</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    AAL2 (TOTP Active)
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">2FA Method</span>
                  <span className="font-medium text-slate-800">
                    Google / Microsoft Authenticator
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/admin/setup-2fa"
                  className="w-full h-9 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    key
                  </span>
                  <span>Reconfigure / Add Authenticator</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

