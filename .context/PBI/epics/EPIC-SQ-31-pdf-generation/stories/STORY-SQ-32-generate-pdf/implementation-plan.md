# Implementation Plan - SQ-32: Generate Professional PDF Invoice

**Story:** [SQ-32](https://upexgalaxy64.atlassian.net/browse/SQ-32)
**Epic:** [SQ-31](https://upexgalaxy64.atlassian.net/browse/SQ-31) - PDF Generation & Download
**Created:** 2026-02-08
**Branch:** `feat/SQ-32/generate-pdf`

---

## 1. Story Summary

**As a** user
**I want to** generate a PDF of my invoice with professional design
**So that** I can send it to my client

### Acceptance Criteria (from Jira Shift-Left)

1. **Generate PDF from complete invoice** - PDF generated in <3 seconds
2. **PDF contains all required sections** - Header, Invoice Meta, Client, Items Table, Totals, Footer
3. **Calculations match exactly** - Subtotal, Tax, Discount, Total match invoice editor
4. **Unauthorized access blocked** - 404 response for other users' invoices

### Test Cases to Cover

| TC ID    | Test Case                          | Priority |
| -------- | ---------------------------------- | -------- |
| TC-32-01 | Generate PDF from complete invoice | P1       |
| TC-32-02 | PDF contains all sections          | P1       |
| TC-32-03 | Calculations match editor          | P1       |
| TC-32-06 | Generation time < 3000ms           | P1       |
| TC-32-08 | Special characters LATAM           | P2       |
| TC-32-09 | Minimum data generation            | P2       |
| TC-32-10 | Unauthorized access blocked        | P1       |

---

## 2. Technical Approach

### 2.1 Overview

This story implements core PDF generation using `@react-pdf/renderer`. We will:

1. Create an invoice detail page at `/invoices/[id]`
2. Fetch invoice with all related data (client, items)
3. Render a live PDF preview with debouncing
4. Implement the InvoiceDocument component (PDF template)

### 2.2 Components to Create

| Component                 | Purpose                                         |
| ------------------------- | ----------------------------------------------- |
| `/invoices/[id]/page.tsx` | Invoice detail page with preview                |
| `invoice-preview.tsx`     | PDF preview container with loading states       |
| `invoice-document.tsx`    | React-PDF document template                     |
| `use-invoice.ts`          | Hook to fetch invoice with details              |
| `pdf-utils.ts`            | Helper functions (formatCurrency, removeEmojis) |

---

## 3. Implementation Steps

### Step 1: Install Dependencies

```bash
bun add @react-pdf/renderer
```

**Files modified:** `package.json`

---

### Step 2: Create PDF Utility Functions

Create helper functions for PDF generation.

**File:** `src/lib/utils/pdf-utils.ts`

```typescript
/**
 * Format currency with thousands separator
 */
export function formatCurrency(amount: number, symbol = '$'): string;

/**
 * Remove emojis from text (PDFs don't render them)
 */
export function removeEmojis(text: string): string;

/**
 * Format date for PDF display (DD/MM/YYYY)
 */
export function formatDateForPDF(isoDate: string): string;
```

**Test cases covered:** TC-32-03 (calculations), TC-32-08 (special chars)

---

### Step 3: Create useInvoice Hook

Fetch a single invoice with all related data.

**File:** `src/hooks/invoices/use-invoice.ts`

```typescript
interface InvoiceWithDetails {
  invoice: Invoice;
  client: Client;
  items: InvoiceItem[];
  businessProfile: BusinessProfile | null;
}

export function useInvoice(invoiceId: string);
```

**Test cases covered:** TC-32-10 (authorization - returns null for other users)

---

### Step 4: Create Invoice API Endpoint

Create API endpoint to fetch invoice with all related data.

**File:** `src/app/api/invoices/[id]/route.ts`

```typescript
// GET /api/invoices/[id]
// Returns invoice with client, items, and business profile
// 404 if not found or belongs to another user
```

**Test cases covered:** TC-32-10 (security)

---

### Step 5: Create InvoiceDocument Component

The PDF template using @react-pdf/renderer.

**File:** `src/app/(app)/invoices/[id]/components/invoice-document.tsx`

Sections:

1. **Header:** Invoice title + Number + Date
2. **Info Containers:** From (Business) / Bill To (Client)
3. **Items Table:** Description, Qty, Price, Total
4. **Totals:** Subtotal, Discount, Tax, Total
5. **Footer:** Notes, Terms

**Test cases covered:** TC-32-02 (all sections), TC-32-03 (calculations)

---

### Step 6: Create InvoicePreview Component

PDF preview with debouncing, loading states, and error handling.

**File:** `src/app/(app)/invoices/[id]/components/invoice-preview.tsx`

Features:

- 1500ms debounce before regeneration
- Loading indicator during generation
- Error state with retry
- Memory cleanup (URL.revokeObjectURL)

**Test cases covered:** TC-32-01 (generation), TC-32-06 (performance)

---

### Step 7: Create Invoice Detail Page

Main page that displays invoice details and PDF preview.

**File:** `src/app/(app)/invoices/[id]/page.tsx`

Layout:

- Left: Invoice metadata (read-only view)
- Right: PDF preview (sticky)

**Test cases covered:** TC-32-01, TC-32-09 (minimum data)

---

### Step 8: Update Invoices Index

Export the new hook from the index file.

**File:** `src/hooks/invoices/index.ts`

---

### Step 9: Add Navigation Links

Update invoices list page to link to detail pages.

**File:** `src/app/(app)/invoices/page.tsx`

---

### Step 10: Verify Build and Lint

```bash
bun run lint
bun run build
```

---

## 4. Data Flow

```
User visits /invoices/[id]
         │
         ▼
┌─────────────────────┐
│   useInvoice(id)    │
│   (TanStack Query)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  GET /api/invoices  │
│      /[id]          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Supabase RLS     │
│   (user_id check)   │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
 Found?      Not Found
     │           │
     ▼           ▼
 Return       404
 Data       Response
     │
     ▼
┌─────────────────────┐
│  InvoicePreview     │
│  (debounced)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  InvoiceDocument    │
│  (@react-pdf)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   PDF Blob + URL    │
│   (in iframe)       │
└─────────────────────┘
```

---

## 5. Test Data Requirements

### Minimum Invoice (TC-32-09)

```json
{
  "invoice": {
    "invoice_number": "INV-2026-0001",
    "issue_date": "2026-02-08",
    "due_date": "2026-03-08",
    "subtotal": 100,
    "tax_rate": 0,
    "tax_amount": 0,
    "total": 100
  },
  "client": {
    "name": "Test Client",
    "email": "test@example.com"
  },
  "items": [{ "description": "Service", "quantity": 1, "unit_price": 100 }]
}
```

### Complete Invoice (TC-32-01, TC-32-02)

```json
{
  "invoice": {
    "invoice_number": "INV-2026-0042",
    "issue_date": "2026-02-08",
    "due_date": "2026-03-08",
    "subtotal": 1000,
    "discount_type": "fixed",
    "discount_value": 100,
    "tax_rate": 16,
    "tax_amount": 144,
    "total": 1044,
    "notes": "Gracias por su preferencia",
    "terms": "Pago a 30 días"
  },
  "client": {
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "company": "Acme Corporation",
    "tax_id": "RFC123456"
  },
  "items": [
    { "description": "Diseño de Logo", "quantity": 1, "unit_price": 500 },
    { "description": "Guía de Marca", "quantity": 2, "unit_price": 250 }
  ]
}
```

### Special Characters (TC-32-08)

```json
{
  "client": {
    "name": "José García Muñoz"
  },
  "items": [{ "description": "Diseño ñoño con café ☕" }]
}
```

---

## 6. Definition of Done

- [x] Dependencies installed (@react-pdf/renderer)
- [ ] PDF utility functions created and tested
- [ ] useInvoice hook fetches all required data
- [ ] API endpoint returns 404 for unauthorized access
- [ ] InvoiceDocument renders all sections
- [ ] InvoicePreview shows live preview with debouncing
- [ ] Invoice detail page is accessible
- [ ] Calculations in PDF match source data
- [ ] Special characters render correctly
- [ ] Generation completes in < 3 seconds
- [ ] Lint and build pass
- [ ] PR created and reviewed

---

## 7. Out of Scope (Handled by Other Stories)

| Feature                | Story |
| ---------------------- | ----- |
| Logo in PDF header     | SQ-33 |
| Payment methods in PDF | SQ-34 |
| Download button        | SQ-35 |
| Template selection     | SQ-36 |

---

## References

- **Epic Plan:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/feature-implementation-plan.md`
- **Technical Spec:** `.context/reference/invoice-pdf-generation-spec.md`
- **Test Cases:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/stories/STORY-SQ-32-generate-pdf/test-cases.md`

---

_Created: 2026-02-08_
_Author: Claude Code_
