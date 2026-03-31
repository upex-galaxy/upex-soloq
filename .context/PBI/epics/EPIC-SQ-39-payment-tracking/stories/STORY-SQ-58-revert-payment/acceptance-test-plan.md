# Acceptance Test Plan: STORY-SQ-58 - Revert Payment

**Fecha:** 2026-03-31
**QA Engineer:** AI-Generated
**Story Jira Key:** [SQ-58](https://upexgalaxy65.atlassian.net/browse/SQ-58)
**Epic:** [SQ-39](https://upexgalaxy65.atlassian.net/browse/SQ-39) - Payment Tracking
**Status:** Draft - Pending PO/Dev Review

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Valentina (Desarrolladora Internacional) - necesita corregir pagos registrados por error.
- **Secondary:** Carlos (Disenador Organizado) - revierte pagos cuando el cliente no completa la transferencia.

**Business Value:**

- Permite corregir errores sin perder historial (soft delete).
- Mantiene integridad de datos financieros del freelancer.

**Related User Journey:**

- Journey 3: Correccion de errores y reversa de estado.

### Technical Context of This Story

**Frontend:**

- "Revert Payment" button/action on paid invoices only.
- Confirmation dialog with warning message.
- Status badge update: paid -> sent/overdue.

**Backend:**

- `DELETE /api/invoices/{invoiceId}/payments/{paymentId}` — soft delete.
- Update `invoices.status` based on due_date (sent if not overdue, overdue if past due).
- Clear `invoices.paid_at`.
- Create audit event in `invoice_events`.

**Database:**

- `payments.deleted_at` = NOW() (soft delete).
- `invoices.status` = 'sent' or 'overdue' depending on due_date.
- `invoices.paid_at` = NULL.
- Insert `invoice_events` (event_type: 'updated', metadata: payment revert).

**Integration Points:**

- Revert API -> invoice status update -> dashboard recalculation.
- Audit trail in invoice_events.

### Story Complexity Analysis

**Overall Complexity:** Medium

- Business logic: Medium — conditional status (sent vs overdue), soft delete, audit trail.
- Integration: Medium — dashboard stats, invoice status, events.
- UI: Medium — confirmation dialog, button visibility rules.

### Epic-Level Context (from EPIC-SQ-39 FTP)

**Critical Risks Inherited:**

- Risk: Reversa de estado necesita detalle de consistencia (FTP Ambiguity 4).
  - **Relevance:** Directa — esta story define exactamente que datos se restauran.
- Risk: Dashboard muestra datos viejos post-revert.
  - **Relevance:** Dashboard must recalculate after revert.

**PO Decisions Already Confirmed:**

- Soft delete (no hard delete) — preserva historial.
- Status after revert depends on due_date.

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: What data is restored/cleared on revert?**

- **Location in Story:** AC covers status and paid_at but not payment fields.
- **PO/Dev Decision (proposed):** On revert: (1) payment.deleted_at = NOW(), (2) invoice.status = sent or overdue, (3) invoice.paid_at = NULL. Payment record remains in DB (soft deleted) for audit purposes. No other invoice fields change.

**Ambiguity 2: Can user revert and then pay again?**

- **Location in Story:** Not mentioned.
- **PO/Dev Decision (proposed):** Yes. After revert, invoice is back to sent/overdue and can be paid again with a new payment record.

**Ambiguity 3: Multiple payments — which gets reverted?**

- **Location in Story:** Out of scope says "Batch revert" but doesn't clarify single invoice with 1 payment.
- **PO/Dev Decision (proposed):** MVP assumes 1 payment per invoice. Revert deletes the single payment. Multiple payments per invoice is out of scope (SQ-53).

### Edge Cases NOT Covered

- Revert on invoice where due_date = today (sent, not overdue).
- Revert on invoice where due_date is past (overdue after revert).
- Revert on invoice without due_date (status = sent).
- Double-click on revert button (concurrency).
- Revert after invoice was already reverted (edge: no payment to revert).

### Testability Validation

**Is this story testable as written?** ✅ Yes — well-defined with clear scenarios.

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Revert paid invoice to sent (due_date in future)

**Type:** Positive
**Priority:** Critical

- **Given:** paid invoice `INV-2026-0042` with due_date in the future.
- **When:** user clicks "Revert Payment" and confirms.
- **Then:** status changes to "sent", paid_at cleared, payment soft-deleted, success message shown.

### Scenario 2: Revert paid invoice to overdue (due_date in past)

**Type:** Positive
**Priority:** Critical

- **Given:** paid invoice with due_date Feb 01, 2026 (past).
- **When:** user reverts payment on Mar 31, 2026.
- **Then:** status changes to "overdue" (not "sent"), paid_at cleared.

### Scenario 3: Confirmation dialog

**Type:** Positive
**Priority:** High

- **Given:** viewing paid invoice.
- **When:** clicks "Revert Payment".
- **Then:** dialog: "Are you sure?" + warning "This will mark the invoice as unpaid and remove the payment record" + Cancel/Confirm buttons.

### Scenario 4: Cancel revert action

**Type:** Positive
**Priority:** High

- **Given:** confirmation dialog open.
- **When:** clicks "Cancel".
- **Then:** dialog closes, invoice remains "paid", no changes.

### Scenario 5: Revert only on paid invoices

**Type:** Negative
**Priority:** Critical

- **Given:** invoice with status "sent".
- **When:** user looks at actions.
- **Then:** "Revert Payment" not available.

### Scenario 6: Audit trail recorded

**Type:** Positive
**Priority:** High

- **Given:** payment reverted on `INV-2026-0042`.
- **When:** revert completes.
- **Then:** event in `invoice_events` with type 'updated' and revert metadata.

### Scenario 7: Dashboard updates after revert

**Type:** Integration
**Priority:** Critical

- **Given:** dashboard shows $5,000 paid, $3,000 pending.
- **When:** user reverts $500 payment.
- **Then:** paid decreases by $500, pending increases by $500.

### Scenario 8: Soft delete — payment record preserved

**Type:** Positive
**Priority:** High

- **Given:** payment reverted.
- **When:** checking DB.
- **Then:** payment record exists with `deleted_at` set, not hard deleted.

### Scenario 9: RLS — cannot revert another user's payment

**Type:** Negative/Security
**Priority:** Critical

- **Given:** User A tries to DELETE payment on User B's invoice.
- **When:** sends API request.
- **Then:** 403/404 returned.

### Scenario 10: Revert when due_date = today (sent, not overdue)

**Type:** Boundary
**Priority:** High

- **Given:** paid invoice with due_date = today.
- **When:** reverted.
- **Then:** status = "sent" (not overdue, since due_date = today is not past).

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 10

- Positive: 4
- Negative: 2
- Boundary: 1
- Integration: 2
- API: 1

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Group 1: Status after revert based on due_date**

| due_date vs today | Expected Status After Revert |
| --- | --- |
| Future | sent |
| Today | sent |
| Yesterday | overdue |
| 30 days ago | overdue |
| NULL | sent |

### Test Outlines

#### Validar revert de factura paid a sent (due_date futuro)

- **Type:** Positive | **Priority:** Critical | **Level:** E2E

#### Validar revert de factura paid a overdue (due_date pasado)

- **Type:** Positive | **Priority:** Critical | **Level:** E2E
- **Parametrized:** ✅ Yes (Group 1)

#### Validar dialogo de confirmacion con warning

- **Type:** Positive | **Priority:** High | **Level:** UI

#### Validar cancel de revert no modifica nada

- **Type:** Positive | **Priority:** High | **Level:** UI

#### Validar que revert no esta disponible en facturas no-paid

- **Type:** Negative | **Priority:** Critical | **Level:** UI

#### Validar audit trail en invoice_events

- **Type:** Positive | **Priority:** High | **Level:** API + DB

#### Validar soft delete del payment record

- **Type:** Positive | **Priority:** High | **Level:** API + DB

#### Validar actualizacion de dashboard tras revert

- **Type:** Integration | **Priority:** Critical | **Level:** E2E

#### Validar aislamiento RLS en endpoint de revert

- **Type:** Negative/Security | **Priority:** Critical | **Level:** API

#### Validar API DELETE con response correcto

- **Type:** API Contract | **Priority:** High | **Level:** API

---

## Integration Test Cases

### Integration 1: Revert -> invoice status + dashboard refresh

- **Integration Point:** DELETE payment -> invoice update -> dashboard recalc.
- **Expected:** Status reverts correctly, dashboard totals update.

### Integration 2: Revert -> pay again cycle

- **Integration Point:** Revert -> invoice becomes payable -> new payment.
- **Expected:** Full cycle works without data corruption.

---

## Edge Cases Summary

| Edge Case | Covered in Story | Added Here | Priority |
| --- | --- | --- | --- |
| Revert to overdue vs sent | ✅ Yes | Refined with boundary | Critical |
| due_date = today (sent) | ❌ No | ✅ Yes (Scenario 10) | High |
| due_date = NULL (sent) | ❌ No | ✅ Yes (Group 1) | Medium |
| Soft delete preservation | ✅ Yes | Validated | High |
| RLS isolation | ❌ No | ✅ Yes (Scenario 9) | Critical |
| Pay again after revert | ❌ No | ✅ Yes (Integration 2) | Medium |

---

## Critical Questions for PO/Dev

1. **Data restored on revert?** Proposed: paid_at = NULL, status = sent/overdue, payment soft-deleted.
2. **Can invoice be paid again after revert?** Proposed: Yes.
3. **due_date = today after revert?** Proposed: status = sent (not overdue).

---

## Next Steps

1. PO validates revert behavior and audit trail requirements.
2. Dev implements with soft delete and conditional status.
3. QA validates full revert -> pay again cycle.

---

_Archivo generado para Fase 5 (Shift-Left Testing)._
_Last sync mirror: 2026-03-31_
