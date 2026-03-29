import { NextResponse } from 'next/server';
import { createServerFromRequest } from '@/lib/supabase/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoiceDocument } from '@/app/(app)/invoices/[id]/components/invoice-document';
import { sendInvoiceEmail } from '@/lib/services/email-service';
import { formatCurrency, formatDateForPDF } from '@/lib/utils/pdf-utils';
import type { Invoice, PaymentMethodType } from '@/lib/types';
import type { InvoiceWithDetails } from '@/hooks/invoices/use-invoice';
import type { PaymentMethodForEmail } from '@/lib/services/email-service';

// =============================================================================
// Constants
// =============================================================================

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// =============================================================================
// Types
// =============================================================================

interface SendInvoiceResponse {
  data?: {
    id: string;
    invoice_number: string;
    status: Invoice['status'];
    sent_at: string | null;
    email_message_id?: string;
  };
  error?: string;
  code?: string;
}

// =============================================================================
// POST /api/invoices/[id]/send - Send an invoice via email with PDF (SQ-43)
// =============================================================================

/**
 * POST /api/invoices/[id]/send - Send invoice via email with PDF attachment
 *
 * Generates a PDF server-side, sends it via email using Resend,
 * and updates the invoice status to 'sent'.
 *
 * Flow:
 * 1. Validate auth and invoice ownership
 * 2. Check invoice is draft with client and items
 * 3. Fetch full invoice data (client, items, business profile)
 * 4. Generate PDF server-side
 * 5. Validate PDF (not empty, < 5MB)
 * 6. Send email via Resend with PDF attachment
 * 7. Create email_logs record
 * 8. Update invoice status to 'sent'
 * 9. Create invoice_event
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
 * - 413: PDF too large (> 5MB)
 * - 500: Internal server error or email send failed
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

    // ==========================================================================
    // Step 1: Fetch invoice with all related data
    // ==========================================================================

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
        client_id,
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
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // ==========================================================================
    // Step 2: Validate invoice can be sent
    // ==========================================================================

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

    // Validate client email
    const rawClient = invoice.client as unknown as { id: string; name: string; email: string; company?: string; address?: string; tax_id?: string; phone?: string };
    if (!rawClient.email) {
      return NextResponse.json(
        { error: 'El cliente no tiene email configurado' },
        { status: 400 }
      );
    }

    // Convert optional properties to null for type compatibility with InvoiceWithDetails
    const client = {
      id: rawClient.id,
      name: rawClient.name,
      email: rawClient.email,
      company: rawClient.company ?? null,
      address: rawClient.address ?? null,
      tax_id: rawClient.tax_id ?? null,
      phone: rawClient.phone ?? null,
    };

    // Fetch invoice items
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('id, description, quantity, unit_price, subtotal')
      .eq('invoice_id', invoiceId)
      .order('sort_order', { ascending: true });

    if (itemsError) {
      console.error('Error fetching invoice items:', itemsError);
      return NextResponse.json({ error: 'Error al verificar los items' }, { status: 500 });
    }

    // Check invoice has at least one item
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'La factura debe tener al menos un item' },
        { status: 400 }
      );
    }

    // ==========================================================================
    // Step 3: Fetch business profile
    // ==========================================================================

    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select(
        'business_name, contact_email, contact_phone, address, tax_id, logo_url, default_terms'
      )
      .eq('user_id', user.id)
      .single();

    // ==========================================================================
    // Step 3.1: Fetch payment methods (SQ-44)
    // ==========================================================================

    const { data: rawPaymentMethods } = await supabase
      .from('payment_methods')
      .select('type, label, value, is_default')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('sort_order', { ascending: true })
      .limit(3);

    // Transform to email-friendly format
    const paymentMethods: PaymentMethodForEmail[] = (rawPaymentMethods || []).map((pm) => ({
      type: pm.type as PaymentMethodType,
      label: pm.label,
      value: pm.value,
    }));

    // ==========================================================================
    // Step 4: Generate PDF server-side
    // ==========================================================================

    const invoiceData: InvoiceWithDetails = {
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
      client: client,
      items: items,
      business_profile: businessProfile ?? null,
      payment_methods: paymentMethods.map((pm) => ({
        type: pm.type as PaymentMethodType,
        label: pm.label,
        value: pm.value,
      })),
    };

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await renderToBuffer(InvoiceDocument({ data: invoiceData }));
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      return NextResponse.json(
        { error: 'Error al generar el PDF', code: 'PDF_GENERATION_FAILED' },
        { status: 500 }
      );
    }

    // ==========================================================================
    // Step 5: Validate PDF
    // ==========================================================================

    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error('Generated PDF is empty');
      return NextResponse.json(
        { error: 'El PDF generado esta vacio', code: 'PDF_EMPTY' },
        { status: 500 }
      );
    }

    if (pdfBuffer.length > MAX_PDF_SIZE_BYTES) {
      console.error(`PDF too large: ${pdfBuffer.length} bytes`);
      return NextResponse.json(
        {
          error: 'El PDF es demasiado grande (max 5MB). Intenta reducir el tamano del logo.',
          code: 'PDF_TOO_LARGE',
        },
        { status: 413 }
      );
    }

    // ==========================================================================
    // Step 6: Send email via Resend
    // ==========================================================================

    const businessName = businessProfile?.business_name || 'Mi Negocio';
    const formattedTotal = formatCurrency(invoice.total ?? 0);
    const formattedDueDate = formatDateForPDF(invoice.due_date);

    const emailResult = await sendInvoiceEmail({
      to: client.email,
      invoiceNumber: invoice.invoice_number,
      clientName: client.name,
      total: formattedTotal,
      dueDate: formattedDueDate,
      pdfBuffer,
      businessName,
      paymentMethods, // SQ-44: Include payment data in email
    });

    // ==========================================================================
    // Step 7: Create email_logs record
    // ==========================================================================

    const now = new Date().toISOString();
    const attachmentName = `Invoice-${invoice.invoice_number}.pdf`;

    const { error: emailLogError } = await supabase.from('email_logs').insert({
      invoice_id: invoiceId,
      user_id: user.id,
      recipient_email: client.email,
      subject: `Factura ${invoice.invoice_number} - ${businessName}`,
      status: emailResult.success ? 'sent' : 'failed',
      resend_message_id: emailResult.messageId || null,
      attachment_name: attachmentName,
      attachment_size_bytes: pdfBuffer.length,
      error_message: emailResult.error || null,
      sent_at: emailResult.success ? now : null,
    });

    if (emailLogError) {
      console.error('Error creating email log:', emailLogError);
      // Don't fail the request, email was already sent
    }

    // If email failed, return error but don't update invoice status
    if (!emailResult.success) {
      return NextResponse.json(
        {
          error: emailResult.error || 'Error al enviar el email',
          code: emailResult.code || 'EMAIL_SEND_FAILED',
        },
        { status: 500 }
      );
    }

    // ==========================================================================
    // Step 8: Update invoice status
    // ==========================================================================

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
      // Email was sent but status update failed
      // This is a partial success - log it but return success
      console.warn('Email sent but invoice status update failed');
    }

    // ==========================================================================
    // Step 9: Create invoice_event
    // ==========================================================================

    const { error: eventError } = await supabase.from('invoice_events').insert({
      invoice_id: invoiceId,
      event_type: 'sent',
      metadata: {
        sent_at: now,
        sent_by: user.id,
        email_message_id: emailResult.messageId,
        recipient_email: client.email,
        attachment_size_bytes: pdfBuffer.length,
      },
    });

    if (eventError) {
      // Log but don't fail - event tracking is secondary
      console.error('Error creating invoice event:', eventError);
    }

    // ==========================================================================
    // Return success response
    // ==========================================================================

    return NextResponse.json(
      {
        data: {
          id: updatedInvoice?.id ?? invoiceId,
          invoice_number: updatedInvoice?.invoice_number ?? invoice.invoice_number,
          status: (updatedInvoice?.status ?? 'sent') as Invoice['status'],
          sent_at: updatedInvoice?.sent_at ?? now,
          email_message_id: emailResult.messageId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/invoices/[id]/send:', error);
    return NextResponse.json({ error: 'Error al enviar la factura' }, { status: 500 });
  }
}
