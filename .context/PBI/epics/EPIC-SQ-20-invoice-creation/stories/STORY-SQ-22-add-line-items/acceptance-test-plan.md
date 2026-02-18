# Acceptance Test Plan: STORY-SQ-22 - Add Line Items to Invoice

**Fecha:** 2026-02-18
**QA Engineer:** Ely (Shift-Left Analysis)
**Story Jira Key:** [SQ-22](https://upexgalaxy65.atlassian.net/browse/SQ-22)
**Epic:** EPIC-SQ-20 - Invoice Creation
**Status:** Draft | Pending Team Review

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Diseñador Organizado) - Necesita detallar sus servicios profesionalmente en facturas. Sus diseños tienen múltiples entregas (logo, manual, variantes) que necesita listar por separado.
- **Secondary:** Valentina (Desarrolladora Internacional) - Factura servicios de desarrollo por horas/días que requieren items detallados para clientes internacionales.

**Business Value:**

- **Value Proposition:** Los freelancers necesitan detallar sus servicios con descripción, cantidad y precio unitario para que sus clientes entiendan exactamente qué están pagando. Sin esta funcionalidad, las facturas no tienen sentido.
- **Business Impact:** Esta es una funcionalidad BLOCKER - sin line items no se pueden crear facturas funcionales. El cálculo de subtotal depende directamente de los items.

**Related User Journey:**

- Journey: J1 - Registro y Primera Factura (Happy Path)
- Step: Step 10 - Agregar Items a la Factura
  - *"Carlos agrega items: 'Diseño de logo - 1 - $500 USD'"*
  - *"Sistema calcula subtotal y total automáticamente, permite agregar más items"*

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: `LineItemsTable`, `LineItemRow`, `LineItemForm`, `AddItemButton`
- Pages/Routes: `/invoices/new`, `/invoices/[id]/edit`
- State Management: React Hook Form con array fields (`useFieldArray`)

**Backend:**

- API Endpoints:
  - `POST /api/invoices` - Crear factura con items embebidos
  - `PUT /api/invoices/:id` - Actualizar factura e items
  - (Según FR-015/FR-016 de functional-specs.md)
- Services: Invoice calculation service (subtotal, tax, discount, total)
- Database:
  - Tabla: `invoice_items`
  - Columnas: `id`, `invoice_id`, `description`, `quantity`, `unit_price`, `subtotal`, `sort_order`

**External Services:**

- N/A para esta story

**Integration Points:**

- LineItems → Invoice (FK relationship)
- LineItems → Calculation Service (subtotal actualización en tiempo real)
- Frontend calculations ↔ Backend validation (consistencia)

---

### Story Complexity Analysis

**Overall Complexity:** High

**Complexity Factors:**

- Business logic complexity: **Medium** - Cálculos de line_total son simples (qty × price)
- Integration complexity: **High** - Form arrays dinámicos, recálculo en tiempo real, sync con backend
- Data validation complexity: **Medium** - Múltiples campos con validaciones específicas
- UI complexity: **High** - Tabla editable, agregar/eliminar/reordenar filas, drag-and-drop

**Estimated Test Effort:** High
**Rationale:** Formulario dinámico con arrays requiere testing exhaustivo de estados: vacío, un item, múltiples items, edición, eliminación, reordenamiento. Además, validaciones de campos y cálculos en tiempo real.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**

- **Risk 1 (High): Errores de cálculo en totales**
  - **Relevance to This Story:** ✅ DIRECTAMENTE RELEVANTE - Los line items son la base del subtotal. Cualquier error en line_total (qty × price) se propaga al total final.
  - **Mitigation:** Cálculos duplicados client/server, unit tests exhaustivos, precision testing.

- **Risk 2 (High): Condiciones de carrera en numeración**
  - **Relevance to This Story:** ❌ No aplica a esta story

