import { NextResponse } from 'next/server';
import { getRequestUser } from '@/modules/identity/request-user.server';
import { getRestaurantPortalOverview } from '@/modules/restaurant-portal/restaurant-portal.service';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
  const overview = await getRestaurantPortalOverview(user.id);
  if (!overview) return NextResponse.json({ error: 'No tienes acceso a un restaurante.' }, { status: 403 });
  return NextResponse.json({ overview });
}
