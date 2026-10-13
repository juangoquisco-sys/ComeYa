import 'server-only';
import { RestaurantStatus } from '@prisma/client';
import { db } from '@/server/db';

export async function listPublishedRestaurants() {
  return db.restaurant.findMany({
    where: { status: RestaurantStatus.PUBLISHED },
    select: { slug: true, name: true, cuisine: true, zone: true },
    orderBy: { name: 'asc' },
  });
}