- **Risk 3 (Medium): UX confusa**
  - **Relevance to This Story:** ✅ RELEVANTE - La tabla de line items debe ser intuitiva. Agregar items sin salir del flujo.

**Integration Points from Epic Analysis:**

- **Frontend ↔ Backend API:** ✅ Applies - Items se envían como array en payload de invoice
- **Invoice ↔ Client:** ❌ No aplica directamente
- **Invoice ↔ Business Profile:** ❌ No aplica directamente

**Critical Questions Already Asked at Epic Level:**

**Questions for PO:**

- **Q1: ¿El impuesto se calcula sobre (subtotal - descuento)?**
  - **Status:** ✅ Answered
  - **Answer:** Sí, impuesto sobre (subtotal - descuento)
  - **Impact on This Story:** Los line items calculan el subtotal, que es la base para todo lo demás.

**Questions for Dev:**

- **Q3: ¿Auto-save guarda drafts incompletos?**
  - **Status:** ✅ Answered
  - **Answer:** Sí, guarda drafts incompletos. Validación solo al enviar.
  - **Impact on This Story:** Se puede guardar factura con 0 items como draft, pero requiere mínimo 1 para enviar.

**Test Strategy from Epic:**

- Test Levels: Unit, Integration, E2E, API
- Tools: Playwright, Vitest, Faker.js
- **How This Story Aligns:** Esta story requiere:
  - **Unit tests:** Para cálculo de line_total
  - **Integration tests:** Para array de items en API
  - **E2E tests:** Para flujo completo de agregar/editar/eliminar items

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** Esta story es FUNDAMENTAL - sin line items no hay factura. Es el corazón de SQ-20.
- **Inherited Risks:** Error de cálculo (Risk 1 del epic) aplica directamente.
- **Unique Considerations:** Drag-and-drop para reordenar es opcional para MVP según story.md.

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Límite máximo de line items

- **Location in Story:** Technical Notes - no menciona límite
- **Question for PO/Dev:** ¿Hay un límite máximo de items por factura?
- **Impact on Testing:** Sin límite definido, no podemos probar boundary cases correctamente.
- **Suggested Clarification:** Definir máximo (Feature Test Plan sugiere 50 items).

**Ambiguity 2:** Comportamiento con valores decimales en quantity

- **Location in Story:** Acceptance Criteria Scenario 1
- **Question for PO/Dev:** ¿Quantity permite decimales? (ej: 2.5 horas de trabajo)
- **Impact on Testing:** Afecta validación y cálculos de precisión.
- **Suggested Clarification:** DB usa DECIMAL(10,2), asumo que sí permite decimales.

**Ambiguity 3:** Descripción vacía vs descripción con solo espacios

- **Location in Story:** No especificado
- **Question for PO/Dev:** ¿Se permite descripción con solo espacios en blanco?
- **Impact on Testing:** Necesario para validaciones negativas.
- **Suggested Clarification:** Agregar: "Description must contain at least 1 non-whitespace character"

---

### Missing Information / Gaps

**Gap 1:** Límite de caracteres para descripción

- **Type:** Technical Details
- **Why It's Critical:** Necesario para boundary testing y UI handling
- **Suggested Addition:** "description max 500 chars" (según FR-015 de functional-specs.md)
- **Impact if Not Added:** UI podría romperse con descripciones muy largas

**Gap 2:** Formato de precio unitario

- **Type:** Business Rule
- **Why It's Critical:** ¿Se permiten precios de $0? ¿Precios negativos?
- **Suggested Addition:** "unit_price >= 0" (según FR-015: >= 0)
- **Impact if Not Added:** Facturas con items de $0 o negativos podrían ser inválidas

**Gap 3:** Comportamiento mínimo de items

- **Type:** Acceptance Criteria
- **Why It's Critical:** Story dice "Minimum 1 line required" pero no hay AC que lo cubra
- **Suggested Addition:** Agregar scenario: "Given 1 line item, When I try to delete it, Then system prevents deletion with message"
- **Impact if Not Added:** Usuario podría quedar con factura sin items

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Eliminar último item

