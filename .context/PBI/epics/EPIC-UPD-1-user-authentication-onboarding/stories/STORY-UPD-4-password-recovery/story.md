# As a user, I want to recover my password by email so I don't lose access to my account

**Jira Key:** UPD-4
**Epic:** UPD-1 (User Authentication & Onboarding)
**Priority:** Medium
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** registered user
**I want to** request a password reset link via email
**So that** I can regain access to my account if I forget my password.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A "Forgot Password" page with a single field for the user's email.
- Validation for the email format.
- An API endpoint that triggers Supabase to send a password reset email.
- The email must contain a unique, time-sensitive link to the password reset page.
- For security, the "Forgot Password" page should always show a generic success message, regardless of whether the email exists in the system or not.
- A page where the user can enter their new password.

### Out of Scope

- Password recovery via SMS or security questions.
- Limiting the number of password reset requests within a certain time frame.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: User requests password reset with a valid, existing email

- **Given:** I am a registered user and I am on the "Forgot Password" page.
- **When:** I enter my registered email address.
- **And:** I click the "Send Reset Link" button.
- **Then:** I see a confirmation message: "If an account with this email exists, a password reset link has been sent."
- **And:** I receive an email containing a unique link to reset my password.

### Scenario 2: User requests password reset with a non-existent email

- **Given:** I am on the "Forgot Password" page.
- **When:** I enter an email address that is not registered in the system.
- **And:** I click the "Send Reset Link" button.
- **Then:** I see the same confirmation message: "If an account with this email exists, a password reset link has been sent."
- **And:** No email is sent.

### Scenario 3: User successfully resets password using the link

- **Given:** I have received a password reset email and clicked the link.
- **When:** I am on the "Reset Password" page and enter a new, valid, matching password.
- **And:** I click the "Reset Password" button.
- **Then:** I am redirected to the login page with a success message: "Your password has been reset successfully. Please log in."

### Scenario 4: User attempts to use an expired or invalid reset link

- **Given:** I have a password reset link that has expired (e.g., > 1 hour old).
- **When:** I click the link.
- **Then:** I am taken to an error page that says "This password reset link is invalid or has expired."
- **And:** The page provides a link to request a new one.

---

## Technical Notes

### Frontend

- Create a `/forgot-password` page with an email input form.
- Create a `/reset-password` page that accepts a token from the URL and has a form for the new password.
- Use `react-hook-form` and `zod` for validation.
- The `/forgot-password` page calls `/api/auth/forgot-password`.
- The `/reset-password` page calls `/api/auth/reset-password`.

### Backend

- Create `/api/auth/forgot-password` route. It will call `supabase.auth.resetPasswordForEmail`.
- Create `/api/auth/reset-password` route. It will get the `code` from the callback and then call `supabase.auth.updateUser` with the new password.

---

## Dependencies

### Blocked By

- UPD-2 (User Registration)

### Blocks

- None.

---

## Definition of Done

- [ ] Code implemented and peer-reviewed.
- [ ] Integration tests for both `/forgot-password` and `/reset-password` endpoints are passing.
- [ ] E2E test for the full password recovery flow is passing.
- [ ] All acceptance criteria are met.

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-UPD-1-user-authentication-onboarding/epic.md`
- **SRS:** `FR-004`, `FR-005`
- **API Contracts:** `/auth/forgot-password`, `/auth/reset-password` endpoints in `api-contracts.yaml`
