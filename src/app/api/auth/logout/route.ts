import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/modules/identity/session.cookie';
import { revokeSession, sessionCookieName } from '@/modules/identity/session.service';

export const runtime = 'nodejs';

export async function POST() {
  const cookieStore = await cookies();
  await revokeSession(cookieStore.get(sessionCookieName)?.value);
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