- **Scenario:** Usuario tiene 1 item y trata de eliminarlo
- **Expected Behavior:** Sistema previene eliminación y muestra mensaje "Debe haber al menos 1 item"
- **Criticality:** High
- **Action Required:** Add to story + test cases

**Edge Case 2:** Item con quantity = 0

- **Scenario:** Usuario ingresa quantity = 0
- **Expected Behavior:** Error de validación "Quantity must be greater than 0"
- **Criticality:** High
- **Action Required:** Add to test cases only

**Edge Case 3:** Item con precio muy alto

- **Scenario:** Usuario ingresa unit_price = 999,999,999.99
- **Expected Behavior:** Aceptar si está dentro del límite DECIMAL(10,2) o mostrar error
- **Criticality:** Medium
- **Action Required:** Add to test cases (boundary)

**Edge Case 4:** Caracteres especiales en descripción

- **Scenario:** Descripción con emojis, HTML, o scripts maliciosos
- **Expected Behavior:** Sanitizar input, mostrar texto sin ejecutar
- **Criticality:** High (security)
- **Action Required:** Add to test cases

**Edge Case 5:** Reordenar con un solo item

- **Scenario:** Usuario intenta drag-and-drop con solo 1 item
- **Expected Behavior:** No hay cambio visual, operación no tiene efecto
- **Criticality:** Low
- **Action Required:** Add to test cases only

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues:**

- [x] Missing test data examples (no examples of valid/invalid descriptions, quantities)
- [x] Missing error scenarios (qué mensaje aparece si quantity = 0?)
- [ ] Acceptance criteria are vague or subjective
- [ ] Expected results are not specific enough

**Recommendations to Improve Testability:**

1. Agregar límite máximo de items (recomendado: 50)
2. Especificar que description max 500 chars
3. Agregar AC para "cannot delete last item"
4. Especificar mensajes de error exactos para validaciones

---

## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Add first line item (Happy Path)

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Usuario está autenticado
  - Usuario está en formulario de crear/editar factura
  - No hay line items aún (formulario vacío o con 1 item vacío por default)

- **When:**
  - Usuario ingresa description: "Diseño de Logo"
  - Usuario ingresa quantity: 1
  - Usuario ingresa unit_price: 500.00
  - Sistema calcula line_total automáticamente

- **Then:**
  - Line item aparece en la tabla
  - Line total muestra: $500.00 (1 × 500)
  - Subtotal de factura se actualiza a $500.00
  - Botón "Agregar item" está disponible

---

### Scenario 2: Add multiple line items

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Usuario tiene 1 line item existente (Diseño de Logo - $500)

- **When:**
  - Usuario hace click en "Agregar item" (o "Add line")
  - Usuario ingresa description: "Manual de marca"
  - Usuario ingresa quantity: 1
  - Usuario ingresa unit_price: 200.00

- **Then:**
  - Segunda fila aparece en la tabla
  - Line 1: $500.00, Line 2: $200.00
  - Subtotal actualiza a $700.00 (500 + 200)
  - Ambos items son editables

---

### Scenario 3: Line total calculation (automatic)

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Usuario está editando un line item

- **When:**
  - Usuario ingresa quantity: 5
  - Usuario ingresa unit_price: 100.00

- **Then:**
  - Line total calcula automáticamente: $500.00 (5 × 100)
  - Cálculo ocurre en tiempo real (sin necesidad de guardar)
  - Subtotal de factura se actualiza inmediatamente

---

### Scenario 4: Edit existing line item

**Type:** Positive
**Priority:** High

- **Given:**
  - Usuario tiene line item: "Diseño" | qty: 1 | price: $500 | total: $500

- **When:**
  - Usuario cambia quantity de 1 a 3

