# Secure Logout

**Jira Key:** [SQ-5](https://upexgalaxy64.atlassian.net/browse/SQ-5)
**Epic:** [SQ-1](https://upexgalaxy64.atlassian.net/browse/SQ-1) (User Authentication & Onboarding)
**Priority:** High
**Story Points:** 2
**Status:** Backlog
**Assignee:** Unassigned

---

## User Story

**As a** user
**I want to** logout securely
**So that** I can protect my account on shared devices

---

## Description

Como usuario de SoloQ que usa dispositivos compartidos o públicos, necesito poder cerrar mi sesión de forma segura para evitar que otros accedan a mi cuenta y mis datos de facturación.

El logout seguro es fundamental para la confianza del usuario. Los freelancers manejan datos financieros sensibles, y deben poder cerrar sesión con confianza de que su información está protegida.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Successful logout from header menu

- **Given:** I am logged in and on any page of the app
- **When:** I click on my profile menu and select "Logout"
- **Then:** My session is terminated, cookies are cleared, and I'm redirected to the landing page

### Scenario 2: Logout clears all local data

- **Given:** I am logged in with data in localStorage/sessionStorage
- **When:** I logout
- **Then:** All session cookies and local storage data related to my account are cleared

### Scenario 3: Access protected route after logout

- **Given:** I have just logged out
- **When:** I try to access a protected route (like /dashboard)
- **Then:** I am redirected to the login page

### Scenario 4: Logout with pending unsaved changes

- **Given:** I am editing an invoice with unsaved changes
- **When:** I click logout
- **Then:** I see a confirmation dialog "You have unsaved changes. Are you sure you want to logout?"

---

## Technical Notes

### Frontend

- Logout button in user profile dropdown
- Confirmation dialog for unsaved changes
- Clear localStorage/sessionStorage
- Redirect to landing page
- Components: `UserMenu` (with logout option), `UnsavedChangesDialog`

### Backend

- API Route: `POST /api/auth/logout`
- Supabase Auth `signOut()`
- Clear session cookies

### Security

- Invalidate server-side session
- Clear all client-side tokens
- Set cookies with proper expiry (immediate)
- Clear Supabase local storage keys

---

## Dependencies

### Blocked By

- SQ-3 (User Login) - needs login to test logout

### Blocks

- None directly

### Related Stories

- SQ-3: User Login (logout completes the auth cycle)

---

## UI/UX Considerations

- Logout option in user dropdown menu
- Clear visual feedback on logout action
- Smooth redirect to landing page
- Confirmation dialog only when there are unsaved changes
- No logout button when not authenticated

---

## Definition of Done

- [ ] Logout button in navigation/user menu
- [ ] Session terminated correctly on server
- [ ] Cookies and storage cleared on client
- [ ] Redirect to landing page after logout
- [ ] Confirmation for unsaved changes
- [ ] Protected routes redirect to login
- [ ] Unit tests > 80% coverage
- [ ] Integration tests for API
- [ ] E2E test for logout flow
- [ ] Code review approved (2 reviewers)
- [ ] Deployed to staging
- [ ] QA testing passed

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/stories/STORY-SQ-5-secure-logout/test-cases.md` (se crea en Fase 5)

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path logout
- Session termination verification
- Storage clearing verification
- Protected route access after logout
- Unsaved changes confirmation
- Multiple tabs handling

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/stories/STORY-SQ-5-secure-logout/implementation-plan.md` (se crea en Fase 6)

**Implementation Steps Expected:**

1. Create logout API route
2. Integrate with Supabase signOut()
3. Add logout option to UserMenu component
4. Implement client-side cleanup (storage, cookies)
5. Add redirect logic
6. Create UnsavedChangesDialog (or use existing)
7. Implement unsaved changes detection
8. Write tests

---

## Notes

- Logout should work even if API call fails (clear client state regardless)
- Consider "logout from all devices" option in v2
- Supabase keys to clear: `sb-*` in localStorage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/epic.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-006)
- **API Contracts:** `.context/SRS/api-contracts.yaml` (POST /auth/logout)
