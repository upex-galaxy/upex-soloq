import { NextRequest, NextResponse } from 'next/server';
import { createServerFromRequest } from '@/lib/supabase/server';
import type { Invoice, InvoiceStatus } from '@/lib/types';

// =============================================================================
// Types
// =============================================================================

interface InvoiceHistorySummary {
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
}

interface ClientInvoicesResponse {
  data?: Invoice[];
  summary?: InvoiceHistorySummary;
  error?: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculate invoice totals by status
 * - Total Invoiced: sent + paid + overdue (excludes draft and cancelled)
 * - Total Paid: sum of paid invoices
 * - Total Pending: sent + overdue (awaiting payment)
 */
function calculateSummary(invoices: Invoice[]): InvoiceHistorySummary {
  const COUNTABLE_STATUSES: InvoiceStatus[] = ['sent', 'paid', 'overdue'];
  const PAID_STATUSES: InvoiceStatus[] = ['paid'];
  const PENDING_STATUSES: InvoiceStatus[] = ['sent', 'overdue'];

  let totalInvoiced = 0;
  let totalPaid = 0;
  let totalPending = 0;

  for (const invoice of invoices) {
    const total = Number(invoice.total) || 0;
    const status = invoice.status;

    // Skip invoices without status (shouldn't happen, but handle gracefully)
    if (!status) continue;

    if (COUNTABLE_STATUSES.includes(status)) {
      totalInvoiced += total;
    }

    if (PAID_STATUSES.includes(status)) {
      totalPaid += total;
    }

    if (PENDING_STATUSES.includes(status)) {
      totalPending += total;
    }
  }

  // Round to 2 decimal places
  return {
    totalInvoiced: Math.round(totalInvoiced * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalPending: Math.round(totalPending * 100) / 100,
  };
}

// =============================================================================
// GET /api/clients/[id]/invoices - Get client's invoice history
// =============================================================================

/**
 * GET /api/clients/[id]/invoices - Get all invoices for a client
 *
 * Returns:
 * - List of invoices ordered by issue_date DESC
 * - Summary with totalInvoiced, totalPaid, totalPending
 *
 * Business Rules:
 * - RLS ensures user can only see their own client's invoices
 * - Soft-deleted invoices are excluded
 * - Draft invoices are included in list but NOT in totals
 * - Cancelled invoices are included in list but NOT in totals
 *
 * Responses:
 * - 200: Success with invoices and summary
 * - 401: Unauthorized
 * - 404: Client not found
 * - 500: Internal server error
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ClientInvoicesResponse>> {
  try {
    const { id: clientId } = await context.params;
    const supabase = await createServerFromRequest(request);

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verify client exists and belongs to user (RLS handles this)
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .is('deleted_at', null)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // Fetch all invoices for this client (non-deleted)
    const { data: invoices, error: queryError } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .is('deleted_at', null)
      .order('issue_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error('Error fetching client invoices:', queryError);
      return NextResponse.json(
        { error: 'Error al cargar el historial de facturas' },
        { status: 500 }
      );
    }

    // Calculate summary
    const summary = calculateSummary(invoices || []);

    return NextResponse.json({
      data: invoices || [],
      summary,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/clients/[id]/invoices:', error);
    return NextResponse.json(
      { error: 'Error al cargar el historial de facturas' },
      { status: 500 }
    );
  }
}
