# As a user, I want to see overdue invoices highlighted to prioritize follow-up

**Jira Key:** UPD-47
**Epic:** UPD-43 (Invoice Dashboard & Tracking)
**Priority:** Should Have
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want** my overdue invoices to be visually highlighted in the dashboard
**So that** I can immediately identify which clients I need to follow up with for payment.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- In the main invoice list, any invoice that is past its `due_date` and still has a `status` of "sent" should be considered "Overdue".
- Overdue invoices should have a distinct visual treatment, such as a red or orange colored badge, text, or row background.
- A separate KPI card on the dashboard showing the total amount from all overdue invoices.
- A filter option for "Overdue" (covered in UPD-45, but this story ensures the visual distinction).

### Out of Scope

- Sending automatic notifications to the user about overdue invoices.
- Complex aging reports (e.g., 30-60-90 days overdue).

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: An invoice becomes overdue and is highlighted

- **Given:** I have a "Sent" invoice with a due date of yesterday.
- **When:** I view my invoice dashboard today.
- **Then:** That invoice is visually highlighted (e.g., with a red "Overdue" badge).
- **And:** The amount of this invoice is included in the "Total Overdue" KPI.

### Scenario 2: Paid invoice is not highlighted as overdue

- **Given:** I have an invoice whose due date was last week, but I marked it as "Paid" yesterday.
- **When:** I view my invoice dashboard.
- **Then:** This invoice is not highlighted as overdue and has a "Paid" status badge.

### Scenario 3: Draft invoice is not highlighted as overdue

- **Given:** I have a "Draft" invoice whose due date is in the past.
- **When:** I view my invoice dashboard.
- **Then:** This invoice is not highlighted as overdue; it only shows the "Draft" status.

---

## Technical Notes

### Frontend

- The component that renders each row in the invoice list needs to include logic to check if an invoice is overdue.
- `isOverdue = (invoice.status === 'sent' && new Date(invoice.dueDate) < new Date())`.
- Based on this `isOverdue` flag, it should apply conditional CSS classes to change the appearance of the row or a status badge.
- The "Total Overdue" KPI will be fetched from the `GET /api/invoices/dashboard` endpoint.

### Backend

- The `GET /api/invoices` endpoint could return a calculated boolean field `isOverdue` for each invoice to simplify frontend logic.
- The `GET /api/invoices/dashboard` endpoint will have a separate calculation for the `totalOverdue` amount: `SUM(total) WHERE status = 'sent' AND due_date < NOW()`.

---

## Dependencies

### Blocked By

- UPD-44 (View invoice dashboard)
- UPD-28 (Set due date)

### Blocks

- A critical feature for proactive payment collection.

---

## Definition of Done

- [ ] Overdue invoices are visually distinct in the UI.
- [ ] A "Total Overdue" KPI is displayed on the dashboard.
- [ ] Backend provides the necessary data to identify overdue invoices.
- [ ] E2E tests verify that invoices are correctly highlighted when they become overdue.
- [ ] All acceptance criteria are met.
