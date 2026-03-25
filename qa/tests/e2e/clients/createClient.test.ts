import type { CreateClientFormData } from '@/tests/components/ui/types/CreateClientFormTypes';
import { expect, test } from '@TestFixture';

test.describe('Create Client', () => {
  test.beforeEach(async ({ ui }) => {
    await ui.page.goto('/clients');
  });

  test('SQ-90: TC1: Should create client with valid data', async ({ ui }) => {
    const clientName = `Test Client ${new Date().getTime()}`;
    const clientEmail = `${clientName.toLowerCase().replaceAll(' ', '.')}@example.com`;
    const givenClientData: CreateClientFormData = {
      name: clientName,
      email: clientEmail,
      company: 'Test Company',
      phone: '1234567890',
      tax_id: '1234567890',
      address: 'Test Address',
      notes: 'Test Notes',
    };

    await ui.clients.goToCreateClientPage();
    await ui.createClient.createClientSuccessfully(givenClientData);

    const searchResults = await ui.clients.searchExistingClients('Test Client');
    const matchingClient = searchResults.find(client => client.name === clientName && client.email === clientEmail);
    expect(matchingClient).toBeDefined();
    if (matchingClient) {
      expect(matchingClient.company).toBe(givenClientData.company);
      expect(matchingClient.phone).toBe(givenClientData.phone);
      expect(matchingClient.tax_id).toBe(givenClientData.tax_id);
      expect(matchingClient.address).toBe(givenClientData.address);
      expect(matchingClient.notes).toBe(givenClientData.notes);
    }
  });
});