- **Then:**
  - Line total actualiza automáticamente a $1,500.00 (3 × 500)
  - Subtotal de factura se recalcula
  - Cambios son editables hasta guardar

---

### Scenario 5: Remove line item (with multiple items)

**Type:** Positive
**Priority:** High

- **Given:**
  - Usuario tiene 3 line items:
    - Item 1: $500
    - Item 2: $200
    - Item 3: $300
  - Subtotal: $1,000

- **When:**
  - Usuario hace click en "eliminar" (icono trash) en Item 2

- **Then:**
  - Item 2 desaparece de la lista
  - Solo quedan Item 1 y Item 3
  - Subtotal recalcula a $800.00 (500 + 300)
  - Items restantes mantienen sus datos

---

### Scenario 6: Cannot delete last item

**Type:** Negative (Edge Case)
**Priority:** High
**Source:** Identified during critical analysis

- **Given:**
  - Usuario tiene exactamente 1 line item
  - Story requirement: "Minimum 1 line required"

- **When:**
  - Usuario intenta eliminar el único item

- **Then:**
  - Sistema previene la eliminación
  - Muestra mensaje: "Debe haber al menos 1 item en la factura"
  - El item permanece en la tabla
  - **⚠️ NOTE:** This behavior needs Dev confirmation

---

### Scenario 7: Validation - empty description

**Type:** Negative
**Priority:** High

- **Given:**
  - Usuario está agregando un line item

- **When:**
  - Usuario deja description vacía
  - Usuario ingresa quantity: 1
  - Usuario ingresa unit_price: 100.00
  - Usuario intenta guardar factura

- **Then:**
  - Error de validación en campo description
  - Mensaje: "La descripción es requerida"
  - Factura no se guarda
  - Focus se mueve al campo con error

---

### Scenario 8: Validation - quantity zero or negative

**Type:** Negative
**Priority:** High

- **Given:**
  - Usuario está agregando un line item

- **When:**
  - Usuario ingresa quantity: 0 (o -1)

- **Then:**
  - Error de validación
  - Mensaje: "La cantidad debe ser mayor a 0"
  - Line total muestra $0.00 o no calcula

---

### Scenario 9: Validation - description max length

**Type:** Boundary
**Priority:** Medium

- **Given:**
  - Usuario está editando description

- **When:**
  - Usuario intenta ingresar más de 500 caracteres

- **Then:**
  - Sistema trunca o previene input adicional
  - Contador de caracteres muestra "500/500"
  - Mensaje: "Máximo 500 caracteres permitidos"

---

### Scenario 10: Reorder line items (drag and drop) - MVP Optional

**Type:** Positive
**Priority:** Low (MVP Optional)

- **Given:**
  - Usuario tiene 3 line items en orden: A, B, C

- **When:**
  - Usuario arrastra item A y lo suelta después de B

- **Then:**
  - Orden cambia a: B, A, C
  - sort_order en DB se actualiza
  - Subtotal NO cambia (solo orden visual)
  - **Note:** Marcado como "optional for MVP" en story.md

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 15

**Breakdown:**

- Positive: 6 test cases
- Negative: 4 test cases
- Boundary: 3 test cases
- Integration: 2 test cases

**Rationale:** Story de alta complejidad con formulario dinámico. Los 6 scenarios originales + edge cases identificados + validaciones negativas justifican 15 casos. Parametrización reduce redundancia.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Validación de campos de line item

- **Base Scenario:** Validar que campos invalidos muestran error correcto
- **Parameters to Vary:** Campo, valor inválido, mensaje de error

| Campo | Valor Inválido | Expected Error Message |
|-------|----------------|------------------------|
| description | "" (empty) | "La descripción es requerida" |
| description | "   " (whitespace) | "La descripción es requerida" |
| quantity | 0 | "La cantidad debe ser mayor a 0" |
| quantity | -1 | "La cantidad debe ser mayor a 0" |
| unit_price | -100 | "El precio debe ser mayor o igual a 0" |

