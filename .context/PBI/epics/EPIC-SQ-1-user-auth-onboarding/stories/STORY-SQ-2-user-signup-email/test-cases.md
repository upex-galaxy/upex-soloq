## 🧪 Shift-Left Test Cases - Generated 2026-01-29

**QA Engineer:** AI-Generated
**Status:** Draft - Pending PO/Dev Review

---

# Test Cases: STORY-SQ-2 - User Registration with Email and Password

**Fecha:** 2026-01-29
**QA Engineer:** AI-Generated
**Story Jira Key:** SQ-2
**Epic:** EPIC-SQ-1 - User Authentication & Onboarding
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Diseñador Organizado) - necesita registro rapido para crear su primera factura.
- **Secondary:** Valentina (Desarrolladora Internacional) - requiere acceso confiable para iniciar uso continuo.

**Business Value:**

- **Value Proposition:** habilita el acceso inicial a la plataforma y acelera el tiempo a la primera factura.
- **Business Impact:** impacta KPIs de usuarios registrados, conversion y retencion temprana (D7).

**Related User Journey:**

- Journey: Journey 1: Registro y Primera Factura
- Step: Paso 1-2 (Landing y Registro + Verificacion de Email)

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: RegisterForm, PasswordStrengthMeter
- Pages/Routes: /auth/register
- State Management: React Hook Form + Zod (form state)

**Backend:**

- API Endpoints: POST /api/auth/register (OpenAPI: POST /auth/register)
- Services: Supabase Auth signUp, profile creation
- Database: auth.users (Supabase), profiles

**External Services:**

- Supabase Auth (user creation, verification email)
- Email delivery (Supabase built-in o Resend)

**Integration Points:**

- Frontend ↔ Backend API (/api/auth/register)
- Backend ↔ Supabase Auth (signUp)
- Backend ↔ Database (profiles)
- Supabase Auth ↔ Email provider (verification email)

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic complexity: Medium - validaciones de password y verificacion de email.
- Integration complexity: Medium - Supabase Auth + email delivery + DB.
- Data validation complexity: Medium-High - reglas estrictas de email/password y duplicados.
- UI complexity: Medium - validacion en tiempo real + feedback visual.

**Estimated Test Effort:** Medium
**Rationale:** flujo core con multiples validaciones, integraciones y dependencia de email delivery.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**

- Risk 1: Fallas en verificacion de email o delays de entrega
  - **Relevance to This Story:** afecta directamente el mensaje de exito y el paso de verificacion.
- Risk 2: Manejo incorrecto de sesiones
  - **Relevance to This Story:** baja relevancia; registro no crea sesion activa.

**Integration Points from Epic Analysis:**

- Integration Point 1: Frontend ↔ Backend API
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** envio de datos de registro y manejo de respuestas.
- Integration Point 2: Backend ↔ Supabase Auth
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** creacion de usuario y disparo de email de verificacion.
- Integration Point 3: Backend ↔ Database (profiles)
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** creacion de profile al registrar.
- Integration Point 4: Auth ↔ Email Provider
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** entrega del email de verificacion.

**Critical Questions Already Asked at Epic Level:**

**Questions for PO:**

- Question 1: Se permite reenvio de verificacion y desde que pantalla?
  - **Status:** ⏳ Pending
  - **Impact on This Story:** define UX y casos de error cuando el email no llega.

**Questions for Dev:**

- Question 1: Duracion exacta de sesion con "Remember me"
  - **Status:** ❌ Not Relevant to This Story
  - **Impact on This Story:** no aplica a registro.

**Test Strategy from Epic:**

- Test Levels: Unit, Integration, E2E, API
- Tools: Playwright (E2E), Vitest/Jest (unit), Postman/Playwright API
- **How This Story Aligns:** requiere UI, API, y pruebas de integracion con Supabase Auth y email.

**Updates and Clarifications from Epic Refinement:**

