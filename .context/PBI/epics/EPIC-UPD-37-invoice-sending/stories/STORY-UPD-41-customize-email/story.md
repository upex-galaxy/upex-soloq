# As a user, I want to customize the subject and message of the email to better communicate with my client

**Jira Key:** UPD-41
**Epic:** UPD-37 (Invoice Sending)
**Priority:** Should Have
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** be able to customize the subject and body of the invoice email before sending it
**So that** I can add a personal touch, provide specific context, or maintain my unique tone of communication with the client.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- In the "Send Invoice" confirmation modal, the "Subject" and "Message" fields should be editable.
- The fields will be pre-filled with a default, professional template.
- The user's custom text will be used for the email that is sent.
- The customization applies only to the current email being sent; it does not change the default template for future emails.

### Out of Scope

- Saving custom email templates for reuse.
- A rich text editor for the email body (plain text is sufficient for MVP).
- Using variables or placeholders (like `{client_name}`) in the custom message.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Send an invoice with a custom message

- **Given:** I am in the "Send Invoice" confirmation modal.
- **And:** The message field is pre-filled with a default template.
- **When:** I edit the message to say "Hi John, here is the invoice for the recent work. Thanks!".
- **And:** I click "Confirm & Send".
- **Then:** The client receives an email where the body contains my custom message.

### Scenario 2: Send an invoice with a custom subject

- **Given:** I am in the "Send Invoice" confirmation modal.
- **When:** I edit the subject line to "Invoice for Project X Final Phase".
- **And:** I send the email.
- **Then:** The client receives an email with that exact subject line.

### Scenario 3: Send an invoice without customization

- **Given:** I am in the "Send Invoice" confirmation modal.
- **When:** I do not edit the pre-filled subject or message.
- **And:** I send the email.
- **Then:** The client receives an email with the default subject and message.

---

## Technical Notes

### Frontend

- The "Send Invoice" modal needs to have editable input/textarea fields for the subject and message.
- The custom text from these fields will be included in the body of the `POST` request to `/api/invoices/[invoiceId]/send`.

### Backend

- The `POST /api/invoices/[invoiceId]/send` endpoint will need to accept optional `subject` and `message` fields in its request body.
- If these fields are provided, they should override the default values used in the React Email template. The template component will need to be designed to accept these as props.

---

## Dependencies

### Blocked By

- UPD-38 (Send invoice by email with one click)

### Blocks

- Improves user satisfaction by giving them more control over their client communication.

---

## Definition of Done

- [ ] "Send Invoice" modal is updated with editable subject and message fields.
- [ ] Backend API is updated to use the custom text when provided.
- [ ] E2E test for sending an invoice with a custom message and verifying it in the received email is passing.
- [ ] All acceptance criteria are met.