**Total Tests from Parametrization:** 5 (colapsan en 1 test parametrizado)
**Benefit:** Reduce 5 tests a 1 test con 5 data sets, mejor mantenimiento.

---

**Parametrized Test Group 2:** Cálculo de line total

- **Base Scenario:** Validar que line_total = quantity × unit_price
- **Parameters to Vary:** quantity, unit_price, expected line_total

| quantity | unit_price | Expected line_total |
|----------|------------|---------------------|
| 1 | 100.00 | $100.00 |
| 5 | 200.00 | $1,000.00 |
| 0.5 | 100.00 | $50.00 |
| 10 | 0.00 | $0.00 |
| 999 | 999.99 | $999,990.01 |

**Total Tests from Parametrization:** 5 data sets
**Benefit:** Cobertura exhaustiva de cálculos con diferentes valores.

---

### Test Outlines

#### **Validar agregar primer line item con datos válidos**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**

- Usuario autenticado como `demo@soloq.app`
- Navegado a `/invoices/new`
- Cliente seleccionado
- Tabla de items vacía o con 1 item vacío por default

**Test Steps:**

1. Ingresar descripción: "Diseño de Logo"
   - **Data:** description: "Diseño de Logo"
2. Ingresar cantidad: 1
   - **Data:** quantity: 1
3. Ingresar precio unitario: 500.00
   - **Data:** unit_price: 500.00
4. Verificar line total calculado

**Expected Result:**

- **UI:**
  - Line item aparece en tabla
  - Line total muestra "USD 500.00"
  - Subtotal actualiza a "USD 500.00"
  - Botón "Agregar item" visible

**Test Data:**

```json
{
  "input": {
    "description": "Diseño de Logo",
    "quantity": 1,
    "unit_price": 500.00
  },
  "expected": {
    "line_total": 500.00,
    "subtotal": 500.00
  }
}
```

---

#### **Validar agregar múltiples line items**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**

- 1 line item existente: "Diseño de Logo" | qty: 1 | price: $500

**Test Steps:**

1. Click en "Agregar item"
2. Ingresar description: "Manual de marca"
3. Ingresar quantity: 1
4. Ingresar unit_price: 200.00
5. Verificar subtotal actualizado

**Expected Result:**

- **UI:**
  - 2 rows en tabla de items
  - Item 1: $500.00
  - Item 2: $200.00
  - Subtotal: $700.00

---

#### **Validar cálculo automático de line total**

**Related Scenario:** Scenario 3
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** ✅ Yes (Group 2)

**Preconditions:**

- Formulario de factura abierto
- Al menos 1 line item editable

**Test Steps:**

1. Ingresar quantity según data set
2. Ingresar unit_price según data set
3. Verificar line_total calculado en tiempo real

**Expected Result:**

- Line total = quantity × unit_price
- Cálculo inmediato sin refresh
- Subtotal actualiza automáticamente

**Test Data:** (Ver Parametrized Test Group 2)

---

#### **Validar edición de line item existente**

**Related Scenario:** Scenario 4
**Type:** Positive
**Priority:** High
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**

- Line item existente: "Diseño" | qty: 1 | price: $500 | total: $500

**Test Steps:**

1. Ubicar campo quantity del item
2. Cambiar quantity de 1 a 3
3. Verificar recálculo

**Expected Result:**

- Line total: $1,500.00 (3 × 500)
- Subtotal recalculado
- Cambio inmediato

---

#### **Validar eliminación de line item (múltiples items)**

**Related Scenario:** Scenario 5
**Type:** Positive
**Priority:** High
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**

- 3 line items:
  - Item 1: "A" | $500
  - Item 2: "B" | $200
  - Item 3: "C" | $300
- Subtotal: $1,000

**Test Steps:**

1. Click en botón eliminar del Item 2
2. Confirmar eliminación (si hay modal)
3. Verificar tabla actualizada

