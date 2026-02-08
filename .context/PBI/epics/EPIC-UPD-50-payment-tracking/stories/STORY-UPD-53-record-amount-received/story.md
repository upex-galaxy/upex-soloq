# As a user, I want to register the amount received to verify against the invoiced total

**Jira Key:** UPD-53
**Epic:** UPD-50 (Payment Tracking)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** enter the exact amount I received when marking an invoice as paid
**So that** I can verify it against the invoice total and keep accurate financial records.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- In the "Mark as Paid" modal, a required field for "Amount Received".
- This field should be pre-filled with the invoice's total amount by default.
- The user can edit the amount if needed (e.g., if the client paid a slightly different amount due to fees).
- The entered amount will be saved with the payment record.

### Out of Scope

- Handling partial payments that leave a remaining balance (for MVP, even if the amount is different, the invoice status will become "Paid").
- Currency conversion. The amount is assumed to be in the same currency as the invoice.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Record payment with the default amount

- **Given:** I am marking an invoice with a total of $1,250.50 as paid.
- **When:** The payment modal opens.
- **Then:** The "Amount Received" field is pre-filled with "1250.50".
- **When:** I confirm and save the payment.
- **Then:** A payment of $1,250.50 is recorded.

### Scenario 2: Record payment with a custom amount

- **Given:** I am marking an invoice for $100 as paid.
- **And:** The client only sent $98 due to a wire transfer fee.
- **When:** I open the payment modal and change the "Amount Received" from "100" to "98".
- **And:** I save the payment.
- **Then:** A payment of $98 is recorded against the invoice.
- **And:** The invoice status is still updated to "Paid".

### Scenario 3: Amount received is required

- **Given:** I am in the "Mark as Paid" modal.
- **When:** I clear the "Amount Received" field.
- **And:** I try to save the payment.
- **Then:** I see an error message: "Amount received is required."
- **And:** The payment is not recorded.

---

## Technical Notes

### Frontend

- Add a required number input for `amountReceived` to the payment registration modal.
- When the modal opens, fetch the invoice details and pre-fill this field with the `invoice.total`.

### Backend

- The `POST /api/invoices/[invoiceId]/payments` endpoint will validate that `amountReceived` is a positive number.
- It will save this value in the `amount_received` column of the `payments` table.

### Database

- The `payments.amount_received` (decimal) column will be populated.

---

## Dependencies

### Blocked By

- UPD-51 (Mark invoice as paid)

### Blocks

- Ensures accurate bookkeeping, which is a core value proposition.

---

## Definition of Done

- [ ] The payment registration modal includes a pre-filled, required field for the amount.
- [ ] Backend API validates and saves the amount.
- [ ] E2E tests confirm that the amount is correctly recorded.
- [ ] All acceptance criteria are met.
