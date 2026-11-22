import QRCodeLib from 'qrcode';
import jsQR from 'jsqr';

export type QrStylePreset = 'standard' | 'google-branded' | 'print-friendly';

export interface QrEngineOptions {
  style?: QrStylePreset;
  geometry?: 'classic' | 'rounded' | 'dots' | 'premium-eye';
  centerEmblem?: 'none' | 'google-g' | 'business-logo';
  darkColor?: string;
  lightColor?: string;
  quietZone?: number;
  dimension?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  businessLogoUrl?: string;
}

export interface QrEngineResult {
  svg: string;
  dataUrl: string;
  matrixSize: number;
  totalSize: number;
  quietZone: number;
  isValid: boolean;
  decodedUrl: string | null;
  validationError: string | null;
  effectiveCenterEmblem: 'none' | 'google-g' | 'business-logo';
  minPrintSizeMm: number;
  recommendedPrintSizeMm: number;
  printSizeWarning: string | null;
}

/**
 * Strips redundant Google session tracking query parameters while preserving
 * essential destination identifiers (placeid, cid, custom paths, etc.).
 */
export function cleanDestinationUrl(rawUrl: string): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);
    const trackingParams = [
      'g_ep',
      'entry',
      'sa',
      'ved',
      'ssp',
      'oq',
      'aqs',
      'sourceid',
      'sca_esv',
      'authuser',
      'coh',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      '_ga',
    ];

    trackingParams.forEach((param) => parsed.searchParams.delete(param));
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

/**
 * Calculates recommended minimum physical print dimensions based on module count.
 * ISO/IEC 18004 recommends module size of at least 0.8 mm for reliable smartphone scanning.
 */
export function getRecommendedPrintSize(modulesCount: number): {
  minMm: number;
  recommendedMm: number;
  warning: string | null;
} {
  if (modulesCount <= 33) {
    return {
      minMm: 25,
      recommendedMm: 30,
      warning: null,
    };
  }
  if (modulesCount <= 45) {
    return {
      minMm: 35,
      recommendedMm: 40,
      warning: null,
    };
  }
  if (modulesCount <= 57) {
    return {
      minMm: 45,
      recommendedMm: 50,
      warning: 'Dense QR code detected. Minimum 45 mm print size recommended for reliable mobile scanning.',
    };
  }
  return {
    minMm: 60,
    recommendedMm: 70,
    warning: 'Very dense QR code. A larger print size (60 mm+) is required for mobile cameras to resolve.',
  };
}

/**
 * Uses the independent jsQR decoder to verify that a rendered QR symbol
 * can be decoded back to the exact expected URL.
 */
export function validateQrBuffer(
  qr: QRCodeLib.QRCode,
  targetUrl: string,
  hasCenterLogo = false,
  logoRadiusRatio = 0.1
): { valid: boolean; decodedUrl: string | null; error: string | null } {
  try {
    const size = qr.modules.size;
    const margin = 4;
    const scale = 8;
    const fullSize = (size + margin * 2) * scale;
    const imgData = new Uint8ClampedArray(fullSize * fullSize * 4);

    const center = fullSize / 2;
    const logoRadius = size * scale * logoRadiusRatio;

    for (let y = 0; y < fullSize; y++) {
      for (let x = 0; x < fullSize; x++) {
        const idx = (y * fullSize + x) * 4;
        const distFromCenter = Math.hypot(x - center, y - center);

        if (hasCenterLogo && distFromCenter <= logoRadius) {
          imgData[idx] = 255;
          imgData[idx + 1] = 255;
          imgData[idx + 2] = 255;
          imgData[idx + 3] = 255;
        } else {
          const modX = Math.floor(x / scale) - margin;
          const modY = Math.floor(y / scale) - margin;
          const isDark =
            modX >= 0 &&
            modX < size &&
            modY >= 0 &&
            modY < size &&
            Boolean(qr.modules.get(modY, modX));
          const color = isDark ? 0 : 255;
          imgData[idx] = color;
          imgData[idx + 1] = color;
          imgData[idx + 2] = color;
          imgData[idx + 3] = 255;
        }
      }
    }

    const decoded = jsQR(imgData, fullSize, fullSize);
    if (!decoded) {
      return {
        valid: false,
        decodedUrl: null,
        error: 'Decoder could not resolve QR patterns. Ensure quiet zone is clear.',
      };
    }

    if (decoded.data !== targetUrl) {
      return {
        valid: false,
        decodedUrl: decoded.data,
        error: `Decoded payload mismatch: expected "${targetUrl}", received "${decoded.data}".`,
      };
    }

    return { valid: true, decodedUrl: decoded.data, error: null };
  } catch (err) {
    return {
      valid: false,
      decodedUrl: null,
      error: err instanceof Error ? err.message : 'Validation error occurred.',
    };
  }
}

/**
 * Generates an SVG string representation of the official Google 4-color 'G' icon.
 */
function getGoogleGIconSvg(cx: number, cy: number, radius: number): string {
  const scale = (radius * 1.5) / 24;
  const tx = cx - radius * 0.75;
  const ty = cy - radius * 0.75;

  return [
    `<circle cx="${cx}" cy="${cy}" r="${radius + 1}" fill="#FFFFFF" />`,
    `<g transform="translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${scale.toFixed(4)})">`,
    '<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>',
    '<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>',
    '<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>',
    '<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>',
    '</g>',
  ].join('');
}

/**
 * Core Standards-Compliant QR Generator with independent validation.
 * Supports:
 *  1. 'standard' (Default: Solid black modules, pure white, no logo, standard quiet zone)
 *  2. 'google-branded' (Standard QR with small validated Google logo)
 *  3. 'print-friendly' (High-contrast monochrome, generous 5-module quiet zone, crisp edges)
 */
