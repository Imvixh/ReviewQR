'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCodeLib from 'qrcode';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getStoredOrg, getStoredQRCodes, getStoredUser, getAnalyticsStats } from '@/lib/data-store';
import { Organization, QRCode, SessionUser } from '@/lib/types';

export default function DashboardPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalScans: 0,
    uniqueVisitors: null as number | null,
    googleClicks: 0,
    ctr: null as string | null,
  });

  useEffect(() => {
    const loadedUser = getStoredUser();
    const loadedOrg = getStoredOrg();
    const loadedQRs = getStoredQRCodes();
    const loadedStats = getAnalyticsStats();

    setUser(loadedUser);
    setOrg(loadedOrg);
    setQrCodes(loadedQRs);
    setStats(loadedStats);

    // Generate real scannable QR code
    const destination = loadedOrg.googleReviewUrl || 'https://g.page/r/Cbll2345abc992eEBM/review';
    QRCodeLib.toDataURL(destination, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 320,
      color: {
        dark: '#0B1C30',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate dashboard QR:', err));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadPNG = () => {
    showToast('Exporting high-resolution 300 DPI Standee PNG...');
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `${(org?.name || 'royal_palace').toLowerCase().replace(/\s+/g, '_')}_standee.png`;
      link.href =
        'data:image/svg+xml;charset=utf-8,' +
        encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
          <rect width="600" height="850" rx="24" fill="#ffffff"/>
          <text x="300" y="80" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="28" fill="#0B1C30">${(org?.name || 'Royal Palace Hotel').toUpperCase()}</text>
          <text x="300" y="115" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="14" fill="#565E74">${(org?.category || 'Restaurant').toUpperCase()} • ${(org?.city || 'Bettiah, Bihar').toUpperCase()}</text>
          <rect x="150" y="160" width="300" height="300" rx="16" fill="#f8f9ff" stroke="#e5eeff" stroke-width="2"/>
          <text x="300" y="520" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="24" fill="#0B1C30">Review us on Google</text>
          <text x="300" y="555" text-anchor="middle" font-size="24" fill="#FBBC04">★★★★★</text>
          <rect x="100" y="590" width="400" height="50" rx="12" fill="${org?.accentColor || '#005BBF'}"/>
          <text x="300" y="622" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="16" fill="#ffffff">Scan to share your experience</text>
        </svg>
      `);
      link.click();
      showToast('Standee PNG downloaded successfully!');
    }, 400);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const activeQrs = qrCodes.filter((q) => q.status === 'active');

  return (
    <DashboardShell>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1C30] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-[#89FA9B] text-[20px]">check_circle</span>
          <span className="font-semibold text-xs">{toastMessage}</span>
        </div>
      )}

      <div className="p-6 lg:p-8 flex flex-col gap-8 max-w-[1600px] mx-auto w-full">
        {/* 1. Welcome Header Banner with Fluid Hierarchy & Quick Actions */}
        <section className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-slate-100">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#89FA9B]/30 text-[#002108] text-[11px] font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#006D2C] animate-pulse"></span>
                Sample workspace
              </span>
              <span className="text-[#565E74] text-xs">· {org?.city || 'Bettiah, Bihar'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1C30] tracking-tight font-sans">
              Welcome back, {user?.displayName || 'Rajesh Kumar'} 👋
            </h1>
            <p className="text-sm text-[#414754] leading-relaxed">
              Sample workspace content is stored in this browser. Live database persistence and analytics are not connected.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <Link
              href="/qr-studio"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-[#1A73E8] text-white font-semibold text-xs shadow-sm hover:bg-[#1557B0] transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Create Review QR</span>
            </Link>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg bg-[#DCE9FF] text-[#0B1C30] font-semibold text-xs hover:bg-[#CADCFF] transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[19px]">picture_as_pdf</span>
              <span>Download Poster PDF</span>
            </button>
            <Link
              href="/qr/table-tent-main-dining"
              target="_blank"
              className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg bg-[#EFF4FF] text-[#005BBF] font-semibold text-xs hover:bg-[#DCE9FF] transition-all"
            >
              <span className="material-symbols-outlined text-[19px]">smartphone</span>
              <span>Live Mobile Page</span>
            </Link>
          </div>
        </section>

        {/* 2. KPI Metric Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* KPI 1: Scans */}
          <div className="bg-white p-6 rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#414754] uppercase tracking-wider">Total Scans</span>
              <div className="w-10 h-10 rounded-lg bg-[#D8E2FF] flex items-center justify-center text-[#005BBF]">
                <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-4xl font-extrabold text-[#0B1C30] tracking-tight leading-none">
                {stats.totalScans.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 pt-1 text-xs">
                <span className="inline-flex items-center text-[#006D2C] font-semibold">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                  Local
                </span>
                <span className="text-[#565E74]">vs last month</span>
              </div>
            </div>
            <div className="w-full bg-[#E5EEFF] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#1A73E8] h-full rounded-full w-[78%]"></div>
            </div>
          </div>

          {/* KPI 2: 5-Star Reviews */}
          <div className="bg-white p-6 rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#414754] uppercase tracking-wider">5-Star Reviews</span>
              <div className="w-10 h-10 rounded-lg bg-[#DCE9FF] flex items-center justify-center text-[#006D2C]">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-4xl font-extrabold text-[#0B1C30] tracking-tight leading-none">—</div>
              <div className="flex items-center gap-1.5 pt-1 text-xs">
                <span className="text-[#565E74]">Review submissions are not tracked</span>
              </div>
            </div>
            <div className="w-full bg-[#E5EEFF] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#006D2C] h-full rounded-full w-[84%]"></div>
            </div>
          </div>

          {/* KPI 3: Active Stands */}
          <div className="bg-white p-6 rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#414754] uppercase tracking-wider">Active QR Stands</span>
              <div className="w-10 h-10 rounded-lg bg-[#DAE2FD] flex items-center justify-center text-[#5C647A]">
                <span className="material-symbols-outlined text-[22px]">storefront</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-4xl font-extrabold text-[#0B1C30] tracking-tight leading-none">{activeQrs.length}</div>
              <div className="flex items-center gap-1.5 pt-1 text-xs text-[#414754] truncate">
                <span>Saved in this browser</span>
              </div>
            </div>
            <div className="w-full bg-[#E5EEFF] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#565E74] h-full rounded-full w-full"></div>
            </div>
          </div>

          {/* KPI 4: Conversion Rate */}
          <div className="bg-white p-6 rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#414754] uppercase tracking-wider">Conversion Rate</span>
              <div className="w-10 h-10 rounded-lg bg-[#D3E4FE] flex items-center justify-center text-[#005BBF]">
                <span className="material-symbols-outlined text-[22px]">conversion_path</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-4xl font-extrabold text-[#0B1C30] tracking-tight leading-none">
                {stats.ctr === null ? '—' : `${stats.ctr}%`}
              </div>
              <div className="flex items-center gap-1.5 pt-1 text-xs">
                <span className="inline-flex items-center text-[#006D2C] font-semibold">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  Browser-local only
                </span>
                <span className="text-[#565E74]">not persisted</span>
              </div>
            </div>
            <div className="w-full bg-[#E5EEFF] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#005BBF] h-full rounded-full w-[72%]"></div>
            </div>
          </div>
        </section>

        {/* 3. Main Split Grid: Left (8 Cols) / Right (4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 Columns) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* 6-Step Visual Journey Flow */}
            <div className="bg-white p-6 rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1A73E8]"></span>
                  <span className="text-xs uppercase font-bold text-[#414754] tracking-wider">
                    ReviewQR Workflow
                  </span>
                </div>
                <span className="text-xs text-[#565E74]">Turn Table Guests Into 5-Star Google Reviews</span>
              </div>

              {/* Step Progression Flow */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-1">
                {/* Step 1 */}
                <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-[#EFF4FF] border border-[#E5EEFF]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#1A73E8] text-white text-[11px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <span className="text-xs font-bold text-[#0B1C30] truncate">Setup</span>
                  </div>
                  <span className="text-[11px] text-[#414754] leading-tight">Details &amp; logo configured</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-[#EFF4FF] border border-[#E5EEFF]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#006D2C] text-white text-[11px] font-bold flex items-center justify-center">
                      2
                    </span>
                    <span className="text-xs font-bold text-[#0B1C30] truncate">Print QR</span>
                  </div>
                  <span className="text-[11px] text-[#414754] leading-tight">Stand table flyers</span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-[#EFF4FF] border border-[#E5EEFF]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#DAE2FD] text-[#131B2E] text-[11px] font-bold flex items-center justify-center">
                      3
                    </span>
                    <span className="text-xs font-bold text-[#0B1C30] truncate">Guest Scan</span>
                  </div>
                  <span className="text-[11px] text-[#414754] leading-tight">Instant mobile open</span>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-[#EFF4FF] border border-[#E5EEFF]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#D8E2FF] text-[#001A41] text-[11px] font-bold flex items-center justify-center">
                      4
                    </span>
                    <span className="text-xs font-bold text-[#0B1C30] truncate">Assistant</span>
                  </div>
                  <span className="text-[11px] text-[#414754] leading-tight">1-tap ready phrase</span>
                </div>

                {/* Step 5 */}
                <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-[#EFF4FF] border border-[#E5EEFF]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#D3E4FE] text-[#005BBF] text-[11px] font-bold flex items-center justify-center">
                      5
                    </span>
                    <span className="text-xs font-bold text-[#0B1C30] truncate">Auto Copy</span>
                  </div>
                  <span className="text-[11px] text-[#414754] leading-tight">Clipboard ready</span>
                </div>

                {/* Step 6 */}
                <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-[#EFF4FF] border border-[#E5EEFF]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#89FA9B] text-[#002108] text-[11px] font-bold flex items-center justify-center">
                      6
                    </span>
                    <span className="text-xs font-bold text-[#0B1C30] truncate">Google Post</span>
                  </div>
                  <span className="text-[11px] text-[#414754] leading-tight">Customer submits directly on Google</span>
                </div>
              </div>
            </div>

            {/* Active QR Stands */}
            <div className="bg-white p-6 rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold text-[#0B1C30]">Active Review Stands &amp; Table Tents</h2>
                  <span className="text-xs text-[#414754]">Sample QR codes saved in this browser</span>
                </div>
                <Link
                  href="/my-qr-codes"
                  className="text-xs font-semibold text-[#005BBF] hover:underline flex items-center gap-1"
                >
                  <span>View All 4 Stands</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {/* Stand 1 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-[#EFF4FF] hover:bg-[#E5EEFF] transition-colors gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                      <span className="material-symbols-outlined text-[#005BBF] text-[28px]">qr_code_2</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0B1C30] truncate">Front Reception &amp; Counter</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#89FA9B] text-[#002108]">
                          Active
                        </span>
                      </div>
                      <span className="text-xs text-[#565E74] truncate">
                        Location ID: RP-REC-01 · Acrylic Stand A6
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto gap-5 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-[#0B1C30]">—</span>
                      <span className="text-[11px] text-[#565E74]">scan tracking unavailable</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleDownloadPNG}
                        className="p-2 rounded-lg bg-white text-[#414754] hover:text-[#005BBF] hover:bg-slate-100 transition-colors shadow-xs"
                        title="Quick Download PNG"
                      >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="p-2 rounded-lg bg-white text-[#414754] hover:text-[#005BBF] hover:bg-slate-100 transition-colors shadow-xs"
                        title="Print Stand"
                      >
                        <span className="material-symbols-outlined text-[20px]">print</span>
                      </button>
                      <Link
                        href="/qr-studio"
                        className="p-2 rounded-lg bg-white text-[#414754] hover:text-[#005BBF] hover:bg-slate-100 transition-colors shadow-xs"
                        title="Customize in Studio"
                      >
                        <span className="material-symbols-outlined text-[20px]">tune</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Stand 2 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-[#EFF4FF] hover:bg-[#E5EEFF] transition-colors gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                      <span className="material-symbols-outlined text-[#005BBF] text-[28px]">restaurant</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0B1C30] truncate">Dining Hall 1 (Tables 1-12)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#89FA9B] text-[#002108]">
                          Active
                        </span>
                      </div>
                      <span className="text-xs text-[#565E74] truncate">
                        Location ID: RP-DIN-01 · Wood Block Stand
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto gap-5 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-[#0B1C30]">—</span>
                      <span className="text-[11px] text-[#565E74]">scan tracking unavailable</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleDownloadPNG}
                        className="p-2 rounded-lg bg-white text-[#414754] hover:text-[#005BBF] hover:bg-slate-100 transition-colors shadow-xs"
                        title="Quick Download PNG"
                      >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="p-2 rounded-lg bg-white text-[#414754] hover:text-[#005BBF] hover:bg-slate-100 transition-colors shadow-xs"
                        title="Print Stand"
                      >
                        <span className="material-symbols-outlined text-[20px]">print</span>
                      </button>
                      <Link
                        href="/qr-studio"
                        className="p-2 rounded-lg bg-white text-[#414754] hover:text-[#005BBF] hover:bg-slate-100 transition-colors shadow-xs"
                        title="Customize in Studio"
                      >
                        <span className="material-symbols-outlined text-[20px]">tune</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Stand 3 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-[#EFF4FF] hover:bg-[#E5EEFF] transition-colors gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                      <span className="material-symbols-outlined text-[#005BBF] text-[28px]">deck</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0B1C30] truncate">Rooftop Sky Lounge</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#89FA9B] text-[#002108]">
                          Active
                        </span>
                      </div>
                      <span className="text-xs text-[#565E74] truncate">
                        Location ID: RP-ROOF-03 · Triangular Table Tent
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto gap-5 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-[#0B1C30]">—</span>
                      <span className="text-[11px] text-[#565E74]">scan tracking unavailable</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleDownloadPNG}
                        className="p-2 rounded-lg bg-white text-[#414754] hover:text-[#005BBF] hover:bg-slate-100 transition-colors shadow-xs"
                        title="Quick Download PNG"
                      >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="p-2 rounded-lg bg-white text-[#414754] hover:text-[#005BBF] hover:bg-slate-100 transition-colors shadow-xs"
                        title="Print Stand"
                      >
                        <span className="material-symbols-outlined text-[20px]">print</span>
                      </button>
                      <Link
                        href="/qr-studio"
                        className="p-2 rounded-lg bg-white text-[#414754] hover:text-[#005BBF] hover:bg-slate-100 transition-colors shadow-xs"
                        title="Customize in Studio"
                      >
                        <span className="material-symbols-outlined text-[20px]">tune</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Review submissions are completed on Google and are not retrieved by ReviewQR. */}
            <div className="bg-white p-6 rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold text-[#0B1C30]">Google review handoffs</h2>
                  <span className="text-xs text-[#414754]">ReviewQR does not retrieve or store submitted Google reviews.</span>
                </div>
              </div>

              <div className="rounded-xl bg-[#EFF4FF] p-5 text-sm text-[#414754]">
                Customers submit reviews directly to Google. ReviewQR does not have access to those submissions.
              </div>
            </div>
          </div>

          {/* Right Column (4 Columns): Poster Mockup & Setup Score */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Interactive Live Stand Preview Frame */}
            <div className="bg-white p-6 rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-[#0B1C30]">Live Stand Poster</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] uppercase font-bold bg-[#D8E2FF] text-[#001A41]">
                  Standard A5
                </span>
              </div>

              {/* Realistic Table Tent Poster Mockup Card */}
              <div className="relative bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center text-center overflow-hidden border border-slate-100">
                {/* Decorative Accent Waves at Top */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#005BBF]/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>

                {/* Top Badge */}
                <div className="mb-3 z-10">
                  <span className="px-3.5 py-1 rounded-full bg-[#0F172A] text-white text-[10px] font-bold tracking-widest uppercase shadow-xs">
                    Share Your Experience
                  </span>
                </div>

                {/* Business Emblem & Header */}
                <div className="flex flex-col items-center gap-1 mb-4 z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#DCE9FF] flex items-center justify-center shadow-sm mb-1 overflow-hidden">
                    {org?.logoUrl ? (
                      <img src={org.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-[#005BBF] text-2xl">hotel</span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-[#0B1C30] tracking-tight uppercase leading-tight">
                    {org?.name || 'Royal Palace Hotel'}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#565E74] font-bold">
                    {org?.category || 'Restaurant'} · {org?.city || 'Bettiah'}
                  </p>
                </div>

                {/* High-Contrast Centered QR Box */}
                <div className="p-3 bg-white rounded-2xl shadow-md mb-4 z-10 border border-slate-100">
                  <div className="relative w-44 h-44 bg-white flex items-center justify-center">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Google Review QR"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
                      </div>
                    )}

                    {/* Centered Google Icon Badge */}
                    <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center border border-slate-100 pointer-events-none">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          fill="#EA4335"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* "Review us on Google" Callout */}
                <div className="flex flex-col items-center gap-1 z-10 w-full">
                  <span className="text-xs font-bold text-[#0B1C30]">Review us on</span>
                  <div className="flex items-center gap-0.5">
                    <span className="text-[20px] font-extrabold tracking-tight text-[#4285F4]">G</span>
                    <span className="text-[20px] font-extrabold tracking-tight text-[#EA4335]">o</span>
                    <span className="text-[20px] font-extrabold tracking-tight text-[#FBBC05]">o</span>
                    <span className="text-[20px] font-extrabold tracking-tight text-[#4285F4]">g</span>
                    <span className="text-[20px] font-extrabold tracking-tight text-[#34A853]">l</span>
                    <span className="text-[20px] font-extrabold tracking-tight text-[#EA4335]">e</span>
                  </div>

                  {/* 5 Stars Row */}
                  <div className="flex text-amber-500 py-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className="material-symbols-outlined text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stand Footer Banner */}
                <div
                  className="w-full mt-4 py-2 px-3 rounded-lg text-white flex items-center justify-center gap-1.5 z-10 shadow-sm"
                  style={{ backgroundColor: org?.accentColor || '#005BBF' }}
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  <span className="text-xs font-semibold">Scan to share your experience</span>
                </div>
              </div>

              {/* Stand Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadPNG}
                  className="h-10 px-3 rounded-lg bg-[#005BBF] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 transition-opacity active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Download PNG</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="h-10 px-3 rounded-lg bg-[#DCE9FF] text-[#0B1C30] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#CADCFF] transition-colors active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                  <span>Download PDF</span>
                </button>
                <Link
                  href="/qr-studio"
                  className="col-span-2 h-10 px-3 rounded-lg bg-[#EFF4FF] text-[#005BBF] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#DCE9FF] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">palette</span>
                  <span>Customize Stand Colors &amp; Layout</span>
                </Link>
              </div>
            </div>

            {/* Setup Checklist Card */}
            <div className="bg-white p-6 rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006D2C] text-[22px]">verified</span>
                  <span className="font-bold text-sm text-[#0B1C30]">Setup Checklist</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#89FA9B] text-[#002108]">
                  Setup checklist
                </span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className="material-symbols-outlined text-[#006D2C] text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span className="text-[#0B1C30]">Business name &amp; category set</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span
                    className="material-symbols-outlined text-[#006D2C] text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span className="text-[#0B1C30]">Google Place Review URL linked</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span
                    className="material-symbols-outlined text-[#006D2C] text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span className="text-[#0B1C30]">Pre-built suggestions configured</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span
                    className="material-symbols-outlined text-[#006D2C] text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span className="text-[#0B1C30]">4 physical table stands printed</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="w-full bg-[#E5EEFF] rounded-full h-2 overflow-hidden">
                  <div className="bg-[#006D2C] h-full rounded-full w-full"></div>
                </div>
                <span className="text-[11px] text-[#565E74] pt-1 block text-right font-medium">
                  4 of 4 completed
                </span>
              </div>
            </div>

            {/* Pro Feature Tip / Acrylic Stand Ordering Callout */}
            <div className="bg-[#EFF4FF] p-6 rounded-xl border border-[#DCE9FF] flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#005BBF] text-white flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-sm text-[#0B1C30] leading-tight">
                  Need Hard Acrylic Stands?
                </span>
                <p className="text-xs text-[#414754] leading-relaxed">
                  Order laser-cut, waterproof table tents with your custom QR code printed directly on acrylic. Delivered across Bihar in 3 days.
                </p>
                <a
                  href="#order-stands"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Acrylic stand logistics order dispatched to delivery partners in Bettiah.');
                  }}
                  className="text-xs text-[#005BBF] font-bold hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Order Physical Stands</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bottom Notice: Compliance & Google Native Screen Disclaimer */}
        <div className="p-4 rounded-xl bg-[#EFF4FF] border border-[#DCE9FF] text-[#565E74] flex flex-col md:flex-row md:items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#005BBF] text-[20px] shrink-0">info</span>
            <span>
              Customers control their rating and submit reviews directly on Google Maps. ReviewQR does not post reviews on a customer&apos;s behalf.
            </span>
          </div>
          <span className="font-mono uppercase text-[10px] tracking-wider text-[#005BBF] font-bold shrink-0">
            Customer-controlled submission
          </span>
        </div>
      </div>
    </DashboardShell>
  );
}
