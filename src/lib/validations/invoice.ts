import { z } from 'zod';

/**
 * Zod schema for creating a new invoice
 * Used both client-side (React Hook Form) and server-side (API route)
 */
export const createInvoiceSchema = z.object({
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
});

/** Type inferred from the create invoice schema */
export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;

/**
 * Zod schema for API request validation
 * Includes additional server-side checks
 */
export const createInvoiceApiSchema = createInvoiceSchema.extend({
  // Server can receive items array for future use (SQ-22)
  items: z
    .array(
      z.object({
        description: z.string().min(1).max(500),
        quantity: z.number().positive(),
        unitPrice: z.number().min(0),
      })
    )
    .optional(),
});

export type CreateInvoiceApiData = z.infer<typeof createInvoiceApiSchema>;
