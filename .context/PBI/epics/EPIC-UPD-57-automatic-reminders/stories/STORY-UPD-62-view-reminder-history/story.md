# As a Pro user, I want to see the history of reminders sent to know how many times I have contacted the client

**Jira Key:** UPD-62
**Epic:** UPD-57 (Automatic Reminders)
**Priority:** Medium
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Pro user
**I want to** see a history of the automatic reminders that have been sent for a specific invoice
**So that** I know when and how many times my client has been contacted.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- On the invoice detail page, a section or timeline showing "Invoice History".
- This history will display events related to the invoice, including each time an automatic reminder was sent.
- Each "Reminder Sent" event in the history should include the date it was sent.

### Out of Scope

- A detailed view of the exact content of each reminder sent.
- Delivery status of the reminder (e.g., "Delivered", "Opened").

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: View the history of sent reminders

- **Given:** An automatic reminder was sent for invoice #123 yesterday, and another one was sent 8 days ago.
- **When:** I view the detail page for invoice #123.
- **Then:** In the history section, I see two entries: "Reminder sent on [Yesterday's Date]" and "Reminder sent on [Date from 8 days ago]".

### Scenario 2: History is updated after a new reminder is sent

- **Given:** I am viewing the detail page for an overdue invoice that has one reminder in its history.
- **When:** The daily reminder process runs and sends a new reminder for this invoice.
- **And:** I refresh the invoice detail page.
- **Then:** The history section now shows a new, second "Reminder sent" event with today's date.

---

## Technical Notes

### Frontend

- The invoice detail page component will fetch data from a new endpoint for invoice events.
- It will render these events in a timeline or list format.

### Backend

- The daily reminder process (from UPD-58) is already responsible for creating an `invoice_event` with type `reminder_sent`. This story leverages that existing data.
- Create a new endpoint, `GET /api/invoices/[invoiceId]/events`, that retrieves all events from the `invoice_events` table for a specific invoice, ordered by date.

### Database

- This story relies entirely on the `public.invoice_events` table being populated correctly by other processes.
- The query will be `SELECT * FROM invoice_events WHERE invoice_id = :invoice_id ORDER BY created_at DESC`.

---

## Dependencies

### Blocked By

- UPD-58 (System sends automatic reminders) - This story displays the data that story creates.

### Blocks

- Provides transparency and confidence to the user about the reminder system's actions.

---

## Definition of Done

- [ ] Backend API to fetch the event history for an invoice is implemented.
- [ ] Frontend invoice detail page displays the history of "Reminder Sent" events.
- [ ] E2E tests verify that the history is correctly updated and displayed after a reminder is sent.
- [ ] All acceptance criteria are met.
