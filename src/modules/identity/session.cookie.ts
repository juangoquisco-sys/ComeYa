import 'server-only';
import type { NextResponse } from 'next/server';
import { sessionCookieName } from './session.service';

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(sessionCookieName, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', expires: expiresAt, path: '/' });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(sessionCookieName, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', expires: new Date(0), path: '/' });
}
