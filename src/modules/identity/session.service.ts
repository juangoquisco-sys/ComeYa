import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { UserStatus } from '@prisma/client';
import { db } from '@/server/db';
import { toAuthenticatedUser } from './identity.service';

export const sessionCookieName = 'comeya_session';
const sessionDurationMs = 1000 * 60 * 60 * 24 * 30;

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + sessionDurationMs);
  await db.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
  return { token, expiresAt };
}

export async function getAuthenticatedUser(token: string | undefined) {
  if (!token) return null;
  const session = await db.session.findFirst({
    where: { tokenHash: hashToken(token), revokedAt: null, expiresAt: { gt: new Date() }, user: { status: UserStatus.ACTIVE } },
    select: { user: { select: { id: true, email: true, displayName: true } } },
  });
  return session ? toAuthenticatedUser(session.user) : null;
}

export async function revokeSession(token: string | undefined) {
  if (!token) return;
  await db.session.updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
}
