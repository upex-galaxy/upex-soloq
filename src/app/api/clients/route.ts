import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';
import { clientFormSchema } from '@/lib/validations/client';
import type { Client } from '@/lib/types';

interface CreateClientResponse {
  data?: Client;
  error?: string;
  details?: unknown;
}

/**
 * POST /api/clients - Create a new client
 *
 * Request body: ClientFormData (name, email, company?, phone?, address?, notes?)
 *
 * Responses:
 * - 201: Client created successfully
 * - 400: Validation error
 * - 401: Unauthorized
 * - 409: Client with same email already exists
 * - 500: Internal server error
 */
export async function POST(request: Request): Promise<NextResponse<CreateClientResponse>> {
  try {
    const supabase = await createServer();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = clientFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, email, company, phone, address, notes } = validationResult.data;

    // Check for duplicate email for this user
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .eq('email', email)
      .is('deleted_at', null)
      .single();

    if (existingClient) {
      return NextResponse.json({ error: 'Ya existe un cliente con este email' }, { status: 409 });
    }

    // Insert new client
    const { data: client, error: insertError } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        name,
        email,
        company: company || null,
        phone: phone || null,
        address: address || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting client:', insertError);
      return NextResponse.json(
        { error: 'Error al guardar el cliente. Intenta de nuevo.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: client }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/clients:', error);
    return NextResponse.json(
      { error: 'Error al guardar el cliente. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
