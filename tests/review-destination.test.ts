import { describe, expect, it } from 'vitest';
import { buildGoogleMapsSearchUrl, validateReviewDestination } from '../src/lib/review-destination';

describe('Review destination helpers', () => {
  it('builds a safely encoded Google Maps search URL', () => {
    const url = buildGoogleMapsSearchUrl('Cafe & Bakery', 'Bettiah, Bihar');

    expect(url).toBe(
      'https://www.google.com/maps/search/?api=1&query=Cafe%20%26%20Bakery%20Bettiah%2C%20Bihar'
    );
    expect(url && new URL(url).searchParams.get('query')).toBe('Cafe & Bakery Bettiah, Bihar');
  });

  it('requires both a business name and a location for Maps search', () => {
    expect(buildGoogleMapsSearchUrl('', 'Bettiah')).toBeNull();
    expect(buildGoogleMapsSearchUrl('Cafe', '  ')).toBeNull();
  });

  it('accepts a pasted HTTPS Google review or Maps URL without assuming its path', () => {
    const result = validateReviewDestination('https://www.google.com/maps/place/Example+Cafe');

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.isGoogleHosted).toBe(true);
      expect(result.message).toContain('cannot verify');
    }
  });

  it('accepts unfamiliar HTTPS URLs for explicit user confirmation', () => {
    const result = validateReviewDestination('https://reviews.example.org/business');

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.isGoogleHosted).toBe(false);
      expect(result.message).toContain('cannot verify');
    }
  });

  it('does not classify a hostname that merely contains the word google as Google-hosted', () => {
    const result = validateReviewDestination('https://google.example.org/reviews');

    expect(result.valid).toBe(true);
    if (result.valid) expect(result.isGoogleHosted).toBe(false);
  });

  it.each([
    '',
    'not a URL',
    'http://www.google.com/maps',
    'javascript:alert(1)',
    'https://user:password@example.org/reviews',
  ])('rejects unsafe or invalid destination URL %s', (url) => {
    expect(validateReviewDestination(url).valid).toBe(false);
  });
});
