# Comments for SQ-39

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-39)

---

### Fernando Javier Masci - 28/3/2026, 18:33:20

# Feature Test Plan: EPIC-SQ-39 - Payment Tracking

***Fecha:**** 2026-03-28 ****QA Lead:**** Fernando Javier Masci ****Epic Jira Key:**** SQ-39 ****Status:*** Draft

---

## Business Context Analysis

### Business Value

Esta epica cierra el ciclo de facturacion. Permite registrar pagos recibidos y mantener un seguimiento preciso de ingresos, estados y correcciones.

***Key Value Proposition:***

- Registrar pagos de forma clara y consistente.
- Mantener el estado de las facturas alineado con la realidad del cobro.

***Success Metrics (KPIs):***

- Cantidad de facturas cerradas correctamente.
- Menor tiempo para registrar y verificar pagos.

***User Impact:***

- Carlos (Disenador Organizado): mantiene control ordenado de sus cobros.
- Valentina (Desarrolladora Internacional): puede registrar pagos con velocidad y exactitud.
- Andres (Consultor Tradicional): reduce errores al cerrar facturas.

***Critical User Journeys:***

- Journey 2: seguimiento y cobro de factura.
- Journey 3: correccion de errores y reversa de estado.

---

## Technical Architecture Analysis

### Architecture Components Involved

***Frontend:***

- Formulario o modal de registro de pago.
- Inputs para monto, metodo, fecha y notas.
- Estados visuales para validation, warning y success.

***Backend:***

- `POST /api/invoices/{invoiceId}/payments`
- Posible actualizacion de estado de factura a paid/pending.
- Validaciones de payload y consistencia del flujo.

***Database:***

- `payments`
- `invoices`
- `payment_methods` o equivalente segun modelo final.

***External Services:***

- No hay dependencias externas criticas para esta epica.

### Integration Points (Critical for Testing)

***Internal Integration Points:***

- Payment form ↔ API de registro de pago
- API ↔ PostgreSQL (`payments`, `invoices`)
- Payment flow ↔ dashboard/listado para refresco de estado

***Data Flow:*** ```text User -> Payment Form -> POST /api/invoices/{invoiceId}/payments -> PostgreSQL -> Invoice status refresh ```

---

## Risk Analysis

### Technical Risks

***Risk 1: Validacion inconsistente de monto***

- Impact: High
- Likelihood: Medium
- Area Affected: Frontend + Backend
- Mitigation:

- Test Coverage Required: UI + API + DB.

***Risk 2: Estado de invoice no se sincroniza tras registrar pago***

- Impact: High
- Likelihood: Medium
- Area Affected: Integration
- Mitigation:

- Test Coverage Required: E2E del flujo completo.

***Risk 3: Inconsistencia en warning de parcial/sobrepago***

- Impact: Medium
- Likelihood: Medium
- Area Affected: UX + Backend
- Mitigation:

- Test Coverage Required: UI/UX y reglas de negocio.

### Business Risks

***Risk 1: Montos mal registrados generan errores contables***

- Impact on Business: perdida de confianza y datos falsos.
- Impact on Users: afecta a cualquiera que cierre facturas.
- Likelihood: Medium
- Mitigation:

***Risk 2: Warning ambiguo genera confusion***

- Impact on Business: friccion en el flujo de cobro.
- Impact on Users: el usuario no sabe si puede continuar.
- Likelihood: Medium
- Mitigation:

### Integration Risks

***Integration Risk 1: Payment registrado pero invoice queda con estado anterior***

- Integration Point: Payment flow ↔ invoice status refresh
- What Could Go Wrong: el dashboard muestra datos viejos.
- Impact: High
- Mitigation: E2E con refresco inmediato.

***Integration Risk 2: Formato de monto no coincide entre UI y API***

- Integration Point: Frontend ↔ Backend validation
- What Could Go Wrong: UI acepta un valor que la API rechaza.
- Impact: Medium
- Mitigation: contract tests y validacion consistente.

---

## Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

***Ambiguity 1:*** Warning de parcial/sobrepago no define si bloquea.

- Found in: STORY-SQ-55
- Question for PO: el warning permite continuar o bloquea el submit?
- Impact if not clarified: casos de prueba inconsistentes.

***Ambiguity 2:*** Formato exacto de monto y decimales.

- Found in: STORY-SQ-55
- Question for Dev/PO: son obligatorios 2 decimales o se normalizan?
- Impact if not clarified: validacion incompleta.

***Ambiguity 3:*** Comportamiento con valores invalidos o limites.

- Found in: STORY-SQ-55
- Question for Dev: que pasa con `0`, `0.00`, `01000`, espacios o texto?
- Impact if not clarified: edge cases sin cubrir.

***Ambiguity 4:*** Reversa de estado necesita detalle de consistencia.

- Found in: STORY-SQ-58
- Question for PO/Dev: que datos se restauran al revertir a pending?
- Impact if not clarified: riesgo de datos inconsistentes.

### Missing Information

***Missing 1:*** Regla exacta para partial vs full vs overpayment.

- Needed for: matrices de validacion y UI feedback.
- Suggestion: documentar umbrales y comportamiento esperado.

***Missing 2:*** Definicion formal del formato monetario.

- Needed for: test data y contract validation.
- Suggestion: especificar locale, rounding y precision.

***Missing 3:*** Criterio de prefill del monto.

- Needed for: validacion del formulario.
- Suggestion: definir si siempre usa total de invoice.

### Suggested Improvements (Before Implementation)

***Improvement 1:*** Alinear copy de warnings y validaciones.

