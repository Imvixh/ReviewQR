import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/authenticated-client';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { reviewDestinationSchema, safeHttpsUrlSchema } from '../../../../lib/validation';

const businessFields =
  'id, name, city, google_review_url, category, subcategory, logo_path, thumbnail_path';
const legacyBusinessFields =
  'id, name, city, google_review_url, category, logo_path, thumbnail_path';

function isSubcategoryColumnMissing(error: { code?: string; message?: string } | null): boolean {
  return (
    (error?.code === '42703' || error?.code === 'PGRST204') &&
    Boolean(error.message?.toLowerCase().includes('subcategory'))
  );
}

async function findOwnerBusiness(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerId: string
) {
  const result = await supabase
    .from('businesses')
    .select(businessFields)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!isSubcategoryColumnMissing(result.error)) {
    return { ...result, supportsSubcategory: true };
  }

  const legacyResult = await supabase
    .from('businesses')
    .select(legacyBusinessFields)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  return { ...legacyResult, supportsSubcategory: false };
}

async function toResponseBusiness(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: {
    id: string;
    name: string;
    city: string;
    google_review_url: string;
    category: string | null;
    subcategory?: string | null;
    logo_path: string | null;
    thumbnail_path: string | null;
  }
) {
  if (!safeHttpsUrlSchema.safeParse(row.google_review_url).success) {
    throw new Error('Stored business destination is not a valid HTTPS URL.');
  }

  let storageClient;
  try {
    storageClient = createAdminClient();
  } catch {
    storageClient = supabase;
  }

  const [logo, thumbnail] = await Promise.all([
    row.logo_path
      ? storageClient.storage
          .from('business-assets')
          .createSignedUrl(row.logo_path, 60 * 60 * 24 * 365)
          .catch((err) => {
            console.warn('Failed to sign logo URL:', err);
            return { data: null, error: null };
          })
      : Promise.resolve({ data: null, error: null }),
    row.thumbnail_path
      ? storageClient.storage
          .from('business-assets')
          .createSignedUrl(row.thumbnail_path, 60 * 60 * 24 * 365)
          .catch((err) => {
            console.warn('Failed to sign thumbnail URL:', err);
            return { data: null, error: null };
          })
      : Promise.resolve({ data: null, error: null }),
  ]);

  return {
    id: row.id,
    name: row.name,
    city: row.city,
    googleReviewUrl: row.google_review_url,
    category: row.category || '',
    subcategory: row.subcategory || '',
    logoUrl: logo.data?.signedUrl,
    thumbnailUrl: thumbnail.data?.signedUrl,
  };
}

export async function GET(): Promise<NextResponse> {
  const auth = await getAuthenticatedClient();
  if (!auth.ok) return auth.response;

  try {
    const { data, error } = await findOwnerBusiness(auth.supabase, auth.user.id);

    if (error) {
      console.error('Failed to load the authenticated business review destination:', error);
      return NextResponse.json({ code: 'DESTINATION_LOAD_FAILED' }, { status: 500 });
    }

    return NextResponse.json({
      business: data ? await toResponseBusiness(auth.supabase, data) : null,
    });
  } catch (error) {
    console.error('Unexpected error loading the authenticated business review destination:', error);
    return NextResponse.json({ code: 'DESTINATION_LOAD_FAILED' }, { status: 500 });
  }
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

  const parsed = reviewDestinationSchema.safeParse(body);
  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map((i) => i.message).join('; ');
    return NextResponse.json(
      {
        code: 'VALIDATION_ERROR',
        message: errorDetails || 'Invalid review destination input.',
        errors: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  try {
    const {
      data: existing,
      error: lookupError,
      supportsSubcategory,
    } = await findOwnerBusiness(auth.supabase, auth.user.id);

    if (lookupError) {
      console.error('Failed to find the authenticated owner business:', lookupError);
      return NextResponse.json(
        {
          code: 'DESTINATION_SAVE_FAILED',
          message: lookupError.message || 'Failed to locate business record.',
        },
        { status: 500 }
      );
    }
    const categoryForValidation =
      parsed.data.category ?? existing?.category ?? 'Restaurant & Lounge';
    if (parsed.data.subcategory && categoryForValidation.toLowerCase() !== 'hotel') {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Hotel subcategories require the Hotel category.',
          errors: { fieldErrors: { subcategory: ['Hotel subcategories require the Hotel category.'] } },
        },
        { status: 400 }
      );
    }
    if (parsed.data.subcategory && !supportsSubcategory) {
      return NextResponse.json(
        {
          code: 'BUSINESS_SUBCATEGORY_MIGRATION_REQUIRED',
          message: 'Apply the business-category migration before saving a hotel subcategory.',
        },
        { status: 503 }
      );
    }

    if (existing) {
      const update = {
        google_review_url: parsed.data.destinationUrl,
        ...(parsed.data.category !== undefined && { category: parsed.data.category }),
        ...(supportsSubcategory &&
          (parsed.data.subcategory !== undefined ||
            (parsed.data.category !== undefined && parsed.data.category !== existing.category)) && {
            subcategory: parsed.data.subcategory || null,
          }),
      };
      const updateQuery = auth.supabase
        .from('businesses')
        .update(update)
        .eq('id', existing.id)
        .eq('owner_id', auth.user.id);
      const updateResult = supportsSubcategory
        ? await updateQuery
            .select('id, name, city, google_review_url, category, subcategory, logo_path, thumbnail_path')
            .single()
        : await updateQuery
            .select('id, name, city, google_review_url, category, logo_path, thumbnail_path')
            .single();
      const { data, error } = updateResult;

      if (error || !data) {
        console.error('Failed to update the owner business review destination:', error);
        return NextResponse.json(
          {
            code: 'DESTINATION_SAVE_FAILED',
            message: error?.message || 'Failed to update review destination in database.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ business: await toResponseBusiness(auth.supabase, data) });
    }

    if (!parsed.data.businessName || !parsed.data.city) {
      return NextResponse.json(
        {
          code: 'BUSINESS_DETAILS_REQUIRED',
          message: 'Enter a business name and city before saving the first destination.',
        },
        { status: 400 }
      );
    }

    const baseSlug =
      parsed.data.businessName
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40) || 'business';
    const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;

    const insertPayload = {
        owner_id: auth.user.id,
        name: parsed.data.businessName,
        city: parsed.data.city,
        slug,
        google_review_url: parsed.data.destinationUrl,
        category: parsed.data.category || 'Restaurant & Lounge',
        ...(supportsSubcategory &&
          parsed.data.subcategory !== undefined && {
            subcategory: parsed.data.subcategory || null,
          }),
      };
    const insertQuery = auth.supabase.from('businesses').insert(insertPayload);
    const insertResult = supportsSubcategory
      ? await insertQuery
          .select('id, name, city, google_review_url, category, subcategory, logo_path, thumbnail_path')
          .single()
      : await insertQuery
          .select('id, name, city, google_review_url, category, logo_path, thumbnail_path')
          .single();
    const { data, error } = insertResult;

    if (error || !data) {
      console.error('Failed to create the authenticated owner business:', error);
      return NextResponse.json(
        {
          code: 'DESTINATION_SAVE_FAILED',
          message: error?.message || 'Failed to insert business record.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { business: await toResponseBusiness(auth.supabase, data) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error saving the authenticated business review destination:', error);
    const msg = error instanceof Error ? error.message : 'Unexpected error saving review destination.';
    return NextResponse.json({ code: 'DESTINATION_SAVE_FAILED', message: msg }, { status: 500 });
  }
}
