# Mark Invoice as Paid

**Jira Key:** [SQ-53](https://upexgalaxy64.atlassian.net/browse/SQ-53)
**Epic:** [SQ-39](https://upexgalaxy64.atlassian.net/browse/SQ-39) (Payment Tracking)
**Priority:** High
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** mark an invoice as paid
**So that** I can update its status

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Mark as paid button

- **Given:** I have a sent invoice
- **When:** I view it
- **Then:** I see a "Mark as Paid" button

### Scenario 2: Quick mark from list

- **Given:** I am on the invoices list
- **When:** I click the "paid" icon on a row
- **Then:** A payment form opens

### Scenario 3: Status update

- **Given:** I mark an invoice as paid
- **When:** I confirm the action
- **Then:** The status changes to "paid"

### Scenario 4: Paid timestamp

- **Given:** I mark an invoice as paid
- **When:** I view the invoice details
- **Then:** I see when it was marked as paid

### Scenario 5: Cannot re-pay

- **Given:** An invoice is already paid
- **When:** I view it
- **Then:** The "Mark as Paid" button is disabled

---

## Technical Notes

- Update invoice: status = 'paid', paid_at = now()
- Create payment record in payments table
- Trigger dashboard stats update
- API: POST /api/invoices/:id/payments

---

## Definition of Done

- [ ] Mark as paid functionality working
- [ ] Quick action from list working
- [ ] Status update correct
- [ ] Timestamp recorded
- [ ] Duplicate prevention working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-39-payment-tracking/epic.md`
