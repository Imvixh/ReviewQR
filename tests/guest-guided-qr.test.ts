import { describe, expect, it } from 'vitest';
import { safeHttpsUrlSchema } from '../src/lib/validation';

describe('Guest Guided QR Token & Review Assistant Flow', () => {
  const createGuestToken = (name: string, city: string, url: string, cat?: string, accent?: string) => {
    try {
      const payload = {
        n: name.trim() || 'Business',
        c: city.trim(),
        u: url.trim(),
        cat: cat || '',
        a: accent || '#1A73E8',
      };
      const json = JSON.stringify(payload);
      const b64 = btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      return `guest_${b64}`;
    } catch {
      return '';
    }
  };

  const decodeGuestToken = (token: string) => {
    if (!token.startsWith('guest_')) return null;
    try {
      const raw = token.slice(6).replace(/-/g, '+').replace(/_/g, '/');
      const padded = raw.padEnd(raw.length + ((4 - (raw.length % 4)) % 4), '=');
      const jsonStr = decodeURIComponent(escape(atob(padded)));
      const payload = JSON.parse(jsonStr);
      if (payload.u && safeHttpsUrlSchema.safeParse(payload.u).success) {
        return {
          businessName: payload.n || 'Business',
          city: payload.c || '',
          googleReviewUrl: payload.u,
          businessCategory: payload.cat || 'Business',
          businessSubcategory: '',
          headline: 'Review us on Google',
          tagline: 'Scan to share your experience',
          supportingText: '',
          accentColor: payload.a || '#1A73E8',
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  it('encodes and decodes guest business info with complete fidelity', () => {
    const input = {
      name: 'Chacha Bhatija Restaurant',
      city: 'Ara, Bhojpur',
      url: 'https://g.page/r/example/review',
      cat: 'Restaurant',
      accent: '#1A73E8',
    };

    const token = createGuestToken(input.name, input.city, input.url, input.cat, input.accent);
    expect(token).toMatch(/^guest_[A-Za-z0-9_-]+$/);

    const decoded = decodeGuestToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.businessName).toBe('Chacha Bhatija Restaurant');
    expect(decoded?.city).toBe('Ara, Bhojpur');
    expect(decoded?.googleReviewUrl).toBe('https://g.page/r/example/review');
    expect(decoded?.businessCategory).toBe('Restaurant');
    expect(decoded?.accentColor).toBe('#1A73E8');
  });

  it('rejects guest tokens with invalid or non-HTTPS review URLs', () => {
    const unsafeToken = createGuestToken('Test Venue', 'City', 'javascript:alert(1)', 'Retail');
    const decoded = decodeGuestToken(unsafeToken);
    expect(decoded).toBeNull();
  });
});