- Update 1: No se identificaron actualizaciones adicionales en comentarios locales.

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** habilita el primer paso del journey y desbloquea el onboarding.
- **Inherited Risks:** entrega de email y consistencia Auth ↔ profiles.
- **Unique Considerations:** validacion en tiempo real de password y mensajes UX.

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Flujo de reenvio de verificacion y expiracion del link

- **Location in Story:** Description + AC (no menciona reenvio)
- **Question for PO/Dev:** se debe permitir reenviar desde la pantalla de exito o login? cual es el limite?
- **Impact on Testing:** no se puede validar recuperacion si el email no llega.
- **Suggested Clarification:** agregar AC para reenvio y mensaje cuando el link expira.

**Ambiguity 2:** Mensajes exactos de validacion de password

- **Location in Story:** Scenario 3 ("indicating what's missing")
- **Question for PO:** cual es el copy exacto en UI (y en espanol)?
- **Impact on Testing:** validacion UI no es verificable sin texto esperado.
- **Suggested Clarification:** definir mensajes de error por regla (longitud, mayuscula, numero).

---

### Missing Information / Gaps

**Gap 1:** Reglas de rate limiting y bloqueo en registro

- **Type:** Business Rule / Security
- **Why It's Critical:** afecta pruebas negativas y comportamiento ante abuso.
- **Suggested Addition:** definir limite (ej: 5 intentos/15 min) y mensaje.
- **Impact if Not Added:** riesgo de abuso y falta de cobertura de seguridad.

**Gap 2:** Limites maximos de email/password en UI

- **Type:** Acceptance Criteria / Validation
- **Why It's Critical:** FR-001 define max 254/128, no reflejado en AC.
- **Suggested Addition:** agregar escenarios boundary en AC.
- **Impact if Not Added:** inconsistencias entre frontend y backend.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Email con mayusculas/espacios al inicio/fin

- **Scenario:** Usuario escribe " Carlos@Example.com "
- **Expected Behavior:** sistema normaliza (trim + lowercase) antes de validar duplicados.
- **Criticality:** Medium
- **Action Required:** Add to test cases only

**Edge Case 2:** Email longitud maxima 254 chars

- **Scenario:** Email valido de longitud 254
- **Expected Behavior:** registro permitido si cumple formato.
- **Criticality:** Medium
- **Action Required:** Add to refined AC

**Edge Case 3:** Password longitud maxima 128 chars

- **Scenario:** Password con 129 chars
- **Expected Behavior:** rechazo con error de validacion.
- **Criticality:** Medium
- **Action Required:** Add to refined AC

**Edge Case 4:** Falla temporal de envio de email

- **Scenario:** Supabase/Resend falla al enviar verificacion
- **Expected Behavior:** mostrar error y permitir reintento (needs confirmation)
- **Criticality:** High
- **Action Required:** Ask PO/Dev

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues (if any):**

- [x] Acceptance criteria are vague or subjective
- [x] Missing test data examples
- [x] Missing error scenarios

**Recommendations to Improve Testability:**

- Definir mensajes de error exactos y reglas de rate limiting.
- Incluir escenarios boundary (email 254, password 128).

---

## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Successful registration with valid data

**Type:** Positive
**Priority:** Critical

- **Given:**
  - No existe usuario con email "carlos.mendez@example.com" en auth.users
  - API POST /api/auth/register disponible

- **When:**
  - User enters email "carlos.mendez@example.com"
  - Password "Soloq123" y confirm "Soloq123"
  - Click en "Create Account"

- **Then:**
  - UI muestra mensaje "Check your email" / "Revisa tu email" (texto final por PO)
  - API responde 201 con `{ success: true, message: "Verification email sent", userId: <uuid> }`
  - Registro en auth.users creado
  - Registro en profiles creado con `email_verified_at = null`
  - Email de verificacion enviado

---

### Scenario 2: Registration fails with existing email

**Type:** Negative
**Priority:** High

- **Given:**
  - Existe usuario con email "carlos.mendez@example.com"

- **When:**
  - User enters email "carlos.mendez@example.com" y password valido

