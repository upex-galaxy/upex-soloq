# Automatic Overdue Invoice Reminders

**Jira Key:** [SQ-59](https://upexgalaxy64.atlassian.net/browse/SQ-59)
**Epic:** [SQ-40](https://upexgalaxy64.atlassian.net/browse/SQ-40) (Automatic Reminders)
**Priority:** High
**Story Points:** 5
**Status:** Backlog

---

## User Story

**As a** Pro user
**I want to** have the system send automatic reminders for overdue invoices
**So that** I don't have to do it manually

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Pro feature gate

- **Given:** I am a Free user
- **When:** I try to enable reminders
- **Then:** I see an upgrade prompt

### Scenario 2: Enable reminders

- **Given:** I am a Pro user
- **When:** I enable automatic reminders
- **Then:** The system will send reminders for overdue invoices

### Scenario 3: Automatic sending

- **Given:** Reminders are enabled
- **When:** An invoice becomes overdue
- **Then:** A reminder email is sent automatically

### Scenario 4: Reminder email content

- **Given:** A reminder is sent
- **When:** The client receives it
- **Then:** It includes invoice details and payment info

### Scenario 5: Multiple invoices

- **Given:** I have multiple overdue invoices
- **When:** The system runs
- **Then:** Each invoice gets its own reminder

---

## Technical Notes

- Scheduled job (Edge Function + pg_cron or external)
- Run daily to check for overdue invoices
- Filter: status = 'sent', due_date < today, Pro user
- Respect reminder settings (frequency, max reminders)
- Use Resend for email delivery

---

## Definition of Done

- [ ] Pro gate implemented
- [ ] Enable/disable toggle working
- [ ] Scheduled job created
- [ ] Reminder emails sent
- [ ] Multiple invoices handled
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-40-automatic-reminders/epic.md`
- **Related:** SQ-41 (Subscription Management)
