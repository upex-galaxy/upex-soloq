# As a user, I want to see a client's invoice history to have context of our relationship

**Jira Key:** UPD-18
**Epic:** UPD-13 (Client Management)
**Priority:** Should Have
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** see the history of all invoices for a specific client
**So that** I can quickly understand our financial history and see what's paid or pending.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A "Client Details" page, accessible from the main client list.
- This page will show the client's information at the top.
- Below the details, a list or table will display all invoices associated with that client.
- The invoice list should show key information like invoice number, issue date, due date, total amount, and status (Draft, Sent, Paid, Overdue).
- The list should be sorted by issue date, with the most recent first.

### Out of Scope

- Detailed analytics or charts on the client detail page (e.g., revenue over time).
- Bulk actions on the invoice list (e.g., mark multiple as paid).

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Viewing the history for a client with invoices

- **Given:** I have a client who has three invoices: one "Paid", one "Sent", and one "Overdue".
- **When:** I navigate to the "Clients" list and click to view this client's details.
- **Then:** I see the client's name and contact information.
- **And:** I see a list containing all three invoices with their respective statuses and amounts.

### Scenario 2: Viewing the history for a new client

- **Given:** I have just created a new client and they have no invoices.
- **When:** I navigate to this client's detail page.
- **Then:** I see the client's information.
- **And:** I see an empty state message like "No invoices have been created for this client yet."

### Scenario 3: Invoice status is reflected in the history

- **Given:** I am viewing a client's detail page, which shows an invoice with "Sent" status.
- **When:** I go and mark that invoice as "Paid".
- **And:** I return to the client's detail page.
- **Then:** The invoice in the history list now correctly shows the "Paid" status.

---

## Technical Notes

### Frontend

- Create a dynamic page at `/clients/[clientId]`.
- This page will first fetch the client's details from `GET /api/clients/[clientId]`.
- It will then fetch the list of invoices for that client from a new endpoint, `GET /api/clients/[clientId]/invoices`.
- The invoice list component can be reused from the main invoices page, but filtered for the specific client.

### Backend

- Create a new endpoint `GET /api/clients/[clientId]/invoices`.
- This endpoint will query the `invoices` table for all records matching the `client_id` and the authenticated user's `user_id`.
- The endpoint will return an array of invoice objects.

### Database

- A query will be performed on the `invoices` table, filtering by `client_id` and `user_id`. An index on `client_id` will be beneficial.

---

## Dependencies

### Blocked By

- UPD-15 (List all clients) - To be able to navigate to the detail page.
- EPIC-SOLOQ-004 (Invoice Creation) - Need invoices to exist to display a history.

### Blocks

- Provides important business context to the user.

---

## Definition of Done

- [ ] Frontend page for client details and invoice history is implemented.
- [ ] Backend API to fetch invoices for a specific client is functional.
- [ ] E2E test for viewing a client's detail page and verifying their invoice list is passing.
- [ ] The empty state is handled correctly.
- [ ] All acceptance criteria are met.
