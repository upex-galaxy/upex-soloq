# As a user, I want to register with my email and password to create my account in SoloQ

**Jira Key:** UPD-2
**Epic:** UPD-1 (User Authentication & Onboarding)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** new visitor
**I want to** register using my email and a secure password
**So that** I can create a personal account and start using SoloQ.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Display a registration form with fields for email, password, and password confirmation.
- Client-side validation for email format and password strength.
- Server-side validation for all fields.
- Check for email uniqueness. If the email already exists, display a clear error.
- On successful registration, send a verification email to the user.
- Display a page instructing the user to check their email for verification.

### Out of Scope

- Social logins (Google, Facebook, etc.).
- "Magic Link" (passwordless) login.
- Captcha or any other anti-bot mechanism.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Successful registration with valid data

- **Given:** I am a new visitor on the registration page.
- **When:** I fill in the form with a unique email and a strong, matching password.
- **And:** I click the "Register" button.
- **Then:** I am redirected to a page that says "Please check your email to verify your account."
- **And:** I receive an email with a verification link.

### Scenario 2: Attempting to register with an already existing email

- **Given:** A user with the email "carlos@test.com" already exists.
- **And:** I am on the registration page.
- **When:** I fill in the form with the email "carlos@test.com" and any password.
- **And:** I click the "Register" button.
- **Then:** The form displays an error message: "An account with this email already exists. Please log in."

### Scenario 3: Attempting to register with a weak password

- **Given:** I am a new visitor on the registration page.
- **When:** I fill in the form with a password that is less than 8 characters long.
- **And:** I click the "Register" button.
- **Then:** The form displays an error message under the password field: "Password must be at least 8 characters long and include an uppercase letter and a number."

### Scenario 4: Passwords do not match

- **Given:** I am on the registration page.
- **When:** I fill the "password" field with "ValidPass123" and the "confirm password" field with "DifferentPass123".
- **And:** I click the "Register" button.
- **Then:** The form displays an error message: "Passwords do not match."

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Email must be unique across all users.
- Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, and one number.

---

## Technical Notes

### Frontend

- Create a `/register` page with a form.
- Use `react-hook-form` for form state management.
- Use `zod` for client-side and server-side validation schemas.
- Display toast notifications for success/error messages.
- The form should call the `/api/auth/register` endpoint.

### Backend

- Create a Next.js API route at `/api/auth/register`.
- The route will use the Supabase client (`supabase.auth.signUp`).
- The `signUp` function will handle user creation in `auth.users` and sending the verification email.
- A new entry in the `public.profiles` table should be created via a trigger or in the onboarding flow, not at registration.

### Database

- Supabase `auth.users` table will be the primary table.
- A trigger `on_user_created` can be set up in Supabase to populate the `public.profiles` table.

---

## Dependencies

### Blocked By

- None. This is a foundational story.

### Blocks

- UPD-3 (User Login)
- UPD-6 (Onboarding Wizard)

---

## Definition of Done

- [ ] Code implemented and peer-reviewed.
- [ ] Unit tests for validation logic are created and passing.
- [ ] Integration test for the `/api/auth/register` endpoint is created and passing.
- [ ] E2E test for the registration flow is passing.
- [ ] All acceptance criteria are met.
- [ ] Deployed to staging environment.

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-UPD-1-user-authentication-onboarding/epic.md`
- **SRS:** `FR-001`, `FR-002`
- **API Contracts:** `/auth/register` endpoint in `api-contracts.yaml`
