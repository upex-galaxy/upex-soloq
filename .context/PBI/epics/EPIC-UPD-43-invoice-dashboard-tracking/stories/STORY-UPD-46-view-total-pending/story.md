# As a user, I want to see the total amount pending collection to know my financial situation

**Jira Key:** UPD-46
**Epic:** UPD-43 (Invoice Dashboard & Tracking)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** see the total amount of money from all my "Sent" and "Overdue" invoices
**So that** I can quickly understand my current accounts receivable and the health of my cash flow.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A prominent KPI card or widget on the dashboard that displays the "Total Pending" amount.
- This amount is the sum of the `total` field for all invoices with the status of "Sent" or that are overdue.
- The amount should be clearly formatted as currency.
- This value should update when an invoice is sent or marked as paid.

### Out of Scope

- A detailed breakdown of the pending amount by client or by age.
- Historical graphs of the pending amount over time.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Displaying the correct pending amount

- **Given:** I have one invoice of $500 with "Sent" status and one invoice of $300 that is "Overdue".
- **And:** I also have a "Paid" invoice of $1000 and a "Draft" invoice of $200.
- **When:** I view my dashboard.
- **Then:** I see a "Total Pending" KPI that displays "$800.00".

### Scenario 2: Pending amount updates when an invoice is paid

- **Given:** My current "Total Pending" is $800.
- **And:** This includes a "Sent" invoice for $500.
- **When:** I mark the $500 invoice as "Paid".
- **Then:** The "Total Pending" KPI on the dashboard updates to "$300.00".

### Scenario 3: Pending amount updates when a new invoice is sent

- **Given:** My current "Total Pending" is $300.
- **When:** I send a new invoice for $700.
- **Then:** The "Total Pending" KPI on the dashboard updates to "$1000.00".

---

## Technical Notes

### Frontend

- The dashboard component will fetch the summary data from `GET /api/invoices/dashboard`.
- It will display the `totalPending` value from the response in a dedicated UI element.
- The data should be re-fetched (or the cache invalidated) after actions that affect this number, such as sending an invoice or marking one as paid.

### Backend

- A new endpoint, `GET /api/invoices/dashboard`, will be created.
- This endpoint will perform an aggregate SQL query to calculate the sum of `total` for all invoices belonging to the user where the status is 'sent' or ('sent' and due_date < NOW()). A simple `WHERE status IN ('sent', 'overdue')` is not correct, as 'overdue' is a derived status. The correct logic is `WHERE status = 'sent'`. The frontend can then further break this down into "pending" and "overdue". The backend can provide both sums.
- The endpoint will return a JSON object with the calculated totals.

### Database

- An aggregate query like `SELECT SUM(total) FROM invoices WHERE user_id = :user_id AND status = 'sent'` will be used. This query is fast if `user_id` and `status` are indexed.

---

## Dependencies

### Blocked By

- UPD-44 (View invoice dashboard)

### Blocks

- Provides one of the most critical financial insights for a freelancer.

---

## Definition of Done

- [ ] Backend endpoint to calculate and return dashboard summary KPIs is implemented.
- [ ] Frontend dashboard displays the "Total Pending" amount correctly.
- [ ] The amount updates correctly after relevant actions (sending/paying an invoice).
- [ ] E2E tests verify the accuracy of the displayed KPI.
- [ ] All acceptance criteria are met.
