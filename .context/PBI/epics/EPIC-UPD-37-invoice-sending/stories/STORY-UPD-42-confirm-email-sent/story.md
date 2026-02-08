# As a user, I want to see if the email was sent successfully to have certainty that it arrived

**Jira Key:** UPD-42
**Epic:** UPD-37 (Invoice Sending)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** user
**I want to** have a clear confirmation that the invoice email was sent successfully
**So that** I have peace of mind and a record of when I sent it.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- After clicking "Confirm & Send", the user should receive immediate feedback in the UI (e.g., a toast notification) indicating success or failure.
- A "Last Sent" timestamp should be displayed on the invoice details page.
- An entry should be created in an `invoice_events` log table to record the sending event.

### Out of Scope

- Real-time delivery status tracking (e.g., "Delivered", "Opened", "Bounced"). This is a more advanced feature.
- A detailed log of email sending attempts visible to the user in the UI.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Successful email send confirmation

- **Given:** I am sending an invoice email.
- **When:** The email is successfully sent by the backend service.
- **Then:** The UI displays a success message, for example, "Invoice successfully sent to client@email.com".
- **And:** On the invoice details page, a timestamp for "Last Sent" is displayed (e.g., "Sent on Feb 6, 2026, 10:30 AM").

### Scenario 2: Failed email send notification

- **Given:** I am sending an invoice email.
- **When:** The email service (Resend) fails to send the email and returns an error.
- **Then:** The UI displays an error message, for example, "Failed to send invoice. Please try again."
- **And:** The invoice status remains "draft".

---

## Technical Notes

### Frontend

- The code that calls the `POST /api/invoices/[invoiceId]/send` endpoint must handle the success and error responses from the API.
- On success, it should trigger a success notification and update the UI to show the "sent" status and timestamp.
- On failure, it should trigger an error notification.

### Backend

- The `/api/invoices/[invoiceId]/send` endpoint should have robust error handling.
- It should wrap the call to the Resend API in a `try...catch` block.
- If Resend returns a successful response, the backend proceeds to update the `invoices.status` and `invoices.sent_at` fields and returns a `200 OK` response.
- If Resend throws an error, the backend should log the error and return a `500 Internal Server Error` response.
- A record of the 'sent' event should be added to the `invoice_events` table upon success.

### Database

- `invoices.sent_at` (timestamp) will be updated on successful send.
- `invoice_events` table will get a new row with `event_type` = 'sent'.

---

## Dependencies

### Blocked By

- UPD-38 (Send invoice by email with one click)

### Blocks

- Provides crucial feedback to the user, closing the loop on the sending action.

---

## Definition of Done

- [ ] Frontend provides clear success/error feedback after a send attempt.
- [ ] Backend has robust error handling for the email sending process.
- [ ] The `sent_at` timestamp and an `invoice_event` are recorded on success.
- [ ] E2E tests for both successful and failed send attempts are passing.
- [ ] All acceptance criteria are met.
