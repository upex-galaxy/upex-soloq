# As a Free user, I want to be able to easily upgrade to Pro to access automatic reminders

**Jira Key:** UPD-65
**Epic:** UPD-63 (Subscription Management)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Free user
**I want to** be able to easily and securely subscribe to the Pro plan
**So that** I can unlock premium features like automatic reminders.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Clicking an "Upgrade to Pro" button will initiate the payment flow.
- The user will be redirected to a Stripe Checkout page. Stripe will securely handle the collection of payment information.
- After a successful payment on the Stripe page, the user is redirected back to the SoloQ application to a success page (e.g., `/settings/billing?status=success`).
- If the user cancels the payment, they are redirected back to a cancellation page (e.g., `/settings/billing?status=cancelled`).
- A backend webhook must listen for the `checkout.session.completed` event from Stripe to update the user's subscription status in the database.

### Out of Scope

- Processing payments directly within the SoloQ application (Stripe Checkout is used for PCI compliance).
- Offering multiple payment methods outside of what Stripe Checkout is configured to offer.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Successful upgrade to Pro

- **Given:** I am a Free user and I click "Upgrade to Pro".
- **When:** I am redirected to the Stripe Checkout page and I enter valid test payment details.
- **And:** I complete the payment successfully.
- **Then:** I am redirected back to the SoloQ application's success URL.
- **And:** My subscription status in the application is now "Pro".
- **And:** I now have access to Pro features.

### Scenario 2: User cancels the upgrade process

- **Given:** I am a Free user on the Stripe Checkout page.
- **When:** I decide not to proceed and click the "back" or "cancel" link provided by Stripe.
- **Then:** I am redirected back to the SoloQ application's cancellation URL.
- **And:** My subscription status remains "Free".

### Scenario 3: Payment fails on Stripe

- **Given:** I am a Free user on the Stripe Checkout page.
- **When:** I enter invalid payment details, causing the payment to fail.
- **Then:** Stripe's UI shows me an error message.
- **And:** I remain on the Stripe Checkout page to correct my details.
- **And:** My subscription status in SoloQ remains "Free".

---

## Technical Notes

### Frontend

- The "Upgrade to Pro" button will make a `POST` request to a backend endpoint (`/api/subscription/checkout`).
- The backend will respond with a URL for the Stripe Checkout session.
- The frontend will then use `window.location.href` to redirect the user to this Stripe URL.

### Backend

- Create the `POST /api/subscription/checkout` endpoint. This will use the Stripe Node.js library to create a `checkout.session` with the correct price ID, success URL, and cancel URL. It returns the session URL to the frontend.
- Create the `POST /api/webhooks/stripe` endpoint. This is a critical endpoint that will listen for events from Stripe. It must:
  1. Verify the request signature from Stripe to ensure it's authentic.
  2. Handle the `checkout.session.completed` event to find the user and update their record in the `subscription` table to "Pro".

### External Services

- **Stripe:** Requires a Stripe account, product, and price to be configured. The Stripe CLI is essential for local testing of webhooks.

---

## Dependencies

### Blocked By

- UPD-64 (Free user sees Pro features)

### Blocks

- The entire monetization strategy of the application.

---

## Definition of Done

- [ ] Frontend successfully redirects users to a Stripe Checkout session.
- [ ] Backend webhook correctly handles successful payment events from Stripe and updates the user's subscription status.
- [ ] The user's status is reflected correctly in the UI after a successful upgrade.
- [ ] E2E tests using Stripe's test mode and CLI for webhook simulation are passing.
- [ ] All acceptance criteria are met.