- **Then:**
  - UI muestra error "This email is already registered" y link a login
  - API responde 409 con `{ success: false, error: { code: "EMAIL_EXISTS", message: "Email already registered" } }`
  - No se crea nuevo registro en auth.users ni profiles

---

### Scenario 3: Registration fails with weak password

**Type:** Negative
**Priority:** High

- **Given:**
  - Usuario en /auth/register

- **When:**
  - User enters password "soloq123" (sin mayuscula)

- **Then:**
  - UI muestra validacion en tiempo real indicando regla faltante
  - **Suggested copy:** "Debe incluir al menos 1 mayuscula" (pendiente PO)
  - No permite submit mientras falte requisito

---

### Scenario 4: Registration fails with mismatched passwords

**Type:** Negative
**Priority:** High

- **Given:**
  - Usuario en /auth/register

- **When:**
  - Password "Soloq123" y confirm "Soloq124"

- **Then:**
  - UI muestra error "Passwords do not match"
  - API no es llamada si hay validacion client-side

---

### Scenario 5: Registration fails with invalid email format

**Type:** Negative
**Priority:** High

- **Given:**
  - Usuario en /auth/register

- **When:**
  - User enters email "not-an-email"

- **Then:**
  - UI muestra error "Please enter a valid email address"
  - API no es llamada si hay validacion client-side

---

### Scenario 6: Boundary - max email length

**Type:** Boundary
**Priority:** Medium

- **Given:**
  - Email de longitud 254 chars con formato valido

- **When:**
  - User submits registro con password valido

- **Then:**
  - Registro permitido (201) y email de verificacion enviado

---

### Scenario 7: Boundary - password length exceeds 128

**Type:** Boundary
**Priority:** Medium

- **Given:**
  - Password con 129 chars

- **When:**
  - User submits registro

- **Then:**
  - API responde 400 con `VALIDATION_ERROR`
  - UI muestra error de longitud maxima

---

### Scenario 8: Edge Case - verification email delivery failure

**Type:** Edge Case
**Priority:** High
**Source:** Identified during critical analysis (Paso 2)

- **Given:**
  - Supabase/Resend falla al enviar email

- **When:**
  - User submits registro valido

- **Then:**
  - Comportamiento esperado pendiente de PO/Dev (reintento, mensaje, rollback?)
  - **⚠️ NOTE:** This scenario was NOT in original story - needs PO/Dev confirmation

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 13

**Breakdown:**

- Positive: 2 test cases
- Negative: 5 test cases
- Boundary: 2 test cases
- Integration: 2 test cases
- API: 2 test cases

**Rationale for This Number:**
validaciones estrictas, duplicados, integraciones con Auth/Email y reglas boundary.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Reglas de password

- **Base Scenario:** Validacion de password en tiempo real
- **Parameters to Vary:** longitud, mayuscula, minuscula, numero
- **Test Data Sets:**

| Password | Missing Rule   | Expected Result             |
| -------- | -------------- | --------------------------- |
| soloq123 | uppercase      | Error "falta mayuscula"     |
| SOLOQ123 | lowercase      | Error "falta minuscula"     |
| Soloqabc | number         | Error "falta numero"        |
| So1      | min length (8) | Error "minimo 8 caracteres" |

**Total Tests from Parametrization:** 4
**Benefit:** reduce duplicacion y cubre reglas completas.

---

**Parametrized Test Group 2:** Formatos de email invalidos

- **Base Scenario:** Validacion de formato email
- **Parameters to Vary:** falta @, dominio invalido, espacios, doble punto
- **Test Data Sets:**

| Email                 | Expected Result        |
| --------------------- | ---------------------- |
| not-an-email          | Error formato invalido |
| user@                 | Error formato invalido |
| user@domain           | Error formato invalido |
| user..name@domain.com | Error formato invalido |

**Total Tests from Parametrization:** 4
**Benefit:** coverage amplia con una sola estructura.

---

### Test Outlines

#### **Validar registro exitoso con datos validos**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**

