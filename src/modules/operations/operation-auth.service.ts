import 'server-only';
import { OperatorRole } from '@prisma/client';
import { db } from '@/server/db';

export class OperationAuthorizationError extends Error {}

const restaurantReviewRoles: OperatorRole[] = [OperatorRole.ADMIN, OperatorRole.OPERATIONS];

export async function requireRestaurantReviewOperator(userId: string) {
  const membership = await db.operatorMembership.findUnique({ where: { userId } });
  if (!membership || !restaurantReviewRoles.includes(membership.role)) {
    throw new OperationAuthorizationError('OPERATOR_ROLE_REQUIRED');
  }
  return membership;
}
