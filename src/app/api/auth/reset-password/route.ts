// src/app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
  confirmNewPassword: z.string(), // This is refined at the client
});

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.json();

  try {
    const { token, newPassword } = resetPasswordSchema.parse(formData);

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // The token from the URL (code) is used by supabase.auth.exchangeCodeForSession
    // For resetting password, the newPassword is directly used with updateUser
    // Supabase handles the token validation internally
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error('Supabase error during password reset:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              error.message || 'El token de restablecimiento podría ser inválido o haber expirado.',
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Contraseña actualizada exitosamente.' },
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
