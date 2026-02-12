'use client';

import { forwardRef, useCallback, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { calculateDiscountAmount } from '@/lib/utils/invoice-calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DiscountType } from '@/lib/validations/invoice';

export interface DiscountInputProps {
  /** Current invoice subtotal (for calculating amount and cap) */
  subtotal: number;
  /** Current discount type */
  discountType: DiscountType | null;
  /** Current discount value (percentage 0-100 or fixed amount) */
  discountValue: number;
  /** Callback when discount changes */
  onChange: (type: DiscountType | null, value: number) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
  /** Additional class names */
  className?: string;
}

/**
 * DiscountInput component for invoice discount selection
 *
 * Features:
 * - Toggle buttons for type (Porcentaje/Fijo)
 * - Numeric input with dynamic suffix (% or $)
 * - Warning when discount exceeds subtotal
 * - Preview of calculated discount amount
 * - Accessible: aria-labels, keyboard navigation
 *
 * @example
 * <DiscountInput
 *   subtotal={1000}
 *   discountType="percentage"
 *   discountValue={10}
 *   onChange={(type, value) => setDiscount(type, value)}
 * />
 */
export const DiscountInput = forwardRef<HTMLInputElement, DiscountInputProps>(
  function DiscountInput(
    { subtotal, discountType, discountValue, onChange, disabled = false, error, className },
    ref
  ) {
    // Calculate discount amount and check if capped
    const { amount: discountAmount, capped } = useMemo(
      () => calculateDiscountAmount(subtotal, discountType, discountValue),
      [subtotal, discountType, discountValue]
    );

    // Handle type toggle
    const handleTypeChange = useCallback(
      (newType: DiscountType | null) => {
        if (newType === discountType) {
          // Clicking same type deselects (no discount)
          onChange(null, 0);
        } else {
          // Reset value when changing type
          onChange(newType, 0);
        }
      },
      [discountType, onChange]
    );

    // Handle value change with validation
    const handleValueChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Allow empty input (treat as 0)
        if (inputValue === '') {
          onChange(discountType, 0);
          return;
        }

        // Parse and validate
        const numValue = parseFloat(inputValue);

        // Ignore invalid input
        if (isNaN(numValue)) {
          return;
        }

        // Don't allow negative values
        const clampedValue = Math.max(0, numValue);

        // For percentage, clamp to reasonable range (0-100 validated in schema)
        // For fixed, allow any positive value
        const roundedValue = Math.round(clampedValue * 100) / 100;

        onChange(discountType, roundedValue);
      },
      [discountType, onChange]
    );

    // Format discount amount for display
    const formattedAmount = useMemo(() => {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(discountAmount);
    }, [discountAmount]);

    const isActive = discountType !== null;

    return (
      <div className={cn('space-y-2', className)}>
        {/* Type toggle buttons */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tipo de descuento">
          <Button
            type="button"
            variant={discountType === 'percentage' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('percentage')}
            disabled={disabled}
            aria-pressed={discountType === 'percentage'}
            data-testid="discount-type-percentage"
          >
            Porcentaje
          </Button>
          <Button
            type="button"
            variant={discountType === 'fixed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('fixed')}
            disabled={disabled}
            aria-pressed={discountType === 'fixed'}
            data-testid="discount-type-fixed"
          >
            Monto fijo
          </Button>
        </div>

        {/* Value input (only show when type is selected) */}
        {isActive && (
          <div className="space-y-2">
            <div className="relative">
              <Input
                ref={ref}
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max={discountType === 'percentage' ? 100 : undefined}
                value={discountValue || ''}
                onChange={handleValueChange}
                disabled={disabled}
                placeholder={discountType === 'percentage' ? '0' : '0.00'}
                aria-label={
                  discountType === 'percentage' ? 'Porcentaje de descuento' : 'Monto de descuento'
                }
                aria-describedby={error ? 'discount-input-error' : undefined}
                aria-invalid={!!error || capped}
                className={cn('pr-8', (error || capped) && 'border-destructive')}
                data-testid="discount-value-input"
              />
              <span
                className="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                aria-hidden="true"
              >
                {discountType === 'percentage' ? '%' : '$'}
              </span>
            </div>

            {/* Preview of calculated amount */}
            {discountValue > 0 && (
              <p
                className={cn('text-sm', capped ? 'text-destructive' : 'text-muted-foreground')}
                data-testid="discount-preview"
              >
                Descuento aplicado: {formattedAmount}
              </p>
            )}

            {/* Warning when discount exceeds subtotal */}
            {capped && (
              <div
                className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md px-3 py-2 text-sm"
                role="alert"
                data-testid="discount-warning"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>El descuento se ha limitado al subtotal ({formattedAmount})</span>
              </div>
            )}
          </div>
        )}

        {/* No discount message */}
        {!isActive && (
          <p className="text-muted-foreground text-sm" data-testid="discount-inactive">
            Selecciona un tipo de descuento para aplicar
          </p>
        )}

        {/* Error message */}
        {error && (
          <p id="discount-input-error" className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

DiscountInput.displayName = 'DiscountInput';
