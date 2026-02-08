# As a user, I want to generate a PDF of my invoice with a professional design to send to my client

**Jira Key:** UPD-32
**Epic:** UPD-31 (PDF Generation & Download)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** generate a PDF version of my invoice with a professional design
**So that** I can send it to my client as a formal and polished document.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Implement the PDF generation logic using `@react-pdf/renderer` on the server-side (within a Next.js API route or server component).
- The generated PDF will follow a default professional template.
- It will include all essential invoice details: invoice number, dates, client info, items, totals, and notes.
- The PDF will be accessible via an API endpoint (e.g., `GET /api/invoices/[invoiceId]/pdf`).

### Out of Scope

- Client-side PDF generation.
- Multiple PDF templates in the MVP (only one default template).

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Successfully generate a PDF for a complete invoice

- **Given:** I have a fully completed invoice saved in the system.
- **When:** I trigger the PDF generation for this invoice (e.g., by clicking a "Generate PDF" button or sending the invoice).
- **Then:** A professionally formatted PDF document of my invoice is created.
- **And:** The PDF contains all the correct information from the invoice, including items, quantities, prices, subtotals, taxes, discounts, and the final total.

### Scenario 2: Generated PDF matches the real-time preview

- **Given:** I have an invoice with specific data, and I have viewed its real-time HTML preview.
- **When:** I generate the PDF for the same invoice.
- **Then:** The layout, styling, and content of the generated PDF are visually identical to the HTML preview.

### Scenario 3: Error handling during PDF generation

- **Given:** There is an issue preventing the PDF generation (e.g., corrupt invoice data, external service failure).
- **When:** I attempt to generate the PDF.
- **Then:** I receive an error message (e.g., "Could not generate PDF. Please try again later.").

---

## Technical Notes

### Frontend

- The "Generate PDF" action will typically be part of the "Send Invoice" flow or a separate "Download PDF" button. It will call the backend API.
- The same React component used for the preview (UPD-26) will be adapted for `@react-pdf/renderer` to ensure visual consistency.

### Backend

- A Next.js API route (`/api/invoices/[invoiceId]/pdf`) will be responsible for:
  1. Fetching all necessary data for the invoice (invoice details, client, business profile, payment methods).
  2. Using `@react-pdf/renderer` to render the React component into a PDF buffer.
  3. Sending the PDF buffer back as a response with appropriate `Content-Type` and `Content-Disposition` headers.

### Database

- Requires querying `invoices`, `invoice_items`, `clients`, `business_profiles`, and `payment_methods` tables.

---

## Dependencies

### Blocked By

- UPD-20 (Invoice Creation Epic) - Needs a complete invoice data structure.
- UPD-26 (Preview invoice) - Relies on the same React component for rendering.

### Blocks

- UPD-35 (Download PDF)
- EPIC-SOLOQ-006 (Invoice Sending)

---

## Definition of Done

- [ ] PDF generation logic is implemented and produces a valid PDF.
- [ ] The generated PDF includes all necessary invoice data.
- [ ] Backend endpoint for PDF generation is functional and secure.
- [ ] E2E tests verify successful PDF generation and basic content.
- [ ] All acceptance criteria are met.
