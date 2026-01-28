# Test Cases: STORY-SQ-3 - User Login with Credentials

**Fecha:** 2026-01-28
**QA Engineer:** AI-Generated
**Story Jira Key:** SQ-3
**Epic:** EPIC-SQ-1 - User Authentication & Onboarding
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Valentina (Desarrolladora internacional) - necesita login confiable y seguro para acceso recurrente y seguimiento de facturas.
- **Secondary:** Carlos (Disenador organizado) y Andres (Consultor tradicional) - requieren acceso rapido y sin friccion para ver su dashboard.

**Business Value:**

- **Value Proposition:** acceso inmediato al dashboard para gestionar facturas y cobros con confianza.
- **Business Impact:** mejora activacion y retencion temprana; habilita time to first invoice y MAU.

**Related User Journey:**

- Journey: Journey 1: Registro y Primera Factura (Happy Path)
- Step: Acceso al dashboard despues de verificacion y login

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: `LoginForm`
- Pages/Routes: `/auth/login`, `/dashboard`, `/onboarding`
- State Management: React Hook Form + Zod

**Backend:**

- API Endpoints: `POST /api/auth/login` (OpenAPI: `POST /auth/login`)
- Services: Supabase Auth `signInWithPassword`, session management, rate limiting
- Database: `profiles.last_login_at` update on success

**External Services:**

- Supabase Auth
- Email provider (para resend verification si aplica)

**Integration Points:**

- Frontend ↔ Backend API (login)
- Backend ↔ Supabase Auth (signIn)
- Backend ↔ Database (profiles.last_login_at)
- Backend ↔ Email provider (resend verification, si se implementa)

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic complexity: Medium - rate limit, remember me, mensajes genericos
- Integration complexity: Medium - Supabase Auth + DB update
- Data validation complexity: Low-Medium - email/password requeridos
- UI complexity: Low - formulario y estados de error

**Estimated Test Effort:** Medium
**Rationale:** multiples escenarios de error, seguridad (enumeracion), y persistencia de sesion.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**

- Risk 1: Fallas en verificacion de email o delays de entrega
  - **Relevance to This Story:** afecta el escenario de email no verificado y el flujo de reenvio.
- Risk 2: Manejo incorrecto de sesiones (remember me, httpOnly, logout)
  - **Relevance to This Story:** afecta la persistencia de sesion y seguridad.
- Risk 3: Inconsistencias entre Auth y profiles
  - **Relevance to This Story:** afecta la actualizacion de `profiles.last_login_at`.

**Integration Points from Epic Analysis:**

- Integration Point 1: Frontend ↔ Backend API
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** formulario login → `POST /api/auth/login`
- Integration Point 2: Backend ↔ Supabase Auth
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** `signInWithPassword` y manejo de session
- Integration Point 3: Backend ↔ Database (profiles)
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** update `last_login_at`
- Integration Point 4: Backend ↔ Email provider
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** reenvio de verificacion desde login (si aplica)

**Critical Questions Already Asked at Epic Level:**

**Questions for PO:**

- Question 1: Se permite reenvio desde login? que limites/feedback?
  - **Status:** ⏳ Pending
  - **Impact on This Story:** define UI, endpoint y mensajes de error para email no verificado.

**Questions for Dev:**

- Question 1: Duracion exacta de sesion con "Remember me" y configuracion en Supabase?
  - **Status:** ⏳ Pending
  - **Impact on This Story:** define expiracion real de session y validacion de cookies.

**Test Strategy from Epic:**

- Test Levels: Unit, Integration, E2E, API
- Tools: Playwright, Postman/Newman
- **How This Story Aligns:** requiere E2E para happy path, API para errores, e integration para session + DB update.

**Updates and Clarifications from Epic Refinement:**

- No updates adicionales detectadas en comentarios del epic.

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** habilita el acceso post-registro y confirma la gestion de sesiones.
- **Inherited Risks:** sesiones inseguras o inconsistentes, verificacion de email, sync Auth ↔ profiles.
- **Unique Considerations:** mensajes genericos vs mensaje especifico para email no verificado.

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Mensaje de bienvenida exacto en dashboard

- **Location in Story:** Scenario 1
- **Question for PO/Dev:** cual es el texto exacto y donde se muestra?
- **Impact on Testing:** no se puede validar UI exacta sin el copy
- **Suggested Clarification:** definir copy y data source (nombre usuario)

**Ambiguity 2:** Conflicto entre mensaje generico y mensaje de email no verificado

- **Location in Story:** Scenario 3 vs Security notes
- **Question for PO/Dev:** se permite revelar estado de verificacion? o debe ser generico tambien?
- **Impact on Testing:** cambia casos negativos y criterios de seguridad
- **Suggested Clarification:** definir politica de mensajes para prevenir enumeracion

