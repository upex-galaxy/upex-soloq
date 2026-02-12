/**
 * Invoices OpenAPI Schemas
 *
 * Schemas for /api/invoices endpoints
 */

import { registry, z } from '../registry';

// ============================================================================
// Enums
// ============================================================================

export const InvoiceStatusSchema = z
  .enum(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
  .openapi('InvoiceStatus');

export const DiscountTypeSchema = z.enum(['percentage', 'fixed']).openapi('DiscountType');

// ============================================================================
// Invoice Item Schema
// ============================================================================

export const InvoiceItemSchema = z
  .object({
    id: z.string().uuid().openapi({ description: 'Item UUID' }),
    description: z
      .string()
      .openapi({ description: 'Line item description', example: 'Desarrollo de landing page' }),
    quantity: z.number().positive().openapi({ description: 'Quantity', example: 10 }),
    unit_price: z.number().min(0).openapi({ description: 'Unit price in cents', example: 5000 }),
    subtotal: z.number().min(0).openapi({ description: 'Line subtotal', example: 50000 }),
  })
  .openapi('InvoiceItem');

// ============================================================================
// Client Subset (for invoice responses)
// ============================================================================

export const InvoiceClientSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    company: z.string().nullable(),
    tax_id: z.string().nullable(),
    address: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
  })
  .openapi('InvoiceClient');

// ============================================================================
// Business Profile (for invoice responses)
// ============================================================================

export const BusinessProfileSchema = z
  .object({
    business_name: z.string().nullable(),
    contact_email: z.string().nullable(),
    contact_phone: z.string().nullable(),
    address: z.string().nullable(),
    tax_id: z.string().nullable(),
    logo_url: z.string().nullable(),
    default_terms: z.string().nullable(),
  })
  .openapi('BusinessProfile');

// ============================================================================
// Invoice Entity Schema
// ============================================================================

export const InvoiceSchema = z
  .object({
    id: z.string().uuid().openapi({ description: 'Invoice UUID' }),
    invoice_number: z.string().openapi({ description: 'Invoice number', example: 'INV-2026-0001' }),
    issue_date: z
      .string()
      .openapi({ description: 'Issue date (YYYY-MM-DD)', example: '2026-02-10' }),
    due_date: z.string().openapi({ description: 'Due date (YYYY-MM-DD)', example: '2026-03-12' }),
    status: InvoiceStatusSchema,
    notes: z.string().nullable().openapi({ description: 'Invoice notes' }),
    terms: z.string().nullable().openapi({ description: 'Payment terms' }),
    subtotal: z.number().openapi({ description: 'Subtotal before tax/discount', example: 100000 }),
    discount_type: DiscountTypeSchema.nullable(),
    discount_value: z.number().nullable().openapi({ description: 'Discount amount', example: 0 }),
    tax_rate: z.number().nullable().openapi({ description: 'Tax rate percentage', example: 21 }),
    tax_amount: z.number().nullable().openapi({ description: 'Tax amount', example: 21000 }),
    total: z.number().openapi({ description: 'Total amount', example: 121000 }),
    currency: z.string().openapi({ description: 'Currency code', example: 'ARS' }),
  })
  .openapi('Invoice');

// ============================================================================
// Invoice With Details (for GET /invoices/[id])
// ============================================================================

export const InvoiceWithDetailsSchema = InvoiceSchema.extend({
  client: InvoiceClientSchema,
  items: z.array(InvoiceItemSchema),
  business_profile: BusinessProfileSchema.nullable(),
}).openapi('InvoiceWithDetails');

// ============================================================================
// Request Schemas
// ============================================================================

