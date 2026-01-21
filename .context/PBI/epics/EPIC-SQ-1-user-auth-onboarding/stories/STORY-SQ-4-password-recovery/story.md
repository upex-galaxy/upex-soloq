# Password Recovery via Email

**Jira Key:** [SQ-4](https://upexgalaxy64.atlassian.net/browse/SQ-4)
**Epic:** [SQ-1](https://upexgalaxy64.atlassian.net/browse/SQ-1) (User Authentication & Onboarding)
**Priority:** High
**Story Points:** 3
**Status:** Backlog
**Assignee:** Unassigned

---

## User Story

**As a** user
**I want to** recover my password via email
**So that** I don't lose access to my account

---

## Description

Como usuario que olvidó su contraseña, necesito poder solicitar un link de recuperación a mi email para restablecer mi contraseña y recuperar el acceso a mi cuenta de SoloQ.

Esta funcionalidad es crítica para la retención de usuarios. Un freelancer que no puede acceder a su cuenta pierde acceso a sus facturas y clientes, lo que puede causar frustración y abandono del servicio.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Successful password reset request

- **Given:** I am on the forgot password page
- **When:** I enter my registered email and submit
- **Then:** I see a message "If an account exists, we sent a reset link" and receive the email within 2 minutes

### Scenario 2: Password reset with non-existent email

- **Given:** I am on the forgot password page
- **When:** I enter an email that is not registered
- **Then:** I see the same generic message (to prevent email enumeration)

### Scenario 3: Successful password reset with valid token

- **Given:** I clicked the reset link from my email (token valid)
- **When:** I enter a new password that meets security requirements and confirm it
- **Then:** My password is updated, all sessions are invalidated, and I'm redirected to login with success message

### Scenario 4: Password reset fails with expired token

- **Given:** I clicked a reset link that is older than 1 hour
- **When:** I try to submit a new password
- **Then:** I see an error "This link has expired" with option to request a new one

### Scenario 5: Password reset fails with weak password

- **Given:** I am on the reset password page with a valid token
- **When:** I enter a password that doesn't meet security requirements
- **Then:** I see validation errors indicating what's missing

---

## Technical Notes

### Frontend

- Forgot password form (email input only)
- Reset password form (new password + confirm)
- Password strength validation (same as registration)
- Components: `ForgotPasswordForm`, `ResetPasswordForm`
- Routes: `/auth/forgot-password`, `/auth/reset-password`

### Backend

- API Route: `POST /api/auth/forgot-password`
- API Route: `POST /api/auth/reset-password`
- Supabase Auth `resetPasswordForEmail()` and `updateUser()`

### Database

- Supabase handles token storage and validation internally
- All sessions invalidated after reset

### Security

- Token expires in 1 hour
- Generic messages to prevent email enumeration
- All sessions invalidated after password change
- Rate limiting on forgot password (3 requests per hour per email)

---

## Dependencies

### Blocked By

- SQ-2 (User Registration) - needs users to test password recovery

### Blocks

- None directly

### Related Stories

- SQ-2: User Registration (shares password validation)
- SQ-3: User Login (redirect after reset)

---

## UI/UX Considerations

- Forgot Password page:
  - Simple form with email input
  - Clear instructions
  - Link back to login
- Reset Password page:
  - New password + confirm fields
  - Password requirements visible
  - Success message with redirect to login
- Generic confirmation messages for security
- Clear error states

---

## Definition of Done

- [ ] Forgot password form implemented
- [ ] Reset password form implemented
- [ ] Email sent with reset link
- [ ] Token validation working (valid/expired)
- [ ] All sessions invalidated after reset
- [ ] Error handling for all scenarios
- [ ] Rate limiting implemented
- [ ] Unit tests > 80% coverage
- [ ] Integration tests for API
- [ ] E2E test for happy path
- [ ] Code review approved (2 reviewers)
- [ ] Deployed to staging
- [ ] QA testing passed

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/stories/STORY-SQ-4-password-recovery/test-cases.md` (se crea en Fase 5)

**Test Cases Expected:** 8+ detailed test cases covering:

- Happy path reset flow
- Non-existent email handling
- Expired token handling
- Password validation errors
- Rate limiting behavior
- Session invalidation

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/stories/STORY-SQ-4-password-recovery/implementation-plan.md` (se crea en Fase 6)

**Implementation Steps Expected:**

1. Create ForgotPasswordForm component
2. Create forgot-password API route
3. Integrate with Supabase resetPasswordForEmail()
4. Create ResetPasswordForm component
5. Create reset-password API route (with token handling)
6. Integrate with Supabase updateUser()
7. Add session invalidation logic
8. Add rate limiting
9. Write tests

---

## Notes

- Same password policy as registration
- Consider adding email preview showing masked email (j\*\*\*@example.com)
- Token URL format: `/auth/reset-password?token=xxx`

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/epic.md`
- **PRD:** `.context/PRD/user-journeys.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-004, FR-005)
- **API Contracts:** `.context/SRS/api-contracts.yaml` (POST /auth/forgot-password, POST /auth/reset-password)
