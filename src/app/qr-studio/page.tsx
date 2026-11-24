'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getStoredOrg, getStoredQRCodes, saveQRCode, setStoredOrg } from '@/lib/data-store';
import { Organization, QRCode } from '@/lib/types';
import { generateQrSvg } from '@/lib/qr-geometry';
import { createGuestToken } from '@/lib/guest-token';
import {
  cleanDestinationUrl,
  generateCleanQr,
  QrEngineResult,
  QrStylePreset,
} from '@/lib/qr-engine';
import { buildGoogleMapsSearchUrl, validateReviewDestination } from '@/lib/review-destination';
import { getQrDestinationMode, resolvePublicAppOrigin, resolveQrDestination } from '@/lib/qr-destination';
import {
  BUSINESS_CATEGORIES,
  categorySelectionForSavedValue,
  HOTEL_SUBCATEGORIES,
  resolveBusinessCategory,
} from '@/lib/business-category';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import {
  canOpenQrStudioStep,
  isBrandingStepReady,
  isCopyStepReady,
  isQrStudioStepComplete,
  QR_STUDIO_STEPS,
  type QrStudioStep,
  type QrStudioStepSignatures,
} from '@/lib/qr-studio-steps';

interface PosterPreset {
  id: string;
  name: string;
  cardBg: string;
  topStrip?: boolean;
  centerBg: string;
  centerText?: string;
  barBg: string;
  previewBg: string;
  textColor: string;
  subtitleColor: string;
  finderColor: string;
  defaultAccent: string;
  /** Hex value of previewBg – used in PNG export to avoid Tailwind class resolution */
  bgHex: string;
  /** Hex value of textColor – used in PNG export */
  textHex: string;
  /** Hex value of subtitleColor – used in PNG export */
  subtitleHex: string;
}

export default function QRDesignStudioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FF]" />}>
      <QRDesignStudioInner />
    </Suspense>
  );
}

function QRDesignStudioInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editQrId = searchParams.get('edit') || '';
  const isEditMode = Boolean(editQrId);
  const isCreateMode = !isEditMode;
  const [activeTab, setActiveTab] = useState<QrStudioStep>('branding');
  const [completedStepSignatures, setCompletedStepSignatures] = useState<QrStudioStepSignatures>({});
  const [org, setOrg] = useState<Organization | null>(null);
  const [qrList, setQrList] = useState<QRCode[]>([]);
  const [selectedQrId, setSelectedQrId] = useState('');
  const [qrListFromServer, setQrListFromServer] = useState(false);

  // Touchpoint & Destination State (merged from Create QR)
  const [placementTag, setPlacementTag] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [savedDestinationUrl, setSavedDestinationUrl] = useState('');
  const [destinationMode, setDestinationMode] = useState<'maps' | 'paste'>('maps');
  const [qrMode, setQrMode] = useState<'direct' | 'guided'>('guided');
  const [hasConfirmedDestination, setHasConfirmedDestination] = useState(false);
  const [isSavingDestination, setIsSavingDestination] = useState(false);
  const [isLoadingDestination, setIsLoadingDestination] = useState(true);
  const [isSavingQr, setIsSavingQr] = useState(false);
  const [destinationMessage, setDestinationMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);

  // Business Branding State
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [location, setLocation] = useState('');
  const [accentColor, setAccentColor] = useState('#1A73E8');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [localLogoDataUrl, setLocalLogoDataUrl] = useState<string>('');
  const [logoName, setLogoName] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isRemovingLogo, setIsRemovingLogo] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [localThumbDataUrl, setLocalThumbDataUrl] = useState<string>('');
  const [thumbnailName, setThumbnailName] = useState('');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // QR Code Architecture State (Clean Standard Defaults)
  const [qrStyle, setQrStyle] = useState<QrStylePreset>('standard');
  const [geometry, setGeometry] = useState<'classic' | 'rounded' | 'dots' | 'premium-eye'>('classic');
  const [centerEmblem, setCenterEmblem] = useState<'none' | 'google-g' | 'business-logo'>('none');
  const [qrValidation, setQrValidation] = useState<QrEngineResult | null>(null);
  const [printSizeMm, setPrintSizeMm] = useState<number>(40);

  // Display Poster Preset (Image 2)
  const [selectedPreset, setSelectedPreset] = useState('google-classic');
  const [visiblePresetCount, setVisiblePresetCount] = useState(9);

  // Independent Custom Color Overrides (Phase 2)
  const [customColors, setCustomColors] = useState<{
    posterBg?: string;
    qrColor?: string;
    businessNameColor?: string;
    ctaTextColor?: string;
    headlineColor?: string;
    starsColor?: string;
    ctaBgColor?: string;
  }>({});

  const [expandedColorKeys, setExpandedColorKeys] = useState<Record<string, boolean>>({
    posterBg: false,
    qrColor: false,
    businessNameColor: false,
    ctaTextColor: false,
    headlineColor: false,
    starsColor: false,
    ctaBgColor: false,
  });

  const toggleColorKey = (key: string) => {
    setExpandedColorKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setAllColorKeys = (open: boolean) => {
    setExpandedColorKeys({
      posterBg: open,
      qrColor: open,
      businessNameColor: open,
      ctaTextColor: open,
      headlineColor: open,
      starsColor: open,
      ctaBgColor: open,
    });
  };

  // Copywriting & Content
  const [headline, setHeadline] = useState('Review us on Google');
  const [ctaText, setCtaText] = useState('Scan to share your experience');
  const [supportingText, setSupportingText] = useState('');

  // View mode & Canvas state
  const [viewMode, setViewMode] = useState<'front' | 'mockup' | 'mobile'>('front');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [realQrDataUrl, setRealQrDataUrl] = useState<string>('');
  const [generatedQrTarget, setGeneratedQrTarget] = useState<string | null>(null);
  const [qrGenerationMessage, setQrGenerationMessage] = useState<string | null>(null);

  const posterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const destinationValidation = useMemo(
    () => validateReviewDestination(googleReviewUrl),
    [googleReviewUrl]
  );
  const isDestinationSaved =
    Boolean(savedDestinationUrl) && savedDestinationUrl === googleReviewUrl.trim();
  const canPreviewQr = destinationValidation.valid;
  const activeMapsSearchUrl = useMemo(() => {
    const name = businessName.trim();
    const loc = location.trim();
    const query = [name, loc].filter(Boolean).join(' ');
    if (query) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    }
    return 'https://www.google.com/maps';
  }, [businessName, location]);
  const mapsSearchUrl = buildGoogleMapsSearchUrl(businessName, location) || activeMapsSearchUrl;
  const selectedQr = qrList.find((qr) => qr.id === selectedQrId);
  const selectedQrToken = selectedQr?.publicToken || '';

  // Preset definitions matching Image 2
  const presets: PosterPreset[] = [
    {
      id: 'minimal-white',
      name: 'Minimal White',
      cardBg: 'bg-white',
      centerBg: 'bg-[#0B1C30]/80',
      barBg: 'bg-[#C1C6D6]',
      previewBg: 'bg-white',
      textColor: 'text-[#0B1C30]',
      subtitleColor: 'text-[#565E74]',
      finderColor: '#0B1C30',
      defaultAccent: '#0B1C30',
      bgHex: '#ffffff', textHex: '#0B1C30', subtitleHex: '#565E74',
    },
    {
      id: 'google-classic',
      name: 'Google Classic',
      cardBg: 'bg-white',
      topStrip: true,
      centerBg: 'bg-[#1A73E8]',
      centerText: 'G',
      barBg: 'bg-amber-400',
      previewBg: 'bg-white',
      textColor: 'text-[#0B1C30]',
      subtitleColor: 'text-[#565E74]',
      finderColor: '#1A73E8',
      defaultAccent: '#1A73E8',
      bgHex: '#ffffff', textHex: '#0B1C30', subtitleHex: '#565E74',
    },
    {
      id: 'royal-gold',
      name: 'Royal Gold',
      cardBg: 'bg-[#FFFDF5]',
      centerBg: 'bg-amber-600',
      barBg: 'bg-amber-300',
      previewBg: 'bg-[#FFFDF5]',
      textColor: 'text-[#78350F]',
      subtitleColor: 'text-[#B45309]',
      finderColor: '#D97706',
      defaultAccent: '#D97706',
      bgHex: '#FFFDF5', textHex: '#78350F', subtitleHex: '#B45309',
    },
    {
      id: 'modern-navy',
      name: 'Modern Navy',
      cardBg: 'bg-blue-900',
      centerBg: 'bg-white',
      barBg: 'bg-blue-300',
      previewBg: 'bg-[#0F172A]',
      textColor: 'text-white',
      subtitleColor: 'text-slate-300',
      finderColor: '#38BDF8',
      defaultAccent: '#1A73E8',
      bgHex: '#0F172A', textHex: '#ffffff', subtitleHex: '#CBD5E1',
    },
    {
      id: 'bistro-green',
      name: 'Bistro Green',
      cardBg: 'bg-emerald-50',
      centerBg: 'bg-emerald-700',
      barBg: 'bg-emerald-400',
      previewBg: 'bg-[#F0FDF4]',
      textColor: 'text-[#064E3B]',
      subtitleColor: 'text-[#047857]',
      finderColor: '#059669',
      defaultAccent: '#34A853',
      bgHex: '#F0FDF4', textHex: '#064E3B', subtitleHex: '#047857',
    },
    {
      id: 'dark-luxury',
      name: 'Dark Luxury',
      cardBg: 'bg-zinc-900',
      centerBg: 'bg-amber-400',
      barBg: 'bg-zinc-600',
      previewBg: 'bg-[#18181B]',
      textColor: 'text-white',
      subtitleColor: 'text-zinc-400',
      finderColor: '#F59E0B',
      defaultAccent: '#F59E0B',
      bgHex: '#18181B', textHex: '#ffffff', subtitleHex: '#A1A1AA',
    },
    /* ---------- 15 new presets ---------- */
    {
      id: 'ocean-blue',
      name: 'Ocean Blue',
      cardBg: 'bg-[#0E7490]',
      centerBg: 'bg-[#1597BB]',
      barBg: 'bg-[#74C0FC]',
      previewBg: 'bg-[#0E7490]',
      textColor: 'text-white',
      subtitleColor: 'text-[#94D3F2]',
      finderColor: '#0F172A',
      defaultAccent: '#0E7490',
      bgHex: '#0E7490', textHex: '#ffffff', subtitleHex: '#94D3F2',
    },
    {
      id: 'sunset-orange',
      name: 'Sunset Orange',
      cardBg: 'bg-[#F97316]',
      centerBg: 'bg-[#FB923C]',
      barBg: 'bg-[#FDBA74]',
      previewBg: 'bg-[#FEF3C7]',
      textColor: 'text-white',
      subtitleColor: 'text-[#FED7AA]',
      finderColor: '#0F172A',
      defaultAccent: '#F97316',
      bgHex: '#FEF3C7', textHex: '#ffffff', subtitleHex: '#FED7AA',
    },
    {
      id: 'forest-deep',
      name: 'Forest Deep',
      cardBg: 'bg-[#14532D]',
      centerBg: 'bg-[#15803D]',
      barBg: 'bg-[#4ADE80]',
      previewBg: 'bg-[#ECFDF5]',
      textColor: 'text-white',
      subtitleColor: 'text-[#A7F3D0]',
      finderColor: '#0F172A',
      defaultAccent: '#15803D',
      bgHex: '#ECFDF5', textHex: '#ffffff', subtitleHex: '#A7F3D0',
    },
    {
      id: 'midnight-purple',
      name: 'Midnight Purple',
      cardBg: 'bg-[#5B21B6]',
      centerBg: 'bg-[#7C3AED]',
      barBg: 'bg-[#C084FC]',
      previewBg: 'bg-[#FAF5FF]',
      textColor: 'text-white',
      subtitleColor: 'text-[#E9D5FF]',
      finderColor: '#0F172A',
      defaultAccent: '#7C3AED',
      bgHex: '#FAF5FF', textHex: '#ffffff', subtitleHex: '#E9D5FF',
    },
    {
      id: 'rose-gold',
      name: 'Rose Gold',
      cardBg: 'bg-[#FFF1F2]',
      centerBg: 'bg-[#F43F5E]',
      barBg: 'bg-[#FDBA74]',
      previewBg: 'bg-[#FFF1F2]',
      textColor: 'text-[#881337]',
      subtitleColor: 'text-[#BE185D]',
      finderColor: '#F43F5E',
      defaultAccent: '#F43F5E',
      bgHex: '#FFF1F2', textHex: '#881337', subtitleHex: '#BE185D',
    },
    {
      id: 'cherry-blossom',
      name: 'Cherry Blossom',
      cardBg: 'bg-[#FCE7F3]',
      centerBg: 'bg-[#FBCFE8]',
      barBg: 'bg-[#F0ABFC]',
      previewBg: 'bg-[#FDF2F8]',
      textColor: 'text-[#831843]',
      subtitleColor: 'text-[#C026D3]',
      finderColor: '#DB2777',
      defaultAccent: '#EC4899',
      bgHex: '#FDF2F8', textHex: '#831843', subtitleHex: '#C026D3',
    },
    {
      id: 'steel-blue',
      name: 'Steel Blue',
      cardBg: 'bg-[#1E3A8A]',
      centerBg: 'bg-[#1D4ED8]',
      barBg: 'bg-[#60A5FA]',
      previewBg: 'bg-[#EFF6FF]',
      textColor: 'text-white',
      subtitleColor: 'text-[#BFDBFE]',
      finderColor: '#1E40AF',
      defaultAccent: '#1D4ED8',
      bgHex: '#EFF6FF', textHex: '#ffffff', subtitleHex: '#BFDBFE',
    },
    {
      id: 'coral-reef',
      name: 'Coral Reef',
      cardBg: 'bg-[#EA580C]',
      centerBg: 'bg-[#FB923C]',
      barBg: 'bg-[#FB923C]',
      previewBg: 'bg-[#FFF1E6]',
      textColor: 'text-white',
      subtitleColor: 'text-[#FCD34D]',
      finderColor: '#0F172A',
      defaultAccent: '#EA580C',
      bgHex: '#FFF1E6', textHex: '#ffffff', subtitleHex: '#FCD34D',
    },
    {
      id: 'lavender-mist',
      name: 'Lavender Mist',
      cardBg: 'bg-[#818CF8]',
      centerBg: 'bg-[#A78BFA]',
      barBg: 'bg-[#C7BDFE]',
      previewBg: 'bg-[#F5F3FF]',
      textColor: 'text-white',
      subtitleColor: 'text-[#E0E7FF]',
      finderColor: '#0F172A',
      defaultAccent: '#6366F1',
      bgHex: '#F5F3FF', textHex: '#ffffff', subtitleHex: '#E0E7FF',
    },
    {
      id: 'emerald-city',
      name: 'Emerald City',
      cardBg: 'bg-[#047857]',
      centerBg: 'bg-[#10B981]',
      barBg: 'bg-[#34D399]',
      previewBg: 'bg-[#D1FAE5]',
      textColor: 'text-white',
      subtitleColor: 'text-[#A7F3D0]',
      finderColor: '#0F172A',
      defaultAccent: '#10B981',
      bgHex: '#D1FAE5', textHex: '#ffffff', subtitleHex: '#A7F3D0',
    },
    {
      id: 'charcoal-slate',
      name: 'Charcoal Slate',
      cardBg: 'bg-[#1E293B]',
      centerBg: 'bg-[#334155]',
      barBg: 'bg-[#64748B]',
      previewBg: 'bg-[#0F172A]',
      textColor: 'text-white',
      subtitleColor: 'text-[#CBD5E1]',
      finderColor: '#F1F5F9',
      defaultAccent: '#475569',
      bgHex: '#0F172A', textHex: '#ffffff', subtitleHex: '#CBD5E1',
    },
    {
      id: 'sunrise-yellow',
      name: 'Sunrise Yellow',
      cardBg: 'bg-[#EAB308]',
      centerBg: 'bg-[#FACC15]',
      barBg: 'bg-[#FDE047]',
      previewBg: 'bg-[#FEF9C3]',
      textColor: 'text-[#713F12]',
      subtitleColor: 'text-[#A16207]',
      finderColor: '#0F172A',
      defaultAccent: '#FACC15',
      bgHex: '#FEF9C3', textHex: '#713F12', subtitleHex: '#A16207',
    },
    {
      id: 'frost-mint',
      name: 'Frost Mint',
      cardBg: 'bg-[#D1FAE5]',
      centerBg: 'bg-[#6EE7B7]',
      barBg: 'bg-[#34D399]',
      previewBg: 'bg-[#ECFDF5]',
      textColor: 'text-[#047857]',
      subtitleColor: 'text-[#0F766E]',
      finderColor: '#059669',
      defaultAccent: '#10B981',
      bgHex: '#ECFDF5', textHex: '#047857', subtitleHex: '#0F766E',
    },
    {
      id: 'burgundy-wine',
      name: 'Burgundy Wine',
      cardBg: 'bg-[#7F1D1D]',
      centerBg: 'bg-[#B91C1C]',
      barBg: 'bg-[#F87171]',
      previewBg: 'bg-[#FEF2F2]',
      textColor: 'text-white',
      subtitleColor: 'text-[#FCA5A5]',
      finderColor: '#0F172A',
      defaultAccent: '#B91C1C',
      bgHex: '#FEF2F2', textHex: '#ffffff', subtitleHex: '#FCA5A5',
    },
    {
      id: 'arctic-white',
      name: 'Arctic White',
      cardBg: 'bg-white',
      centerBg: 'bg-[#0F172A]/40',
      barBg: 'bg-[#E2E8F0]',
      previewBg: 'bg-[#F8FAFC]',
      textColor: 'text-[#0F172A]',
      subtitleColor: 'text-[#64748B]',
      finderColor: '#0F172A',
      defaultAccent: '#005BBF',
      bgHex: '#F8FAFC', textHex: '#0F172A', subtitleHex: '#64748B',
    },
    {
      id: 'coastal-sand',
      name: 'Coastal Sand',
      cardBg: 'bg-[#F5EBDD]',
      centerBg: 'bg-[#C08A55]',
      barBg: 'bg-[#D9B88F]',
      previewBg: 'bg-[#FFF9F0]',
      textColor: 'text-[#4A3425]',
      subtitleColor: 'text-[#80634C]',
      finderColor: '#6B4F3A',
      defaultAccent: '#A66B3F',
      bgHex: '#FFF9F0', textHex: '#4A3425', subtitleHex: '#80634C',
    },
    {
      id: 'terracotta',
      name: 'Terracotta',
      cardBg: 'bg-[#9A3412]',
      centerBg: 'bg-[#C2410C]',
      barBg: 'bg-[#FDBA74]',
      previewBg: 'bg-[#FFF7ED]',
      textColor: 'text-[#7C2D12]',
      subtitleColor: 'text-[#C2410C]',
      finderColor: '#9A3412',
      defaultAccent: '#C2410C',
      bgHex: '#FFF7ED', textHex: '#7C2D12', subtitleHex: '#C2410C',
    },
    {
      id: 'sage-garden',
      name: 'Sage Garden',
      cardBg: 'bg-[#DDE8D5]',
      centerBg: 'bg-[#5B7553]',
      barBg: 'bg-[#9BB28E]',
      previewBg: 'bg-[#F5F8F1]',
      textColor: 'text-[#344532]',
      subtitleColor: 'text-[#5B7553]',
      finderColor: '#45603F',
      defaultAccent: '#5B7553',
      bgHex: '#F5F8F1', textHex: '#344532', subtitleHex: '#5B7553',
    },
    {
      id: 'sapphire-night',
      name: 'Sapphire Night',
      cardBg: 'bg-[#172554]',
      centerBg: 'bg-[#1D4ED8]',
      barBg: 'bg-[#60A5FA]',
      previewBg: 'bg-[#EFF6FF]',
      textColor: 'text-[#172554]',
      subtitleColor: 'text-[#1E40AF]',
      finderColor: '#1E40AF',
      defaultAccent: '#1D4ED8',
      bgHex: '#EFF6FF', textHex: '#172554', subtitleHex: '#1E40AF',
    },
    {
      id: 'plum-velvet',
      name: 'Plum Velvet',
      cardBg: 'bg-[#581C4B]',
      centerBg: 'bg-[#86198F]',
      barBg: 'bg-[#D8B4FE]',
      previewBg: 'bg-[#FDF4FF]',
      textColor: 'text-[#581C4B]',
      subtitleColor: 'text-[#86198F]',
      finderColor: '#701A75',
      defaultAccent: '#86198F',
      bgHex: '#FDF4FF', textHex: '#581C4B', subtitleHex: '#86198F',
    },
    {
      id: 'rosewood',
      name: 'Rosewood',
      cardBg: 'bg-[#881337]',
      centerBg: 'bg-[#BE123C]',
      barBg: 'bg-[#FDA4AF]',
      previewBg: 'bg-[#FFF1F2]',
      textColor: 'text-[#881337]',
      subtitleColor: 'text-[#BE123C]',
      finderColor: '#9F1239',
      defaultAccent: '#BE123C',
      bgHex: '#FFF1F2', textHex: '#881337', subtitleHex: '#BE123C',
    },
    {
      id: 'copper-craft',
      name: 'Copper Craft',
      cardBg: 'bg-[#7C2D12]',
      centerBg: 'bg-[#B45309]',
      barBg: 'bg-[#FDBA74]',
      previewBg: 'bg-[#FFFBEB]',
      textColor: 'text-[#78350F]',
      subtitleColor: 'text-[#92400E]',
      finderColor: '#92400E',
      defaultAccent: '#B45309',
      bgHex: '#FFFBEB', textHex: '#78350F', subtitleHex: '#92400E',
    },
    {
      id: 'ice-blue',
      name: 'Ice Blue',
      cardBg: 'bg-[#DBF3FA]',
      centerBg: 'bg-[#0891B2]',
      barBg: 'bg-[#67E8F9]',
      previewBg: 'bg-[#F0FAFC]',
      textColor: 'text-[#164E63]',
      subtitleColor: 'text-[#0E7490]',
      finderColor: '#155E75',
      defaultAccent: '#0891B2',
      bgHex: '#F0FAFC', textHex: '#164E63', subtitleHex: '#0E7490',
    },
    {
      id: 'citrus-fresh',
      name: 'Citrus Fresh',
      cardBg: 'bg-[#ECFCCB]',
      centerBg: 'bg-[#4D7C0F]',
      barBg: 'bg-[#A3E635]',
      previewBg: 'bg-[#F7FEE7]',
      textColor: 'text-[#365314]',
      subtitleColor: 'text-[#4D7C0F]',
      finderColor: '#3F6212',
      defaultAccent: '#4D7C0F',
      bgHex: '#F7FEE7', textHex: '#365314', subtitleHex: '#4D7C0F',
    },
    {
      id: 'olive-heritage',
      name: 'Olive Heritage',
      cardBg: 'bg-[#3F4A2A]',
      centerBg: 'bg-[#667744]',
      barBg: 'bg-[#A3B18A]',
      previewBg: 'bg-[#F4F5EE]',
      textColor: 'text-[#3F4A2A]',
      subtitleColor: 'text-[#667744]',
      finderColor: '#4B5D31',
      defaultAccent: '#667744',
      bgHex: '#F4F5EE', textHex: '#3F4A2A', subtitleHex: '#667744',
    },
    {
      id: 'monochrome-ink',
      name: 'Monochrome Ink',
      cardBg: 'bg-[#111827]',
      centerBg: 'bg-[#374151]',
      barBg: 'bg-[#9CA3AF]',
      previewBg: 'bg-[#F9FAFB]',
      textColor: 'text-[#111827]',
      subtitleColor: 'text-[#4B5563]',
      finderColor: '#111827',
      defaultAccent: '#374151',
      bgHex: '#F9FAFB', textHex: '#111827', subtitleHex: '#4B5563',
    },
    {
      id: 'blush-pearl',
      name: 'Blush Pearl',
      cardBg: 'bg-[#FFF1F2]',
      centerBg: 'bg-[#BE185D]',
      barBg: 'bg-[#F9A8D4]',
      previewBg: 'bg-[#FFFAFC]',
      textColor: 'text-[#831843]',
      subtitleColor: 'text-[#BE185D]',
      finderColor: '#9D174D',
      defaultAccent: '#BE185D',
      bgHex: '#FFFAFC', textHex: '#831843', subtitleHex: '#BE185D',
    },
    {
      id: 'turquoise-bay',
      name: 'Turquoise Bay',
      cardBg: 'bg-[#CCFBF1]',
      centerBg: 'bg-[#0F766E]',
      barBg: 'bg-[#5EEAD4]',
      previewBg: 'bg-[#F0FDFA]',
      textColor: 'text-[#134E4A]',
      subtitleColor: 'text-[#0F766E]',
      finderColor: '#115E59',
      defaultAccent: '#0F766E',
      bgHex: '#F0FDFA', textHex: '#134E4A', subtitleHex: '#0F766E',
    },
    {
      id: 'slate-silver',
      name: 'Slate Silver',
      cardBg: 'bg-[#E2E8F0]',
      centerBg: 'bg-[#475569]',
      barBg: 'bg-[#94A3B8]',
      previewBg: 'bg-[#F8FAFC]',
      textColor: 'text-[#1E293B]',
      subtitleColor: 'text-[#475569]',
      finderColor: '#334155',
      defaultAccent: '#475569',
      bgHex: '#F8FAFC', textHex: '#1E293B', subtitleHex: '#475569',
    },
    {
      id: 'lavender-luxe',
      name: 'Lavender Luxe',
      cardBg: 'bg-[#EDE9FE]',
      centerBg: 'bg-[#6D28D9]',
      barBg: 'bg-[#C4B5FD]',
      previewBg: 'bg-[#FAF9FF]',
      textColor: 'text-[#4C1D95]',
      subtitleColor: 'text-[#6D28D9]',
      finderColor: '#5B21B6',
      defaultAccent: '#6D28D9',
      bgHex: '#FAF9FF', textHex: '#4C1D95', subtitleHex: '#6D28D9',
    },
    {
      id: 'terracotta-clay',
      name: 'Terracotta Clay',
      cardBg: 'bg-[#9A3412]',
      centerBg: 'bg-[#EA580C]',
      barBg: 'bg-[#FDBA74]',
      previewBg: 'bg-[#FFF7ED]',
      textColor: 'text-[#7C2D12]',
      subtitleColor: 'text-[#C2410C]',
      finderColor: '#9A3412',
      defaultAccent: '#C2410C',
      bgHex: '#FFF7ED', textHex: '#7C2D12', subtitleHex: '#C2410C',
    },
    {
      id: 'alpine-pine',
      name: 'Alpine Pine',
      cardBg: 'bg-[#064E3B]',
      centerBg: 'bg-[#10B981]',
      barBg: 'bg-[#6EE7B7]',
      previewBg: 'bg-[#ECFDF5]',
      textColor: 'text-[#064E3B]',
      subtitleColor: 'text-[#047857]',
      finderColor: '#065F46',
      defaultAccent: '#047857',
      bgHex: '#ECFDF5', textHex: '#064E3B', subtitleHex: '#047857',
    },
    {
      id: 'cobalt-pop',
      name: 'Cobalt Pop',
      cardBg: 'bg-[#1E3A8A]',
      centerBg: 'bg-[#2563EB]',
      barBg: 'bg-[#93C5FD]',
      previewBg: 'bg-[#EFF6FF]',
      textColor: 'text-[#172554]',
      subtitleColor: 'text-[#1D4ED8]',
      finderColor: '#1D4ED8',
      defaultAccent: '#2563EB',
      bgHex: '#EFF6FF', textHex: '#172554', subtitleHex: '#1D4ED8',
    },
    {
      id: 'champagne-ivory',
      name: 'Champagne Ivory',
      cardBg: 'bg-[#FEFCE8]',
      centerBg: 'bg-[#A16207]',
      barBg: 'bg-[#EAB308]',
      previewBg: 'bg-[#FFFEF5]',
      textColor: 'text-[#713F12]',
      subtitleColor: 'text-[#A16207]',
      finderColor: '#854D0E',
      defaultAccent: '#A16207',
      bgHex: '#FFFEF5', textHex: '#713F12', subtitleHex: '#A16207',
    },
    {
      id: 'berry-sorbet',
      name: 'Berry Sorbet',
      cardBg: 'bg-[#9D174D]',
      centerBg: 'bg-[#DB2777]',
      barBg: 'bg-[#F9A8D4]',
      previewBg: 'bg-[#FDF2F8]',
      textColor: 'text-[#831843]',
      subtitleColor: 'text-[#BE185D]',
      finderColor: '#9D174D',
      defaultAccent: '#DB2777',
      bgHex: '#FDF2F8', textHex: '#831843', subtitleHex: '#BE185D',
    },
    {
      id: 'glacier-teal',
      name: 'Glacier Teal',
      cardBg: 'bg-[#164E63]',
      centerBg: 'bg-[#0891B2]',
      barBg: 'bg-[#67E8F9]',
      previewBg: 'bg-[#ECFEFF]',
      textColor: 'text-[#164E63]',
      subtitleColor: 'text-[#0E7490]',
      finderColor: '#155E75',
      defaultAccent: '#0891B2',
      bgHex: '#ECFEFF', textHex: '#164E63', subtitleHex: '#0E7490',
    },
  ];

  const currentPresetData = presets.find((p) => p.id === selectedPreset) || presets[1];
  const categoryResult = resolveBusinessCategory(category, customCategory);
  const categoryValue = categoryResult.category;
  const businessDetails = [categoryValue, location.trim()].filter(Boolean).join(' · ');
  const stepSignatures: Record<QrStudioStep, string> = {
    branding: JSON.stringify([
      businessName.trim(),
      location.trim(),
      category,
      customCategory,
      subcategory,
      googleReviewUrl.trim(),
      qrMode,
      hasConfirmedDestination,
    ]),
    qrstyle: JSON.stringify([
      qrStyle,
      geometry,
      centerEmblem,
      printSizeMm,
      customColors.qrColor,
    ]),
    templates: JSON.stringify([
      selectedPreset,
      accentColor,
      customColors,
    ]),
    copy: JSON.stringify([headline.trim(), ctaText.trim(), supportingText.trim()]),
  };
  const isStepComplete = (step: QrStudioStep) =>
    step === 'copy'
      ? isCopyStepReady(headline, ctaText)
      : isQrStudioStepComplete(step, completedStepSignatures, stepSignatures);
  const canOpenStep = (step: QrStudioStep) =>
    canOpenQrStudioStep(step, completedStepSignatures, stepSignatures);
  const navigateToStep = (step: QrStudioStep) => {
    if (canOpenStep(step)) setActiveTab(step);
  };
  const activeStepIndex = QR_STUDIO_STEPS.indexOf(activeTab);
  const previousStep = activeStepIndex > 0 ? QR_STUDIO_STEPS[activeStepIndex - 1] : undefined;
  const stepLabels: Record<QrStudioStep, string> = {
    branding: 'Branding',
    qrstyle: 'QR Code',
    templates: 'Templates',
    copy: 'Preview / Download',
  };
  const continueFromStep = (step: Exclude<QrStudioStep, 'copy'>) => {
    if (step === 'branding') {
      const brandingReady = isBrandingStepReady({
        businessName,
        location,
        categoryValid: !categoryResult.error && Boolean(categoryValue),
        destinationValid: destinationValidation.valid,
        destinationConfirmed: hasConfirmedDestination,
      });
      if (!brandingReady) {
        if (!businessName.trim() || !location.trim()) {
          showToast('Add your business name and city or location before continuing.');
        } else if (categoryResult.error || !categoryValue) {
          showToast(categoryResult.error || 'Select a business category before continuing.');
        } else if (!destinationValidation.valid) {
          showToast('Please enter a valid Google review destination link first.');
        } else {
          showToast('Confirm that you checked the review destination before continuing.');
        }
        return;
      }
      if (subcategory && categoryValue !== 'Hotel') {
        showToast('Choose a hotel category before selecting a subcategory.');
        return;
      }
      setSavedDestinationUrl(googleReviewUrl.trim());
    }

    if (step === 'templates' && !presets.some((preset) => preset.id === selectedPreset)) {
      showToast('Choose a poster template before continuing.');
      return;
    }

    const stepIndex = QR_STUDIO_STEPS.indexOf(step);
    const nextStep = QR_STUDIO_STEPS[stepIndex + 1];
    if (!nextStep) return;
    setCompletedStepSignatures((completed) => ({
      ...completed,
      [step]: stepSignatures[step],
    }));
    setActiveTab(nextStep);
  };
  const isBusinessCategorySaved =
    Boolean(categoryValue) &&
    org?.category === categoryValue &&
    (org.subcategory || '') === subcategory;

  const accentPalette = [
    { name: 'Google Blue', hex: '#1A73E8' },
    { name: 'Warm Amber', hex: '#FBBC04' },
    { name: 'Google Red', hex: '#EA4335' },
    { name: 'Bistro Green', hex: '#34A853' },
    { name: 'Obsidian Slate', hex: '#0F172A' },
  ];

  // Load Initial Org and QRs
  useEffect(() => {
    // Helper to apply a specific QR's settings to state
    const applyQrToState = (qr: QRCode) => {
      setSelectedQrId(qr.id);
      setQrMode(getQrDestinationMode(qr));
      setPlacementTag(qr.placementName || qr.placementType || '');
      setHeadline(qr.headline || 'Review us on Google');
      setCtaText(qr.tagline || 'Scan to share your experience');
      setSupportingText(qr.supportingText || '');
      if (qr.accentColor) {
        setAccentColor(qr.accentColor);
      }
      if (qr.preset) setSelectedPreset(qr.preset);
      if (qr.geometry) setGeometry(qr.geometry);
      if (qr.centerEmblem) setCenterEmblem(qr.centerEmblem);

      // Business & Location for this specific QR
      if (qr.businessName) setBusinessName(qr.businessName);
      if (qr.city) setLocation(qr.city);
      if (qr.category) {
        const cat = categorySelectionForSavedValue(qr.category);
        setCategory(cat.selection);
        setCustomCategory(cat.customCategory);
      }
      if (qr.subcategory) setSubcategory(qr.subcategory);
      if (qr.destinationUrl) {
        setGoogleReviewUrl(qr.destinationUrl);
        setSavedDestinationUrl(qr.destinationUrl);
        setHasConfirmedDestination(true);
      }
      if (qr.logoUrl) setLogoUrl(qr.logoUrl);
      if (qr.thumbnailUrl) setThumbnailUrl(qr.thumbnailUrl);

      setOrg({
        id: qr.orgId,
        slug: qr.slug,
        name: qr.businessName,
        city: qr.city || '',
        googleReviewUrl: qr.destinationUrl,
        category: qr.category,
        subcategory: qr.subcategory,
      });
    };

    // In create mode: reset all QR and business form fields to blank — clean fresh start on every visit
    if (isCreateMode) {
      setSelectedQrId('');
      setQrListFromServer(false);
      setPlacementTag('');
      setHeadline('Review us on Google');
      setCtaText('Scan to share your experience');
      setSupportingText('');
      setAccentColor('#1A73E8');
      setSelectedPreset('google-classic');
      setGeometry('rounded');
      setCenterEmblem('google-g');
      setBusinessName('');
      setLocation('');
      setCategory('');
      setCustomCategory('');
      setSubcategory('');
      setGoogleReviewUrl('');
      setSavedDestinationUrl('');
      setHasConfirmedDestination(false);
      setLogoUrl('');
      setThumbnailUrl('');
      setOrg(null);
      setQrList([]);
      setIsLoadingDestination(false);
      return;
    }

    const loadedOrg = getStoredOrg();
    setOrg(loadedOrg);

    if (isEditMode) {
      const savedCategory = categorySelectionForSavedValue(loadedOrg.category);
      setCategory(savedCategory.selection);
      setCustomCategory(savedCategory.customCategory);
      setSubcategory(loadedOrg.subcategory || '');
      if (loadedOrg.accentColor) setAccentColor(loadedOrg.accentColor);
      if (loadedOrg.logoUrl && !isSupabaseConfigured) setLogoUrl(loadedOrg.logoUrl);
      if (loadedOrg.thumbnailUrl && !isSupabaseConfigured) setThumbnailUrl(loadedOrg.thumbnailUrl);
    } else {
      setCategory('');
      setCustomCategory('');
      setSubcategory('');
    }
    if (isSupabaseConfigured && !isEditMode) setLogoUrl('');

    if (!isSupabaseConfigured) {
      if (isEditMode) {
        if (loadedOrg.name) setBusinessName(loadedOrg.name);
        if (loadedOrg.city) setLocation(loadedOrg.city);
        if (loadedOrg.googleReviewUrl) {
          setGoogleReviewUrl(loadedOrg.googleReviewUrl);
          setSavedDestinationUrl(loadedOrg.googleReviewUrl);
          setHasConfirmedDestination(true);
        }
      }
      const localQrs = getStoredQRCodes();
      setQrList(localQrs);
      setQrListFromServer(false);
      if (isEditMode) {
        const target = localQrs.find((q) => q.id === editQrId);
        if (target) applyQrToState(target);
      }
      setIsLoadingDestination(false);
      return;
    }

    let cancelled = false;
    const loadSavedData = async () => {
      try {
        const [destinationResponse, qrResponse] = await Promise.all([
          fetch('/api/business/review-destination'),
          fetch('/api/qr'),
        ]);
        const [destinationResult, qrResult] = await Promise.all([
          destinationResponse.json(),
          qrResponse.json(),
        ]);
        if (destinationResponse.status === 401 || qrResponse.status === 401) {
          // Unauthenticated guest user: load from local storage if available, don't show error banner
          const loadedOrg = getStoredOrg();
          if (loadedOrg) {
            setOrg(loadedOrg);
            if (loadedOrg.name) setBusinessName(loadedOrg.name);
            if (loadedOrg.city) setLocation(loadedOrg.city);
            const savedCategory = categorySelectionForSavedValue(loadedOrg.category);
            setCategory(savedCategory.selection);
            setCustomCategory(savedCategory.customCategory);
            setSubcategory(loadedOrg.subcategory || '');
            if (loadedOrg.accentColor) setAccentColor(loadedOrg.accentColor);
            if (loadedOrg.logoUrl) setLogoUrl(loadedOrg.logoUrl);
            if (loadedOrg.thumbnailUrl) setThumbnailUrl(loadedOrg.thumbnailUrl);
            if (loadedOrg.googleReviewUrl) {
              setGoogleReviewUrl(loadedOrg.googleReviewUrl);
              setSavedDestinationUrl(loadedOrg.googleReviewUrl);
              setHasConfirmedDestination(true);
            }
          }
          const localQrs = getStoredQRCodes();
          setQrList(localQrs);
          setQrListFromServer(false);
          if (isEditMode) {
            const target = localQrs.find((q) => q.id === editQrId);
            if (target) applyQrToState(target);
          }
          if (!cancelled) {
            setIsLoadingDestination(false);
            setDestinationMessage(null);
          }
          return;
        }

        if (!destinationResponse.ok) {
          throw new Error(
            destinationResult.message || 'Could not load the saved review destination. Sign in and try again.'
          );
        }
        if (!qrResponse.ok) {
          throw new Error(qrResult.message || 'Could not load your saved QR designs.');
        }

        if (cancelled) return;
        const qrs = qrResult.qrs as QRCode[];
        setQrList(qrs);
        setQrListFromServer(true);
        if (isEditMode) {
          const target = qrs.find((q) => q.id === editQrId);
          if (target) applyQrToState(target);
        }

        if (destinationResult.business && !isEditMode) {
          const business = destinationResult.business;
          const updatedOrg = setStoredOrg({
            id: business.id,
            name: business.name,
            category: business.category,
            subcategory: business.subcategory,
            city: business.city,
            googleReviewUrl: business.googleReviewUrl,
            logoUrl: business.logoUrl,
            thumbnailUrl: business.thumbnailUrl,
          });
          setOrg(updatedOrg);
          if (business.name) setBusinessName(business.name);
          if (business.city) setLocation(business.city);
          if (business.category) {
            const sc = categorySelectionForSavedValue(business.category);
            setCategory(sc.selection);
            setCustomCategory(sc.customCategory);
          }
          if (business.subcategory) setSubcategory(business.subcategory);
          if (business.logoUrl) setLogoUrl(business.logoUrl);
          if (business.thumbnailUrl) setThumbnailUrl(business.thumbnailUrl);
          if (business.googleReviewUrl) {
            setGoogleReviewUrl(business.googleReviewUrl);
            setSavedDestinationUrl(business.googleReviewUrl);
            setHasConfirmedDestination(true);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setDestinationMessage({
            type: 'error',
            text: error instanceof Error ? error.message : 'Could not load the saved review destination.',
          });
        }
      } finally {
        if (!cancelled) setIsLoadingDestination(false);
      }
    };

    void loadSavedData();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateMode, editQrId]);

  // Both the preview and exports use this resolved destination.
  useEffect(() => {
    if (!destinationValidation.valid) {
      setRealQrDataUrl('');
      setGeneratedQrTarget(null);
      setQrGenerationMessage(null);
      return;
    }

    try {
      let targetUrl = '';
      if (qrMode === 'direct') {
        targetUrl = cleanDestinationUrl(destinationValidation.url);
      } else {
        // Guided Review Assistant mode: encode clean guest token if not yet saved in cloud
        const origin =
          typeof window !== 'undefined' && window.location.origin
            ? window.location.origin
            : process.env.NEXT_PUBLIC_APP_URL || 'https://revvly.app';

        if (selectedQrToken) {
          targetUrl = `${origin}/qr/${encodeURIComponent(selectedQrToken)}`;
        } else {
          const effectiveLogo =
            logoUrl && (logoUrl.startsWith('http') || logoUrl.startsWith('/api/public/asset'))
              ? logoUrl
              : org?.logoUrl && (org.logoUrl.startsWith('http') || org.logoUrl.startsWith('/api/public/asset'))
              ? org.logoUrl
              : undefined;
          const effectiveThumb =
            thumbnailUrl && (thumbnailUrl.startsWith('http') || thumbnailUrl.startsWith('/api/public/asset'))
              ? thumbnailUrl
              : org?.thumbnailUrl && (org.thumbnailUrl.startsWith('http') || org.thumbnailUrl.startsWith('/api/public/asset'))
              ? org.thumbnailUrl
              : undefined;

          const gToken = createGuestToken(
            businessName,
            location,
            destinationValidation.url,
            categoryValue,
            accentColor,
            effectiveLogo,
            effectiveThumb,
            subcategory
          );
          targetUrl = `${origin}/qr/${encodeURIComponent(gToken)}`;
        }
      }

      const qrEngineResult = generateCleanQr(targetUrl, {
        style: qrStyle,
        geometry,
        centerEmblem,
        darkColor: customColors.qrColor || currentPresetData.finderColor || '#0B1C30',
        businessLogoUrl: localLogoDataUrl || logoUrl,
      });

      setRealQrDataUrl(qrEngineResult.dataUrl);
      setQrValidation(qrEngineResult);
      setGeneratedQrTarget(targetUrl);
      setQrGenerationMessage(null);
    } catch (error) {
      console.error('Failed to generate preview QR:', error);
      setRealQrDataUrl('');
      setQrValidation(null);
      setGeneratedQrTarget(null);
      setQrGenerationMessage('Could not generate this QR code. Check the destination URL and try again.');
    }
  }, [
    destinationValidation,
    canPreviewQr,
    customColors.qrColor,
    currentPresetData.finderColor,
    qrStyle,
    geometry,
    centerEmblem,
    qrMode,
    selectedQrToken,
    businessName,
    location,
    categoryValue,
    subcategory,
    accentColor,
    localLogoDataUrl,
    logoUrl,
    thumbnailUrl,
    org?.logoUrl,
    org?.thumbnailUrl,
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isQrContrastLow = useMemo(() => {
    const raw = (customColors.qrColor || currentPresetData.finderColor || '#0B1C30').replace('#', '');
    if (raw.length !== 6) return false;
    const r = parseInt(raw.slice(0, 2), 16) / 255;
    const g = parseInt(raw.slice(2, 4), 16) / 255;
    const b = parseInt(raw.slice(4, 6), 16) / 255;
    const toLinear = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    const lum = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    return lum > 0.65;
  }, [customColors.qrColor, currentPresetData.finderColor]);

  const updateCustomColor = (key: string, newColor: string) => {
    let formatted = newColor.trim();
    if (formatted && !formatted.startsWith('#')) formatted = `#${formatted}`;
    setCustomColors((prev) => ({ ...prev, [key]: formatted }));
    if (key === 'ctaBgColor') {
      setAccentColor(formatted);
    }
  };

  const resetSingleColor = (key: string) => {
    setCustomColors((prev) => {
      const copy = { ...prev };
      delete (copy as Record<string, unknown>)[key];
      return copy;
    });
    if (key === 'ctaBgColor') {
      setAccentColor(currentPresetData.defaultAccent);
    }
  };

  const handleResetColors = () => {
    setCustomColors({});
    setAccentColor(currentPresetData.defaultAccent);
    showToast(`Restored ${currentPresetData.name} default palette`);
  };

  type CustomColorKey =
    | 'posterBg'
    | 'qrColor'
    | 'businessNameColor'
    | 'ctaTextColor'
    | 'headlineColor'
    | 'starsColor'
    | 'ctaBgColor';

  interface ColorControlConfig {
    key: CustomColorKey;
    label: string;
    description: string;
    defaultHex: string;
    popularSwatches: string[];
  }

  const colorControls: ColorControlConfig[] = useMemo(
    () => [
      {
        key: 'posterBg',
        label: 'Poster Background',
        description: 'Background color of the physical tent poster card',
        defaultHex: currentPresetData.bgHex || '#ffffff',
        popularSwatches: [
          currentPresetData.bgHex || '#ffffff',
          '#ffffff',
          '#0F172A',
          '#18181B',
          '#FFFDF5',
          '#F0FDF4',
          '#EFF4FF',
          '#0E7490',
        ],
      },
      {
        key: 'qrColor',
        label: 'QR Code Modules & Finder Patterns',
        description: 'Color of QR pattern modules and finder corners',
        defaultHex: currentPresetData.finderColor || '#0B1C30',
        popularSwatches: [
          currentPresetData.finderColor || '#0B1C30',
          '#0B1C30',
          '#1A73E8',
          '#0F172A',
          '#D97706',
          '#059669',
          '#7C3AED',
          '#EA4335',
        ],
      },
      {
        key: 'businessNameColor',
        label: 'Main Heading & Business Name',
        description: 'Business title and location/category details',
        defaultHex: currentPresetData.textHex || '#0B1C30',
        popularSwatches: [
          currentPresetData.textHex || '#0B1C30',
          '#0B1C30',
          '#ffffff',
          '#78350F',
          '#064E3B',
          '#1E293B',
          '#1A73E8',
        ],
      },
      {
        key: 'ctaTextColor',
        label: '“Scan to share your experience” Text',
        description: 'CTA button label and camera icon color',
        defaultHex: '#FFFFFF',
        popularSwatches: ['#FFFFFF', '#0B1C30', '#0F172A', '#F8FAFC', '#FEF3C7', '#1A73E8'],
      },
      {
        key: 'headlineColor',
        label: '“Review us on Google” Text',
        description: 'Primary customer callout headline above the stars',
        defaultHex: currentPresetData.textHex || '#0B1C30',
        popularSwatches: [
          currentPresetData.textHex || '#0B1C30',
          '#0B1C30',
          '#ffffff',
          '#1A73E8',
          '#78350F',
          '#064E3B',
          '#D97706',
        ],
      },
      {
        key: 'starsColor',
        label: 'Star Rating Icons',
        description: 'Color of the 5-star rating icons',
        defaultHex: '#FBBC04',
        popularSwatches: ['#FBBC04', '#F59E0B', '#F97316', '#EA4335', '#1A73E8', '#34A853', '#FFFFFF'],
      },
      {
        key: 'ctaBgColor',
        label: 'CTA Button Background',
        description: 'Background fill of the scan action pill/button',
        defaultHex: currentPresetData.defaultAccent || '#1A73E8',
        popularSwatches: [
          currentPresetData.defaultAccent || '#1A73E8',
          '#1A73E8',
          '#0B1C30',
          '#34A853',
          '#D97706',
          '#EA4335',
          '#7C3AED',
          '#0F172A',
        ],
      },
    ],
    [currentPresetData]
  );

  const handleTouchpointChange = (qrId: string) => {
    setSelectedQrId(qrId);

    const found = qrList.find((q) => q.id === qrId);
    if (found) {
      setQrMode(getQrDestinationMode(found));
      setPlacementTag(found.placementName || found.placementType || '');
      if (found.headline) setHeadline(found.headline);
      if (found.tagline) setCtaText(found.tagline);
      setSupportingText(found.supportingText || '');
      if (found.accentColor) {
        setAccentColor(found.accentColor);
      }
      if (found.preset) setSelectedPreset(found.preset);
      if (found.geometry) setGeometry(found.geometry);
      if (found.centerEmblem) setCenterEmblem(found.centerEmblem);
      showToast(`Loaded settings for: ${found.placementName || found.placementType || found.slug}`);
    }
  };

  const handleAccentColorChange = (newColor: string) => {
    let formatted = newColor.trim();
    if (!formatted.startsWith('#')) formatted = `#${formatted}`;
    setAccentColor(formatted);
    setCustomColors((prev) => ({ ...prev, ctaBgColor: formatted }));
  };

  const handleFinderColorChange = (newColor: string) => {
    updateCustomColor('qrColor', newColor);
  };

  const handleConfirmDestination = async () => {
    if (categoryResult.error) {
      setDestinationMessage({ type: 'error', text: categoryResult.error });
      return;
    }
    if (subcategory && categoryValue !== 'Hotel') {
      setDestinationMessage({ type: 'error', text: 'Choose a hotel category before selecting a subcategory.' });
      return;
    }
    if (!destinationValidation.valid) {
      setDestinationMessage({ type: 'error', text: destinationValidation.message });
      return;
    }
    if (!hasConfirmedDestination) {
      setDestinationMessage({
        type: 'error',
        text: 'Confirm that you checked this link and it opens the correct business review destination.',
      });
      return;
    }
    if (!isSupabaseConfigured) {
      const localOrg = setStoredOrg({
        id: org?.id || crypto.randomUUID(),
        name: businessName.trim(),
        category: categoryValue,
        subcategory,
        city: location.trim(),
        googleReviewUrl: destinationValidation.url,
        accentColor,
        logoUrl,
      });
      setOrg(localOrg);
      setGoogleReviewUrl(destinationValidation.url);
      setSavedDestinationUrl(destinationValidation.url);
      setHasConfirmedDestination(true);
      setDestinationMessage({
        type: 'success',
        text: 'Review destination confirmed. Your QR code is ready to customize.',
      });
      setActiveTab('qrstyle');
      return;
    }
    if (isDestinationSaved && isBusinessCategorySaved) {
      setDestinationMessage({ type: 'success', text: 'Destination is saved. Continue designing your QR code.' });
      setActiveTab('qrstyle');
      return;
    }

    setIsSavingDestination(true);
    setDestinationMessage(null);
    try {
      const response = await fetch('/api/business/review-destination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationUrl: destinationValidation.url,
          confirmed: true,
          businessName,
          city: location,
          category: categoryValue,
          subcategory,
          businessId: isEditMode ? org?.id : undefined,
          createNewBusiness: isCreateMode,
        }),
      });
      const result = await response.json();
      if (response.status === 401) {
        // Guest user: save locally to browser storage
        setQrListFromServer(false);
        const localOrg = setStoredOrg({
          id: org?.id || crypto.randomUUID(),
          name: businessName.trim(),
          category: categoryValue,
          subcategory,
          city: location.trim(),
          googleReviewUrl: destinationValidation.url,
          accentColor,
          logoUrl,
        });
        setOrg(localOrg);
        setGoogleReviewUrl(destinationValidation.url);
        setSavedDestinationUrl(destinationValidation.url);
        setHasConfirmedDestination(true);
        setDestinationMessage({
          type: 'success',
          text: 'Review destination confirmed. Your QR code is ready to preview and export.',
        });
        setActiveTab('qrstyle');
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message || 'Could not save this destination. Check your connection and try again.'
        );
      }

      const business = result.business;
      setGoogleReviewUrl(business.googleReviewUrl);
      setSavedDestinationUrl(business.googleReviewUrl);
      setHasConfirmedDestination(true);
      setBusinessName(business.name);
      setLocation(business.city);
      const savedCategory = categorySelectionForSavedValue(business.category);
      setCategory(savedCategory.selection);
      setCustomCategory(savedCategory.customCategory);
      setSubcategory(business.subcategory || '');
      if (business.logoUrl) setLogoUrl(business.logoUrl);
      if (business.thumbnailUrl) setThumbnailUrl(business.thumbnailUrl);
      const updatedOrg = setStoredOrg({
        id: business.id,
        name: business.name,
        category: business.category,
        subcategory: business.subcategory,
        city: business.city,
        googleReviewUrl: business.googleReviewUrl,
        logoUrl: business.logoUrl,
        thumbnailUrl: business.thumbnailUrl,
      });
      setOrg(updatedOrg);
      setDestinationMessage({
        type: 'success',
        text: 'Destination saved. Save your QR design to create its public customer link.',
      });
      setActiveTab('qrstyle');
    } catch (error) {
      setDestinationMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Could not save this destination.',
      });
    } finally {
      setIsSavingDestination(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      showToast('Upload a PNG, JPEG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5 MB limit.');
      return;
    }

    setIsUploadingLogo(true);
    setLogoName(file.name);

    const applyLocalLogo = () => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setLocalLogoDataUrl(dataUrl);
        setLogoUrl(dataUrl);
        setStoredOrg({ logoUrl: dataUrl });
        try {
          localStorage.setItem('reviewqr_guest_logo', dataUrl);
        } catch {}
        showToast('Logo applied to stand artwork.');
      };
      reader.readAsDataURL(file);
    };

    try {
      applyLocalLogo();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');
      if (org?.id) {
        formData.append('orgId', org.id);
      }

      const uploadEndpoint = org?.id ? '/api/business/upload' : '/api/public/upload';
      const res = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          setLogoUrl(data.url);
          setStoredOrg({ logoUrl: data.url, logoPath: data.path });
          try {
            localStorage.setItem('reviewqr_guest_logo', data.url);
          } catch {}
          showToast('Logo uploaded and applied to stand artwork.');
        }
      }
    } catch {
      // Keep local preview if network upload fails
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!logoUrl) return;
    setIsRemovingLogo(true);
    try {
      if (isSupabaseConfigured && org?.id) {
        const res = await fetch(
          `/api/business/upload?orgId=${encodeURIComponent(org.id)}&type=logo`,
          { method: 'DELETE' }
        );
        if (!res.ok && res.status !== 401) {
          const data = await res.json();
          throw new Error(data.message || data.code || 'Logo removal failed.');
        }
      }
      setLogoUrl('');
      setLocalLogoDataUrl('');
      setLogoName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (centerEmblem === 'business-logo') setCenterEmblem('google-g');
      setStoredOrg({ logoUrl: '', logoPath: '' });
      showToast('Logo removed.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Logo removal failed.');
    } finally {
      setIsRemovingLogo(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      showToast('Upload a PNG, JPEG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5 MB limit.');
      return;
    }

    setIsUploadingThumbnail(true);
    setThumbnailName(file.name);

    const applyLocalThumbnail = () => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setLocalThumbDataUrl(dataUrl);
        setThumbnailUrl(dataUrl);
        setStoredOrg({ thumbnailUrl: dataUrl });
        try {
          localStorage.setItem('reviewqr_guest_thumb', dataUrl);
        } catch {}
        showToast('Venue cover photo applied.');
      };
      reader.readAsDataURL(file);
    };

    try {
      applyLocalThumbnail();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'thumbnail');
      if (org?.id) {
        formData.append('orgId', org.id);
      }

      const uploadEndpoint = org?.id ? '/api/business/upload' : '/api/public/upload';
      const res = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          setThumbnailUrl(data.url);
          setStoredOrg({ thumbnailUrl: data.url, thumbnailPath: data.path });
          try {
            localStorage.setItem('reviewqr_guest_thumb', data.url);
          } catch {}
          showToast('Venue cover photo uploaded successfully.');
        }
      }
    } catch {
      // Keep local preview if network upload fails
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleSaveConfiguration = async () => {
    if (categoryResult.error) {
      showToast(categoryResult.error);
      setActiveTab('branding');
      return;
    }
    if (subcategory && categoryValue !== 'Hotel') {
      showToast('Choose a hotel category before selecting a subcategory.');
      setActiveTab('branding');
      return;
    }
    if (!isDestinationSaved || !destinationValidation.valid) {
      showToast('Confirm and save a valid destination before saving QR design settings.');
      setActiveTab('branding');
      return;
    }
    if (!isBusinessCategorySaved) {
      showToast('Save your business category before saving QR design settings.');
      setActiveTab('branding');
      return;
    }
    const effectivePlacementTag = placementTag.trim() || businessName.trim() || 'Tabletop Standee';
    if (!businessName.trim()) {
      showToast('Enter a business name before saving the QR design.');
      setActiveTab('branding');
      return;
    }
    setIsSavingQr(true);
    try {
      if (!isSupabaseConfigured) {
        const savedQr = saveQRCode({
          id: selectedQrId || undefined,
          orgId: org?.id || 'local-business',
          slug: selectedQr?.slug || crypto.randomUUID(),
          businessName: businessName.trim(),
          destinationUrl: destinationValidation.url,
          destinationMode: qrMode,
          placementName: effectivePlacementTag,
          placementType: effectivePlacementTag,
          headline,
          tagline: ctaText,
          supportingText,
          accentColor,
          currentTemplate: selectedPreset,
          preset: selectedPreset,
          geometry,
          centerEmblem: centerEmblem === 'none' ? undefined : centerEmblem,
          status: 'active',
        });
        setQrList((current) => [savedQr, ...current.filter((qr) => qr.id !== savedQr.id)]);
        setSelectedQrId(savedQr.id);
        setStoredOrg({
          id: savedQr.orgId,
          name: businessName.trim(),
          category: categoryValue,
          subcategory,
          city: location.trim(),
          googleReviewUrl: destinationValidation.url,
          accentColor,
          logoUrl,
          thumbnailUrl,
        });
        showToast('Direct QR design saved in this browser. Its code opens the exact review URL.');
        setTimeout(() => router.push('/my-qr-codes'), 1000);
        return;
      }

      const updatingExisting = Boolean(selectedQrId && qrList.some((qr) => qr.id === selectedQrId));
      const response = await fetch(updatingExisting ? `/api/qr/${encodeURIComponent(selectedQrId)}` : '/api/qr', {
        method: updatingExisting ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placementName: placementTag.trim(),
          headline,
          tagline: ctaText,
          supportingText,
          accentColor,
          preset: selectedPreset,
          geometry,
          centerEmblem: centerEmblem === 'none' ? 'google-g' : centerEmblem,
          destinationMode: qrMode,
          businessId: org?.id,
        }),
      });
      const result = await response.json();
      if (response.status === 401) {
        // Guest user: save locally to browser storage
        setQrListFromServer(false);
        const savedQr = saveQRCode({
          id: selectedQrId || undefined,
          orgId: org?.id || 'guest-business',
          slug: selectedQr?.slug || crypto.randomUUID(),
          businessName: businessName.trim(),
          destinationUrl: destinationValidation.url,
          destinationMode: qrMode,
          placementName: placementTag.trim(),
          placementType: placementTag.trim(),
          headline,
          tagline: ctaText,
          supportingText,
          accentColor,
          currentTemplate: selectedPreset,
          preset: selectedPreset,
          geometry,
          centerEmblem: centerEmblem === 'none' ? undefined : centerEmblem,
          status: 'active',
        });
        setQrList((current) => [savedQr, ...current.filter((qr) => qr.id !== savedQr.id)]);
        setSelectedQrId(savedQr.id);
        setStoredOrg({
          id: savedQr.orgId,
          name: businessName.trim(),
          category: categoryValue,
          subcategory,
          city: location.trim(),
          googleReviewUrl: destinationValidation.url,
          accentColor,
          logoUrl,
          thumbnailUrl,
        });
        showToast('QR design saved in your browser. Ready to export PNG or print PDF!');
        return;
      }

      if (!response.ok || !result.qr) {
        throw new Error(result.message || result.code || 'Could not save this QR design.');
      }

      const savedQr = result.qr as QRCode;
      setQrListFromServer(true);
      setQrList((current) => [
        savedQr,
        ...current.filter((qr) => qr.id !== savedQr.id),
      ]);
      setSelectedQrId(savedQr.id);
      saveQRCode(savedQr);

      setStoredOrg({
        id: org?.id,
        name: businessName,
        category: categoryValue,
        subcategory,
        city: location,
        accentColor,
        logoUrl,
      });
      showToast('QR design saved to your account. The customer QR is ready to scan.');
      setTimeout(() => router.push('/my-qr-codes'), 1000);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save this QR design.');
    } finally {
      setIsSavingQr(false);
    }
  };

  const handleDownloadPNG = () => {
    if (!destinationValidation.valid || !realQrDataUrl || !generatedQrTarget) {
      showToast('Enter a valid destination before exporting the poster.');
      return;
    }
    const qrTarget = generatedQrTarget;

    showToast('Preparing QR poster PNG…');
    setTimeout(async () => {
      const link = document.createElement('a');
      link.download = `${businessName.toLowerCase().replace(/\s+/g, '_')}_${selectedPreset}_standee.png`;
      let exportLogoImage: HTMLImageElement | null = null;
      const logoSource = localLogoDataUrl || logoUrl;
      if (logoSource) {
        try {
          let imageSource = logoSource;
          if (!logoSource.startsWith('data:image/')) {
            try {
              const parsedLogoUrl = new URL(logoSource, window.location.origin);
              const storedAsset = parsedLogoUrl.pathname.match(
                /\/storage\/v1\/object\/(?:sign|public)\/business-assets\/(.+)$/
              );
              if (storedAsset) {
                imageSource = `/api/public/asset?path=${encodeURIComponent(decodeURIComponent(storedAsset[1]))}`;
              }
            } catch {
              // Relative app asset URLs are fetched directly below.
            }

            const logoResponse = await fetch(imageSource, { cache: 'no-store' });
            if (!logoResponse.ok) throw new Error('Logo image request failed.');
            const logoBlob = await logoResponse.blob();
            if (!['image/png', 'image/jpeg', 'image/webp'].includes(logoBlob.type) || logoBlob.size === 0) {
              throw new Error('Unsupported logo image.');
            }
            const logoDataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => typeof reader.result === 'string'
                ? resolve(reader.result)
                : reject(new Error('Could not read the logo image.'));
              reader.onerror = () => reject(new Error('Could not read the logo image.'));
              reader.readAsDataURL(logoBlob);
            });
            imageSource = logoDataUrl;
          }

          exportLogoImage = await new Promise<HTMLImageElement>((resolve, reject) => {
            const logoImage = new Image();
            logoImage.onload = () => resolve(logoImage);
            logoImage.onerror = () => reject(new Error('Could not decode the logo image.'));
            logoImage.src = imageSource;
          });
        } catch {
          showToast('Could not load the business logo for this PNG. Please try again.');
          return;
        }
      }
      const escapeXml = (value: string) =>
        value.replace(/[&<>"']/g, (character) => {
          const entities: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&apos;',
          };
          return entities[character];
        });

      // Use actual hex values with custom overrides taking precedence over preset defaults
      const bgHex = customColors.posterBg || currentPresetData.bgHex || '#ffffff';
      const textHex = customColors.businessNameColor || currentPresetData.textHex || '#0B1C30';
      const subtitleHex = customColors.businessNameColor
        ? customColors.businessNameColor
        : (currentPresetData.subtitleHex || '#565E74');
      const headlineColor = customColors.headlineColor || currentPresetData.textHex || '#0B1C30';
      const starsColor = customColors.starsColor || '#FBBC04';
      const ctaBgColor = customColors.ctaBgColor || accentColor || currentPresetData.defaultAccent;
      const ctaTextColor = customColors.ctaTextColor || '#FFFFFF';

      const starPoints = (cx: number, cy: number, rOut = 11, rIn = 5) => {
        const points: string[] = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? rOut : rIn;
          points.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
        }
        return points.join(' ');
      };

      const starsSvg = [236, 268, 300, 332, 364]
        .map((cx) => `<polygon points="${starPoints(cx, 612)}" fill="${starsColor}"/>`)
        .join('');

      const ctaY = supportingText.trim() ? 675 : 655;

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
          <defs>
            <linearGradient id="googleGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#4285F4"/>
              <stop offset="33%" stop-color="#EA4335"/>
              <stop offset="66%" stop-color="#FBBC05"/>
              <stop offset="100%" stop-color="#34A853"/>
            </linearGradient>
            <clipPath id="logoCrestClip">
              <circle cx="300" cy="100" r="28"/>
            </clipPath>
            <clipPath id="centerEmblemClip">
              <circle cx="300" cy="370" r="24"/>
            </clipPath>
          </defs>
          <rect width="600" height="850" rx="32" fill="${bgHex}"/>
          ${selectedPreset === 'google-classic' ? '<rect width="600" height="8" fill="url(#googleGrad)"/>' : ''}
          
          <!-- Top Pill -->
          <rect x="180" y="30" width="240" height="28" rx="14" fill="#0F172A"/>
          <text x="300" y="48" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="11" letter-spacing="1.5" fill="#FFFFFF">SHARE YOUR EXPERIENCE</text>
          
          <!-- Brand Crest Badge -->
          <circle cx="300" cy="100" r="28" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="1.5"/>
          ${
            exportLogoImage
              ? ''
              : `<circle cx="300" cy="100" r="26" fill="#0F172A"/><path d="M290 98 h20 v8 h-20 z M292 94 h5 v4 h-5 z" fill="#FFFFFF"/>`
          }

          <!-- Business Title & Category/Location -->
          <text x="300" y="156" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="22" letter-spacing="1" fill="${textHex}">${escapeXml(businessName ? businessName.toUpperCase() : 'YOUR BUSINESS NAME')}</text>
          <text x="300" y="180" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="11" letter-spacing="1.5" fill="${subtitleHex}">${escapeXml(businessDetails.toUpperCase())}</text>

          <!-- Central Scannable QR Card -->
          <rect x="140" y="210" width="320" height="320" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
          <image x="155" y="225" width="290" height="290" href="${realQrDataUrl}"/>

          <!-- Centered Floating Emblem inside QR -->
          ${
            centerEmblem !== 'none'
              ? `<circle cx="300" cy="370" r="26" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
              ${
                centerEmblem === 'business-logo' && exportLogoImage
                  ? ''
                  : `<g transform="translate(286, 356) scale(1.15)">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </g>`
              }`
              : ''
          }

          <!-- Headline & Stars -->
          <text x="300" y="580" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="22" fill="${headlineColor}">${escapeXml(headline)}</text>
          ${starsSvg}
          ${supportingText.trim() ? `<text x="300" y="646" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" fill="${subtitleHex}">${escapeXml(supportingText.trim())}</text>` : ''}

          <!-- CTA Box (Scan to share your experience) -->
          <rect x="90" y="${ctaY}" width="420" height="52" rx="14" fill="${ctaBgColor}"/>
          <g transform="translate(142, ${ctaY + 16}) scale(0.85)">
            <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" fill="${ctaTextColor}"/>
          </g>
          <text x="310" y="${ctaY + 32}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="15" fill="${ctaTextColor}">${escapeXml(ctaText)}</text>
        </svg>
      `;
      const svgUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(svgUrl);
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 850;
        const context = canvas.getContext('2d');
        if (!context) {
          showToast('Could not prepare the poster image in this browser.');
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        if (exportLogoImage) {
          const drawCircularLogo = (centerX: number, centerY: number, radius: number) => {
            const imageWidth = exportLogoImage?.naturalWidth || exportLogoImage?.width || 1;
            const imageHeight = exportLogoImage?.naturalHeight || exportLogoImage?.height || 1;
            const diameter = radius * 2;
            const scale = Math.max(diameter / imageWidth, diameter / imageHeight);
            const drawWidth = imageWidth * scale;
            const drawHeight = imageHeight * scale;
            context.save();
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, Math.PI * 2);
            context.clip();
            context.drawImage(
              exportLogoImage,
              centerX - drawWidth / 2,
              centerY - drawHeight / 2,
              drawWidth,
              drawHeight
            );
            context.restore();
          };
          drawCircularLogo(300, 100, 28);
          if (centerEmblem === 'business-logo') drawCircularLogo(300, 370, 24);
        }
        canvas.toBlob((blob) => {
          if (!blob) {
            showToast('Could not export the poster PNG.');
            return;
          }
          const downloadBlob = (file: Blob) => {
            const pngUrl = URL.createObjectURL(file);
            link.href = pngUrl;
            link.click();
            setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
          };

          void (async () => {
            try {
              const form = new FormData();
              form.set('image', blob, link.download);
              form.set('qrName', placementTag.trim() || businessName.trim());
              form.set('businessName', businessName.trim());
              form.set('businessCity', location.trim());
              form.set('qrType', qrMode);
              form.set('template', selectedPreset);
              form.set('destinationUrl', qrTarget);
              if (qrListFromServer && selectedQr && selectedQrToken && !selectedQrToken.startsWith('guest_')) {
                form.set('qrCodeId', selectedQr.id);
                form.set('qrToken', selectedQrToken);
              }

              const prepareResponse = await fetch('/api/qr-downloads', { method: 'POST', body: form });
              const prepared = await prepareResponse.json();
              if (!prepareResponse.ok || !prepared.ok || !prepared.id || !prepared.deliveryToken) {
                throw new Error('Download tracking could not be prepared.');
              }

              const fileResponse = await fetch(`/api/qr-downloads/${encodeURIComponent(prepared.id)}/file`, {
                headers: { Authorization: `Bearer ${prepared.deliveryToken}` },
              });
              if (!fileResponse.ok) throw new Error('Stored poster could not be retrieved.');
              const deliveredBlob = await fileResponse.blob();
              if (deliveredBlob.size === 0 || deliveredBlob.type !== 'image/png') {
                throw new Error('Stored poster response was invalid.');
              }
              downloadBlob(deliveredBlob);

              const completedResponse = await fetch(`/api/qr-downloads/${encodeURIComponent(prepared.id)}/complete`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${prepared.deliveryToken}` },
              });
              if (completedResponse.ok) {
                showToast('Poster PNG downloaded and recorded.');
              } else {
                showToast('Poster PNG downloaded. Its delivery could not be recorded.');
              }
            } catch {
              // Keep guest exports available if Supabase or the tracking migration is unavailable.
              downloadBlob(blob);
              showToast('Poster PNG downloaded. Download tracking was unavailable.');
            }
          })();
        }, 'image/png');
      };
      image.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        showToast('Could not render the poster PNG.');
      };
      image.src = svgUrl;
    }, 400);
  };

  const handleExportPDF = () => {
    if (!destinationValidation.valid || !realQrDataUrl || !generatedQrTarget) {
      showToast('Enter a valid destination before printing the poster.');
      return;
    }
    window.print();
  };

  return (
    <DashboardShell hideSidebar={true} hideHeader={true}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1C30] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce border border-slate-700">
          <span className="material-symbols-outlined text-[#89FA9B] text-[20px]">check_circle</span>
          <span className="font-semibold text-xs">{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input for Logo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleLogoUpload}
      />

      {/* Hidden File Input for Cover Thumbnail */}
      <input
        ref={thumbInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleThumbnailUpload}
      />

      <div className="flex flex-col w-full min-h-screen">
        {/* Top Studio Context Header */}
        <div className="px-6 py-4 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D8E2FF] flex items-center justify-center text-[#005BBF]">
              <span className="material-symbols-outlined text-[24px]">palette</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-[#0B1C30] tracking-tight">QR Design Studio</span>
              </div>
              <p className="text-xs text-[#565E74]">
                Live visual customizer for counter displays, table tents, and print standees
              </p>
            </div>
          </div>

          {/* Right Action Suite */}
          {activeTab === 'copy' && <div className="flex items-center gap-2.5 flex-wrap">
            <button
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#0B1C30] transition-colors flex items-center gap-1.5 shadow-xs active:scale-95"
              onClick={handleExportPDF}
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span>Print / Save PDF</span>
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-[#005BBF] text-white hover:bg-[#1A73E8] text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              onClick={handleDownloadPNG}
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Download PNG</span>
            </button>
          </div>}
        </div>

        {/* Workspace Grid: 2 Columns (Image 1) */}
        <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto w-full">
          {/* LEFT COLUMN: Customization Controls (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Sequential Studio Steps */}
            <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1 shadow-xs" role="group" aria-label="QR design steps">
              {[
                { id: 'branding', label: 'Branding', icon: 'badge' },
                { id: 'qrstyle', label: 'QR Code', icon: 'qr_code_2' },
                { id: 'templates', label: 'Templates', icon: 'style' },
                { id: 'copy', label: 'Preview / Download', icon: 'download' },
              ].map((step, index) => {
                const stepId = step.id as QrStudioStep;
                const isCurrent = activeTab === stepId;
                const isComplete = isStepComplete(stepId);
                const isUnlocked = canOpenStep(stepId);
                return (
                  <button
                    key={step.id}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`Step ${index + 1}: ${step.label}, ${isCurrent ? 'current step' : isComplete ? 'complete' : isUnlocked ? 'available' : 'locked'}`}
                    className={`min-w-0 rounded-lg px-1.5 py-2 text-[10px] transition-all sm:px-2 sm:text-xs ${
                      isCurrent
                        ? 'bg-white text-[#005BBF] shadow-sm font-bold'
                        : isComplete
                          ? 'text-emerald-800 hover:bg-white/70'
                          : isUnlocked
                            ? 'text-[#414754] hover:bg-white/70 hover:text-[#0B1C30]'
                            : 'cursor-not-allowed text-slate-400'
                    }`}
                    disabled={!isUnlocked}
                    onClick={() => navigateToStep(stepId)}
                    title={!isUnlocked ? 'Complete the previous step to unlock this one.' : undefined}
                    type="button"
                  >
                    <span className="flex items-center justify-center gap-1">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/80 text-[10px] font-bold">
                        {isComplete ? <span aria-hidden="true" className="material-symbols-outlined text-sm">check</span> : index + 1}
                      </span>
                      <span className="truncate">{step.label}</span>
                    </span>
                    <span className="sr-only">{isComplete ? 'Complete' : isUnlocked ? 'Available' : 'Locked'}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex min-h-7 items-center justify-between gap-3 px-1">
              <p className="text-[11px] font-medium text-[#565E74]" aria-live="polite">
                Step {activeStepIndex + 1} of {QR_STUDIO_STEPS.length}: {stepLabels[activeTab]}
              </p>
              {previousStep && (
                <button
                  className="rounded-md text-xs font-semibold text-[#005BBF] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A73E8]"
                  onClick={() => navigateToStep(previousStep)}
                  type="button"
                >
                  ← Back to {stepLabels[previousStep]}
                </button>
              )}
            </div>

            {/* TAB 1: Business & Identity (Image 1) */}
            {activeTab === 'branding' && (
              <div className="p-6 rounded-xl bg-white shadow-sm flex flex-col gap-4 border border-slate-100 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#D8E2FF] text-[#005BBF] flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <h2 className="text-base font-bold text-[#0B1C30]">Business &amp; Identity</h2>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Manual setup
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="business-name" className="text-xs font-semibold text-[#414754]">
                      Business name
                    </label>
                    <input
                      id="business-name"
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 text-xs text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:bg-white border border-slate-200 transition-all font-semibold"
                      type="text"
                      autoComplete="organization"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="business-location" className="text-xs font-semibold text-[#414754]">
                      City or location
                    </label>
                    <input
                      id="business-location"
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 text-xs text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:bg-white border border-slate-200 transition-all"
                      type="text"
                      autoComplete="address-level2"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                {/* Business Category (placed after business name & city) */}
                <div className="space-y-1">
                  <label htmlFor="business-category" className="text-xs font-semibold text-[#414754]">
                    Business Category
                  </label>
                  <input
                    id="business-category"
                    list="business-category-options"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 text-xs text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:bg-white border border-slate-200 transition-all"
                    type="search"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (e.target.value !== 'Other') setCustomCategory('');
                      if (e.target.value !== 'Hotel') setSubcategory('');
                    }}
                    placeholder="Select a business category"
                    maxLength={80}
                    required
                    aria-required="true"
                  />
                  <datalist id="business-category-options">
                    {BUSINESS_CATEGORIES.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                  {category.trim().toLowerCase() === 'other' && (
                    <input
                      id="custom-business-category"
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 text-xs text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:bg-white border border-slate-200 transition-all"
                      type="text"
                      value={customCategory}
                      onChange={(event) => setCustomCategory(event.target.value)}
                      placeholder="Enter your business category"
                      maxLength={80}
                      required
                      aria-label="Custom business category"
                    />
                  )}
                  {categoryValue === 'Hotel' && (
                    <div className="space-y-1">
                      <label htmlFor="business-subcategory" className="text-xs font-semibold text-[#414754]">
                        Subcategory (optional)
                      </label>
                      <select
                        id="business-subcategory"
                        value={subcategory}
                        onChange={(event) => setSubcategory(event.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-slate-50 text-xs text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:bg-white border border-slate-200 transition-all"
                      >
                        <option value="">No subcategory</option>
                        {HOTEL_SUBCATEGORIES.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Brand Crest / Logo Mark */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#414754]">Brand Crest / Logo Mark</label>
                  <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between gap-3 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center p-1 overflow-hidden border border-slate-100">
                        {(localLogoDataUrl || logoUrl) ? (
                          <img
                            src={localLogoDataUrl || logoUrl}
                            alt="Logo"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              if (localLogoDataUrl && e.currentTarget.src !== localLogoDataUrl) {
                                e.currentTarget.src = localLogoDataUrl;
                              }
                            }}
                          />
                        ) : (
                          <span className="material-symbols-outlined text-[#B06000] text-2xl">hotel</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#0B1C30] truncate max-w-[140px]">
                          {logoName || ((localLogoDataUrl || logoUrl) ? 'Active logo applied' : 'Default emblem')}
                        </span>
                        <span className="text-[11px] text-[#565E74]">PNG, WebP, JPG up to 5MB</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-semibold text-[#005BBF] border border-slate-200 shadow-2xs transition-all"
                        type="button"
                        disabled={isUploadingLogo || isRemovingLogo}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isUploadingLogo ? 'Uploading...' : (localLogoDataUrl || logoUrl) ? 'Change' : 'Upload'}
                      </button>
                      {(localLogoDataUrl || logoUrl) && (
                        <button
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-xs font-semibold text-red-500 border border-slate-200 shadow-2xs transition-all"
                          type="button"
                          disabled={isRemovingLogo || isUploadingLogo}
                          onClick={handleRemoveLogo}
                        >
                          {isRemovingLogo ? 'Removing...' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Venue Cover Thumbnail Box */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#414754]">Venue Cover Photo (Customer Mobile Header)</label>
                  <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between gap-3 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
                        {(localThumbDataUrl || thumbnailUrl) ? (
                          <img
                            src={localThumbDataUrl || thumbnailUrl}
                            alt="Cover"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              if (localThumbDataUrl && e.currentTarget.src !== localThumbDataUrl) {
                                e.currentTarget.src = localThumbDataUrl;
                              }
                            }}
                          />
                        ) : (
                          <span className="material-symbols-outlined text-slate-400 text-2xl">landscape</span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-[#0B1C30] truncate max-w-[140px]">
                          {thumbnailName || ((localThumbDataUrl || thumbnailUrl) ? 'Active cover photo' : 'Default venue photo')}
                        </span>
                        <span className="text-[11px] text-[#565E74]">16:9 PNG, JPG up to 5MB</span>
                      </div>
                    </div>
                    <button
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-semibold text-[#005BBF] border border-slate-200 shadow-2xs transition-all shrink-0"
                      type="button"
                      disabled={isUploadingThumbnail}
                      onClick={() => thumbInputRef.current?.click()}
                    >
                      {isUploadingThumbnail ? 'Uploading...' : (localThumbDataUrl || thumbnailUrl) ? 'Change' : 'Upload Cover'}
                    </button>
                  </div>
                </div>

                <section className="space-y-4 rounded-xl border border-slate-200 bg-[#F8F9FF] p-4" aria-labelledby="destination-heading">
                  <div>
                    <h3 id="destination-heading" className="text-sm font-bold text-[#0B1C30]">
                      Review destination
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#565E74]">
                      Find your listing without an API key, or paste a review link you already have.
                    </p>
                  </div>

                  <div className="space-y-2" aria-labelledby="qr-mode-heading">
                    <h4 id="qr-mode-heading" className="text-xs font-bold text-[#414754]">
                      Choose what the QR opens
                    </h4>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        aria-pressed={qrMode === 'direct'}
                        onClick={() => {
                          setQrMode('direct');
                        }}
                        className={`min-h-16 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                          qrMode === 'direct'
                            ? 'border-[#005BBF] bg-[#EFF4FF] text-[#0B1C30]'
                            : 'border-slate-200 bg-white text-[#414754] hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-bold">Direct Google Review</span>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Free</span>
                        </span>
                        <span className="mt-1 block leading-4">QR opens the exact pasted link; no ReviewQR tracking.</span>
                      </button>
                      <button
                        type="button"
                        aria-pressed={qrMode === 'guided'}
                        onClick={() => {
                          setQrMode('guided');
                        }}
                        className={`min-h-16 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                          qrMode === 'guided'
                            ? 'border-[#005BBF] bg-[#EFF4FF] text-[#0B1C30]'
                            : 'border-slate-200 bg-white text-[#414754] hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-bold">Guided Review Assistant</span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">Paid</span>
                        </span>
                        <span className="mt-1 block leading-4">QR opens the ReviewQR customer page and tracks scans.</span>
                      </button>
                    </div>
                    {qrMode === 'guided' && qrGenerationMessage && (
                      <p className="text-xs leading-5 text-amber-800" role="status">{qrGenerationMessage}</p>
                    )}
                    {qrMode === 'direct' && !isSupabaseConfigured && (
                      <p className="text-xs leading-5 text-[#565E74]" role="status">
                        Direct QR designs can be created in this browser without cloud setup.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Choose how to find your review link">
                    <button
                      id="maps-mode-tab"
                      type="button"
                      role="tab"
                      aria-selected={destinationMode === 'maps'}
                      aria-controls="destination-mode-panel"
                      onClick={() => {
                        if (destinationMode === 'maps') {
                          window.open(activeMapsSearchUrl, '_blank', 'noopener,noreferrer');
                          const query = [businessName.trim(), location.trim()].filter(Boolean).join(' ');
                          showToast(query ? `Searching Google Maps for "${query}"…` : 'Opening Google Maps in a new tab…');
                        } else {
                          setDestinationMode('maps');
                        }
                      }}
                      className={`min-h-11 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                        destinationMode === 'maps'
                          ? 'bg-[#005BBF] text-white'
                          : 'bg-white text-[#414754] border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Find on Google Maps
                    </button>
                    <button
                      id="paste-mode-tab"
                      type="button"
                      role="tab"
                      aria-selected={destinationMode === 'paste'}
                      aria-controls="destination-mode-panel"
                      onClick={() => setDestinationMode('paste')}
                      className={`min-h-11 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                        destinationMode === 'paste'
                          ? 'bg-[#005BBF] text-white'
                          : 'bg-white text-[#414754] border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Paste Review Link
                    </button>
                  </div>

                  <div id="destination-mode-panel" role="tabpanel" aria-labelledby={destinationMode === 'maps' ? 'maps-mode-tab' : 'paste-mode-tab'}>
                    {destinationMode === 'maps' ? (
                      <div className="space-y-3">
                        <p className="text-xs leading-5 text-[#414754]">
                          Search opens Google Maps in a new tab. Select the correct listing yourself, then copy the
                          review link from the listing or your Business Profile.
                        </p>
                        <a
                          href={activeMapsSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            const query = [businessName.trim(), location.trim()].filter(Boolean).join(' ');
                            if (query) {
                              showToast(`Searching Google Maps for "${query}"…`);
                            } else {
                              showToast('Opening Google Maps. Search for your listing and copy the review link.');
                            }
                          }}
                          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all bg-[#EFF4FF] text-[#005BBF] hover:bg-[#DCE9FF] border border-[#005BBF]/30 shadow-xs cursor-pointer active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                          Search on Google Maps
                        </a>
                        {businessName.trim() || location.trim() ? (
                          <p className="text-xs text-[#005BBF] font-medium">
                            Searching for: {[businessName.trim(), location.trim()].filter(Boolean).join(' · ')}
                          </p>
                        ) : (
                          <p className="text-xs text-[#565E74]">
                            Tip: Enter your business name and city above to search automatically, or click to open Google Maps.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs leading-5 text-[#414754]">
                        Paste a review link copied from your Google Business Profile or Google Maps. ReviewQR checks
                        HTTPS syntax only; it cannot confirm the business or page behind the link.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="review-destination-url" className="text-xs font-semibold text-[#414754]">
                      {destinationMode === 'maps'
                        ? 'Paste the review link copied from the selected listing'
                        : 'Review link'}
                    </label>
                    <input
                      id="review-destination-url"
                      className="w-full min-h-11 px-3.5 py-2 rounded-xl bg-white text-xs font-mono text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 border border-slate-200"
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      value={googleReviewUrl}
                      onChange={(event) => {
                        setGoogleReviewUrl(event.target.value);
                        setHasConfirmedDestination(false);
                        setDestinationMessage(null);
                      }}
                      placeholder="https://..."
                      aria-describedby="destination-validation-message"
                    />
                    {destinationValidation.valid && (
                      <p className="text-xs leading-5 text-amber-800" role="status">
                        {destinationValidation.message}
                      </p>
                    )}
                    {!destinationValidation.valid && googleReviewUrl.trim() !== '' && (
                      <p className="text-xs leading-5 text-red-700" role="alert">
                        {destinationValidation.message}
                      </p>
                    )}
                    <div id="destination-validation-message" className="sr-only" aria-live="polite">
                      {destinationValidation.message}
                    </div>
                  </div>

                  {destinationValidation.valid && (
                    <a
                      href={destinationValidation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center gap-1 text-xs font-semibold text-[#005BBF] underline underline-offset-2"
                    >
                      Open link to test it
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    </a>
                  )}

                  <label className="flex items-start gap-2 text-xs leading-5 text-[#414754]">
                    <input
                      type="checkbox"
                      checked={hasConfirmedDestination}
                      onChange={(event) => setHasConfirmedDestination(event.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#005BBF] focus:ring-[#1A73E8]"
                    />
                    <span>I checked this link and confirm it opens the correct business review destination.</span>
                  </label>

                  {isLoadingDestination && (
                    <p className="text-xs text-[#565E74]" role="status">Loading your saved destination…</p>
                  )}
                  {!isSupabaseConfigured && (
                    <p className="text-xs leading-5 text-amber-800" role="status">
                      {qrMode === 'direct'
                        ? 'Cloud sync is unavailable. Direct destination and QR settings will be saved in this browser only.'
                        : 'Guided Review Assistant mode requires an authenticated Supabase account and a public HTTPS app URL.'}
                    </p>
                  )}
                  {destinationMessage && (
                    <p
                      className={`text-xs leading-5 ${
                        destinationMessage.type === 'error'
                          ? 'text-red-700'
                          : destinationMessage.type === 'success'
                          ? 'text-green-800'
                          : 'text-[#414754]'
                      }`}
                      role={destinationMessage.type === 'error' ? 'alert' : 'status'}
                    >
                      {destinationMessage.text}
                    </p>
                  )}

                </section>

                <button
                  className="w-full mt-3 py-3.5 px-4 rounded-xl bg-[#005BBF] hover:bg-[#1A73E8] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  type="button"
                  onClick={() => continueFromStep('branding')}
                >
                  <span>Continue to QR Code Styling</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            )}

            {/* TAB 2: QR Code Architecture & Styling */}
            {activeTab === 'qrstyle' && (
              <div className="p-6 rounded-xl bg-white shadow-sm flex flex-col gap-4 border border-slate-100 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#D8E2FF] text-[#005BBF] flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <h2 className="text-base font-bold text-[#0B1C30]">QR Code Architecture</h2>
                  </div>
                </div>

                {/* QR Style Selector (Section 6) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#414754] flex items-center justify-between">
                    <span>QR Style Preset</span>
                    <span className="text-[10px] font-normal text-emerald-600">Standard Google review look</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Style 1: Standard QR (Default) */}
                    <button
                      type="button"
                      onClick={() => {
                        setQrStyle('standard');
                        setGeometry('classic');
                        setCenterEmblem('none');
                      }}
                      className={`p-3 rounded-xl text-center flex flex-col items-center gap-1.5 border transition-all ${
                        qrStyle === 'standard' && centerEmblem === 'none' && geometry === 'classic'
                          ? 'bg-[#EFF4FF] border-[#005BBF] shadow-sm text-[#001A41]'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-[#0B1C30]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] text-[#005BBF]">qr_code_2</span>
                      <span className="text-xs font-bold leading-tight">Standard QR</span>
                      <span className="text-[10px] text-[#565E74] leading-tight">Default · No Logo</span>
                    </button>

                    {/* Style 2: Google Branded QR */}
                    <button
                      type="button"
                      onClick={() => {
                        setQrStyle('google-branded');
                        setGeometry('classic');
                        setCenterEmblem('google-g');
                      }}
                      className={`p-3 rounded-xl text-center flex flex-col items-center gap-1.5 border transition-all ${
                        (qrStyle === 'google-branded' || centerEmblem === 'google-g') && geometry === 'classic'
                          ? 'bg-[#EFF4FF] border-[#005BBF] shadow-sm text-[#001A41]'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-[#0B1C30]'
                      }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <span className="text-xs font-bold leading-tight">Google Branded</span>
                      <span className="text-[10px] text-[#565E74] leading-tight">Small Centered G</span>
                    </button>

                    {/* Style 3: Print-Friendly QR */}
                    <button
                      type="button"
                      onClick={() => {
                        setQrStyle('print-friendly');
                        setGeometry('classic');
                        setCenterEmblem('none');
                      }}
                      className={`p-3 rounded-xl text-center flex flex-col items-center gap-1.5 border transition-all ${
                        qrStyle === 'print-friendly'
                          ? 'bg-[#EFF4FF] border-[#005BBF] shadow-sm text-[#001A41]'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-[#0B1C30]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] text-slate-700">print</span>
                      <span className="text-xs font-bold leading-tight">Print-Friendly</span>
                      <span className="text-[10px] text-[#565E74] leading-tight">Generous Margin</span>
                    </button>
                  </div>
                </div>

                {/* Print Physical Dimensions Selector */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-semibold text-[#414754] flex items-center justify-between">
                    <span>Target Physical Print Size</span>
                    <span className="text-[11px] font-normal text-[#565E74]">
                      Rec: {qrValidation ? `${qrValidation.recommendedPrintSizeMm} mm+` : '35 mm+'}
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { size: 30, label: '30 mm', desc: 'Table Cards' },
                      { size: 40, label: '40 mm', desc: 'Acrylic Stand (Recommended)' },
                      { size: 50, label: '50 mm', desc: 'Posters / Plaques' },
                    ].map((preset) => (
                      <button
                        key={preset.size}
                        type="button"
                        onClick={() => setPrintSizeMm(preset.size)}
                        className={`p-2 rounded-xl text-center flex flex-col items-center border transition-all ${
                          printSizeMm === preset.size
                            ? 'bg-[#D8E2FF] border-[#005BBF] text-[#001A41] font-bold shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-[#0B1C30]'
                        }`}
                      >
                        <span className="text-xs">{preset.label}</span>
                        <span className="text-[10px] text-[#565E74]">{preset.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Module & Eye Geometry Grid */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-semibold text-[#414754] flex items-center justify-between">
                    <span>Module Geometry</span>
                    <span className="text-[10px] font-normal text-[#565E74]">Classic square recommended</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {/* Classic */}
                    <button
                      className={`p-2.5 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${
                        geometry === 'classic'
                          ? 'bg-[#D8E2FF] text-[#001A41] font-bold ring-2 ring-[#005BBF] shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-[#0B1C30]'
                      }`}
                      onClick={() => setGeometry('classic')}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[22px]">grid_on</span>
                      <span className="text-[11px] font-semibold">Classic</span>
                    </button>

                    {/* Rounded */}
                    <button
                      className={`p-2.5 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${
                        geometry === 'rounded'
                          ? 'bg-[#D8E2FF] text-[#001A41] font-bold ring-2 ring-[#005BBF] shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-[#0B1C30]'
                      }`}
                      onClick={() => setGeometry('rounded')}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[22px]">circle</span>
                      <span className="text-[11px] font-semibold">Rounded</span>
                    </button>

                    {/* Dots */}
                    <button
                      className={`p-2.5 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${
                        geometry === 'dots'
                          ? 'bg-[#D8E2FF] text-[#001A41] font-bold ring-2 ring-[#005BBF] shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-[#0B1C30]'
                      }`}
                      onClick={() => setGeometry('dots')}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[22px]">grain</span>
                      <span className="text-[11px] font-semibold">Dots</span>
                    </button>

                    {/* Premium Eye */}
                    <button
                      className={`p-2.5 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${
                        geometry === 'premium-eye'
                          ? 'bg-[#D8E2FF] text-[#001A41] font-bold ring-2 ring-[#005BBF] shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-[#0B1C30]'
                      }`}
                      onClick={() => setGeometry('premium-eye')}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[22px]">filter_center_focus</span>
                      <span className="text-[11px] font-semibold">Premium Eye</span>
                    </button>
                  </div>
                </div>

                {/* Center Emblem Choice */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-semibold text-[#414754] flex items-center justify-between">
                    <span>Center Emblem Overlay</span>
                    <span className="text-[10px] font-normal text-emerald-600">None provides 100% scan clarity</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Option 0: None */}
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all border ${
                        centerEmblem === 'none'
                          ? 'bg-[#EFF4FF] border-[#005BBF] shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="center_emblem"
                        checked={centerEmblem === 'none'}
                        onChange={() => setCenterEmblem('none')}
                        className="text-[#005BBF] focus:ring-0 w-3.5 h-3.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#0B1C30]">No Logo</span>
                        <span className="text-[9px] text-[#565E74]">Clean grid</span>
                      </div>
                    </label>

                    {/* Option 1: Official Google G */}
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all border ${
                        centerEmblem === 'google-g'
                          ? 'bg-[#EFF4FF] border-[#005BBF] shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="center_emblem"
                        checked={centerEmblem === 'google-g'}
                        onChange={() => setCenterEmblem('google-g')}
                        className="text-[#005BBF] focus:ring-0 w-3.5 h-3.5"
                      />
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-[#0B1C30]">Google G</span>
                      </div>
                    </label>

                    {/* Option 2: Business Logo */}
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all border ${
                        centerEmblem === 'business-logo'
                          ? 'bg-[#EFF4FF] border-[#005BBF] shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="center_emblem"
                        checked={centerEmblem === 'business-logo'}
                        onChange={() => setCenterEmblem('business-logo')}
                        className="text-[#005BBF] focus:ring-0 w-3.5 h-3.5"
                      />
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-amber-600">crown</span>
                        <span className="text-xs font-semibold text-[#0B1C30]">Logo</span>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#005BBF] hover:bg-[#1A73E8] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                  type="button"
                  onClick={() => continueFromStep('qrstyle')}
                >
                  <span>Continue to Poster Templates</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            )}

            {/* TAB 3: Display Poster Presets (Image 2) */}
            {activeTab === 'templates' && (
              <div className="p-6 rounded-xl bg-white shadow-sm flex flex-col gap-4 border border-slate-100 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#D8E2FF] text-[#005BBF] flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <h2 className="text-base font-bold text-[#0B1C30]">Display Poster Preset</h2>
                  </div>
                </div>

                {/* Poster preset grid */}
                <div className="grid grid-cols-3 gap-3">
                  {presets.slice(0, visiblePresetCount).map((preset) => {
                    const isSelected = selectedPreset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        className={`p-2.5 rounded-xl cursor-pointer transition-all flex flex-col gap-1.5 items-center border ${
                          isSelected
                            ? 'bg-[#EFF4FF] text-[#005BBF] ring-2 ring-[#005BBF] border-transparent shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-[#0B1C30] border-transparent'
                        }`}
                        onClick={() => {
                          setSelectedPreset(preset.id);
                          setAccentColor(preset.defaultAccent);
                          setCustomColors({});
                          showToast(`Switched to preset: ${preset.name}`);
                        }}
                      >
                        <div
                          className={`w-full h-16 rounded-lg ${preset.cardBg} shadow-inner flex flex-col items-center justify-center relative overflow-hidden border border-slate-200/50`}
                        >
                          {preset.topStrip && (
                            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 via-red-500 to-amber-500"></div>
                          )}
                          <div
                            className={`w-6 h-6 rounded ${preset.centerBg} flex items-center justify-center text-white text-[10px] mb-1 font-bold shadow-2xs`}
                          >
                            {preset.centerText || ''}
                          </div>
                          <div className={`w-10 h-1 ${preset.barBg} rounded`}></div>
                        </div>
                        <span className={`text-[11px] text-center ${isSelected ? 'font-bold' : 'font-medium'}`}>
                          {preset.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {presets.length > 9 && (
                  <button
                    type="button"
                    onClick={() => setVisiblePresetCount((count) => (count >= presets.length ? 9 : Math.min(count + 9, presets.length)))}
                    className="self-center px-4 py-2 rounded-full border border-blue-200 bg-white text-xs font-semibold text-[#005BBF] hover:bg-blue-50 transition-colors"
                  >
                    {visiblePresetCount >= presets.length ? 'Show less' : `Show more (${presets.length - visiblePresetCount} remaining)`}
                  </button>
                )}

                {/* Adjust Preset Colors Section (Accordion) */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#1A73E8] text-base">palette</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#0B1C30]">Adjust Preset Colors</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-semibold">
                          {currentPresetData.name}
                        </span>
                        {Object.keys(customColors).length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-[#005BBF] font-bold">
                            {Object.keys(customColors).length} custom
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const anyOpen = Object.values(expandedColorKeys).some(Boolean);
                          setAllColorKeys(!anyOpen);
                        }}
                        className="text-[11px] text-[#005BBF] hover:underline font-semibold"
                      >
                        {Object.values(expandedColorKeys).some(Boolean) ? 'Collapse All' : 'Expand All'}
                      </button>
                      {Object.keys(customColors).length > 0 && (
                        <button
                          type="button"
                          onClick={handleResetColors}
                          className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors shadow-2xs flex items-center gap-0.5"
                          title="Reset all colors to preset defaults"
                        >
                          <span className="material-symbols-outlined text-[12px]">restart_alt</span>
                          <span>Reset Colors</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#565E74] leading-relaxed">
                    Independently customize individual template elements. Selecting a new preset will restore its default colors.
                  </p>

                  {/* 7 Independent Collapsible Color Items */}
                  <div className="flex flex-col gap-2">
                    {colorControls.map((ctrl) => {
                      const activeColor = customColors[ctrl.key] || ctrl.defaultHex;
                      const isCustomized = Boolean(customColors[ctrl.key]);
                      const isOpen = Boolean(expandedColorKeys[ctrl.key]);

                      return (
                        <div
                          key={ctrl.key}
                          className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs"
                        >
                          {/* Accordion Row Header */}
                          <div
                            className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                            onClick={() => toggleColorKey(ctrl.key)}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className="w-5 h-5 rounded-full border border-black/15 shadow-2xs shrink-0"
                                style={{ backgroundColor: activeColor }}
                              />
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-[#0B1C30] truncate">
                                    {ctrl.label}
                                  </span>
                                  {isCustomized && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold shrink-0">
                                      Custom
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {activeColor.toUpperCase()}
                                  {!isCustomized && ' (Default)'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isCustomized && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    resetSingleColor(ctrl.key);
                                    showToast(`Reset ${ctrl.label} to default`);
                                  }}
                                  className="text-[10px] text-slate-500 hover:text-slate-800 underline px-1 py-0.5 rounded hover:bg-slate-100"
                                  title="Reset to default"
                                >
                                  Reset
                                </button>
                              )}
                              <span
                                className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              >
                                expand_more
                              </span>
                            </div>
                          </div>

                          {/* Accordion Collapsible Panel */}
                          {isOpen && (
                            <div className="p-3 pt-1 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2.5">
                              <p className="text-[11px] text-[#565E74]">
                                {ctrl.description}
                              </p>

                              {/* Low Contrast Warning for QR */}
                              {ctrl.key === 'qrColor' && isQrContrastLow && (
                                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-1.5 text-xs">
                                  <span className="material-symbols-outlined text-amber-600 text-[16px] shrink-0 mt-0.5">
                                    warning
                                  </span>
                                  <div>
                                    <span className="font-bold">Contrast notice: </span>
                                    Light QR colors on a white card may be harder for older phone cameras to scan. Test before printing.
                                  </div>
                                </div>
                              )}

                              {/* Color Picker + Hex Input */}
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={activeColor.startsWith('#') && activeColor.length === 7 ? activeColor : ctrl.defaultHex}
                                  onChange={(e) => updateCustomColor(ctrl.key, e.target.value)}
                                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white shadow-2xs shrink-0"
                                  title={`Pick ${ctrl.label} color`}
                                />
                                <div className="relative flex-1">
                                  <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-mono">#</span>
                                  <input
                                    type="text"
                                    maxLength={7}
                                    value={activeColor.replace('#', '')}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/[^0-9a-fA-F]/g, '');
                                      if (val.length <= 6) {
                                        updateCustomColor(ctrl.key, `#${val}`);
                                      }
                                    }}
                                    placeholder={ctrl.defaultHex.replace('#', '')}
                                    className="w-full h-9 pl-6 pr-2 rounded-lg bg-white border border-slate-200 text-xs font-mono font-semibold text-[#0B1C30] uppercase focus:outline-none focus:border-[#1A73E8]"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    resetSingleColor(ctrl.key);
                                    showToast(`Reset ${ctrl.label} to default`);
                                  }}
                                  disabled={!isCustomized}
                                  className={`h-9 px-2.5 rounded-lg border text-[10px] font-semibold transition-colors shrink-0 ${
                                    isCustomized
                                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer'
                                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                  }`}
                                  title="Reset to preset default"
                                >
                                  Default
                                </button>
                              </div>

                              {/* Quick Swatches */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-semibold text-[#565E74]">Suggested Swatches</span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {ctrl.popularSwatches.map((swatchHex, sIdx) => {
                                    const isMatch = activeColor.toLowerCase() === swatchHex.toLowerCase();
                                    return (
                                      <button
                                        key={`${swatchHex}-${sIdx}`}
                                        type="button"
                                        onClick={() => updateCustomColor(ctrl.key, swatchHex)}
                                        title={swatchHex}
                                        className={`w-5 h-5 rounded-full border border-black/10 transition-transform flex items-center justify-center ${
                                          isMatch ? 'ring-2 ring-offset-1 ring-[#005BBF] scale-110' : 'hover:scale-105'
                                        }`}
                                        style={{ backgroundColor: swatchHex }}
                                      >
                                        {isMatch && (
                                          <span
                                            className="material-symbols-outlined text-[10px]"
                                            style={{
                                              color: ['#ffffff', '#fffdf5', '#f0fdf4', '#eff4ff'].includes(swatchHex.toLowerCase())
                                                ? '#000000'
                                                : '#ffffff',
                                            }}
                                          >
                                            check
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#005BBF] hover:bg-[#1A73E8] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                  type="button"
                  onClick={() => continueFromStep('templates')}
                >
                  <span>Continue to Preview / Download</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            )}

            {/* TAB 4: Preview & Download */}
            {activeTab === 'copy' && (
              <div className="p-6 rounded-xl bg-white shadow-sm flex flex-col gap-4 border border-slate-100 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#D8E2FF] text-[#005BBF] flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <h2 className="text-base font-bold text-[#0B1C30]">Preview &amp; Download</h2>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#414754]">Primary Poster Headline</label>
                  <input
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 text-xs text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:bg-white border border-slate-200 transition-all font-semibold"
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#414754]">Call-to-Action Footer Text</label>
                  <input
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 text-xs text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:bg-white border border-slate-200 transition-all font-semibold"
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                <label className="text-xs font-semibold text-[#414754]">Supporting text (Optional)</label>
                <input
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 text-xs text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:bg-white border border-slate-200 transition-all"
                  type="text"
                  value={supportingText}
                  onChange={(e) => setSupportingText(e.target.value)}
                  placeholder="Add neutral context for customers"
                />
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <div className="text-xs font-bold text-[#0B1C30] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#005BBF] text-[18px]">verified</span>
                    <span>Artwork Ready — Export or Print</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      className="py-3 px-4 rounded-xl bg-[#005BBF] hover:bg-[#1A73E8] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                      type="button"
                      onClick={handleDownloadPNG}
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      <span>Download PNG</span>
                    </button>
                    <button
                      className="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-[#0B1C30] text-xs font-bold shadow-sm border border-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                      type="button"
                      onClick={handleExportPDF}
                    >
                      <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                      <span>Print / PDF</span>
                    </button>
                  </div>
                  {isSupabaseConfigured && (
                    <button
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 mt-1"
                      type="button"
                      onClick={handleSaveConfiguration}
                      disabled={isSavingQr}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isSavingQr ? 'progress_activity' : 'cloud_upload'}
                      </span>
                      <span>{isSavingQr ? 'Saving to Cloud…' : 'Save Design to Cloud (Optional)'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Live Stand Preview (7 cols) (Image 1) */}
          <div className="lg:col-span-7 flex flex-col gap-4 sticky top-20">
            {/* Canvas Control Toolbar */}
            <div className="p-2 px-4 rounded-xl bg-white shadow-sm flex items-center justify-between gap-3 border border-slate-100">
              <div className="flex items-center gap-1.5">
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                    viewMode === 'front'
                      ? 'bg-slate-100 text-[#005BBF] font-bold'
                      : 'hover:bg-slate-50 text-[#414754]'
                  }`}
                  onClick={() => setViewMode('front')}
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Front View</span>
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                    viewMode === 'mockup'
                      ? 'bg-slate-100 text-[#005BBF] font-bold'
                      : 'hover:bg-slate-50 text-[#414754]'
                  }`}
                  onClick={() => setViewMode('mockup')}
                >
                  <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
                  <span>Stand Mockup</span>
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                    viewMode === 'mobile'
                      ? 'bg-slate-100 text-[#005BBF] font-bold'
                      : 'hover:bg-slate-50 text-[#414754]'
                  }`}
                  onClick={() => setViewMode('mobile')}
                >
                  <span className="material-symbols-outlined text-[16px]">smartphone</span>
                  <span>Mobile View</span>
                </button>
                <div className="h-4 w-px bg-slate-200 mx-1"></div>
                <div className="flex items-center gap-1 text-[#414754] text-xs font-semibold">
                  <button
                    className="p-1 hover:bg-slate-100 rounded"
                    onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span>{zoomLevel}%</span>
                  <button
                    className="p-1 hover:bg-slate-100 rounded"
                    onClick={() => setZoomLevel((z) => Math.min(125, z + 10))}
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {qrMode === 'direct' ? 'Direct review URL QR' : 'Guided Review Assistant QR'}
                </span>
                <button
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-[#414754]"
                  title="Reset Zoom"
                  onClick={() => setZoomLevel(100)}
                >
                  <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                </button>
              </div>
            </div>

            {/* Real Poster Canvas Workspace (Image 1) */}
            <div
              className="relative w-full rounded-2xl bg-[#EFF4FF] p-8 flex flex-col items-center justify-center overflow-hidden shadow-inner min-h-[640px] border border-slate-200"
              style={{ perspective: viewMode === 'mockup' ? '1200px' : undefined }}
            >
              {/* Studio Ambient Glows */}
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#1A73E8]/5 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none"></div>

              {/* Header Badge (Image 1) */}
              <div className="w-full flex items-center justify-between pb-4 max-w-[380px]">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#006D2C] tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#006D2C] animate-pulse"></span>
                  {viewMode === 'mobile' ? 'CUSTOMER MOBILE VIEW' : 'LIVE STAND PREVIEW'}
                </span>
                <span className="text-[11px] text-[#565E74] uppercase font-semibold">
                  {viewMode === 'mobile' ? 'Live review assistant flow' : 'Browser preview; print resolution is not certified'}
                </span>
              </div>

              {/* View Mode Switching: Mobile View vs Table Tent Stand */}
              {viewMode === 'mobile' ? (
                <div
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                  className="w-full max-w-[340px] rounded-[36px] bg-[#F8F9FF] shadow-[0_25px_50px_-12px_rgba(15,23,42,0.25)] border-[6px] border-slate-900 overflow-hidden flex flex-col transition-all duration-300 animate-fadeIn"
                >
                  {/* Phone Speaker & Dynamic Island */}
                  <div className="h-6 bg-slate-900 w-full flex items-center justify-center">
                    <div className="w-20 h-3 bg-black rounded-full"></div>
                  </div>

                  {/* Header bar */}
                  <div className="px-4 py-2 bg-white flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-[#005BBF] tracking-wide">VERIFIED.REVIEWQR.APP</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">&lt; 30s Review</span>
                  </div>

                  {/* 16:9 Cover Photo Banner */}
                  <div
                    className="h-32 w-full bg-cover bg-center relative bg-gradient-to-br from-slate-800 to-slate-900"
                    style={{
                      backgroundImage: (localThumbDataUrl || thumbnailUrl)
                        ? `url("${localThumbDataUrl || thumbnailUrl}")`
                        : 'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80")',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
                  </div>

                  {/* Identity Card overlapping banner */}
                  <div className="relative px-4 pb-4 -mt-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white p-1 shadow-md flex items-center justify-center mb-1.5 overflow-hidden border-2 border-white">
                      {(localLogoDataUrl || logoUrl) ? (
                        <img
                          src={localLogoDataUrl || logoUrl}
                          alt="Logo"
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            if (localLogoDataUrl && e.currentTarget.src !== localLogoDataUrl) {
                              e.currentTarget.src = localLogoDataUrl;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#1A73E8] text-white flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">verified</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <h2 className="font-extrabold text-sm text-[#0B1C30] tracking-tight">{businessName || 'YOUR BUSINESS NAME'}</h2>
                      <span className="material-symbols-outlined text-[#1A73E8] text-[16px]">verified</span>
                    </div>
                    <p className="text-[10px] text-[#565E74] mt-0.5">{businessDetails}</p>

                    {/* Star Rating Bar */}
                    <div className="mt-3 w-full bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex flex-col items-center">
                      <span className="text-[11px] font-bold text-[#0B1C30]">How was your experience?</span>
                      <div className="flex items-center gap-1 my-1.5 text-amber-400">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                        ))}
                      </div>
                      <span className="text-[9px] text-[#005BBF] font-semibold">Tap any star for instant review suggestions</span>
                    </div>

                    {/* Instant Phrasing Preview Box */}
                    <div className="mt-2.5 w-full bg-white rounded-xl p-3 shadow-sm border border-slate-100 text-left">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="material-symbols-outlined text-[#005BBF] text-sm">auto_awesome</span>
                        <span className="text-[10px] font-bold text-[#0B1C30]">Instant Review Phrasing</span>
                      </div>
                      <p className="text-[10px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        &quot;Outstanding service and warm hospitality at {businessName || 'this business'}. Highly recommended!&quot;
                      </p>
                      <div className="mt-2 w-full py-2 rounded-lg bg-[#005BBF] text-white text-[10px] font-bold text-center">
                        Copy &amp; Open Google Maps
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Physical Table Tent Stand Mockup (Image 1) */
                <div
                  ref={posterRef}
                  style={{
                    transform: `scale(${zoomLevel / 100})${viewMode === 'mockup' ? ' rotateY(-12deg) rotateX(5deg)' : ''}`,
                    transformStyle: 'preserve-3d',
                    backgroundColor: customColors.posterBg || currentPresetData.bgHex,
                  }}
                  className={`relative w-full max-w-[380px] rounded-3xl shadow-[0_25px_50px_-12px_rgba(15,23,42,0.18)] overflow-hidden flex flex-col items-center transition-all duration-300 border border-black/5 ${
                    currentPresetData.previewBg
                  } qr-poster-print-art motion-reduce:transition-none`}
                >
                  {/* Top Google Strip if google-classic */}
                  {selectedPreset === 'google-classic' && (
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]"></div>
                  )}

                  {/* Venue Cover Photo Banner on Stand (if uploaded) */}
                  {(localThumbDataUrl || thumbnailUrl) && (
                    <div className="w-full h-24 relative overflow-hidden shrink-0 border-b border-black/5">
                      <img
                        src={localThumbDataUrl || thumbnailUrl}
                        alt="Venue Cover"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (localThumbDataUrl && e.currentTarget.src !== localThumbDataUrl) {
                            e.currentTarget.src = localThumbDataUrl;
                          } else {
                            e.currentTarget.style.display = 'none';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    </div>
                  )}

                {/* Top Header Section */}
                <div className="w-full pt-8 pb-4 px-6 flex flex-col items-center text-center relative">
                  {/* Top Pill Accent (Image 1) */}
                  <div className="px-4 py-1.5 rounded-full bg-[#0F172A] text-white text-[11px] font-bold tracking-widest uppercase mb-3 shadow-xs">
                    SHARE YOUR EXPERIENCE
                  </div>

                  {/* Brand Crest / Icon Badge */}
                  <div className="w-12 h-12 rounded-full bg-slate-100 shadow-md flex items-center justify-center p-1.5 mb-2 border border-black/5 overflow-hidden">
                    {(localLogoDataUrl || logoUrl) ? (
                      <img
                        src={localLogoDataUrl || logoUrl}
                        alt="Logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (localLogoDataUrl && e.currentTarget.src !== localLogoDataUrl) {
                            e.currentTarget.src = localLogoDataUrl;
                          } else {
                            e.currentTarget.style.display = 'none';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#0F172A] text-white rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">hotel</span>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Business Title */}
                  <h1
                    className={`text-lg font-extrabold tracking-wider uppercase leading-tight ${currentPresetData.textColor}`}
                    style={{ color: customColors.businessNameColor || currentPresetData.textHex }}
                  >
                    {businessName || 'YOUR BUSINESS NAME'}
                  </h1>
                  <p
                    className={`text-[10px] font-bold tracking-widest uppercase mt-1 ${currentPresetData.subtitleColor}`}
                    style={{
                      color: customColors.businessNameColor
                        ? customColors.businessNameColor
                        : (currentPresetData.subtitleHex || currentPresetData.textHex),
                    }}
                  >
                    {businessDetails}
                  </p>
                </div>

                {/* Central Scannable QR Component */}
                <div className="p-4 flex flex-col items-center w-full px-8">
                  <div className="relative p-4 rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex items-center justify-center border border-slate-100">
                    {realQrDataUrl ? (
                      <img
                        src={realQrDataUrl}
                        alt="Scannable QR Code"
                        className="w-52 h-52 object-contain"
                      />
                    ) : (
                      <div className="w-52 h-52 bg-slate-50 flex items-center justify-center p-4 text-center text-xs text-[#565E74]">
                        {qrGenerationMessage || 'Enter a review destination link to preview your scannable QR code.'}
                      </div>
                    )}

                    {/* Centered Floating Emblem: Only render if centerEmblem !== 'none' */}
                    {centerEmblem !== 'none' && (
                      <div className="absolute w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center p-1 border border-slate-100 overflow-hidden pointer-events-none">
                        {centerEmblem === 'business-logo' && (localLogoDataUrl || logoUrl) ? (
                          <img src={localLogoDataUrl || logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : centerEmblem === 'business-logo' ? (
                          <span className="material-symbols-outlined text-[20px] text-amber-600">crown</span>
                        ) : (
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
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Poster Callout */}
                <div className="w-full flex flex-col items-center px-6 pb-6 pt-1 text-center">
                  <div className="flex items-center gap-1.5 my-1">
                    <span
                      className={`text-base font-bold ${currentPresetData.textColor}`}
                      style={{ color: customColors.headlineColor || currentPresetData.textHex }}
                    >
                      {headline}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-0.5" aria-label="Five yellow stars">
                    {Array.from({ length: 5 }, (_, index) => (
                      <span
                        key={index}
                        className="material-symbols-outlined text-2xl leading-6 sm:text-3xl"
                        style={{ color: customColors.starsColor || '#FBBC04', fontVariationSettings: "'FILL' 1" }}
                        aria-hidden="true"
                      >
                        star
                      </span>
                    ))}
                  </div>

                  {supportingText.trim() && (
                    <p className="text-xs text-[#565E74] my-1">{supportingText}</p>
                  )}

                  {/* Scan CTA Button (Image 1) */}
                  <div
                    className="w-full mt-3 py-2.5 px-4 rounded-xl font-semibold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-opacity"
                    style={{
                      backgroundColor: customColors.ctaBgColor || accentColor || currentPresetData.defaultAccent,
                      color: customColors.ctaTextColor || '#FFFFFF',
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ color: customColors.ctaTextColor || '#FFFFFF' }}
                    >
                      photo_camera
                    </span>
                    <span style={{ color: customColors.ctaTextColor || '#FFFFFF' }}>{ctaText}</span>
                  </div>
                </div>
              </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
