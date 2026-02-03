# Test Cases: STORY-SQ-25 - Add Discounts to Invoice

**Fecha:** 2026-02-02
**QA Engineer:** AI-Generated
**Story Jira Key:** SQ-25
**Epic:** EPIC-SQ-20 - Invoice Creation
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Disenador Organizado) - necesita aplicar promociones sin perder profesionalismo ni cometer errores de calculo.
- **Secondary:** Andres (Consultor Tradicional) - requiere claridad en totales y descuentos para clientes corporativos.

**Business Value:**

- **Value Proposition:** Permite ofrecer descuentos y promociones, aumentando cierre de ventas y satisfaccion del cliente.
- **Business Impact:** Reduce errores en totales, mejora confianza del usuario y protege KPIs de tiempo a primera factura y facturas enviadas.

**Related User Journey:**

- Journey: Registro y Primera Factura (Happy Path)
- Step: Step 10 (Agregar items) y Step 12 (Previsualizar factura)

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: formulario de creacion/edicion de factura, resumen de totales, selector de tipo de descuento.
- Pages/Routes: `/app/invoices/create`, `/app/invoices/[invoiceId]` (edicion).
- State Management: React Hook Form + Zod (validacion), calculo en cliente.

**Backend:**

- API Endpoints: `POST /api/invoices`, `PUT /api/invoices/{invoiceId}`
- Services: calculo de totales (subtotal, descuento, impuesto, total).
- Database: `invoices` (discount_type, discount_value, discount_amount, tax_rate, tax_amount, subtotal, total), `invoice_items`.

**External Services:**

- Ninguno.

**Integration Points:**

- Frontend -> Backend API (crear/actualizar factura).
- Backend -> DB (persistencia de descuento y totales).

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic complexity: Medium - reglas de descuento, cap y orden de calculo con impuestos.
- Integration complexity: Medium - frontend y backend deben calcular consistente.
- Data validation complexity: Medium - valores invalidos, limites y redondeo.
- UI complexity: Medium - selector, input, warning y summary.

**Estimated Test Effort:** Medium
**Rationale:** Varias combinaciones de tipo/valor, edge cases y consistencia UI/API.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**

- Not available. Feature test plan file missing and Jira comments not accessible (MCP Atlassian not available).

**Integration Points from Epic Analysis:**

- Not available.

**Critical Questions Already Asked at Epic Level:**

- Not available.

**Test Strategy from Epic:**

- Not available.

**Updates and Clarifications from Epic Refinement:**

- Not available.

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** Agrega reglas de descuento que afectan el calculo de totales en creacion/edicion de facturas.
- **Inherited Risks:** Calculos incorrectos en totales e inconsistencias UI/API.
- **Unique Considerations:** Cap de descuento y warning al usuario, orden de descuento antes de impuestos.

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Mensaje y ubicacion del warning cuando el descuento supera el subtotal.

- **Location in Story:** Scenario 4: Discount limit
- **Question for PO/Dev:** Cual es el texto exacto del warning y donde se muestra (inline, toast, summary)?
- **Impact on Testing:** No se puede validar UI ni accesibilidad sin mensaje y ubicacion definidos.
- **Suggested Clarification:** Definir texto de warning, ubicacion y severidad (alert vs helper text).

**Ambiguity 2:** Reglas de redondeo para porcentajes y montos con decimales.

- **Location in Story:** Scenarios 1-3 (calculo de descuento y resumen)
- **Question for PO/Dev:** Se redondea a 2 decimales por moneda? Se usa round half up?
- **Impact on Testing:** Resultados esperados varian por regla de redondeo.
- **Suggested Clarification:** Especificar precision y regla de redondeo.

**Ambiguity 3:** Validaciones de input para valores negativos, >100% o texto.

- **Location in Story:** Technical Notes y Scenario 4
- **Question for PO/Dev:** Se bloquea input invalido o se permite y se muestra error? Cual es el mensaje?
- **Impact on Testing:** No se pueden definir casos negativos con resultado esperado.
- **Suggested Clarification:** Definir validaciones y mensajes de error.

---

### Missing Information / Gaps

**Gap 1:** Regla cuando el subtotal es 0 y se ingresa descuento.

- **Type:** Business Rule
- **Why It's Critical:** Afecta total y warning; puede generar totales negativos.
- **Suggested Addition:** Definir que descuento sea 0 y warning opcional si subtotal es 0.
- **Impact if Not Added:** Calculos inconsistentes o totales negativos.

