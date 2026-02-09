import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';
import type { InvoiceWithDetails } from '@/hooks/invoices/use-invoice';

// =============================================================================
// Types
// =============================================================================

interface GetInvoiceResponse {
  data?: InvoiceWithDetails;
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
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<GetInvoiceResponse>> {
  try {
    const { id: invoiceId } = await params;
    const supabase = await createServer();

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
    };

    return NextResponse.json({ data: responseData }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/invoices/[id]:', error);
    return NextResponse.json({ error: 'Error al cargar la factura' }, { status: 500 });
  }
}
