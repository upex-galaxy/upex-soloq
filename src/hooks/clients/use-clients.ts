'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Client } from '@/lib/types';

// =============================================================================
// Types
// =============================================================================

export interface ClientsListParams {
  search?: string;
  sortBy?: 'name' | 'created_at' | 'email';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ClientsListResponse {
  clients: Client[];
  total: number;
  page: number;
  totalPages: number;
  error?: string;
}

// =============================================================================
// Query Keys
// =============================================================================

export const clientsQueryKeys = {
  all: ['clients'] as const,
  list: (params: ClientsListParams) => ['clients', 'list', params] as const,
  detail: (id: string) => ['clients', 'detail', id] as const,
};

// =============================================================================
// Fetch Function
// =============================================================================

async function fetchClients(params: ClientsListParams): Promise<ClientsListResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  const url = `/api/clients?${searchParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Error al cargar clientes');
  }

  return response.json();
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to fetch clients list with search, sort, and pagination
 *
 * @param params - Query parameters for filtering/sorting/pagination
 * @returns Query result with clients data, loading state, and error
 *
 * @example
 * const { data, isLoading, error } = useClients({
 *   search: 'john',
 *   sortBy: 'name',
 *   sortOrder: 'asc',
 *   page: 1,
 *   limit: 20,
 * });
 */
export function useClients(params: ClientsListParams = {}) {
  return useQuery({
    queryKey: clientsQueryKeys.list(params),
    queryFn: () => fetchClients(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Hook to get invalidation function for clients queries
 *
 * @example
 * const invalidate = useInvalidateClients();
 * await invalidate(); // Invalidates all clients queries
 */
export function useInvalidateClients() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: clientsQueryKeys.all });
}
