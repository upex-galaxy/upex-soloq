import { NextResponse } from 'next/server';
import { createServerFromRequest } from '@/lib/supabase/server';
import { updateInvoiceSchema } from '@/lib/validations/invoice';
import {
  calculateTax,
  calculateTotal,
  calculateDiscountAmount,
  calculateLineTotal,
  calculateSubtotal,
} from '@/lib/utils/invoice-calculations';
import { sanitizePlainText } from '@/lib/utils/sanitize';
import type { InvoiceWithDetails } from '@/hooks/invoices/use-invoice';
import type { Invoice, Client, DiscountType, InvoiceItem } from '@/lib/types';

// =============================================================================
// Types
// =============================================================================

interface GetInvoiceResponse {
  data?: InvoiceWithDetails;
  error?: string;
}

interface InvoiceWithClient extends Invoice {
  client: Pick<Client, 'id' | 'name' | 'email' | 'company' | 'tax_id'>;
}

interface InvoiceWithClientAndItems extends InvoiceWithClient {
  items: Pick<InvoiceItem, 'id' | 'description' | 'quantity' | 'unit_price' | 'subtotal'>[];
}

interface UpdateInvoiceResponse {
  data?: InvoiceWithClientAndItems;
  error?: string;
  details?: unknown;
}

interface DeleteInvoiceResponse {
  success?: boolean;
  error?: string;
}

// =============================================================================
// GET /api/invoices/[id] - Get single invoice with all related data
// =============================================================================

