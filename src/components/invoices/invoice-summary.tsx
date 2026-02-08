'use client';

import { useMemo } from 'react';

import { cn } from '@/lib/utils';
import { calculateInvoiceAmounts } from '@/lib/utils/invoice-calculations';

export interface InvoiceSummaryProps {
  /** Invoice subtotal (sum of line items) */
  subtotal: number;
  /** Discount amount (already calculated if percentage) */
  discountAmount?: number;
  /** Tax rate as percentage (0-100) */
  taxRate: number;
  /** Currency code for formatting */
  currency?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Format a number as currency
 */
function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * InvoiceSummary component displays invoice totals
 *
 * Features:
 * - Displays: Subtotal, Discount (if any), Tax, Total
 * - Reactive: updates when tax rate or subtotal changes
 * - Format: Currency with 2 decimals
 * - Tax line shows rate and amount: "IVA 16%: $160.00"
 *
 * @example
 * <InvoiceSummary
 *   subtotal={1000}
 *   discountAmount={0}
 *   taxRate={16}
 * />
 */
export function InvoiceSummary({
  subtotal,
  discountAmount = 0,
  taxRate,
  currency = 'USD',
  className,
}: InvoiceSummaryProps) {
  // Calculate all amounts
  const amounts = useMemo(
    () => calculateInvoiceAmounts(subtotal, discountAmount, taxRate),
    [subtotal, discountAmount, taxRate]
  );

  return (
    <div
      className={cn('bg-muted/50 space-y-2 rounded-lg p-4', className)}
      data-testid="invoice-summary"
    >
      <h3 className="mb-3 font-medium">Resumen</h3>

      {/* Subtotal */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span data-testid="summary-subtotal">{formatCurrency(subtotal, currency)}</span>
      </div>

      {/* Discount (only show if > 0) */}
      {discountAmount > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Descuento</span>
          <span className="text-destructive" data-testid="summary-discount">
            -{formatCurrency(discountAmount, currency)}
          </span>
        </div>
      )}

      {/* Tax */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {taxRate > 0 ? `IVA ${taxRate}%` : 'Impuesto'}
        </span>
        <span data-testid="summary-tax">{formatCurrency(amounts.taxAmount, currency)}</span>
      </div>

      {/* Divider */}
      <div className="border-border my-2 border-t" />

      {/* Total */}
      <div className="flex items-center justify-between font-medium">
        <span>Total</span>
        <span className="text-lg" data-testid="summary-total">
          {formatCurrency(amounts.total, currency)}
        </span>
      </div>
    </div>
  );
}
