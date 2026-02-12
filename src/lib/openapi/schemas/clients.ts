/**
 * Clients OpenAPI Schemas
 *
 * Schemas for /api/clients endpoints
 */

import { registry, z } from '../registry';

// ============================================================================
// Client Entity Schema
// ============================================================================

export const ClientSchema = z
  .object({
    id: z
      .string()
      .uuid()
      .openapi({ description: 'Client UUID', example: '550e8400-e29b-41d4-a716-446655440000' }),
    user_id: z.string().uuid().openapi({ description: 'Owner user UUID' }),
    name: z.string().openapi({ description: 'Client name', example: 'Juan Pérez' }),
    email: z.string().email().openapi({ description: 'Client email', example: 'juan@empresa.com' }),
    company: z
      .string()
      .nullable()
      .openapi({ description: 'Company name', example: 'Empresa S.A.' }),
    phone: z
      .string()
      .nullable()
      .openapi({ description: 'Phone number', example: '+54 11 1234-5678' }),
    address: z
      .string()
      .nullable()
      .openapi({ description: 'Address', example: 'Av. Corrientes 1234, CABA' }),
    notes: z.string().nullable().openapi({ description: 'Internal notes' }),
    tax_id: z
      .string()
      .nullable()
      .openapi({ description: 'Tax ID (CUIT/RUT/RFC)', example: '20-12345678-9' }),
    created_at: z.string().datetime().openapi({ description: 'Creation timestamp' }),
    updated_at: z.string().datetime().openapi({ description: 'Last update timestamp' }),
    deleted_at: z.string().datetime().nullable().openapi({ description: 'Soft delete timestamp' }),
  })
  .openapi('Client');

// ============================================================================
// Request Schemas
// ============================================================================

export const CreateClientRequestSchema = z
  .object({
    name: z
      .string()
      .min(2)
      .max(100)
      .openapi({ description: 'Client name (2-100 chars)', example: 'María García' }),
    email: z
      .string()
      .email()
      .max(255)
      .openapi({ description: 'Client email', example: 'maria@empresa.com' }),
    company: z
      .string()
      .max(100)
      .optional()
      .openapi({ description: 'Company name', example: 'Tech Solutions' }),
    phone: z
      .string()
      .max(20)
      .optional()
      .openapi({ description: 'Phone number', example: '+54 11 5555-1234' }),
    address: z.string().max(500).optional().openapi({ description: 'Address' }),
    notes: z.string().max(1000).optional().openapi({ description: 'Internal notes' }),
    tax_id: z
      .string()
      .max(30)
      .optional()
      .openapi({ description: 'Tax ID', example: '27-98765432-1' }),
  })
  .openapi('CreateClientRequest');

export const UpdateClientRequestSchema = CreateClientRequestSchema.openapi('UpdateClientRequest');

// ============================================================================
// Response Schemas
// ============================================================================

export const ClientResponseSchema = z
  .object({
    data: ClientSchema.optional(),
    error: z.string().optional().openapi({ description: 'Error message if failed' }),
    details: z.unknown().optional().openapi({ description: 'Additional details' }),
  })
  .openapi('ClientResponse');

export const ListClientsResponseSchema = z
  .object({
    clients: z.array(ClientSchema).openapi({ description: 'Array of clients' }),
    total: z.number().int().openapi({ description: 'Total number of clients', example: 25 }),
    page: z.number().int().openapi({ description: 'Current page', example: 1 }),
    totalPages: z.number().int().openapi({ description: 'Total pages', example: 3 }),
    error: z.string().optional().openapi({ description: 'Error message if failed' }),
  })
  .openapi('ListClientsResponse');

export const DeleteClientResponseSchema = z
  .object({
    data: z
      .object({
        id: z.string().uuid(),
        name: z.string(),
      })
      .optional(),
    error: z.string().optional(),
  })
  .openapi('DeleteClientResponse');

// ============================================================================
// Query Parameters
// ============================================================================

