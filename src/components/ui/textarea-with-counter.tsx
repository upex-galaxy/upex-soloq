'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

export interface TextareaWithCounterProps extends React.ComponentProps<'textarea'> {
  /** Maximum character limit */
  maxLength: number;
  /** Show warning style when at 90%+ of limit */
  showWarning?: boolean;
}

/**
 * Textarea with character counter
 *
 * Features:
 * - Shows current/max character count
 * - Visual warning at 90%+ capacity
 * - Hard limit via maxLength attribute
 * - Accessible with aria-describedby
 *
 * @example
 * ```tsx
 * <TextareaWithCounter
 *   maxLength={500}
 *   value={notes}
 *   onChange={(e) => setNotes(e.target.value)}
 *   placeholder="Add notes..."
 * />
 * ```
 */
function TextareaWithCounter({
  maxLength,
  showWarning = true,
  value,
  className,
  id,
  ...props
}: TextareaWithCounterProps) {
  const counterId = id ? `${id}-counter` : React.useId();
  const currentLength = typeof value === 'string' ? value.length : 0;
  const percentage = (currentLength / maxLength) * 100;
  const isNearLimit = showWarning && percentage >= 90;
  const isAtLimit = currentLength >= maxLength;

  return (
    <div className="relative">
      <Textarea
        id={id}
        value={value}
        maxLength={maxLength}
        aria-describedby={counterId}
        className={cn(
          'pb-7', // Extra padding at bottom for counter
          className
        )}
        {...props}
      />
      <div
        id={counterId}
        className={cn(
          'absolute bottom-2 right-3 text-xs',
          isAtLimit
            ? 'text-destructive font-medium'
            : isNearLimit
              ? 'text-amber-600 dark:text-amber-500'
              : 'text-muted-foreground'
        )}
        aria-live="polite"
        data-testid="character-counter"
      >
        {currentLength.toLocaleString()}/{maxLength.toLocaleString()}
      </div>
    </div>
  );
}

export { TextareaWithCounter };
