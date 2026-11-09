import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/authenticated-client';
import { createClient } from '@/lib/supabase/server';
import {
  BusinessRecord,
  isDestinationModeColumnMissing,
  mapQrRecord,
  qrDatabaseFields,
  qrDatabaseFieldsLegacy,
  QrRecord,
} from '@/lib/qr-mapper';
import { qrPatchSchema, safeHttpsUrlSchema } from '@/lib/validation';

const businessFields = 'id, name, city, google_review_url';
const idPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function getOwnerBusiness(
  supabase: SupabaseServerClient,
  userId: string,
  businessId: string
) {
  const { data, error } = await supabase
    .from('businesses')
    .select(businessFields)
    .eq('id', businessId)
    .eq('owner_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to authorize the QR business owner:', error);
    return { business: null, failed: true };
  }
  return { business: data as BusinessRecord | null, failed: false };
}

async function getOwnedQr(
  supabase: SupabaseServerClient,
  userId: string,
  id: string
) {
  const initialResult = await supabase
    .from('qr_codes')
    .select(qrDatabaseFields)
    .eq('id', id)
    .eq('owner_id', userId)
    .maybeSingle();

  let qr = initialResult.data as QrRecord | null;
  let queryError: unknown = initialResult.error;
  let supportsDestinationMode = true;
  if (isDestinationModeColumnMissing(initialResult.error)) {
    supportsDestinationMode = false;
    const legacyResult = await supabase
      .from('qr_codes')
      .select(qrDatabaseFieldsLegacy)
      .eq('id', id)
      .eq('owner_id', userId)
      .maybeSingle();
    qr = legacyResult.data as QrRecord | null;
    queryError = legacyResult.error;
  }

  if (queryError) {
    console.error('Failed to load the authenticated QR design:', queryError);
    return { qr: null, failed: true, supportsDestinationMode };
  }
  return { qr, failed: false, supportsDestinationMode };
}

async function mapOwnedQr(
  supabase: SupabaseServerClient,
  userId: string,
  qr: QrRecord
) {
  const { business, failed } = await getOwnerBusiness(supabase, userId, qr.business_id);
  if (failed || !business) return { qr: null, failed };
  if (!safeHttpsUrlSchema.safeParse(business.google_review_url).success) {
    return { qr: null, failed: true };
  }
  return { qr: mapQrRecord(qr, business), failed: false };
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext): Promise<NextResponse> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!idPattern.test(id)) return NextResponse.json({ code: 'QR_NOT_FOUND' }, { status: 404 });

  const { qr, failed } = await getOwnedQr(auth.supabase, auth.user.id, id);
  if (failed) return NextResponse.json({ code: 'QR_LOAD_FAILED' }, { status: 500 });
  if (!qr) return NextResponse.json({ code: 'QR_NOT_FOUND' }, { status: 404 });

  const mapped = await mapOwnedQr(auth.supabase, auth.user.id, qr);
  if (mapped.failed) return NextResponse.json({ code: 'QR_LOAD_FAILED' }, { status: 500 });
  if (!mapped.qr) return NextResponse.json({ code: 'QR_NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ qr: mapped.qr });
}

export async function PATCH(request: Request, { params }: RouteContext): Promise<NextResponse> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!idPattern.test(id)) return NextResponse.json({ code: 'QR_NOT_FOUND' }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = qrPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await getOwnedQr(auth.supabase, auth.user.id, id);
  if (existing.failed) return NextResponse.json({ code: 'QR_LOAD_FAILED' }, { status: 500 });
  if (!existing.qr) return NextResponse.json({ code: 'QR_NOT_FOUND' }, { status: 404 });
  if (!existing.supportsDestinationMode && parsed.data.destinationMode === 'direct') {
    return NextResponse.json(
      {
        code: 'QR_DESTINATION_MODE_MIGRATION_REQUIRED',
        message: 'Apply the QR destination-mode migration before saving direct QR designs to your account.',
      },
      { status: 503 }
    );
  }

  const patch = {
    ...(parsed.data.placementName !== undefined && { placement_name: parsed.data.placementName }),
    ...(parsed.data.headline !== undefined && { headline: parsed.data.headline }),
    ...(parsed.data.tagline !== undefined && { tagline: parsed.data.tagline }),
    ...(parsed.data.supportingText !== undefined && { supporting_text: parsed.data.supportingText }),
    ...(parsed.data.accentColor !== undefined && { accent_color: parsed.data.accentColor }),
    ...(parsed.data.preset !== undefined && {
      preset: parsed.data.preset,
      template: parsed.data.preset,
    }),
    ...(parsed.data.geometry !== undefined && { geometry: parsed.data.geometry }),
    ...(parsed.data.centerEmblem !== undefined && { center_emblem: parsed.data.centerEmblem }),
    ...(existing.supportsDestinationMode && parsed.data.destinationMode !== undefined && {
      destination_mode: parsed.data.destinationMode,
    }),
    ...(parsed.data.status !== undefined && { status: parsed.data.status }),
    updated_at: new Date().toISOString(),
  };

  let updatedQr: QrRecord | null = null;
  let updateError: unknown = null;
  if (existing.supportsDestinationMode) {
    const updateResult = await auth.supabase
      .from('qr_codes')
      .update(patch)
      .eq('id', id)
      .eq('owner_id', auth.user.id)
      .select(qrDatabaseFields)
      .maybeSingle();
    updatedQr = updateResult.data as QrRecord | null;
    updateError = updateResult.error;
  } else {
    const updateResult = await auth.supabase
      .from('qr_codes')
      .update(patch)
      .eq('id', id)
      .eq('owner_id', auth.user.id)
      .select(qrDatabaseFieldsLegacy)
      .maybeSingle();
    updatedQr = updateResult.data as QrRecord | null;
    updateError = updateResult.error;
  }

  if (updateError) {
    console.error('Failed to update the authenticated QR design:', updateError);
    return NextResponse.json({ code: 'QR_UPDATE_FAILED' }, { status: 500 });
  }
  if (!updatedQr) return NextResponse.json({ code: 'QR_NOT_FOUND' }, { status: 404 });

  const mapped = await mapOwnedQr(auth.supabase, auth.user.id, updatedQr);
  if (mapped.failed) return NextResponse.json({ code: 'QR_UPDATE_FAILED' }, { status: 500 });
  if (!mapped.qr) return NextResponse.json({ code: 'QR_NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ qr: mapped.qr });
}

export async function DELETE(_request: Request, { params }: RouteContext): Promise<NextResponse> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!idPattern.test(id)) return NextResponse.json({ code: 'QR_NOT_FOUND' }, { status: 404 });

  const { data, error } = await auth.supabase
    .from('qr_codes')
    .delete()
    .eq('id', id)
    .eq('owner_id', auth.user.id)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Failed to delete the authenticated QR design:', error);
    return NextResponse.json({ code: 'QR_DELETE_FAILED' }, { status: 500 });
  }
  if (!data) return NextResponse.json({ code: 'QR_NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
