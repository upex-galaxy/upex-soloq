# Comments for SQ-3

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-3)

---

### Joel Armando Ramírez Rodríguez - 1/28/2026, 5:20:34 PM

## 🧪 Shift-Left Test Cases - Generado 2026-01-28

**QA Engineer:** AI-Generated
**Status:** Draft - Pendiente de revision PO/Dev

## 

# Casos de Prueba: STORY-SQ-3 - User Login with Credentials

**Fecha:** 2026-01-28
**QA Engineer:** AI-Generated
**Story Jira Key:** [https://upexgalaxy65.atlassian.net/browse/SQ-3#icft=SQ-3](https://upexgalaxy65.atlassian.net/browse/SQ-3#icft=SQ-3)
**Epic:** EPIC-SQ-1 - User Authentication & Onboarding
**Status:** Draft

## 

## 📋 Paso 1: Analisis Critico

### Contexto de Negocio de la Story

**User Persona Affected:**

- ***Primary:*** Valentina (Desarrolladora internacional) - necesita login confiable y seguro para acceso recurrente y seguimiento de facturas.
- ***Secondary:*** Carlos (Disenador organizado) y Andres (Consultor tradicional) - requieren acceso rapido y sin friccion para ver su dashboard.

**Business Value:**

- ***Value Proposition:*** acceso inmediato al dashboard para gestionar facturas y cobros con confianza.
- ***Business Impact:*** mejora activacion y retencion temprana; habilita time to first invoice y MAU.

**Related User Journey:**

- Journey: Journey 1: Registro y Primera Factura (Happy Path)
- Step: Acceso al dashboard despues de verificacion y login

### Contexto Tecnico de la Story

**Architecture Components:**

**Frontend:**

- Componentes: `LoginForm`
- Paginas/Rutas: `/auth/login`, `/dashboard`, `/onboarding`
- State Management: React Hook Form + Zod

**Backend:**

- API Endpoints: `POST /api/auth/login` (OpenAPI: `POST /auth/login`)
- Servicios: Supabase Auth `signInWithPassword`, session management, rate limiting
- Database: `profiles.last*login*at` update on success

**External Services:**

- Supabase Auth
- Email provider (para resend verification si aplica)

**Integration Points:**

- Frontend ↔ Backend API (login)
- Backend ↔ Supabase Auth (signIn)
- Backend ↔ Database (`profiles.last*login*at`)
- Backend ↔ Email provider (resend verification, si se implementa)

### Analisis de Complejidad

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic complexity: Medium - rate limit, remember me, mensajes genericos
- Integration complexity: Medium - Supabase Auth + DB update
- Data validation complexity: Low-Medium - email/password requeridos
- UI complexity: Low - formulario y estados de error

**Estimated Test Effort:** Medium
**Rationale:** multiples escenarios de error, seguridad (enumeracion), y persistencia de sesion.

## 

### Contexto a Nivel Epic (Feature Test Plan en Jira)

**Critical Risks Already Identified at Epic Level:**

- Risk 1: Fallas en verificacion de email o delays de entrega
- Risk 2: Manejo incorrecto de sesiones (remember me, httpOnly, logout)
- Risk 3: Inconsistencias entre Auth y profiles

**Integration Points from Epic Analysis:**

- Integration Point 1: Frontend ↔ Backend API
- Integration Point 2: Backend ↔ Supabase Auth
- Integration Point 3: Backend ↔ Database (profiles)
- Integration Point 4: Backend ↔ Email provider

**Critical Questions Already Asked at Epic Level:**

**Questions for PO:**

- Question 1: Se permite reenvio desde login? que limites/feedback?

**Questions for Dev:**

- Question 1: Duracion exacta de sesion con "Remember me" y configuracion en Supabase?

**Test Strategy from Epic:**

- Test Levels: Unit, Integration, E2E, API
- Tools: Playwright, Postman/Newman
- ***How This Story Aligns:*** requiere E2E para happy path, API para errores, e integration para session + DB update.

**Updates and Clarifications from Epic Refinement:**

- No updates adicionales detectadas en comentarios del epic.

**Summary: How This Story Fits in Epic:**

- ***Story Role in Epic:*** habilita el acceso post-registro y confirma la gestion de sesiones.
- ***Inherited Risks:*** sesiones inseguras o inconsistentes, verificacion de email, sync Auth ↔ profiles.
- ***Unique Considerations:*** mensajes genericos vs mensaje especifico para email no verificado.

## 🚨 Paso 2: Analisis de Calidad

### Ambiguedades Identificadas

**Ambiguity 1:** Mensaje de bienvenida exacto en dashboard

- ***Location in Story:*** Scenario 1
- ***Question for PO/Dev:*** cual es el texto exacto y donde se muestra?
- ***Impact on Testing:*** no se puede validar UI exacta sin el copy
- ***Suggested Clarification:*** definir copy y data source (nombre usuario)

**Ambiguity 2:** Conflicto entre mensaje generico y mensaje de email no verificado

- ***Location in Story:*** Scenario 3 vs Security notes
- ***Question for PO/Dev:*** se permite revelar estado de verificacion? o debe ser generico tambien?
- ***Impact on Testing:*** cambia casos negativos y criterios de seguridad
- ***Suggested Clarification:*** definir politica de mensajes para prevenir enumeracion

**Ambiguity 3:** Implementacion de "Remember me" (tokens/cookies)

- ***Location in Story:*** Scenario 5
- ***Question for Dev:*** se extiende refresh token, access token o cookie? como se valida expiracion?
- ***Impact on Testing:*** no se puede validar persistencia real sin reglas claras
- ***Suggested Clarification:*** definir TTL exacto y almacenamiento (httpOnly cookie)

**Ambiguity 4:** Rate limiting y feedback al usuario

- ***Location in Story:*** Security notes
- ***Question for Dev:*** cual es el status code y mensaje en lockout? se bloquea por email, IP o ambos?
- ***Impact on Testing:*** sin esto no se puede automatizar el bloqueo correctamente
- ***Suggested Clarification:*** documentar politica y mensaje de bloqueo

### Informacion Faltante / Gaps

**Gap 1:** Reglas de redireccion post-login cuando onboarding esta incompleto

- ***Type:*** Business Rule
- ***Why It's Critical:*** afecta ruta destino (dashboard vs onboarding) y casos E2E
- ***Suggested Addition:*** AC que especifique redireccion segun `onboarding_completed`
- ***Impact if Not Added:*** flujos inconsistentes y bugs de acceso

**Gap 2:** Mensajes de error exactos y codigos API

- ***Type:*** Acceptance Criteria
- ***Why It's Critical:*** validacion precisa de UI y API (contratos)
- ***Suggested Addition:*** definir mensajes y `error.code` para 401/403/429
- ***Impact if Not Added:*** tests fragiles y validaciones subjetivas

### Edge Cases NO Cubiertos

**Edge Case 1:** Login con email en mayusculas/espacios

- ***Scenario:*** usuario ingresa `Valentina@Example.com`
- ***Expected Behavior:*** se hace trim + case-insensitive y login exitoso
- ***Criticality:*** Medium
- ***Action Required:*** Add to test cases only

**Edge Case 2:** Intento de login durante lockout

- ***Scenario:*** usuario correcto pero bloqueado por rate limit
- ***Expected Behavior:*** rechazo aunque credenciales sean correctas
- ***Criticality:*** High
- ***Action Required:*** Add to story

**Edge Case 3:** Email no verificado + password incorrecto

- ***Scenario:*** usuario no verificado con password incorrecto
- ***Expected Behavior:*** mensaje generico (para evitar enumeracion)
- ***Criticality:*** High
- ***Action Required:*** Ask PO/Dev

### Validacion de Testabilidad

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues (if any):**

- [x] Expected results are not specific enough
- [x] Missing error scenarios (rate limit details)
- [x] Missing test data examples

**Recommendations to Improve Testability:**

- Definir mensajes y codigos de error exactos
- Documentar politica de rate limiting y lockout
- Confirmar politica de mensajes para email no verificado

## ✅ Paso 3: Acceptance Criteria Refinados

### Scenario 1: Successful login with verified credentials

**Type:** Positive
**Priority:** Critical

- ***Given:***
- ***When:***
- ***Then:***

### Scenario 2: Login fails with invalid credentials

**Type:** Negative
**Priority:** High

- ***Given:*** user is on login page
- ***When:*** user submits incorrect password or non-existent email
- ***Then:***

### Scenario 3: Login fails with unverified email

**Type:** Negative
**Priority:** High

- ***Given:*** user exists with email `carlos.unverified@soloq.test` and `email*verified*at` is null
- ***When:*** user submits correct credentials
- ***Then:***

### Scenario 4: Remember me extends session duration

**Type:** Positive
**Priority:** High

- ***Given:*** verified user on login page
- ***When:*** user logs in with "Remember me" checked
- ***Then:***

### Scenario 5: Rate limiting blocks login after 5 failed attempts

**Type:** Negative
**Priority:** High

- ***Given:*** user has 5 failed attempts within 15 minutes
- ***When:*** user attempts login again (even with correct credentials)
- ***Then:***

### Scenario 6: Login form validation errors

**Type:** Boundary
**Priority:** Medium

- ***Given:*** user is on login page
- ***When:*** email is empty/invalid or password is empty
- ***Then:***

### Scenario 7: Login redirects to onboarding when incomplete

**Type:** Edge Case
**Priority:** Medium
**Source:** Identified during critical analysis (Paso 2)

- ***Given:*** verified user with `onboarding_completed = false`
- ***When:*** user logs in with valid credentials
- ***Then:***

## 🧪 Paso 4: Diseno de Pruebas

### Test Coverage Analysis

**Total Test Cases Needed:** 13

**Breakdown:**

- Positive: 2
- Negative: 5
- Boundary: 2
- Integration: 2
- API: 2

**Rationale for This Number:** cubre happy path, seguridad (enumeracion + rate limit), persistencia de sesion, validaciones y actualizacion de DB.

## 

### Oportunidades de Parametrizacion

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Invalid credential combinations

- ***Base Scenario:*** Login fails with invalid credentials
- ***Parameters to Vary:*** email, password
- ***Test Data Sets:***

| ***Email **** | ****Password **** | ****Expected Result *** |
| --- | --- | --- |
| valentina.login@soloq.test  | Wrong1234  | 401 + "Invalid credentials"  |
| ghost@soloq.test  | Valid1234  | 401 + "Invalid credentials"  |
| GHOST@SOLOQ.TEST  | Valid1234  | 401 + "Invalid credentials"  |
| " valentina.login@soloq.test "  | Wrong1234  | 401 + "Invalid credentials"  |

**Total Tests from Parametrization:** 4
**Benefit:** reduce duplicacion en negativos y cubre variantes de input.

## 

### Nomenclatura de Test Outlines (Shift-Left)

**Formato (Spanish):**

```java
Validar [CORE] [CONDITIONAL]
```

## 

### Test Outlines

#### **Validar login exitoso con credenciales verificadas**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**

- User exists: `valentina.login@soloq.test` / `Valid1234`
- `email*verified*at` is set
- `onboarding_completed = true`

**Test Steps:**

# Go to `/auth/login`

# Click "Login"

# Verify redirect to `/dashboard` and welcome message

**Expected Result:**

- ***UI:*** dashboard loads and welcome message is visible (copy TBD)
- ***API Response:*** 200 OK
- ***Database:*** `profiles.last*login*at` updated to current time
- ***System State:*** session cookie set (httpOnly)

**Test Data:**

```json
{
  "input": {
    "email": "valentina.login@soloq.test",
    "password": "Valid1234"
  }
}
```

**Post-conditions:**

- User remains authenticated

#### **Validar persistencia de sesion por 7 dias con "Remember me"**

**Related Scenario:** Scenario 4
**Type:** Positive
**Priority:** High
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**

- Verified user exists

**Test Steps:**

# Login with "Remember me" checked

# Close browser and reopen within 7 days

# Navigate to `/dashboard`

**Expected Result:**

- ***UI:*** user remains logged in
- ***System State:*** refresh token/cookie Max-Age = 7d, access token = 1h

**Test Data:**

```json
{
  "input": {
    "email": "valentina.login@soloq.test",
    "password": "Valid1234",
    "rememberMe": true
  }
}
```

## 

#### **Validar error generico con password incorrecto**

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- User exists with verified email

**Test Steps:**

# Submit login with valid email and wrong password

# Observe error state

**Expected Result:**

- ***UI:*** shows "Invalid credentials" (generic)
- ***Database:*** `last*login*at` unchanged

#### **Validar error generico con email no existente**

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- Email is not registered

**Test Steps:**

# Submit login with non-existent email

# Observe error state

**Expected Result:**

- ***UI:*** shows "Invalid credentials" (generic)
- ***Database:*** no changes

#### **Validar mensaje de verificacion requerida para email no verificado**

**Related Scenario:** Scenario 3
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

**Preconditions:**

- User exists with `email*verified*at = null`

**Test Steps:**

# Submit login with correct credentials

# Observe error state and resend action

**Expected Result:**

- ***UI:*** message "Please verify your email first"
- ***UI:*** shows "Resend verification" action
- ***System State:*** no session created

#### **Validar rate limiting despues de 5 intentos fallidos**

**Related Scenario:** Scenario 5
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

**Preconditions:**

- Same user/IP has 5 failed attempts in 15 min

**Test Steps:**

# Attempt login again with any credentials

# Observe lockout message

**Expected Result:**

- ***UI:*** lockout message with wait time
- ***System State:*** no session created

#### **Validar bloqueo durante lockout incluso con credenciales correctas**

**Related Scenario:** Scenario 5
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

**Preconditions:**

- User is currently locked out

**Test Steps:**

# Submit correct credentials during lockout

# Observe response

**Expected Result:**

- ***UI:*** lockout message persists
- ***System State:*** no session created

#### **Validar campos requeridos (email y password)**

**Related Scenario:** Scenario 6
**Type:** Boundary
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ❌ No

**Preconditions:**

- Login page loaded

**Test Steps:**

# Submit with empty email and/or password

# Submit with invalid email format

**Expected Result:**

- ***UI:*** inline validation errors per field
- ***API:*** request not sent or returns 400 `VALIDATION_ERROR`

#### **Validar normalizacion de email (trim + case-insensitive)**

**Related Scenario:** Edge Case 1
**Type:** Boundary
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- User exists with email `valentina.login@soloq.test`

**Test Steps:**

# Submit email with leading/trailing spaces and uppercase

# Submit correct password

**Expected Result:**

- ***UI:*** login succeeds
- ***System State:*** session created

#### **Validar 401 para credenciales invalidas (API)**

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** API
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- API available at `/auth/login`

**Test Steps:**

# POST `/auth/login` with invalid credentials

**Expected Result:**

- ***Status Code:*** 401 Unauthorized
- ***Response Body:***

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid credentials"
  }
}
```

## 

#### **Validar 403 para email no verificado (API)**

**Related Scenario:** Scenario 3
**Type:** Negative
**Priority:** High
**Test Level:** API
**Parametrized:** ❌ No

**Preconditions:**

- User exists with `email*verified*at = null`

**Test Steps:**

# POST `/auth/login` with valid credentials

**Expected Result:**

- ***Status Code:*** 403 Forbidden
- ***Response Body:***

```json
{
  "success": false,
  "error": {
    "code": "EMAIL*NOT*VERIFIED",
    "message": "Please verify your email first"
  }
}
```

## 

#### **Validar actualizacion de profiles.last*login*at en login exitoso**

**Related Scenario:** Scenario 1
**Type:** Integration
**Priority:** High
**Test Level:** Integration
**Parametrized:** ❌ No

**Preconditions:**

- Verified user exists in auth.users and profiles

**Test Steps:**

# Login successfully via UI or API

# Query `profiles.last*login*at`

**Expected Result:**

- ***Database:*** `last*login*at` updated to current timestamp

#### **Validar redireccion a onboarding cuando esta incompleto**

**Related Scenario:** Scenario 7
**Type:** Edge Case
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** ❌ No

**Preconditions:**

- `onboarding_completed = false`

**Test Steps:**

# Login with valid credentials

# Observe redirect

**Expected Result:**

- ***UI:*** redirect to `/onboarding`
- ***System State:*** session created
- ***Note:*** requires PO/Dev confirmation

## 🔗 Integration Test Cases (If Applicable)

### Integration Test 1: Frontend ↔ Backend Login

**Integration Point:** Frontend → Backend API (`POST /api/auth/login`)
**Type:** Integration
**Priority:** High

**Preconditions:**

- Backend API is running
- Frontend can reach API endpoint

**Test Flow:**

# Frontend submits login request

# API authenticates with Supabase Auth

# API returns response

# Frontend handles redirect and session state

**Contract Validation:**

- Request format matches OpenAPI spec: ✅ Yes
- Response format matches OpenAPI spec: ✅ Yes
- Status codes match spec: ✅ Yes

**Expected Result:**

- Integration successful
- Session cookie set and redirect handled correctly

### Integration Test 2: Backend ↔ Supabase Auth + DB

**Integration Point:** Backend → Supabase Auth + PostgreSQL
**Type:** Integration
**Priority:** High

**Preconditions:**

- Supabase Auth available
- `profiles` table accessible

**Test Flow:**

# API calls `signInWithPassword`

# On success, update `profiles.last*login*at`

**Expected Result:**

- Auth success returns session
- DB updated with current timestamp

## 📊 Resumen de Edge Cases

| ***Edge Case **** | ****Covered in Original Story? **** | ****Added to Refined AC? **** | ****Test Case **** | ****Priority *** |
| --- | --- | --- | --- | --- |
| Email con espacios/mayusculas  | ❌ No  | ✅ Yes (Scenario 6)  | Validar normalizacion de email  | Medium  |
| Login durante lockout  | ❌ No  | ✅ Yes (Scenario 5)  | Validar bloqueo durante lockout  | High  |
| Unverified + wrong password  | ❌ No  | ⚠️ Needs PO confirmation  | TBD  | High  |

## 

## 🗂️ Resumen de Datos de Prueba

### Data Categories

| ***Data Type **** | ****Count **** | ****Purpose **** | ****Examples *** |
| --- | --- | --- | --- |
| Valid data  | 2  | Positive tests  | `valentina.login@soloq.test`, `Valid1234`  |
| Invalid data  | 4  | Negative tests  | `ghost@soloq.test`, `Wrong1234`  |
| Boundary values  | 2  | Boundary tests  | empty email/password, whitespace email  |
| Edge case data  | 2  | Edge cases  | unverified user, locked out user  |

### Data Generation Strategy

**Static Test Data:**

- `valentina.login@soloq.test` (verified)
- `carlos.unverified@soloq.test` (unverified)
- `ghost@soloq.test` (non-existent)

**Dynamic Test Data (using Faker.js):**

- Email: `faker.internet.email()`
- Password: `faker.internet.password({ length: 12 })`

**Test Data Cleanup:**

- ✅ Tests are idempotent (no new records created in login)
- ✅ No cleanup required beyond rate limit resets

## 📋 Test Execution Tracking

**Test Execution Date:** [TBD]
**Environment:** Staging
**Executed By:** [Nombre]

**Results:**

- Total Tests: [X]
- Passed: [Y]
- Failed: [Z]
- Blocked: [W]

**Bugs Found:**

- [Bug ID 1]: [Descripcion breve]
- [Bug ID 2]: [Descripcion breve]

**Sign-off:** [Nombre QA] - [Fecha]

## 

## 📢 Action Required

**@PO:**

- [ ] Review and answer Critical Questions
- [ ] Validate suggested story improvements
- [ ] Confirm expected behavior for identified edge cases

**@DevLead:**

- [ ] Review Technical Questions
- [ ] Validate integration points and test approach
- [ ] Confirm session + rate limit implementation details

**@QATeam:**

- [ ] Review test cases for completeness
- [ ] Validate parametrization strategy
- [ ] Prepare test environment

**Next Steps:**

# Team discusses critical questions and ambiguities

# PO/Dev provide answers and clarifications

# QA updates test cases based on feedback

# Dev starts implementation with clear acceptance criteria

## 

**Documentation:** Full test cases also available at:
`.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/stories/STORY-SQ-3-user-login/test-cases.md`

---

### Ely - 2/9/2026, 4:27:19 AM

## 📋 Revision de Implementacion - 2026-02-09

### Estado: Parcialmente Implementado

La funcionalidad CORE de login de usuarios esta implementada y funcional.

### ✅ Lo que ESTA implementado:

| ***Acceptance Criteria**** | ****Estado**** | ****Ubicacion*** |
| --- | --- | --- |
| Formulario de login | ✅ Implementado | `src/app/(auth)/login/page.tsx` |
| Redirect a /dashboard | ✅ Implementado | `router.push('/dashboard')` |
| Sesion activa con cookies | ✅ Implementado | Supabase cookies + middleware |
| Error generico "Invalid credentials" | ✅ Implementado | Previene enumeracion de emails |
| Detecta email no verificado | ✅ Implementado | Maneja "Email not confirmed" |
| Middleware de proteccion | ✅ Implementado | `middleware.ts` protege rutas |
| Link a forgot password | ✅ Implementado | Presente en UI |
| Link a signup | ✅ Implementado | Presente en UI |

### ⚠️ Gaps identificados (mejoras opcionales):

| ***Gap**** | ****Prioridad**** | ****Descripcion*** |
| --- | --- | --- |
| Sin "Remember me" | Media | No existe checkbox ni logica de sesion extendida (7 dias) |
| Sin resend verification | Media | Cuando email no verificado, no hay opcion de reenviar |
| Sin update `last*login*at` | Baja | La tabla `profiles` tiene el campo pero no se actualiza en login |
| Sin rate limiting | Media | No hay bloqueo tras 5 intentos fallidos (seguridad) |
| Sin React Hook Form + Zod | Baja | Usa `useState` basico |
| Sin tests automatizados | Media | No hay unit tests ni E2E |

### 📍 Archivos relevantes:

- `src/app/(auth)/login/page.tsx` - Pagina de login
- `src/contexts/auth-context.tsx` - Contexto de auth con `signIn`
- `middleware.ts` - Proteccion de rutas y redirect

### 📝 Nota para el equipo:

**Si el equipo considera necesario agregar mejoras a la implementacion actual (Remember me, resend verification, rate limiting, update last*login*at, o tests), favor de reportar las mejoras como nuevas tareas o subtareas.**

## 

**Revision realizada por Claude Code**

---

### Ely - 2/9/2026, 4:27:31 AM

Moviendo a Ready For QA - Implementacion core completada, gaps documentados en comentario anterior.

---

### Joel Armando Ramírez Rodríguez - 2/9/2026, 4:52:35 PM

# Exploratory Testing Session Notes - [https://upexgalaxy65.atlassian.net/browse/SQ-3#icft=SQ-3](https://upexgalaxy65.atlassian.net/browse/SQ-3#icft=SQ-3) (User Login with Credentials)

***Date:*** 2026-02-09  
***Feature:*** STORY-SQ-3 - User Login with Credentials  
***Environment:*** Staging (`https://staging-upexsoloq.vercel.app`)  
***Execution Type:*** UI-only + Network observation (Playwright MCP)

