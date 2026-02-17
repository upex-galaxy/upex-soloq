# Acceptance Test Plan: STORY-SQ-23 - Automatic Subtotal and Total Calculation

**Fecha:** 2026-02-17
**QA Engineer:** AI-Generated (Shift-Left Analysis)
**Story Jira Key:** [SQ-23](https://upexgalaxy64.atlassian.net/browse/SQ-23)
**Epic:** EPIC-SQ-20 - Invoice Creation
**Status:** Draft - Pending PO/Dev Review

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Diseñador, 32) - Necesita que los totales se calculen automaticamente para evitar errores manuales que le dan verguenza frente a sus clientes.
- **Primary:** Andres (Consultor, 41) - Necesita una herramienta simple que calcule sin errores; actualmente usa Excel y comete errores de calculo.
- **Secondary:** Valentina (Desarrolladora, 28) - Factura clientes internacionales; la precision en los montos es critica para su imagen profesional.

**Business Value:**

- **Value Proposition:** Eliminar errores de calculo humano. Las tres personas pierden credibilidad cuando envian facturas con totales incorrectos. El calculo automatico garantiza precision en subtotal, descuentos, impuestos y total.
- **Business Impact:** Directo al KPI "Tiempo de creacion de factura < 2 minutos" (Executive Summary). Sin calculos automaticos, el usuario tendria que calcular manualmente, lo que aumenta el tiempo y la tasa de error.

**Related User Journey:**

- Journey: **J1 - Registro y Primera Factura** (Step 10: Agregar Items a la Factura)
  - Quote del Journey: "Calcula subtotal y total automaticamente, permite agregar mas items"
- Journey: **J4 - Edicion de Factura** (Step 3: Corregir Item)
  - Quote del Journey: "Recalcula subtotal y total automaticamente"
  - Pain Point identificado: "Si el recalculo no es automatico, puede haber inconsistencias"

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: `InvoiceSummary` (muestra subtotal, discount, tax, total), `DiscountInput` (toggle percentage/fixed), `TaxInput` (input + presets LATAM)
- Pages/Routes: `/invoices/create` (page.tsx), `/invoices/[id]/edit` (page.tsx)
- State Management: React Hook Form + `useMemo` para calculos reactivos

**Backend:**

- API Endpoints:
  - `POST /api/invoices` - Crea factura con calculos server-side
  - `PUT /api/invoices/:id` - Actualiza factura con recalculos
- Services: Funciones puras en `src/lib/utils/invoice-calculations.ts`
- Database: Tablas `invoices` (subtotal, tax_rate, tax_amount, discount_type, discount_value, discount_amount, total), `invoice_items` (quantity, unit_price, line_total)

**External Services:**

- Ninguno directo. Los calculos son 100% client-side + server-side (funciones puras compartidas).

**Integration Points:**

- Frontend calculo reactivo ↔ Backend recalculo en API (mismas funciones)
- `invoice_items` ↔ `invoices` (line_total → subtotal → discount → tax → total)
- `InvoiceSummary` ↔ `DiscountInput` ↔ `TaxInput` (cascada de dependencias)
- Auto-save (`useAutoSave`) persiste valores calculados al editar

---

### Story Complexity Analysis

**Overall Complexity:** High

**Complexity Factors:**

- Business logic complexity: **High** - Multiples formulas encadenadas con dependencias (subtotal → discount → taxable_base → tax → total), 2 tipos de descuento, redondeo en cada paso
- Integration complexity: **Medium** - Calculos client-side deben coincidir con server-side; cascada reactiva entre componentes
- Data validation complexity: **Medium** - Valores null/undefined/negativos, precision decimal, caps de descuento
- UI complexity: **Low** - No crea UI nueva, solo conecta logica de calculo a componentes existentes

**Estimated Test Effort:** High
**Rationale:** 56 test cases ya identificados en shift-left. La combinatoria de tipos de descuento, tasas de impuesto, y precision decimal genera muchos edge cases criticos.

---

### Epic-Level Context (From Feature Test Plan)

**Critical Risks Already Identified at Epic Level:**

- Risk: **Errores de calculo en totales** (Impact: High, Likelihood: Medium)
  - **Relevance to This Story:** Es el riesgo principal que esta story mitiga. Los calculos deben ser precisos a 2 decimales con redondeo correcto en cada paso.
