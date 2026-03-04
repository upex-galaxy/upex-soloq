/**
 * KATA Framework - Layer 3: Login Page Component
 *
 * UI component for authentication via the login page.
 * Handles login flows for E2E tests.
 *
 * Page: /login (SoloQ)
 * Locators (role-based):
 * - Email: textbox "Email"
 * - Password: textbox "Contraseña"
 * - Submit: button "Iniciar Sesión"
 */

import type { TestContextOptions } from '@TestContext';

import { expect } from '@playwright/test';
import { UiBase } from '@ui/UiBase';
import { atc } from '@utils/decorators';

// ============================================
// Types - Login data structures
// ============================================

/**
 * Login credentials for UI authentication
 */
export interface LoginCredentials {
  email: string
  password: string
}

// ============================================
// Login Page Component
// ============================================

export class LoginPage extends UiBase {
  // ============================================
  // Locators (role-based for SoloQ)
  // ============================================
  readonly emailInput = () => this.page.getByRole('textbox', { name: 'Email' });
  readonly passwordInput = () => this.page.getByRole('textbox', { name: 'Contraseña' });
  readonly submitButton = () => this.page.getByRole('button', { name: 'Iniciar Sesión' });

  constructor(options: TestContextOptions) {
    super(options);
  }

  // ============================================
  // Helpers (Private)
  // ============================================

  /**
   * Fill login form and submit
   * Helper that combines fill + submit actions
   */
  private async fillAndSubmitLoginForm(credentials: LoginCredentials): Promise<void> {
    await this.emailInput().fill(credentials.email);
    await this.passwordInput().fill(credentials.password);
    await this.submitButton().click();
  }

  // ============================================
  // Navigation (Public)
  // ============================================

  /**
   * Navigate to the login page
   * Call this BEFORE using login ATCs
   */
  async goto(): Promise<void> {
    await this.page.goto(this.buildUrl('/login'));
  }

  // ============================================
  // ATCs - Complete Test Cases
  // ============================================

  /**
   * ATC: Login with valid credentials - expects success
   *
   * IMPORTANT: Call goto() before this ATC.
   * Fills credentials, submits, and verifies redirect to dashboard.
   *
   * @param credentials - Email and password
   */
  @atc('SQ-LOGIN-001')
  async loginSuccessfully(credentials: LoginCredentials): Promise<void> {
    await this.fillAndSubmitLoginForm(credentials);

    // Wait for authentication to complete and redirect to dashboard
    await this.page.waitForURL(url => url.pathname.includes('/dashboard'), { timeout: 15000 });
    await expect(this.page).toHaveURL(/.*\/dashboard.*/);
  }

  /**
   * ATC: Login with invalid credentials - expects error
   *
   * IMPORTANT: Call goto() before this ATC.
   * Fills invalid credentials, submits, and verifies error toast/alert.
   *
   * @param credentials - Invalid email or password
   */
  @atc('SQ-LOGIN-002')
  async loginWithInvalidCredentials(credentials: LoginCredentials): Promise<void> {
    await this.fillAndSubmitLoginForm(credentials);

    // SoloQ shows error via toast notification or alert
    // Wait a moment for the error to appear
    await this.page.waitForTimeout(1000);

    // Should stay on login page
    await expect(this.page).toHaveURL(/.*\/login.*/);
  }
}
