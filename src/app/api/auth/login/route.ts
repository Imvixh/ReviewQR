import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Invalid email or password format', errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json(
        { code: 'AUTH_FAILED', message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true, user: data.user });
  } catch (err) {
    return NextResponse.json(
      { code: 'SERVER_ERROR', message: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
