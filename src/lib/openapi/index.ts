/**
 * OpenAPI Module Entry Point
 *
 * Central export for OpenAPI functionality:
 * - Registry for registering schemas and endpoints
 * - Generator for creating OpenAPI spec
 * - All domain schemas and types
 */

// Import schemas to ensure they're registered
import './schemas';

// Export registry and generator
export { registry, generateOpenAPIDocument, z } from './registry';

// Export all schemas and types
export * from './schemas';
