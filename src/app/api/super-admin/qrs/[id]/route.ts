import { NextRequest, NextResponse } from 'next/server';
import { getSuperAdminAuthContext } from '@/lib/auth/super-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const auth = await getSuperAdminAuthContext();
  if (!auth.ok) {
    return NextResponse.json({ code: 'UNAUTHORIZED', error: 'Super Admin access required.' }, { status: 403 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ code: 'ID_REQUIRED', error: 'QR Code ID is required.' }, { status: 400 });
  }

  let body: {
    status?: 'active' | 'archived' | 'draft';
    subscriptionStatus?: 'active' | 'trial' | 'expired' | 'suspended' | 'lifetime';
    revoke?: boolean;
    businessName?: string;
    city?: string;
    googleReviewUrl?: string;
    category?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: 'INVALID_JSON', error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    const admin = createAdminClient();

    // 1. Look up QR code
    const { data: qr, error: findError } = await admin
      .from('qr_codes')
      .select('id, token, business_id, status')
      .eq('id', id)
      .maybeSingle();

    if (findError || !qr) {
      return NextResponse.json({ code: 'QR_NOT_FOUND', error: 'QR code not found.' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // 2. Handle Revoke action: instantly archive status
    if (body.revoke) {
      updates.status = 'archived';
    } else if (body.status) {
      updates.status = body.status;
    } else if (body.subscriptionStatus) {
      if (body.subscriptionStatus === 'expired' || body.subscriptionStatus === 'suspended') {
        updates.status = 'archived';
      } else if (body.subscriptionStatus === 'active' || body.subscriptionStatus === 'trial' || body.subscriptionStatus === 'lifetime') {
        updates.status = 'active';
      }
    }

    const { error: updateQrError } = await admin
      .from('qr_codes')
      .update(updates)
      .eq('id', id);

    if (updateQrError) {
      console.error('Failed to update QR code:', updateQrError);
      return NextResponse.json({ code: 'UPDATE_FAILED', error: updateQrError.message }, { status: 500 });
    }

    // 3. Update business details if provided
    if (qr.business_id && (body.businessName || body.city || body.googleReviewUrl || body.category)) {
      const bizUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (body.businessName) bizUpdates.name = body.businessName.trim();
      if (body.city !== undefined) bizUpdates.city = body.city.trim();
      if (body.category) bizUpdates.category = body.category.trim();
      if (body.googleReviewUrl) bizUpdates.google_review_url = body.googleReviewUrl.trim();

      await admin.from('businesses').update(bizUpdates).eq('id', qr.business_id);
    }

    return NextResponse.json({
      ok: true,
      id,
      status: updates.status || qr.status,
      subscriptionStatus: body.subscriptionStatus || (updates.status === 'active' ? 'active' : 'expired'),
      revoked: body.revoke === true,
    });
  } catch (error) {
    console.error('Unexpected error in PATCH QR:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const auth = await getSuperAdminAuthContext();
  if (!auth.ok) {
    return NextResponse.json({ code: 'UNAUTHORIZED', error: 'Super Admin access required.' }, { status: 403 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ code: 'ID_REQUIRED', error: 'QR Code ID is required.' }, { status: 400 });
  }

  try {
    const admin = createAdminClient();

    const { error: deleteError } = await admin
      .from('qr_codes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete QR code:', deleteError);
      return NextResponse.json({ code: 'DELETE_FAILED', error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, deletedId: id });
  } catch (error) {
    console.error('Unexpected error in DELETE QR:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
