# As a user, I want to register the payment date for an accurate history

**Jira Key:** UPD-55
**Epic:** UPD-50 (Payment Tracking)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** specify the date on which I received the payment
**So that** my financial records are accurate, especially for tracking monthly income.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A "Payment Date" field in the "Mark as Paid" modal.
- This field will use a calendar date picker.
- It will default to the current date.
- The user can select a past date if they are recording a payment they received earlier.
- The selected date is saved with the payment record.

### Out of Scope

- Selecting a future date for a payment. The payment date cannot be in the future.
- Recording the time of the payment. Only the date is required.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Record a payment with today's date

- **Given:** I am marking an invoice as paid.
- **When:** The payment modal opens.
- **Then:** The "Payment Date" field defaults to today's date.
- **When:** I confirm and save the payment.
- **Then:** The payment is recorded with today's date.

### Scenario 2: Record a payment with a past date

- **Given:** I received a payment three days ago but am only recording it now.
- **When:** I open the "Mark as Paid" modal.
- **And:** I use the date picker to select the date from three days ago.
- **And:** I save the payment.
- **Then:** The payment is successfully recorded with that past date.

### Scenario 3: Attempt to select a future date

- **Given:** I am in the "Mark as Paid" modal.
- **When:** I try to select a date in the future (e.g., tomorrow) using the date picker.
- **Then:** The date picker does not allow me to select a future date, or if it does, a validation error "Payment date cannot be in the future" is shown when I try to save.

---

## Technical Notes

### Frontend

- Add a date picker component for the `paymentDate` field in the payment modal.
- The date picker should be configured to disable future dates.
- The field should default to `new Date()`.

### Backend

- The `POST /api/invoices/[invoiceId]/payments` endpoint will validate that the `paymentDate` is not in the future.
- It will save the provided date to the `payment_date` column.

### Database

- The `payments.payment_date` (date) column will be populated. This column is critical for monthly income calculations.

---

## Dependencies

### Blocked By

- UPD-51 (Mark invoice as paid)

### Blocks

- UPD-49 (View monthly income summary), which relies on this date for its calculation.

---

## Definition of Done

- [ ] The payment modal includes a date picker for the payment date, defaulted to today.
- [ ] Future dates are disabled or validated against.
- [ ] Backend API validates and saves the correct date.
- [ ] E2E tests confirm that a back-dated payment can be recorded.
- [ ] All acceptance criteria are met.
