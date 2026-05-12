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
    revertPayment: (invoiceId: string) => `/api/invoices/${invoiceId}/revert-payment`,
    dashboard: '/api/invoices/dashboard',
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
    expect(rows[0]?.status).toBeDefined();

    return rows[0]?.paid_at ?? null;
  }

  @step
  async getInvoiceStatusAndPaidAtFromSupabase(invoiceId: string): Promise<{ status: string, paid_at: string | null }> {
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

    return rows[0] as { status: string, paid_at: string | null };
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

  @step
  async createSentInvoiceSuccessfully(
    payload: CreateInvoiceRequest,
  ): Promise<[APIResponse, CreateInvoiceRuntimeResponse, CreateInvoiceRequest]> {
    const [createResponse, createBody, sentPayload] = await this.createInvoiceSuccessfully(payload);
    const invoiceId = createBody.invoice?.id ?? createBody.data?.id;

    expect(invoiceId).toBeDefined();

    const [sendResponse] = await this.apiPOST<Record<string, unknown>, Record<string, never>>(
      `${this.endpoints.get(invoiceId as string)}/send`,
      {},
    );

    expect(sendResponse.status()).toBe(200);

    return [createResponse, createBody, sentPayload];
  }

  @atc('SQ-197')
  async registerPaymentMethodSuccessfully(
    invoicePayload: CreateInvoiceRequest,
    paymentPayload: RegisterPaymentRuntimeRequest,
  ): Promise<[APIResponse, RegisterPaymentRuntimeResponse, RegisterPaymentRuntimeRequest]> {
    const [, createdInvoice] = await this.createSentInvoiceSuccessfully(invoicePayload);
    const invoiceId = createdInvoice.invoice?.id ?? createdInvoice.data?.id;

    expect(invoiceId).toBeDefined();

    const [response, body, sentPayload] = await this.apiPOST<
      RegisterPaymentRuntimeResponse,
      RegisterPaymentRuntimeRequest
    >(
      this.endpoints.registerPayment(invoiceId as string),
      paymentPayload,
    );

    expect(response.status()).toBe(201);
    expect(body.data?.payment_method).toBe(sentPayload.payment_method);

    return [response, body, sentPayload];
  }

  @atc('SQ-200')
  async validatePaymentNotesLength(
    invoicePayload: CreateInvoiceRequest,
    validPayload: RegisterPaymentRuntimeRequest,
    invalidPayload: RegisterPaymentRuntimeRequest,
  ): Promise<[APIResponse, RegisterPaymentRuntimeResponse]> {
    const [validResponse] = await this.registerPaymentMethodSuccessfully(invoicePayload, validPayload);
    expect(validResponse.status()).toBe(201);

    const [, createdInvoice] = await this.createSentInvoiceSuccessfully(invoicePayload);
    const invoiceId = createdInvoice.invoice?.id ?? createdInvoice.data?.id;
    expect(invoiceId).toBeDefined();

    const [invalidResponse, invalidBody] = await this.apiPOST<Record<string, unknown>, RegisterPaymentRuntimeRequest>(
      this.endpoints.registerPayment(invoiceId as string),
      invalidPayload,
    );
    expect(invalidResponse.status()).toBe(400);
    return [invalidResponse, invalidBody as RegisterPaymentRuntimeResponse];
  }

  @atc('SQ-201')
  async registerPaymentWithCurrentDateSuccessfully(
    invoicePayload: CreateInvoiceRequest,
    paymentPayload: RegisterPaymentRuntimeRequest,
  ): Promise<[APIResponse, RegisterPaymentRuntimeResponse, RegisterPaymentRuntimeRequest]> {
    const [response, body, sentPayload] = await this.registerPaymentMethodSuccessfully(invoicePayload, paymentPayload);
    expect(body.data?.payment_date).toBe(sentPayload.payment_date);
    return [response, body, sentPayload];
  }

  @atc('SQ-202')
  async validatePaymentDateRules(
    invoicePayload: CreateInvoiceRequest,
    emptyDatePayload: RegisterPaymentRuntimeRequest,
    futureDatePayload: RegisterPaymentRuntimeRequest,
  ): Promise<[APIResponse, APIResponse]> {
    const [, createdInvoice] = await this.createSentInvoiceSuccessfully(invoicePayload);
    const invoiceId = createdInvoice.invoice?.id ?? createdInvoice.data?.id;
    expect(invoiceId).toBeDefined();

    const [emptyDateResponse] = await this.apiPOST<Record<string, unknown>, RegisterPaymentRuntimeRequest>(
      this.endpoints.registerPayment(invoiceId as string),
      emptyDatePayload,
    );
    expect(emptyDateResponse.status()).toBe(400);

    const [futureDateResponse] = await this.apiPOST<Record<string, unknown>, RegisterPaymentRuntimeRequest>(
      this.endpoints.registerPayment(invoiceId as string),
      futureDatePayload,
    );
    expect(futureDateResponse.status()).toBe(400);

    return [emptyDateResponse, futureDateResponse];
  }

  @atc('SQ-203')
  async revertPaymentSuccessfully(
    invoicePayload: CreateInvoiceRequest,
    paymentPayload: RegisterPaymentRuntimeRequest,
  ): Promise<[APIResponse, Record<string, unknown>]> {
    const [, createdInvoice] = await this.createSentInvoiceSuccessfully(invoicePayload);
    const invoiceId = createdInvoice.invoice?.id ?? createdInvoice.data?.id;
    expect(invoiceId).toBeDefined();

    const [paymentResponse] = await this.apiPOST<RegisterPaymentRuntimeResponse, RegisterPaymentRuntimeRequest>(
      this.endpoints.registerPayment(invoiceId as string),
      paymentPayload,
    );
    expect(paymentResponse.status()).toBe(201);

    const [revertResponse, revertBody] = await this.apiPOST<Record<string, unknown>, Record<string, never>>(
      this.endpoints.revertPayment(invoiceId as string),
      {},
    );

    expect(revertResponse.status()).toBe(200);
    return [revertResponse, revertBody];
  }

  @atc('SQ-204')
  async revertPaymentAuditSuccessfully(
    invoicePayload: CreateInvoiceRequest,
    paymentPayload: RegisterPaymentRuntimeRequest,
  ): Promise<[APIResponse, { status: string, paid_at: string | null }]> {
    const [, createdInvoice] = await this.createSentInvoiceSuccessfully(invoicePayload);
    const invoiceId = createdInvoice.invoice?.id ?? createdInvoice.data?.id;
    expect(invoiceId).toBeDefined();

    const [paymentResponse] = await this.apiPOST<RegisterPaymentRuntimeResponse, RegisterPaymentRuntimeRequest>(
      this.endpoints.registerPayment(invoiceId as string),
      paymentPayload,
    );
    expect(paymentResponse.status()).toBe(201);

    const [revertResponse] = await this.apiPOST<Record<string, unknown>, Record<string, never>>(
      this.endpoints.revertPayment(invoiceId as string),
      {},
    );
    expect(revertResponse.status()).toBe(200);

    const invoiceAudit = await this.getInvoiceStatusAndPaidAtFromSupabase(invoiceId as string);
    return [revertResponse, invoiceAudit];
  }
}
