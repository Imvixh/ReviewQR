import { describe, expect, it } from 'vitest';
import { createGuestToken, decodeGuestToken } from '../src/lib/guest-token';

describe('Guest Guided QR Token & Review Assistant Flow', () => {
  it('encodes and decodes guest business info with complete fidelity', () => {
    const input = {
      name: 'Chacha Bhatija Restaurant',
      city: 'Ara, Bhojpur',
      url: 'https://g.page/r/example/review',
      cat: 'Restaurant',
      accent: '#1A73E8',
      logo: 'https://example.com/logo.png',
      thumb: 'https://example.com/cover.jpg',
    };

    const token = createGuestToken(
      input.name,
      input.city,
      input.url,
      input.cat,
      input.accent,
      input.logo,
      input.thumb
    );
    expect(token).toMatch(/^guest_[A-Za-z0-9_-]+$/);

    const decoded = decodeGuestToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.businessName).toBe('Chacha Bhatija Restaurant');
    expect(decoded?.city).toBe('Ara, Bhojpur');
    expect(decoded?.googleReviewUrl).toBe('https://g.page/r/example/review');
    expect(decoded?.businessCategory).toBe('Restaurant');
    expect(decoded?.accentColor).toBe('#1A73E8');
    expect(decoded?.logoUrl).toBe('https://example.com/logo.png');
    expect(decoded?.thumbnailUrl).toBe('https://example.com/cover.jpg');
  });

  it('compacts Google review URLs and Supabase storage paths for smaller QR matrix size', () => {
    const input = {
      name: 'The Taj Hotel',
      city: 'Mumbai, Maharastra',
      url: 'https://search.google.com/local/writereview?placeid=ChIJ9sP48mnRh4cRxAteQp_qxBs',
      cat: 'Restaurant & Lounge',
      accent: '#0B1C30',
      logo: 'https://ffqonnfnmuhjkofbtvtm.supabase.co/storage/v1/object/public/business-assets/public-uploads/logo-123.png',
      thumb: 'https://ffqonnfnmuhjkofbtvtm.supabase.co/storage/v1/object/public/business-assets/public-uploads/cover-456.jpg',
    };

    const token = createGuestToken(
      input.name,
      input.city,
      input.url,
      input.cat,
      input.accent,
      input.logo,
      input.thumb
    );

    // Verify token is compact (under 260 characters instead of 600+)
    expect(token.length).toBeLessThan(260);

    const decoded = decodeGuestToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.businessName).toBe('The Taj Hotel');
    expect(decoded?.city).toBe('Mumbai, Maharastra');
    expect(decoded?.googleReviewUrl).toBe(input.url);
    expect(decoded?.businessCategory).toBe('Restaurant & Lounge');
    expect(decoded?.accentColor).toBe('#0B1C30');
    expect(decoded?.logoUrl).toBe(input.logo);
    expect(decoded?.thumbnailUrl).toBe(input.thumb);
  });

  it('decodes legacy uncompressed guest tokens correctly', () => {
    // A legacy token that was encoded with raw full URLs
    const legacyPayload = {
      n: 'Old Cafe',
      c: 'Delhi',
      u: 'https://g.page/r/oldcafe/review',
      cat: 'Cafe',
      a: '#1A73E8',
      l: 'https://example.com/old-logo.png',
      th: 'https://example.com/old-thumb.png',
    };
    const b64 = Buffer.from(JSON.stringify(legacyPayload)).toString('base64url');
    const legacyToken = `guest_${b64}`;

    const decoded = decodeGuestToken(legacyToken);
    expect(decoded).not.toBeNull();
    expect(decoded?.businessName).toBe('Old Cafe');
    expect(decoded?.city).toBe('Delhi');
    expect(decoded?.googleReviewUrl).toBe('https://g.page/r/oldcafe/review');
    expect(decoded?.logoUrl).toBe('https://example.com/old-logo.png');
    expect(decoded?.thumbnailUrl).toBe('https://example.com/old-thumb.png');
  });

  it('rejects guest tokens with invalid or non-HTTPS review URLs', () => {
    const unsafeToken = createGuestToken('Test Venue', 'City', 'javascript:alert(1)', 'Retail');
    const decoded = decodeGuestToken(unsafeToken);
    expect(decoded).toBeNull();
  });
});
