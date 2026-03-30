import type { Locator } from '@playwright/test';
import type { TestContextOptions } from '@TestContext';
import type { ClientsResponse } from './types/ClientsResponseTypes';
import { UiBase } from '@ui/UiBase';
import { step } from '@utils/decorators';

export class ClientsPage extends UiBase {
  noFoundClients: Locator;

  constructor(options: TestContextOptions) {
    super(options);
    this.noFoundClients = this.page.getByText('No se encontraron clientes');
  }

  @step
  async goToCreateClientPage() {
    const newClientButton = this.page.getByText('Nuevo Cliente', { exact: true });
    await newClientButton.click();
    await this.expect(this.page).toHaveURL(/.*clients\/create.*/);
  }

  @step
  async searchClients(searchValue: string) {
    const searchBarInput = this.page.getByTestId('clients-search-input');
    const interceptionEndpoint = this.page.waitForResponse(response => response.url().includes('api/clients?'));
    await searchBarInput.fill(searchValue); // triggers the api/clients endpoint
    const response = await interceptionEndpoint;
    this.expect(response.status()).toBe(200);
    const body = await response.json() as ClientsResponse;
    const clients = body.clients;
    return clients;
  }

  // todo: @atc('')
  @step
  async searchExistingClients(searchValue: string) {
    const clients = await this.searchClients(searchValue);
    this.expect(clients.length).toBeGreaterThanOrEqual(1);
    await this.expect(this.noFoundClients).not.toBeVisible();
    return clients;
  }

  // todo: @atc('')
  @step
  async searchNoExistingClients(searchValue: string) {
    const clients = await this.searchClients(searchValue);
    this.expect(clients).toBe(0);
    await this.expect(this.noFoundClients).toBeVisible();
    return clients;
  }
}
