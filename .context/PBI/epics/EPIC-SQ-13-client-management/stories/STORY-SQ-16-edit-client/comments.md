# Comments for SQ-16

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-16)

---

### Joel Armando Ramírez Rodríguez - 2/3/2026, 11:05:02 AM

## 🧪 Shift-Left Test Cases - Generated 2026-02-03

***QA Engineer:*** AI-Generated
***Status:*** Draft - Pending PO/Dev Review

## 

# Test Cases: STORY-SQ-16 - Edit Client Data

***Fecha:*** 2026-02-03
***QA Engineer:*** AI-Generated
***Story Jira Key:*** [https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16](https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16)
***Epic:*** EPIC-SQ-13 - Client Management
***Status:*** Draft

## 

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

***User Persona Affected:***

- ***Primary:*** Carlos (Disenador Organizado) - Necesita mantener datos de clientes correctos para facturar rapido y sin errores.
- ***Secondary:*** Andres (Consultor Tradicional) - Maneja muchos clientes y requiere datos actualizados para cobros y seguimiento.

***Business Value:***

- ***Value Proposition:*** Mantener datos de clientes correctos reduce errores en facturas y evita fricciones con pagos.
- ***Business Impact:*** Mejora eficiencia y reduce tiempo administrativo, impactando el KPI "Time to First Invoice" y retencion.

***Related User Journey:***

- Journey: "Registro y Primera Factura"
- Step: Paso 8-9 (Crear cliente y agregar datos) y mantenimiento continuo de datos para facturacion.

### Technical Context of This Story

***Architecture Components:***

***Frontend:***

- Components: ClientForm, ClientDetails, ClientsList
- Pages/Routes: `/clients`, `/clients/[id]`
- State Management: React Hook Form + Zod (validaciones)

***Backend:***

- API Endpoints: PUT `/api/clients/:id`
- Services: Validacion Zod server-side, Supabase client
- Database: `clients` (name, email, company, phone, address, tax*id, notes, updated*at)

***External Services:***

- Supabase Auth (session y RLS)

***Integration Points:***

- Frontend [-] API `/api/clients/:id`
- API [-] PostgreSQL (`clients`)
- API [-] Supabase Auth (RLS)

### Story Complexity Analysis

***Overall Complexity:*** Low

***Complexity Factors:***

- Business logic complexity: Low - actualizacion de campos existentes.
- Integration complexity: Medium - depende de RLS y constraint UNIQUE(user_id, email).
- Data validation complexity: Medium - mismas reglas que crear (FR-010/FR-012).
- UI complexity: Low - formulario con validaciones y confirmacion.

***Estimated Test Effort:*** Medium
***Rationale:*** Se requiere cubrir validaciones, constraint de email unico y RLS.

## 

### Epic-Level Context (From Feature Test Plan in Jira)

***Critical Risks Already Identified at Epic Level:***

- Risk 1: RLS Policies - Data Isolation Failure
- Risk 2: Unique Constraint per User

***Integration Points from Epic Analysis:***

- Integration Point 1: Frontend [-] Backend API
- Integration Point 2: API [-] PostgreSQL
- Integration Point 3: API [-] Supabase Auth (RLS)

***Critical Questions Already Asked at Epic Level:***

***Questions for PO:***

- Question 1: Limite de clientes por plan Free vs Pro?

***Questions for Dev:***

- Question 1: Comportamiento de busqueda (case-insensitive, partial)?

***Test Strategy from Epic:***

- Test Levels: Unit, Integration, E2E, API
- Tools: Playwright, Vitest/Jest, Postman/Newman o Playwright API
- ***How This Story Aligns:*** Enfasis en UI/API e integracion (RLS + DB), con validaciones en frontend y backend.

***Updates and Clarifications from Epic Refinement:***

- No disponibles (comentarios Jira no accesibles).

***Summary: How This Story Fits in Epic:***

- ***Story Role in Epic:*** Implementa la actualizacion de datos de clientes en UI y API.
- ***Inherited Risks:*** RLS y email unico por usuario.
- ***Unique Considerations:*** Edicion parcial vs completa y comportamiento al limpiar campos opcionales.

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

***Ambiguity 1:*** Campos exactos editables

- ***Location in Story:*** User Story / Acceptance Criteria
- ***Question for PO/Dev:*** Que campos son editables en esta story (name, email, company, phone, address, tax_id, notes)?
- ***Impact on Testing:*** No se puede definir cobertura completa sin saber alcance de campos.
- ***Suggested Clarification:*** Listar campos editables y cuales son obligatorios.

***Ambiguity 2:*** Comportamiento al editar email duplicado

- ***Location in Story:*** Technical Notes (no menciona respuesta esperada)
- ***Question for PO/Dev:*** Si se edita el email a uno ya usado por otro cliente del mismo usuario, cual es el mensaje y status esperado?
- ***Impact on Testing:*** Esperado UI/API incierto (409 vs 400) y mensaje.
- ***Suggested Clarification:*** Especificar error y mensaje de validacion.

