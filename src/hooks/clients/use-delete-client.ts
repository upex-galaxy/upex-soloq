import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DeleteClientResponse {
  data?: { id: string; name: string };
  error?: string;
}

/**
 * Deletes a client via API (soft delete)
 */
async function deleteClient(id: string): Promise<{ id: string; name: string }> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
  });

  const result: DeleteClientResponse = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Error al eliminar el cliente');
  }

  if (!result.data) {
    throw new Error('Error al eliminar el cliente');
  }

  return result.data;
}

/**
 * React Query mutation hook for deleting a client
 *
 * Features:
 * - Soft delete (sets deleted_at)
 * - Automatic cache invalidation on success
 * - Returns deleted client info for success message
 *
 * @returns Mutation result with mutate function
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      // Invalidate the clients list query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
