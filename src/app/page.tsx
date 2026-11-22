'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const PHRASING_SUGGESTIONS: Record<number, string[]> = {
  5: [
    'The service was excellent and staff made us feel very welcome.',
    'Delicious food, spotless rooms, and wonderful hospitality!',
    'Top-tier attention to detail. Will definitely visit again soon.',
  ],
  4: [
    'Great overall experience. Friendly staff and good location.',
    'Pleasant atmosphere and quick service during our visit.',
    'Very satisfying visit with good value and attentive personnel.',
  ],
  3: [
    'Service was reasonable and the staff was polite, though slightly slow.',
    'Decent visit, nice venue space and courteous personnel.',
    'Met basic expectations; fair experience with room for minor improvements.',
  ],
  2: [
    'Experience was fair, but checkout was slightly slow.',
    'Room was acceptable though wait times could be improved.',
    'Underwhelming visit; service coordination fell short of expectations.',
  ],
  1: [
    'Disappointed with the delay in service during our stay.',
    'Staff responsiveness was poor and our concerns went unaddressed.',
    'Unsatisfactory experience overall; significant improvements are needed.',
  ],
};

const RATING_LABELS: Record<number, string> = {
  5: '5 out of 5 stars — Outstanding experience!',
  4: '4 out of 5 stars — Very good stay',
  3: '3 out of 5 stars — Average experience',
  2: '2 out of 5 stars — Below expectations',
  1: '1 out of 5 stars — Needs improvement',
};

