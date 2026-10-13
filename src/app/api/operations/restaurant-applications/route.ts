import { NextResponse } from 'next/server';
import { getRequestUser } from '@/modules/identity/request-user.server';
import { OperationAuthorizationError } from '@/modules/operations/operation-auth.service';
import { listRestaurantApplications } from '@/modules/operations/restaurant-operations.service';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: 'Debes iniciar sesiÃ³n.' }, { status: 401 });
  try {
    return NextResponse.json({ applications: await listRestaurantApplications(user.id) });
  } catch (error) {
    if (error instanceof OperationAuthorizationError) return NextResponse.json({ error: 'No tienes acceso a la operaciÃ³n.' }, { status: 403 });
    throw error;
  }
}
