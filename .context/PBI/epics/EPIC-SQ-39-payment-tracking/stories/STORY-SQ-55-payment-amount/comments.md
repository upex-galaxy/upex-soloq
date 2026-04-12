# Comments for SQ-55

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-55)

---

### Fernando Javier Masci - 2026-03-25T03:30:51.771Z

Shift Left:

- Resolver indentación/bullets de los ACs



Acceptance Criteria (Gherkin)

1. Scenario 1: Record full payment amount

- ***Given:*** I am on the payment recording form for invoice INV-2026-0042 with total $1,500.00
- ***When:*** I enter amount received as 1500.00
- ***Then:*** The system accepts the amount and shows it matches the invoice total
- ***And:*** The amount is displayed with proper currency formatting ($1,500.00)
  - Note: revisar reglas de validacion de formato
  - Note2: acepta diferentes currency?

Scenario 2: Record partial payment amount

- ***Given:*** I am recording a payment for an invoice with total $2,000.00
- ***When:*** I enter amount received as 1000.00
- ***Then:*** The system accepts the partial amount
- ***And:*** Shows a warning that the amount received ($1,000.00) is less than the invoice total ($2,000.00)
  - Notes: Hay algun limite en donde el warning sea restrictivo? Es decir impida al user continuar
- ***And:*** Allows me to proceed with the partial payment

Scenario 3: Record overpayment amount

- ***Given:*** I am recording a payment for an invoice with total $500.00
- ***When:*** I enter amount received as 550.00
- ***Then:*** The system accepts the overpayment
- ***And:*** Shows a notice that the amount received ($550.00) exceeds the invoice total ($500.00)
  - Note: es restrictivo o igual le permite continuar?

Scenario 4: Validate required amount field

- ***Given:*** I am on the payment recording form
- ***When:*** I try to submit without entering an amount
- ***Then:*** The system shows a validation error "Amount received is required"
- ***And:*** The form is not submitted
  - Note: Que pasa por formatos invalidos?

Scenario 5: Validate positive amount

- ***Given:*** I am on the payment recording form
- ***When:*** I enter a negative amount (-100)
- ***Then:*** The system shows a validation error "Amount must be greater than 0"
  - Note: admite “ceros” por delante? 01000



1. Scenario 7: Amount field pre-filled with invoice total

- ***Given:*** I open the payment recording form for invoice with total $750.00
- ***When:*** The form loads
- ***Then:*** The amount field is pre-filled with 750.00
- ***And:*** I can modify the amount if needed
  - Note: El pre-filled es siempre por default? Si hay mas de un payment? cual aparece primero? como ordena? por fecha? por monto?

---

### Fernando Javier Masci - 2026-03-28T21:11:39.390Z

## Table Summary

| Item | Details |
| --- | --- |
| Objective | Validate amount-received entry against the invoice total with strong coverage for formatting, validation, warnings, and prefill behavior. |
| In Scope | Amount field visibility, prefill with invoice total, 2-decimal support, currency formatting, required/positive/numeric validation, partial/full/overpayment, warning/notice behavior. |
| Out of Scope | Multiple partial payments tracking, currency conversion, bank reconciliation, payment plans/installments. |
| Key Risks | Ambiguous warning behavior, precision/rounding rules, invalid values like `0`, `0.00`, `01000`, whitespace, and currency formatting mismatch. |
| Test Types | UI, API, DB, UX, validation and boundary checks. |
| Open Questions | 2-decimal rule, warning blocks vs informs, value normalization, prefill source/ordering. |
| Dev SP | 5 |
| QA SP | 5 |

## Objective

Validate amount-received entry against the invoice total with strong coverage for formatting, validation, warnings, and prefill behavior.

## Scope

- Amount field visibility and default state
- Prefill with invoice total
- Numeric, decimal, and currency formatting
- Required, positive, and invalid value validation
- Partial payment, full payment, and overpayment behavior
- Warning/notice messaging and whether it blocks or allows continuation

## Non-Functional Coverage

- Validation feedback timing while typing and on submit
- Formatting consistency across locale/currency display
- Behavior under slow form load or API delay

## Test Dimensions

