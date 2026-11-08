'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getAnalyticsStats, getStoredQRCodes, deleteQRCode } from '@/lib/data-store';
import { QRCode } from '@/lib/types';

export default function MyQRCodesPage() {
  const [qrs, setQrs] = useState<QRCode[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalScans: 0,
    uniqueVisitors: null as number | null,
    googleClicks: 0,
    ctr: null as string | null,
  });

  useEffect(() => {
    setQrs(getStoredQRCodes());
    setStats(getAnalyticsStats());
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete touchpoint "${name}"?`)) {
      deleteQRCode(id);
      setQrs(getStoredQRCodes());
      showToast(`Deleted "${name}".`);
    }
  };

  const handleDownload = (name: string, format: string) => {
    showToast(`Downloading high-resolution ${format.toUpperCase()} for "${name}"...`);
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
              Manage, customize, and export your physical & counter review QR touchpoints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast('Batch exporting all 6 stands as zip...')}
              className="h-11 px-4 rounded-xl bg-white border border-slate-200 text-[#0B1C30] font-semibold text-xs shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg text-slate-500">archive</span>
              <span>Batch Export</span>
            </button>
            <Link
              href="/create-qr"
              className="h-11 px-5 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>+ Create New QR Code</span>
            </Link>
          </div>
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
                Saved in this browser
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-[#1A73E8] h-full rounded-full" style={{ width: '86%' }}></div>
            </div>
          </div>

          {/* Bento 2 */}
          <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#565E74]">Active QR Codes</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                Local only
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#0B1C30]">{activeCount}</span>
              <span className="text-xs text-[#565E74]">of {qrs.length} deployed</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold mt-4">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Not synced to a database</span>
            </div>
          </div>

          {/* Bento 3 */}
          <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#565E74]">Total Scans</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">visibility</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#0B1C30]">{stats.totalScans}</span>
              <span className="text-xs text-slate-500 font-semibold">This browser only</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
              <span>Conversion: <strong className="text-[#0B1C30]">{stats.ctr === null ? '—' : `${stats.ctr}%`}</strong></span>
              <span className="text-slate-500 font-bold">Not synced</span>
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
              <div className="font-bold text-sm text-[#0B1C30] truncate">{qrs[0]?.placementName || 'Dining Stand'}</div>
              <div className="text-xs text-slate-500 mt-0.5">Created 2 days ago • Table Tent</div>
            </div>
            <div className="pt-3 flex items-center justify-between text-xs text-[#1A73E8] font-semibold">
              <span>Auto-sync connected</span>
              <span className="material-symbols-outlined text-green-600 text-base">check_circle</span>
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
                    <span className="text-xs font-bold text-[#0B1C30]">384</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">CLICKS</span>
                    <span className="text-xs font-bold text-[#1A73E8]">276</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">RATE</span>
                    <span className="text-xs font-bold text-green-700">71.8%</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold">
                <Link
                  href={`/qr/${qr.slug}`}
                  target="_blank"
                  className="text-[#1A73E8] hover:underline flex items-center gap-1"
                >
                  <span>Test Mobile</span>
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(qr.placementName || qr.placementType || 'Stand Artwork', 'png')}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    title="Download PNG"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                  </button>
                  <Link
                    href="/qr-studio"
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    title="Customize in Studio"
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
      </div>
    </DashboardShell>
  );
}
