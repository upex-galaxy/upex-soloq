# As a user, I want to mark an invoice as paid so that I can update its status

**Jira Key:** [SQ-53](https://upexgalaxy65.atlassian.net/browse/SQ-53)
**Epic:** [SQ-39](https://upexgalaxy65.atlassian.net/browse/SQ-39) (Payment Tracking)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

As a user, I want to mark an invoice as paid, so that I can update its status. Story Points: 2

---

## Acceptance Criteria

1.
  1.
    1. Scenario 1: Mark as paid button

- ***Given:*** I have a sent invoice
- ***When:*** I view it
- ***Then:*** I see a "Mark as Paid" button

1.
  1.
    1. Scenario 2: Quick mark from list

- ***Given:*** I am on the invoices list
- ***When:*** I click the "paid" icon on a row
- ***Then:*** A payment form/modal opens

1.
  1.
    1. Scenario 3: Status update

- ***Given:*** I mark an invoice as paid
- ***When:*** I confirm the action
- ***Then:*** The status changes to "paid"

1.
  1.
    1. Scenario 4: Paid timestamp recorded

- ***Given:*** I mark an invoice as paid
- ***When:*** I view the invoice details
- ***Then:*** I see the paid_at timestamp

1.
  1.
    1. Scenario 5: Cannot re-pay

- ***Given:*** An invoice is already paid
- ***When:*** I view it
- ***Then:*** The "Mark as Paid" button is disabled or hidden

---

## Scope

1.
  1.
    1. In Scope

- "Mark as Paid" button on invoice detail
- Quick action icon on invoice list row
- Payment form/modal with required fields
- Status update: sent -> paid
- paid_at timestamp recording
- Payment record creation in payments table
- Dashboard stats recalculation
- Disable action for already-paid invoices

1.
  1.
    1. Out of Scope

- Partial payment handling
- Multiple payments per invoice
- Payment gateway integration
- Automated payment detection

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 2026-01-21T01:09:35.592Z
- **Updated:** 2026-03-11T03:26:36.613Z
- **Reporter:** Ely
- **Assignee:** Unassigned

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-28T23:27:58.094Z_
