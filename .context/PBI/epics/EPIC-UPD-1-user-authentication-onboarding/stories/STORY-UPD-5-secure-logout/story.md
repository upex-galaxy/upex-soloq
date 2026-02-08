# As a user, I want to log out securely to protect my account on shared devices

**Jira Key:** UPD-5
**Epic:** UPD-1 (User Authentication & Onboarding)
**Priority:** Medium
**Story Points:** 1
**Status:** To Do
**Assignee:** null

---

## User Story

**As an** authenticated user
**I want to** be able to log out of my account
**So that** I can securely end my session and prevent unauthorized access.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A "Logout" button or link, accessible from the main application layout (e.g., in a user dropdown menu).
- Clicking "Logout" will terminate the user's session.
- After logging out, the user is redirected to the homepage or the login page.
- All session-related data (cookies, local storage) should be cleared.

### Out of Scope

- "Log out from all devices" functionality.
- Automatic logout due to inactivity.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Successful logout

- **Given:** I am logged into my SoloQ account.
- **When:** I click the "Logout" button.
- **Then:** My session is terminated.
- **And:** I am redirected to the login page.
- **And:** If I try to access a protected page (e.g., `/dashboard`) by navigating directly, I am redirected back to the login page.

---

## Technical Notes

### Frontend

- The "Logout" button will trigger a call to the `/api/auth/logout` endpoint or directly call the Supabase client signout method.
- The application state (e.g., in a React Context) must be cleared to reflect the logged-out state.
- A router `push` will redirect the user to `/login`.

### Backend

- An API route at `/api/auth/logout` will call `supabase.auth.signOut()`.
- This function invalidates the user's access token and clears the auth cookies managed by the Supabase client.

---

## Dependencies

### Blocked By

- UPD-3 (User Login)

### Blocks

- None.

---

## Definition of Done

- [ ] Code implemented and peer-reviewed.
- [ ] Integration test for the `/api/auth/logout` endpoint is passing.
- [ ] E2E test for logging in and then logging out is passing.
- [ ] All acceptance criteria are met.

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-UPD-1-user-authentication-onboarding/epic.md`
- **SRS:** `FR-006`
- **API Contracts:** `/auth/logout` endpoint in `api-contracts.yaml`
