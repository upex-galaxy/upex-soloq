# As a user, I want to create a new invoice by selecting a client to start invoicing

**Jira Key:** UPD-21
**Epic:** UPD-20 (Invoice Creation)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** start creating a new invoice by selecting a client from my list
**So that** all their details are automatically filled in, saving me time.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A "Create Invoice" button on the dashboard or invoices page.
- The first step of invoice creation is to select a client.
- The client selection can be a dropdown or a searchable modal.
- It should be possible to create a new client directly from this step if they don't exist yet (linking to the "Add Client" flow).
- Once a client is selected, a new draft invoice is created and the user is taken to the full invoice form.

### Out of Scope

- Selecting multiple clients for a single invoice.
- Creating an invoice without a client.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Select an existing client to create an invoice

- **Given:** I am an authenticated user and have at least one client in my list.
- **When:** I click the "Create Invoice" button.
- **And:** I select an existing client from the list presented.
- **Then:** I am redirected to the invoice creation form.
- **And:** The selected client's name and details are displayed on the form.

### Scenario 2: Create a new client during invoice creation

- **Given:** I am on the client selection step of creating an invoice.
- **And:** The client I want to invoice does not exist.
- **When:** I click the "Add New Client" button.
- **And:** I fill in the new client's details and save them.
- **Then:** The new client is automatically selected.
- **And:** I am taken to the invoice creation form with the new client's details populated.

---

## Technical Notes

### Frontend

- The client selection UI should be user-friendly, especially for users with many clients (searchable).
- Use a component like `shadcn/ui`'s Combobox.
- After selecting a client, the frontend should make a `POST` request to `/api/invoices` with the `clientId` to create a draft invoice, then navigate to `/invoices/[invoiceId]/edit`.

### Backend

- The `POST /api/invoices` endpoint must be able to handle creating a minimal draft invoice with just a `clientId` and `user_id`. It will set the status to `draft`.

---

## Dependencies

### Blocked By

- UPD-13 (Client Management epic)

### Blocks

- The entire invoice creation flow.

---

## Definition of Done

- [ ] UI for selecting a client is implemented.
- [ ] Logic for creating a draft invoice upon client selection is functional.
- [ ] E2E test for selecting a client and landing on the invoice form is passing.
- [ ] All acceptance criteria are met.
