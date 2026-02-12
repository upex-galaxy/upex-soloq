import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';

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
 * GET /api/invoices/check-number?number=XXX
 *
 * Checks if a given invoice number is available for the authenticated user.
 * Invoice numbers are unique per user (UNIQUE constraint on user_id, invoice_number).
 *
 * Query Parameters:
 * - number: string (required) - The invoice number to check
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
    const supabase = await createServer();

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

    if (!invoiceNumber) {
      return NextResponse.json({ error: 'El parámetro "number" es requerido' }, { status: 400 });
    }

    // Check if invoice number exists for this user
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('user_id', user.id)
      .eq('invoice_number', invoiceNumber)
      .is('deleted_at', null)
      .single();

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
