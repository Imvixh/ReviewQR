import { NextResponse } from 'next/server';
import { signupSchema } from '@/lib/validation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Form validation failed', errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password, fullName, businessName } = parsed.data;

    if (isSupabaseConfigured) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            business_name: businessName,
          },
        },
      });

      if (error) {
        return NextResponse.json(
          { code: 'SIGNUP_FAILED', message: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({ ok: true, user: data.user });
    }

    // Local / development mode fallback
    return NextResponse.json({
      ok: true,
      user: {
        id: 'usr_' + Date.now(),
        email,
        displayName: fullName,
        businessName,
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