/**
 * GET /api/invoices/[id] - Fetch invoice with client, items, and business profile
 *
 * This endpoint returns all data needed for PDF generation:
 * - Invoice core data (number, dates, amounts)
 * - Client information
 * - Line items
 * - Business profile (for header)
 *
 * Security:
 * - RLS ensures users can only access their own invoices
 * - Returns 404 (not 403) to avoid exposing invoice existence
 *
 * Responses:
 * - 200: Invoice found and returned
 * - 401: Unauthorized
 * - 404: Invoice not found (or belongs to another user)
 * - 500: Internal server error
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<GetInvoiceResponse>> {
  try {
    const { id: invoiceId } = await params;
    const supabase = await createServerFromRequest(request);

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(invoiceId)) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // Fetch invoice with client data
    // RLS policy ensures user can only see their own invoices
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(
        `
        id,
        invoice_number,
        issue_date,
        due_date,
        status,
        notes,
        terms,
        subtotal,
        discount_type,
        discount_value,
        tax_rate,
        tax_amount,
        total,
        currency,
        client:clients!inner (
          id,
          name,
          email,
          company,
          address,
          tax_id,
          phone
        )
      `
      )
      .eq('id', invoiceId)
      .is('deleted_at', null)
      .single();

    if (invoiceError || !invoice) {
      // Return 404 regardless of reason to avoid exposing invoice existence
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // Fetch invoice items
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('id, description, quantity, unit_price, subtotal')
      .eq('invoice_id', invoiceId)
      .order('sort_order', { ascending: true });

    if (itemsError) {
      console.error('Error fetching invoice items:', itemsError);
      // Continue without items rather than failing
    }

    // Fetch business profile
    const { data: businessProfile, error: profileError } = await supabase
      .from('business_profiles')
      .select(
        'business_name, contact_email, contact_phone, address, tax_id, logo_url, default_terms'
      )
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is ok
      console.error('Error fetching business profile:', profileError);
    }

    // Fetch active payment methods for PDF display
    const { data: paymentMethods } = await supabase
      .from('payment_methods')
      .select('type, label, value')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('sort_order', { ascending: true })
      .limit(3);

    // Build response
    const responseData: InvoiceWithDetails = {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      status: invoice.status,
      notes: invoice.notes,
      terms: invoice.terms,
      subtotal: invoice.subtotal ?? 0,
      discount_type: invoice.discount_type,
      discount_value: invoice.discount_value ?? 0,
      tax_rate: invoice.tax_rate ?? 0,
      tax_amount: invoice.tax_amount ?? 0,
      total: invoice.total ?? 0,
      currency: invoice.currency,
      // Type assertion needed because Supabase returns array for single relation
      client: invoice.client as unknown as InvoiceWithDetails['client'],
      items: items ?? [],
      business_profile: businessProfile ?? null,
      payment_methods: (paymentMethods ?? []).map(pm => ({
        type: pm.type,
        label: pm.label,
        value: typeof pm.value === 'string' ? pm.value : JSON.stringify(pm.value),
      })),
    };

    return NextResponse.json({ data: responseData }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/invoices/[id]:', error);
    return NextResponse.json({ error: 'Error al cargar la factura' }, { status: 500 });
  }
}

// =============================================================================
// PUT /api/invoices/[id] - Update a draft invoice
// =============================================================================

/**
 * PUT /api/invoices/[id] - Update invoice (drafts only)
 *
 * Request body (all fields optional):
 * - clientId: string - UUID of the client
 * - invoiceNumber: string - Custom invoice number
 * - dueDate: string - Due date in YYYY-MM-DD format
 * - notes: string - Invoice notes
 * - terms: string - Invoice terms
 * - taxRate: number - Tax rate percentage
 *
 * Security:
 * - Only draft invoices can be updated
 * - RLS ensures users can only update their own invoices
 *
 * Responses:
 * - 200: Invoice updated successfully
 * - 400: Validation error or invoice not editable (not draft)
 * - 401: Unauthorized
 * - 404: Invoice not found
 * - 500: Internal server error
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<UpdateInvoiceResponse>> {
  try {
    const { id: invoiceId } = await params;
    const supabase = await createServerFromRequest(request);

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(invoiceId)) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateInvoiceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Check invoice exists, belongs to user, and is draft
    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status, client_id, subtotal, discount_type, discount_value, tax_rate')
      .eq('id', invoiceId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !existingInvoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // TC-12: Only draft invoices can be edited
    if (existingInvoice.status !== 'draft') {
      return NextResponse.json(
        { error: 'Solo se pueden editar facturas en borrador' },
        { status: 400 }
      );
    }

    const { clientId, invoiceNumber, dueDate, notes, terms, taxRate, discountType, discountValue, items } =
      validationResult.data;

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (clientId !== undefined) {
      // Verify client exists and belongs to user
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .is('deleted_at', null)
        .single();

      if (clientError || !client) {
        return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
      }
      updates.client_id = clientId;
    }

    if (invoiceNumber !== undefined && invoiceNumber.trim()) {
      // Check invoice number is available (excluding current invoice)
      const { data: duplicateInvoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('invoice_number', invoiceNumber)
        .neq('id', invoiceId)
        .is('deleted_at', null)
        .single();

      if (duplicateInvoice) {
        return NextResponse.json(
          { error: `El número de factura "${invoiceNumber}" ya está en uso` },
          { status: 400 }
        );
      }
      updates.invoice_number = invoiceNumber.trim();
    }

    if (dueDate !== undefined) {
      updates.due_date = dueDate || null;
    }

    // Sanitize free-text fields at the write trust boundary (SQ-156).
    // Strips any HTML/script payloads so the DB stores plain text only. See
    // .context/reports/incident-SQ-156-investigation.md.
    if (notes !== undefined) {
      updates.notes = notes ? sanitizePlainText(notes) || null : null;
    }

    if (terms !== undefined) {
      updates.terms = terms ? sanitizePlainText(terms) || null : null;
    }

    // Handle items update (SQ-22)
    const itemsChanged = items !== undefined;
    let insertedItems: Pick<InvoiceItem, 'id' | 'description' | 'quantity' | 'unit_price' | 'subtotal'>[] = [];

    if (itemsChanged && items) {
      // Delete existing items
      const { error: deleteItemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId);

      if (deleteItemsError) {
        console.error('Error deleting invoice items:', deleteItemsError);
        return NextResponse.json({ error: 'Error al actualizar los items' }, { status: 500 });
      }

      // Insert new items if any
      if (items.length > 0) {
        const itemsToInsert = items.map((item, index) => ({
          invoice_id: invoiceId,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          subtotal: calculateLineTotal(item.quantity, item.unitPrice),
          sort_order: index,
        }));

        const { data: createdItems, error: insertItemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert)
          .select('id, description, quantity, unit_price, subtotal');

        if (insertItemsError) {
          console.error('Error inserting invoice items:', insertItemsError);
          return NextResponse.json({ error: 'Error al actualizar los items' }, { status: 500 });
        }

        insertedItems = createdItems || [];
      }

      // Recalculate subtotal from new items
      const newSubtotal = calculateSubtotal(
        items.map(item => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      );
      updates.subtotal = newSubtotal;
    }

    // Recalculate amounts if tax rate, discount, or items changed
    const taxRateChanged = taxRate !== undefined;
    const discountChanged = discountType !== undefined || discountValue !== undefined;

    if (taxRateChanged || discountChanged || itemsChanged) {
      // Use new subtotal if items changed, otherwise use existing
      const subtotal = itemsChanged
        ? (updates.subtotal as number)
        : existingInvoice.subtotal ?? 0;
      const effectiveTaxRate = taxRate ?? existingInvoice.tax_rate ?? 0;
      const effectiveDiscountType =
        discountType !== undefined
          ? discountType
          : (existingInvoice.discount_type as DiscountType | null);
      const effectiveDiscountValue = discountValue ?? 0;

      // Calculate discount amount from type and input value
      const { amount: discountAmount } = calculateDiscountAmount(
        subtotal,
        effectiveDiscountType,
        effectiveDiscountValue
      );

      const taxAmount = calculateTax(subtotal, discountAmount, effectiveTaxRate);
      const total = calculateTotal(subtotal, discountAmount, taxAmount);

      if (taxRateChanged) {
        updates.tax_rate = effectiveTaxRate;
      }
      if (discountChanged) {
        updates.discount_type = effectiveDiscountType;
        updates.discount_value = effectiveDiscountValue; // Store user input value (percentage 0-100 or fixed amount)
      }
      updates.tax_amount = taxAmount;
      updates.total = total;
    }

    // Update invoice
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId)
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
      .single();

    if (updateError) {
      console.error('Error updating invoice:', updateError);
      return NextResponse.json({ error: 'Error al actualizar la factura' }, { status: 500 });
    }

    const responseData: InvoiceWithClientAndItems = {
      ...updatedInvoice,
      client: updatedInvoice.client as Pick<Client, 'id' | 'name' | 'email' | 'company' | 'tax_id'>,
      items: insertedItems,
    };

    return NextResponse.json({ data: responseData }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in PUT /api/invoices/[id]:', error);
    return NextResponse.json({ error: 'Error al actualizar la factura' }, { status: 500 });
  }
}

// =============================================================================
// DELETE /api/invoices/[id] - Delete a draft invoice
// =============================================================================

/**
 * DELETE /api/invoices/[id] - Delete invoice (drafts only, hard delete)
 *
 * Security:
 * - Only draft invoices can be deleted (TC-12)
 * - RLS ensures users can only delete their own invoices
 * - Hard delete (no soft delete for drafts)
 *
 * Responses:
 * - 200: Invoice deleted successfully
 * - 400: Invoice not deletable (not draft)
 * - 401: Unauthorized
 * - 404: Invoice not found
 * - 500: Internal server error
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<DeleteInvoiceResponse>> {
  try {
    const { id: invoiceId } = await params;
    const supabase = await createServerFromRequest(request);

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(invoiceId)) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // Check invoice exists, belongs to user, and is draft
    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status')
      .eq('id', invoiceId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !existingInvoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // TC-12: Only draft invoices can be deleted
    if (existingInvoice.status !== 'draft') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar facturas en borrador' },
        { status: 400 }
      );
    }

    // Hard delete - cascade will delete invoice_items automatically
    const { error: deleteError } = await supabase.from('invoices').delete().eq('id', invoiceId);

    if (deleteError) {
      console.error('Error deleting invoice:', deleteError);
      return NextResponse.json({ error: 'Error al eliminar la factura' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/invoices/[id]:', error);
    return NextResponse.json({ error: 'Error al eliminar la factura' }, { status: 500 });
  }
}
