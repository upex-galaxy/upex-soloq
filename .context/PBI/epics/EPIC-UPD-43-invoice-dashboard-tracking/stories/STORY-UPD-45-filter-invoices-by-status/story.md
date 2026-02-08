# As a user, I want to filter invoices by status to find the ones I need

**Jira Key:** UPD-45
**Epic:** UPD-43 (Invoice Dashboard & Tracking)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** filter my list of invoices by their status (Draft, Sent, Paid, Overdue)
**So that** I can quickly focus on a specific group, like all the invoices that are pending payment.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A set of filter controls (e.g., tabs, buttons, or a dropdown) on the invoice dashboard.
- The available filter options are: "All", "Draft", "Sent", "Paid", "Overdue".
- Selecting a filter should update the invoice list to show only invoices with that status.
- The filter state should be reflected in the UI (e.g., the selected filter button is highlighted).

### Out of Scope

- Combining multiple status filters (e.g., showing "Sent" AND "Overdue").
- Saving filter preferences for the user.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Filter invoices by "Paid" status

- **Given:** I am on the invoice dashboard viewing all my invoices.
- **And:** I have a mix of invoices with "Paid", "Sent", and "Draft" statuses.
- **When:** I click the "Paid" filter.
- **Then:** The list updates to show only the invoices with the "Paid" status.
- **And:** The "Paid" filter control appears active.

### Scenario 2: Filter invoices by "Overdue" status

- **Given:** I am on the invoice dashboard.
- **And:** I have two invoices whose due dates have passed.
- **When:** I click the "Overdue" filter.
- **Then:** The list displays only those two overdue invoices.

### Scenario 3: Return to "All" invoices

- **Given:** I am currently filtering my invoices by "Draft" status.
- **When:** I click the "All" filter.
- **Then:** The list updates to show all my invoices, regardless of their status.

---

## Technical Notes

### Frontend

- Add filter controls to the `/invoices` page.
- When a filter is selected, the component should re-fetch the data from the API, adding a `status=[selected_status]` query parameter to the request.
- The URL could also be updated to reflect the filter state (e.g., `/invoices?status=paid`), which makes the state shareable and refresh-proof.

### Backend

- The `GET /api/invoices` endpoint must be updated to handle the `status` query parameter.
- The backend query to the database will include a `WHERE` clause on the `invoices.status` column.
- The logic for "Overdue" is special: it's not a status in the database. The query should be `WHERE status = 'sent' AND due_date < NOW()`.

---

## Dependencies

### Blocked By

- UPD-44 (View invoice dashboard)

### Blocks

- A core feature for managing the invoice lifecycle efficiently.

---

## Definition of Done

- [ ] Frontend filter controls are implemented and functional.
- [ ] Backend API correctly filters invoices based on the `status` parameter.
- [ ] The special logic for the "Overdue" filter is implemented correctly.
- [ ] E2E tests for applying each filter and verifying the results are passing.
- [ ] All acceptance criteria are met.
