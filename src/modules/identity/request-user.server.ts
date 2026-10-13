import 'server-only';
import { cookies } from 'next/headers';
import { getAuthenticatedUser, sessionCookieName } from './session.service';

export async function getRequestUser() {
  const cookieStore = await cookies();
  return getAuthenticatedUser(cookieStore.get(sessionCookieName)?.value);
}
