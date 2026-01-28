## 📋 Feature Test Plan - Generated 2026-01-27

**QA Lead:** AI-Generated
**Status:** Draft - Pending Team Review

---

# Feature Test Plan: EPIC-SQ-1 - User Authentication & Onboarding

**Fecha:** 2026-01-27
**QA Lead:** AI-Generated
**Epic Jira Key:** SQ-1
**Status:** Draft

---

## 📋 Business Context Analysis

### Business Value

Esta épica habilita el acceso a toda la plataforma SoloQ. Sin autenticacion no hay usuarios activos, facturas ni cobros. El onboarding guiado reduce friccion inicial y acelera la activacion, impactando directamente los KPIs de registro, tiempo a primera factura y retencion temprana.

**Key Value Proposition:**

- Registro y acceso rapido para empezar a facturar en minutos.
- Onboarding guiado que reduce abandono y prepara datos clave del negocio.

**Success Metrics (KPIs):**

- Usuarios registrados (target 1,000).
- Time to First Invoice < 10 min.
- Onboarding completion rate > 80%.
- Retention D7 > 40%.

**User Impact:**

- Carlos (Disenador organizado): necesita registro simple y onboarding rapido para crear su primera factura.
- Valentina (Desarrolladora internacional): requiere login confiable y seguridad para acceso recurrente.
- Andres (Consultor tradicional): necesita simplicidad y confianza en el acceso a su cuenta.

**Critical User Journeys:**

- Journey 1: Registro y primera factura (pasos 1-7).
- Journey 1 (subflujo): Verificacion de email y redireccion a onboarding.

---

## 🏗️ Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**

- Componentes a crear/modificar: RegisterForm, LoginForm, ForgotPasswordForm, ResetPasswordForm, OnboardingFlow, ProgressIndicator, UserMenu/Logout.
- Paginas/rutas afectadas: /auth/register, /auth/login, /auth/forgot-password, /auth/reset-password, /onboarding, /dashboard.

**Backend:**

- APIs a crear/modificar:
  - POST /auth/register
  - POST /auth/login
  - POST /auth/logout
  - POST /auth/forgot-password
  - POST /auth/reset-password
  - GET/PUT /profile/business
  - POST /profile/logo
  - GET/PUT /profile/payment-methods
- Servicios de negocio afectados: autenticacion, perfil de negocio, metodos de pago.

**Database:**

- Tablas involucradas: auth.users (Supabase), profiles, business_profiles, payment_methods.
- Queries criticos: creacion de profile tras registro, actualizacion de email_verified_at, onboarding_step/onboarding_completed, upsert de business_profiles.

**External Services:**

- Supabase Auth (signup, login, token validation).
- Email delivery (Supabase built-in o Resend).
- Supabase Storage (logo opcional del onboarding).

### Integration Points (Critical for Testing)

**Internal Integration Points:**

- Frontend ↔ Backend API (auth y onboarding).
- Backend ↔ Supabase Auth (signUp, signIn, signOut, reset).
- Backend ↔ Database (profiles, business_profiles, payment_methods).

**External Integration Points:**

- Backend ↔ Email provider (verification y reset).
- Backend ↔ Supabase Storage (logo upload).

**Data Flow:**

```
Usuario → Frontend → API Routes → Supabase Auth → Database (profiles)
                             ↘ Email Provider (verification/reset)
```

---

## 🚨 Risk Analysis

### Technical Risks

#### Risk 1: Fallas en verificacion de email o delays de entrega

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Integration
- **Mitigation Strategy:**
  - Validar envio, latencia y mensajes de reintento
  - Testing de escenarios de reenvio y expiracion
- **Test Coverage Required:** E2E + API + pruebas de resend/timeout

#### Risk 2: Manejo incorrecto de sesiones (remember me, httpOnly, logout)

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Backend/Frontend
- **Mitigation Strategy:**
  - Verificar expiracion y persistencia de sesion
  - Validar limpieza de tokens y acceso post-logout
- **Test Coverage Required:** Integration + E2E + security checks

#### Risk 3: Persistencia incorrecta del onboarding (resume/step)

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Database/Integration
- **Mitigation Strategy:**
  - Verificar guardado por paso y reanudacion
  - Validar reglas de requeridos vs opcionales
- **Test Coverage Required:** E2E + Integration + DB validation

---

### Business Risks

#### Risk 1: Abandono en onboarding por friccion

