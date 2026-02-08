# As a user, I want to search for invoices by client or number to find a specific one

**Jira Key:** UPD-48
**Epic:** UPD-43 (Invoice Dashboard & Tracking)
**Priority:** Should Have
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer with many invoices
**I want to** be able to search for a specific invoice by typing a client's name or an invoice number
**So that** I can find the exact invoice I'm looking for quickly without scrolling through a long list.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A search input field on the invoice dashboard page.
- As the user types in the search field, the list of invoices should update to show only matching results.
- The search should match against the invoice number and the client's name.
- The search should work in combination with the status filters.

### Out of Scope

- Searching within invoice line item descriptions or notes.
- Advanced search syntax (e.g., using quotes or boolean operators).

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Search by client name

- **Given:** I am on the invoice dashboard and I have invoices for "Client A" and "Client B".
- **When:** I type "Client A" into the search bar.
- **Then:** The list updates to show only the invoices associated with "Client A".

### Scenario 2: Search by invoice number

- **Given:** I am on the invoice dashboard.
- **And:** I have an invoice with the number "INV-2026-0015".
- **When:** I type "0015" into the search bar.
- **Then:** The list updates to show only invoice "INV-2026-0015".

### Scenario 3: Search combined with a status filter

- **Given:** I am on the invoice dashboard and have the "Paid" filter active.
- **And:** "Client A" has both "Paid" and "Sent" invoices.
- **When:** I type "Client A" into the search bar.
- **Then:** The list updates to show only the "Paid" invoices for "Client A".

### Scenario 4: No results found

- **Given:** I am on the invoice dashboard.
- **When:** I type "NonExistentClient" into the search bar.
- **Then:** The list becomes empty and an empty state message is displayed: "No invoices found for your search."

---

## Technical Notes

### Frontend

- The search input's `onChange` event should trigger a re-fetch of the invoice list.
- To avoid excessive API calls while the user is typing, the input should be "debounced" (e.g., wait 300ms after the user stops typing before sending the request).
- The search term will be passed as a query parameter to the API, e.g., `GET /api/invoices?search=ClientA`.

### Backend

- The `GET /api/invoices` endpoint must be updated to handle the `search` query parameter.
- The backend query will need to perform a `LIKE` or full-text search on the `invoices.invoice_number` column and the `clients.name` column (requiring a `JOIN`).

### Database

- A `JOIN` between `invoices` and `clients` tables will be necessary for the search.
- Using `ILIKE` in PostgreSQL for case-insensitive searching is recommended.
- For better performance at scale, a full-text search index could be created on the relevant columns.

---

## Dependencies

### Blocked By

- UPD-44 (View invoice dashboard)

### Blocks

- Essential for users with a large volume of invoices.

---

## Definition of Done

- [ ] Search input is implemented on the dashboard.
- [ ] Backend API correctly filters results based on the search term across invoice number and client name.
- [ ] Search works correctly in combination with status filters.
- [ ] The search input is debounced for better performance.
- [ ] E2E tests for various search scenarios are passing.
- [ ] All acceptance criteria are met.
