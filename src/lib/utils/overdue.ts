/**
 * Overdue detection utilities
 *
 * Overdue is a DERIVED status, not reliably stored in DB.
 * No cron/trigger/handler currently writes the `invoices.status = 'overdue'`
 * enum value, so consumers MUST derive overdue from (status, due_date).
 *
 * Rule: an invoice is overdue when status = 'sent' AND due_date < today.
 * due_date = today is NOT overdue (it's the last day to pay).
 *
 * This module is the single source of truth for:
 * - client-side detection (`isInvoiceOverdue`)
 * - server-side Postgres query predicates (`OVERDUE_PG_PREDICATE`,
 *   `todayIsoDate`, `applyOverdueFilter`)
 * - urgency ordering (`urgencyScore`, `sortByUrgency`)
 */
export type OverdueInvoiceShape = {
  status: string | null;
  due_date: string | null;
  created_at?: string | null;
};

/**
 * Check if an invoice is overdue based on status and due date (client-safe).
 */
export function isInvoiceOverdue(status: string | null, dueDate: string | null): boolean {
  if (status !== 'sent' || !dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

/**
 * Get the number of days an invoice is overdue
 * Returns 0 if not overdue
 */
export function getDaysOverdue(dueDate: string | null): number {
  if (!dueDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = today.getTime() - due.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Get the effective display status for an invoice
 * Returns 'overdue' for sent invoices past due date
 */
export function getEffectiveStatus(status: string | null, dueDate: string | null): string {
  if (isInvoiceOverdue(status, dueDate)) return 'overdue';
  return status || 'draft';
}

/**
 * Format days overdue as human-readable text
 */
export function formatDaysOverdue(days: number): string {
  if (days <= 0) return '';
  return `${days} day${days !== 1 ? 's' : ''} overdue`;
}

// =============================================================================
// Server-side helpers (Postgres / PostgREST)
// =============================================================================

/**
 * Return today's date in ISO (YYYY-MM-DD) form, in the server's local TZ.
 * Matches how `due_date` (a DATE column) is compared in Postgres.
 */
export function todayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Raw SQL predicate equivalent to `isInvoiceOverdue` for use in server-side
 * SQL (RPCs, views, generated columns). Exported as a string constant so
 * call sites share a literal definition.
 *
 * NOTE: expects `CURRENT_DATE` to be evaluated by Postgres.
 */
export const OVERDUE_PG_PREDICATE = "status = 'sent' AND due_date < CURRENT_DATE";

/**
 * Apply a "derived overdue" filter to a PostgREST-style filter builder.
 * Works with the Supabase-js query builder (`.eq`, `.lt` chainable).
 *
 * Usage:
 *   let q = supabase.from('invoices').select('total').is('deleted_at', null);
 *   q = applyOverdueFilter(q);
 *   const { data } = await q;
 */
export function applyOverdueFilter<
  Q extends {
    eq: (col: string, val: string) => Q;
    lt: (col: string, val: string) => Q;
  },
>(query: Q): Q {
  return query.eq('status', 'sent').lt('due_date', todayIsoDate());
}

// =============================================================================
// Urgency ordering
// =============================================================================

/**
 * Score an invoice for urgency. Higher = more urgent.
 *
 * Ranking rules (highest to lowest):
 *  1. Overdue invoices — ranked by days overdue (more days = more urgent).
 *  2. Sent-but-not-overdue — ranked by proximity of due_date (sooner = more urgent).
 *  3. Everything else (draft, paid, cancelled) — lowest priority, tied by `created_at`.
 *
 * This encodes "what should the user look at first" rather than raw time.
 */
export function urgencyScore(invoice: OverdueInvoiceShape): number {
  const status = invoice.status;
  const dueDate = invoice.due_date;

  // Tier 1: overdue (status=sent AND past-due)
  if (isInvoiceOverdue(status, dueDate)) {
    // 1_000_000 base + days overdue so older-overdue sorts above newer-overdue
    return 1_000_000 + getDaysOverdue(dueDate);
  }

  // Tier 2: sent but not yet overdue — rank by nearness to due_date
  if (status === 'sent' && dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const daysUntilDue = Math.max(
      0,
      Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );
    // 500_000 base, subtract days so closer dates score higher
    return 500_000 - daysUntilDue;
  }

  // Tier 3: everything else — recency as a weak tiebreaker
  const createdAt = invoice.created_at;
  if (createdAt) {
    // Add milliseconds since epoch / 1e6 so recent items score slightly higher,
    // but never high enough to beat tiers 1 or 2.
    return Math.floor(new Date(createdAt).getTime() / 1_000_000);
  }
  return 0;
}

/**
 * Sort invoices in place by urgency (descending). Non-mutating variant:
 * pass a copy if you need to preserve the original order.
 */
export function sortByUrgency<T extends OverdueInvoiceShape>(invoices: T[]): T[] {
  return [...invoices].sort((a, b) => urgencyScore(b) - urgencyScore(a));
}
