import { z } from 'zod';
import type { PaymentMethodType, PaymentMethodValue } from '@/lib/types';

// =============================================================================
// Value Schemas per Payment Type
// =============================================================================

export const bankTransferValueSchema = z.object({
  bank_name: z.string().min(1, 'Nombre del banco requerido'),
  account_number: z.string().optional().or(z.literal('')),
  clabe: z
    .string()
    .regex(/^\d{18}$/, 'CLABE debe tener 18 dígitos')
    .optional()
    .or(z.literal('')),
  cbu: z
    .string()
    .regex(/^\d{22}$/, 'CBU debe tener 22 dígitos')
    .optional()
    .or(z.literal('')),
});

export const paypalValueSchema = z.object({
  email: z.string().email('Email de PayPal inválido'),
});

export const mercadoPagoValueSchema = z
  .object({
    alias: z.string().optional().or(z.literal('')),
    cvu: z.string().optional().or(z.literal('')),
  })
  .refine((d) => (d.alias && d.alias.length > 0) || (d.cvu && d.cvu.length > 0), {
    message: 'Ingresa alias o CVU',
  });

export const cashValueSchema = z.object({
  instructions: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
});

export const otherValueSchema = z.object({
  name: z.string().min(1, 'Nombre del método requerido'),
  instructions: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
});

// =============================================================================
// Form Schema (top-level fields + dynamic value)
// =============================================================================

export const paymentMethodFormSchema = z.object({
  type: z.enum(['bank_transfer', 'paypal', 'mercado_pago', 'cash', 'other'] as const),
  label: z.string().min(1, 'Nombre requerido').max(100, 'Máximo 100 caracteres'),
  is_default: z.boolean().default(false),
});

export type PaymentMethodFormData = z.infer<typeof paymentMethodFormSchema>;

// =============================================================================
// Helpers
// =============================================================================

export function getValueSchemaForType(type: PaymentMethodType) {
  switch (type) {
    case 'bank_transfer':
      return bankTransferValueSchema;
    case 'paypal':
      return paypalValueSchema;
    case 'mercado_pago':
      return mercadoPagoValueSchema;
    case 'cash':
      return cashValueSchema;
    case 'other':
      return otherValueSchema;
  }
}

export function parsePaymentValue(value: string, type: PaymentMethodType): PaymentMethodValue {
  try {
    return JSON.parse(value) as PaymentMethodValue;
  } catch {
    // Fallback for plain text values (e.g., from onboarding)
    switch (type) {
      case 'bank_transfer':
        return { bank_name: value };
      case 'paypal':
        return { email: value };
      case 'mercado_pago':
        return { alias: value };
      case 'cash':
        return { instructions: value };
      case 'other':
        return { name: value, instructions: '' };
    }
  }
}

export function stringifyPaymentValue(value: PaymentMethodValue): string {
  return JSON.stringify(value);
}

export function getDefaultValueForType(type: PaymentMethodType): PaymentMethodValue {
  switch (type) {
    case 'bank_transfer':
      return { bank_name: '', account_number: '', clabe: '', cbu: '' };
    case 'paypal':
      return { email: '' };
    case 'mercado_pago':
      return { alias: '', cvu: '' };
    case 'cash':
      return { instructions: '' };
    case 'other':
      return { name: '', instructions: '' };
  }
}
