import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { consumeQrDownloadRequest } from '@/lib/public-ai-rate-limit';
import { safeHttpsUrlSchema } from '@/lib/validation';

export const runtime = 'nodejs';

const MAX_PNG_BYTES = 8 * 1024 * 1024;
const text = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
};

function requestKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const address = request.headers.get('x-real-ip')?.trim() || forwarded || 'unknown';
  return createHash('sha256').update(address).digest('hex');
}

function validDestination(value: string): boolean {
  if (safeHttpsUrlSchema.safeParse(value).success) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_PNG_BYTES + 32_000) {
    return NextResponse.json({ code: 'REQUEST_TOO_LARGE' }, { status: 413 });
  }
  if (!consumeQrDownloadRequest(requestKey(request))) {
    return NextResponse.json({ code: 'RATE_LIMITED' }, { status: 429, headers: { 'Retry-After': '60' } });
  }
  if (!isSupabaseConfigured) {
    return NextResponse.json({ code: 'SUPABASE_NOT_CONFIGURED' }, { status: 503 });
  }

  let form: FormData;
  try {
    if (!request.body) return NextResponse.json({ code: 'INVALID_FORM' }, { status: 400 });
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_PNG_BYTES + 32_000) {
        await reader.cancel();
        return NextResponse.json({ code: 'REQUEST_TOO_LARGE' }, { status: 413 });
      }
      chunks.push(value);
    }
    const formHeaders = new Headers(request.headers);
    formHeaders.delete('content-length');
    const formRequest = new Request(request.url, {
      method: 'POST',
      headers: formHeaders,
      body: Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))),
    });
    form = await formRequest.formData();
  } catch {
    return NextResponse.json({ code: 'INVALID_FORM' }, { status: 400 });
  }

  const image = form.get('image');
  const qrName = text(form, 'qrName');
  const businessName = text(form, 'businessName');
  const businessCity = text(form, 'businessCity');
  const qrType = text(form, 'qrType');
  const template = text(form, 'template');
  const destinationUrl = text(form, 'destinationUrl');
  const qrCodeId = text(form, 'qrCodeId');
  const qrToken = text(form, 'qrToken');

  if (!(image instanceof File) || image.type !== 'image/png' || image.size === 0 || image.size > MAX_PNG_BYTES) {
    return NextResponse.json({ code: 'INVALID_IMAGE' }, { status: 400 });
  }
  if (
    !qrName || qrName.length > 120 || !businessName || businessName.length > 120 ||
    businessCity.length > 100 || !['direct', 'guided'].includes(qrType) ||
    !/^[a-z0-9-]{1,60}$/.test(template) || !validDestination(destinationUrl)
  ) {
    return NextResponse.json({ code: 'INVALID_METADATA' }, { status: 400 });
  }

  const bytes = Buffer.from(await image.arrayBuffer());
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (
    bytes.length < 24 || !bytes.subarray(0, 8).equals(pngSignature) ||
    bytes.toString('ascii', 12, 16) !== 'IHDR' ||
    bytes.readUInt32BE(16) !== 600 || bytes.readUInt32BE(20) !== 850
  ) {
    return NextResponse.json({ code: 'INVALID_IMAGE' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const deliveryToken = randomBytes(32).toString('base64url');
  const storagePath = `${id}.png`;
  const admin = createAdminClient();
  let linkedQrId: string | null = null;

  if (qrCodeId || qrToken) {
    if (!/^[0-9a-f-]{36}$/i.test(qrCodeId) || !qrToken || qrToken.length > 128) {
      return NextResponse.json({ code: 'INVALID_QR_REFERENCE' }, { status: 400 });
    }
    const { data: linkedQr, error: linkedQrError } = await admin
      .from('qr_codes')
      .select('id')
      .eq('id', qrCodeId)
      .eq('token', qrToken)
      .maybeSingle();
    if (linkedQrError) {
      return NextResponse.json({ code: 'DB_ERROR' }, { status: 503 });
    }
    if (!linkedQr) return NextResponse.json({ code: 'INVALID_QR_REFERENCE' }, { status: 400 });
    linkedQrId = linkedQr.id;
  }

  const { error: uploadError } = await admin.storage
    .from('qr-downloads')
    .upload(storagePath, bytes, { contentType: 'image/png', upsert: false });
  if (uploadError) {
    console.error('Failed to store QR download image:', uploadError);
    return NextResponse.json({ code: 'IMAGE_STORAGE_FAILED' }, { status: 503 });
  }

  const { error: insertError } = await admin.from('qr_downloads').insert({
    id,
    qr_code_id: linkedQrId,
    qr_name: qrName,
    business_name: businessName,
    business_city: businessCity,
    qr_type: qrType,
    template,
    destination_url: destinationUrl,
    storage_path: storagePath,
    delivery_token_hash: createHash('sha256').update(deliveryToken).digest('hex'),
  });
  if (insertError) {
    await admin.storage.from('qr-downloads').remove([storagePath]);
    console.error('Failed to create QR download record:', insertError);
    return NextResponse.json({ code: 'DOWNLOAD_RECORD_FAILED' }, { status: 503 });
  }

  return NextResponse.json({ ok: true, id, deliveryToken });
}
