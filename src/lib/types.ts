/**
 * Type helpers for SoloQ
 * Extracted from database types for easier use in components
 */

import type { Database } from '@/types/supabase';

// =============================================================================
// Generic Type Helpers
// =============================================================================

/** Get Row type for a table */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/** Get Insert type for a table */
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/** Get Update type for a table */
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

/** Get Enum type */
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// =============================================================================
// Domain-Specific Types (Row types)
// =============================================================================

/** User profile */
export type Profile = Tables<'profiles'>;

/** Business profile with logo, contact info, tax ID */
export type BusinessProfile = Tables<'business_profiles'>;

/** Client entity */
export type Client = Tables<'clients'>;

/** Invoice entity */
export type Invoice = Tables<'invoices'>;

/** Invoice line item */
export type InvoiceItem = Tables<'invoice_items'>;

/** Payment record */
export type Payment = Tables<'payments'>;

/** User's payment method (bank, PayPal, etc.) */
export type PaymentMethod = Tables<'payment_methods'>;

/** User subscription (free/pro) */
export type Subscription = Tables<'subscription'>;

/** Reminder settings for Pro users */
export type ReminderSettings = Tables<'reminder_settings'>;

/** Invoice event log */
export type InvoiceEvent = Tables<'invoice_events'>;

// =============================================================================
// Insert Types
// =============================================================================

export type ClientInsert = TablesInsert<'clients'>;
export type InvoiceInsert = TablesInsert<'invoices'>;
export type InvoiceItemInsert = TablesInsert<'invoice_items'>;
export type PaymentInsert = TablesInsert<'payments'>;
export type PaymentMethodInsert = TablesInsert<'payment_methods'>;
export type BusinessProfileInsert = TablesInsert<'business_profiles'>;

// =============================================================================
// Update Types
// =============================================================================

export type ClientUpdate = TablesUpdate<'clients'>;
export type InvoiceUpdate = TablesUpdate<'invoices'>;
export type PaymentMethodUpdate = TablesUpdate<'payment_methods'>;
export type BusinessProfileUpdate = TablesUpdate<'business_profiles'>;

// =============================================================================
// Enum Types
// =============================================================================

/** Invoice status: draft, sent, paid, overdue, cancelled */
export type InvoiceStatus = Enums<'invoice_status'>;

/** Payment method types: bank_transfer, paypal, mercado_pago, cash, other */
export type PaymentMethodType = Enums<'payment_method_type'>;

/** Subscription plans: free, pro */
export type SubscriptionPlan = Enums<'subscription_plan'>;

/** Subscription status: active, canceled, past_due, incomplete */
export type SubscriptionStatus = Enums<'subscription_status'>;

/** Discount types: percentage, fixed */
export type DiscountType = Enums<'discount_type'>;

/** Invoice event types: created, updated, sent, reminder_sent, viewed, paid, cancelled */
export type InvoiceEventType = Enums<'invoice_event_type'>;

// =============================================================================
// Computed/Extended Types
// =============================================================================

/** Invoice with client and items for display */
export type InvoiceWithDetails = Invoice & {
  client: Client;
  items: InvoiceItem[];
};

/** Invoice with client name only (for lists) */
export type InvoiceWithClient = Invoice & {
  client: Pick<Client, 'id' | 'name' | 'email' | 'company'>;
};

/** Client with invoice count */
export type ClientWithStats = Client & {
  invoice_count: number;
  total_billed: number;
};

// =============================================================================
// Tax ID Type (stored in business_profiles.tax_id_type)
// =============================================================================

export type TaxIdType = 'RFC' | 'NIT' | 'CUIT' | 'RUT' | 'RUC' | 'Tax ID';

// =============================================================================
// Business Address (JSONB structure for business_profiles.address)
// =============================================================================

export interface BusinessAddress {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string; // ISO 3166-1 alpha-2
}

export const LATAM_COUNTRIES = [
  { code: 'MX', name: 'México', taxIdLabel: 'RFC', phonePre: '+52' },
  { code: 'CO', name: 'Colombia', taxIdLabel: 'NIT', phonePre: '+57' },
  { code: 'AR', name: 'Argentina', taxIdLabel: 'CUIT', phonePre: '+54' },
  { code: 'CL', name: 'Chile', taxIdLabel: 'RUT', phonePre: '+56' },
  { code: 'PE', name: 'Perú', taxIdLabel: 'RUC', phonePre: '+51' },
  { code: 'UY', name: 'Uruguay', taxIdLabel: 'RUT', phonePre: '+598' },
  { code: 'EC', name: 'Ecuador', taxIdLabel: 'RUC', phonePre: '+593' },
  { code: 'CR', name: 'Costa Rica', taxIdLabel: 'Cédula Jurídica', phonePre: '+506' },
  { code: 'PA', name: 'Panamá', taxIdLabel: 'RUC', phonePre: '+507' },
  { code: 'DO', name: 'República Dominicana', taxIdLabel: 'RNC', phonePre: '+1' },
  { code: 'GT', name: 'Guatemala', taxIdLabel: 'NIT', phonePre: '+502' },
  { code: 'BO', name: 'Bolivia', taxIdLabel: 'NIT', phonePre: '+591' },
  { code: 'PY', name: 'Paraguay', taxIdLabel: 'RUC', phonePre: '+595' },
  { code: 'HN', name: 'Honduras', taxIdLabel: 'RTN', phonePre: '+504' },
  { code: 'SV', name: 'El Salvador', taxIdLabel: 'NIT', phonePre: '+503' },
  { code: 'NI', name: 'Nicaragua', taxIdLabel: 'RUC', phonePre: '+505' },
  { code: 'VE', name: 'Venezuela', taxIdLabel: 'RIF', phonePre: '+58' },
  { code: 'BR', name: 'Brasil', taxIdLabel: 'CNPJ', phonePre: '+55' },
] as const;

export type LatamCountryCode = (typeof LATAM_COUNTRIES)[number]['code'];

// =============================================================================
// Constants (for UI selects, filters, etc.)
// =============================================================================

export const INVOICE_STATUS_OPTIONS: { value: InvoiceStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
  { value: 'sent', label: 'Enviada', color: 'bg-blue-100 text-blue-800' },
  { value: 'paid', label: 'Pagada', color: 'bg-green-100 text-green-800' },
  { value: 'overdue', label: 'Vencida', color: 'bg-red-100 text-red-800' },
  { value: 'cancelled', label: 'Cancelada', color: 'bg-gray-100 text-gray-500' },
];

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethodType; label: string }[] = [
  { value: 'bank_transfer', label: 'Transferencia bancaria' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'mercado_pago', label: 'Mercado Pago' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'other', label: 'Otro' },
];

export const SUBSCRIPTION_PLAN_OPTIONS: { value: SubscriptionPlan; label: string }[] = [
  { value: 'free', label: 'Gratis' },
  { value: 'pro', label: 'Pro' },
];
