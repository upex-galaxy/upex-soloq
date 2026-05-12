import type { CreateClientRequest } from '@schemas/clients.types';
import type { CreateInvoiceRequest, RegisterPaymentRuntimeRequest } from '@schemas/invoices.types';

import { expect, test } from '@TestFixture';

function buildClientPayload(suffix: string): CreateClientRequest {
  return {
    name: `SQ Pay Client ${suffix}`,
    email: `sq.pay.${suffix}@example.com`,
    company: 'SoloQ QA',
  };
}

function buildInvoicePayload(clientId: string): CreateInvoiceRequest {
  return {
    clientId,
    dueDate: '2030-12-31',
    items: [{ description: 'Service package', quantity: 1, unitPrice: 1000 }],
    taxRate: 0,
    status: 'draft',
    currency: 'USD',
  };
}

test.describe('SQ-196 Candidate payment flows', {
  tag: ['@integration', '@regression', '@sq-39'],
}, () => {
  test('SQ-197: should persist selected payment method', {
    tag: ['@critical', '@sq-54'],
  }, async ({ api }) => {
    const id = Date.now().toString();
    const [, client] = await api.clients.createClientSuccessfully(buildClientPayload(id));
    const clientId = client.client?.id ?? client.data?.id;
    expect(clientId).toBeDefined();

    const paymentPayload: RegisterPaymentRuntimeRequest = {
      payment_method: 'mercado_pago',
      amount_received: 1000,
      payment_date: new Date().toISOString().slice(0, 10),
      reference: `SQ197-${id}`,
      notes: 'payment-method-persistence',
    };

    const [, body, sent] = await api.invoices.registerPaymentMethodSuccessfully(
      buildInvoicePayload(clientId as string),
      paymentPayload,
    );

    expect(body.data?.payment_method).toBe(sent.payment_method);
  });

  test('SQ-198: should reject unavailable payment method option', {
    tag: ['@high', '@sq-54'],
  }, async ({ api }) => {
    const id = (Date.now() + 1).toString();
    const [, client] = await api.clients.createClientSuccessfully(buildClientPayload(id));
    const clientId = client.client?.id ?? client.data?.id;
    expect(clientId).toBeDefined();

    const [, createdInvoice] = await api.invoices.createSentInvoiceSuccessfully(buildInvoicePayload(clientId as string));
    const invoiceId = createdInvoice.invoice?.id ?? createdInvoice.data?.id;
    expect(invoiceId).toBeDefined();

    const [response] = await api.apiPOST<Record<string, unknown>, RegisterPaymentRuntimeRequest>(
      `/api/invoices/${invoiceId as string}/payments`,
      {
        payment_method: 'wire_crypto',
        amount_received: 1000,
        payment_date: new Date().toISOString().slice(0, 10),
      },
    );

    expect(response.status()).toBe(400);
  });

  test('SQ-199: should persist multiline and special character notes', {
    tag: ['@critical', '@sq-56'],
  }, async ({ api }) => {
    const id = (Date.now() + 2).toString();
    const [, client] = await api.clients.createClientSuccessfully(buildClientPayload(id));
    const clientId = client.client?.id ?? client.data?.id;
    expect(clientId).toBeDefined();

    const notes = 'Line one\nLine two\nSpecial chars: !@#$%^&*()_+-=[]{}';
    const [, body] = await api.invoices.registerPaymentMethodSuccessfully(
      buildInvoicePayload(clientId as string),
      {
        payment_method: 'bank_transfer',
        amount_received: 1000,
        payment_date: new Date().toISOString().slice(0, 10),
        reference: `SQ199-${id}`,
        notes,
      },
    );

    expect(body.data?.notes).toBe(notes);
  });

  test('SQ-200: should accept 500 chars and reject 501 chars in notes', {
    tag: ['@high', '@sq-56'],
  }, async ({ api }) => {
    const id = (Date.now() + 3).toString();
    const [, client] = await api.clients.createClientSuccessfully(buildClientPayload(id));
    const clientId = client.client?.id ?? client.data?.id;
    expect(clientId).toBeDefined();

    const validNotes = 'a'.repeat(500);
    const invalidNotes = 'b'.repeat(501);

    const [invalidResponse] = await api.invoices.validatePaymentNotesLength(
      buildInvoicePayload(clientId as string),
      {
        payment_method: 'bank_transfer',
        amount_received: 1000,
        payment_date: new Date().toISOString().slice(0, 10),
        notes: validNotes,
      },
      {
        payment_method: 'bank_transfer',
        amount_received: 1000,
        payment_date: new Date().toISOString().slice(0, 10),
        notes: invalidNotes,
      },
    );

    expect(invalidResponse.status()).toBe(400);
  });

  test('SQ-201: should persist current date as payment date', {
    tag: ['@critical', '@sq-57'],
  }, async ({ api }) => {
    const id = (Date.now() + 4).toString();
    const [, client] = await api.clients.createClientSuccessfully(buildClientPayload(id));
    const clientId = client.client?.id ?? client.data?.id;
    expect(clientId).toBeDefined();

    const today = new Date().toISOString().slice(0, 10);
    const [, body] = await api.invoices.registerPaymentWithCurrentDateSuccessfully(
      buildInvoicePayload(clientId as string),
      {
        payment_method: 'bank_transfer',
        amount_received: 1000,
        payment_date: today,
      },
    );

    expect(body.data?.payment_date).toBe(today);
  });

  test('SQ-202: should reject empty and future payment dates', {
    tag: ['@high', '@sq-57'],
  }, async ({ api }) => {
    const id = (Date.now() + 5).toString();
    const [, client] = await api.clients.createClientSuccessfully(buildClientPayload(id));
    const clientId = client.client?.id ?? client.data?.id;
    expect(clientId).toBeDefined();

    const future = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const [emptyDateResponse, futureDateResponse] = await api.invoices.validatePaymentDateRules(
      buildInvoicePayload(clientId as string),
      {
        payment_method: 'bank_transfer',
        amount_received: 1000,
        payment_date: '',
      },
      {
        payment_method: 'bank_transfer',
        amount_received: 1000,
        payment_date: future,
      },
    );

    expect(emptyDateResponse.status()).toBe(400);
    expect(futureDateResponse.status()).toBe(400);
  });

  test('SQ-203: should revert payment consistently after confirmation', {
    tag: ['@critical', '@sq-58'],
  }, async ({ api }) => {
    const id = (Date.now() + 6).toString();
    const [, client] = await api.clients.createClientSuccessfully(buildClientPayload(id));
    const clientId = client.client?.id ?? client.data?.id;
    expect(clientId).toBeDefined();

    const [revertResponse] = await api.invoices.revertPaymentSuccessfully(
      buildInvoicePayload(clientId as string),
      {
        payment_method: 'bank_transfer',
        amount_received: 1000,
        payment_date: new Date().toISOString().slice(0, 10),
      },
    );

    expect(revertResponse.status()).toBe(200);
  });

  test('SQ-204: should update audit fields after revert', {
    tag: ['@critical', '@sq-58'],
  }, async ({ api }) => {
    const id = (Date.now() + 7).toString();
    const [, client] = await api.clients.createClientSuccessfully(buildClientPayload(id));
    const clientId = client.client?.id ?? client.data?.id;
    expect(clientId).toBeDefined();

    const [revertResponse, audit] = await api.invoices.revertPaymentAuditSuccessfully(
      buildInvoicePayload(clientId as string),
      {
        payment_method: 'bank_transfer',
        amount_received: 1000,
        payment_date: new Date().toISOString().slice(0, 10),
      },
    );

    expect(revertResponse.status()).toBe(200);
    expect(audit.status).toBe('sent');
    expect(audit.paid_at).toBeNull();
  });

  test('SQ-212: should block mark-as-paid for draft and cancelled invoices', {
    tag: ['@high', '@sq-53'],
  }, async ({ api }) => {
    const id = (Date.now() + 8).toString();
    const [, client] = await api.clients.createClientSuccessfully(buildClientPayload(id));
    const clientId = client.client?.id ?? client.data?.id;
    expect(clientId).toBeDefined();

    const [, createdDraftInvoice] = await api.invoices.createInvoiceSuccessfully(buildInvoicePayload(clientId as string));
    const draftInvoiceId = createdDraftInvoice.invoice?.id ?? createdDraftInvoice.data?.id;
    expect(draftInvoiceId).toBeDefined();

    const [draftPaymentResponse] = await api.apiPOST<Record<string, unknown>, RegisterPaymentRuntimeRequest>(
      `/api/invoices/${draftInvoiceId as string}/payments`,
      {
        payment_method: 'bank_transfer',
        amount_received: 1000,
        payment_date: new Date().toISOString().slice(0, 10),
      },
    );
    expect(draftPaymentResponse.status()).toBe(400);

    const [cancelResponse] = await api.apiPOST<Record<string, unknown>, Record<string, never>>(
      `/api/invoices/${draftInvoiceId as string}/cancel`,
      {},
    );
    expect(cancelResponse.status()).toBe(200);

    const [cancelledPaymentResponse] = await api.apiPOST<Record<string, unknown>, RegisterPaymentRuntimeRequest>(
      `/api/invoices/${draftInvoiceId as string}/payments`,
      {
        payment_method: 'bank_transfer',
        amount_received: 1000,
        payment_date: new Date().toISOString().slice(0, 10),
      },
    );
    expect(cancelledPaymentResponse.status()).toBe(400);
  });

  test('SQ-213: should update dashboard and audit after payment registration', {
    tag: ['@critical', '@sq-53'],
  }, async ({ api }) => {
    const id = (Date.now() + 9).toString();
    const [, client] = await api.clients.createClientSuccessfully(buildClientPayload(id));
    const clientId = client.client?.id ?? client.data?.id;
    expect(clientId).toBeDefined();

    const paymentPayload: RegisterPaymentRuntimeRequest = {
      payment_method: 'bank_transfer',
      amount_received: 1000,
      payment_date: new Date().toISOString().slice(0, 10),
      reference: `SQ213-${id}`,
    };

    const [, paymentBody, sentPayment, refreshedInvoice, paidAt] = await api.invoices.markSentInvoiceAsPaidSuccessfully(
      buildInvoicePayload(clientId as string),
      paymentPayload,
    );

    expect(paymentBody.data?.invoice_id).toBeDefined();
    expect(paymentBody.data?.amount_received).toBe(sentPayment.amount_received);
    expect(refreshedInvoice.data?.status ?? refreshedInvoice.invoice?.status).toBe('paid');
    expect(paidAt).toBeTruthy();

    const [dashboardResponse, dashboardBody] = await api.apiGET<Record<string, unknown>>('/api/invoices/dashboard');
    expect(dashboardResponse.status()).toBe(200);
    expect(dashboardBody).toBeDefined();
  });
});