**Expected Result:**

- Item 2 removido de tabla
- Solo Item 1 y Item 3 visibles
- Subtotal: $800.00

---

#### **Validar prevención de eliminar último item**

**Related Scenario:** Scenario 6 (Edge Case)
**Type:** Negative
**Priority:** High
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**

- Exactamente 1 line item en la factura

**Test Steps:**

1. Click en botón eliminar del único item
2. Observar comportamiento del sistema

**Expected Result:**

- Eliminación es prevenida o botón está deshabilitado
- Mensaje: "Debe haber al menos 1 item en la factura"
- Item permanece en tabla

---

#### **Validar error con descripción vacía**

**Related Scenario:** Scenario 7
**Type:** Negative
**Priority:** High
**Test Level:** E2E
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- Formulario de factura abierto

**Test Steps:**

1. Dejar description vacío
2. Ingresar quantity: 1
3. Ingresar unit_price: 100
4. Intentar guardar factura

**Expected Result:**

- Error de validación en campo description
- Mensaje: "La descripción es requerida"
- Factura no se guarda

---

#### **Validar error con quantity inválido**

**Related Scenario:** Scenario 8
**Type:** Negative
**Priority:** High
**Test Level:** E2E
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- Line item en edición

**Test Steps:**

1. Ingresar description: "Test"
2. Ingresar quantity: 0 (o -1)
3. Ingresar unit_price: 100
4. Observar validación

**Expected Result:**

- Error de validación
- Mensaje: "La cantidad debe ser mayor a 0"
- Line total: $0.00 o N/A

---

#### **Validar límite de caracteres en descripción**

**Related Scenario:** Scenario 9
**Type:** Boundary
**Priority:** Medium
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**

- Line item en edición

**Test Steps:**

1. Ingresar descripción de 500 caracteres exactos
2. Verificar que se acepta
3. Intentar agregar 1 caracter más
4. Verificar comportamiento

**Expected Result:**

- 500 chars: Aceptado
- 501+ chars: Truncado o rechazado
- Contador de caracteres visible (si existe)

---

#### **Validar valores boundary en cálculos**

**Related Scenario:** N/A (Boundary)
**Type:** Boundary
**Priority:** Medium
**Test Level:** E2E
**Parametrized:** ✅ Yes (Group 2)

**Preconditions:**

- Line item editable

**Test Steps:**

1. Ingresar quantity: 0.01 (mínimo positivo)
2. Ingresar unit_price: 0.01
3. Verificar line_total: $0.0001 → redondeado a $0.00

**Expected Result:**

- Cálculos con decimales funcionan
- Redondeo correcto a 2 decimales

---

#### **Validar integridad de datos al guardar factura con items**

**Related Scenario:** N/A (Integration)
**Type:** Integration
**Priority:** High
**Test Level:** API

**Preconditions:**

- Usuario autenticado con token válido
- Cliente existente

**Test Steps:**

1. POST /api/invoices con payload incluyendo items array
2. Verificar response
3. GET /api/invoices/:id para verificar persistencia

**Expected Result:**

- **Status Code:** 201 Created
- **Response Body:**
  ```json
  {
    "success": true,
    "invoice": {
      "id": "uuid",
      "items": [
        {
          "description": "Test Item",
          "quantity": 2,
          "unit_price": 150.00,
          "subtotal": 300.00
        }
      ],
      "subtotal": 300.00
    }
  }
  ```
- **Database:** invoice_items contiene los items con sort_order correcto

---

#### **Validar actualización de items existentes vía API**

**Related Scenario:** N/A (Integration)
**Type:** Integration
**Priority:** High
**Test Level:** API

**Preconditions:**

- Factura existente con 2 items
- Status: draft

**Test Steps:**

1. PUT /api/invoices/:id con items modificados
2. Verificar response con nuevos cálculos
3. Verificar que items anteriores fueron reemplazados o actualizados

**Expected Result:**

