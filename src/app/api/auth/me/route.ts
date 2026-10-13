import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, sessionCookieName } from '@/modules/identity/session.service';

export const runtime = 'nodejs';

export async function GET() {
  const cookieStore = await cookies();
  const user = await getAuthenticatedUser(cookieStore.get(sessionCookieName)?.value);
  return NextResponse.json({ user });
}
