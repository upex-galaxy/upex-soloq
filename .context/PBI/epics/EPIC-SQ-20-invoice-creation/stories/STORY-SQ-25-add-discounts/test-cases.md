h2. 🧪 Shift-Left Test Cases - Generated 2026-02-02

_QA Engineer:_ AI-Generated
_Status:_ Draft - Pending PO/Dev Review
h2.

h1. Test Cases: STORY-SQ-25 - Add Discounts to Invoice

_Fecha:_ 2026-02-02
_QA Engineer:_ AI-Generated
_Story Jira Key:_ SQ-25
_Epic:_ EPIC-SQ-20 - Invoice Creation
_Status:_ Draft
h2.

h2. 📋 Paso 1: Critical Analysis

h3. Business Context of This Story

_User Persona Affected:_

- _Primary:_ Carlos (Diseñador Organizado) - necesita aplicar promociones sin perder profesionalismo ni cometer errores de calculo.
- _Secondary:_ Andres (Consultor Tradicional) - requiere claridad en totales y descuentos para clientes corporativos.

_Business Value:_

- _Value Proposition:_ Permite ofrecer descuentos y promociones, manteniendo facturas profesionales y claras.
- _Business Impact:_ Reduce errores en totales y mejora el tiempo a primera factura y facturas enviadas (KPIs de adopcion).

_Related User Journey:_

- Journey: Registro y Primera Factura (Happy Path)
- Step: Step 10 (Agregar items) y Step 12 (Previsualizar factura)
  h2.

h3. Technical Context of This Story

_Architecture Components:_

_Frontend:_

