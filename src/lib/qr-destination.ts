import type { QRCode } from './types';
import { validateReviewDestination } from './review-destination';

export type QrDestinationMode = 'direct' | 'guided';

export type QrDestinationResolution =
  | { ok: true; url: string }
  | { ok: false; message: string };

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');

  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.lan') ||
    host === 'home.arpa' ||
    host.endsWith('.example') ||
    host.endsWith('.test') ||
    host.endsWith('.invalid') ||
    host === 'example.com' ||
    host.endsWith('.example.com')
  ) {
    return true;
  }

  if (host.includes(':')) {
    if (host.startsWith('::ffff:')) {
      const mappedAddress = host.slice(7);
      if (mappedAddress.includes('.')) return isPrivateHostname(mappedAddress);

      const groups = mappedAddress.split(':');
      if (groups.length === 2 && groups.every((group) => /^[0-9a-f]{1,4}$/i.test(group))) {
        const high = Number.parseInt(groups[0], 16);
        const low = Number.parseInt(groups[1], 16);
        return isPrivateHostname(
          `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`
        );
      }
    }
    return (
      host === '::' ||
      host === '::1' ||
      /^f[cd]/i.test(host) ||
      /^fe[89ab]/i.test(host)
    );
  }

  const octets = host.split('.');
  if (octets.length !== 4 || octets.some((part) => !/^\d{1,3}$/.test(part))) {
    return false;
  }

  const [first, second] = octets.map(Number);
  if (octets.some((part) => Number(part) > 255)) return true;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

export function resolvePublicAppOrigin(
  configuredAppUrl: string | undefined,
  currentOrigin: string
): QrDestinationResolution {
  const configured = configuredAppUrl?.trim();
  const source = configured || currentOrigin;

  let url: URL;
  try {
    url = new URL(source);
  } catch {
    return {
      ok: false,
      message: 'Set NEXT_PUBLIC_APP_URL to your public HTTPS deployment URL before creating a guided QR.',
    };
  }

  if (
    url.protocol !== 'https:' ||
    !url.hostname ||
    url.username ||
    url.password ||
    isPrivateHostname(url.hostname)
  ) {
    return {
      ok: false,
      message: 'Guided QR codes require a public HTTPS app URL. Localhost and private development addresses cannot be scanned by customers.',
    };
  }

  return { ok: true, url: url.origin };
}

export function resolveQrDestination(
  mode: QrDestinationMode,
  reviewUrl: string,
  publicToken: string | undefined,
  configuredAppUrl: string | undefined,
  currentOrigin: string
): QrDestinationResolution {
  if (mode === 'direct') {
    const validation = validateReviewDestination(reviewUrl);
    if (!validation.valid) return { ok: false, message: validation.message };
    return { ok: true, url: validation.url };
  }

  const appOrigin = resolvePublicAppOrigin(configuredAppUrl, currentOrigin);
  if (!appOrigin.ok) return appOrigin;
  if (!publicToken) {
    return { ok: false, message: 'Save the guided QR design before generating its customer link.' };
  }

  return {
    ok: true,
    url: new URL(`/qr/${encodeURIComponent(publicToken)}`, appOrigin.url).toString(),
  };
}

export function getQrDestinationMode(qr: QRCode | undefined): QrDestinationMode {
  return qr?.destinationMode ?? 'guided';
}
