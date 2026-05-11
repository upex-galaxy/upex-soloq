# As a user, I want to revert an invoice from paid to pending so that I can correct errors

**Jira Key:** [SQ-58](https://upexgalaxy67.atlassian.net/browse/SQ-58)
**Epic:** [SQ-39](https://upexgalaxy67.atlassian.net/browse/SQ-39) (Payment Tracking)
**Priority:** Medium
**Story Points:** 2
**Status:** QA Approved

---

## User Story

As a user, I want to revert an invoice from paid to pending, so that I can correct errors. Story Points: 2

---

## Acceptance Criteria

1. 

1. 

- ****Given:**** I have invoice INV-2026-0042 marked as "paid"
- ****When:**** I click "Revert Payment" and confirm the action
- ****Then:**** The invoice status changes to "sent"
- ****And:**** The payment record is soft-deleted (deleted_at timestamp set)
- ****And:**** A success message "Payment reverted successfully" is shown

1. 

- ****Given:**** I have a paid invoice with due date Feb 01, 2026 (past due)
- ****When:**** I revert the payment on Mar 02, 2026
- ****Then:**** The invoice status changes to "overdue" (not "sent")
- ****And:**** The system correctly identifies it's past the due date

1. 

- ****Given:**** I am viewing a paid invoice
- ****When:**** I click "Revert Payment"
- ****Then:**** A confirmation dialog appears asking "Are you sure you want to revert this payment?"
- ****And:**** Shows warning "This will mark the invoice as unpaid and remove the payment record"
- ****And:**** Has "Cancel" and "Confirm Revert" buttons

1. 

- ****Given:**** I am viewing an invoice with status "sent"
- ****When:**** I look at the available actions
- ****Then:**** The "Revert Payment" option is not shown (only available for paid invoices)

1. 

- ****Given:**** I revert a payment on invoice INV-2026-0042
- ****When:**** The revert is successful
- ****Then:**** An event is recorded in invoice_events table
- ****And:**** Event type is "updated" with metadata indicating payment revert
- ****And:**** This appears in the invoice history/audit log

1. 

- ****Given:**** My dashboard shows $5,000 total paid this month
- ****When:**** I revert a $500 payment
- ****Then:**** The dashboard pending amount increases by $500
- ****And:**** The paid this month amount decreases by $500

1. 

- ****Given:**** I am on the confirmation dialog for reverting a payment
- ****When:**** I click "Cancel"
- ****Then:**** The dialog closes
- ****And:**** The invoice remains in "paid" status
- ****And:**** No changes are made

---

## Scope

1. 

1. 

- Revert payment action on paid invoices
- Soft delete payment record (set deleted_at)
- Update invoice status to 'sent' or 'overdue' based on due date
- Clear paid_at timestamp on invoice
- Confirmation dialog with warning
- Audit trail via invoice_events
- Dashboard totals recalculation

1. 

- Hard delete of payment records
- Undo/restore reverted payments
- Automatic notification to client about revert
- Batch revert multiple payments

---

## References

- [External Link](https://staging-upexsoloq.vercel.app/)

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 4/14/2026
- **Reporter:** Ely
- **Assignee:** Fernando Javier Masci
- **Labels:** Dojo, shift-left-reviewed, test-plan-ready

---

_Synced from Jira by jira-sync_
_Last sync: 2026-05-02T05:05:22.322Z_
