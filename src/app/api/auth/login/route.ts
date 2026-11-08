import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export async function POST(request: Request) {
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

    if (isSupabaseConfigured) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json(
          { code: 'AUTH_FAILED', message: error.message },
          { status: 401 }
        );
      }

      return NextResponse.json({ ok: true, user: data.user, session: data.session });
    }

    // Local / development mode fallback
    return NextResponse.json({
      ok: true,
      user: {
        id: 'usr_rajesh_kumar',
        email,
        displayName: 'Rajesh Kumar',
        orgId: 'org_royal_palace',
        role: 'admin',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { code: 'SERVER_ERROR', message: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

