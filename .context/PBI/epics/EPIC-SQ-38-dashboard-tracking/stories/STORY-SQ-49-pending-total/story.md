# As a user, I want to see the total pending amount so that I know my financial situation

**Jira Key:** [SQ-49](https://upexgalaxy65.atlassian.net/browse/SQ-49)
**Epic:** [SQ-38](https://upexgalaxy65.atlassian.net/browse/SQ-38) (Invoice Dashboard & Tracking)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

As a user, I want to see the total pending amount, so that I know my financial situation. Story Points: 2

---

## Acceptance Criteria

1.
  1.
    1. Scenario 1: Pending total visible

- ***Given:*** I am on the dashboard
- ***When:*** I view the summary cards
- ***Then:*** I see my total pending amount prominently displayed

1.
  1.
    1. Scenario 2: Calculation accuracy

- ***Given:*** I have pending invoices
- ***When:*** I view the pending total
- ***Then:*** It equals the sum of all sent (unpaid) invoices

1.
  1.
    1. Scenario 3: Currency format

- ***Given:*** I view the pending total
- ***When:*** I look at the number
- ***Then:*** It is formatted with currency symbol and thousands separators

1.
  1.
    1. Scenario 4: Updates on payment

- ***Given:*** I mark an invoice as paid
- ***When:*** I return to the dashboard
- ***Then:*** The pending total is updated (decreased)

1.
  1.
    1. Scenario 5: Zero state

- ***Given:*** I have no pending invoices
- ***When:*** I view the pending total
- ***Then:*** It shows $0.00 with positive messaging

---

## Scope

1.
  1.
    1. In Scope

- Pending total card on dashboard
- Sum calculation: WHERE status = 'sent'
- Currency formatting with locale
- Real-time or refresh on navigation
- Zero state handling
- Summary stats component

1.
  1.
    1. Out of Scope

- Currency conversion
- Historical pending trends
- Breakdown by client
- Export pending summary

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 2026-01-21T01:09:30.595Z
- **Updated:** 2026-03-11T03:26:37.788Z
- **Reporter:** Ely
- **Assignee:** Unassigned

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-28T23:27:59.232Z_
