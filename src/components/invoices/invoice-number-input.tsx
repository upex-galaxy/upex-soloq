'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useInvoiceNumber } from '@/hooks/invoices/use-invoice-number';
import { useDebouncedCallback } from 'use-debounce';

// =============================================================================
// Types
// =============================================================================

interface InvoiceNumberInputProps {
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Validation callback */
  onValidate?: (isValid: boolean, error?: string) => void;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Invoice Number Input with auto-generation and real-time validation
 *
 * Features:
 * - Auto-populates with next sequential number on mount
 * - Allows manual editing
 * - Validates uniqueness on blur (debounced)
 * - Refresh button to regenerate number
 * - Visual states: loading, valid, error
 *
 * @example
 * <InvoiceNumberInput
 *   value={invoiceNumber}
 *   onChange={setInvoiceNumber}
 *   onValidate={(isValid, error) => setFieldError('invoiceNumber', error)}
 * />
 */
export function InvoiceNumberInput({
  value,
  onChange,
  onValidate,
  disabled = false,
  className,
}: InvoiceNumberInputProps) {
  const { nextNumber, isLoadingNext, checkAvailability, isChecking, error, clearError, refresh } =
    useInvoiceNumber();

  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Auto-populate with next number when loaded
  useEffect(() => {
    if (nextNumber && !value && !hasInteracted) {
      onChange(nextNumber);
      setIsValid(true);
    }
  }, [nextNumber, value, hasInteracted, onChange]);

  // Debounced validation on change
  const debouncedValidate = useDebouncedCallback(async (number: string) => {
    if (!number.trim()) {
      setIsValid(null);
      clearError();
      onValidate?.(true);
      return;
    }

    // Skip validation if it's the auto-generated number
    if (number === nextNumber) {
      setIsValid(true);
      clearError();
      onValidate?.(true);
      return;
    }

    const result = await checkAvailability(number);
    setIsValid(result.available);
    onValidate?.(result.available, result.message);
  }, 300);

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setHasInteracted(true);
      onChange(newValue);

      // Reset validation state while typing
      if (isValid !== null) {
        setIsValid(null);
      }
    },
    [onChange, isValid]
  );

  // Handle blur - trigger validation
  const handleBlur = useCallback(() => {
    if (value.trim()) {
      debouncedValidate(value);
    }
  }, [value, debouncedValidate]);

  // Handle refresh button click
  const handleRefresh = useCallback(() => {
    refresh();
    setHasInteracted(false);
    setIsValid(null);
    clearError();
  }, [refresh, clearError]);

  // Determine visual state
  const getInputState = () => {
    if (isChecking) return 'checking';
    if (error) return 'error';
    if (isValid === true) return 'valid';
    return 'default';
  };

  const inputState = getInputState();

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="invoice-number">Número de factura</Label>

      <div className="flex gap-2">
        {isLoadingNext && !value ? (
          <Skeleton className="h-10 flex-1" data-testid="invoice-number-skeleton" />
        ) : (
          <div className="relative flex-1">
            <Input
              id="invoice-number"
              type="text"
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled}
              placeholder="Se generará automáticamente"
              maxLength={20}
              className={cn(
                'pr-10',
                inputState === 'error' && 'border-destructive focus-visible:ring-destructive',
                inputState === 'valid' && 'border-green-500 focus-visible:ring-green-500'
              )}
              data-testid="invoice-number-input"
            />

            {/* Status icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isChecking && (
                <Loader2
                  className="h-4 w-4 animate-spin text-muted-foreground"
                  data-testid="invoice-number-checking"
                />
              )}
              {inputState === 'valid' && !isChecking && (
                <Check className="h-4 w-4 text-green-500" data-testid="invoice-number-valid" />
              )}
              {inputState === 'error' && !isChecking && (
                <AlertCircle
                  className="h-4 w-4 text-destructive"
                  data-testid="invoice-number-error"
                />
              )}
            </div>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={disabled || isLoadingNext}
          title="Generar nuevo número"
          data-testid="invoice-number-refresh"
        >
          <RefreshCw className={cn('h-4 w-4', isLoadingNext && 'animate-spin')} />
        </Button>
      </div>

      {/* Helper text or error message */}
      {error ? (
        <p className="text-sm text-destructive" data-testid="invoice-number-error-message">
          {error}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Se generará automáticamente si lo dejas vacío
        </p>
      )}
    </div>
  );
}