**Gap 2:** Recalculo cuando cambian items despues de definir descuento.

- **Type:** Acceptance Criteria
- **Why It's Critical:** Totales deben recalcularse automaticamente y mantener consistencia.
- **Suggested Addition:** AC que confirme recalculo y cap re-aplicado tras cambios en items.
- **Impact if Not Added:** Totales incorrectos o stale en UI.

**Gap 3:** Campo `discount_amount` en API/DB y visibilidad en respuesta.

- **Type:** Technical Details
- **Why It's Critical:** La UI debe mostrar monto calculado del descuento.
- **Suggested Addition:** Asegurar que API retorna `discount_amount` o suficiente para calcular en frontend.
- **Impact if Not Added:** UI no puede mostrar monto exacto o calcula distinto al backend.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Porcentaje > 100% (ej: 150%).

- **Scenario:** Usuario ingresa 150%.
- **Expected Behavior:** Descuento se capea a subtotal y se muestra warning.
- **Criticality:** High
- **Action Required:** Add to story and test cases.

**Edge Case 2:** Valor negativo (ej: -10 o -$50).

- **Scenario:** Usuario ingresa valor negativo.
- **Expected Behavior:** Validacion rechaza con error claro, sin aplicar descuento.
- **Criticality:** High
- **Action Required:** Ask PO/Dev (definir validacion/mensaje).

**Edge Case 3:** Decimales con muchos digitos (ej: 12.345%).

- **Scenario:** Usuario ingresa valor con mas de 2 decimales.
- **Expected Behavior:** Redondeo o truncamiento segun regla definida.
- **Criticality:** Medium
- **Action Required:** Ask PO/Dev.

**Edge Case 4:** Subtotal cambia despues de definir descuento.

- **Scenario:** Descuento previamente valido deja de serlo por cambio de subtotal.
- **Expected Behavior:** Recalcular descuento y cap si aplica, warning actualizado.
- **Criticality:** Medium
- **Action Required:** Add to story and test cases.

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

- Definir mensaje/ubicacion del warning y validaciones de input.
- Especificar redondeo a 2 decimales para descuentos y totales.
- Aclarar comportamiento cuando subtotal = 0 o cuando el descuento cambia tras editar items.

---

## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Percentage discount with tax calculation

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Usuario autenticado en creacion de factura.
  - Items: 2 x $50 y 1 x $100 (subtotal = $200.00).
  - Tax rate = 10%.

- **When:**
  - Selecciona tipo de descuento "percentage".
  - Ingresa 10.

- **Then:**
  - Discount amount = $20.00 (10% de $200.00).
  - Taxable amount = $180.00.
  - Tax amount = $18.00.
  - Total = $198.00.
  - Summary muestra tipo de descuento, valor y monto calculado.

---

### Scenario 2: Fixed discount with tax calculation

**Type:** Positive
**Priority:** High

- **Given:**
  - Usuario autenticado en creacion de factura.
  - Subtotal = $200.00.
  - Tax rate = 10%.

- **When:**
  - Selecciona tipo de descuento "fixed".
  - Ingresa 50.

- **Then:**
  - Discount amount = $50.00.
  - Taxable amount = $150.00.
  - Tax amount = $15.00.
  - Total = $165.00.

---

### Scenario 3: Discount display in summary

**Type:** Positive
**Priority:** High

- **Given:**
  - Usuario ha definido un descuento valido.

- **When:**
  - Visualiza el resumen de factura.

- **Then:**
  - Se muestran: tipo de descuento, valor ingresado y monto calculado.

---

### Scenario 4: Discount cap when exceeding subtotal

**Type:** Boundary
**Priority:** High

- **Given:**
  - Subtotal = $80.00.
  - Tax rate = 0%.

- **When:**
  - Selecciona tipo "fixed" e ingresa 100.

- **Then:**
  - Discount amount se capea a $80.00.
  - Total = $0.00.
  - Se muestra warning de descuento excedido (texto y ubicacion por definir).

---

### Scenario 5: No discount applied

**Type:** Positive
**Priority:** Medium

- **Given:**
  - Subtotal = $200.00.
  - Tax rate = 10%.

- **When:**
  - Descuento vacio o 0.

- **Then:**
  - Discount amount = $0.00.
  - Total = $220.00.
  - No se muestra warning.

---

