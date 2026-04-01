'use client';

import { useQuery } from '@tanstack/react-query';
import type { Invoice, Client, InvoiceStatus } from '@/lib/types';

/**
 * Invoice with client info for list views
 */
export interface InvoiceWithClient extends Invoice {
  client: Pick<Client, 'id' | 'name' | 'email' | 'company' | 'tax_id'>;
}

type InvoiceSortField = 'created_at' | 'updated_at' | 'issue_date' | 'due_date' | 'total' | 'invoice_number' | 'status';

interface UseInvoicesOptions {
  status?: InvoiceStatus;
  page?: number;
  limit?: number;
  sortBy?: InvoiceSortField;
  sortOrder?: 'asc' | 'desc';
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseInvoicesResult {
  data: InvoiceWithClient[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

interface FetchInvoicesError {
  message: string;
  status: number;
}

/**
 * Hook for fetching invoices list with filters and pagination
 *
 * @param options - Filter and pagination options
 * @returns Query result with invoices list
 *
 * @example
 * // Get all invoices
 * const { data: invoices } = useInvoices();
 *
 * // Get only draft invoices (TC-03)
 * const { data: drafts } = useInvoices({ status: 'draft' });
 */
export function useInvoices(options?: UseInvoicesOptions): UseInvoicesResult {
  const { status, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = options || {};

  const query = useQuery<
    { invoices: InvoiceWithClient[]; pagination: PaginationInfo },
    FetchInvoicesError
  >({
    queryKey: ['invoices', { status, page, limit, sortBy, sortOrder }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);

      const response = await fetch(`/api/invoices?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.error || 'Error al cargar las facturas',
          status: response.status,
        };
      }

      const result = await response.json();
      return {
        invoices: result.data || [],
        pagination: result.pagination,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    data: query.data?.invoices || [],
    pagination: query.data?.pagination || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
