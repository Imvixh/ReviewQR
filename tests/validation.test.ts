import { describe, it, expect } from 'vitest';
import {
  signupSchema,
  loginSchema,
  qrCreateSchema,
  qrDesignSchema,
  qrPatchSchema,
  settingsPasswordSchema,
} from '../src/lib/validation';

describe('Validation Schemas', () => {
  it('validates a correct signup payload', () => {
    const valid = {
      fullName: 'Rajesh Kumar',
      businessName: 'Royal Palace Hotel',
      email: 'manager@royalpalace.in',
      password: 'RoyalReview#2026',
    };
    const res = signupSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('accepts a valid personal email address for signup', () => {
    const res = signupSchema.safeParse({
      fullName: 'ReviewQR Test User',
      businessName: 'Test Business',
      email: 'reviewqr.test@gmail.com',
      password: 'StrongPass#2026',
    });

    expect(res.success).toBe(true);
  });

  it('rejects signup with weak password', () => {
    const invalid = {
      fullName: 'Rajesh Kumar',
      businessName: 'Royal Palace Hotel',
      email: 'manager@royalpalace.in',
      password: 'weak',
    };
    const res = signupSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('validates a correct login payload', () => {
    const valid = {
      email: 'manager@royalpalace.in',
      password: 'password123',
    };
    const res = loginSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates QR creation with valid Google link and hex color', () => {
    const valid = {
      businessName: 'Royal Palace Hotel',
      category: 'Restaurant & Lounge',
      city: 'Bettiah, Bihar',
      destinationUrl: 'https://www.google.com/maps/place/example-business/reviews',
      placementType: 'Table Tent — Dining 1',
      headline: 'Review us on Google',
      tagline: 'Point phone camera & tap',
      accentColor: '#1A73E8',
      template: 'classic-acrylic',
    };
    const res = qrCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('defaults new QR designs to guided mode and accepts explicit direct mode', () => {
    const validDesign = {
      placementName: 'Front counter',
      headline: 'Review us on Google',
      tagline: 'Scan to share your experience',
      supportingText: '',
      accentColor: '#1A73E8',
      preset: 'google-classic',
      geometry: 'rounded',
      centerEmblem: 'google-g',
    };

    expect(qrDesignSchema.parse(validDesign).destinationMode).toBe('guided');
    expect(qrDesignSchema.parse({ ...validDesign, destinationMode: 'direct' }).destinationMode).toBe('direct');
    expect(qrPatchSchema.safeParse({ destinationMode: 'direct' }).success).toBe(true);
    expect(qrPatchSchema.safeParse({ destinationMode: 'unknown' }).success).toBe(false);
  });

  it('accepts HTTPS review links with unfamiliar URL paths', () => {
    const invalid = {
      businessName: 'Royal Palace Hotel',
      category: 'Restaurant & Lounge',
      city: 'Bettiah, Bihar',
      destinationUrl: 'https://www.google.com/business/reviews/custom-path',
      placementType: 'Table Tent',
      headline: 'Review us on Google',
      accentColor: '#1A73E8',
      template: 'classic-acrylic',
    };
    const res = qrCreateSchema.safeParse(invalid);
    expect(res.success).toBe(true);
  });

  it('rejects unsafe review destination schemes', () => {
    const invalid = {
      businessName: 'Royal Palace Hotel',
      category: 'Restaurant & Lounge',
      city: 'Bettiah, Bihar',
      destinationUrl: 'javascript:alert(1)',
      placementType: 'Table Tent',
      headline: 'Review us on Google',
      accentColor: '#1A73E8',
      template: 'classic-acrylic',
    };

    expect(qrCreateSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates password update security requirements', () => {
    const valid = {
      current: 'oldpass123',
      next: 'NewSecurePass#2026',
    };
    const res = settingsPasswordSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });
});