export function generateCleanQr(
  targetUrl: string,
  options: QrEngineOptions = {}
): QrEngineResult {
  const url = (targetUrl || '').trim();
  const style = options.style || 'standard';

  // Derive style defaults
  let geometry = options.geometry;
  let centerEmblem = options.centerEmblem;
  let quietZone = options.quietZone;
  let darkColor = options.darkColor;
  let lightColor = options.lightColor || '#FFFFFF';

  if (style === 'standard') {
    geometry = geometry || 'classic';
    centerEmblem = centerEmblem || 'none';
    quietZone = quietZone !== undefined ? quietZone : 4;
    darkColor = darkColor || '#0B1C30';
  } else if (style === 'google-branded') {
    geometry = geometry || 'classic';
    centerEmblem = centerEmblem || 'google-g';
    quietZone = quietZone !== undefined ? quietZone : 4;
    darkColor = darkColor || '#0B1C30';
  } else if (style === 'print-friendly') {
    geometry = 'classic';
    centerEmblem = 'none';
    quietZone = quietZone !== undefined ? quietZone : 5;
    darkColor = '#000000';
    lightColor = '#FFFFFF';
  } else {
    geometry = geometry || 'classic';
    centerEmblem = centerEmblem || 'none';
    quietZone = quietZone !== undefined ? quietZone : 4;
    darkColor = darkColor || '#0B1C30';
  }

  const errorCorrectionLevel = options.errorCorrectionLevel || 'M';
  const dimension = options.dimension || 320;

  const qr = QRCodeLib.create(url, { errorCorrectionLevel });
  const size = qr.modules.size;
  const totalSize = size + quietZone * 2;

  // Independent decoding validation
  const wantsLogo = centerEmblem !== 'none';
  let validation = validateQrBuffer(qr, url, wantsLogo, 0.1);
  let effectiveCenterEmblem = centerEmblem;

  // If validation fails with center logo, automatically disable logo to protect scannability
  if (wantsLogo && !validation.valid) {
    const fallbackValidation = validateQrBuffer(qr, url, false);
    if (fallbackValidation.valid) {
      effectiveCenterEmblem = 'none';
      validation = fallbackValidation;
    }
  }

  // Build clean SVG path
  const parts: string[] = [];
  const finderOrigins = [
    [0, 0],
    [0, size - 7],
    [size - 7, 0],
  ];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!qr.modules.get(r, c)) continue;

      const x = c;
      const y = r;
      const isFinderModule =
        geometry === 'premium-eye' &&
        finderOrigins.some(
          ([top, left]) => r >= top && r < top + 7 && c >= left && c < left + 7
        );

      if (isFinderModule) continue;

      if (geometry === 'dots') {
        parts.push(
          `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.45" fill="${darkColor}" />`
        );
      } else if (geometry === 'rounded') {
        parts.push(
          `<rect x="${x}" y="${y}" width="1" height="1" rx="0.25" ry="0.25" fill="${darkColor}" />`
        );
      } else {
        parts.push(
          `<rect x="${x}" y="${y}" width="1" height="1" fill="${darkColor}" />`
        );
      }
    }
  }

  if (geometry === 'premium-eye') {
    for (const [top, left] of finderOrigins) {
      const cx = left + 3.5;
      const cy = top + 3.5;
      parts.push(
        `<circle cx="${cx}" cy="${cy}" r="3.5" fill="${darkColor}" />` +
          `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${lightColor}" />` +
          `<circle cx="${cx}" cy="${cy}" r="1.5" fill="${darkColor}" />`
      );
    }
  }

  // Center emblem overlay
  let emblemSvg = '';
  if (effectiveCenterEmblem === 'google-g') {
    const centerCoordinate = quietZone + size / 2;
    const emblemRadius = Math.max(2.5, size * 0.08);
    emblemSvg = getGoogleGIconSvg(centerCoordinate, centerCoordinate, emblemRadius);
  } else if (effectiveCenterEmblem === 'business-logo' && options.businessLogoUrl) {
    const centerCoordinate = quietZone + size / 2;
    const emblemRadius = Math.max(2.5, size * 0.08);
    const boxSize = emblemRadius * 2;
    const bx = centerCoordinate - emblemRadius;
    const by = centerCoordinate - emblemRadius;
    emblemSvg = [
      `<circle cx="${centerCoordinate}" cy="${centerCoordinate}" r="${emblemRadius + 0.5}" fill="#FFFFFF" />`,
      `<image x="${bx}" y="${by}" width="${boxSize}" height="${boxSize}" href="${options.businessLogoUrl}" preserveAspectRatio="xMidYMid slice" clip-path="circle(${emblemRadius}px at ${centerCoordinate}px ${centerCoordinate}px)" />`,
    ].join('');
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${dimension}" height="${dimension}" viewBox="0 0 ${totalSize} ${totalSize}" shape-rendering="crispEdges">`,
    `<rect width="100%" height="100%" fill="${lightColor}" />`,
    `<g transform="translate(${quietZone} ${quietZone})">`,
    parts.join(''),
    '</g>',
    emblemSvg,
    '</svg>',
  ].join('');

  const dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  const printSpecs = getRecommendedPrintSize(size);

  return {
    svg,
    dataUrl,
    matrixSize: size,
    totalSize,
    quietZone,
    isValid: validation.valid,
    decodedUrl: validation.decodedUrl,
    validationError: validation.error,
    effectiveCenterEmblem,
    minPrintSizeMm: printSpecs.minMm,
    recommendedPrintSizeMm: printSpecs.recommendedMm,
    printSizeWarning: printSpecs.warning,
  };
}
