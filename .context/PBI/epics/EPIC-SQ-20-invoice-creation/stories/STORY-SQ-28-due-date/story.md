# Set Invoice Due Date

**Jira Key:** [SQ-28](https://upexgalaxy64.atlassian.net/browse/SQ-28)
**Epic:** [SQ-20](https://upexgalaxy64.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** High
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** set a due date
**So that** I can define when I expect payment

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Default due date

- **Given:** I am creating a new invoice
- **When:** The form loads
- **Then:** The due date defaults to 30 days from today

### Scenario 2: Select due date

- **Given:** I am creating an invoice
- **When:** I click on the due date field
- **Then:** A date picker appears

### Scenario 3: Quick presets

- **Given:** I am selecting a due date
- **When:** I see the options
- **Then:** I can choose: Today, 15 days, 30 days, 45 days, 60 days

### Scenario 4: Custom date

- **Given:** I need a specific due date
- **When:** I use the date picker
- **Then:** I can select any future date

### Scenario 5: Past date warning

- **Given:** I select a date in the past
- **When:** I try to save
- **Then:** I see a warning but can still proceed

---

## Technical Notes

- Issue date: auto-set to current date
- Due date: user-configurable
- Date picker with presets
- Timezone handling: user's local timezone

---

## Definition of Done

- [ ] Date picker implemented
- [ ] Default 30-day due date working
- [ ] Quick presets available
- [ ] Custom date selection working
- [ ] Past date warning implemented
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/epic.md`
