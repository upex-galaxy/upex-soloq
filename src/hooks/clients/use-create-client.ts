'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ClientFormData } from '@/lib/validations/client';
import type { Client } from '@/lib/types';

interface CreateClientResponse {
  data?: Client;
  error?: string;
  details?: unknown;
}

interface CreateClientError {
  message: string;
  status: number;
}

/**
 * Hook for creating a new client
 *
 * Uses React Query mutation with cache invalidation on success.
 *
 * @example
 * const { mutate, isPending, isError, error } = useCreateClient();
 *
 * const handleSubmit = (data: ClientFormData) => {
 *   mutate(data, {
 *     onSuccess: () => router.push('/clients'),
 *     onError: (error) => toast.error(error.message),
 *   });
 * };
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation<Client, CreateClientError, ClientFormData>({
    mutationFn: async (data: ClientFormData) => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: CreateClientResponse = await response.json();

      if (!response.ok) {
        throw {
          message: result.error || 'Error al crear cliente',
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
      // Invalidate clients list cache to refetch with new data
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
