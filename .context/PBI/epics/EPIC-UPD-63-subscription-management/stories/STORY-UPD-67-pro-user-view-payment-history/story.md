# As a Pro user, I want to see my subscription payment history for my records

**Jira Key:** UPD-67
**Epic:** UPD-63 (Subscription Management)
**Priority:** Could Have
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Pro user
**I want to** be able to see my past subscription payments
**So that** I can keep track of my business expenses and have receipts for my accounting.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- On the "Subscription" settings page, there will be a simple list of past subscription payments.
- For each payment, it will show the date and the amount paid.
- It will include a link to the Stripe-hosted receipt for that payment.
- The data will be fetched from the Stripe API.

### Out of Scope

- Generating custom receipts within the SoloQ application.
- A detailed breakdown of taxes or fees on the subscription payment within the SoloQ UI.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: View subscription payment history

- **Given:** I am a Pro user and my subscription has renewed twice.
- **When:** I navigate to the "Subscription" settings page.
- **Then:** I see a "Payment History" section.
- **And:** The section lists two past payments with their respective dates and amounts.

### Scenario 2: Access a Stripe receipt

- **Given:** I am viewing my payment history.
- **When:** I click the "View Receipt" link for a specific payment.
- **Then:** I am taken to a new tab with the Stripe-hosted receipt for that transaction.

---

## Technical Notes

### Frontend

- The `/settings/billing` page will display the list of payments.
- The data will be fetched from a new backend endpoint.

### Backend

- Create a new endpoint, e.g., `GET /api/subscription/payments`.
- This endpoint will use the Stripe Node.js library to:
  1. Find the user's Stripe `customer_id`.
  2. List all `Invoice` objects from Stripe associated with that customer.
  3. For each Stripe invoice, it will return the date, amount, and the `hosted_invoice_url` (which serves as the receipt).
- The endpoint must be secure and only return data for the authenticated user.

### External Services

- **Stripe API:** Used to list customer invoices.

---

## Dependencies

### Blocked By

- UPD-66 (Pro user manage subscription)

### Blocks

- Provides transparency and necessary documentation for business accounting, which is a valuable feature for freelancers.

---

## Definition of Done

- [ ] Backend API to fetch payment history from Stripe is implemented.
- [ ] Frontend displays the payment history with links to Stripe receipts.
- [ ] E2E tests verify that the payment history is displayed correctly.
- [ ] All acceptance criteria are met.
