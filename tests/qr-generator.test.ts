import { describe, it, expect } from 'vitest';
import QRCodeLib from 'qrcode';
import { generateQrSvg } from '../src/lib/qr-geometry';

describe('QR Code Generation', () => {
  it('generates a valid scannable Data URL for Google review destination', async () => {
    const destination = 'https://g.page/r/Cbll2345abc992eEBM/review';
    const dataUrl = await QRCodeLib.toDataURL(destination, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
    });

    expect(dataUrl).toBeDefined();
    expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true);
    expect(dataUrl.length).toBeGreaterThan(100);
  });

  it('generates a valid SVG string for vector exports', async () => {
    const destination = 'https://g.page/r/Cbll2345abc992eEBM/review';
    const svg = await QRCodeLib.toString(destination, {
      type: 'svg',
      errorCorrectionLevel: 'H',
    });

    expect(svg).toBeDefined();
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.includes('</svg>')).toBe(true);
  });

  it('renders the selected module and eye geometry in the QR preview', () => {
    const dataUrl = (geometry: 'classic' | 'rounded' | 'dots' | 'premium-eye') =>
      decodeURIComponent(
        generateQrSvg('https://reviewqr.app', geometry, '#1A73E8').replace(
          'data:image/svg+xml;utf8,',
          ''
        )
      );

    const classic = dataUrl('classic');
    const rounded = dataUrl('rounded');
    const dots = dataUrl('dots');
    const premiumEye = dataUrl('premium-eye');

    expect(classic).toContain('<rect');
    expect(rounded).toContain('rx="0.3"');
    expect(dots).toContain('<circle');
    expect(premiumEye.match(/r="3\.5"/g)).toHaveLength(3);
    expect(premiumEye.match(/r="2\.5"/g)).toHaveLength(3);
    expect(premiumEye.match(/r="1\.5"/g)).toHaveLength(3);
  });
});
