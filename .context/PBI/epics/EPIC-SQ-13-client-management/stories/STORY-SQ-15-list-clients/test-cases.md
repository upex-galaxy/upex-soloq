# Test Cases: STORY-SQ-15 - List All Clients

**Fecha:** 2026-01-27
**QA Engineer:** AI-Generated
**Story Jira Key:** [SQ-15](https://upexgalaxy64.atlassian.net/browse/SQ-15)
**Epic:** EPIC-SQ-13 - Client Management
**Status:** Draft - Pending Team Review

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Andres (Consultor) - Gestiona 8-12 clientes, valora dashboard simple y busqueda rapida. Necesita encontrar clientes rapidamente para facturar.
- **Secondary:** Carlos (Disenador) - 5-8 clientes, necesita acceso rapido sin perder contexto al facturar.

**Business Value:**

- **Value Proposition:** Permite a freelancers visualizar y encontrar rapidamente a sus clientes para facturar. Sin esta funcionalidad, el usuario no puede crear facturas.
- **Business Impact:** Contribuye directamente a KPI "Time to First Invoice: <10 min". Una lista lenta o confusa aumenta el tiempo de facturacion y puede causar churn.

**Related User Journey:**

- Journey 1: "Registro y Primera Factura" - Step 8 (seleccionar cliente para crear factura)
- Journey 4: "Edicion de Factura" - Necesita cliente seleccionado

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: `ClientsList`, `ClientsTable`, `ClientSearch`, `EmptyState`
- Pages/Routes: `/clients`
- State Management: React Query (server state) + local state para filtros/search

**Backend:**

- API Endpoint: `GET /api/clients` (FR-011)
- Services: Supabase client con RLS
- Database: Tabla `clients` con columnas: id, user_id, name, email, company, phone, address, tax_id, notes, is_deleted, created_at, updated_at

**Integration Points:**

- Frontend <-> API `/api/clients` (GET with query params)
- API <-> PostgreSQL (tabla `clients`)
- API <-> Supabase Auth (validacion de session, RLS enforcement)

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic complexity: Low - Es principalmente lectura de datos
- Integration complexity: Medium - Multiples query params (search, sort, pagination)
- Data validation complexity: Low - Solo validacion de query params
- UI complexity: Medium - Lista paginada, search, sorting, empty state

**Estimated Test Effort:** Medium
**Rationale:** Aunque la logica es simple, hay multiples combinaciones de filtros, ordenamiento y paginacion que requieren cobertura adecuada. Ademas, el empty state y los edge cases de busqueda requieren atencion especial.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**

- Risk 1: RLS Policies - Data Isolation Failure (HIGH Impact)
  - **Relevance to This Story:** CRITICO - La lista de clientes DEBE mostrar solo clientes del usuario autenticado. Un fallo aqui expondria datos de otros usuarios.
- Risk 2: Search Behavior Ambiguity (Medium Impact)
  - **Relevance to This Story:** DIRECTAMENTE APLICA - La busqueda es core de esta story y su comportamiento no esta clarificado.

**Integration Points from Epic Analysis:**

- Integration Point 1: Frontend <-> API `/api/clients`
  - **Applies to This Story:** Yes
  - **How:** Esta story implementa el endpoint GET con query params (search, page, limit, sortBy, sortOrder)
- Integration Point 2: API <-> PostgreSQL (tabla `clients`)
  - **Applies to This Story:** Yes
  - **How:** Query debe excluir soft-deleted clients (is_deleted = false OR deleted_at IS NULL)

**Critical Questions Already Asked at Epic Level:**

**Questions for PO:**

- Question 1: Hay limite de clientes por usuario en plan Free vs Pro?
  - **Status:** Pending
  - **Impact on This Story:** Si hay limite, la lista debe mostrar indicador de "X/Y clientes" o similar

**Questions for Dev:**

- Question 1: La busqueda es case-insensitive? Busca parciales o solo exactos?
  - **Status:** Pending
  - **Impact on This Story:** Determina expectativas de test cases para busqueda

**Test Strategy from Epic:**

- Test Levels: Unit, Integration, E2E, API
- Tools: Playwright, Vitest, Postman
- **How This Story Aligns:** Esta story requiere principalmente E2E tests (UI) y API tests. Integration tests para verificar RLS.

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** Esta story es el punto de entrada para todas las operaciones de clientes. Sin listar clientes, el usuario no puede editar, eliminar ni ver historial.
- **Inherited Risks:** RLS data isolation, search behavior ambiguity
- **Unique Considerations:** Empty state UX, pagination performance, search debounce

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Comportamiento de busqueda no especificado

- **Location in Story:** Scenario 2 - "The list filters to show matching clients"
- **Question for PO/Dev:** La busqueda es case-insensitive? Busca en nombre Y email simultaneamente? Busca parciales ("jo" encuentra "John") o solo exactos?
- **Impact on Testing:** Sin clarificar, no podemos definir expected behavior para test cases de busqueda
- **Suggested Clarification:** "La busqueda es case-insensitive y busca parciales en nombre Y email simultaneamente"

**Ambiguity 2:** Texto del CTA en empty state

- **Location in Story:** Scenario 3 - "I see an empty state with a CTA to add my first client"
- **Question for PO:** Cual es el texto exacto del CTA? "Agregar cliente"? "Agregar tu primer cliente"? Que icono?
- **Impact on Testing:** Necesitamos verificar texto exacto y comportamiento del CTA
- **Suggested Clarification:** Especificar texto y accion del CTA (ej: redirige a /clients/new o abre modal)

**Ambiguity 3:** Ordenamiento por defecto no especificado

- **Location in Story:** Scenario 4 y Technical Notes
- **Question for PO:** Cual es el orden por defecto al cargar la lista? Alfabetico por nombre? Por fecha de creacion (mas recientes primero)?
- **Impact on Testing:** Necesitamos saber el estado inicial para validar correctamente
- **Suggested Clarification:** Especificar "Por defecto se ordena alfabeticamente por nombre ascendente"

**Ambiguity 4:** Comportamiento de paginacion no detallado

- **Location in Story:** Technical Notes - "Paginated list (20 per page)"
- **Question for Dev:** Hay controles de paginacion (paginas numeradas, prev/next)? Hay opcion de cambiar items por pagina? Que pasa al buscar - se reinicia a pagina 1?
- **Impact on Testing:** Necesitamos conocer UX de paginacion para test cases
- **Suggested Clarification:** Especificar controles de paginacion y comportamiento al filtrar

---

### Missing Information / Gaps

**Gap 1:** Campos mostrados en la lista

- **Type:** UI Details
- **Why It's Critical:** Story dice "name and email" pero Technical Notes no especifica si hay mas columnas (company, phone, etc.)
- **Suggested Addition:** Especificar columnas exactas de la tabla: Name, Email, Company (opcional), Created Date
- **Impact if Not Added:** UI podria no alinearse con expectativas del PO

**Gap 2:** Comportamiento con clientes soft-deleted

- **Type:** Business Rule
- **Why It's Critical:** La story no menciona si clientes eliminados (soft delete) deben aparecer o no
- **Suggested Addition:** "La lista NO muestra clientes que han sido eliminados (is_deleted = true)"
- **Impact if Not Added:** Podria haber confusion sobre si mostrar o no deleted clients

**Gap 3:** Indicador de carga (loading state)

- **Type:** UX Detail
- **Why It's Critical:** No se menciona que mostrar mientras carga la lista (skeleton, spinner, etc.)
- **Suggested Addition:** Agregar scenario para loading state
- **Impact if Not Added:** UX inconsistente

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Busqueda sin resultados

- **Scenario:** Usuario busca texto que no coincide con ningun cliente
- **Expected Behavior:** Mostrar mensaje "No se encontraron clientes" con opcion de limpiar busqueda
- **Criticality:** High
- **Action Required:** Add to test cases

**Edge Case 2:** Caracteres especiales en busqueda

- **Scenario:** Usuario busca con caracteres especiales (%, \_, ', ", <, >)
- **Expected Behavior:** Sistema debe escapar caracteres y no causar errores SQL
- **Criticality:** High (seguridad)
- **Action Required:** Add to test cases

**Edge Case 3:** Busqueda con espacios

- **Scenario:** Usuario busca " John " con espacios al inicio/final
- **Expected Behavior:** Sistema debe trim() el input y buscar "John"
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 4:** Lista con exactamente 20 clientes (boundary)

- **Scenario:** Usuario tiene exactamente 20 clientes (limite de paginacion)
- **Expected Behavior:** No debe mostrar controles de paginacion (o mostrar deshabilitados)
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 5:** Usuario accede a pagina que no existe

- **Scenario:** Usuario modifica URL para acceder a ?page=999 cuando solo hay 2 paginas
- **Expected Behavior:** Redirigir a ultima pagina valida o mostrar empty state
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 6:** Ordenamiento con valores null/empty

- **Scenario:** Algunos clientes tienen company = null, otros tienen valor
- **Expected Behavior:** Nulls deben aparecer al final o al inicio de forma consistente
- **Criticality:** Low
- **Action Required:** Add to test cases

---

### Testability Validation

**Is this story testeable as written?** Partially

**Testability Issues (if any):**

- [x] Acceptance criteria are vague or subjective (busqueda, ordenamiento)
- [x] Expected results are not specific enough (empty state text, CTA action)
- [ ] Missing test data examples
- [x] Missing error scenarios (busqueda sin resultados, pagina invalida)
- [ ] Missing performance criteria (if NFR applies)
- [ ] Cannot be tested in isolation (missing dependencies info)

**Recommendations to Improve Testability:**

1. Especificar comportamiento exacto de busqueda (case-insensitive, partial match)
2. Definir texto exacto del empty state y CTA
3. Especificar orden por defecto
4. Agregar scenario para busqueda sin resultados
5. Clarificar controles de paginacion

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: View client list - Happy Path

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Usuario autenticado con email "testuser@example.com"
  - Usuario tiene 5 clientes en su cuenta: "Alice Corp", "Bob LLC", "Charlie Inc", "Delta Co", "Echo Ltd"
  - Ninguno de los clientes esta eliminado (is_deleted = false)

- **When:**
  - Usuario navega a `/clients`

- **Then:**
  - Pagina muestra titulo "Clientes" o "Mis Clientes"
  - Lista muestra los 5 clientes con columnas: Name, Email
  - Clientes ordenados alfabeticamente por nombre (A-Z) por defecto
  - Cada fila tiene acciones (ver, editar, eliminar)
  - Search box visible y vacio
  - Controles de ordenamiento visibles en headers de columnas
  - No muestra controles de paginacion (menos de 20 clientes)
  - API Response: 200 OK con `{ success: true, clients: [...], total: 5, page: 1, totalPages: 1 }`

---

### Scenario 2: Search clients - By Name (Partial Match)

**Type:** Positive
**Priority:** High

- **Given:**
  - Usuario autenticado con 10 clientes
  - Clientes incluyen: "John Smith", "Johnny Depp", "Jane Johnson"

- **When:**
  - Usuario escribe "john" en el search box

- **Then:**
  - Lista se filtra automaticamente despues de debounce (300ms)
  - Muestra 3 clientes: "John Smith", "Johnny Depp", "Jane Johnson"
  - Busqueda es case-insensitive
  - Search box mantiene el texto "john"
  - Total count actualiza a "3 clientes encontrados"
  - API llamada: `GET /api/clients?search=john`

---

### Scenario 3: Search clients - By Email

**Type:** Positive
**Priority:** High

- **Given:**
  - Usuario tiene clientes con emails diversos
  - Un cliente tiene email "contact@acme.com"

- **When:**
  - Usuario escribe "acme" en el search box

- **Then:**
  - Lista muestra el cliente con email que contiene "acme"
  - Busqueda funciona tanto en nombre como en email

---

### Scenario 4: Search clients - No Results

**Type:** Negative
**Priority:** High

- **Given:**
  - Usuario tiene 5 clientes
  - Ninguno tiene "xyz" en nombre ni email

- **When:**
  - Usuario escribe "xyz" en el search box

- **Then:**
  - Lista muestra estado vacio con mensaje: "No se encontraron clientes"
  - Muestra sugerencia: "Intenta con otros terminos de busqueda"
  - Boton o link para "Limpiar busqueda" visible
  - API Response: `{ success: true, clients: [], total: 0, page: 1, totalPages: 0 }`

---

### Scenario 5: Empty state - No clients yet

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Usuario nuevo autenticado
  - Usuario NO tiene ningun cliente en su cuenta

- **When:**
  - Usuario navega a `/clients`

- **Then:**
  - Muestra empty state con ilustracion
  - Texto principal: "No tienes clientes aun" o similar
  - Texto secundario: "Agrega tu primer cliente para comenzar a facturar"
  - CTA prominente: "Agregar cliente" (boton primary)
  - Click en CTA lleva a `/clients/new` o abre modal de creacion
  - Search box NO visible (o deshabilitado)
  - No muestra headers de tabla
  - API Response: `{ success: true, clients: [], total: 0 }`

---

### Scenario 6: Sort clients - By Name Ascending

**Type:** Positive
**Priority:** Medium

- **Given:**
  - Usuario tiene clientes: "Zeta Corp", "Alpha Inc", "Beta LLC"
  - Lista ordenada por defecto (nombre A-Z)

- **When:**
  - Usuario hace click en header "Name" (ya activo A-Z)

- **Then:**
  - Orden cambia a Z-A (descendente)
  - Lista muestra: "Zeta Corp", "Beta LLC", "Alpha Inc"
  - Indicador visual de orden descendente en header
  - API llamada: `GET /api/clients?sortBy=name&sortOrder=desc`

---

### Scenario 7: Sort clients - By Created Date

**Type:** Positive
**Priority:** Medium

- **Given:**
  - Usuario tiene clientes creados en diferentes fechas
  - Cliente "Recent" creado hace 1 dia
  - Cliente "Old" creado hace 30 dias

- **When:**
  - Usuario hace click en header "Fecha de creacion" (si visible)

- **Then:**
  - Lista se ordena por fecha de creacion
  - Mas recientes primero (desc) o mas antiguos primero (asc) segun toggle
  - API llamada: `GET /api/clients?sortBy=created_at&sortOrder=desc`

---

### Scenario 8: Pagination - More than 20 clients

**Type:** Positive
**Priority:** High

- **Given:**
  - Usuario tiene 45 clientes en su cuenta
  - Paginacion configurada a 20 por pagina

- **When:**
  - Usuario navega a `/clients`

- **Then:**
  - Lista muestra primeros 20 clientes
  - Muestra indicador: "Mostrando 1-20 de 45 clientes"
  - Controles de paginacion visibles (Previous, 1, 2, 3, Next)
  - Boton "Previous" deshabilitado (esta en pagina 1)
  - API Response: `{ success: true, clients: [...20], total: 45, page: 1, totalPages: 3 }`

---

### Scenario 9: Pagination - Navigate to page 2

**Type:** Positive
**Priority:** Medium

- **Given:**
  - Usuario en pagina 1 de lista con 45 clientes

- **When:**
  - Usuario hace click en pagina "2" o boton "Next"

- **Then:**
  - Lista muestra clientes 21-40
  - Muestra indicador: "Mostrando 21-40 de 45 clientes"
  - Pagina "2" marcada como activa
  - Botones "Previous" y "Next" habilitados
  - URL actualiza a `/clients?page=2`
  - API llamada: `GET /api/clients?page=2&limit=20`

---

### Scenario 10: RLS Security - Cannot see other user's clients

**Type:** Security (Critical)
**Priority:** Critical

- **Given:**
  - User A tiene clientes: "Client A1", "Client A2"
  - User B tiene clientes: "Client B1"
  - User A esta autenticado

- **When:**
  - User A navega a `/clients`
  - User A intenta modificar API call para obtener todos los clientes

- **Then:**
  - Lista SOLO muestra "Client A1", "Client A2"
  - NUNCA muestra "Client B1"
  - Intentos de bypass via API retornan solo datos del usuario autenticado
  - RLS policy enforced: `auth.uid() = user_id`

---

### Scenario 11: Soft-deleted clients NOT shown

**Type:** Positive
**Priority:** High

- **Given:**
  - Usuario tiene 3 clientes: "Active 1", "Active 2", "Deleted Client"
  - "Deleted Client" tiene is_deleted = true

- **When:**
  - Usuario navega a `/clients`

- **Then:**
  - Lista muestra solo "Active 1" y "Active 2"
  - "Deleted Client" NO aparece en la lista
  - Total count es 2 (no 3)

---

### Scenario 12: Loading state

**Type:** UI/UX
**Priority:** Medium

- **Given:**
  - Usuario navega a `/clients`
  - API tarda en responder (simular latencia)

- **When:**
  - Pagina esta cargando datos

- **Then:**
  - Muestra skeleton loaders o spinner
  - Search box puede estar deshabilitado durante carga
  - Headers de tabla visibles (opcional)
  - No muestra contenido parcial o flickering

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 10

**Breakdown:**

- Positive: 5 test cases
- Negative: 1 test case
- Boundary: 2 test cases
- Security/RLS: 1 test case
- API: 1 test case

**Rationale for This Number:**
La story es de complejidad media con funcionalidad clara. 10 test cases cubren los escenarios principales (list, search, sort, pagination, empty state), edge cases criticos (busqueda sin resultados, pagination boundaries) y seguridad (RLS). No se necesitan mas porque la logica es principalmente de lectura.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** Yes

**Parametrized Test Group 1:** Search Functionality

- **Base Scenario:** Buscar clientes por diferentes terminos
- **Parameters to Vary:** Search term, field matched, expected results

| Search Term | Field | Expected Count | Description             |
| ----------- | ----- | -------------- | ----------------------- |
| "john"      | name  | 2+             | Partial match en nombre |
| "JOHN"      | name  | 2+             | Case insensitive        |
| "@gmail"    | email | 1+             | Partial match en email  |
| "xyz123"    | both  | 0              | No results              |
| " john "    | name  | 2+             | Trim whitespace         |

**Total Tests from Parametrization:** 5 combinaciones en 1 test parametrizado
**Benefit:** Reduce duplicacion, mejor coverage de search edge cases

---

**Parametrized Test Group 2:** Sorting

- **Base Scenario:** Ordenar lista por diferentes columnas
- **Parameters to Vary:** Column, order direction

| sortBy     | sortOrder | First Client | Last Client |
| ---------- | --------- | ------------ | ----------- |
| name       | asc       | "Alpha Inc"  | "Zeta Corp" |
| name       | desc      | "Zeta Corp"  | "Alpha Inc" |
| created_at | desc      | Most recent  | Oldest      |
| created_at | asc       | Oldest       | Most recent |

**Total Tests from Parametrization:** 4 combinaciones

---

### Test Outlines

#### **Validar visualizacion de lista de clientes con datos existentes**

**Related Scenario:** Scenario 1 (View client list)
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** No

---

**Preconditions:**

- Usuario autenticado con rol "user"
- Usuario tiene al menos 5 clientes en la base de datos
- Ningun cliente esta soft-deleted

---

**Test Steps:**

1. Navegar a `/clients`
   - **Verify:** Pagina carga correctamente
2. Esperar a que la lista cargue
   - **Verify:** Skeleton/spinner desaparece
3. Verificar contenido de la lista
   - **Verify:** Muestra todos los clientes del usuario
   - **Verify:** Cada cliente muestra Name y Email
   - **Verify:** Orden alfabetico por nombre (A-Z)

---

**Expected Result:**

- **UI:** Lista visible con 5+ clientes, headers de columnas visibles, search box presente
- **API Response:**
  - Status Code: 200 OK
  - Response Body:

    ```json
    {
      "success": true,
      "clients": [
        {
          "id": "uuid",
          "name": "Alpha Inc",
          "email": "alpha@example.com",
          "company": "Alpha Inc",
          "createdAt": "2026-01-15T10:00:00Z"
        }
      ],
      "total": 5,
      "page": 1,
      "totalPages": 1
    }
    ```

- **Database:** Query solo retorna clientes donde user_id = auth.uid() AND is_deleted = false

---

**Test Data:**

```json
{
  "user": {
    "email": "testuser@example.com",
    "role": "authenticated"
  },
  "clients": [
    { "name": "Alpha Inc", "email": "alpha@test.com" },
    { "name": "Beta LLC", "email": "beta@test.com" },
    { "name": "Charlie Corp", "email": "charlie@test.com" },
    { "name": "Delta Co", "email": "delta@test.com" },
    { "name": "Echo Ltd", "email": "echo@test.com" }
  ]
}
```

---

#### **Validar busqueda de clientes con coincidencia parcial**

**Related Scenario:** Scenario 2, 3
**Type:** Positive
**Priority:** High
**Test Level:** E2E + API
**Parametrized:** Yes (Group 1)

---

**Preconditions:**

- Usuario autenticado con clientes diversos
- Clientes incluyen: "John Smith" (john@example.com), "Johnny Walker" (johnny@corp.com), "Jane Doe" (jane@doe.com)

---

**Test Steps:**

1. Navegar a `/clients`
2. Escribir "john" en el search box
   - **Data:** search term: "john"
3. Esperar debounce (300ms)
   - **Verify:** API call triggered despues de debounce
4. Verificar resultados
   - **Verify:** Lista muestra "John Smith" y "Johnny Walker"
   - **Verify:** "Jane Doe" NO aparece

---

**Expected Result:**

- **UI:** Lista filtrada mostrando solo clientes que coinciden
- **API Response:**
  - Status Code: 200 OK
  - Response Body:

    ```json
    {
      "success": true,
      "clients": [
        { "name": "John Smith", "email": "john@example.com" },
        { "name": "Johnny Walker", "email": "johnny@corp.com" }
      ],
      "total": 2,
      "page": 1,
      "totalPages": 1
    }
    ```

---

#### **Validar empty state cuando usuario no tiene clientes**

**Related Scenario:** Scenario 5
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** No

---

**Preconditions:**

- Usuario nuevo autenticado
- Usuario tiene 0 clientes en la base de datos

---

**Test Steps:**

1. Navegar a `/clients`
   - **Verify:** Pagina carga sin errores
2. Verificar empty state
   - **Verify:** Ilustracion o icono visible
   - **Verify:** Texto "No tienes clientes aun" o similar
   - **Verify:** CTA "Agregar cliente" visible y enabled
3. Click en CTA "Agregar cliente"
   - **Verify:** Navega a `/clients/new` o abre modal

---

**Expected Result:**

- **UI:** Empty state con CTA prominente, NO muestra tabla vacia
- **API Response:**

  ```json
  {
    "success": true,
    "clients": [],
    "total": 0,
    "page": 1,
    "totalPages": 0
  }
  ```

---

**Test Data:**

```json
{
  "user": {
    "email": "newuser@example.com",
    "role": "authenticated"
  },
  "clients": []
}
```

---

#### **Validar mensaje cuando busqueda no tiene resultados**

**Related Scenario:** Scenario 4
**Type:** Negative
**Priority:** High
**Test Level:** E2E
**Parametrized:** No

---

**Preconditions:**

- Usuario autenticado con 5 clientes
- Ningun cliente tiene "xyz123" en nombre ni email

---

**Test Steps:**

1. Navegar a `/clients`
2. Escribir "xyz123" en el search box
3. Esperar resultados
   - **Verify:** Lista muestra estado "No results"
4. Verificar mensaje
   - **Verify:** Texto "No se encontraron clientes" visible
   - **Verify:** Opcion para limpiar busqueda

---

**Expected Result:**

- **UI:** Empty state especifico para "no search results" (diferente al empty state de 0 clientes)
- **API Response:**

  ```json
  {
    "success": true,
    "clients": [],
    "total": 0,
    "page": 1,
    "totalPages": 0
  }
  ```

---

#### **Validar ordenamiento de clientes por nombre descendente**

**Related Scenario:** Scenario 6
**Type:** Positive
**Priority:** Medium
**Test Level:** E2E
**Parametrized:** Yes (Group 2)

---

**Preconditions:**

- Usuario con clientes: "Alpha", "Beta", "Zeta"
- Lista en orden por defecto (A-Z)

---

**Test Steps:**

1. Navegar a `/clients`
2. Click en header "Name" para cambiar orden
   - **Verify:** Indicador de sorting cambia
3. Verificar nuevo orden
   - **Verify:** "Zeta" aparece primero
   - **Verify:** "Alpha" aparece ultimo

---

**Expected Result:**

- **API Response:** Query con `sortBy=name&sortOrder=desc`

---

#### **Validar paginacion con mas de 20 clientes**

**Related Scenario:** Scenario 8, 9
**Type:** Boundary
**Priority:** High
**Test Level:** E2E + API
**Parametrized:** No

---

**Preconditions:**

- Usuario con exactamente 45 clientes
- Paginacion = 20 items por pagina

---

**Test Steps:**

1. Navegar a `/clients`
   - **Verify:** Muestra 20 clientes (no 45)
   - **Verify:** Controles de paginacion visibles
   - **Verify:** Indica "Mostrando 1-20 de 45"
2. Click en pagina 2
   - **Verify:** Muestra clientes 21-40
   - **Verify:** URL actualiza a `?page=2`
3. Click en pagina 3
   - **Verify:** Muestra clientes 41-45 (solo 5)
   - **Verify:** "Next" deshabilitado

---

**Expected Result:**

- **Page 1:** 20 clients, page indicator "1 of 3"
- **Page 2:** 20 clients, page indicator "2 of 3"
- **Page 3:** 5 clients, page indicator "3 of 3", Next disabled

---

#### **Validar aislamiento de datos - RLS Security Test**

**Related Scenario:** Scenario 10
**Type:** Security
**Priority:** Critical
**Test Level:** API
**Parametrized:** No

---

**Preconditions:**

- User A (userA@test.com) con clientes: "Client A1", "Client A2"
- User B (userB@test.com) con clientes: "Client B1"
- Ambos usuarios tienen sesiones validas

---

**Test Steps:**

1. Autenticar como User A
2. GET /api/clients
   - **Verify:** Retorna solo "Client A1", "Client A2"
   - **Verify:** NO retorna "Client B1"
3. Intentar acceder via API directa con client_id de User B
   - **Verify:** Retorna 404 o array vacio (no datos de User B)

---

**Expected Result:**

- **User A API Response:**

  ```json
  {
    "success": true,
    "clients": [{ "name": "Client A1" }, { "name": "Client A2" }],
    "total": 2
  }
  ```

- **Database:** RLS policy `auth.uid() = user_id` enforced

---

**Test Data:**

```json
{
  "userA": {
    "email": "userA@test.com",
    "clients": ["Client A1", "Client A2"]
  },
  "userB": {
    "email": "userB@test.com",
    "clients": ["Client B1"]
  }
}
```

---

#### **Validar que clientes soft-deleted no aparecen en lista**

**Related Scenario:** Scenario 11
**Type:** Positive
**Priority:** High
**Test Level:** API + E2E
**Parametrized:** No

---

**Preconditions:**

- Usuario con 3 clientes en DB
- Cliente "Deleted Corp" tiene is_deleted = true
- Clientes "Active 1" y "Active 2" tienen is_deleted = false

---

**Test Steps:**

1. GET /api/clients
   - **Verify:** Retorna solo "Active 1" y "Active 2"
   - **Verify:** "Deleted Corp" NO aparece
   - **Verify:** total = 2 (no 3)

---

**Expected Result:**

- **API Response:** Solo clientes activos
- **Database Query:** WHERE is_deleted = false (o deleted_at IS NULL)

---

#### **Validar API contract - GET /api/clients**

**Related Scenario:** All scenarios
**Type:** API Contract
**Priority:** High
**Test Level:** API
**Parametrized:** No

---

**Test Steps:**

1. GET /api/clients (sin params)
   - **Verify:** Status 200, estructura correcta
2. GET /api/clients?search=test
   - **Verify:** Filtro aplicado
3. GET /api/clients?page=2&limit=10
   - **Verify:** Paginacion funciona
4. GET /api/clients?sortBy=name&sortOrder=desc
   - **Verify:** Ordenamiento aplicado
5. GET /api/clients sin auth
   - **Verify:** Status 401 Unauthorized

---

**Expected Result:**

- **Success Response (200):**

  ```json
  {
    "success": true,
    "clients": [...],
    "total": number,
    "page": number,
    "totalPages": number
  }
  ```

- **Unauthorized (401):**

  ```json
  {
    "success": false,
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Authentication required"
    }
  }
  ```

---

#### **Validar comportamiento con pagina invalida (edge case)**

**Related Scenario:** Edge Case 5
**Type:** Boundary
**Priority:** Medium
**Test Level:** API
**Parametrized:** No

---

**Preconditions:**

- Usuario con 25 clientes (2 paginas)

---

**Test Steps:**

1. GET /api/clients?page=999
   - **Verify:** No error 500
2. Verificar comportamiento
   - **Option A:** Retorna pagina vacia con total correcto
   - **Option B:** Retorna ultima pagina valida

---

**Expected Result:**

- **API Response:** 200 OK (no crash)
- **Behavior:** Definir con Dev cual opcion implementar

---

## Test Data Summary

### Data Categories

| Data Type       | Count | Purpose        | Examples                              |
| --------------- | ----- | -------------- | ------------------------------------- |
| Valid data      | 5+    | Positive tests | Clientes con nombres/emails validos   |
| Invalid data    | 1     | Negative tests | Search term sin resultados            |
| Boundary values | 3     | Boundary tests | 0 clientes, 20 clientes, 21+ clientes |
| Security data   | 2     | Security tests | Multi-user data isolation             |

### Data Generation Strategy

**Static Test Data:**

- User emails: "userA@test.com", "userB@test.com"
- Search terms: "john", "xyz123", "@gmail"

**Dynamic Test Data (using Faker.js):**

- Client names: `faker.company.name()`
- Client emails: `faker.internet.email()`
- Bulk clients: Loop with faker for 45 clients

**Test Data Cleanup:**

- All test data is cleaned up after test execution
- Tests are idempotent (can run multiple times)
- Tests do not depend on execution order

---

## Edge Cases Summary

| Edge Case                          | Covered in Original Story? | Added to Refined AC?   | Test Case    | Priority |
| ---------------------------------- | -------------------------- | ---------------------- | ------------ | -------- |
| Busqueda sin resultados            | No                         | Yes (Scenario 4)       | TC-04        | High     |
| Caracteres especiales en busqueda  | No                         | Needs Dev confirmation | TBD          | High     |
| Busqueda con espacios              | No                         | Implicit (trim)        | Parametrized | Medium   |
| Exactamente 20 clientes (boundary) | No                         | Yes (Scenario 8)       | TC-06        | Medium   |
| Pagina invalida                    | No                         | Yes (Edge Case 5)      | TC-10        | Medium   |
| Nulls en ordenamiento              | No                         | Needs Dev confirmation | TBD          | Low      |

---

## Definition of Done (QA Perspective)

Esta story se considera "Done" desde QA cuando:

- [ ] All ambiguities and questions from this document are resolved
- [ ] Story is updated with suggested improvements (if accepted by PO)
- [ ] All test cases are executed and passing
- [ ] Critical/High test cases: 100% passing
- [ ] Medium/Low test cases: >=95% passing
- [ ] All critical and high bugs resolved and verified
- [ ] API contract validation passed
- [ ] RLS security test passed
- [ ] Regression tests passed
- [ ] Exploratory testing completed
- [ ] Test execution report generated

---

## Related Documentation

- **Story:** `.context/PBI/epics/EPIC-SQ-13-client-management/stories/STORY-SQ-15-list-clients/story.md`
- **Epic:** `.context/PBI/epics/EPIC-SQ-13-client-management/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-SQ-13-client-management/feature-test-plan.md`
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/` (all files)
- **SRS:** `.context/SRS/` (all files)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`

---

## Test Execution Tracking

[Esta seccion se completa durante ejecucion]

**Test Execution Date:** [TBD]
**Environment:** Staging
**Executed By:** [Nombre]

**Results:**

- Total Tests: 10
- Passed: [TBD]
- Failed: [TBD]
- Blocked: [TBD]

**Bugs Found:**

- [Bug ID 1]: [Descripcion breve]

**Sign-off:** [Nombre QA] - [Fecha]

---

_Documento generado como parte de Fase 5 - Shift-Left Testing_
_Ultima actualizacion: 2026-01-27_
