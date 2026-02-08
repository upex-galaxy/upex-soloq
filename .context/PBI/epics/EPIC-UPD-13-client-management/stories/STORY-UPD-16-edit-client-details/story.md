# As a user, I want to edit a client's data to keep the information updated

**Jira Key:** UPD-16
**Epic:** UPD-13 (Client Management)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** edit the details of an existing client
**So that** I can keep their information accurate and up-to-date.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- An "Edit" action available for each client in the client list.
- Clicking "Edit" should open a form (modal or separate page) pre-filled with the client's current data.
- The user can modify any of the client's fields (name, email, company, etc.).
- The same validation rules as the "Add Client" form apply.
- Saving the form updates the client's record in the database.

### Out of Scope

- Viewing a history of changes made to a client's profile.
- In-line editing directly in the client list table.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Successfully edit a client's details

- **Given:** I have a client named "Old Name" with the email "old@email.com".
- **And:** I am on the "Clients" list page.
- **When:** I click the "Edit" button for the client "Old Name".
- **And:** I change the name to "New Name" and the email to "new@email.com".
- **And:** I click "Save Changes".
- **Then:** I see a success message: "Client updated successfully."
- **And:** The client list now shows "New Name" and "new@email.com".

### Scenario 2: Attempt to save invalid data while editing

- **Given:** I am editing an existing client.
- **When:** I clear the "Name" field, leaving it empty.
- **And:** I click "Save Changes".
- **Then:** I see an error message: "Name is required."
- **And:** The changes are not saved.

### Scenario 3: Attempt to change email to one that already exists for another client

- **Given:** I have two clients, Client A ("a@test.com") and Client B ("b@test.com").
- **When:** I edit Client A and try to change their email to "b@test.com".
- **And:** I click "Save Changes".
- **Then:** I see an error message: "A client with this email already exists."
- **And:** The changes are not saved.

---

## Technical Notes

### Frontend

- The "Edit" button will navigate to a dynamic route like `/clients/[clientId]/edit` or open a modal.
- The form will be the same component as the "Add Client" form but will be pre-populated with data fetched from `GET /api/clients/[clientId]`.
- On submit, a `PUT` request is sent to `/api/clients/[clientId]` with the updated data.

### Backend

- The `PUT /api/clients/[clientId]` endpoint will validate the incoming data.
- It will perform a check for duplicate emails, excluding the current client being edited.
- It will update the corresponding record in the `clients` table, ensuring the user owns that client via RLS.

### Database

- An existing row in the `public.clients` table will be updated.

---

## Dependencies

### Blocked By

- UPD-15 (List all clients) - Need the client list to access the "Edit" action.

### Blocks

- Maintaining an accurate client database.

---

## Definition of Done

- [ ] Frontend form for editing a client is implemented and pre-populates data correctly.
- [ ] Backend API for updating a client is functional and secure.
- [ ] E2E test for editing a client's name and email and verifying the update is passing.
- [ ] All acceptance criteria, including validation and duplicate checks, are met.
