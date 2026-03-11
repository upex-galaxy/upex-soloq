'use client';

import { forwardRef, useCallback } from 'react';

import { cn } from '@/lib/utils';
import { TAX_PRESETS } from '@/lib/utils/invoice-calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface TaxInputProps {
  /** Current tax rate value (0-100) */
  value: number;
  /** Callback when tax rate changes */
  onChange: (value: number) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
  /** Additional class names */
  className?: string;
}

/**
 * TaxInput component for invoice tax rate selection
 *
 * Features:
 * - Numeric input with "%" suffix
 * - Quick preset buttons for common LATAM tax rates
 * - Validation: 0-100, no negatives, 2 decimals
 * - Accessible: aria-labels, keyboard navigation
 *
 * @example
 * <TaxInput
 *   value={16}
 *   onChange={(rate) => setTaxRate(rate)}
 * />
 */
export const TaxInput = forwardRef<HTMLInputElement, TaxInputProps>(function TaxInput(
  { value, onChange, disabled = false, error, className },
  ref
) {
  // Handle input change with validation
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow empty input (treat as 0)
      if (inputValue === '') {
        onChange(0);
        return;
      }

      // Parse and validate
      const numValue = parseFloat(inputValue);

      // Ignore invalid input
      if (isNaN(numValue)) {
        return;
      }

      // Clamp to valid range and round to 2 decimals
      const clampedValue = Math.min(100, Math.max(0, numValue));
      const roundedValue = Math.round(clampedValue * 100) / 100;

      onChange(roundedValue);
    },
    [onChange]
  );

  // Handle preset selection
  const handlePresetClick = useCallback(
    (presetValue: number) => {
      onChange(presetValue);
    },
    [onChange]
  );

  return (
    <div className={cn('space-y-2', className)}>
      {/* Input with % suffix */}
      <div className="relative">
        <Input
          ref={ref}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          max="100"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          aria-label="Tasa de impuesto"
          aria-describedby={error ? 'tax-input-error' : undefined}
          aria-invalid={!!error}
          className={cn('pr-8', error && 'border-destructive')}
          data-testid="tax-input"
        />
        <span
          className="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm"
          aria-hidden="true"
        >
          %
        </span>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tasas de impuesto comunes">
        {TAX_PRESETS.map(preset => (
          <Button
            key={preset.value}
            type="button"
            variant={value === preset.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetClick(preset.value)}
            disabled={disabled}
            aria-pressed={value === preset.value}
            title={preset.description}
            data-testid={`tax-preset-${preset.value}`}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p id="tax-input-error" className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

TaxInput.displayName = 'TaxInput';
