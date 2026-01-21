# Record Payment Amount

**Jira Key:** [SQ-55](https://upexgalaxy64.atlassian.net/browse/SQ-55)
**Epic:** [SQ-39](https://upexgalaxy64.atlassian.net/browse/SQ-39) (Payment Tracking)
**Priority:** High
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** record the amount received
**So that** I can verify against the invoiced total

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Amount field

- **Given:** I am recording a payment
- **When:** I fill the form
- **Then:** I see an amount input field

### Scenario 2: Default to invoice total

- **Given:** I open the payment form
- **When:** I see the amount field
- **Then:** It defaults to the invoice total

### Scenario 3: Partial payment

- **Given:** I receive a partial payment
- **When:** I enter a lower amount
- **Then:** The system accepts it (future: partial payment handling)

### Scenario 4: Overpayment warning

- **Given:** I enter an amount higher than owed
- **When:** I try to save
- **Then:** I see a warning but can proceed

### Scenario 5: Amount displayed

- **Given:** I view a payment record
- **When:** I check the details
- **Then:** I see the amount received

---

## Technical Notes

- Amount defaults to invoice.total
- Validate: amount > 0
- Store in payments.amount
- Consider partial payments in future (MVP: full payment only)
- Currency formatting in input

---

## Definition of Done

- [ ] Amount input field implemented
- [ ] Default value set correctly
- [ ] Partial payment accepted
- [ ] Overpayment warning shown
- [ ] Amount displayed in history
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-39-payment-tracking/epic.md`
