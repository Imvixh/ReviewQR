import { createBrowserClient } from '@supabase/ssr';
import {
  isSupabaseConfigured,
  supabasePublishableKey,
  supabaseUrl,
} from './env';

export function createClient() {
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}

export { isSupabaseConfigured };
