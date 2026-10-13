import { NextResponse } from 'next/server';
import { registerCustomerSchema } from '@/modules/identity/identity.schemas';
import { IdentityError, registerCustomer } from '@/modules/identity/identity.service';
import { setSessionCookie } from '@/modules/identity/session.cookie';
import { createSession } from '@/modules/identity/session.service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const input = registerCustomerSchema.safeParse(body);
  if (!input.success) return NextResponse.json({ error: 'Revisa los datos ingresados. La contraseña debe tener al menos 10 caracteres.' }, { status: 400 });

  try {
    const user = await registerCustomer(input.data);
    const session = await createSession(user.id);
    const response = NextResponse.json({ user }, { status: 201 });
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    if (error instanceof IdentityError && error.code === 'EMAIL_TAKEN') return NextResponse.json({ error: 'No se pudo crear la cuenta con esos datos.' }, { status: 409 });
    throw error;
  }
}
