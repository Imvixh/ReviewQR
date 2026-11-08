'use client';

import QRCodeLib from 'qrcode';

/**
 * Geometry-aware QR renderer.
 *
 * The `qrcode` library renders square pixel modules via `toDataURL`/`toBuffer`,
 * so CSS border-radius alone cannot produce rounded/dot/premium-eye modules.
 * Instead we build the QR symbol matrix with `QRCodeLib.create()` and paint each
 * dark module as an SVG shape whose form depends on `geometry`.
 *
 * Returns a `data:image/svg+xml;utf8,` data URL suitable for an <img src>.
 */
export function generateQrSvg(
  text: string,
  geometry: 'classic' | 'rounded' | 'dots' | 'premium-eye',
  darkColor: string
): string {
  const created = QRCodeLib.create(text, { errorCorrectionLevel: 'H' });
  const modules = created.modules;
  const size = modules.size;

  const parts: string[] = [];
  const finderOrigins = [
    [0, 0],
    [0, size - 7],
    [size - 7, 0],
  ];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!modules.get(r, c)) continue;

      const x = c;
      const y = r;
      const isFinderModule =
        geometry === 'premium-eye' &&
        finderOrigins.some(([top, left]) => r >= top && r < top + 7 && c >= left && c < left + 7);

      if (isFinderModule) continue;

      if (geometry === 'dots') {
        parts.push(`<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.42" fill="${darkColor}" />`);
      } else if (geometry === 'rounded') {
        parts.push(
          `<rect x="${x}" y="${y}" width="1" height="1" rx="0.3" ry="0.3" fill="${darkColor}" />`
        );
      } else {
        parts.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${darkColor}" />`);
      }
    }
  }

  if (geometry === 'premium-eye') {
    for (const [top, left] of finderOrigins) {
      const cx = left + 3.5;
      const cy = top + 3.5;
      parts.push(
        `<circle cx="${cx}" cy="${cy}" r="3.5" fill="${darkColor}" />` +
        `<circle cx="${cx}" cy="${cy}" r="2.5" fill="#FFFFFF" />` +
        `<circle cx="${cx}" cy="${cy}" r="1.5" fill="${darkColor}" />`
      );
    }
  }

  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg"',
    `width="320" height="320" viewBox="0 0 ${size} ${size}"`,
    'shape-rendering="crispEdges"',
    '>',
    parts.join(''),
    '</svg>',
  ].join('');

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
