import { NextResponse } from 'next/server';
import { signupSchema } from '@/lib/validation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }

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

    const supabase = await createClient();
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
      return NextResponse.json({ code: 'SIGNUP_FAILED', message: error.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      user: data.user,
      confirmationRequired: !data.session,
    });
  } catch (err) {
    return NextResponse.json(
      { code: 'SERVER_ERROR', message: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
