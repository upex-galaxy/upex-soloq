/**
 * KATA Framework - Layer 3: Auth API Component (SoloQ / Supabase)
 *
 * API component for authentication operations against Supabase Auth.
 * Handles login, token management, and user info retrieval.
 *
 * Endpoints:
 * - POST /auth/v1/token?grant_type=password  - Authenticate and get JWT token
 * - GET  /auth/v1/user                       - Get current user info (requires auth)
 *
 * Supabase Auth requires the 'apikey' header (anon key) on every request.
 * The Authorization: Bearer <token> header is set automatically by ApiBase
 * after calling setAuthToken().
 */

import type { APIResponse } from '@playwright/test';
import type { AuthErrorResponse, LoginPayload, TokenResponse, UserInfoResponse } from '@schemas/auth.types';
import type { TestContextOptions } from '@TestContext';

import { ApiBase } from '@api/ApiBase';
import { expect } from '@playwright/test';
import { atc } from '@utils/decorators';

// Re-export types for consumers that import from AuthApi
export type { AuthErrorResponse, LoginPayload, TokenResponse, UserInfoResponse } from '@schemas/auth.types';

// ============================================
// Auth API Component
// ============================================

export class AuthApi extends ApiBase {
  constructor(options: TestContextOptions) {
    super(options);
    // Supabase requires 'apikey' header for direct auth REST calls
    this.requestHeaders.apikey = this.config.supabase.anonKey;
  }

  /**
   * Override to route ALL AuthApi requests directly to Supabase.
   *
   * SoloQ architecture:
   * - AuthApi → Supabase directly (POST /auth/v1/token, GET /auth/v1/user)
   * - Domain APIs (ClientsApi, InvoicesApi, etc.) → Next.js app routes (/api/*)
   *   using Authorization: Bearer <token> (handled by createServerFromRequest)
   */
  override apiEndpoint(endpoint: string): string {
    const base = this.config.supabase.url.replace(/\/$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${cleanEndpoint}`;
  }

  // ============================================
  // Helpers - Read-only operations (no @atc)
  // ============================================

  /**
   * Helper: Get current authenticated user info.
   *
   * Read-only GET — used as a verification step inside ATCs
   * or for test-level assertions. Not an ATC because it's
   * just a data retrieval, not a complete action flow.
   *
   * Note: Supabase /auth/v1/user returns the user DIRECTLY (flat object).
   *
   * @returns Tuple with response and user info
   */
  async getCurrentUser(): Promise<[APIResponse, UserInfoResponse]> {
    const [response, body] = await this.apiGET<UserInfoResponse>(this.config.auth.meEndpoint);
    return [response, body];
  }

  // ============================================
  // ATCs - Complete Test Cases (ACTION + VERIFICATION)
  // ============================================

  /**
   * ATC: Authenticate with valid credentials - expects success (200)
   *
   * Complete flow:
   * 1. POST credentials to /auth/v1/token?grant_type=password (ACTION)
   * 2. GET /auth/v1/user to confirm session is valid (VERIFICATION)
   * 3. Validate token response and user info
   *
   * The token is automatically set for subsequent API requests.
   *
   * @param credentials - Email and password
   * @returns Tuple with response, token data, and sent payload
   */
  @atc('SQ-XXX')
  async authenticateSuccessfully(
    credentials: LoginPayload,
  ): Promise<[APIResponse, TokenResponse, LoginPayload]> {
    // ACTION: POST login credentials to Supabase
    const [response, body, sentPayload] = await this.apiPOST<TokenResponse, LoginPayload>(
      this.config.auth.loginEndpoint,
      credentials,
    );

    // Fixed assertions — Supabase token_type is 'bearer' (lowercase)
    expect(response.status()).toBe(200);
    expect(body.access_token).toBeDefined();
    expect(body.token_type).toBe('bearer');
    expect(body.expires_in).toBeGreaterThan(0);

    // Store token for subsequent requests (sets Authorization: Bearer header)
    this.setAuthToken(body.access_token);

    // VERIFICATION: Confirm the session is valid via GET /auth/v1/user
    // Supabase returns user DIRECTLY (flat object, not { user: {...} })
    const [meResponse, meBody] = await this.getCurrentUser();
    expect(meResponse.status()).toBe(200);
    expect(meBody.id).toBeDefined();
    expect(meBody.email).toBe(credentials.email);

    return [response, body, sentPayload];
  }

  /**
   * ATC: Login with invalid credentials - expects error (400)
   *
   * Complete flow:
   * 1. POST invalid credentials to /auth/v1/token?grant_type=password (ACTION)
   * 2. GET /auth/v1/user to confirm NO session was created (VERIFICATION)
   * 3. Validate error response and unauthorized access
   *
   * Note: Supabase returns 400 (not 401) for invalid credentials.
   *
   * @param credentials - Invalid email or password
   * @returns Tuple with error response and sent payload
   */
  @atc('SQ-XXX')
  async loginWithInvalidCredentials(
    credentials: LoginPayload,
  ): Promise<[APIResponse, AuthErrorResponse, LoginPayload]> {
    // ACTION: POST invalid credentials
    const [response, body, sentPayload] = await this.apiPOST<AuthErrorResponse, LoginPayload>(
      this.config.auth.loginEndpoint,
      credentials,
    );

    // Fixed assertions — Supabase returns 400 for invalid credentials
    expect(response.status()).toBe(400);
    expect(response.ok()).toBe(false);
    expect(body.error).toBeDefined();

    // VERIFICATION: Confirm no session was created via GET /auth/v1/user → 401
    const savedToken = this.authToken;
    this.clearAuthToken();
    const [meResponse] = await this.getCurrentUser();
    expect(meResponse.status()).toBe(401);
    // Restore token if one existed before this ATC
    if (savedToken) {
      this.setAuthToken(savedToken);
    }

    return [response, body, sentPayload];
  }
}
