import { NextResponse } from 'next/server';
import { createServerFromRequest } from '@/lib/supabase/server';
import { isInvoiceOverdue } from '@/lib/utils/overdue';
import type { DashboardSummary, MonthlyChartData } from '@/lib/types';

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
 * - monthly_pending: sum of sent/overdue invoices issued this month
 * - trend_percentage: month-over-month paid income change
 * - trend_label: direction indicator (up/down/flat/new/null)
 * - chart_data: last 6 months of paid income
 *
 * All data is scoped to the authenticated user via RLS.
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

    // Fetch all non-deleted invoices for aggregation (RLS scopes to user).
    // `due_date` is required because "overdue" is DERIVED (no cron/trigger
    // ever writes status='overdue'); see src/lib/utils/overdue.ts.
    const { data: invoices, error: queryError } = await supabase
      .from('invoices')
      .select('total, status, issue_date, due_date, updated_at')
      .is('deleted_at', null);

    if (queryError) {
      console.error('Error fetching dashboard data:', queryError);
      return NextResponse.json({ error: 'Error al cargar el dashboard' }, { status: 500 });
    }

    const rows = invoices || [];

    // Current month boundaries
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthStart = new Date(currentYear, currentMonth, 1).toISOString();
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999).toISOString();

    // Calculate aggregations.
    //
    // Overdue is DERIVED from (status='sent' AND due_date < today), matching
    // `isInvoiceOverdue` used by the invoice list UI. This keeps
    // dashboard.overdue_* and the list's red-highlighted rows in sync.
    let pendingTotal = 0;
    let overdueTotal = 0;
    let overdueCount = 0;
    let monthlyPending = 0;
    const statusCounts = {
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0,
    };

    for (const row of rows) {
      const status = row.status as keyof typeof statusCounts;
      const total = row.total ?? 0;
      const derivedOverdue = isInvoiceOverdue(row.status, row.due_date);

      // status_counts reflects the EFFECTIVE status. A sent-but-past-due
      // invoice counts as 'overdue', not 'sent', so the tabs on
      // /invoices (Todas / Enviada / Vencida / ...) add up correctly.
      if (derivedOverdue) {
        statusCounts.overdue++;
      } else if (status in statusCounts) {
        statusCounts[status]++;
      }

      // Pending = unpaid & still owed = sent (incl. derived-overdue).
      if (status === 'sent') {
        pendingTotal += total;

        // Monthly pending: issued this month and still sent/overdue
        if (row.issue_date && row.issue_date >= monthStart.split('T')[0] && row.issue_date <= monthEnd.split('T')[0]) {
          monthlyPending += total;
        }
      }

      if (derivedOverdue) {
        overdueTotal += total;
        overdueCount++;
      }
    }

    // Paid this month: invoices with status 'paid' and paid_at in current month
    // Filters out paid_at IS NULL so pre-SQ-174 historical rows do not contribute.
    const { data: paidRows, error: paidError } = await supabase
      .from('invoices')
      .select('total')
      .eq('status', 'paid')
      .is('deleted_at', null)
      .not('paid_at', 'is', null)
      .gte('paid_at', monthStart)
      .lte('paid_at', monthEnd);

    if (paidError) {
      console.error('Error fetching paid this month:', paidError);
    }

    let paidThisMonth = 0;
    for (const row of paidRows || []) {
      paidThisMonth += row.total ?? 0;
    }

    // Chart data: last 6 months of paid income
    const chartData = await getMonthlyChartData(supabase, 6);

    // Trend calculation: compare current month paid vs last month paid
    const currentMonthPaid = paidThisMonth;
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1).toISOString();
    const lastMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999).toISOString();

    const { data: lastMonthPaidRows } = await supabase
      .from('invoices')
      .select('total')
      .eq('status', 'paid')
      .is('deleted_at', null)
      .not('paid_at', 'is', null)
      .gte('paid_at', lastMonthStart)
      .lte('paid_at', lastMonthEnd);

    let lastMonthPaid = 0;
    for (const row of lastMonthPaidRows || []) {
      lastMonthPaid += row.total ?? 0;
    }

    const { percentage: trendPercentage, label: trendLabel } = calculateTrend(currentMonthPaid, lastMonthPaid);

    const summary: DashboardSummary = {
      pending_total: Math.round(pendingTotal * 100) / 100,
      overdue_total: Math.round(overdueTotal * 100) / 100,
      paid_this_month: Math.round(paidThisMonth * 100) / 100,
      overdue_count: overdueCount,
      status_counts: statusCounts,
      monthly_pending: Math.round(monthlyPending * 100) / 100,
      trend_percentage: trendPercentage,
      trend_label: trendLabel,
      chart_data: chartData,
    };

    return NextResponse.json({ data: summary });
  } catch (error) {
    console.error('Unexpected error in GET /api/invoices/dashboard:', error);
    return NextResponse.json({ error: 'Error al cargar el dashboard' }, { status: 500 });
  }
}

/**
 * Get paid income for each of the last N months
 */
async function getMonthlyChartData(
  supabase: Awaited<ReturnType<typeof createServerFromRequest>>,
  months: number
): Promise<MonthlyChartData[]> {
  const now = new Date();
  const result: MonthlyChartData[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = date.toISOString();
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

    const { data: rows } = await supabase
      .from('invoices')
      .select('total')
      .eq('status', 'paid')
      .is('deleted_at', null)
      .not('paid_at', 'is', null)
      .gte('paid_at', start)
      .lte('paid_at', end);

    let total = 0;
    for (const row of rows || []) {
      total += row.total ?? 0;
    }

    result.push({
      month: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      paid: Math.round(total * 100) / 100,
    });
  }

  return result;
}

/**
 * Calculate month-over-month trend
 */
function calculateTrend(
  current: number,
  previous: number
): { percentage: number | null; label: DashboardSummary['trend_label'] } {
  if (current === 0 && previous === 0) {
    return { percentage: null, label: null };
  }

  if (previous === 0 && current > 0) {
    return { percentage: null, label: 'new' };
  }

  const percentage = Math.round(((current - previous) / previous) * 100);

  if (percentage > 0) {
    return { percentage, label: 'up' };
  } else if (percentage < 0) {
    return { percentage, label: 'down' };
  } else {
    return { percentage: 0, label: 'flat' };
  }
}
