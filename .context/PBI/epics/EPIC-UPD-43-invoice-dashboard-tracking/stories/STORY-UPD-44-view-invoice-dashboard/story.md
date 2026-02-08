# As a user, I want to see a dashboard with all my invoices to get a general overview

**Jira Key:** UPD-44
**Epic:** UPD-43 (Invoice Dashboard & Tracking)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** see a dashboard that lists all my invoices
**So that** I can have a single place to view and manage them.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A primary view (e.g., a page at `/invoices`) that displays a table or list of all invoices created by the user.
- Each row in the list must display essential information: Invoice Number, Client Name, Issue Date, Due Date, Total Amount, and Status.
- The list should be paginated to handle a large number of invoices efficiently.
- The list should be sorted by default by issue date in descending order (most recent first).

### Out of Scope

- In-line editing of invoices directly from the list.
- Customizable columns in the invoice table.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Viewing the invoice dashboard with existing invoices

- **Given:** I am an authenticated user with several invoices.
- **When:** I navigate to the main invoice dashboard.
- **Then:** I see a list of my invoices, sorted with the most recent one at the top.
- **And:** Each invoice in the list shows its number, client, due date, total, and status.

### Scenario 2: Viewing the invoice dashboard as a new user

- **Given:** I am a new user and have not created any invoices yet.
- **When:** I navigate to the main invoice dashboard.
- **Then:** I see an empty state message (e.g., "Your invoices will appear here once you create them.").
- **And:** A prominent "Create New Invoice" button is visible.

---

## Technical Notes

### Frontend

- Create a page component for `/invoices`.
- Use a data fetching library like SWR or React Query to call the `GET /api/invoices` endpoint. This will handle loading states, errors, and caching.
- Use a reusable table component (e.g., from `shadcn/ui`) to display the data.
- Implement client-side UI for pagination that interacts with the API's `page` and `limit` parameters.

### Backend

- The `GET /api/invoices` endpoint will fetch all invoices for the authenticated user (enforced by RLS).
- It will support pagination parameters (`page`, `limit`).
- The query should join with the `clients` table to include the client's name in the response, avoiding extra requests from the frontend.

---

## Dependencies

### Blocked By

- UPD-20 (Invoice Creation Epic) - Must be able to create invoices to list them.

### Blocks

- Almost all other stories in this epic, as they add functionality (filtering, search) to this base list.

---

## Definition of Done

- [ ] A page displaying a paginated list of invoices is implemented.
- [ ] Backend API provides the necessary data efficiently.
- [ ] The empty state is correctly handled.
- [ ] E2E tests verify the list displays correct data and pagination works.
- [ ] All acceptance criteria are met.
