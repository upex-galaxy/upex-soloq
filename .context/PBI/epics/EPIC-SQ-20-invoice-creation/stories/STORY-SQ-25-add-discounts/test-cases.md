## 🧪 Shift-Left Test Cases - Generated 2026-02-05

**QA Engineer:** AI-Generated
**Status:** Draft - Pending PO/Dev Review

---

# Test Cases: STORY-SQ-25 - Add Discounts to Invoice

**Fecha:** 2026-02-05
**QA Engineer:** AI-Generated
**Story Jira Key:** SQ-25
**Epic:** EPIC-SQ-20 - Invoice Creation
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Diseñador Organizado) - necesita ofrecer promociones sin perder tiempo y mantener profesionalismo en facturas.
- **Secondary:** Valentina (Desarrolladora Internacional) - ofrece descuentos a clientes recurrentes y necesita claridad en cálculos.

**Business Value:**

- **Value Proposition:** Permite aplicar promociones rápidas sin romper el cálculo de totales.
- **Business Impact:** Mejora conversión y retención de clientes al facilitar descuentos claros y confiables.

**Related User Journey:**

- Journey: Registro y Primera Factura (Happy Path)
- Step: Step 10-12 (Agregar items y revisar totales antes de enviar)

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: Formulario de creación/edición de factura, selector de tipo de descuento, resumen de totales.
- Pages/Routes: Flujo de creación/edición de facturas (App Router).
- State Management: React Hook Form + Zod (validaciones en tiempo real).

**Backend:**

- API Endpoints: `POST /api/invoices`, `PUT /api/invoices/{invoiceId}`.
- Services: Cálculo de totales de factura.
- Database: `invoices` (discount_type, discount_value, discount_amount, tax_amount, total), `invoice_items`.

**External Services:**

- Ninguno para esta story.

**Integration Points:**

- Frontend ↔ API (validación y cálculo de totales).
- API ↔ Database (persistencia de montos con precisión).

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic complexity: Medium - requiere cálculos y reglas de límite.
- Integration complexity: Medium - consistencia frontend/backend.
- Data validation complexity: Medium - valores límite y mensajes de error.
- UI complexity: Low - selector + input con resumen.

**Estimated Test Effort:** Medium
**Rationale:** Variantes de tipo de descuento, límites y validaciones en UI/API.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**

- Risk 1: Errores de cálculo en totales
  - **Relevance to This Story:** El descuento impacta subtotal/tax/total y puede romper cálculos.
- Risk 2: Inconsistencia frontend/backend
  - **Relevance to This Story:** Descuento calculado diferente en UI vs API.

**Integration Points from Epic Analysis:**

- Integration Point 1: Frontend ↔ API
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** Persistir discount_type/value y validar cálculo coherente.
- Integration Point 2: API ↔ Database
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** Guardar discount_amount con precisión y tope.
- Integration Point 3: Invoice ↔ Client / Business Profile
  - **Applies to This Story:** ❌ No (no afecta descuentos directamente).

**Critical Questions Already Asked at Epic Level:**

**Questions for PO:**

- Question 1: ¿El impuesto se calcula sobre (subtotal - descuento) o sobre subtotal antes del descuento?
  - **Status:** ✅ Answered
  - **If Answered:** Impuesto se calcula sobre (subtotal - descuento).
  - **Impact on This Story:** Define la fórmula y el orden de cálculo.
- Question 2: ¿Descuento puede exceder el subtotal?
  - **Status:** ⏳ Pending
  - **Impact on This Story:** Define el comportamiento de tope y total mínimo.
- Question 3: ¿Factura de $0 es válida?
  - **Status:** ⏳ Pending
  - **Impact on This Story:** Define si total cero puede enviarse.

**Questions for Dev:**

- Question 1: Política de redondeo (banker vs half-up) para montos con decimales.
  - **Status:** ⏳ Pending
  - **Impact on This Story:** Afecta expected results con centavos.

**Test Strategy from Epic:**

- Test Levels: Unit, Integration, E2E, API
- Tools: Playwright, Vitest, Faker.js
- **How This Story Aligns:** UI + API tests para cálculos y persistencia; unit tests en lógica de cálculos.

**Updates and Clarifications from Epic Refinement:**

- Update 1: PO confirmó que impuesto se calcula sobre (subtotal - descuento).

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** Implementa la parte de descuentos del cálculo de totales.
- **Inherited Risks:** Errores de cálculo y divergencia FE/BE.
- **Unique Considerations:** Validaciones de límites y mensajes de advertencia.

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Orden de descuento vs impuesto aparece como “configurable” en Jira.

