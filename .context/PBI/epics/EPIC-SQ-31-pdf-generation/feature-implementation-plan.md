# Feature Implementation Plan - PDF Generation & Download

**Epic:** [SQ-31](https://upexgalaxy64.atlassian.net/browse/SQ-31)
**Created:** 2026-02-08
**Status:** In Progress

---

## 1. Executive Summary

This Epic implements client-side PDF generation for invoices using `@react-pdf/renderer`. The system generates professional PDFs in real-time with live preview, including all invoice data, business branding, and payment methods.

### Stories in Scope

| Key   | Story                                 | Points | Status        |
| ----- | ------------------------------------- | ------ | ------------- |
| SQ-32 | Generate Professional PDF Invoice     | 5      | In Progress   |
| SQ-33 | Include Logo and Business Data in PDF | 3      | Ready For Dev |
| SQ-34 | Include Payment Methods in PDF        | 2      | Shift-Left QA |
| SQ-35 | Download PDF to Device                | 2      | Ready For Dev |
| SQ-36 | Choose PDF Template (Pro Feature)     | 1      | Backlog       |

---

## 2. Technical Architecture

### 2.1 Technology Stack

| Component        | Technology                   | Version |
| ---------------- | ---------------------------- | ------- |
| PDF Generation   | @react-pdf/renderer          | ^4.3.x  |
| Framework        | Next.js (App Router)         | 16.x    |
| State Management | React useState + useDebounce | -       |
| Data Fetching    | TanStack Query               | 5.x     |
| Database         | Supabase (PostgreSQL)        | -       |

### 2.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │   Invoice Page   │───▶│  InvoicePreview  │                   │
│  │   /invoices/[id] │    │   (Live Preview) │                   │
│  └──────────────────┘    └────────┬─────────┘                   │
│                                   │                              │
│                          useDebounce(1500ms)                     │
│                                   │                              │
│                          ┌────────▼─────────┐                   │
│                          │ InvoiceDocument  │                   │
│                          │ (@react-pdf/     │                   │
│                          │  renderer)       │                   │
│                          └────────┬─────────┘                   │
│                                   │                              │
│                          ┌────────▼─────────┐                   │
│                          │   PDF Blob       │                   │
│                          │   (in memory)    │                   │
│                          └────────┬─────────┘                   │
│                                   │                              │
│                    ┌──────────────┼──────────────┐              │
│                    ▼              ▼              ▼              │
│              ┌─────────┐   ┌─────────┐   ┌─────────┐           │
│              │ Preview │   │Download │   │  Send   │           │
│              │ (iframe)│   │  (.pdf) │   │ (email) │           │
│              └─────────┘   └─────────┘   └─────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GET /api/invoices/[id]                                         │
│  ├── invoice (invoices table)                                   │
│  ├── items (invoice_items table)                                │
│  ├── client (clients table)                                     │
│  ├── businessProfile (business_profiles table)                  │
│  └── paymentMethods (payment_methods table)                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 File Structure

```
src/
├── app/(app)/invoices/
│   ├── [id]/
│   │   ├── page.tsx                    # Invoice detail page (SQ-32)
│   │   └── components/
│   │       ├── invoice-preview.tsx     # PDF preview component (SQ-32)
│   │       └── invoice-document.tsx    # PDF template (SQ-32, SQ-33, SQ-34)
│   └── create/
│       └── page.tsx                    # Existing create page
│
├── components/invoices/
│   └── index.ts                        # Export all invoice components
│
├── hooks/invoices/
│   ├── use-invoice.ts                  # Fetch single invoice with details
│   └── use-payment-methods.ts          # Fetch user's payment methods
│
├── lib/
│   └── utils/
│       └── pdf-utils.ts                # PDF helper functions
│
└── types/
    └── invoice-pdf.ts                  # PDF-specific types
```

---

## 3. Data Requirements

### 3.1 Invoice PDF Data Interface

```typescript
interface InvoicePDFData {
  // Invoice metadata
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;

  // Client info
  client: {
    name: string;
    email: string;
    company: string | null;
    address: string | null;
    taxId: string | null;
  };

  // Business info (SQ-33)
  business: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    taxId: string | null;
    logoUrl: string | null;
  };

  // Line items
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;

  // Totals
  subtotal: number;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number;
  taxRate: number;
  taxAmount: number;
  total: number;

  // Footer
  notes: string | null;
  terms: string | null;

  // Payment methods (SQ-34)
  paymentMethods: Array<{
    type: PaymentMethodType;
    label: string;
    value: string;
  }>;
}
```

### 3.2 Database Queries

**Single Invoice with All Related Data:**

```sql
SELECT
  i.*,
  c.name as client_name,
  c.email as client_email,
  c.company as client_company,
  c.address as client_address,
  c.tax_id as client_tax_id,
  bp.business_name,
  bp.contact_email,
  bp.contact_phone,
  bp.address as business_address,
  bp.tax_id as business_tax_id,
  bp.logo_url
FROM invoices i
JOIN clients c ON i.client_id = c.id
LEFT JOIN business_profiles bp ON i.user_id = bp.user_id
WHERE i.id = $1 AND i.user_id = $2;
```

---

## 4. Security Considerations

### 4.1 Authorization

- **RLS Policies:** All queries enforce `user_id = auth.uid()`
- **404 Response:** Return 404 (not 403) when invoice not found to avoid exposing existence
- **Logo Access:** Logo URLs use signed URLs with expiration

### 4.2 Data Validation

- Validate invoice ID is valid UUID before querying
- Verify invoice belongs to authenticated user
- Sanitize text content (remove potential XSS vectors)

---

## 5. Performance Considerations

### 5.1 NFR Requirements

| Metric              | Target         | Strategy                                |
| ------------------- | -------------- | --------------------------------------- |
| PDF Generation Time | < 3000ms (p95) | Client-side generation, debouncing      |
| Memory Usage        | Stable         | Revoke Object URLs, cleanup on unmount  |
| Bundle Size         | Minimal        | Dynamic imports for @react-pdf/renderer |

### 5.2 Optimization Strategies

1. **Debouncing:** 1500ms delay before regenerating PDF on data change
2. **Dynamic Import:** Load @react-pdf/renderer only when needed
3. **Memory Cleanup:** Revoke blob URLs before creating new ones
4. **Generation Counter:** Cancel stale generations when data changes

---

## 6. Implementation Order

### Phase 1: Core PDF Generation (SQ-32)

1. Install @react-pdf/renderer
2. Create invoice detail page with preview
3. Implement InvoiceDocument component
4. Add useInvoice hook to fetch data
5. Implement live preview with debouncing

### Phase 2: Business Branding (SQ-33)

1. Fetch business profile data
2. Add logo rendering to PDF header
3. Handle missing logo gracefully
4. Add business contact info

### Phase 3: Payment Methods (SQ-34)

1. Create usePaymentMethods hook
2. Add payment section to PDF footer
3. Handle empty payment methods

### Phase 4: Download (SQ-35)

1. Add download button
2. Generate proper filename
3. Handle mobile download (iOS Safari, Android Chrome)

### Phase 5: Templates (SQ-36 - Pro Feature)

1. Create template variants
2. Add template selector (Pro only)
3. Store preference in user settings

---

## 7. Testing Strategy

### 7.1 Unit Tests

- PDF formatting functions (formatCurrency, formatDate)
- Calculation utilities
- Data transformation functions

### 7.2 Integration Tests

- Invoice data fetching
- PDF generation with mock data
- Authorization checks

### 7.3 E2E Tests (Playwright)

- Full flow: view invoice → generate PDF → download
- Verify PDF contains all sections
- Test performance < 3000ms

---

## 8. Dependencies

### 8.1 New Dependencies

```bash
bun add @react-pdf/renderer
```

### 8.2 Existing Dependencies Used

- TanStack Query (data fetching)
- Supabase Client (database)
- date-fns (date formatting)
- lucide-react (icons)

---

## 9. Risks and Mitigations

| Risk                       | Impact                   | Mitigation                      |
| -------------------------- | ------------------------ | ------------------------------- |
| Font loading issues        | PDF generation fails     | Use Helvetica (built-in)        |
| Emoji rendering            | Characters not displayed | removeEmojis() utility          |
| Large invoices (50+ items) | Slow generation, memory  | Pagination, performance testing |
| Mobile compatibility       | Download fails on iOS    | Use native share API fallback   |

---

## 10. Success Criteria

- [ ] PDF generates in < 3 seconds for typical invoice (5-10 items)
- [ ] All invoice sections visible in PDF
- [ ] Calculations match invoice editor exactly
- [ ] Unauthorized users cannot access other users' invoices
- [ ] Special characters (ñ, acentos) render correctly
- [ ] PDF downloads successfully on desktop and mobile

---

## References

- **Technical Spec:** `.context/reference/invoice-pdf-generation-spec.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/feature-test-plan.md`
- **React-PDF Docs:** https://react-pdf.org/

---

_Last updated: 2026-02-08_
_Author: Claude Code_