- Usuario sin cuenta previa
- Endpoint /api/auth/register disponible

**Test Steps:**

1. Abrir /auth/register
2. Ingresar email "carlos.mendez@example.com"
   - **Data:** password "Soloq123", confirm "Soloq123"
3. Click en "Create Account"
   - **Verify:** mensaje de exito en pantalla

**Expected Result:**

- **UI:** se muestra mensaje "Check your email" / "Revisa tu email"
- **API Response:** Status Code 201
- **Database:** registro en auth.users y profiles creado

**Test Data:**

```json
{
  "input": {
    "email": "carlos.mendez@example.com",
    "password": "Soloq123",
    "confirmPassword": "Soloq123"
  }
}
```

**Post-conditions:**

- Cuenta creada; limpiar usuario si aplica

---

#### **Validar mensaje de email ya registrado con link a login**

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

**Preconditions:**

- Existe usuario con email "carlos.mendez@example.com"

**Test Steps:**

1. Abrir /auth/register
2. Ingresar email existente y password valido
3. Click en "Create Account"

**Expected Result:**

- **UI:** error "This email is already registered" + link a login
- **API Response:** 409 EMAIL_EXISTS
- **Database:** sin nuevos registros

**Test Data:**

```json
{
  "input": {
    "email": "carlos.mendez@example.com",
    "password": "Soloq123",
    "confirmPassword": "Soloq123"
  }
}
```

**Post-conditions:**

- Sin cambios

---

#### **Validar error de formato de email cuando es invalido**

**Related Scenario:** Scenario 5
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 2)

**Preconditions:**

- Usuario en /auth/register

**Test Steps:**

1. Ingresar email invalido
2. Verificar mensaje de error inmediato

**Expected Result:**

- **UI:** error "Please enter a valid email address"
- **API Response:** no llamada

**Test Data:**

```json
{
  "input": {
    "email": "not-an-email",
    "password": "Soloq123",
    "confirmPassword": "Soloq123"
  }
}
```

**Post-conditions:**

- Sin cambios

---

#### **Validar reglas de password debil en tiempo real**

**Related Scenario:** Scenario 3
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- Usuario en /auth/register

**Test Steps:**

1. Ingresar password con regla faltante
2. Verificar mensaje de error especifico

**Expected Result:**

- **UI:** se muestra regla faltante correspondiente
- **API Response:** no llamada

**Test Data:**

```json
{
  "input": {
    "email": "valentina@example.com",
    "password": "soloq123",
    "confirmPassword": "soloq123"
  }
}
```

**Post-conditions:**

- Sin cambios

---

#### **Validar error cuando passwords no coinciden**

**Related Scenario:** Scenario 4
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

**Preconditions:**

- Usuario en /auth/register

**Test Steps:**

1. Ingresar password "Soloq123" y confirm "Soloq124"
2. Intentar submit

**Expected Result:**

- **UI:** "Passwords do not match"
- **API Response:** no llamada

**Test Data:**

```json
{
  "input": {
    "email": "andres@example.com",
    "password": "Soloq123",
    "confirmPassword": "Soloq124"
  }
}
```

**Post-conditions:**

- Sin cambios

---

#### **Validar limite maximo de email 254 caracteres**

**Related Scenario:** Scenario 6
**Type:** Boundary
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ❌ No

**Preconditions:**

- Email valido de 254 chars

**Test Steps:**

1. Ingresar email de 254 chars
2. Completar password valido y submit

**Expected Result:**

- **UI:** registro permitido
- **API Response:** 201

**Test Data:**

```json
{
  "input": {
    "email": "long-254@example.com",
    "password": "Soloq123",
    "confirmPassword": "Soloq123"
  }
}
```

**Post-conditions:**

- Usuario creado; limpiar si aplica

---

#### **Validar rechazo cuando password supera 128 caracteres**

**Related Scenario:** Scenario 7
**Type:** Boundary
**Priority:** Medium
**Test Level:** API
**Parametrized:** ❌ No

