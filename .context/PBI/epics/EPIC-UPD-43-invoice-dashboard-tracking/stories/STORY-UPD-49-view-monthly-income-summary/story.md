# As a user, I want to see a summary of income of the month to track my progress

**Jira Key:** UPD-49
**Epic:** UPD-43 (Invoice Dashboard & Tracking)
**Priority:** Could Have
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** see a summary of my total income received this month
**So that** I can quickly track my monthly performance and financial goals.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A KPI card or widget on the dashboard that displays "Income This Month".
- This amount is the sum of all payments received during the current calendar month.
- This is based on the `payment_date` of the payments, not the invoice issue date.
- The amount should be clearly formatted as currency.

### Out of Scope

- Comparing income with previous months.
- A detailed list of which payments make up the total.
- Date range selectors to view income for custom periods.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Displaying correct income for the current month

- **Given:** This month, I have marked two invoices as paid, one for $1200 and one for $800.
- **And:** Last month, I marked another invoice as paid for $500.
- **When:** I view my dashboard.
- **Then:** The "Income This Month" KPI displays "$2000.00".

### Scenario 2: Income summary updates when a payment is recorded

- **Given:** My current "Income This Month" is $2000.
- **When:** I mark a new invoice of $450 as paid with today's date.
- **Then:** The "Income This Month" KPI on the dashboard updates to "$2450.00".

### Scenario 3: A payment from a previous month does not affect the total

- **Given:** My "Income This Month" is $2000.
- **When:** I back-date a payment registration to a date in the previous month.
- **Then:** The "Income This Month" KPI remains at "$2000.00".

---

## Technical Notes

### Frontend

- The dashboard component will fetch this value from the `GET /api/invoices/dashboard` endpoint.
- It will display the `totalPaidThisMonth` value in a dedicated UI element.
- The cache for this data should be invalidated when a new payment is registered.

### Backend

- The `GET /api/invoices/dashboard` endpoint will be responsible for calculating this value.
- It will perform an aggregate SQL query on the `payments` table.
- The query will sum the `amount_received` for all payments belonging to the user where the `payment_date` falls within the current calendar month.

### Database

- An aggregate query like `SELECT SUM(amount_received) FROM payments WHERE invoice_id IN (SELECT id FROM invoices WHERE user_id = :user_id) AND payment_date >= date_trunc('month', NOW()) AND payment_date < date_trunc('month', NOW()) + interval '1 month'` will be used.
- An index on `payment_date` would be beneficial.

---

## Dependencies

### Blocked By

- UPD-46 (View total pending) - As it's part of the same dashboard summary.
- EPIC-SOLOQ-008 (Payment Tracking) - Needs the ability to record payments.

### Blocks

- Provides a key metric for user motivation and progress tracking.

---

## Definition of Done

- [ ] Backend endpoint calculates and returns the "Income This Month" value.
- [ ] Frontend dashboard correctly displays the value.
- [ ] The value updates correctly when a new payment is recorded for the current month.
- [ ] E2E tests verify the accuracy of the KPI.
- [ ] All acceptance criteria are met.