export default function LandingPage() {
  // 1. Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const sliderTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSliderPaused) return;
    sliderTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 5500);

    return () => {
      if (sliderTimerRef.current) clearInterval(sliderTimerRef.current);
    };
  }, [isSliderPaused]);

  // 2. Interactive Live Demo State
  const [demoState, setDemoState] = useState<'camera' | 'scanning' | 'flow' | 'google'>('camera');
  const [demoRating, setDemoRating] = useState<number>(5);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>(
    PHRASING_SUGGESTIONS[5][0]
  );
  const [showClipboardToast, setShowClipboardToast] = useState(false);

  // 3. Feature Tabs State
  const [activeTab, setActiveTab] = useState<'tab-1' | 'tab-2' | 'tab-3' | 'tab-4'>('tab-1');

  // 4. FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // 5. Video Showcase Mock
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeChapter, setActiveChapter] = useState(1);

  const handleRatingChange = (rating: number) => {
    setDemoRating(rating);
    const suggestions = PHRASING_SUGGESTIONS[rating] || PHRASING_SUGGESTIONS[5];
    setSelectedSuggestion(suggestions[0]);
  };

  const handleSimulateScan = () => {
    setDemoState('scanning');
    setTimeout(() => {
      setDemoState('flow');
      setDemoRating(5);
      setSelectedSuggestion(PHRASING_SUGGESTIONS[5][0]);
    }, 900);
  };

  const handleResetDemo = () => {
    setDemoState('camera');
    setDemoRating(5);
    setSelectedSuggestion(PHRASING_SUGGESTIONS[5][0]);
    setShowClipboardToast(false);
  };

  const handleCopyReview = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(selectedSuggestion);
      }
    } catch {
      // fallback if clipboard api is restricted
    }
    setShowClipboardToast(true);
    setTimeout(() => {
      setShowClipboardToast(false);
      setDemoState('google');
    }, 1200);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <div className="bg-surface text-on-surface antialiased overflow-x-hidden selection:bg-primary-light selection:text-primary min-h-screen">
      {/* 1. STICKY TOP NAVBAR */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-outline/70 transition-all">
        <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between py-2.5">
          {/* Brand Logo */}
          <Link
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-primary rounded-xl py-1 px-1.5"
            href="/"
          >
            <Image
              src="/revvly-logo.png"
              alt="Revvly — Scan • Review • Grow"
              width={200}
              height={56}
              priority
              className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105 duration-200"
            />
          </Link>

          {/* Center Anchor Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary">
            <a className="hover:text-primary transition-colors py-1" href="#product-slider">
              Product
            </a>
            <a className="hover:text-primary transition-colors py-1" href="#how-it-works">
              How It Works
            </a>
            <a
              className="hover:text-primary transition-colors py-1 flex items-center gap-1.5 text-navy font-semibold"
              href="#interactive-demo"
            >
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              Live Demo
            </a>
            <a className="hover:text-primary transition-colors py-1" href="#features">
              Features
            </a>
            <a className="hover:text-primary transition-colors py-1" href="#faq">
              FAQ
            </a>
          </nav>

          {/* Right Single Action CTA (No Login / Sign-up links anywhere) */}
          <div className="flex items-center gap-3">
            <Link
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-display text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 active:scale-98 transition-all"
              href="/create-qr"
            >
              <span>Create Your QR</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full pt-20">
        {/* ================= 2. CINEMATIC HERO SECTION ================= */}
        <section className="relative w-full overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
          {/* Ambient Radial Backdrops */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-tr from-primary/10 via-primary-light/40 to-blue-200/20 blur-3xl pointer-events-none rounded-full -z-10"></div>
          <div className="absolute -top-32 right-10 w-96 h-96 bg-google-yellow/10 blur-3xl pointer-events-none rounded-full -z-10"></div>

          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-outline shadow-sm mb-6 animate-pulse-subtle">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span className="text-xs font-semibold tracking-wider uppercase font-mono text-primary">
                  THE SMARTER WAY TO COLLECT REVIEWS
                </span>
                <span className="material-symbols-outlined text-primary text-[15px]">auto_awesome</span>
              </div>

              {/* Headline */}
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-navy tracking-tight leading-[1.12] mb-6">
                Turn Every Happy Customer Into Your Next Great Review.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg lg:text-xl text-secondary font-normal max-w-3xl leading-relaxed mb-10">
                Create beautiful, branded QR experiences that help customers share feedback and leave Google reviews with less friction. Design your QR, personalize the experience, and make every customer interaction count.
              </p>

              {/* CTA Cluster */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-5">
                <Link
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-primary text-white font-display text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
                  href="/create-qr"
                >
                  <span>Create Your Free QR</span>
                  <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                </Link>
                <a
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white border border-outline text-navy font-display text-base font-semibold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
                  href="#product-slider"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary">play_circle</span>
                  <span>See How It Works</span>
                </a>
              </div>

              {/* Trust Subtext */}
              <div className="flex items-center justify-center gap-6 text-xs sm:text-sm font-medium text-secondary">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px] text-tertiary">check_circle</span> Easy to create
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px] text-tertiary">check_circle</span> Simple to scan
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px] text-tertiary">check_circle</span> Ready to share
                </span>
              </div>
            </div>

            {/* Hero Visual Composition: Realistic Acrylic Standee & Mobile Mockup */}
            <div className="relative max-w-5xl mx-auto">
              {/* Floating Badge Capsule 1 */}
              <div className="hidden sm:flex absolute -top-6 -left-4 lg:-left-8 z-30 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-glass border border-white/60 items-center gap-3 animate-float-slow">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-tertiary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">bolt</span>
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-navy block font-display">Zero App Download Required</span>
                  <span className="text-[11px] text-secondary">Native iOS &amp; Android camera instant launch</span>
                </div>
              </div>

              {/* Floating Badge Capsule 2 */}
              <div className="hidden sm:flex absolute top-1/2 -right-4 lg:-right-8 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-glass border border-white/60 items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">map</span>
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-navy block font-display">Direct Google Maps Handoff</span>
                  <span className="text-[11px] text-secondary">Pre-populated verified venue destination</span>
                </div>
              </div>

              {/* Floating Badge Capsule 3 */}
              <div className="hidden md:flex absolute -bottom-5 left-1/3 z-30 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full shadow-glass border border-white/60 items-center gap-2">
                <span className="material-symbols-outlined text-google-green text-[18px]">verified_user</span>
                <span className="text-xs font-semibold text-navy">100% Google Review Policy Compliant (No Gating)</span>
              </div>

              {/* Main Interactive Stage Frame */}
              <div className="bg-gradient-to-b from-white/90 to-surface-muted/80 rounded-3xl p-6 sm:p-10 lg:p-12 border border-white shadow-glass relative overflow-hidden backdrop-blur-sm">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Realistic Tabletop Acrylic Standee (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="relative w-full max-w-[290px] bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center transform transition-transform hover:scale-[1.02] duration-300">
                      {/* Acrylic Top Specular Sheen */}
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-t-2xl"></div>

                      {/* Standee Badge */}
                      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs text-secondary font-mono">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">TABLETOP STANDEE</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 4×6&quot; ACRYLIC
                        </span>
                      </div>

                      {/* Venue Emblem & Name */}
                      <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary mb-2 shadow-inner">
                        <span className="material-symbols-outlined text-[26px]">hotel</span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-navy tracking-tight">Royal Palace Hotel</h3>
                      <p className="text-xs text-secondary mb-4 uppercase tracking-wider font-semibold font-mono">
                        Restaurant &amp; Suite Lounge
                      </p>

                      {/* High Precision QR Artwork */}
                      <div className="relative p-3 bg-white rounded-xl shadow-inner border border-slate-100 mb-4 group cursor-pointer">
                        <svg className="w-40 h-40 text-navy" fill="currentColor" viewBox="0 0 140 140">
                          {/* Corner Target 1 */}
                          <rect fill="none" height="38" rx="6" stroke="currentColor" strokeWidth="7" width="38" x="8" y="8"></rect>
                          <rect height="14" rx="3" width="14" x="20" y="20"></rect>
                          {/* Corner Target 2 */}
                          <rect fill="none" height="38" rx="6" stroke="currentColor" strokeWidth="7" width="38" x="94" y="8"></rect>
                          <rect height="14" rx="3" width="14" x="106" y="20"></rect>
                          {/* Corner Target 3 */}
                          <rect fill="none" height="38" rx="6" stroke="currentColor" strokeWidth="7" width="38" x="8" y="94"></rect>
                          <rect height="14" rx="3" width="14" x="20" y="106"></rect>
                          {/* Matrix Data Points */}
                          <circle cx="58" cy="18" r="4"></circle>
                          <circle cx="74" cy="22" r="4"></circle>
                          <circle cx="56" cy="36" r="4"></circle>
                          <circle cx="78" cy="38" r="4"></circle>
                          <circle cx="18" cy="62" r="4"></circle>
                          <circle cx="32" cy="70" r="4"></circle>
                          <circle cx="102" cy="62" r="4"></circle>
                          <circle cx="118" cy="74" r="4"></circle>
                          <rect fill="#1A73E8" fillOpacity="0.12" height="32" rx="8" width="32" x="54" y="54"></rect>
                          <circle cx="60" cy="98" r="4"></circle>
                          <circle cx="76" cy="106" r="4"></circle>
                          <circle cx="100" cy="98" r="4"></circle>
                          <circle cx="116" cy="116" r="4"></circle>
                          <circle cx="84" cy="120" r="4"></circle>
                        </svg>

                        {/* Google G Badge Centered in QR */}
                        <div className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center border border-slate-200">
                          <span className="font-display font-extrabold text-primary text-base">G</span>
                        </div>
                      </div>

                      {/* Google Reviews Callout */}
                      <div className="font-display font-bold text-sm text-navy mb-1 flex items-center gap-1">
                        <span>Review us on</span>
                        <span className="text-primary font-bold">Google</span>
                      </div>

                      {/* 5 Gold Stars */}
                      <div className="flex items-center gap-1 text-google-yellow mb-3">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      </div>

                      {/* Bottom instruction */}
                      <div className="w-full bg-slate-50 py-2 px-3 rounded-lg border border-slate-100">
                        <p className="text-[11px] font-semibold text-secondary">Point phone camera &amp; tap notification</p>
                      </div>
                    </div>
                  </div>

                  {/* Center Flow Connector */}
                  <div className="hidden lg:flex lg:col-span-1 justify-center items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
                    </div>
                  </div>

                  {/* Right Column: Interactive Mobile Review Flow Experience (6 cols) */}
                  <div className="lg:col-span-6 flex justify-center">
                    <div className="w-full max-w-[340px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 relative">
                      {/* Device Status Bar */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center font-display font-bold text-[11px]">
                            R
                          </div>
                          <span className="font-display font-bold text-xs text-navy">Review Assistant</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold">
                          Web Powered
                        </span>
                      </div>

                      {/* Business Info Card */}
                      <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-outline mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary font-bold">
                          <span className="material-symbols-outlined text-[20px]">apartment</span>
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-sm text-navy">Royal Palace Hotel</h4>
                          <p className="text-xs text-secondary">Google Verified · Restaurant</p>
                        </div>
                      </div>

                      {/* Interactive Star Rating Indicator */}
                      <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100 mb-4">
                        <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block mb-1">
                          How was your visit?
                        </span>
                        <div className="flex justify-center gap-1.5 text-google-yellow my-1">
                          <button className="material-symbols-outlined text-[28px] hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }} type="button">star</button>
                          <button className="material-symbols-outlined text-[28px] hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }} type="button">star</button>
                          <button className="material-symbols-outlined text-[28px] hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }} type="button">star</button>
                          <button className="material-symbols-outlined text-[28px] hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }} type="button">star</button>
                          <button className="material-symbols-outlined text-[28px] hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }} type="button">star</button>
                        </div>
                        <span className="text-xs font-bold text-navy">5 out of 5 stars — Excellent!</span>
                      </div>

                      {/* Sample Suggestions */}
                      <div className="space-y-2 mb-4 text-left">
                        <div className="flex items-center justify-between text-[11px] text-secondary">
                          <span className="font-bold uppercase tracking-wider">Suggested Phrasing</span>
                          <span className="text-primary font-semibold">Tap to select</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-primary-light/50 border border-primary/20 flex items-center justify-between cursor-pointer">
                          <span className="text-xs text-navy font-medium">&quot;Polite staff and quick check-in experience.&quot;</span>
                          <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between cursor-pointer opacity-70">
                          <span className="text-xs text-secondary">&quot;Spotless rooms and wonderful dining.&quot;</span>
                          <span className="material-symbols-outlined text-slate-300 text-[18px]">radio_button_unchecked</span>
                        </div>
                      </div>

                      {/* Google Review Action Button */}
                      <button
                        className="w-full py-3 px-4 rounded-xl bg-primary text-white font-display text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:bg-primary-hover transition-colors"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        <span>Copy &amp; Go to Google Review</span>
                      </button>
                      <p className="text-[10px] text-center text-slate-400 mt-2">Authentic direct review posted from your Google Account</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3. PRODUCT SLIDER SECTION ================= */}
        <section className="w-full bg-white py-20 lg:py-28 border-y border-outline/80" id="product-slider">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            {/* Header with controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary font-mono mb-2">
                  <span>INTERACTIVE WALKTHROUGH</span>
                </div>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-navy">
                  Designed for the Entire Review Journey
                </h2>
                <p className="text-secondary text-base mt-2 max-w-xl">
                  From merchant creation to physical customer scan and verified Google feedback in four streamlined stages.
                </p>
              </div>

              {/* Slide Controls */}
              <div className="flex items-center gap-4">
                <div className="text-xs font-mono font-semibold text-secondary">
                  <span className="text-navy font-bold text-base">
                    {String(currentSlide + 1).padStart(2, '0')}
                  </span>{' '}
                  / 04
                </div>
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Previous Slide"
                    className="w-10 h-10 rounded-xl bg-slate-100 text-navy hover:bg-slate-200 flex items-center justify-center transition-colors"
                    onClick={() => setCurrentSlide((prev) => (prev === 0 ? 3 : prev - 1))}
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <button
                    aria-label="Next Slide"
                    className="w-10 h-10 rounded-xl bg-primary text-white hover:bg-primary-hover flex items-center justify-center transition-colors shadow-sm"
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % 4)}
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {[
                { step: '01 CREATE', title: 'Create Your QR' },
                { step: '02 BRAND', title: 'Customize Branding' },
                { step: '03 SCAN', title: 'Scan & Experience' },
                { step: '04 REVIEW', title: 'Review & Redirect' },
              ].map((tab, idx) => {
                const isActive = currentSlide === idx;
                return (
                  <button
                    key={tab.step}
                    onClick={() => setCurrentSlide(idx)}
                    className={`py-3 px-4 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'border-primary bg-primary-light opacity-100'
                        : 'border-slate-200 bg-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span
                      className={`block text-[11px] font-mono font-bold mb-0.5 ${
                        isActive ? 'text-primary' : 'text-slate-400'
                      }`}
                    >
                      {tab.step}
                    </span>
                    <span className="block text-xs font-bold text-navy font-display">
                      {tab.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Slider Content Viewport */}
            <div
              className="relative w-full bg-surface-muted rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden border border-outline min-h-[460px] flex items-center"
              onMouseEnter={() => setIsSliderPaused(true)}
              onMouseLeave={() => setIsSliderPaused(false)}
            >
              {/* Slide 1: Create */}
              {currentSlide === 0 && (
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center transition-opacity duration-300">
                  <div className="lg:col-span-6 space-y-4">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                      STEP 01 — FAST SETUP
                    </span>
                    <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-navy">
                      Enter Your Details &amp; Instant Google Place Matching
                    </h3>
                    <p className="text-secondary text-base leading-relaxed">
                      Connect your physical venue in seconds. Simply input your business name or paste your direct Google Maps review link. Revvly automatically binds your Google Place ID and configures direct deep-links for iPhone and Android.
                    </p>
                    <div className="space-y-2 pt-2 text-sm text-navy">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                        <span>Auto-resolves Google review shortlinks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                        <span>Generates print-ready high-density QR matrix</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                        <span>Multi-location &amp; section zoning support</span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80">
                    <div className="text-xs font-bold text-secondary uppercase font-mono mb-4 pb-2 border-b border-slate-100">
                      Revvly Merchant Portal
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">Business or Venue Name</label>
                        <div className="p-2.5 rounded-lg bg-surface border border-slate-200 text-sm font-semibold text-navy flex items-center justify-between">
                          <span>Royal Palace Hotel &amp; Suites</span>
                          <span className="material-symbols-outlined text-emerald-500 text-[18px]">verified</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">Google Maps Review Link</label>
                        <div className="p-2.5 rounded-lg bg-surface border border-slate-200 text-xs font-mono text-secondary truncate">
                          https://g.page/r/Cb41940aYqGxEBM/review
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-600">link</span>
                        <span className="text-xs text-emerald-800 font-medium">Valid Google Place link confirmed! Native handoff ready.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 2: Customize */}
              {currentSlide === 1 && (
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center transition-opacity duration-300">
                  <div className="lg:col-span-6 space-y-4">
                    <span className="px-3 py-1 rounded-full bg-google-yellow/20 text-yellow-800 text-xs font-bold font-mono">
                      STEP 02 — BESPOKE DISPLAY
                    </span>
                    <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-navy">
                      Tailor Standees &amp; Tent Cards to Your Ambiance
                    </h3>
                    <p className="text-secondary text-base leading-relaxed">
                      Whether you operate a minimalist third-wave cafe, a candlelit wine lounge, or a family boutique hotel, pick from 4 crafted styles or design with custom palettes, fonts, and acrylic stands.
                    </p>
                    <div className="space-y-2 pt-2 text-sm text-navy">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                        <span>Minimalist, Dark Velvet, Warm Artisan &amp; Classic themes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                        <span>Acrylic 4×6&quot;, 5×7&quot; and table tent dimension presets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                        <span>One-click 300 DPI CMYK PDF export with bleed</span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80 flex justify-center">
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="p-4 rounded-xl bg-slate-900 text-white text-center shadow-md">
                        <div className="w-8 h-8 rounded-full bg-yellow-400/20 text-yellow-400 mx-auto flex items-center justify-center text-xs font-bold mb-2">★</div>
                        <span className="text-xs font-bold block">Velvet Dark</span>
                        <span className="text-[10px] text-slate-400">Nightclub &amp; Lounge</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-primary-light text-primary mx-auto flex items-center justify-center text-xs font-bold mb-2">★</div>
                        <span className="text-xs font-bold block text-navy">Clean Minimal</span>
                        <span className="text-[10px] text-secondary">Cafes &amp; Studios</span>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 mx-auto flex items-center justify-center text-xs font-bold mb-2">★</div>
                        <span className="text-xs font-bold block text-amber-900">Warm Artisan</span>
                        <span className="text-[10px] text-amber-700">Bakeries &amp; Spas</span>
                      </div>
                      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-primary text-white mx-auto flex items-center justify-center text-xs font-bold mb-2">G</div>
                        <span className="text-xs font-bold block text-blue-900">Google Classic</span>
                        <span className="text-[10px] text-blue-600">Hotels &amp; Clinics</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 3: Scan */}
              {currentSlide === 2 && (
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center transition-opacity duration-300">
                  <div className="lg:col-span-6 space-y-4">
                    <span className="px-3 py-1 rounded-full bg-tertiary/20 text-tertiary text-xs font-bold font-mono">
                      STEP 03 — SEAMLESS SCAN
                    </span>
                    <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-navy">
                      Friction-Free Camera Launch with Sub-400ms Speed
                    </h3>
                    <p className="text-secondary text-base leading-relaxed">
                      Guests simply point their default smartphone camera at the standee. No app downloads, no account setup, and zero awkward friction. The web experience pops up instantly in Safari or Chrome.
                    </p>
                    <div className="space-y-2 pt-2 text-sm text-navy">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                        <span>Works natively with any modern phone camera</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                        <span>High-contrast error correction for low-light venues</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                        <span>Optimized edge CDN delivers sub-second loads</span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-6 flex justify-center">
                    <div className="w-72 bg-navy rounded-3xl p-4 shadow-2xl border-4 border-slate-700 text-white text-center">
                      <div className="text-[10px] font-mono text-slate-400 mb-2">CAMERA VIEWFINDER</div>
                      <div className="relative w-48 h-48 mx-auto border-2 border-dashed border-primary rounded-xl flex items-center justify-center p-3 mb-3">
                        <span className="material-symbols-outlined text-primary text-[48px] animate-pulse">qr_code_scanner</span>
                        <div className="absolute inset-x-2 top-1/2 h-0.5 bg-primary shadow-glow-primary"></div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 text-xs text-left flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>revvly.io/royal-palace</span>
                        <span className="ml-auto text-primary font-bold">Open</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 4: Review */}
              {currentSlide === 3 && (
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center transition-opacity duration-300">
                  <div className="lg:col-span-6 space-y-4">
                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold font-mono">
                      STEP 04 — DIRECT HANDOFF
                    </span>
                    <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-navy">
                      Rating Select, Smart Prompts, and 1-Tap Google Post
                    </h3>
                    <p className="text-secondary text-base leading-relaxed">
                      Overcome writer&apos;s block. Customers tap optional phrasing suggestions that describe what they loved, auto-copy to clipboard, and land straight into the Google Reviews writing box.
                    </p>
                    <div className="space-y-2 pt-2 text-sm text-navy">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                        <span>Rating-specific phrasing suggestions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                        <span>Automated clipboard sync</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                        <span>Deep-link directly into Google Maps rating dialog</span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80">
                    <div className="text-xs font-bold text-emerald-600 uppercase font-mono mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span> Ready to Publish on Google
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 text-xs text-navy italic">
                      &quot;Outstanding dinner and impeccable service! Special thanks to the attentive staff.&quot;
                    </div>
                    <div className="flex items-center justify-between text-xs text-secondary font-mono">
                      <span>Copied to Clipboard</span>
                      <span className="text-primary font-bold">Google Maps App Opening...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= 4. LIVE QR SCAN DEMONSTRATION ================= */}
        <section className="w-full py-20 lg:py-28 bg-surface-card border-b border-outline" id="interactive-demo">
          <div className="max-w-7xl mx-auto px-6 lg:px-12" id="live-scan">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-tertiary text-xs font-bold font-mono mb-3 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                <span>WORKING INTERACTIVE SIMULATOR</span>
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-navy mb-4">
                Try the Live Revvly Experience
              </h2>
              <p className="text-secondary text-base sm:text-lg">
                Experience both sides in real time: trigger the standee laser scan on the left, and interact with the customer review assistant on the simulated smartphone on the right.
              </p>
            </div>

            {/* Split Screen Interactive Workbench */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-surface p-6 sm:p-10 lg:p-14 rounded-3xl border border-outline shadow-glass">
              {/* LEFT SIDE: Physical Standee with Laser Scanner Trigger (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-secondary font-bold">
                    Table Standee Hardware
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                      demoState === 'scanning'
                        ? 'bg-red-100 text-red-700'
                        : demoState === 'flow'
                        ? 'bg-emerald-100 text-emerald-800'
                        : demoState === 'google'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-primary-light text-primary'
                    }`}
                  >
                    {demoState === 'camera' && 'Step 1: Ready to Scan'}
                    {demoState === 'scanning' && 'Step 2: Laser Active...'}
                    {demoState === 'flow' && 'Step 3: Assistant Ready'}
                    {demoState === 'google' && 'Step 6: Google Review Ready'}
                  </span>
                </div>

                {/* Standee Card */}
                <div className="relative w-full max-w-[300px] bg-white rounded-2xl p-6 shadow-xl border border-slate-200 flex flex-col items-center text-center">
                  <div className="w-full flex items-center justify-between text-[11px] font-mono text-secondary pb-2 mb-2 border-b border-slate-100">
                    <span className="font-bold">STAND #08</span>
                    <span className="text-emerald-600 font-bold">VERIFIED PROFILE</span>
                  </div>
                  <div className="font-display font-bold text-navy text-base mt-1">Royal Palace Hotel</div>
                  <p className="text-[11px] text-secondary mb-3 font-mono">Bettiah · Fine Dining</p>

                  {/* QR Area with Active Laser Sweep */}
                  <div className="relative p-3 bg-white rounded-xl border-2 border-slate-200 shadow-inner overflow-hidden mb-3">
                    <svg className="w-44 h-44 text-navy" fill="currentColor" viewBox="0 0 140 140">
                      <rect fill="none" height="38" rx="6" stroke="currentColor" strokeWidth="7" width="38" x="8" y="8"></rect>
                      <rect height="14" rx="3" width="14" x="20" y="20"></rect>
                      <rect fill="none" height="38" rx="6" stroke="currentColor" strokeWidth="7" width="38" x="94" y="8"></rect>
                      <rect height="14" rx="3" width="14" x="106" y="20"></rect>
                      <rect fill="none" height="38" rx="6" stroke="currentColor" strokeWidth="7" width="38" x="8" y="94"></rect>
                      <rect height="14" rx="3" width="14" x="20" y="106"></rect>
                      <circle cx="58" cy="18" r="4"></circle>
                      <circle cx="74" cy="22" r="4"></circle>
                      <circle cx="56" cy="36" r="4"></circle>
                      <circle cx="78" cy="38" r="4"></circle>
                      <circle cx="18" cy="62" r="4"></circle>
                      <circle cx="32" cy="70" r="4"></circle>
                      <circle cx="102" cy="62" r="4"></circle>
                      <circle cx="118" cy="74" r="4"></circle>
                      <rect fill="#1A73E8" fillOpacity="0.12" height="32" rx="8" width="32" x="54" y="54"></rect>
                      <circle cx="60" cy="98" r="4"></circle>
                      <circle cx="76" cy="106" r="4"></circle>
                      <circle cx="100" cy="98" r="4"></circle>
                      <circle cx="116" cy="116" r="4"></circle>
                      <circle cx="84" cy="120" r="4"></circle>
                    </svg>

                    <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border border-slate-200">
                      <span className="font-display font-extrabold text-primary text-sm">G</span>
                    </div>

                    {/* Animated Laser Line */}
                    {demoState === 'scanning' && (
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#EA4335] animate-laser-sweep"></div>
                    )}
                  </div>

                  {/* Rating Callout */}
                  <div className="flex items-center gap-1 text-google-yellow mb-1">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                  <span className="text-xs font-bold text-navy">Review us on Google</span>
                </div>

                {/* Trigger Buttons */}
                <div className="mt-6 flex flex-col items-center gap-2 w-full max-w-[300px]">
                  <button
                    className="w-full py-3.5 px-6 rounded-xl bg-primary text-white font-display text-sm font-bold shadow-lg shadow-primary/25 hover:bg-primary-hover active:scale-98 transition-all flex items-center justify-center gap-2"
                    onClick={handleSimulateScan}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">center_focus_strong</span>
                    <span>Click to Simulate QR Scan</span>
                  </button>
                  <button
                    className="text-xs font-mono font-medium text-secondary hover:text-navy underline py-1"
                    onClick={handleResetDemo}
                    type="button"
                  >
                    Reset Demo to Beginning
                  </button>
                </div>
              </div>

              {/* RIGHT SIDE: Working Interactive Smartphone Frame (7 Cols) */}
              <div className="lg:col-span-7 flex justify-center">
                <div className="relative w-full max-w-[360px] bg-slate-900 rounded-[44px] p-3.5 shadow-2xl border-4 border-slate-700">
                  {/* Phone Dynamic Island Notch */}
                  <div className="w-28 h-5 bg-black rounded-full mx-auto mb-2 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                  </div>

                  {/* Phone Screen Window */}
                  <div className="w-full bg-white rounded-[32px] overflow-hidden min-h-[540px] flex flex-col relative">
                    {/* Phone Top Bar */}
                    <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs text-secondary font-mono">
                      <span>9:41</span>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px]">wifi</span>
                        <span className="material-symbols-outlined text-[15px]">battery_full</span>
                      </div>
                    </div>

                    {/* STATE 1: Camera Viewfinder (Initial) */}
                    {(demoState === 'camera' || demoState === 'scanning') && (
                      <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 border-2 border-dashed border-slate-300">
                          <span className="material-symbols-outlined text-[40px]">photo_camera</span>
                        </div>
                        <h4 className="font-display font-bold text-navy text-lg mb-1">
                          {demoState === 'scanning' ? 'Scanning Matrix...' : 'Camera Standby'}
                        </h4>
                        <p className="text-xs text-secondary mb-6 max-w-[220px]">
                          {demoState === 'scanning'
                            ? 'Aligning camera sensors to physical acrylic stand...'
                            : 'Click the blue "Simulate QR Scan" button on the left to scan the stand.'}
                        </p>
                        <div className="animate-bounce">
                          <span className="material-symbols-outlined text-primary text-[28px]">arrow_back</span>
                        </div>
                      </div>
                    )}

                    {/* STATE 2: Review Assistant Flow */}
                    {demoState === 'flow' && (
                      <div className="p-5 flex-1 flex flex-col">
                        {/* Assistant Header */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                              R
                            </div>
                            <span className="text-xs font-bold text-navy font-display">Royal Palace Hotel</span>
                          </div>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                            Instant Assistant
                          </span>
                        </div>

                        {/* Star Rating Clickable Area */}
                        <div className="bg-surface rounded-2xl p-3.5 text-center border border-outline mb-3">
                          <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block mb-1">
                            Tap a rating to test suggestions
                          </span>
                          <div className="flex justify-center gap-1.5 my-1.5">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isFilled = star <= demoRating;
                              return (
                                <button
                                  key={star}
                                  onClick={() => handleRatingChange(star)}
                                  className={`material-symbols-outlined text-[26px] hover:scale-110 transition-transform ${
                                    isFilled ? 'text-google-yellow' : 'text-slate-300'
                                  }`}
                                  style={{ fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0" }}
                                  type="button"
                                >
                                  star
                                </button>
                              );
                            })}
                          </div>
                          <span className="text-xs font-bold text-navy">
                            {RATING_LABELS[demoRating]}
                          </span>
                        </div>

                        {/* Dynamic Phrasing Suggestions */}
                        <div className="space-y-2 mb-3 flex-1">
                          <div className="flex items-center justify-between text-[11px] text-secondary">
                            <span className="font-bold uppercase tracking-wider">Suggested Phrasing</span>
                            <span className="text-[10px] text-primary">Tap to select text</span>
                          </div>
                          <div className="space-y-2">
                            {(PHRASING_SUGGESTIONS[demoRating] || PHRASING_SUGGESTIONS[5]).map((phrase) => {
                              const isSelected = selectedSuggestion === phrase;
                              return (
                                <div
                                  key={phrase}
                                  onClick={() => setSelectedSuggestion(phrase)}
                                  className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                                    isSelected
                                      ? 'bg-primary-light border-primary/40 text-navy font-medium'
                                      : 'bg-white border-slate-200 text-secondary hover:bg-slate-50'
                                  }`}
                                >
                                  <span>&quot;{phrase}&quot;</span>
                                  <span
                                    className={`material-symbols-outlined text-[18px] ${
                                      isSelected ? 'text-primary' : 'text-slate-300'
                                    }`}
                                  >
                                    {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Copy & Google Button */}
                        <div className="mt-auto space-y-2">
                          {showClipboardToast && (
                            <div className="p-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5 shadow-md">
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              <span>Review Copied to Clipboard!</span>
                            </div>
                          )}
                          <button
                            className="w-full py-3 px-4 rounded-xl bg-primary text-white font-display text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:bg-primary-hover active:scale-98 transition-all"
                            onClick={handleCopyReview}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                            <span>Copy &amp; Open Google Review</span>
                          </button>
                          <button
                            className="w-full text-center text-[11px] text-secondary hover:text-primary font-medium py-1"
                            onClick={() => setDemoState('google')}
                            type="button"
                          >
                            Preview pasted result on Google Maps →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STATE 3: Google Maps Destination View */}
                    {demoState === 'google' && (
                      <div className="p-5 flex-1 flex flex-col bg-slate-50">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-black text-primary text-base">Google</span>
                            <span className="text-xs font-medium text-secondary">Maps Reviews</span>
                          </div>
                          <button
                            className="text-xs text-primary font-bold"
                            onClick={() => setDemoState('flow')}
                            type="button"
                          >
                            Back
                          </button>
                        </div>
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                              JD
                            </div>
                            <div>
                              <span className="text-xs font-bold text-navy block">John Doe</span>
                              <span className="text-[10px] text-secondary">Posting publicly</span>
                            </div>
                          </div>
                          <div className="flex gap-1 text-google-yellow mb-2 text-sm">
                            {'★'.repeat(demoRating)}{'☆'.repeat(5 - demoRating)}
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-navy">
                            &quot;{selectedSuggestion}&quot;
                          </div>
                        </div>
                        <div className="mt-auto">
                          <button
                            className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold font-display shadow"
                            type="button"
                          >
                            Post Review on Google
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 5. PRODUCT WALKTHROUGH VIDEO SHOWCASE ================= */}
        <section className="w-full bg-navy text-white py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute -top-32 right-1/4 w-96 h-96 bg-primary/20 blur-3xl pointer-events-none rounded-full"></div>
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="px-3 py-1 rounded-full bg-white/10 text-primary-light text-xs font-bold font-mono uppercase tracking-wider inline-block mb-3">
                VIDEO WALKTHROUGH
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-3">
                See Revvly in Action
              </h2>
              <p className="text-slate-300 text-base">
                A frictionless 30-second path from physical table to verified Google review.
              </p>
            </div>

            {/* Video Player Frame */}
            <div className="max-w-4xl mx-auto bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
              <div
                className="relative aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-navy flex items-center justify-center p-8 text-center group cursor-pointer"
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              >
                <div className="flex flex-col items-center space-y-4">
                  <button
                    aria-label="Play Walkthrough Video"
                    className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[40px] ml-1">
                      {isVideoPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  <div className="text-center">
                    <h4 className="font-display font-bold text-xl text-white">
                      {isVideoPlaying ? 'Playing Walkthrough Demo' : 'Full Product Demonstration (0:30)'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">High-definition acrylic stands &amp; mobile handoff</p>
                  </div>
                </div>

                <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-mono text-slate-300 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isVideoPlaying ? 'bg-emerald-400' : 'bg-red-500'} animate-pulse`}></span>
                  <span>1080p 60FPS</span>
                </div>
              </div>

              {/* Video Player Chrome & Chapter Controls */}
              <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 space-y-4">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden relative cursor-pointer">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${(activeChapter / 4) * 100}%` }}
                  ></div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    {[
                      { num: 1, label: '01 Create' },
                      { num: 2, label: '02 Customize' },
                      { num: 3, label: '03 Scan' },
                      { num: 4, label: '04 Review' },
                    ].map((ch) => (
                      <button
                        key={ch.num}
                        onClick={() => setActiveChapter(ch.num)}
                        className={`px-2.5 py-1 rounded-md font-mono ${
                          activeChapter === ch.num
                            ? 'bg-white/10 text-white font-bold'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                        type="button"
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    <span>00:{String(activeChapter * 7).padStart(2, '0')}</span> / <span>00:30</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 6. HOW IT WORKS (Connected 4-Step Visual Timeline) ================= */}
        <section className="w-full py-20 lg:py-28 bg-surface" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono block mb-2">
                STREAMLINED TIMELINE
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-navy mb-4">
                How Revvly Works in Four Steps
              </h2>
              <p className="text-secondary text-base">
                No friction, no gating, and no complicated hardware. Just pure customer reviews.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {/* Step 1 */}
              <div className="bg-white rounded-2xl p-6 border border-outline shadow-subtle-card flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-primary text-white font-display font-bold text-base flex items-center justify-center mb-4 shadow-md shadow-primary/20">
                    01
                  </div>
                  <h3 className="font-display font-bold text-lg text-navy mb-2">Create Your QR</h3>
                  <p className="text-secondary text-xs leading-relaxed mb-4">
                    Add your business name, category, and direct Google Place review link to generate your unique matrix.
                  </p>
                </div>
                <div className="p-3 bg-surface rounded-xl border border-slate-100 text-xs font-mono text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">add_link</span>
                  <span>1-Click Place ID Link</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-2xl p-6 border border-outline shadow-subtle-card flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-google-yellow text-navy font-display font-bold text-base flex items-center justify-center mb-4 shadow-md shadow-google-yellow/20">
                    02
                  </div>
                  <h3 className="font-display font-bold text-lg text-navy mb-2">Customize Design</h3>
                  <p className="text-secondary text-xs leading-relaxed mb-4">
                    Curate tabletop standee themes: Minimalist, Dark Velvet, Artisan, or Google Blue with 300 DPI export.
                  </p>
                </div>
                <div className="p-3 bg-surface rounded-xl border border-slate-100 text-xs font-mono text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined text-google-yellow text-[18px]">palette</span>
                  <span>Print-Ready Acrylic Stand</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-2xl p-6 border border-outline shadow-subtle-card flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-tertiary text-white font-display font-bold text-base flex items-center justify-center mb-4 shadow-md shadow-tertiary/20">
                    03
                  </div>
                  <h3 className="font-display font-bold text-lg text-navy mb-2">Let Customers Scan</h3>
                  <p className="text-secondary text-xs leading-relaxed mb-4">
                    Place acrylic tents or counter decals where guests naturally spend time. Works on any phone camera.
                  </p>
                </div>
                <div className="p-3 bg-surface rounded-xl border border-slate-100 text-xs font-mono text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">center_focus_weak</span>
                  <span>Sub-400ms Web Launch</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-2xl p-6 border border-outline shadow-subtle-card flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-navy text-white font-display font-bold text-base flex items-center justify-center mb-4 shadow-md shadow-navy/20">
                    04
                  </div>
                  <h3 className="font-display font-bold text-lg text-navy mb-2">Collect Feedback</h3>
                  <p className="text-secondary text-xs leading-relaxed mb-4">
                    Guests pick a star rating, get instant phrasing suggestions, and 1-tap post directly on Google.
                  </p>
                </div>
                <div className="p-3 bg-surface rounded-xl border border-slate-100 text-xs font-mono text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  <span>100% Policy Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 7. INTERACTIVE FEATURE SHOWCASE ================= */}
        <section className="w-full py-20 lg:py-28 bg-white border-t border-outline" id="features">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono block mb-2">
                CORE CAPABILITIES
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-navy mb-4">
                Engineered Specifically for Physical Spaces
              </h2>
              <p className="text-secondary text-base">
                Every feature is calibrated to maximize verified reviews without breaking Google compliance rules.
              </p>
            </div>

            {/* 4 Feature Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
              {[
                { id: 'tab-1', label: 'Two-Tier Frictionless Routing' },
                { id: 'tab-2', label: 'Rating-Specific Suggestions' },
                { id: 'tab-3', label: '300 DPI Print-Ready Assets' },
                { id: 'tab-4', label: 'Physical Stand Telemetry' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'tab-1' | 'tab-2' | 'tab-3' | 'tab-4')}
                  className={`px-5 py-2.5 rounded-full text-xs font-display font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-slate-100 text-secondary hover:bg-slate-200'
                  }`}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Panels Container */}
            <div className="bg-surface rounded-3xl p-8 sm:p-12 border border-outline shadow-subtle-card">
              {/* TAB 1: Two-Tier Routing */}
              {activeTab === 'tab-1' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-bold text-primary uppercase font-mono">FEATURE HIGHLIGHT 01</span>
                    <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-navy">
                      Direct Handoff into Google Maps Review Dialog
                    </h3>
                    <p className="text-secondary text-sm leading-relaxed">
                      Rather than trapping customers inside a web form that never submits anywhere, Revvly acts as a high-speed spring. Customers formulate their thoughts in 5 seconds and transition seamlessly into the official Google Maps review screen.
                    </p>
                    <ul className="space-y-2 text-xs text-navy font-medium pt-2">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                        <span>Opens native iOS Google Maps or Android system intent</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                        <span>Fallbacks automatically to web browser Google Profile</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                        <span>Authenticated directly from customer&apos;s personal Google Account</span>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-md border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 text-xs font-mono">
                      <span className="text-slate-400 uppercase">Handoff Architecture</span>
                      <span className="text-emerald-600 font-bold">100% Policy Compliant</span>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-surface rounded-xl border border-slate-200 flex items-center justify-between">
                        <span className="font-semibold text-navy">Tier 1: Revvly Mobile Assistant</span>
                        <span className="text-[11px] font-mono text-primary font-bold">Fast Pre-Flight</span>
                      </div>
                      <div className="flex justify-center text-secondary">
                        <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
                        <span className="font-semibold text-blue-950">Tier 2: Native Google Maps Intent</span>
                        <span className="text-[11px] font-mono text-blue-700 font-bold">Official Submission</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Dynamic Phrasing Suggestions */}
              {activeTab === 'tab-2' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-bold text-google-yellow uppercase font-mono">FEATURE HIGHLIGHT 02</span>
                    <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-navy">
                      Cure Blank Page Syndrome with Contextual Prompts
                    </h3>
                    <p className="text-secondary text-sm leading-relaxed">
                      Most customers leave without writing because they don&apos;t know what to say. Revvly suggests helpful keywords and sentences based on what they rated, increasing the text density and quality of your reviews on Google.
                    </p>
                    <ul className="space-y-2 text-xs text-navy font-medium pt-2">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                        <span>1-tap clipboard synchronization</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                        <span>Fully editable by customer on Google</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                        <span>Category tailored: food, rooms, service, ambiance</span>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-2.5">
                    <div className="text-xs font-mono text-secondary mb-2">LIVE SUGGESTION PREVIEWS:</div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                      &quot;Loved the hospitable staff and fast service! Definitely coming back.&quot;
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950">
                      &quot;Spotless environment with comfortable seating and great vibe.&quot;
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Print-Ready 300 DPI */}
              {activeTab === 'tab-3' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-bold text-tertiary uppercase font-mono">FEATURE HIGHLIGHT 03</span>
                    <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-navy">
                      Commercial Grade 300 DPI PDF Exports
                    </h3>
                    <p className="text-secondary text-sm leading-relaxed">
                      Stop printing low-resolution black and white QR codes taped to the counter. Revvly delivers CMYK, print-ready PDF vectors fitted with crop marks and bleed specifications for acrylic standees and table tents.
                    </p>
                    <ul className="space-y-2 text-xs text-navy font-medium pt-2">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                        <span>Vector sharp rendering at any physical dimension</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                        <span>Compatible with tabletop acrylics, stickers, and decals</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                        <span>Standard formats: 4×6 in, 5×7 in, A5, and A6</span>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex items-center justify-center">
                    <div className="border-2 border-dashed border-slate-300 p-6 rounded-2xl text-center">
                      <span className="material-symbols-outlined text-primary text-[44px]">picture_as_pdf</span>
                      <span className="block text-xs font-mono font-bold text-navy mt-2">standee_4x6_cmyk_300dpi.pdf</span>
                      <span className="text-[11px] text-secondary">With 3mm Bleed &amp; Cutting Guides</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Physical Stand Telemetry */}
              {activeTab === 'tab-4' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-bold text-navy uppercase font-mono">FEATURE HIGHLIGHT 04</span>
                    <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-navy">
                      Physical Placement Telemetry &amp; Station Metrics
                    </h3>
                    <p className="text-secondary text-sm leading-relaxed">
                      Discover which dining zone or checkout counter generates the highest customer engagement. Compare Patio vs. Bar scan velocity in real time without tracking customer personal data.
                    </p>
                    <ul className="space-y-2 text-xs text-navy font-medium pt-2">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                        <span>Zero cookie, zero private customer tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                        <span>Aggregate scan volume by station and hour</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                        <span>Measure staff shift feedback conversion</span>
                      </li>
                    </ul>
                  </div>
                  <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-md border border-slate-200">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3 text-xs font-mono">
                      <span>STATION</span>
                      <span>WEEKLY SCANS</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                        <span className="font-semibold text-navy">Bar &amp; Cocktail Lounge</span>
                        <span className="font-mono font-bold text-primary">648 scans</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                        <span className="font-semibold text-navy">Dining Patio - Table #12</span>
                        <span className="font-mono font-bold text-primary">412 scans</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                        <span className="font-semibold text-navy">Reception &amp; Check-out</span>
                        <span className="font-mono font-bold text-primary">318 scans</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= 8. VENUE USE CASES ================= */}
        <section className="w-full py-20 lg:py-28 bg-surface">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono block mb-2">
                INDUSTRY APPLICATIONS
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-navy mb-4">
                Custom-Built for Every Physical Venue
              </h2>
              <p className="text-secondary text-base">
                Engineered to fit into the guest experience at the exact moment of peak satisfaction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Card 1 */}
              <div className="bg-white p-5 rounded-2xl border border-outline shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[22px]">restaurant</span>
                  </div>
                  <h4 className="font-display font-bold text-navy text-sm mb-1">Restaurants &amp; Cafes</h4>
                  <p className="text-secondary text-xs leading-relaxed">
                    Table tents placed alongside bill presentation or dessert menus.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] font-mono text-primary font-bold">
                  +48% bill scans
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-5 rounded-2xl border border-outline shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[22px]">hotel</span>
                  </div>
                  <h4 className="font-display font-bold text-navy text-sm mb-1">Hotels &amp; Stays</h4>
                  <p className="text-secondary text-xs leading-relaxed">
                    Front desk check-out acrylics and keycard sleeve inserts.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] font-mono text-primary font-bold">
                  High star retention
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-5 rounded-2xl border border-outline shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[22px]">spa</span>
                  </div>
                  <h4 className="font-display font-bold text-navy text-sm mb-1">Salons &amp; Spas</h4>
                  <p className="text-secondary text-xs leading-relaxed">
                    Mirror decals and styling station QR mini-plaques.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] font-mono text-primary font-bold">
                  Immediate feedback
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white p-5 rounded-2xl border border-outline shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-tertiary flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[22px]">storefront</span>
                  </div>
                  <h4 className="font-display font-bold text-navy text-sm mb-1">Retail &amp; Boutiques</h4>
                  <p className="text-secondary text-xs leading-relaxed">
                    Checkout register display stands and premium bag inserts.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] font-mono text-primary font-bold">
                  Frictionless tap
                </div>
              </div>

              {/* Card 5 */}
              <div className="bg-white p-5 rounded-2xl border border-outline shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[22px]">medical_services</span>
                  </div>
                  <h4 className="font-display font-bold text-navy text-sm mb-1">Clinics &amp; Wellness</h4>
                  <p className="text-secondary text-xs leading-relaxed">
                    Waiting lounge informational plaques and appointment stands.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] font-mono text-primary font-bold">
                  Verified patients
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 9. BENEFITS & VALUE PROPOSITION ================= */}
        <section className="w-full py-20 lg:py-28 bg-white border-y border-outline">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono block mb-2">
                WHY MERCHANTS CHOOSE REVVLY
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-navy mb-4">
                Built on Real Hospitality Principles
              </h2>
              <p className="text-secondary text-base">
                No dishonest gating, no fake reviews, no intrusive customer barriers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-surface border border-outline">
                <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[24px]">phonelink_erase</span>
                </div>
                <h4 className="font-display font-bold text-navy text-base mb-2">Zero App Installs</h4>
                <p className="text-secondary text-xs leading-relaxed">
                  Customers never have to install an app or create an account. It works seamlessly through native phone cameras.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-outline">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-tertiary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[24px]">key_off</span>
                </div>
                <h4 className="font-display font-bold text-navy text-base mb-2">No Passwords or Logins</h4>
                <p className="text-secondary text-xs leading-relaxed">
                  Eliminate login fatigue. The Google handoff uses the user&apos;s existing authenticated Google Account.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-outline">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[24px]">edit_off</span>
                </div>
                <h4 className="font-display font-bold text-navy text-base mb-2">Eliminates Blank Pages</h4>
                <p className="text-secondary text-xs leading-relaxed">
                  Thoughtful suggestions give happy customers the right words without biasing or forcing opinions.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-outline">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[24px]">policy</span>
                </div>
                <h4 className="font-display font-bold text-navy text-base mb-2">100% Policy Compliant</h4>
                <p className="text-secondary text-xs leading-relaxed">
                  No review gating, blocking, or filtering. Customers stay in full control of their submitted ratings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 10. ACCESSIBLE FAQ ACCORDION ================= */}
        <section className="w-full py-20 lg:py-28 bg-surface" id="faq">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono block mb-2">
                GOT QUESTIONS?
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-navy mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-secondary text-base">
                Everything you need to know about setting up Revvly and maintaining Google review guidelines.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'What is Revvly?',
                  a: 'Revvly is an in-store review enablement platform. We provide beautiful, print-ready tabletop standees, counter cards, and smart QR endpoints that guide happy physical customers directly to your Google Business Profile to leave genuine reviews.',
                },
                {
                  q: 'Do customers need to download an app or log in?',
                  a: 'No. Guests simply open their smartphone camera app, scan your stand’s QR code, and are instantly taken to the mobile-friendly web review assistant in Safari, Chrome, or their default browser. No account registration or download is ever required.',
                },
                {
                  q: 'Can customers freely edit their review before posting?',
                  a: 'Yes, 100%. Revvly assists the customer by offering optional suggestions to cure writer’s block. Customers always post directly through Google’s native review form and retain full control to edit their stars, photos, and commentary.',
                },
                {
                  q: 'Does Revvly automatically post reviews on Google?',
                  a: 'No software can legally submit Google reviews on a customer’s behalf. Google requires that the authenticated user submits their own review from their personal Google Account. Revvly makes this transition frictionless with automatic link opening and one-tap clipboard copy.',
                },
                {
                  q: 'What formats do the printable stands export to?',
                  a: 'You can export crisp 300-DPI print-ready PDFs with crop marks for standard acrylic dimensions (4×6 in, 5×7 in, A5, and A6), as well as transparent PNGs and SVGs for your own custom signage or marketing collateral.',
                },
              ].map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={item.q}
                    className="bg-white rounded-2xl border border-outline overflow-hidden transition-colors"
                  >
                    <button
                      className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                      onClick={() => toggleFaq(idx)}
                      type="button"
                    >
                      <span className="font-display font-bold text-base text-navy">{item.q}</span>
                      <span
                        className={`material-symbols-outlined text-secondary transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-secondary text-xs sm:text-sm leading-relaxed border-t border-slate-100">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= 11. FINAL CALL TO ACTION ================= */}
        <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div
            className="relative rounded-3xl p-10 sm:p-16 lg:p-20 text-center text-white overflow-hidden shadow-2xl bg-[#0F172A]"
            style={{
              background: 'linear-gradient(135deg, #1A73E8 0%, #1557B0 50%, #0F172A 100%)',
            }}
          >
            {/* Glowing Ring Details */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-blue-200 block mb-3">
                START IN LESS THAN 2 MINUTES
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white mb-6 tracking-tight leading-tight">
                Your Next Customer Review Starts With a Scan.
              </h2>
              <p className="text-base sm:text-lg text-blue-100 font-normal mb-10 max-w-2xl mx-auto leading-relaxed">
                Create a QR experience that makes it easier for customers to share their feedback.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <Link
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-navy font-display text-base font-bold shadow-xl hover:bg-slate-100 active:scale-98 transition-all flex items-center justify-center gap-2"
                  href="/create-qr"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">qr_code_2</span>
                  <span>Create Your Free QR</span>
                </Link>
              </div>
              <p className="text-xs text-blue-100 font-mono">
                Free to start · Instant print setup · No credit card required
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ================= 12. POLISHED FOOTER ================= */}
      <footer className="w-full bg-white border-t border-outline">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Image
                  src="/revvly-logo.png"
                  alt="Revvly — Scan • Review • Grow"
                  width={240}
                  height={68}
                  className="h-14 sm:h-16 w-auto object-contain"
                />
              </div>
              <p className="text-secondary text-xs sm:text-sm max-w-sm leading-relaxed">
                Empowering physical venues, hotels, restaurants, and salons to convert in-store foot traffic into verified Google 5-star reviews with frictionless tabletop QR touchpoints.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                <span className="text-[11px] font-mono font-medium text-emerald-800">
                  Google Business Companion Service Operational
                </span>
              </div>
            </div>

            {/* Links Col 1 */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-navy mb-4">Product</h4>
              <ul className="space-y-2.5 text-xs text-secondary">
                <li><Link className="hover:text-primary transition-colors" href="/create-qr">QR Stand Generator</Link></li>
                <li><a className="hover:text-primary transition-colors" href="#interactive-demo">Review Assistant</a></li>
                <li><a className="hover:text-primary transition-colors" href="#features">300 DPI Print Kits</a></li>
                <li><a className="hover:text-primary transition-colors" href="#features">Physical Telemetry</a></li>
              </ul>
            </div>

            {/* Links Col 2 */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-navy mb-4">Resources</h4>
              <ul className="space-y-2.5 text-xs text-secondary">
                <li><a className="hover:text-primary transition-colors" href="#faq">Frequently Asked Questions</a></li>
                <li><a className="hover:text-primary transition-colors" href="#how-it-works">Implementation Guide</a></li>
                <li><a className="hover:text-primary transition-colors" href="#features">Acrylic Stand Dimensions</a></li>
                <li><a className="hover:text-primary transition-colors" href="#faq">Google Compliance Rules</a></li>
              </ul>
            </div>

            {/* Links Col 3 */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-navy mb-4">Legal &amp; Trust</h4>
              <ul className="space-y-2.5 text-xs text-secondary">
                <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Fairness Guarantee</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Cookie Preferences</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-secondary gap-4">
            <p>© 2025 Revvly Technologies Inc. All rights reserved.</p>
            <p className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              100% Compliant with Google Business Profile &amp; Maps Review Policies
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
