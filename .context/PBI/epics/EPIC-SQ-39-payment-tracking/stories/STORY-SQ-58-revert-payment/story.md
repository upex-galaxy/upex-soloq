# Revert Payment Status

**Jira Key:** [SQ-58](https://upexgalaxy64.atlassian.net/browse/SQ-58)
**Epic:** [SQ-39](https://upexgalaxy64.atlassian.net/browse/SQ-39) (Payment Tracking)
**Priority:** Low
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** revert an invoice from "paid" to "pending"
**So that** I can correct errors

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Revert option

- **Given:** I have a paid invoice
- **When:** I view it
- **Then:** I see an option to revert the payment

### Scenario 2: Confirmation required

- **Given:** I click revert
- **When:** The dialog appears
- **Then:** I must confirm before reverting

### Scenario 3: Status reverted

- **Given:** I confirm the revert
- **When:** The action completes
- **Then:** The invoice status changes back to "sent"

### Scenario 4: Payment deleted

- **Given:** I revert a payment
- **When:** I check payment history
- **Then:** The payment record is removed

### Scenario 5: Dashboard updated

- **Given:** I revert a payment
- **When:** I view the dashboard
- **Then:** The pending total includes this invoice again

---

## Technical Notes

- Delete payment record from payments table
- Update invoice: status = 'sent', paid_at = null
- Recalculate overdue if past due_date
- Confirmation dialog required
- Audit log (optional): record the reversion

---

## Definition of Done

- [ ] Revert option visible
- [ ] Confirmation dialog implemented
- [ ] Status correctly reverted
- [ ] Payment record deleted
- [ ] Dashboard updated
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-39-payment-tracking/epic.md`
