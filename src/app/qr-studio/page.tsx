'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getStoredOrg, getStoredQRCodes, saveQRCode, setStoredOrg } from '@/lib/data-store';
import { Organization, QRCode } from '@/lib/types';
import { generateQrSvg } from '@/lib/qr-geometry';

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
}

export default function QRDesignStudioPage() {
  const [activeTab, setActiveTab] = useState<'branding' | 'qrstyle' | 'templates' | 'copy'>('branding');
  const [org, setOrg] = useState<Organization | null>(null);
  const [qrList, setQrList] = useState<QRCode[]>([]);
  const [selectedTouchpoint, setSelectedTouchpoint] = useState('Table Tent — Main Dining Hall (T1-12)');

  // Touchpoint & Destination State (merged from Create QR)
  const [placementTag, setPlacementTag] = useState('Table Tent — Main Dining Hall (T1-12)');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('https://g.page/r/Cbll2345abc992eEBM/review');
  const [verificationState, setVerificationState] = useState<'format-valid' | 'unverified' | 'invalid'>('unverified');

  // Business Branding State
  const [businessName, setBusinessName] = useState('Royal Palace Hotel');
  const [category, setCategory] = useState('Restaurant & Lounge');
  const [location, setLocation] = useState('Bettiah, Bihar');
  const [accentColor, setAccentColor] = useState('#1A73E8');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoName, setLogoName] = useState('royal_crest.svg');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // QR Code Architecture State (Image 3)
  const [geometry, setGeometry] = useState<'classic' | 'rounded' | 'dots' | 'premium-eye'>('rounded');
  const [centerEmblem, setCenterEmblem] = useState<'google-g' | 'business-logo'>('google-g');

  // Display Poster Preset (Image 2)
  const [selectedPreset, setSelectedPreset] = useState('google-classic');

  // Copywriting & Content
  const [headline, setHeadline] = useState('Review us on Google');
  const [ctaText, setCtaText] = useState('Scan to share your experience');
  const [showStarBar, setShowStarBar] = useState(true);
  const [perksNote, setPerksNote] = useState('Your honest feedback helps our culinary staff serve you better ❤️');

  // View mode & Canvas state
  const [viewMode, setViewMode] = useState<'front' | 'mockup'>('front');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [realQrDataUrl, setRealQrDataUrl] = useState<string>('');

  const posterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    },
  ];

  const currentPresetData = presets.find((p) => p.id === selectedPreset) || presets[1];

  const accentPalette = [
    { name: 'Google Blue', hex: '#1A73E8' },
    { name: 'Warm Amber', hex: '#FBBC04' },
    { name: 'Google Red', hex: '#EA4335' },
    { name: 'Bistro Green', hex: '#34A853' },
    { name: 'Obsidian Slate', hex: '#0F172A' },
  ];

  // Load Initial Org and QRs
  useEffect(() => {
    const loadedOrg = getStoredOrg();
    setOrg(loadedOrg);
    if (loadedOrg.name) setBusinessName(loadedOrg.name);
    if (loadedOrg.category) setCategory(loadedOrg.category);
    if (loadedOrg.city) setLocation(loadedOrg.city);
    if (loadedOrg.accentColor) setAccentColor(loadedOrg.accentColor);
    if (loadedOrg.googleReviewUrl) setGoogleReviewUrl(loadedOrg.googleReviewUrl);
    if (loadedOrg.logoUrl) setLogoUrl(loadedOrg.logoUrl);

    const loadedQRs = getStoredQRCodes();
    setQrList(loadedQRs);
    if (loadedQRs.length > 0) {
      const first = loadedQRs[0];
      setSelectedTouchpoint(first.placementName || first.placementType || 'Table Tent — Main Dining Hall (T1-12)');
      setPlacementTag(first.placementName || first.placementType || 'Table Tent — Main Dining Hall (T1-12)');
      if (first.headline) setHeadline(first.headline);
      if (first.tagline) setCtaText(first.tagline);
      if (first.accentColor) setAccentColor(first.accentColor);
      if (first.preset) setSelectedPreset(first.preset);
      if (first.geometry) setGeometry(first.geometry);
      if (first.centerEmblem) setCenterEmblem(first.centerEmblem);
      if (first.destinationUrl) setGoogleReviewUrl(first.destinationUrl);
    }
  }, []);

  // Generate the QR preview with the selected module and eye geometry.
  useEffect(() => {
    try {
      setRealQrDataUrl(
        generateQrSvg(
          googleReviewUrl || 'https://reviewqr.app',
          geometry,
          currentPresetData.finderColor
        )
      );
    } catch (err) {
      console.error('Failed to generate preview QR:', err);
    }
  }, [googleReviewUrl, currentPresetData.finderColor, geometry]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTouchpointChange = (touchpointName: string) => {
    setSelectedTouchpoint(touchpointName);
    setPlacementTag(touchpointName);

    const found = qrList.find(
      (q) => q.placementName === touchpointName || q.placementType === touchpointName
    );
    if (found) {
      if (found.headline) setHeadline(found.headline);
      if (found.tagline) setCtaText(found.tagline);
      if (found.accentColor) setAccentColor(found.accentColor);
      if (found.destinationUrl) setGoogleReviewUrl(found.destinationUrl);
      if (found.preset) setSelectedPreset(found.preset);
      if (found.geometry) setGeometry(found.geometry);
      if (found.centerEmblem) setCenterEmblem(found.centerEmblem);
      showToast(`Loaded settings for: ${touchpointName}`);
    }
  };

  const handleVerifyLink = () => {
    let url: URL;
    try {
      url = new URL(googleReviewUrl);
    } catch {
      setVerificationState('invalid');
      showToast('Enter a valid HTTPS Google review URL.');
      return;
    }

    const hostname = url.hostname.toLowerCase();
    const isGoogleHost = ['google.com', 'g.page', 'maps.app.goo.gl'].some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
    if (url.protocol !== 'https:' || !isGoogleHost) {
      setVerificationState('invalid');
      showToast('Enter an HTTPS URL hosted by Google.');
      return;
    }

    setVerificationState('format-valid');
    showToast('Google URL format looks valid; destination ownership was not verified.');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5 MB limit.');
      return;
    }

    setIsUploadingLogo(true);
    setLogoName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');
      formData.append('orgId', org?.id || 'org_royal_palace');

      const res = await fetch('/api/business/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setLogoUrl(data.url);
        setStoredOrg({ logoUrl: data.url, logoPath: data.path });
        showToast('Logo uploaded and applied to all stand artwork!');
      } else {
        // Fallback to FileReader
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setLogoUrl(result);
          setStoredOrg({ logoUrl: result });
          showToast('Logo applied locally.');
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Local fallback
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setLogoUrl(result);
        setStoredOrg({ logoUrl: result });
        showToast('Logo applied locally.');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSaveConfiguration = () => {
    const slug = placementTag.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const saved = saveQRCode({
      orgId: org?.id || 'org_royal_palace',
      slug,
      businessName,
      destinationUrl: googleReviewUrl,
      placementName: placementTag,
      placementType: placementTag,
      headline,
      tagline: ctaText,
      accentColor,
      currentTemplate: selectedPreset,
      preset: selectedPreset,
      geometry,
      centerEmblem,
      logoUrl,
      showStarBar,
      status: 'active',
    });

    // Also persist business details to organization
    setStoredOrg({
      name: businessName,
      category,
      city: location,
      accentColor,
      googleReviewUrl,
      logoUrl,
    });

    // Refresh list
    setQrList(getStoredQRCodes());
    showToast('Studio configuration saved! All previews synchronized.');
  };

  const handleDownloadPNG = () => {
    showToast('Exporting high-resolution 300 DPI Standee PNG...');
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `${businessName.toLowerCase().replace(/\s+/g, '_')}_${selectedPreset}_standee.png`;
      link.href =
        'data:image/svg+xml;charset=utf-8,' +
        encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
          <rect width="600" height="850" rx="24" fill="${
            selectedPreset === 'modern-navy'
              ? '#0f172a'
              : selectedPreset === 'dark-luxury'
              ? '#18181b'
              : selectedPreset === 'royal-gold'
              ? '#fffdf5'
              : selectedPreset === 'bistro-green'
              ? '#f0fdf4'
              : '#ffffff'
          }"/>
          ${
            selectedPreset === 'google-classic'
              ? '<rect width="600" height="8" fill="url(#googleGrad)"/>'
              : ''
          }
          <text x="300" y="80" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="28" fill="${
            selectedPreset === 'modern-navy' || selectedPreset === 'dark-luxury' ? '#ffffff' : '#0b1c30'
          }">${businessName.toUpperCase()}</text>
          <text x="300" y="115" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="14" fill="${
            selectedPreset === 'modern-navy' || selectedPreset === 'dark-luxury' ? '#94a3b8' : '#565e74'
          }">${category.toUpperCase()} • ${location.toUpperCase()}</text>
          <rect x="150" y="160" width="300" height="300" rx="16" fill="#ffffff" stroke="#e5eeff" stroke-width="2"/>
          <text x="300" y="520" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="24" fill="${
            selectedPreset === 'modern-navy' || selectedPreset === 'dark-luxury' ? '#ffffff' : '#0b1c30'
          }">${headline}</text>
          ${showStarBar ? '<text x="300" y="555" text-anchor="middle" font-size="24" fill="#FBBC04">★★★★★</text>' : ''}
          <rect x="100" y="590" width="400" height="50" rx="12" fill="${accentColor}"/>
          <text x="300" y="622" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="16" fill="#ffffff">${ctaText}</text>
        </svg>
      `);
      link.click();
      showToast('PNG artwork downloaded successfully!');
    }, 400);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <DashboardShell>
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
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleLogoUpload}
      />

      <div className="flex flex-col w-full min-h-screen">
        {/* Top Studio Context Header / Flow Bar (Image 1) */}
        <div className="px-6 py-4 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D8E2FF] flex items-center justify-center text-[#005BBF]">
              <span className="material-symbols-outlined text-[24px]">palette</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-[#0B1C30] tracking-tight">QR Design Studio</span>
                <span className="px-2 py-0.5 rounded-full bg-[#89FA9B]/30 text-[#002108] text-[10px] uppercase font-bold tracking-wider">
                  Step 2 of 3
                </span>
              </div>
              <p className="text-xs text-[#565E74]">
                Live visual customizer for counter displays, table tents, and print standees
              </p>
            </div>
          </div>

          {/* Right Action Suite (Image 1) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Touchpoint Placement Selector */}
            <select
              className="h-10 px-3 pr-8 rounded-xl bg-slate-50 text-xs text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 border border-slate-200 cursor-pointer font-medium"
              value={selectedTouchpoint}
              onChange={(e) => handleTouchpointChange(e.target.value)}
            >
              {qrList.length > 0 ? (
                qrList.map((qr) => (
                  <option key={qr.id} value={qr.placementName || qr.placementType}>
                    {qr.placementName || qr.placementType}
                  </option>
                ))
              ) : (
                <>
                  <option>Table Tent — Main Dining Hall (T1-12)</option>
                  <option>Front Reception &amp; Counter</option>
                  <option>Rooftop Sky Lounge Bar</option>
                </>
              )}
            </select>

            <button
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#0B1C30] transition-colors flex items-center gap-1.5 shadow-xs active:scale-95"
              onClick={handleExportPDF}
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span>Export PDF</span>
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-[#005BBF] text-white hover:bg-[#1A73E8] text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              onClick={handleDownloadPNG}
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Download PNG</span>
            </button>
          </div>
        </div>

        {/* Workspace Grid: 2 Columns (Image 1) */}
        <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto w-full">
          {/* LEFT COLUMN: Customization Controls (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Studio Navigation Sub-tabs (Image 1) */}
            <div className="flex p-1 rounded-xl bg-slate-100 shadow-xs overflow-x-auto text-nowrap">
              <button
                className={`flex-1 px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'branding'
                    ? 'bg-white text-[#005BBF] shadow-sm font-bold'
                    : 'text-[#414754] hover:text-[#0B1C30]'
                }`}
                onClick={() => setActiveTab('branding')}
              >
                <span className="material-symbols-outlined text-[18px]">badge</span>
                <span>Branding</span>
              </button>
              <button
                className={`flex-1 px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'qrstyle'
                    ? 'bg-white text-[#005BBF] shadow-sm font-bold'
                    : 'text-[#414754] hover:text-[#0B1C30]'
                }`}
                onClick={() => setActiveTab('qrstyle')}
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                <span>QR Code</span>
              </button>
              <button
                className={`flex-1 px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'templates'
                    ? 'bg-white text-[#005BBF] shadow-sm font-bold'
                    : 'text-[#414754] hover:text-[#0B1C30]'
                }`}
                onClick={() => setActiveTab('templates')}
              >
                <span className="material-symbols-outlined text-[18px]">style</span>
                <span>Templates</span>
              </button>
              <button
                className={`flex-1 px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'copy'
                    ? 'bg-white text-[#005BBF] shadow-sm font-bold'
                    : 'text-[#414754] hover:text-[#0B1C30]'
                }`}
                onClick={() => setActiveTab('copy')}
              >
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                <span>Copy</span>
              </button>
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
                    Place not verified
                  </span>
                </div>

                {/* Touchpoint Placement / Location Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#414754]">Placement / Campaign Tag</label>
                  <input
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 text-xs text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:bg-white border border-slate-200 transition-all"
                    type="text"
                    value={placementTag}
                    onChange={(e) => setPlacementTag(e.target.value)}
                    placeholder="e.g. Table Tent — Main Dining Hall (T1-12)"
                  />
                </div>

                {/* Destination Google Review URL with Validation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#414754]">Google Place Review URL</label>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        verificationState === 'format-valid'
                          ? 'bg-green-100 text-green-800'
                          : verificationState === 'invalid'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {verificationState === 'format-valid'
                        ? 'Format valid'
                        : verificationState === 'invalid'
                        ? 'Invalid format'
                        : 'Unchecked'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 h-11 px-3.5 rounded-xl bg-slate-50 text-xs font-mono text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:bg-white border border-slate-200 transition-all truncate"
                      type="url"
                      value={googleReviewUrl}
                      onChange={(e) => {
                        setGoogleReviewUrl(e.target.value);
                        setVerificationState('unverified');
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyLink}
                      className="px-3 h-11 rounded-xl bg-[#EFF4FF] hover:bg-[#DCE9FF] text-[#005BBF] text-xs font-bold transition-colors"
                    >
                      Verify
                    </button>
                  </div>
                </div>

                {/* Business Display Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#414754]">Business Display Name</label>
                  <div className="relative">
                    <input
                      className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 text-xs text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:bg-white border border-slate-200 transition-all font-semibold"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#005BBF] text-[20px]">
                      verified
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#414754]">Category</label>
                    <input
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 text-xs text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:bg-white border border-slate-200 transition-all"
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#414754]">City / Branch</label>
                    <input
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 text-xs text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:bg-white border border-slate-200 transition-all"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                {/* Logo Uploader Box */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#414754]">Brand Crest / Logo Mark</label>
                  <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between gap-3 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center p-1 overflow-hidden border border-slate-100">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-[#B06000] text-2xl">hotel</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#0B1C30] truncate max-w-[140px]">
                          {logoName}
                        </span>
                        <span className="text-[11px] text-[#565E74]">PNG, SVG, JPG up to 5MB</span>
                      </div>
                    </div>
                    <button
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-semibold text-[#005BBF] border border-slate-200 shadow-2xs transition-all"
                      type="button"
                      disabled={isUploadingLogo}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploadingLogo ? 'Uploading...' : 'Change'}
                    </button>
                  </div>
                </div>

                {/* Accent Color Swatches (Image 1) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#414754]">Poster Accent Palette</label>
                    <span className="text-xs font-mono text-[#565E74]">{accentColor}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {accentPalette.map((col) => {
                      const isSelected = accentColor.toLowerCase() === col.hex.toLowerCase();
                      return (
                        <button
                          key={col.hex}
                          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm text-white transition-all ${
                            isSelected ? 'ring-4 ring-[#D8E2FF] scale-110' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                          type="button"
                          onClick={() => {
                            setAccentColor(col.hex);
                            showToast(`Accent set to ${col.name}`);
                          }}
                        >
                          {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                        </button>
                      );
                    })}
                    <div className="flex items-center h-9 px-2.5 rounded-lg bg-slate-50 text-xs font-mono text-[#565E74] ml-auto border border-slate-200">
                      {accentColor}
                    </div>
                  </div>
                </div>

                <button
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#005BBF] hover:bg-[#1A73E8] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                  type="button"
                  onClick={handleSaveConfiguration}
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Save Studio Configuration</span>
                </button>
              </div>
            )}

            {/* TAB 2: QR Code Architecture (Image 3) */}
            {activeTab === 'qrstyle' && (
              <div className="p-6 rounded-xl bg-white shadow-sm flex flex-col gap-4 border border-slate-100 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#D8E2FF] text-[#005BBF] flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <h2 className="text-base font-bold text-[#0B1C30]">QR Code Architecture</h2>
                  </div>
                  <span className="text-[10px] uppercase font-bold bg-[#EFF4FF] text-[#005BBF] px-2.5 py-0.5 rounded-full">
                    Level H (30% ECC)
                  </span>
                </div>

                {/* Module & Eye Geometry Grid (Image 3) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#414754]">Module &amp; Eye Geometry</label>
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

                {/* Center Emblem Choice (Image 3) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#414754]">Center Emblem</label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Option 1: Official Google G */}
                    <label
                      className={`flex items-center gap-2.5 p-3 rounded-xl cursor-pointer transition-all border ${
                        centerEmblem === 'google-g'
                          ? 'bg-[#EFF4FF] border-[#005BBF] shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-transparent'
                      }`}
                    >
                      <input
                        type="radio"
                        name="center_emblem"
                        checked={centerEmblem === 'google-g'}
                        onChange={() => setCenterEmblem('google-g')}
                        className="text-[#005BBF] focus:ring-0 w-4 h-4"
                      />
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-xs">
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                        <span className="text-xs font-semibold text-[#0B1C30]">Official Google G</span>
                      </div>
                    </label>

                    {/* Option 2: Business Logo */}
                    <label
                      className={`flex items-center gap-2.5 p-3 rounded-xl cursor-pointer transition-all border ${
                        centerEmblem === 'business-logo'
                          ? 'bg-[#EFF4FF] border-[#005BBF] shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-transparent'
                      }`}
                    >
                      <input
                        type="radio"
                        name="center_emblem"
                        checked={centerEmblem === 'business-logo'}
                        onChange={() => setCenterEmblem('business-logo')}
                        className="text-[#005BBF] focus:ring-0 w-4 h-4"
                      />
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-amber-600">crown</span>
                        <span className="text-xs font-semibold text-[#0B1C30]">Business Logo</span>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#005BBF] hover:bg-[#1A73E8] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                  type="button"
                  onClick={handleSaveConfiguration}
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Save QR Architecture</span>
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
                  <span className="text-xs text-[#005BBF] font-semibold cursor-pointer hover:underline">
                    Explore 24+
                  </span>
                </div>

                {/* Poster preset grid */}
                <div className="grid grid-cols-3 gap-3">
                  {presets.map((preset) => {
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

                <button
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#005BBF] hover:bg-[#1A73E8] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                  type="button"
                  onClick={handleSaveConfiguration}
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Apply Preset</span>
                </button>
              </div>
            )}

            {/* TAB 4: Copywriting & Content */}
            {activeTab === 'copy' && (
              <div className="p-6 rounded-xl bg-white shadow-sm flex flex-col gap-4 border border-slate-100 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#D8E2FF] text-[#005BBF] flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <h2 className="text-base font-bold text-[#0B1C30]">Content &amp; Microcopy</h2>
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

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-amber-500 text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="text-xs font-semibold text-[#0B1C30]">
                      Show 5-Star Recommendation Bar
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showStarBar}
                    onChange={(e) => setShowStarBar(e.target.checked)}
                    className="w-4 h-4 rounded text-[#005BBF] focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#414754]">Hospitality Perks Note (Optional)</label>
                  <input
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 text-xs text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:bg-white border border-slate-200 transition-all"
                    type="text"
                    value={perksNote}
                    onChange={(e) => setPerksNote(e.target.value)}
                  />
                </div>

                <button
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#005BBF] hover:bg-[#1A73E8] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                  type="button"
                  onClick={handleSaveConfiguration}
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Save Microcopy</span>
                </button>
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
                <Link
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#005BBF] text-xs flex items-center gap-1.5 transition-colors font-semibold"
                  href="/qr/table-tent-main-dining"
                  target="_blank"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  <span>Test Mobile Flow</span>
                </Link>
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
            <div className="relative w-full rounded-2xl bg-[#EFF4FF] p-8 flex flex-col items-center justify-center overflow-hidden shadow-inner min-h-[640px] border border-slate-200">
              {/* Studio Ambient Glows */}
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#1A73E8]/5 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none"></div>

              {/* Header Badge (Image 1) */}
              <div className="w-full flex items-center justify-between pb-4 max-w-[380px]">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#006D2C] tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#006D2C] animate-pulse"></span>
                  LIVE STAND PREVIEW
                </span>
                <span className="text-[11px] text-[#565E74] uppercase font-semibold">
                  300 DPI Export Ready
                </span>
              </div>

              {/* Physical Table Tent Stand Mockup (Image 1) */}
              <div
                ref={posterRef}
                style={{ transform: `scale(${zoomLevel / 100})` }}
                className={`relative w-full max-w-[380px] rounded-3xl shadow-[0_25px_50px_-12px_rgba(15,23,42,0.18)] overflow-hidden flex flex-col items-center transition-all duration-300 border border-black/5 ${
                  currentPresetData.previewBg
                }`}
              >
                {/* Top Google Strip if google-classic */}
                {selectedPreset === 'google-classic' && (
                  <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]"></div>
                )}

                {/* Top Header Section */}
                <div className="w-full pt-8 pb-4 px-6 flex flex-col items-center text-center relative">
                  {/* Top Pill Accent (Image 1) */}
                  <div className="px-4 py-1.5 rounded-full bg-[#0F172A] text-white text-[11px] font-bold tracking-widest uppercase mb-3 shadow-xs">
                    SHARE YOUR EXPERIENCE
                  </div>

                  {/* Brand Crest / Icon Badge */}
                  <div className="w-12 h-12 rounded-full bg-slate-100 shadow-md flex items-center justify-center p-1.5 mb-2 border border-black/5 overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#0F172A] text-white rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">hotel</span>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Business Title */}
                  <h1
                    className={`text-lg font-extrabold tracking-wider uppercase leading-tight ${currentPresetData.textColor}`}
                  >
                    {businessName || 'ROYAL PALACE HOTEL'}
                  </h1>
                  <p
                    className={`text-[10px] font-bold tracking-widest uppercase mt-1 ${currentPresetData.subtitleColor}`}
                  >
                    {category} · {location}
                  </p>
                </div>

                {/* Central Scannable QR Component */}
                <div className="p-4 flex flex-col items-center w-full px-8">
                  <div className="relative p-4 rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex items-center justify-center border border-slate-100">
                    {realQrDataUrl ? (
                      <img
                        src={realQrDataUrl}
                        alt="Scannable QR Code"
                        className={`w-52 h-52 object-contain ${
                          geometry === 'rounded'
                            ? 'rounded-xl'
                            : geometry === 'dots'
                            ? 'rounded-2xl'
                            : 'rounded-none'
                        }`}
                      />
                    ) : (
                      <div className="w-52 h-52 bg-slate-50 flex items-center justify-center text-slate-300">
                        <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
                      </div>
                    )}

                    {/* Centered Floating Emblem (Image 3) */}
                    <div className="absolute w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center p-1 border border-slate-100 overflow-hidden pointer-events-none">
                      {centerEmblem === 'business-logo' && logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : centerEmblem === 'business-logo' ? (
                        <span className="material-symbols-outlined text-[22px] text-amber-600">crown</span>
                      ) : (
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                  </div>
                </div>

                {/* Bottom Poster Callout */}
                <div className="w-full flex flex-col items-center px-6 pb-6 pt-1 text-center">
                  <div className="flex items-center gap-1.5 my-1">
                    <span className={`text-base font-bold ${currentPresetData.textColor}`}>
                      {headline}
                    </span>
                  </div>

                  {/* 5 Stars Rating Bar */}
                  {showStarBar && (
                    <div className="flex items-center justify-center gap-1 text-amber-400 my-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span
                          key={s}
                          className="material-symbols-outlined text-[24px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Scan CTA Button (Image 1) */}
                  <div
                    className="w-full mt-3 py-2.5 px-4 rounded-xl text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                  >
                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                    <span>{ctaText}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Download Strip below Mockup (Image 1) */}
              <div className="flex items-center gap-3 pt-6 w-full max-w-[380px]">
                <button
                  className="flex-1 h-11 px-4 rounded-xl bg-[#005BBF] text-white hover:bg-[#1A73E8] text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                  onClick={handleDownloadPNG}
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Download PNG Artwork</span>
                </button>
                <button
                  className="h-11 px-4 rounded-xl bg-white text-[#0B1C30] hover:bg-slate-50 text-xs font-bold shadow-sm border border-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                  onClick={handleExportPDF}
                >
                  <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                  <span>Print-Ready PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