***Ambiguity 3:*** Edicion parcial vs completa

- ***Location in Story:*** Technical Notes / API PUT
- ***Question for Dev:*** El PUT requiere payload completo o permite actualizar solo campos editados?
- ***Impact on Testing:*** Cambia los casos de validacion (campos requeridos).
- ***Suggested Clarification:*** Confirmar contrato de API (ClientInput completo vs parcial) y comportamiento UI.

### Missing Information / Gaps

***Gap 1:*** Mensajes de validacion esperados

- ***Type:*** Acceptance Criteria
- ***Why It's Critical:*** Necesarios para validar UI y errores de API.
- ***Suggested Addition:*** Definir mensajes de error y campos marcados.
- ***Impact if Not Added:*** Tests no pueden verificar errores de forma precisa.

***Gap 2:*** Comportamiento al limpiar campos opcionales

- ***Type:*** Business Rule
- ***Why It's Critical:*** Usuarios pueden querer borrar phone/address/notes.
- ***Suggested Addition:*** Aclarar si vacio/null se acepta y como se persiste.
- ***Impact if Not Added:*** Inconsistencias en UI/DB.

***Gap 3:*** Confirmacion post-guardado

- ***Type:*** UX Detail
- ***Why It's Critical:*** Necesario para validar flujo (toast, redirect, updated_at visible).
- ***Suggested Addition:*** Especificar feedback de guardado y redireccion.
- ***Impact if Not Added:*** Dificil validar estado final esperado.

### Edge Cases NOT Covered in Original Story

***Edge Case 1:*** Email duplicado para el mismo usuario

- ***Scenario:*** Usuario cambia email del cliente a uno ya existente en otro cliente suyo
- ***Expected Behavior:*** Debe rechazarse con error claro, sin cambios en DB
- ***Criticality:*** High
- ***Action Required:*** Add to story + test cases

***Edge Case 2:*** Edicion sin cambios (mismo valor)

- ***Scenario:*** Usuario guarda sin modificar campos
- ***Expected Behavior:*** No debe fallar; idealmente mantiene datos y actualiza updated_at o no (definir)
- ***Criticality:*** Medium
- ***Action Required:*** Ask PO/Dev

***Edge Case 3:*** Limites maximos de longitud

- ***Scenario:*** name 100 chars, email 254 chars, phone 20, address 500, notes 1000
- ***Expected Behavior:*** Debe aceptar al limite y rechazar si excede
- ***Criticality:*** Medium
- ***Action Required:*** Add to test cases

### Testability Validation

***Is this story testeable as written?*** ⚠️ Partially

***Testability Issues (if any):***

- [ ] Acceptance criteria are vague or subjective
- [x] Expected results are not specific enough
- [x] Missing test data examples
- [x] Missing error scenarios
- [ ] Missing performance criteria (if NFR applies)
- [x] Cannot be tested in isolation (missing dependencies info)

***Recommendations to Improve Testability:***

- Definir mensajes de error esperados y status codes
- Aclarar si el payload de update es completo o parcial
- Confirmar comportamiento al guardar sin cambios y al limpiar campos

## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Edicion exitosa de datos basicos

***Type:*** Positive
***Priority:*** Critical

- ***Given:***
- ***When:***
- ***Then:***

### Scenario 2: Edicion exitosa del email con valor valido

***Type:*** Positive
***Priority:*** High

- ***Given:***
- ***When:***
- ***Then:***

### Scenario 3: Error por datos invalidos

***Type:*** Negative
***Priority:*** High

- ***Given:***
- ***When:***
- ***Then:***

### Scenario 4: Email duplicado del mismo usuario

***Type:*** Negative
***Priority:*** High
***Source:*** Identified during critical analysis (Paso 2)

- ***Given:***
- ***When:***
- ***Then:***

### Scenario 5: Limites de longitud aceptados

***Type:*** Boundary
***Priority:*** Medium

- ***Given:***
- ***When:***
- ***Then:***

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

***Total Test Cases Needed:*** 8

***Breakdown:***

- Positive: 2 test cases
- Negative: 3 test cases
- Boundary: 2 test cases
- Integration: 1 test case
- API: 0 test cases (cubiertos via UI + integration)

***Rationale for This Number:***

La story es de complejidad baja, pero requiere cubrir validaciones, constraint de email unico y RLS. 8 casos cubren happy paths, errores y limites sin sobrecarga.

## 

### Parametrization Opportunities

***Parametrized Tests Recommended:*** ✅ Yes

***Parametrized Test Group 1:*** Validaciones de email invalido

- ***Base Scenario:*** Guardado con email invalido
- ***Parameters to Vary:*** formato de email
- ***Test Data Sets:***

| ***Email          **** | ****Expected Result              *** |
| --- | --- |
| not-an-email    | Error de validacion en email  |
| missing@domain  | Error de validacion en email  |
| @nodomain.com   | Error de validacion en email  |

***Total Tests from Parametrization:*** 3
***Benefit:*** Reduce duplicacion y cubre variedad de formatos invalidos.

## 

