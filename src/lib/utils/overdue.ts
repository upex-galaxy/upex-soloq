/**
 * Overdue detection utilities
 *
 * Overdue is a derived status, not stored in DB.
 * A sent invoice is overdue when: status = 'sent' AND due_date < today
 * due_date = today is NOT overdue (it's the last day to pay).
 */

/**
 * Check if an invoice is overdue based on status and due date
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
