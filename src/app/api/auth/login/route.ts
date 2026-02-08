// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Por favor, ingresa un correo electrónico válido.'),
  password: z.string().min(1, 'La contraseña no puede estar vacía.'),
});

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.json();

  try {
    const { email, password } = loginSchema.parse(formData);

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Por favor, verifica tu correo electrónico antes de iniciar sesión.',
            },
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { success: false, error: { message: 'Credenciales inválidas.' } },
        { status: 401 }
      );
    }

    // Redirect to dashboard on successful login
    return NextResponse.json(
      { success: true, message: 'Inicio de sesión exitoso.' },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: error.errors[0].message } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: 'Error interno del servidor.' } },
      { status: 500 }
    );
  }
}
