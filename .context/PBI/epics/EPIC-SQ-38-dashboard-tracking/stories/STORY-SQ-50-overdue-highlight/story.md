# See Overdue Invoices Highlighted

**Jira Key:** [SQ-50](https://upexgalaxy64.atlassian.net/browse/SQ-50)
**Epic:** [SQ-38](https://upexgalaxy64.atlassian.net/browse/SQ-38) (Dashboard & Tracking)
**Priority:** High
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** see overdue invoices highlighted
**So that** I can prioritize follow-up

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Visual highlight

- **Given:** I have overdue invoices
- **When:** I view the invoice list
- **Then:** Overdue invoices have a visual indicator (red badge/row)

### Scenario 2: Overdue badge

- **Given:** An invoice is past due
- **When:** I view its status
- **Then:** I see "Overdue" instead of "Sent"

### Scenario 3: Days overdue

- **Given:** An invoice is overdue
- **When:** I view the row
- **Then:** I see how many days overdue it is

### Scenario 4: Dashboard alert

- **Given:** I have overdue invoices
- **When:** I view the dashboard
- **Then:** I see an alert banner or count

### Scenario 5: Sort overdue first

- **Given:** I have mixed invoices
- **When:** I sort by urgency
- **Then:** Overdue invoices appear first

---

## Technical Notes

- Overdue: status = 'sent' AND due_date < CURRENT_DATE
- Calculate days_overdue = CURRENT_DATE - due_date
- Visual: red/orange indicator
- Consider auto-updating status to 'overdue' via cron

---

## Definition of Done

- [ ] Visual highlight implemented
- [ ] Overdue badge displayed
- [ ] Days overdue calculated
- [ ] Dashboard alert shown
- [ ] Sort by urgency working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-38-dashboard-tracking/epic.md`