**Preconditions:**

- API disponible

**Test Steps:**

1. Enviar POST /api/auth/register con password 129 chars
2. Verificar error de validacion

**Expected Result:**

- **Status Code:** 400 Bad Request
- **Response Body:** `VALIDATION_ERROR`
- **Database:** sin cambios

**Test Data:**

```json
{
  "input": {
    "email": "maxpass@example.com",
    "password": "<129-chars>",
    "confirmPassword": "<129-chars>"
  }
}
```

**Post-conditions:**

- Sin cambios

---

#### **Validar normalizacion de email con espacios y mayusculas**

**Related Scenario:** Edge Case 1
**Type:** Edge Case
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ❌ No

**Preconditions:**

- Existe usuario con email "carlos@example.com"

**Test Steps:**

1. Ingresar email " Carlos@Example.com "
2. Submit con password valido

**Expected Result:**

- **UI:** error de email duplicado si se normaliza
- **API Response:** 409 EMAIL_EXISTS

**Test Data:**

```json
{
  "input": {
    "email": "  Carlos@Example.com  ",
    "password": "Soloq123",
    "confirmPassword": "Soloq123"
  }
}
```

**Post-conditions:**

- Sin cambios

---

#### **Validar respuesta API 201 con payload esperado**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** High
**Test Level:** API
**Parametrized:** ❌ No

**Preconditions:**

- Email no existente

**Test Steps:**

1. POST /api/auth/register con payload valido
2. Verificar status y response body

**Expected Result:**

- **Status Code:** 201 Created
- **Response Body:** `{ "success": true, "message": "Verification email sent", "userId": "<uuid>" }`

**Test Data:**

```json
{
  "input": {
    "email": "api.user@example.com",
    "password": "Soloq123",
    "confirmPassword": "Soloq123"
  }
}
```

**Post-conditions:**

- Usuario creado; limpiar si aplica

---

#### **Validar respuesta API 409 cuando email ya existe**

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** API
**Parametrized:** ❌ No

**Preconditions:**

- Email existente en auth.users

**Test Steps:**

1. POST /api/auth/register con email existente
2. Verificar response

**Expected Result:**

- **Status Code:** 409 Conflict
- **Response Body:** `{ "success": false, "error": { "code": "EMAIL_EXISTS" } }`

**Test Data:**

```json
{
  "input": {
    "email": "carlos.mendez@example.com",
    "password": "Soloq123",
    "confirmPassword": "Soloq123"
  }
}
```

**Post-conditions:**

- Sin cambios

---

#### **Validar integracion registro -> Supabase Auth -> profiles**

**Related Scenario:** Scenario 1
**Type:** Integration
**Priority:** High
**Test Level:** Integration
**Parametrized:** ❌ No

**Preconditions:**

- Supabase Auth disponible
- DB accesible

**Test Steps:**

1. Ejecutar registro valido
2. Consultar auth.users y profiles

**Expected Result:**

- Usuario creado en auth.users
- Profile creado con user_id correspondiente

**Test Data:**

```json
{
  "input": {
    "email": "profile.check@example.com",
    "password": "Soloq123",
    "confirmPassword": "Soloq123"
  }
}
```

**Post-conditions:**

- Limpiar usuario si aplica

---

#### **Validar integracion envio de email de verificacion**

**Related Scenario:** Scenario 1
**Type:** Integration
**Priority:** High
**Test Level:** Integration
**Parametrized:** ❌ No

**Preconditions:**

- Email provider configurado (Supabase/Resend)

**Test Steps:**

1. Ejecutar registro valido
2. Verificar envio en logs o inbox de testing

**Expected Result:**

- Email enviado con link de verificacion
- No errores en logs

**Test Data:**

```json
{
  "input": {
    "email": "email.verify@example.com",
    "password": "Soloq123",
    "confirmPassword": "Soloq123"
  }
}
```

**Post-conditions:**

- Limpiar usuario si aplica

---

## 🔗 Integration Test Cases (If Applicable)

