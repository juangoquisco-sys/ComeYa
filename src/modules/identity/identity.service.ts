import 'server-only';
import { Prisma, UserStatus } from '@prisma/client';
import { db } from '@/server/db';
import { hashPassword, verifyPassword } from './password.service';

export type AuthenticatedUser = { id: string; email: string; displayName: string };

export class IdentityError extends Error {
  constructor(public readonly code: 'EMAIL_TAKEN' | 'INVALID_CREDENTIALS' | 'ACCOUNT_INACTIVE') {
    super(code);
  }
}

export function toAuthenticatedUser(user: { id: string; email: string; displayName: string }): AuthenticatedUser {
  return { id: user.id, email: user.email, displayName: user.displayName };
}

export async function registerCustomer(input: { email: string; displayName: string; password: string }) {
  try {
    const user = await db.user.create({
      data: { email: input.email, displayName: input.displayName, passwordHash: await hashPassword(input.password) },
      select: { id: true, email: true, displayName: true },
    });
    return toAuthenticatedUser(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new IdentityError('EMAIL_TAKEN');
    throw error;
  }
}

export async function authenticate(input: { email: string; password: string }) {
  const user = await db.user.findUnique({ where: { email: input.email }, select: { id: true, email: true, displayName: true, passwordHash: true, status: true } });
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) throw new IdentityError('INVALID_CREDENTIALS');
  if (user.status !== UserStatus.ACTIVE) throw new IdentityError('ACCOUNT_INACTIVE');
  return toAuthenticatedUser(user);
}
