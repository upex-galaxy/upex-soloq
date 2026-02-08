# As a Pro user, I want to customize the reminder message to maintain my tone of communication

**Jira Key:** UPD-60
**Epic:** UPD-57 (Automatic Reminders)
**Priority:** Medium
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Pro user
**I want to** customize the subject and body of the automatic reminder email
**So that** the message aligns with my brand's voice and my relationship with my clients.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Input fields in the "Reminder Settings" page for a custom "Subject" and "Message" body.
- These fields will be pre-filled with a default template.
- The user can use special placeholders in their custom message (e.g., `{client_name}`, `{invoice_number}`, `{due_date}`, `{total_amount}`) that will be replaced with the actual invoice data when the email is sent.
- The custom message is saved and used for all automatic reminders.

### Out of Scope

- Different custom messages for different reminder stages (e.g., first reminder vs. third reminder).
- A rich text editor for the message body.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Customize and save the reminder message

- **Given:** I am a Pro user on the "Reminder Settings" page.
- **When:** I edit the subject field to "Just a friendly reminder for invoice {invoice_number}".
- **And:** I edit the message body with my custom text including placeholders like `{client_name}`.
- **And:** I save the settings.
- **Then:** My custom message is saved and will be used for future automatic reminders.

### Scenario 2: Automatic reminder is sent with the custom message

- **Given:** I have saved a custom reminder message: "Hi {client_name}, this is a reminder for invoice {invoice_number}.".
- **And:** An automatic reminder is triggered for an invoice to "Client Corp".
- **When:** The client receives the reminder email.
- **Then:** The email subject and body contain my custom text, with the placeholders correctly replaced with the specific invoice and client data.

### Scenario 3: Using the default message

- **Given:** I am a Pro user but have not customized the reminder message.
- **When:** An automatic reminder is sent.
- **Then:** The email is sent using SoloQ's default professional reminder template.

---

## Technical Notes

### Frontend

- Add text input and textarea fields to the reminder settings form for `custom_subject` and `custom_message`.
- Display a list of available placeholders (`{client_name}`, etc.) near the input fields for user reference.

### Backend

- The `PUT /api/reminder-settings` endpoint will save the `custom_subject` and `custom_message` strings to the database.
- The daily reminder background process must:
  1. Fetch the user's custom message from `reminder_settings`.
  2. If a custom message exists, perform a string replacement on the placeholders with the relevant invoice data.
  3. Pass the final, processed text to the email service (Resend).

### Database

- The `public.reminder_settings` table will have nullable columns for `custom_subject` (string) and `custom_message` (text).

---

## Dependencies

### Blocked By

- UPD-58 (System sends automatic reminders)

### Blocks

- Allows users to maintain their brand voice, a key feature for personalization and professional services.

---

## Definition of Done

- [ ] UI for editing and saving a custom reminder message is implemented.
- [ ] Backend saves the custom message and correctly replaces placeholders before sending.
- [ ] E2E tests verify that an email is sent with the customized content.
- [ ] All acceptance criteria are met.
