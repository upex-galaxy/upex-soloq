# Manage Subscription (View/Cancel)

**Jira Key:** [SQ-66](https://upexgalaxy64.atlassian.net/browse/SQ-66)
**Epic:** [SQ-41](https://upexgalaxy64.atlassian.net/browse/SQ-41) (Subscription Management)
**Priority:** High
**Story Points:** 3
**Status:** Backlog

---

## User Story

**As a** Pro user
**I want to** manage my subscription (see renewal date, cancel)
**So that** I have control

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Subscription details

- **Given:** I am a Pro user
- **When:** I view my subscription
- **Then:** I see my plan, price, and renewal date

### Scenario 2: Billing portal access

- **Given:** I want to manage billing
- **When:** I click "Manage Subscription"
- **Then:** I'm taken to Stripe Customer Portal

### Scenario 3: Cancel subscription

- **Given:** I want to cancel
- **When:** I click "Cancel"
- **Then:** I can cancel (effective at period end)

### Scenario 4: Cancellation confirmation

- **Given:** I cancel my subscription
- **When:** I view my subscription
- **Then:** I see "Cancels on [date]"

### Scenario 5: Reactivate subscription

- **Given:** I've cancelled but period hasn't ended
- **When:** I change my mind
- **Then:** I can reactivate the subscription

---

## Technical Notes

- Use Stripe Customer Portal for self-service
- Portal handles: update card, view invoices, cancel
- Webhook: customer.subscription.updated
- Store cancel_at_period_end flag

---

## Definition of Done

- [ ] Subscription details displayed
- [ ] Stripe Portal integration
- [ ] Cancel flow working
- [ ] Cancellation status shown
- [ ] Reactivation working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-41-subscription-management/epic.md`
