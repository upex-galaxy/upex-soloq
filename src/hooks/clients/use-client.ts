import { useQuery } from '@tanstack/react-query';
import type { Client } from '@/lib/types';

interface ClientResponse {
  data?: Client;
  error?: string;
}

/**
 * Fetches a single client by ID
 */
async function fetchClient(id: string): Promise<Client> {
  const response = await fetch(`/api/clients/${id}`);
  const result: ClientResponse = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Error al cargar el cliente');
  }

  if (!result.data) {
    throw new Error('Cliente no encontrado');
  }

  return result.data;
}

/**
 * React Query hook for fetching a single client by ID
 *
 * Features:
 * - Automatic caching with 2 minute stale time
 * - Background refetching
 * - Retry on failure
 *
 * @param id - Client ID to fetch
 * @returns Query result with client data
 */
export function useClient(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => fetchClient(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (garbage collection)
  });
}
