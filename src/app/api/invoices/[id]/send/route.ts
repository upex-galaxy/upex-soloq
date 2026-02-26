import { NextResponse } from 'next/server';
import { createServerFromRequest } from '@/lib/supabase/server';
import type { Invoice } from '@/lib/types';

// =============================================================================
// Types
// =============================================================================

interface SendInvoiceResponse {
  data?: {
    id: string;
    invoice_number: string;
    status: Invoice['status'];
    sent_at: string | null;
  };
  error?: string;
}

// =============================================================================
// POST /api/invoices/[id]/send - Send an invoice (SQ-26)
// =============================================================================

/**
 * POST /api/invoices/[id]/send - Mark invoice as sent
 *
 * Changes invoice status from 'draft' to 'sent' and sets sent_at timestamp.
 * Also creates an invoice_event record for tracking.
 *
 * Prerequisites:
 * - Invoice must exist and belong to user
 * - Invoice must be in 'draft' status
 * - Invoice must have required data (client, items)
 *
 * Effects:
 * - Updates invoice.status to 'sent'
 * - Updates invoice.sent_at to current timestamp
 * - Creates invoice_event with type 'sent'
 *
 * Security:
 * - RLS ensures users can only send their own invoices
 * - Returns 404 (not 403) to avoid exposing invoice existence
 *
 * Responses:
 * - 200: Invoice sent successfully
 * - 400: Invoice cannot be sent (not draft, missing data)
 * - 401: Unauthorized
 * - 404: Invoice not found
 * - 500: Internal server error
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SendInvoiceResponse>> {
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

    // Check invoice exists, belongs to user, is draft, and has required data
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, invoice_number, status, client_id, subtotal')
      .eq('id', invoiceId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // Check invoice is in draft status
    if (invoice.status !== 'draft') {
      return NextResponse.json(
        { error: `Solo se pueden enviar facturas en borrador. Estado actual: ${invoice.status}` },
        { status: 400 }
      );
    }

    // Check invoice has a client
    if (!invoice.client_id) {
      return NextResponse.json(
        { error: 'La factura debe tener un cliente asignado' },
        { status: 400 }
      );
    }

    // Check invoice has at least one item
    const { count: itemCount, error: itemCountError } = await supabase
      .from('invoice_items')
      .select('id', { count: 'exact', head: true })
      .eq('invoice_id', invoiceId);

    if (itemCountError) {
      console.error('Error counting invoice items:', itemCountError);
      return NextResponse.json({ error: 'Error al verificar los items' }, { status: 500 });
    }

    if (!itemCount || itemCount === 0) {
      return NextResponse.json(
        { error: 'La factura debe tener al menos un item' },
        { status: 400 }
      );
    }

    // Update invoice status to 'sent'
    const now = new Date().toISOString();
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'sent',
        sent_at: now,
        updated_at: now,
      })
      .eq('id', invoiceId)
      .select('id, invoice_number, status, sent_at')
      .single();

    if (updateError) {
      console.error('Error updating invoice status:', updateError);
      return NextResponse.json({ error: 'Error al enviar la factura' }, { status: 500 });
    }

    // Create invoice event for tracking
    const { error: eventError } = await supabase.from('invoice_events').insert({
      invoice_id: invoiceId,
      event_type: 'sent',
      event_data: {
        sent_at: now,
        sent_by: user.id,
      },
    });

    if (eventError) {
      // Log but don't fail - event tracking is secondary
      console.error('Error creating invoice event:', eventError);
    }

    return NextResponse.json(
      {
        data: {
          id: updatedInvoice.id,
          invoice_number: updatedInvoice.invoice_number,
          status: updatedInvoice.status as Invoice['status'],
          sent_at: updatedInvoice.sent_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/invoices/[id]/send:', error);
    return NextResponse.json({ error: 'Error al enviar la factura' }, { status: 500 });
  }
}
