import 'server-only';
import { db } from '@/server/db';

export async function getRestaurantPortalOverview(userId: string) {
  const membership = await db.restaurantMembership.findFirst({
    where: { userId },
    select: {
      role: true,
      restaurant: {
        select: { id: true, name: true, status: true, menuItems: { where: { status: 'AVAILABLE' }, select: { id: true } } },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
  if (!membership) return null;
  return { role: membership.role, restaurant: { id: membership.restaurant.id, name: membership.restaurant.name, status: membership.restaurant.status, availableMenuItems: membership.restaurant.menuItems.length } };
}