- Risk: **Inconsistencia entre calculos frontend y backend** (Impact: High, Likelihood: Alta)
  - **Relevance to This Story:** Esta story resuelve esto centralizando la logica en `calculateFullInvoice()` compartida entre client y server.

**Integration Points from Epic Analysis:**

- Frontend ↔ Backend API (validacion client-side + server-side)
  - **Applies to This Story:** Yes - Calculos se ejecutan en ambos lados con mismas funciones
- Invoice ↔ Client (relacion FK, datos auto-poblados)
  - **Applies to This Story:** No - SQ-23 no modifica la relacion con clientes

**Critical Questions Already Asked at Epic Level:**

**Questions for PO:**

- **Orden de aplicacion de descuento e impuesto:** El impuesto se calcula sobre (subtotal - descuento) o sobre subtotal?
  - **Status:** Answered (via SRS FR-015 y implementation plan)
  - **Answer:** Tax sobre subtotal descontado: `taxable_base = subtotal - discount_amount` (alineado con legislacion LATAM comun)
  - **Impact on This Story:** Define la formula central. Ya incorporado en el plan.

- **Politica de redondeo:** Redondear en cada paso o solo al final?
  - **Status:** Answered (via implementation plan decision)
  - **Answer:** Round Half-Up en cada paso intermedio (`Math.round(value * 100) / 100`), no solo al final
  - **Impact on This Story:** Afecta los valores esperados de cada test case.

**Questions for Dev:**

- **Precision interna vs display:** Calculos internos usan mayor precision?
  - **Status:** Answered (via implementation plan)
  - **Answer:** No. Se usa `roundCurrency()` en cada paso (2 decimales), sin Decimal.js. Math.round nativo es suficiente para DECIMAL(10,2).
  - **Impact on This Story:** Simplifica test assertions - los valores esperados son exactos a 2 decimales.

**Test Strategy from Epic:**

- Test Levels: Unit (>80%), Integration (API + DB), E2E (Playwright)
- Tools: Vitest (unit), Playwright (E2E), Faker.js (data)
- **How This Story Aligns:** Principalmente unit tests para funciones puras de calculo (56 test cases). Integration tests para verificar consistencia client/server.

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** Esta story es el "motor matematico" del epic. SQ-22 (Line Items) provee los inputs, SQ-24 (Tax) y SQ-25 (Discount) proveen parametros, y SQ-23 orquesta el pipeline completo de calculo.
- **Inherited Risks:** Errores de precision decimal, inconsistencia frontend/backend (ambos mitigados por diseño centralizado)
- **Unique Considerations:** Es backward-compatible con SQ-22 no implementado (items = [] → subtotal = 0). Los calculos deben funcionar con 0 items sin errores.

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Tax base configurable vs fijo

- **Location in Story:** story.md Technical Notes: "Tax calculated on: subtotal (before discount) OR subtotal - discount (configurable)"
- **Question for PO:** Esta resuelto? La word "configurable" implica toggle en UI?
- **Impact on Testing:** Si es configurable, se necesitan tests para ambos modos (TC-55, TC-28). Si es fijo, TC-28 se vuelve N/A.
- **Resolution:** Segun implementation plan y SRS FR-015, es **fijo** (`tax_on_discounted = true`). No es configurable por usuario en MVP. TC-28 se marca como N/A; TC-55 verifica solo el modo fijo.

