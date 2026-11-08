/**
 * Shared validation schemas used across server API routes.
 * Applied server-side before any persistence.
 */
import { z } from 'zod';

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
  destinationUrl: z.string().url().regex(/g\.page\/r\/|google\.com\/maps/, 'Valid Google review link required'),
  placementType: z.string().min(1),
  headline: z.string().min(1),
  tagline: z.string().max(100).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  template: z.string().min(1),
});

export const qrPatchSchema = z.object({
  status: z.enum(['draft', 'active', 'archived']).optional(),
  headline: z.string().min(1).optional(),
  tagline: z.string().max(100).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  destinationUrl: z.string().url().optional(),
  template: z.string().min(1).optional(),
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
  token: z.string().min(1),
});

export const clickSchema = z.object({
  token: z.string().min(1),
  dest: z.enum(['google']),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OrgPatchInput = z.infer<typeof orgPatchSchema>;
export type QrCreateInput = z.infer<typeof qrCreateSchema>;
export type QrPatchInput = z.infer<typeof qrPatchSchema>;
export type SettingsProfileInput = z.infer<typeof settingsProfileSchema>;
export type SettingsPasswordInput = z.infer<typeof settingsPasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type ScanInput = z.infer<typeof scanSchema>;
export type ClickInput = z.infer<typeof clickSchema>;