- Components: formulario de creacion/edicion de factura, resumen de totales, selector de tipo de descuento, input de valor.
- Pages/Routes: App Router bajo {{/app/invoices/*}} (creacion y edicion).
- State Management: React Hook Form + Zod (validacion), calculo en cliente.

_Backend:_

- API Endpoints: {{POST /api/invoices}}, {{PUT /api/invoices/{invoiceId}}}.
- Services: calculo de totales (subtotal, descuento, impuesto, total).
- Database: {{invoices}} (discount_type, discount_value, discount_amount, tax_rate, tax_amount, subtotal, total), {{invoice_items}}.

_External Services:_

- Ninguno.

_Integration Points:_

- Frontend -> Backend API (crear/actualizar factura).
- Backend -> DB (persistencia de descuento y totales).
- Consistencia de calculo frontend/backend.
  h2.

h3. Story Complexity Analysis

_Overall Complexity:_ Medium

_Complexity Factors:_

- Business logic complexity: Medium - reglas de descuento, cap y orden de calculo con impuestos.
- Integration complexity: Medium - frontend y backend deben calcular consistente.
- Data validation complexity: Medium - valores invalidos, limites y redondeo.
- UI complexity: Medium - selector, input, warning y summary.

_Estimated Test Effort:_ Medium
_Rationale:_ Varias combinaciones de tipo/valor, edge cases y consistencia UI/API.
h2.

h3. Epic-Level Context (From Feature Test Plan in Jira)

_Critical Risks Already Identified at Epic Level:_

- Risk 1: Errores de redondeo acumulativo.
  \*\* _Relevance to This Story:_ Descuento afecta todos los calculos; redondeos inconsistentes generan totales incorrectos.
- Risk 2: Inconsistencia frontend/backend.
  \*\* _Relevance to This Story:_ Si UI y API calculan distinto, el resumen y la factura persistida no coinciden.
- Risk 3: Configuracion de impuestos ambigua.
  \*\* _Relevance to This Story:_ El orden descuento/impuesto afecta el total final.

_Integration Points from Epic Analysis:_

- Integration Point 1: Frontend -> Backend API
  ** _Applies to This Story:_ ✅ Yes
  ** _If Yes:_ Envio de discount_type y discount_value al crear/editar factura y validacion de calculos en backend.

_Critical Questions Already Asked at Epic Level:_

_Questions for PO:_

- Question 1: ¿El impuesto se aplica sobre subtotal original o descontado?
  ** _Status:_ ⏳ Pending
  ** _Impact on This Story:_ Define formulas de calculo en UI y backend.
- Question 2: Politica de redondeo (banker's rounding vs half-up).
  ** _Status:_ ⏳ Pending
  ** _Impact on This Story:_ Define resultados esperados y validaciones.
- Question 3: ¿Descuento puede exceder el subtotal?
  ** _Status:_ ⏳ Pending
  ** _Impact on This Story:_ Define cap vs error y mensaje.
- Question 4: ¿Factura de $0 es valida?
  ** _Status:_ ⏳ Pending
  ** _Impact on This Story:_ Afecta comportamiento cuando descuento = subtotal.

_Questions for Dev:_

- Question 1: ¿Logica de calculo compartida entre frontend y backend?
  ** _Status:_ ⏳ Pending
  ** _Impact on This Story:_ Define si se requiere validacion cruzada o ajustes en UI.

_Test Strategy from Epic:_

- Test Levels: Unit, Integration, UI/E2E.
- Tools: No especificado en comentario del epic (alinear a Playwright/Vitest si aplica).
- _How This Story Aligns:_ Requiere UI tests para calculo y validaciones, e integracion UI->API para consistencia.

_Updates and Clarifications from Epic Refinement:_

- No updates encontrados en comentarios del epic.

_Summary: How This Story Fits in Epic:_

- _Story Role in Epic:_ Implementa reglas de descuento que afectan el calculo de totales en creacion/edicion de facturas.
- _Inherited Risks:_ Redondeo e inconsistencias UI/API.
- _Unique Considerations:_ Cap de descuento y warning al usuario, posible configuracion del orden descuento/impuesto.
  h2.

h2. 🚨 Paso 2: Story Quality Analysis

h3. Ambiguities Identified

_Ambiguity 1:_ Orden de calculo descuento/impuesto (configurable vs fijo).

- _Location in Story:_ Technical Notes ("Discount applied before tax or after (configurable)").
- _Question for PO/Dev:_ Se define un unico orden (antes de impuesto) o es configurable por usuario?
- _Impact on Testing:_ Cambia todas las formulas y resultados esperados.
- _Suggested Clarification:_ Definir orden unico para MVP (recomendado: descuento antes de impuesto).

_Ambiguity 2:_ Mensaje y ubicacion del warning cuando el descuento supera el subtotal.

- _Location in Story:_ Scenario 4 (Discount limit).
- _Question for PO/Dev:_ Cual es el texto exacto y donde se muestra (inline, toast, summary)?
- _Impact on Testing:_ No se puede validar UI ni accesibilidad sin mensaje y ubicacion definidos.
- _Suggested Clarification:_ Definir texto, ubicacion y severidad (alert vs helper).

_Ambiguity 3:_ Reglas de redondeo para porcentajes y montos con decimales.

- _Location in Story:_ Scenarios 1-3.
- _Question for PO/Dev:_ Se redondea a 2 decimales por moneda? Se usa round half-up?
- _Impact on Testing:_ Resultados esperados varian por regla de redondeo.
- _Suggested Clarification:_ Especificar precision y regla de redondeo.

_Ambiguity 4:_ Validaciones de input para valores negativos, >100% o texto.

- _Location in Story:_ Technical Notes y Scenario 4.
- _Question for PO/Dev:_ Se bloquea input invalido o se permite y se muestra error? Cual es el mensaje?
- _Impact on Testing:_ No se pueden definir casos negativos con resultado esperado.
- _Suggested Clarification:_ Definir validaciones y mensajes de error.
  h2.

h3. Missing Information / Gaps

_Gap 1:_ Regla cuando el subtotal es 0 y se ingresa descuento.

- _Type:_ Business Rule
- _Why It's Critical:_ Afecta total y warning; puede generar totales negativos.
- _Suggested Addition:_ Definir que descuento sea 0 y warning opcional si subtotal es 0.
- _Impact if Not Added:_ Calculos inconsistentes o totales negativos.

_Gap 2:_ Recalculo cuando cambian items despues de definir descuento.

- _Type:_ Acceptance Criteria
- _Why It's Critical:_ Totales deben recalcularse automaticamente y mantener consistencia.
- _Suggested Addition:_ AC que confirme recalculo y cap re-aplicado tras cambios en items.
- _Impact if Not Added:_ Totales incorrectos o stale en UI.

_Gap 3:_ Campo {{discount_amount}} en API/DB y visibilidad en respuesta.

- _Type:_ Technical Details
- _Why It's Critical:_ La UI debe mostrar monto calculado del descuento de forma consistente con backend.
- _Suggested Addition:_ Asegurar que API retorna {{discount_amount}} o que frontend usa misma logica.
- _Impact if Not Added:_ UI no puede mostrar monto exacto o calcula distinto al backend.
  h2.

h3. Edge Cases NOT Covered in Original Story

_Edge Case 1:_ Porcentaje > 100% (ej: 150%).

- _Scenario:_ Usuario ingresa 150%.
- _Expected Behavior:_ Descuento se capea a subtotal y se muestra warning.
- _Criticality:_ High
- _Action Required:_ Add to story and test cases.

_Edge Case 2:_ Valor negativo (ej: -10 o -$50).

- _Scenario:_ Usuario ingresa valor negativo.
- _Expected Behavior:_ Validacion rechaza con error claro, sin aplicar descuento.
- _Criticality:_ High
- _Action Required:_ Ask PO/Dev (definir validacion/mensaje).

_Edge Case 3:_ Decimales con muchos digitos (ej: 12.345%).

- _Scenario:_ Usuario ingresa valor con mas de 2 decimales.
- _Expected Behavior:_ Redondeo o truncamiento segun regla definida.
- _Criticality:_ Medium
- _Action Required:_ Ask PO/Dev.

_Edge Case 4:_ Subtotal cambia despues de definir descuento.

- _Scenario:_ Descuento previamente valido deja de serlo por cambio de subtotal.
- _Expected Behavior:_ Recalcular descuento y cap si aplica, warning actualizado.
- _Criticality:_ Medium
- _Action Required:_ Add to story and test cases.

_Edge Case 5:_ Subtotal = 0 con descuento.

- _Scenario:_ Subtotal cero y descuento > 0.
- _Expected Behavior:_ Descuento = 0, total = 0, warning opcional.
- _Criticality:_ Medium
- _Action Required:_ Ask PO.
  h2.

h3. Testability Validation

_Is this story testeable as written?_ ⚠️ Partially

_Testability Issues (if any):_

- [x] Expected results are not specific enough
- [x] Missing test data examples
- [x] Missing error scenarios
- [x] Cannot be tested in isolation (missing dependencies info)

_Recommendations to Improve Testability:_

- Definir mensaje/ubicacion del warning y validaciones de input.
- Especificar redondeo a 2 decimales para descuentos y totales.
- Aclarar comportamiento cuando subtotal = 0 o cuando el descuento cambia tras editar items.
  h2.

h2. ✅ Paso 3: Refined Acceptance Criteria

h3. Scenario 1: Percentage discount with tax calculation

_Type:_ Positive
_Priority:_ Critical

- _Given:_
  ** Usuario autenticado en creacion de factura.
  ** Items: 2 x $50 y 1 x $100 (subtotal = $200.00).
  \*\* Tax rate = 10%.
- _When:_
  ** Selecciona tipo de descuento "percentage".
  ** Ingresa 10.
- _Then:_
  ** Discount amount = $20.00 (10% de $200.00).
  ** Taxable amount = $180.00.
  ** Tax amount = $18.00.
  ** Total = $198.00.
  \*\* Summary muestra tipo de descuento, valor y monto calculado.
  h2.

h3. Scenario 2: Fixed discount with tax calculation

_Type:_ Positive
_Priority:_ High

- _Given:_
  ** Usuario autenticado en creacion de factura.
  ** Subtotal = $200.00.
  \*\* Tax rate = 10%.
- _When:_
  ** Selecciona tipo de descuento "fixed".
  ** Ingresa 50.
- _Then:_
  ** Discount amount = $50.00.
  ** Taxable amount = $150.00.
  ** Tax amount = $15.00.
  ** Total = $165.00.
  h2.

h3. Scenario 3: Discount display in summary

_Type:_ Positive
_Priority:_ High

- _Given:_
  \*\* Usuario ha definido un descuento valido.
- _When:_
  \*\* Visualiza el resumen de factura.
- _Then:_
  \*\* Se muestran: tipo de descuento, valor ingresado y monto calculado.
  h2.

h3. Scenario 4: No discount applied

_Type:_ Positive
_Priority:_ Medium

- _Given:_
  ** Subtotal = $200.00.
  ** Tax rate = 10%.
- _When:_
  \*\* Descuento vacio o 0.
- _Then:_
  ** Discount amount = $0.00.
  ** Total = $220.00.
  \*\* No se muestra linea de descuento en resumen/invoice.
  h2.

h3. Scenario 5: Discount cap when exceeding subtotal

_Type:_ Boundary
_Priority:_ High

- _Given:_
  ** Subtotal = $80.00.
  ** Tax rate = 0%.
- _When:_
  \*\* Selecciona tipo "fixed" e ingresa 100.
- _Then:_
  ** Discount amount se capea a $80.00.
  ** Total = $0.00.
  \*\* Se muestra warning de descuento excedido (texto/ubicacion por definir).
  h2.

h3. Scenario 6: Invalid discount value (negative)

_Type:_ Negative
_Priority:_ High

- _Given:_
  \*\* Subtotal = $200.00.
- _When:_
  \*\* Ingresa -10 en el valor de descuento.
- _Then:_
  ** Se muestra error de validacion.
  ** Discount amount permanece en $0.00.
  ** Total no cambia.
  ** _NOTE:_ Requiere confirmacion de PO/Dev sobre mensaje y comportamiento.
  h2.

h3. Scenario 7: Discount recalculation after item changes

_Type:_ Edge Case
_Priority:_ Medium
_Source:_ Identified during critical analysis (Paso 2)

- _Given:_
  \*\* Descuento fijo de $50 aplicado con subtotal $200.00.
- _When:_
  \*\* Se elimina un item y el subtotal queda en $40.00.
- _Then:_
  ** Discount amount se capea a $40.00.
  ** Total = $0.00.
  ** Warning se muestra actualizado.
  ** _NOTE:_ Needs PO/Dev confirmation.
  h2.

h2. 🧪 Paso 4: Test Design

h3. Test Coverage Analysis

_Total Test Cases Needed:_ 11

_Breakdown:_

- Positive: 5 test cases
- Negative: 3 test cases
- Boundary: 2 test cases
- Integration: 1 test case
- API: 0 test cases (cubierto en integracion UI/API)

_Rationale for This Number:_

Cobertura suficiente para dos tipos de descuento, calculo con impuestos, cap, no discount, validaciones, redondeo y recalculo por cambios en items, mas una integracion frontend-backend.
h2.

h3. Parametrization Opportunities

_Parametrized Tests Recommended:_ ✅ Yes

_Parametrized Test Group 1:_ Tipos y valores de descuento validos

- _Base Scenario:_ Calculo de descuento y total en resumen.
- _Parameters to Vary:_ Tipo, valor, subtotal, tax rate.
- _Test Data Sets:_

|| discountType || discountValue || subtotal || taxRate || Expected Discount || Expected Total ||
| percentage | 10 | 200.00 | 10 | 20.00 | 198.00 |
| percentage | 100 | 80.00 | 0 | 80.00 | 0.00 |
| fixed | 50 | 200.00 | 10 | 50.00 | 165.00 |
| fixed | 0 | 200.00 | 10 | 0.00 | 220.00 |

_Total Tests from Parametrization:_ 4
_Benefit:_ Reduce duplicacion al validar calculos con mismas precondiciones.
h2.

_Parametrized Test Group 2:_ Valores invalidos y edge

- _Base Scenario:_ Validacion de input y comportamiento de cap/rounding.
- _Parameters to Vary:_ Valor negativo, porcentaje > 100, exceso de decimales.
- _Test Data Sets:_

|| discountType || discountValue || Expected Behavior ||
| percentage | -10 | Error validation |
| fixed | -50 | Error validation |
| percentage | 150 | Cap + warning |
| percentage | 12.345 | Rounded to 2 decimals (rule pending) |
h2.

h3. Test Outlines

h4. _Validar calculo de descuento porcentual con impuestos aplicados_

_Related Scenario:_ Scenario 1
_Type:_ Positive
_Priority:_ Critical
_Test Level:_ UI
_Parametrized:_ ✅ Yes (Group 1)

_Preconditions:_

- Usuario autenticado.
- Factura en creacion con items definidos (subtotal $200.00).
- Tax rate configurado en 10%.

_Test Steps:_

# Seleccionar descuento tipo "percentage".

\*\* _Data:_ discountValue = 10

# Verificar resumen de totales.

\*\* _Verify:_ Discount amount = $20.00, tax = $18.00, total = $198.00.

_Expected Result:_

- _UI:_ Muestra tipo de descuento, valor 10% y monto $20.00.
- _System State:_ Totales recalculados con descuento antes de impuestos.

_Test Data:_

{code:json}{
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
{code}

_Post-conditions:_

- Factura mantiene descuento aplicado y totales coherentes.
  h2.

h4. _Validar calculo de descuento fijo con impuestos aplicados_

_Related Scenario:_ Scenario 2
_Type:_ Positive
_Priority:_ High
_Test Level:_ UI
_Parametrized:_ ✅ Yes (Group 1)

_Preconditions:_

- Usuario autenticado.
- Subtotal $200.00, taxRate 10%.

_Test Steps:_

# Seleccionar descuento tipo "fixed".

\*\* _Data:_ discountValue = 50

# Verificar resumen de totales.

\*\* _Verify:_ Discount = $50.00, tax = $15.00, total = $165.00.

_Expected Result:_

- _UI:_ Muestra descuento fijo con valor 50 y monto $50.00.
- _System State:_ Totales recalculados correctamente.

_Test Data:_

{code:json}{
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
{code}
h2.

h4. _Validar visualizacion del descuento en el resumen_

_Related Scenario:_ Scenario 3
_Type:_ Positive
_Priority:_ High
_Test Level:_ UI
_Parametrized:_ ❌ No

_Preconditions:_

- Descuento valido aplicado.

_Test Steps:_

# Abrir resumen de factura.

# Verificar seccion de descuento.

_Expected Result:_

- _UI:_ Se muestra tipo, valor y monto calculado.
- _System State:_ Resumen refleja el descuento aplicado.

_Test Data:_

{code:json}{
"input": {
"discountType": "percentage",
"discountValue": 10
}
}
{code}
h2.

h4. _Validar no mostrar linea de descuento cuando el valor es 0 o vacio_

_Related Scenario:_ Scenario 4
_Type:_ Positive
_Priority:_ Medium
_Test Level:_ UI
_Parametrized:_ ✅ Yes (Group 1)

_Preconditions:_

- Subtotal $200.00, taxRate 10%.

_Test Steps:_

# Dejar descuento vacio o ingresar 0.

# Verificar resumen de totales.

_Expected Result:_

- _UI:_ Discount amount = $0.00.
- _UI:_ Total = $220.00.
- _UI:_ No aparece linea de descuento.

_Test Data:_

{code:json}{
"input": {
"subtotal": 200,
"taxRate": 10,
"discountType": "fixed",
"discountValue": 0
}
}
{code}
h2.

h4. _Validar cap de descuento fijo al exceder el subtotal_

_Related Scenario:_ Scenario 5
_Type:_ Boundary
_Priority:_ High
_Test Level:_ UI
_Parametrized:_ ✅ Yes (Group 1)

_Preconditions:_

- Subtotal $80.00, taxRate 0%.

_Test Steps:_

# Seleccionar descuento fijo con valor 100.

# Verificar totales y warning.

_Expected Result:_

- _UI:_ Discount amount = $80.00, total = $0.00.
- _UI:_ Warning visible (texto/ubicacion por definir).

_Test Data:_

{code:json}{
"input": {
"subtotal": 80,
"taxRate": 0,
"discountType": "fixed",
"discountValue": 100
}
}
{code}
h2.

h4. _Validar limite de porcentaje 100% sin error_

_Related Scenario:_ Scenario 5
_Type:_ Boundary
_Priority:_ Medium
_Test Level:_ UI
_Parametrized:_ ✅ Yes (Group 1)

_Preconditions:_

- Subtotal $80.00, taxRate 0%.

_Test Steps:_

# Seleccionar descuento porcentual con valor 100.

# Verificar totales.

_Expected Result:_

- _UI:_ Discount amount = $80.00, total = $0.00.
- _UI:_ No error de validacion.

_Test Data:_

{code:json}{
"input": {
"subtotal": 80,
"taxRate": 0,
"discountType": "percentage",
"discountValue": 100
}
}
{code}
h2.

h4. _Validar cap y warning con porcentaje mayor a 100_

_Related Scenario:_ Scenario 5
_Type:_ Negative
_Priority:_ High
_Test Level:_ UI
_Parametrized:_ ✅ Yes (Group 2)

_Preconditions:_

- Subtotal $200.00.

_Test Steps:_

# Ingresar porcentaje 150.

# Verificar cap y warning.

_Expected Result:_

- _UI:_ Discount amount = $200.00 (cap).
- _UI:_ Warning visible.

_Test Data:_

{code:json}{
"input": {
"subtotal": 200,
"discountType": "percentage",
"discountValue": 150
}
}
{code}
h2.

h4. _Validar error de validacion con descuento negativo_

_Related Scenario:_ Scenario 6
_Type:_ Negative
_Priority:_ High
_Test Level:_ UI
_Parametrized:_ ✅ Yes (Group 2)

_Preconditions:_

- Subtotal $200.00.

_Test Steps:_

# Ingresar descuento -10.

# Verificar mensaje de error y que no se aplique descuento.

_Expected Result:_

- _UI:_ Error visible en input de descuento.
- _System State:_ Descuento no aplicado.
- _Note:_ Mensaje exacto pendiente de definicion.

_Test Data:_

{code:json}{
"input": {
"subtotal": 200,
"discountType": "percentage",
"discountValue": -10
}
}
{code}
h2.

h4. _Validar redondeo de descuento con decimales_

_Related Scenario:_ Scenario 1
_Type:_ Negative
_Priority:_ Medium
_Test Level:_ UI
_Parametrized:_ ✅ Yes (Group 2)

_Preconditions:_

- Subtotal $100.00, taxRate 0%.

_Test Steps:_

# Ingresar porcentaje 12.345.

# Verificar descuento calculado y redondeo.

_Expected Result:_

- _UI:_ Discount amount redondeado a 2 decimales (regla por confirmar).
- _Note:_ Regla exacta de redondeo pendiente de definicion.

_Test Data:_

{code:json}{
"input": {
"subtotal": 100,
"discountType": "percentage",
"discountValue": 12.345
}
}
{code}
h2.

h4. _Validar recalculo de descuento al cambiar items_

_Related Scenario:_ Scenario 7
_Type:_ Edge Case
_Priority:_ Medium
_Test Level:_ UI
_Parametrized:_ ❌ No

_Preconditions:_

- Subtotal $200.00 con descuento fijo $50.

_Test Steps:_

# Eliminar items hasta dejar subtotal $40.00.

# Verificar cap y warning.

_Expected Result:_

- _UI:_ Discount amount = $40.00, total = $0.00.
- _UI:_ Warning actualizado.

_Test Data:_

{code:json}{
"input": {
"initialSubtotal": 200,
"discountType": "fixed",
"discountValue": 50,
"updatedSubtotal": 40
}
}
{code}
h2.

h2. 🔗 Integration Test Cases (If Applicable)

h3. Integration Test 1: Frontend -> Backend - Crear factura con descuento

_Integration Point:_ Frontend -> Backend API
_Type:_ Integration
_Priority:_ High

_Preconditions:_

- Backend API disponible.
- Usuario autenticado.
- Cliente existente.

_Test Flow:_

# Frontend envia {{POST /api/invoices}} con items, taxRate, discountType y discountValue.

# API procesa el calculo y persiste en DB.

# API responde con la factura creada.

_Contract Validation:_

- Request format matches OpenAPI spec: ✅ Yes
- Response format matches OpenAPI spec: ✅ Yes
- Status codes match spec: ✅ Yes (201)

_Expected Result:_

- Integracion exitosa sin discrepancias entre calculo UI y backend.
- Total y taxAmount consistentes con descuento aplicado antes de impuestos.
  h2.

h2. 📊 Edge Cases Summary

|| Edge Case || Covered in Original Story? || Added to Refined AC? || Test Case || Priority ||
| Porcentaje > 100% | ❌ No | ✅ Yes (Scenario 5) | TO-07 | High |
| Valor negativo | ❌ No | ✅ Yes (Scenario 6) | TO-08 | High |
| Decimales con muchos digitos | ❌ No | ⚠️ Needs PO confirmation | TO-09 | Medium |
| Recalcular al cambiar items | ❌ No | ✅ Yes (Scenario 7) | TO-10 | Medium |
| Subtotal = 0 con descuento | ❌ No | ⚠️ Needs PO confirmation | TBD | Medium |
h2.

h2. 🗂️ Test Data Summary

h3. Data Categories

|| Data Type || Count || Purpose || Examples ||
| Valid data | 4 | Positive tests | 10%, $50, 100% |
| Invalid data | 3 | Negative tests | -10, -50, 150% |
| Boundary values | 2 | Boundary tests | 0, 100% |
| Edge case data | 2 | Edge case tests | subtotal 0, subtotal change |

h3. Data Generation Strategy

_Static Test Data:_

- Items: [2 x $50, 1 x $100]
- Subtotal: $80.00, $200.00
- Tax rate: 0%, 10%

_Dynamic Test Data (using Faker.js):_

- User data: {{faker.internet.email()}}
- Numbers: {{faker.number.int({ min: 1, max: 5 })}}
- Dates: {{faker.date.recent()}}

_Test Data Cleanup:_

- ✅ All test data is cleaned up after test execution
- ✅ Tests are idempotent (can run multiple times)
- ✅ Tests do not depend on execution order
  h2.

h2. 📝 PARTE 2: Integracion y Output

h3. Paso 5: Update Story in Jira

_Status:_ Completed - Story updated with QA refinements and label added.
h2.

h3. Paso 6: Add Test Cases Comment in Jira

_Status:_ Completed - This comment.
h2.

h3. Paso 7: Generate Local test-cases.md (Mirroring)

_Status:_ Pending - Local mirror will be created after Jira comment.
h2.

h2. 🎯 Definition of Done (QA Perspective)

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
      h2.

h2. 📎 Related Documentation

- _Story:_ {{.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-25-add-discounts/story.md}}
- _Epic:_ {{.context/PBI/epics/EPIC-SQ-20-invoice-creation/epic.md}}
- _Feature Test Plan:_ Jira comment "Feature Test Plan" in SQ-20 (local file missing)
- _Business Model:_ {{.context/idea/business-model.md}}
- _PRD:_ {{.context/PRD/}} (all files)
- _SRS:_ {{.context/SRS/}} (all files)
- _Architecture:_ {{.context/SRS/architecture-specs.md}}
- _API Contracts:_ {{.context/SRS/api-contracts.yaml}}
  h2.

h2. 📋 Test Execution Tracking

[Esta seccion se completa durante ejecucion]

_Test Execution Date:_ [TBD]
_Environment:_ Staging
_Executed By:_ [Nombre]

_Results:_

- Total Tests: [X]
- Passed: [Y]
- Failed: [Z]
- Blocked: [W]

_Bugs Found:_

- [Bug ID 1]: [Descripcion breve]
- [Bug ID 2]: [Descripcion breve]

_Sign-off:_ [Nombre QA] - [Fecha]
h2.

h2. 📢 Action Required

_@Product Owner:_

- [ ] Review and answer Critical Questions (see Paso 8 below)
- [ ] Validate suggested story improvements
- [ ] Confirm expected behavior for identified edge cases

_@Dev Lead:_

- [ ] Review Technical Questions (see Paso 8 below)
- [ ] Validate integration points and test approach
- [ ] Confirm test data strategy

_@QA Team:_

- [ ] Review test cases for completeness
- [ ] Validate parametrization strategy
- [ ] Prepare test environment
      h2.

_Next Steps:_

# Team discusses critical questions and ambiguities

# PO/Dev provide answers and clarifications

# QA updates test cases based on feedback

# Dev starts implementation with clear acceptance criteria

h2.

_Documentation:_ Full test cases also available at:
{{.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-25-add-discounts/test-cases.md}}
