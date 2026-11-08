import { Organization, QRCode, QrAnalyticsEvent, SessionUser } from './types';

// Default initial seed data reflecting the Stitch design source of truth
export const initialOrg: Organization = {
  id: 'org_royal_palace',
  name: 'Royal Palace Hotel',
  slug: 'royal-palace-hotel',
  category: 'Restaurant & Lounge',
  city: 'Bettiah, Bihar',
  phone: '+91 98765 43210',
  email: 'manager@royalpalacehotel.in',
  address: 'Station Road, Near Super Market, Bettiah, Bihar - 845438',
  googleReviewUrl: 'https://g.page/r/Cbll2345abc992eEBM/review',
  googlePlaceId: 'ChIJ2345abc0198_RPHTL',
  accentColor: '#1A73E8',
  logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBf1SMRirelc3co9b6JIhVoB1-3j55tl_plCe81R0wJOfMhah9DwXkj_b8lkXO6BpzGgyIYDBmFcbVm-2JNQelyPNCz6Mq5qkvXxnpg41cFqWhhNINzarkApa7Dbphp1dr2S0RocpSqwtrTDr0Oe2EAnj_PclXSV5Y1Tj6Jb1RYF4jo-ouica8desefkYx5r9prPGt7B37egPUlr2JohS4ZrthR66UdT53GTMizy5M',
  thumbnailUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  tagline: 'Your honest feedback helps our culinary staff serve you better.',
  createdAt: '2026-10-01T10:00:00Z',
  updatedAt: '2026-11-07T12:00:00Z',
};

export const initialQRCodes: QRCode[] = [
  {
    id: 'qr_dining_t1_12',
    orgId: 'org_royal_palace',
    slug: 'table-tent-main-dining',
    businessName: 'Royal Palace Hotel',
    destinationUrl: 'https://g.page/r/Cbll2345abc992eEBM/review',
    destinationPlaceId: 'ChIJ2345abc0198_RPHTL',
    placementType: 'Table Tent — Main Dining Hall (T1-12)',
    placementName: 'Table Tent — Main Dining Hall (T1-12)',
    accentColor: '#1A73E8',
    headline: 'Review us on Google',
    tagline: 'Point phone camera & tap to share your feedback',
    currentTemplate: 'classic-acrylic',
    status: 'active',
    createdAt: '2026-10-15T09:30:00Z',
    updatedAt: '2026-11-06T14:20:00Z',
  },
  {
    id: 'qr_reception_desk',
    orgId: 'org_royal_palace',
    slug: 'front-reception-counter',
    businessName: 'Royal Palace Hotel',
    destinationUrl: 'https://g.page/r/Cbll2345abc992eEBM/review',
    destinationPlaceId: 'ChIJ2345abc0198_RPHTL',
    placementType: 'Front Reception & Check-in Desk',
    placementName: 'Front Reception & Check-in Desk',
    accentColor: '#1A73E8',
    headline: 'Rate your stay on Google',
    tagline: 'Quick 30-second review for our reception team',
    currentTemplate: 'modern-standee',
    status: 'active',
    createdAt: '2026-10-18T11:00:00Z',
    updatedAt: '2026-11-05T16:45:00Z',
  },
  {
    id: 'qr_rooftop_lounge',
    orgId: 'org_royal_palace',
    slug: 'rooftop-sky-lounge',
    businessName: 'Royal Palace Hotel',
    destinationUrl: 'https://g.page/r/Cbll2345abc992eEBM/review',
    destinationPlaceId: 'ChIJ2345abc0198_RPHTL',
    placementType: 'Rooftop Sky Lounge Bar',
    placementName: 'Rooftop Sky Lounge Bar',
    accentColor: '#0F172A',
    headline: 'Enjoyed the view & cocktails?',
    tagline: 'Leave us a 5-star Google review',
    currentTemplate: 'minimal-slate',
    status: 'active',
    createdAt: '2026-11-05T18:00:00Z',
    updatedAt: '2026-11-07T11:00:00Z',
  },
  {
    id: 'qr_takeaway_counter',
    orgId: 'org_royal_palace',
    slug: 'takeaway-billing-counter',
    businessName: 'Royal Palace Hotel',
    destinationUrl: 'https://g.page/r/Cbll2345abc992eEBM/review',
    destinationPlaceId: 'ChIJ2345abc0198_RPHTL',
    placementType: 'Takeaway & Delivery Billing Counter',
    placementName: 'Takeaway & Delivery Billing Counter',
    accentColor: '#34A853',
    headline: 'Review our express service on Google',
    tagline: 'Tap your camera to leave honest feedback',
    currentTemplate: 'bistro-green',
    status: 'active',
    createdAt: '2026-10-22T14:15:00Z',
    updatedAt: '2026-11-04T09:10:00Z',
  },
  {
    id: 'qr_banquet_hall',
    orgId: 'org_royal_palace',
    slug: 'grand-banquet-hall',
    businessName: 'Royal Palace Hotel',
    destinationUrl: 'https://g.page/r/Cbll2345abc992eEBM/review',
    destinationPlaceId: 'ChIJ2345abc0198_RPHTL',
    placementType: 'Grand Banquet & Conference Entry',
    accentColor: '#EA4335',
    headline: 'Celebrated an event with us?',
    tagline: 'Share your experience on Google',
    currentTemplate: 'warm-amber',
    status: 'active',
    createdAt: '2026-10-28T16:00:00Z',
    updatedAt: '2026-11-02T13:30:00Z',
  },
  {
    id: 'qr_poolside_cafe',
    orgId: 'org_royal_palace',
    slug: 'poolside-patio-cafe',
    businessName: 'Royal Palace Hotel',
    destinationUrl: 'https://g.page/r/Cbll2345abc992eEBM/review',
    destinationPlaceId: 'ChIJ2345abc0198_RPHTL',
    placementType: 'Poolside Terrace (Seasonal)',
    accentColor: '#FBBC04',
    headline: 'Review our sunny patio dining',
    tagline: 'Help other travelers discover our cafe',
    currentTemplate: 'warm-amber',
    status: 'draft',
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z',
  },
];