- **Status Code:** 200 OK
- Items actualizados correctamente
- Subtotal recalculado
- **Database:** invoice_items refleja cambios

---

## 📊 Edge Cases Summary

| Edge Case | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
|-----------|----------------------------|----------------------|-----------|----------|
| Eliminar último item | ❌ No | ✅ Yes (Scenario 6) | TC-06 | High |
| Quantity = 0 | ❌ No | ✅ Yes (Scenario 8) | TC-08 | High |
| Descripción vacía | ❌ No | ✅ Yes (Scenario 7) | TC-07 | High |
| Descripción max 500 chars | ❌ No | ✅ Yes (Scenario 9) | TC-09 | Medium |
| Valores decimales en quantity | ❌ No | ✅ Yes (Boundary) | TC-10 | Medium |
| Precio $0 | ❌ No | ✅ Yes (Parametrized) | TC-03 | Low |
| Reorder con 1 item | ✅ Implícito | ❌ Low priority | N/A | Low |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type | Count | Purpose | Examples |
|-----------|-------|---------|----------|
| Valid data | 5 | Positive tests | "Diseño de Logo", qty: 1, price: $500 |
| Invalid data | 5 | Negative tests | empty description, qty: 0, qty: -1 |
| Boundary values | 4 | Boundary tests | qty: 0.01, price: 0.00, desc: 500 chars |
| Edge case data | 3 | Edge case tests | single item delete, max items |

### Data Generation Strategy

**Static Test Data:**

- Description: "Diseño de Logo", "Desarrollo Web", "Consultoría"
- Quantities: 1, 5, 0.5, 10
- Prices: 100.00, 500.00, 0.00, 999.99

**Dynamic Test Data (using Faker.js):**

- Description: `faker.commerce.productName()`
- Quantity: `faker.number.float({ min: 1, max: 100, precision: 0.01 })`
- Price: `faker.commerce.price({ min: 10, max: 1000 })`

**Test Data Cleanup:**

- ✅ All test invoices created during testing will be deleted
- ✅ Tests use test user isolation (demo@soloq.app)
- ✅ Tests are idempotent

---

## 📝 PARTE 2: Integración y Output

**Esta sección documenta las acciones realizadas en Jira y localmente.**

### What Was Done

**Jira Updates:**

- [ ] Story refined in Jira with acceptance criteria improvements
- [ ] Label `shift-left-reviewed` added
- [ ] Acceptance test cases added as comment in Jira story
- [ ] Team members tagged for review

**Local Files:**

- ✅ `acceptance-test-plan.md` created at current path

---

## ✅ Definition of Done (QA Perspective)

Esta story se considera "Done" desde QA cuando:

- [ ] All ambiguities and questions from this document are resolved
- [ ] All 15 test cases are executed and passing
- [ ] Critical/High test cases: 100% passing
- [ ] Medium/Low test cases: ≥95% passing
- [ ] All critical and high bugs resolved and verified
- [ ] Integration tests passing
- [ ] Regression tests passed
- [ ] Exploratory testing completed

---

## 📎 Related Documentation

- **Story:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-22-add-line-items/story.md`
- **Epic:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/feature-test-plan.md`
- **Functional Specs:** `.context/SRS/functional-specs.md` (FR-015, FR-016)
- **Architecture:** `.context/SRS/architecture-specs.md` (invoice_items table)

---

## 📋 Test Execution Tracking

[Esta sección se completa durante ejecución]

**Test Execution Date:** [TBD]
**Environment:** Staging
**Executed By:** [Nombre]

**Results:**

- Total Tests: 15
- Passed: [TBD]
- Failed: [TBD]
- Blocked: [TBD]

**Bugs Found:**

- [Bug ID 1]: [Descripción breve]

**Sign-off:** [Nombre QA] - [Fecha]

---

_Documento generado como parte del Shift-Left Testing Analysis_
_Última actualización: 2026-02-18_
