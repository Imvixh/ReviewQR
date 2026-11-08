import { NextRequest, NextResponse } from 'next/server';
import { initialOrg, initialQRCodes } from '@/lib/data-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const qr = initialQRCodes.find((q) => q.slug === token || q.id === token) || initialQRCodes[0];

    if (!qr) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'QR Code not found' }, { status: 404 });
    }

    // Return minimal, non-sensitive public payload for customer journey
    return NextResponse.json({
      ok: true,
      qr: {
        id: qr.id,
        slug: qr.slug,
        businessName: qr.businessName || initialOrg.name,
        category: initialOrg.category,
        city: initialOrg.city,
        headline: qr.headline,
        tagline: qr.tagline,
        accentColor: qr.accentColor || initialOrg.accentColor,
        googleReviewUrl: qr.destinationUrl || initialOrg.googleReviewUrl,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ code: 'SERVER_ERROR', message: err?.message }, { status: 500 });
  }
}

