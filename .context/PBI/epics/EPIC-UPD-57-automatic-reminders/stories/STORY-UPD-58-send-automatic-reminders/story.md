# As a Pro user, I want the system to send automatic reminders for overdue invoices so I don't have to do it manually

**Jira Key:** UPD-58
**Epic:** UPD-57 (Automatic Reminders)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Pro user
**I want the system to** automatically send email reminders for my overdue invoices
**So that** I don't have to manually chase payments, saving me time and avoiding awkward conversations with clients.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A background process (e.g., a daily Supabase Edge Function) that runs and identifies overdue invoices for Pro users.
- An invoice is considered overdue if its `status` is "sent" and `due_date` is in the past.
- The process sends an email reminder to the client of each identified overdue invoice.
- The reminder email will use a default template and include the invoice number, amount, and a link to view the invoice (if applicable).
- The `reminder_count` for the invoice will be incremented.
- A new event `reminder_sent` will be recorded in `invoice_events`.
- This feature is only active for users with an active "Pro" subscription. Free users attempting to activate this feature will be prompted to upgrade.

### Out of Scope

- Reminders for invoices that are not yet due (pre-due reminders).
- Reminders for invoices that are in "draft" or "paid" status.
- Complex logic for varying reminder content based on how overdue an invoice is.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Automatic reminder sent for an overdue invoice (Pro user)

- **Given:** I am a Pro user with automatic reminders enabled globally.
- **And:** I have an invoice that was sent last month and is now 5 days overdue.
- **When:** The daily reminder process runs.
- **Then:** An email reminder is sent to the client of the overdue invoice.
- **And:** The invoice's `reminder_count` is incremented by 1.
- **And:** An `invoice_event` with type `reminder_sent` is recorded.

### Scenario 2: No reminder sent for a paid invoice

- **Given:** I am a Pro user.
- **And:** I have an invoice that was overdue, but I marked it as "Paid" yesterday.
- **When:** The daily reminder process runs today.
- **Then:** No reminder email is sent for this invoice.

### Scenario 3: Free user cannot activate automatic reminders

- **Given:** I am a Free user.
- **When:** I try to activate the automatic reminders setting.
- **Then:** I am presented with a message indicating that this is a Pro feature and a call to action to upgrade my subscription.

---

## Technical Notes

### Frontend

- The "Automatic Reminders" toggle in the settings will check the user's `subscription.plan`. If "free", it will display a message and disable the toggle.

### Backend

- A Supabase Edge Function (e.g., `daily-reminders.ts`) will be scheduled to run daily.
- This function will query `invoices` where `status = 'sent'`, `due_date < NOW()`, and `user_id` belongs to a Pro user.
- It will also check `reminder_settings` for global enablement and `reminder_count` vs `max_reminders` for each invoice.
- For each qualifying invoice, it will:
  1. Fetch client and invoice data.
  2. Construct and send an email using Resend (likely reusing React Email templates).
  3. Update `invoices.reminder_count` and insert into `invoice_events`.

### Database

- `invoices.reminder_count` (integer) will be used to track sent reminders.
- `invoice_events` will store `reminder_sent` events.
- `reminder_settings` will store the global reminder configuration for the user.
- `subscription` table will be queried to check the user's plan.

---

## Dependencies

### Blocked By

- UPD-43 (Invoice Dashboard & Tracking) - To identify overdue invoices.
- UPD-50 (Payment Tracking) - Reminders stop when an invoice is paid.
- EPIC-SOLOQ-010 (Subscription Management) - To identify Pro users.

### Blocks

- A core value proposition of the Pro plan.

---

## Definition of Done

- [ ] Daily background process to identify and send reminders is implemented.
- [ ] Reminder emails are sent only for overdue invoices of Pro users.
- [ ] `reminder_count` and `invoice_events` are updated correctly.
- [ ] Free users are restricted from activating the feature.
- [ ] E2E tests verify the end-to-end flow of reminder sending (using a mail catcher for verification).
- [ ] All acceptance criteria are met.
