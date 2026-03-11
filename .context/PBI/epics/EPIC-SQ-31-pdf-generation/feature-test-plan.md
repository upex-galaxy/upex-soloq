# QA Feature Test Plan - PDF Generation & Download

**Epic:** [SQ-31](https://upexgalaxy64.atlassian.net/browse/SQ-31)
**Prepared by:** QA Team (Shift-Left Analysis)
**Date:** 2026-01-30
**Status:** Ready for Review

---

## 1. Executive Summary

| Metric | Value |
|--------|-------|
| Epic | SQ-31 - PDF Generation & Download |
| Total Stories | 5 |
| Story Points | 13 |
| Test Cases | 32 |
| Complexity | Medium-High |
| NFR Critical | PDF generation < 3000ms (p95) |

### Stories Breakdown

| Story | Points | Test Cases | Priority |
|-------|--------|------------|----------|
| [SQ-32](https://upexgalaxy64.atlassian.net/browse/SQ-32): Generate Professional PDF Invoice | 5 | 10 | High |
| [SQ-33](https://upexgalaxy64.atlassian.net/browse/SQ-33): Include Logo and Business Data in PDF | 3 | 7 | High |
| [SQ-34](https://upexgalaxy64.atlassian.net/browse/SQ-34): Include Payment Methods in PDF | 2 | 6 | High |
| [SQ-35](https://upexgalaxy64.atlassian.net/browse/SQ-35): Download PDF to Device | 2 | 5 | High |
| [SQ-36](https://upexgalaxy64.atlassian.net/browse/SQ-36): Choose PDF Template (Pro Feature) | 1 | 4 | Low |

---

## 2. Business Context

### User Personas Affected

- **Carlos (Diseñador):** Needs professional PDFs for creative clients
- **Valentina (Desarrolladora):** Needs technical accuracy in calculations
- **Andres (Consultor):** Needs multiple payment methods for international clients

### User Journeys Impacted

- "Registro y Primera Factura" (steps 12-14)
- "Seguimiento y Cobro" (step 4)

### KPIs at Risk

- **Time to First Invoice:** < 10 min
- **Facturas enviadas por email:** 1,500/month target
- **NPS:** > 40

---

## 3. Risk Analysis

### High Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance: PDF generation > 3000ms | User abandonment, poor UX | Load testing with realistic data, caching strategy |
| Logo rendering issues (PNG transparency) | Unprofessional output, brand damage | Test all logo formats, size limits, fallback design |
| Mobile download incompatibility | iOS/Android users can't access PDFs | Cross-browser testing matrix, native share API fallback |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Pro feature gate bypass | Revenue loss, unfair advantage | Server-side validation of subscription status |
| Multiple payment methods display overflow | Cluttered PDF, poor readability | Layout testing with 1-5 payment methods |
| Calculation precision errors | Trust issues, disputes | Decimal handling tests, currency rounding rules |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Template selection confusion | Minor UX friction | Preview thumbnails, clear Pro labeling |

---

## 4. Test Strategy

### Testing Pyramid

| Layer | Scope | Coverage Target |
|-------|-------|-----------------|
| Unit Tests | PDF calculations, data transformations, formatting functions | > 80% |
| Integration Tests | Invoice data → PDF renderer → file output | > 60% |
| E2E Tests (Playwright) | Full user flows: generate, preview, download | Critical paths |
| API Tests | GET /invoices/{id}/pdf endpoint | 100% |
| Visual Regression | PDF output consistency across browsers | Key templates |

### Testing Types Required

- **Functional:** All acceptance criteria from stories
- **Performance:** PDF generation < 3000ms (p95)
- **Compatibility:** Chrome, Firefox, Safari, Edge + iOS Safari, Android Chrome
- **Accessibility:** Screen reader compatibility for UI elements
- **Security:** Authorization checks (own invoices only)

---

## 5. Test Cases by Story

### SQ-32: Generate Professional PDF Invoice (10 test cases)

| TC ID | Test Case | Type | Priority |
|-------|-----------|------|----------|
| TC-32-01 | Generate PDF from complete invoice | Functional | P1 |
| TC-32-02 | Verify PDF contains all invoice sections (header, items, totals, footer) | Functional | P1 |
| TC-32-03 | Verify calculations match invoice editor | Functional | P1 |
| TC-32-04 | Verify A4 page dimensions and margins | Visual | P2 |
| TC-32-05 | Test PDF generation with maximum items (50+) | Performance | P2 |
| TC-32-06 | Test PDF generation response time < 3000ms | Performance | P1 |
| TC-32-07 | Verify PDF print quality (300 DPI equivalent) | Visual | P2 |
| TC-32-08 | Test PDF with special characters in text | Functional | P2 |
| TC-32-09 | Test PDF generation with minimum data | Boundary | P2 |
| TC-32-10 | Verify unauthorized user cannot generate another user's invoice PDF | Security | P1 |

### SQ-33: Include Logo and Business Data in PDF (7 test cases)

| TC ID | Test Case | Type | Priority |
|-------|-----------|------|----------|
| TC-33-01 | Logo appears correctly when uploaded (PNG) | Functional | P1 |
| TC-33-02 | Logo appears correctly (JPG) | Functional | P2 |
| TC-33-03 | Layout adjusts gracefully when no logo configured | Functional | P1 |
| TC-33-04 | Business name displays prominently | Functional | P1 |
| TC-33-05 | Contact info (email, phone, address) displays correctly | Functional | P1 |
| TC-33-06 | Tax ID (RFC/NIT/CUIT) displays correctly | Functional | P1 |
| TC-33-07 | Large logo image (> 2MB) is handled appropriately | Boundary | P2 |

### SQ-34: Include Payment Methods in PDF (6 test cases)

| TC ID | Test Case | Type | Priority |
|-------|-----------|------|----------|
| TC-34-01 | Bank transfer details display (bank, account, routing) | Functional | P1 |
| TC-34-02 | PayPal email displays correctly | Functional | P1 |
| TC-34-03 | Crypto wallet address and currency type display | Functional | P2 |
| TC-34-04 | Multiple payment methods (3+) display clearly | Functional | P1 |
| TC-34-05 | No payment methods configured - graceful fallback | Functional | P1 |
| TC-34-06 | Payment method with special characters renders correctly | Functional | P2 |

### SQ-35: Download PDF to Device (5 test cases)

| TC ID | Test Case | Type | Priority |
|-------|-----------|------|----------|
| TC-35-01 | Download button triggers file download | Functional | P1 |
| TC-35-02 | Filename format: Invoice-{number}-{client}.pdf | Functional | P1 |
| TC-35-03 | Download from invoice preview | Functional | P1 |
| TC-35-04 | Quick download from invoice list (without preview) | Functional | P2 |
| TC-35-05 | Mobile download works (iOS Safari, Android Chrome) | Compatibility | P1 |

### SQ-36: Choose PDF Template - Pro Feature (4 test cases)

| TC ID | Test Case | Type | Priority |
|-------|-----------|------|----------|
| TC-36-01 | Free user only sees "Classic" template | Functional | P1 |
| TC-36-02 | Pro user sees all templates (classic, modern, minimal, professional) | Functional | P1 |
| TC-36-03 | Template preference saves to profile | Functional | P2 |
| TC-36-04 | Per-invoice template override works | Functional | P2 |

---

## 6. Dependencies

### Blocked By (Must Be Complete)

- **SQ-20** (Invoice Creation) - Invoice data required
- **SQ-7** (Business Profile) - Business data for PDF header

### Integration Points

- **API:** `GET /invoices/{invoiceId}/pdf`
- **Storage:** Supabase Storage (logo images)
- **Libraries:** @react-pdf/renderer, file-saver

---

## 7. Questions for Stakeholders

### For Product Owner

1. What happens if user has no logo? Placeholder image or adjusted layout?
2. How many Pro templates will be available at MVP launch?
3. Should payment methods section be hidden or show "Not configured" when empty?
4. Is there a maximum number of line items per invoice?

### For Dev Lead

1. Will PDFs be cached or regenerated on each request?
2. What is the maximum file size allowed for logo uploads?
3. Is server-side rendering an option if client-side is too slow?
4. How will we handle font loading for PDF generation?

---

## 8. Action Items

| Action | Owner | Due |
|--------|-------|-----|
| Review test plan and approve | @PO | Before Sprint 4 |
| Clarify open questions | @PO, @Dev Lead | Before Sprint 4 |
| Set up performance benchmarks for PDF generation | @Dev | Sprint 4 start |
| Create test data fixtures for PDF testing | @QA | Sprint 4 start |

---

## 9. Test Data Requirements

### Invoice Fixtures

| Fixture | Description |
|---------|-------------|
| `invoice-complete` | Full invoice with all fields populated |
| `invoice-minimal` | Invoice with only required fields |
| `invoice-max-items` | Invoice with 50+ line items |
| `invoice-special-chars` | Invoice with unicode, emojis, accents |

### Business Profile Fixtures

| Fixture | Description |
|---------|-------------|
| `business-with-logo-png` | Business with PNG logo (transparency) |
| `business-with-logo-jpg` | Business with JPG logo |
| `business-no-logo` | Business without logo |
| `business-all-payment-methods` | Business with 5+ payment methods |

### User Fixtures

| Fixture | Description |
|---------|-------------|
| `user-free` | Free tier user |
| `user-pro` | Pro tier user |

---

## 10. Automation Readiness

### E2E Test Coverage (Playwright)

```typescript
// Suggested test file structure
tests/
  pdf-generation/
    generate-pdf.spec.ts       // SQ-32 tests
    pdf-business-data.spec.ts  // SQ-33 tests
    pdf-payment-methods.spec.ts // SQ-34 tests
    download-pdf.spec.ts       // SQ-35 tests
    pdf-templates.spec.ts      // SQ-36 tests
```

### API Test Coverage

```typescript
// Suggested API test structure
tests/api/
  invoices/
    get-pdf.spec.ts           // GET /invoices/{id}/pdf
```

### Data-TestId Conventions

| Element | data-testid |
|---------|-------------|
| Generate PDF button | `btn-generate-pdf` |
| Download PDF button | `btn-download-pdf` |
| Template selector | `select-pdf-template` |
| PDF preview container | `pdf-preview-container` |
| Template option (classic) | `template-option-classic` |

---

## Appendix: NFR Compliance Checklist

- [ ] PDF generation < 3000ms (p95)
- [ ] Error rate < 0.1%
- [ ] Mobile browser compatibility (iOS Safari, Android Chrome)
- [ ] A4 page format support
- [ ] Print quality acceptable (300 DPI equivalent)

---

_Generated via Shift-Left QA Analysis_
_Last updated: 2026-01-30_
_Jira Comment ID: 46288_
