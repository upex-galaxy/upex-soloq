# EPIC: User Authentication & Onboarding

**Jira Key:** [SQ-1](https://upexgalaxy65.atlassian.net/browse/SQ-1)
**Priority:** Highest
**Status:** Backlog
**Total Story Points:** 24

---

## Description

## Epic Description

Sistema de autenticación y configuración inicial del usuario para SoloQ.

***Business Value:***
Esta épica es la base fundamental del sistema. Sin autenticación, los usuarios no pueden acceder a ninguna funcionalidad. El onboarding guiado asegura que los nuevos usuarios configuren correctamente su perfil de negocio, reduciendo fricción y aumentando la tasa de activación.

## 

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

## Related Functional Requirements

- ***FR-001:*** Registro de Usuario con Email
- ***FR-002:*** Verificación de Email
- ***FR-003:*** Login de Usuario
- ***FR-004:*** Recuperación de Contraseña
- ***FR-005:*** Reset de Contraseña
- ***FR-006:*** Logout

See: `.context/SRS/functional-specs.md`

## 

## Acceptance Criteria (Epic Level)

1. Los usuarios pueden registrarse con email y contraseña válidos
2. Los usuarios reciben email de verificación y pueden verificar su cuenta
3. Los usuarios pueden hacer login con credenciales válidas
4. Los usuarios pueden recuperar su contraseña vía email
5. Los usuarios pueden cerrar sesión de forma segura
6. Los nuevos usuarios son guiados a través de un onboarding para configurar su perfil

## Technical Considerations

### Authentication Provider

- Supabase Auth (built-in)
- JWT tokens con httpOnly cookies
- Token expiration: Access 1h, Refresh 7d

### Database

- Tabla `profiles` vinculada a `auth.users`
- RLS policies para aislamiento de datos

### Security

- Password policy: min 8 chars, uppercase, lowercase, number
- Rate limiting en endpoints de auth
- Secure session management

## Dependencies

### External Dependencies

- Supabase Auth service
- Email delivery (Supabase built-in o Resend)

### Internal Dependencies

- None (esta es la primera épica)

### Blocks

- EPIC 2: Business Profile Management
- EPIC 3: Client Management
- Todas las demás épicas (requieren autenticación)

---

## User Stories

| Key | Story | Points | Priority | Status |
| --- | ----- | ------ | -------- | ------ |
| [SQ-2](https://upexgalaxy65.atlassian.net/browse/SQ-2) | User Registration with Email and Password | 13 | Highest | In Test |
| [SQ-3](https://upexgalaxy65.atlassian.net/browse/SQ-3) | User Login with Credentials | 5 | Highest | QA Approved |
| [SQ-4](https://upexgalaxy65.atlassian.net/browse/SQ-4) | Password Recovery via Email | 5 | High | In Test |
| [SQ-5](https://upexgalaxy65.atlassian.net/browse/SQ-5) | Secure Logout | 1 | High | Shift-Left QA |

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 1/27/2026
- **Reporter:** Ely
- **Assignee:** Unassigned
- **Labels:** authentication, fase-1, foundation, mvp

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:37.063Z_
