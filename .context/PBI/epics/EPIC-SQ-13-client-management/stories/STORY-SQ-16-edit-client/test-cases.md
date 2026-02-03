# Test Cases: STORY-SQ-16 - Edit Client Data

**Fecha:** 2026-02-03
**QA Engineer:** AI-Generated
**Story Jira Key:** SQ-16
**Epic:** EPIC-SQ-13 - Client Management
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Disenador Organizado) - Necesita mantener datos de clientes correctos para facturar rapido y sin errores.
- **Secondary:** Andres (Consultor Tradicional) - Maneja muchos clientes y requiere datos actualizados para cobros y seguimiento.

**Business Value:**

- **Value Proposition:** Mantener datos de clientes correctos reduce errores en facturas y evita fricciones con pagos.
- **Business Impact:** Mejora eficiencia y reduce tiempo administrativo, impactando el KPI "Time to First Invoice" y retencion.

**Related User Journey:**

- Journey: "Registro y Primera Factura"
- Step: Paso 8-9 (Crear cliente y agregar datos) y mantenimiento continuo de datos para facturacion.

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: ClientForm, ClientDetails, ClientsList
- Pages/Routes: `/clients`, `/clients/[id]`
- State Management: React Hook Form + Zod (validaciones)

**Backend:**

- API Endpoints: PUT `/api/clients/:id`
- Services: Validacion Zod server-side, Supabase client
- Database: `clients` (name, email, company, phone, address, tax_id, notes, updated_at)

**External Services:**

- Supabase Auth (session y RLS)

**Integration Points:**

- Frontend <-> API `/api/clients/:id`
- API <-> PostgreSQL (`clients`)
- API <-> Supabase Auth (RLS)

---

### Story Complexity Analysis

**Overall Complexity:** Low

**Complexity Factors:**

- Business logic complexity: Low - actualizacion de campos existentes.
- Integration complexity: Medium - depende de RLS y constraint UNIQUE(user_id, email).
- Data validation complexity: Medium - mismas reglas que crear (FR-010/FR-012).
- UI complexity: Low - formulario con validaciones y confirmacion.

**Estimated Test Effort:** Medium
**Rationale:** Se requiere cubrir validaciones, constraint de email unico y RLS.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Nota:** No se pudo leer comentarios del epic en Jira (MCP Atlassian no disponible). Se uso `feature-test-plan.md` local como fuente.

**Critical Risks Already Identified at Epic Level:**

- Risk 1: RLS Policies - Data Isolation Failure
  - **Relevance to This Story:** La edicion debe impedir modificar clientes de otros usuarios.
- Risk 2: Unique Constraint per User
  - **Relevance to This Story:** Cambiar email a uno ya usado por el mismo usuario debe fallar.

**Integration Points from Epic Analysis:**

- Integration Point 1: Frontend <-> Backend API
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** Formulario de edicion llama PUT `/api/clients/:id`.
- Integration Point 2: API <-> PostgreSQL
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** Update en `clients` con `updated_at`.
- Integration Point 3: API <-> Supabase Auth (RLS)
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** Validar aislamiento por `user_id`.

**Critical Questions Already Asked at Epic Level:**

**Questions for PO:**

- Question 1: Limite de clientes por plan Free vs Pro?
  - **Status:** ⏳ Pending
  - **Impact on This Story:** Puede afectar edicion si hay limites o reglas por plan.

**Questions for Dev:**

- Question 1: Comportamiento de busqueda (case-insensitive, partial)?
  - **Status:** ❌ Not Relevant to This Story
  - **Impact on This Story:** No aplica directamente.

**Test Strategy from Epic:**

- Test Levels: Unit, Integration, E2E, API
- Tools: Playwright, Vitest/Jest, Postman/Newman o Playwright API
- **How This Story Aligns:** Enfasis en UI/API e integracion (RLS + DB), con validaciones en frontend y backend.

**Updates and Clarifications from Epic Refinement:**

- No disponibles (comentarios Jira no accesibles).

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** Implementa la actualizacion de datos de clientes en UI y API.
- **Inherited Risks:** RLS y email unico por usuario.
- **Unique Considerations:** Edicion parcial vs completa y comportamiento al limpiar campos opcionales.

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Campos exactos editables

- **Location in Story:** User Story / Acceptance Criteria
- **Question for PO/Dev:** Que campos son editables en esta story (name, email, company, phone, address, tax_id, notes)?
- **Impact on Testing:** No se puede definir cobertura completa sin saber alcance de campos.
- **Suggested Clarification:** Listar campos editables y cuales son obligatorios.

