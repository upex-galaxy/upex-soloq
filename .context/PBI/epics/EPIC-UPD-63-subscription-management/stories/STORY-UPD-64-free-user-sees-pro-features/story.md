# As a Free user, I want to see which features are limited to Pro to understand the value of upgrading

**Jira Key:** UPD-64
**Epic:** UPD-63 (Subscription Management)
**Priority:** Should Have
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Free user
**I want to** see clear indicators in the UI for features that are only available in the Pro plan
**So that** I can understand the value of upgrading and decide if it's right for me.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- In the UI, features that are not available to Free users (like "Automatic Reminders") should be visible but disabled or marked with a "Pro" badge.
- Clicking on these disabled features should trigger a modal or pop-up.
- The modal will explain the benefits of the Pro feature and have a clear call-to-action (CTA) button like "Upgrade to Pro".

### Out of Scope

- A full-screen paywall that blocks the entire application.
- Complex A/B testing of different upgrade messages.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Free user encounters a Pro feature

- **Given:** I am a Free user.
- **When:** I navigate to a section that contains a Pro feature, like the "Automatic Reminders" toggle in the settings.
- **Then:** I see the feature is visually disabled and has a "Pro" badge next to it.

### Scenario 2: Clicking on a Pro feature triggers an upgrade prompt

- **Given:** I am a Free user viewing a disabled "Pro" feature.
- **When:** I click on the disabled feature or its "Pro" badge.
- **Then:** A modal appears explaining what the feature does and its benefits.
- **And:** The modal has a button that says "Upgrade to Pro".

---

## Technical Notes

### Frontend

- Implement a "feature gating" mechanism. This can be a React Context or a hook (`useSubscription`) that provides the current user's plan (`free` or `pro`).
- Components will use this hook to conditionally render UI elements (e.g., disable a button, show a "Pro" badge).
- Create a reusable "Upgrade Modal" component that can be triggered from multiple places in the app.

### Backend

- The backend needs to provide the user's current subscription status upon login or when the app loads, so the frontend knows what to display. This will be part of the user session data.

---

## Dependencies

### Blocked By

- UPD-1 (Authentication Epic) - Need to know who the user is.

### Blocks

- UPD-65 (Free user upgrade to Pro) - This is the entry point to the upgrade flow.

---

## Definition of Done

- [ ] UI components for "Pro" features are correctly gated for Free users.
- [ ] The "Upgrade Modal" is implemented and functional.
- [ ] E2E test verifies that a Free user sees the "Pro" badges and can trigger the upgrade modal.
- [ ] All acceptance criteria are met.
