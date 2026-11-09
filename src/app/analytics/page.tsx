'use client';

import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';

interface AnalyticsRow {
  qrCodeId: string;
  placementName: string;
  scans: number;
  destinationClicks: number;
  clickThroughRate: number;
}

interface AnalyticsResponse {
  scans: number;
  uniqueVisitors: null;
  destinationClicks: number;
  clickThroughRate: number;
  byQr: AnalyticsRow[];
}

export default function AnalyticsPage() {
  const [analyticsMessage, setAnalyticsMessage] = useState('Loading persisted analytics…');
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/analytics')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Persistent analytics are unavailable.');
        }
        return result;
      })
      .then((result: AnalyticsResponse) => {
        if (!cancelled) {
          setAnalytics(result);
          setAnalyticsMessage('Owner-scoped scan and destination-click analytics loaded.');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setAnalyticsMessage(
            error instanceof Error ? error.message : 'Persistent analytics are unavailable.'
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase text-[#1A73E8] tracking-wider">
              <span>Persistent event analytics</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">
                {analytics ? 'Owner-scoped' : 'Unavailable'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1C30] tracking-tight">
              Analytics & Conversion
            </h1>
            <p className="text-sm text-[#414754] mt-1">
              ReviewQR records QR scans and destination clicks; unique visitors and review submissions are not measured.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              disabled
              title="CSV export is unavailable until analytics are persisted."
              className="h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-[#0B1C30] font-semibold text-xs shadow-sm opacity-50 cursor-not-allowed flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base text-slate-500">csv</span>
              <span>CSV</span>
            </button>
            <button
              disabled
              title="PDF export is unavailable until analytics are persisted."
              className="h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-[#0B1C30] font-semibold text-xs shadow-sm opacity-50 cursor-not-allowed flex items-center gap-1.5"
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
              <div className="text-3xl font-extrabold text-[#0B1C30]">
                {analytics?.scans.toLocaleString() ?? '—'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Persisted scan events</div>
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
              <div className="text-3xl font-extrabold text-[#0B1C30]">
                {analytics?.destinationClicks.toLocaleString() ?? '—'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Destination handoff clicks</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-[#565E74] uppercase tracking-wider">
              <span>Conversion Rate</span>
              <span className="material-symbols-outlined text-amber-600 text-lg">conversion_path</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-[#0B1C30]">
                {analytics ? `${analytics.clickThroughRate.toFixed(1)}%` : '—'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Destination clicks / scans</div>
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
                <p className="text-xs text-[#565E74]">A time-series view is not implemented.</p>
              </div>
            </div>

            <div className="flex min-h-64 items-center justify-center rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-600">
              Historical trend visualization is unavailable. Counts below reflect persisted events.
            </div>
          </div>

          {/* Stand Breakdown Progress (4 cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-5">
            <h3 className="font-bold text-sm text-[#0B1C30]">Volume by Stand Location</h3>
            {analytics?.byQr.length ? (
              <ul className="space-y-3">
                {analytics.byQr.map((row) => (
                  <li key={row.qrCodeId} className="flex items-center justify-between gap-3 text-xs">
                    <span className="truncate font-medium text-slate-700">{row.placementName}</span>
                    <span className="shrink-0 text-slate-500">{row.scans.toLocaleString()} scans</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">
                {analytics ? 'No saved QR designs have events yet.' : 'Owner-scoped analytics are unavailable.'}
              </p>
            )}
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
                  <th className="py-3 px-4">Total Scans</th>
                  <th className="py-3 px-4">Destination Clicks</th>
                  <th className="py-3 px-4">Click-through Rate</th>
                  <th className="py-3 px-6 text-right">Performance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics?.byQr.length ? analytics.byQr.map((row) => (
                  <tr key={row.qrCodeId}>
                    <td className="px-6 py-4 font-medium text-[#0B1C30]">{row.placementName}</td>
                    <td className="px-4 py-4">{row.scans.toLocaleString()}</td>
                    <td className="px-4 py-4">{row.destinationClicks.toLocaleString()}</td>
                    <td className="px-4 py-4">{row.clickThroughRate.toFixed(1)}%</td>
                    <td className="px-6 py-4 text-right text-slate-500">Recorded events</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      {analytics ? 'No persisted touchpoint analytics are available yet.' : 'Owner-scoped analytics are unavailable.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="p-4 rounded-xl bg-slate-100 text-xs text-slate-500 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-base">info</span>
          <span role="status">{analyticsMessage} ReviewQR does not retrieve submitted Google reviews.</span>
        </div>
      </div>
    </DashboardShell>
  );
}
