# As a user, I want to assign a unique invoice number to keep track of my numbering

**Jira Key:** UPD-27
**Epic:** UPD-20 (Invoice Creation)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** assign a unique, sequential number to each invoice
**So that** I can easily track and reference them for my own records and for my clients.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- When creating a new invoice, the system should automatically suggest the next sequential invoice number.
- The format should be something like `INV-YYYY-NNNN` (e.g., `INV-2026-0001`).
- The user should be able to override the suggested number with a custom one.
- The backend must validate that the final invoice number is unique for that user.

### Out of Scope

- Customizing the invoice number format (e.g., adding different prefixes).
- Resetting the invoice number sequence.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: System suggests the next invoice number

- **Given:** My last invoice was numbered "INV-2026-0041".
- **When:** I start creating a new invoice.
- **Then:** The "Invoice Number" field is automatically pre-filled with "INV-2026-0042".

### Scenario 2: User overrides the suggested invoice number

- **Given:** The system suggests "INV-2026-0042" as the invoice number.
- **When:** I manually change the invoice number to "MY-CUSTOM-01".
- **And:** I save the invoice.
- **Then:** The invoice is saved with the number "MY-CUSTOM-01".

### Scenario 3: Attempt to save an invoice with a duplicate number

- **Given:** I already have an invoice with the number "INV-2026-0040".
- **When:** I try to save a new invoice with the number "INV-2026-0040".
- **Then:** The system shows an error: "This invoice number is already in use."
- **And:** The invoice is not saved.

---

## Technical Notes

### Frontend

- When the invoice form loads, it should call a new endpoint `GET /api/invoices/next-number` to fetch the suggested next number.
- The `invoiceNumber` field should be a standard text input.

### Backend

- Create a new endpoint `GET /api/invoices/next-number`. This endpoint will find the highest invoice number for the current user and increment it. It needs to handle parsing the number from the string format.
- The `POST /api/invoices` and `PUT /api/invoices/[invoiceId]` endpoints must include a check to ensure the provided `invoiceNumber` is unique for the `user_id`.

### Database

- A unique constraint should be added to the database on the combination of `(user_id, invoice_number)` in the `invoices` table to enforce uniqueness at the database level.

---

## Dependencies

### Blocked By

- UPD-21 (Create new invoice)

### Blocks

- A core requirement for proper bookkeeping and referencing.

---

## Definition of Done

- [ ] Backend endpoint to suggest the next invoice number is implemented.
- [ ] Uniqueness validation is implemented in the backend and at the database level.
- [ ] Frontend pre-fills the suggested number.
- [ ] E2E tests for all acceptance criteria are passing.
- [ ] All acceptance criteria are met.