## 

## Executive Summary

- ***Overall Status:*** ISSUES FOUND
- ***Scenarios Tested:*** 9 (test cases UI + exploratory)
- ***Issues Found:*** 1
- ***Blocked:*** Yes

> Nota: Se omitio deliberadamente validacion/resultado de rate limiting, segun comentario de DEV (funcionalidad aun no implementada).

## 

## Test Cases Executed (UI + Network)

1. ***Successful login with valid credentials*** -> PASSED  
2. ***Invalid credentials (wrong password)*** -> PASSED  
3. ***Non-existent email*** -> PASSED  
4. ***Email normalization (trim + case-insensitive)*** -> PASSED  
5. ***Remember me option visibility*** -> ISSUE FOUND / GAP  

## Exploratory Coverage (additional)

1. ***Session stability after page reload*** -> ISSUE FOUND (reproducido)  
2. ***Profile menu behavior in fallback state*** -> ISSUE FOUND  
3. ***Logout in normal state*** -> PASSED  

## Issue encontrado mediante EXP Test Manual:

### Issue 1 - Profile falls back to `Usuario` after reload and blocks logout

- ***Severity:*** High
- ***Steps to Reproduce:***
- ***Expected:*** Perfil muestra nombre/email real y menu de usuario siempre funcional.
- ***Actual:*** Perfil cae a `Usuario` y el menu no abre, impidiendo logout desde UI.
- ***Evidence:*** `sq3-profile-usuario-state.png`

