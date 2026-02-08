# Implementation Plan: SQ-24 - Add Taxes to Invoice

## Story Summary

**As a** user
**I want to** add taxes (VAT/percentage)
**So that** I can comply with tax requirements

## Acceptance Test Plan Summary (from Jira QA comments)

| TC ID | Description                                    | Priority |
| ----- | ---------------------------------------------- | -------- |
| TC-01 | Standard Tax Calculation (16% on $1000 = $160) | Critical |
| TC-02 | Tax on Discounted Amount (tax after discount)  | Critical |
| TC-03 | Decimal Tax Rate Handling (10.5%)              | High     |
| TC-04 | Zero Tax / Exempt (0% = no tax)                | Medium   |
| TC-05 | Input Validations (no negatives, max 100)      | High     |
| TC-06 | Reactive Updates (recalculate on item change)  | High     |
| TC-07 | Persistence (save and recover tax rate)        | High     |

## Technical Analysis

### Current State

- **Database**: `invoices.tax_rate` (DECIMAL 5,2) and `invoices.tax_amount` (DECIMAL 10,2) exist
- **Schema**: `createInvoiceSchema` does NOT include `taxRate`
- **API**: POST /api/invoices hardcodes `tax_rate: 0` and `tax_amount: 0`
- **UI**: Create invoice page has no tax input field

### Business Logic (from SRS FR-015)

**Formula:**

```
Base Imponible = Subtotal - Descuento
Impuesto = Base Imponible × (Tasa / 100)
Total = Base Imponible + Impuesto
```

**Rounding:** Round Half-Up to 2 decimals

**Constraints:**

- Tax rate: 0-100 (soft limit, warn > 100)
- No negative rates
- Decimal precision: 2 decimals (e.g., 10.5%)

### Common Tax Presets (LATAM)

| Country    | Rate |
| ---------- | ---- |
| Mexico     | 16%  |
| Colombia   | 19%  |
| Argentina  | 21%  |
| Costa Rica | 13%  |
| Chile      | 19%  |
| Exempt     | 0%   |

## Implementation Steps

### Step 1: Create Invoice Calculation Utilities

**File**: `src/lib/utils/invoice-calculations.ts`

```typescript
/**
 * Calculate tax amount with proper rounding
 * @param subtotal - Invoice subtotal
 * @param discount - Discount amount (already calculated)
 * @param taxRate - Tax rate as percentage (0-100)
 * @returns Tax amount rounded to 2 decimals
 */
export function calculateTax(subtotal: number, discount: number, taxRate: number): number {
  const taxableBase = Math.max(0, subtotal - discount);
  const taxAmount = taxableBase * (taxRate / 100);
  return Math.round(taxAmount * 100) / 100; // Round half-up
}

/**
 * Calculate invoice total
 */
export function calculateTotal(subtotal: number, discount: number, taxAmount: number): number {
  const taxableBase = Math.max(0, subtotal - discount);
  return Math.round((taxableBase + taxAmount) * 100) / 100;
}
```

**data-testid:** N/A (utility module)

### Step 2: Update Invoice Validation Schema

**File**: `src/lib/validations/invoice.ts`

Add to `createInvoiceSchema`:

```typescript
taxRate: z
  .number()
  .min(0, 'La tasa no puede ser negativa')
  .max(100, 'La tasa no puede exceder 100%')
  .optional()
  .default(0),
```

### Step 3: Create TaxInput Component

**File**: `src/components/invoices/tax-input.tsx`

Features:

- Numeric input with "%" suffix
- Quick preset buttons: 0%, 8%, 16%, 19%, 21%
- Validation: 0-100, no negatives, 2 decimals
- Warning for rates > 50% (unusual)
- Accessible: aria-labels, keyboard navigation

```
data-testid:
- tax-input
- tax-preset-0
- tax-preset-8
- tax-preset-16
- tax-preset-19
- tax-preset-21
```

Layout:

```
┌─────────────────────────────────────────────┐
│ Impuesto (IVA)                              │
│ ┌──────────────┐                            │
│ │  16       %  │  [0%] [8%] [16%] [19%] [21%]│
│ └──────────────┘                            │
│ Presets comunes para LATAM                  │
└─────────────────────────────────────────────┘
```

### Step 4: Create InvoiceSummary Component

**File**: `src/components/invoices/invoice-summary.tsx`

Features:

- Display: Subtotal, Impuesto, Total
- Reactive: updates when tax rate or subtotal changes
- Format: Currency with 2 decimals
- Tax line shows rate and amount: "IVA 16%: $160.00"

```
data-testid:
- invoice-summary
- summary-subtotal
- summary-tax
- summary-total
```

### Step 5: Update API Route

**File**: `src/app/api/invoices/route.ts`

Changes:

- Accept `taxRate` from request body
- Calculate `tax_amount` server-side using utility
- Calculate `total` server-side
- Store both `tax_rate` and `tax_amount`

```typescript
const taxRate = validationResult.data.taxRate ?? 0;
const taxAmount = calculateTax(0, 0, taxRate); // subtotal is 0 at creation
const total = calculateTotal(0, 0, taxAmount);

.insert({
  // ... existing fields
  tax_rate: taxRate,
  tax_amount: taxAmount,
  total: total,
})
```

### Step 6: Update Create Invoice Page

**File**: `src/app/(app)/invoices/create/page.tsx`

Changes:

- Add TaxInput component after due date field
- Add InvoiceSummary component before submit button
- Handle tax rate changes and recalculate totals
- Form now includes taxRate field

### Step 7: Export New Components

**File**: `src/components/invoices/index.ts`

Add exports for:

- TaxInput
- InvoiceSummary

## Files to Create/Modify

| File                                          | Change            |
| --------------------------------------------- | ----------------- |
| `src/lib/utils/invoice-calculations.ts`       | New - utilities   |
| `src/lib/validations/invoice.ts`              | Modify - add tax  |
| `src/components/invoices/tax-input.tsx`       | New - component   |
| `src/components/invoices/invoice-summary.tsx` | New - component   |
| `src/components/invoices/index.ts`            | Modify - exports  |
| `src/app/api/invoices/route.ts`               | Modify - tax calc |
| `src/app/(app)/invoices/create/page.tsx`      | Modify - add tax  |

## Test Cases Coverage

| TC    | Covered By                                           |
| ----- | ---------------------------------------------------- |
| TC-01 | calculateTax(1000, 0, 16) = 160, Total = 1160        |
| TC-02 | calculateTax(1000, 100, 10) = 90 (10% of 900)        |
| TC-03 | TaxInput accepts 10.5, calculateTax handles decimals |
| TC-04 | taxRate = 0 results in taxAmount = 0                 |
| TC-05 | Zod schema rejects negative, TaxInput prevents > 100 |
| TC-06 | Form recalculates on taxRate change (reactive state) |
| TC-07 | API stores tax_rate, form loads existing rate        |

## Dependencies

- SQ-21: Create Invoice by Selecting Client ✅ (already implemented)
- No blocking dependencies

## Out of Scope (Future Stories)

- Tax on edited invoices (requires edit flow)
- Tax label configuration (IVA vs VAT)
- Multiple tax rates per invoice
- Tax reporting/summaries

## Notes from QA (Jira Comments)

- **Order of Operations**: Tax applies AFTER discount, not before
- **Rounding**: Use Round Half-Up (standard commercial)
- **Max Rate Warning**: Consider soft warning for rates > 50%
- **Retenciones**: Out of scope for this story (negative taxes)
- **Per-Item Tax**: Out of scope - single global tax per invoice

---

_Generated: 2026-02-07_
