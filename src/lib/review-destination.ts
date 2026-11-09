export type ReviewDestinationValidation =
  | {
      valid: true;
      url: string;
      isGoogleHosted: boolean;
      message: string;
    }
  | {
      valid: false;
      url: '';
      isGoogleHosted: false;
      message: string;
    };

function isGoogleDomain(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

export function validateReviewDestination(value: string): ReviewDestinationValidation {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, url: '', isGoogleHosted: false, message: 'Paste a review link to continue.' };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { valid: false, url: '', isGoogleHosted: false, message: 'Enter a complete URL, including https://.' };
  }

  if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) {
    return {
      valid: false,
      url: '',
      isGoogleHosted: false,
      message: 'Use a safe HTTPS link without embedded credentials.',
    };
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  const isGoogleHosted = [
    'google.com',
    'g.page',
    'maps.app.goo.gl',
    'goo.gl',
  ].some((domain) => isGoogleDomain(hostname, domain));

  return {
    valid: true,
    url: trimmed,
    isGoogleHosted,
    message: isGoogleHosted
      ? 'Google-hosted link. ReviewQR cannot verify that it opens the correct business review page.'
      : 'External HTTPS link. ReviewQR cannot verify the provider or review destination.',
  };
}

export function buildGoogleMapsSearchUrl(businessName: string, location: string): string | null {
  const name = businessName.trim();
  const city = location.trim();
  if (!name || !city) return null;

  const query = encodeURIComponent(`${name} ${city}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
