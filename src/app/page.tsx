'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface min-h-screen">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <Link className="flex items-center gap-space-sm group" href="/">
            <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
              <div className="w-full h-full rounded border-2 border-on-primary-container p-0.5 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-on-primary-container rounded-xs"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface leading-none tracking-tight">
                Review<span className="text-primary-container">QR</span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-space-lg">
            <Link className="transition-colors text-primary font-bold" href="/">
              Product
            </Link>
            <a className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="#how-it-works">
              How It Works
            </a>
            <a className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="#features">
              Features
            </a>
            <a className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="#faq">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-space-md">
            <Link className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors px-space-sm py-space-xs" href="/login">
              Log In
            </Link>
            <Link className="font-label-lg text-label-lg bg-primary-container text-on-primary-container px-space-md py-space-xs rounded-lg shadow-[0_1px_3px_rgba(15,23,42,0.05)] hover:bg-primary transition-all active:scale-95" href="/signup">
              Get Started Free
            </Link>
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full pt-16 bg-surface">
        <div className="flex flex-col w-full">
          {/* Subtle ambient glow background decoration */}
          <div className="relative w-full overflow-hidden">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[480px] bg-gradient-to-tr from-surface-variant/40 via-primary-fixed/30 to-secondary-container/30 blur-3xl pointer-events-none rounded-full"></div>

            {/* 1. HERO SECTION */}
            <section className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-20 lg:pt-16 lg:pb-28">
              <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
                {/* Eyebrow Pill */}
                <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container border border-outline-variant/60 shadow-sm mb-6">
                  <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  <span className="font-label-caps text-label-caps uppercase tracking-wider text-primary">
                    The Smarter Way to Collect Reviews
                  </span>
                </div>

                {/* Main Headline */}
                <h1 className="font-display-hero text-display-hero text-on-surface mb-6 tracking-tight">
                  Make It Easier to Share Honest Customer Feedback.
                </h1>

                {/* Supporting Copy */}
                <p className="font-body-lg text-body-lg text-secondary max-w-2xl mb-8">
                  Design a QR poster that gives customers a direct path to your Google destination and lets them share feedback on their own terms.
                </p>

                {/* CTA Cluster */}
                <div className="flex flex-col sm:flex-row items-center gap-space-md mb-4">
                  <Link
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm px-space-lg py-3 rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-md hover:bg-primary transition-all active:scale-95"
                    href="/create-qr"
                  >
                    <span>Create Your Free QR</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                  <a
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm px-space-lg py-3 rounded-lg bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container-low transition-all"
                    href="#how-it-works"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">play_circle</span>
                    <span>See How It Works</span>
                  </a>
                </div>

                <p className="font-body-sm text-body-sm text-secondary flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[15px] text-tertiary">check_circle</span>
                  Prototype notice: QR designs are browser-local; cloud QR sync, customer-facing QR pages and analytics are not available yet.
                </p>
              </div>

              {/* Layered Perspective Mockup Composition */}
              <div className="relative w-full max-w-5xl mx-auto mt-6">
                {/* Floating Analytics Badge */}
                <div className="absolute -top-5 left-4 md:left-12 z-20 bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-3 sm:p-4 shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">trending_up</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline-sm text-headline-sm text-on-surface leading-tight font-bold">—</span>
                      <span className="font-label-caps text-label-caps uppercase text-tertiary font-bold bg-tertiary-fixed/30 px-1.5 py-0.5 rounded">
                        Preview
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-secondary">Analytics appears when event tracking is connected</span>
                  </div>
                </div>

                {/* Floating Live Activity Pill */}
                <div className="hidden md:flex absolute -bottom-4 right-10 z-20 bg-surface-container-lowest/95 backdrop-blur-md rounded-full px-4 py-2.5 shadow-lg items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping"></span>
                  <span className="font-label-md text-label-md text-on-surface">
                    Sample poster preview
                  </span>
                  <span className="text-secondary font-body-sm text-body-sm">Not live activity</span>
                </div>

                {/* The Showcase Layout: Table Acrylic Stand + Mobile Review Flow */}
                <div className="bg-surface-container-low rounded-2xl p-6 sm:p-10 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Column A: Acrylic Standee Mockup (5 Cols) */}
                  <div className="lg:col-span-5 flex justify-center">
                    <div className="relative w-full max-w-[280px] bg-surface-container-lowest rounded-xl shadow-2xl p-5 flex flex-col items-center text-center">
                      {/* Physical Acrylic Stand Header Badge */}
                      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-surface-container">
                        <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Tabletop Standee</span>
                        <span className="flex items-center text-[11px] font-bold text-tertiary gap-0.5">
                          <span className="material-symbols-outlined text-[14px]">edit</span> Design Preview
                        </span>
                      </div>

                      {/* Standee Art */}
                      <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-2 shadow-inner">
                        <span className="material-symbols-outlined text-primary text-[26px]">hotel</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight mb-0.5">Your business</h3>
                      <p className="font-label-caps text-label-caps uppercase text-secondary mb-3">Restaurant &amp; Lounge</p>

                      {/* Stylized Scannable QR Component */}
                      <div className="relative p-3 bg-surface-container-lowest rounded-lg shadow-sm mb-3">
                        <svg className="w-36 h-36 mx-auto text-on-surface" fill="currentColor" viewBox="0 0 140 140">
                          {/* QR Finder Top-Left */}
                          <rect fill="none" height="36" rx="4" stroke="currentColor" strokeWidth="7" width="36" x="10" y="10"></rect>
                          <rect fill="currentColor" height="12" rx="2" width="12" x="22" y="22"></rect>
                          {/* QR Finder Top-Right */}
                          <rect fill="none" height="36" rx="4" stroke="currentColor" strokeWidth="7" width="36" x="94" y="10"></rect>
                          <rect fill="currentColor" height="12" rx="2" width="12" x="106" y="22"></rect>
                          {/* QR Finder Bottom-Left */}
                          <rect fill="none" height="36" rx="4" stroke="currentColor" strokeWidth="7" width="36" x="10" y="94"></rect>
                          <rect fill="currentColor" height="12" rx="2" width="12" x="22" y="106"></rect>
                          {/* Data points */}
                          <rect height="8" rx="1" width="8" x="56" y="14"></rect>
                          <rect height="8" rx="1" width="8" x="72" y="18"></rect>
                          <rect height="8" rx="1" width="8" x="54" y="32"></rect>
                          <rect height="8" rx="1" width="8" x="76" y="32"></rect>
                          <rect height="8" rx="1" width="8" x="14" y="56"></rect>
                          <rect height="8" rx="1" width="8" x="28" y="64"></rect>
                          <rect height="8" rx="1" width="8" x="98" y="56"></rect>
                          <rect height="8" rx="1" width="8" x="114" y="68"></rect>
                          <rect fill="#1a73e8" fillOpacity="0.1" height="32" rx="6" width="32" x="54" y="54"></rect>
                          <rect height="8" rx="1" width="8" x="54" y="94"></rect>
                          <rect height="8" rx="1" width="8" x="72" y="102"></rect>
                          <rect height="8" rx="1" width="8" x="96" y="94"></rect>
                          <rect height="8" rx="1" width="8" x="112" y="112"></rect>
                          <rect height="8" rx="1" width="8" x="80" y="118"></rect>
                        </svg>
                        {/* Centered Google 'G' Watermark Emblem */}
                        <div className="absolute inset-0 m-auto w-7 h-7 bg-surface-container-lowest rounded-full shadow-md flex items-center justify-center">
                          <span className="font-headline-sm text-headline-sm font-bold text-primary">G</span>
                        </div>
                      </div>

                      {/* Review Us Callout */}
                      <p className="font-headline-sm text-headline-sm font-bold text-on-surface mb-1 flex items-center gap-1">
                        Review us on <span className="text-primary">Google</span>
                      </p>

                      <div className="w-full bg-surface-container py-1.5 px-3 rounded-md">
                        <p className="font-label-md text-label-md text-secondary">Point phone camera &amp; tap</p>
                      </div>
                    </div>
                  </div>

                  {/* Connector Arrow Indicator */}
                  <div className="hidden lg:flex lg:col-span-1 justify-center text-primary">
                    <span className="material-symbols-outlined text-[36px] animate-pulse">east</span>
                  </div>

                  {/* Column B: Mobile Customer Review Assistant Screen (6 Cols) */}
                  <div className="lg:col-span-6 flex justify-center">
                    <div className="w-full max-w-[340px] bg-surface-container-lowest rounded-2xl shadow-2xl p-5 overflow-hidden">
                      {/* Smartphone Status Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold">
                            R
                          </div>
                          <span className="font-label-lg text-label-lg font-bold text-on-surface">Review Assistant</span>
                        </div>
                        <span className="font-label-md text-label-md text-secondary">Preview only</span>
                      </div>

                      {/* Location Details */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[20px]">apartment</span>
                        </div>
                        <div>
                          <h4 className="font-headline-sm text-headline-sm text-on-surface leading-tight">Your business</h4>
                          <p className="font-body-sm text-body-sm text-secondary">Business location</p>
                        </div>
                      </div>

                      {/* Interactive Star Picker Mock */}
                      <div className="bg-surface-container-low rounded-xl p-3 text-center mb-4">
                        <span className="font-label-caps text-label-caps uppercase text-secondary block mb-1">How was your experience?</span>
                        <span className="font-label-md text-label-md text-on-surface font-semibold">Customers choose their own rating</span>
                      </div>

                      <div className="mb-4 rounded-lg bg-surface-container-low p-3 text-left">
                        <p className="font-label-caps text-label-caps uppercase text-secondary">Customer-authored feedback</p>
                        <p className="mt-1 font-body-sm text-body-sm text-secondary">
                          ReviewQR does not provide prewritten review suggestions.
                        </p>
                      </div>

                      <div className="w-full rounded-lg bg-surface-container px-4 py-2.5 text-center font-label-md text-label-md text-secondary">
                        Customer QR flow is not available yet
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 2. SOCIAL PROOF / CATEGORY TRUST STRIP */}
          <section className="w-full bg-surface-container-low py-10">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left max-w-sm">
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Built for real-world interactions</h3>
                <p className="font-body-sm text-body-sm text-secondary">Designed specifically for local physical venues that prioritize customer feedback.</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-lowest shadow-sm text-on-surface font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[18px] text-primary">restaurant</span>
                  <span>Restaurants &amp; Cafes</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-lowest shadow-sm text-on-surface font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[18px] text-primary">storefront</span>
                  <span>Retail &amp; Boutiques</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-lowest shadow-sm text-on-surface font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[18px] text-primary">spa</span>
                  <span>Salons &amp; Spas</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-lowest shadow-sm text-on-surface font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[18px] text-primary">hotel</span>
                  <span>Hotels &amp; Stays</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-lowest shadow-sm text-on-surface font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[18px] text-primary">medical_services</span>
                  <span>Clinics &amp; Wellness</span>
                </div>
              </div>
            </div>
          </section>

          {/* 3. PROBLEM & SOLUTION SECTION */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28" id="features">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider block mb-2">Frictionless Feedback</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Getting customer reviews shouldn’t be complicated.</h2>
              <p className="font-body-lg text-body-lg text-secondary">
                Most happy customers want to praise your staff, but hunting down your Google listing or facing a blank text box stops them. ReviewQR fixes both.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-[28px]">qr_code_scanner</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Make Reviews Effortless</h3>
                <p className="font-body-md text-body-md text-secondary leading-relaxed mb-6">
                  Give guests an ultra-clear QR point right at the counter or dining table. They scan with their native camera and land on your branded touchpoint in one tap.
                </p>
                <div className="mt-auto pt-4 border-t border-surface-container flex items-center gap-2 font-label-md text-label-md text-primary">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>Zero app downloads required</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed mb-6">
                  <span className="material-symbols-outlined text-[28px]">edit_note</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Remove the Blank Page</h3>
                <p className="font-body-md text-body-md text-secondary leading-relaxed mb-6">
                  Customers should describe their own experience. ReviewQR does not currently provide prewritten review prompts or a working public customer flow.
                </p>
                <div className="mt-auto pt-4 border-t border-surface-container flex items-center gap-2 font-label-md text-label-md text-tertiary">
                  <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                  <span>Higher completion &amp; richer text</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary mb-6">
                  <span className="material-symbols-outlined text-[28px]">palette</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Look Polished &amp; Established</h3>
                <p className="font-body-md text-body-md text-secondary leading-relaxed mb-6">
                  Preview poster designs in the QR Design Studio. Print-ready PDF and poster output have not been verified.
                </p>
                <div className="mt-auto pt-4 border-t border-surface-container flex items-center gap-2 font-label-md text-label-md text-primary">
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  <span>Vector PDF &amp; high-res PNG export</span>
                </div>
              </div>
            </div>
          </section>

          {/* 4. HOW IT WORKS (CONNECTED TIMELINE) */}
          <section className="w-full bg-surface-container-low py-20 lg:py-28" id="how-it-works">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider block mb-2">Simplicity First</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">A simple path to customer-submitted reviews</h2>
                <p className="font-body-lg text-body-lg text-secondary">A transparent and direct workflow where customers stay in full control at every touchpoint.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Connecting Line Background for Desktop */}
                <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-outline-variant/40 -translate-y-12 z-0"></div>

                {/* Step 1 */}
                <div className="relative z-10 bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm flex items-center justify-center font-bold">1</span>
                    <span className="font-label-caps text-label-caps uppercase text-secondary">Setup</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Create Your QR</h3>
                  <p className="font-body-md text-body-md text-secondary mb-6">Search Google Maps manually, paste your chosen HTTPS destination, and preview a poster layout.</p>
                  <div className="mt-auto bg-surface-container-low p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
                      <div className="flex flex-col text-left">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">Find your listing on Google Maps</span>
                        <span className="font-body-sm text-body-sm text-secondary">Manual search; no automatic listing detection</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary font-headline-sm text-headline-sm flex items-center justify-center font-bold">2</span>
                    <span className="font-label-caps text-label-caps uppercase text-secondary">Customer Scan</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Let Customers Scan</h3>
                  <p className="font-body-md text-body-md text-secondary mb-6">The intended flow is a phone scan followed by a customer-facing page. That public page is not implemented yet.</p>
                  <div className="mt-auto bg-surface-container-low p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-tertiary text-[24px]">phonelink_ring</span>
                      <div className="flex flex-col text-left">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">Public QR page</span>
                        <span className="font-body-sm text-body-sm text-secondary">Live use requires the secure Supabase migration</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-full bg-[#FBBC04] text-on-surface font-headline-sm text-headline-sm flex items-center justify-center font-bold">3</span>
                    <span className="font-label-caps text-label-caps uppercase text-secondary">Submission</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Share Honest Feedback</h3>
                  <p className="font-body-md text-body-md text-secondary mb-6">Customers choose whether to continue and submit their own feedback at the external destination. The flow does not verify Google policy compliance.</p>
                  <div className="mt-auto bg-surface-container-low p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#FBBC04] text-[24px]">verified</span>
                      <div className="flex flex-col text-left">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">Customer-controlled submission</span>
                        <span className="font-body-sm text-body-sm text-secondary">Policy compliance has not been independently verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer submission note */}
              <div className="mt-12 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-sm">
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed/40 flex items-center justify-center text-tertiary shrink-0">
                  <span className="material-symbols-outlined text-[22px]">policy</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Customer submission</h4>
                  <p className="font-body-sm text-body-sm text-secondary">
                    ReviewQR does not submit reviews on a customer&apos;s behalf or claim Google policy certification. Live QR use requires configured Supabase and the secure QR migration.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. FEATURE SHOWCASE */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28 space-y-24">
            {/* Feature A: QR Posters That Match Your Brand */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 order-2 lg:order-1">
                <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider block mb-2">Display Customization</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">QR Posters That Match Your Atmosphere</h2>
                <p className="font-body-lg text-body-lg text-secondary mb-6">
                  Your physical venue has a distinct ambiance. Whether you manage a sunlit specialty bakery, a high-end salon, or an intimate bistro, your review touchpoints should look integral to the space.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 font-body-md text-body-md text-on-surface">
                    <span className="material-symbols-outlined text-[20px] text-tertiary">check_circle</span>
                    Choose from curated luxury, minimal, and modern color themes
                  </li>
                  <li className="flex items-center gap-3 font-body-md text-body-md text-on-surface">
                    <span className="material-symbols-outlined text-[20px] text-tertiary">check_circle</span>
                    Upload custom logos or venue emblems
                  </li>
                  <li className="flex items-center gap-3 font-body-md text-body-md text-on-surface">
                    <span className="material-symbols-outlined text-[20px] text-tertiary">check_circle</span>
                    Preview editable poster layouts in the QR Design Studio
                  </li>
                </ul>
                <Link className="inline-flex items-center gap-2 font-label-lg text-label-lg text-primary hover:underline font-semibold" href="/qr-studio">
                  <span>Explore print templates</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>

              {/* Visual Graphic: 3 Poster Cards Side by Side */}
              <div className="lg:col-span-7 order-1 lg:order-2 bg-surface-container-low rounded-3xl p-6 sm:p-10 shadow-inner">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Poster 1: Cafe Minimal */}
                  <div className="bg-surface-container-lowest rounded-xl p-4 shadow-md text-center flex flex-col items-center">
                    <span className="text-[10px] font-label-caps uppercase tracking-wider text-secondary mb-2">Cafe Minimal</span>
                    <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface mb-2">
                      <span className="material-symbols-outlined text-[18px]">local_cafe</span>
                    </div>
                    <span className="font-label-md text-label-md text-on-surface font-bold">Your Business</span>
                    <div className="w-20 h-20 bg-surface-container-low rounded my-3 flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-[32px]">qr_code</span>
                    </div>
                    <span className="text-[11px] font-semibold text-secondary">Review Us</span>
                  </div>

                  {/* Poster 2: Luxury Gold/Dark */}
                  <div className="bg-inverse-surface rounded-xl p-4 shadow-md text-center flex flex-col items-center text-inverse-on-surface">
                    <span className="text-[10px] font-label-caps uppercase tracking-wider text-[#FBBC04] mb-2">Gold Boutique</span>
                    <div className="w-8 h-8 rounded-full bg-inverse-surface border border-[#FBBC04]/40 flex items-center justify-center text-[#FBBC04] mb-2">
                      <span className="material-symbols-outlined text-[18px]">spa</span>
                    </div>
                    <span className="font-label-md text-label-md text-white font-bold">Your Business</span>
                    <div className="w-20 h-20 bg-white/10 rounded my-3 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#FBBC04] text-[32px]">qr_code</span>
                    </div>
                    <span className="text-[11px] font-semibold text-white/80">Share Experience</span>
                  </div>

                  {/* Poster 3: Classic Hospitality */}
                  <div className="bg-surface-container-lowest rounded-xl p-4 shadow-md text-center flex flex-col items-center">
                    <span className="text-[10px] font-label-caps uppercase tracking-wider text-primary mb-2">Classic Blue</span>
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-2">
                      <span className="material-symbols-outlined text-[18px]">hotel</span>
                    </div>
                    <span className="font-label-md text-label-md text-on-surface font-bold">Your Business</span>
                    <div className="w-20 h-20 bg-primary-fixed/30 rounded my-3 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[32px]">qr_code</span>
                    </div>
                    <span className="text-[11px] font-semibold text-primary">Google Reviews</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature B: A Guided Customer Experience */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Visual Graphic: 4 Mini Mobile Step Cards */}
              <div className="lg:col-span-7 bg-surface-container-low rounded-3xl p-6 sm:p-10 shadow-inner">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm text-center">
                    <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container text-[11px] font-bold inline-flex items-center justify-center mb-2">1</span>
                    <span className="font-label-caps text-label-caps block uppercase text-secondary mb-1">Scan</span>
                    <span className="font-label-md text-label-md text-on-surface block font-semibold">Camera Snap</span>
                    <div className="mt-3 py-4 bg-surface-container-low rounded-lg text-secondary">
                      <span className="material-symbols-outlined text-[24px]">center_focus_strong</span>
                    </div>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm text-center">
                    <span className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary text-[11px] font-bold inline-flex items-center justify-center mb-2">2</span>
                    <span className="font-label-caps text-label-caps block uppercase text-secondary mb-1">Rating</span>
                    <span className="font-label-md text-label-md text-on-surface block font-semibold">Star Choice</span>
                    <div className="mt-3 py-4 bg-surface-container-low rounded-lg text-[#FBBC04]">
                      <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm text-center">
                    <span className="w-6 h-6 rounded-full bg-[#FBBC04] text-on-surface text-[11px] font-bold inline-flex items-center justify-center mb-2">3</span>
                    <span className="font-label-caps text-label-caps block uppercase text-secondary mb-1">Prompts</span>
                    <span className="font-label-md text-label-md text-on-surface block font-semibold">Suggestions</span>
                    <div className="mt-3 py-4 bg-surface-container-low rounded-lg text-primary">
                      <span className="material-symbols-outlined text-[24px]">chat_bubble_outline</span>
                    </div>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm text-center">
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-[11px] font-bold inline-flex items-center justify-center mb-2">4</span>
                    <span className="font-label-caps text-label-caps block uppercase text-secondary mb-1">Handoff</span>
                    <span className="font-label-md text-label-md text-on-surface block font-semibold">Google Submit</span>
                    <div className="mt-3 py-4 bg-surface-container-low rounded-lg text-tertiary">
                      <span className="material-symbols-outlined text-[24px]">open_in_new</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5">
                <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider block mb-2">Mobile Ergonomics</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">A Guided, Respectful Customer Journey</h2>
                <p className="font-body-lg text-body-lg text-secondary mb-6">
                  Guests don&apos;t like confusing forms. ReviewQR provides a fast, one-thumb interface that lets customers express what they genuinely appreciated without friction.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 font-body-md text-body-md text-on-surface">
                    <span className="material-symbols-outlined text-[20px] text-tertiary">check_circle</span>
                    Automatic clipboard synchronization for customer ease
                  </li>
                  <li className="flex items-center gap-3 font-body-md text-body-md text-on-surface">
                    <span className="material-symbols-outlined text-[20px] text-tertiary">check_circle</span>
                    Direct deep-link straight into the native Google Maps app review modal
                  </li>
                  <li className="flex items-center gap-3 font-body-md text-body-md text-on-surface">
                    <span className="material-symbols-outlined text-[20px] text-tertiary">check_circle</span>
                    Lightweight code footprint that loads in under 400 milliseconds on cellular networks
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature C & D: Centralized Management & Real-time Scan Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature C */}
              <div className="bg-surface-container-low rounded-2xl p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[28px]">space_dashboard</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-3">One Unified QR Control Hub</h3>
                  <p className="font-body-md text-body-md text-secondary leading-relaxed mb-6">
                    Keep every location, dining section, and display counter organized. Generate unique QR codes for specific stations (e.g., Bar, Patio, Checkout) to pinpoint where guest delight is highest.
                  </p>
                </div>
                {/* Mini Mock Management Table */}
                <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between font-label-caps text-label-caps uppercase text-secondary pb-1 border-b border-surface-container">
                    <span>Location / Zone</span>
                    <span>Monthly Scans</span>
                    <span>Status</span>
                  </div>
                  <div className="flex items-center justify-between font-body-sm text-body-sm">
                    <span className="font-semibold text-on-surface">Main Bar &amp; Lounge</span>
                    <span className="text-secondary font-mono">684</span>
                    <span className="text-tertiary font-bold">Active</span>
                  </div>
                  <div className="flex items-center justify-between font-body-sm text-body-sm">
                    <span className="font-semibold text-on-surface">Dining Terrace</span>
                    <span className="text-secondary font-mono">412</span>
                    <span className="text-tertiary font-bold">Active</span>
                  </div>
                </div>
              </div>

              {/* Feature D */}
              <div className="bg-surface-container-low rounded-2xl p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[28px]">query_stats</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Understand Physical Engagement</h3>
                  <p className="font-body-md text-body-md text-secondary leading-relaxed mb-6">
                    Understand scan volume trends across days of the week, peak hours, and device types to optimize stand placement and staff review requests.
                  </p>
                </div>
                {/* Mini SVG Sparkline Visual */}
                <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">Weekly Scan Volume</span>
                    <span className="font-label-md text-label-md text-secondary font-bold">Unavailable</span>
                  </div>
                  <div className="h-16 w-full flex items-end gap-2 pt-2">
                    <div className="flex-1 bg-primary-fixed rounded-t h-[40%]"></div>
                    <div className="flex-1 bg-primary-fixed rounded-t h-[55%]"></div>
                    <div className="flex-1 bg-primary-fixed rounded-t h-[50%]"></div>
                    <div className="flex-1 bg-primary-fixed rounded-t h-[75%]"></div>
                    <div className="flex-1 bg-primary-fixed rounded-t h-[65%]"></div>
                    <div className="flex-1 bg-primary-container rounded-t h-[95%]"></div>
                    <div className="flex-1 rounded-t bg-primary/10"></div>
                  </div>
                  <div className="flex justify-between font-label-caps text-label-caps text-secondary uppercase mt-2">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. DASHBOARD PREVIEW SECTION */}
          <section className="w-full bg-surface-container-low py-20 lg:py-28">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="text-center max-w-3xl mx-auto mb-14">
                <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider block mb-2">Built for Operators</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Everything you need, in one simple dashboard</h2>
                <p className="font-body-lg text-body-lg text-secondary">
                  Manage physical touchpoints, customize printable table displays in real time, and monitor location scan velocity without technical overhead.
                </p>
              </div>

              {/* Dashboard Mock Window Frame */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden">
                {/* Browser Chrome Bar */}
                <div className="bg-surface-container-high px-4 py-3 flex items-center justify-between border-b border-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-error/70"></span>
                    <span className="w-3 h-3 rounded-full bg-[#FBBC04]/70"></span>
                    <span className="w-3 h-3 rounded-full bg-tertiary/70"></span>
                    <span className="font-mono text-body-sm text-body-sm text-secondary ml-3">app.reviewqr.io/dashboard</span>
                  </div>
                  <span className="font-label-caps text-label-caps text-secondary uppercase">ReviewQR Studio v2.4</span>
                </div>

                {/* Dashboard App Internal Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
                  {/* Sidebar Nav */}
                  <div className="lg:col-span-3 bg-surface-container-low p-4 sm:p-6 border-r border-surface-container flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 px-2">
                        <div className="w-7 h-7 rounded-md bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold">R</div>
                        <span className="font-headline-sm text-headline-sm text-on-surface">ReviewQR</span>
                      </div>
                      <nav className="space-y-1">
                        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-container text-primary font-label-md text-label-md font-semibold" href="/dashboard">
                          <span className="material-symbols-outlined text-[20px]">dashboard</span>
                          <span>Overview</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-secondary hover:bg-surface-container/50 font-label-md text-label-md" href="/create-qr">
                          <span className="material-symbols-outlined text-[20px]">add_box</span>
                          <span>Create Review QR</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-secondary hover:bg-surface-container/50 font-label-md text-label-md" href="/my-qr-codes">
                          <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                          <span>My QR Codes</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-secondary hover:bg-surface-container/50 font-label-md text-label-md" href="/analytics">
                          <span className="material-symbols-outlined text-[20px]">insights</span>
                          <span>Analytics</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-secondary hover:bg-surface-container/50 font-label-md text-label-md" href="/settings">
                          <span className="material-symbols-outlined text-[20px]">settings</span>
                          <span>Settings</span>
                        </Link>
                      </nav>
                    </div>
                    <div className="p-3 bg-surface-container-lowest rounded-xl shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs">RP</div>
                        <div className="flex flex-col text-left overflow-hidden">
                          <span className="font-label-md text-label-md text-on-surface truncate font-semibold">Your business</span>
                          <span className="font-body-sm text-body-sm text-secondary truncate">Destination not verified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="lg:col-span-9 p-6 sm:p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-surface-container-low p-4 rounded-xl">
                        <span className="font-body-sm text-body-sm text-secondary">Total Monthly Scans</span>
                        <p className="font-headline-lg text-headline-lg text-on-surface font-bold mt-1">—</p>
                        <span className="text-secondary font-label-md text-label-md flex items-center gap-1 mt-1 font-semibold">
                          Analytics not connected
                        </span>
                      </div>
                      <div className="bg-surface-container-low p-4 rounded-xl">
                        <span className="font-body-sm text-body-sm text-secondary">Google Review Conversion</span>
                        <p className="font-headline-lg text-headline-lg text-on-surface font-bold mt-1">—</p>
                        <span className="text-secondary font-label-md text-label-md flex items-center gap-1 mt-1 font-semibold">
                          Conversion data unavailable
                        </span>
                      </div>
                      <div className="bg-surface-container-low p-4 rounded-xl">
                        <span className="font-body-sm text-body-sm text-secondary">Active Physical Stands</span>
                        <p className="font-headline-lg text-headline-lg text-on-surface font-bold mt-1">—</p>
                        <span className="text-secondary font-label-md text-label-md flex items-center gap-1 mt-1 font-semibold">
                          Connect a workspace to see QR codes
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-surface-container-low p-5 rounded-xl">
                      <div className="md:col-span-7 space-y-4">
                        <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Stand Design Studio</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="font-label-caps text-label-caps uppercase text-secondary block mb-1">Business Name</label>
                            <div className="bg-surface-container-lowest px-3 py-2 rounded-lg font-body-md text-body-md text-on-surface font-medium">Your business</div>
                          </div>
                          <div>
                            <label className="font-label-caps text-label-caps uppercase text-secondary block mb-1">Direct Google Review Link</label>
                            <div className="bg-surface-container-lowest px-3 py-2 rounded-lg font-body-sm text-body-sm text-secondary truncate font-mono">No destination selected</div>
                          </div>
                          <div>
                            <label className="font-label-caps text-label-caps uppercase text-secondary block mb-1">Theme Palette</label>
                            <div className="flex gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary-container ring-2 ring-primary ring-offset-2"></span>
                              <span className="w-6 h-6 rounded-full bg-tertiary"></span>
                              <span className="w-6 h-6 rounded-full bg-[#FBBC04]"></span>
                              <span className="w-6 h-6 rounded-full bg-inverse-surface"></span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-5 flex flex-col items-center justify-center bg-surface-container-lowest p-4 rounded-xl shadow-sm text-center">
                        <span className="font-label-caps text-label-caps uppercase text-secondary mb-2">Illustrative poster preview</span>
                        <div className="w-24 h-24 bg-surface-container flex items-center justify-center rounded-lg mb-2">
                          <span className="material-symbols-outlined text-[48px] text-primary">qr_code_2</span>
                        </div>
                        <span className="font-label-md text-label-md font-bold text-on-surface">Export unavailable</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-10">
                <Link className="inline-flex items-center gap-2 px-space-xl py-3 rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-md hover:bg-primary transition-all font-semibold" href="/dashboard">
                  <span>Explore ReviewQR Studio</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </section>

          {/* 7. CUSTOMIZATION GALLERY (4 PRESETS) */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider block mb-2">Design Presets</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Your brand. Your style. Your review QR.</h2>
              <p className="font-body-lg text-body-lg text-secondary">
                Choose from expertly tailored display presets engineered for high legibility, tabletop durability, and immediate phone focus.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Preset 1 */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center">
                <div className="w-full py-2 bg-surface-container-low rounded-lg mb-4">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface font-bold">1. Minimal Scandinavian</span>
                </div>
                <div className="w-32 h-32 bg-surface-container-low rounded-xl flex items-center justify-center my-4">
                  <span className="material-symbols-outlined text-[54px] text-on-surface">qr_code</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">Crisp Monochrome</h4>
                <p className="font-body-sm text-body-sm text-secondary mb-4">Ideal for modern coffee shops, architect offices, and clean concept stores.</p>
                <div className="mt-auto flex items-center gap-1 text-[#FBBC04]">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
              </div>

              {/* Preset 2 */}
              <div className="bg-inverse-surface rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center text-inverse-on-surface">
                <div className="w-full py-2 bg-white/10 rounded-lg mb-4">
                  <span className="font-label-caps text-label-caps uppercase text-[#FBBC04] font-bold">2. Luxury Velvet</span>
                </div>
                <div className="w-32 h-32 bg-white/5 rounded-xl border border-[#FBBC04]/30 flex items-center justify-center my-4">
                  <span className="material-symbols-outlined text-[54px] text-[#FBBC04]">qr_code</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-white mb-1 font-bold">Gold &amp; Slate Dark</h4>
                <p className="font-body-sm text-body-sm text-inverse-on-surface/70 mb-4">Built for fine dining, candlelit wine bars, and boutique aesthetics.</p>
                <div className="mt-auto flex items-center gap-1 text-[#FBBC04]">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
              </div>

              {/* Preset 3 */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center">
                <div className="w-full py-2 bg-[#FBBC04]/20 rounded-lg mb-4">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface font-bold">3. Warm Artisan</span>
                </div>
                <div className="w-32 h-32 bg-[#FBBC04]/10 rounded-xl flex items-center justify-center my-4">
                  <span className="material-symbols-outlined text-[54px] text-tertiary">qr_code</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">Terracotta &amp; Green</h4>
                <p className="font-body-sm text-body-sm text-secondary mb-4">Designed for bakeries, organic grocers, plant boutiques, and yoga studios.</p>
                <div className="mt-auto flex items-center gap-1 text-[#FBBC04]">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
              </div>

              {/* Preset 4 */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center">
                <div className="w-full py-2 bg-primary-fixed/40 rounded-lg mb-4">
                  <span className="font-label-caps text-label-caps uppercase text-primary font-bold">4. Trust Google Classic</span>
                </div>
                <div className="w-32 h-32 bg-surface-container rounded-xl flex items-center justify-center my-4">
                  <span className="material-symbols-outlined text-[54px] text-primary">qr_code</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">High-Recognition Blue</h4>
                <p className="font-body-sm text-body-sm text-secondary mb-4">Maximum conversion familiarity for family hotels, clinics, and car services.</p>
                <div className="mt-auto flex items-center gap-1 text-[#FBBC04]">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
              </div>
            </div>
          </section>

          {/* 8. FAQ ACCORDION SECTION */}
          <section className="w-full bg-surface-container-low py-20 lg:py-28" id="faq">
            <div className="max-w-4xl mx-auto px-6 lg:px-12">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider block mb-2">Got Questions?</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Frequently Asked Questions</h2>
                <p className="font-body-lg text-body-lg text-secondary">
                  Clear, straightforward answers about the current prototype and its limitations.
                </p>
              </div>

              <div className="space-y-4">
                {/* FAQ item 1 */}
                <details className="group bg-surface-container-lowest rounded-xl p-5 shadow-sm">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">What is ReviewQR?</span>
                    <span className="material-symbols-outlined text-secondary transition-transform group-open:rotate-180">expand_more</span>
                  </summary>
                  <div className="mt-4 pt-3 border-t border-surface-container font-body-md text-body-md text-secondary leading-relaxed">
                    ReviewQR is a prototype for designing QR posters that point customers to a business-selected destination. QR designs remain browser-local, and public customer QR pages are not currently available.
                  </div>
                </details>

                {/* FAQ item 2 */}
                <details className="group bg-surface-container-lowest rounded-xl p-5 shadow-sm">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Do customers need to download an app or log in?</span>
                    <span className="material-symbols-outlined text-secondary transition-transform group-open:rotate-180">expand_more</span>
                  </summary>
                  <div className="mt-4 pt-3 border-t border-surface-container font-body-md text-body-md text-secondary leading-relaxed">
                    The public customer QR page is not currently available. The intended flow is to scan a printed QR code and open its destination in a browser.
                  </div>
                </details>

                {/* FAQ item 3 */}
                <details className="group bg-surface-container-lowest rounded-xl p-5 shadow-sm">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Can customers freely edit their review before posting?</span>
                    <span className="material-symbols-outlined text-secondary transition-transform group-open:rotate-180">expand_more</span>
                  </summary>
                  <div className="mt-4 pt-3 border-t border-surface-container font-body-md text-body-md text-secondary leading-relaxed">
                    ReviewQR does not submit reviews. Customers choose whether to edit their own text and submit feedback through the saved external destination.
                  </div>
                </details>

                {/* FAQ item 4 */}
                <details className="group bg-surface-container-lowest rounded-xl p-5 shadow-sm">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Does ReviewQR automatically post reviews on Google?</span>
                    <span className="material-symbols-outlined text-secondary transition-transform group-open:rotate-180">expand_more</span>
                  </summary>
                  <div className="mt-4 pt-3 border-t border-surface-container font-body-md text-body-md text-secondary leading-relaxed">
                    ReviewQR does not submit reviews on a customer&apos;s behalf. Customers must follow the external provider&apos;s applicable policies and submit their own reviews directly.
                  </div>
                </details>

                {/* FAQ item 5 */}
                <details className="group bg-surface-container-lowest rounded-xl p-5 shadow-sm">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">What formats do the printable stands export to?</span>
                    <span className="material-symbols-outlined text-secondary transition-transform group-open:rotate-180">expand_more</span>
                  </summary>
                  <div className="mt-4 pt-3 border-t border-surface-container font-body-md text-body-md text-secondary leading-relaxed">
                    The QR Design Studio has limited local export functionality. Print-ready PDF sizes, crop marks, and export fidelity have not been verified.
                  </div>
                </details>
              </div>
            </div>
          </section>

          {/* 9. FINAL CALL TO ACTION (Curved Mesh Card) */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
            <div className="relative bg-gradient-to-br from-primary via-primary-container to-surface-tint rounded-3xl p-10 sm:p-16 text-center text-on-primary-container overflow-hidden shadow-2xl">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
              <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
              <div className="relative z-10 max-w-2xl mx-auto">
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-fixed block mb-3 font-bold">
                  Get Started Today
                </span>
                <h2 className="font-display-hero text-display-hero text-on-primary mb-6 tracking-tight">
                  Make It Easier for Customers to Share Their Experience.
                </h2>
                <p className="font-body-lg text-body-lg text-primary-fixed mb-8 leading-relaxed">
                  Explore the prototype and its current QR poster design workflow.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                  <Link
                    className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-surface-container-lowest text-primary font-label-lg text-label-lg shadow-xl hover:bg-surface-container-low transition-all active:scale-95 font-bold"
                    href="/signup"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white/10 text-on-primary font-label-lg text-label-lg hover:bg-white/20 transition-all font-semibold"
                    href="/login"
                  >
                    Already have an account? Log in
                  </Link>
                </div>
                <p className="font-body-sm text-body-sm text-primary-fixed/80">
                  Prototype · Business destination requires configured Supabase
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface-container-low">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-space-2xl">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-space-xl mb-space-2xl">
            <div className="md:col-span-2 space-y-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center p-1.5">
                  <div className="w-full h-full rounded border-2 border-on-primary-container p-0.5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-on-primary-container rounded-xs"></div>
                  </div>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight">
                  Review<span className="text-primary-container">QR</span>
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                Helping local businesses design QR touchpoints for customer-selected feedback destinations.
              </p>
              <div className="inline-flex items-center gap-space-sm px-space-sm py-space-xs rounded-full bg-surface-container">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">Prototype; some features unavailable</span>
              </div>
            </div>

            <div>
              <h4 className="font-label-caps text-label-caps uppercase text-on-surface mb-space-md tracking-wider font-bold">Product</h4>
              <ul className="space-y-space-sm">
                <li className="font-body-md text-body-md"><Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/qr-studio">QR Design Studio</Link></li>
                <li className="font-body-md text-body-md text-on-surface-variant">Customer QR flow is unavailable.</li>
                <li className="font-body-md text-body-md text-on-surface-variant">Print via browser; output is not print-certified.</li>
                <li className="font-body-md text-body-md text-on-surface-variant">Analytics are unavailable.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-label-caps text-label-caps uppercase text-on-surface mb-space-md tracking-wider font-bold">Resources</h4>
              <ul className="space-y-space-sm">
                <li className="font-body-md text-body-md"><a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#faq">Help Center &amp; FAQ</a></li>
                <li className="font-body-md text-body-md"><a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#how-it-works">Implementation Guide</a></li>
                <li className="font-body-md text-body-md text-on-surface-variant">Customer stories are not available.</li>
                <li className="font-body-md text-body-md text-on-surface-variant">API documentation is available in the repository.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-label-caps text-label-caps uppercase text-on-surface mb-space-md tracking-wider font-bold">Legal &amp; Trust</h4>
              <ul className="space-y-space-sm">
                <li className="font-body-md text-body-md text-on-surface-variant">Privacy policy not published</li>
                <li className="font-body-md text-body-md text-on-surface-variant">Terms of service not published</li>
                <li className="font-body-md text-body-md text-on-surface-variant">Cookie settings not available</li>
                <li className="font-body-md text-body-md text-on-surface-variant">Security documentation is in progress</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-space-xl text-on-surface-variant border-t border-surface-container">
            <p className="font-body-sm text-body-sm">© ReviewQR</p>
            <p className="font-body-sm text-body-sm flex items-center gap-space-xs mt-space-sm sm:mt-0">
              <span className="material-symbols-outlined text-[16px] text-tertiary-container">info</span>
              Independent prototype; not affiliated with Google
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
