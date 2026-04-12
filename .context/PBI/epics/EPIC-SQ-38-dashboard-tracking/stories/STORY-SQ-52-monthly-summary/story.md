# As a user, I want to see a summary of monthly income so that I can track my progress

**Jira Key:** [SQ-52](https://upexgalaxy65.atlassian.net/browse/SQ-52)
**Epic:** [SQ-38](https://upexgalaxy65.atlassian.net/browse/SQ-38) (Invoice Dashboard & Tracking)
**Priority:** Medium
**Story Points:** 2
**Status:** In Test

---

## User Story

As a user, I want to see a summary of monthly income, so that I can track my progress. Story Points: 3

---

## Acceptance Criteria

1.
  1.
    1. Scenario 1: Monthly total visible

- ***Given:*** I am on the dashboard
- ***When:*** I view the summary cards
- ***Then:*** I see my total income this month

1.
  1.
    1. Scenario 2: Paid vs Pending breakdown

- ***Given:*** I view the monthly summary
- ***When:*** I look at the breakdown
- ***Then:*** I see paid amount and pending amount separately

1.
  1.
    1. Scenario 3: Comparison to last month

- ***Given:*** I view the monthly summary
- ***When:*** I look at the trend indicator
- ***Then:*** I see a comparison (up/down percentage) vs last month

1.
  1.
    1. Scenario 4: Simple chart

- ***Given:*** I view the dashboard
- ***When:*** I look for trends
- ***Then:*** I see a simple chart of recent months (last 6)

1.
  1.
    1. Scenario 5: Updates on payment

- ***Given:*** I receive a payment
- ***When:*** I return to the dashboard
- ***Then:*** The monthly summary is updated

---

## Scope

1.
  1.
    1. In Scope

- Monthly income total card
- Paid vs pending breakdown
- Month-over-month comparison (percentage)
- Simple bar/line chart (last 6 months)
- Real-time updates on payment changes
- Currency formatting

1.
  1.
    1. Out of Scope

- Detailed financial reports
- Year-over-year comparison
- Export to spreadsheet
- Tax calculations
- Expense tracking
- Profit/loss analysis

---

## Traceability

### Defect (1)

- [SQ-175](https://upexgalaxy65.atlassian.net/browse/SQ-175): SQ-52: Monthly summary semantics inconsistent (paid_at mismatch and trend data) _(OPEN)_

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 2026-01-21T01:09:31.882Z
- **Updated:** 2026-04-12T19:35:59.834Z
- **Reporter:** Ely
- **Assignee:** Fernando Javier Masci
- **Labels:** shift-left-reviewed, test-plan-ready

---

_Synced from Jira by jira-sync_
_Last sync: 2026-04-12T19:36:24.820Z_
