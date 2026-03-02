# As a Pro user, I want to manage my subscription so that I have control over my billing

**Jira Key:** [SQ-66](https://upexgalaxy65.atlassian.net/browse/SQ-66)
**Epic:** [SQ-41](https://upexgalaxy65.atlassian.net/browse/SQ-41) (Subscription Management)
**Priority:** Medium
**Story Points:** 3
**Status:** Backlog

---

## User Story

As a Pro user, I want to manage my subscription (see renewal date, cancel), so that I have control. Story Points: 3

---

## Acceptance Criteria

1. 

1. 

- ****Given:**** I am a Pro user
- ****When:**** I navigate to Settings > Subscription
- ****Then:**** I see my subscription details:
- Current plan: "Pro"
- Status: "Active"
- Next billing date: "Mar 15, 2026"
- Monthly price: "$X.XX"

1. 

- ****Given:**** I am on the subscription management page
- ****When:**** I click "Manage Billing"
- ****Then:**** I am redirected to Stripe Customer Portal
- ****And:**** I can update payment method, view invoices, cancel subscription

1. 

- ****Given:**** I am in Stripe Customer Portal
- ****When:**** I click "Cancel Subscription"
- ****Then:**** I see options to cancel immediately or at period end
- ****When:**** I confirm cancellation at period end
- ****Then:**** My subscription is set to cancel at current*period*end
- ****And:**** I retain Pro access until that date

1. 

- ****Given:**** I have cancelled but period hasn't ended
- ****When:**** I view my subscription page
- ****Then:**** I see "Your subscription will end on [date]"
- ****And:**** A "Reactivate" button is available

1. 

- ****Given:**** My subscription is set to cancel at period end
- ****When:**** I click "Reactivate Subscription"
- ****Then:**** The cancellation is reversed
- ****And:**** My subscription continues normally

1. 

- ****Given:**** I am in Stripe Customer Portal
- ****When:**** I click "Update payment method"
- ****Then:**** I can add a new card
- ****And:**** Set it as default for future payments

1. 

- ****Given:**** My payment failed and subscription is "past_due"
- ****When:**** I view my subscription page
- ****Then:**** I see a warning "Payment failed - update your payment method"
- ****And:**** A link to update payment in Stripe Portal
- ****And:**** Pro features remain accessible during grace period

---

## Scope

1. 

1. 

- Subscription status display (plan, status, next billing)
- Stripe Customer Portal redirect
- Cancel subscription (via Stripe Portal)
- Reactivate subscription (via Stripe Portal)
- Update payment method (via Stripe Portal)
- Handle past_due status display
- Webhook handling for subscription updates

1. 

- In-app cancellation flow (use Stripe Portal)
- Downgrade to Free (just cancel)
- Pause subscription (not supported by Stripe for all plans)
- Refund requests (handled via Stripe/support)

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 3/2/2026
- **Reporter:** Ely
- **Assignee:** Unassigned

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:54:11.635Z_