### Test Outlines

#### ***Validar guardado exitoso de datos basicos con valores validos***

***Related Scenario:*** Scenario 1
***Type:*** Positive
***Priority:*** Critical
***Test Level:*** UI
***Parametrized:*** ❌ No

## 

***Preconditions:***

- Usuario autenticado
- Cliente existente con id `client-123`
- API disponible en staging

***Test Steps:***

1. Abrir detalle del cliente `client-123`
2. Editar name a "Empresa ABC SRL" y guardar
3. Verificar confirmacion visual de guardado

***Expected Result:***

- ***UI:*** Nombre actualizado y confirmacion visible
- ***API Response:*** 200 OK
- ***Database:***
- ***System State:*** Cliente actualizado

***Test Data:***

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

## 

***Post-conditions:***

- Cliente conserva datos actualizados

#### ***Validar cambio de email con formato valido***

***Related Scenario:*** Scenario 2
***Type:*** Positive
***Priority:*** High
***Test Level:*** UI
***Parametrized:*** ❌ No

## 

***Preconditions:***

- Usuario autenticado
- Cliente existente con email "cliente@empresa.com"

***Test Steps:***

1. Abrir formulario de edicion de cliente
2. Cambiar email a "nuevo@empresa.com" y guardar
3. Verificar que el email se muestra actualizado

***Expected Result:***

- ***UI:*** Email nuevo visible
- ***API Response:*** 200 OK
- ***Database:*** `email = "nuevo@empresa.com"`

***Test Data:***

```json
{
  "input": {
    "email": "nuevo@empresa.com"
  }
}
```

## 

***Post-conditions:***

- Email actualizado

#### ***Validar error de validacion con email invalido***

***Related Scenario:*** Scenario 3
***Type:*** Negative
***Priority:*** High
***Test Level:*** UI
***Parametrized:*** ✅ Yes (Group 1)

## 

***Preconditions:***

- Usuario autenticado
- Cliente existente

***Test Steps:***

1. Abrir edicion de cliente
2. Ingresar email invalido (dataset parametrizado) y guardar
3. Verificar error en campo email

***Expected Result:***

- ***UI:*** Mensaje de error en email
- ***API Response:*** 400 Validation Error
- ***Database:*** Sin cambios

***Test Data:***

```json
{
  "input": {
    "email": "not-an-email"
  }
}
```

## 

***Post-conditions:***

- Cliente no actualizado

#### ***Validar error cuando el nombre esta vacio***

***Related Scenario:*** Scenario 3
***Type:*** Negative
***Priority:*** High
***Test Level:*** UI
***Parametrized:*** ❌ No

## 

***Preconditions:***

- Usuario autenticado
- Cliente existente

***Test Steps:***

1. Abrir edicion de cliente
2. Limpiar el campo name (dejar vacio) y guardar
3. Verificar error en campo name

***Expected Result:***

- ***UI:*** Mensaje de error en name
- ***API Response:*** 400 Validation Error
- ***Database:*** Sin cambios

#### ***Validar rechazo por email duplicado del mismo usuario***

***Related Scenario:*** Scenario 4
***Type:*** Negative
***Priority:*** High
***Test Level:*** UI
***Parametrized:*** ❌ No

## 

***Preconditions:***

- Usuario autenticado
- Cliente A email "a@empresa.com"
- Cliente B email "b@empresa.com"

***Test Steps:***

1. Abrir edicion del Cliente B
2. Cambiar email a "a@empresa.com" y guardar
3. Verificar mensaje de error

***Expected Result:***

- ***UI:*** Mensaje de error por duplicado
- ***API Response:*** 409 Conflict (o error definido por PO/Dev)
- ***Database:*** Sin cambios

#### ***Validar aceptacion de limites de longitud***

***Related Scenario:*** Scenario 5
***Type:*** Boundary
***Priority:*** Medium
***Test Level:*** UI
***Parametrized:*** ✅ Yes

## 

***Preconditions:***

- Usuario autenticado
- Cliente existente

***Test Steps:***

1. Ingresar valores en limites maximos (name 100, email 254, phone 20, address 500, notes 1000)
2. Guardar
3. Verificar que se guarda correctamente

***Expected Result:***

- ***UI:*** Guardado exitoso
- ***API Response:*** 200 OK
- ***Database:*** Campos guardados en limites maximos

#### ***Validar rechazo al exceder limites de longitud***

***Related Scenario:*** Scenario 5
***Type:*** Boundary
***Priority:*** Medium
***Test Level:*** UI
***Parametrized:*** ✅ Yes

## 

***Preconditions:***

- Usuario autenticado
- Cliente existente

***Test Steps:***

1. Ingresar name 101 chars o address 501 chars
2. Guardar
3. Verificar error de validacion

***Expected Result:***

- ***UI:*** Error en campo correspondiente
- ***API Response:*** 400 Validation Error
- ***Database:*** Sin cambios

## 🔗 Integration Test Cases (If Applicable)

### Integration Test 1: Frontend -> API -> DB (update client)

