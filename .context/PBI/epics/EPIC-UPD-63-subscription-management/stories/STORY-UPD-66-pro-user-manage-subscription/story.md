# As a Pro user, I want to manage my subscription (see renewal date, cancel) to have control

**Jira Key:** UPD-66
**Epic:** UPD-63 (Subscription Management)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Pro user
**I want to** be able to see my subscription status, next renewal date, and have a way to cancel it
**So that** I have full control and transparency over my subscription.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A "Billing" or "Subscription" section in the user's settings.
- This page will display the user's current plan ("Pro").
- It will show the next renewal date (`current_period_end` from Stripe).
- It will include a "Manage Subscription" or "Cancel Subscription" button.
- This button will redirect the user to the Stripe Customer Portal, where they can securely cancel their subscription or update their payment method.
- A webhook to listen for `customer.subscription.deleted` or `customer.subscription.updated` (if `cancel_at_period_end` is true) to update the local database.

### Out of Scope

- Building a custom UI for cancellation or payment method updates. The Stripe Customer Portal will be used for this.
- Pausing subscriptions.
- Reactivating a canceled subscription from within the SoloQ app.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Pro user views their subscription details

- **Given:** I am a Pro user.
- **When:** I navigate to the "Subscription" settings page.
- **Then:** I see my current plan is "Pro".
- **And:** I see the date my subscription is set to renew.
- **And:** A "Manage Subscription" button is visible.

### Scenario 2: Pro user cancels their subscription via Stripe Portal

- **Given:** I am a Pro user on the "Subscription" settings page.
- **When:** I click the "Manage Subscription" button.
- **And:** I am redirected to the Stripe Customer Portal.
- **And:** I follow the steps on Stripe's site to cancel my subscription.
- **Then:** My subscription in SoloQ is marked as `cancel_at_period_end = true`.
- **And:** When I return to the SoloQ settings page, it shows my plan as "Pro, cancels on [Date]".

### Scenario 3: Subscription status updates after the period ends

- **Given:** My Pro subscription was set to cancel on today's date.
- **When:** The `customer.subscription.deleted` webhook is received from Stripe after the period ends.
- **Then:** My plan in the SoloQ database is updated to "Free".
- **And:** The next time I log in, I have Free user access.

---

## Technical Notes

### Frontend

- The `/settings/billing` page will display subscription data fetched from the backend.
- The "Manage Subscription" button will call a backend endpoint to create a Stripe Customer Portal session and redirect the user, similar to the checkout flow.

### Backend

- Create an endpoint `POST /api/subscription/portal` to create and return a Stripe Customer Portal session URL.
- The `POST /api/webhooks/stripe` endpoint must be updated to handle `customer.subscription.updated` and `customer.subscription.deleted` events to keep the local database in sync with Stripe.

### External Services

- **Stripe Customer Portal:** Must be enabled and configured in the Stripe dashboard.

---

## Dependencies

### Blocked By

- UPD-65 (Free user upgrade to Pro)

### Blocks

- Provides essential self-service capabilities for paying customers, reducing support load.

---

## Definition of Done

- [ ] Subscription management page is implemented.
- [ ] Backend correctly creates and redirects to a Stripe Customer Portal session.
- [ ] Backend webhook correctly handles subscription cancellation events from Stripe.
- [ ] E2E tests verify the user can be redirected to the portal and that the local subscription status updates correctly after a simulated webhook event.
- [ ] All acceptance criteria are met.
