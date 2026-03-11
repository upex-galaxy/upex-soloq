'use client';

import { useMutation, useQueryClient, type UseMutateFunction } from '@tanstack/react-query';
import type { UpdateInvoiceData } from '@/lib/validations/invoice';
import type { InvoiceWithClient } from './use-invoices';

interface UpdateInvoiceInput {
  id: string;
  updates: UpdateInvoiceData;
}

interface FetchError {
  message: string;
  status: number;
}

interface UseUpdateInvoiceResult {
  mutate: UseMutateFunction<InvoiceWithClient, FetchError, UpdateInvoiceInput>;
  mutateAsync: (input: UpdateInvoiceInput) => Promise<InvoiceWithClient>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook for updating a draft invoice
 *
 * Used for both manual save and auto-save functionality.
 * Only works on draft invoices (TC-12).
 *
 * @returns Mutation result with update function
 *
 * @example
 * const { mutate: updateInvoice, isPending } = useUpdateInvoice();
 *
 * // Manual save (TC-01)
 * updateInvoice({ id: invoiceId, updates: { notes: 'Updated notes' } });
 *
 * // Auto-save (TC-02)
 * useEffect(() => {
 *   const timeout = setTimeout(() => {
 *     updateInvoice({ id: invoiceId, updates: formValues });
 *   }, 2000);
 *   return () => clearTimeout(timeout);
 * }, [formValues]);
 */
export function useUpdateInvoice(): UseUpdateInvoiceResult {
  const queryClient = useQueryClient();

  const mutation = useMutation<InvoiceWithClient, FetchError, UpdateInvoiceInput>({
    mutationFn: async ({ id, updates }) => {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.error || 'Error al guardar la factura',
          status: response.status,
        };
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (_, { id }) => {
      // Invalidate invoice detail query
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      // Invalidate invoices list
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
