# Filter Invoices by Status

**Jira Key:** [SQ-48](https://upexgalaxy64.atlassian.net/browse/SQ-48)
**Epic:** [SQ-38](https://upexgalaxy64.atlassian.net/browse/SQ-38) (Dashboard & Tracking)
**Priority:** High
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** filter invoices by status (draft, sent, paid, overdue)
**So that** I can find the ones I need

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Filter tabs

- **Given:** I am on the dashboard
- **When:** I view the filter options
- **Then:** I see tabs for: All, Draft, Sent, Paid, Overdue

### Scenario 2: Filter by draft

- **Given:** I click "Draft" filter
- **When:** The list updates
- **Then:** I only see invoices with status "draft"

### Scenario 3: Filter by sent

- **Given:** I click "Sent" filter
- **When:** The list updates
- **Then:** I only see invoices with status "sent"

### Scenario 4: Filter by paid

- **Given:** I click "Paid" filter
- **When:** The list updates
- **Then:** I only see invoices with status "paid"

### Scenario 5: Filter by overdue

- **Given:** I click "Overdue" filter
- **When:** The list updates
- **Then:** I only see invoices that are past due date and unpaid

### Scenario 6: Count badges

- **Given:** I view the filter tabs
- **When:** I look at each tab
- **Then:** I see a count of invoices in each status

---

## Technical Notes

- Statuses: draft, sent, paid, overdue, cancelled
- Overdue: status = 'sent' AND due_date < today
- API: GET /api/invoices?status={status}
- Update counts in real-time or on filter change

---

## Definition of Done

- [ ] Filter tabs implemented
- [ ] All status filters working
- [ ] Overdue filter logic correct
- [ ] Count badges displayed
- [ ] URL state for filters
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-38-dashboard-tracking/epic.md`
