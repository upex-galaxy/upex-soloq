# As a Free user, I want to upgrade to Pro subscription so that I can access automatic reminders

**Jira Key:** [SQ-65](https://upexgalaxy65.atlassian.net/browse/SQ-65)
**Epic:** [SQ-41](https://upexgalaxy65.atlassian.net/browse/SQ-41) (Subscription Management)
**Priority:** Medium
**Story Points:** 5
**Status:** Backlog

---

## User Story

As a Free user, I want to easily upgrade to Pro, so that I can access automatic reminders. Story Points: 5

---

## Acceptance Criteria

1. 

1. 

- ****Given:**** I am a Free user on the subscription page
- ****When:**** I click "Upgrade to Pro"
- ****Then:**** I am redirected to Stripe Checkout
- ****And:**** The checkout shows Pro plan price and billing cycle

1. 

- ****Given:**** I complete payment on Stripe Checkout
- ****When:**** Payment is successful and Stripe webhook is received
- ****Then:**** My subscription status changes to "Pro"
- ****And:**** I am redirected to a success page
- ****And:**** All Pro features are immediately accessible

1. 

- ****Given:**** I am on Stripe Checkout
- ****When:**** I click "Back" or close the checkout
- ****Then:**** I am redirected back to SoloQ subscription page
- ****And:**** My status remains "Free"
- ****And:**** No charges are made

1. 

- ****Given:**** I enter invalid payment details in Stripe Checkout
- ****When:**** Payment fails
- ****Then:**** Stripe shows an error message
- ****And:**** I can retry with different payment method
- ****And:**** My status remains "Free" until successful payment

1. 

- ****Given:**** I am a Free user viewing locked reminder settings
- ****When:**** I click "Upgrade to Pro" in the feature prompt
- ****Then:**** I am redirected to Stripe Checkout for Pro plan

1. 

- ****Given:**** I click upgrade
- ****When:**** I see the Stripe Checkout page
- ****Then:**** I see:
- Plan name: "SoloQ Pro"
- Price: "$X.XX/month" (or annual option if available)
- Features included summary
- Billing frequency

1. 

- ****Given:**** I successfully upgrade to Pro
- ****When:**** The subscription is activated
- ****Then:**** I receive an email confirming my Pro subscription
- ****And:**** The email includes next billing date and receipt

---

## Scope

1. 

1. 

- Upgrade button on subscription page
- Upgrade CTAs on locked Pro features
- Stripe Checkout integration (redirect flow)
- Webhook handling for checkout.session.completed
- Update subscription table to 'pro' status
- Success/cancel redirect URLs
- Confirmation email via Stripe or custom

1. 

- Embedded Stripe payment form (using redirect)
- Annual vs monthly toggle (single plan for MVP)
- Coupon/promo codes
- Multiple Pro tiers
- Team/organization subscriptions

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
_Last sync: 2026-03-02T19:54:11.325Z_
