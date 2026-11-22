import { NextResponse } from 'next/server';

/**
 * Super Admin registration has been permanently closed.
 * Only pre-authorized administrative identities can access the platform.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Super Admin registration is permanently closed. Please sign in with your administrative credentials.' },
    { status: 403 }
  );
}
