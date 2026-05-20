# Acceptance Test Plan: STORY-SQ-56 - Payment Notes

**Fecha:** 2026-03-31
**QA Engineer:** AI-Generated
**Story Jira Key:** [SQ-56](https://upexgalaxy65.atlassian.net/browse/SQ-56)
**Epic:** [SQ-39](https://upexgalaxy65.atlassian.net/browse/SQ-39) - Payment Tracking
**Status:** Draft - Pending PO/Dev Review

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Disenador Organizado) - necesita contexto sobre cada pago para reconciliacion.
- **Secondary:** Valentina (Desarrolladora Internacional) - registra referencias de transferencias internacionales.

**Business Value:**

- Mejora trazabilidad de pagos con contexto adicional.
- Facilita reconciliacion bancaria y seguimiento de acuerdos con clientes.

**Related User Journey:**

- Journey 2: Seguimiento y Cobro de Factura (contexto del registro de pago).

### Technical Context of This Story

**Frontend:**

- Textarea en payment form/modal.
- Character counter (500 max).
- Multiline support.

**Backend:**

- Campo `notes` en `POST /api/invoices/{invoiceId}/payments`.
- Sanitization de input (XSS prevention).
- Max length validation: 500 chars.

**Database:**

- `payments.notes` (text, nullable).

### Story Complexity Analysis

**Overall Complexity:** Low

- Business logic: Low — text input.
- Integration: Low — field in existing payment form.
- UI: Low — textarea with counter.

### Epic-Level Context (from EPIC-SQ-39 FTP)

- Estimated TC in FTP: 8.
- Focus: notes input, sanitization, and persistence.

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: Behavior when exceeding 500 chars — truncate or block?**

- **Location in Story:** AC Scenario 4 says "validation error" OR "truncated with counter".
- **PO/Dev Decision (proposed):** Block input at 500 chars (prevent typing beyond limit) + show character counter "X/500". No truncation — clearer UX. If pasted text exceeds 500, truncate to 500 and show warning.

**Ambiguity 2: HTML/script injection in notes.**

- **PO/Dev Decision (proposed):** Sanitize server-side. Store plain text only. Display with proper escaping to prevent XSS.

### Edge Cases NOT Covered

- Notes with only whitespace.
- Notes with emoji characters.
- Very long single word (no spaces).
- Copy-paste of text > 500 chars.

### Testability Validation

**Is this story testable as written?** ✅ Yes — well-defined with clear scenarios.

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Add notes with reference number

**Type:** Positive
**Priority:** High

- **Given:** payment form open.
- **When:** user enters "Transfer reference: TRF-2026-001234".
- **Then:** notes saved and visible in payment details.

### Scenario 2: Notes field is optional

**Type:** Positive
**Priority:** High

- **Given:** payment form with amount filled.
- **When:** user submits without notes.
- **Then:** payment saved with notes = NULL.

### Scenario 3: Character counter at 500 limit

**Type:** Boundary
**Priority:** High

- **Given:** user typing in notes field.
- **When:** reaches 500 characters.
- **Then:** counter shows "500/500" and blocks further input.

### Scenario 4: Paste text exceeding 500 chars

**Type:** Boundary
**Priority:** Medium

- **Given:** user pastes 700 char text.
- **When:** text is pasted.
- **Then:** truncated to 500 chars with warning message.

### Scenario 5: Multiline notes preserved

**Type:** Positive
**Priority:** High

- **Given:** user enters multiline text with line breaks.
- **When:** saved and displayed.
- **Then:** line breaks preserved in display.

### Scenario 6: Special characters preserved

**Type:** Positive
**Priority:** Medium

- **Given:** user enters "Payment $1,500 @ 3% discount (agreed)".
- **When:** saved.
- **Then:** all special characters preserved correctly.

### Scenario 7: View notes in invoice details

**Type:** Positive
**Priority:** High

- **Given:** payment with notes recorded.
- **When:** user views invoice details.
- **Then:** notes visible in payment section.

### Scenario 8: XSS prevention

**Type:** Negative/Security
**Priority:** Critical

- **Given:** user enters `<script>alert('xss')</script>` in notes.
- **When:** saved and displayed.
- **Then:** rendered as plain text, not executed.

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 8

- Positive: 4
- Negative: 1
- Boundary: 2
- Integration: 0
- API: 1

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Group 1: Notes content variations**

| Input | Valid | Expected |
| --- | --- | --- |
| "Transfer ref: TRF-001" | ✅ | Saved as-is |
| "" (empty) | ✅ | NULL in DB |
| "Multi\nline\nnotes" | ✅ | Line breaks preserved |
| "$1,500 @ 3% (agreed)" | ✅ | Special chars preserved |
| 500 chars exactly | ✅ | Saved, counter at 500/500 |
| 501 chars | ❌ | Blocked/truncated |
| `<script>alert(1)</script>` | ✅ (sanitized) | Stored as plain text |

### Test Outlines

#### Validar notas guardadas con texto de referencia

- **Type:** Positive | **Priority:** High | **Level:** UI + API

#### Validar submit exitoso sin notas (campo opcional)

- **Type:** Positive | **Priority:** High | **Level:** UI + API

#### Validar limite de 500 caracteres con counter

- **Type:** Boundary | **Priority:** High | **Level:** UI

#### Validar truncado al pegar texto > 500 chars

- **Type:** Boundary | **Priority:** Medium | **Level:** UI

#### Validar preservacion de multiline y caracteres especiales

- **Type:** Positive | **Priority:** High | **Level:** UI + DB
- **Parametrized:** ✅ Yes (Group 1)

#### Validar notas visibles en detalle de factura

- **Type:** Positive | **Priority:** High | **Level:** UI

#### Validar prevencion de XSS en campo de notas

- **Type:** Negative/Security | **Priority:** Critical | **Level:** UI + API

#### Validar API contract del campo notes

- **Type:** API Contract | **Priority:** High | **Level:** API

---

## Edge Cases Summary

| Edge Case | Covered in Story | Added Here | Priority |
| --- | --- | --- | --- |
| Paste > 500 chars | Partial | ✅ Yes (Scenario 4) | Medium |
| XSS prevention | ❌ No | ✅ Yes (Scenario 8) | Critical |
| Only whitespace | ❌ No | Noted | Low |
| Emoji characters | ❌ No | Noted | Low |

---

## Critical Questions for PO/Dev

1. **500 char limit: block or truncate?** Proposed: Block at limit + counter. Truncate on paste.
2. **Sanitization approach?** Proposed: Server-side sanitization, store plain text, escape on display.

---

## Next Steps

1. PO validates char limit behavior.
2. Dev implements with sanitization.
3. QA validates persistence and display of all content types.

---

_Archivo generado para Fase 5 (Shift-Left Testing)._
_Last sync mirror: 2026-03-31_
