# Record Payment Date

**Jira Key:** [SQ-57](https://upexgalaxy64.atlassian.net/browse/SQ-57)
**Epic:** [SQ-39](https://upexgalaxy64.atlassian.net/browse/SQ-39) (Payment Tracking)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** record the payment date
**So that** I have accurate history

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Date picker

- **Given:** I am recording a payment
- **When:** I fill the form
- **Then:** I see a date picker for payment date

### Scenario 2: Default to today

- **Given:** I open the payment form
- **When:** I see the date field
- **Then:** It defaults to today's date

### Scenario 3: Select past date

- **Given:** The payment was received earlier
- **When:** I select a past date
- **Then:** The system accepts it

### Scenario 4: Future date warning

- **Given:** I select a future date
- **When:** I try to save
- **Then:** I see a warning but can proceed

### Scenario 5: Date displayed

- **Given:** I view a payment record
- **When:** I check the details
- **Then:** I see the payment date

---

## Technical Notes

- Default: CURRENT_DATE
- Allow past dates (for late recording)
- Store in payments.payment_date
- Format: user's locale preference

---

## Definition of Done

- [ ] Date picker implemented
- [ ] Default to today working
- [ ] Past date selection allowed
- [ ] Future date warning shown
- [ ] Date displayed in history
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-39-payment-tracking/epic.md`
