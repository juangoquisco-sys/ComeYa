import 'server-only';
import { RestaurantApplicationStatus } from '@prisma/client';
import { db } from '@/server/db';

export class RestaurantApplicationError extends Error {
  constructor(public readonly code: 'PENDING_APPLICATION_EXISTS') { super(code); }
}

export async function createRestaurantApplication(applicantId: string, input: { businessName: string; cuisine: string; zone: string; address: string; applicantRole: string }) {
  const existing = await db.restaurantApplication.findFirst({
    where: { applicantId, businessName: input.businessName, status: { in: [RestaurantApplicationStatus.PENDING, RestaurantApplicationStatus.IN_REVIEW] } },
    select: { id: true },
  });
  if (existing) throw new RestaurantApplicationError('PENDING_APPLICATION_EXISTS');

  return db.restaurantApplication.create({
    data: { applicantId, ...input },
    select: { id: true, businessName: true, status: true, createdAt: true },
  });
}
