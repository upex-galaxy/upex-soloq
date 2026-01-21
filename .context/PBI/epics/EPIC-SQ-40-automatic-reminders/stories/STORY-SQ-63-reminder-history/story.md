# View Reminder History

**Jira Key:** [SQ-63](https://upexgalaxy64.atlassian.net/browse/SQ-63)
**Epic:** [SQ-40](https://upexgalaxy64.atlassian.net/browse/SQ-40) (Automatic Reminders)
**Priority:** Low
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** Pro user
**I want to** see the history of sent reminders
**So that** I know how many times I've contacted the client

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Reminder count

- **Given:** I view an overdue invoice
- **When:** I check reminder info
- **Then:** I see how many reminders have been sent

### Scenario 2: Reminder timeline

- **Given:** I view reminder history
- **When:** I expand the section
- **Then:** I see dates of each reminder sent

### Scenario 3: Last reminder date

- **Given:** Reminders have been sent
- **When:** I view the invoice
- **Then:** I see when the last reminder was sent

### Scenario 4: Next reminder date

- **Given:** Reminders are active
- **When:** I view the invoice
- **Then:** I see when the next reminder will be sent

### Scenario 5: Delivery status

- **Given:** I view reminder history
- **When:** I check each reminder
- **Then:** I see if it was delivered or failed

---

## Technical Notes

- Query invoice_reminders table by invoice_id
- Show: sent_at, reminder_number, status
- Calculate next_reminder_date from settings
- API: GET /api/invoices/:id/reminder-history

---

## Definition of Done

- [ ] Reminder count displayed
- [ ] Timeline view implemented
- [ ] Last reminder date shown
- [ ] Next reminder date calculated
- [ ] Delivery status shown
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-40-automatic-reminders/epic.md`
