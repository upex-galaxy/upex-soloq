# Acceptance Test Plan: STORY-SQ-53 - Mark as Paid

**Fecha:** 2026-03-31
**QA Engineer:** AI-Generated
**Story Jira Key:** [SQ-53](https://upexgalaxy65.atlassian.net/browse/SQ-53)
**Epic:** [SQ-39](https://upexgalaxy65.atlassian.net/browse/SQ-39) - Payment Tracking
**Status:** Draft - Pending PO/Dev Review

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Valentina (Desarrolladora Internacional) - necesita cerrar facturas rapido para mantener flujo de caja.
- **Secondary:** Carlos (Disenador Organizado) - mantiene control ordenado al marcar pagos recibidos.

**Business Value:**

- Cierra el ciclo de facturacion: factura enviada -> pago recibido -> factura cerrada.
- Foundation del payment flow: todas las demas stories de SQ-39 dependen de esta.

**Related User Journey:**

- Journey 2: Seguimiento y Cobro de Factura (paso final: registro de pago).

### Technical Context of This Story

**Frontend:**

- Boton "Mark as Paid" en detalle de factura.
- Quick action icon en listado de facturas.
- Payment form/modal con campos requeridos.
- Status badge update: sent -> paid.

**Backend:**

- `POST /api/invoices/{invoiceId}/payments` — crear registro de pago.
- Actualizar `invoices.status` a 'paid' y `invoices.paid_at`.
- RLS por `user_id`.

**Database:**

- Insert en `payments` (amount_received, payment_method, payment_date, notes).
- Update en `invoices` (status = 'paid', paid_at = NOW()).
- Relacion: `payments.invoice_id` -> `invoices.id`.

**Integration Points:**

- Payment form -> POST API -> DB insert + invoice update.
- Dashboard stats recalculation tras pago.
- Invoice list status badge refresh.

### Story Complexity Analysis

**Overall Complexity:** Medium

- Business logic complexity: Medium — status transition + payment record creation.
- Integration complexity: Medium — afecta dashboard, listado y detalle.
- Data validation complexity: Low — campos basicos del form.
- UI complexity: Medium — modal, button states, status update.

### Epic-Level Context (from EPIC-SQ-39 FTP)

**Critical Risks Inherited:**

- Risk: Estado de invoice no se sincroniza tras registrar pago (High).
  - **Relevance:** Directa — esta story es la transicion de estado principal.
- Risk: Payment registrado pero invoice queda con estado anterior (Integration).
  - **Relevance:** Directa — integration point critico.

**PO Decisions Already Confirmed (precedentes):**

- Warning parcial/sobrepago: informativo, no bloquea submit (SQ-55).
- Formato monetario: USD `$X,XXX.XX`.
- Prefill amount: siempre `invoice.total` actual (SQ-55).

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: Que facturas se pueden marcar como paid?**

- **Location in Story:** AC dice "sent invoice" pero no menciona overdue.
- **PO/Dev Decision (proposed):** Se pueden marcar como paid facturas con status `sent` O `overdue`. Ambas representan facturas no pagadas. Draft y cancelled no se pueden pagar.

**Ambiguity 2: Que pasa si el payment form se cancela?**

- **Location in Story:** No se menciona cancel del modal.
- **PO/Dev Decision (proposed):** Cancel cierra el modal sin cambios. Invoice mantiene su status original.

**Ambiguity 3: Campos requeridos del payment form.**

- **Location in Story:** Scope dice "Payment form/modal with required fields" pero no lista cuales.
- **PO/Dev Decision (proposed):** Campos requeridos: amount_received (SQ-55), payment_date (SQ-57). Opcionales: payment_method (SQ-54), notes (SQ-56). Consistente con stories del epic.

### Missing Information / Gaps

**Gap 1: Concurrency — que pasa si dos usuarios intentan pagar la misma factura.**

- **PO/Dev Decision (proposed):** El segundo intento recibe error "Invoice is already paid". RLS impide que otro usuario pague facturas ajenas de todas formas.

**Gap 2: Quick action desde listado — abre el mismo modal?**

- **PO/Dev Decision (proposed):** Si, ambos paths (detalle y lista) abren el mismo payment modal.

### Edge Cases NOT Covered in Original Story

- Intentar pagar factura con status `draft` o `cancelled`.
- Intentar pagar factura ya pagada (doble pago).
- Network error durante el submit.
- Factura con total = 0.

### Testability Validation

**Is this story testable as written?** ⚠️ Partially — falta definir campos requeridos del form.

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Mark as Paid button on invoice detail

**Type:** Positive
**Priority:** Critical

- **Given:** factura `INV-2026-0042` con status `sent`.
- **When:** usuario ve el detalle de la factura.
- **Then:** ve boton "Mark as Paid" habilitado.

### Scenario 2: Quick action from invoice list

**Type:** Positive
**Priority:** High

- **Given:** usuario en listado de facturas.
- **When:** click en icono de paid en fila de factura `sent`.
- **Then:** se abre payment modal/form.

### Scenario 3: Successful payment submission

**Type:** Positive
**Priority:** Critical

- **Given:** payment modal abierto para factura `INV-2026-0042` (total $1,500.00).
- **When:** usuario completa campos y confirma.
- **Then:** status cambia a `paid`, `paid_at` se registra, success message aparece.

### Scenario 4: Paid timestamp recorded

**Type:** Positive
**Priority:** High

- **Given:** factura marcada como paid.
- **When:** usuario ve detalle de la factura.
- **Then:** ve `paid_at` timestamp y payment record.

### Scenario 5: Already paid invoice — button disabled

**Type:** Negative
**Priority:** Critical

- **Given:** factura con status `paid`.
- **When:** usuario ve la factura.
- **Then:** boton "Mark as Paid" esta disabled o no visible.

### Scenario 6: Cannot pay draft invoice

**Type:** Negative
**Priority:** High

- **Given:** factura con status `draft`.
- **When:** usuario ve la factura.
- **Then:** boton "Mark as Paid" no esta disponible.

### Scenario 7: Cannot pay cancelled invoice

**Type:** Negative
**Priority:** High

- **Given:** factura con status `cancelled`.
- **When:** usuario ve la factura.
- **Then:** boton "Mark as Paid" no esta disponible.

### Scenario 8: Overdue invoice can be paid

**Type:** Positive
**Priority:** High

- **Given:** factura con status `sent` y overdue (past due_date).
- **When:** usuario click "Mark as Paid".
- **Then:** payment modal se abre normalmente.

### Scenario 9: Dashboard stats update after payment

**Type:** Integration
**Priority:** Critical

- **Given:** dashboard muestra pending total = $5,000.
- **When:** usuario marca factura de $1,500 como paid.
- **Then:** pending total baja a $3,500, paid count aumenta.

### Scenario 10: RLS — cannot pay another user's invoice

**Type:** Negative/Security
**Priority:** Critical

- **Given:** User A intenta POST payment a factura de User B.
- **When:** envia request.
- **Then:** API retorna 403/404.

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 10

- Positive: 4
- Negative: 3
- Boundary: 1
- Integration: 1
- API: 1

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Group 1: Button availability by invoice status**

| Invoice Status | Mark as Paid Available | Expected |
| --- | --- | --- |
| sent | Yes | Button enabled |
| overdue (derived) | Yes | Button enabled |
| paid | No | Button disabled/hidden |
| draft | No | Button not shown |
| cancelled | No | Button not shown |

### Test Outlines

#### Validar boton Mark as Paid visible en factura sent

- **Type:** Positive | **Priority:** Critical | **Level:** UI
- **Parametrized:** ✅ Yes (Group 1)

#### Validar quick action abre modal desde listado

- **Type:** Positive | **Priority:** High | **Level:** UI

#### Validar flujo completo de registro de pago exitoso

- **Type:** Positive | **Priority:** Critical | **Level:** E2E

#### Validar timestamp paid_at registrado correctamente

- **Type:** Positive | **Priority:** High | **Level:** API + DB

#### Validar boton disabled para factura ya pagada

- **Type:** Negative | **Priority:** Critical | **Level:** UI

#### Validar que facturas draft y cancelled no permiten pago

- **Type:** Negative | **Priority:** High | **Level:** UI + API

#### Validar aislamiento RLS en endpoint de pagos

- **Type:** Negative/Security | **Priority:** Critical | **Level:** API

#### Validar API POST payment con payload valido

- **Type:** API Contract | **Priority:** High | **Level:** API

#### Validar actualizacion de dashboard tras pago

- **Type:** Integration | **Priority:** Critical | **Level:** E2E

#### Validar que factura overdue se puede pagar

- **Type:** Boundary | **Priority:** High | **Level:** UI + API

---

## Integration Test Cases

### Integration 1: Payment submission -> invoice status + dashboard refresh

- **Integration Point:** POST /api/invoices/{id}/payments -> invoice update -> dashboard recalc.
- **Expected:** Status changes to paid, dashboard totals update immediately.

---

## Edge Cases Summary

| Edge Case | Covered in Story | Added Here | Priority |
| --- | --- | --- | --- |
| Overdue can be paid | ❌ No | ✅ Yes (Scenario 8) | High |
| Draft cannot be paid | ❌ No | ✅ Yes (Scenario 6) | High |
| Cancelled cannot be paid | ❌ No | ✅ Yes (Scenario 7) | High |
| RLS isolation | ❌ No | ✅ Yes (Scenario 10) | Critical |
| Double payment attempt | ✅ Yes (Scenario 5) | Refined | Critical |

---

## Critical Questions for PO/Dev

1. **Can overdue invoices be paid?** Proposed: Yes.
2. **Required form fields?** Proposed: amount_received + payment_date. Method and notes optional.
3. **Concurrency handling?** Proposed: Second payment attempt returns "Invoice is already paid".

---

## Next Steps

1. PO/Dev validate form fields and overdue payability.
2. Dev implements as foundation for SQ-54, SQ-55, SQ-56, SQ-57.
3. QA executes test cases with emphasis on status transitions.

---

_Archivo generado para Fase 5 (Shift-Left Testing)._
_Last sync mirror: 2026-03-31_
