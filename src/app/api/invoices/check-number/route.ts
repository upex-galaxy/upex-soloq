import { NextResponse } from 'next/server';
import { createServerFromRequest } from '@/lib/supabase/server';

// =============================================================================
// Types
// =============================================================================

interface CheckInvoiceNumberResponse {
  available: boolean;
  message?: string;
}

interface ErrorResponse {
  error: string;
}

// =============================================================================
// GET /api/invoices/check-number - Check if invoice number is available
// =============================================================================

/**
 * GET /api/invoices/check-number?number=XXX&excludeId=YYY
 *
 * Checks if a given invoice number is available for the authenticated user.
 * Invoice numbers are unique per user (UNIQUE constraint on user_id, invoice_number).
 *
 * Query Parameters:
 * - number: string (required) - The invoice number to check
 * - excludeId: string (optional) - Invoice ID to exclude (for editing existing invoices)
 *
 * Responses:
 * - 200: Check completed (available: true/false)
 * - 400: Missing number parameter
 * - 401: Unauthorized
 * - 500: Internal server error
 */
export async function GET(
  request: Request
): Promise<NextResponse<CheckInvoiceNumberResponse | ErrorResponse>> {
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

    // Get invoice number from query params
    const { searchParams } = new URL(request.url);
    const invoiceNumber = searchParams.get('number')?.trim();
    const excludeId = searchParams.get('excludeId')?.trim();

    if (!invoiceNumber) {
      return NextResponse.json({ error: 'El parámetro "number" es requerido' }, { status: 400 });
    }

    // Check if invoice number exists for this user (excluding current invoice if editing)
    let query = supabase
      .from('invoices')
      .select('id')
      .eq('user_id', user.id)
      .eq('invoice_number', invoiceNumber)
      .is('deleted_at', null);

    // Exclude current invoice ID if provided (for editing)
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data: existingInvoice } = await query.single();

    if (existingInvoice) {
      return NextResponse.json({
        available: false,
        message: `El número ${invoiceNumber} ya está en uso. Usa otro número.`,
      });
    }

    return NextResponse.json({
      available: true,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/invoices/check-number:', error);
    return NextResponse.json({ error: 'Error al verificar número de factura' }, { status: 500 });
  }
}
