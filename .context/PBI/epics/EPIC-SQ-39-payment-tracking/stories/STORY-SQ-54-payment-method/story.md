# Record Payment Method Used

**Jira Key:** [SQ-54](https://upexgalaxy64.atlassian.net/browse/SQ-54)
**Epic:** [SQ-39](https://upexgalaxy64.atlassian.net/browse/SQ-39) (Payment Tracking)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** record the payment method used
**So that** I have a record

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Method selection

- **Given:** I am recording a payment
- **When:** I fill the form
- **Then:** I can select a payment method

### Scenario 2: Method options

- **Given:** I view the method dropdown
- **When:** I see the options
- **Then:** I see: Bank Transfer, PayPal, Cash, Crypto, Other

### Scenario 3: Default to configured methods

- **Given:** I have payment methods configured
- **When:** I see the dropdown
- **Then:** My configured methods appear first

### Scenario 4: Method recorded

- **Given:** I select a payment method
- **When:** I save the payment
- **Then:** The method is stored with the payment

### Scenario 5: View method in history

- **Given:** I view a payment record
- **When:** I check the details
- **Then:** I see which method was used

---

## Technical Notes

- Methods: bank_transfer, paypal, cash, crypto, other
- Optional field (can be null)
- Store in payments.payment_method
- Suggest user's configured methods first

---

## Definition of Done

- [ ] Method selector implemented
- [ ] All method options available
- [ ] Configured methods prioritized
- [ ] Method stored correctly
- [ ] Method displayed in history
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-39-payment-tracking/epic.md`
