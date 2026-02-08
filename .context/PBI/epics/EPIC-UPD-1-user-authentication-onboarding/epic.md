# EPIC: User Authentication & Onboarding

**Jira Key:** UPD-1
**Status:** To Do
**Priority:** CRITICAL
**Phase:** Phase 1: Foundation (Sprint 1-3)

---

## Epic Description

Esta épica cubre toda la funcionalidad necesaria para que un usuario pueda crear una cuenta, gestionarla de forma segura y realizar la configuración inicial de su perfil. Es la puerta de entrada a la aplicación y fundamental para la adquisición de usuarios.

El flujo incluye el registro estándar con email y contraseña, un proceso de verificación para asegurar la validez del correo, un método para recuperar el acceso si el usuario olvida su contraseña, y la capacidad de cerrar sesión. Además, introduce un asistente de onboarding para guiar a los nuevos usuarios en la configuración de su perfil de negocio, mejorando la experiencia inicial y acelerando el "Time to First Invoice".

**Business Value:**
La autenticación segura y un onboarding fluido son cruciales para generar confianza y reducir la fricción inicial. Un buen proceso de onboarding aumenta la probabilidad de que un usuario complete la configuración y se convierta en un usuario activo, impactando directamente las métricas de activación y retención.

---

## User Stories

1. **UPD-2** - As a user, I want to register with my email and password to create my account in SoloQ
2. **UPD-3** - As a user, I want to log in with my credentials to access my account
3. **UPD-4** - As a user, I want to recover my password by email so I don't lose access to my account
4. **UPD-5** - As a user, I want to log out securely to protect my account on shared devices
5. **UPD-6** - As a new user, I want to complete a guided onboarding to set up my business profile

---

## Scope

### In Scope

- Registro de usuario usando Email y Contraseña.
- Verificación de email.
- Login y Logout.
- Flujo de "olvidé mi contraseña".
- Onboarding guiado para el perfil de negocio básico (nombre, contacto).

### Out of Scope (Future)

- Registro/Login con proveedores OAuth (Google, GitHub, etc.).
- Autenticación de dos factores (2FA/MFA).
- Gestión de múltiples perfiles de negocio bajo una misma cuenta.

---

## Acceptance Criteria (Epic Level)

1. ✅ Un usuario nuevo puede registrarse, verificar su email, iniciar sesión y configurar su perfil de negocio sin salir del flujo.
2. ✅ Los datos de los usuarios están aislados; un usuario no puede ver ni modificar datos de otro.
3. ✅ El sistema previene el registro con emails duplicados.
4. ✅ Las contraseñas se almacenan de forma segura (hashed) y nunca en texto plano.
5. ✅ El proceso de recuperación de contraseña es seguro y solo permite el cambio al propietario del email.

---

## Related Functional Requirements

- **FR-001:** Registro de Usuario con Email
- **FR-002:** Verificación de Email
- **FR-003:** Login de Usuario
- **FR-004:** Recuperación de Contraseña
- **FR-005:** Reset de Contraseña
- **FR-006:** Logout
- **FR-007:** Crear/Actualizar Perfil de Negocio (parcialmente, para onboarding)

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Backend

- Se utilizará Supabase Auth para toda la gestión de usuarios y autenticación.
- Las API Routes de Next.js (`/api/auth/*`) orquestarán la lógica de negocio con Supabase.
- Se creará un registro en la tabla `profiles` pública después de la confirmación del usuario en `auth.users`.

### Database Schema

**Tables:**

- `auth.users`: Manejada por Supabase (id, email, encrypted_password).
- `public.profiles`: (user_id, email_verified_at, last_login_at).
- `public.business_profiles`: Se creará una entrada inicial durante el onboarding.

### Security Requirements

- Todas las contraseñas deben ser hasheadas con `bcrypt` (manejado por Supabase).
- Los tokens de sesión (JWT) deben ser manejados de forma segura (httpOnly cookies).
- Se deben implementar políticas de RLS para las tablas `profiles` y `business_profiles` desde el inicio.

---

## Dependencies

### External Dependencies

- **Supabase Auth:** Para la gestión de identidad.
- **Supabase PostgreSQL:** Para el almacenamiento de perfiles.
- **Resend:** (Utilizado por Supabase Auth) para el envío de emails de verificación y recuperación.

### Internal Dependencies

- Ninguna, esta es una de las épicas fundacionales.

### Blocks

- Casi todas las demás épicas están bloqueadas por esta, ya que requieren un usuario autenticado.

---

## Success Metrics

### Functional Metrics

- Tasa de éxito de registro > 98%.
- Tasa de entrega de email de verificación > 99%.
- Tiempo de respuesta de la API de login/registro < 500ms (p95).

### Business Metrics

- Time to First Invoice < 10 min.
- Tasa de completitud del onboarding > 80%.
- MAU (Monthly Active Users).

---

## Risks & Mitigations

| Risk                            | Impact | Probability | Mitigation                                                                                                                              |
| ------------------------------- | ------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Emails de Supabase caen en SPAM | High   | Medium      | Configurar un dominio de email personalizado en Supabase (ej. `auth.soloq.app`) y asegurar registros SPF/DKIM correctos.                |
| Vulnerabilidad en RLS           | High   | Low         | Realizar revisiones de políticas RLS y tests de autorización específicos para asegurar que un usuario no pueda acceder a datos de otro. |
| Flujo de onboarding confuso     | Medium | Medium      | Realizar pruebas de usabilidad con 3-5 usuarios beta para refinar el flujo antes del lanzamiento.                                       |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-UPD-1-user-authentication-onboarding/feature-test-plan.md` (se crea en Fase 5)

### Test Coverage Requirements

- **Unit Tests:** Lógica de validación (Zod), componentes de UI del formulario.
- **Integration Tests:** API endpoints (`/api/auth/register`, `/api/auth/login`) interactuando con una base de datos de prueba de Supabase.
- **E2E Tests:** Flujo completo de registro, login, y onboarding usando Playwright.

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-UPD-1-user-authentication-onboarding/feature-implementation-plan.md` (se crea en Fase 6)

### Recommended Story Order

1. **UPD-2:** User Registration (Core)
2. **UPD-3:** User Login (Core)
3. **UPD-5:** Secure Logout
4. **UPD-4:** Password Recovery
5. **UPD-6:** Onboarding Wizard (Can be developed in parallel with recovery)

### Estimated Effort

- **Development:** 1.5 Sprints
- **Testing:** 0.5 Sprints
- **Total:** 2 Sprints

---

## Notes

- Es crítico definir la política de contraseñas y validarla tanto en el frontend (para UX) como en el backend (para seguridad).
- El token de verificación de email tendrá una vida útil de 24 horas. El de reseteo de contraseña, 1 hora.
- Se utilizará el `middleware.ts` de Next.js para proteger las rutas de la aplicación.
