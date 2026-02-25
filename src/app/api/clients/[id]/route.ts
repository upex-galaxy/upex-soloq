import { NextRequest, NextResponse } from 'next/server';
import { createServerFromRequest } from '@/lib/supabase/server';
import { clientFormSchema } from '@/lib/validations/client';
import type { Client } from '@/lib/types';

// =============================================================================
// Types
// =============================================================================

interface ClientResponse {
  data?: Client;
  error?: string;
  details?: unknown;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

// =============================================================================
// GET /api/clients/[id] - Get a single client by ID
// =============================================================================

/**
 * GET /api/clients/[id] - Get a single client
 *
 * Responses:
 * - 200: Client found
 * - 401: Unauthorized
 * - 404: Client not found
 * - 500: Internal server error
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ClientResponse>> {
  try {
    const { id } = await context.params;
    const supabase = await createServerFromRequest(request);

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Fetch client - RLS handles user filtering automatically
    const { data: client, error: queryError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (queryError || !client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: client });
  } catch (error) {
    console.error('Unexpected error in GET /api/clients/[id]:', error);
    return NextResponse.json({ error: 'Error al cargar el cliente' }, { status: 500 });
  }
}

// =============================================================================
// PUT /api/clients/[id] - Update a client
// =============================================================================

/**
 * PUT /api/clients/[id] - Update a client
 *
 * Request body: ClientFormData (name, email, company?, phone?, address?, notes?)
 *
 * Responses:
 * - 200: Client updated successfully
 * - 400: Validation error
 * - 401: Unauthorized
 * - 404: Client not found
 * - 409: Client with same email already exists
 * - 500: Internal server error
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ClientResponse>> {
  try {
    const { id } = await context.params;
    const supabase = await createServerFromRequest(request);

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verify client exists and belongs to user (RLS handles this)
    const { data: existingClient, error: findError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (findError || !existingClient) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
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

    const { name, email, company, phone, address, notes, tax_id } = validationResult.data;

    // Normalize email to lowercase for case-insensitive comparison and storage
    const normalizedEmail = email.toLowerCase();

    // Check for duplicate email for this user (case-insensitive, excluding current client)
    const { data: duplicateClient } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .ilike('email', normalizedEmail)
      .neq('id', id)
      .is('deleted_at', null)
      .single();

    if (duplicateClient) {
      return NextResponse.json({ error: 'Ya existe un cliente con este email' }, { status: 409 });
    }

    // Update client with normalized email
    const { data: client, error: updateError } = await supabase
      .from('clients')
      .update({
        name,
        email: normalizedEmail,
        company: company || null,
        phone: phone || null,
        address: address || null,
        notes: notes || null,
        tax_id: tax_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating client:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar el cliente. Intenta de nuevo.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: client });
  } catch (error) {
    console.error('Unexpected error in PUT /api/clients/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el cliente. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE /api/clients/[id] - Soft delete a client
// =============================================================================

interface DeleteClientResponse {
  data?: { id: string; name: string };
  error?: string;
}

/**
 * DELETE /api/clients/[id] - Soft delete a client
 *
 * Performs a soft delete by setting deleted_at timestamp.
 * Client data is preserved for invoice references.
 *
 * Responses:
 * - 200: Client deleted successfully
 * - 401: Unauthorized
 * - 404: Client not found (or already deleted)
 * - 500: Internal server error
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<DeleteClientResponse>> {
  try {
    const { id } = await context.params;
    const supabase = await createServerFromRequest(request);

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verify client exists and is not already deleted (RLS handles user filtering)
    const { data: existingClient, error: findError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (findError || !existingClient) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // Soft delete: set deleted_at timestamp
    const { error: deleteError } = await supabase
      .from('clients')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting client:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar el cliente. Intenta de nuevo.' },
        { status: 500 }
      );
    }

    // Return deleted client info for success message
    return NextResponse.json({
      data: { id: existingClient.id, name: existingClient.name },
    });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/clients/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el cliente. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
