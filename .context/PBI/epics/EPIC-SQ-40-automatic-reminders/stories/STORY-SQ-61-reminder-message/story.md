# Customize Reminder Message

**Jira Key:** [SQ-61](https://upexgalaxy64.atlassian.net/browse/SQ-61)
**Epic:** [SQ-40](https://upexgalaxy64.atlassian.net/browse/SQ-40) (Automatic Reminders)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** Pro user
**I want to** customize the reminder message
**So that** I maintain my communication tone

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Default message

- **Given:** I haven't customized the message
- **When:** A reminder is sent
- **Then:** A professional default message is used

### Scenario 2: Custom message

- **Given:** I write a custom reminder message
- **When:** A reminder is sent
- **Then:** My custom message is used

### Scenario 3: Variables supported

- **Given:** I am writing a custom message
- **When:** I use variables like {client_name}
- **Then:** Variables are replaced with actual values

### Scenario 4: Preview

- **Given:** I write a custom message
- **When:** I click preview
- **Then:** I see how the email will look

### Scenario 5: Reset to default

- **Given:** I have a custom message
- **When:** I want to use default
- **Then:** I can reset to the default message

---

## Technical Notes

- Store in reminder_settings.custom_message
- Variables: {client_name}, {invoice_number}, {amount}, {days_overdue}
- Max 1000 characters
- Default message in code (not DB)

---

## Definition of Done

- [ ] Default message working
- [ ] Custom message input
- [ ] Variable replacement working
- [ ] Preview functionality
- [ ] Reset option available
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-40-automatic-reminders/epic.md`