- Story Affected: STORY-SQ-55
- Current State: el comportamiento del warning no esta cerrado.
- Suggested Change: definir copy, severidad y bloqueo.
- Benefit: menos confusion de usuario.

***Improvement 2:*** Formalizar la regla de formato de monto.

- Story Affected: STORY-SQ-55
- Current State: formato y decimales no estan cerrados.
- Suggested Change: definir precision, rounding y valores invalidos.
- Benefit: tests y implementacion mas precisos.

---

## Test Strategy

### Test Scope

***In Scope:***

- Functional testing (UI, API, DB) para registro de pago.
- Validacion de monto, fecha, metodo y notas.
- Flujo de actualizacion de estado de invoice.
- Cross-browser y mobile responsiveness.
- API contract validation del endpoint de payment.

***Out of Scope:***

- Currency conversion.
- Payment plans o installments.
- Multiple partial payments tracking.
- Integraciones externas de cobro.
- Multi-currency support.
- Multiple payments ordering or historical prefill rules.

### Test Levels

***Unit Testing***

- Coverage Goal: >80%
- Focus Areas: validaciones de monto, formato y reglas de estado.

***Integration Testing***

- Coverage Goal: all integration points.
- Focus Areas: payment form + API + DB + invoice refresh.

***End-to-End (E2E) Testing***

- Coverage Goal: critical payment journeys.
- Tool: Playwright.
- Focus Areas: registrar pago, validar monto, ver cambio de estado, revertir.

***API Testing***

- Coverage Goal: 100% endpoints in scope.
- Focus Areas: request/response, validations, auth, state transition.

### Test Types per Story

***SQ-53: Mark invoice as paid***

- Complexity: Medium
- Estimated Test Cases: 10
- Positive: 4
- Negative: 2
- Boundary: 2
- Integration: 1
- API: 1
- Rationale: transition de estado y refresh.
- Parametrized Tests Recommended: Yes

***SQ-54: Payment method***

- Complexity: Medium
- Estimated Test Cases: 8
- Positive: 3
- Negative: 2
- Boundary: 1
- Integration: 1
- API: 1
- Rationale: validacion de metodos y persistencia.
- Parametrized Tests Recommended: Yes

***SQ-55: Amount received***

- Complexity: High
- Estimated Test Cases: 14
- Positive: 5
- Negative: 4
- Boundary: 3
- Integration: 1
- API: 1
- Rationale: monto, formato, partial/full/overpayment y validaciones.
- Parametrized Tests Recommended: Yes

***SQ-56: Payment notes***

- Complexity: Low
- Estimated Test Cases: 8
- Positive: 3
- Negative: 2
- Boundary: 1
- Integration: 1
- API: 1
- Rationale: texto, longitud, sanitizacion y persistencia.
- Parametrized Tests Recommended: Yes

***SQ-57: Payment date***

- Complexity: Medium
- Estimated Test Cases: 8
- Positive: 3
- Negative: 2
- Boundary: 1
- Integration: 1
- API: 1
- Rationale: fecha valida, timezone y consistencia.
- Parametrized Tests Recommended: Yes

***SQ-58: Revert paid to pending***

- Complexity: Medium
- Estimated Test Cases: 10
- Positive: 4
- Negative: 2
- Boundary: 2
- Integration: 1
- API: 1
- Rationale: reversa de estado y consistencia.
- Parametrized Tests Recommended: Yes

### Test Data Requirements

***Valid Data Sets:***

- Invoices en estado sent y paid.
- Montos iguales, menores y mayores al total.
- Metodos de pago validos.
- Fechas validas y limites de zona horaria.

***Invalid / Boundary Data Sets:***

- Montos vacios, negativos, texto y ceros.
- Fechas invalidas o fuera de rango.
- Notas muy cortas, muy largas o con caracteres especiales.

### Entry / Exit Criteria

***Entry Criteria:***

- Story implementada en staging.
- Unit tests pasando.
- Payload/API documentado si aplica.
- Test data disponible.

***Exit Criteria:***

- Tests criticos aprobados.
- Sin bugs criticos abiertos.
- E2E y API validados.
- NFRs basicos cubiertos.

### NFR Validation

***Performance:***

- El formulario debe responder sin retrasos visibles excesivos.

***Security:***

- RLS y autorizacion deben impedir accesos cruzados.

***Usability:***

- Warnings claros, formato de monto consistente y feedback inmediato.

### Regression Strategy

***Scope:***

- Flujos de invoice status.
- Dashboard refresh.
- Payment form and validations.

***Execution:***

- Regression tras cada story y al final de la epica.

### Timeline Estimate

***Estimated Duration:*** 1 sprint para diseño y ejecucion de QA sobre esta epica.

***Breakdown:***

- Test case design: 2 days
- Test data prep: 1 day
- Execution: 3 days
- Regression: 1 day
- Bug fix validation: 1 day buffer

### Tools & Infrastructure

- E2E: Playwright
- API: Postman/Newman or Playwright API
- Unit: Vitest/Jest
- Performance: Lighthouse
- Data: Faker.js

### Notes & Assumptions

- SQ-55 requiere definicion cerrada de formato monetario antes de implementar.
- La reversa de estado debe validar consistencia de datos relacionados.
- El FTP formal debe ser revisado por PO y Dev antes del sprint.

## Action Required

***@PO***

- Clarificar reglas de monto, warning y formato.

***@Dev Lead***

- Validar integracion, estado e implicancias de contrato.

***@QA Team***

- Revisar estrategia, casos y datos de prueba.

---

***Label suggested:*** `test-plan-ready`

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-28T21:41:10.248Z_
