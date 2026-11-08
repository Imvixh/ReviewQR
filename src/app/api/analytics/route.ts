import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      code: 'ANALYTICS_UNAVAILABLE',
      message: 'Persistent analytics are not configured yet.',
    },
    { status: 503 }
  );
}
