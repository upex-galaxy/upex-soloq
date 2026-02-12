'use client';

import { useMutation, useQueryClient, type UseMutateFunction } from '@tanstack/react-query';

interface FetchError {
  message: string;
  status: number;
}

interface UseDeleteInvoiceResult {
  mutate: UseMutateFunction<boolean, FetchError, string>;
  mutateAsync: (id: string) => Promise<boolean>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook for deleting a draft invoice
 *
 * Only works on draft invoices (TC-05, TC-12).
 * Performs hard delete - cannot be undone.
 *
 * @returns Mutation result with delete function
 *
 * @example
 * const { mutate: deleteInvoice, isPending } = useDeleteInvoice();
 *
 * // Delete with confirmation (TC-05)
 * const handleDelete = () => {
 *   if (confirm('Are you sure?')) {
 *     deleteInvoice(invoiceId, {
 *       onSuccess: () => router.push('/invoices'),
 *     });
 *   }
 * };
 */
export function useDeleteInvoice(): UseDeleteInvoiceResult {
  const queryClient = useQueryClient();

  const mutation = useMutation<boolean, FetchError, string>({
    mutationFn: async id => {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.error || 'Error al eliminar la factura',
          status: response.status,
        };
      }

      return true;
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['invoice', id] });
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
