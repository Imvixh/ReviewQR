import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createClient } from './server';
import { isSupabaseConfigured } from './env';

export type AuthenticatedClientResult =
  | { ok: false; response: NextResponse }
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; user: User };

export async function getAuthenticatedClient(): Promise<AuthenticatedClientResult> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      response: NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 }),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return {
      ok: false,
      response: NextResponse.json({ code: 'UNAUTHENTICATED' }, { status: 401 }),
    };
  }

  return { ok: true, supabase, user: data.user };
}
