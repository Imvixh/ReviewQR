import { safeHttpsUrlSchema } from './validation';
import { cleanDestinationUrl } from './qr-engine';

export interface DecodedGuestToken {
  businessName: string;
  city: string;
  googleReviewUrl: string;
  businessCategory: string;
  businessSubcategory: string;
  headline: string;
  tagline: string;
  supportingText: string;
  accentColor: string;
  logoUrl?: string;
  thumbnailUrl?: string;
}

const SUPABASE_ASSETS_REGEX =
  /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/business-assets\//i;
const PROXY_ASSET_REGEX =
  /^(?:https?:\/\/[^/]+)?\/api\/public\/asset\?path=/i;
const DEFAULT_SUPABASE_BASE =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ffqonnfnmuhjkofbtvtm.supabase.co';

export function compactAssetUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (SUPABASE_ASSETS_REGEX.test(url)) {
    const relative = url.replace(SUPABASE_ASSETS_REGEX, '');
    if (relative.startsWith('public-uploads/')) {
      return '~' + relative.replace(/^public-uploads\//, '');
    }
    return '~' + relative;
  }
  if (PROXY_ASSET_REGEX.test(url)) {
    const rawPath = url.replace(PROXY_ASSET_REGEX, '');
    const decodedPath = decodeURIComponent(rawPath);
    if (decodedPath.startsWith('public-uploads/')) {
      return '~' + decodedPath.replace(/^public-uploads\//, '');
    }
    return '~' + decodedPath;
  }
  return url;
}

export function expandAssetUrl(val?: string): string | undefined {
  if (!val) return undefined;
  if (val.startsWith('~')) {
    const rest = val.slice(1);
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_BASE;
    if (rest.includes('/')) {
      return `${base}/storage/v1/object/public/business-assets/${rest}`;
    }
    return `${base}/storage/v1/object/public/business-assets/public-uploads/${rest}`;
  }
  return val;
}

export function compactReviewUrl(url: string): string {
  const cleaned = cleanDestinationUrl(url);
  if (cleaned.startsWith('https://search.google.com/local/writereview?placeid=')) {
    return 'g:' + cleaned.slice(52);
  }
  if (cleaned.startsWith('https://g.page/r/')) {
    return 'gp:' + cleaned.slice(17);
  }
  if (cleaned.startsWith('https://maps.google.com/?cid=')) {
    return 'gc:' + cleaned.slice(29);
  }
  return cleaned;
}

export function expandReviewUrl(u?: string): string {
  if (!u) return '';
  if (u.startsWith('g:')) {
    return `https://search.google.com/local/writereview?placeid=${u.slice(2)}`;
  }
  if (u.startsWith('gp:')) {
    return `https://g.page/r/${u.slice(3)}`;
  }
  if (u.startsWith('gc:')) {
    return `https://maps.google.com/?cid=${u.slice(3)}`;
  }
  return u;
}

function toUrlSafeBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromUrlSafeBase64(b64: string): string {
  const standard = b64.replace(/-/g, '+').replace(/_/g, '/');
  const padded = standard.padEnd(standard.length + ((4 - (standard.length % 4)) % 4), '=');
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf8');
  }
  return decodeURIComponent(escape(atob(padded)));
}

/**
 * Creates a compact, highly scannable guest token for Guided Review QR codes.
 * Long well-known URLs (Google Maps review endpoints) are cleaned and compressed
 * to minimize QR matrix density. Assets are omitted by default to ensure maximum
 * QR scannability unless explicitly enabled.
 */
export function createGuestToken(
  name: string,
  city?: string,
  url?: string,
  cat?: string,
  accent?: string,
  logo?: string,
  thumb?: string,
  subcat?: string
): string {
  try {
    if (!url) return '';
    const payload: Record<string, string> = {
      n: name.trim() || 'Business',
      u: compactReviewUrl(url),
    };
    if (city && city.trim()) payload.c = city.trim();
    if (cat && cat.trim()) payload.cat = cat.trim();
    if (subcat && subcat.trim()) payload.sub = subcat.trim();
    if (accent && accent.trim() && accent.trim().toUpperCase() !== '#1A73E8') {
      payload.a = accent.trim();
    }

    if (logo && (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/api/public/asset'))) {
      const compacted = compactAssetUrl(logo);
      if (compacted) payload.l = compacted;
    }
    if (thumb && (thumb.startsWith('http://') || thumb.startsWith('https://') || thumb.startsWith('/api/public/asset'))) {
      const compacted = compactAssetUrl(thumb);
      if (compacted) payload.th = compacted;
    }

    const json = JSON.stringify(payload);
    const b64 = toUrlSafeBase64(json);
    return `guest_${b64}`;
  } catch {
    return '';
  }
}

/**
 * Decodes a guest token back into its full review assistant properties.
 * Handles both newly compressed tokens and legacy uncompressed tokens seamlessly.
 */
export function decodeGuestToken(token: string): DecodedGuestToken | null {
  if (!token.startsWith('guest_')) return null;
  try {
    const jsonStr = fromUrlSafeBase64(token.slice(6));
    const payload = JSON.parse(jsonStr);
    const googleReviewUrl = expandReviewUrl(payload.u);

    if (googleReviewUrl && safeHttpsUrlSchema.safeParse(googleReviewUrl).success) {
      return {
        businessName: payload.n || 'Business',
        city: payload.c || '',
        googleReviewUrl,
        businessCategory: payload.cat || 'Business',
        businessSubcategory: payload.sub || '',
        headline: payload.h || 'Review us on Google',
        tagline: payload.t || 'Scan to share your experience',
        supportingText: '',
        accentColor: payload.a || '#1A73E8',
        logoUrl: expandAssetUrl(payload.l || payload.logo),
        thumbnailUrl: expandAssetUrl(payload.th || payload.thumb),
      };
    }
    return null;
  } catch {
    return null;
  }
}
