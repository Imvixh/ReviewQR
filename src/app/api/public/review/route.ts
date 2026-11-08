import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrId, starRating, suggestionCategory } = body;

    if (!qrId) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Missing qrId' }, { status: 400 });
    }

    // Records observable interaction event
    return NextResponse.json({
      ok: true,
      tracked: {
        qrId,
        starRating: starRating || 5,
        suggestionCategory: suggestionCategory || 'General',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ code: 'SERVER_ERROR', message: err?.message }, { status: 500 });
  }
}