- UI: field state, helper text, warnings, error messages
- API: payload validation and accepted formats
- DB: amount persistence and relation to invoice totals
- UX: prefill clarity, editability, visual cues for partial/over amounts

## Suggested Scenarios

- Amount field is visible and prefilled when opening the form
- Prefill shows the invoice total using the correct currency format
- User can edit the prefilled amount manually
- Full payment is accepted and shown as matching the invoice total
- Partial payment is accepted and warning is non-blocking unless specified otherwise
- Overpayment is accepted and notice behavior is explicit
- Empty amount is rejected with a required-field error
- Negative values are rejected
- Values with leading zeros are handled consistently
- Non-numeric input is rejected or normalized according to the product rule

## Open Questions

- Are 2 decimals mandatory, optional, or rounded automatically?
- Does the warning block submit or only inform the user?
- What happens with values like `0`, `0.00`, `01000`, or whitespace?

---

### Fernando Javier Masci - 2026-03-29T04:50:19.890Z

Acceptance Test Plan (Shift-Left) - Local Mirror actualizado.

Este comentario contiene el ATP completo y las preguntas criticas pendientes para PO/Dev.

```markdown
# Acceptance Test Plan: STORY-SQ-55 - Payment Amount

**Fecha:** 2026-03-29
**QA Engineer:** AI-Generated
**Story Jira Key:** [SQ-55](https://upexgalaxy65.atlassian.net/browse/SQ-55)
**Epic:** [SQ-39](https://upexgalaxy65.atlassian.net/browse/SQ-39) - Payment Tracking
**Status:** Draft - Pending PO/Dev Clarification

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Valentina (Desarrolladora Internacional) - necesita registrar cobros exactos para cerrar facturas rapido.
- **Secondary:** Carlos (Disenador Organizado) - depende de montos correctos para control de ingresos.

**Business Value:**

- Evita inconsistencias contables y mejora confianza en la plataforma.
- Permite confirmar rapidamente si el pago coincide, es parcial o excede el total.

**Related User Journey:**

- Journey 2: seguimiento y cobro de factura.

### Technical Context of This Story

**Frontend:**

- Formulario/modal de pago con campo `amount received`.
- Prefill con total de factura, validaciones de input y mensajes de warning/notice.

**Backend:**

- `POST /api/invoices/{invoiceId}/payments`.
- Validacion de monto y consistencia de estado de factura.

**Database:**

- Persistencia en `payments.amount_received`.
- Relacion con `invoices.total` para validaciones de full/partial/overpayment.

### Epic-Level Context (from EPIC-SQ-39 FTP)

- Riesgos heredados: validacion inconsistente de monto, warning ambiguo, refresh de estado.
- Integration point heredado: Payment form -> API -> DB -> invoice status refresh.
- Preguntas abiertas heredadas: precision de decimales, regla de warning bloqueante/no bloqueante, normalizacion de valores.

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: Warning behavior for partial/overpayment.**

- **Question for PO:** el warning solo informa o bloquea el submit?
- **Impact on Testing:** cambia expected result de escenarios 2 y 3.

**Ambiguity 2: Decimal precision and normalization.**

- **Question for PO/Dev:** 2 decimales son obligatorios o se normalizan automaticamente?
- **Impact on Testing:** afecta formato, API payload y persistencia.

**Ambiguity 3: Input treatment for edge values.**

- **Question for Dev:** que pasa con `0`, `0.00`, `01000`, espacios y texto mixto?
- **Impact on Testing:** impide cerrar matriz de casos boundary.

**Ambiguity 4: Prefill source ordering.**

- **Question for PO/Dev:** el prefill siempre usa `invoice.total` actual?
- **Impact on Testing:** define comportamiento cuando hay historico de pagos/reintentos.

### Missing Information / Gaps

- Regla exacta de redondeo (`round half up`, truncado, etc.).
- Locale/currency oficial para formatting de UI.
- Error messages exactos y traduccion.
- Criterio de bloqueo cuando monto es valido pero no coincide con total.

### Edge Cases NOT Covered in Original Story

- Monto con mas de 2 decimales (`1000.999`).
- Monto con separadores de miles (`1,000.00`).
- Monto con espacios (` 1000 `).
- Monto cero (`0`, `0.00`).
- Monto extremadamente alto.

### Testability Validation

**Is this story testable as written?** ⚠️ Partially

**Recommendations:** cerrar reglas de warning y precision antes de desarrollo para evitar retrabajo en UI/API.

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Record full payment amount

**Type:** Positive
**Priority:** Critical

- **Given:** invoice `INV-2026-0042` con total `1500.00`.
- **When:** usuario ingresa `1500.00` y envia.
- **Then:** sistema acepta el pago, muestra match con total y formato de moneda consistente.

### Scenario 2: Record partial payment amount

**Type:** Positive/Warning
**Priority:** Critical

- **Given:** invoice con total `2000.00`.
- **When:** usuario ingresa `1000.00`.
- **Then:** sistema muestra warning de parcial.
- **And:** comportamiento de submit depende de regla de negocio a confirmar.

### Scenario 3: Record overpayment amount

**Type:** Positive/Warning
**Priority:** High

- **Given:** invoice con total `500.00`.
- **When:** usuario ingresa `550.00`.
- **Then:** sistema muestra notice de sobrepago.
- **And:** comportamiento de submit depende de regla de negocio a confirmar.

### Scenario 4: Required amount validation

**Type:** Negative
**Priority:** Critical

- **Given:** formulario de pago abierto.
- **When:** usuario envia sin monto.
- **Then:** se muestra `Amount received is required` y no se envia el formulario.

### Scenario 5: Positive amount validation

**Type:** Negative
**Priority:** Critical

- **Given:** formulario de pago abierto.
- **When:** usuario ingresa `-100`.
- **Then:** se muestra `Amount must be greater than 0`.

### Scenario 6: Numeric input validation

**Type:** Negative
**Priority:** High

- **Given:** formulario de pago abierto.
- **When:** usuario ingresa `abc`.
- **Then:** sistema bloquea input invalido o muestra error de formato.

### Scenario 7: Prefill with invoice total

**Type:** Positive
**Priority:** High

- **Given:** invoice con total `750.00`.
- **When:** formulario carga.
- **Then:** campo monto se precarga con `750.00` y puede editarse.

### Scenario 8: Decimal precision and normalization

**Type:** Boundary
**Priority:** High

- **Given:** formulario de pago abierto.
- **When:** usuario ingresa valor con 3+ decimales o con espacios/ceros lider.
- **Then:** sistema normaliza o rechaza segun regla definida.

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 14

- Positive: 5
- Negative: 4
- Boundary: 3
- Integration: 1
- API: 1

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Group 1: Amount validation matrix**

| Input | Context | Expected |
| --- | --- | --- |
| `1500.00` | equals total | accepted, full payment |
| `1000.00` | below total | warning partial |
| `550.00` | above total | notice overpayment |
| `0` | zero | validation error |
| `-100` | negative | validation error |
| `abc` | non-numeric | blocked/rejected |
| `01000` | leading zeros | normalized/rejected per rule |
| `1000.999` | >2 decimals | rounded/rejected per rule |

### Test Outlines

#### Validar registro de pago completo con formato correcto

- **Type:** Positive
- **Priority:** Critical
- **Level:** UI + API + DB
- **Expected:** persistencia correcta y match con total de factura.

#### Validar warning de pago parcial y regla de continuidad

- **Type:** Positive/Warning
- **Priority:** Critical
- **Level:** UI + API
- **Expected:** warning consistente y submit segun regla acordada.

#### Validar notice de sobrepago y regla de continuidad

- **Type:** Positive/Warning
- **Priority:** High
- **Level:** UI + API
- **Expected:** mensaje claro y comportamiento consistente.

#### Validar errores de required, negativo y no numerico

- **Type:** Negative
- **Priority:** Critical
- **Level:** UI
- **Expected:** mensajes exactos y bloqueo de submit.

#### Validar precision decimal y normalizacion

- **Type:** Boundary
- **Priority:** High
- **Level:** Integration
- **Expected:** UI/API aplican la misma regla de precision y formato.

---

## Integration Test Cases

### Integration 1: Payment submit updates invoice state and dashboard

- **Integration Point:** payment form <-> API <-> DB <-> invoice refresh
- **Flow:** registrar pago, cerrar modal, volver al listado/dashboard.
- **Expected:** estado y montos visibles se actualizan de inmediato sin inconsistencia.

---

## Edge Cases Summary

| Edge Case | Covered in Story | Added Here | Priority |
| --- | --- | --- | --- |
| `0` / `0.00` | No | Yes | High |
| leading zeros (`01000`) | No | Yes | Medium |
| >2 decimales | No | Yes | High |
| espacios alrededor | No | Yes | Medium |
| separador de miles | No | Yes | Medium |

---

## Critical Questions for PO/Dev

1. Warning de parcial/sobrepago: informa o bloquea?
2. Regla oficial de decimales: fija en 2, flexible, o normalizada?
3. Regla de normalizacion para `0`, `0.00`, `01000`, espacios?
4. Prefill: siempre `invoice.total` actual o hay excepciones?
5. Formato monetario exacto (locale/currency) para UI?

---

## Next Steps

1. PO/Dev responden preguntas criticas.
2. QA actualiza este ATP con decisiones cerradas.
3. Dev implementa validaciones UI/API alineadas.
4. QA ejecuta matriz parametrizada + integracion.

---

_Archivo generado para Fase 5 (Shift-Left Testing)._

```