- **Impact on Business:** Reduce activacion y time to first invoice
- **Impact on Users:** Carlos y Andres abandonan si el flujo es largo
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - Validar pasos requeridos, tiempos y mensajes de ayuda
  - Probar skip en pasos opcionales
- **Acceptance Criteria Validation:** AC de onboarding cubre skip y progreso

#### Risk 2: Percepcion de inseguridad o errores de login

- **Impact on Business:** Menor conversion y confianza
- **Impact on Users:** Valentina no confia en la plataforma
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - Mensajes de error genericos y claros
  - Validar rate limiting y bloqueos

---

### Integration Risks

#### Integration Risk 1: Inconsistencias entre Auth y profiles

- **Integration Point:** Supabase Auth ↔ Database
- **What Could Go Wrong:** usuario creado sin profile, email verificado no se refleja
- **Impact:** High
- **Mitigation:**
  - Integration tests de creacion y actualizacion de profile
  - Validacion de callbacks y triggers

---

## ⚠️ Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1:** Flujo de reenvio de verificacion no esta definido

- **Found in:** STORY-SQ-3
- **Question for PO:** Se permite reenvio desde login? que limites/feedback?
- **Impact if not clarified:** usuarios bloqueados sin saber como verificar

**Ambiguity 2:** Duracion exacta de sesion con "Remember me"

- **Found in:** STORY-SQ-3
- **Question for Dev:** como se configura con Supabase (refresh token?)
- **Impact if not clarified:** inconsistencias de sesion y bugs de seguridad

**Ambiguity 3:** Reglas de acceso cuando onboarding esta incompleto

- **Found in:** STORY-SQ-6
- **Question for PO/Dev:** se bloquea dashboard completo o parcialmente?
- **Impact if not clarified:** flujos de usuario ambiguos y gaps en tests

---

### Missing Information

**Missing 1:** Limites exactos de campos en onboarding (business_name, phone, address)

- **Needed for:** boundary testing y validaciones
- **Suggestion:** documentar max/min y mensajes de error

**Missing 2:** Politica de reintentos y rate limiting en forgot password

- **Needed for:** pruebas negativas y seguridad
- **Suggestion:** especificar limites por email/IP

---

### Suggested Improvements (Before Implementation)

**Improvement 1:** Definir claramente reenvio de verificacion y expiracion

- **Story Affected:** STORY-SQ-2 / STORY-SQ-3
- **Current State:** solo se menciona verificacion inicial
- **Suggested Change:** agregar AC para reenvio y mensaje de expiracion
- **Benefit:** reduce tickets de soporte y abandono

**Improvement 2:** Definir criterios de acceso si onboarding incompleto

- **Story Affected:** STORY-SQ-6
- **Current State:** solo menciona redireccion al onboarding
- **Suggested Change:** especificar rutas permitidas y bloqueo
- **Benefit:** evita ambiguedad en UX y seguridad

---

## 🎯 Test Strategy

### Test Scope

**In Scope:**

- Functional testing (UI, API, Database)
- Integration testing (Auth, email, storage)
- Non-functional testing (Performance y Security segun NFRs)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness (iOS Safari, Android Chrome)
- API contract validation (OpenAPI)

**Out of Scope (For This Epic):**

- OAuth / MFA / SSO
- Penetration testing externo
- Cargas extremas (solo NFR basicos)

---

### Test Levels

#### Unit Testing

- **Coverage Goal:** > 80%
- **Focus Areas:** validaciones Zod, utilidades de auth, componentes de formularios
- **Responsibility:** Dev team

#### Integration Testing

- **Coverage Goal:** todos los integration points
- **Focus Areas:** Auth ↔ DB, Auth ↔ Email, onboarding ↔ profile APIs
- **Responsibility:** QA + Dev

#### End-to-End (E2E) Testing

- **Coverage Goal:** journeys criticos completos
- **Tool:** Playwright
- **Focus Areas:** registro → verificacion → onboarding → dashboard, reset password
- **Responsibility:** QA team

#### API Testing

- **Coverage Goal:** 100% endpoints de auth/onboarding en OpenAPI
- **Tool:** Postman/Newman o Playwright API
- **Focus Areas:** validaciones, status codes, errores genericos, auth
- **Responsibility:** QA team

---

### Test Types per Story

**Positive Test Cases:**

- Happy path por story
- Variaciones validas de datos

**Negative Test Cases:**

- Datos invalidos
- Campos requeridos vacios
- Acceso no autorizado
- Enumeracion de email prevenible

**Boundary Test Cases:**