### Scenario 6: Invalid discount value (negative)

**Type:** Negative
**Priority:** High

- **Given:**
  - Subtotal = $200.00.

- **When:**
  - Ingresa -10 en el valor de descuento.

- **Then:**
  - Se muestra error de validacion.
  - Discount amount permanece en $0.00.
  - Total no cambia.
  - **NOTE:** Requiere confirmacion de PO/Dev sobre mensaje y comportamiento.

---

### Scenario 7: Discount recalculation after item changes

**Type:** Edge Case
**Priority:** Medium
**Source:** Identified during critical analysis (Paso 2)

- **Given:**
  - Descuento fijo de $50 aplicado con subtotal $200.00.

- **When:**
  - Se elimina un item y el subtotal queda en $40.00.

- **Then:**
  - Discount amount se capea a $40.00.
  - Total = $0.00.
  - Warning se muestra actualizado.
  - **NOTE:** Needs PO/Dev confirmation.

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 9

**Breakdown:**

- Positive: 4 test cases
- Negative: 2 test cases
- Boundary: 2 test cases
- Integration: 1 test case
- API: 0 test cases (cubierto en integracion UI/API)

**Rationale for This Number:**

Cobertura suficiente para los dos tipos de descuento, calculo con impuestos, cap, no discount, validaciones y recalculo por cambios en items, mas una integracion frontend-backend.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Tipos y valores de descuento validos

- **Base Scenario:** Calculo de descuento y total en resumen.
- **Parameters to Vary:** Tipo, valor, subtotal, tax rate.
- **Test Data Sets:**

| discountType | discountValue | subtotal | taxRate | Expected Discount | Expected Total |
| ------------ | ------------- | -------- | ------- | ----------------- | -------------- |
| percentage   | 10            | 200.00   | 10      | 20.00             | 198.00         |
| percentage   | 100           | 80.00    | 0       | 80.00             | 0.00           |
| fixed        | 50            | 200.00   | 10      | 50.00             | 165.00         |
| fixed        | 0             | 200.00   | 10      | 0.00              | 220.00         |

**Total Tests from Parametrization:** 4
**Benefit:** Reduce duplicacion al validar calculos con mismas precondiciones.

---

**Parametrized Test Group 2:** Valores invalidos de descuento

- **Base Scenario:** Validacion de input y mensaje de error.
- **Parameters to Vary:** Valor negativo, texto, porcentaje > 100.
- **Test Data Sets:**

| discountType | discountValue | Expected Behavior |
| ------------ | ------------- | ----------------- |
| percentage   | -10           | Error validation  |
| fixed        | -50           | Error validation  |
| percentage   | 150           | Cap + warning     |

---

### Test Outlines

#### **Validar calculo de descuento porcentual con impuestos aplicados**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- Usuario autenticado.
- Factura en creacion con items definidos (subtotal $200.00).
- Tax rate configurado en 10%.

**Test Steps:**

1. Seleccionar descuento tipo "percentage".
   - **Data:** discountValue = 10
2. Verificar resumen de totales.
   - **Verify:** Discount amount = $20.00, tax = $18.00, total = $198.00.

**Expected Result:**

- **UI:** Muestra tipo de descuento, valor 10% y monto $20.00.
- **API Response:** N/A
- **Database:** N/A
- **System State:** Totales recalculados con descuento antes de impuestos.

**Test Data:**

```json
{
  "input": {
    "items": [
      { "description": "Item A", "quantity": 2, "unitPrice": 50 },
      { "description": "Item B", "quantity": 1, "unitPrice": 100 }
    ],
    "taxRate": 10,
    "discountType": "percentage",
    "discountValue": 10
  },
  "user": {
    "email": "qa.user@soloq.test",
    "role": "freelancer"
  }
}
```

**Post-conditions:**

- Factura mantiene descuento aplicado y totales coherentes.

---

#### **Validar calculo de descuento fijo con impuestos aplicados**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- Usuario autenticado.
- Subtotal $200.00, taxRate 10%.

**Test Steps:**

1. Seleccionar descuento tipo "fixed".
   - **Data:** discountValue = 50
2. Verificar resumen de totales.
   - **Verify:** Discount = $50.00, tax = $15.00, total = $165.00.

**Expected Result:**

- **UI:** Muestra descuento fijo con valor 50 y monto $50.00.
- **API Response:** N/A
- **Database:** N/A
- **System State:** Totales recalculados correctamente.

