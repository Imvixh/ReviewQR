'use client';

import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getAnalyticsStats } from '@/lib/data-store';

export default function AnalyticsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalScans: 0,
    uniqueVisitors: null as number | null,
    googleClicks: 0,
    ctr: null as string | null,
  });

  useEffect(() => {
    setStats(getAnalyticsStats());
  }, []);

  const handleExport = (format: 'CSV' | 'PDF') => {
    if (format === 'PDF') {
      window.print();
      return;
    }

    const csv = [
      'metric,value,scope',
      `scans,${stats.totalScans},this browser only`,
      `unique_visitors,not available,this browser only`,
      `google_clicks,${stats.googleClicks},this browser only`,
      `conversion_rate,${stats.ctr ?? 'not available'},this browser only`,
    ].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reviewqr-local-analytics.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setToastMessage('Browser-local analytics CSV downloaded.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <DashboardShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0B1C30] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up">
            <span className="material-symbols-outlined text-green-400 text-xl">check_circle</span>
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase text-[#1A73E8] tracking-wider">
              <span>Local browser counts</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">Not synced</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1C30] tracking-tight">
              Analytics & Conversion
            </h1>
            <p className="text-sm text-[#414754] mt-1">
              Counts include only scan and click events saved in this browser. They are not shared across devices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleExport('CSV')}
              className="h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-[#0B1C30] font-semibold text-xs shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base text-slate-500">csv</span>
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleExport('PDF')}
              className="h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-[#0B1C30] font-semibold text-xs shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base text-slate-500">picture_as_pdf</span>
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-[#565E74] uppercase tracking-wider">
              <span>Total QR Scans</span>
              <span className="material-symbols-outlined text-blue-600 text-lg">qr_code_scanner</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-[#0B1C30]">{stats.totalScans}</div>
              <div className="text-xs text-slate-500 mt-1">Saved in this browser only</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-[#565E74] uppercase tracking-wider">
              <span>Unique Visitors</span>
              <span className="material-symbols-outlined text-green-600 text-lg">group</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-[#0B1C30]">—</div>
              <div className="text-xs text-slate-500 mt-1">Unique visitors are not measured</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-[#565E74] uppercase tracking-wider">
              <span>QR-to-Google Clicks</span>
              <span className="material-symbols-outlined text-purple-600 text-lg">rate_review</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-[#0B1C30]">{stats.googleClicks}</div>
              <div className="text-xs text-slate-500 mt-1">Saved in this browser only</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-[#565E74] uppercase tracking-wider">
              <span>Conversion Rate</span>
              <span className="material-symbols-outlined text-amber-600 text-lg">conversion_path</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-[#0B1C30]">
                {stats.ctr === null ? '—' : `${stats.ctr}%`}
              </div>
              <div className="text-xs text-slate-500 mt-1">Calculated from local scan and click events</div>
            </div>
          </div>
        </div>

        {/* Chart & Stand Breakdown Grid (8 cols / 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Trend Analysis Timeline Chart (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#0B1C30]">Scans vs. Google Review Handoffs</h3>
                <p className="text-xs text-[#565E74]">Historical trends are not available yet.</p>
              </div>
            </div>

            <div className="flex min-h-64 items-center justify-center rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-600">
              A historical trend is unavailable until analytics events are persisted by the server.
            </div>
          </div>

          {/* Stand Breakdown Progress (4 cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-5">
            <h3 className="font-bold text-sm text-[#0B1C30]">Volume by Stand Location</h3>
            <p className="text-sm text-slate-600">
              Touchpoint breakdown is unavailable until scan and click events are stored per QR code.
            </p>
          </div>
        </div>

        {/* Detailed Performance Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-sm text-[#0B1C30]">Detailed Stand & Location Performance</h3>
            <p className="text-xs text-[#565E74]">Per-touchpoint physical telemetry Breakdown</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Touchpoint & Placement</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Total Scans</th>
                  <th className="py-3 px-4">Unique Visitors</th>
                  <th className="py-3 px-4">Google Clicks</th>
                  <th className="py-3 px-4">Conversion Rate</th>
                  <th className="py-3 px-6 text-right">Performance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No persisted touchpoint analytics are available yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="p-4 rounded-xl bg-slate-100 text-xs text-slate-500 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-base">info</span>
          <span>
            Current counts are browser-local and are not persisted or shared. ReviewQR does not retrieve submitted Google reviews.
          </span>
        </div>
      </div>
    </DashboardShell>
  );
}
