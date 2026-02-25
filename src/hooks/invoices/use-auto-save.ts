'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useUpdateInvoice } from './use-update-invoice';
import type { UpdateInvoiceData } from '@/lib/validations/invoice';

interface UseAutoSaveOptions {
  /** Debounce delay in milliseconds (default: 2000ms per TC-02) */
  delay?: number;
  /** Callback when save succeeds */
  onSaveSuccess?: () => void;
  /** Callback when save fails */
  onSaveError?: (error: Error) => void;
}

interface UseAutoSaveResult {
  /** Whether there are unsaved changes (for TC-11 warning) */
  isDirty: boolean;
  /** Whether a save is currently in progress */
  isSaving: boolean;
  /** Whether the last save failed (for TC-09 error display) */
  isError: boolean;
  /** Error message if save failed */
  error: string | null;
  /** Timestamp of last successful save */
  lastSaved: Date | null;
  /** Manually trigger a save */
  saveNow: () => void;
  /** Mark form as clean (after navigation or manual save) */
  markClean: () => void;
  /** Reset error state */
  resetError: () => void;
}

/**
 * Hook for auto-saving invoice drafts with debounce
 *
 * Implements TC-02 (auto-save after 2s debounce) and related features:
 * - TC-09: Error handling for save failures
 * - TC-10: Doesn't save if no invoice ID (empty form)
 * - TC-11: Tracks dirty state for unsaved changes warning
 *
 * @param invoiceId - ID of the invoice to save (null for new invoices)
 * @param formValues - Current form values to save
 * @param options - Configuration options
 *
 * @example
 * const { isDirty, isSaving, lastSaved } = useAutoSave(
 *   invoiceId,
 *   watchedValues,
 *   {
 *     onSaveSuccess: () => toast.success('Draft saved'),
 *     onSaveError: (error) => toast.error(error.message),
 *   }
 * );
 *
 * // Show saving indicator
 * {isSaving && <span>Saving...</span>}
 * {lastSaved && <span>Saved at {lastSaved.toLocaleTimeString()}</span>}
 *
 * // Unsaved changes warning (TC-11)
 * useBeforeUnload(isDirty);
 */
export function useAutoSave(
  invoiceId: string | null,
  formValues: UpdateInvoiceData | null,
  options?: UseAutoSaveOptions
): UseAutoSaveResult {
  const { delay = 2000, onSaveSuccess, onSaveError } = options || {};

  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate: updateInvoice, isPending, isError, reset: resetMutation } = useUpdateInvoice();

  // Track if this is the first render (to prevent saving on mount)
  const isFirstRender = useRef(true);
  // Track previous values for comparison
  const prevValuesRef = useRef<string | null>(null);

  // Debounced save function (TC-02: 2 second debounce)
  const debouncedSave = useDebouncedCallback(
    (values: UpdateInvoiceData) => {
      if (!invoiceId) {
        // TC-10: No save if no invoice ID
        return;
      }

      updateInvoice(
        { id: invoiceId, updates: values },
        {
          onSuccess: () => {
            setIsDirty(false);
            setLastSaved(new Date());
            setErrorMessage(null);
            onSaveSuccess?.();
          },
          onError: error => {
            // TC-09: Keep dirty state on error so user knows data wasn't saved
            setErrorMessage(error.message || 'Error al guardar');
            onSaveError?.(new Error(error.message || 'Error al guardar'));
          },
        }
      );
    },
    delay,
    { leading: false, trailing: true }
  );

  // Watch for form value changes
  useEffect(() => {
    // Skip first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevValuesRef.current = formValues ? JSON.stringify(formValues) : null;
      return;
    }

    // Skip if no values or no invoice ID
    if (!formValues || !invoiceId) {
      return;
    }

    // Compare with previous values
    const currentValues = JSON.stringify(formValues);
    if (currentValues === prevValuesRef.current) {
      return;
    }

    prevValuesRef.current = currentValues;
    setIsDirty(true);
    setErrorMessage(null);
    debouncedSave(formValues);
  }, [formValues, invoiceId, debouncedSave]);

  // Cancel pending debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (!invoiceId || !formValues) return;

    // Cancel any pending debounced save
    debouncedSave.cancel();

    updateInvoice(
      { id: invoiceId, updates: formValues },
      {
        onSuccess: () => {
          setIsDirty(false);
          setLastSaved(new Date());
          setErrorMessage(null);
          onSaveSuccess?.();
        },
        onError: error => {
          setErrorMessage(error.message || 'Error al guardar');
          onSaveError?.(new Error(error.message || 'Error al guardar'));
        },
      }
    );
  }, [invoiceId, formValues, updateInvoice, debouncedSave, onSaveSuccess, onSaveError]);

  // Mark as clean (e.g., after successful navigation)
  const markClean = useCallback(() => {
    setIsDirty(false);
    debouncedSave.cancel();
  }, [debouncedSave]);

  // Reset error state
  const resetError = useCallback(() => {
    setErrorMessage(null);
    resetMutation();
  }, [resetMutation]);

  return {
    isDirty,
    isSaving: isPending,
    isError,
    error: errorMessage,
    lastSaved,
    saveNow,
    markClean,
    resetError,
  };
}
