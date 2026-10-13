import 'dotenv/config';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { OperatorRole, PrismaClient, UserStatus } from '@prisma/client';

const scrypt = promisify(scryptCallback);
const db = new PrismaClient();

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64) as Buffer;
  return `scrypt:${salt}:${key.toString('hex')}`;
}

async function main() {
  const email = process.env.BOOTSTRAP_OPERATOR_EMAIL?.trim().toLowerCase();
  const displayName = process.env.BOOTSTRAP_OPERATOR_NAME?.trim();
  const password = process.env.BOOTSTRAP_OPERATOR_PASSWORD;
  if (!email || !displayName || !password || password.length < 10) {
    throw new Error('Define BOOTSTRAP_OPERATOR_EMAIL, BOOTSTRAP_OPERATOR_NAME y una BOOTSTRAP_OPERATOR_PASSWORD de al menos 10 caracteres.');
  }

  const passwordHash = await hashPassword(password);
  const user = await db.user.upsert({
    where: { email },
    update: { displayName, passwordHash, status: UserStatus.ACTIVE },
    create: { email, displayName, passwordHash, status: UserStatus.ACTIVE },
  });
  await db.operatorMembership.upsert({
    where: { userId: user.id },
    update: { role: OperatorRole.ADMIN },
    create: { userId: user.id, role: OperatorRole.ADMIN },
  });
  console.log(`Operador ADMIN preparado para ${user.email}.`);
}

main().finally(() => db.$disconnect());
