# Configure Reminder Frequency

**Jira Key:** [SQ-60](https://upexgalaxy64.atlassian.net/browse/SQ-60)
**Epic:** [SQ-40](https://upexgalaxy64.atlassian.net/browse/SQ-40) (Automatic Reminders)
**Priority:** High
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** Pro user
**I want to** configure reminder frequency (every X days)
**So that** I can adjust to my needs

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Frequency setting

- **Given:** I am configuring reminders
- **When:** I view the settings
- **Then:** I can set how often to send reminders

### Scenario 2: Frequency options

- **Given:** I view frequency options
- **When:** I see the choices
- **Then:** I can choose: 3, 5, 7, 14, or 30 days

### Scenario 3: Custom frequency

- **Given:** I need a specific frequency
- **When:** I enter a custom value
- **Then:** The system accepts 1-30 days

### Scenario 4: Frequency applied

- **Given:** I set frequency to 7 days
- **When:** A reminder is sent
- **Then:** The next reminder waits 7 days

### Scenario 5: Max reminders

- **Given:** I configure reminders
- **When:** I set max reminders
- **Then:** The system stops after that many attempts

---

## Technical Notes

- Store in reminder_settings.frequency_days
- Default: 7 days
- Max reminders: default 3 (configurable 1-10)
- Check: last_reminder_date + frequency_days <= today

---

## Definition of Done

- [ ] Frequency selector implemented
- [ ] Preset options available
- [ ] Custom frequency working
- [ ] Frequency logic correct
- [ ] Max reminders setting working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-40-automatic-reminders/epic.md`
