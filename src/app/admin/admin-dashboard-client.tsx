'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { PlatformOverviewMetrics, AdminQrCodeItem } from '@/lib/auth/super-admin';

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
  const [qrs, setQrs] = useState<AdminQrCodeItem[]>(initialMetrics.qrCodes || []);
  const [isLoadingQrs, setIsLoadingQrs] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit QR Modal state
  const [editingQr, setEditingQr] = useState<AdminQrCodeItem | null>(null);
  const [editForm, setEditForm] = useState({
    businessName: '',
    city: '',
    category: '',
    googleReviewUrl: '',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete QR Modal state
  const [deletingQr, setDeletingQr] = useState<AdminQrCodeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status updating map
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Show toast notification
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load all user QRs from admin API
  const loadQrs = async () => {
    setIsLoadingQrs(true);
    try {
      const res = await fetch('/api/admin/qrs');
      const data = await res.json();
      if (res.ok && data.ok && Array.isArray(data.qrs)) {
        setQrs(data.qrs);
      }
    } catch (err) {
      console.error('Failed to load admin QRs:', err);
    } finally {
      setIsLoadingQrs(false);
    }
  };

  useEffect(() => {
    if (!initialMetrics.qrCodes || initialMetrics.qrCodes.length === 0) {
      void loadQrs();
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [overviewRes, qrsRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/qrs'),
      ]);

      const overviewData = await overviewRes.json();
      if (overviewRes.ok && overviewData.ok) {
        setMetrics(overviewData.metrics);
      }

      const qrsData = await qrsRes.json();
      if (qrsRes.ok && qrsData.ok && Array.isArray(qrsData.qrs)) {
        setQrs(qrsData.qrs);
      }

      showToast('Console data and analytics refreshed.');
    } catch {
      showToast('Failed to refresh data.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  // 1-Click Toggle Active / Off (archived)
  const handleToggleStatus = async (qr: AdminQrCodeItem) => {
    const newStatus = qr.status === 'active' ? 'archived' : 'active';
    const newSubStatus = newStatus === 'active' ? 'active' : 'expired';
    setUpdatingId(qr.id);

    try {
      const res = await fetch(`/api/admin/qrs/${encodeURIComponent(qr.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, subscriptionStatus: newSubStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to update status.');
      }

      setQrs((prev) =>
        prev.map((item) =>
          item.id === qr.id
            ? { ...item, status: newStatus, subscriptionStatus: newSubStatus }
            : item
        )
      );

      showToast(
        newStatus === 'active'
          ? `Activated "${qr.business.name}". Review flow is LIVE.`
          : `Deactivated "${qr.business.name}". Review flow is STOPPED.`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Change Subscription Status Dropdown
  const handleChangeSubscription = async (qr: AdminQrCodeItem, newSubStatus: string) => {
    setUpdatingId(qr.id);
    const newStatus = newSubStatus === 'expired' || newSubStatus === 'suspended' ? 'archived' : 'active';

    try {
      const res = await fetch(`/api/admin/qrs/${encodeURIComponent(qr.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          subscriptionStatus: newSubStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to update subscription status.');
      }

      setQrs((prev) =>
        prev.map((item) =>
          item.id === qr.id
            ? {
                ...item,
                status: newStatus,
                subscriptionStatus: newSubStatus as 'active' | 'trial' | 'expired' | 'suspended',
              }
            : item
        )
      );

      showToast(
        `Subscription for "${qr.business.name}" set to ${newSubStatus.toUpperCase()} (${newStatus === 'active' ? 'Review flow LIVE' : 'Review flow HALTED'}).`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Open Edit Modal
  const openEditModal = (qr: AdminQrCodeItem) => {
    setEditingQr(qr);
    setEditForm({
      businessName: qr.business.name || '',
      city: qr.business.city || '',
      category: qr.business.category || 'General',
      googleReviewUrl: qr.business.googleReviewUrl || '',
    });
  };

  // Save QR & Business Edits
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQr) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/qrs/${encodeURIComponent(editingQr.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to save edits.');
      }

      setQrs((prev) =>
        prev.map((item) =>
          item.id === editingQr.id
            ? {
                ...item,
                business: {
                  ...item.business,
                  name: editForm.businessName,
                  city: editForm.city,
                  category: editForm.category,
                  googleReviewUrl: editForm.googleReviewUrl,
                },
              }
            : item
        )
      );

      setEditingQr(null);
      showToast(`Updated details for "${editForm.businessName}".`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete User QR
  const handleDeleteQr = async () => {
    if (!deletingQr) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/qrs/${encodeURIComponent(deletingQr.id)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to delete QR.');
      }

      setQrs((prev) => prev.filter((item) => item.id !== deletingQr.id));
      setDeletingQr(null);
      showToast(`Deleted QR for "${deletingQr.business.name}". Review flow has been permanently stopped.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete QR', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered QR List
  const filteredQrs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return qrs.filter((item) => {
      // Status filter
      if (statusFilter === 'active' && item.status !== 'active') return false;
      if (statusFilter === 'archived' && item.status !== 'archived') return false;
      if (statusFilter === 'expired' && item.subscriptionStatus !== 'expired' && item.subscriptionStatus !== 'suspended') {
        return false;
      }

      // Search query
      if (!q) return true;
      return (
        item.business.name.toLowerCase().includes(q) ||
        item.business.city.toLowerCase().includes(q) ||
        item.business.category.toLowerCase().includes(q) ||
        item.token.toLowerCase().includes(q) ||
        (item.placementName && item.placementName.toLowerCase().includes(q))
      );
    });
  }, [qrs, statusFilter, searchQuery]);

  // Aggregate Category Breakdown
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of qrs) {
      const cat = item.business.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [qrs]);

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-[#0B1C30] flex flex-col font-sans selection:bg-blue-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950 text-emerald-200 border-emerald-700'
                : 'bg-red-950 text-red-200 border-red-700'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {toastMessage.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Super Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0B132B] text-white px-4 md:px-8 py-3.5 border-b border-slate-800 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#005BBF] to-[#1A73E8] flex items-center justify-center font-black text-sm text-white shadow-md shadow-blue-500/20">
            R
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-tight text-white leading-tight">
                REVELY
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800 text-[10px] font-bold tracking-wider">
                Super Admin Console
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Platform Governance · Total QR &amp; Review Lifecycle Control
            </span>
          </div>
        </div>

        {/* Right Admin Controls */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] text-slate-300 font-medium truncate max-w-[170px]">
              {userEmail}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[9px] font-bold border border-emerald-800/80 uppercase">
              AAL2 Verified
            </span>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Refresh All Analytics"
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
            className="px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/60 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Dashboard View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Governance Notice & Subscription Enforcement Rule */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-transparent border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1A73E8] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            </div>
            <div>
              <span className="font-bold">Total Platform Administration: </span>
              <span className="text-slate-700">
                You have full governance over all user-created touchpoints. Deactivating or deleting any QR immediately stops the customer scan and review flow.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full shrink-0 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Real-time Gatekeeper Active</span>
          </div>
        </div>

        {/* 1. Dynamic & Animated KPI Analytics Cards */}
        <section aria-label="Platform Analytics">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* KPI 1: Total QRs Generated */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Total QRs Generated
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                  </div>
                </div>
                <p className="text-3xl font-black text-[#0B1C30] tracking-tight">
                  {metrics.totalQrCodes}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {metrics.activeQrCodes} Active
                </span>
                <span className="text-slate-400">
                  {metrics.inactiveQrCodes} Paused
                </span>
              </div>
            </div>

            {/* KPI 2: Total Physical Scans */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Physical Scans
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                  </div>
                </div>
                <p className="text-3xl font-black text-[#1A73E8] tracking-tight">
                  {metrics.totalScans}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                Customer camera touchpoints
              </div>
            </div>

            {/* KPI 3: Google Review Handoffs */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Google Handoffs
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[16px]">rate_review</span>
                  </div>
                </div>
                <p className="text-3xl font-black text-emerald-700 tracking-tight">
                  {metrics.totalDestinationClicks}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                Tapped &ldquo;Go to Google&rdquo;
              </div>
            </div>

            {/* KPI 4: Handoff Conversion Rate */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Handoff Rate
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[16px]">insights</span>
                  </div>
                </div>
                <p className="text-3xl font-black text-amber-600 tracking-tight">
                  {metrics.conversionRate}%
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(metrics.conversionRate, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* KPI 5: Registered Businesses */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Businesses
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[16px]">storefront</span>
                  </div>
                </div>
                <p className="text-3xl font-black text-[#0B1C30] tracking-tight">
                  {metrics.totalBusinesses}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                {metrics.totalUsers} registered users
              </div>
            </div>
          </div>
        </section>

        {/* 2. Dynamic & Animated Visualizations: Timeline & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Animated Scan Timeline Chart (7 cols) */}
          <section className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-[#0B1C30] tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1A73E8] text-lg">show_chart</span>
                  <span>Physical Touchpoint Activity Timeline</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Daily customer scan events across all touchpoints
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1A73E8] text-[11px] font-bold border border-blue-200">
                Live Telemetry
              </span>
            </div>

            {/* Animated SVG Chart */}
            <div className="h-48 w-full flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
              {metrics.scanTimeline && metrics.scanTimeline.length > 0 ? (
                (() => {
                  const timeline = metrics.scanTimeline;
                  const maxCount = Math.max(...timeline.map((t) => t.scans), 1);
                  return timeline.map((item, idx) => {
                    const heightPercent = Math.max(Math.round((item.scans / maxCount) * 100), 12);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold text-[#1A73E8]">
                          {item.scans}
                        </div>
                        <div
                          className="w-full max-w-[36px] rounded-t-xl bg-gradient-to-t from-blue-600 to-[#1A73E8] transition-all duration-700 ease-out group-hover:from-blue-700 group-hover:to-blue-500 shadow-sm"
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[45px]">
                          {item.date.slice(5)}
                        </span>
                      </div>
                    );
                  });
                })()
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-400 gap-1.5">
                  <span className="material-symbols-outlined text-3xl text-slate-300">timeline</span>
                  <span>Telemetry scans will appear here dynamically as users scan posters.</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Past 14 Days</span>
              <span className="text-emerald-700 font-semibold">100% Client-side tracking active</span>
            </div>
          </section>

          {/* Dynamic Category Distribution (5 cols) */}
          <section className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-[#0B1C30] tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600 text-lg">pie_chart</span>
                  <span>Category Distribution</span>
                </h2>
                <p className="text-xs text-slate-500">Breakdown of created QR touchpoints</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600">
                {qrs.length} Total
              </span>
            </div>

            <div className="space-y-3.5 pt-2">
              {categoryCounts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No touchpoint categories found.
                </div>
              ) : (
                categoryCounts.map(([catName, count], idx) => {
                  const pct = qrs.length > 0 ? Math.round((count / qrs.length) * 100) : 0;
                  const colors = ['bg-[#1A73E8]', 'bg-indigo-600', 'bg-emerald-600', 'bg-amber-500', 'bg-purple-600'];
                  const color = colors[idx % colors.length];

                  return (
                    <div key={catName} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800">{catName}</span>
                        <span className="text-slate-500 font-mono">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${color} h-2 rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* 3. User QR Management Console (NO CREATE QR BUTTON - PURE ADMINISTRATION) */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#0B1C30] tracking-tight">
                  User Created QR Codes Management
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                  {filteredQrs.length} touchpoints
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Full administrative authority: Toggle active status, control subscription lifecycle, edit business review URLs, or purge codes.
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
              {/* Search */}
              <div className="relative min-w-[200px]">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by business, city, or token…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center p-0.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    statusFilter === 'all' ? 'bg-white text-[#0B1C30] shadow-xs' : 'hover:text-[#0B1C30]'
                  }`}
                >
                  All ({qrs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-emerald-700'
                  }`}
                >
                  Active ({qrs.filter((q) => q.status === 'active').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('archived')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    statusFilter === 'archived' ? 'bg-white text-slate-800 shadow-xs' : 'hover:text-slate-800'
                  }`}
                >
                  Paused / Off ({qrs.filter((q) => q.status !== 'active').length})
                </button>
              </div>
            </div>
          </div>

          {/* Table of User QRs */}
          {isLoadingQrs ? (
            <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-3xl text-[#1A73E8] animate-spin">
                sync
              </span>
              <span>Loading user-created QR touchpoints...</span>
            </div>
          ) : filteredQrs.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-4xl text-slate-300">
                qr_code_scanner
              </span>
              <span className="font-semibold text-slate-600">No QR codes found</span>
              <span className="text-[11px]">
                {searchQuery ? 'Try clearing your search query.' : 'No user-created QR codes exist in the database.'}
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-[11px] font-bold uppercase text-slate-400">
                    <th className="pb-3 font-bold">Business &amp; Touchpoint</th>
                    <th className="pb-3 font-bold">Category &amp; City</th>
                    <th className="pb-3 font-bold text-center">Scans</th>
                    <th className="pb-3 font-bold text-center">Active Status (ON/OFF)</th>
                    <th className="pb-3 font-bold">Subscription Lifecycle</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredQrs.map((item) => {
                    const isActive = item.status === 'active';
                    const isUpdating = updatingId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* 1. Business & Touchpoint */}
                        <td className="py-4 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#1A73E8] shrink-0 font-bold overflow-hidden">
                              {item.business.logoUrl ? (
                                <img
                                  src={item.business.logoUrl}
                                  alt={item.business.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-base">store</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-extrabold text-[#0B1C30] text-sm truncate max-w-[200px]">
                                {item.business.name}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                <span>Token: {item.token.slice(0, 8)}…</span>
                                <Link
                                  href={`/qr/${encodeURIComponent(item.token)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#1A73E8] hover:underline"
                                  title="Test Customer Journey"
                                >
                                  [Test Flow ↗]
                                </Link>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Category & City */}
                        <td className="py-4">
                          <div className="font-semibold text-slate-800">{item.business.category}</div>
                          <div className="text-[11px] text-slate-500">
                            {item.business.city || 'No city specified'}
                          </div>
                        </td>

                        {/* 3. Scans */}
                        <td className="py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[#1A73E8] font-mono font-bold text-xs border border-blue-100">
                            <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
                            <span>{item.scanCount}</span>
                          </span>
                        </td>

                        {/* 4. Active Switch (ON / OFF) */}
                        <td className="py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            disabled={isUpdating}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300'
                            }`}
                            title={isActive ? 'Click to Turn OFF (Halt Review Flow)' : 'Click to Turn ON (Resume Flow)'}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isActive ? 'bg-emerald-600 animate-pulse' : 'bg-slate-500'
                              }`}
                            ></span>
                            <span>{isActive ? 'ACTIVE (ON)' : 'PAUSED (OFF)'}</span>
                          </button>
                        </td>

                        {/* 5. Subscription Status Dropdown */}
                        <td className="py-4">
                          <select
                            value={item.subscriptionStatus || (isActive ? 'active' : 'expired')}
                            onChange={(e) => handleChangeSubscription(item, e.target.value)}
                            disabled={isUpdating}
                            className="h-8 px-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                          >
                            <option value="active">🟢 Active Subscription</option>
                            <option value="trial">🔵 14-Day Free Trial</option>
                            <option value="expired">🔴 Expired (Review Halted)</option>
                            <option value="suspended">⛔ Suspended (Review Halted)</option>
                          </select>
                        </td>

                        {/* 6. Admin Actions (Edit / Delete / Review Destination) */}
                        <td className="py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                              title="Edit Business Details"
                            >
                              <span className="material-symbols-outlined text-[15px]">edit</span>
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingQr(item)}
                              className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors flex items-center gap-1"
                              title="Delete QR Code Permanently"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Edit QR Modal */}
      {editingQr && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1A73E8] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">edit</span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0B1C30]">
                    Edit User QR Code
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Token: {editingQr.token}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingQr(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.businessName}
                  onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Google Review URL Destination
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://g.page/r/.../review"
                  value={editForm.googleReviewUrl}
                  onChange={(e) => setEditForm({ ...editForm, googleReviewUrl: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Must be a secure HTTPS Google Maps or Google Business link.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingQr(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {isSavingEdit ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      <span>Saving…</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingQr && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 animate-scale-in text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#0B1C30]">
                Delete QR Code Permanently?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You are about to permanently delete the touchpoint for <strong className="text-slate-900">{deletingQr.business.name}</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50/80 border border-red-200/80 text-left text-[11px] text-red-800 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>Immediate Customer Impact:</span>
              </p>
              <p>
                All existing physical scans and the review flow URL (<code>/qr/{deletingQr.token.slice(0, 8)}…</code>) will immediately stop working and return &ldquo;QR Code Not Found&rdquo;.
              </p>
            </div>

            <div className="pt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingQr(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteQr}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    <span>Deleting…</span>
                  </>
                ) : (
                  <span>Yes, Delete Touchpoint</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
