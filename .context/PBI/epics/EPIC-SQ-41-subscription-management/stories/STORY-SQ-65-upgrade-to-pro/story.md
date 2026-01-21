# Upgrade to Pro Subscription

**Jira Key:** [SQ-65](https://upexgalaxy64.atlassian.net/browse/SQ-65)
**Epic:** [SQ-41](https://upexgalaxy64.atlassian.net/browse/SQ-41) (Subscription Management)
**Priority:** High
**Story Points:** 3
**Status:** Backlog

---

## User Story

**As a** Free user
**I want to** easily upgrade to Pro
**So that** I can access automatic reminders

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Upgrade button

- **Given:** I am a Free user
- **When:** I view settings or hit a limit
- **Then:** I see an "Upgrade to Pro" button

### Scenario 2: Pricing page

- **Given:** I click upgrade
- **When:** The page loads
- **Then:** I see clear pricing ($X/month)

### Scenario 3: Checkout flow

- **Given:** I choose to subscribe
- **When:** I click "Subscribe"
- **Then:** I'm taken to Stripe checkout

### Scenario 4: Successful upgrade

- **Given:** I complete payment
- **When:** I return to the app
- **Then:** I have Pro status immediately

### Scenario 5: Failed payment

- **Given:** My payment fails
- **When:** I return to the app
- **Then:** I see an error and remain on Free

---

## Technical Notes

- Use Stripe Checkout for payment
- Price: configurable (e.g., $9.99/month)
- Webhook: checkout.session.completed
- Update subscriptions table: plan = 'pro'

---

## Definition of Done

- [ ] Upgrade button visible
- [ ] Pricing page created
- [ ] Stripe Checkout integration
- [ ] Successful upgrade handling
- [ ] Failed payment handling
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-41-subscription-management/epic.md`