***Integration Point:*** Frontend -> Backend API -> DB
***Type:*** Integration
***Priority:*** High

***Preconditions:***

- Usuario autenticado
- Cliente existente en DB
- API `/api/clients/:id` disponible

***Test Flow:***

1. Frontend envia PUT `/api/clients/{clientId`} con payload valido
2. API valida Zod
3. API actualiza DB
4. Frontend recibe respuesta y actualiza UI

***Contract Validation:***

- Request format matches OpenAPI spec: ✅ Yes
- Response format matches OpenAPI spec: ✅ Yes
- Status codes match spec: ✅ Yes

***Expected Result:***

- Integracion exitosa
- Data flow correcto: Frontend -> API -> DB -> API -> Frontend
- `updated_at` cambia en DB

## 📊 Edge Cases Summary

| ***Edge Case                     **** | ****Covered in Original Story? **** | ****Added to Refined AC?     **** | ****Test Case **** | ****Priority *** |
| --- | --- | --- | --- | --- |
| Email duplicado mismo usuario  | ❌ No                       | ✅ Yes (Scenario 4)       | TC-05      | High      |
| Guardar sin cambios            | ❌ No                       | ⚠️ Needs PO confirmation  | TBD        | Medium    |
| Limites de longitud            | ❌ No                       | ✅ Yes (Scenario 5)       | TC-06/07   | Medium    |

## 

## 🗂️ Test Data Summary

### Data Categories

| ***Data Type       **** | ****Count **** | ****Purpose         **** | ****Examples                                 *** |
| --- | --- | --- | --- |
| Valid data       | 3      | Positive tests   | "Empresa ABC SRL", "nuevo@empresa.com"    |
| Invalid data     | 4      | Negative tests   | "not-an-email", name vacio                |
| Boundary values  | 4      | Boundary tests   | name 100/101 chars, address 500/501       |
| Edge case data   | 1      | Edge case tests  | email duplicado dentro del mismo usuario  |

### Data Generation Strategy

***Static Test Data:***

- Cliente A: email "a@empresa.com"
- Cliente B: email "b@empresa.com"

***Dynamic Test Data (using Faker.js):***

- Emails validos: `faker.internet.email()`
- Nombres: `faker.person.fullName()`
- Direcciones: `faker.location.streetAddress()`

***Test Data Cleanup:***

- ✅ All test data is cleaned up after test execution
- ✅ Tests are idempotent
- ✅ Tests do not depend on execution order

## 📝 PARTE 2: Integracion y Output

***Nota:*** Jira actualizado y comentario de test cases agregado el 2026-02-03.

## 

## 📋 Test Execution Tracking

[Esta seccion se completa durante ejecucion]

***Test Execution Date:*** TBD
***Environment:*** Staging
***Executed By:*** TBD

***Results:***

- Total Tests: 8
- Passed: TBD
- Failed: TBD
- Blocked: TBD

***Bugs Found:***

- TBD

***Sign-off:*** TBD

## 

## 📢 Action Required

***@Product Owner:***

- [ ] Review and answer Critical Questions (see Paso 8 below)
- [ ] Validate suggested story improvements
- [ ] Confirm expected behavior for identified edge cases

***@Dev Lead:***

- [ ] Review Technical Questions (see Paso 8 below)
- [ ] Validate integration points and test approach
- [ ] Confirm test data strategy

***@QA Team:***

- [ ] Review test cases for completeness
- [ ] Validate parametrization strategy
- [ ] Prepare test environment

***Next Steps:***

1. Team discusses critical questions and ambiguities
2. PO/Dev provide answers and clarifications
3. QA updates test cases based on feedback
4. Dev starts implementation with clear acceptance criteria

***Documentation:*** Full test cases also available at:
`.context/PBI/epics/EPIC-SQ-13-client-management/stories/STORY-SQ-16-edit-client/test-cases.md`

---

### Ely - 2/7/2026, 1:27:27 PM

✅ ***Implementation Complete***

***PR:*** #26 (MERGED to staging)
***Branch:*** feat/[https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16](https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16)/edit-client

***Implementación:***

- API Route `/api/clients/[id]` con GET y PUT
- Hooks: `useClient`, `useUpdateClient` (React Query)
- Page: `/clients/[id]/page.tsx` con estados loading/error/success

***Test Cases cubiertos (8 TCs del Acceptance Test Plan):***

- TC-SQ-16-001: Cargar datos del cliente ✅
- TC-SQ-16-002: Editar nombre ✅
- TC-SQ-16-003: Editar email ✅
- TC-SQ-16-004: Editar campos opcionales ✅
- TC-SQ-16-005: Validación email inválido ✅
- TC-SQ-16-006: Validación nombre vacío ✅
- TC-SQ-16-007: Email duplicado (409) ✅
- TC-SQ-16-008: Cliente no encontrado (404) ✅

***Ready for QA testing*** 🧪

---

### Joel Armando Ramírez Rodríguez - 2/9/2026, 3:35:26 PM

# Exploratory Testing Session Notes - [https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16](https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16) (Edit Client Data)

