import { NextResponse } from 'next/server';
import { createServerFromRequest } from '@/lib/supabase/server';

// =============================================================================
// Types
// =============================================================================

interface NextInvoiceNumberResponse {
  invoiceNumber: string;
  prefix: string;
  sequence: number;
}

interface ErrorResponse {
  error: string;
}

// =============================================================================
// GET /api/invoices/next-number - Get the next invoice number for the user
// =============================================================================

/**
 * GET /api/invoices/next-number
 *
 * Returns the next sequential invoice number for the authenticated user.
 * Uses the user's configured prefix from business_profiles (default: 'INV').
 * Format: {PREFIX}-{YEAR}-{SEQUENCE} (e.g., INV-2026-0001)
 *
 * Responses:
 * - 200: Next invoice number generated successfully
 * - 401: Unauthorized
 * - 500: Internal server error
 */
export async function GET(
  request: Request
): Promise<NextResponse<NextInvoiceNumberResponse | ErrorResponse>> {
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

    // Get user's invoice prefix from business_profiles
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('invoice_prefix')
      .eq('user_id', user.id)
      .single();

    const prefix = businessProfile?.invoice_prefix || 'INV';
    const year = new Date().getFullYear();
    const fullPrefix = `${prefix}-${year}-`;

    // Get the highest invoice number for this user with this prefix pattern
    const { data: lastInvoice } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', user.id)
      .like('invoice_number', `${fullPrefix}%`)
      .order('invoice_number', { ascending: false })
      .limit(1)
      .single();

    let nextSequence = 1;

    if (lastInvoice?.invoice_number) {
      // Extract the number part (last 4 digits)
      const match = lastInvoice.invoice_number.match(/(\d+)$/);
      if (match) {
        nextSequence = parseInt(match[1], 10) + 1;
      }
    }

    // Generate the next invoice number with 4-digit padding
    const invoiceNumber = `${fullPrefix}${nextSequence.toString().padStart(4, '0')}`;

    return NextResponse.json({
      invoiceNumber,
      prefix,
      sequence: nextSequence,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/invoices/next-number:', error);
    return NextResponse.json({ error: 'Error al generar número de factura' }, { status: 500 });
  }
}