export const CreateInvoiceRequestSchema = z
  .object({
    clientId: z
      .string()
      .uuid()
      .openapi({ description: 'Client UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    dueDate: z
      .string()
      .optional()
      .openapi({ description: 'Due date (YYYY-MM-DD)', example: '2026-03-12' }),
    notes: z.string().max(2000).optional().openapi({ description: 'Invoice notes' }),
    terms: z.string().max(1000).optional().openapi({ description: 'Payment terms' }),
    taxRate: z
      .number()
      .min(0)
      .max(100)
      .optional()
      .openapi({ description: 'Tax rate %', example: 21 }),
    items: z
      .array(
        z.object({
          description: z.string().min(1).max(500),
          quantity: z.number().positive(),
          unitPrice: z.number().min(0),
        })
      )
      .optional()
      .openapi({ description: 'Line items (for future use)' }),
  })
  .openapi('CreateInvoiceRequest');

// ============================================================================
// Response Schemas
// ============================================================================

export const CreateInvoiceResponseSchema = z
  .object({
    data: InvoiceSchema.extend({
      client: InvoiceClientSchema.pick({
        id: true,
        name: true,
        email: true,
        company: true,
        tax_id: true,
      }),
    }).optional(),
    error: z.string().optional(),
    details: z.unknown().optional(),
  })
  .openapi('CreateInvoiceResponse');

export const GetInvoiceResponseSchema = z
  .object({
    data: InvoiceWithDetailsSchema.optional(),
    error: z.string().optional(),
  })
  .openapi('GetInvoiceResponse');

// ============================================================================
// Register Schemas
// ============================================================================

registry.register('InvoiceStatus', InvoiceStatusSchema);
registry.register('DiscountType', DiscountTypeSchema);
registry.register('InvoiceItem', InvoiceItemSchema);
registry.register('InvoiceClient', InvoiceClientSchema);
registry.register('BusinessProfile', BusinessProfileSchema);
registry.register('Invoice', InvoiceSchema);
registry.register('InvoiceWithDetails', InvoiceWithDetailsSchema);
registry.register('CreateInvoiceRequest', CreateInvoiceRequestSchema);
registry.register('CreateInvoiceResponse', CreateInvoiceResponseSchema);
registry.register('GetInvoiceResponse', GetInvoiceResponseSchema);

// ============================================================================
// Register Endpoints
// ============================================================================

// POST /invoices - Create invoice
registry.registerPath({
  method: 'post',
  path: '/invoices',
  tags: ['Invoices'],
  summary: 'Create a new invoice',
  description:
    'Create a new draft invoice for the authenticated user. Invoice number is auto-generated.',
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateInvoiceRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Invoice created successfully',
      content: {
        'application/json': {
          schema: CreateInvoiceResponseSchema,
        },
      },
    },
    400: {
      description: 'Validation error or invalid clientId',
      content: {
        'application/json': {
          schema: z.object({ error: z.string(), details: z.unknown().optional() }),
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    404: {
      description: 'Client not found',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});

// GET /invoices/{id} - Get invoice with details
registry.registerPath({
  method: 'get',
  path: '/invoices/{id}',
  tags: ['Invoices'],
  summary: 'Get invoice by ID',
  description: 'Get invoice with client, items, and business profile for PDF generation',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ description: 'Invoice UUID' }),
    }),
  },
  responses: {
    200: {
      description: 'Invoice found',
      content: {
        'application/json': {
          schema: GetInvoiceResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    404: {
      description: 'Invoice not found',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});

// ============================================================================
// Inferred Types
// ============================================================================

export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;
export type DiscountType = z.infer<typeof DiscountTypeSchema>;
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
export type InvoiceClient = z.infer<typeof InvoiceClientSchema>;
export type BusinessProfile = z.infer<typeof BusinessProfileSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceWithDetails = z.infer<typeof InvoiceWithDetailsSchema>;
export type CreateInvoiceRequest = z.infer<typeof CreateInvoiceRequestSchema>;
export type CreateInvoiceResponse = z.infer<typeof CreateInvoiceResponseSchema>;
export type GetInvoiceResponse = z.infer<typeof GetInvoiceResponseSchema>;
