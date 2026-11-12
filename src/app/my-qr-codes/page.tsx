'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getStoredQRCodes, deleteQRCode } from '@/lib/data-store';
import { QRCode } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { validateReviewDestination } from '@/lib/review-destination';

export default function MyQRCodesPage() {
  const [qrs, setQrs] = useState<QRCode[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!isSupabaseConfigured) {
      setQrs(getStoredQRCodes());
      setIsLoading(false);
      return;
    }

    void fetch('/api/qr')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !Array.isArray(result.qrs)) {
          throw new Error(result.message || result.code || 'Could not load your QR designs.');
        }
        return result.qrs as QRCode[];
      })
      .then((result) => {
        if (!cancelled) setQrs(result);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Could not load your QR designs.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete touchpoint "${name}"?`)) return;
    try {
      if (isSupabaseConfigured) {
        const response = await fetch(`/api/qr/${encodeURIComponent(id)}`, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || result.code || 'QR deletion failed.');
      } else {
        deleteQRCode(id);
      }
      setQrs((current) => current.filter((qr) => qr.id !== id));
      showToast(`Deleted "${name}".`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'QR deletion failed.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const filteredQrs = qrs.filter((qr) => {
    const pName = qr.placementName || qr.placementType || '';
    const matchesSearch =
      pName.toLowerCase().includes(search.toLowerCase()) ||
      qr.businessName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || qr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = qrs.filter((q) => q.status === 'active').length;

  return (
    <DashboardShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0B1C30] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up">
            <span className="material-symbols-outlined text-green-400 text-xl">check_circle</span>
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Top Header & Action Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-[#1A73E8] font-bold uppercase tracking-wider mb-1">
              <span>Workspace</span>
              <span className="text-slate-300">/</span>
              <span>QR Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1C30] tracking-tight">
              My QR Codes
            </h1>
            <p className="text-sm text-[#414754] mt-1">
              {isSupabaseConfigured
                ? 'Review QR designs saved to your authenticated account.'
                : 'Review QR designs saved in this browser only.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/create-qr"
              className="h-11 px-5 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>+ Create New QR Code</span>
            </Link>          </div>
        </div>

        {/* 4 Bento KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bento 1 */}
          <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#565E74]">Total QR Codes</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">qr_code_2</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#0B1C30]">{qrs.length}</span>
              <span className="text-xs text-slate-500 font-semibold flex items-center">
                {isSupabaseConfigured ? 'Saved to your account' : 'Saved in this browser only'}
              </span>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              {isSupabaseConfigured ? 'Owner-scoped Supabase persistence.' : 'QR design persistence is browser-local.'}
            </p>
          </div>

          {/* Bento 2 */}
          <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#565E74]">Active QR Codes</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                {isSupabaseConfigured ? 'Account' : 'Local only'}
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#0B1C30]">{activeCount}</span>
              <span className="text-xs text-[#565E74]">of {qrs.length} saved</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold mt-4">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>{isSupabaseConfigured ? 'Stored in your account' : 'Not synced to a database'}</span>
            </div>
          </div>

          {/* Bento 3 */}
          <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#565E74]">Scan analytics</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">visibility</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#0B1C30]">—</span>
              <span className="text-xs text-slate-500 font-semibold">Unavailable</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
              <span>Owner-scoped totals are shown in Analytics.</span>
            </div>
          </div>

          {/* Bento 4 */}
          <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#565E74]">Recently Created</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">history</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-bold text-sm text-[#0B1C30] truncate">{qrs[0]?.placementName || '—'}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {qrs[0]?.createdAt ? `Created ${new Date(qrs[0].createdAt).toLocaleDateString()}` : 'No QR codes created yet'}
              </div>
            </div>
            <div className="pt-3 flex items-center justify-between text-xs text-[#1A73E8] font-semibold">
              <span>{isSupabaseConfigured ? 'Stored in Supabase' : 'Cloud sync unavailable'}</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-lg">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search QR codes by title, location or tag..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0B1C30] focus:outline-none focus:bg-white focus:border-[#1A73E8]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0B1C30] focus:outline-none"
            >
              <option value="all">All Statuses ({qrs.length})</option>
              <option value="active">Active ({activeCount})</option>
              <option value="draft">Draft / Inactive ({qrs.length - activeCount})</option>
            </select>

            <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white text-[#1A73E8] shadow-sm' : 'text-slate-500'}`}
                title="Grid View"
              >
                <span className="material-symbols-outlined text-lg">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white text-[#1A73E8] shadow-sm' : 'text-slate-500'}`}
                title="List View"
              >
                <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
              </button>
            </div>
          </div>
        </div>

        {/* QR Codes Grid */}
        {loadError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {loadError}
          </div>
        )}
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
            Loading your QR designs…
          </div>
        ) : !loadError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQrs.map((qr) => (
            <div
              key={qr.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      qr.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {qr.status}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">/{qr.slug}</span>
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 shrink-0">
                    <span className="material-symbols-outlined text-4xl text-[#0B1C30]">qr_code_2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0B1C30] leading-snug">{qr.placementName}</h3>
                    <p className="text-xs text-[#565E74] mt-0.5">{qr.businessName}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-1">
                      {qr.headline || 'Review us on Google'}
                    </p>
                  </div>
                </div>

                {/* Telemetry Numbers */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-50 rounded-xl mb-4 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">SCANS</span>
                    <span className="text-xs font-bold text-[#0B1C30]">—</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">CLICKS</span>
                    <span className="text-xs font-bold text-[#1A73E8]">—</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">RATE</span>
                    <span className="text-xs font-bold text-slate-500">—</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold">
                {(() => {
                  const isDirect = qr.destinationMode === 'direct';
                  const directUrl = isDirect && validateReviewDestination(qr.destinationUrl || '').valid
                    ? qr.destinationUrl
                    : undefined;
                  const href = isDirect
                    ? directUrl
                    : qr.publicToken
                    ? `/qr/${encodeURIComponent(qr.publicToken)}`
                    : undefined;
                  return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!href}
                  className={`text-xs ${href ? 'text-[#005BBF] hover:underline' : 'text-slate-500'}`}
                >
                  {isDirect
                    ? href ? 'Open direct review destination' : 'Review destination unavailable'
                    : href ? 'Open guided customer page' : 'Guided QR unavailable'}
                </a>
                  );
                })()}

                <div className="flex items-center gap-2">
                  <Link
                    href={`/qr-studio?edit=${encodeURIComponent(qr.id)}`}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    title="Edit in Studio"
                  >
                    <span className="material-symbols-outlined text-base">tune</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(qr.id, qr.placementName || qr.placementType || 'Stand Artwork')}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                    title="Delete QR"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
        {!isLoading && !loadError && filteredQrs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-lg font-bold text-[#0B1C30]">
              {qrs.length === 0 ? 'No QR codes created yet' : 'No QR codes match these filters'}
            </h2>
            <p className="mt-2 text-sm text-[#565E74]">
              {qrs.length === 0
                ? isSupabaseConfigured
                  ? 'Create a QR design in QR Studio. It will be saved to your authenticated account.'
                  : 'QR designs are saved in this browser and are not synced to Supabase.'
                : 'Try a different search or status filter.'}
            </p>
            {qrs.length === 0 && (
              <Link
                href="/qr-studio"
                className="mt-5 inline-flex h-10 items-center rounded-xl bg-[#1A73E8] px-4 text-xs font-semibold text-white"
              >
                Create a QR design
              </Link>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