**Ambiguity 3:** Implementacion de "Remember me" (tokens/cookies)

- **Location in Story:** Scenario 5
- **Question for Dev:** se extiende refresh token, access token o cookie? como se valida expiracion?
- **Impact on Testing:** no se puede validar persistencia real sin reglas claras
- **Suggested Clarification:** definir TTL exacto y almacenamiento (httpOnly cookie)

**Ambiguity 4:** Rate limiting y feedback al usuario

- **Location in Story:** Security notes
- **Question for Dev:** cual es el status code y mensaje en lockout? se bloquea por email, IP o ambos?
- **Impact on Testing:** sin esto no se puede automatizar el bloqueo correctamente
- **Suggested Clarification:** documentar politica y mensaje de bloqueo

---

### Missing Information / Gaps

**Gap 1:** Reglas de redireccion post-login cuando onboarding esta incompleto

- **Type:** Business Rule
- **Why It's Critical:** afecta ruta destino (dashboard vs onboarding) y casos E2E
- **Suggested Addition:** AC que especifique redireccion segun `onboarding_completed`
- **Impact if Not Added:** flujos inconsistentes y bugs de acceso

**Gap 2:** Mensajes de error exactos y codigos API

- **Type:** Acceptance Criteria
- **Why It's Critical:** validacion precisa de UI y API (contratos)
- **Suggested Addition:** definir mensajes y `error.code` para 401/403/429
- **Impact if Not Added:** tests fragiles y validaciones subjetivas

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Login con email en mayusculas/espacios

- **Scenario:** usuario ingresa `Valentina@Example.com`
- **Expected Behavior:** se hace trim + case-insensitive y login exitoso
- **Criticality:** Medium
- **Action Required:** Add to test cases only

**Edge Case 2:** Intento de login durante lockout

- **Scenario:** usuario correcto pero bloqueado por rate limit
- **Expected Behavior:** rechazo aunque credenciales sean correctas
- **Criticality:** High
- **Action Required:** Add to story

**Edge Case 3:** Email no verificado + password incorrecto

- **Scenario:** usuario no verificado con password incorrecto
- **Expected Behavior:** mensaje generico (para evitar enumeracion)
- **Criticality:** High
- **Action Required:** Ask PO/Dev

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues (if any):**

- [x] Expected results are not specific enough
- [x] Missing error scenarios (rate limit details)
- [x] Missing test data examples

**Recommendations to Improve Testability:**

- Definir mensajes y codigos de error exactos
- Documentar politica de rate limiting y lockout
- Confirmar politica de mensajes para email no verificado

---

## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Successful login with verified credentials

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User exists with email `valentina.login@soloq.test`, password `Valid1234`
  - `profiles.email_verified_at` is set
  - `profiles.onboarding_completed = true`
- **When:**
  - User submits login form with correct email and password on `/auth/login`
- **Then:**
  - User is redirected to `/dashboard`
  - Welcome message is displayed (exact copy TBD)
  - Session cookie is set as httpOnly
  - API returns 200 with `{ success: true, user: UserObject }`
  - `profiles.last_login_at` updated within 60s

---

### Scenario 2: Login fails with invalid credentials

**Type:** Negative
**Priority:** High

- **Given:** user is on login page
- **When:** user submits incorrect password or non-existent email
- **Then:**
  - UI shows generic error: "Invalid credentials"
  - API returns 401 with `error.code = INVALID_CREDENTIALS`
  - No session cookie is created
  - `profiles.last_login_at` is NOT updated

---

### Scenario 3: Login fails with unverified email

**Type:** Negative
**Priority:** High

- **Given:** user exists with email `carlos.unverified@soloq.test` and `email_verified_at` is null
- **When:** user submits correct credentials
- **Then:**
  - UI shows message "Please verify your email first"
  - UI shows action to resend verification email
  - API returns 403 with `error.code = EMAIL_NOT_VERIFIED`
  - No session cookie is created

---

### Scenario 4: Remember me extends session duration

**Type:** Positive
**Priority:** High

- **Given:** verified user on login page
- **When:** user logs in with "Remember me" checked
- **Then:**
  - Session persists for 7 days (refresh token/cookie Max-Age = 7d)
  - Access token default remains 1h
  - User stays logged in after browser restart within 7 days

---

### Scenario 5: Rate limiting blocks login after 5 failed attempts

**Type:** Negative
**Priority:** High

- **Given:** user has 5 failed attempts within 15 minutes
- **When:** user attempts login again (even with correct credentials)
- **Then:**
  - API returns 429 (or 423) with `error.code = TOO_MANY_ATTEMPTS`
  - UI shows lockout message and remaining wait time
  - No session is created

