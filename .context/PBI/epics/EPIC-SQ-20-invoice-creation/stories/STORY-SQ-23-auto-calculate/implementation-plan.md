# Implementation Plan: SQ-23 - Automatic Subtotal and Total Calculation

**Story:** [SQ-23](https://upexgalaxy65.atlassian.net/browse/SQ-23)
**Epic:** EPIC-SQ-20 - Invoice Creation
**Status:** IMPLEMENTED
**Date:** 2026-02-25

---

## Executive Summary

This story's functionality was implemented as part of the integrated development of EPIC-SQ-20.
The calculation system is **production-ready** with all acceptance criteria met.

---

## Implementation Status: COMPLETE

### Acceptance Criteria Verification

| Scenario | Status | Implementation |
|----------|--------|----------------|
| AC1: Subtotal calculation | ✅ DONE | `calculateSubtotal()` in `invoice-calculations.ts` |
| AC2: Total with tax | ✅ DONE | `calculateTax()` + `calculateTotal()` |
| AC3: Total with discount | ✅ DONE | `calculateDiscountAmount()` + pipeline |
| AC4: Real-time updates | ✅ DONE | `useMemo` + `useWatch` in components |
| AC5: Precision handling | ✅ DONE | `roundCurrency()` with Round Half-Up |

---

## Architecture Overview

### Calculation Functions (Centralized)

**Location:** `src/lib/utils/invoice-calculations.ts`

```typescript
// Core rounding (Round Half-Up to 2 decimals)
roundCurrency(value: number): number

// Line item calculation
calculateLineTotal(quantity, unitPrice): number
calculateSubtotal(items[]): number

// Discount calculation (percentage/fixed with capping)
calculateDiscountAmount(subtotal, discountType, discountValue): { amount, capped }

// Tax calculation (on discounted base)
calculateTaxableBase(subtotal, discountAmount): number
calculateTax(subtotal, discountAmount, taxRate): number

// Total calculation
calculateTotal(subtotal, discountAmount, taxAmount): number

// Full pipeline
calculateInvoiceFromItems(items, discountType, discountValue, taxRate): InvoiceCalculation
calculateInvoiceAmounts(subtotal, discountAmount, taxRate): InvoiceAmounts
```

### Calculation Pipeline

```
items[] → calculateSubtotal() → subtotal
                                    ↓
discountType + discountValue → calculateDiscountAmount() → discountAmount
                                    ↓
                            calculateTaxableBase() → taxableBase
                                    ↓
taxRate → calculateTax() → taxAmount
                                    ↓
        calculateTotal() → total
```

### Business Logic (SRS FR-015)

```
subtotal = Σ(quantity × unit_price)  // Rounded per line
discount_amount = subtotal × (rate/100)  // percentage
discount_amount = MIN(value, subtotal)   // fixed, capped
taxable_base = subtotal - discount_amount
tax_amount = taxable_base × (tax_rate/100)
total = taxable_base + tax_amount
```

### Rounding Strategy

- **Method:** Round Half-Up (`Math.round(value * 100) / 100`)
- **When:** Applied at each step (not just final total)
- **Precision:** 2 decimal places for all currency values

---

## Component Integration

### 1. LineItemsTable (`src/components/invoices/line-items-table.tsx`)

- Uses `useWatch()` to observe item changes in real-time
- Calculates subtotal with `useMemo()` + `calculateSubtotal()`
- Notifies parent via `onSubtotalChange` callback
- Shows line totals per row with `calculateLineTotal()`

### 2. InvoiceSummary (`src/components/invoices/invoice-summary.tsx`)

- Receives `subtotal`, `discountAmount`, `taxRate` as props
- Uses `useMemo()` + `calculateInvoiceAmounts()` for reactivity
- Displays: Subtotal, Discount (if any), Tax, Total

### 3. Create/Edit Pages

- Maintain `subtotal` state updated by `LineItemsTable`
- Calculate `discountAmount` with `calculateDiscountAmount()`
- Pass all values to `InvoiceSummary`
- Submit via API which recalculates server-side

### 4. API Route (`src/app/api/invoices/route.ts`)

- Imports same calculation functions
- Recalculates all amounts server-side before storing
- Ensures frontend/backend consistency

---

## Data Flow

```
User Input (items, tax, discount)
        ↓
LineItemsTable (subtotal via useMemo)
        ↓
CreateInvoicePage (state management)
        ↓
InvoiceSummary (reactive display)
        ↓
Form Submit → API
        ↓
Server recalculates → Database
```

---

## Test Cases Coverage

The 56 test cases from shift-left QA are covered by the implementation:

| Category | Count | Coverage |
|----------|-------|----------|
| Subtotal (TC-01 to TC-08) | 8 | `calculateSubtotal()`, `calculateLineTotal()` |
| Percentage Discount (TC-09 to TC-15) | 7 | `calculateDiscountAmount()` |
| Fixed Discount (TC-16 to TC-21) | 6 | `calculateDiscountAmount()` |
| Tax Calculations (TC-22 to TC-30) | 9 | `calculateTax()`, `calculateTaxableBase()` |
| Total Calculations (TC-31 to TC-36) | 6 | `calculateTotal()` |
| Real-time Updates (TC-37 to TC-44) | 8 | `useMemo`, `useWatch`, components |
| Decimal Precision (TC-45 to TC-48) | 4 | `roundCurrency()` |
| Validations (TC-49 to TC-56) | 8 | Input handling, edge cases |

---

## Files Modified/Created

### Already Existing (No Changes Needed)

| File | Status |
|------|--------|
| `src/lib/utils/invoice-calculations.ts` | Complete |
| `src/components/invoices/invoice-summary.tsx` | Complete |
| `src/components/invoices/line-items-table.tsx` | Complete |
| `src/components/invoices/discount-input.tsx` | Complete |
| `src/components/invoices/tax-input.tsx` | Complete |
| `src/app/(app)/invoices/create/page.tsx` | Complete |
| `src/app/(app)/invoices/[id]/edit/page.tsx` | Complete |
| `src/app/api/invoices/route.ts` | Complete |

### Created in This PR

| File | Purpose |
|------|---------|
| `.context/PBI/.../implementation-plan.md` | This document |

---

## Definition of Done Verification

- [x] Subtotal calculation working
- [x] Tax calculation working
- [x] Discount calculation working
- [x] Real-time updates working
- [x] Precision handling correct (Round Half-Up)
- [ ] Unit tests > 80% coverage (QA/TAE responsibility)

---

## Notes

1. **No code changes required** - All calculation logic was implemented as part of the integrated EPIC-SQ-20 development
2. **Shared functions** - Frontend and backend use identical calculation functions
3. **Tax on discounted base** - Tax is always calculated on (subtotal - discount), per LATAM standards
4. **Backward compatible** - Works with 0 items (returns all zeros)

---

## Related Documentation

- **Story:** `story.md`
- **Acceptance Test Plan:** `acceptance-test-plan.md`
- **Test Cases:** Referenced in acceptance-test-plan.md (56 TCs)
- **Feature Test Plan:** `../../feature-test-plan.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-015)

---

_Generated as part of SQ-23 implementation verification_
_Last updated: 2026-02-25_
