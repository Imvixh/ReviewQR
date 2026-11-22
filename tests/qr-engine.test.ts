import { describe, expect, it } from 'vitest';
import jsQR from 'jsqr';
import QRCodeLib from 'qrcode';
import {
  cleanDestinationUrl,
  generateCleanQr,
  getRecommendedPrintSize,
  validateQrBuffer,
} from '../src/lib/qr-engine';

describe('QR Engine — Standards-Compliant Generation & Independent Validation', () => {
  it('cleans redundant Google tracking parameters safely', () => {
    const dirtyUrl =
      'https://search.google.com/local/writereview?placeid=ChIJ9sP48mnRh4cRxAteQp_qxBs&g_ep=CAISDDYuOTguMC4zNjAyMBgAINeCAyoECDBSAkgB&entry=ttu&sa=X&ved=2ahUKEwj';
    const cleaned = cleanDestinationUrl(dirtyUrl);

    expect(cleaned).toBe(
      'https://search.google.com/local/writereview?placeid=ChIJ9sP48mnRh4cRxAteQp_qxBs'
    );
  });

  it('preserves clean URLs without tracking parameters', () => {
    const cleanUrl = 'https://search.google.com/local/writereview?placeid=ChIJ9sP48mnRh4cRxAteQp_qxBs';
    expect(cleanDestinationUrl(cleanUrl)).toBe(cleanUrl);

    const gPageUrl = 'https://g.page/r/example-business/review';
    expect(cleanDestinationUrl(gPageUrl)).toBe(gPageUrl);
  });

  it('generates standard QR with solid black modules, pure white background, and no logo', () => {
    const targetUrl = 'https://search.google.com/local/writereview?placeid=ChIJ9sP48mnRh4cRxAteQp_qxBs';
    const result = generateCleanQr(targetUrl, {
      style: 'standard',
      geometry: 'classic',
      centerEmblem: 'none',
      darkColor: '#000000',
      lightColor: '#FFFFFF',
    });

    expect(result.isValid).toBe(true);
    expect(result.decodedUrl).toBe(targetUrl);
    expect(result.effectiveCenterEmblem).toBe('none');
    expect(result.quietZone).toBe(4);
    expect(result.svg).toContain('fill="#000000"');
    expect(result.svg).toContain('fill="#FFFFFF"');
    expect(result.svg).toContain('shape-rendering="crispEdges"');
    expect(result.svg).not.toContain('<path d="M22.56 12.25'); // No Google G logo
  });

  it('independently decodes generated QR and verifies 100% payload match', () => {
    const targetUrl = 'https://revvly.vercel.app/qr/taj-palace-hotel';
    const result = generateCleanQr(targetUrl, { style: 'standard' });

    expect(result.isValid).toBe(true);
    expect(result.decodedUrl).toBe(targetUrl);
    expect(result.matrixSize).toBeLessThanOrEqual(37); // Clean small version
  });

  it('validates Google Branded QR with small centered logo', () => {
    const targetUrl = 'https://search.google.com/local/writereview?placeid=ChIJ9sP48mnRh4cRxAteQp_qxBs';
    const result = generateCleanQr(targetUrl, {
      style: 'google-branded',
      centerEmblem: 'google-g',
    });

    expect(result.isValid).toBe(true);
    expect(result.decodedUrl).toBe(targetUrl);
    expect(result.effectiveCenterEmblem).toBe('google-g');
    expect(result.svg).toContain('<path d="M22.56 12.25'); // Contains Google G
  });

  it('generates Print-Friendly QR with generous quiet zone of at least 5 modules', () => {
    const targetUrl = 'https://revvly.vercel.app/qr/taj-palace-hotel';
    const result = generateCleanQr(targetUrl, { style: 'print-friendly' });

    expect(result.isValid).toBe(true);
    expect(result.quietZone).toBe(5);
    expect(result.effectiveCenterEmblem).toBe('none');
    expect(result.svg).toContain(`viewBox="0 0 ${result.matrixSize + 10} ${result.matrixSize + 10}"`);
  });

  it('provides sensible physical print-size recommendations', () => {
    const smallCode = getRecommendedPrintSize(29);
    expect(smallCode.minMm).toBe(25);
    expect(smallCode.recommendedMm).toBe(30);
    expect(smallCode.warning).toBeNull();

    const standardCode = getRecommendedPrintSize(37);
    expect(standardCode.minMm).toBe(35);
    expect(standardCode.recommendedMm).toBe(40);
    expect(standardCode.warning).toBeNull();

    const denseCode = getRecommendedPrintSize(53);
    expect(denseCode.minMm).toBe(45);
    expect(denseCode.recommendedMm).toBe(50);
    expect(denseCode.warning).toContain('Dense QR code detected');
  });

  it('automatically falls back to no-logo configuration if center logo prevents decoding', () => {
    const targetUrl = 'https://very-short.example';
    const qr = QRCodeLib.create(targetUrl, { errorCorrectionLevel: 'L' }); // Level L has low tolerance
    
    // An oversized logo (40% radius) will obscure too many data codewords in Level L
    const failCheck = validateQrBuffer(qr, targetUrl, true, 0.40);
    expect(failCheck.valid).toBe(false);

    // The generator automatically protects against this by reverting to no-logo
    const safeResult = generateCleanQr(targetUrl, {
      centerEmblem: 'google-g',
      errorCorrectionLevel: 'L',
    });
    expect(safeResult.isValid).toBe(true);
  });
});
