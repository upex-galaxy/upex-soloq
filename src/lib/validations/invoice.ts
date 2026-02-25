import { z } from 'zod';

/**
 * Discount type enum matching database
 */
export const discountTypeSchema = z.enum(['percentage', 'fixed']);
export type DiscountType = z.infer<typeof discountTypeSchema>;

// =============================================================================
// Line Item Schemas (SQ-22)
// =============================================================================

/**
 * Maximum number of line items per invoice
 * Business rule: 50 items covers 99.9% of use cases
 * Warning shown at 45 items, blocked at 50
 */
export const MAX_LINE_ITEMS = 50;
export const LINE_ITEMS_WARNING_THRESHOLD = 45;

/**
 * Schema for a single line item
 * Used in both create and edit forms
 *
 * Business Rules (from Acceptance Test Plan):
 * - description: trim().length >= 1, max 500 chars (TC-07, TC-08, TC-10)
 * - quantity: > 0, decimals allowed up to 2 places (TC-09, TC-11)
 * - unit_price: >= 0, decimals allowed up to 2 places (TC-12)
 */
export const lineItemSchema = z.object({
  id: z.string().uuid().optional(), // Present for existing items
  description: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(500, 'Máximo 500 caracteres')
    .transform(val => val.trim())
    .refine(val => val.length >= 1, 'La descripción es requerida'),
  quantity: z
    .number({ message: 'La cantidad debe ser un número' })
    .positive('La cantidad debe ser mayor a 0')
    .multipleOf(0.01, 'Máximo 2 decimales'),
  unitPrice: z
    .number({ message: 'El precio debe ser un número' })
    .min(0, 'El precio debe ser mayor o igual a 0')
    .multipleOf(0.01, 'Máximo 2 decimales'),
});

export type LineItemFormData = z.infer<typeof lineItemSchema>;

/**
 * Schema for array of line items
 * Business Rule: Maximum 50 items per invoice (TC-13)
 */
export const lineItemsArraySchema = z
  .array(lineItemSchema)
  .max(MAX_LINE_ITEMS, `Máximo ${MAX_LINE_ITEMS} items por factura`);

export type LineItemsArrayData = z.infer<typeof lineItemsArraySchema>;

/**
 * Zod schema for creating a new invoice
 * Used both client-side (React Hook Form) and server-side (API route)
 *
 * Note: items array is required for form but can be empty for drafts.
 * When SENDING invoice, at least 1 item is required (business rule).
 */
export const createInvoiceSchema = z
  .object({
    clientId: z.string().uuid('Selecciona un cliente'),
    invoiceNumber: z
      .string()
      .max(20, 'El número de factura no puede exceder 20 caracteres')
      .regex(/^[A-Za-z0-9\-_/]*$/, 'Solo letras, números, guiones, guiones bajos y barras')
      .optional()
      .or(z.literal('')),
    dueDate: z
      .string()
      .optional()
      .refine(val => !val || !isNaN(Date.parse(val)), 'Fecha de vencimiento inválida'),
    notes: z
      .string()
      .max(2000, 'Las notas no pueden exceder 2000 caracteres')
      .optional()
      .or(z.literal('')),
    terms: z
      .string()
      .max(1000, 'Los términos no pueden exceder 1000 caracteres')
      .optional()
      .or(z.literal('')),
    taxRate: z
      .number()
      .min(0, 'La tasa de impuesto no puede ser negativa')
      .max(100, 'La tasa de impuesto no puede exceder 100%'),
    discountType: discountTypeSchema.nullable().optional(),
    discountValue: z.number().min(0, 'El descuento no puede ser negativo').nullable().optional(),
    // Line items (SQ-22) - required array, form provides default values
    items: lineItemsArraySchema,
  })
  .refine(
    data => {
      // If percentage type, value cannot exceed 100
      if (data.discountType === 'percentage' && data.discountValue && data.discountValue > 100) {
        return false;
      }
      return true;
    },
    {
      message: 'El porcentaje de descuento no puede exceder 100%',
      path: ['discountValue'],
    }
  );

/** Type inferred from the create invoice schema */
export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;

/**
 * Zod schema for API request validation
 * Same as form schema - items are processed on server
 */
export const createInvoiceApiSchema = createInvoiceSchema;

export type CreateInvoiceApiData = z.infer<typeof createInvoiceApiSchema>;

/**
 * Zod schema for updating an invoice (draft only)
 * All fields are optional since we support partial updates (auto-save)
 */
export const updateInvoiceSchema = z
  .object({
    clientId: z.string().uuid('Selecciona un cliente').optional(),
    invoiceNumber: z
      .string()
      .max(20, 'El número de factura no puede exceder 20 caracteres')
      .regex(/^[A-Za-z0-9\-_/]*$/, 'Solo letras, números, guiones, guiones bajos y barras')
      .optional()
      .or(z.literal('')),
    dueDate: z
      .string()
      .optional()
      .nullable()
      .refine(val => !val || !isNaN(Date.parse(val)), 'Fecha de vencimiento inválida'),
    notes: z
      .string()
      .max(2000, 'Las notas no pueden exceder 2000 caracteres')
      .optional()
      .nullable()
      .or(z.literal('')),
    terms: z
      .string()
      .max(1000, 'Los términos no pueden exceder 1000 caracteres')
      .optional()
      .nullable()
      .or(z.literal('')),
    taxRate: z
      .number()
      .min(0, 'La tasa de impuesto no puede ser negativa')
      .max(100, 'La tasa de impuesto no puede exceder 100%')
      .optional(),
    discountType: discountTypeSchema.nullable().optional(),
    discountValue: z.number().min(0, 'El descuento no puede ser negativo').nullable().optional(),
    // Line items (SQ-22) - optional for partial updates
    items: lineItemsArraySchema.optional(),
  })
  .refine(
    data => {
      // If percentage type, value cannot exceed 100
      if (data.discountType === 'percentage' && data.discountValue && data.discountValue > 100) {
        return false;
      }
      return true;
    },
    {
      message: 'El porcentaje de descuento no puede exceder 100%',
      path: ['discountValue'],
    }
  );

export type UpdateInvoiceData = z.infer<typeof updateInvoiceSchema>;
