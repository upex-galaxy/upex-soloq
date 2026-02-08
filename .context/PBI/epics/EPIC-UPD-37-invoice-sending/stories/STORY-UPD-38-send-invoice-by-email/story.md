# As a user, I want to send the invoice by email to the client with one click to save time

**Jira Key:** UPD-38
**Epic:** UPD-37 (Invoice Sending)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** send the final invoice to my client via email with just one click
**So that** I can save time and streamline my collection process.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A "Send" or "Send by Email" button on the invoice detail/edit page.
- When clicked, this button opens a confirmation modal showing the recipient's email address (pre-filled from the client's profile).
- The modal will have a "Confirm & Send" button that triggers the email sending process.
- Upon successful sending, the invoice status changes from "draft" to "sent".

### Out of Scope

- Sending to multiple email addresses at once (only the client's primary email).
- Adding CC or BCC recipients in the MVP.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Send an invoice successfully

- **Given:** I am viewing a completed invoice in "draft" status.
- **When:** I click the "Send by Email" button.
- **And:** I see a confirmation modal showing the correct client email.
- **And:** I click "Confirm & Send".
- **Then:** I see a success notification: "Invoice sent successfully."
- **And:** The invoice's status is updated to "Sent" on the UI.

### Scenario 2: Invoice status is already "sent"

- **Given:** I am viewing an invoice that has already been "Sent".
- **When:** I look at the available actions.
- **Then:** The button text is "Resend" instead of "Send".
- **And:** Clicking it triggers the same sending flow.

### Scenario 3: Client has no email address

- **Given:** I am viewing an invoice for a client who has no email address saved.
- **When:** I click the "Send by Email" button.
- **Then:** The confirmation modal shows an error or a prompt to add an email address for the client first.
- **And:** The "Confirm & Send" button is disabled.

---

## Technical Notes

### Frontend

- The "Send" button triggers a `POST` request to `/api/invoices/[invoiceId]/send`.
- It should display a loading state while the backend processes the request.
- On success, it should update the local state of the invoice to reflect the new "sent" status and show a success toast.

### Backend

- The `POST /api/invoices/[invoiceId]/send` endpoint is the core of this story.
- It orchestrates fetching invoice data, generating the PDF, and calling the email service (Resend).
- It must update the `invoices` table (`status` = 'sent', `sent_at` = now()) upon successful email delivery.

### Database

- `invoices.status` will be updated from `draft` to `sent`.
- A new record will be inserted into `invoice_events` with `event_type` = 'sent'.

---

## Dependencies

### Blocked By

- UPD-31 (PDF Generation Epic)

### Blocks

- The primary way for a freelancer to get the invoice to their client.

---

## Definition of Done

- [ ] "Send by Email" button and confirmation modal are implemented.
- [ ] Backend API successfully sends the email and updates the invoice status.
- [ ] E2E test for sending an invoice is passing.
- [ ] All acceptance criteria are met.