**Ambiguity 2:** Precision de redondeo (banker's vs half-up)

- **Location in Story:** story.md Scenario 5: "Values are rounded to 2 decimal places" (no especifica metodo)
- **Question for PO:** Confirmado half-up?
- **Resolution:** Implementation plan confirma **Round Half-Up** (`Math.round(value * 100) / 100`). Test case TC-05 y TC-10 ajustados a half-up.

**Ambiguity 3:** Validaciones de entrada - que pasa con negativos?

- **Location in Story:** No mencionado en los 5 scenarios de la story.
- **Resolution:** Implementation plan especifica: "Validaciones de entrada (no negativos, nulls tratados como 0)" como AC9. Test cases TC-50 a TC-54 cubren esto.

---

### Missing Information / Gaps

**Gap 1:** La story no especifica el pipeline completo de formulas

- **Type:** Technical Details
- **Why It's Critical:** Sin formulas explicitas, dev podria implementar en orden diferente al esperado (tax antes de discount, etc.)
- **Resolution:** Implementation plan define formulas explicitas (Step 2). SRS FR-015 confirma.

**Gap 2:** La story no menciona backward compatibility con SQ-22

- **Type:** Technical Details
- **Why It's Critical:** SQ-22 (Line Items) no esta implementado aun. Si el calculo falla con 0 items, rompe el flujo actual.
- **Resolution:** Implementation plan confirma: items = [] → subtotal = 0 → todo = 0.00. TC-49 cubre este caso.

No additional gaps found - Story has sufficient information for testing given the implementation plan context.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Descuento porcentual > 100%

- **Scenario:** User ingresa 150% de descuento
- **Expected Behavior:** Descuento capeado al subtotal (discount_amount = subtotal). Total = 0.00 + tax sobre $0 = $0.00
- **Criticality:** High
- **Action Required:** Covered in TC-12. Behavior confirmed by existing `calculateDiscountAmount` (SQ-25 already merged).

**Edge Case 2:** 100 items de $0.01 (precision flotante)

- **Scenario:** 100 items con quantity=1, unit_price=0.01
- **Expected Behavior:** subtotal = 1.00 exacto (sin error de precision flotante 0.9999...98)
- **Criticality:** High
- **Action Required:** Covered in TC-48. Critical for financial calculations.

**Edge Case 3:** Cambios rapidos consecutivos (debouncing)

- **Scenario:** User cambia quantity de 1→2→3→4 rapidamente
- **Expected Behavior:** Calculos se actualizan sin lag, estado final consistente, < 100ms por calculo
- **Criticality:** Medium
- **Action Required:** Covered in TC-44. useMemo es sincronico, no hay debounce issues.

---

### Testability Validation

**Is this story testeable as written?** Partially

**Testability Issues:**

- [x] Acceptance criteria are vague or subjective - "real-time" no define threshold (resolved: <100ms in implementation plan)
- [x] Missing error scenarios - No menciona negativos/nulls (resolved: AC9 added in impl plan)
- [ ] ~~Cannot be tested in isolation~~ - Backward compatible con SQ-22 pending

**Recommendations to Improve Testability:**

1. Agregar threshold explicito a AC "real-time": "Actualizaciones completan en < 100ms"
2. Agregar AC para validaciones de entrada: "Valores negativos tratados como 0 o rechazados"
3. Explicitar formulas en acceptance criteria (no solo en implementation plan)

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Subtotal se calcula como suma de line totals

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User esta en pagina de crear/editar factura
  - Tiene line items: [{qty: 2, price: 50.00}, {qty: 3, price: 30.00}]

- **When:**
  - El sistema calcula el subtotal

- **Then:**
  - line_total_1 = roundCurrency(2 * 50.00) = 100.00
  - line_total_2 = roundCurrency(3 * 30.00) = 90.00
  - subtotal = 100.00 + 90.00 = 190.00
  - InvoiceSummary muestra "Subtotal: $190.00"

---

### Scenario 2: Total con descuento porcentual e impuesto

**Type:** Positive
**Priority:** Critical

- **Given:**
  - subtotal = 190.00
  - discount_type = 'percentage', discount_value = 10
  - tax_rate = 16

- **When:**
  - El sistema calcula el total

- **Then:**
  - discount_amount = roundCurrency(190.00 * 10/100) = 19.00
  - taxable_base = 190.00 - 19.00 = 171.00
  - tax_amount = roundCurrency(171.00 * 16/100) = 27.36
  - total = 171.00 + 27.36 = 198.36

---

### Scenario 3: Descuento fijo capeado al subtotal

**Type:** Boundary
**Priority:** High

- **Given:**
  - subtotal = 100.00
  - discount_type = 'fixed', discount_value = 150.00

- **When:**
  - El sistema calcula el descuento

- **Then:**
  - discount_amount = MIN(150.00, 100.00) = 100.00 (capeado)
  - DiscountInput muestra warning "Descuento excede subtotal"
  - total = 0.00

---

### Scenario 4: Actualizacion en tiempo real al modificar valores

**Type:** Positive
**Priority:** High

- **Given:**
  - Factura con items, subtotal = 100.00, tax_rate = 16, total = 116.00

- **When:**
  - User cambia tax_rate a 21

- **Then:**
  - tax_amount actualiza a 21.00 en < 100ms
  - total actualiza a 121.00
  - InvoiceSummary refleja cambios sin refresh

---

### Scenario 5: Precision decimal - redondeo Round Half-Up

**Type:** Boundary
**Priority:** High

- **Given:**
  - subtotal = 99.99
  - tax_rate = 16

- **When:**
  - El sistema calcula el impuesto

- **Then:**
  - tax_amount = roundCurrency(99.99 * 0.16) = roundCurrency(15.9984) = 16.00
  - Redondeo Half-Up: .5 o mayor redondea hacia arriba

---

### Scenario 6: Sin items - backward compatible

**Type:** Edge Case
**Priority:** Medium
**Source:** Identified during critical analysis (Paso 2)

- **Given:**
  - items = [] (SQ-22 no implementado aun)

- **When:**
  - El sistema calcula

- **Then:**
  - subtotal = 0.00, discount_amount = 0.00, tax_amount = 0.00, total = 0.00
  - No errores, no warnings
  - Mismo comportamiento que la implementacion actual (const subtotal = 0)

---

### Scenario 7: Valores nulos o undefined tratados como 0

**Type:** Edge Case
**Priority:** Medium

- **Given:**
  - discount_type = null, discount_value = null, tax_rate = null

- **When:**
  - El sistema calcula

- **Then:**
  - discount_amount = 0.00, tax_amount = 0.00
  - total = subtotal (sin error)

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 56 (ya definidos en test-cases.md del shift-left)

**Breakdown:**

- Positive: 16 test cases (TC-01 to TC-04, TC-09, TC-13, TC-16-17, TC-22-24, TC-26, TC-31-32, TC-37-39)
- Negative: 8 test cases (TC-12, TC-15, TC-19, TC-21, TC-50-53)
- Boundary: 14 test cases (TC-05-08, TC-11, TC-14, TC-18, TC-20, TC-23, TC-30, TC-36, TC-45-48)
- Integration: 10 test cases (TC-27-29, TC-34-35, TC-37-44)
- E2E: 2 test cases (TC-55, TC-56)
- Validation: 6 test cases (TC-49-54)

**Rationale for This Number:** 56 test cases es adecuado dado la complejidad High de la logica de calculo. Cubre:
- Todas las formulas individuales (subtotal, discount, tax, total)
- Todas las combinaciones criticas (discount + tax)
- Precision decimal y edge cases financieros
- Reactividad ante cambios
- Validaciones de entrada

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** Yes

**Parametrized Test Group 1:** Impuestos comunes LATAM (TC-26)

- **Base Scenario:** Calculo de impuesto sobre subtotal sin descuento
- **Parameters to Vary:** tax_rate, subtotal

| Country   | tax_rate | subtotal  | Expected tax_amount |
| --------- | -------- | --------- | ------------------- |
| Mexico    | 16       | 1000.00   | 160.00              |
| Colombia  | 19       | 1000.00   | 190.00              |
| Argentina | 21       | 1000.00   | 210.00              |
| Chile     | 19       | 1000.00   | 190.00              |
| Peru      | 18       | 1000.00   | 180.00              |

**Total Tests from Parametrization:** 5
**Benefit:** Valida presets LATAM con una sola estructura de test, reduce duplicacion.

**Parametrized Test Group 2:** Tipos de descuento con diferentes valores (TC-09 to TC-21)

- **Base Scenario:** Calculo de descuento sobre subtotal = 100.00
- **Parameters to Vary:** discount_type, discount_value

| discount_type | discount_value | Expected discount_amount | Notes          |
| ------------- | -------------- | ------------------------ | -------------- |
| percentage    | 10             | 10.00                    | Standard       |
| percentage    | 100            | 100.00                   | Full discount  |
| percentage    | 150            | 100.00                   | Capped         |
| percentage    | 0              | 0.00                     | No discount    |
| fixed         | 25.00          | 25.00                    | Standard       |
| fixed         | 100.00         | 100.00                   | Equal to sub   |
| fixed         | 150.00         | 100.00                   | Capped         |
| fixed         | 0.00           | 0.00                     | No discount    |

**Total Tests from Parametrization:** 8
**Benefit:** Cubre ambos tipos de descuento con todos los boundary values en una sola tabla.

**Parametrized Test Group 3:** Total final con diferentes combinaciones (TC-31 to TC-36)

- **Base Scenario:** Calculo de total final
- **Parameters to Vary:** subtotal, discount_amount, tax_rate

| subtotal | discount_amount | tax_rate | Expected total |
| -------- | --------------- | -------- | -------------- |
| 100.00   | 0.00            | 0        | 100.00         |
| 100.00   | 0.00            | 16       | 116.00         |
| 100.00   | 10.00           | 0        | 90.00          |
| 100.00   | 10.00           | 16       | 104.40         |
| 100.00   | 100.00          | 16       | 0.00           |
| 206.24   | 20.62           | 16       | 215.30         |

**Total Tests from Parametrization:** 6

---

### Test Outlines

#### TC-01: Should calculate subtotal correctly with a single line item

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** High
**Test Level:** Unit
**Parametrized:** No

**Preconditions:**

- Funcion `calculateSubtotal` disponible

**Test Steps:**

1. Invocar `calculateSubtotal([{quantity: 1, unit_price: 100.00}])`
   - **Verify:** Retorna 100.00

**Expected Result:**

- subtotal = 100.00

**Test Data:**

```json
{"items": [{"quantity": 1, "unit_price": 100.00}], "expected_subtotal": 100.00}
```

---

#### TC-02: Should calculate subtotal correctly with multiple line items (integers)

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** High
**Test Level:** Unit
**Parametrized:** No

**Preconditions:**

- Funcion `calculateSubtotal` disponible

**Test Steps:**

1. Invocar `calculateSubtotal([{quantity: 2, unit_price: 50.00}, {quantity: 3, unit_price: 30.00}])`
   - **Verify:** Retorna 190.00

**Expected Result:**

- line_total_1 = 100.00, line_total_2 = 90.00, subtotal = 190.00

---

#### TC-03 to TC-08: Subtotal variations (decimals, large values, zero price, pennies)

**Type:** Positive / Boundary
**Priority:** High / Medium
**Test Level:** Unit
**Parametrized:** No

Covered in detail in `test-cases.md` (TC-03 through TC-08). Key assertions:

- TC-03: decimals in price → subtotal = 100.00
- TC-04: decimal quantities (2.5 * 40 + 1.33 * 10) → subtotal = 113.30
- TC-05: rounding test (10.555 → 10.56 half-up)
- TC-06: large values (1000 * 9999.99 = 9,999,990.00)
- TC-07: zero price item → line_total = 0, still sums correctly
- TC-08: single penny → subtotal = 0.01

---

#### TC-09 to TC-15: Percentage discount calculations

**Type:** Positive / Negative / Boundary
**Priority:** High
**Test Level:** Unit
**Parametrized:** Yes (Group 2)

Key assertions:

- TC-09: 10% of 100 = 10.00
- TC-10: 10% of 99.99 = 10.00 (half-up rounding of 9.999)
- TC-11: 100% = full discount, total = 0.00
- TC-12: 150% → capped to subtotal (100.00)
- TC-13: 10.5% of 100 = 10.50
- TC-14: 0% = 0.00
- TC-15: -10% → error/treated as 0

---

#### TC-16 to TC-21: Fixed discount calculations

**Type:** Positive / Negative / Boundary
**Priority:** High
**Test Level:** Unit
**Parametrized:** Yes (Group 2)

Key assertions:

- TC-16: fixed 25 on subtotal 100 = 25.00
- TC-17: fixed 33.33 = 33.33
- TC-18: fixed 100 on subtotal 100 = 100.00
- TC-19: fixed 150 on subtotal 100 → capped to 100.00
- TC-20: fixed 0 = 0.00
- TC-21: fixed -50 → error/treated as 0

---

#### TC-22 to TC-26: Tax calculations (without discount)

**Type:** Positive / Boundary
**Priority:** High / Critical
**Test Level:** Unit
**Parametrized:** Yes (Group 1 for TC-26)

Key assertions:

- TC-22: 16% of 100 = 16.00
- TC-23: 0% = 0.00
- TC-24: 16.5% of 100 = 16.50
- TC-25: 16% of 99.99 = 16.00 (half-up of 15.9984)
- TC-26: LATAM presets (parametrized)

---

#### TC-27 to TC-30: Tax calculations WITH discount (Critical)

**Type:** Integration
**Priority:** Critical
**Test Level:** Unit (calculateFullInvoice)
**Parametrized:** No

**TC-27: Tax on discounted subtotal (tax_on_discounted = true)**

**Preconditions:**

- `calculateFullInvoice` disponible
- tax_on_discounted = true (fijo, no configurable)

**Test Steps:**

1. Invocar `calculateFullInvoice({items: [{qty:1, price:100}], discountType: 'percentage', discountValue: 10, taxRate: 16})`
   - **Verify:** taxable_base = 90.00, tax_amount = 14.40

**Expected Result:**

- discount_amount = 10.00
- taxable_base = 90.00
- tax_amount = 14.40
- total = 104.40

**TC-28: N/A** - tax_on_discounted = false no esta implementado en MVP (decision de negocio: siempre true)

**TC-29: Fixed discount with tax (real case)**

- subtotal = 150.50, fixed discount = 20.00, tax = 16%
- taxable_base = 130.50, tax_amount = 20.88
- total = 151.38

**TC-30: 100% discount with tax**

- subtotal = 100.00, discount = 100.00, tax = 16%
- taxable_base = 0.00, tax_amount = 0.00, total = 0.00

---

#### TC-31 to TC-36: Total final calculations

**Type:** Positive / Critical
**Priority:** Critical
**Test Level:** Unit (calculateFullInvoice)
**Parametrized:** Yes (Group 3)

See parametrized table in Group 3 above. Key critical case:

**TC-35: Complex real-world case**

- Items: [{qty: 2.5, price: 42.50}, {qty: 3, price: 33.33}]
- subtotal = roundCurrency(106.25) + roundCurrency(99.99) = 206.24
- discount = 10% → 20.62
- taxable_base = 185.62
- tax = 16% → 29.70
- total = 215.32

---

#### TC-37 to TC-44: Real-time reactivity

**Type:** Integration (UI)
**Priority:** High
**Test Level:** Integration / E2E

Key scenarios:

- TC-37: Change quantity → subtotal updates
- TC-38: Change unit_price → subtotal updates
- TC-39: Add new item → subtotal increases
- TC-40: Remove item → subtotal decreases
- TC-41: Change tax_rate → tax_amount and total update
- TC-42: Change discount_type → discount_amount recalculates
- TC-43: Change discount_value → cascades to tax and total
- TC-44: Rapid consecutive changes → state consistent, < 100ms

---

#### TC-45 to TC-48: Decimal precision

**Type:** Boundary
**Priority:** High
**Test Level:** Unit

- TC-45: 10 items at 10.56 (rounded from 10.555) → subtotal = 105.60
- TC-46: 33.33% of 30.00 → discount = 10.00 (rounded from 9.999)
- TC-47: 1 penny + 16% tax → tax = 0.00 (rounded from 0.0016), total = 0.01
- TC-48: 100 items at $0.01 → subtotal = 1.00 exact

---

#### TC-49 to TC-54: Validations and edge cases

**Type:** Negative / Edge Case
**Priority:** Medium
**Test Level:** Unit

- TC-49: 0 items → all values = 0.00
- TC-50: quantity = -1 → treated as 0 or validation error
- TC-51: unit_price = -100 → treated as 0 or validation error
- TC-52: tax_rate = -10 → treated as 0
- TC-53: tax_rate = 150 → treated as 0 or capped (decision needed)
- TC-54: null values → treated as 0

---

#### TC-55: Tax configuration integration (fixed mode only)

**Type:** Integration
**Priority:** High
**Test Level:** Unit

- Verify that tax is ALWAYS calculated on discounted subtotal
- No toggle exists in UI for tax_on_discounted

---

#### TC-56: Complete invoice flow end-to-end

**Type:** E2E
**Priority:** Critical
**Test Level:** E2E

**Test Steps:**

1. Items: [{qty: 2, price: 50}, {qty: 1, price: 25}] → subtotal = 125.00
2. Discount: type='percentage', value=10 → discount_amount = 12.50
3. Tax: rate=16 → taxable_base = 112.50, tax_amount = 18.00
4. **Verify:** total = 130.50
5. Each step updates InvoiceSummary reactively

---

## Integration Test Cases

### Integration Test 1: Frontend calculation ↔ Backend recalculation

**Integration Point:** Frontend `useInvoiceCalculations` ↔ API `calculateFullInvoice`
**Type:** Integration
**Priority:** Critical

**Preconditions:**

- Both client and server use the same `calculateFullInvoice` function

**Test Flow:**

1. Frontend calculates: items + discount + tax → total
2. Frontend sends to API: POST /api/invoices
3. API recalculates server-side
4. API response returns calculated values
5. **Verify:** Frontend values === Server values (exact match)

**Contract Validation:**

- Request includes: items[], discount_type, discount_value, tax_rate
- Response includes: subtotal, discount_amount, tax_amount, total
- All monetary values are DECIMAL(10,2)

---

### Integration Test 2: Auto-save persistence (Edit page)

**Integration Point:** `useInvoiceCalculations` ↔ `useAutoSave` ↔ API PUT
**Type:** Integration
**Priority:** High

**Test Flow:**

1. Load existing invoice in edit mode
2. Change discount value
3. Verify calculations update reactively
4. Wait for auto-save trigger
5. **Verify:** Saved values match calculated values

---

## Edge Cases Summary

| Edge Case                   | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
| --------------------------- | -------------------------- | -------------------- | --------- | -------- |
| 0 items (SQ-22 pending)    | No                         | Yes (Scenario 6)     | TC-49     | Medium   |
| Discount > subtotal         | No                         | Yes (Scenario 3)     | TC-12,19  | High     |
| 100 penny items precision   | No                         | Yes (Scenario 5)     | TC-48     | High     |
| Null/undefined values       | No                         | Yes (Scenario 7)     | TC-54     | Medium   |
| Rapid consecutive changes   | Implied ("real-time")      | Yes (Scenario 4)     | TC-44     | Medium   |
| Negative quantities/prices  | No                         | Yes (Refined AC)     | TC-50,51  | Medium   |
| tax_on_discounted = false   | In story (configurable)    | Marked N/A           | TC-28     | N/A      |

---

## Test Data Summary

### Data Categories

| Data Type       | Count | Purpose         | Examples                                       |
| --------------- | ----- | --------------- | ---------------------------------------------- |
| Valid data      | 20    | Positive tests  | Standard items, 10% discount, 16% tax          |
| Invalid data    | 8     | Negative tests  | Negative qty, negative price, -10% discount    |
| Boundary values | 14    | Boundary tests  | 0 items, 100% discount, $0.01 price, max value |
| Edge case data  | 14    | Edge case tests | 100 penny items, null values, rapid changes    |

### Data Generation Strategy

**Static Test Data:**

- TC-35 complex real-world case (exact values matter for precision validation)
- TC-56 end-to-end flow (specific items for step-by-step verification)
- LATAM tax presets (16%, 19%, 21%)

**Dynamic Test Data (using Faker.js):**

- Item descriptions: `faker.commerce.productName()`
- Quantities: `faker.number.float({ min: 0.01, max: 100, fractionDigits: 2 })`
- Prices: `faker.number.float({ min: 0.01, max: 9999.99, fractionDigits: 2 })`

**Test Data Cleanup:**

- Tests are idempotent (pure functions, no DB state)
- Unit tests require no cleanup
- Integration tests use test user isolation via RLS

---

## PARTE 2: Integracion y Output

### Paso 5: Update Story in Jira

**Status:** PENDING - Jira MCP no tiene acceso al proyecto SQ.

**Accion manual requerida:**

1. Ir a [SQ-23](https://upexgalaxy64.atlassian.net/browse/SQ-23) en Jira
2. Agregar al description la seccion "QA Refinements" con:
   - Refined Acceptance Criteria (Scenarios 1-7)
   - Edge Cases identificados
   - Decisiones tecnicas confirmadas (tax on discounted, half-up rounding)
3. Agregar label: `shift-left-reviewed`

---

### Paso 6: Add Test Cases Comment in Jira

**Status:** PENDING - Jira MCP no tiene acceso al proyecto SQ.

**Accion manual requerida:**

1. Agregar comentario en [SQ-23](https://upexgalaxy64.atlassian.net/browse/SQ-23) con:
   - Resumen de los 56 test cases
   - Link a este archivo local
   - Tags al equipo para review

---

## Paso 8: Final QA Feedback Report

### Summary for PO/Dev

**Story Quality Assessment:** Good (con resoluciones aplicadas)

**Key Findings:**

1. La story original tiene 5 scenarios genericos. Las ambiguedades sobre tax_on_discounted y redondeo fueron resueltas via SRS FR-015 e implementation plan.
2. La story no menciona backward compatibility con SQ-22, pero el implementation plan lo cubre correctamente (items = [] → 0).
3. Los 56 test cases del shift-left testing son exhaustivos y cubren todas las combinaciones criticas.

---

### Critical Questions for PO

**Question 1:** Factura de $0.00 es valida?

- **Context:** Con descuento del 100%, total = 0.00. Es un caso de negocio valido?
- **Impact if not answered:** No bloquea implementacion (calculo es correcto), pero podria necesitar warning en UI.
- **Suggested Answer:** Si, es valido. Util para "facturas pro-bono" o creditos.

**Question 2:** Tax rate > 100% se permite?

- **Context:** TC-53 pregunta si tax_rate = 150% es valido. Algunos paises suman multiples impuestos > 100%.
- **Impact if not answered:** Baja - MVP solo usa un tax_rate simple.
- **Suggested Answer:** No en MVP. Limitar a 0-100%.

---

### Technical Questions for Dev

**Question 1:** Que pasa con quantity/price negativos?

- **Context:** TC-50 y TC-51. Zod schema deberia rechazarlos o las funciones de calculo tratan como 0?
- **Impact on Testing:** Cambia si el test espera error de validacion o valor 0.
- **Suggested Answer:** Doble proteccion: Zod rechaza en form/API, funciones tratan como 0 como fallback.

---

### Testing Recommendations

**Pre-Implementation Testing:**

- Review de `invoice-calculations.ts` existente para confirmar roundCurrency behavior
- Verificar que Zod schemas rechazan negativos

**During Implementation:**

- Escribir unit tests en paralelo con las funciones (TDD approach)
- Verificar que `calculateFullInvoice` retorna InvoiceCalculation type completo

**Post-Implementation:**

- Smoke test: Crear factura sin items → subtotal = $0.00
- Smoke test: Descuento + impuesto calculan correctamente
- Smoke test: Cambios en discount/tax actualizan summary en real-time

---

### What Was Done

**Jira Updates:**

- PENDING: Story refined en Jira (MCP no accesible)
- PENDING: Label `shift-left-reviewed`
- PENDING: Test cases como comentario

**Local Files:**

- Created: `acceptance-test-plan.md` at `.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-23-auto-calculate/`

**Test Coverage:**

- Total test cases designed: 56
  - Positive: 16
  - Negative: 8
  - Boundary: 14
  - Integration: 10
  - E2E: 2
  - Validation: 6

---

### Next Steps (Team Action Required)

1. **PO:** Responder preguntas sobre factura $0 y tax rate > 100%
2. **Dev:** Confirmar tratamiento de negativos (Zod reject vs treat as 0)
3. **QA:** Ejecutar tests una vez implementado (Fase 7)
4. **Manual:** Actualizar Jira con refinamientos y labels (Paso 5 y 6 pendientes)

---

**Jira Link:** [SQ-23](https://upexgalaxy64.atlassian.net/browse/SQ-23)
**Local Test Cases:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-23-auto-calculate/test-cases.md`

---

## Definition of Done (QA Perspective)

- [ ] All ambiguities and questions from this document are resolved
- [ ] All 56 test cases are executed and passing
- [ ] Critical/High test cases: 100% passing
- [ ] Medium/Low test cases: >= 95% passing
- [ ] All critical and high bugs resolved and verified
- [ ] Integration tests passing (frontend === backend calculations)
- [ ] Regression tests passed (existing discount/tax functionality)
- [ ] Exploratory testing completed
- [ ] Test execution report generated

---

## Related Documentation

- **Story:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-23-auto-calculate/story.md`
- **Test Cases (56):** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-23-auto-calculate/test-cases.md`
- **Implementation Plan:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-23-auto-calculate/implementation-plan.md`
- **Epic:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/feature-test-plan.md`
- **SRS Formulas:** `.context/SRS/functional-specs.md` (FR-015)
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/` (executive-summary, user-personas, user-journeys)
- **Architecture:** `.context/SRS/architecture-specs.md`

---

## Test Execution Tracking

**Test Execution Date:** [TBD]
**Environment:** Staging
**Executed By:** [TBD]

**Results:**

- Total Tests: 56
- Passed: [TBD]
- Failed: [TBD]
- Blocked: [TBD]

**Bugs Found:**

- [TBD]

**Sign-off:** [TBD]

---

_Documento generado como parte del Shift-Left Testing Analysis_
_Ultima actualizacion: 2026-02-17_
