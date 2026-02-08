# As a new user, I want to complete a guided onboarding to set up my business profile

**Jira Key:** UPD-6
**Epic:** UPD-1 (User Authentication & Onboarding)
**Priority:** Should Have
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** new user who has just verified my email
**I want to** be guided through a simple setup wizard
**So that** I can quickly configure my business profile and start creating invoices.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A multi-step onboarding flow that triggers after the first login/email verification.
- Step 1: Collect business name and contact information (name, email, phone).
- Step 2: Allow uploading a logo (optional, with a "skip" option).
- Step 3: Configure at least one payment method (e.g., bank transfer details).
- A progress indicator showing the steps.
- The ability to skip optional steps.
- On completion, the user is redirected to the main dashboard.

### Out of Scope

- Forcing the user to complete onboarding; they should be able to exit and do it later from settings.
- Advanced settings like tax configuration or invoice template selection.
- Importing data from other platforms.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: User completes all steps of the onboarding wizard

- **Given:** I am a new user who has just verified my email and I am on the first step of the onboarding wizard.
- **When:** I enter my business name and contact details and click "Next".
- **And:** I upload my logo on the next step and click "Next".
- **And:** I add my bank account details as a payment method and click "Finish".
- **Then:** My business profile is saved with all the information.
- **And:** I am redirected to my dashboard, which might show a welcome message.

### Scenario 2: User skips an optional step

- **Given:** I am on the logo upload step of the onboarding wizard.
- **When:** I click the "Skip for now" button.
- **Then:** I am taken to the next step (Payment Methods) without a logo being saved to my profile.

### Scenario 3: User tries to submit a step with invalid data

- **Given:** I am on the first step of the onboarding wizard.
- **When:** I leave the "Business Name" field blank and click "Next".
- **Then:** An error message "Business Name is required" is displayed, and I remain on the current step.

---

## Technical Notes

### Frontend

- Create a new layout for the onboarding flow, possibly without the main app navigation.
- Create a multi-step form component. A state machine (like XState) or a simple state management approach can be used to manage steps.
- Each step will be a form that submits data to an API endpoint to update the `business_profiles` and `payment_methods` tables.
- UI should be clean and focused, guiding the user through one task at a time.
- Use Supabase Storage for the logo upload.

### Backend

- The `/api/profile/business` (PUT) and `/api/profile/payment-methods` (PUT) endpoints will be used to save the data from the onboarding steps.
- The logic to redirect to onboarding after first login will be handled in the frontend, checking if a business profile has been fully set up.

---

## Dependencies

### Blocked By

- UPD-2 (User Registration)

### Blocks

- A seamless "first invoice" experience.

---

## Definition of Done

- [ ] Code implemented and peer-reviewed.
- [ ] Unit tests for each step's validation logic are passing.
- [ ] E2E test for the complete onboarding flow is passing.
- [ ] All acceptance criteria are met.
- [ ] The user is correctly redirected to the dashboard upon completion.

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-UPD-1-user-authentication-onboarding/epic.md`
- **User Journey:** Journey 1: Registro y Primera Factura
- **SRS:** `FR-007`, `FR-008`, `FR-009`
- **API Contracts:** `/profile/business`, `/profile/logo`, `/profile/payment-methods` endpoints in `api-contracts.yaml`
