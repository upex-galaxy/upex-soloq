'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateInvoiceFormData } from '@/lib/validations/invoice';
import type { Invoice, Client } from '@/lib/types';

interface InvoiceWithClient extends Invoice {
  client: Pick<Client, 'id' | 'name' | 'email' | 'company' | 'tax_id'>;
}

interface CreateInvoiceResponse {
  data?: InvoiceWithClient;
  error?: string;
  details?: unknown;
}

interface CreateInvoiceError {
  message: string;
  status: number;
}

/**
 * Hook for creating a new invoice
 *
 * Uses React Query mutation with cache invalidation on success.
 *
 * @example
 * const { mutate, isPending, isError, error } = useCreateInvoice();
 *
 * const handleSubmit = (data: CreateInvoiceFormData) => {
 *   mutate(data, {
 *     onSuccess: (invoice) => router.push(`/invoices/${invoice.id}`),
 *     onError: (error) => toast.error(error.message),
 *   });
 * };
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation<InvoiceWithClient, CreateInvoiceError, CreateInvoiceFormData>({
    mutationFn: async (data: CreateInvoiceFormData) => {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: CreateInvoiceResponse = await response.json();

      if (!response.ok) {
        throw {
          message: result.error || 'Error al crear factura',
          status: response.status,
        };
      }

      if (!result.data) {
        throw {
          message: 'Respuesta inválida del servidor',
          status: 500,
        };
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate invoices list cache to refetch with new data
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
