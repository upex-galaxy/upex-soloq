// src/app/api/clients/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { clientFormSchema } from '@/lib/validations/client'; // Import our Zod schema
import { z } from 'zod';

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: { message: 'No autenticado.' } },
      { status: 401 }
    );
  }

  const formData = await request.json();

  try {
    const parsedData = clientFormSchema.parse(formData);

    // Check for duplicate client email for this user
    const { count: duplicateCount, error: duplicateError } = await supabase
      .from('clients')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('email', parsedData.email)
      .limit(1);

    if (duplicateError) {
      console.error('Error checking for duplicate client:', duplicateError);
      return NextResponse.json(
        { success: false, error: { message: 'Error al verificar cliente duplicado.' } },
        { status: 500 }
      );
    }

    if (duplicateCount && duplicateCount > 0) {
      return NextResponse.json(
        { success: false, error: { message: 'Ya existe un cliente con este email.' } },
        { status: 409 }
      );
    }

    // Insert new client
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        name: parsedData.name,
        email: parsedData.email,
        company: parsedData.company || null,
        phone: parsedData.phone || null,
        address: parsedData.address || null,
        notes: parsedData.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, client: newClient }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: error.errors[0].message } },
        { status: 400 }
      );
    }
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Error interno del servidor.' } },
      { status: 500 }
    );
  }
}
