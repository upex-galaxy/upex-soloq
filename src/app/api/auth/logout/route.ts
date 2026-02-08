// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Supabase error during logout:', error);
      return NextResponse.json(
        { success: false, error: { message: error.message || 'Error al cerrar sesión.' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Sesión cerrada exitosamente.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Server error during logout:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Error interno del servidor.' } },
      { status: 500 }
    );
  }
}
