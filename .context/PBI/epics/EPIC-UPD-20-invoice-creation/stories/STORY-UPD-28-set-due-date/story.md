# As a user, I want to set a due date to define when I expect the payment

**Jira Key:** UPD-28
**Epic:** UPD-20 (Invoice Creation)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** set an issue date and a due date for my invoice
**So that** my client knows the payment terms and by when they are expected to pay.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A field for "Issue Date" on the invoice form, which defaults to the current date.
- A field for "Due Date" on the invoice form.
- Both fields should use a calendar date picker for easy selection.
- The form could offer quick-selection options for the due date (e.g., "On receipt", "Net 15", "Net 30").
- The selected dates must be saved with the invoice and displayed on the PDF.
- The due date is crucial for determining when an invoice becomes "Overdue".

### Out of Scope

- Complex payment term logic (e.g., "50% upfront, 50% on delivery").
- Automatically changing the invoice status to "Overdue" in real-time (this is typically handled by a daily background job or when viewing the invoice).

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Set issue and due dates

- **Given:** I am creating a new invoice.
- **When:** I see the "Issue Date" is pre-filled with today's date.
- **And:** I use the date picker to select a "Due Date" 30 days in the future.
- **And:** I save the invoice.
- **Then:** The invoice is saved with the correct issue and due dates.
- **And:** The PDF version of the invoice displays both dates clearly.

### Scenario 2: Use a quick-selection option for due date

- **Given:** I am creating an invoice with an issue date of February 6, 2026.
- **When:** I click the "Net 15" quick-selection option for the due date.
- **Then:** The "Due Date" field automatically updates to February 21, 2026.

### Scenario 3: Due date must be on or after the issue date

- **Given:** I am creating an invoice with an issue date of February 6, 2026.
- **When:** I attempt to select a due date of February 5, 2026.
- **Then:** An error message is displayed: "Due date cannot be before the issue date."
- **And:** The form does not save.

---

## Technical Notes

### Frontend

- Use a date picker component from a library like `shadcn/ui` or `react-day-picker`.
- Implement the logic for the "Net 15/30" quick-selection buttons.
- Add client-side validation to ensure `dueDate >= issueDate`.

### Backend

- The `issueDate` and `dueDate` fields will be part of the payload to the invoice API.
- The backend must also validate that `dueDate` is not before `issueDate`.

### Database

- `invoices.issue_date` (date) and `invoices.due_date` (date) columns will be populated.

---

## Dependencies

### Blocked By

- UPD-21 (Create new invoice)

### Blocks

- **EPIC-SOLOQ-007 (Dashboard & Tracking):** The due date is essential for the "Overdue" status calculation.
- **EPIC-SOLOQ-009 (Automatic Reminders):** Reminders are triggered based on the due date.

---

## Definition of Done

- [ ] Date picker components for issue and due dates are implemented.
- [ ] Validation for the date logic is functional on both frontend and backend.
- [ ] The dates are correctly saved and displayed on the invoice.
- [ ] All acceptance criteria are met.
