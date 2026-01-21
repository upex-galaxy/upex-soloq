# View Subscription Payment History

**Jira Key:** [SQ-67](https://upexgalaxy64.atlassian.net/browse/SQ-67)
**Epic:** [SQ-41](https://upexgalaxy64.atlassian.net/browse/SQ-41) (Subscription Management)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** Pro user
**I want to** see my subscription payment history
**So that** I have records

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Payment list

- **Given:** I am a Pro user
- **When:** I view payment history
- **Then:** I see a list of my subscription payments

### Scenario 2: Payment details

- **Given:** I view a payment
- **When:** I check the details
- **Then:** I see date, amount, and status

### Scenario 3: Download invoice

- **Given:** I need a receipt
- **When:** I click on a payment
- **Then:** I can download a PDF invoice from Stripe

### Scenario 4: Failed payment shown

- **Given:** A payment failed
- **When:** I view history
- **Then:** I see it marked as failed with reason

### Scenario 5: Upcoming payment

- **Given:** I have an active subscription
- **When:** I view my billing
- **Then:** I see when the next payment will occur

---

## Technical Notes

- Fetch from Stripe API or use webhook data
- Store in subscription_history table
- Link to Stripe-hosted invoice PDF
- Show: date, amount, status (paid/failed)

---

## Definition of Done

- [ ] Payment list displayed
- [ ] Payment details shown
- [ ] Invoice download working
- [ ] Failed payments indicated
- [ ] Next payment date shown
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-41-subscription-management/epic.md`
