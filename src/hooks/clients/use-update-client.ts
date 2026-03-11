import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Client } from '@/lib/types';
import type { ClientFormData } from '@/lib/validations/client';

interface UpdateClientResponse {
  data?: Client;
  error?: string;
  details?: unknown;
}

interface UpdateClientVariables {
  id: string;
  data: ClientFormData;
}

/**
 * Updates a client via API
 */
async function updateClient({ id, data }: UpdateClientVariables): Promise<Client> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result: UpdateClientResponse = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Error al actualizar el cliente');
  }

  if (!result.data) {
    throw new Error('Error al actualizar el cliente');
  }

  return result.data;
}

/**
 * React Query mutation hook for updating a client
 *
 * Features:
 * - Automatic cache invalidation on success
 * - Invalidates both single client and clients list
 * - Error handling with descriptive messages
 *
 * @returns Mutation result with mutate function
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClient,
    onSuccess: (_, { id }) => {
      // Invalidate the specific client query
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      // Invalidate the clients list query
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
