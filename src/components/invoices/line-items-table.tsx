'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useFieldArray, useWatch, type Control, type FieldErrors } from 'react-hook-form';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  calculateLineTotal,
  calculateSubtotal,
} from '@/lib/utils/invoice-calculations';
import {
  MAX_LINE_ITEMS,
  LINE_ITEMS_WARNING_THRESHOLD,
  type LineItemFormData,
} from '@/lib/validations/invoice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';

// =============================================================================
// Types
// =============================================================================

export interface LineItemsTableProps {
  /** React Hook Form control for a form containing items array */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  /** Form errors object */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>;
  /** Callback when subtotal changes (for parent component calculations) */
  onSubtotalChange: (subtotal: number) => void;
  /** Whether inputs are disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Format a number as currency
 */
function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Default values for a new line item
 */
const DEFAULT_LINE_ITEM = {
  description: '',
  quantity: 1,
  unitPrice: 0,
};

// =============================================================================
// Component
// =============================================================================

/**
 * LineItemsTable - Editable table for invoice line items (SQ-22)
 *
 * Features:
 * - Dynamic row add/remove with useFieldArray
 * - Real-time line total calculation (qty × price)
 * - Real-time subtotal calculation
 * - Validation error display per field
 * - Maximum 50 items with warning at 45
 * - Cannot delete last item
 *
 * Test Cases Covered:
 * - TC-01: Add first line item
 * - TC-02: Add multiple items (max 50)
 * - TC-03: Line total calculation
 * - TC-04: Edit line item
 * - TC-05: Remove line item
 * - TC-06: Cannot delete last item
 * - TC-13: Max 50 items limit
 *
 * @example
 * <LineItemsTable
 *   control={form.control}
 *   errors={form.formState.errors}
 *   onSubtotalChange={setSubtotal}
 * />
 */
export function LineItemsTable({
  control,
  errors,
  onSubtotalChange,
  disabled = false,
  className,
}: LineItemsTableProps) {
  // useFieldArray for dynamic items management
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Watch all items for real-time calculations
  const watchedItems = useWatch({
    control,
    name: 'items',
    defaultValue: [],
  });

  // Calculate subtotal from watched items
  const subtotal = useMemo(() => {
    if (!watchedItems || watchedItems.length === 0) return 0;
    return calculateSubtotal(
      watchedItems.map((item: { quantity?: number; unitPrice?: number } | undefined) => ({
        quantity: item?.quantity ?? 0,
        unitPrice: item?.unitPrice ?? 0,
      }))
    );
  }, [watchedItems]);

  // Notify parent of subtotal changes
  useEffect(() => {
    onSubtotalChange(subtotal);
  }, [subtotal, onSubtotalChange]);

  // Add new item handler
  const handleAddItem = useCallback(() => {
    if (fields.length >= MAX_LINE_ITEMS) return;
    append(DEFAULT_LINE_ITEM);
  }, [fields.length, append]);

  // Remove item handler
  const handleRemoveItem = useCallback(
    (index: number) => {
      // TC-06: Cannot delete last item
      if (fields.length <= 1) return;
      remove(index);
    },
    [fields.length, remove]
  );

  // Calculate line total for display
  const getLineTotal = useCallback(
    (index: number): number => {
      const item = watchedItems?.[index];
      if (!item) return 0;
      return calculateLineTotal(item.quantity ?? 0, item.unitPrice ?? 0);
    },
    [watchedItems]
  );

  // Determine if we're at warning threshold
  const isAtWarningThreshold = fields.length >= LINE_ITEMS_WARNING_THRESHOLD;
  const isAtMaxLimit = fields.length >= MAX_LINE_ITEMS;
  const canRemoveItems = fields.length > 1;

  return (
    <div className={cn('space-y-4', className)} data-testid="line-items-table">
      {/* Header with title and add button */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Servicios / Productos</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          disabled={disabled || isAtMaxLimit}
          data-testid="add-line-item-btn"
        >
          <Plus className="mr-1 h-4 w-4" />
          Agregar item
        </Button>
      </div>

      {/* Warning at 45 items */}
      {isAtWarningThreshold && !isAtMaxLimit && (
        <div
          className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200"
          role="alert"
          data-testid="line-items-warning"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Has agregado {fields.length} items. El máximo es {MAX_LINE_ITEMS}.
          </span>
        </div>
      )}

      {/* Error at 50 items */}
      {isAtMaxLimit && (
        <div
          className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          role="alert"
          data-testid="line-items-max-error"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Has alcanzado el máximo de {MAX_LINE_ITEMS} items por factura.</span>
        </div>
      )}

      {/* Items table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Descripción</TableHead>
            <TableHead className="w-[15%]">Cantidad</TableHead>
            <TableHead className="w-[20%]">Precio Unitario</TableHead>
            <TableHead className="w-[15%] text-right">Total</TableHead>
            <TableHead className="w-[10%]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, index) => {
            // Type-safe access to item errors
            const itemsErrors = errors.items as Record<number, {
              description?: { message?: string };
              quantity?: { message?: string };
              unitPrice?: { message?: string };
            }> | undefined;
            const itemErrors = itemsErrors?.[index];
            const lineTotal = getLineTotal(index);

            return (
              <TableRow key={field.id} data-testid={`line-item-row-${index}`}>
                {/* Description */}
                <TableCell>
                  <div className="space-y-1">
                    <Input
                      {...control.register(`items.${index}.description`)}
                      placeholder="Descripción del servicio"
                      disabled={disabled}
                      aria-label={`Descripción item ${index + 1}`}
                      aria-invalid={!!itemErrors?.description}
                      className={cn(
                        itemErrors?.description && 'border-destructive'
                      )}
                      data-testid={`line-item-description-${index}`}
                    />
                    {itemErrors?.description && (
                      <p className="text-destructive text-xs" role="alert">
                        {itemErrors.description.message}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Quantity */}
                <TableCell>
                  <div className="space-y-1">
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.01"
                      {...control.register(`items.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                      disabled={disabled}
                      aria-label={`Cantidad item ${index + 1}`}
                      aria-invalid={!!itemErrors?.quantity}
                      className={cn(
                        'w-full',
                        itemErrors?.quantity && 'border-destructive'
                      )}
                      data-testid={`line-item-quantity-${index}`}
                    />
                    {itemErrors?.quantity && (
                      <p className="text-destructive text-xs" role="alert">
                        {itemErrors.quantity.message}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Unit Price */}
                <TableCell>
                  <div className="space-y-1">
                    <div className="relative">
                      <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                        $
                      </span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        {...control.register(`items.${index}.unitPrice`, {
                          valueAsNumber: true,
                        })}
                        disabled={disabled}
                        aria-label={`Precio unitario item ${index + 1}`}
                        aria-invalid={!!itemErrors?.unitPrice}
                        className={cn(
                          'pl-7',
                          itemErrors?.unitPrice && 'border-destructive'
                        )}
                        data-testid={`line-item-unit-price-${index}`}
                      />
                    </div>
                    {itemErrors?.unitPrice && (
                      <p className="text-destructive text-xs" role="alert">
                        {itemErrors.unitPrice.message}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Line Total (readonly) */}
                <TableCell className="text-right">
                  <span
                    className="font-medium"
                    data-testid={`line-item-total-${index}`}
                  >
                    {formatCurrency(lineTotal)}
                  </span>
                </TableCell>

                {/* Remove button */}
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    disabled={disabled || !canRemoveItems}
                    aria-label={`Eliminar item ${index + 1}`}
                    title={
                      canRemoveItems
                        ? 'Eliminar item'
                        : 'Debe haber al menos 1 item'
                    }
                    className="text-muted-foreground hover:text-destructive"
                    data-testid={`line-item-remove-${index}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} className="text-right font-medium">
              Subtotal
            </TableCell>
            <TableCell className="text-right">
              <span className="font-semibold" data-testid="line-items-subtotal">
                {formatCurrency(subtotal)}
              </span>
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>

      {/* Empty state message */}
      {fields.length === 0 && (
        <div
          className="text-muted-foreground py-8 text-center text-sm"
          data-testid="line-items-empty"
        >
          No hay items. Haz clic en &quot;Agregar item&quot; para comenzar.
        </div>
      )}
    </div>
  );
}
