import { describe, expect, it } from 'vitest';
import {
  categorySelectionForSavedValue,
  resolveBusinessCategory,
} from '../src/lib/business-category';
import { reviewDestinationSchema, reviewSuggestionsSchema } from '../src/lib/validation';

describe('business category selection', () => {
  it('resolves standard categories without creating duplicate casing variants', () => {
    expect(resolveBusinessCategory('hotel', '')).toEqual({ category: 'Hotel' });
  });

  it('requires a value after selecting Other and accepts a custom category', () => {
    expect(resolveBusinessCategory('Other', '').error).toBeTruthy();
    expect(resolveBusinessCategory('Other', 'Boutique Stay')).toEqual({ category: 'Boutique Stay' });
  });

  it('restores a saved custom category as Other with its value', () => {
    expect(categorySelectionForSavedValue('Boutique Stay')).toEqual({
      selection: 'Other',
      customCategory: 'Boutique Stay',
    });
  });

  it('validates optional hotel subcategories and rejects category conflicts', () => {
    const base = {
      destinationUrl: 'https://g.page/example/review',
      confirmed: true,
      businessName: 'Example',
      city: 'Bettiah',
    };

    expect(reviewDestinationSchema.safeParse({
      ...base,
      category: 'Hotel',
      subcategory: 'Accommodation',
    }).success).toBe(true);
    expect(reviewDestinationSchema.safeParse({
      ...base,
      category: 'Cafe',
      subcategory: 'Dining',
    }).success).toBe(false);
    expect(reviewDestinationSchema.safeParse({ ...base, category: 'Other' }).success).toBe(false);
  });

  it('requires a public token, rating, language, and actual customer feedback for suggestions', () => {
    const valid = {
      token: 'public_qr_token_1234567890',
      rating: 1,
      language: 'en',
      experience: 'The staff helped us find the entrance.',
    };
    for (const rating of [1, 2, 3, 4, 5]) {
      expect(reviewSuggestionsSchema.safeParse({ ...valid, rating }).success).toBe(true);
    }
    expect(reviewSuggestionsSchema.safeParse({ ...valid, rating: 6 }).success).toBe(false);
    expect(reviewSuggestionsSchema.safeParse({ ...valid, experience: ' ' }).success).toBe(false);
    expect(reviewSuggestionsSchema.safeParse({ ...valid, language: 'fr' }).success).toBe(false);
  });
});
