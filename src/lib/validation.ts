/**
 * Shared validation schemas used across server API routes.
 * Applied server-side before any persistence.
 */
import { z } from 'zod';
import { BUSINESS_CATEGORIES } from './business-category';

const businessCategorySchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .refine((value) => !/[\u0000-\u001f\u007f]/.test(value), 'Category contains invalid characters')
  .refine((value) => value.toLowerCase() !== 'other', 'Enter a custom category for Other')
  .transform((value) =>
    BUSINESS_CATEGORIES.find(
      (category) => category !== 'Other' && category.toLowerCase() === value.toLowerCase()
    ) || value
  );

export const signupSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[a-z]/, 'Include a lowercase letter')
    .regex(/[0-9]/, 'Include a number')
    .regex(/[^A-Za-z0-9\s]/, 'Include special punctuation'),
  fullName: z.string().min(1, 'Full name is required'),
  businessName: z.string().min(1, 'Business name is required'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const safeHttpsUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
    } catch {
      return false;
    }
  }, 'Enter a safe HTTPS URL');

export const orgPatchSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email().optional(),
  address: z.string().optional().or(z.literal('')),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  tagline: z.string().max(100).optional(),
});

export const qrCreateSchema = z.object({
  businessName: z.string().min(1),
  category: z.string().min(1),
  city: z.string().min(1),
  destinationUrl: safeHttpsUrlSchema,
  placementType: z.string().min(1),
  headline: z.string().min(1),
  tagline: z.string().max(100).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  template: z.string().min(1),
});

export const qrPatchSchema = z.object({
  status: z.enum(['draft', 'active', 'archived']).optional(),
  placementName: z.string().trim().min(1).max(120).optional(),
  headline: z.string().trim().min(1).max(100).optional(),
  tagline: z.string().trim().max(120).optional(),
  supportingText: z.string().trim().max(180).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  preset: z.string().regex(/^[a-z0-9-]{1,60}$/).optional(),
  geometry: z.enum(['classic', 'rounded', 'dots', 'premium-eye']).optional(),
  centerEmblem: z.enum(['google-g', 'business-logo']).optional(),
  destinationMode: z.enum(['direct', 'guided']).optional(),
}).refine((value) => Object.keys(value).length > 0, 'At least one QR field is required');

export const qrDesignSchema = z.object({
  placementName: z.string().trim().min(1).max(120),
  headline: z.string().trim().min(1).max(100),
  tagline: z.string().trim().max(120).default('Scan to share your experience'),
  supportingText: z.string().trim().max(180).default(''),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  preset: z.string().regex(/^[a-z0-9-]{1,60}$/),
  geometry: z.enum(['classic', 'rounded', 'dots', 'premium-eye']),
  centerEmblem: z.enum(['google-g', 'business-logo']),
  destinationMode: z.enum(['direct', 'guided']).default('guided'),
  businessId: z.string().uuid().optional(),
});

export const reviewDestinationSchema = z.object({
  destinationUrl: safeHttpsUrlSchema,
  confirmed: z.literal(true, { error: 'Confirm that this is the correct business review destination' }),
  businessName: z.string().trim().max(120).optional().default(''),
  city: z.string().trim().max(120).optional().default(''),
  category: businessCategorySchema.optional(),
  subcategory: z.enum(['Accommodation', 'Dining', 'Banquet Services']).or(z.literal('')).optional(),
  businessId: z.string().uuid().optional(),
  createNewBusiness: z.boolean().optional(),
}).superRefine((value, context) => {
  if (value.subcategory && value.category && value.category !== 'Hotel') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['subcategory'],
      message: 'Hotel subcategories can only be used with the Hotel category.',
    });
  }
});

export const reviewSuggestionsSchema = z.object({
  token: z.string().trim().min(20).max(128).regex(/^[A-Za-z0-9_-]+$/),
  rating: z.number().int().min(1).max(5),
  language: z.enum(['en', 'hi']),
  experience: z.string().trim().min(1).max(300),
  filter: z.string().trim().max(50).optional(),
});

export const settingsProfileSchema = z.object({
  fullName: z.string().min(1),
  role: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal('')),
  language: z.string().default('en'),
});

export const settingsPasswordSchema = z.object({
  current: z.string().min(1),
  next: z
    .string()
    .min(10, 'New password must be at least 10 characters')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[a-z]/, 'Include a lowercase letter')
    .regex(/[0-9]/, 'Include a number')
    .regex(/[^A-Za-z0-9\s]/, 'Include special punctuation'),
});

export const deleteAccountSchema = z.object({
  confirm: z.string().min(1),
});

export const scanSchema = z.object({
  token: z.string().trim().min(20).max(128).regex(/^[A-Za-z0-9_-]+$/),
});

export const clickSchema = z.object({
  token: z.string().trim().min(20).max(128).regex(/^[A-Za-z0-9_-]+$/),
});

export const publicQrTokenSchema = scanSchema;

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OrgPatchInput = z.infer<typeof orgPatchSchema>;
export type QrCreateInput = z.infer<typeof qrCreateSchema>;
export type QrPatchInput = z.infer<typeof qrPatchSchema>;
export type QrDesignInput = z.infer<typeof qrDesignSchema>;
export type ReviewDestinationInput = z.infer<typeof reviewDestinationSchema>;
export type ReviewSuggestionsInput = z.infer<typeof reviewSuggestionsSchema>;
export type SettingsProfileInput = z.infer<typeof settingsProfileSchema>;
export type SettingsPasswordInput = z.infer<typeof settingsPasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type ScanInput = z.infer<typeof scanSchema>;
export type ClickInput = z.infer<typeof clickSchema>;