- Min/max de campos
- Valores vacios/null
- Caracteres especiales y unicode

**Exploratory Testing:**

- Email delivery y latencia (risk alto)
- Sesiones multi-tab y logout
- Resume de onboarding con refresh y cierre de navegador

---

## 📊 Test Cases Summary by Story

### STORY-SQ-2: User Registration with Email and Password

**Complexity:** Medium
**Estimated Test Cases:** 13

- Positive: 2
- Negative: 4
- Boundary: 2
- Integration: 2
- API: 3

**Rationale for estimate:** validaciones de email/password + verificacion + perfiles.

**Parametrized Tests Recommended:** Yes (email/password combinations)

---

### STORY-SQ-3: User Login with Credentials

**Complexity:** Medium
**Estimated Test Cases:** 13

- Positive: 2
- Negative: 4
- Boundary: 2
- Integration: 2
- API: 3

**Rationale for estimate:** login, remember me, error generico, rate limit.

**Parametrized Tests Recommended:** Yes (credenciales invalidas)

---

### STORY-SQ-4: Password Recovery via Email

**Complexity:** Medium
**Estimated Test Cases:** 14

- Positive: 2
- Negative: 4
- Boundary: 2
- Integration: 2
- API: 4

**Rationale for estimate:** flujo doble (forgot + reset) y tokens.

**Parametrized Tests Recommended:** Yes (password policy)

---

### STORY-SQ-5: Secure Logout

**Complexity:** Low
**Estimated Test Cases:** 9

- Positive: 2
- Negative: 2
- Boundary: 1
- Integration: 2
- API: 2

**Rationale for estimate:** validacion de limpieza y rutas protegidas.

**Parametrized Tests Recommended:** No

---

### STORY-SQ-6: Guided Onboarding for New Users

**Complexity:** High
**Estimated Test Cases:** 18

- Positive: 3
- Negative: 4
- Boundary: 3
- Integration: 4
- API: 4

**Rationale for estimate:** multi-step, skip, resume, varias integraciones.

**Parametrized Tests Recommended:** Yes (variaciones de datos de negocio)

---

### Total Estimated Test Cases for Epic

**Total:** 67
**Breakdown:**

- Positive: 11
- Negative: 18
- Boundary: 10
- Integration: 12
- API: 16

---

## 🗂️ Test Data Requirements

### Test Data Strategy

**Valid Data Sets:**

- Usuarios: email valido, password fuerte (ej: Valentina, Carlos, Andres)
- Perfil negocio: business_name valido, contact_email valido, phone opcional
- Metodos de pago: bank_transfer (CLABE/CBU), PayPal link

**Invalid Data Sets:**

- Emails invalidos (sin @, dominios invalidos)
- Passwords debiles (sin mayusculas, sin numeros)
- Tokens expirados o invalidos
- Input malicioso: XSS/SQL injection basico

**Boundary Data Sets:**

- Min/max longitudes (email 254, password 8-128)
- Campos vacios/null
- Caracteres especiales y unicode

**Test Data Management:**

- ✅ Use Faker.js for generating realistic test data
- ✅ Create data factories for common entities
- ❌ No hardcodear datos estaticos en tests
- ✅ Clean up test data after test execution

---

### Test Environments

**Staging Environment:**

- URL: https://staging.soloq.app
- Database: soloq-staging
- External Services: Supabase Auth + Resend (staging)
- **Purpose:** entorno principal de QA

**Production Environment:**

- URL: https://soloq.app
- **Purpose:** solo smoke tests post-deploy
- **Restrictions:** no tests destructivos

---

## ✅ Entry/Exit Criteria

### Entry Criteria (Per Story)

Testing can start when:

- [ ] Story implementada y desplegada a staging
- [ ] Code review aprobado por 2+ reviewers
- [ ] Unit tests pasando (>80% coverage)
- [ ] Dev smoke testing completado
- [ ] Test data disponible en staging
- [ ] API docs actualizadas

### Exit Criteria (Per Story)

Story is considered Done from QA perspective when:

- [ ] Todos los test cases ejecutados
- [ ] Casos criticos/high 100% passing
- [ ] Casos medium/low >=95% passing
- [ ] Bugs criticos y altos resueltos
- [ ] Regression (si aplica) pasada
- [ ] NFRs validados

### Epic Exit Criteria

- [ ] Todas las stories cumplen exit criteria
- [ ] Integrations completas entre auth/onboarding
- [ ] E2E de journeys criticos completos
- [ ] API contract testing completado
- [ ] NFRs validados (performance, security, accessibility)
- [ ] Sin bugs criticos o high abiertos