- **Location in Story:** Jira description - Technical Notes.
- **Question for PO/Dev:** ¿Se permite configurar el orden o es fijo (descuento antes de impuesto)?
- **Impact on Testing:** Cambia expected totals y cálculos de tax_amount.
- **Suggested Clarification:** Definir explícitamente “descuento siempre antes de impuesto”.

**Ambiguity 2:** ¿Qué mensaje/estilo de warning se muestra al exceder subtotal?

- **Location in Story:** Scenario 4: Discount limit.
- **Question for PO/Dev:** ¿Mensaje exacto y comportamiento de UI?
- **Impact on Testing:** No se puede validar UX ni mensajes exactos.
- **Suggested Clarification:** Especificar texto del warning y si bloquea guardado.

---

### Missing Information / Gaps

**Gap 1:** Política de redondeo para montos con decimales.

- **Type:** Business Rule
- **Why It's Critical:** Diferencias de 0.01 afectan totals y PDFs.
- **Suggested Addition:** Definir redondeo a 2 decimales con half-up.
- **Impact if Not Added:** Inconsistencia en UI/API/PDF.

**Gap 2:** Validación de valores inválidos (negativos, >100% en porcentaje).

- **Type:** Acceptance Criteria
- **Why It's Critical:** Sin reglas claras no se puede validar errores.
- **Suggested Addition:** Rechazar valores negativos y porcentaje > 100%.
- **Impact if Not Added:** Riesgo de totales negativos o incoherentes.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Descuento fijo mayor al subtotal.

- **Scenario:** Subtotal $80, descuento fijo $100.
- **Expected Behavior:** Tope al subtotal + warning visible.
- **Criticality:** High
- **Action Required:** Add to story

**Edge Case 2:** Descuento porcentual > 100%.

- **Scenario:** 110% sobre subtotal.
- **Expected Behavior:** Error de validación o tope en 100% (requiere confirmación).
- **Criticality:** High
- **Action Required:** Ask PO

**Edge Case 3:** Subtotal = $0 (items sin precio) con descuento.

- **Scenario:** Subtotal 0 y descuento cualquiera.
- **Expected Behavior:** Descuento = 0, total = 0, no warning.
- **Criticality:** Medium
- **Action Required:** Add to test cases only

**Edge Case 4:** Cambio de items luego de aplicar descuento.

- **Scenario:** Cambiar cantidad o precio después de aplicar descuento.
- **Expected Behavior:** Recalcula descuento y total en tiempo real.
- **Criticality:** Medium
- **Action Required:** Add to test cases only

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues (if any):**

- [ ] Acceptance criteria are vague or subjective
- [x] Expected results are not specific enough
- [x] Missing test data examples
- [x] Missing error scenarios
- [ ] Missing performance criteria (if NFR applies)
- [ ] Cannot be tested in isolation (missing dependencies info)

**Recommendations to Improve Testability:**

- Especificar orden exacto de cálculo (descuento antes de impuesto).
- Definir reglas de validación (negativos, >100%).
- Definir texto exacto del warning y comportamiento de UI.

---

## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Aplicar descuento porcentual con impuestos

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Usuario autenticado con cliente válido.
  - Factura con items que suman subtotal $1,000.00.
  - Impuesto configurado en 16%.

- **When:**
  - Selecciono tipo de descuento “percentage”.
  - Ingreso valor 10.

- **Then:**
  - Descuento calculado = $100.00.
  - Base imponible = $900.00.
  - Impuesto = $144.00.
  - Total = $1,044.00.
  - El resumen muestra tipo, valor y monto del descuento.

---

### Scenario 2: Aplicar descuento fijo con impuestos

**Type:** Positive
**Priority:** High

- **Given:**
  - Subtotal $1,000.00 y impuesto 16%.

- **When:**
  - Selecciono tipo “fixed” e ingreso 50.

- **Then:**
  - Descuento calculado = $50.00.
  - Base imponible = $950.00.
  - Impuesto = $152.00.
  - Total = $1,102.00.

---

### Scenario 3: Descuento excede el subtotal

**Type:** Boundary
**Priority:** High

- **Given:**
  - Subtotal $80.00.

- **When:**
  - Ingreso descuento fijo $100.00.

- **Then:**
  - Descuento se limita a $80.00.
  - Total no puede ser negativo (mínimo $0.00).
  - Se muestra warning visible en la UI.

---

### Scenario 4: No aplicar descuento

**Type:** Positive
**Priority:** Medium

- **Given:**
  - Factura con subtotal $1,000.00.

- **When:**
  - Dejo descuento vacío o en 0.

- **Then:**
  - No se aplica descuento.
  - No se muestra línea de descuento en el resumen.

---

### Scenario 5: Descuento inválido

**Type:** Negative
**Priority:** High

