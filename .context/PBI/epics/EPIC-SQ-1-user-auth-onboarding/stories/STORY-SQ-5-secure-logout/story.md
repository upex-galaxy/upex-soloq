# Secure Logout

**Jira Key:** [SQ-5](https://upexgalaxy65.atlassian.net/browse/SQ-5)
**Epic:** [SQ-1](https://upexgalaxy65.atlassian.net/browse/SQ-1) (User Authentication & Onboarding)
**Priority:** High
**Story Points:** 1
**Status:** Shift-Left QA

---

## User Story

## User Story

***As a*** user
***I want to*** logout securely
***So that*** I can protect my account on shared devices

## 

## Description

Como usuario de SoloQ que usa dispositivos compartidos o públicos, necesito poder cerrar mi sesión de forma segura para evitar que otros accedan a mi cuenta y mis datos de facturación.

## 

## Acceptance Criteria (Gherkin format)

### Scenario 1: Successful logout from header menu

- ***Given:*** I am logged in and on any page of the app
- ***When:*** I click on my profile menu and select "Logout"
- ***Then:*** My session is terminated, cookies are cleared, and I'm redirected to the landing page

### Scenario 2: Logout clears all local data

- ***Given:*** I am logged in with data in localStorage/sessionStorage
- ***When:*** I logout
- ***Then:*** All session cookies and local storage data related to my account are cleared

### Scenario 3: Access protected route after logout

- ***Given:*** I have just logged out
- ***When:*** I try to access a protected route (like /dashboard)
- ***Then:*** I am redirected to the login page

### Scenario 4: Logout with pending unsaved changes

- ***Given:*** I am editing an invoice with unsaved changes
- ***When:*** I click logout
- ***Then:*** I see a confirmation dialog "You have unsaved changes. Are you sure you want to logout?"

## Technical Notes

### Frontend

- Logout button in user profile dropdown
- Confirmation dialog for unsaved changes
- Clear localStorage/sessionStorage
- Redirect to landing page

### Backend

- API Route: POST /api/auth/logout
- Supabase Auth signOut()
- Clear session cookies

### Security

- Invalidate server-side session
- Clear all client-side tokens
- Set cookies with proper expiry

## Definition of Done

- [ ] Logout button in navigation
- [ ] Session terminated correctly
- [ ] Cookies and storage cleared
- [ ] Redirect to landing page
- [ ] Confirmation for unsaved changes
- [ ] Error handling
- [ ] Unit tests > 80% coverage
- [ ] E2E test for happy path
- [ ] Code review approved

## Related Documentation

- ***Epic:*** [https://upexgalaxy65.atlassian.net/browse/SQ-1#icft=SQ-1](https://upexgalaxy65.atlassian.net/browse/SQ-1#icft=SQ-1) - User Authentication & Onboarding
- ***FR:*** FR-006 - Logout
- ***SRS:*** `.context/SRS/functional-specs.md`

---

## Acceptance Criteria

Feature:

Background:
Given ...

Scenario: ...
Given ...
When ...
Then ...

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 1/27/2026
- **Reporter:** Ely
- **Assignee:** German Luchesi
- **Labels:** authentication, must-have, mvp

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:38.691Z_
