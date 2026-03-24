/**
 * KATA Framework - Type Facade: Auth Domain (SoloQ / Supabase)
 *
 * Type definitions for Supabase authentication endpoints.
 * Based on Supabase Auth REST API v1.
 *
 * Endpoints:
 * - POST /auth/v1/token?grant_type=password  → TokenResponse
 * - GET  /auth/v1/user                       → SupabaseUser (flat)
 *
 * Consumed by: tests/components/api/AuthApi.ts
 */

// ============================================================================
// Request Types
// ============================================================================

/**
 * Login request payload for Supabase password grant.
 * POST /auth/v1/token?grant_type=password
 */
export interface LoginPayload {
  email: string
  password: string
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Supabase user object — returned in both TokenResponse and /auth/v1/user.
 * Note: /auth/v1/user returns this FLAT (not wrapped in { user: {...} }).
 */
export interface SupabaseUser {
  id: string
  aud: string
  role: string
  email: string
  email_confirmed_at?: string
  confirmed_at?: string
  last_sign_in_at?: string
  created_at: string
  updated_at: string
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
}

/**
 * Token response from POST /auth/v1/token?grant_type=password.
 * Note: token_type is 'bearer' (lowercase) in Supabase.
 */
export interface TokenResponse {
  access_token: string
  token_type: string // 'bearer' (lowercase) — Supabase convention
  expires_in: number
  expires_at?: number
  refresh_token?: string
  user?: SupabaseUser // Included in the token response
}

/**
 * Response from GET /auth/v1/user.
 * Supabase returns the user object DIRECTLY (not wrapped).
 */
export type UserInfoResponse = SupabaseUser;

/**
 * Error response from Supabase Auth endpoints.
 */
export interface AuthErrorResponse {
  error: string
  error_description?: string
  status?: number
  message?: string
  code?: string
}
