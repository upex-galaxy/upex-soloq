/**
 * Invoice calculation utilities
 * Handles tax, discount, and total calculations with proper rounding
 *
 * Business Logic (from SRS FR-015):
 * - Base Imponible = Subtotal - Descuento
 * - Impuesto = Base Imponible × (Tasa / 100)
 * - Total = Base Imponible + Impuesto
 *
 * Rounding: Round Half-Up to 2 decimals (standard commercial)
 */

/**
 * Round a number to 2 decimals using Round Half-Up
 * @param value - Number to round
 * @returns Rounded number with 2 decimal places
 */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate the taxable base (subtotal minus discount)
 * @param subtotal - Invoice subtotal
 * @param discountAmount - Discount amount (already calculated if percentage)
 * @returns Taxable base, minimum 0
 */
export function calculateTaxableBase(subtotal: number, discountAmount: number): number {
  return Math.max(0, subtotal - discountAmount);
}

/**
 * Calculate tax amount with proper rounding
 *
 * @param subtotal - Invoice subtotal (sum of line items)
 * @param discountAmount - Discount amount (already calculated)
 * @param taxRate - Tax rate as percentage (0-100)
 * @returns Tax amount rounded to 2 decimals
 *
 * @example
 * calculateTax(1000, 0, 16) // => 160 (16% of 1000)
 * calculateTax(1000, 100, 10) // => 90 (10% of 900)
 * calculateTax(100, 0, 10.5) // => 10.5 (10.5% of 100)
 */
export function calculateTax(subtotal: number, discountAmount: number, taxRate: number): number {
  const taxableBase = calculateTaxableBase(subtotal, discountAmount);
  const taxAmount = taxableBase * (taxRate / 100);
  return roundCurrency(taxAmount);
}

/**
 * Calculate invoice total
 *
 * @param subtotal - Invoice subtotal
 * @param discountAmount - Discount amount
 * @param taxAmount - Tax amount (already calculated)
 * @returns Total rounded to 2 decimals
 *
 * @example
 * calculateTotal(1000, 0, 160) // => 1160
 * calculateTotal(1000, 100, 90) // => 990 (900 + 90)
 */
export function calculateTotal(
  subtotal: number,
  discountAmount: number,
  taxAmount: number
): number {
  const taxableBase = calculateTaxableBase(subtotal, discountAmount);
  return roundCurrency(taxableBase + taxAmount);
}

/**
 * Calculate all invoice amounts at once
 * Useful for forms and API responses
 *
 * @param subtotal - Invoice subtotal
 * @param discountAmount - Discount amount
 * @param taxRate - Tax rate as percentage (0-100)
 * @returns Object with taxableBase, taxAmount, and total
 */
export function calculateInvoiceAmounts(
  subtotal: number,
  discountAmount: number,
  taxRate: number
): {
  taxableBase: number;
  taxAmount: number;
  total: number;
} {
  const taxableBase = calculateTaxableBase(subtotal, discountAmount);
  const taxAmount = calculateTax(subtotal, discountAmount, taxRate);
  const total = calculateTotal(subtotal, discountAmount, taxAmount);

  return {
    taxableBase,
    taxAmount,
    total,
  };
}

/**
 * Calculate discount amount based on type and value
 *
 * @param subtotal - Invoice subtotal (sum of line items)
 * @param discountType - Type of discount ('percentage' | 'fixed')
 * @param discountValue - Input value (percentage 0-100 or fixed amount)
 * @returns Object with calculated amount and whether it was capped
 *
 * @example
 * calculateDiscountAmount(1000, 'percentage', 10) // => { amount: 100, capped: false }
 * calculateDiscountAmount(80, 'fixed', 100) // => { amount: 80, capped: true }
 */
export function calculateDiscountAmount(
  subtotal: number,
  discountType: 'percentage' | 'fixed' | null | undefined,
  discountValue: number | null | undefined
): { amount: number; capped: boolean } {
  // No discount if type or value is missing/invalid
  if (
    !discountType ||
    discountValue === null ||
    discountValue === undefined ||
    discountValue <= 0
  ) {
    return { amount: 0, capped: false };
  }

  let amount: number;

  if (discountType === 'percentage') {
    // Calculate percentage of subtotal
    amount = roundCurrency(subtotal * (discountValue / 100));
  } else {
    // Fixed amount
    amount = roundCurrency(discountValue);
  }

  // Cap at subtotal to prevent negative totals
  const capped = amount > subtotal;
  return {
    amount: capped ? subtotal : amount,
    capped,
  };
}

/**
 * Common tax rate presets for LATAM countries
 */
export const TAX_PRESETS = [
  { value: 0, label: '0%', description: 'Exento' },
  { value: 8, label: '8%', description: 'Tasa reducida' },
  { value: 16, label: '16%', description: 'Mexico (IVA)' },
  { value: 19, label: '19%', description: 'Colombia/Chile' },
  { value: 21, label: '21%', description: 'Argentina' },
] as const;

export type TaxPreset = (typeof TAX_PRESETS)[number];
