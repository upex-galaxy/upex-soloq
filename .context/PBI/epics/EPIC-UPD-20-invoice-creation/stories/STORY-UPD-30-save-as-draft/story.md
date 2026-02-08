# As a user, I want to save an invoice as a draft to finish it later

**Jira Key:** UPD-30
**Epic:** UPD-20 (Invoice Creation)
**Priority:** Should Have
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** save an incomplete invoice as a draft
**So that** I can close it and come back later to finish and send it without losing my work.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A "Save as Draft" button in the invoice creation form.
- Clicking this button saves the current state of the invoice, even if it has validation errors (e.g., missing fields).
- The invoice is saved with a `status` of `draft`.
- Draft invoices should be clearly marked in the main invoice list (e.g., with a "Draft" badge).
- The user can open a draft invoice from the list to continue editing it.

### Out of Scope

- Autosaving the draft in the background every few seconds. Saving is a manual user action.
- Version history for drafts.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Save a partially completed invoice as a draft

- **Given:** I am creating a new invoice, have selected a client, and added one line item, but no due date.
- **When:** I click the "Save as Draft" button.
- **Then:** The invoice is saved successfully with a "Draft" status.
- **And:** I am redirected to the main invoice list, where I can see the new draft.

### Scenario 2: Continue editing a draft invoice

- **Given:** I have a draft invoice in my invoice list.
- **When:** I click on the draft invoice to open it.
- **Then:** I am taken to the invoice editing form, which is pre-filled with all the previously saved information.
- **And:** I can continue editing, fill in the remaining fields, and then send it.

### Scenario 3: "Save as Draft" works with incomplete data

- **Given:** I am creating an invoice and have only selected a client.
- **When:** I click "Save as Draft".
- **Then:** The invoice is saved with the client information and a "Draft" status.
- **And:** No validation errors are shown for missing fields like line items or due date.

---

## Technical Notes

### Frontend

- The "Save as Draft" button will trigger a submit action, but with a flag indicating the desired status is `draft`.
- This might call the same `PUT /api/invoices/[invoiceId]` endpoint but with a query parameter like `?status=draft`, or a specific field in the request body.
- When saving as a draft, client-side validation for required fields (like due date) should be bypassed.

### Backend

- The invoice API endpoint needs to handle the `draft` status.
- When saving as a draft, the backend should relax its validation rules, only requiring the bare minimum (e.g., `user_id` and `client_id`).
- When a user tries to change the status from `draft` to `sent`, the backend must perform a full validation to ensure all required fields are now present.

### Database

- The `invoices.status` (enum) column will be set to `'draft'`.

---

## Dependencies

### Blocked By

- UPD-21 (Create new invoice)

### Blocks

- Provides a better user experience by preventing data loss for users who get interrupted.

---

## Definition of Done

- [ ] "Save as Draft" button is implemented.
- [ ] Backend logic correctly handles saving incomplete invoices as drafts.
- [ ] Draft invoices are clearly identifiable in the main invoice list.
- [ ] Users can successfully open and continue editing a draft.
- [ ] All acceptance criteria are met.
