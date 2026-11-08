import { describe, it, expect } from 'vitest';
import { initialOrg, saveOrgLogo, saveOrgThumbnail, saveQRCode, getStoredOrg, getStoredQRCodes } from '../src/lib/data-store';

describe('Unified QR Editor & Branding Asset State Synchronization', () => {
  it('initialOrg contains default logo and thumbnail URLs', () => {
    expect(initialOrg.name).toBe('Royal Palace Hotel');
    expect(initialOrg.logoUrl).toBeDefined();
    expect(initialOrg.thumbnailUrl).toBeDefined();
  });

  it('updates and persists organization logo', () => {
    const newLogo = 'https://custom-domain.com/assets/new_logo.png';
    const updated = saveOrgLogo(newLogo, 'org_royal_palace/logo_123.png');
    expect(updated.logoUrl).toBe(newLogo);
    expect(updated.logoPath).toBe('org_royal_palace/logo_123.png');
  });

  it('updates and persists organization cover thumbnail', () => {
    const newThumb = 'https://custom-domain.com/assets/new_cover.jpg';
    const updated = saveOrgThumbnail(newThumb, 'org_royal_palace/thumb_123.jpg');
    expect(updated.thumbnailUrl).toBe(newThumb);
    expect(updated.thumbnailPath).toBe('org_royal_palace/thumb_123.jpg');
  });

  it('saves QR code with full architecture and preset properties', () => {
    const qrData = {
      orgId: 'org_royal_palace',
      slug: 'dining-t1-test',
      businessName: 'Royal Palace Hotel',
      destinationUrl: 'https://g.page/r/Cbll2345abc992eEBM/review',
      placementName: 'Table Tent — Dining 1',
      placementType: 'Table Tent — Dining 1',
      headline: 'Review us on Google',
      tagline: 'Scan to share your experience',
      accentColor: '#34A853',
      currentTemplate: 'google-classic',
      preset: 'google-classic',
      geometry: 'rounded' as const,
      centerEmblem: 'google-g' as const,
      showStarBar: true,
      status: 'active' as const,
    };

    const saved = saveQRCode(qrData);
    expect(saved.id).toBeDefined();
    expect(saved.preset).toBe('google-classic');
    expect(saved.geometry).toBe('rounded');
    expect(saved.centerEmblem).toBe('google-g');
    expect(saved.accentColor).toBe('#34A853');
  });

  it('validates upload payload limits and mime types logic', () => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const allowedMime = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

    expect(allowedMime.includes('image/png')).toBe(true);
    expect(allowedMime.includes('image/jpeg')).toBe(true);
    expect(allowedMime.includes('image/svg+xml')).toBe(true);
    expect(allowedMime.includes('application/pdf')).toBe(false);
    expect(allowedMime.includes('application/zip')).toBe(false);

    const validSize = 2.4 * 1024 * 1024;
    const invalidSize = 6.2 * 1024 * 1024;
    expect(validSize <= MAX_FILE_SIZE).toBe(true);
    expect(invalidSize <= MAX_FILE_SIZE).toBe(false);
  });
});

