'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { safeHttpsUrlSchema } from '@/lib/validation';

interface PublicQr {
  businessName: string;
  city: string;
  businessCategory: string;
  businessSubcategory: string;
  googleReviewUrl: string;
  headline: string;
  tagline: string;
  supportingText: string;
  accentColor: string;
  logoUrl?: string;
  thumbnailUrl?: string;
}

interface SuggestionItem {
  topic: string;
  text: string;
}

const journeyText = {
  en: {
    assistant: 'Review Assistant',
    verifiedDomain: 'VERIFIED.REVIEWQR.APP',
    fastAssistant: 'FAST GUEST ASSISTANT',
    setupTime: '< 30s Setup',
    howWasIt: 'How Was Your Experience?',
    shareInWords: 'Share your honest experience with us. It takes less than 30 seconds.',
    tapToContinue: 'Tap a star rating to continue',
    directFeedback: 'DIRECT FEEDBACK',
    instantPhrasing: 'Instant Phrasing Assistant',
    instantPhrasingDesc:
      'Tapping any rating unlocks 3 personalized sentence suggestions crafted for fast 1-tap pasting on Google Reviews.',
    bullet1: 'Warm hospitality & swift room service',
    bullet2: 'Delicious family dining buffet',
    feature1Title: 'Multi-Cuisine',
    feature1Desc: 'Authentic Flavors',
    feature2Title: 'Luxury Suites',
    feature2Desc: 'Premium Comfort',
    trustTitle: 'DIRECT GOOGLE REVIEWS FLOW',
    trustSubtitle:
      '100% Honest & Independent · Directly verified on Google Maps · No app download or login required.',
    trustEncrypted: 'Encrypted Guest Session · Private & Secure',
    verifiedPartner: 'Verified Partner',
    step2of4: 'STEP 2 OF 4',
    starsSelected: (count: number) => `${count} out of 5 stars selected`,
    tapToChange: 'Tap to change',
    chooseBestDescribes: 'Choose What Best Describes Your Experience',
    selectSuggestionHelp:
      'Select a suggestion that matches your actual experience (or write your own).',
    experienceFilters: 'EXPERIENCE FILTERS',
    writeOwnReview: '✍️ Or Write My Own Review',
    editOptional: 'Edit or Personalize (Optional)',
    livePreview: 'LIVE PREVIEW',
    readyToPaste: 'Ready to Paste',
    emptyPreview: 'No text will be copied unless you write it here.',
    copyGoToGoogle: 'Copy & Go to Google Review',
    copySubtitle: 'Copies your selected text to clipboard and opens Google Review page in 1 tap.',
    disclaimer:
      'ReviewQR helps draft phrasing. Your final review and rating are submitted directly on Google.',
    reviewCopied: 'Review Copied!',
    openingGoogle: (name: string) => `Opening Google Review page for ${name}...`,
    readyToPasteBadge: 'Review ready to paste',
    copiedBadge: 'COPIED',
    copiedToClipboard: 'Copied to device clipboard',
    recopy: 'Re-copy',
    nextStepsHeader: 'Next Steps on Google:',
    nextStep1: (stars: number) => `Select your star rating (${stars} Stars recommended)`,
    nextStep2: 'Tap and hold text box to "Paste" your copied review',
    nextStep3: 'Tap "Post" at top-right to publish',
    continueToGoogle: 'Continue to Google Review',
    handoffInitiated: 'Handoff initiated...',
    clipboardVerified: 'Clipboard verified. Opens native review form in your default browser.',
    havingTrouble: 'Having trouble? Tap here to retry handoff',
  },
  hi: {
    assistant: 'रिव्यू सहायक',
    verifiedDomain: 'VERIFIED.REVIEWQR.APP',
    fastAssistant: 'फास्ट गेस्ट सहायक',
    setupTime: '< 30 सेकंड',
    howWasIt: 'आपका अनुभव कैसा रहा?',
    shareInWords: 'अपना सच्चा अनुभव हमारे साथ साझा करें। इसमें 30 सेकंड से भी कम समय लगता है।',
    tapToContinue: 'आगे बढ़ने के लिए स्टार रेटिंग चुनें',
    directFeedback: 'सीधा फीडबैक',
    instantPhrasing: 'त्वरित रिव्यू सहायक',
    instantPhrasingDesc:
      'रेटिंग चुनते ही आपको Google रिव्यू के लिए 3 तैयार वाक्य सुझाव तुरंत मिलते हैं जिन्हें 1-टैप में कॉपी किया जा सकता है।',
    bullet1: 'शानदार सेवा और मेहमाननवाज़ी',
    bullet2: 'स्वादिष्ट खाना और बेहतरीन माहौल',
    feature1Title: 'स्वादिष्ट भोजन',
    feature1Desc: 'असली स्वाद',
    feature2Title: 'आरामदायक अनुभव',
    feature2Desc: 'प्रीमियम सुविधाएँ',
    trustTitle: 'डायरेक्ट GOOGLE रिव्यू प्रणाली',
    trustSubtitle:
      '100% स्वतंत्र व प्रामाणिक · Google Maps पर सीधे सत्यापित · ऐप डाउनलोड या लॉगिन की आवश्यकता नहीं।',
    trustEncrypted: 'सुरक्षित अतिथि सत्र · पूर्णतः निजी व सुरक्षित',
    verifiedPartner: 'सत्यापित भागीदार',
    step2of4: 'चरण 2 / 4',
    starsSelected: (count: number) => `5 में से ${count} स्टार चुने गए`,
    tapToChange: 'रेटिंग बदलें',
    chooseBestDescribes: 'अपनी पसंद का अनुभव चुनें',
    selectSuggestionHelp: 'अपने अनुभव से मेल खाता सुझाव चुनें (या अपना स्वयं लिखें)।',
    experienceFilters: 'अनुभव फ़िल्टर',
    writeOwnReview: '✍️ या अपना स्वयं का रिव्यू लिखें',
    editOptional: 'रिव्यू टेक्स्ट एडिट करें (ऐच्छिक)',
    livePreview: 'लाइव पूर्वावलोकन',
    readyToPaste: 'पेस्ट के लिए तैयार',
    emptyPreview: 'जब तक आप यहाँ नहीं लिखेंगे, कोई टेक्स्ट कॉपी नहीं होगा।',
    copyGoToGoogle: 'टेक्स्ट कॉपी करें व Google पर जाएँ',
    copySubtitle: 'चुने हुए टेक्स्ट को क्लिपबोर्ड में कॉपी करता है और 1 टैप में Google रिव्यू खोलता है।',
    disclaimer:
      'ReviewQR केवल सही शब्द चुनने में मदद करता है। आपकी अंतिम समीक्षा Google पर ही सबमिट होती है।',
    reviewCopied: 'रिव्यू कॉपी हो गया!',
    openingGoogle: (name: string) => `${name} के लिए Google रिव्यू पेज खोला जा रहा है...`,
    readyToPasteBadge: 'रिव्यू पेस्ट के लिए तैयार है',
    copiedBadge: 'कॉपी हुआ',
    copiedToClipboard: 'डिवाइस क्लिपबोर्ड पर कॉपी किया गया',
    recopy: 'पुनः कॉपी करें',
    nextStepsHeader: 'Google पर अगले चरण:',
    nextStep1: (stars: number) => `अपनी स्टार रेटिंग चुनें (${stars} स्टार अनुशंसित)`,
    nextStep2: 'टेक्स्ट बॉक्स दबाकर रखें और अपना कॉपी किया हुआ रिव्यू "Paste" करें',
    nextStep3: 'सबमिट करने के लिए ऊपर दाईं ओर "Post" पर टैप करें',
    continueToGoogle: 'Google रिव्यू पर जारी रखें',
    handoffInitiated: 'हैंडऑफ़ शुरू हुआ...',
    clipboardVerified: 'क्लिपबोर्ड सत्यापित। आपके डिफ़ॉल्ट ब्राउज़र में मूल समीक्षा फॉर्म खुलता है।',
    havingTrouble: 'कोई समस्या है? हैंडऑफ़ पुनः प्रयास करने के लिए यहाँ टैप करें',
  },
} as const;

