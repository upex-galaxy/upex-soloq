# As a user, I want to add the client's tax data (RFC/NIT) to include it in the invoice

**Jira Key:** UPD-17
**Epic:** UPD-13 (Client Management)
**Priority:** Should Have
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** add tax information, like a Tax ID (RFC, NIT, etc.), to my client's profile
**So that** this information can be included on their invoices for formal or legal purposes.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- An optional "Tax ID" field in the "Add Client" and "Edit Client" forms.
- The saved Tax ID should be stored along with the other client data.
- This Tax ID should be automatically displayed on any invoice created for that client.

### Out of Scope

- Validating the format of the Tax ID.
- Any logic related to calculating taxes based on this ID.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Adding a Tax ID when creating a new client

- **Given:** I am on the "Add New Client" form.
- **When:** I fill in all the required fields and also enter "CLIENTTAXID123" in the "Tax ID" field.
- **And:** I save the new client.
- **Then:** The client is created successfully.
- **And:** When I create an invoice for this client, "CLIENTTAXID123" is displayed in the client details section.

### Scenario 2: Adding a Tax ID to an existing client

- **Given:** I am editing an existing client who does not have a Tax ID.
- **When:** I enter "CLIENTTAXID456" in the "Tax ID" field.
- **And:** I save the changes.
- **Then:** The client's profile is updated.
- **And:** Any new invoice for this client will now show the Tax ID.

### Scenario 3: Creating a client without a Tax ID

- **Given:** I am creating a new client.
- **When:** I leave the "Tax ID" field blank.
- **And:** I save the client.
- **Then:** The client is created successfully.
- **And:** The Tax ID section is not displayed on invoices for this client.

---

## Technical Notes

### Frontend

- Add an optional `taxId` text input to the client form component.
- Update the `zod` schema to include the optional `taxId` string.
- This field will be part of the payload for both `POST /api/clients` and `PUT /api/clients/[clientId]`.

### Backend

- The create and update client endpoints (`/api/clients` and `/api/clients/[clientId]`) must be updated to handle the optional `taxId` field.

### Database

- The `clients.tax_id` (string, nullable) field will be populated.

---

## Dependencies

### Blocked By

- UPD-14 (Add new client)
- UPD-16 (Edit client details)

### Blocks

- Creating fully compliant invoices for clients who require this information.

---

## Definition of Done

- [ ] Frontend form is updated with the optional "Tax ID" field.
- [ ] Backend endpoints are updated to handle the new field.
- [ ] E2E test for adding a Tax ID to a client and verifying it on an invoice is passing.
- [ ] All acceptance criteria are met.
