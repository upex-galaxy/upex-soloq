# See Monthly Income Summary

**Jira Key:** [SQ-52](https://upexgalaxy64.atlassian.net/browse/SQ-52)
**Epic:** [SQ-38](https://upexgalaxy64.atlassian.net/browse/SQ-38) (Dashboard & Tracking)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** see a summary of monthly income
**So that** I can track my progress

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Monthly total

- **Given:** I am on the dashboard
- **When:** I view the summary
- **Then:** I see my total income this month

### Scenario 2: Paid vs Pending

- **Given:** I view the monthly summary
- **When:** I look at the breakdown
- **Then:** I see paid amount and pending amount separately

### Scenario 3: Comparison to last month

- **Given:** I view the monthly summary
- **When:** I look at the trend
- **Then:** I see a comparison (up/down) vs last month

### Scenario 4: Monthly chart (optional)

- **Given:** I view the dashboard
- **When:** I look for trends
- **Then:** I see a simple chart of recent months

### Scenario 5: Current month updates

- **Given:** I receive a payment
- **When:** I return to the dashboard
- **Then:** The monthly summary is updated

---

## Technical Notes

- Monthly income = SUM(invoices WHERE paid_at in current month)
- Comparison: (this_month - last_month) / last_month × 100
- Simple bar chart or line chart (recharts)
- API: GET /api/dashboard/monthly-summary

---

## Definition of Done

- [ ] Monthly total displayed
- [ ] Paid vs pending breakdown
- [ ] Month-over-month comparison
- [ ] Simple chart implemented
- [ ] Real-time updates
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-38-dashboard-tracking/epic.md`
