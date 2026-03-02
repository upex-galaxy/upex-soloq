# Password Recovery via Email

**Jira Key:** [SQ-4](https://upexgalaxy65.atlassian.net/browse/SQ-4)
**Epic:** [SQ-1](https://upexgalaxy65.atlassian.net/browse/SQ-1) (User Authentication & Onboarding)
**Priority:** High
**Story Points:** 5
**Status:** In Test

---

## User Story

## User Story

***As a*** user
***I want to*** recover my password via email
***So that*** I don't lose access to my account

## 

## Description

Como usuario que olvidó su contraseña, necesito poder solicitar un link de recuperación a mi email para restablecer mi contraseña y recuperar el acceso a mi cuenta de SoloQ.

## 

## Acceptance Criteria (Gherkin format)

### Scenario 1: Successful password reset request

- ***Given:*** I am on the forgot password page
- ***When:*** I enter my registered email and submit
- ***Then:*** I see a message "If an account exists, we sent a reset link" and receive the email within 2 minutes

### Scenario 2: Password reset with non-existent email

- ***Given:*** I am on the forgot password page
- ***When:*** I enter an email that is not registered
- ***Then:*** I see the same generic message (to prevent email enumeration)

### Scenario 3: Successful password reset with valid token

- ***Given:*** I clicked the reset link from my email (token valid)
- ***When:*** I enter a new password that meets security requirements and confirm it
- ***Then:*** My password is updated, all sessions are invalidated, and I'm redirected to login with success message

### Scenario 4: Password reset fails with expired token

- ***Given:*** I clicked a reset link that is older than 1 hour
- ***When:*** I try to submit a new password
- ***Then:*** I see an error "This link has expired" with option to request a new one

### Scenario 5: Password reset fails with weak password

- ***Given:*** I am on the reset password page with a valid token
- ***When:*** I enter a password that doesn't meet security requirements
- ***Then:*** I see validation errors indicating what's missing

## Technical Notes

### Frontend

- Forgot password form (email input)
- Reset password form (new password + confirm)
- Password strength validation

### Backend

- API Route: POST /api/auth/forgot-password
- API Route: POST /api/auth/reset-password
- Supabase Auth resetPasswordForEmail() and updateUser()

### Database

- Supabase handles token storage and validation

### Security

- Token expires in 1 hour
- Generic messages to prevent enumeration
- All sessions invalidated after reset
- Rate limiting on forgot password endpoint

## Definition of Done

- [ ] Forgot password form implemented
- [ ] Reset password form implemented
- [ ] Email sent with reset link
- [ ] Token validation working
- [ ] All sessions invalidated after reset
- [ ] Error handling for all scenarios
- [ ] Unit tests > 80% coverage
- [ ] E2E test for happy path
- [ ] Code review approved

## Related Documentation

- ***Epic:*** [https://upexgalaxy65.atlassian.net/browse/SQ-1#icft=SQ-1](https://upexgalaxy65.atlassian.net/browse/SQ-1#icft=SQ-1) - User Authentication & Onboarding
- ***FR:*** FR-004, FR-005 - Recuperación y Reset de Contraseña
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
- **Updated:** 2/19/2026
- **Reporter:** Ely
- **Assignee:** Maxe Aguilera
- **Labels:** authentication, must-have, mvp

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:37.859Z_
