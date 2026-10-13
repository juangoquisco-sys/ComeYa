import { NextResponse } from 'next/server';
import { getRequestUser } from '@/modules/identity/request-user.server';
import { OperationAuthorizationError } from '@/modules/operations/operation-auth.service';
import { hasSameOrigin } from '@/modules/operations/request-origin';
import { rejectRestaurantApplicationSchema } from '@/modules/operations/restaurant-operations.schemas';
import { rejectRestaurantApplication, RestaurantOperationError } from '@/modules/operations/restaurant-operations.service';

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: 'Debes iniciar sesiÃ³n.' }, { status: 401 });
  const input = rejectRestaurantApplicationSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: 'Indica una razÃ³n de 3 a 500 caracteres.' }, { status: 400 });
  try {
    const application = await rejectRestaurantApplication(user.id, (await params).id, input.data.reason);
    return NextResponse.json({ application });
  } catch (error) {
    if (error instanceof OperationAuthorizationError) return NextResponse.json({ error: 'No tienes acceso a la operaciÃ³n.' }, { status: 403 });
    if (error instanceof RestaurantOperationError) return NextResponse.json({ error: 'La solicitud ya no se puede rechazar.' }, { status: 409 });
    throw error;
  }
}
