# As a user, I want to revert an invoice from paid to pending so that I can correct errors

**Jira Key:** [SQ-58](https://upexgalaxy65.atlassian.net/browse/SQ-58)
**Epic:** [SQ-39](https://upexgalaxy65.atlassian.net/browse/SQ-39) (Payment Tracking)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

As a user, I want to revert an invoice from paid to pending, so that I can correct errors. Story Points: 2

---

## Acceptance Criteria

1.
  1. Acceptance Criteria (Gherkin)

1.
  1.
    1. Scenario 1: Revert paid invoice to sent status

- ***Given:*** I have invoice INV-2026-0042 marked as "paid"
- ***When:*** I click "Revert Payment" and confirm the action
- ***Then:*** The invoice status changes to "sent"
- ***And:*** The payment record is soft-deleted (deleted_at timestamp set)
- ***And:*** A success message "Payment reverted successfully" is shown

1.
  1.
    1. Scenario 2: Revert paid invoice to overdue if past due date

- ***Given:*** I have a paid invoice with due date Feb 01, 2026 (past due)
- ***When:*** I revert the payment on Mar 02, 2026
- ***Then:*** The invoice status changes to "overdue" (not "sent")
- ***And:*** The system correctly identifies it's past the due date

1.
  1.
    1. Scenario 3: Confirmation dialog before reverting

- ***Given:*** I am viewing a paid invoice
- ***When:*** I click "Revert Payment"
- ***Then:*** A confirmation dialog appears asking "Are you sure you want to revert this payment?"
- ***And:*** Shows warning "This will mark the invoice as unpaid and remove the payment record"
- ***And:*** Has "Cancel" and "Confirm Revert" buttons

1.
  1.
    1. Scenario 4: Revert action only available on paid invoices

- ***Given:*** I am viewing an invoice with status "sent"
- ***When:*** I look at the available actions
- ***Then:*** The "Revert Payment" option is not shown (only available for paid invoices)

1.
  1.
    1. Scenario 5: Invoice event recorded for audit trail

- ***Given:*** I revert a payment on invoice INV-2026-0042
- ***When:*** The revert is successful
- ***Then:*** An event is recorded in invoice_events table
- ***And:*** Event type is "updated" with metadata indicating payment revert
- ***And:*** This appears in the invoice history/audit log

1.
  1.
    1. Scenario 6: Dashboard totals update after revert

- ***Given:*** My dashboard shows $5,000 total paid this month
- ***When:*** I revert a $500 payment
- ***Then:*** The dashboard pending amount increases by $500
- ***And:*** The paid this month amount decreases by $500

1.
  1.
    1. Scenario 7: Cancel revert action

- ***Given:*** I am on the confirmation dialog for reverting a payment
- ***When:*** I click "Cancel"
- ***Then:*** The dialog closes
- ***And:*** The invoice remains in "paid" status
- ***And:*** No changes are made

---

## Scope

1.
  1. Scope

1.
  1.
    1. In Scope

- Revert payment action on paid invoices
- Soft delete payment record (set deleted_at)
- Update invoice status to 'sent' or 'overdue' based on due date
- Clear paid_at timestamp on invoice
- Confirmation dialog with warning
- Audit trail via invoice_events
- Dashboard totals recalculation

1.
  1.
    1. Out of Scope

- Hard delete of payment records
- Undo/restore reverted payments
- Automatic notification to client about revert
- Batch revert multiple payments

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 2026-01-21T01:09:37.976Z
- **Updated:** 2026-03-11T03:26:37.587Z
- **Reporter:** Ely
- **Assignee:** Unassigned

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-28T23:41:50.950Z_
