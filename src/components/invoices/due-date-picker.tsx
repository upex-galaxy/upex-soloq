'use client';

import { forwardRef, useCallback, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  DUE_DATE_PRESETS,
  calculateDueDate,
  isPastDate,
  findMatchingPreset,
} from '@/lib/utils/date-presets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface DueDatePickerProps {
  /** Current date value in YYYY-MM-DD format */
  value: string;
  /** Callback when date changes */
  onChange: (value: string) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Error message from form validation */
  error?: string;
  /** Additional class names */
  className?: string;
}

/**
 * DueDatePicker component for invoice due date selection
 *
 * Features:
 * - Native date input for cross-browser compatibility
 * - Quick preset buttons (Today, 15 days, 30 days, 45 days, 60 days)
 * - Warning message for past dates (non-blocking)
 * - Accessible: aria-labels, keyboard navigation
 *
 * Based on SQ-28 requirements and TaxInput pattern.
 *
 * @example
 * <DueDatePicker
 *   value="2026-03-10"
 *   onChange={(date) => setDueDate(date)}
 * />
 */
export const DueDatePicker = forwardRef<HTMLInputElement, DueDatePickerProps>(
  function DueDatePicker({ value, onChange, disabled = false, error, className }, ref) {
    // Check if current value is a past date
    const isPast = useMemo(() => isPastDate(value), [value]);

    // Find if current value matches any preset
    const activePreset = useMemo(() => findMatchingPreset(value), [value]);

    // Handle direct input change
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
      },
      [onChange]
    );

    // Handle preset selection
    const handlePresetClick = useCallback(
      (days: number) => {
        const newDate = calculateDueDate(days);
        onChange(newDate);
      },
      [onChange]
    );

    return (
      <div className={cn('space-y-2', className)}>
        {/* Date Input */}
        <Input
          ref={ref}
          type="date"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          aria-label="Fecha de vencimiento"
          aria-describedby={error ? 'due-date-error' : isPast ? 'due-date-warning' : undefined}
          aria-invalid={!!error}
          className={cn(error && 'border-destructive', isPast && !error && 'border-warning')}
          data-testid="due-date-input"
        />

        {/* Preset buttons */}
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Presets de fecha de vencimiento"
        >
          {DUE_DATE_PRESETS.map(preset => (
            <Button
              key={preset.days}
              type="button"
              variant={activePreset?.days === preset.days ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetClick(preset.days)}
              disabled={disabled}
              aria-pressed={activePreset?.days === preset.days}
              title={preset.description}
              data-testid={`due-date-preset-${preset.days}`}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Past date warning (non-blocking) */}
        {isPast && !error && (
          <div
            id="due-date-warning"
            className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-500"
            role="alert"
            data-testid="due-date-past-warning"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>La fecha de vencimiento está en el pasado.</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p id="due-date-error" className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

DueDatePicker.displayName = 'DueDatePicker';