**Ambiguity 2:** Comportamiento al editar email duplicado

- **Location in Story:** Technical Notes (no menciona respuesta esperada)
- **Question for PO/Dev:** Si se edita el email a uno ya usado por otro cliente del mismo usuario, cual es el mensaje y status esperado?
- **Impact on Testing:** Esperado UI/API incierto (409 vs 400) y mensaje.
- **Suggested Clarification:** Especificar error y mensaje de validacion.

**Ambiguity 3:** Edicion parcial vs completa

- **Location in Story:** Technical Notes / API PUT
- **Question for Dev:** El PUT requiere payload completo o permite actualizar solo campos editados?
- **Impact on Testing:** Cambia los casos de validacion (campos requeridos).
- **Suggested Clarification:** Confirmar contrato de API (ClientInput completo vs parcial) y comportamiento UI.

---

### Missing Information / Gaps

**Gap 1:** Mensajes de validacion esperados

- **Type:** Acceptance Criteria
- **Why It's Critical:** Necesarios para validar UI y errores de API.
- **Suggested Addition:** Definir mensajes de error y campos marcados.
- **Impact if Not Added:** Tests no pueden verificar errores de forma precisa.

**Gap 2:** Comportamiento al limpiar campos opcionales

- **Type:** Business Rule
- **Why It's Critical:** Usuarios pueden querer borrar phone/address/notes.
- **Suggested Addition:** Aclarar si vacio/null se acepta y como se persiste.
- **Impact if Not Added:** Inconsistencias en UI/DB.

**Gap 3:** Confirmacion post-guardado

- **Type:** UX Detail
- **Why It's Critical:** Necesario para validar flujo (toast, redirect, updated_at visible).
- **Suggested Addition:** Especificar feedback de guardado y redireccion.
- **Impact if Not Added:** Dificil validar estado final esperado.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Email duplicado para el mismo usuario

- **Scenario:** Usuario cambia email del cliente a uno ya existente en otro cliente suyo
- **Expected Behavior:** Debe rechazarse con error claro, sin cambios en DB
- **Criticality:** High
- **Action Required:** Add to story + test cases

**Edge Case 2:** Edicion sin cambios (mismo valor)

- **Scenario:** Usuario guarda sin modificar campos
- **Expected Behavior:** No debe fallar; idealmente mantiene datos y actualiza updated_at o no (definir)
- **Criticality:** Medium
- **Action Required:** Ask PO/Dev

**Edge Case 3:** Limites maximos de longitud

- **Scenario:** name 100 chars, email 254 chars, phone 20, address 500, notes 1000
- **Expected Behavior:** Debe aceptar al limite y rechazar si excede
- **Criticality:** Medium
- **Action Required:** Add to test cases

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues (if any):**

- [ ] Acceptance criteria are vague or subjective
- [x] Expected results are not specific enough
- [x] Missing test data examples
- [x] Missing error scenarios
- [ ] Missing performance criteria (if NFR applies)
- [x] Cannot be tested in isolation (missing dependencies info)

**Recommendations to Improve Testability:**

- Definir mensajes de error esperados y status codes
- Aclarar si el payload de update es completo o parcial
- Confirmar comportamiento al guardar sin cambios y al limpiar campos

---

## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Edicion exitosa de datos basicos

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Usuario autenticado con un cliente existente (id: `client-123`)
  - Cliente actual: name="Empresa ABC", email="cliente@empresa.com"

- **When:**
  - Usuario cambia name a "Empresa ABC SRL" y guarda

- **Then:**
  - UI muestra confirmacion de guardado
  - Detalle del cliente muestra el nuevo name
  - API responde 200 OK
  - DB `clients.name` se actualiza y `updated_at` cambia

---

### Scenario 2: Edicion exitosa del email con valor valido

**Type:** Positive
**Priority:** High

- **Given:**
  - Usuario autenticado
  - Cliente existente con email "cliente@empresa.com"

- **When:**
  - Usuario cambia email a "nuevo@empresa.com" y guarda

- **Then:**
  - Nuevo email queda persistido
  - API responde 200 OK
  - DB refleja el nuevo email

---

### Scenario 3: Error por datos invalidos

**Type:** Negative
**Priority:** High

- **Given:**
  - Usuario autenticado
  - Cliente existente

- **When:**
  - Usuario ingresa email "not-an-email" o name vacio y guarda

- **Then:**
  - UI muestra errores de validacion en los campos
  - API responde 400 Validation Error
  - DB no cambia

---

### Scenario 4: Email duplicado del mismo usuario

