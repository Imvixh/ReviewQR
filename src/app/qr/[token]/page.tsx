'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getStoredOrg, getStoredQRCodes, recordGoogleClick, recordScan } from '@/lib/data-store';
import { Organization, QRCode } from '@/lib/types';

export default function CustomerReviewJourneyPage() {
  const params = useParams();
  const token = params?.token as string;

  const [org, setOrg] = useState<Organization | null>(null);
  const [qrCode, setQrCode] = useState<QRCode | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>(
    'The service was excellent, and the staff were welcoming and professional.'
  );
  const [customText, setCustomText] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const loadedOrg = getStoredOrg();
    setOrg(loadedOrg);
    const qrs = getStoredQRCodes();
    const found = qrs.find((q) => q.slug === token || q.id === token) || qrs[0];
    setQrCode(found);

    // Record observable scan event
    if (found?.id) {
      recordScan(found.id);
    }
  }, [token]);

  const suggestionsByStar: Record<number, Array<{ text: string; category: string }>> = {
    5: [
      { text: 'The service was excellent, and the staff were welcoming and professional.', category: 'Hospitality & Staff' },
      { text: 'Delicious food and wonderful atmosphere. The dining area was spotless.', category: 'Food & Ambience' },
      { text: 'Overall a wonderful stay and pleasant dining experience with quick service.', category: 'Overall Impression' },
    ],
    4: [
      { text: 'Great experience overall! Friendly staff and tasty dishes.', category: 'Service & Food' },
      { text: 'Clean venue and polite service. Would gladly visit again.', category: 'General' },
      { text: 'Good hospitality and prompt attention from the team.', category: 'Hospitality' },
    ],
    3: [
      { text: 'Decent experience with courteous staff, with a few areas for improvement.', category: 'Feedback' },
      { text: 'Good food, though wait times could be slightly improved.', category: 'Service' },
    ],
    2: [
      { text: 'Service was slower than expected today. Hope to see improvements next time.', category: 'Wait Time' },
    ],
    1: [
      { text: 'Disappointed with the experience today and sharing honest feedback.', category: 'Experience' },
    ],
  };

  const currentSuggestions = suggestionsByStar[selectedRating] || suggestionsByStar[5];
  const activeReviewText = showCustomInput && customText ? customText : selectedSuggestion;

  const handleStarPick = (rating: number) => {
    setSelectedRating(rating);
    const defaultText = (suggestionsByStar[rating] || suggestionsByStar[5])[0].text;
    setSelectedSuggestion(defaultText);
    setStep(2);
  };

  const handleCopyAndGoogle = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(activeReviewText);
      }
    } catch {
      // Fallback handled gracefully
    }

    setCopied(true);
    if (qrCode?.id) {
      recordGoogleClick(qrCode.id);
    }
    setStep(3);

    // Trigger opening Google Review dialog
    const dest = org?.googleReviewUrl || qrCode?.destinationUrl || 'https://search.google.com/local/writereview';
    setTimeout(() => {
      window.open(dest, '_blank', 'noopener,noreferrer');
    }, 1200);
  };

  const businessName = qrCode?.businessName || org?.name || 'Royal Palace Hotel';
  const categoryLoc = `${org?.category || 'Restaurant'} • ${org?.city || 'Bettiah, Bihar'}`;
  const coverImage = qrCode?.thumbnailUrl || org?.thumbnailUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80';
  const activeLogo = qrCode?.logoUrl || org?.logoUrl;

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans selection:bg-blue-100">
      {/* Mobile Top Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#F8F9FF]/90 backdrop-blur-xl border-b border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 max-w-md mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep((step - 1) as any)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
              </button>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-sm text-[#0B1C30]">Review Assistant</span>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <span className="material-symbols-outlined text-green-600 text-xs">lock</span>
                <span>verified.reviewqr.app</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#1A73E8] text-[10px] font-bold">
            <span className="material-symbols-outlined text-xs">speed</span>
            <span>&lt; 30s Setup</span>
          </div>
        </div>
      </header>

      {/* Main Mobile Screen Flow (max-w-md mx-auto) */}
      <main className="flex-1 w-full max-w-md mx-auto pt-16 pb-12 px-4 flex flex-col gap-5">
        {/* Step 1: Customer Review Assistant */}
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            {/* Business Profile Card */}
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-md border border-slate-100">
              <div
                className="h-28 w-full bg-cover bg-center relative bg-slate-800"
                style={{
                  backgroundImage: `url('${coverImage}')`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              </div>

              <div className="relative px-5 pb-5 -mt-9 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white p-1 shadow-lg flex items-center justify-center mb-2 overflow-hidden">
                  {activeLogo ? (
                    <img src={activeLogo} alt={businessName} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#1A73E8] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">hotel</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1">
                  <h1 className="font-extrabold text-lg text-[#0B1C30] tracking-tight">{businessName}</h1>
                  <span className="material-symbols-outlined text-[#1A73E8] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                </div>
                <p className="text-xs text-[#565E74] mt-0.5">{categoryLoc}</p>

                <div className="mt-2.5 inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-xs">
                  <div className="flex items-center text-[#FBBC04]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ))}
                  </div>
                  <span className="font-bold text-[#0B1C30]">4.8</span>
                  <span className="text-slate-400">(1,420+ reviews)</span>
                </div>
              </div>
            </div>

            {/* Primary Rating Card */}
            <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100 flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-1 text-[#1A73E8] bg-blue-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-sm">rate_review</span>
                <span>Direct Feedback</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#0B1C30]">How Was Your Experience?</h2>
              <p className="text-xs text-[#565E74] mt-1 max-w-xs">
                Share your honest experience with us. It takes less than 30 seconds.
              </p>

              {/* Star Rating Interactive Picker */}
              <div className="w-full mt-6">
                <div className="flex justify-center items-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarPick(star)}
                      className="w-12 h-12 rounded-full bg-slate-50 hover:bg-amber-50 active:scale-90 transition-transform flex items-center justify-center border border-slate-200"
                      aria-label={`Rate ${star} star`}
                    >
                      <span className="material-symbols-outlined text-3xl text-amber-400 hover:text-amber-500">
                        star
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 text-[#1A73E8] py-1 px-4 rounded-full bg-blue-50 text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm animate-bounce">touch_app</span>
                  <span>Tap a star rating to continue</span>
                </div>
              </div>

              {/* Instant Phrasing Teaser */}
              <div className="w-full mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-left flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1C30]">
                  <span className="material-symbols-outlined text-[#1A73E8] text-base">auto_awesome</span>
                  <span>Instant Phrasing Assistant</span>
                </div>
                <p className="text-[11px] text-[#565E74]">
                  Tapping any rating unlocks personalized sentence suggestions crafted for fast 1-tap pasting on Google.
                </p>
              </div>
            </div>

            {/* Direct Google Reviews Guarantee */}
            <div className="rounded-xl bg-slate-100 p-4 text-center text-xs text-slate-500 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-[#0B1C30] font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#1A73E8]"></span>
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="ml-1 uppercase tracking-wider">Direct Google Reviews Flow</span>
              </div>
              <p className="text-[11px]">100% Honest & Independent • No app download or login required</p>
            </div>
          </div>
        )}

        {/* Step 2: Choose a Review Suggestion */}
        {step === 2 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Star Rating Banner */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[#FBBC04]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: s <= selectedRating ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-[#1A73E8] hover:underline"
              >
                Change rating
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[#0B1C30] tracking-tight">
                Choose What Best Describes Your Experience
              </h2>
              <p className="text-xs text-[#565E74]">
                Select a suggestion that matches your visit, or write your own words.
              </p>
            </div>

            {/* Suggestions Group */}
            <div className="flex flex-col gap-2.5">
              {currentSuggestions.map((item, idx) => {
                const isSelected = !showCustomInput && selectedSuggestion === item.text;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setShowCustomInput(false);
                      setSelectedSuggestion(item.text);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 shadow-sm ${
                      isSelected
                        ? 'bg-blue-50/70 border-[#1A73E8] ring-1 ring-[#1A73E8]'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-[#1A73E8] text-white' : 'bg-slate-200 text-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">check</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[#0B1C30] leading-relaxed">“{item.text}”</p>
                      <span className="text-[10px] font-bold text-[#1A73E8] uppercase tracking-wider block mt-1">
                        {item.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Toggle Custom Write */}
            <div className="flex justify-center pt-1">
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#0B1C30] transition-colors"
              >
                <span className="material-symbols-outlined text-base">edit_note</span>
                <span>{showCustomInput ? 'Use Prepared Suggestions' : 'Or Write My Own Review'}</span>
              </button>
            </div>

            {/* Custom Input Box */}
            {showCustomInput && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1.5 animate-fade-in">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-[#0B1C30]">Personalize Your Words</label>
                  <span className="text-slate-400 text-[11px]">{customText.length} / 300</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Share favorites from the menu, swift service, or staff members who helped..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#1A73E8] resize-none"
                />
              </div>
            )}

            {/* Live Clipboard Preview */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 font-bold text-[#1A73E8]">
                  <span className="material-symbols-outlined text-base">content_paste</span>
                  <span className="uppercase tracking-wider text-[10px]">Live Clipboard Preview</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                  Ready to Paste
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p className="text-xs text-[#0B1C30] italic leading-relaxed">
                  {activeReviewText || 'Select a suggestion above...'}
                </p>
              </div>
            </div>

            {/* Primary CTA */}
            <button
              onClick={handleCopyAndGoogle}
              className="w-full h-12 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-lg">content_copy</span>
              <span>Copy & Go to Google Review</span>
            </button>
          </div>
        )}

        {/* Step 3: Review Copied / Opening Google Handoff */}
        {step === 3 && (
          <div className="flex flex-col gap-6 animate-scale-up text-center pt-4">
            {/* Animated Ripple Checkmark Hero */}
            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-lg animate-bounce">
              <span className="material-symbols-outlined text-5xl">check_circle</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-[#0B1C30]">Review Copied to Clipboard!</h2>
              <p className="text-xs text-[#565E74] max-w-xs mx-auto">
                Opening Google Review dialog now. Paste your review with one tap!
              </p>
            </div>

            {/* 3 Steps on Google Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-left space-y-3.5">
              <h3 className="font-bold text-xs text-[#0B1C30] uppercase tracking-wider">
                Next Steps on Google:
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1A73E8] text-[11px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <span className="text-[#0B1C30]">Select your star rating</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1A73E8] text-[11px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <span className="text-[#0B1C30]">Tap and hold the text box & select <strong>Paste</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1A73E8] text-[11px] font-bold flex items-center justify-center">
                    3
                  </span>
                  <span className="text-[#0B1C30]">Tap <strong>Post</strong> to submit</span>
                </div>
              </div>
            </div>

            {/* Fallback Direct Link Button */}
            <div className="space-y-2 pt-2">
              <a
                href={org?.googleReviewUrl || qrCode?.destinationUrl || 'https://search.google.com/local/writereview'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-2xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Continue to Google Review</span>
                <span className="material-symbols-outlined text-base">open_in_new</span>
              </a>
              <button
                onClick={() => setStep(2)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Back to Suggestions
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
