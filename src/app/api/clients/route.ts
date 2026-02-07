import { NextRequest, NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';
import { clientFormSchema } from '@/lib/validations/client';
import type { Client } from '@/lib/types';

// =============================================================================
// Types
// =============================================================================

interface CreateClientResponse {
  data?: Client;
  error?: string;
  details?: unknown;
}

interface ListClientsResponse {
  clients: Client[];
  total: number;
  page: number;
  totalPages: number;
  error?: string;
}

type SortField = 'name' | 'created_at' | 'email';
type SortOrder = 'asc' | 'desc';

// =============================================================================
// GET /api/clients - List all clients with search, sort, pagination
// =============================================================================

/**
 * GET /api/clients - List clients for authenticated user
 *
 * Query params:
 * - search: string (optional) - Search in name, email, company
 * - sortBy: 'name' | 'created_at' | 'email' (default: 'name')
 * - sortOrder: 'asc' | 'desc' (default: 'asc')
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 50)
 *
 * Responses:
 * - 200: List of clients with pagination info
 * - 401: Unauthorized
 * - 500: Internal server error
 */
export async function GET(request: NextRequest): Promise<NextResponse<ListClientsResponse>> {
  try {
    const supabase = await createServer();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { clients: [], total: 0, page: 1, totalPages: 0, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const sortBy = (searchParams.get('sortBy') as SortField) || 'name';
    const sortOrder = (searchParams.get('sortOrder') as SortOrder) || 'asc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    // Build base query - RLS handles user filtering automatically
    let query = supabase.from('clients').select('*', { count: 'exact' }).is('deleted_at', null);

    // Apply search filter (case-insensitive partial match)
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(
        `name.ilike.${searchTerm},email.ilike.${searchTerm},company.ilike.${searchTerm}`
      );
    }

    // Apply sorting
    const validSortFields: SortField[] = ['name', 'created_at', 'email'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const ascending = sortOrder === 'asc';
    query = query.order(sortField, { ascending });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: clients, count, error: queryError } = await query;

    if (queryError) {
      console.error('Error fetching clients:', queryError);
      return NextResponse.json(
        { clients: [], total: 0, page: 1, totalPages: 0, error: 'Error al cargar clientes' },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      clients: clients || [],
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/clients:', error);
    return NextResponse.json(
      { clients: [], total: 0, page: 1, totalPages: 0, error: 'Error al cargar clientes' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/clients - Create a new client
// =============================================================================

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

    const { name, email, company, phone, address, notes, tax_id } = validationResult.data;

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
        tax_id: tax_id || null,
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
