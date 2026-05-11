import type { APIResponse } from '@playwright/test';
import type {
  CreateInvoiceRequest,
  CreateInvoiceRuntimeResponse,
  GetInvoiceRuntimeResponse,
  RegisterPaymentRuntimeRequest,
  RegisterPaymentRuntimeResponse,
} from '@schemas/invoices.types';

import { ApiBase } from '@api/ApiBase';
import { expect } from '@playwright/test';
import { atc, step } from '@utils/decorators';

export class InvoicesApi extends ApiBase {
  private readonly endpoints = {
    create: '/api/invoices',
    get: (invoiceId: string) => `/api/invoices/${invoiceId}`,
    registerPayment: (invoiceId: string) => `/api/invoices/${invoiceId}/payments`,
  };

  @step
  async createInvoiceSuccessfully(
    payload: CreateInvoiceRequest,
  ): Promise<[APIResponse, CreateInvoiceRuntimeResponse, CreateInvoiceRequest]> {
    const [response, body, sentPayload] = await this.apiPOST<CreateInvoiceRuntimeResponse, CreateInvoiceRequest>(
      this.endpoints.create,
      payload,
    );

    expect(response.status()).toBe(201);
    expect(body.invoice?.id ?? body.data?.id).toBeDefined();

    return [response, body, sentPayload];
  }

  @step
  async getInvoiceSuccessfully(invoiceId: string): Promise<[APIResponse, GetInvoiceRuntimeResponse]> {
    const [response, body] = await this.apiGET<GetInvoiceRuntimeResponse>(this.endpoints.get(invoiceId));

    expect(response.status()).toBe(200);
    expect(body.invoice?.id ?? body.data?.id).toBe(invoiceId);

    return [response, body];
  }

  @step
  async getInvoicePaidAtFromSupabase(invoiceId: string): Promise<string | null> {
    expect(this.authToken).toBeTruthy();

    const invoiceEndpoint = `${this.config.supabase.url}/rest/v1/invoices`;
    const response = await this.request.get(invoiceEndpoint, {
      headers: {
        apikey: this.config.supabase.anonKey,
        Authorization: `Bearer ${this.authToken as string}`,
      },
      params: {
        id: `eq.${invoiceId}`,
        select: 'paid_at,status',
        limit: '1',
      },
      timeout: this.config.browser.defaultTimeout,
    });

    expect(response.status()).toBe(200);

    const rows = (await response.json()) as Array<{ paid_at: string | null, status: string }>;
    expect(rows.length).toBe(1);
    expect(rows[0]?.status).toBe('paid');

    return rows[0]?.paid_at ?? null;
  }

  @atc('SQ-211')
  async markSentInvoiceAsPaidSuccessfully(
    invoicePayload: CreateInvoiceRequest,
    paymentPayload: RegisterPaymentRuntimeRequest,
  ): Promise<[
    APIResponse,
    RegisterPaymentRuntimeResponse,
    RegisterPaymentRuntimeRequest,
    GetInvoiceRuntimeResponse,
    string | null,
  ]> {
    const [, createdInvoice] = await this.createInvoiceSuccessfully(invoicePayload);
    const createdInvoiceId = createdInvoice.invoice?.id ?? createdInvoice.data?.id;

    expect(createdInvoiceId).toBeDefined();

    const [sentResponse] = await this.apiPOST<Record<string, unknown>, Record<string, never>>(
      `${this.endpoints.get(createdInvoiceId as string)}/send`,
      {},
    );
    expect(sentResponse.status()).toBe(200);

    const [paymentResponse, paymentBody, sentPaymentPayload] = await this.apiPOST<
      RegisterPaymentRuntimeResponse,
      RegisterPaymentRuntimeRequest
    >(
      this.endpoints.registerPayment(createdInvoiceId as string),
      paymentPayload,
    );

    expect(paymentResponse.status()).toBe(201);
    expect(paymentBody.payment?.id ?? paymentBody.data?.id).toBeDefined();

    const [, refreshedInvoice] = await this.getInvoiceSuccessfully(createdInvoiceId as string);
    expect(refreshedInvoice.invoice?.status ?? refreshedInvoice.data?.status).toBe('paid');

    const paidAt = await this.getInvoicePaidAtFromSupabase(createdInvoiceId as string);
    expect(paidAt).toBeTruthy();

    return [paymentResponse, paymentBody, sentPaymentPayload, refreshedInvoice, paidAt];
  }
}
