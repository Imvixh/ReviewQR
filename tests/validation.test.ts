import { describe, it, expect } from 'vitest';
import { signupSchema, loginSchema, qrCreateSchema, settingsPasswordSchema } from '../src/lib/validation';

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
      destinationUrl: 'https://g.page/r/Cbll2345abc992eEBM/review',
      placementType: 'Table Tent — Dining 1',
      headline: 'Review us on Google',
      tagline: 'Point phone camera & tap',
      accentColor: '#1A73E8',
      template: 'classic-acrylic',
    };
    const res = qrCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects QR creation with invalid Google destination link', () => {
    const invalid = {
      businessName: 'Royal Palace Hotel',
      category: 'Restaurant & Lounge',
      city: 'Bettiah, Bihar',
      destinationUrl: 'https://example.com/untrusted',
      placementType: 'Table Tent',
      headline: 'Review us on Google',
      accentColor: '#1A73E8',
      template: 'classic-acrylic',
    };
    const res = qrCreateSchema.safeParse(invalid);
    expect(res.success).toBe(false);
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

