'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RevertPaymentInput {
  invoiceId: string;
}

/**
 * Hook for reverting a paid invoice back to sent/overdue
 *
 * Soft deletes payment records and reverts invoice status.
 * Invalidates related queries (invoice detail, invoices list, dashboard).
 */
export function useRevertPayment() {
  const queryClient = useQueryClient();

  return useMutation<{ data: { invoiceId: string; newStatus: string } }, Error, RevertPaymentInput>(
    {
      mutationFn: async ({ invoiceId }) => {
        const response = await fetch(`/api/invoices/${invoiceId}/revert-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Error al revertir el pago');
        }

        return response.json();
      },
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        queryClient.invalidateQueries({ queryKey: ['invoices', 'dashboard'] });
      },
    }
  );
}
