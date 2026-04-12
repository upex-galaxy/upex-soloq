# As a user, I want to see overdue invoices highlighted so that I can prioritize follow-up

**Jira Key:** [SQ-50](https://upexgalaxy65.atlassian.net/browse/SQ-50)
**Epic:** [SQ-38](https://upexgalaxy65.atlassian.net/browse/SQ-38) (Invoice Dashboard & Tracking)
**Priority:** Medium
**Story Points:** 2
**Status:** In Test

---

## User Story

As a user, I want to see overdue invoices highlighted, so that I can prioritize follow-up. Story Points: 2

---

## Acceptance Criteria

1.
  1.
    1. Scenario 1: Visual highlight

- ***Given:*** I have overdue invoices
- ***When:*** I view the invoice list
- ***Then:*** Overdue invoices have a visual indicator (red badge/row)

1.
  1.
    1. Scenario 2: Overdue badge

- ***Given:*** An invoice is past due
- ***When:*** I view its status
- ***Then:*** I see "Overdue" badge instead of "Sent"

1.
  1.
    1. Scenario 3: Days overdue displayed

- ***Given:*** An invoice is overdue
- ***When:*** I view the row
- ***Then:*** I see how many days overdue it is (e.g., "7 days overdue")

1.
  1.
    1. Scenario 4: Dashboard alert

- ***Given:*** I have overdue invoices
- ***When:*** I view the dashboard
- ***Then:*** I see an alert banner or count of overdue invoices

1.
  1.
    1. Scenario 5: Sort overdue first

- ***Given:*** I have mixed status invoices
- ***When:*** I sort by urgency
- ***Then:*** Overdue invoices appear at the top

---

## Scope

1.
  1.
    1. In Scope

- Visual highlight for overdue rows (red/orange)
- "Overdue" status badge
- Days overdue calculation and display
- Dashboard alert/count for overdue
- Sort by urgency option
- Overdue detection: status='sent' AND due_date < CURRENT_DATE

1.
  1.
    1. Out of Scope

- Automatic status change to 'overdue'
- Push notifications for overdue
- Severity levels (1-7 days vs 30+ days)
- Automatic escalation actions

---

## Traceability

### Defect (1)

- [SQ-176](https://upexgalaxy65.atlassian.net/browse/SQ-176): SQ-50: Overdue aggregation and urgency ordering inconsistent in invoices dashboard/list _(OPEN)_

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 2026-01-21T01:09:30.963Z
- **Updated:** 2026-04-12T19:35:59.516Z
- **Reporter:** Ely
- **Assignee:** Fernando Javier Masci
- **Labels:** shift-left-reviewed, test-plan-ready

---

_Synced from Jira by jira-sync_
_Last sync: 2026-04-12T19:36:24.783Z_
