/**
 * Invoice Preview Utilities (SQ-26)
 *
 * Transforms form data to InvoiceWithDetails type
 * for preview rendering with InvoiceDocument component.
 */

import type { InvoiceWithDetails } from '@/hooks/invoices/use-invoice';
import type { Client, BusinessProfile } from '@/lib/types';
import type { CreateInvoiceFormData, UpdateInvoiceData, DiscountType } from '@/lib/validations/invoice';
import { calculateInvoiceFromItems, calculateLineTotal } from './invoice-calculations';

/**
 * Form item structure (camelCase)
 */
interface FormLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Build InvoiceWithDetails from form data for preview
 *
 * Transforms React Hook Form values to the structure expected
 * by InvoiceDocument component.
 *
 * @param formData - Form values from createInvoiceSchema or updateInvoiceSchema
 * @param client - Selected client (full object)
 * @param businessProfile - User's business profile
 * @param existingInvoiceId - Optional existing invoice ID (for edit mode)
 * @returns InvoiceWithDetails ready for preview
 *
 * @example
 * const previewData = buildPreviewData(
 *   form.getValues(),
 *   selectedClient,
 *   businessProfile,
 *   invoiceId
 * );
 */
export function buildPreviewData(
  formData: CreateInvoiceFormData | UpdateInvoiceData,
  client: Client,
  businessProfile: BusinessProfile | null,
  existingInvoiceId?: string
): InvoiceWithDetails {
  // Transform form items (camelCase) to preview items (snake_case)
  const formItems = (formData.items as FormLineItem[]) || [];
  const items = formItems
    .filter(item => item.description && item.quantity > 0)
    .map((item, index) => ({
      id: item.id || `preview-item-${index}`,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: calculateLineTotal(item.quantity, item.unitPrice),
    }));

  // Calculate totals using existing utility
  const discountType = formData.discountType as DiscountType | null;
  const discountValue = formData.discountValue ?? 0;
  const taxRate = formData.taxRate ?? 0;

  const itemsForCalc = formItems.map(item => ({
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }));

  const { subtotal, taxAmount, total } = calculateInvoiceFromItems(
    itemsForCalc,
    discountType,
    discountValue,
    taxRate
  );

  // Build preview data structure
  const previewData: InvoiceWithDetails = {
    // Core data
    id: existingInvoiceId || 'preview',
    invoice_number: formData.invoiceNumber || 'BORRADOR',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: formData.dueDate || new Date().toISOString().split('T')[0],
    status: 'draft',
    notes: formData.notes || null,
    terms: formData.terms || null,

    // Amounts
    subtotal,
    discount_type: discountType,
    discount_value: discountValue,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total,
    currency: 'USD',

    // Client data
    client: {
      id: client.id,
      name: client.name,
      email: client.email,
      company: client.company || null,
      address: client.address || null,
      tax_id: client.tax_id || null,
      phone: client.phone || null,
    },

    // Items
    items,

    // Business profile
    business_profile: businessProfile
      ? {
          business_name: businessProfile.business_name,
          contact_email: businessProfile.contact_email,
          contact_phone: businessProfile.contact_phone,
          address: businessProfile.address,
          tax_id: businessProfile.tax_id,
          logo_url: businessProfile.logo_url,
          default_terms: businessProfile.default_terms,
        }
      : null,
  };

  return previewData;
}

/**
 * Check if form data is complete enough for preview
 *
 * @param formData - Form values
 * @param hasClient - Whether a client is selected
 * @returns true if preview can be shown
 */
export function canShowPreview(
  formData: CreateInvoiceFormData | UpdateInvoiceData,
  hasClient: boolean
): boolean {
  // Must have a client selected
  if (!hasClient || !formData.clientId) {
    return false;
  }

  // Must have at least one valid item
  const items = (formData.items as FormLineItem[]) || [];
  const hasValidItem = items.some(
    item => item.description && item.description.trim() !== '' && item.quantity > 0 && item.unitPrice >= 0
  );

  return hasValidItem;
}

/**
 * Get tooltip message for disabled preview button
 *
 * @param formData - Form values
 * @param hasClient - Whether a client is selected
 * @returns Tooltip message or null if preview can be shown
 */
export function getPreviewDisabledReason(
  formData: CreateInvoiceFormData | UpdateInvoiceData,
  hasClient: boolean
): string | null {
  if (!hasClient || !formData.clientId) {
    return 'Selecciona un cliente para ver la vista previa';
  }

  const items = (formData.items as FormLineItem[]) || [];
  const hasValidItem = items.some(
    item => item.description && item.description.trim() !== '' && item.quantity > 0 && item.unitPrice >= 0
  );

  if (!hasValidItem) {
    return 'Agrega al menos un item con descripcion y cantidad';
  }

  return null;
}
