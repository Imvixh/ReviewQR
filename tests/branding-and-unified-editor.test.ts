import { describe, it, expect } from 'vitest';
import { saveOrgLogo, saveOrgThumbnail, saveQRCode, getStoredOrg, getStoredQRCodes } from '../src/lib/data-store';

describe('QR Studio local data helpers', () => {
  it('starts without seeded organization or QR data', () => {
    expect(getStoredOrg().name).toBe('');
    expect(getStoredOrg().logoUrl).toBeUndefined();
    expect(getStoredOrg().thumbnailUrl).toBeUndefined();
    expect(getStoredQRCodes()).toEqual([]);
  });

  it('returns updated organization logo state', () => {
    const newLogo = 'https://custom-domain.com/assets/new_logo.png';
    const updated = saveOrgLogo(newLogo, 'business-test/logo_123.png');
    expect(updated.logoUrl).toBe(newLogo);
    expect(updated.logoPath).toBe('business-test/logo_123.png');
  });

  it('returns updated organization cover thumbnail state', () => {
    const newThumb = 'https://custom-domain.com/assets/new_cover.jpg';
    const updated = saveOrgThumbnail(newThumb, 'business-test/thumb_123.jpg');
    expect(updated.thumbnailUrl).toBe(newThumb);
    expect(updated.thumbnailPath).toBe('business-test/thumb_123.jpg');
  });

  it('constructs QR design state with geometry and preset properties', () => {
    const qrData = {
      orgId: 'business-test',
      slug: 'dining-t1-test',
      businessName: 'Test Cafe',
      destinationUrl: 'https://maps.google.com/?q=Test+Cafe',
      placementName: 'Table Tent — Dining 1',
      placementType: 'Table Tent — Dining 1',
      headline: 'Review us on Google',
      tagline: 'Scan to share your experience',
      accentColor: '#34A853',
      currentTemplate: 'google-classic',
      preset: 'google-classic',
      geometry: 'rounded' as const,
      centerEmblem: 'google-g' as const,
      supportingText: 'Your feedback helps us improve.',
      status: 'active' as const,
    };

    const saved = saveQRCode(qrData);
    expect(saved.id).toBeDefined();
    expect(saved.preset).toBe('google-classic');
    expect(saved.geometry).toBe('rounded');
    expect(saved.centerEmblem).toBe('google-g');
    expect(saved.supportingText).toBe('Your feedback helps us improve.');
    expect(saved.accentColor).toBe('#34A853');
  });

  it('does not invent a placement name when saving an unlabeled QR design', () => {
    const saved = saveQRCode({
      orgId: 'business-test',
      slug: 'review-poster',
      businessName: 'Test Cafe',
      status: 'draft',
    });

    expect(saved.placementName).toBeUndefined();
    expect(saved.placementType).toBeUndefined();
  });
});
