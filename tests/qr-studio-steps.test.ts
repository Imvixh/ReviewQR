import { describe, expect, it } from 'vitest';
import {
  canOpenQrStudioStep,
  isBrandingStepReady,
  isCopyStepReady,
  isQrStudioStepComplete,
  type CurrentQrStudioStepSignatures,
  type QrStudioStepSignatures,
} from '../src/lib/qr-studio-steps';

const current: CurrentQrStudioStepSignatures = {
  branding: 'brand-a',
  qrstyle: 'style-a',
  templates: 'template-a',
  copy: 'copy-a',
};

describe('QR Studio sequential steps', () => {
  it('keeps future steps locked until each previous step is completed', () => {
    const completed: QrStudioStepSignatures = {};
    expect(canOpenQrStudioStep('branding', completed, current)).toBe(true);
    expect(canOpenQrStudioStep('qrstyle', completed, current)).toBe(false);

    completed.branding = current.branding;
    expect(canOpenQrStudioStep('qrstyle', completed, current)).toBe(true);
    expect(canOpenQrStudioStep('templates', completed, current)).toBe(false);

    completed.qrstyle = current.qrstyle;
    expect(canOpenQrStudioStep('templates', completed, current)).toBe(true);
    expect(canOpenQrStudioStep('copy', completed, current)).toBe(false);

    completed.templates = current.templates;
    expect(canOpenQrStudioStep('copy', completed, current)).toBe(true);
  });

  it('invalidates a completed step if its saved values change', () => {
    const completed: QrStudioStepSignatures = { branding: 'brand-a' };
    const changed = { ...current, branding: 'brand-b' };

    expect(isQrStudioStepComplete('branding', completed, changed)).toBe(false);
    expect(canOpenQrStudioStep('qrstyle', completed, changed)).toBe(false);
  });

  it('requires business identity, a valid destination, and owner confirmation', () => {
    expect(isBrandingStepReady({
      businessName: 'Cafe',
      location: 'Delhi',
      categoryValid: true,
      destinationValid: true,
      destinationConfirmed: true,
    })).toBe(true);
    expect(isBrandingStepReady({
      businessName: ' ',
      location: 'Delhi',
      categoryValid: true,
      destinationValid: true,
      destinationConfirmed: true,
    })).toBe(false);
    expect(isBrandingStepReady({
      businessName: 'Cafe',
      location: 'Delhi',
      categoryValid: true,
      destinationValid: true,
      destinationConfirmed: false,
    })).toBe(false);
  });

  it('requires headline and call-to-action text for the Copy step', () => {
    expect(isCopyStepReady('Review us on Google', 'Scan to share your experience')).toBe(true);
    expect(isCopyStepReady(' ', 'Scan to share your experience')).toBe(false);
    expect(isCopyStepReady('Review us on Google', ' ')).toBe(false);
  });
});
