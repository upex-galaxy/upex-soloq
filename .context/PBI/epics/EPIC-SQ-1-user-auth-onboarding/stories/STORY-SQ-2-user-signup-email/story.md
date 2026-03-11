# User Registration with Email and Password

**Jira Key:** [SQ-2](https://upexgalaxy65.atlassian.net/browse/SQ-2)
**Epic:** [SQ-1](https://upexgalaxy65.atlassian.net/browse/SQ-1) (User Authentication & Onboarding)
**Priority:** Highest
**Story Points:** 13
**Status:** In Test

---

## User Story

## User Story

***As a*** user
***I want to*** register with my email and password
***So that*** I can create my SoloQ account

## 

## Description

Como freelancer que quiere usar SoloQ para facturar, necesito poder crear una cuenta usando mi email y una contraseña segura. El proceso debe ser simple, seguro y enviar un email de verificación para confirmar mi identidad.

## 

## Acceptance Criteria (Gherkin format)

### Scenario 1: Successful registration with valid data

- ***Given:*** I am on the registration page
- ***When:*** I enter a valid email, password (min 8 chars, 1 uppercase, 1 lowercase, 1 number), and matching confirm password
- ***Then:*** My account is created, I see a "Check your email" message, and I receive a verification email

### Scenario 2: Registration fails with existing email

- ***Given:*** I am on the registration page
- ***When:*** I enter an email that is already registered in the system
- ***Then:*** I see an error message "This email is already registered" with a link to login

### Scenario 3: Registration fails with weak password

- ***Given:*** I am on the registration page
- ***When:*** I enter a password that doesn't meet the security requirements
- ***Then:*** I see real-time validation errors indicating what's missing (uppercase, number, length)

### Scenario 4: Registration fails with mismatched passwords

- ***Given:*** I am on the registration page
- ***When:*** I enter a password and a different confirm password
- ***Then:*** I see an error message "Passwords do not match"

### Scenario 5: Registration fails with invalid email format

- ***Given:*** I am on the registration page
- ***When:*** I enter an invalid email format
- ***Then:*** I see an error message "Please enter a valid email address"

## Technical Notes

### Frontend

- Registration form with React Hook Form + Zod validation
- Real-time password strength indicator
- Email format validation (RFC 5321)

### Backend

- API Route: POST /api/auth/register
- Supabase Auth signUp() method
- Create profile record after successful registration

### Database

- auth.users (Supabase managed)
- profiles table: id, user*id, email*verified*at, created*at

### Security

- Password hashing handled by Supabase (bcrypt)
- Rate limiting on registration endpoint

## Definition of Done

- [ ] Registration form implemented with validation
- [ ] API endpoint working with Supabase Auth
- [ ] Verification email sent successfully
- [ ] Error handling for all scenarios
- [ ] Unit tests > 80% coverage
- [ ] E2E test for happy path
- [ ] Code review approved

## Related Documentation

- ***Epic:*** [https://upexgalaxy65.atlassian.net/browse/SQ-1#icft=SQ-1](https://upexgalaxy65.atlassian.net/browse/SQ-1#icft=SQ-1) - User Authentication & Onboarding
- ***FR:*** FR-001 - Registro de Usuario con Email
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

## Traceability

### Bugs (5)

- [SQ-102](https://upexgalaxy65.atlassian.net/browse/SQ-102): UserAuth: Signup: Validaciones solo frontend sin rechazo backend _(Enhancement)_
- [SQ-101](https://upexgalaxy65.atlassian.net/browse/SQ-101): UserAuth: Signup: No hay icono para ver contrasena _(Enhancement)_
- [SQ-100](https://upexgalaxy65.atlassian.net/browse/SQ-100): UserAuth: Signup: Email 254 chars sin feedback _(Enhancement)_
- [SQ-99](https://upexgalaxy65.atlassian.net/browse/SQ-99): UserAuth: Signup: Email invalido no muestra error _(Ready For QA)_
- [SQ-98](https://upexgalaxy65.atlassian.net/browse/SQ-98): UserAuth: Signup: Password debil permite registro _(Ready For QA)_

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
- **Assignee:** Samuel Amonzabel
- **Labels:** authentication, must-have, mvp

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:37.064Z_
