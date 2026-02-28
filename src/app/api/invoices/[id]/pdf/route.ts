import { NextResponse } from 'next/server';
import { createServerFromRequest } from '@/lib/supabase/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoiceDocument } from '@/app/(app)/invoices/[id]/components/invoice-document';
import { generateInvoiceFilename } from '@/lib/utils/pdf-utils';
import type { InvoiceWithDetails } from '@/hooks/invoices/use-invoice';

// =============================================================================
// Constants
// =============================================================================

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// =============================================================================
// Types
// =============================================================================

interface PdfErrorResponse {
  error: string;
  code?: string;
}

// =============================================================================
// GET /api/invoices/[id]/pdf - Generate and return PDF
// =============================================================================

/**
 * GET /api/invoices/[id]/pdf - Generate invoice PDF server-side
 *
 * Generates a PDF using @react-pdf/renderer and returns it as a downloadable file.
 * Used for both direct downloads and email attachments.
 *
 * Headers returned:
 * - Content-Type: application/pdf
 * - Content-Disposition: attachment; filename="Invoice-{number}.pdf"
 * - Content-Length: size in bytes
 *
 * Security:
 * - RLS ensures users can only access their own invoices
 * - Returns 404 (not 403) to avoid exposing invoice existence
 *
 * Responses:
 * - 200: PDF generated successfully (binary stream)
 * - 401: Unauthorized
 * - 404: Invoice not found
 * - 413: PDF too large (> 5MB)
 * - 500: PDF generation failed
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<Buffer | PdfErrorResponse>> {
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

    // Fetch invoice with all related data
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
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // Fetch invoice items
    const { data: items } = await supabase
      .from('invoice_items')
      .select('id, description, quantity, unit_price, subtotal')
      .eq('invoice_id', invoiceId)
      .order('sort_order', { ascending: true });

    // Fetch business profile
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select(
        'business_name, contact_email, contact_phone, address, tax_id, logo_url, default_terms'
      )
      .eq('user_id', user.id)
      .single();

    // Build invoice data for PDF
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
      client: invoice.client as unknown as InvoiceWithDetails['client'],
      items: items ?? [],
      business_profile: businessProfile ?? null,
    };

    // Generate PDF buffer
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

    // Validate PDF is not empty
    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error('Generated PDF is empty');
      return NextResponse.json(
        { error: 'El PDF generado esta vacio', code: 'PDF_EMPTY' },
        { status: 500 }
      );
    }

    // Validate PDF size
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

    // Generate filename
    const clientName =
      typeof invoice.client === 'object' && invoice.client !== null
        ? (invoice.client as { name: string }).name
        : 'Cliente';
    const filename = generateInvoiceFilename(invoice.invoice_number, clientName);

    // Return PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/invoices/[id]/pdf:', error);
    return NextResponse.json(
      { error: 'Error al generar el PDF', code: 'PDF_GENERATION_FAILED' },
      { status: 500 }
    );
  }
}
