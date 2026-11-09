import { describe, expect, it } from 'vitest';
import QRCodeLib from 'qrcode';
import { resolvePublicAppOrigin, resolveQrDestination } from '../src/lib/qr-destination';
import { generateQrSvg } from '../src/lib/qr-geometry';
import { validateReviewDestination } from '../src/lib/review-destination';

describe('QR destination modes', () => {
  it('preserves the exact pasted HTTPS review URL in direct mode', () => {
    const url = 'https://www.google.com/maps/place/Cafe/reviews?entry=ttu&g_ep=abc%2F123';
    const validation = validateReviewDestination(url);
    expect(validation.valid).toBe(true);
    if (!validation.valid) return;

    const result = resolveQrDestination('direct', validation.url, undefined, undefined, 'http://localhost:3000');
    expect(result).toEqual({ ok: true, url });
    if (!result.ok) return;

    const actualSymbol = QRCodeLib.create(result.url, { errorCorrectionLevel: 'H' });
    const expectedSymbol = QRCodeLib.create(url, { errorCorrectionLevel: 'H' });
    expect(actualSymbol.modules.data).toEqual(expectedSymbol.modules.data);
    expect(generateQrSvg(result.url, 'classic', '#1A73E8')).toBe(
      generateQrSvg(url, 'classic', '#1A73E8')
    );
  });

  it('resolves guided mode to the public ReviewQR customer route', () => {
    const result = resolveQrDestination(
      'guided',
      'https://www.google.com/maps/place/Cafe/reviews',
      '8dd281b9-7f6a-4c12-90ef-0d67400a986a',
      'https://reviewqr.app',
      'http://localhost:3000'
    );

    expect(result).toEqual({
      ok: true,
      url: 'https://reviewqr.app/qr/8dd281b9-7f6a-4c12-90ef-0d67400a986a',
    });
  });

  it.each([
    'http://localhost:3000',
    'https://127.0.0.1:3000',
    'https://192.168.1.20',
    'https://10.0.0.2',
    'https://reviewqr.local',
    'https://[::1]:3000',
    'https://[fd00::1]',
    'https://[::ffff:c0a8:101]',
    'https://your-deployed-hostname.example',
  ])('rejects a private app URL for guided QR generation: %s', (url) => {
    expect(resolvePublicAppOrigin(url, url)).toMatchObject({ ok: false });
  });

  it('does not silently fall back to the browser host when a configured app URL is private', () => {
    expect(resolvePublicAppOrigin('http://localhost:3000', 'https://public.example')).toMatchObject({
      ok: false,
    });
  });

  it('keeps direct QR generation independent of the app host', () => {
    expect(
      resolveQrDestination(
        'direct',
        'https://g.page/r/example/review',
        undefined,
        'http://localhost:3000',
        'http://localhost:3000'
      )
    ).toEqual({ ok: true, url: 'https://g.page/r/example/review' });
  });

  it('requires a valid destination and a saved token for the selected mode', () => {
    expect(resolveQrDestination('direct', '', undefined, undefined, 'https://public.example')).toMatchObject({
      ok: false,
    });
    expect(
      resolveQrDestination('guided', 'https://g.page/r/example/review', undefined, 'https://public.example', 'https://public.example')
    ).toMatchObject({ ok: false });
    expect(validateReviewDestination('javascript:alert(1)').valid).toBe(false);
  });
});