**Type:** Negative
**Priority:** High
**Source:** Identified during critical analysis (Paso 2)

- **Given:**
  - Usuario autenticado con dos clientes
  - Cliente A email "a@empresa.com"
  - Cliente B email "b@empresa.com"

- **When:**
  - Usuario edita Cliente B y cambia email a "a@empresa.com"

- **Then:**
  - API responde 409 Conflict (o error definido por PO/Dev)
  - UI muestra mensaje "Ya existe un cliente con este email"
  - DB no cambia

---

### Scenario 5: Limites de longitud aceptados

**Type:** Boundary
**Priority:** Medium

- **Given:**
  - Usuario autenticado
  - Cliente existente

- **When:**
  - Usuario ingresa valores exactamente en limite: name 100 chars, email 254 chars, phone 20, address 500, notes 1000

- **Then:**
  - El sistema acepta y guarda
  - API responde 200 OK

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 8

**Breakdown:**

- Positive: 2 test cases
- Negative: 3 test cases
- Boundary: 2 test cases
- Integration: 1 test case
- API: 0 test cases (cubiertos via UI + integration)

**Rationale for This Number:**

La story es de complejidad baja, pero requiere cubrir validaciones, constraint de email unico y RLS. 8 casos cubren happy paths, errores y limites sin sobrecarga.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Validaciones de email invalido

- **Base Scenario:** Guardado con email invalido
- **Parameters to Vary:** formato de email
- **Test Data Sets:**

| Email          | Expected Result              |
| -------------- | ---------------------------- |
| not-an-email   | Error de validacion en email |
| missing@domain | Error de validacion en email |
| @nodomain.com  | Error de validacion en email |

**Total Tests from Parametrization:** 3
**Benefit:** Reduce duplicacion y cubre variedad de formatos invalidos.

---

### Test Outlines

#### **Validar guardado exitoso de datos basicos con valores validos**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Usuario autenticado
- Cliente existente con id `client-123`
- API disponible en staging

---

**Test Steps:**

1. Abrir detalle del cliente `client-123`
   - **Data:** name actual "Empresa ABC"
2. Editar name a "Empresa ABC SRL" y guardar
3. Verificar confirmacion visual de guardado
   - **Verify:** Se muestra mensaje de exito y name actualizado

---

**Expected Result:**

- **UI:** Nombre actualizado y confirmacion visible
- **API Response:** 200 OK
- **Database:**
  - Table: `clients`
  - Record: `id = client-123`
  - Fields: `name = "Empresa ABC SRL"`, `updated_at` actualizado
- **System State:** Cliente actualizado

---

**Test Data:**

```json
{
  "input": {
    "name": "Empresa ABC SRL"
  },
  "user": {
    "email": "qa.user@soloq.app",
    "role": "authenticated"
  }
}
```

---

**Post-conditions:**

- Cliente conserva datos actualizados

---

#### **Validar cambio de email con formato valido**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Usuario autenticado
- Cliente existente con email "cliente@empresa.com"

---

**Test Steps:**

1. Abrir formulario de edicion de cliente
2. Cambiar email a "nuevo@empresa.com" y guardar
3. Verificar que el email se muestra actualizado

---

**Expected Result:**

- **UI:** Email nuevo visible
- **API Response:** 200 OK
- **Database:** `email = "nuevo@empresa.com"`

---

**Test Data:**

```json
{
  "input": {
    "email": "nuevo@empresa.com"
  }
}
```

---

**Post-conditions:**

- Email actualizado

---

#### **Validar error de validacion con email invalido**

**Related Scenario:** Scenario 3
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

---

**Preconditions:**

- Usuario autenticado
- Cliente existente

---

**Test Steps:**

1. Abrir edicion de cliente
2. Ingresar email invalido (dataset parametrizado) y guardar
3. Verificar error en campo email

---

**Expected Result:**

- **UI:** Mensaje de error en email
- **API Response:** 400 Validation Error
- **Database:** Sin cambios

---

**Test Data:**

```json
{
  "input": {
    "email": "not-an-email"
  }
}
```

---

**Post-conditions:**

- Cliente no actualizado

---

#### **Validar error cuando el nombre esta vacio**

**Related Scenario:** Scenario 3
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Usuario autenticado
- Cliente existente

---

**Test Steps:**

1. Abrir edicion de cliente
2. Limpiar el campo name (dejar vacio) y guardar
3. Verificar error en campo name

---

**Expected Result:**

- **UI:** Mensaje de error en name
- **API Response:** 400 Validation Error
- **Database:** Sin cambios

---

#### **Validar rechazo por email duplicado del mismo usuario**

