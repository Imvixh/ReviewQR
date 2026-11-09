export const BUSINESS_CATEGORIES = [
  'Hotel',
  'Restaurant',
  'Cafe',
  'Banquet Hall',
  'Salon and Spa',
  'Clinic',
  'Retail Store',
  'Education',
  'Travel and Tourism',
  'Restaurant & Lounge',
  'Other',
] as const;

export const HOTEL_SUBCATEGORIES = ['Accommodation', 'Dining', 'Banquet Services'] as const;

export interface BusinessCategoryResult {
  category: string;
  error?: string;
}

export function resolveBusinessCategory(
  selection: string,
  customCategory: string
): BusinessCategoryResult {
  const selected = selection.trim();
  const rawCategory = selected.toLowerCase() === 'other' ? customCategory.trim() : selected;

  if (!rawCategory) return { category: '', error: 'Select or enter a business category.' };
  if (rawCategory.length > 80 || /[\u0000-\u001f\u007f]/.test(rawCategory)) {
    return { category: '', error: 'Business category must be 80 characters or fewer.' };
  }
  if (rawCategory.toLowerCase() === 'other') {
    return { category: '', error: 'Enter a custom category instead of choosing Other.' };
  }

  const canonicalCategory = BUSINESS_CATEGORIES.find(
    (category) => category.toLowerCase() === rawCategory.toLowerCase() && category !== 'Other'
  );
  return { category: canonicalCategory || rawCategory };
}

export function categorySelectionForSavedValue(value: string | null | undefined): {
  selection: string;
  customCategory: string;
} {
  const saved = value?.trim() || '';
  if (!saved) return { selection: '', customCategory: '' };

  const canonicalCategory = BUSINESS_CATEGORIES.find(
    (category) => category.toLowerCase() === saved.toLowerCase() && category !== 'Other'
  );
  return canonicalCategory
    ? { selection: canonicalCategory, customCategory: '' }
    : { selection: 'Other', customCategory: saved };
}
