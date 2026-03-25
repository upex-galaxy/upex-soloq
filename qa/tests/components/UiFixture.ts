/**
 * KATA Framework - Layer 4: UI Fixture
 *
 * Dependency Injection container for all UI components.
 * Provides unified access to UI testing capabilities.
 *
 * All UI components share the same page context from TestContext,
 * ensuring consistent browser state across components.
 *
 * HOW TO ADD NEW UI COMPONENTS:
 * 1. Create your component in tests/components/ui/YourPage.ts
 * 2. Import it here
 * 3. Add as readonly property
 * 4. Initialize in constructor passing the options
 */

import type { TestContextOptions } from '@TestContext';

import { ClientsPage } from '@ui/ClientsPage';
import { CreateClientPage } from '@ui/CreateClientPage';
import { ExamplePage } from '@ui/ExamplePage';
import { LoginPage } from '@ui/LoginPage';
import { UiBase } from '@ui/UiBase';

// ============================================
// UI Fixture Class
// ============================================

export class UiFixture extends UiBase {
  /** Login page component - handles authentication flows */
  readonly login: LoginPage;

  /** Clients page component - handles client management flows */
  readonly clients: ClientsPage;

  /** Create client page component - handles client creation flows */
  readonly createClient: CreateClientPage;

  /** Example component - reference only */
  readonly example: ExamplePage;

  constructor(options: TestContextOptions) {
    super(options);

    // All components receive the same options (same page context)
    this.login = new LoginPage(options);
    this.example = new ExamplePage(options);
    this.clients = new ClientsPage(options);
    this.createClient = new CreateClientPage(options);
  }
}
