import type { QRCode } from './types';

export const qrDatabaseFields =
  'id, business_id, token, placement_name, headline, tagline, supporting_text, accent_color, preset, geometry, center_emblem, destination_mode, status, created_at, updated_at';
export const qrDatabaseFieldsLegacy =
  'id, business_id, token, placement_name, headline, tagline, supporting_text, accent_color, preset, geometry, center_emblem, status, created_at, updated_at';

export function isDestinationModeColumnMissing(
  error: { code?: string; message?: string } | null
): boolean {
  return (
    (error?.code === '42703' || error?.code === 'PGRST204') &&
    Boolean(error.message?.toLowerCase().includes('destination_mode'))
  );
}

export interface BusinessRecord {
  id: string;
  name: string;
  city: string;
  google_review_url: string;
  category?: string;
  subcategory?: string | null;
  logo_path?: string | null;
  thumbnail_path?: string | null;
}

export interface QrRecord {
  id: string;
  business_id: string;
  token: string;
  placement_name: string;
  headline: string;
  tagline: string | null;
  supporting_text: string;
  accent_color: string;
  preset: string;
  geometry: 'classic' | 'rounded' | 'dots' | 'premium-eye';
  center_emblem: 'google-g' | 'business-logo';
  destination_mode?: 'direct' | 'guided';
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export function mapQrRecord(row: QrRecord, business: BusinessRecord): QRCode {
  return {
    id: row.id,
    orgId: business.id,
    slug: row.token,
    publicToken: row.token,
    businessName: business.name,
    city: business.city,
    category: business.category,
    subcategory: business.subcategory || undefined,
    destinationUrl: business.google_review_url,
    destinationMode: row.destination_mode || 'guided',
    placementName: row.placement_name,
    placementType: row.placement_name,
    headline: row.headline,
    tagline: row.tagline || '',
    supportingText: row.supporting_text,
    accentColor: row.accent_color,
    currentTemplate: row.preset,
    preset: row.preset,
    geometry: row.geometry,
    centerEmblem: row.center_emblem,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
