# See Total Pending Amount

**Jira Key:** [SQ-49](https://upexgalaxy64.atlassian.net/browse/SQ-49)
**Epic:** [SQ-38](https://upexgalaxy64.atlassian.net/browse/SQ-38) (Dashboard & Tracking)
**Priority:** High
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** see the total pending amount
**So that** I know my financial situation

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Pending total visible

- **Given:** I am on the dashboard
- **When:** I view the summary cards
- **Then:** I see my total pending amount

### Scenario 2: Calculation accuracy

- **Given:** I have pending invoices
- **When:** I view the pending total
- **Then:** It equals the sum of all sent (unpaid) invoices

### Scenario 3: Currency format

- **Given:** I view the pending total
- **When:** I look at the number
- **Then:** It's formatted with currency symbol and thousands separators

### Scenario 4: Updates on change

- **Given:** I mark an invoice as paid
- **When:** I return to the dashboard
- **Then:** The pending total is updated

### Scenario 5: Zero state

- **Given:** I have no pending invoices
- **When:** I view the pending total
- **Then:** It shows $0.00

---

## Technical Notes

- Sum of invoices WHERE status = 'sent'
- Real-time or refresh on navigation
- Currency formatting: user's locale
- Dashboard stats component

---

## Definition of Done

- [ ] Pending total displayed
- [ ] Calculation correct
- [ ] Currency formatting correct
- [ ] Updates on changes
- [ ] Zero state handled
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-38-dashboard-tracking/epic.md`
