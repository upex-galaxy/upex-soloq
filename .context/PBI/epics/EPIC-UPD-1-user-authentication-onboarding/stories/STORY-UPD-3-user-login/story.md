# As a user, I want to log in with my credentials to access my account

**Jira Key:** UPD-3
**Epic:** UPD-1 (User Authentication & Onboarding)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** registered user
**I want to** log in using my email and password
**So that** I can access my dashboard and manage my invoices.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Display a login form with fields for email and password.
- A "Forgot your password?" link that redirects to the password recovery page.
- Client-side and server-side validation.
- On successful login, redirect the user to their dashboard (`/dashboard`).
- On failed login (wrong credentials), display a clear error message.
- If the user's email is not yet verified, show a specific message.

### Out of Scope

- "Remember me" functionality.
- Social logins (Google, etc.).
- IP-based attempt throttling.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Successful login with valid credentials

- **Given:** I am a registered and verified user with email "carlos@test.com" and password "ValidPass123".
- **And:** I am on the login page.
- **When:** I enter "carlos@test.com" in the email field and "ValidPass123" in the password field.
- **And:** I click the "Log In" button.
- **Then:** I am redirected to my dashboard at `/dashboard`.

### Scenario 2: Login attempt with incorrect password

- **Given:** I am a registered user with email "carlos@test.com".
- **And:** I am on the login page.
- **When:** I enter "carlos@test.com" in the email field and "WrongPassword" in the password field.
- **And:** I click the "Log In" button.
- **Then:** The page displays a generic error message: "Invalid email or password."

### Scenario 3: Login attempt with a non-existent email

- **Given:** I am on the login page.
- **When:** I enter "nonexistent@test.com" in the email field and any password.
- **And:** I click the "Log In" button.
- **Then:** The page displays a generic error message: "Invalid email or password."

### Scenario 4: Login attempt with an unverified email

- **Given:** I have registered with "valentina@test.com" but have not clicked the verification link.
- **And:** I am on the login page.
- **When:** I attempt to log in with my correct credentials.
- **And:** I click the "Log In" button.
- **Then:** The page displays an error message: "Please verify your email before logging in."
- **And:** A button or link to "Resend verification email" is visible.

---

## Technical Notes

### Frontend

- Create a `/login` page with a form.
- Use `react-hook-form` and `zod` for form management and validation.
- The form should call the `/api/auth/login` endpoint.
- Upon successful login, Supabase client sets the auth cookies, and the app should redirect to `/dashboard`.

### Backend

- Create a Next.js API route at `/api/auth/login`.
- This route will use `supabase.auth.signInWithPassword`.
- The Supabase client will handle cookie-based session management automatically.
- Logic should check for `error.message` to differentiate between invalid credentials and unverified email.

### Database

- The `profiles.last_login_at` field should be updated upon successful login (can be handled by a trigger).

---

## Dependencies

### Blocked By

- UPD-2 (User Registration)

### Blocks

- Most other features in the application, as they require an authenticated session.

---

## Definition of Done

- [ ] Code implemented and peer-reviewed.
- [ ] Unit tests for form validation are passing.
- [ ] Integration test for the `/api/auth/login` endpoint is passing.
- [ ] E2E test for the login flow (both success and failure cases) is passing.
- [ ] All acceptance criteria are met.

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-UPD-1-user-authentication-onboarding/epic.md`
- **SRS:** `FR-003`
- **API Contracts:** `/auth/login` endpoint in `api-contracts.yaml`
