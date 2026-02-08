# As a user, I want to see the list of all my clients to quickly find who I need to invoice

**Jira Key:** UPD-15
**Epic:** UPD-13 (Client Management)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** see a list of all my clients
**So that** I can have an overview and quickly find the one I need.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A dedicated `/clients` page that displays a list or table of the user's clients.
- Each item in the list should display at least the client's name and email.
- The list should be paginated if it contains more than a certain number of clients (e.g., 20).
- A search bar to filter clients by name or email.
- Each client in the list should have actions, like "Edit" and "Delete".

### Out of Scope

- Advanced sorting options (e.g., by total billed, last invoice date).
- Bulk actions (e.g., delete multiple clients at once).
- Advanced filtering by custom fields or tags.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Viewing the list of clients

- **Given:** I am an authenticated user and have added several clients.
- **When:** I navigate to the "/clients" page.
- **Then:** I see a list of my clients, with each entry showing the client's name and email.

### Scenario 2: Searching for a specific client

- **Given:** I am on the "/clients" page and I have a client named "Specific Client Inc.".
- **When:** I type "Specific" into the search bar.
- **Then:** The list updates to show only "Specific Client Inc." and any other clients matching the query.

### Scenario 3: Handling an empty client list

- **Given:** I am a new authenticated user and have not added any clients yet.
- **When:** I navigate to the "/clients" page.
- **Then:** I see an "empty state" message like "You haven't added any clients yet."
- **And:** A prominent "Add New Client" button is visible.

### Scenario 4: Navigating through paginated results

- **Given:** I have 25 clients and the page size is 20.
- **When:** I am on the "/clients" page.
- **Then:** I see the first 20 clients and pagination controls (e.g., "Page 1 of 2", "Next").
- **When:** I click "Next" or "Page 2".
- **Then:** I see the remaining 5 clients.

---

## Technical Notes

### Frontend

- The `/clients` page will fetch data from the `/api/clients` endpoint.
- Use a state management solution (like React Query or SWR) to handle fetching, caching, and pagination.
- The search input will trigger a new API request with the `search` query parameter. Debouncing the input is recommended.
- The UI can be a table (`shadcn/ui Table`) or a list of cards.

### Backend

- The `GET /api/clients` endpoint will fetch clients belonging to the authenticated user (enforced by RLS).
- It will support `search`, `page`, and `limit` query parameters.
- The search logic should query against the `name` and `email` fields in the `clients` table.
- The response should include the list of clients and pagination metadata (total count, total pages).

### Database

- Queries will be performed on the `public.clients` table.
- An index on the `name` and `email` columns will improve search performance.

---

## Dependencies

### Blocked By

- UPD-14 (Add new client) - Need a way to create clients to list them.

### Blocks

- A core part of the user workflow for managing clients and initiating invoices.

---

## Definition of Done

- [ ] Frontend page to list clients is implemented with search and pagination.
- [ ] Backend API to fetch and search clients is functional.
- [ ] E2E test for searching and navigating the client list is passing.
- [ ] The "empty state" is handled correctly.
- [ ] All acceptance criteria are met.