***Date:*** 2026-02-09  
***Feature:*** STORY-SQ-16 - Edit Client Data  
***Environment:*** Staging (`https://staging-upexsoloq.vercel.app`)  
***Execution Type:*** UI-only + Network observation (Playwright MCP)

## Executive Summary

- ***Overall Status:*** ISSUES FOUND
- ***Scenarios Tested:*** 14 (8 test cases + 6 exploratory)
- ***Issues Found:*** 1 (Medium)
- ***Blocked:*** No

## Test Cases Executed (UI + Network)

1. ***Edit name successfully*** -> PASSED  
2. ***Edit email with valid value*** -> PASSED  
3. ***Invalid email validation (parametrized)*** -> PASSED  
4. ***Empty name validation*** -> PASSED  
5. ***Duplicate email (same user)*** -> PASSED  
6. ***Boundary accepted (max lengths)*** -> PASSED  
7. ***Boundary rejected (exceed max)*** -> PASSED  
8. ***Integration path UI->API*** -> PASSED  

## Exploratory Coverage (additional)

1. ***Save without meaningful changes*** -> OBSERVATION  
2. ***Clear optional fields (phone/address/notes)*** -> PASSED  
3. ***Back navigation and reload behavior*** -> PASSED  
4. ***Special characters / XSS-like input in notes*** -> PASSED (observation)  
5. ***Mobile viewport check (390x844)*** -> PASSED  

## Additional Network Observations (outside [https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16](https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16) scope but visible)

- `GET /forgot-password?_rsc=...` -> `404` from login screen.
- `GET .../business_profiles?...` -> `406` during profile bootstrap.

## Recommendation

- Candidate for automation: duplicate submit, boundary lengths, duplicate-email conflict, validation no-request behavior.

# ***Exploratory Testing Manual:***

Duré 1 hora probando la feature donde encontré un issue.

## Posibles mejoras visualizado de manera manual al hacer EXP test:

1. Que en la sección donde se meustran los clientes, en cada cliente haya como un botón con la imagen de una lapiz, que el usuario lo entienda que es para edición del cliente, ya que a simple vista el usuario peude entender que no se puede editar si no hace clic en el cliente.
2. A discusión, el campo de Nombre acepta números y carácteres especiales, lo que permite guardar el campo con estos cambios, en mi opinión, sería ideal que solo se pueda guardar el nombre aceptando alagunos caracteres especiales…
3. Que en la URL no se visualice el user_id del cliente sino otra refencia, ya de esta parte he subido uun issue.
4. Otra idea es que a la hora de realizar cambios editando un cliente, si el usuario por error le da volver atras, le aparezca un pop-up de si desea descartar los cambios realizados, al igual que ese op-up se meustre si el usuario por error hace clic en el botón “Cancelar”

---

### Ely - 2/10/2026, 5:49:44 PM

