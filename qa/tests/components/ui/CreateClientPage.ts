import type { TestContextOptions } from '@TestContext';
import type { CreateClientFormData } from './types/CreateClientFormTypes';
import { UiBase } from '@ui/UiBase';
import { atc, step } from '@utils/decorators';

export class CreateClientPage extends UiBase {
  constructor(options: TestContextOptions) {
    super(options);
  }

  @step
  async fillClientForm(clientFormData: CreateClientFormData) {
    const { name, email, company, phone, tax_id, address, notes } = clientFormData;
    name && await this.page.getByTestId('client-name-input').fill(name);
    email && await this.page.getByTestId('client-email-input').fill(email);
    company && await this.page.getByTestId('client-company-input').fill(company);
    phone && await this.page.getByTestId('client-phone-input').fill(phone);
    tax_id && await this.page.getByTestId('client-taxid-input').fill(tax_id);
    address && await this.page.getByTestId('client-address-input').fill(address);
    notes && await this.page.getByTestId('client-notes-input').fill(notes);
  }

  @step
  async cancelClientForm() {
    const cancelClientButton = this.page.getByTestId('client-form-cancel');
    await cancelClientButton.click();
    await this.expect(this.page).not.toHaveURL(/.*clients\/create.*/);
  }

  @step
  async submitClientForm() {
    const interceptionEndpoint = this.page.waitForResponse(response => response.url().includes('api/clients'));
    await this.page.getByTestId('client-form-submit').click();
    const response = await interceptionEndpoint;
    return response;
  }

  @atc('SQ-90')
  async createClientSuccessfully(clientFormData: CreateClientFormData) {
    await this.fillClientForm(clientFormData);
    const response = await this.submitClientForm();
    this.expect(response.ok()).toBe(true);
    await this.expect(this.page).not.toHaveURL(/.*clients\/create.*/);
    await this.expect(this.page.getByText('Cliente guardado correctamente')).toBeVisible();
    return response;
  }
}