---

### Scenario 6: Login form validation errors

**Type:** Boundary
**Priority:** Medium

- **Given:** user is on login page
- **When:** email is empty/invalid or password is empty
- **Then:**
  - Client shows field-level validation errors
  - API returns 400 `VALIDATION_ERROR` if submitted

---

### Scenario 7: Login redirects to onboarding when incomplete

**Type:** Edge Case
**Priority:** Medium
**Source:** Identified during critical analysis (Paso 2)

- **Given:** verified user with `onboarding_completed = false`
- **When:** user logs in with valid credentials
- **Then:**
  - User is redirected to `/onboarding`
  - **⚠️ NOTE:** This scenario was NOT in original story - needs PO/Dev confirmation

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 13

**Breakdown:**

- Positive: 2
- Negative: 5
- Boundary: 2
- Integration: 2
- API: 2

**Rationale for This Number:** cubre happy path, seguridad (enumeracion + rate limit), persistencia de sesion, validaciones y actualizacion de DB.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Invalid credential combinations

- **Base Scenario:** Login fails with invalid credentials
- **Parameters to Vary:** email, password
- **Test Data Sets:**

| Email                          | Password  | Expected Result             |
| ------------------------------ | --------- | --------------------------- |
| valentina.login@soloq.test     | Wrong1234 | 401 + "Invalid credentials" |
| ghost@soloq.test               | Valid1234 | 401 + "Invalid credentials" |
| GHOST@SOLOQ.TEST               | Valid1234 | 401 + "Invalid credentials" |
| " valentina.login@soloq.test " | Wrong1234 | 401 + "Invalid credentials" |

**Total Tests from Parametrization:** 4
**Benefit:** reduce duplicacion en negativos y cubre variantes de input.

---

### Nomenclatura de Test Outlines (Shift-Left)

**Formato (English):**

```
Should <BEHAVIOR> <CONDITION>
```

---

### Test Outlines

#### **Should login successfully with verified credentials**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**

- User exists: `valentina.login@soloq.test` / `Valid1234`
- `email_verified_at` is set
- `onboarding_completed = true`

**Test Steps:**

1. Go to `/auth/login`
   - **Data:** email `valentina.login@soloq.test`, password `Valid1234`
2. Click "Login"
3. Verify redirect to `/dashboard` and welcome message

**Expected Result:**

- **UI:** dashboard loads and welcome message is visible (copy TBD)
- **API Response:** 200 OK
- **Database:** `profiles.last_login_at` updated to current time
- **System State:** session cookie set (httpOnly)

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

---

#### **Should persist session for 7 days when remember me is checked**

**Related Scenario:** Scenario 4
**Type:** Positive
**Priority:** High
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**

- Verified user exists

**Test Steps:**

1. Login with "Remember me" checked
2. Close browser and reopen within 7 days
3. Navigate to `/dashboard`

**Expected Result:**

- **UI:** user remains logged in
- **System State:** refresh token/cookie Max-Age = 7d, access token = 1h

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

---

#### **Should show generic error when password is incorrect**

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- User exists with verified email

**Test Steps:**

1. Submit login with valid email and wrong password
2. Observe error state

**Expected Result:**

- **UI:** shows "Invalid credentials" (generic)
- **Database:** `last_login_at` unchanged

---

#### **Should show generic error when email does not exist**

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- Email is not registered

**Test Steps:**

1. Submit login with non-existent email
2. Observe error state

**Expected Result:**

- **UI:** shows "Invalid credentials" (generic)
- **Database:** no changes

---

#### **Should show verification required message for unverified email**

**Related Scenario:** Scenario 3
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

**Preconditions:**

- User exists with `email_verified_at = null`

**Test Steps:**

1. Submit login with correct credentials
2. Observe error state and resend action

**Expected Result:**

- **UI:** message "Please verify your email first"
- **UI:** shows "Resend verification" action
- **System State:** no session created

---

#### **Should apply rate limiting after 5 failed attempts**

**Related Scenario:** Scenario 5
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

**Preconditions:**

- Same user/IP has 5 failed attempts in 15 min

**Test Steps:**

1. Attempt login again with any credentials
2. Observe lockout message

**Expected Result:**

- **UI:** lockout message with wait time
- **System State:** no session created

---

#### **Should block login during lockout even with correct credentials**

**Related Scenario:** Scenario 5
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

**Preconditions:**

- User is currently locked out

**Test Steps:**

1. Submit correct credentials during lockout
2. Observe response

**Expected Result:**

- **UI:** lockout message persists
- **System State:** no session created

---

#### **Should validate required email and password fields**

**Related Scenario:** Scenario 6
**Type:** Boundary
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ❌ No