- **Given:**
  - Subtotal $500.00.

- **When:**
  - Ingreso descuento porcentual 110 o valor negativo.

- **Then:**
  - Se muestra error de validación en el campo.
  - No se permite guardar/enviar con valores inválidos.

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 12

**Breakdown:**

- Positive: 4 test cases
- Negative: 3 test cases
- Boundary: 3 test cases
- Integration: 2 test cases
- API: 2 test cases (incluidos en integration)

**Rationale for This Number:**

Cubre tipos de descuento, límites, validaciones y persistencia de cálculos en API/DB sin sobrecargar el alcance.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Matriz de valores de descuento

- **Base Scenario:** Cálculo de descuento y total con distintos tipos.
- **Parameters to Vary:** Tipo (percentage/fixed), valor, subtotal.
- **Test Data Sets:**

| Tipo       | Subtotal | Valor | Resultado esperado                     |
| ---------- | -------- | ----- | -------------------------------------- |
| percentage | 1000     | 10    | Descuento 100, total ajustado          |
| percentage | 1000     | 100   | Descuento 1000, total 0 (sin impuesto) |
| fixed      | 1000     | 50    | Descuento 50                           |
| fixed      | 80       | 100   | Descuento 80 (cap)                     |

**Total Tests from Parametrization:** 4
**Benefit:** Reduce duplicación y asegura cobertura de combinaciones clave.

---

## 🧪 Test Outlines

#### **Validar cálculo de descuento porcentual con impuesto aplicado**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

---

**Preconditions:**

- Usuario autenticado con business profile configurado.
- Cliente válido seleccionado.
- Items: 1 x $1,000.00.
- Tax rate = 16%.

---

**Test Steps:**

1. En el formulario de factura, seleccionar tipo de descuento “percentage”.
   - **Data:** discountValue = 10.
2. Verificar resumen de totales.
   - **Verify:** descuento $100.00, base $900.00, impuesto $144.00, total $1,044.00.

---

**Expected Result:**

- **UI:** Línea “Descuento (10%) -$100.00” visible; total actualizado.
- **System State:** Totales calculados en memoria según fórmula.

---

**Test Data:**

```json
{
  "input": {
    "items": [{ "description": "Servicio", "quantity": 1, "unitPrice": 1000 }],
    "taxRate": 16,
    "discountType": "percentage",
    "discountValue": 10
  }
}
```

---

**Post-conditions:**

- Ninguno (draft sin guardar).

---

#### **Validar cálculo de descuento fijo con impuesto aplicado**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

---

**Preconditions:**

- Usuario autenticado.
- Subtotal $1,000.00, tax rate 16%.

---

**Test Steps:**

1. Seleccionar tipo “fixed” e ingresar 50.
2. Verificar resumen de totales.

---

**Expected Result:**

- **UI:** Descuento $50.00, impuesto $152.00, total $1,102.00.

---

**Test Data:**

```json
{
  "input": {
    "subtotal": 1000,
    "taxRate": 16,
    "discountType": "fixed",
    "discountValue": 50
  }
}
```

---

#### **Validar límite de descuento al exceder subtotal**

**Related Scenario:** Scenario 3
**Type:** Boundary
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

---

**Preconditions:**

- Subtotal $80.00.

---

**Test Steps:**

1. Seleccionar tipo “fixed” e ingresar 100.
2. Revisar warning y total.

---

**Expected Result:**

- **UI:** Warning visible; descuento aplicado = $80.00; total $0.00.

---

#### **Validar ausencia de descuento cuando valor es 0**

**Related Scenario:** Scenario 4
**Type:** Boundary
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Subtotal $500.00.

---

**Test Steps:**

1. Dejar descuento vacío o ingresar 0.
2. Verificar resumen.

---

**Expected Result:**

- **UI:** No aparece línea de descuento; total = subtotal (+ impuesto si aplica).

---

#### **Validar error al ingresar porcentaje mayor a 100**

**Related Scenario:** Scenario 5
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Subtotal $1,000.00.

---

**Test Steps:**

1. Seleccionar tipo “percentage” e ingresar 110.
2. Intentar guardar/enviar factura.

---

**Expected Result:**

- **UI:** Error de validación en campo; acción de guardar/enviar bloqueada.

---

#### **Validar error al ingresar descuento negativo**

**Related Scenario:** Scenario 5
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Subtotal $1,000.00.

---

**Test Steps:**

1. Ingresar descuento -10 (porcentaje o fijo).
2. Verificar error.

---

**Expected Result:**

- **UI:** Error de validación; no se aplica descuento.

---

#### **Validar recalculo al modificar items con descuento aplicado**

**Related Scenario:** Scenario 1
**Type:** Edge Case
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Descuento porcentual 10% aplicado.

