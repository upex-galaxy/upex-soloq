# As a user, I want to mark an invoice as paid to update its status

**Jira Key:** UPD-51
**Epic:** UPD-50 (Payment Tracking)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** mark an invoice as "Paid" once I have received the payment
**So that** I can keep my financial records accurate and stop tracking it as a pending receivable.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A "Mark as Paid" action available for invoices with "Sent" or "Overdue" status.
- This action will open a modal to confirm the payment details.
- Upon confirming the payment, the invoice's status will change to "Paid".
- The "Paid" status should be clearly visible in the invoice list/dashboard with a distinct badge or color.

### Out of Scope

- Automatically marking invoices as paid through bank integration.
- Marking an invoice as partially paid (for MVP, a payment marks the whole invoice as paid).

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Mark a "Sent" invoice as "Paid"

- **Given:** I have an invoice with "Sent" status in my dashboard.
- **When:** I click the "Mark as Paid" action for that invoice.
- **And:** I confirm the payment details in the modal that appears.
- **Then:** I see a success notification: "Payment recorded successfully."
- **And:** The invoice's status in the dashboard changes to "Paid".

### Scenario 2: Mark an "Overdue" invoice as "Paid"

- **Given:** I have an invoice highlighted as "Overdue".
- **When:** I use the "Mark as Paid" action for it and confirm.
- **Then:** The invoice's status changes to "Paid".
- **And:** The "Overdue" highlighting is removed.

### Scenario 3: Action is not available for "Draft" or "Paid" invoices

- **Given:** I am viewing my list of invoices.
- **When:** I look at the actions available for a "Draft" invoice.
- **Then:** I do not see a "Mark as Paid" option.
- **When:** I look at the actions available for an already "Paid" invoice.
- **Then:** I do not see a "Mark as Paid" option.

---

## Technical Notes

### Frontend

- The "Mark as Paid" button will be present on each invoice row/card component in the dashboard.
- It will open a modal containing the payment registration form.
- On successful submission of the form, the frontend should either re-fetch the invoice list or update the local state of the specific invoice to reflect the "Paid" status.

### Backend

- The `POST /api/invoices/[invoiceId]/payments` endpoint will handle this logic.
- Before processing, it must verify that the invoice's current status is `sent`.
- Upon successful insertion into the `payments` table, it must update the `invoices` table to set `status` to 'paid' and record the `paid_at` timestamp.

---

## Dependencies

### Blocked By

- UPD-44 (View invoice dashboard)

### Blocks

- The core user action for financial record-keeping.

---

## Definition of Done

- [ ] "Mark as Paid" action and corresponding modal are implemented.
- [ ] Backend API correctly updates the invoice status upon payment registration.
- [ ] E2E test for marking an invoice as paid and verifying the status change is passing.
- [ ] All acceptance criteria are met.
