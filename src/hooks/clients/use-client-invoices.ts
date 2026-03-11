'use client';

import { useQuery } from '@tanstack/react-query';
import type { Invoice } from '@/lib/types';

// =============================================================================
// Types
// =============================================================================

export interface InvoiceHistorySummary {
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
}

interface ClientInvoicesResponse {
  data?: Invoice[];
  summary?: InvoiceHistorySummary;
  error?: string;
}

interface UseClientInvoicesResult {
  invoices: Invoice[];
  summary: InvoiceHistorySummary;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Fetches invoice history for a specific client
 *
 * @param clientId - Client ID to fetch invoices for
 * @returns Query result with invoices list and summary totals
 *
 * @example
 * const { invoices, summary, isLoading } = useClientInvoices(clientId);
 */
export function useClientInvoices(clientId: string): UseClientInvoicesResult {
  const query = useQuery<ClientInvoicesResponse, Error>({
    queryKey: ['client-invoices', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/clients/${clientId}/invoices`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al cargar el historial de facturas');
      }

      return response.json();
    },
    enabled: !!clientId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const defaultSummary: InvoiceHistorySummary = {
    totalInvoiced: 0,
    totalPaid: 0,
    totalPending: 0,
  };

  return {
    invoices: query.data?.data || [],
    summary: query.data?.summary || defaultSummary,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
