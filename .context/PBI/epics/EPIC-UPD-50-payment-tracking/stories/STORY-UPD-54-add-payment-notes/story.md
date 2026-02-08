# As a user, I want to add notes to the payment to have context

**Jira Key:** UPD-54
**Epic:** UPD-50 (Payment Tracking)
**Priority:** Should Have
**Story Points:** 1
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** be able to add a private note when I record a payment
**So that** I can save important context, like a bank transfer reference number or a comment about payment fees.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- An optional text area field for "Notes" in the "Mark as Paid" modal.
- The user can input multi-line text.
- This text is saved with the payment record and is for the user's internal reference only.

### Out of Scope

- Displaying these payment notes to the client.
- A rich text editor for the notes.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Record a payment with a note

- **Given:** I am marking an invoice as paid.
- **When:** I enter "Client paid via wire, reference #12345-ABC" into the "Notes" field.
- **And:** I save the payment.
- **Then:** The payment is recorded successfully.
- **And:** The note is saved and associated with that payment record.

### Scenario 2: Record a payment without a note

- **Given:** I am marking an invoice as paid.
- **When:** I leave the "Notes" field blank.
- **And:** I save the payment.
- **Then:** The payment is recorded successfully without any associated note.

---

## Technical Notes

### Frontend

- Add an optional `<textarea>` for `notes` to the payment registration modal form.

### Backend

- The `POST /api/invoices/[invoiceId]/payments` endpoint will accept an optional `notes` string in its payload.
- If provided, the string will be saved to the `notes` column of the `payments` table.

### Database

- The `payments.notes` (text, nullable) column will be populated if data is provided.

---

## Dependencies

### Blocked By

- UPD-51 (Mark invoice as paid)

### Blocks

- None. This is an enhancing feature for better record-keeping.

---

## Definition of Done

- [ ] The payment modal includes an optional "Notes" field.
- [ ] Backend API correctly saves the note content.
- [ ] E2E tests confirm that a payment can be saved with and without a note.
- [ ] All acceptance criteria are met.
