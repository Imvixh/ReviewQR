'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getStoredQRCodes, getStoredUser } from '@/lib/data-store';
import { QRCode, SessionUser } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabase/env';

interface BusinessDestination {
  id: string;
  name: string;
  city: string;
  googleReviewUrl: string;
}

interface AnalyticsSummary {
  scans: number;
  destinationClicks: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [business, setBusiness] = useState<BusinessDestination | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [qrLoadMessage, setQrLoadMessage] = useState(
    isSupabaseConfigured ? 'Loading owner-scoped QR designs…' : 'QR designs are stored in this browser.'
  );
  const [hasLoadedQrs, setHasLoadedQrs] = useState(false);
  const [destinationMessage, setDestinationMessage] = useState(
    isSupabaseConfigured ? 'Loading the saved business destination…' : 'Supabase is not configured.'
  );

  useEffect(() => {
    setUser(getStoredUser());

    if (!isSupabaseConfigured) {
      setQrCodes(getStoredQRCodes());
      setHasLoadedQrs(true);
      return;
    }

    let cancelled = false;
    void fetch('/api/qr')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !Array.isArray(result.qrs)) {
          throw new Error(result.message || result.code || 'Owner-scoped QR designs are unavailable.');
        }
        return result.qrs as QRCode[];
      })
      .then((result) => {
        if (cancelled) return;
        setQrCodes(result);
        setQrLoadMessage('QR designs loaded from your account.');
        setHasLoadedQrs(true);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setQrLoadMessage(error instanceof Error ? error.message : 'Owner-scoped QR designs are unavailable.');
        }
      })
    void fetch('/api/analytics')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || result.code || 'Owner-scoped analytics are unavailable.');
        }
        return result as AnalyticsSummary;
      })
      .then((result) => {
        if (!cancelled) setAnalytics(result);
      })
      .catch((error: unknown) => {
        if (!cancelled) console.error('Could not load dashboard analytics:', error);
      });

    void fetch('/api/business/review-destination')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'The saved business destination is unavailable.');
        }
        return result;
      })
      .then((result) => {
        if (cancelled) return;
        if (result.business) {
          setBusiness(result.business);
          setDestinationMessage('Saved destination loaded from Supabase.');
        } else {
          setDestinationMessage('No business destination has been saved yet.');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setDestinationMessage(
            error instanceof Error ? error.message : 'The saved business destination is unavailable.'
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleQrs = qrCodes.slice(0, 4);

  return (
    <DashboardShell>
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 p-6 lg:p-8">
        <section className="flex flex-col items-start justify-between gap-6 rounded-xl border border-slate-100 bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] sm:p-8 xl:flex-row xl:items-center">
          <div className="flex max-w-2xl flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF4FF] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#005BBF]">
                <span className="h-2 w-2 rounded-full bg-[#1A73E8]" />
                ReviewQR workspace
              </span>
              {business?.city && <span className="text-xs text-[#565E74]">· {business.city}</span>}
            </div>
            <h1 className="font-sans text-2xl font-extrabold tracking-tight text-[#0B1C30] sm:text-3xl">
              Welcome{user?.displayName ? `, ${user.displayName}` : ''}
            </h1>
            <p className="text-sm leading-relaxed text-[#414754]">
              {isSupabaseConfigured
                ? 'Your QR designs and business destination are loaded through authenticated, owner-scoped APIs.'
                : 'QR designs are stored in this browser; Supabase-backed QR persistence is unavailable.'}
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-3 xl:w-auto">
            <Link
              href="/qr-studio?mode=create"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1A73E8] px-5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#1557B0]"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Create Review QR
            </Link>
            <Link
              href="/my-qr-codes"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#EFF4FF] px-4 text-xs font-semibold text-[#005BBF] transition-all hover:bg-[#DCE9FF]"
            >
              Manage QR designs
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon="qr_code_2"
            label="Saved QR designs"
            value={qrCodes.length.toLocaleString()}
            detail={qrLoadMessage}
          />
          <MetricCard
            icon="qr_code_scanner"
            label="QR scans"
            value={analytics?.scans.toLocaleString() ?? '—'}
            detail={analytics ? 'Recorded scan requests' : 'Analytics are unavailable'}
          />
          <MetricCard
            icon="rate_review"
            label="Destination handoffs"
            value={analytics?.destinationClicks.toLocaleString() ?? '—'}
            detail="Review submissions are not tracked"
          />
          <MetricCard
            icon={hasLoadedQrs ? 'cloud_done' : 'cloud_off'}
            label="Cloud sync"
            value={hasLoadedQrs && isSupabaseConfigured ? 'Loaded' : 'Unavailable'}
            detail={isSupabaseConfigured ? qrLoadMessage : 'Configure Supabase to persist QR designs'}
          />
        </section>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <section className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] lg:col-span-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#0B1C30]">
                  {isSupabaseConfigured ? 'QR designs saved to your account' : 'QR designs saved in this browser'}
                </h2>
                <p className="mt-1 text-xs text-[#565E74]">
                  {qrLoadMessage}
                </p>
              </div>
              {qrCodes.length > 0 && (
                <Link
                  href="/my-qr-codes"
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#005BBF] hover:underline"
                >
                  View all
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              )}
            </div>

            {visibleQrs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {visibleQrs.map((qr) => (
                  <div
                    key={qr.id}
                    className="flex flex-col items-start justify-between gap-3 rounded-xl border border-[#E5EEFF] bg-[#EFF4FF] p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                        <span className="material-symbols-outlined text-[28px] text-[#005BBF]">qr_code_2</span>
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-[#0B1C30]">
                          {qr.placementName || qr.placementType || 'QR design'}
                        </div>
                        <div className="mt-0.5 text-xs text-[#565E74]">
                          {qr.createdAt
                            ? `Created ${new Date(qr.createdAt).toLocaleDateString()}`
                            : 'Saved in this browser'}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/qr-studio?edit=${encodeURIComponent(qr.id)}`}
                      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-[#005BBF] shadow-sm hover:bg-slate-50"
                    >
                      Open QR Studio
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <span className="material-symbols-outlined text-3xl text-slate-400">qr_code_2</span>
                <h3 className="mt-2 text-sm font-bold text-[#0B1C30]">No QR designs saved here yet</h3>
                <p className="mt-1 text-xs text-[#565E74]">
                  {isSupabaseConfigured
                    ? 'Create a design in QR Studio to save it to your account.'
                    : 'Create a design in QR Studio. It will be saved in this browser.'}
                </p>
                <Link
                  href="/qr-studio?mode=create"
                  className="mt-4 inline-flex h-9 items-center rounded-lg bg-[#1A73E8] px-4 text-xs font-semibold text-white"
                >
                  Create a QR design
                </Link>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] lg:col-span-4">
            <div>
              <h2 className="text-base font-bold text-[#0B1C30]">Business destination</h2>
              <p className="mt-1 text-xs text-[#565E74]">Destination status from the authorized business record.</p>
            </div>
            {business ? (
              <div className="rounded-xl bg-[#EFF4FF] p-4">
                <div className="font-bold text-sm text-[#0B1C30]">{business.name}</div>
                {business.city && <div className="mt-1 text-xs text-[#565E74]">{business.city}</div>}
                <a
                  href={business.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#005BBF] hover:underline"
                >
                  Open saved destination
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                </a>
              </div>
            ) : (
              <div className="rounded-xl bg-[#EFF4FF] p-4 text-sm text-[#414754]">
                No destination details are available to display.
              </div>
            )}
            <p className="text-xs leading-relaxed text-[#565E74]" role="status">
              {destinationMessage}
            </p>
            <Link
              href="/qr-studio?mode=create"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#DCE9FF] bg-white px-4 text-xs font-semibold text-[#005BBF] hover:bg-[#EFF4FF]"
            >
              Open QR Design Studio
            </Link>
          </section>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-[#DCE9FF] bg-[#EFF4FF] p-4 text-xs text-[#565E74] md:flex-row md:items-center">
          <span className="material-symbols-outlined shrink-0 text-[20px] text-[#005BBF]">info</span>
          <span>
            Customers submit reviews directly to Google. ReviewQR does not retrieve submitted reviews or report how many were received.
          </span>
        </div>
      </div>
    </DashboardShell>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex min-h-40 flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#414754]">{label}</span>
        <span className="material-symbols-outlined text-[22px] text-[#005BBF]">{icon}</span>
      </div>
      <div>
        <div className="text-3xl font-extrabold leading-none text-[#0B1C30]">{value}</div>
        <div className="mt-2 text-xs text-[#565E74]">{detail}</div>
      </div>
    </div>
  );
}
