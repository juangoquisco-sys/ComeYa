import { NextResponse } from 'next/server';
import { getRequestUser } from '@/modules/identity/request-user.server';
import { restaurantApplicationSchema } from '@/modules/restaurant-applications/restaurant-application.schemas';
import { createRestaurantApplication, RestaurantApplicationError } from '@/modules/restaurant-applications/restaurant-application.service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: 'Debes iniciar sesión para solicitar una afiliación.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const input = restaurantApplicationSchema.safeParse(body);
  if (!input.success) return NextResponse.json({ error: 'Revisa los datos del negocio.' }, { status: 400 });
  try {
    const application = await createRestaurantApplication(user.id, input.data);
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    if (error instanceof RestaurantApplicationError) return NextResponse.json({ error: 'Ya existe una solicitud pendiente para este negocio.' }, { status: 409 });
    throw error;
  }
}
