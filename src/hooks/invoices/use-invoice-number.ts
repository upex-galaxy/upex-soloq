'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

// =============================================================================
// Types
// =============================================================================

interface NextInvoiceNumberResponse {
  invoiceNumber: string;
  prefix: string;
  sequence: number;
}

interface CheckInvoiceNumberResponse {
  available: boolean;
  message?: string;
}

interface UseInvoiceNumberOptions {
  /** Current invoice ID to exclude from uniqueness check (for editing) */
  currentInvoiceId?: string;
}

interface UseInvoiceNumberReturn {
  /** The next auto-generated invoice number */
  nextNumber: string | undefined;
  /** Whether the next number is being fetched */
  isLoadingNext: boolean;
  /** Check if a custom invoice number is available */
  checkAvailability: (number: string) => Promise<{ available: boolean; message?: string }>;
  /** Whether availability check is in progress */
  isChecking: boolean;
  /** Current validation error message */
  error: string | null;
  /** Clear the error */
  clearError: () => void;
  /** Refresh the next number (invalidate cache) */
  refresh: () => void;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for managing invoice number auto-generation and validation
 *
 * @param options - Configuration options
 * @param options.currentInvoiceId - ID of current invoice to exclude from uniqueness check (for editing)
 *
 * @example
 * // For new invoices
 * const { nextNumber, checkAvailability } = useInvoiceNumber();
 *
 * // For editing existing invoices
 * const { checkAvailability } = useInvoiceNumber({ currentInvoiceId: invoice.id });
 *
 * // Use nextNumber as default value
 * // Call checkAvailability(customNumber) on blur
 * // Show error if validation fails
 */
export function useInvoiceNumber(options?: UseInvoiceNumberOptions): UseInvoiceNumberReturn {
  const { currentInvoiceId } = options || {};
  const queryClient = useQueryClient();
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch next invoice number
  const { data: nextNumberData, isLoading: isLoadingNext } = useQuery<NextInvoiceNumberResponse>({
    queryKey: ['invoice-next-number'],
    queryFn: async () => {
      const response = await fetch('/api/invoices/next-number');
      if (!response.ok) {
        throw new Error('Error al obtener número de factura');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Check if invoice number is available
  const checkAvailability = useCallback(
    async (number: string): Promise<{ available: boolean; message?: string }> => {
      if (!number.trim()) {
        setError(null);
        return { available: true };
      }

      setIsChecking(true);
      setError(null);

      try {
        // Build URL with optional excludeId for editing existing invoices
        let url = `/api/invoices/check-number?number=${encodeURIComponent(number.trim())}`;
        if (currentInvoiceId) {
          url += `&excludeId=${encodeURIComponent(currentInvoiceId)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al verificar número');
        }

        const result: CheckInvoiceNumberResponse = await response.json();

        if (!result.available && result.message) {
          setError(result.message);
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al verificar número';
        setError(message);
        return { available: false, message };
      } finally {
        setIsChecking(false);
      }
    },
    [currentInvoiceId]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh next number
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['invoice-next-number'] });
  }, [queryClient]);

  return {
    nextNumber: nextNumberData?.invoiceNumber,
    isLoadingNext,
    checkAvailability,
    isChecking,
    error,
    clearError,
    refresh,
  };
}
