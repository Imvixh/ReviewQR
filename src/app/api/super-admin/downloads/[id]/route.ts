import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSuperAdminAuthContext } from '@/lib/auth/super-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';

type RouteContext = { params: Promise<{ id: string }> };
const updateSchema = z.object({
  qrName: z.string().trim().min(1).max(120).optional(),
  businessName: z.string().trim().min(1).max(120).optional(),
  businessCity: z.string().trim().max(100).optional(),
  template: z.string().regex(/^[a-z0-9-]{1,60}$/).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, 'At least one metadata field is required.');

export async function PATCH(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const auth = await getSuperAdminAuthContext();
  if (!auth.ok) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 403 });
  if (!isSupabaseConfigured) return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });

  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ code: 'DOWNLOAD_NOT_FOUND' }, { status: 404 });
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ code: 'INVALID_JSON' }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ code: 'VALIDATION_ERROR', errors: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: updated, error: updateError } = await admin.rpc('update_admin_qr_download_metadata', {
    p_id: id,
    p_admin_user_id: auth.user.id,
    p_changes: parsed.data,
  });
  if (updateError) {
    console.error('Failed to edit QR download metadata and record its audit:', updateError);
    return NextResponse.json({ code: 'UPDATE_FAILED' }, { status: 500 });
  }
  if (!updated) return NextResponse.json({ code: 'DOWNLOAD_NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
