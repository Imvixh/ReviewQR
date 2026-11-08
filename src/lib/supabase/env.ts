const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const configuredKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseUrl = configuredUrl || 'https://placeholder.supabase.co';
export const supabasePublishableKey = configuredKey || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  configuredUrl &&
    configuredKey &&
    configuredUrl !== 'https://placeholder.supabase.co'
);
