'use client';

import { Badge } from '@/components/ui/badge';
import { INVOICE_STATUS_OPTIONS, type InvoiceStatus } from '@/lib/types';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

/**
 * Badge component that displays invoice status with appropriate color
 *
 * Colors:
 * - draft: gray (neutral, work in progress)
 * - sent: blue (action taken, awaiting payment)
 * - paid: green (success, completed)
 * - overdue: red (attention needed)
 * - cancelled: gray strikethrough (inactive)
 */
export function InvoiceStatusBadge({ status, className = '' }: InvoiceStatusBadgeProps) {
  const statusConfig = INVOICE_STATUS_OPTIONS.find(opt => opt.value === status);

  if (!statusConfig) {
    return (
      <Badge variant="secondary" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={`${statusConfig.color} ${className}`}
      data-testid={`invoice-status-badge-${status}`}
    >
      {statusConfig.label}
    </Badge>
  );
}
