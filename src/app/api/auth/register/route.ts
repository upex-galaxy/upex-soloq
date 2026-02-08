// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(), // This is refined at the client, but keeping it for completeness
});

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.json();

  try {
    const { email, password } = registerSchema.parse(formData);

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${requestUrl.origin}/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { success: false, error: { message: 'Este correo electrónico ya está registrado.' } },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.' },
      { status: 201 }
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
