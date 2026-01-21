# Pause Reminders for Specific Invoice

**Jira Key:** [SQ-62](https://upexgalaxy64.atlassian.net/browse/SQ-62)
**Epic:** [SQ-40](https://upexgalaxy64.atlassian.net/browse/SQ-40) (Automatic Reminders)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** Pro user
**I want to** pause reminders for a specific invoice
**So that** I can handle clients with special arrangements

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Pause option

- **Given:** I have an overdue invoice
- **When:** I view it
- **Then:** I see a "Pause Reminders" option

### Scenario 2: Pause reminders

- **Given:** I click pause
- **When:** I confirm
- **Then:** No more reminders are sent for this invoice

### Scenario 3: Paused indicator

- **Given:** Reminders are paused
- **When:** I view the invoice
- **Then:** I see that reminders are paused

### Scenario 4: Resume reminders

- **Given:** Reminders are paused
- **When:** I click "Resume Reminders"
- **Then:** Reminders will continue as normal

### Scenario 5: Pause reason (optional)

- **Given:** I pause reminders
- **When:** I want to add context
- **Then:** I can add a note for why

---

## Technical Notes

- Store in invoices.reminders_paused (boolean)
- Optional: invoices.reminders_paused_reason
- Skip paused invoices in scheduled job
- Show pause state in invoice list/detail

---

## Definition of Done

- [ ] Pause option implemented
- [ ] Pause functionality working
- [ ] Paused indicator shown
- [ ] Resume functionality working
- [ ] Optional reason field
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-40-automatic-reminders/epic.md`