Defect [https://upexgalaxy65.atlassian.net/browse/SQ-71#icft=SQ-71](https://upexgalaxy65.atlassian.net/browse/SQ-71#icft=SQ-71) is now Ready For QA (PR #41 merged). Moving back for re-testing.

---

### Joel Armando Ramírez Rodríguez - 2/11/2026, 11:58:29 AM

## 🧪 Exploratory DB Testing - STORY [https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16](https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16) (Edit Client)

**Fecha:** 2026-02-11  
**Ejecutado por:** QA (MCP `sql`, rol `qa_team`)  
**Base:** `.prompts/fase-10-exploratory-testing/exploratory-db-test.md` + `test-cases.md` de [https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16](https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16) + contexto de comentarios UI en esta US.

### Contexto UI (comentarios Jira revisados)

- Exploratory UI previo de [https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16](https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16): ejecutado, con ***1 issue medium*** reportado.
- Defects vinculados:

### Plan DB ejecutado

Tablas/puntos validados:

- `public.clients` (schema, constraints, trigger `updated_at`, RLS, integridad de datos)
- Reglas del test plan: update exitoso, duplicado email mismo usuario, validaciones de formato/límites, `updated_at`.

### Resultados

#### ✅ Schema / Constraints / Trigger

- Tabla `clients`: 45 registros totales (38 activos, 7 soft-deleted).
- Constraints presentes:
- Trigger presente y funcionando: `update*clients*updated_at` (before update).

#### ✅ Integración de actualización (`updated_at`)

- Prueba transaccional (con rollback): update de `name` cambia `updated_at` correctamente.
- Resultado: ***PASSED***.

#### ✅ Duplicado exacto de email por mismo usuario

- Prueba transaccional: setear en Cliente B el mismo email exacto de Cliente A.
- Resultado: error `duplicate key value violates unique constraint clients*user*id*email*key`.
- Resultado: ***PASSED*** (constraint funciona para igualdad exacta).

#### ⚠️ Hallazgo crítico de integridad: unicidad case-sensitive

- Se detectaron duplicados por mismo usuario al normalizar a lowercase:
- Además, prueba transaccional confirma que `andres...@example.com` y `ANDRES...@EXAMPLE.COM` pueden coexistir para el mismo `user_id`.
- Estado: ***ISSUE FOUND*** (la restricción actual no evita duplicados case-insensitive).

#### ⚠️ Validaciones de formato/límites a nivel DB

- Email inválido (`not-an-email`) puede persistirse en DB si se salta API/UI.
- `name` vacío (`''`) puede persistirse (NOT NULL no evita string vacío).
- Límites:
- Estado: ***PARTIAL*** respecto a los límites definidos en test cases (address/notes no están forzados por DB).

#### ℹ️ RLS

- RLS en `clients`: habilitado y políticas CRUD por `auth.uid() = user_id`.
- Limitación de sesión DB: rol `qa_team` tiene `rolbypassrls = true`, por lo que la prueba directa de aislamiento en SQL no es concluyente (debe validarse vía API/UI autenticada).

### Conclusión

**Estado general DB para SQ-16:** **ISSUES FOUND**.

Resumen:

# `updated_at` y constraints básicos: OK.

# Duplicado exacto por email/user: bloqueado (OK).

# Duplicado case-insensitive por email/user: **NO bloqueado** (issue).

# Validaciones de formato y ciertos límites dependen de capa API/UI (DB no las impone completamente).

### Recomendaciones

- Evaluar índice único case-insensitive por `user_id + lower(email)` (o tipo `citext`).
- Definir si `address`/`notes` deben tener límite duro en DB (500/1000) o solo en API/UI.
- Considerar `CHECK (btrim(name) <> '')` si la regla de negocio exige nombre no vacío en todas las capas.

---

### Joel Armando Ramírez Rodríguez - 2/11/2026, 12:04:12 PM

Se creó el defecto consolidado de DB para esta US: ***SQ-82*** (`CM | SQ-16 edit client presenta inconsistencia de unicidad email (case-insensitive) y validaciones DB parciales`).

Incluye hallazgos de unicidad case-insensitive por `user_id + email` y validaciones DB parciales detectadas en exploratory testing.

---

### Joel Armando Ramírez Rodríguez - 3/1/2026, 5:26:58 PM

## 📊 Fase 11 - Test Analysis Report (Regresión)

***User Story:*** SQ-16 - Edit Client Data  

***Epic:*** SQ-13 - Client Management  

***Fecha:*** 2026-03-01  

***Analista:*** AI Assistant

---

## 1) Contexto verificado (Proyecto + PBI + SRS + BA)

Se validó contexto completo solicitado:

- ***Proyecto SoloQ / QA guideline:*** `.context/guidelines/QA/jira-test-management.md`
- ***PBI Story (local):***

  - `.context/PBI/epics/EPIC-SQ-13-client-management/stories/STORY-SQ-16-edit-client/story.md`

  - `.context/PBI/epics/EPIC-SQ-13-client-management/stories/STORY-SQ-16-edit-client/test-cases.md`

  - `.context/PBI/epics/EPIC-SQ-13-client-management/stories/STORY-SQ-16-edit-client/implementation-plan.md`

- ***PBI Epic (local):***

  - `.context/PBI/epics/EPIC-SQ-13-client-management/epic.md`

  - `.context/PBI/epics/EPIC-SQ-13-client-management/feature-test-plan.md`

- ***SRS (arquitectura técnica):***

  - `FR-012 Actualizar Cliente` en `.context/SRS/functional-specs.md`

  - Requisitos de seguridad/RLS en `.context/SRS/non-functional-specs.md`

- ***Business Analyst context (Arquitectura de negocio):***

  - US 3.3 (editar cliente) en `.context/PRD/mvp-scope.md`

  - Journey operativo cliente/factura en `.context/PRD/user-journeys.md`

También se revisó Jira en vivo (US, Epic, comentarios, links, defects relacionados).

---

## 2) Fuentes analizadas en Jira

| Fuente | Referencia | Insights clave |

|---|---|---|

| User Story | SQ-16 | AC funcionales + refinamientos QA ya documentados |

| Comentarios US | SQ-16 (6+) | Exploratory UI/DB ejecutado; cobertura de 8 TCs + casos exploratorios |

| Epic padre | SQ-13 | Riesgos heredados: RLS y unicidad email por usuario |

| Bugs enlazados | SQ-71, SQ-75 | Áreas con historial de fallo en edición |

| Bug consolidado DB | SQ-82 | Riesgo de unicidad case-insensitive y validaciones DB parciales |

***Nota de estado:**** el prompt asume US en ****QA Approved****, pero actualmente SQ-16 está en ****Ready For QA***.

---

## 3) Tests ya documentados reutilizados (sin inventar nuevos)

Candidatos extraídos de `test-cases.md` + ejecución exploratory en comentarios de SQ-16:

1. ***Validar guardado exitoso de datos básicos con valores válidos***
2. ***Validar cambio de email con formato válido***
3. ***Validar error de validación con email inválido***
4. ***Validar error cuando el nombre está vacío***
5. ***Validar rechazo por email duplicado del mismo usuario***
6. ***Validar aceptación de límites de longitud***
7. ***Validar rechazo al exceder límites de longitud***
8. ***Validar integración de actualización cliente en flujo Frontend → API → DB***

---

## 4) Separación: transversales vs escenarios reales

### Características transversales (NO crear tests separados)

- Mobile responsive (ya validado en exploratory)
- Validación de seguridad/XSS (observacional)
- Observación de red/contrato API dentro de cada escenario

### Escenarios reales (SÍ test de regresión)

| # | Escenario (formato Validar CORE CONDITIONAL) | Prioridad | Tipo | Automatizable | Componente de |

|---|---|---|---|---|---|

| 1 | Validar guardado exitoso de datos básicos con valores válidos | Critical | Functional | Sí | E2E Gestión de Cliente |

| 2 | Validar cambio de email con formato válido | High | Functional | Sí | E2E Gestión de Cliente |

| 3 | Validar error de validación con email inválido | High | Functional | Sí | Validación formulario cliente |

| 4 | Validar error cuando el nombre está vacío | High | Functional | Sí | Validación formulario cliente |

| 5 | Validar rechazo por email duplicado del mismo usuario | ***Critical (riesgo histórico)*** | Integration/Functional | Sí | Integridad de datos cliente |

| 6 | Validar aceptación de límites de longitud en campos de cliente | Medium | Functional | Sí | Robustez de datos |

| 7 | Validar rechazo al exceder límites de longitud en campos de cliente | Medium | Functional | Sí | Robustez de datos |

| 8 | Validar integración de actualización cliente en flujo Frontend → API → DB | High | Integration | Sí | E2E Gestión de Cliente |

---

## 5) Detección E2E / Integration

- ***¿Necesita E2E?**** ****SÍ***  

  Razón: SQ-16 es parte del flujo de negocio mayor de Client Management y habilita Invoice Creation.

- ***¿Necesita Integration?**** ****SÍ***  

  Razón: depende de `PUT /api/clients/:id`, validación server-side, constraints DB y RLS.

---

## 6) Mapa de componentes (Lego)

```text
E2E: Gestión de Cliente
├── [1] Validar guardado exitoso de datos básicos con valores válidos
├── [2] Validar cambio de email con formato válido
├── [5] Validar rechazo por email duplicado del mismo usuario
└── [8] Validar integración de actualización cliente en flujo Frontend → API → DB

Subflujo funcional: Validaciones Formulario Cliente
├── [3] Validar error de validación con email inválido
├── [4] Validar error cuando el nombre está vacío
├── [6] Validar aceptación de límites de longitud en campos de cliente
└── [7] Validar rechazo al exceder límites de longitud en campos de cliente
```

---

## 7) Análisis de bugs previos (riesgo)

| Bug ID | Estado | Área afectada | Escenario relacionado | Riesgo regresión |

|---|---|---|---|---|

| SQ-71 | OPEN | Breadcrumb/ruta de edición | 1, 8 | Alto (flujo edición UX) |

| SQ-75 | CLOSED (VERIFIED) | Validación phone | 6, 7 | Medio-Alto (ya falló antes) |

| SQ-82 | Ready For QA | Unicidad email case-insensitive + reglas DB | 5, 8 | ***Crítico*** |

***Regla aplicada:*** escenarios vinculados a bugs previos suben prioridad en regresión.

---

## 8) Resumen de candidatos

| Categoría | Cantidad |

|---|---|

| Total escenarios reales identificados | 8 |

| Características transversales (NO tests separados) | 3 |

| Candidatos de regresión | 8 |

| Candidatos automatizables | 8 |

| Manual-only | 0 |

| Diferidos | 0 |

---

## 9) Recomendaciones para priorización (siguiente fase)

1. Priorizar primero ***#5 y #8**** (integridad + integración), luego ****#1/#2***, y después validaciones de borde.
2. Mantener `SQ-75` como evidencia de riesgo recurrente en validaciones de campo.
3. No cerrar estrategia de regresión de SQ-16 como “estable” hasta confirmar resultado final de ***SQ-82**** y estado real de ****SQ-71***.
4. Continuar con `test-prioritization.md` para decidir set final de smoke/regression y orden de automatización.

---

### Joel Armando Ramírez Rodríguez - 3/1/2026, 5:33:23 PM

## 🎯 Fase 11 - Test Prioritization Report (Risk-Based, ROI estricto)

***Feature/US:*** SQ-16 - Edit Client Data  

***Fecha:*** 2026-03-01  

***Base de entrada:*** Test Analysis report en este mismo ticket + test-cases/documentación previa + defects relacionados

---

## Fase 0: Filtro de Preguntas Críticas

Aplicado sobre 8 candidatos identificados en análisis previo.

| # | Escenario (nomenclatura preservada) | ¿Protege regresión futura? | ¿Bug previo relacionado? | ¿Nivel feature (no APP)? | ¿Pasa filtro? |

|---|---|---|---|---|---|

| 1 | Validar guardado exitoso de datos básicos con valores válidos | SÍ | SÍ (SQ-71 contexto edición) | SÍ | ✅ |

| 2 | Validar cambio de email con formato válido | NO (cobertura redundante con #1/#8) | NO | SÍ | ❌ |

| 3 | Validar error de validación con email inválido | NO (validación compartida y ya cubierta en capas previas) | NO | NO (más transversal/shared schema) | ❌ |

| 4 | Validar error cuando el nombre está vacío | NO (redundante con validación shared schema) | NO | NO (más transversal/shared schema) | ❌ |

| 5 | Validar rechazo por email duplicado del mismo usuario | SÍ | SÍ (SQ-82) | SÍ | ✅ |

| 6 | Validar aceptación de límites de longitud en campos de cliente | NO (boundary one-time, baja prob. regresión) | NO | SÍ | ❌ |

| 7 | Validar rechazo al exceder límites de longitud en campos de cliente | NO (boundary one-time, baja prob. regresión) | Parcial (SQ-75 phone) | SÍ | ❌ |

| 8 | Validar integración de actualización cliente en flujo Frontend → API → DB | SÍ | SÍ (SQ-82 / SQ-71) | SÍ | ✅ |

***Resultado filtro:**** ****3 de 8**** candidatos pasan (****37.5%***, cumple objetivo <50%).

---

## Fase 1: ROI (solo candidatos que pasaron filtro)

Fórmula: `ROI = (Frecuencia × Impacto × Estabilidad) / (Esfuerzo × Dependencias)`

| # | Escenario | Freq | Impact | Stab | Effort | Deps | ROI | Bug previo | Decisión |

|---|---|---:|---:|---:|---:|---:|---:|---|---|

| 1 | Validar guardado exitoso de datos básicos con valores válidos | 3 | 4 | 4 | 2 | 2 | ***12.0*** | SQ-71 | ✅ AUTO |

| 5 | Validar rechazo por email duplicado del mismo usuario | 4 | 5 | 4 | 2 | 3 | ***13.3*** | SQ-82 | ✅ AUTO |

| 8 | Validar integración de actualización cliente en flujo Frontend → API → DB | 4 | 5 | 3 | 3 | 3 | ***6.7*** | SQ-82, SQ-71 | ✅ AUTO |

---

## Fase 2/3: Riesgo + valor de componente

- ***#5**** y ****#8*** quedan en cuadrante crítico (alto impacto + historial de bug).
- ***#1*** protege el happy path principal de negocio.
- ***#1**** y ****#5*** son componentes reutilizables en flujos E2E de Client Management e Invoice Creation (valor lego alto).

---

## Decisión Final

### ✅ Track 1: Automated Regression (CI/CD)

1. ***SQ-16: TC1: Validar guardado exitoso de datos básicos con valores válidos***  

   - Justificación: flujo core, alto ROI, cobertura base de edición.

1. ***SQ-16: TC2: Validar rechazo por email duplicado del mismo usuario***  

   - Justificación: riesgo histórico real (SQ-82), impacto de integridad de datos.

1. ***SQ-16: TC3: Validar integración de actualización cliente en flujo Frontend → API → DB***  

   - Justificación: protege contrato e integración completa, riesgo alto.

### ⚠️ Track 2: Manual Regression

- ***Ninguno*** (0). Se evita suite manual innecesaria para esta US.

### ❌ Track 3: Deferred (mayoría)

Se diferen ***5*** escenarios: #2, #3, #4, #6, #7.

Razones principales:

- Redundancia con cobertura más valiosa (flujo completo > fragmentos).
- Validaciones compartidas/transversales (mejor cubrir en suites globales/schema).
- Boundary checks de bajo retorno para regresión continua.

---

## Resumen

| Métrica | Antes | Después | Reducción |

|---|---:|---:|---:|

| Total candidatos | 8 | 3 | ***62.5%*** |

| Track | Count | Criterio |

|---|---:|---|

| Automated Regression | 3 | Esencial + alto riesgo/ROI |

| Manual Regression | 0 | Evitado por bajo valor incremental |

| Deferred | 5 | Mayoría (risk-based estricto) |

---

## Path de workflow sugerido

Para los 3 tests priorizados (automatizables y ROI > 1.5):

***Ready → In Review → Candidate***

(Quedan listos para Fase 12 de automatización).

---

### Joel Armando Ramírez Rodríguez - 3/1/2026, 5:52:43 PM

Test cases documentados para Fase 11 (priorización estricta) y listos como ***Candidate***:

- [SQ-103] SQ-16: TC1: Validar guardado exitoso de datos básicos con valores válidos
- [SQ-104] SQ-16: TC2: Validar rechazo por email duplicado del mismo usuario
- [SQ-105] SQ-16: TC3: Validar integración de actualización cliente en flujo Frontend -> API -> DB

Estados aplicados por workflow: Draft -> In Design -> READY -> In Review -> Candidate.

También se creó caché local en `.context/PBI/epics/EPIC-SQ-13-client-management/stories/STORY-SQ-16-edit-client/tests/`.

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:45.922Z_
