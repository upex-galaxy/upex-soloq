import { NextResponse } from 'next/server';
import { createServerFromRequest } from '@/lib/supabase/server';
import { createInvoiceApiSchema } from '@/lib/validations/invoice';
import {
  calculateTax,
  calculateTotal,
  calculateDiscountAmount,
  calculateLineTotal,
  calculateSubtotal,
} from '@/lib/utils/invoice-calculations';
import type { Invoice, Client, InvoiceStatus, InvoiceItem } from '@/lib/types';

// =============================================================================
// Types
// =============================================================================

interface InvoiceWithClient extends Invoice {
  client: Pick<Client, 'id' | 'name' | 'email' | 'company' | 'tax_id'>;
}

interface InvoiceWithClientAndItems extends InvoiceWithClient {
  items: Pick<InvoiceItem, 'id' | 'description' | 'quantity' | 'unit_price' | 'subtotal'>[];
}

interface CreateInvoiceResponse {
  data?: InvoiceWithClientAndItems;
  error?: string;
  details?: unknown;
}

interface ListInvoicesResponse {
  data?: InvoiceWithClient[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate next invoice number for user
 * Format: {PREFIX}-{YEAR}-{NNNN} (e.g., INV-2026-0001)
 * Uses user's configured prefix from business_profiles
 */
async function generateInvoiceNumber(
  supabase: Awaited<ReturnType<typeof createServerFromRequest>>,
  userId: string
): Promise<string> {
  // Get user's invoice prefix from business_profiles
  const { data: businessProfile } = await supabase
    .from('business_profiles')
    .select('invoice_prefix')
    .eq('user_id', userId)
    .single();

  const invoicePrefix = businessProfile?.invoice_prefix || 'INV';
  const year = new Date().getFullYear();
  const fullPrefix = `${invoicePrefix}-${year}-`;

  // Get the highest invoice number for this user with this prefix pattern
  const { data: lastInvoice } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', userId)
    .like('invoice_number', `${fullPrefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1)
    .single();

  let nextNumber = 1;

  if (lastInvoice?.invoice_number) {
    // Extract the number part (last digits)
    const match = lastInvoice.invoice_number.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  // Pad to 4 digits
  return `${fullPrefix}${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Check if invoice number is available for user
 */
async function isInvoiceNumberAvailable(
  supabase: Awaited<ReturnType<typeof createServerFromRequest>>,
  userId: string,
  invoiceNumber: string
): Promise<boolean> {
  const { data: existingInvoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('user_id', userId)
    .eq('invoice_number', invoiceNumber)
    .is('deleted_at', null)
    .single();

  return !existingInvoice;
}

/**
 * Calculate default due date (30 days from now)
 */
function getDefaultDueDate(): string {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  return dueDate.toISOString().split('T')[0];
}

// =============================================================================
// POST /api/invoices - Create a new invoice
// =============================================================================

/**
 * POST /api/invoices - Create a new invoice
 *
 * Request body:
 * - clientId: string (required) - UUID of the client
 * - invoiceNumber: string (optional) - Custom invoice number (auto-generated if empty)
 * - dueDate: string (optional) - Due date in YYYY-MM-DD format
 * - notes: string (optional) - Invoice notes
 * - terms: string (optional) - Invoice terms
 * - taxRate: number (optional) - Tax rate percentage
 * - items: array (optional) - Line items (for future use)
 *
 * Responses:
 * - 201: Invoice created successfully
 * - 400: Validation error, invalid clientId, or duplicate invoice number
 * - 401: Unauthorized
 * - 404: Client not found
 * - 500: Internal server error
 */
export async function POST(request: Request): Promise<NextResponse<CreateInvoiceResponse>> {
  try {
    const supabase = await createServerFromRequest(request);

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
    const validationResult = createInvoiceApiSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      clientId,
      invoiceNumber: customInvoiceNumber,
      dueDate,
      notes,
      terms,
      taxRate = 0,
      discountType = null,
      discountValue = 0,
      items = [],
    } = validationResult.data;

    // Verify client exists and belongs to user (RLS handles ownership)
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, email, company, tax_id')
      .eq('id', clientId)
      .is('deleted_at', null)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // Determine invoice number: use custom if provided, otherwise auto-generate
    let invoiceNumber: string;

    if (customInvoiceNumber && customInvoiceNumber.trim()) {
      // Validate custom invoice number is not already in use
      const isAvailable = await isInvoiceNumberAvailable(supabase, user.id, customInvoiceNumber);
      if (!isAvailable) {
        return NextResponse.json(
          {
            error: `El número de factura "${customInvoiceNumber}" ya está en uso. Usa otro número.`,
          },
          { status: 400 }
        );
      }
      invoiceNumber = customInvoiceNumber.trim();
    } else {
      // Auto-generate invoice number
      invoiceNumber = await generateInvoiceNumber(supabase, user.id);
    }

    // Calculate subtotal from line items (SQ-22)
    const subtotal = calculateSubtotal(
      items.map(item => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))
    );

    // Calculate discount, tax, and total amounts
    const { amount: discountAmount } = calculateDiscountAmount(
      subtotal,
      discountType,
      discountValue
    );
    const taxAmount = calculateTax(subtotal, discountAmount, taxRate);
    const total = calculateTotal(subtotal, discountAmount, taxAmount);

    // Create invoice with status 'draft'
    const { data: invoice, error: insertError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client_id: clientId,
        invoice_number: invoiceNumber,
        due_date: dueDate || getDefaultDueDate(),
        status: 'draft',
        notes: notes || null,
        terms: terms || null,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount_type: discountType,
        discount_value: discountValue, // Store user input value (percentage 0-100 or fixed amount)
        total,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating invoice:', insertError);

      // Check for unique constraint violation on invoice_number
      if (insertError.code === '23505') {
        // Retry with new number (rare race condition)
        return NextResponse.json(
          { error: 'Error al generar número de factura. Intenta de nuevo.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Error al crear la factura. Intenta de nuevo.' },
        { status: 500 }
      );
    }

    // Insert line items if provided (SQ-22)
    // SQ-142: If item insert fails, delete the parent invoice to prevent a
    // "ghost subtotal" — a persisted invoice row whose subtotal references
    // items that never actually persisted. Previously this was a log-and-continue
    // best-effort insert, which produced orphaned parents with divergent totals.
    let insertedItems: Pick<InvoiceItem, 'id' | 'description' | 'quantity' | 'unit_price' | 'subtotal'>[] = [];

    if (items.length > 0) {
      const itemsToInsert = items.map((item, index) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: calculateLineTotal(item.quantity, item.unitPrice),
        sort_order: index,
      }));

      const { data: createdItems, error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert)
        .select('id, description, quantity, unit_price, subtotal');

      if (itemsError) {
        console.error('Error creating invoice items (compensating parent delete):', itemsError);

        // SQ-142: Compensating delete — roll back the parent insert so the
        // invoice is not persisted with a subtotal that references nonexistent
        // items. Items cascade on delete (FK), so any partial child row is
        // cleaned up as well.
        const { error: rollbackError } = await supabase
          .from('invoices')
          .delete()
          .eq('id', invoice.id);

        if (rollbackError) {
          // Best-effort: log for observability. The DB trigger introduced in
          // the accompanying migration will still recompute subtotal to 0
          // if the orphan survives, so user-visible divergence is bounded.
          console.error('Compensating delete failed for invoice', invoice.id, rollbackError);
        }

        return NextResponse.json(
          { error: 'Error al crear los items de la factura. Intenta de nuevo.' },
          { status: 500 }
        );
      }

      insertedItems = createdItems || [];
    }

    // Return invoice with client data and items
    const responseData: InvoiceWithClientAndItems = {
      ...invoice,
      client,
      items: insertedItems,
    };

    return NextResponse.json({ data: responseData }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/invoices:', error);
    return NextResponse.json(
      { error: 'Error al crear la factura. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET /api/invoices - List invoices with filters and pagination
// =============================================================================

/**
 * GET /api/invoices - List user's invoices
 *
 * Query params:
 * - status: InvoiceStatus (optional) - Filter by status
 * - page: number (default: 1) - Page number
 * - limit: number (default: 20, max: 50) - Items per page
 * - sortBy: string (default: 'created_at') - Sort field
 * - sortOrder: 'asc' | 'desc' (default: 'desc') - Sort direction
 *
 * Responses:
 * - 200: List of invoices with pagination
 * - 401: Unauthorized
 * - 500: Internal server error
 */
export async function GET(request: Request): Promise<NextResponse<ListInvoicesResponse>> {
  try {
    const supabase = await createServerFromRequest(request);

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Parse query params
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as InvoiceStatus | null;
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    // Sort params
    const validSortFields = ['created_at', 'updated_at', 'issue_date', 'due_date', 'total', 'invoice_number', 'status'];
    const sortByParam = url.searchParams.get('sortBy') || 'created_at';
    const sortBy = validSortFields.includes(sortByParam) ? sortByParam : 'created_at';
    const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    // Search param
    const search = url.searchParams.get('search')?.trim() || '';

    // When search is active, fetch all matching invoices and filter in app layer
    // (PostgREST doesn't support OR across joined tables natively)
    if (search) {
      let searchQuery = supabase
        .from('invoices')
        .select(
          `
          *,
          client:clients!inner (
            id,
            name,
            email,
            company,
            tax_id
          )
        `
        )
        .is('deleted_at', null)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (status) {
        searchQuery = searchQuery.eq('status', status);
      }

      const { data: allInvoices, error: searchError } = await searchQuery;

      if (searchError) {
        console.error('Error searching invoices:', searchError);
        return NextResponse.json({ error: 'Error al buscar facturas' }, { status: 500 });
      }

      const searchLower = search.toLowerCase();
      const filtered = (allInvoices || []).filter(invoice => {
        const client = invoice.client as Pick<Client, 'id' | 'name' | 'email' | 'company' | 'tax_id'>;
        return (
          invoice.invoice_number?.toLowerCase().includes(searchLower) ||
          client?.name?.toLowerCase().includes(searchLower) ||
          client?.email?.toLowerCase().includes(searchLower)
        );
      });

      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const paginatedResults = filtered.slice(offset, offset + limit);

      const transformedSearch: InvoiceWithClient[] = paginatedResults.map(invoice => ({
        ...invoice,
        client: invoice.client as Pick<Client, 'id' | 'name' | 'email' | 'company' | 'tax_id'>,
      }));

      return NextResponse.json({
        data: transformedSearch,
        pagination: { page, limit, total, totalPages },
      });
    }

    // Standard query (no search) — uses DB-level pagination
    let query = supabase
      .from('invoices')
      .select(
        `
        *,
        client:clients!inner (
          id,
          name,
          email,
          company,
          tax_id
        )
      `,
        { count: 'exact' }
      )
      .is('deleted_at', null)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: invoices, error: queryError, count } = await query;

    if (queryError) {
      console.error('Error fetching invoices:', queryError);
      return NextResponse.json({ error: 'Error al cargar las facturas' }, { status: 500 });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    // Transform data to match InvoiceWithClient type
    const transformedInvoices: InvoiceWithClient[] = (invoices || []).map(invoice => ({
      ...invoice,
      client: invoice.client as Pick<Client, 'id' | 'name' | 'email' | 'company' | 'tax_id'>,
    }));

    return NextResponse.json({
      data: transformedInvoices,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/invoices:', error);
    return NextResponse.json({ error: 'Error al cargar las facturas' }, { status: 500 });
  }
}
