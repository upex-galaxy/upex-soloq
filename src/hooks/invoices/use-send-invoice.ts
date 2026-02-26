'use client';

import { useMutation, useQueryClient, type UseMutateFunction } from '@tanstack/react-query';
import type { Invoice } from '@/lib/types';

/**
 * Response type for send invoice API
 */
interface SendInvoiceResponse {
  id: string;
  invoice_number: string;
  status: Invoice['status'];
  sent_at: string | null;
}

interface FetchError {
  message: string;
  status: number;
}

interface UseSendInvoiceResult {
  mutate: UseMutateFunction<SendInvoiceResponse, FetchError, string>;
  mutateAsync: (invoiceId: string) => Promise<SendInvoiceResponse>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook for sending an invoice (SQ-26)
 *
 * Changes invoice status from 'draft' to 'sent' and records the sent_at timestamp.
 * Also creates an invoice_event record for tracking.
 *
 * @returns Mutation result with send function
 *
 * @example
 * const { mutate: sendInvoice, isPending } = useSendInvoice();
 *
 * // Send from preview (TC-004)
 * sendInvoice(invoiceId, {
 *   onSuccess: () => {
 *     toast.success('Factura enviada');
 *     router.push('/invoices');
 *   }
 * });
 */
export function useSendInvoice(): UseSendInvoiceResult {
  const queryClient = useQueryClient();

  const mutation = useMutation<SendInvoiceResponse, FetchError, string>({
    mutationFn: async (invoiceId: string) => {
      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.error || 'Error al enviar la factura',
          status: response.status,
        };
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (_, invoiceId) => {
      // Invalidate invoice detail query
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      // Invalidate invoices list to reflect status change
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}
