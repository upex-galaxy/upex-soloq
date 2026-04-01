# Acceptance Test Plan: STORY-SQ-54 - Payment Method

**Fecha:** 2026-03-31
**QA Engineer:** AI-Generated
**Story Jira Key:** [SQ-54](https://upexgalaxy65.atlassian.net/browse/SQ-54)
**Epic:** [SQ-39](https://upexgalaxy65.atlassian.net/browse/SQ-39) - Payment Tracking
**Status:** Draft - Pending PO/Dev Review

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Disenador Organizado) - quiere registro detallado de como le pagan cada cliente.
- **Secondary:** Andres (Consultor Tradicional) - necesita opciones simples de metodo de pago.

**Business Value:**

- Mejora trazabilidad de ingresos al registrar como se recibio el pago.
- Facilita conciliacion bancaria del freelancer.

**Related User Journey:**

- Journey 2: Seguimiento y Cobro de Factura (campo del registro de pago).

### Technical Context of This Story

**Frontend:**

- Dropdown selector en payment form/modal.
- Opciones: Bank Transfer, PayPal, MercadoPago, Cash, Other.
- User's configured methods shown first.

**Backend:**

- Campo `payment_method` en `POST /api/invoices/{invoiceId}/payments`.
- Enum: `bank_transfer`, `paypal`, `mercado_pago`, `cash`, `other`.

**Database:**

- `payments.payment_method` (enum type `payment_method_type`).
- `business_profiles.payment_methods` para metodos configurados del usuario.

### Story Complexity Analysis

**Overall Complexity:** Medium

- Business logic: Low — seleccion de enum.
- Integration: Medium — depende de SQ-53 (payment form) y business_profiles.
- UI: Medium — dropdown con ordering de configured methods.

### Epic-Level Context (from EPIC-SQ-39 FTP)

- Inherited risk: Formato inconsistente entre UI y API.
- Test strategy: UI + API contract validation.

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: "Configured methods appear first" — source of configuration.**

- **Location in Story:** AC 3 / Scope.
- **PO/Dev Decision (proposed):** Configured methods come from `business_profiles.payment_methods` array. If user has configured `['paypal', 'bank_transfer']`, those appear first in dropdown, then remaining options.

**Ambiguity 2: What if user has no configured methods?**

- **PO/Dev Decision (proposed):** Show all 5 options in default order: Bank Transfer, PayPal, MercadoPago, Cash, Other.

**Ambiguity 3: Is payment_method truly optional?**

- **Location in Story:** Scope says "Optional field (can save without selecting)".
- **PO/Dev Decision (proposed):** Yes, optional. If not selected, `payment_method` is NULL in DB. Field shows placeholder "Select method (optional)".

### Edge Cases NOT Covered

- User selects method, then deselects (clears to null).
- Dropdown display names vs DB enum values mapping.
- Method display in payment history after recording.

### Testability Validation

**Is this story testable as written?** ✅ Yes — mostly clear with minor clarifications.

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Payment method dropdown available

**Type:** Positive
**Priority:** High

- **Given:** payment form open for a sent invoice.
- **When:** user sees the form.
- **Then:** dropdown with 5 payment method options is visible.

### Scenario 2: All method options displayed

**Type:** Positive
**Priority:** High

- **Given:** user opens payment method dropdown.
- **When:** views options.
- **Then:** sees: Bank Transfer, PayPal, MercadoPago, Cash, Other.

### Scenario 3: Configured methods appear first

**Type:** Positive
**Priority:** Medium

- **Given:** user has configured `['paypal', 'mercado_pago']` in business profile.
- **When:** opens dropdown.
- **Then:** PayPal and MercadoPago appear first, then remaining options.

### Scenario 4: Method stored in payment record

**Type:** Positive
**Priority:** Critical

- **Given:** user selects "Bank Transfer" and submits payment.
- **When:** payment is saved.
- **Then:** `payments.payment_method = 'bank_transfer'` in DB.

### Scenario 5: Method visible in payment history

**Type:** Positive
**Priority:** High

- **Given:** payment recorded with method "PayPal".
- **When:** user views invoice details.
- **Then:** payment section shows "PayPal" as method.

### Scenario 6: Optional — submit without selecting method

**Type:** Boundary
**Priority:** Medium

- **Given:** payment form with amount filled but no method selected.
- **When:** user submits.
- **Then:** payment is saved successfully with `payment_method = NULL`.

### Scenario 7: Default dropdown order (no configured methods)

**Type:** Boundary
**Priority:** Medium

- **Given:** user has no configured payment methods in business profile.
- **When:** opens dropdown.
- **Then:** shows all 5 options in default order.

### Scenario 8: API validation — invalid method value

**Type:** Negative
**Priority:** High

- **Given:** API request with `payment_method: 'crypto'` (invalid).
- **When:** POST to payments endpoint.
- **Then:** 400 Bad Request with validation error.

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 8

- Positive: 3
- Negative: 1
- Boundary: 2
- Integration: 1
- API: 1

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Group 1: Method values**

| Display Name | DB Value | Valid |
| --- | --- | --- |
| Bank Transfer | bank_transfer | ✅ |
| PayPal | paypal | ✅ |
| MercadoPago | mercado_pago | ✅ |
| Cash | cash | ✅ |
| Other | other | ✅ |
| Crypto | crypto | ❌ |
| (empty) | NULL | ✅ (optional) |

### Test Outlines

#### Validar dropdown con las 5 opciones de metodo de pago

- **Type:** Positive | **Priority:** High | **Level:** UI

#### Validar metodos configurados aparecen primero en dropdown

- **Type:** Positive | **Priority:** Medium | **Level:** UI

#### Validar persistencia del metodo seleccionado en DB

- **Type:** Positive | **Priority:** Critical | **Level:** API + DB
- **Parametrized:** ✅ Yes (Group 1)

#### Validar metodo visible en historial de pago

- **Type:** Integration | **Priority:** High | **Level:** UI

#### Validar submit sin seleccionar metodo (optional field)

- **Type:** Boundary | **Priority:** Medium | **Level:** UI + API

#### Validar dropdown order sin metodos configurados

- **Type:** Boundary | **Priority:** Medium | **Level:** UI

#### Validar rechazo de valor invalido de metodo en API

- **Type:** Negative | **Priority:** High | **Level:** API

#### Validar API contract del campo payment_method

- **Type:** API Contract | **Priority:** High | **Level:** API

---

## Edge Cases Summary

| Edge Case | Covered in Story | Added Here | Priority |
| --- | --- | --- | --- |
| No configured methods | ❌ No | ✅ Yes (Scenario 7) | Medium |
| Submit without method | ✅ Yes (Scope) | Refined | Medium |
| Invalid API value | ❌ No | ✅ Yes (Scenario 8) | High |
| Display name vs DB enum | ❌ No | ✅ Yes (Group 1) | Medium |

---

## Critical Questions for PO/Dev

1. **Configured methods source?** Proposed: `business_profiles.payment_methods` array.
2. **Default order when no config?** Proposed: Bank Transfer, PayPal, MercadoPago, Cash, Other.
3. **Placeholder text?** Proposed: "Select method (optional)".

---

## Next Steps

1. PO validates method list and ordering rules.
2. Dev implements dropdown with configured methods priority.
3. QA validates all method values persist correctly.

---

_Archivo generado para Fase 5 (Shift-Left Testing)._
_Last sync mirror: 2026-03-31_
