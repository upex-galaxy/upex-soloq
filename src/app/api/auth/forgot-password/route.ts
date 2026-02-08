// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Por favor, ingresa un correo electrónico válido.'),
});

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.json();

  try {
    const { email } = forgotPasswordSchema.parse(formData);

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // For security, do not reveal whether the email exists or not.
    // Always return a success message if the request format is valid.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${requestUrl.origin}/auth/reset-password`,
    });

    if (error) {
      console.error('Supabase error during password reset request:', error);
      // Even if there's a Supabase error, for security, we return a generic success to the client
      // to prevent email enumeration. Log the error internally.
      // However, if it's a critical server error, we can still throw.
      if (error.status && error.status >= 500) {
        return NextResponse.json(
          { success: false, error: { message: 'Error interno del servidor.' } },
          { status: 500 }
        );
      }
    }

    // Always return a success response to the client for security reasons.
    return NextResponse.json(
      {
        success: true,
        message:
          'Si una cuenta con ese correo electrónico existe, se ha enviado un enlace para restablecer la contraseña.',
      },
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