---

## 📝 Non-Functional Requirements Validation

### Performance Requirements

**NFR-P-Auth:** Response time p95 < 500ms para endpoints de auth

- **Target:** < 500ms (p95)
- **Test Approach:** pruebas de API con medicion de tiempos
- **Tools:** Postman/Newman, logs

### Security Requirements

**NFR-S-Auth:** Password policy y rate limiting

- **Requirement:** password min 8, 1 mayuscula, 1 minuscula, 1 numero; 5 intentos
- **Test Approach:** pruebas negativas y bloqueo temporal
- **Tools:** UI + API

### Usability Requirements

**NFR-U-A11y:** WCAG 2.1 AA en formularios

- **Requirement:** labels, errores accesibles, focus visible
- **Test Approach:** lighthouse + checks manuales

---

## 🔄 Regression Testing Strategy

**Regression Scope:**

- [ ] Acceso a dashboard y rutas protegidas
- [ ] Perfil de negocio y metodos de pago
- [ ] Navegacion general y estados vacios

**Regression Test Execution:**

- Ejecutar suite automatizada antes de iniciar
- Re-ejecutar al completar todas las stories

---

## 📅 Testing Timeline Estimate

**Estimated Duration:** 1 sprint (2 semanas)

**Breakdown:**

- Test case design: 3 dias
- Test data preparation: 1 dia
- Test execution: 1 dia por story
- Regression testing: 2 dias
- Bug fixing buffer: 3 dias
- Exploratory testing: 2 sesiones

**Dependencies:**

- Depends on: Ninguna (epica fundacional)
- Blocks: EPIC 2, EPIC 3 y demas epicas

---

## 🛠️ Tools & Infrastructure

**Testing Tools:**

- E2E: Playwright
- API: Postman/Newman o Playwright API
- Unit: Vitest (frontend), Jest (backend)
- Performance: Lighthouse
- Security: OWASP ZAP (si aplica)
- Test Data: Faker.js

**CI/CD Integration:**

- [ ] Tests on PR creation
- [ ] Tests on merge to staging
- [ ] Tests on deploy to staging
- [ ] Smoke tests on production deploy

**Test Management:**

- Jira (Xray si aplica)
- Bug tracking en Jira

---

## 📊 Metrics & Reporting

**Test Metrics to Track:**

- Test cases executed vs total
- Pass rate
- Bug detection rate
- Bug fix rate
- Coverage (unit/integration)
- Time to test per story

**Reporting Cadence:**

- Daily: estado de ejecucion
- Per Story: reporte de cierre
- Per Epic: QA sign-off

---

## 🎓 Notes & Assumptions

**Assumptions:**

- Acceso a staging y email delivery configurado
- Supabase Auth con email verification activo
- Onboarding usa endpoints de perfil (EPIC 2)

**Constraints:**

- Dependencia de proveedores externos para emails
- Staging comparte recursos con otras pruebas

**Known Limitations:**

- Validacion completa de deliverability depende de proveedor

**Exploratory Testing Sessions:**

- Recommended: 2 sesiones
  - Session 1: Flujo registro-verificacion-onboarding con mock data
  - Session 2: Resets, rate limit y multi-tab logout

---

## 📎 Related Documentation

- **Epic:** .context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/epic.md
- **Stories:** .context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/stories/STORY-\*/story.md
- **Business Model:** .context/idea/business-model.md
- **PRD:** .context/PRD/
- **SRS:** .context/SRS/
- **Architecture:** .context/SRS/architecture-specs.md
- **API Contracts:** .context/SRS/api-contracts.yaml

---

## 📢 Action Required

**@PO:**

- [ ] Revisar ambiguedades y missing info (Critical Analysis)
- [ ] Responder preguntas criticas
- [ ] Validar impacto de negocio y KPIs

**@Dev:**

- [ ] Validar integration points
- [ ] Confirmar implementacion de sesiones y rate limiting
- [ ] Responder preguntas tecnicas

**@QA:**

- [ ] Revisar estrategia y estimaciones
- [ ] Validar data requirements y ambientes
- [ ] Preparar test cases por story

---

**Next Steps:**

1. Refinamiento de preguntas criticas
2. PO/Dev responden y ajustan stories
3. QA inicia test cases por story
4. Validar entry/exit criteria antes de sprint

---

**Documentation:** Full test plan available at:
.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/feature-test-plan.md
