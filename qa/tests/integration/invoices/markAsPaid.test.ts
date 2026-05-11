import type { CreateClientRequest } from '@schemas/clients.types';
import type { CreateInvoiceRequest, RegisterPaymentRuntimeRequest } from '@schemas/invoices.types';

import { expect, test } from '@TestFixture';

test.describe('SQ-211: Mark sent invoice as paid', {
  tag: ['@integration', '@critical', '@regression', '@sq-53'],
}, () => {
  test('SQ-211: should mark sent invoice as paid and persist payment metadata', async ({ api }) => {
    const uniqueId = Date.now().toString();
    const clientPayload: CreateClientRequest = {
      name: `SQ211 Client ${uniqueId}`,
      email: `sq211.client.${uniqueId}@example.com`,
      company: 'SoloQ QA',
    };

    const [, createdClient] = await api.clients.createClientSuccessfully(clientPayload);
    const clientId = createdClient.client?.id ?? createdClient.data?.id;
    expect(clientId).toBeDefined();

    const invoicePayload: CreateInvoiceRequest = {
      clientId: clientId as string,
      dueDate: '2030-12-31',
      items: [
        {
          description: 'Integration service retainer',
          quantity: 1,
          unitPrice: 1500,
        },
      ],
      taxRate: 0,
      status: 'draft',
      currency: 'USD',
    };

    const paymentPayload: RegisterPaymentRuntimeRequest = {
      payment_method: 'bank_transfer',
      amount_received: 1500,
      payment_date: new Date().toISOString().slice(0, 10),
      reference: `SQ211-PAY-${uniqueId}`,
      notes: 'Automated integration payment registration',
    };

    const [paymentResponse, paymentBody, sentPaymentPayload, refreshedInvoice, paidAt] = await api.invoices
      .markSentInvoiceAsPaidSuccessfully(invoicePayload, paymentPayload);

    expect(paymentResponse.status()).toBe(201);
    expect(paymentBody.payment?.id ?? paymentBody.data?.id).toBeDefined();
    expect(paymentBody.payment?.amountReceived ?? paymentBody.data?.amount_received).toBe(
      sentPaymentPayload.amount_received,
    );
    expect(paymentBody.payment?.paymentMethod ?? paymentBody.data?.payment_method).toBe(
      sentPaymentPayload.payment_method,
    );
    expect(refreshedInvoice.invoice?.status ?? refreshedInvoice.data?.status).toBe('paid');
    expect(paidAt).toBeTruthy();
  });
});
