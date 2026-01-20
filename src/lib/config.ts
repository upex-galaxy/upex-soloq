/**
 * Centralized configuration file for all environment variables
 * Import this file wherever you need access to env vars
 *
 * @example
 * import { supabaseUrl, supabaseAnonKey } from '@/lib/config'
 */

// =============================================================================
// Supabase Configuration
// =============================================================================

/**
 * Supabase Project URL
 * Used by both browser and server clients
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/**
 * Supabase Anonymous Key (public)
 * Safe to expose in browser - RLS policies protect data
 */
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase Service Role Key (secret)
 * NEVER expose in browser - bypasses RLS
 * Only available server-side
 */
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// =============================================================================
// Application Configuration
// =============================================================================

/**
 * Application base URL
 * Used for auth redirects and absolute URLs
 */
export const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Current environment
 */
export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';

// =============================================================================
// Runtime Validations
// =============================================================================

/**
 * Validate required environment variables
 * Throws descriptive errors if missing
 */
function validateEnv() {
  const errors: string[] = [];

  if (!supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  }

  if (!supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }

  if (errors.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${errors.map(e => `  - ${e}`).join('\n')}\n\n` +
        `Please check your .env file or environment configuration.\n` +
        `See .env.example for required variables.`
    );
  }
}

// Run validation on module load (only in non-test environments)
if (typeof window !== 'undefined' || process.env.NODE_ENV !== 'test') {
  validateEnv();
}

// =============================================================================
// Export all config as a single object (alternative import style)
// =============================================================================

export const config = {
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceRoleKey: supabaseServiceRoleKey,
  },
  app: {
    url: appUrl,
    isDev,
    isProd,
  },
} as const;