### Integration Test 1: Frontend ↔ Backend API

**Integration Point:** Frontend → Backend API
**Type:** Integration
**Priority:** High

**Preconditions:**

- Backend API running
- Frontend can reach /api/auth/register

**Test Flow:**

1. Frontend sends request to POST /api/auth/register
2. API validates schema
3. API returns response
4. Frontend shows success/error

**Contract Validation:**

- Request format matches OpenAPI spec: ✅ Yes
- Response format matches OpenAPI spec: ✅ Yes
- Status codes match spec: ✅ Yes

**Expected Result:**

- Integracion exitosa sin perdida de datos

---

### Integration Test 2: Backend ↔ Email Provider

**Integration Point:** Backend → Email provider (Supabase/Resend)
**Type:** Integration
**Priority:** High

**Mock Strategy:**

- Email provider mocked en automation
- Real envio validado manualmente en staging
- Mock tool: MSW/Nock (segun stack)

**Test Flow:**

1. Backend ejecuta signUp
2. Email provider recibe request
3. Email enviado al inbox de prueba

**Expected Result:**

- Email enviado con link valido

---

## 📊 Edge Cases Summary

| Edge Case                     | Covered in Original Story? | Added to Refined AC?     | Test Case | Priority |
| ----------------------------- | -------------------------- | ------------------------ | --------- | -------- |
| Email con espacios/mayusculas | ❌ No                      | ❌ No                    | TC-EC-01  | Medium   |
| Email longitud 254            | ❌ No                      | ✅ Yes (Scenario 6)      | TC-B-01   | Medium   |
| Password longitud >128        | ❌ No                      | ✅ Yes (Scenario 7)      | TC-B-02   | Medium   |
| Falla envio de email          | ❌ No                      | ⚠️ Needs PO confirmation | TC-EC-02  | High     |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type       | Count | Purpose         | Examples                            |
| --------------- | ----- | --------------- | ----------------------------------- |
| Valid data      | 3     | Positive tests  | carlos.mendez@example.com, Soloq123 |
| Invalid data    | 6     | Negative tests  | not-an-email, soloq123, Soloqabc    |
| Boundary values | 2     | Boundary tests  | email 254 chars, password 129 chars |
| Edge case data  | 2     | Edge case tests | " Carlos@Example.com ", email fail  |

### Data Generation Strategy

**Static Test Data:**

- Emails especificos para duplicados
- Passwords con reglas faltantes

**Dynamic Test Data (using Faker.js):**

- `faker.internet.email()` para usuarios nuevos
- `faker.string.alphanumeric(120)` para longitudes

**Test Data Cleanup:**

- ✅ All test data is cleaned up after test execution
- ✅ Tests are idempotent (can run multiple times)
- ✅ Tests do not depend on execution order

---

## 📋 Test Execution Tracking

[Esta seccion se completa durante ejecucion]

**Test Execution Date:** TBD
**Environment:** Staging
**Executed By:** TBD

**Results:**

- Total Tests: TBD
- Passed: TBD
- Failed: TBD
- Blocked: TBD

**Bugs Found:**

- TBD

**Sign-off:** TBD

---

## 📢 Action Required

**@PO:**

- [ ] Review and answer Critical Questions (see Paso 8 below)
- [ ] Validate suggested story improvements
- [ ] Confirm expected behavior for identified edge cases

**@Dev:**

- [ ] Review Technical Questions (see Paso 8 below)
- [ ] Validate integration points and test approach
- [ ] Confirm test data strategy

**@QA:**

- [ ] Review test cases for completeness
- [ ] Validate parametrization strategy
- [ ] Prepare test environment

---

**Next Steps:**

1. Team discusses critical questions and ambiguities
2. PO/Dev provide answers and clarifications
3. QA updates test cases based on feedback
4. Dev starts implementation with clear acceptance criteria

---

**Documentation:** Full test cases also available at:
`.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/stories/STORY-SQ-2-user-signup-email/test-cases.md`
