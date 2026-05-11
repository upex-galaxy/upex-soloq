import type { components, paths } from '@openapi';

export type Invoice = components['schemas']['Invoice'];
export type InvoiceInput = components['schemas']['InvoiceInput'];
export type Payment = components['schemas']['Payment'];
export type PaymentInput = components['schemas']['PaymentInput'];

export interface RuntimeInvoiceRecord {
  id?: string
  status?: string
  paid_at?: string | null
}

export interface RuntimePaymentRecord {
  id?: string
  invoice_id?: string
  payment_method?: string
  amount_received?: number
  payment_date?: string
}

type CreateInvoicePath = paths['/invoices']['post'];
export type CreateInvoiceRequest = CreateInvoicePath['requestBody']['content']['application/json'];
export type CreateInvoiceResponse = CreateInvoicePath['responses']['201']['content']['application/json'];

type GetInvoicePath = paths['/invoices/{invoiceId}']['get'];
export type GetInvoiceResponse = GetInvoicePath['responses']['200']['content']['application/json'];

type RegisterPaymentPath = paths['/invoices/{invoiceId}/payments']['post'];
export type RegisterPaymentRequest = RegisterPaymentPath['requestBody']['content']['application/json'];
export type RegisterPaymentResponse = RegisterPaymentPath['responses']['201']['content']['application/json'];

export interface RegisterPaymentRuntimeRequest {
  payment_method: string
  amount_received: number
  payment_date?: string
  reference?: string
  notes?: string
}

export interface CreateInvoiceRuntimeResponse extends CreateInvoiceResponse {
  data?: RuntimeInvoiceRecord
}

export interface GetInvoiceRuntimeResponse extends GetInvoiceResponse {
  data?: RuntimeInvoiceRecord
}

export interface RegisterPaymentRuntimeResponse extends RegisterPaymentResponse {
  data?: RuntimePaymentRecord
}
