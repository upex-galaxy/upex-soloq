# Set Invoice Due Date

**Jira Key:** [SQ-28](https://upexgalaxy65.atlassian.net/browse/SQ-28)
**Epic:** [SQ-20](https://upexgalaxy65.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** Medium
**Story Points:** 5
**Status:** Ready For QA

---

## User Story

## User Story

***As a*** user
***I want to*** set a due date
***So that*** I can define when I expect payment

## Acceptance Criteria

### Scenario 1: Set specific due date

- ***Given:*** I am creating an invoice
- ***When:*** I select a due date from the calendar
- ***Then:*** The due date is saved

### Scenario 2: Quick presets

- ***Given:*** I am setting a due date
- ***When:*** I click "Net 15" or "Net 30"
- ***Then:*** Due date is set to 15/30 days from today

### Scenario 3: Due date appears on invoice

- ***Given:*** I set a due date
- ***When:*** I view/generate the invoice
- ***Then:*** Due date is clearly displayed

### Scenario 4: Overdue detection

- ***Given:*** Due date has passed and invoice is unpaid
- ***When:*** System checks invoices
- ***Then:*** Invoice status changes to "overdue"

## Technical Notes

- Field: due_date (date)
- Presets: Net 7, Net 15, Net 30, Net 60
- Cron job to mark overdue invoices

## Story Points

2

---

## Acceptance Criteria

Feature:

Background:
Given ...

Scenario: ...
Given ...
When ...
Then ...

---

## Traceability

### Defect (1)

- [SQ-83](https://upexgalaxy65.atlassian.net/browse/SQ-83): INV | Shows due date warning when today's date is selected _(Ready For QA)_

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 2/17/2026
- **Reporter:** Ely
- **Assignee:** Yaneth Quintero

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:52.177Z_
