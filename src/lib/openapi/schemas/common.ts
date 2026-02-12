/**
 * Common OpenAPI Schemas
 *
 * Reusable schemas for error responses, common types, etc.
 */

import { registry, z } from '../registry';

// ============================================================================
// Common Type Schemas
// ============================================================================

export const UUIDSchema = z.string().uuid().openapi({
  description: 'UUID v4 identifier',
  example: '550e8400-e29b-41d4-a716-446655440000',
});

export const TimestampSchema = z.string().datetime().openapi({
  description: 'ISO 8601 timestamp',
  example: '2026-01-15T10:30:00Z',
});

export const EmailSchema = z.string().email().openapi({
  description: 'Email address',
  example: 'cliente@ejemplo.com',
});

export const DateSchema = z.string().openapi({
  description: 'Date in YYYY-MM-DD format',
  example: '2026-02-10',
});

// ============================================================================
// Error Response Schemas
// ============================================================================

export const ErrorResponseSchema = z
  .object({
    error: z.string(),
    details: z.unknown().optional(),
  })
  .openapi('ErrorResponse');

export const ValidationErrorSchema = z
  .object({
    error: z.string(),
    details: z
      .object({
        formErrors: z.array(z.string()).optional(),
        fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
      })
      .optional(),
  })
  .openapi('ValidationError');

// ============================================================================
// Success Response Schemas
// ============================================================================

export const SuccessResponseSchema = z
  .object({
    success: z.literal(true),
    message: z.string().openapi({ description: 'Success message' }),
  })
  .openapi('SuccessResponse');

// ============================================================================
// Pagination Schema
// ============================================================================

export const PaginationSchema = z
  .object({
    page: z.number().int().positive().openapi({ description: 'Current page number', example: 1 }),
    totalPages: z
      .number()
      .int()
      .min(0)
      .openapi({ description: 'Total number of pages', example: 5 }),
    total: z.number().int().min(0).openapi({ description: 'Total number of items', example: 100 }),
  })
  .openapi('Pagination');

// ============================================================================
// Register Common Schemas
// ============================================================================

registry.register('UUID', UUIDSchema);
registry.register('Timestamp', TimestampSchema);
registry.register('Email', EmailSchema);
registry.register('Date', DateSchema);
registry.register('ErrorResponse', ErrorResponseSchema);
registry.register('ValidationError', ValidationErrorSchema);
registry.register('SuccessResponse', SuccessResponseSchema);
registry.register('Pagination', PaginationSchema);

// ============================================================================
// Inferred Types
// ============================================================================

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
