'use client';

import { useQuery } from '@tanstack/react-query';
import type { DashboardSummary } from '@/lib/types';

interface UseDashboardSummaryResult {
  data: DashboardSummary | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for fetching dashboard summary stats
 *
 * @returns Query result with dashboard summary data
 *
 * @example
 * const { data: summary } = useDashboardSummary();
 * // summary.pending_total, summary.overdue_count, etc.
 */
export function useDashboardSummary(): UseDashboardSummaryResult {
  const query = useQuery<{ data: DashboardSummary }, { message: string; status: number }>({
    queryKey: ['invoices', 'dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/invoices/dashboard');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.error || 'Error al cargar el dashboard',
          status: response.status,
        };
      }

      return response.json();
    },
    staleTime: 30 * 1000,
  });

  return {
    data: query.data?.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
