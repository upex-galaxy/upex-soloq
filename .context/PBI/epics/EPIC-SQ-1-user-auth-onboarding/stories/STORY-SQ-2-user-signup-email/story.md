# User Registration with Email and Password

**Jira Key:** [SQ-2](https://upexgalaxy64.atlassian.net/browse/SQ-2)
**Epic:** [SQ-1](https://upexgalaxy64.atlassian.net/browse/SQ-1) (User Authentication & Onboarding)
**Priority:** Highest
**Story Points:** 5
**Status:** Backlog
**Assignee:** Unassigned

---

## User Story

**As a** user
**I want to** register with my email and password
**So that** I can create my SoloQ account

---

## Description

Como freelancer que quiere usar SoloQ para facturar, necesito poder crear una cuenta usando mi email y una contraseña segura. El proceso debe ser simple, seguro y enviar un email de verificación para confirmar mi identidad.

El registro es el primer punto de contacto del usuario con SoloQ. Una experiencia fluida aquí aumenta la tasa de conversión y reduce el abandono. La verificación de email asegura que el usuario tiene acceso al email proporcionado.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Successful registration with valid data

- **Given:** I am on the registration page
- **When:** I enter a valid email, password (min 8 chars, 1 uppercase, 1 lowercase, 1 number), and matching confirm password
- **Then:** My account is created, I see a "Check your email" message, and I receive a verification email

### Scenario 2: Registration fails with existing email

- **Given:** I am on the registration page
- **When:** I enter an email that is already registered in the system
- **Then:** I see an error message "This email is already registered" with a link to login

### Scenario 3: Registration fails with weak password

- **Given:** I am on the registration page
- **When:** I enter a password that doesn't meet the security requirements
- **Then:** I see real-time validation errors indicating what's missing (uppercase, number, length)

### Scenario 4: Registration fails with mismatched passwords

- **Given:** I am on the registration page
- **When:** I enter a password and a different confirm password
- **Then:** I see an error message "Passwords do not match"

### Scenario 5: Registration fails with invalid email format

- **Given:** I am on the registration page
- **When:** I enter an invalid email format
- **Then:** I see an error message "Please enter a valid email address"

---

## Technical Notes

### Frontend

- Registration form with React Hook Form + Zod validation
- Real-time password strength indicator
- Email format validation (RFC 5321)
- Components: `RegisterForm`, `PasswordStrengthMeter`
- Route: `/auth/register`

### Backend

- API Route: `POST /api/auth/register`
- Supabase Auth `signUp()` method
- Create profile record after successful registration
- Validation schema shared with frontend (Zod)

### Database

- `auth.users` (Supabase managed)
- `profiles` table: id, user_id, email_verified_at, created_at

### External Services

- Supabase Auth for user creation
- Email delivery via Supabase or Resend

---

## Dependencies

### Blocked By

- None (first story to implement)

### Blocks

- SQ-3 (User Login) - needs registered users
- SQ-4 (Password Recovery) - needs registered users
- SQ-6 (Onboarding) - triggered after email verification

### Related Stories

- SQ-3: User Login with Credentials
- SQ-6: Guided Onboarding for New Users

---

## UI/UX Considerations

- Clean, minimal registration form
- Password requirements shown before typing
- Real-time validation feedback
- Clear CTA button "Create Account"
- Link to login page for existing users
- Success state with email illustration and instructions
- Mobile-responsive design

---

## Definition of Done

- [ ] Registration form implemented with validation
- [ ] API endpoint working with Supabase Auth
- [ ] Verification email sent successfully
- [ ] Profile record created in database
- [ ] Error handling for all scenarios
- [ ] Unit tests > 80% coverage
- [ ] Integration tests for API
- [ ] E2E test for happy path
- [ ] Code review approved (2 reviewers)
- [ ] Deployed to staging
- [ ] QA testing passed

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/stories/STORY-SQ-2-user-signup-email/test-cases.md` (se crea en Fase 5)

**Test Cases Expected:** 8+ detailed test cases covering:

- Happy path registration
- Email validation errors
- Password validation errors
- Duplicate email handling
- Network error handling
- Rate limiting behavior

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/stories/STORY-SQ-2-user-signup-email/implementation-plan.md` (se crea en Fase 6)

**Implementation Steps Expected:**

1. Create Zod validation schema
2. Create RegisterForm component
3. Create password strength indicator
4. Create API route for registration
5. Integrate with Supabase Auth
6. Create profile record trigger
7. Style with Tailwind + shadcn/ui
8. Write tests

---

## Notes

- Consider adding Google OAuth in v2
- Password strength meter improves security perception
- Verification email should be clear about next steps

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/epic.md`
- **PRD:** `.context/PRD/user-journeys.md` (Journey 1, Step 1-3)
- **SRS:** `.context/SRS/functional-specs.md` (FR-001, FR-002)
- **API Contracts:** `.context/SRS/api-contracts.yaml` (POST /auth/register)
