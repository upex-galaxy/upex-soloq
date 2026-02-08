# As a user, I want the email to include the PDF attached so the client has the invoice

**Jira Key:** UPD-39
**Epic:** UPD-37 (Invoice Sending)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** user
**I want to** ensure that when I send an invoice by email, the complete PDF is included as an attachment
**So that** my client receives a formal, unalterable copy of the invoice for their records.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- The email sending service must generate the invoice PDF on-the-fly.
- The generated PDF must be attached to the email being sent to the client.
- The attachment should have a descriptive filename, e.g., "Invoice-INV-2026-0042.pdf".

### Out of Scope

- Attaching other files besides the invoice PDF.
- Password-protecting the PDF attachment.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Email received with PDF attachment

- **Given:** I have sent an invoice to a client at "client@email.com".
- **When:** The client opens the email received from SoloQ.
- **Then:** The email has a file attached.
- **And:** The attached file is a PDF named "Invoice-[InvoiceNumber].pdf".
- **And:** Opening the PDF shows the correct and complete invoice.

---

## Technical Notes

### Frontend

- No direct frontend changes. This is primarily a backend story. The frontend simply triggers the process.

### Backend

- The `POST /api/invoices/[invoiceId]/send` endpoint's logic needs to be expanded.
- **Step 1:** Fetch all invoice data.
- **Step 2:** Call the PDF generation service (from UPD-32) to get the PDF as a buffer.
- **Step 3:** Use the Resend API's `attachments` option to include the PDF buffer with the correct filename.
- This process should be atomic; if the PDF generation fails, the email should not be sent.

### External Services

- Relies heavily on the `attachments` feature of the **Resend** API.

---

## Dependencies

### Blocked By

- UPD-32 (Generate PDF with professional design)
- UPD-38 (Send invoice by email with one click)

### Blocks

- A core requirement for professional email invoicing.

---

## Definition of Done

- [ ] Backend logic is updated to generate and attach the PDF before sending the email.
- [ ] Integration tests confirm that the Resend API is called with the correct attachment payload.
- [ ] E2E tests (using a mail catcher) verify that the received email contains a valid PDF attachment.
- [ ] All acceptance criteria are met.
