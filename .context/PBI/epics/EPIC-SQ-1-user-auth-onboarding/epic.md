# User Authentication & Onboarding

**Jira Key:** [SQ-1](https://upexgalaxy64.atlassian.net/browse/SQ-1)
**Status:** Backlog
**Priority:** CRITICAL
**Phase:** Foundation (Sprint 1-2)

---

## Epic Description

Sistema de autenticación y configuración inicial del usuario para SoloQ.

**Business Value:**
Esta épica es la base fundamental del sistema. Sin autenticación, los usuarios no pueden acceder a ninguna funcionalidad. El onboarding guiado asegura que los nuevos usuarios configuren correctamente su perfil de negocio, reduciendo fricción y aumentando la tasa de activación.

---

## User Stories

1. **[SQ-2](https://upexgalaxy64.atlassian.net/browse/SQ-2)** - As a user, I want to register with email and password, so that I can create my SoloQ account
2. **[SQ-3](https://upexgalaxy64.atlassian.net/browse/SQ-3)** - As a user, I want to login with my credentials, so that I can access my account
3. **[SQ-4](https://upexgalaxy64.atlassian.net/browse/SQ-4)** - As a user, I want to recover my password via email, so that I don't lose access to my account
4. **[SQ-5](https://upexgalaxy64.atlassian.net/browse/SQ-5)** - As a user, I want to logout securely, so that I can protect my account on shared devices
5. **[SQ-6](https://upexgalaxy64.atlassian.net/browse/SQ-6)** - As a new user, I want to complete a guided onboarding, so that I can configure my business profile

---

## Scope

### In Scope

- Registro de usuarios con email y contraseña
- Verificación de email
- Login/Logout seguro
- Recuperación de contraseña
- Onboarding guiado para nuevos usuarios

### Out of Scope (Future)

- OAuth (Google, GitHub, etc.)
- MFA (Multi-Factor Authentication)
- SSO empresarial
- Login con magic link

---

## Acceptance Criteria (Epic Level)

1. Los usuarios pueden registrarse con email y contraseña válidos
2. Los usuarios reciben email de verificación y pueden verificar su cuenta
3. Los usuarios pueden hacer login con credenciales válidas
4. Los usuarios pueden recuperar su contraseña vía email
5. Los usuarios pueden cerrar sesión de forma segura
6. Los nuevos usuarios son guiados a través de un onboarding para configurar su perfil

---

## Related Functional Requirements

- **FR-001:** Registro de Usuario con Email
- **FR-002:** Verificación de Email
- **FR-003:** Login de Usuario
- **FR-004:** Recuperación de Contraseña
- **FR-005:** Reset de Contraseña
- **FR-006:** Logout

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Authentication Provider

- Supabase Auth (built-in)
- JWT tokens con httpOnly cookies
- Token expiration: Access 1h, Refresh 7d

### Database Schema

**Tables:**

- `auth.users` - Supabase managed (email, password hash, metadata)
- `profiles` - User profile linked to auth.users
  - id (uuid, PK)
  - user_id (uuid, FK to auth.users)
  - email_verified_at (timestamp)
  - last_login_at (timestamp)
  - onboarding_completed (boolean)
  - onboarding_step (integer)
  - created_at (timestamp)
  - updated_at (timestamp)

**IMPORTANTE:** NO hardcodear schema SQL completo. Usar Supabase MCP para schema real.

### Security Requirements

- Password policy: min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Rate limiting en endpoints de auth (5 attempts, 15 min lockout)
- Generic error messages to prevent email enumeration
- httpOnly cookies for session tokens
- All sessions invalidated on password reset

---

## Dependencies

### External Dependencies

- Supabase Auth service
- Email delivery (Supabase built-in or Resend)

### Internal Dependencies

- None (esta es la primera épica)

### Blocks

- EPIC 2: Business Profile Management (requires auth)
- EPIC 3: Client Management (requires auth)
- Todas las demás épicas (requieren autenticación)

---

## Success Metrics

### Functional Metrics

- Registration success rate > 95%
- Login success rate > 99%
- Email delivery rate > 98%
- Password reset completion rate > 90%

### Business Metrics

- Time to registration < 2 minutes
- Onboarding completion rate > 80%
- Day 1 retention (users who create first invoice) > 50%

---

## Risks & Mitigations

| Risk                        | Impact | Probability | Mitigation                                    |
| --------------------------- | ------ | ----------- | --------------------------------------------- |
| Email delivery delays       | Medium | Low         | Use Resend as backup, show clear instructions |
| Users abandoning onboarding | High   | Medium      | Allow skip optional steps, save progress      |
| Password reset abuse        | Medium | Low         | Rate limiting, token expiration 1h            |
| Session hijacking           | High   | Low         | httpOnly cookies, secure flags, short expiry  |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/feature-test-plan.md` (se crea en Fase 5)

### Test Coverage Requirements

- **Unit Tests:** Auth utilities, validation schemas, form components
- **Integration Tests:** API endpoints with Supabase Auth
- **E2E Tests:** Full registration → onboarding → dashboard flow

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/feature-implementation-plan.md` (se crea en Fase 6)

### Recommended Story Order

1. [SQ-2] - User Registration - Foundation
2. [SQ-3] - User Login - Core auth flow
3. [SQ-5] - Secure Logout - Complete auth cycle
4. [SQ-4] - Password Recovery - Error recovery
5. [SQ-6] - Guided Onboarding - Enhanced UX

### Estimated Effort

- **Development:** 2 sprints
- **Testing:** 0.5 sprint
- **Total:** ~2.5 sprints

---

## Notes

- Supabase Auth handles most of the heavy lifting (password hashing, token management)
- Onboarding flow bridges EPIC 1 and EPIC 2 (Business Profile)
- Consider adding OAuth providers in v2 based on user feedback

---

## Related Documentation

- **PRD:** `.context/PRD/executive-summary.md`, `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-001 to FR-006)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`
- **User Journey:** `.context/PRD/user-journeys.md` (Journey 1: Registro y Primera Factura)