**Preconditions:**

- Login page loaded

**Test Steps:**

1. Submit with empty email and/or password
2. Submit with invalid email format

**Expected Result:**

- **UI:** inline validation errors per field
- **API:** request not sent or returns 400 `VALIDATION_ERROR`

---

#### **Should normalize email input (trim + case-insensitive)**

**Related Scenario:** Edge Case 1
**Type:** Boundary
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- User exists with email `valentina.login@soloq.test`

**Test Steps:**

1. Submit email with leading/trailing spaces and uppercase
2. Submit correct password

**Expected Result:**

- **UI:** login succeeds
- **System State:** session created

---

#### **Should return 401 for invalid credentials (API)**

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** API
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- API available at `/auth/login`

**Test Steps:**

1. POST `/auth/login` with invalid credentials

**Expected Result:**

- **Status Code:** 401 Unauthorized
- **Response Body:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid credentials"
  }
}
```

---

#### **Should return 403 for unverified email (API)**

**Related Scenario:** Scenario 3
**Type:** Negative
**Priority:** High
**Test Level:** API
**Parametrized:** ❌ No

**Preconditions:**

- User exists with `email_verified_at = null`

**Test Steps:**

1. POST `/auth/login` with valid credentials

**Expected Result:**

- **Status Code:** 403 Forbidden
- **Response Body:**

```json
{
  "success": false,
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Please verify your email first"
  }
}
```

---

#### **Should update profiles.last_login_at on successful login**

**Related Scenario:** Scenario 1
**Type:** Integration
**Priority:** High
**Test Level:** Integration
**Parametrized:** ❌ No

**Preconditions:**

- Verified user exists in auth.users and profiles

**Test Steps:**

1. Login successfully via UI or API
2. Query `profiles.last_login_at`

**Expected Result:**

- **Database:** `last_login_at` updated to current timestamp

---

#### **Should redirect to onboarding when onboarding is incomplete**

**Related Scenario:** Scenario 7
**Type:** Edge Case
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** ❌ No

**Preconditions:**

- `onboarding_completed = false`

**Test Steps:**

1. Login with valid credentials
2. Observe redirect

**Expected Result:**

- **UI:** redirect to `/onboarding`
- **System State:** session created
- **Note:** requires PO/Dev confirmation

---

## 🔗 Integration Test Cases (If Applicable)

### Integration Test 1: Frontend ↔ Backend Login

**Integration Point:** Frontend → Backend API (`POST /api/auth/login`)
**Type:** Integration
**Priority:** High

**Preconditions:**

- Backend API is running
- Frontend can reach API endpoint

**Test Flow:**

1. Frontend submits login request
2. API authenticates with Supabase Auth
3. API returns response
4. Frontend handles redirect and session state

**Contract Validation:**

- Request format matches OpenAPI spec: ✅ Yes
- Response format matches OpenAPI spec: ✅ Yes
- Status codes match spec: ✅ Yes

**Expected Result:**

- Integration successful
- Session cookie set and redirect handled correctly

---

### Integration Test 2: Backend ↔ Supabase Auth + DB

**Integration Point:** Backend → Supabase Auth + PostgreSQL
**Type:** Integration
**Priority:** High

**Preconditions:**

- Supabase Auth available
- `profiles` table accessible

**Test Flow:**

1. API calls `signInWithPassword`
2. On success, update `profiles.last_login_at`

**Expected Result:**

- Auth success returns session
- DB updated with current timestamp

---

## 📊 Edge Cases Summary

| Edge Case                     | Covered in Original Story? | Added to Refined AC?     | Test Case                         | Priority |
| ----------------------------- | -------------------------- | ------------------------ | --------------------------------- | -------- |
| Email con espacios/mayusculas | ❌ No                      | ✅ Yes (Scenario 6)      | Should normalize email input      | Medium   |
| Login durante lockout         | ❌ No                      | ✅ Yes (Scenario 5)      | Should block login during lockout | High     |
| Unverified + wrong password   | ❌ No                      | ⚠️ Needs PO confirmation | TBD                               | High     |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type       | Count | Purpose        | Examples                                  |
| --------------- | ----- | -------------- | ----------------------------------------- |
| Valid data      | 2     | Positive tests | `valentina.login@soloq.test`, `Valid1234` |
| Invalid data    | 4     | Negative tests | `ghost@soloq.test`, `Wrong1234`           |
| Boundary values | 2     | Boundary tests | empty email/password, whitespace email    |
| Edge case data  | 2     | Edge cases     | unverified user, locked out user          |

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

---

## 📝 PARTE 2: Integracion y Output

---

## 📋 Test Execution Tracking

[Esta seccion se completa durante ejecucion]

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

---