export const initialUser: SessionUser = {
  id: 'usr_rajesh_kumar',
  email: 'rajesh.kumar@royalpalace.in',
  displayName: 'Rajesh Kumar',
  orgId: 'org_royal_palace',
  role: 'admin',
};

const STORAGE_KEYS = {
  USER: 'reviewqr_user',
  ORG: 'reviewqr_org',
  QRS: 'reviewqr_qrcodes',
  SCANS: 'reviewqr_scans',
  CLICKS: 'reviewqr_clicks',
};

// Safe browser local-storage helpers
export function getStoredUser(): SessionUser | null {
  if (typeof window === 'undefined') return initialUser;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(initialUser));
      return initialUser;
    }
    return JSON.parse(data);
  } catch {
    return initialUser;
  }
}

export function setStoredUser(user: SessionUser | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
}

export function getStoredOrg(): Organization {
  if (typeof window === 'undefined') return initialOrg;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORG);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ORG, JSON.stringify(initialOrg));
      return initialOrg;
    }
    return JSON.parse(data);
  } catch {
    return initialOrg;
  }
}

export function setStoredOrg(org: Partial<Organization>): Organization {
  if (typeof window === 'undefined') return { ...initialOrg, ...org };
  const current = getStoredOrg();
  const updated = { ...current, ...org, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEYS.ORG, JSON.stringify(updated));
  return updated;
}

export function saveOrgLogo(logoUrl: string, logoPath?: string): Organization {
  return setStoredOrg({ logoUrl, logoPath });
}

export function saveOrgThumbnail(thumbnailUrl: string, thumbnailPath?: string): Organization {
  return setStoredOrg({ thumbnailUrl, thumbnailPath });
}

export function getStoredQRCodes(): QRCode[] {
  if (typeof window === 'undefined') return initialQRCodes;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QRS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.QRS, JSON.stringify(initialQRCodes));
      return initialQRCodes;
    }
    return JSON.parse(data);
  } catch {
    return initialQRCodes;
  }
}

export function saveQRCode(qr: Omit<QRCode, 'id'> & { id?: string }): QRCode {
  const pName = qr.placementName || qr.placementType || 'Table Tent Artwork';
  if (typeof window === 'undefined') {
    const newQR: QRCode = {
      ...qr,
      placementName: pName,
      placementType: qr.placementType || pName,
      id: qr.id || `qr_${Date.now()}`,
      createdAt: qr.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newQR;
  }
  const qrs = getStoredQRCodes();
  const id = qr.id || `qr_${Date.now()}`;
  const now = new Date().toISOString();
  const existingIdx = qrs.findIndex((item) => item.id === id);

  let result: QRCode;
  if (existingIdx >= 0) {
    result = {
      ...qrs[existingIdx],
      ...qr,
      placementName: pName,
      id,
      updatedAt: now,
    };
    qrs[existingIdx] = result;
  } else {
    result = {
      ...qr,
      placementName: pName,
      id,
      createdAt: qr.createdAt || now,
      updatedAt: now,
    };
    qrs.unshift(result);
  }
  localStorage.setItem(STORAGE_KEYS.QRS, JSON.stringify(qrs));
  return result;
}

export function deleteQRCode(id: string): boolean {
  if (typeof window === 'undefined') return true;
  const qrs = getStoredQRCodes();
  const filtered = qrs.filter((q) => q.id !== id);
  localStorage.setItem(STORAGE_KEYS.QRS, JSON.stringify(filtered));
  return true;
}

// Scans & Click Analytics Tracker
export function recordScan(qrId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const scans: Array<{ qrId: string; timestamp: number }> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SCANS) || '[]'
    );
    scans.push({ qrId, timestamp: Date.now() });
    localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(scans));
  } catch (err) {
    console.error('Failed to record scan', err);
  }
}

export function recordGoogleClick(qrId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const clicks: Array<{ qrId: string; timestamp: number }> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CLICKS) || '[]'
    );
    clicks.push({ qrId, timestamp: Date.now() });
    localStorage.setItem(STORAGE_KEYS.CLICKS, JSON.stringify(clicks));
  } catch (err) {
    console.error('Failed to record click', err);
  }
}

export function getAnalyticsStats() {
  const emptyStats = {
    totalScans: 0,
    uniqueVisitors: null,
    googleClicks: 0,
    ctr: null,
  };
  if (typeof window === 'undefined') return emptyStats;
  try {
    const localScans: Array<{ qrId: string; timestamp: number }> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SCANS) || '[]'
    );
    const localClicks: Array<{ qrId: string; timestamp: number }> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CLICKS) || '[]'
    );
    const totalScans = localScans.length;
    const googleClicks = localClicks.length;

    return {
      totalScans,
      uniqueVisitors: null,
      googleClicks,
      ctr: totalScans > 0 ? ((googleClicks / totalScans) * 100).toFixed(1) : null,
    };
  } catch (error) {
    console.error('Failed to read local analytics data', error);
    return emptyStats;
  }
}