**Test Data:**

```json
{
  "input": {
    "subtotal": 200,
    "taxRate": 10,
    "discountType": "fixed",
    "discountValue": 50
  },
  "user": {
    "email": "qa.user@soloq.test",
    "role": "freelancer"
  }
}
```

---

#### **Validar visualizacion del descuento en el resumen**

**Related Scenario:** Scenario 3
**Type:** Positive
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

**Preconditions:**

- Descuento valido aplicado.

**Test Steps:**

1. Abrir resumen de factura.
2. Verificar seccion de descuento.

**Expected Result:**

- **UI:** Se muestra tipo, valor y monto calculado.
- **API Response:** N/A
- **Database:** N/A
- **System State:** Resumen refleja el descuento aplicado.

**Test Data:**

```json
{
  "input": {
    "discountType": "percentage",
    "discountValue": 10
  }
}
```

---

#### **Validar cap de descuento fijo al exceder el subtotal**

**Related Scenario:** Scenario 4
**Type:** Boundary
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- Subtotal $80.00, taxRate 0%.

**Test Steps:**

1. Seleccionar descuento fijo con valor 100.
2. Verificar totales y warning.

**Expected Result:**

- **UI:** Discount amount = $80.00, total = $0.00.
- **UI:** Warning visible (texto/ubicacion por definir).
- **API Response:** N/A
- **Database:** N/A

**Test Data:**

```json
{
  "input": {
    "subtotal": 80,
    "taxRate": 0,
    "discountType": "fixed",
    "discountValue": 100
  }
}
```

---

#### **Validar limite de porcentaje 100% sin error**

**Related Scenario:** Scenario 4
**Type:** Boundary
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- Subtotal $80.00, taxRate 0%.

**Test Steps:**

1. Seleccionar descuento porcentual con valor 100.
2. Verificar totales.

**Expected Result:**

- **UI:** Discount amount = $80.00, total = $0.00.
- **UI:** No error de validacion.
- **API Response:** N/A
- **Database:** N/A

**Test Data:**

```json
{
  "input": {
    "subtotal": 80,
    "taxRate": 0,
    "discountType": "percentage",
    "discountValue": 100
  }
}
```

---

#### **Validar no aplicar descuento cuando el valor es 0 o vacio**

**Related Scenario:** Scenario 5
**Type:** Positive
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- Subtotal $200.00, taxRate 10%.

**Test Steps:**

1. Dejar descuento vacio o ingresar 0.
2. Verificar totales.

**Expected Result:**

- **UI:** Discount amount = $0.00.
- **UI:** Total = $220.00.
- **API Response:** N/A
- **Database:** N/A

**Test Data:**

```json
{
  "input": {
    "subtotal": 200,
    "taxRate": 10,
    "discountType": "fixed",
    "discountValue": 0
  }
}
```

---

#### **Validar error de validacion con descuento negativo**

**Related Scenario:** Scenario 6
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 2)

**Preconditions:**

- Subtotal $200.00.

**Test Steps:**

1. Ingresar descuento -10.
2. Verificar mensaje de error y que no se aplique descuento.

**Expected Result:**

- **UI:** Error visible en input de descuento.
- **API Response:** N/A
- **Database:** N/A
- **System State:** Descuento no aplicado.
- **Note:** Mensaje exacto pendiente de definicion.

**Test Data:**

```json
{
  "input": {
    "subtotal": 200,
    "discountType": "percentage",
    "discountValue": -10
  }
}
```

---

#### **Validar cap y warning con porcentaje mayor a 100**

**Related Scenario:** Scenario 4
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 2)

**Preconditions:**

- Subtotal $200.00.

**Test Steps:**

1. Ingresar porcentaje 150.
2. Verificar cap y warning.

**Expected Result:**

- **UI:** Discount amount = $200.00 (cap).
- **UI:** Warning visible.
- **API Response:** N/A
- **Database:** N/A

**Test Data:**

```json
{
  "input": {
    "subtotal": 200,
    "discountType": "percentage",
    "discountValue": 150
  }
}
```

---

#### **Validar recalculo de descuento al cambiar items**

**Related Scenario:** Scenario 7
**Type:** Edge Case
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ❌ No

**Preconditions:**

- Subtotal $200.00 con descuento fijo $50.

**Test Steps:**

1. Eliminar items hasta dejar subtotal $40.00.
2. Verificar cap y warning.

