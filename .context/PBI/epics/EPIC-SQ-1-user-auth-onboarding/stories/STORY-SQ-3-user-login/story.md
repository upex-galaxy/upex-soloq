# User Login with Credentials

**Jira Key:** [SQ-3](https://upexgalaxy64.atlassian.net/browse/SQ-3)
**Epic:** [SQ-1](https://upexgalaxy64.atlassian.net/browse/SQ-1) (User Authentication & Onboarding)
**Priority:** Highest
**Story Points:** 3
**Status:** Backlog
**Assignee:** Unassigned

---

## User Story

**As a** user
**I want to** login with my credentials
**So that** I can access my account

---

## Description

Como usuario registrado de SoloQ, necesito poder iniciar sesión con mi email y contraseña para acceder a mi dashboard y gestionar mis facturas. El proceso debe ser seguro y mantener mi sesión activa de forma segura.

El login es la puerta de entrada al sistema. Debe ser rápido, seguro y manejar errores de forma clara sin revelar información sensible (como si un email existe o no).

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Successful login with valid credentials

- **Given:** I am a registered user with a verified email
- **When:** I enter my correct email and password on the login page
- **Then:** I am redirected to the dashboard, my session is active, and I see a welcome message

### Scenario 2: Login fails with incorrect password

- **Given:** I am on the login page
- **When:** I enter a valid email but incorrect password
- **Then:** I see an error message "Invalid credentials" (generic for security)

### Scenario 3: Login fails with unverified email

- **Given:** I am a registered user but haven't verified my email
- **When:** I try to login with correct credentials
- **Then:** I see a message "Please verify your email first" with option to resend verification

### Scenario 4: Login fails with non-existent email

- **Given:** I am on the login page
- **When:** I enter an email that is not registered
- **Then:** I see the same generic error "Invalid credentials" (to prevent email enumeration)

### Scenario 5: Login with "Remember me" option

- **Given:** I am on the login page
- **When:** I login successfully with "Remember me" checked
- **Then:** My session persists for 7 days instead of 1 hour

---

## Technical Notes

### Frontend

- Login form with React Hook Form + Zod
- "Remember me" checkbox
- Link to forgot password
- Link to register
- Components: `LoginForm`
- Route: `/auth/login`

### Backend

- API Route: `POST /api/auth/login`
- Supabase Auth `signInWithPassword()`
- Update `last_login_at` in profiles
- Handle session token storage

### Database

- `profiles.last_login_at` updated on each login
- Session managed by Supabase Auth

### Security

- Rate limiting (5 attempts, then 15 min lockout)
- Generic error messages to prevent enumeration
- httpOnly cookies for session

---

## Dependencies

### Blocked By

- SQ-2 (User Registration) - needs registered users to test

### Blocks

- All authenticated features (dashboard, invoices, etc.)
- SQ-6 (Onboarding) - login redirects new users to onboarding

### Related Stories

- SQ-2: User Registration
- SQ-4: Password Recovery
- SQ-5: Secure Logout

---

## UI/UX Considerations

- Clean login form with email and password fields
- "Remember me" checkbox below password
- "Forgot password?" link
- "Create account" link for new users
- Clear error states without revealing sensitive info
- Loading state during authentication
- Mobile-responsive design

---

## Definition of Done

- [ ] Login form implemented with validation
- [ ] API endpoint working with Supabase Auth
- [ ] Session management working correctly
- [ ] "Remember me" functionality working
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

See: `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/stories/STORY-SQ-3-user-login/test-cases.md` (se crea en Fase 5)

**Test Cases Expected:** 8+ detailed test cases covering:

- Happy path login
- Invalid credentials handling
- Unverified email handling
- Remember me functionality
- Rate limiting behavior
- Session persistence

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/stories/STORY-SQ-3-user-login/implementation-plan.md` (se crea en Fase 6)

**Implementation Steps Expected:**

1. Create Zod validation schema
2. Create LoginForm component
3. Create API route for login
4. Integrate with Supabase Auth
5. Implement session management
6. Add rate limiting middleware
7. Update last_login_at on success
8. Handle redirect logic (dashboard vs onboarding)
9. Write tests

---

## Notes

- Session duration: 1 hour default, 7 days with "remember me"
- Generic error messages are intentional for security
- Consider adding "login with Google" in v2

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/epic.md`
- **PRD:** `.context/PRD/user-journeys.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-003)
- **API Contracts:** `.context/SRS/api-contracts.yaml` (POST /auth/login)
