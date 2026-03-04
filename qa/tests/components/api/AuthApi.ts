/**
 * KATA Framework - Layer 3: Auth API Component
 *
 * API component for authentication operations using Supabase Auth.
 * Handles login, token management, and user info retrieval.
 *
 * Supabase Auth Endpoints:
 * - POST /auth/v1/token?grant_type=password - Authenticate with email/password
 * - GET /auth/v1/user - Get current user info (requires auth)
 */

import type { TokenResponse } from '@data/types';
import type { APIResponse } from '@playwright/test';
import type { TestContextOptions } from '@TestContext';

import { ApiBase } from '@api/ApiBase';
import { expect } from '@playwright/test';
import { attachRequestResponseToAllure } from '@utils/allure';
import { atc } from '@utils/decorators';

// Re-export TokenResponse for consumers that import from AuthApi
export type { TokenResponse } from '@data/types';

// ============================================
// Types - Supabase Auth API data structures
// ============================================

/**
 * Login request payload for Supabase Auth
 */
export interface LoginPayload {
  email: string
  password: string
}

/**
 * Supabase Auth error response
 */
export interface AuthErrorResponse {
  error: string
  error_description?: string
  msg?: string
}

/**
 * Supabase user info response from /auth/v1/user
 */
export interface UserInfoResponse {
  id: string
  aud: string
  role: string
  email: string
  email_confirmed_at: string
  phone: string
  confirmed_at: string
  last_sign_in_at: string
  app_metadata: {
    provider: string
    providers: string[]
  }
  user_metadata: {
    email: string
    email_verified: boolean
    phone_verified: boolean
    sub: string
  }
  created_at: string
  updated_at: string
}

// ============================================
// Auth API Component
// ============================================

export class AuthApi extends ApiBase {
  /** Supabase URL for auth requests */
  private readonly supabaseUrl: string;

  constructor(options: TestContextOptions) {
    super(options);
    this.supabaseUrl = this.config.supabaseUrl;
  }

  // ============================================
  // Supabase-specific HTTP Methods
  // ============================================

  /**
   * Build headers for Supabase requests
   * Includes apikey header required by Supabase Auth
   */
  private buildSupabaseHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': this.config.supabaseAnonKey,
    };

    // Add Authorization header if we have a token
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * POST to Supabase Auth endpoint
   * Uses supabaseUrl instead of apiUrl
   */
  private async supabaseAuthPOST<TBody, TPayload>(
    endpoint: string,
    data: TPayload,
  ): Promise<[APIResponse, TBody, TPayload]> {
    const url = `${this.supabaseUrl}${endpoint}`;
    const headers = this.buildSupabaseHeaders();

    const response = await this.request.post(url, {
      headers,
      data,
      timeout: this.config.browser.defaultTimeout,
    });

    const body = await this.getResponseJsonObject<TBody>(response);

    await attachRequestResponseToAllure({
      url: endpoint,
      method: 'POST',
      responseBody: body,
      requestBody: data,
    });

    return [response, body, data];
  }

  /**
   * GET from Supabase Auth endpoint
   * Uses supabaseUrl instead of apiUrl
   */
  private async supabaseAuthGET<TBody>(endpoint: string): Promise<[APIResponse, TBody]> {
    const url = `${this.supabaseUrl}${endpoint}`;
    const headers = this.buildSupabaseHeaders();

    const response = await this.request.get(url, {
      headers,
      timeout: this.config.browser.defaultTimeout,
    });

    const body = await this.getResponseJsonObject<TBody>(response);

    await attachRequestResponseToAllure({
      url: endpoint,
      method: 'GET',
      responseBody: body,
    });

    return [response, body];
  }

  // ============================================
  // ATCs - Complete Test Cases
  // ============================================

  /**
   * ATC: Authenticate with valid credentials - expects success (200)
   *
   * Complete flow: POST credentials to Supabase, validate token response, store token.
   * The token is automatically set for subsequent API requests.
   *
   * @param credentials - Email and password
   * @returns Tuple with response, token data, and sent payload
   */
  @atc('SQ-AUTH-001')
  async authenticateSuccessfully(
    credentials: LoginPayload,
  ): Promise<[APIResponse, TokenResponse, LoginPayload]> {
    const [response, body, sentPayload] = await this.supabaseAuthPOST<TokenResponse, LoginPayload>(
      this.config.auth.loginEndpoint,
      credentials,
    );

    // Fixed assertions - validates successful Supabase authentication
    expect(response.status()).toBe(200);
    expect(body.access_token).toBeDefined();
    expect(body.token_type?.toLowerCase()).toBe('bearer');
    expect(body.expires_in).toBeGreaterThan(0);

    // Store token for subsequent requests
    this.setAuthToken(body.access_token);

    return [response, body, sentPayload];
  }

  /**
   * ATC: Login with invalid credentials - expects error (400)
   *
   * Validates that invalid credentials return appropriate error response.
   * Supabase returns 400 for invalid credentials.
   *
   * @param credentials - Invalid email or password
   * @returns Tuple with error response and sent payload
   */
  @atc('SQ-AUTH-002')
  async loginWithInvalidCredentials(
    credentials: LoginPayload,
  ): Promise<[APIResponse, AuthErrorResponse, LoginPayload]> {
    const [response, body, sentPayload] = await this.supabaseAuthPOST<AuthErrorResponse, LoginPayload>(
      this.config.auth.loginEndpoint,
      credentials,
    );

    // Fixed assertions - validates error response (Supabase returns 400)
    expect(response.status()).toBe(400);
    expect(response.ok()).toBe(false);
    expect(body.error).toBeDefined();

    return [response, body, sentPayload];
  }

  /**
   * ATC: Get current user info - expects success (200)
   *
   * Retrieves authenticated user information from Supabase.
   * Requires a valid auth token to be set.
   *
   * @returns Tuple with response and user info
   */
  @atc('SQ-AUTH-003')
  async getCurrentUserSuccessfully(): Promise<[APIResponse, UserInfoResponse]> {
    const [response, body] = await this.supabaseAuthGET<UserInfoResponse>(this.config.auth.meEndpoint);

    // Fixed assertions - validates Supabase user info response
    expect(response.status()).toBe(200);
    expect(body.id).toBeDefined();
    expect(body.email).toBeDefined();

    return [response, body];
  }

  /**
   * ATC: Get current user without auth - expects unauthorized (401)
   *
   * Validates that unauthenticated requests are rejected.
   */
  @atc('SQ-AUTH-004')
  async getCurrentUserUnauthorized(): Promise<[APIResponse, Record<string, unknown>]> {
    // Temporarily clear auth token
    const savedToken = this.authToken;
    this.clearAuthToken();

    const [response, body] = await this.supabaseAuthGET<Record<string, unknown>>(this.config.auth.meEndpoint);

    // Restore token if it was set
    if (savedToken) {
      this.setAuthToken(savedToken);
    }

    // Fixed assertions - validates unauthorized response
    expect(response.status()).toBe(401);
    expect(response.ok()).toBe(false);

    return [response, body];
  }
}
