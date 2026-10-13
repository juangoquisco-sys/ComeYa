import 'server-only';
import { RestaurantApplicationStatus, RestaurantMemberRole, RestaurantStatus } from '@prisma/client';
import { db } from '@/server/db';
import { requireRestaurantReviewOperator } from './operation-auth.service';

export class RestaurantOperationError extends Error {
  constructor(public readonly code: 'APPLICATION_NOT_FOUND' | 'APPLICATION_NOT_REVIEWABLE') {
    super(code);
  }
}

const reviewableStatuses: RestaurantApplicationStatus[] = [RestaurantApplicationStatus.PENDING, RestaurantApplicationStatus.IN_REVIEW];

function toSlug(value: string) {
  const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return normalized.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'restaurante';
}

async function getReviewableApplication(id: string) {
  const application = await db.restaurantApplication.findUnique({
    where: { id },
    include: { applicant: { select: { id: true, displayName: true, email: true } } },
  });
  if (!application) throw new RestaurantOperationError('APPLICATION_NOT_FOUND');
  if (!reviewableStatuses.includes(application.status)) throw new RestaurantOperationError('APPLICATION_NOT_REVIEWABLE');
  return application;
}

export async function listRestaurantApplications(operatorId: string) {
  await requireRestaurantReviewOperator(operatorId);
  return db.restaurantApplication.findMany({
    where: { status: { in: reviewableStatuses } },
    include: { applicant: { select: { id: true, displayName: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function approveRestaurantApplication(operatorId: string, applicationId: string) {
  await requireRestaurantReviewOperator(operatorId);
  const application = await getReviewableApplication(applicationId);

  return db.$transaction(async (tx) => {
    const lock = await tx.restaurantApplication.updateMany({
      where: { id: application.id, status: { in: reviewableStatuses } },
      data: { status: RestaurantApplicationStatus.IN_REVIEW },
    });
    if (lock.count !== 1) throw new RestaurantOperationError('APPLICATION_NOT_REVIEWABLE');

    const restaurant = await tx.restaurant.create({
      data: {
        slug: `${toSlug(application.businessName)}-${application.id.slice(-6).toLowerCase()}`,
        name: application.businessName,
        cuisine: application.cuisine,
        zone: application.zone,
        address: application.address,
        status: RestaurantStatus.PENDING_REVIEW,
        sourceLabel: 'Solicitud de afiliaciÃ³n',
        sourceRef: application.id,
      },
    });
    await tx.restaurantMembership.create({
      data: { userId: application.applicantId, restaurantId: restaurant.id, role: RestaurantMemberRole.OWNER },
    });
    return tx.restaurantApplication.update({
      where: { id: application.id },
      data: { status: RestaurantApplicationStatus.APPROVED, restaurantId: restaurant.id, reviewedById: operatorId, reviewedAt: new Date() },
      include: { restaurant: { select: { id: true, name: true, slug: true, status: true } } },
    });
  });
}

export async function rejectRestaurantApplication(operatorId: string, applicationId: string, reviewNote: string) {
  await requireRestaurantReviewOperator(operatorId);
  await getReviewableApplication(applicationId);
  return db.restaurantApplication.update({
    where: { id: applicationId },
    data: { status: RestaurantApplicationStatus.REJECTED, reviewNote, reviewedById: operatorId, reviewedAt: new Date() },
    select: { id: true, status: true, reviewNote: true, reviewedAt: true },
  });
}
