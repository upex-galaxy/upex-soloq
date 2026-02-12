/**
 * OpenAPI Registry Configuration
 *
 * Central configuration for generating OpenAPI documentation
 * from Zod schemas. This is the source of truth for the API spec.
 */

import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Extend Zod with OpenAPI methods
extendZodWithOpenApi(z);

// Create the registry instance
export const registry = new OpenAPIRegistry();

// ============================================================================
// Security Schemes
// ============================================================================

// Cookie-based authentication (Supabase session)
registry.registerComponent('securitySchemes', 'cookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: 'sb-czuusjchqpgvanvbdrnz-auth-token',
  description: 'Supabase session cookie. Obtained automatically after login via the web app.',
});

// API Key authentication (for testing endpoints)
registry.registerComponent('securitySchemes', 'apiKeyAuth', {
  type: 'apiKey',
  in: 'header',
  name: 'X-API-Key',
  description: 'API key for testing endpoints. Use environment variable in testing.',
});

// Bearer token (for cron jobs)
registry.registerComponent('securitySchemes', 'cronAuth', {
  type: 'http',
  scheme: 'bearer',
  description: 'CRON_SECRET token for scheduled job endpoints.',
});

// ============================================================================
// OpenAPI Document Generator
// ============================================================================

export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'SoloQ - API',
      version: '1.0.0',
      description: `
## Custom API Endpoints

This documentation covers the custom Next.js API endpoints for SoloQ - Invoicing platform for LATAM freelancers.

---

## Authentication Methods

### 1. Cookie Auth (Most Endpoints)
The primary authentication method uses **Supabase session cookies**.

**Cookie name:** \`sb-czuusjchqpgvanvbdrnz-auth-token\`

**How to test:**
1. Login via the web app
2. Copy the auth cookie from DevTools
3. Add to your API requests

### 2. API Key Auth (Testing)
Some endpoints accept an API key header for testing.

**Header:** \`X-API-Key: [your-api-key]\`

### 3. Cron Auth (Scheduled Jobs)
Cron endpoints require Bearer token authorization.

**Header:** \`Authorization: Bearer CRON_SECRET\`

---

## Base URLs

| Environment | URL |
|------------|-----|
| Development | \`http://localhost:3000/api\` |
| Staging | \`https://soloq-staging.vercel.app/api\` |
| Production | \`https://soloq.vercel.app/api\` |
      `.trim(),
      contact: {
        name: 'UPEX Development Team',
        url: 'https://github.com/upex-galaxy/upex-soloq',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://soloq-staging.vercel.app/api',
        description: 'Staging server',
      },
      {
        url: 'https://soloq.vercel.app/api',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Clients',
        description: 'Client management endpoints',
      },
      {
        name: 'Invoices',
        description: 'Invoice management endpoints',
      },
      {
        name: 'System',
        description: 'System endpoints (health, openapi)',
      },
    ],
  });
}

// Re-export z with OpenAPI extensions
export { z };