Action required: responder preguntas criticas para cerrar el ATP y habilitar implementacion.

---

### Fernando Javier Masci - 2026-03-29T04:51:13.491Z

**Proposed defaults for open questions (SQ-55)**

Propuesta de cierre para desbloquear implementacion. Requiere confirmacion PO/Dev.

- Warning parcial/sobrepago: informativo, no bloquea submit.
- Precision: aceptar hasta 2 decimales; mas de 2 -> validacion error o normalizacion explicita definida por producto.
- Normalizacion: trim de espacios y rechazo de no numerico; 0 y 0.00 invalidos por regla > 0.
- Prefill: usar siempre invoice.total actual al abrir formulario; valor editable por usuario.
- Formato UI: currency consistente con locale del negocio, persistiendo valor decimal canonico en backend.

Estado: pendiente confirmacion final del equipo.@@Ely 

---

### Automation for Jira - 2026-04-01T05:22:43.300Z

🔎 Pull Request created. Task is pending to ANALYZE and REVIEW by the team. Waiting for PR Approval.

---

### Fernando Javier Masci - 2026-04-03T01:43:39.974Z

@@Ely 

QA exploratory update: BLOCKED by staging precondition.

Environment tested manually: https://staging-upexsoloq.vercel.app/

Observed behavior: invoice flow remains in draft and does not expose a reachable draft to sent path in current manual journey.

