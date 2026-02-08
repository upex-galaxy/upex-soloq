# As a user, I want to be able to revert an invoice from "paid" to "pending" to correct errors

**Jira Key:** UPD-56
**Epic:** UPD-50 (Payment Tracking)
**Priority:** Should Have
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** user
**I want to** be able to undo a payment I recorded
**So that** I can easily correct a mistake, such as marking the wrong invoice as paid.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- An action, such as "Revert Payment", available for invoices with "Paid" status.
- This action should show a confirmation modal to prevent accidental reversions.
- On confirmation, the associated payment record is deleted (or soft-deleted).
- The invoice status reverts from "Paid" to its previous state ("Sent" or "Overdue", depending on its due date).
- All relevant dashboard KPIs (Total Pending, Monthly Income) are updated accordingly.

### Out of Scope

- Reverting a payment if there are multiple partial payments (not in MVP).
- An audit log of payment reversions visible in the UI.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Successfully revert a payment

- **Given:** I have an invoice with "Paid" status.
- **And:** My "Total Pending" is $1000 and "Income This Month" is $500 (from this invoice).
- **When:** I click the "Revert Payment" action for this invoice.
- **And:** I confirm the action.
- **Then:** I see a success message: "Payment reverted successfully."
- **And:** The invoice status changes back to "Sent" (or "Overdue").
- **And:** The "Total Pending" KPI updates to $1500, and "Income This Month" updates to $0.

### Scenario 2: Canceled reversion

- **Given:** I am on the confirmation modal to revert a payment.
- **When:** I click "Cancel".
- **Then:** No changes are made, and the invoice remains "Paid".

---

## Technical Notes

### Frontend

- The UI for a "Paid" invoice will show a "Revert Payment" option.
- This triggers a confirmation modal.
- On confirmation, it sends a `DELETE` request to `/api/invoices/[invoiceId]/payments`.
- On success, it updates the local state of the invoice and re-fetches dashboard KPIs.

### Backend

- Create a `DELETE /api/invoices/[invoiceId]/payments` endpoint.
- This endpoint will find the payment associated with the invoice.
- It will soft-delete the payment record (set `deleted_at`).
- It will then update the invoice status back to "sent".
- It must re-evaluate if the invoice is now overdue and update the status accordingly if `due_date` is in the past.

### Database

- `payments.deleted_at` will be set for the reverted payment.
- `invoices.status` will be updated from `paid` to `sent`.
- `invoices.paid_at` will be set to `NULL`.

---

## Dependencies

### Blocked By

- UPD-51 (Mark invoice as paid)

### Blocks

- Provides a crucial "undo" safety net for the user, improving confidence in the tool.

---

## Definition of Done

- [ ] "Revert Payment" action and confirmation modal are implemented.
- [ ] Backend API correctly reverts the payment and updates the invoice status.
- [ ] Dashboard KPIs are correctly updated after a reversion.
- [ ] E2E test for reverting a payment and verifying the state change is passing.
- [ ] All acceptance criteria are met.
