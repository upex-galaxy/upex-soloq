'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MarkAsPaidInput {
  invoiceId: string;
  amount_received: number;
  payment_method: string;
  payment_date: string;
  notes?: string | null;
  reference?: string | null;
}

interface MarkAsPaidResult {
  data: {
    id: string;
    invoice_id: string;
    amount_received: number;
    payment_method: string;
    payment_date: string;
    notes: string | null;
    reference: string | null;
  };
}

/**
 * Hook for marking an invoice as paid
 *
 * Creates a payment record and transitions invoice status to 'paid'.
 * Invalidates related queries (invoice detail, invoices list, dashboard).
 */
export function useMarkAsPaid() {
  const queryClient = useQueryClient();

  return useMutation<MarkAsPaidResult, Error, MarkAsPaidInput>({
    mutationFn: async ({ invoiceId, ...paymentData }) => {
      const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al registrar el pago');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      // Invalidate related queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'dashboard'] });
    },
  });
}
