import { NextResponse } from 'next/server';
import { loginSchema } from '@/modules/identity/identity.schemas';
import { authenticate, IdentityError } from '@/modules/identity/identity.service';
import { setSessionCookie } from '@/modules/identity/session.cookie';
import { createSession } from '@/modules/identity/session.service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const input = loginSchema.safeParse(body);
  if (!input.success) return NextResponse.json({ error: 'Correo o contraseña inválidos.' }, { status: 400 });

  try {
    const user = await authenticate(input.data);
    const session = await createSession(user.id);
    const response = NextResponse.json({ user });
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    if (error instanceof IdentityError) return NextResponse.json({ error: 'Correo o contraseña inválidos.' }, { status: 401 });
    throw error;
  }
}
