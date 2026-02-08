# As a Pro user, I want to configure the frequency of reminders (every X days) to adjust to my needs

**Jira Key:** UPD-59
**Epic:** UPD-57 (Automatic Reminders)
**Priority:** Medium
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Pro user
**I want to** be able to set how often an automatic reminder is sent (e.g., every 3, 5, or 7 days)
**So that** I can adjust the reminder frequency to my client relationships and preferences.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A setting in the "Reminders" section (accessible to Pro users) for "Reminder Frequency".
- Options to select a frequency (e.g., "Every 3 days", "Every 7 days", "Every 15 days").
- The chosen frequency determines the interval between reminders.
- The maximum number of reminders to send per invoice (e.g., 3 reminders).
- These settings will be saved in the `reminder_settings` table.

### Out of Scope

- Different reminder frequencies per client or per invoice.
- Highly customizable intervals (e.g., specific dates).

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Configure reminder frequency to "Every 7 days"

- **Given:** I am a Pro user and have access to the "Reminder Settings".
- **When:** I select "Every 7 days" for the "Reminder Frequency".
- **And:** I set the "Maximum Reminders" to 3.
- **And:** I save the settings.
- **Then:** Automatic reminders for my overdue invoices will be sent every 7 days, up to a maximum of 3 times.

### Scenario 2: Reminder is sent according to configured frequency

- **Given:** I am a Pro user, and my reminder frequency is set to "Every 5 days".
- **And:** I have an invoice that became overdue 6 days ago, and a reminder was sent yesterday.
- **When:** The daily reminder process runs today.
- **Then:** No new reminder is sent for this invoice, as 5 days have not passed since the last reminder.

### Scenario 3: No more reminders sent after maximum is reached

- **Given:** My maximum reminders setting is 3.
- **And:** I have an overdue invoice for which 3 reminders have already been sent.
- **When:** The daily reminder process runs.
- **Then:** No new reminder is sent for this invoice.

---

## Technical Notes

### Frontend

- A new settings page/section (`/settings/reminders`) for Pro users.
- A dropdown or radio buttons for `frequency_days` and a number input for `max_reminders`.
- These settings are saved to the backend via an API endpoint.

### Backend

- A new endpoint (`PUT /api/reminder-settings`) to save the user's preferences.
- The daily background reminder process (from UPD-58) must integrate these settings:
  - It needs to check the `frequency_days` against the `created_at` of the last `reminder_sent` event (or `sent_at` of the invoice for the first reminder).
  - It also needs to check `reminder_count` against `max_reminders`.

### Database

- A new table `public.reminder_settings` to store `user_id`, `enabled`, `frequency_days`, `max_reminders`, `custom_subject`, `custom_message`.

---

## Dependencies

### Blocked By

- UPD-58 (System sends automatic reminders)
- EPIC-SOLOQ-010 (Subscription Management) - Must be a Pro user to access.

### Blocks

- Provides flexibility and control over the reminder process.

---

## Definition of Done

- [ ] UI for configuring reminder frequency and max reminders is implemented for Pro users.
- [ ] Backend API correctly saves and retrieves these settings.
- [ ] The daily reminder process respects the configured frequency and maximum limits.
- [ ] E2E tests verify that reminders are sent according to the configured frequency and stop after the max limit.
- [ ] All acceptance criteria are met.
