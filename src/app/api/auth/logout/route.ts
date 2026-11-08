import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export async function POST() {
  if (isSupabaseConfigured) {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  return NextResponse.json({ ok: true });
}