export const ListClientsQuerySchema = z
  .object({
    search: z.string().optional().openapi({ description: 'Search in name, email, company' }),
    sortBy: z
      .enum(['name', 'created_at', 'email'])
      .optional()
      .openapi({ description: 'Sort field', example: 'name' }),
    sortOrder: z
      .enum(['asc', 'desc'])
      .optional()
      .openapi({ description: 'Sort order', example: 'asc' }),
    page: z.string().optional().openapi({ description: 'Page number', example: '1' }),
    limit: z.string().optional().openapi({ description: 'Items per page (max 50)', example: '20' }),
  })
  .openapi('ListClientsQuery');

// ============================================================================
// Register Schemas
// ============================================================================

registry.register('Client', ClientSchema);
registry.register('CreateClientRequest', CreateClientRequestSchema);
registry.register('UpdateClientRequest', UpdateClientRequestSchema);
registry.register('ClientResponse', ClientResponseSchema);
registry.register('ListClientsResponse', ListClientsResponseSchema);
registry.register('DeleteClientResponse', DeleteClientResponseSchema);
registry.register('ListClientsQuery', ListClientsQuerySchema);

// ============================================================================
// Register Endpoints
// ============================================================================

// GET /clients - List clients
registry.registerPath({
  method: 'get',
  path: '/clients',
  tags: ['Clients'],
  summary: 'List all clients',
  description: 'Get paginated list of clients with search, sort, and filter options',
  security: [{ cookieAuth: [] }],
  request: {
    query: ListClientsQuerySchema,
  },
  responses: {
    200: {
      description: 'List of clients',
      content: {
        'application/json': {
          schema: ListClientsResponseSchema,
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
  },
});

// POST /clients - Create client
registry.registerPath({
  method: 'post',
  path: '/clients',
  tags: ['Clients'],
  summary: 'Create a new client',
  description: 'Create a new client for the authenticated user',
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateClientRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Client created successfully',
      content: {
        'application/json': {
          schema: ClientResponseSchema,
        },
      },
    },
    400: {
      description: 'Validation error',
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
    409: {
      description: 'Client with same email already exists',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});

// GET /clients/{id} - Get single client
registry.registerPath({
  method: 'get',
  path: '/clients/{id}',
  tags: ['Clients'],
  summary: 'Get client by ID',
  description: 'Get a single client by their UUID',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ description: 'Client UUID' }),
    }),
  },
  responses: {
    200: {
      description: 'Client found',
      content: {
        'application/json': {
          schema: ClientResponseSchema,
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

// PUT /clients/{id} - Update client
registry.registerPath({
  method: 'put',
  path: '/clients/{id}',
  tags: ['Clients'],
  summary: 'Update a client',
  description: 'Update an existing client by UUID',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ description: 'Client UUID' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdateClientRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Client updated successfully',
      content: {
        'application/json': {
          schema: ClientResponseSchema,
        },
      },
    },
    400: {
      description: 'Validation error',
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
    409: {
      description: 'Client with same email already exists',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});

// DELETE /clients/{id} - Soft delete client
registry.registerPath({
  method: 'delete',
  path: '/clients/{id}',
  tags: ['Clients'],
  summary: 'Delete a client',
  description: 'Soft delete a client (sets deleted_at timestamp)',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ description: 'Client UUID' }),
    }),
  },
  responses: {
    200: {
      description: 'Client deleted successfully',
      content: {
        'application/json': {
          schema: DeleteClientResponseSchema,
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

// ============================================================================
// Inferred Types
// ============================================================================

export type Client = z.infer<typeof ClientSchema>;
export type CreateClientRequest = z.infer<typeof CreateClientRequestSchema>;
export type UpdateClientRequest = z.infer<typeof UpdateClientRequestSchema>;
export type ClientResponse = z.infer<typeof ClientResponseSchema>;
export type ListClientsResponse = z.infer<typeof ListClientsResponseSchema>;
export type DeleteClientResponse = z.infer<typeof DeleteClientResponseSchema>;
export type ListClientsQuery = z.infer<typeof ListClientsQuerySchema>;
