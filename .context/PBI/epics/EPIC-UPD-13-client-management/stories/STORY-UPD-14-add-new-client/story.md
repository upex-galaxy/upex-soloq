# As a user, I want to add a new client with name and email to be able to invoice them

**Jira Key:** UPD-14
**Epic:** UPD-13 (Client Management)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** add a new client with their name and email
**So that** I can select them later when creating an invoice.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A form (modal or separate page) to create a new client.
- The form must include fields for `name` (required) and `email` (required).
- Optional fields for company, phone, address, and notes.
- Client-side and server-side validation for required fields and email format.
- On successful creation, the user is notified and the new client is available in the client list.
- A check to prevent a user from creating two clients with the same email address.

### Out of Scope

- Importing clients from other sources (e.g., Google Contacts).
- Assigning a default currency or language to a client.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Successfully add a new client with required information

- **Given:** I am an authenticated user on the "Clients" page.
- **When:** I open the "Add New Client" form.
- **And:** I fill in "New Client Name" for the name and "new@client.com" for the email.
- **And:** I click "Save Client".
- **Then:** I see a success message: "Client created successfully."
- **And:** "New Client Name" appears in my list of clients.

### Scenario 2: Attempt to add a client with a missing name

- **Given:** I am on the "Add New Client" form.
- **When:** I fill in an email but leave the "Name" field blank.
- **And:** I click "Save Client".
- **Then:** An error message "Name is required" is displayed next to the name field.
- **And:** The client is not created.

### Scenario 3: Attempt to add a client with a duplicate email

- **Given:** I already have a client with the email "existing@client.com".
- **When:** I try to add a new client with the email "existing@client.com".
- **And:** I click "Save Client".
- **Then:** An error message "A client with this email already exists." is displayed.
- **And:** The new client is not created.

---

## Technical Notes

### Frontend

- The "Add Client" button will open a modal with the client creation form.
- The form will be managed by `react-hook-form` with a `zod` schema for validation.
- On submit, a `POST` request is sent to `/api/clients`.

### Backend

- The `POST /api/clients` endpoint will validate the data.
- It will check if a client with the same `email` and `user_id` already exists.
- If validation passes, it will insert a new record into the `clients` table with the current user's `user_id`.

### Database

- A new row will be inserted into the `public.clients` table.

---

## Dependencies

### Blocked By

- UPD-1 (Authentication Epic).

### Blocks

- UPD-15 (List all clients) - Needs clients to list.
- Core functionality of invoice creation.

---

## Definition of Done

- [ ] Frontend form for creating a client is implemented.
- [ ] Backend API for creating a client is functional and secure.
- [ ] Unit tests for form validation are passing.
- [ ] Integration test for the `POST /api/clients` endpoint passes, including the duplicate email check.
- [ ] E2E test for creating a client and seeing it in the list is passing.
- [ ] All acceptance criteria are met.
