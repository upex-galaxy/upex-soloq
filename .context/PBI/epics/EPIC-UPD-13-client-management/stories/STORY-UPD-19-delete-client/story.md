# As a user, I want to delete a client I no longer use to keep my list clean

**Jira Key:** UPD-19
**Epic:** UPD-13 (Client Management)
**Priority:** Could Have
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** delete a client that I no longer work with
**So that** I can keep my client list tidy and relevant.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A "Delete" action for each client in the client list.
- A confirmation modal to prevent accidental deletion ("Are you sure you want to delete this client?").
- If a client has no associated invoices, they can be deleted (soft delete).
- After deletion, the client no longer appears in the main client list or in dropdowns for creating new invoices.
- If a client has invoices (even old, paid ones), the deletion should be prevented, and a message should inform the user why.

### Out of Scope

- Archiving clients (as an alternative to deletion).
- Bulk deletion of multiple clients.
- Merging duplicate clients.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Successfully delete a client with no invoices

- **Given:** I have a client who has never been invoiced.
- **When:** I click the "Delete" button for that client.
- **And:** I confirm my choice in the confirmation modal.
- **Then:** I see a success message: "Client deleted successfully."
- **And:** The client is removed from my client list.

### Scenario 2: Attempt to delete a client that has invoices

- **Given:** I have a client who has at least one invoice associated with them.
- **When:** I click the "Delete" button for that client.
- **And:** I confirm my choice.
- **Then:** I see an error message: "This client cannot be deleted because they have existing invoices."
- **And:** The client remains in my client list.

### Scenario 3: User cancels the deletion from the confirmation modal

- **Given:** I am prompted with an "Are you sure?" confirmation modal for deleting a client.
- **When:** I click the "Cancel" button.
- **Then:** The modal closes.
- **And:** The client is not deleted and remains in the list.

---

## Technical Notes

### Frontend

- The "Delete" button will trigger a confirmation modal.
- On confirmation, a `DELETE` request is sent to `/api/clients/[clientId]`.
- The frontend should handle the API response, showing a success or error toast notification and refreshing the client list.

### Backend

- The `DELETE /api/clients/[clientId]` endpoint will first check if any invoices exist for that `client_id`.
- If invoices exist, it will return a `400 Bad Request` error with a descriptive message.
- If no invoices exist, it will perform a "soft delete" by setting the `deleted_at` timestamp on the client's record. It will not physically delete the row.

### Database

- The `clients.deleted_at` (timestamp, nullable) field will be updated.
- The RLS policy for selecting clients must be updated to exclude those where `deleted_at` is not null. `... AND deleted_at IS NULL`.

---

## Dependencies

### Blocked By

- UPD-15 (List all clients).

### Blocks

- None. This is a "cleanup" feature.

---

## Definition of Done

- [ ] Frontend delete button, confirmation modal, and API call are implemented.
- [ ] Backend API correctly handles both successful (soft) deletion and the error case (client has invoices).
- [ ] RLS policies are updated to hide soft-deleted clients.
- [ ] E2E tests for both deletion scenarios (success and failure) are passing.
- [ ] All acceptance criteria are met.
