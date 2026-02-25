# Acceptance Test Plan: STORY-SQ-22 - Add Line Items to Invoice

**Fecha:** 2026-02-18
**QA Engineer:** Ely (Shift-Left Analysis)
**Story Jira Key:** [SQ-22](https://upexgalaxy65.atlassian.net/browse/SQ-22)
**Epic:** EPIC-SQ-20 - Invoice Creation
**Status:** ✅ Approved - All Questions Resolved

---

## 📋 Reglas de Negocio Confirmadas (PO/Dev Responses)

| Campo | Validación | Mensaje de Error |
|-------|------------|------------------|
| description | `trim().length >= 1` y `<= 500` | "La descripción es requerida" / "Máximo 500 caracteres" |
| quantity | `> 0`, decimales permitidos (max 2) | "La cantidad debe ser mayor a 0" |
| unit_price | `>= 0`, decimales permitidos (max 2) | "El precio debe ser mayor o igual a 0" |
| max_items | `<= 50` por factura | "Máximo 50 items por factura" |

### Respuestas a Preguntas Críticas

**Q1 (PO): ¿Máximo de line items?**
- **Respuesta:** 50 items
- **Justificación:** 95% de facturas tienen 1-15 items. 50 cubre edge cases. Referencia: QuickBooks 100, FreshBooks advierte en 50.
- **Implementación:** Warning en item 45, bloqueo en 50, error `MAX_ITEMS_EXCEEDED`

**Q2 (PO): ¿Descripciones solo espacios?**
- **Respuesta:** No permitido
- **Validación:** `description.trim().length >= 1`

**Q3 (Dev): ¿Quantity decimales?**
- **Respuesta:** Sí, hasta 2 decimales
- **Casos de uso:** "2.5 horas", "0.5 días"
- **Implementación:** `<input type="number" step="0.01">`

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

### Ambiguities Identified (RESOLVED ✅)

**Ambiguity 1:** Límite máximo de line items
- **Resolution:** ✅ 50 items máximo (PO confirmed)

**Ambiguity 2:** Comportamiento con valores decimales en quantity
- **Resolution:** ✅ Permitido hasta 2 decimales (Dev confirmed)

**Ambiguity 3:** Descripción vacía vs descripción con solo espacios
- **Resolution:** ✅ No permitido, `trim().length >= 1` (PO confirmed)

---

### Missing Information / Gaps (RESOLVED ✅)

**Gap 1:** Límite de caracteres para descripción
- **Resolution:** ✅ 500 caracteres máximo (per FR-015)

**Gap 2:** Formato de precio unitario
- **Resolution:** ✅ `unit_price >= 0`, decimales permitidos

**Gap 3:** Comportamiento mínimo de items
- **Resolution:** ✅ Mínimo 1 item para enviar, 0 permitido en drafts

---

### Edge Cases (All Covered ✅)

| Edge Case | Expected Behavior | Test Case |
|-----------|-------------------|-----------|
| Eliminar último item | Prevenir, mensaje "Debe haber al menos 1 item" | TC-06 |
| Quantity = 0 | Error "La cantidad debe ser mayor a 0" | TC-09 |
| Descripción vacía/whitespace | Error "La descripción es requerida" | TC-07, TC-08 |
| Max 500 chars | Truncar o rechazar | TC-10 |
| Decimales en quantity | Permitido (2.5 horas) | TC-11 |
| Precio $0 | Permitido (free item) | TC-12 |
| Item #51 | Bloquear, "Máximo 50 items" | TC-13 |

---

## ✅ Paso 3: Refined Acceptance Criteria (Final)

### Scenario 1: Add first line item (Happy Path)

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Usuario está autenticado
  - Usuario está en formulario de crear/editar factura
  - No hay line items aún

- **When:**
  - Usuario ingresa description: "Diseño de Logo" (1-500 chars, no whitespace-only)
  - Usuario ingresa quantity: 1 (> 0, max 2 decimales)
  - Usuario ingresa unit_price: 500.00 (>= 0)

- **Then:**
  - Line item aparece en la tabla
  - Line total muestra: $500.00 (1 × 500)
  - Subtotal de factura se actualiza a $500.00
  - Botón "Agregar item" está disponible

---

### Scenario 2: Add multiple line items (max 50)

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Usuario tiene items existentes (< 50)

- **When:**
  - Usuario hace click en "Agregar item"
  - Usuario completa el nuevo item

- **Then:**
  - Nueva fila aparece en la tabla
  - Subtotal recalcula
  - **Boundary:** Warning visual en item 45, bloqueo en item 50

---

### Scenario 3: Line total calculation (automatic)

**Type:** Positive
**Priority:** Critical

- **Formula:** `line_total = quantity × unit_price`
- **Precision:** 2 decimales, redondeo estándar
- **Timing:** Cálculo en tiempo real (sin necesidad de guardar)

---

### Scenario 4: Edit existing line item

**Type:** Positive
**Priority:** High

- **When:** Usuario modifica quantity, unit_price, o description
- **Then:** Recálculo inmediato de line_total y subtotal

---

### Scenario 5: Remove line item (with multiple items)

**Type:** Positive
**Priority:** High

- **Given:** Usuario tiene 2+ line items
- **When:** Click en eliminar
- **Then:** Item removido, subtotal recalcula

---

### Scenario 6: Cannot delete last item

**Type:** Negative (Edge Case)
**Priority:** High

- **Given:** Exactamente 1 line item
- **When:** Usuario intenta eliminar el único item
- **Then:**
  - Eliminación prevenida (botón deshabilitado o modal)
  - Mensaje: "Debe haber al menos 1 item en la factura"

---

### Scenario 7: Validation - empty description

**Type:** Negative
**Priority:** High

- **When:** Usuario deja description vacía e intenta guardar
- **Then:** Error "La descripción es requerida"

---

### Scenario 8: Validation - whitespace-only description

**Type:** Negative
**Priority:** High

- **When:** Usuario ingresa "   " (solo espacios)
- **Then:** Error "La descripción es requerida" (tras `trim()`)

---

### Scenario 9: Validation - quantity zero or negative

**Type:** Negative
**Priority:** High

- **When:** Usuario ingresa quantity: 0 (o -1)
- **Then:** Error "La cantidad debe ser mayor a 0"

---

### Scenario 10: Validation - description max length

**Type:** Boundary
**Priority:** Medium

- **When:** Usuario intenta ingresar > 500 caracteres
- **Then:** Sistema trunca o previene, mensaje "Máximo 500 caracteres"

---

### Scenario 11: Decimal quantity (2.5 hours)

**Type:** Boundary
**Priority:** Medium

- **When:** Usuario ingresa quantity: 2.5
- **Then:** Aceptado, line_total calcula correctamente

---

### Scenario 12: Price $0 (free item)

**Type:** Boundary
**Priority:** Low

- **When:** Usuario ingresa unit_price: 0
- **Then:** Aceptado, line_total = $0.00

---

### Scenario 13: Max items limit (50)

**Type:** Boundary
**Priority:** High

- **When:** Usuario intenta agregar item #51
- **Then:**
  - Bloquear acción
  - Mensaje: "Máximo 50 items por factura"
  - **UX:** Warning visual en item 45

---

## 🧪 Paso 4: Test Design (Final)

### Test Coverage Analysis

**Total Test Cases Needed:** 15

**Breakdown:**

- Positive: 6 test cases
- Negative: 4 test cases
- Boundary: 3 test cases
- Integration: 2 test cases

---

### Test Cases Summary

| # | Test Case | Type | Priority | Parametrized |
|---|-----------|------|----------|--------------|
| 1 | Validar agregar primer line item con datos válidos | Positive | Critical | No |
| 2 | Validar agregar múltiples line items (hasta 50) | Positive | Critical | No |
| 3 | Validar cálculo automático de line total | Positive | Critical | Yes (Group 2) |
| 4 | Validar edición de line item existente | Positive | High | No |
| 5 | Validar eliminación de line item (múltiples items) | Positive | High | No |
| 6 | Validar prevención de eliminar último item | Negative | High | No |
| 7 | Validar error con descripción vacía | Negative | High | Yes (Group 1) |
| 8 | Validar error con descripción solo espacios | Negative | High | Yes (Group 1) |
| 9 | Validar error con quantity inválido (0, -1) | Negative | High | Yes (Group 1) |
| 10 | Validar límite de caracteres en descripción (500) | Boundary | Medium | No |
| 11 | Validar decimal quantity (2.5 horas) | Boundary | Medium | Yes (Group 2) |
| 12 | Validar precio $0 permitido (free item) | Boundary | Low | Yes (Group 2) |
| 13 | Validar límite máximo 50 items | Boundary | High | No |
| 14 | API: Crear factura con items (POST) | Integration | High | No |
| 15 | API: Actualizar items existentes (PUT) | Integration | High | No |

---

### Parametrized Test Groups

**Group 1: Field Validation**

| Campo | Input | Expected Error |
|-------|-------|----------------|
| description | "" (empty) | "La descripción es requerida" |
| description | "   " (whitespace) | "La descripción es requerida" |
| quantity | 0 | "La cantidad debe ser mayor a 0" |
| quantity | -1 | "La cantidad debe ser mayor a 0" |
| unit_price | -100 | "El precio debe ser mayor o igual a 0" |

**Group 2: Line Total Calculation**

| quantity | unit_price | Expected line_total |
|----------|------------|---------------------|
| 1 | 100.00 | $100.00 |
| 5 | 200.00 | $1,000.00 |
| 2.5 | 80.00 | $200.00 |
| 0.5 | 100.00 | $50.00 |
| 10 | 0.00 | $0.00 |

---

## 📊 Edge Cases Summary

| Edge Case | Covered? | Test Case | Priority |
|-----------|----------|-----------|----------|
| Eliminar último item | ✅ | TC-06 | High |
| Quantity = 0 | ✅ | TC-09 | High |
| Descripción vacía | ✅ | TC-07 | High |
| Descripción whitespace | ✅ | TC-08 | High |
| Max 500 chars | ✅ | TC-10 | Medium |
| Decimal quantity | ✅ | TC-11 | Medium |
| Price $0 | ✅ | TC-12 | Low |
| Max 50 items | ✅ | TC-13 | High |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type | Count | Purpose | Examples |
|-----------|-------|---------|----------|
| Valid data | 5 | Positive tests | "Diseño de Logo", qty: 1, price: $500 |
| Invalid data | 5 | Negative tests | empty description, qty: 0, qty: -1 |
| Boundary values | 5 | Boundary tests | qty: 0.01, qty: 2.5, price: 0.00, desc: 500 chars, 50 items |
| Edge case data | 3 | Edge case tests | single item delete, max items |

### Data Generation Strategy

**Static Test Data:**

- Description: "Diseño de Logo", "Desarrollo Web", "Consultoría"
- Quantities: 1, 5, 2.5, 0.5, 10
- Prices: 100.00, 500.00, 0.00, 999.99

**Dynamic Test Data (using Faker.js):**

- Description: `faker.commerce.productName()`
- Quantity: `faker.number.float({ min: 0.01, max: 100, precision: 0.01 })`
- Price: `faker.commerce.price({ min: 0, max: 10000 })`

---

## ✅ Definition of Done (QA Perspective)

Esta story se considera "Done" desde QA cuando:

- [x] All ambiguities and questions resolved by PO/Dev
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
_Status: ✅ Ready for Implementation - All Questions Resolved_
