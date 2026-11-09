import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/authenticated-client';
import { qrDesignSchema, safeHttpsUrlSchema } from '@/lib/validation';
import {
  BusinessRecord,
  isDestinationModeColumnMissing,
  mapQrRecord,
  qrDatabaseFields,
  qrDatabaseFieldsLegacy,
  QrRecord,
} from '@/lib/qr-mapper';

const businessFields = 'id, name, city, google_review_url';

export async function GET(): Promise<NextResponse> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth.response;

  const { data: business, error: businessError } = await auth.supabase
    .from('businesses')
    .select(businessFields)
    .eq('owner_id', auth.user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (businessError) {
    console.error('Failed to load the authenticated business for QR listing:', businessError);
    return NextResponse.json({ code: 'QR_LIST_FAILED' }, { status: 500 });
  }
  if (!business) return NextResponse.json({ qrs: [] });
  if (!safeHttpsUrlSchema.safeParse(business.google_review_url).success) {
    return NextResponse.json({ code: 'INVALID_STORED_DESTINATION' }, { status: 500 });
  }

  const qrResult = await auth.supabase
    .from('qr_codes')
    .select(qrDatabaseFields)
    .eq('owner_id', auth.user.id)
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  let rows = qrResult.data as QrRecord[] | null;
  let queryError: unknown = qrResult.error;
  if (isDestinationModeColumnMissing(qrResult.error)) {
    const legacyResult = await auth.supabase
      .from('qr_codes')
      .select(qrDatabaseFieldsLegacy)
      .eq('owner_id', auth.user.id)
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });
    rows = legacyResult.data as QrRecord[] | null;
    queryError = legacyResult.error;
  }

  if (queryError) {
    console.error('Failed to load QR designs for the authenticated business:', queryError);
    return NextResponse.json({ code: 'QR_LIST_FAILED' }, { status: 500 });
  }

  return NextResponse.json({
    qrs: (rows || []).map((row) => mapQrRecord(row, business as BusinessRecord)),
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = qrDesignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data: business, error: businessError } = await auth.supabase
    .from('businesses')
    .select(businessFields)
    .eq('owner_id', auth.user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (businessError) {
    console.error('Failed to resolve the QR owner business:', businessError);
    return NextResponse.json({ code: 'QR_CREATE_FAILED' }, { status: 500 });
  }
  if (!business) {
    return NextResponse.json({ code: 'BUSINESS_NOT_FOUND' }, { status: 404 });
  }
  if (!safeHttpsUrlSchema.safeParse(business.google_review_url).success) {
    return NextResponse.json({ code: 'INVALID_STORED_DESTINATION' }, { status: 409 });
  }

  const token = crypto.randomUUID();
  const insertPayload = {
    business_id: business.id,
    owner_id: auth.user.id,
    token,
    placement_name: parsed.data.placementName,
    headline: parsed.data.headline,
    tagline: parsed.data.tagline,
    supporting_text: parsed.data.supportingText,
    accent_color: parsed.data.accentColor,
    template: parsed.data.preset,
    preset: parsed.data.preset,
    geometry: parsed.data.geometry,
    center_emblem: parsed.data.centerEmblem,
    destination_mode: parsed.data.destinationMode,
    status: 'active',
    show_star_bar: false,
  };
  const insertResult = await auth.supabase
    .from('qr_codes')
    .insert(insertPayload)
    .select(qrDatabaseFields)
    .single();

  let savedRow = insertResult.data as QrRecord | null;
  let insertError: unknown = insertResult.error;
  if (isDestinationModeColumnMissing(insertResult.error)) {
    if (parsed.data.destinationMode === 'direct') {
      return NextResponse.json(
        {
          code: 'QR_DESTINATION_MODE_MIGRATION_REQUIRED',
          message: 'Apply the QR destination-mode migration before saving direct QR designs to your account.',
        },
        { status: 503 }
      );
    }

    const legacyPayload = {
      business_id: insertPayload.business_id,
      owner_id: insertPayload.owner_id,
      token: insertPayload.token,
      placement_name: insertPayload.placement_name,
      headline: insertPayload.headline,
      tagline: insertPayload.tagline,
      supporting_text: insertPayload.supporting_text,
      accent_color: insertPayload.accent_color,
      template: insertPayload.template,
      preset: insertPayload.preset,
      geometry: insertPayload.geometry,
      center_emblem: insertPayload.center_emblem,
      status: insertPayload.status,
      show_star_bar: insertPayload.show_star_bar,
    };
    const legacyResult = await auth.supabase
      .from('qr_codes')
      .insert(legacyPayload)
      .select(qrDatabaseFieldsLegacy)
      .single();
    savedRow = legacyResult.data as QrRecord | null;
    insertError = legacyResult.error;
  }

  if (insertError || !savedRow) {
    console.error('Failed to create a QR design for the authenticated business:', insertError);
    return NextResponse.json({ code: 'QR_CREATE_FAILED' }, { status: 500 });
  }

  return NextResponse.json(
    { qr: mapQrRecord(savedRow, business as BusinessRecord) },
    { status: 201 }
  );
}
