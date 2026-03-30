'use client';

import { useQuery } from '@tanstack/react-query';
import type { Invoice, InvoiceItem, Client, BusinessProfile, PaymentMethodType } from '@/lib/types';

/**
 * Extended invoice type with all related data needed for PDF generation
 */
export interface InvoiceWithDetails {
  // Invoice core data
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: Invoice['status'];
  notes: string | null;
  terms: string | null;

  // Amounts
  subtotal: number;
  discount_type: Invoice['discount_type'];
  discount_value: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string | null;

  // Related data
  client: Pick<Client, 'id' | 'name' | 'email' | 'company' | 'address' | 'tax_id' | 'phone'>;
  items: Array<Pick<InvoiceItem, 'id' | 'description' | 'quantity' | 'unit_price' | 'subtotal'>>;
  business_profile: Pick<
    BusinessProfile,
    | 'business_name'
    | 'contact_email'
    | 'contact_phone'
    | 'address'
    | 'tax_id'
    | 'logo_url'
    | 'default_terms'
  > | null;
  payment_methods: Array<{
    type: PaymentMethodType;
    label: string;
    value: string;
  }>;
}

interface UseInvoiceResult {
  data: InvoiceWithDetails | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

interface FetchInvoiceError {
  message: string;
  status: number;
}

/**
 * Hook for fetching a single invoice with all related data
 *
 * Fetches invoice with client, items, and business profile data
 * needed for PDF generation and invoice detail view.
 *
 * @param invoiceId - UUID of the invoice to fetch
 * @returns Query result with invoice data
 *
 * @example
 * const { data: invoice, isLoading } = useInvoice(invoiceId);
 * if (invoice) {
 *   console.log(invoice.invoice_number, invoice.client.name);
 * }
 */
export function useInvoice(invoiceId: string | undefined): UseInvoiceResult {
  const query = useQuery<InvoiceWithDetails | null, FetchInvoiceError>({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;

      const response = await fetch(`/api/invoices/${invoiceId}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.error || 'Error al cargar la factura',
          status: response.status,
        };
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!invoiceId,
    staleTime: 30 * 1000, // 30 seconds
    retry: (failureCount, error) => {
      // Don't retry on 404
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
