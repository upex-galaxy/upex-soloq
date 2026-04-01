import { NextResponse } from 'next/server';
import { createServerFromRequest } from '@/lib/supabase/server';
import type { DashboardSummary } from '@/lib/types';

interface DashboardResponse {
  data?: DashboardSummary;
  error?: string;
}

/**
 * GET /api/invoices/dashboard - Dashboard summary stats
 *
 * Returns aggregated invoice data:
 * - pending_total: sum of sent + overdue invoices
 * - overdue_total: sum of overdue invoices
 * - paid_this_month: sum of invoices paid in current month
 * - overdue_count: number of overdue invoices
 * - status_counts: count of invoices per status
 *
 * All data is scoped to the authenticated user via RLS.
 *
 * Responses:
 * - 200: Dashboard summary
 * - 401: Unauthorized
 * - 500: Internal server error
 */
export async function GET(request: Request): Promise<NextResponse<DashboardResponse>> {
  try {
    const supabase = await createServerFromRequest(request);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Fetch all non-deleted invoices for aggregation (RLS scopes to user)
    const { data: invoices, error: queryError } = await supabase
      .from('invoices')
      .select('total, status')
      .is('deleted_at', null);

    if (queryError) {
      console.error('Error fetching dashboard data:', queryError);
      return NextResponse.json({ error: 'Error al cargar el dashboard' }, { status: 500 });
    }

    const rows = invoices || [];

    // Calculate aggregations in application layer
    let pendingTotal = 0;
    let overdueTotal = 0;
    let overdueCount = 0;
    const statusCounts = {
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0,
    };

    // Current month boundaries for paid_this_month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

    for (const row of rows) {
      const status = row.status as keyof typeof statusCounts;
      const total = row.total ?? 0;

      if (status in statusCounts) {
        statusCounts[status]++;
      }

      if (status === 'sent' || status === 'overdue') {
        pendingTotal += total;
      }

      if (status === 'overdue') {
        overdueTotal += total;
        overdueCount++;
      }
    }

    // Paid this month: separate query filtering by payment date range
    const { data: paidRows, error: paidError } = await supabase
      .from('invoices')
      .select('total')
      .eq('status', 'paid')
      .is('deleted_at', null)
      .gte('updated_at', monthStart)
      .lte('updated_at', monthEnd);

    if (paidError) {
      console.error('Error fetching paid this month:', paidError);
    }

    let paidThisMonth = 0;
    for (const row of paidRows || []) {
      paidThisMonth += row.total ?? 0;
    }

    const summary: DashboardSummary = {
      pending_total: Math.round(pendingTotal * 100) / 100,
      overdue_total: Math.round(overdueTotal * 100) / 100,
      paid_this_month: Math.round(paidThisMonth * 100) / 100,
      overdue_count: overdueCount,
      status_counts: statusCounts,
    };

    return NextResponse.json({ data: summary });
  } catch (error) {
    console.error('Unexpected error in GET /api/invoices/dashboard:', error);
    return NextResponse.json({ error: 'Error al cargar el dashboard' }, { status: 500 });
  }
}