## Additional Network / Console Observations

- `GET .../business_profiles?...` -> `406` recurrente durante bootstrap de sesion.
- Console error recurrente: ***Minified React error #418*** (detectado durante estados inconsistentes de UI).
- `GET /forgot-password?_rsc=...` -> `404` desde login.

## Recommendations

- Revisar sincronizacion/rehidratacion de estado de perfil post-login y post-reload (fuente de `displayName` y estado auth).
- Asegurar fallback robusto del dropdown de usuario para no bloquear `Cerrar Sesion`.
- Estandarizar mensajes/estados de validacion del login en UI.
- Candidatos prioritarios para automatizacion: 

---

### Ely - 2/10/2026, 5:49:41 PM

Defect [https://upexgalaxy65.atlassian.net/browse/SQ-74#icft=SQ-74](https://upexgalaxy65.atlassian.net/browse/SQ-74#icft=SQ-74) is now Ready For QA (PR #41 merged). Moving back for re-testing.

---

### Joel Armando Ramírez Rodríguez - 2/11/2026, 11:38:20 AM

## 🧪 Exploratory DB Testing - STORY-SQ-3 (Login) 

**Fecha:** 2026-02-11  
**Ejecutado por:** QA (MCP sql / rol `qa_team`)  
**Base:** `.prompts/fase-10-exploratory-testing/exploratory-db-test.md` + casos de prueba de `test-cases.md` de [https://upexgalaxy65.atlassian.net/browse/SQ-3#icft=SQ-3](https://upexgalaxy65.atlassian.net/browse/SQ-3#icft=SQ-3)

### Contexto y alcance

Se validó capa DB para los puntos del login:

- Integración de `profiles.last*login*at`
- Consistencia de entidades relacionadas a sesión/perfil (`profiles`, `business_profiles`, `subscription`)
- Constraints y RLS relevantes
- Coherencia con hallazgos previos de UI (error 406 en `business_profiles`)

### Resultados clave

#### 1) `profiles.last*login*at` (TC: **Should update profiles.last*login*at on successful login**)

- Resultado: ❌ ***FAILED***
- Evidencia DB:
- Interpretación: no hay evidencia de actualización de `last*login*at` en ningún perfil.

#### 2) `profiles.email*verified*at` consistencia

- Resultado: ⚠️ ***ISSUE / GAP***
- Evidencia DB:
- Interpretación: la verificación de email no se está reflejando en `public.profiles`.

#### 3) Consistencia perfil extendido (relación con issue UI de 406)

- Resultado: ❌ ***FAILED***
- Evidencia DB:
- Interpretación: falta registro en `business_profiles` para todos los perfiles. Esto alinea con el error observado en UI/network (406 al consultar business profile).

#### 4) Constraints en `public.profiles`

- Resultado: ✅ ***PASSED***
- Pruebas ejecutadas:

#### 5) RLS / políticas

- Resultado: ✅ ***CONFIGURADO***
- Evidencia: tablas `profiles`, `business*profiles`, `subscription` tienen RLS activo y políticas CRUD por `auth.uid() = user*id`.

#### 6) Gaps de modelo frente a AC/Test Cases

- Resultado: ⚠️ ***GAP***
- Hallazgo: no existe columna `onboarding_completed` en `public.profiles` (0 resultados al buscar columnas con patrón `%onboarding%`).
- Impacto: el escenario de redirección por onboarding incompleto no puede sustentarse en el modelo actual de `profiles`.

### Limitaciones de esta sesión

- El rol `qa_team` no tiene acceso a `auth.users` (error: permission denied en schema auth), por lo que no se pudo correlacionar directamente emails de prueba con IDs en DB desde SQL.
- No se ejecutaron writes persistentes de datos de negocio; pruebas de constraints fueron por intentos de inserción inválida (fallaron correctamente).

### Conclusión

**Estado general DB para SQ-3:** **ISSUES FOUND**.

Problemas prioritarios detectados:

# `profiles.last*login*at` no se actualiza.

# Inconsistencia estructural: ausencia total de `business_profiles` para perfiles existentes (alineado con 406 en UI).

# Gap de modelo respecto a onboarding (falta `onboarding_completed` en `profiles`).

Recomendación QA:

- Abrir/actualizar defectos para (1) update de `last*login*at`, (2) estrategia de bootstrap de `business_profiles` (creación automática o manejo de ausencia sin 406), y (3) alineación AC/modelo para onboarding.

---

### Joel Armando Ramírez Rodríguez - 2/11/2026, 11:51:26 AM

Se creó el defecto consolidado de esta sesión DB/UI: ***SQ-81*** (`CM | SQ-3 login presenta inconsistencias DB/UI: last*login*at no actualiza, business*profiles ausente (406) y gap onboarding`).\n\nIncluye hallazgos de `last*login*at`, `business*profiles` (406), gap de `onboarding*completed` y consistencia de `email*verified_at`.

---

### Joel Armando Ramírez Rodríguez - 3/1/2026, 6:08:38 PM

## 📊 Fase 11 - Test Analysis Report (Regresión)

***User Story:*** SQ-3 - User Login with Credentials  

***Epic:*** SQ-1 - User Authentication & Onboarding  

***Fecha:*** 2026-03-01  

***Analista:*** AI Assistant

---

## 1) Contexto verificado

Se revisó contexto completo solicitado:

- ***PBI Story:*** `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/stories/STORY-SQ-3-user-login/story.md`
- ***Shift-Left Test Cases:*** `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/stories/STORY-SQ-3-user-login/test-cases.md`
- ***Epic docs:*** `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/epic.md`, `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/feature-test-plan.md`
- ***SRS:*** `FR-003 Login de Usuario` en `.context/SRS/functional-specs.md`, NFR de auth en `.context/SRS/non-functional-specs.md`, contrato `/auth/login` en `.context/SRS/api-contracts.yaml`
- ***Business analysis / PRD:*** `.context/PRD/mvp-scope.md`, `.context/PRD/user-journeys.md`
- ***Código implementado:*** `src/app/(auth)/login/page.tsx`, `src/contexts/auth-context.tsx`, `src/app/(app)/dashboard/page.tsx`, `src/components/layout/nav-user.tsx`, `middleware.ts`

---

## 2) Estado de la US y evidencia Jira

- ***Status actual US:*** `Ready For QA` (nota: el prompt asume `QA Approved`).
- ***Comentarios exploratorios existentes:*** Shift-left + exploratory UI + exploratory DB.
- ***Defects vinculados:***

  - `SQ-74` (OPEN): logout no disponible tras refresh repetidos.

  - `SQ-81` (Ready For QA): inconsistencias DB/UI, incluye `last*login*at`.

---

## 3) Escenarios ya validados/fuentes (sin inventar)

Desde exploratory y Shift-left:

1. Validar login exitoso con credenciales válidas.
2. Validar error de credenciales inválidas con password incorrecto.
3. Validar error de credenciales inválidas con email no existente.
4. Validar normalización de email (trim + case-insensitive).
5. Validar comportamiento de sesión tras refresh en dashboard.
6. Validar disponibilidad de cerrar sesión desde menú de usuario.
7. Validar actualización de `profiles.last*login*at` tras login.
8. Validar presencia de opción Remember me.
9. Validar rate limiting tras intentos fallidos.

---

## 4) Separación: transversales vs escenarios reales

### Características transversales (NO tests separados)

- Responsive/multi-viewport (se valida ejecutando escenarios en mobile + desktop).
- Contrato API general y performance auth (se valida dentro de escenarios API/integration).
- Hardening general de auth (cookies/httpOnly/middleware) como parte de flujos core.

### Escenarios reales candidatos

| # | Escenario | Prioridad | Tipo | Automatizable | Componente de |

|---|---|---|---|---|---|

| 1 | Validar login exitoso con credenciales válidas | Critical | E2E | Sí | Flujo de acceso autenticado |

| 2 | Validar error genérico de credenciales inválidas cuando password o email no coinciden | High | Functional/API | Sí | Seguridad anti-enumeración |

| 3 | Validar disponibilidad de cerrar sesión después de recargar dashboard con sesión activa | Critical | Integration/E2E | Sí | Gestión de sesión |

| 4 | Validar actualización de last*login*at cuando el usuario inicia sesión exitosamente | High | Integration/DB | Sí | Trazabilidad de acceso |

| 5 | Validar normalización de email con espacios/mayúsculas al iniciar sesión | Medium | Functional | Sí | Robustez de input |

| 6 | Validar presencia/uso de Remember me en pantalla de login | Medium | Functional | Sí (cuando esté implementado) | Persistencia de sesión |

| 7 | Validar bloqueo por rate limiting después de múltiples intentos fallidos | High | Security/Integration | Sí (cuando esté implementado) | Protección auth |

---

## 5) Mapa de componentes (Lego)

```text
E2E: Acceso autenticado
├── [1] Validar login exitoso con credenciales válidas
├── [2] Validar error genérico de credenciales inválidas cuando password o email no coinciden
└── [3] Validar disponibilidad de cerrar sesión después de recargar dashboard con sesión activa

Integration: Estado y trazabilidad de sesión
└── [4] Validar actualización de last*login*at cuando el usuario inicia sesión exitosamente
```

---

## 6) Análisis de riesgo por bugs previos

| Bug ID | Estado | Área afectada | Escenario relacionado | Riesgo de regresión |

|---|---|---|---|---|

| SQ-74 | OPEN | Estado de sesión/UI usuario/logout | #3 | Alto |

| SQ-81 | Ready For QA | `last*login*at` + consistencia auth/profile | #4 | Alto |

Regla aplicada: escenario asociado a bug previo => prioridad de regresión más alta.

---

## 7) Resumen para priorización

| Métrica | Valor |

|---|---:|

| Escenarios reales identificados | 7 |

| Transversales (no tests separados) | 3 |

| Candidatos automatizables potenciales | 7 |

| Candidatos con bug previo explícito | 2 |

***Siguiente paso:*** ejecutar `test-prioritization.md` con filtro estricto Fase 0 + ROI para reducir a mínimo set de regresión.

---

### Joel Armando Ramírez Rodríguez - 3/1/2026, 6:09:10 PM

## 🎯 Fase 11 - Test Prioritization Report (Risk-Based, ROI estricto)

***Feature/US:*** SQ-3 - User Login with Credentials  

***Fecha:*** 2026-03-01  

***Entrada:*** análisis Fase 11 + exploratory UI/DB + defects SQ-74/SQ-81

---

## Fase 0: Filtro de preguntas críticas

| # | Escenario | ¿Protege regresión futura? | ¿Bug previo? | ¿Nivel feature? | ¿Pasa filtro? |

|---|---|---|---|---|---|

| 1 | Validar login exitoso con credenciales válidas | SÍ | SÍ (SQ-81 parcial por `last*login*at`) | SÍ | ✅ |

| 2 | Validar error genérico de credenciales inválidas cuando password o email no coinciden | SÍ | No directo | SÍ | ✅ |

| 3 | Validar disponibilidad de cerrar sesión después de recargar dashboard con sesión activa | SÍ | SÍ (SQ-74) | SÍ | ✅ |

| 4 | Validar actualización de `last*login*at` como test aislado | NO (queda cubierto por #1) | SÍ (SQ-81) | SÍ | ❌ |

| 5 | Validar normalización de email con espacios/mayúsculas | NO (valor incremental bajo vs #1/#2) | No directo | SÍ | ❌ |

| 6 | Validar presencia/uso de Remember me | NO (funcionalidad parcial/no estable) | No | SÍ | ❌ |

| 7 | Validar rate limiting tras múltiples intentos fallidos | NO (no implementado según evidencia) | No | SÍ | ❌ |

***Resultado filtro:**** ****3 de 7**** candidatos pasan (****42.8%***, selectivo y dentro del objetivo <50%).

---

## Fase 1: ROI (solo candidatos filtrados)

Fórmula: `(Frecuencia x Impacto x Estabilidad) / (Esfuerzo x Dependencias)`

| # | Escenario | Freq | Impact | Stab | Effort | Deps | ROI | Bug previo | Decisión |

|---|---|---:|---:|---:|---:|---:|---:|---|---|

| 1 | Validar login exitoso con credenciales válidas | 5 | 5 | 4 | 2 | 2 | ***12.5*** | SQ-81 | ✅ AUTO |

| 2 | Validar error genérico de credenciales inválidas cuando password o email no coinciden | 5 | 5 | 4 | 2 | 2 | ***12.5*** | - | ✅ AUTO |

| 3 | Validar disponibilidad de cerrar sesión después de recargar dashboard con sesión activa | 4 | 5 | 3 | 2 | 3 | ***10.0*** | SQ-74 | ✅ AUTO |

---

## Decisión final

### ✅ Track 1: Automated Regression (CI/CD)

1. ***SQ-3: TC1: Validar login exitoso con credenciales válidas***  

   - Incluye verificación de sesión activa + actualización de `last*login*at`.

1. ***SQ-3: TC2: Validar error genérico de credenciales inválidas cuando password o email no coinciden***  

   - Cubre seguridad anti-enumeración para password incorrecto y email inexistente.

1. ***SQ-3: TC3: Validar disponibilidad de cerrar sesión después de recargar dashboard con sesión activa***  

   - Cubre regresión directa de SQ-74.

### ❌ Track 3: Deferred

- Normalización de email como test aislado (cubierta indirectamente por TC1/TC2).
- Remember me (feature no estable/implementación parcial).
- Rate limiting (no implementado según comentarios de implementación/exploratory).
- `last*login*at` como test separado (se consolida dentro de TC1 para reducir mantenimiento).

---

## Resumen

| Métrica | Antes | Después | Reducción |

|---|---:|---:|---:|

| Total candidatos | 7 | 3 | ***57.1%*** |

| Track | Count |

|---|---:|

| Automated Regression | 3 |

| Manual Regression | 0 |

| Deferred | 4 |

---

## Path de workflow sugerido (para documentación)

Para los 3 tests seleccionados:  

***Draft -> In Design -> READY -> In Review -> Candidate***

Siguiente paso: `test-documentation.md` para crear y transitar los Test issues.

---

### Joel Armando Ramírez Rodríguez - 3/1/2026, 6:13:57 PM

### Fase 11 - Test Documentation completada (SQ-3)

Se documentaron y publicaron los siguientes Test Cases en Jira:

- ***SQ-106*** - TC1: Validar login exitoso con credenciales válidas (E2E, ROI 12.5)
- ***SQ-107*** - TC2: Validar error genérico de credenciales inválidas (Functional, ROI 12.5)
- ***SQ-108*** - TC3: Validar logout disponible después de refresh en dashboard (Integration, ROI 10.0)

### Workflow aplicado

Cada Test fue transicionado por el flujo completo:

`Draft -> In Design -> READY -> In Review -> Candidate`

### Estado final

- SQ-106: ***Candidate***
- SQ-107: ***Candidate***
- SQ-108: ***Candidate***

### Trazabilidad

- Relación funcional mantenida en contenido de cada test (`Related Story: SQ-3`).
- Intento de creación de issue links tipo ***Test*** vía API falló con `401 Authentication failed` para el endpoint de linking.
- Se deja trazabilidad explícita en este comentario y en los artefactos de caché local en el repositorio.

### Bugs de regresión cubiertos

- ***SQ-81*** (login + `last*login*at`) -> cubierto por SQ-106
- ***SQ-74*** (logout tras refresh) -> cubierto por SQ-108

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:37.858Z_
