# User Login with Credentials

**Jira Key:** [SQ-3](https://upexgalaxy65.atlassian.net/browse/SQ-3)
**Epic:** [SQ-1](https://upexgalaxy65.atlassian.net/browse/SQ-1) (User Authentication & Onboarding)
**Priority:** Highest
**Story Points:** 5
**Status:** QA Approved

---

## User Story

## User Story

**As a** user
**I want to** login with my credentials
**So that** I can access my account

## 

## Description

Como usuario registrado de SoloQ, necesito poder iniciar sesión con mi email y contraseña para acceder a mi dashboard y gestionar mis facturas. El proceso debe ser seguro y mantener mi sesión activa de forma segura.

## 

## Acceptance Criteria (Gherkin format)

### Scenario 1: Successful login with valid credentials

- ***Given:*** I am a registered user with a verified email
- ***When:*** I enter my correct email and password on the login page
- ***Then:*** I am redirected to the dashboard, my session is active, and I see a welcome message

### Scenario 2: Login fails with incorrect password

- ***Given:*** I am on the login page
- ***When:*** I enter a valid email but incorrect password
- ***Then:*** I see an error message "Invalid credentials" (generic for security)

### Scenario 3: Login fails with unverified email

- ***Given:*** I am a registered user but haven't verified my email
- ***When:*** I try to login with correct credentials
- ***Then:*** I see a message "Please verify your email first" with option to resend verification

### Scenario 4: Login fails with non-existent email

- ***Given:*** I am on the login page
- ***When:*** I enter an email that is not registered
- ***Then:*** I see the same generic error "Invalid credentials" (to prevent email enumeration)

### Scenario 5: Login with "Remember me" option

- ***Given:*** I am on the login page
- ***When:*** I login successfully with "Remember me" checked
- ***Then:*** My session persists for 7 days instead of 1 hour

## 

## Technical Notes

### Frontend

- Login form with React Hook Form + Zod
- "Remember me" checkbox
- Link to forgot password
- Link to register

### Backend

- API Route: POST /api/auth/login
- Supabase Auth signInWithPassword()
- Update last*login*at in profiles

### Database

- profiles.last*login*at updated on each login

### Security

- Rate limiting (5 attempts, then 15 min lockout)
- Generic error messages to prevent enumeration
- httpOnly cookies for session

## 

## Definition of Done

- [ ] Login form implemented with validation
- [ ] API endpoint working with Supabase Auth
- [ ] Session management working correctly
- [ ] "Remember me" functionality working
- [ ] Error handling for all scenarios
- [ ] Unit tests > 80% coverage
- [ ] E2E test for happy path
- [ ] Code review approved

## 

## Related Documentation

- ***Epic:*** [https://upexgalaxy65.atlassian.net/browse/SQ-1#icft=SQ-1](https://upexgalaxy65.atlassian.net/browse/SQ-1#icft=SQ-1) - User Authentication & Onboarding
- ***FR:*** FR-003 - Login de Usuario
- ***SRS:*** `.context/SRS/functional-specs.md`

## 🧪 QA Refinements (Shift-Left Analysis)

**Analysis Date:** 2026-01-28
**Status:** Refined by QA

### Refined Acceptance Criteria

#### Scenario 1: Successful login with verified credentials

- ***Given:*** User exists (email `valentina.login@soloq.test`), `email*verified*at` set, `onboarding_completed = true`
- ***When:*** User submits correct email/password on `/auth/login`
- ***Then:*** Redirect to `/dashboard`, welcome message displayed (copy TBD), session cookie httpOnly, API 200, `profiles.last*login*at` updated

#### Scenario 2: Invalid credentials (wrong password or non-existent email)

- ***Given:*** User on login page
- ***When:*** Submit invalid credentials
- ***Then:*** Generic error "Invalid credentials", API 401 `INVALID_CREDENTIALS`, no session

#### Scenario 3: Unverified email

- ***Given:*** `email*verified*at` is null
- ***When:*** Submit correct credentials
- ***Then:*** Message "Please verify your email first" with resend action, API 403 `EMAIL*NOT*VERIFIED`, no session

#### Scenario 4: Remember me extends session

- ***Given:*** Verified user
- ***When:*** Login with remember me checked
- ***Then:*** Session persists 7 days (refresh token/cookie Max-Age = 7d), access token 1h

#### Scenario 5: Rate limiting after 5 failed attempts

- ***Given:*** 5 failed attempts within 15 min
- ***When:*** Attempt login again (even with correct creds)
- ***Then:*** API 429/423 `TOO*MANY*ATTEMPTS`, lockout message, no session

#### Scenario 6: Login form validation errors

- ***Given:*** User on login page
- ***When:*** Email invalid/empty or password empty
- ***Then:*** Field errors, API 400 `VALIDATION_ERROR` if submitted

#### Scenario 7: Onboarding incomplete redirect

- ***Given:*** `onboarding_completed = false`
- ***When:*** Login with valid credentials
- ***Then:*** Redirect to `/onboarding` (needs PO/Dev confirmation)

### Edge Cases Identified

- Email input with spaces/uppercase should be normalized (trim + case-insensitive).
- Lockout should block login even with correct credentials.
- Unverified email + wrong password should return generic error (needs confirmation).

### Clarified Business Rules

- Generic error for invalid credentials to prevent enumeration.
- Unverified email shows a verify message and allows resend (confirm exact copy and endpoint).
- Remember me extends session to 7 days via refresh token/cookie Max-Age.
- Rate limit: 5 attempts, 15 min lockout; confirm status code/message.
- Redirect to onboarding if onboarding not completed (confirm rule).

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

## References

- [External Link](https://staging-upexsoloq.vercel.app/login)

---

## Traceability

### Tests (3)

- [SQ-106](https://upexgalaxy65.atlassian.net/browse/SQ-106): SQ-3: TC1: Validar login exitoso con credenciales válidas _(Candidate)_
- [SQ-107](https://upexgalaxy65.atlassian.net/browse/SQ-107): SQ-3: TC2: Validar error genérico de credenciales inválidas cuando password o email no coinciden _(Candidate)_
- [SQ-108](https://upexgalaxy65.atlassian.net/browse/SQ-108): SQ-3: TC3: Validar disponibilidad de cerrar sesión después de recargar dashboard con sesión activa _(Candidate)_

### Defects (2)

- [SQ-74](https://upexgalaxy65.atlassian.net/browse/SQ-74): UAO | The user cannot log out after refreshing the page several times. _(Ready For QA)_
- [SQ-81](https://upexgalaxy65.atlassian.net/browse/SQ-81): CM | SQ-3 login presenta inconsistencias DB/UI: last_login_at no actualiza, business_profiles ausente (406) y gap onboarding _(Ready For QA)_

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 3/1/2026
- **Reporter:** Ely
- **Assignee:** Joel Armando Ramírez Rodríguez
- **Labels:** authentication, must-have, mvp, shift-left-reviewed

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:37.482Z_