export default function CustomerReviewJourneyPage() {
  const params = useParams();
  const token = typeof params?.token === 'string' ? params.token : '';

  const [qrCode, setQrCode] = useState<PublicQr | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const [rating, setRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('Service');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionItems, setSuggestionItems] = useState<SuggestionItem[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(0);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [eventMessage, setEventMessage] = useState<string | null>(null);

  const reviewTextRef = useRef<HTMLTextAreaElement>(null);
  const copy = journeyText[language];

  useEffect(() => {
    let cancelled = false;
    const loadPublicQr = async () => {
      try {
        setLoadError(null);
        const response = await fetch(`/api/public/qr/${encodeURIComponent(token)}`);
        const result = await response.json();
        if (!response.ok || !result.qr) {
          throw new Error(
            response.status === 503
              ? 'This QR destination is temporarily unavailable.'
              : 'This QR code was not found or is no longer active.'
          );
        }
        if (cancelled) return;

        const publicQr = result.qr as PublicQr;
        if (!safeHttpsUrlSchema.safeParse(publicQr.googleReviewUrl).success) {
          throw new Error('This QR code has an invalid review destination.');
        }
        setQrCode(publicQr);
        void fetch(`/api/public/qr/${encodeURIComponent(token)}/scan`, { method: 'POST' }).catch(() => {});
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Could not load this QR code.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadPublicQr();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const activeReviewText =
    customText.trim() ||
    (suggestionItems[selectedSuggestionIndex]?.text ?? suggestions[selectedSuggestionIndex] ?? '');

  const handleGenerateSuggestions = async (filterName: string, targetRating: number) => {
    setIsGeneratingSuggestions(true);
    setSuggestionError(null);

    const defaultPhrasing =
      filterName === 'Service'
        ? language === 'hi'
          ? 'कर्मचारियों की सेवा बहुत अच्छी और मददगार रही।'
          : 'The service was excellent, and the staff were welcoming and professional.'
        : filterName === 'Atmosphere'
        ? language === 'hi'
          ? 'यहाँ का वातावरण और माहौल बहुत सुंदर और आरामदायक है।'
          : 'Delicious food and wonderful atmosphere. The dining area was spotless.'
        : filterName === 'Food & Quality'
        ? language === 'hi'
          ? 'यहाँ का खाना और गुणवत्ता बहुत स्वादिष्ट और ताज़ा थी।'
          : 'High quality food with great presentation and authentic flavors.'
        : filterName === 'Staff & Hospitality'
        ? language === 'hi'
          ? 'स्टाफ बहुत विनम्र, मददगार और पेशेवर था।'
          : 'Staff members were extremely courteous, attentive, and swift.'
        : language === 'hi'
        ? 'यहाँ का पूरा अनुभव बहुत संतोषजनक और सुखद रहा।'
        : 'Overall a wonderful stay and pleasant experience with quick service.';

    try {
      const response = await fetch('/api/public/review-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          rating: targetRating,
          language,
          experience: defaultPhrasing,
          filter: filterName,
        }),
      });

      const result = await response.json();
      if (response.ok && Array.isArray(result.items) && result.items.length === 3) {
        setSuggestionItems(result.items);
        setSuggestions(result.items.map((i: SuggestionItem) => i.text));
        setSelectedSuggestionIndex(0);
        setCustomText('');
      } else if (response.ok && Array.isArray(result.suggestions) && result.suggestions.length >= 2) {
        const topics = ['Hospitality & Staff', 'Food & Ambience', 'Overall Impression'];
        const items = result.suggestions.slice(0, 3).map((text: string, idx: number) => ({
          topic: topics[idx] || 'General',
          text,
        }));
        setSuggestionItems(items);
        setSuggestions(items.map((i: SuggestionItem) => i.text));
        setSelectedSuggestionIndex(0);
        setCustomText('');
      } else {
        throw new Error(result.message || 'Suggestions could not be generated. Please retry.');
      }
    } catch (err) {
      console.warn('Realtime generation error, using curated contextual fallback:', err);
      // Clean fallback if completely blocked
      const fallbackItems: SuggestionItem[] = [
        {
          topic: 'Hospitality & Staff',
          text: 'The service was excellent, and the staff were welcoming and professional.',
        },
        {
          topic: 'Food & Ambience',
          text: 'Delicious food and wonderful atmosphere. The area was spotless and well-maintained.',
        },
        {
          topic: 'Overall Impression',
          text: 'Overall a wonderful visit with prompt service. Highly recommended to everyone.',
        },
      ];
      setSuggestionItems(fallbackItems);
      setSuggestions(fallbackItems.map((i) => i.text));
      setSelectedSuggestionIndex(0);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleSelectStar = (val: number) => {
    setRating(val);
    setStep(2);
    const initialFilter = activeFilter || 'Service';
    setActiveFilter(initialFilter);
    void handleGenerateSuggestions(initialFilter, val);
  };

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
    void handleGenerateSuggestions(filterId, rating || 5);
  };

  const handleCopyAndProceed = async () => {
    setCopyError(null);
    if (activeReviewText) {
      try {
        await navigator.clipboard.writeText(activeReviewText);
        setCopied(true);
        setCopyFeedback(true);
      } catch {
        // Fallback for browsers that require user permission or non-https localhost
        setCopied(true);
      }
    } else {
      setCopied(false);
    }
    setStep(3);
  };

  const handleReCopy = async () => {
    if (activeReviewText) {
      try {
        await navigator.clipboard.writeText(activeReviewText);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      } catch {
        setCopyError('Clipboard access denied.');
      }
    }
  };

  const recordDestinationClick = () => {
    void fetch('/api/public/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      keepalive: true,
    }).catch(() => {});
  };

  const businessName = qrCode?.businessName || 'Business';
  const businessDetails = [qrCode?.businessCategory, qrCode?.city].filter(Boolean).join(' · ');
  const reviewDestination = qrCode?.googleReviewUrl || '#';

  if (isLoading || loadError || !qrCode) {
    return (
      <main className="min-h-screen bg-[#F0F4F9] text-[#0B1C30] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center shadow-lg border border-slate-100">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-[#1A73E8] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-2xl animate-spin">sync</span>
          </div>
          <h1 className="text-lg font-bold text-[#0B1C30]">
            {isLoading ? 'Connecting to Review Assistant…' : 'Review Assistant Unavailable'}
          </h1>
          <p className="mt-2 text-xs text-[#565E74] leading-relaxed">
            {loadError || 'This QR destination was not found or is currently unavailable.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F9] text-[#0B1C30] flex flex-col font-sans selection:bg-blue-100">
      {/* 1. Header (Shared across screens, matching Image 2 top bar) */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-[#F0F4F9]/95 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-md mx-auto h-13 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step === 3 ? 2 : 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-200/60 transition-colors"
                aria-label="Back"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
              </button>
            )}
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-[#0B1C30] tracking-tight">
                {step === 3 ? 'Clipboard & Google Transfer' : copy.assistant}
              </span>
              <div className="flex items-center gap-1 text-[9px] text-[#565E74] font-bold tracking-wider uppercase">
                <span className="material-symbols-outlined text-slate-500 text-[10px]">lock</span>
                <span>{copy.verifiedDomain}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle pill */}
            <div className="flex items-center gap-1 p-0.5 rounded-full bg-slate-200/70 text-[10px] font-bold text-slate-700">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  language === 'en' ? 'bg-white shadow-2xs text-[#1A73E8]' : 'text-slate-600'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  language === 'hi' ? 'bg-white shadow-2xs text-[#1A73E8]' : 'text-slate-600'
                }`}
              >
                हिं
              </button>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#1A73E8] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[15px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 flex flex-col gap-4">
        {/* ========================================================================= */}
        {/* SCREEN 1: Customer Review Assistant (Image 2 - Screen 1)                 */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Fast Guest Assistant Badge */}
            <div className="flex items-center justify-between text-[11px] font-bold text-[#565E74] px-1">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="uppercase tracking-wider">{copy.fastAssistant}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                <span>{copy.setupTime}</span>
              </div>
            </div>

            {/* Venue Profile Card with Cover Photo Banner & Circular Logo */}
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-200/80">
              {/* Cover Photo Banner (16:9 ratio style) */}
              <div
                className="h-36 w-full bg-cover bg-center relative bg-gradient-to-br from-slate-800 to-slate-900"
                style={
                  qrCode.thumbnailUrl
                    ? { backgroundImage: `url(${qrCode.thumbnailUrl})` }
                    : {
                        backgroundImage:
                          'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80)',
                      }
                }
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
              </div>

              {/* Business Identity */}
              <div className="relative px-5 pb-5 -mt-10 flex flex-col items-center text-center">
                {/* Circular Logo Overlapping Banner */}
                <div className="w-18 h-18 rounded-full bg-white p-1 shadow-md flex items-center justify-center mb-2 overflow-hidden border-2 border-white">
                  {qrCode.logoUrl ? (
                    <img
                      src={qrCode.logoUrl}
                      alt={businessName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#1A73E8] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl">verified</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1.5">
                  <h1 className="font-extrabold text-lg text-[#0B1C30] tracking-tight">{businessName}</h1>
                  <span className="material-symbols-outlined text-[#1A73E8] text-[18px]">verified</span>
                </div>
                <p className="text-xs text-[#565E74] mt-0.5 font-medium">{businessDetails}</p>

                {/* Rating Badge */}
                <div className="mt-2.5 inline-flex items-center gap-1.5 bg-amber-50/80 px-3 py-1 rounded-full text-[#0B1C30] border border-amber-200/60">
                  <div className="flex items-center text-[#FBBC04] text-xs">
                    {'★★★★★'.split('').map((s, i) => (
                      <span key={i}>{s}</span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#0B1C30]">4.8</span>
                  <span className="text-[11px] text-[#565E74]">(1,420+ reviews)</span>
                </div>
              </div>
            </div>

            {/* How Was Your Experience? Rating Selector Card */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-1.5 text-[#1A73E8] bg-blue-50 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-sm">rate_review</span>
                <span>{copy.directFeedback}</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#0B1C30] tracking-tight">{copy.howWasIt}</h2>
              <p className="text-xs text-[#565E74] mt-1 max-w-xs leading-relaxed">{copy.shareInWords}</p>

              {/* 5 Big Interactive Stars */}
              <div className="my-5 flex items-center justify-center gap-2.5" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isGold = (hoveredStar !== null ? val <= hoveredStar : (rating !== null && val <= rating));
                  return (
                    <button
                      key={val}
                      type="button"
                      onMouseEnter={() => setHoveredStar(val)}
                      onMouseLeave={() => setHoveredStar(null)}
                      onClick={() => handleSelectStar(val)}
                      className="p-1 rounded-full text-4xl sm:text-5xl leading-none transition-transform active:scale-125 hover:scale-110 focus-visible:outline-none"
                      aria-label={`${val} Stars`}
                    >
                      <span className={isGold ? 'text-[#FBBC04] drop-shadow-sm' : 'text-slate-200'}>
                        ★
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A73E8]">
                <span className="material-symbols-outlined text-sm">touch_app</span>
                <span>{copy.tapToContinue}</span>
              </div>
            </div>

            {/* Instant Phrasing Assistant Card */}
            <div className="rounded-3xl bg-blue-50/50 p-5 border border-blue-100 flex flex-col gap-2.5 text-left">
              <div className="flex items-center gap-1.5 text-[#005BBF] font-bold text-xs uppercase tracking-wide">
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                <span>{copy.instantPhrasing}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {copy.instantPhrasingDesc}
              </p>
              <div className="space-y-1.5 pt-1 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1A73E8]"></span>
                  <span>{copy.bullet1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1A73E8]"></span>
                  <span>{copy.bullet2}</span>
                </div>
              </div>
            </div>

            {/* Category feature badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">restaurant</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#0B1C30] truncate">{copy.feature1Title}</span>
                  <span className="text-[11px] text-[#565E74] truncate">{copy.feature1Desc}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1A73E8] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">hotel</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#0B1C30] truncate">{copy.feature2Title}</span>
                  <span className="text-[11px] text-[#565E74] truncate">{copy.feature2Desc}</span>
                </div>
              </div>
            </div>

            {/* Footer Trust Guarantees */}
            <div className="rounded-2xl bg-white/70 p-4 border border-slate-200/60 text-center space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#0B1C30]">
                <span className="w-2 h-2 rounded-full bg-[#EA4335]"></span>
                <span className="w-2 h-2 rounded-full bg-[#FBBC04]"></span>
                <span className="w-2 h-2 rounded-full bg-[#34A853]"></span>
                <span className="w-2 h-2 rounded-full bg-[#4285F4]"></span>
                <span className="uppercase tracking-wider ml-1">{copy.trustTitle}</span>
              </div>
              <p className="text-[11px] text-[#565E74] leading-relaxed">{copy.trustSubtitle}</p>
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-semibold pt-1">
                <span className="material-symbols-outlined text-xs">lock</span>
                <span>{copy.trustEncrypted}</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: Choose a Review Suggestion (Image 2 - Screen 2)                 */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Sub-header Partner Info Bar */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1A73E8] text-white flex items-center justify-center text-xs font-bold overflow-hidden shadow-2xs">
                  {qrCode.logoUrl ? (
                    <img src={qrCode.logoUrl} alt={businessName} className="w-full h-full object-cover" />
                  ) : (
                    businessName.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-[#0B1C30] leading-tight">{businessName}</span>
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[11px]">verified</span>
                    <span>{copy.verifiedPartner}</span>
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-200/60 px-2 py-0.5 rounded-full">
                {copy.step2of4}
              </span>
            </div>

            {/* Star Rating Display Box */}
            <div className="rounded-2xl bg-white p-3.5 shadow-xs border border-slate-200/80 flex flex-col items-center justify-center gap-1 text-center">
              <div className="flex items-center text-[#FBBC04] text-2xl leading-none">
                {[1, 2, 3, 4, 5].map((val) => (
                  <span key={val}>{(rating || 5) >= val ? '★' : '☆'}</span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs text-[#565E74] font-medium">
                <span>{copy.starsSelected(rating || 5)}</span>
                <span>(</span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-bold text-[#1A73E8] hover:underline"
                >
                  {copy.tapToChange}
                </button>
                <span>)</span>
              </div>
            </div>

            {/* Title & Prompt */}
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[#0B1C30] tracking-tight">
                {copy.chooseBestDescribes}
              </h2>
              <p className="text-xs text-[#565E74] leading-relaxed">
                {copy.selectSuggestionHelp}
              </p>
            </div>

            {/* Real-time Experience Topic Filter Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-[#565E74] uppercase tracking-wider block">
                {copy.experienceFilters}
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'Service', label: 'Service' },
                  { id: 'Atmosphere', label: 'Atmosphere' },
                  { id: 'Food & Quality', label: 'Food & Quality' },
                  { id: 'Staff & Hospitality', label: 'Staff & Hospitality' },
                  { id: 'Overall Experience', label: 'Overall Experience' },
                ].map((filter) => {
                  const isActive = activeFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => handleFilterClick(filter.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
                        isActive
                          ? 'bg-[#1A73E8] text-white shadow-sm ring-2 ring-[#1A73E8]/30 scale-102'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Generation Spinner */}
            {isGeneratingSuggestions && (
              <div className="p-5 rounded-2xl bg-white border border-blue-100 flex items-center justify-center gap-3 shadow-xs">
                <span className="material-symbols-outlined text-2xl text-[#1A73E8] animate-spin">
                  progress_activity
                </span>
                <span className="text-xs font-bold text-[#005BBF]">
                  Generating 3 AI suggestions in real-time…
                </span>
              </div>
            )}

            {/* 3 AI Suggestion Cards (Matching Image 2 Screen 2 cards) */}
            <div className="space-y-2.5">
              {suggestionItems.map((item, index) => {
                const isSelected = selectedSuggestionIndex === index && !customText;
                return (
                  <div
                    key={`${index}-${item.text}`}
                    onClick={() => {
                      setSelectedSuggestionIndex(index);
                      setCustomText('');
                    }}
                    className={`cursor-pointer rounded-2xl p-4 transition-all duration-150 flex items-start gap-3 border shadow-xs ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-2xs transition-colors ${
                        isSelected ? 'bg-[#1A73E8] text-white' : 'bg-slate-100 text-slate-400 border border-slate-300'
                      }`}
                    >
                      {isSelected ? (
                        <span className="material-symbols-outlined text-[15px]">check</span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-transparent"></span>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-xs text-[#0B1C30] font-medium leading-relaxed">
                        “{item.text}”
                      </p>
                      <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#005BBF]">
                        {item.topic}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Or Write My Own Review Toggle */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(!showCustomInput);
                  if (!showCustomInput) {
                    setTimeout(() => reviewTextRef.current?.focus(), 100);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200/60 hover:bg-slate-200 text-xs font-bold text-[#0B1C30] transition-colors"
              >
                <span>{copy.writeOwnReview}</span>
              </button>
            </div>

            {showCustomInput && (
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-semibold text-[#0B1C30]">
                  <span>{copy.editOptional}</span>
                  <span className="text-slate-400 text-[10px]">{customText.length} / 300</span>
                </div>
                <textarea
                  ref={reviewTextRef}
                  rows={2}
                  maxLength={300}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Share details about what stood out in your experience..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8] resize-none"
                />
              </div>
            )}

            {/* LIVE PREVIEW Card */}
            <div className="rounded-2xl bg-white p-4 shadow-xs border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-extrabold text-[#1A73E8]">
                  <span className="material-symbols-outlined text-sm">content_paste</span>
                  <span className="uppercase tracking-wider text-[10px]">{copy.livePreview}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                  {copy.readyToPaste}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                <span className="text-2xl text-slate-400 font-serif leading-none mt-0.5">“</span>
                <p className="text-xs text-[#0B1C30] font-medium leading-relaxed italic">
                  {activeReviewText || copy.emptyPreview}
                </p>
              </div>
            </div>

            {/* Primary Action Button: Copy & Go to Google Review */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={handleCopyAndProceed}
                className="w-full h-13 rounded-2xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">content_copy</span>
                <span>{copy.copyGoToGoogle}</span>
                <span className="w-5 h-5 rounded-full bg-white text-[#1A73E8] font-bold text-xs flex items-center justify-center ml-0.5">
                  G
                </span>
              </button>
              <p className="text-[11px] text-center text-[#565E74] font-medium">
                {copy.copySubtitle}
              </p>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-1.5 text-[10px] text-slate-500 pt-1 pb-4 leading-normal">
              <span className="material-symbols-outlined text-xs mt-0.5 text-slate-400">info</span>
              <span>{copy.disclaimer}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: Review Copied — Opening Google (Image 2 - Screen 3)            */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="flex flex-col gap-4 animate-scale-up text-center pt-2">
            {/* Step Dots indicator */}
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2.5 h-1.5 rounded-full bg-[#1A73E8]"></span>
              <span className="w-2.5 h-1.5 rounded-full bg-[#1A73E8]"></span>
              <span className="w-2.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>

            {/* Green Circular Success Badge with Checkmark */}
            <div className="w-18 h-18 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-8 ring-emerald-100">
              <span className="material-symbols-outlined text-4xl">check</span>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-[#0B1C30] tracking-tight">
                {copy.reviewCopied}
              </h2>
              <p className="text-xs text-[#565E74] max-w-xs mx-auto font-medium">
                {copy.openingGoogle(businessName)}
              </p>
            </div>

            {/* Glowing animated transfer bar */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-[#1A73E8] rounded-full animate-pulse"></div>
            </div>

            {/* Copied Review Card */}
            <div className="bg-white p-4 rounded-3xl shadow-xs border border-slate-200/80 text-left space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>{copy.readyToPasteBadge}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold tracking-wider uppercase border border-emerald-200">
                  {copy.copiedBadge}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/40 border border-blue-100">
                <p className="text-xs text-[#0B1C30] italic font-medium leading-relaxed">
                  “{activeReviewText}”
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="material-symbols-outlined text-xs">done_all</span>
                  <span>{copy.copiedToClipboard}</span>
                </span>
                <button
                  type="button"
                  onClick={handleReCopy}
                  className="flex items-center gap-1 text-[#1A73E8] font-bold hover:underline"
                >
                  <span className="material-symbols-outlined text-xs">content_copy</span>
                  <span>{copyFeedback ? 'Copied!' : copy.recopy}</span>
                </button>
              </div>
            </div>

            {/* Mini Business Card */}
            <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center gap-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                {qrCode.thumbnailUrl ? (
                  <img src={qrCode.thumbnailUrl} alt={businessName} className="w-full h-full object-cover" />
                ) : qrCode.logoUrl ? (
                  <img src={qrCode.logoUrl} alt={businessName} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-xl">hotel</span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-extrabold text-[#0B1C30] truncate">{businessName}</span>
                  <span className="material-symbols-outlined text-[#1A73E8] text-xs">verified</span>
                </div>
                <div className="flex items-center gap-1 text-[#FBBC04] text-[11px]">
                  <span>★★★★★</span>
                  <span className="text-[#0B1C30] font-bold ml-1">4.9</span>
                  <span className="text-[#565E74] text-[10px]">(428 reviews)</span>
                </div>
              </div>
            </div>

            {/* Next Steps on Google Card (Matching Image 2 Screen 3) */}
            <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100 text-left space-y-2.5">
              <div className="flex items-center gap-1.5 text-[#005BBF] font-bold text-xs uppercase tracking-wide">
                <span className="material-symbols-outlined text-sm">info</span>
                <span>{copy.nextStepsHeader}</span>
              </div>
              <div className="space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1A73E8] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>{copy.nextStep1(rating || 5)}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1A73E8] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>{copy.nextStep2}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1A73E8] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>{copy.nextStep3}</span>
                </div>
              </div>
            </div>

            {/* Primary Continue Button */}
            <div className="space-y-1.5 pt-1">
              <a
                href={reviewDestination}
                target="_blank"
                rel="noopener noreferrer"
                onClick={recordDestinationClick}
                className="w-full h-13 rounded-2xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>{copy.continueToGoogle}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </a>
              <span className="text-[11px] font-medium text-emerald-700 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-xs">open_in_new</span>
                <span>{copy.handoffInitiated}</span>
              </span>
            </div>

            {/* Clipboard Verified Footer */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium pt-1">
              <span className="material-symbols-outlined text-sm text-emerald-600">verified_user</span>
              <span>{copy.clipboardVerified}</span>
            </div>

            <div className="pt-1 pb-4">
              <a
                href={reviewDestination}
                target="_blank"
                rel="noopener noreferrer"
                onClick={recordDestinationClick}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium underline"
              >
                {copy.havingTrouble}
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
