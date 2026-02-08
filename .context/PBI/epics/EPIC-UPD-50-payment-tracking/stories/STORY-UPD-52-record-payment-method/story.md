# As a user, I want to register the payment method used to have a record

**Jira Key:** UPD-52
**Epic:** UPD-50 (Payment Tracking)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** specify how the client paid me (e.g., Bank Transfer, PayPal, Cash) when I record a payment
**So that** I have a clear record for my accounting and reconciliation.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- In the "Mark as Paid" modal, there will be a field to record the payment method.
- This could be a dropdown pre-populated with common methods or a simple text field. For MVP, a text field is sufficient for flexibility.
- The entered payment method will be saved along with the payment record.

### Out of Scope

- Pre-populating the dropdown from the user's configured payment methods.
- Any automation based on the selected method.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Record a payment with a specific method

- **Given:** I am marking an invoice as paid.
- **When:** In the payment modal, I enter "Bank Transfer" in the "Payment Method" field.
- **And:** I save the payment.
- **Then:** The payment is recorded successfully.
- **And:** When I view the payment details later, it shows that the method was "Bank Transfer".

### Scenario 2: Payment method field is required

- **Given:** I am in the "Mark as Paid" modal.
- **When:** I fill in the amount but leave the "Payment Method" field blank.
- **And:** I try to save the payment.
- **Then:** I see an error message: "Payment method is required."
- **And:** The payment is not recorded.

---

## Technical Notes

### Frontend

- Add a required text input field for `paymentMethod` to the payment registration modal form.
- The value will be part of the payload sent to `POST /api/invoices/[invoiceId]/payments`.

### Backend

- The `POST /api/invoices/[invoiceId]/payments` endpoint will validate that `paymentMethod` is a non-empty string.
- The value will be saved in the `payment_method` column of the `payments` table.

### Database

- A new record in the `public.payments` table will have its `payment_method` column populated.

---

## Dependencies

### Blocked By

- UPD-51 (Mark invoice as paid)

### Blocks

- Provides essential detail for payment records.

---

## Definition of Done

- [ ] The payment registration modal includes a required field for the payment method.
- [ ] Backend API validates and saves the payment method.
- [ ] E2E tests confirm that the payment method is correctly recorded.
- [ ] All acceptance criteria are met.