**Expected Result:**

- **UI:** Discount amount = $40.00, total = $0.00.
- **UI:** Warning actualizado.
- **API Response:** N/A
- **Database:** N/A

**Test Data:**

```json
{
  "input": {
    "initialSubtotal": 200,
    "discountType": "fixed",
    "discountValue": 50,
    "updatedSubtotal": 40
  }
}
```

---

## 🔗 Integration Test Cases (If Applicable)

### Integration Test 1: Frontend -> Backend - Crear factura con descuento

**Integration Point:** Frontend -> Backend API
**Type:** Integration
**Priority:** High

**Preconditions:**

- Backend API disponible.
- Usuario autenticado.
- Cliente existente.

**Test Flow:**

1. Frontend envia `POST /api/invoices` con items, taxRate, discountType y discountValue.
2. API procesa el calculo y persiste en DB.
3. API responde con la factura creada.

**Contract Validation:**

- Request format matches OpenAPI spec: ✅ Yes
- Response format matches OpenAPI spec: ✅ Yes
- Status codes match spec: ✅ Yes (201)

**Expected Result:**

- Integracion exitosa sin discrepancias entre calculo UI y backend.
- Total y taxAmount consistentes con descuento aplicado antes de impuestos.

---

## 📊 Edge Cases Summary

| Edge Case                    | Covered in Original Story? | Added to Refined AC?     | Test Case | Priority |
| ---------------------------- | -------------------------- | ------------------------ | --------- | -------- |
| Porcentaje > 100%            | ❌ No                      | ✅ Yes (Scenario 4)      | TC-008    | High     |
| Valor negativo               | ❌ No                      | ✅ Yes (Scenario 6)      | TC-007    | High     |
| Decimales con muchos digitos | ❌ No                      | ⚠️ Needs PO confirmation | TBD       | Medium   |
| Recalcular al cambiar items  | ❌ No                      | ✅ Yes (Scenario 7)      | TC-009    | Medium   |
| Subtotal = 0 con descuento   | ❌ No                      | ⚠️ Needs PO confirmation | TBD       | Medium   |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type       | Count | Purpose         | Examples                    |
| --------------- | ----- | --------------- | --------------------------- |
| Valid data      | 4     | Positive tests  | 10%, $50, 100%              |
| Invalid data    | 3     | Negative tests  | -10, -50, 150%              |
| Boundary values | 2     | Boundary tests  | 0, 100%                     |
| Edge case data  | 2     | Edge case tests | subtotal 0, subtotal change |

### Data Generation Strategy

**Static Test Data:**

- Items: [2 x $50, 1 x $100]
- Subtotal: $80.00, $200.00
- Tax rate: 0%, 10%

**Dynamic Test Data (using Faker.js):**

- User data: `faker.internet.email()`
- Numbers: `faker.number.int({ min: 1, max: 5 })`
- Dates: `faker.date.recent()`

**Test Data Cleanup:**

- ✅ All test data is cleaned up after test execution
- ✅ Tests are idempotent (can run multiple times)
- ✅ Tests do not depend on execution order

---

## 📝 PARTE 2: Integracion y Output

### Paso 5: Update Story in Jira

**Status:** Not executed - MCP Atlassian not available in this environment.

---

### Paso 6: Add Test Cases Comment in Jira

**Status:** Not executed - MCP Atlassian not available in this environment.

---

### Paso 7: Generate Local test-cases.md (Mirroring)

**Status:** Completed - this file is the local mirror.

---

## 🎯 Definition of Done (QA Perspective)

Esta story se considera "Done" desde QA cuando:

- [ ] All ambiguities and questions from this document are resolved
- [ ] Story is updated with suggested improvements (if accepted by PO)
- [ ] All test cases are executed and passing
- [ ] Critical/High test cases: 100% passing
- [ ] Medium/Low test cases: >=95% passing
- [ ] All critical and high bugs resolved and verified
- [ ] Integration tests passing (if applicable)
- [ ] API contract validation passed (if applicable)
- [ ] NFRs validated (if applicable)
- [ ] Regression tests passed
- [ ] Exploratory testing completed
- [ ] Test execution report generated
- [ ] No blockers for next stories in epic

---

## 📎 Related Documentation

- **Story:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-25-add-discounts/story.md`
- **Epic:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/feature-test-plan.md` (missing)
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/` (all files)
- **SRS:** `.context/SRS/` (all files)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`

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
