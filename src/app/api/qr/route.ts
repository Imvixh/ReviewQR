import { NextResponse } from 'next/server';
import { qrCreateSchema } from '@/lib/validation';
import { initialQRCodes } from '@/lib/data-store';

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: initialQRCodes,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = qrCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const newQR = {
      id: `qr_${Date.now()}`,
      orgId: 'org_royal_palace',
      slug: parsed.data.placementType.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      ...parsed.data,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ ok: true, data: newQR }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ code: 'SERVER_ERROR', message: err?.message }, { status: 500 });
  }
}