---

**Test Steps:**

1. Cambiar cantidad de item para aumentar subtotal.
2. Verificar descuento recalculado.

---

**Expected Result:**

- **UI:** Descuento se recalcula sobre nuevo subtotal y total se actualiza.

---

## 🔗 Integration Test Cases (If Applicable)

### Integration Test 1: Crear factura con descuento (Frontend ↔ API)

**Integration Point:** Frontend → Backend API
**Type:** Integration
**Priority:** High

**Preconditions:**

- API disponible y autenticación válida.
- Cliente y business profile existentes.

**Test Flow:**

1. Enviar `POST /api/invoices` con discountType y discountValue.
2. API calcula discount_amount y total.
3. Persistir en DB.

**Contract Validation:**

- Request format matches OpenAPI spec: ✅ Yes
- Response format matches OpenAPI spec: ✅ Yes
- Status codes match spec: ✅ Yes (201)

**Expected Result:**

- Integración exitosa.
- Respuesta incluye `discountType`, `discountValue`, `taxAmount`, `total`.

---

### Integration Test 2: Actualizar descuento en factura existente

**Integration Point:** Frontend → Backend API
**Type:** Integration
**Priority:** Medium

**Preconditions:**

- Factura existente en estado draft.

**Test Flow:**

1. Enviar `PUT /api/invoices/{id}` con nuevo descuento.
2. Verificar recalculo y persistencia.

**Expected Result:**

- Totales recalculados correctamente.
- DB refleja nuevos valores de descuento y total.

---

## 📊 Edge Cases Summary

| Edge Case                            | Covered in Original Story? | Added to Refined AC? | Test Case                            | Priority |
| ------------------------------------ | -------------------------- | -------------------- | ------------------------------------ | -------- |
| Descuento fijo > subtotal            | ❌ No                      | ✅ Yes (Scenario 3)  | Validar límite de descuento          | High     |
| Porcentaje > 100%                    | ❌ No                      | ✅ Yes (Scenario 5)  | Validar error porcentaje > 100       | High     |
| Subtotal = 0 con descuento           | ❌ No                      | ❌ No                | Validar ausencia de descuento        | Medium   |
| Cambiar items con descuento aplicado | ❌ No                      | ❌ No                | Validar recalculo al modificar items | Medium   |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type       | Count | Purpose        | Examples                 |
| --------------- | ----- | -------------- | ------------------------ |
| Valid data      | 4     | Positive tests | 10%, $50, 100%           |
| Invalid data    | 3     | Negative tests | -10, 110%, texto         |
| Boundary values | 3     | Boundary tests | 0, subtotal exacto, 100% |
| Edge case data  | 2     | Edge cases     | subtotal 0, item change  |

### Data Generation Strategy

**Static Test Data:**

- Subtotal base $1,000.00
- Tax rate 16%
- Cliente: "Acme Labs" - client@example.com

**Dynamic Test Data (using Faker.js):**

- User data: `faker.internet.email()`, `faker.person.firstName()`
- Numbers: `faker.number.int({ min: 1, max: 1000 })`

**Test Data Cleanup:**

- ✅ All test data is cleaned up after test execution
- ✅ Tests are idempotent (can run multiple times)
- ✅ Tests do not depend on execution order

---

## 📝 PARTE 2: Integración y Output

### Paso 5: Update Story in Jira

**Objetivo:** Refinar la story en Jira con criterios claros y edge cases.

---

### Paso 6: Add Test Cases Comment in Jira

**Objetivo:** Agregar test cases completos como comentario en la story.

---

### Paso 7: Generate Local test-cases.md (Mirroring)

**Objetivo:** Archivo local espejo del comentario en Jira.

---

## 📢 Action Required

**@[Product Owner]:**

- [ ] Confirmar reglas de límite y validaciones (porcentaje > 100, negativos).
- [ ] Definir comportamiento y mensaje exacto del warning.
- [ ] Validar si total $0 es permitido.

**@[Dev Lead]:**

- [ ] Confirmar política de redondeo a 2 decimales.
- [ ] Validar persistencia de discount_amount en DB.

**@[QA Team]:**

- [ ] Revisar test cases para cobertura completa.
- [ ] Preparar data set para pruebas de descuentos.

---

**Next Steps:**

1. PO/Dev responden preguntas críticas en el comentario.
2. QA ajusta test cases con respuestas.
3. Dev implementa con AC refinados.

---

**Documentation:** Full test cases also available at:
`.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-25-add-discounts/test-cases.md`

---

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

- [Bug ID 1]: [Descripción breve]
- [Bug ID 2]: [Descripción breve]

**Sign-off:** [Nombre QA] - [Fecha]
