/**
 * ReviewQR core domain types.
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  category?: string;
  city?: string;
  phone?: string;
  email?: string;
  address?: string;
  googleReviewUrl?: string;
  googlePlaceId?: string;
  accentColor?: string;
  logoUrl?: string;
  logoPath?: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
  tagline?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QRCode {
  id: string;
  orgId: string;
  slug: string;
  businessName: string;
  destinationUrl: string;
  destinationPlaceId?: string;
  placementType?: string;
  placementName?: string;
  accentColor?: string;
  headline?: string;
  tagline?: string;
  currentTemplate?: string;
  preset?: string;
  geometry?: 'classic' | 'rounded' | 'dots' | 'premium-eye';
  centerEmblem?: 'google-g' | 'business-logo';
  logoUrl?: string;
  thumbnailUrl?: string;
  status: 'draft' | 'active' | 'archived';
  showStarBar?: boolean;
  emblemText?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QrAnalyticsEvent {
  id?: number;
  qrCodeId?: string;
  event: 'scan' | 'unique_visitor' | 'google_click';
  occurredAt?: string;
}

export interface AnalyticsSummary {
  scans: number;
  unique: number;
  googleClicks: number;
  ctr: number;
}

export interface SessionUser {
  id: string;
  email: string;
  displayName?: string;
  orgId?: string;
  role?: string;
}

export interface ReviewIntent {
  id?: string;
  qrCodeId?: string;
  star?: number;
  suggestionCategory?: string;
  reviewDraft?: string;
  emailPresent?: boolean;
  status?: 'requested' | 'replied' | 'completed';
  createdAt?: string;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}
