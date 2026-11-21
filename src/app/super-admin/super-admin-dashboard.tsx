'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { PlatformOverviewMetrics, AdminQrCodeItem } from '@/lib/auth/super-admin';

export interface SuperAdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  businessCount: number;
  businesses: string[];
  createdAt: string;
  status: string;
}

interface SuperAdminDashboardProps {
  userEmail: string;
  userId: string;
  initialMetrics: PlatformOverviewMetrics;
}

export default function SuperAdminDashboard({
  userEmail,
  userId,
  initialMetrics,
}: SuperAdminDashboardProps) {
  const router = useRouter();
  const [metrics, setMetrics] = useState<PlatformOverviewMetrics>(initialMetrics);
  const [qrs, setQrs] = useState<AdminQrCodeItem[]>(initialMetrics.qrCodes || []);
  const [users, setUsers] = useState<SuperAdminUserItem[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'qrs' | 'users'>('analytics');

  const [isLoadingQrs, setIsLoadingQrs] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived' | 'expired'>('all');

  // Edit Modal State
  const [editingQr, setEditingQr] = useState<AdminQrCodeItem | null>(null);
  const [editForm, setEditForm] = useState({
    businessName: '',
    city: '',
    category: '',
    googleReviewUrl: '',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Modal State
  const [deletingQr, setDeletingQr] = useState<AdminQrCodeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Revoke Modal State
  const [revokingQr, setRevokingQr] = useState<AdminQrCodeItem | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load all user QRs
  const loadQrs = async () => {
    setIsLoadingQrs(true);
    try {
      const res = await fetch('/api/super-admin/qrs');
      const data = await res.json();
      if (res.ok && data.ok && Array.isArray(data.qrs)) {
        setQrs(data.qrs);
      }
    } catch (err) {
      console.error('Failed to load QRs:', err);
    } finally {
      setIsLoadingQrs(false);
    }
  };

  // Load all registered users
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/super-admin/users');
      const data = await res.json();
      if (res.ok && data.ok && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!initialMetrics.qrCodes || initialMetrics.qrCodes.length === 0) {
      void loadQrs();
    }
    void loadUsers();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [overviewRes, qrsRes, usersRes] = await Promise.all([
        fetch('/api/super-admin/overview'),
        fetch('/api/super-admin/qrs'),
        fetch('/api/super-admin/users'),
      ]);

      const [overviewData, qrsData, usersData] = await Promise.all([
        overviewRes.json(),
        qrsRes.json(),
        usersRes.json(),
      ]);

      if (overviewRes.ok && overviewData.ok) setMetrics(overviewData.metrics);
      if (qrsRes.ok && qrsData.ok && Array.isArray(qrsData.qrs)) setQrs(qrsData.qrs);
      if (usersRes.ok && usersData.ok && Array.isArray(usersData.users)) setUsers(usersData.users);

      showToast('Super Admin telemetry and live registries refreshed.');
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
      const res = await fetch(`/api/super-admin/qrs/${encodeURIComponent(qr.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, subscriptionStatus: newSubStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to update status.');

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
          : `Deactivated "${qr.business.name}". Review flow is HALTED.`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Change Subscription Status
  const handleChangeSubscription = async (qr: AdminQrCodeItem, newSubStatus: string) => {
    setUpdatingId(qr.id);
    const newStatus =
      newSubStatus === 'expired' || newSubStatus === 'suspended' ? 'archived' : 'active';

    try {
      const res = await fetch(`/api/super-admin/qrs/${encodeURIComponent(qr.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          subscriptionStatus: newSubStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to update subscription.');

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
        `Subscription for "${qr.business.name}" set to ${newSubStatus.toUpperCase()} (${newStatus === 'active' ? 'Live Flow' : 'Halted Flow'}).`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Revoke QR Token
  const handleRevokeQr = async () => {
    if (!revokingQr) return;
    setIsRevoking(true);

    try {
      const res = await fetch(`/api/super-admin/qrs/${encodeURIComponent(revokingQr.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revoke: true, status: 'archived', subscriptionStatus: 'suspended' }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to revoke token.');

      setQrs((prev) =>
        prev.map((item) =>
          item.id === revokingQr.id
            ? { ...item, status: 'archived', subscriptionStatus: 'suspended' }
            : item
        )
      );

      setRevokingQr(null);
      showToast(`Token for "${revokingQr.business.name}" has been REVOKED. Scans and reviews are stopped.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Revoke failed', 'error');
    } finally {
      setIsRevoking(false);
    }
  };

  // Edit Modal Open & Save
  const openEditModal = (qr: AdminQrCodeItem) => {
    setEditingQr(qr);
    setEditForm({
      businessName: qr.business.name || '',
      city: qr.business.city || '',
      category: qr.business.category || 'General',
      googleReviewUrl: qr.business.googleReviewUrl || '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQr) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/super-admin/qrs/${encodeURIComponent(editingQr.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to save changes.');

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
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete User QR Permanently
  const handleDeleteQr = async () => {
    if (!deletingQr) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/super-admin/qrs/${encodeURIComponent(deletingQr.id)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to delete QR.');

      setQrs((prev) => prev.filter((item) => item.id !== deletingQr.id));
      setDeletingQr(null);
      showToast(`Permanently deleted QR for "${deletingQr.business.name}". All future scans will return 404.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Deletion failed', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered QR List
  const filteredQrs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return qrs.filter((item) => {
      if (statusFilter === 'active' && item.status !== 'active') return false;
      if (statusFilter === 'archived' && item.status !== 'archived') return false;
      if (
        statusFilter === 'expired' &&
        item.subscriptionStatus !== 'expired' &&
        item.subscriptionStatus !== 'suspended'
      ) {
        return false;
      }

      if (!q) return true;
      return (
        item.business.name.toLowerCase().includes(q) ||
        item.business.city.toLowerCase().includes(q) ||
        item.business.category.toLowerCase().includes(q) ||
        item.token.toLowerCase().includes(q)
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
    <div className="min-h-screen bg-[#060B14] text-slate-100 flex flex-col font-sans selection:bg-[#0284C7] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-600'
                : 'bg-red-950/90 text-red-200 border-red-600'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {toastMessage.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Executive Header */}
      <header className="sticky top-0 z-40 bg-[#0B132B]/95 backdrop-blur-xl px-4 md:px-8 py-3.5 border-b border-slate-800 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] flex items-center justify-center font-black text-sm text-white shadow-lg shadow-sky-500/20">
            R
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-tight text-white leading-tight">
                Revvly
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-bold uppercase tracking-wider">
                Super Admin
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Global Platform Governance &amp; QR Subscription Control
            </span>
          </div>
        </div>

        {/* Right Admin Controls */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] text-slate-300 font-medium truncate max-w-[170px]">
              {userEmail}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[9px] font-bold border border-emerald-800 uppercase">
              AAL2 Verified
            </span>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            title="Refresh All Registries"
          >
            <span
              className={`material-symbols-outlined text-[16px] ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              refresh
            </span>
            <span className="hidden md:inline">Sync Live</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Modern Tab Bar */}
      <div className="bg-[#0B132B]/60 border-b border-slate-800/80 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`py-3.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">insights</span>
            <span>Analytics &amp; Telemetry</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qrs')}
            className={`py-3.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'qrs'
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">qr_code_2</span>
            <span>QR Touchpoints &amp; Subscriptions ({qrs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`py-3.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">group</span>
            <span>User Accounts &amp; Owners ({users.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* TAB 1: ANALYTICS & TELEMETRY */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Metric Cards */}
            <section aria-label="Executive Metrics">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Total QRs */}
                <div className="p-5 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Total Touchpoints
                    </span>
                    <p className="text-3xl font-black text-white">{metrics.totalQrCodes}</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-semibold">{metrics.activeQrCodes} Active</span>
                    <span className="text-slate-500">{metrics.inactiveQrCodes} Paused</span>
                  </div>
                </div>

                {/* 2. Total Scans */}
                <div className="p-5 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Camera Scans
                    </span>
                    <p className="text-3xl font-black text-[#38BDF8]">{metrics.totalScans}</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400">
                    Live physical telemetry
                  </div>
                </div>

                {/* 3. Google Handoffs */}
                <div className="p-5 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Google Review Taps
                    </span>
                    <p className="text-3xl font-black text-emerald-400">{metrics.totalDestinationClicks}</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400">
                    Handoff to Google Maps
                  </div>
                </div>

                {/* 4. Conversion Rate */}
                <div className="p-5 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Handoff Conversion
                    </span>
                    <p className="text-3xl font-black text-amber-400">{metrics.conversionRate}%</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-800">
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-1.5 rounded-full"
                        style={{ width: `${Math.min(metrics.conversionRate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 5. Registered Accounts */}
                <div className="p-5 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Businesses &amp; Users
                    </span>
                    <p className="text-3xl font-black text-purple-400">{metrics.totalBusinesses}</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400">
                    {metrics.totalUsers} registered users
                  </div>
                </div>
              </div>
            </section>

            {/* Dynamic Telemetry Graph & Category Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Scan Activity Timeline (7 cols) */}
              <section className="lg:col-span-7 bg-[#0F172A] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#38BDF8] text-lg">timeline</span>
                      <span>Scan Activity Telemetry</span>
                    </h2>
                    <p className="text-xs text-slate-400">Daily physical scan interactions</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-400 text-[10px] font-bold border border-sky-800">
                    Live Stream
                  </span>
                </div>

                <div className="h-48 w-full flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
                  {metrics.scanTimeline && metrics.scanTimeline.length > 0 ? (
                    (() => {
                      const timeline = metrics.scanTimeline;
                      const maxCount = Math.max(...timeline.map((t) => t.scans), 1);
                      return timeline.map((item, idx) => {
                        const heightPercent = Math.max(Math.round((item.scans / maxCount) * 100), 12);
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold text-[#38BDF8]">
                              {item.scans}
                            </div>
                            <div
                              className="w-full max-w-[36px] rounded-t-xl bg-gradient-to-t from-sky-600 to-[#38BDF8] transition-all duration-700 ease-out group-hover:from-sky-500 group-hover:to-sky-400 shadow-sm"
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
                    <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-500 gap-1.5">
                      <span className="material-symbols-outlined text-3xl text-slate-600">query_stats</span>
                      <span>Telemetry points will populate dynamically as physical posters are scanned.</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Category Breakdown (5 cols) */}
              <section className="lg:col-span-5 bg-[#0F172A] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-400 text-lg">donut_large</span>
                      <span>Category Distribution</span>
                    </h2>
                    <p className="text-xs text-slate-400">Touchpoints segmented by industry</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">{qrs.length} Total</span>
                </div>

                <div className="space-y-3.5 pt-2">
                  {categoryCounts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">No categories recorded yet.</div>
                  ) : (
                    categoryCounts.map(([catName, count], idx) => {
                      const pct = qrs.length > 0 ? Math.round((count / qrs.length) * 100) : 0;
                      const colors = ['bg-[#0284C7]', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-400', 'bg-purple-500'];
                      const color = colors[idx % colors.length];

                      return (
                        <div key={catName} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-300">{catName}</span>
                            <span className="text-slate-400 font-mono">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* TAB 2: QR TOUCHPOINTS & SUBSCRIPTION CONTROLS */}
        {activeTab === 'qrs' && (
          <section className="bg-[#0F172A] rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#38BDF8]">tune</span>
                  <span>QR Touchpoints &amp; Subscription Governance</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full authority: 1-click active toggles, subscription lifecycle management, token revocation, editing, or purging.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                <div className="relative min-w-[220px]">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name, city, or token…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-8 pr-3 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
                  />
                </div>

                <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      statusFilter === 'all' ? 'bg-[#0284C7] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({qrs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      statusFilter === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Active ({qrs.filter((q) => q.status === 'active').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('archived')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      statusFilter === 'archived' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Paused ({qrs.filter((q) => q.status !== 'active').length})
                  </button>
                </div>
              </div>
            </div>

            {/* QRs Table */}
            {isLoadingQrs ? (
              <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-3xl text-[#38BDF8] animate-spin">sync</span>
                <span>Loading QR touchpoints...</span>
              </div>
            ) : filteredQrs.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500">No QR codes found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-3">Business &amp; Touchpoint</th>
                      <th className="pb-3">Category &amp; Location</th>
                      <th className="pb-3 text-center">Scans</th>
                      <th className="pb-3 text-center">Live Status</th>
                      <th className="pb-3">Subscription Lifecycle</th>
                      <th className="pb-3 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {filteredQrs.map((item) => {
                      const isActive = item.status === 'active';
                      const isUpdating = updatingId === item.id;

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* 1. Business */}
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-bold overflow-hidden shrink-0">
                                {item.business.logoUrl ? (
                                  <img
                                    src={item.business.logoUrl}
                                    alt={item.business.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="material-symbols-outlined text-base">storefront</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-white text-sm truncate max-w-[190px]">
                                  {item.business.name}
                                </div>
                                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                                  <span>{item.token.slice(0, 8)}…</span>
                                  <Link
                                    href={`/qr/${encodeURIComponent(item.token)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#38BDF8] hover:underline"
                                    title="Test Review Flow"
                                  >
                                    [Test Flow ↗]
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Category & Location */}
                          <td className="py-3.5">
                            <div className="font-semibold text-slate-200">{item.business.category}</div>
                            <div className="text-[11px] text-slate-400">{item.business.city || '—'}</div>
                          </td>

                          {/* 3. Scans */}
                          <td className="py-3.5 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-950 text-sky-300 font-mono font-bold text-xs border border-sky-800">
                              <span className="material-symbols-outlined text-[13px]">qr_code_scanner</span>
                              <span>{item.scanCount}</span>
                            </span>
                          </td>

                          {/* 4. Active Switch */}
                          <td className="py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item)}
                              disabled={isUpdating}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                isActive
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700 hover:bg-emerald-900/80'
                                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                                }`}
                              ></span>
                              <span>{isActive ? 'ACTIVE' : 'PAUSED'}</span>
                            </button>
                          </td>

                          {/* 5. Subscription Status Dropdown */}
                          <td className="py-3.5">
                            <select
                              value={item.subscriptionStatus || (isActive ? 'active' : 'expired')}
                              onChange={(e) => handleChangeSubscription(item, e.target.value)}
                              disabled={isUpdating}
                              className="h-8 px-2.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
                            >
                              <option value="active">🟢 Active Subscription</option>
                              <option value="trial">🔵 14-Day Free Trial</option>
                              <option value="lifetime">🟣 Lifetime Access</option>
                              <option value="expired">🔴 Expired (Flow Halted)</option>
                              <option value="suspended">⛔ Suspended (Flow Halted)</option>
                            </select>
                          </td>

                          {/* 6. Admin Actions (Edit / Revoke / Delete) */}
                          <td className="py-3.5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1 border border-slate-700"
                                title="Edit Details"
                              >
                                <span className="material-symbols-outlined text-[14px]">edit</span>
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setRevokingQr(item)}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 text-xs font-bold transition-colors flex items-center gap-1 border border-amber-800/60"
                                title="Revoke Token Access"
                              >
                                <span className="material-symbols-outlined text-[14px]">block</span>
                                <span>Revoke</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeletingQr(item)}
                                className="px-2.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 text-xs font-bold transition-colors flex items-center gap-1 border border-red-800/60"
                                title="Purge Touchpoint"
                              >
                                <span className="material-symbols-outlined text-[14px]">delete</span>
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
        )}

        {/* TAB 3: USER ACCOUNTS & OWNERS */}
        {activeTab === 'users' && (
          <section className="bg-[#0F172A] rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-400">badge</span>
                  <span>Registered Accounts &amp; Touchpoint Owners</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Platform users, profile roles, and assigned businesses.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-300">
                {users.length} Registered Accounts
              </span>
            </div>

            {isLoadingUsers ? (
              <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-3xl text-purple-400 animate-spin">sync</span>
                <span>Loading users directory...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500">No registered users in registry.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-3">User &amp; Email</th>
                      <th className="pb-3">Role / Super Admin</th>
                      <th className="pb-3">Businesses Owned</th>
                      <th className="pb-3">Registered Date</th>
                      <th className="pb-3 text-right">Account Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5">
                          <div className="font-bold text-white text-sm">{u.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">{u.email}</div>
                        </td>
                        <td className="py-3.5">
                          {u.isSuperAdmin ? (
                            <span className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-700 text-[10px] font-bold uppercase">
                              Super Admin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                              {u.role}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5">
                          <div className="font-semibold text-slate-200">
                            {u.businessCount} {u.businessCount === 1 ? 'business' : 'businesses'}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[220px]">
                            {u.businesses.join(', ') || 'No business assigned'}
                          </div>
                        </td>
                        <td className="py-3.5 font-mono text-slate-400 text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      {/* EDIT MODAL */}
      {editingQr && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F172A] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#38BDF8]">edit</span>
                <span>Edit QR Touchpoint Details</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingQr(null)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={editForm.businessName}
                  onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">City / Location</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Google Review URL</label>
                <input
                  type="url"
                  required
                  value={editForm.googleReviewUrl}
                  onChange={(e) => setEditForm({ ...editForm, googleReviewUrl: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingQr(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-sky-600 text-white font-bold transition-colors flex items-center gap-1.5"
                >
                  {isSavingEdit ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVOKE CONFIRMATION MODAL */}
      {revokingQr && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F172A] rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-800/80 space-y-4 text-center animate-scale-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-950/60 text-amber-400 border border-amber-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">gpp_maybe</span>
            </div>
            <h3 className="text-lg font-black text-white">Revoke Touchpoint Access?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Revoking token for <strong className="text-white">{revokingQr.business.name}</strong> will immediately halt all customer review flows and scans.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setRevokingQr(null)}
                disabled={isRevoking}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevokeQr}
                disabled={isRevoking}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                {isRevoking ? 'Revoking…' : 'Yes, Revoke Token'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingQr && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F172A] rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-800/80 space-y-4 text-center animate-scale-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-950/60 text-red-400 border border-red-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
            </div>
            <h3 className="text-lg font-black text-white">Permanently Delete QR Touchpoint?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deleting touchpoint for <strong className="text-white">{deletingQr.business.name}</strong> will permanently remove all historical scans and render the physical QR completely inactive.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingQr(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteQr}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                {isDeleting ? 'Deleting…' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
