# As a user, I want to add notes or terms and conditions to communicate additional information

**Jira Key:** UPD-29
**Epic:** UPD-20 (Invoice Creation)
**Priority:** Should Have
**Story Points:** 1
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** add notes or my standard terms and conditions to an invoice
**So that** I can communicate additional information, such as payment instructions, project scope, or late fee policies.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A text area field on the invoice form, labeled "Notes / Terms".
- The user can input a multi-line block of text.
- This text is saved with the invoice.
- The text is displayed in a designated section on the generated PDF, typically near the bottom.

### Out of Scope

- Saving default notes/terms in the user's profile to be auto-filled on every invoice (this could be a future improvement).
- A rich text editor for the notes. Plain text is sufficient for the MVP.
- Different notes for the email version vs. the PDF version.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Add notes to an invoice

- **Given:** I am creating an invoice.
- **When:** I type "Payment is due within 30 days. A late fee of 5% will be applied to overdue payments." into the "Notes / Terms" field.
- **And:** I save the invoice.
- **Then:** The notes are saved successfully.
- **And:** When I preview the invoice PDF, the text I entered is displayed in the notes section.

### Scenario 2: Create an invoice with no notes

- **Given:** I am creating an invoice.
- **When:** I leave the "Notes / Terms" field blank.
- **And:** I save the invoice.
- **Then:** The invoice is saved successfully.
- **And:** The notes section is not visible on the invoice PDF.

---

## Technical Notes

### Frontend

- Add a `<textarea>` component to the invoice form for the `notes` field.
- The component can have a max character limit (e.g., 2000 characters) to prevent abuse.
- The `zod` schema will define it as an optional string.

### Backend

- The optional `notes` field will be part of the payload to the invoice API.
- The backend will save this string to the database.

### Database

- The `invoices.notes` (text, nullable) column will be populated.

---

## Dependencies

### Blocked By

- UPD-21 (Create new invoice)

### Blocks

- None. This is an optional, enhancing feature.

---

## Definition of Done

- [ ] Frontend form includes the "Notes / Terms" text area.
- [ ] Backend correctly saves the notes data.
- [ ] The notes are correctly displayed on the generated PDF.
- [ ] All acceptance criteria are met.
