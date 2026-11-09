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
}

const journeyText = {
  en: {
    assistant: 'Review Assistant',
    privacy: 'Customer-controlled review handoff',
    howWasIt: 'How Was Your Experience?',
    shareInWords: 'Share feedback in your own words, or continue directly to the review destination.',
    optionalRating: 'Choose a star rating (optional)',
    ratingSelected: (rating: number) => `You selected ${rating} of 5 stars. Your rating never limits your next step.`,
    continue: 'Continue',
    reviewOnGoogle: 'Review us on Google',
    externalDestination: 'External review destination',
    youChoose: 'You decide whether to continue and submit feedback on the external site.',
    writeTitle: 'Write in Your Own Words (Optional)',
    writeDescription: 'Describe your real experience. Suggestions, when available, only rephrase what you share.',
    ratingContext: (rating: number) => `Your optional ${rating}-star selection is for your reference only.`,
    reviewText: 'Your review text (optional)',
    experienceLabel: 'Tell us about your experience.',
    placeholder: 'Share what you liked, what could be improved, or anything that stood out.',
    generateSuggestions: 'Generate Review Suggestions',
    generatingSuggestions: 'Generating suggestions…',
    suggestionsTitle: 'Review suggestions',
    suggestionsHelp: 'Choose a suggestion to edit it in your own words before copying.',
    useSuggestion: 'Use this suggestion',
    addFeedbackFirst: 'Add a few words about your actual experience to generate suggestions.',
    retrySuggestions: 'Try again',
    suggestionError: 'Suggestions were not generated. Please try again.',
    reflect: 'Need a reminder? Choose a topic to think about:',
    prompts: ['Service', 'Atmosphere', 'What stood out?', 'What could improve?'],
    promptHelp: 'These are reflection prompts only. They do not add text to your review.',
    clipboard: 'Live Clipboard Preview',
    ready: 'Ready to Paste',
    emptyReview: 'No text will be copied unless you write it here.',
    copyContinue: 'Copy My Text & Continue',
    continueEmpty: 'Continue Without Review Text',
    copiedTitle: 'Review text copied',
    readyTitle: 'Ready to continue',
    handoff: 'You control whether to continue and submit your review on the external destination.',
    next: 'What happens next:',
    chooseRating: 'Choose a rating on the external destination',
    pasteText: 'Paste your text only if you choose',
    submitThere: 'Review and submit there, if you want to',
    editText: 'Edit my text',
    language: 'Language',
    ratingAria: (rating: number) => `${rating} out of 5 stars`,
  },
  hi: {
    assistant: 'रिव्यू सहायक',
    privacy: 'रिव्यू पर आपका पूरा नियंत्रण',
    howWasIt: 'आपका अनुभव कैसा रहा?',
    shareInWords: 'अपने शब्दों में प्रतिक्रिया दें या सीधे रिव्यू पेज पर जाएँ।',
    optionalRating: 'स्टार रेटिंग चुनें (वैकल्पिक)',
    ratingSelected: (rating: number) => `आपने 5 में से ${rating} स्टार चुने। आगे बढ़ने के लिए रेटिंग ज़रूरी नहीं है।`,
    continue: 'जारी रखें',
    reviewOnGoogle: 'Google पर रिव्यू दें',
    externalDestination: 'बाहरी रिव्यू पेज',
    youChoose: 'बाहरी साइट पर प्रतिक्रिया देना और सबमिट करना आपका निर्णय है।',
    writeTitle: 'अपने शब्दों में लिखें (वैकल्पिक)',
    writeDescription: 'अपना वास्तविक अनुभव लिखें। उपलब्ध सुझाव केवल आपके साझा अनुभव को नए शब्दों में कहेंगे।',
    ratingContext: (rating: number) => `आपकी वैकल्पिक ${rating}-स्टार रेटिंग केवल आपके संदर्भ के लिए है।`,
    reviewText: 'आपका रिव्यू (वैकल्पिक)',
    experienceLabel: 'अपने अनुभव के बारे में बताएं।',
    placeholder: 'आपको क्या पसंद आया, क्या बेहतर हो सकता है, या क्या खास लगा—साझा करें।',
    generateSuggestions: 'रिव्यू सुझाव बनाएँ',
    generatingSuggestions: 'सुझाव बनाए जा रहे हैं…',
    suggestionsTitle: 'रिव्यू सुझाव',
    suggestionsHelp: 'कॉपी करने से पहले सुझाव चुनें और उसे अपने शब्दों में बदलें।',
    useSuggestion: 'यह सुझाव चुनें',
    addFeedbackFirst: 'सुझाव पाने के लिए अपने वास्तविक अनुभव के बारे में कुछ शब्द लिखें।',
    retrySuggestions: 'फिर से कोशिश करें',
    suggestionError: 'सुझाव नहीं बन पाए। कृपया फिर से कोशिश करें।',
    reflect: 'याद दिलाने के लिए कोई विषय चुनें:',
    prompts: ['सेवा', 'माहौल', 'क्या अच्छा लगा?', 'क्या बेहतर हो सकता है?'],
    promptHelp: 'ये केवल सोचने के लिए विषय हैं। इनसे रिव्यू में कोई टेक्स्ट नहीं जुड़ता।',
    clipboard: 'कॉपी होने वाले टेक्स्ट का पूर्वावलोकन',
    ready: 'कॉपी के लिए तैयार',
    emptyReview: 'जब तक आप यहाँ नहीं लिखेंगे, कोई टेक्स्ट कॉपी नहीं होगा।',
    copyContinue: 'मेरा टेक्स्ट कॉपी करें और जारी रखें',
    continueEmpty: 'बिना रिव्यू टेक्स्ट के जारी रखें',
    copiedTitle: 'रिव्यू टेक्स्ट कॉपी हुआ',
    readyTitle: 'जारी रखने के लिए तैयार',
    handoff: 'बाहरी रिव्यू पेज पर जाना और सबमिट करना आपका निर्णय है।',
    next: 'इसके बाद:',
    chooseRating: 'बाहरी पेज पर रेटिंग चुनें',
    pasteText: 'चाहें तो अपना टेक्स्ट पेस्ट करें',
    submitThere: 'चाहें तो वहीं जाँचकर सबमिट करें',
    editText: 'मेरा टेक्स्ट बदलें',
    language: 'भाषा',
    ratingAria: (rating: number) => `5 में से ${rating} स्टार`,
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
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [customText, setCustomText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [eventMessage, setEventMessage] = useState<string | null>(null);
  const reviewTextRef = useRef<HTMLTextAreaElement>(null);
  const copy = journeyText[language];
  const reflectionPrompts = copy.prompts;

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
        void fetch(`/api/public/qr/${encodeURIComponent(token)}/scan`, { method: 'POST' })
          .then(async (scanResponse) => {
            if (!scanResponse.ok) {
              setEventMessage('Scan tracking is temporarily unavailable; you can still continue.');
            }
          })
          .catch(() => {
            setEventMessage('Scan tracking is temporarily unavailable; you can still continue.');
          });
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

  const activeReviewText = customText.trim();

  const handleCopyReview = async () => {
    setCopyError(null);
    if (activeReviewText) {
      try {
        await navigator.clipboard.writeText(activeReviewText);
      } catch {
        setCopyError('Clipboard access was denied. Copy the text manually or continue without it.');
        return;
      }
    }

    setCopied(Boolean(activeReviewText));
    setStep(3);
  };

  const handleGenerateSuggestions = async () => {
    if (rating === null || !customText.trim()) return;

    setIsGeneratingSuggestions(true);
    setSuggestionError(null);
    setSuggestions([]);
    setSelectedSuggestion(null);
    try {
      const response = await fetch('/api/public/review-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rating, language, experience: customText }),
      });
      const result = await response.json();
      if (!response.ok || !Array.isArray(result.suggestions) || result.suggestions.length < 2) {
        throw new Error(result.message || copy.suggestionError);
      }
      setSuggestions(result.suggestions);
    } catch (error) {
      setSuggestionError(
        error instanceof Error ? error.message : copy.suggestionError
      );
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const businessName = qrCode?.businessName || '';
  const businessDetails = [qrCode?.businessCategory, qrCode?.businessSubcategory, qrCode?.city]
    .filter(Boolean)
    .join(' · ');
  const reviewDestination = qrCode?.googleReviewUrl || '';

  const recordDestinationClick = () => {
    void fetch('/api/public/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      keepalive: true,
    })
      .then((response) => {
        if (!response.ok) {
          setEventMessage('Click tracking is temporarily unavailable; your destination will still open.');
        }
      })
      .catch(() => {
        setEventMessage('Click tracking is temporarily unavailable; your destination will still open.');
      });
  };

  if (isLoading || loadError || !qrCode) {
    return (
      <main className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-100">
          <h1 className="text-xl font-bold">{isLoading ? 'Loading QR code…' : 'QR destination unavailable'}</h1>
          <p className="mt-3 text-sm text-[#565E74]">
            {loadError || 'This QR code was not found or is no longer active.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans selection:bg-blue-100">
      {/* Mobile Top Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#F8F9FF]/90 backdrop-blur-xl border-b border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 max-w-md mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step === 3 ? 2 : 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
              </button>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-sm text-[#0B1C30]">{copy.assistant}</span>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <span className="material-symbols-outlined text-green-600 text-xs">lock</span>
                <span>{copy.privacy}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#1A73E8] text-[10px] font-bold">
            <span className="sr-only">{copy.language}</span>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
              className={`rounded px-1.5 py-1 ${language === 'en' ? 'bg-white shadow-sm' : ''}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              aria-pressed={language === 'hi'}
              className={`rounded px-1.5 py-1 ${language === 'hi' ? 'bg-white shadow-sm' : ''}`}
            >
              हिं
            </button>
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
              <div className="h-28 w-full bg-slate-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              </div>

              <div className="relative px-5 pb-5 -mt-9 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white p-1 shadow-lg flex items-center justify-center mb-2 overflow-hidden">
                  <div className="w-full h-full rounded-full bg-[#1A73E8] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">storefront</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1">
                  <h1 className="font-extrabold text-lg text-[#0B1C30] tracking-tight">{businessName}</h1>
                </div>
                <p className="text-xs text-[#565E74] mt-0.5">{businessDetails}</p>
              </div>
            </div>

            {/* Primary Rating Card */}
            <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100 flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-1 text-[#1A73E8] bg-blue-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-sm">rate_review</span>
                <span>Direct Feedback</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#0B1C30]">{copy.howWasIt}</h2>
              <p className="text-xs text-[#565E74] mt-1 max-w-xs">
                {copy.shareInWords}
              </p>

              <fieldset className="mt-5">
                <legend className="mb-2 text-xs font-semibold text-[#414754]">{copy.optionalRating}</legend>
                <div className="flex items-center justify-center gap-2" role="radiogroup" aria-label={copy.optionalRating}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={rating === value}
                      aria-label={copy.ratingAria(value)}
                      onClick={() => setRating(value)}
                      className="rounded-md p-1 text-3xl leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A73E8]"
                    >
                      <span className={rating === null || value <= rating ? 'text-[#FBBC04]' : 'text-slate-300'}>★</span>
                    </button>
                  ))}
                </div>
                {rating !== null && (
                  <p className="mt-2 text-xs text-[#565E74]" role="status">{copy.ratingSelected(rating)}</p>
                )}
              </fieldset>

              {eventMessage && (
                <p className="mt-4 text-xs text-amber-700" role="status">{eventMessage}</p>
              )}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full mt-5 h-12 rounded-2xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-xs"
              >
                {copy.continue}
              </button>
              <a
                href={reviewDestination}
                target="_blank"
                rel="noopener noreferrer"
                onClick={recordDestinationClick}
                className="w-full min-h-11 rounded-xl border border-[#FBBC04] bg-[#FFF8E1] px-4 py-3 text-xs font-bold text-[#0B1C30] hover:bg-[#FFF1C2] flex items-center justify-center gap-2"
              >
                <span className="text-lg text-[#FBBC04]" aria-hidden="true">★</span>
                <span>{copy.reviewOnGoogle}</span>
                <span className="material-symbols-outlined text-base">open_in_new</span>
              </a>
            </div>

            <div className="rounded-xl bg-slate-100 p-4 text-center text-xs text-slate-500 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-[#0B1C30] font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#1A73E8]"></span>
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="ml-1 uppercase tracking-wider">{copy.externalDestination}</span>
              </div>
              <p className="text-[11px]">{copy.youChoose}</p>
            </div>
          </div>
        )}

        {/* Step 2: Optional customer-authored feedback */}
        {step === 2 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[#0B1C30] tracking-tight">{copy.writeTitle}</h2>
              <p className="text-xs text-[#565E74]">{copy.writeDescription}</p>
              {rating !== null && <p className="text-xs text-[#565E74]">{copy.ratingContext(rating)}</p>}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-semibold text-[#0B1C30]">{copy.reflect}</p>
              <div className="flex flex-wrap gap-2">
                {reflectionPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    aria-pressed={selectedPrompt === prompt}
                    onClick={() => {
                      setSelectedPrompt(prompt);
                      reviewTextRef.current?.focus();
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs ${
                      selectedPrompt === prompt
                        ? 'border-[#1A73E8] bg-blue-50 text-[#005BBF]'
                        : 'border-slate-200 text-[#414754] hover:bg-slate-50'
                    }`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-[#565E74]">{copy.promptHelp}</p>
              {selectedPrompt && <p className="mt-2 text-xs font-medium text-[#005BBF]" role="status">{selectedPrompt}</p>}
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
              <div className="flex justify-between text-xs">
                <label htmlFor="review-text" className="font-semibold text-[#0B1C30]">{copy.experienceLabel}</label>
                <span className="text-slate-400 text-[11px]">{customText.length} / 300</span>
              </div>
              <textarea
                ref={reviewTextRef}
                id="review-text"
                rows={3}
                maxLength={300}
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value);
                  setSelectedSuggestion(null);
                }}
                placeholder={selectedPrompt || copy.placeholder}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-[#1A73E8] resize-none"
              />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGenerateSuggestions}
                disabled={rating === null || !customText.trim() || isGeneratingSuggestions}
                aria-busy={isGeneratingSuggestions}
                className="w-full min-h-11 rounded-xl border border-[#1A73E8] bg-white px-4 py-3 text-xs font-bold text-[#005BBF] hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
              >
                {isGeneratingSuggestions ? copy.generatingSuggestions : copy.generateSuggestions}
              </button>
              {rating !== null && !customText.trim() && (
                <p className="text-xs text-[#565E74]" role="status">{copy.addFeedbackFirst}</p>
              )}
              {suggestionError && (
                <div className="flex items-center justify-between gap-3 text-xs text-red-700" role="alert">
                  <span>{suggestionError}</span>
                  <button type="button" onClick={handleGenerateSuggestions} className="shrink-0 font-bold underline">
                    {copy.retrySuggestions}
                  </button>
                </div>
              )}
              {suggestions.length > 0 && (
                <section aria-labelledby="review-suggestions-heading" className="space-y-2">
                  <h3 id="review-suggestions-heading" className="text-xs font-bold text-[#0B1C30]">
                    {copy.suggestionsTitle}
                  </h3>
                  <p className="text-[11px] text-[#565E74]">{copy.suggestionsHelp}</p>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${index}-${suggestion}`}
                      type="button"
                      aria-pressed={selectedSuggestion === index}
                      onClick={() => {
                        setCustomText(suggestion);
                        setSelectedSuggestion(index);
                      }}
                      className={`w-full rounded-xl border p-3 text-left text-xs leading-relaxed ${
                        selectedSuggestion === index
                          ? 'border-[#1A73E8] bg-blue-50 text-[#0B1C30]'
                          : 'border-slate-200 bg-white text-[#414754] hover:bg-slate-50'
                      }`}
                    >
                      <span className="block">{suggestion}</span>
                      <span className="mt-2 block font-bold text-[#005BBF]">{copy.useSuggestion}</span>
                    </button>
                  ))}
                </section>
              )}
            </div>

            {/* Live Clipboard Preview */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 font-bold text-[#1A73E8]">
                  <span className="material-symbols-outlined text-base">content_paste</span>
                  <span className="uppercase tracking-wider text-[10px]">{copy.clipboard}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                  {copy.ready}
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p className="text-xs text-[#0B1C30] italic leading-relaxed">
                  {activeReviewText || copy.emptyReview}
                </p>
              </div>
            </div>

            {/* Primary CTA */}
            {copyError && (
              <p className="text-xs text-red-700" role="alert">{copyError}</p>
            )}
            <button
              onClick={handleCopyReview}
              className="w-full h-12 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-lg">content_copy</span>
              <span>{activeReviewText ? copy.copyContinue : copy.continueEmpty}</span>
            </button>
            {copyError && activeReviewText && (
              <button
                type="button"
                onClick={() => {
                  setCopied(false);
                  setCopyError(null);
                  setStep(3);
                }}
                className="text-xs font-semibold text-[#1A73E8] hover:underline"
              >
                Continue without copying
              </button>
            )}
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
              <h2 className="text-2xl font-extrabold text-[#0B1C30]">
              {copied ? copy.copiedTitle : copy.readyTitle}
              </h2>
              <p className="text-xs text-[#565E74] max-w-xs mx-auto">
              {copy.handoff}
              </p>
            </div>

            {/* 3 Steps on Google Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-left space-y-3.5">
              <h3 className="font-bold text-xs text-[#0B1C30] uppercase tracking-wider">
                {copy.next}
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1A73E8] text-[11px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <span className="text-[#0B1C30]">{copy.chooseRating}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1A73E8] text-[11px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <span className="text-[#0B1C30]">{copy.pasteText}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1A73E8] text-[11px] font-bold flex items-center justify-center">
                    3
                  </span>
                  <span className="text-[#0B1C30]">{copy.submitThere}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={reviewDestination}
                target="_blank"
                rel="noopener noreferrer"
                onClick={recordDestinationClick}
                className="w-full h-12 rounded-2xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>{copy.reviewOnGoogle}</span>
                <span className="material-symbols-outlined text-base">open_in_new</span>
              </a>
              {eventMessage && (
                <p className="text-xs text-amber-700" role="status">{eventMessage}</p>
              )}
              <button
                onClick={() => setStep(2)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                {copy.editText}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
