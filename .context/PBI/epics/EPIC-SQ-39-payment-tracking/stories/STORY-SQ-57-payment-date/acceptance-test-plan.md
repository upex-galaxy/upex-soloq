# Acceptance Test Plan: STORY-SQ-57 - Payment Date

**Fecha:** 2026-03-31
**QA Engineer:** AI-Generated
**Story Jira Key:** [SQ-57](https://upexgalaxy65.atlassian.net/browse/SQ-57)
**Epic:** [SQ-39](https://upexgalaxy65.atlassian.net/browse/SQ-39) - Payment Tracking
**Status:** Draft - Pending PO/Dev Review

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Valentina (Desarrolladora Internacional) - registra pagos que llegan con delay y necesita fecha exacta.
- **Secondary:** Andres (Consultor Tradicional) - registra pagos en efectivo que recibio dias atras.

**Business Value:**

- Precision en historial de pagos para conciliacion financiera.
- Permite registrar pagos retroactivos (recibidos dias atras).

**Related User Journey:**

- Journey 2: Seguimiento y Cobro de Factura (fecha de registro de pago).

### Technical Context of This Story

**Frontend:**

- Date input with calendar picker.
- Default: current date (today).
- Validation: required, not in future.
- Warning for date before invoice issue date.
- Format display: "Mar 02, 2026".

**Backend:**

- Campo `payment_date` en `POST /api/invoices/{invoiceId}/payments`.
- Validation: required, <= today, warning if < issue_date.

**Database:**

- `payments.payment_date` (date, not null).

### Story Complexity Analysis

**Overall Complexity:** Medium

- Business logic: Medium — date validation rules with warnings.
- UI: Medium — calendar picker with restrictions.
- Data validation: Medium — future dates blocked, pre-issue warning.

### Epic-Level Context (from EPIC-SQ-39 FTP)

- Estimated TC in FTP: 8.
- Focus: date validation and timezone considerations.
- Note from FTP: timezone handling uses user's timezone for calculations.

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: Date before issue date — warning or block?**

- **Location in Story:** AC Scenario 4 says "warning" and "allows to proceed if confirmed".
- **PO/Dev Decision (proposed):** Informative warning (not blocking), consistent with SQ-55 precedent. Show: "Payment date is before the invoice issue date" but allow submit. No confirmation dialog needed — warning is enough.

**Ambiguity 2: Timezone for "today" calculation.**

- **Location in Story:** Scope says "Out of Scope: Timezone handling (use server timezone)".
- **PO/Dev Decision (proposed):** Override scope note — use user's timezone per PO precedent. "Today" = current date in user's timezone.

**Ambiguity 3: Date display format.**

- **Location in Story:** AC says "Mar 02, 2026" but no formal specification.
- **PO/Dev Decision (proposed):** Display format: "MMM DD, YYYY" (e.g., "Mar 31, 2026"). Consistent across the app.

### Edge Cases NOT Covered

- Payment date = today (valid boundary).
- Payment date = tomorrow (invalid boundary).
- Payment date = invoice issue date exactly (valid, no warning).
- Payment date = invoice issue date - 1 (valid, with warning).
- Very old date (e.g., 1 year ago).

### Testability Validation

**Is this story testable as written?** ✅ Yes — clear scenarios with good coverage.

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Default payment date is today

**Type:** Positive
**Priority:** Critical

- **Given:** user opens payment form.
- **When:** form loads.
- **Then:** date field pre-filled with today's date in "MMM DD, YYYY" format.

### Scenario 2: Select past payment date

**Type:** Positive
**Priority:** High

- **Given:** user recording payment received yesterday.
- **When:** selects yesterday's date.
- **Then:** payment recorded with that date, reflected in history.

### Scenario 3: Future date blocked

**Type:** Negative
**Priority:** Critical

- **Given:** user on payment form.
- **When:** tries to select tomorrow or later.
- **Then:** future dates disabled in picker OR validation error "Payment date cannot be in the future".

### Scenario 4: Warning for date before issue date

**Type:** Boundary
**Priority:** High

- **Given:** invoice issued on Feb 01, 2026.
- **When:** user selects Jan 15, 2026 as payment date.
- **Then:** warning "Payment date is before the invoice issue date" shown but submit allowed.

### Scenario 5: Date = issue date exactly (no warning)

**Type:** Boundary
**Priority:** Medium

- **Given:** invoice issued on Feb 01, 2026.
- **When:** user selects Feb 01, 2026 as payment date.
- **Then:** no warning shown. Valid date.

### Scenario 6: Required field validation

**Type:** Negative
**Priority:** Critical

- **Given:** payment form with date cleared.
- **When:** user submits.
- **Then:** error "Payment date is required".

### Scenario 7: Calendar picker UX

**Type:** Positive
**Priority:** Medium

- **Given:** user clicks date field.
- **When:** calendar opens.
- **Then:** today highlighted, month navigation available, future dates disabled.

### Scenario 8: Date displayed in invoice details

**Type:** Positive
**Priority:** High

- **Given:** payment recorded with date Feb 28, 2026.
- **When:** user views invoice details.
- **Then:** shows "Feb 28, 2026" in payment section.

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 8

- Positive: 3
- Negative: 2
- Boundary: 2
- Integration: 0
- API: 1

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Group 1: Date validation matrix**

| Payment Date | Invoice Issue Date | Expected |
| --- | --- | --- |
| Today | Feb 01 | ✅ Valid, no warning |
| Yesterday | Feb 01 | ✅ Valid, no warning |
| Tomorrow | Feb 01 | ❌ Blocked/error |
| Jan 15 | Feb 01 | ✅ Valid + warning |
| Feb 01 | Feb 01 | ✅ Valid, no warning |
| (empty) | Feb 01 | ❌ Required error |

### Test Outlines

#### Validar prefill de fecha de pago con dia actual

- **Type:** Positive | **Priority:** Critical | **Level:** UI

#### Validar seleccion de fecha pasada valida

- **Type:** Positive | **Priority:** High | **Level:** UI + API

#### Validar bloqueo de fechas futuras

- **Type:** Negative | **Priority:** Critical | **Level:** UI + API
- **Parametrized:** ✅ Yes (Group 1)

#### Validar warning para fecha anterior a issue date

- **Type:** Boundary | **Priority:** High | **Level:** UI

#### Validar fecha = issue date sin warning

- **Type:** Boundary | **Priority:** Medium | **Level:** UI

#### Validar campo requerido — submit sin fecha

- **Type:** Negative | **Priority:** Critical | **Level:** UI

#### Validar fecha visible en detalle de factura

- **Type:** Positive | **Priority:** High | **Level:** UI

#### Validar API contract del campo payment_date

- **Type:** API Contract | **Priority:** High | **Level:** API

---

## Edge Cases Summary

| Edge Case | Covered in Story | Added Here | Priority |
| --- | --- | --- | --- |
| Date = issue date (no warning) | ❌ No | ✅ Yes (Scenario 5) | Medium |
| Date = tomorrow (boundary) | ✅ Yes | Refined | Critical |
| Very old date | ❌ No | Noted (no limit) | Low |

---

## Critical Questions for PO/Dev

1. **Warning for pre-issue date: informative only?** Proposed: Yes, consistent with SQ-55 warnings.
2. **Timezone for "today"?** Proposed: User's timezone (overrides story scope note).
3. **Date format?** Proposed: "MMM DD, YYYY" (e.g., "Mar 31, 2026").

---

## Next Steps

1. PO validates warning behavior and date format.
2. Dev implements with calendar picker and validations.
3. QA executes with emphasis on date boundaries.

---

_Archivo generado para Fase 5 (Shift-Left Testing)._
_Last sync mirror: 2026-03-31_
