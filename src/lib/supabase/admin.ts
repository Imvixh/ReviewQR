import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from './env';

export function createAdminClient() {
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SECRET_KEY is not configured on the server.');
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl;

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}