**Related Scenario:** Scenario 4
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Usuario autenticado
- Cliente A email "a@empresa.com"
- Cliente B email "b@empresa.com"

---

**Test Steps:**

1. Abrir edicion del Cliente B
2. Cambiar email a "a@empresa.com" y guardar
3. Verificar mensaje de error

---

**Expected Result:**

- **UI:** Mensaje de error por duplicado
- **API Response:** 409 Conflict (o error definido por PO/Dev)
- **Database:** Sin cambios

---

#### **Validar aceptacion de limites de longitud**

**Related Scenario:** Scenario 5
**Type:** Boundary
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ✅ Yes

---

**Preconditions:**

- Usuario autenticado
- Cliente existente

---

**Test Steps:**

1. Ingresar valores en limites maximos (name 100, email 254, phone 20, address 500, notes 1000)
2. Guardar
3. Verificar que se guarda correctamente

---

**Expected Result:**

- **UI:** Guardado exitoso
- **API Response:** 200 OK
- **Database:** Campos guardados en limites maximos

---

#### **Validar rechazo al exceder limites de longitud**

**Related Scenario:** Scenario 5
**Type:** Boundary
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ✅ Yes

---

**Preconditions:**

- Usuario autenticado
- Cliente existente

---

**Test Steps:**

1. Ingresar name 101 chars o address 501 chars
2. Guardar
3. Verificar error de validacion

---

**Expected Result:**

- **UI:** Error en campo correspondiente
- **API Response:** 400 Validation Error
- **Database:** Sin cambios

---

## 🔗 Integration Test Cases (If Applicable)

### Integration Test 1: Frontend -> API -> DB (update client)

**Integration Point:** Frontend -> Backend API -> DB
**Type:** Integration
**Priority:** High

**Preconditions:**

- Usuario autenticado
- Cliente existente en DB
- API `/api/clients/:id` disponible

**Test Flow:**

1. Frontend envia PUT `/api/clients/{clientId}` con payload valido
2. API valida Zod
3. API actualiza DB
4. Frontend recibe respuesta y actualiza UI

**Contract Validation:**

- Request format matches OpenAPI spec: ✅ Yes
- Response format matches OpenAPI spec: ✅ Yes
- Status codes match spec: ✅ Yes

**Expected Result:**

- Integracion exitosa
- Data flow correcto: Frontend -> API -> DB -> API -> Frontend
- `updated_at` cambia en DB

---

## 📊 Edge Cases Summary

| Edge Case                     | Covered in Original Story? | Added to Refined AC?     | Test Case | Priority |
| ----------------------------- | -------------------------- | ------------------------ | --------- | -------- |
| Email duplicado mismo usuario | ❌ No                      | ✅ Yes (Scenario 4)      | TC-05     | High     |
| Guardar sin cambios           | ❌ No                      | ⚠️ Needs PO confirmation | TBD       | Medium   |
| Limites de longitud           | ❌ No                      | ✅ Yes (Scenario 5)      | TC-06/07  | Medium   |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type       | Count | Purpose         | Examples                                 |
| --------------- | ----- | --------------- | ---------------------------------------- |
| Valid data      | 3     | Positive tests  | "Empresa ABC SRL", "nuevo@empresa.com"   |
| Invalid data    | 4     | Negative tests  | "not-an-email", name vacio               |
| Boundary values | 4     | Boundary tests  | name 100/101 chars, address 500/501      |
| Edge case data  | 1     | Edge case tests | email duplicado dentro del mismo usuario |

### Data Generation Strategy

**Static Test Data:**

- Cliente A: email "a@empresa.com"
- Cliente B: email "b@empresa.com"

**Dynamic Test Data (using Faker.js):**

- Emails validos: `faker.internet.email()`
- Nombres: `faker.person.fullName()`
- Direcciones: `faker.location.streetAddress()`

**Test Data Cleanup:**

- ✅ All test data is cleaned up after test execution
- ✅ Tests are idempotent
- ✅ Tests do not depend on execution order

---

## 📝 PARTE 2: Integracion y Output

**Nota:** No se pudo actualizar Jira ni agregar comentarios por falta de acceso a MCP Atlassian. El archivo local sirve como mirror propuesto.

---

## 📋 Test Execution Tracking

[Esta seccion se completa durante ejecucion]

**Test Execution Date:** TBD
**Environment:** Staging
**Executed By:** TBD

**Results:**

- Total Tests: 8
- Passed: TBD
- Failed: TBD
- Blocked: TBD

**Bugs Found:**

- TBD

**Sign-off:** TBD
