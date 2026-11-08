import { createClient } from '@supabase/supabase-js';
import {
  isSupabaseConfigured,
  supabasePublishableKey,
  supabaseUrl,
} from './supabase/env';

export { isSupabaseConfigured };

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type SupabaseClient = ReturnType<typeof createClient>;

export function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const REQUIRED_ENV_VARS = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'];

export function verifyEnv(): { ok: boolean; missing: string[] } {
  const missing = REQUIRED_ENV_VARS.filter((key) => {
    if (key === 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') {
      return !(
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
    }
    return !process.env[key];
  });
  return { ok: missing.length === 0, missing };
}
