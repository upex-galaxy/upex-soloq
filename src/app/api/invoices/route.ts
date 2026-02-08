import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';
import { createInvoiceApiSchema } from '@/lib/validations/invoice';
import { calculateTax, calculateTotal } from '@/lib/utils/invoice-calculations';
import type { Invoice, Client } from '@/lib/types';

// =============================================================================
// Types
// =============================================================================

interface InvoiceWithClient extends Invoice {
  client: Pick<Client, 'id' | 'name' | 'email' | 'company' | 'tax_id'>;
}

interface CreateInvoiceResponse {
  data?: InvoiceWithClient;
  error?: string;
  details?: unknown;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate next invoice number for user
 * Format: INV-YYYY-NNNN (e.g., INV-2026-0001)
 */
async function generateInvoiceNumber(
  supabase: Awaited<ReturnType<typeof createServer>>,
  userId: string
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  // Get the highest invoice number for this user this year
  const { data: lastInvoice } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', userId)
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1)
    .single();

  let nextNumber = 1;

  if (lastInvoice?.invoice_number) {
    // Extract the number part (last 4 digits)
    const match = lastInvoice.invoice_number.match(/(\d{4})$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  // Pad to 4 digits
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
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
 * - dueDate: string (optional) - Due date in YYYY-MM-DD format
 * - notes: string (optional) - Invoice notes
 * - items: array (optional) - Line items (for future use)
 *
 * Responses:
 * - 201: Invoice created successfully
 * - 400: Validation error or invalid clientId
 * - 401: Unauthorized
 * - 404: Client not found
 * - 500: Internal server error
 */
export async function POST(request: Request): Promise<NextResponse<CreateInvoiceResponse>> {
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

    const { clientId, dueDate, notes, taxRate = 0 } = validationResult.data;

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

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(supabase, user.id);

    // Calculate tax and total amounts
    // At creation, subtotal is 0 (line items will be added later via SQ-22)
    const subtotal = 0;
    const discountAmount = 0;
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
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount_value: discountAmount,
        discount_type: 'fixed',
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

    // Return invoice with client data
    const responseData: InvoiceWithClient = {
      ...invoice,
      client,
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