Impact: Mark as paid flow cannot be executed because payment action requires sent or overdue invoice status.

Already validated: this is not a credentials issue in CI (env and auth checks passed in smoke workflow).

Request to owner and TL: confirm deployment alignment and provide one of these to unblock QA: exact UI steps for draft to sent in current staging, or seeded sent/overdue invoice data for QA user.

QA disposition: SQ-55 remains BLOCKED until precondition is reachable in staging.

Additional QA manual findings for SQ-55 in staging ([https://staging-upexsoloq.vercel.app/](https://staging-upexsoloq.vercel.app/) ):

1. Full payment exact (e.g., total 1500, input 1500.00): blocked by precondition, invoice does not reach sent state in observed flow.

1. Partial payment: blocked by same precondition.

1. Overpayment: blocked by same precondition.

1. Invalid inputs (0, 0.00, -100, abc): input control prevents invalid entries; no explicit validation message observed.

1. Precision/normalization (01000, spaces, 1000.999): value is normalized to a valid number; no explicit validation message observed.

Need owner/TL guidance for a reachable draft to sent route or seeded sent/overdue invoices to complete end-to-end payment validations.

---

### Fernando Javier Masci - 2026-04-03T03:05:03.260Z

QA workflow update: status transitioned from Ready For QA to In Test and then to BLOCKED.

Reason: payment flow precondition remains unreachable in current staging path (cannot reach sent or overdue state for payment validation).

Unblock request remains open with TL/owner for draft to sent route or seeded sent-overdue data.

---


_Synced from Jira by jira-sync_
_Last sync: 2026-04-03T04:44:55.741Z_
