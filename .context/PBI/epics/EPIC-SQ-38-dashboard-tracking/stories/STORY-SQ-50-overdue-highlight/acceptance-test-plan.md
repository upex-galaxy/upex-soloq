# Acceptance Test Plan: STORY-SQ-50 - Overdue Highlight

**Fecha:** 2026-03-31
**QA Engineer:** AI-Generated
**Story Jira Key:** [SQ-50](https://upexgalaxy65.atlassian.net/browse/SQ-50)
**Epic:** [SQ-38](https://upexgalaxy65.atlassian.net/browse/SQ-38) - Invoice Dashboard & Tracking
**Status:** Draft - Pending PO/Dev Review

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Valentina (Desarrolladora Internacional) - identifica vencidas con urgencia para mejorar cash flow.
- **Secondary:** Carlos (Disenador Organizado) - prioriza seguimiento entre multiples clientes.

**Business Value:**

- Reduce tiempo de identificacion de facturas vencidas de minutos a segundos.
- Impulsa acciones de cobranza proactivas, reduciendo dias de cobro promedio.

**Related User Journey:**

- Journey 2: Seguimiento y Cobro de Factura (priorizacion de facturas vencidas).

### Technical Context of This Story

**Frontend:**

- Badge "Overdue" con estilo rojo reemplazando badge "Sent".
- Display de dias vencidos (e.g., "7 days overdue").
- Alert banner/count en dashboard.
- Highlight visual de fila (background rojo/naranja).
- Sort by urgency option.

**Backend:**

- Deteccion overdue: `status = 'sent' AND due_date < CURRENT_DATE` (usando timezone del usuario).
- Calculo de dias vencidos: `CURRENT_DATE - due_date`.
- `GET /api/invoices?sortBy=urgency` para ordenar overdue primero.
- `GET /api/invoices/dashboard` para count de overdue.

**Database:**

- Tabla `invoices`: columnas `status`, `due_date`, `total`.
- No hay cambio de status automatico a 'overdue' en DB (es calculo derivado).

**Integration Points:**

- Dashboard alert count <-> `GET /api/invoices/dashboard` (overdue count).
- Invoice list row styling <-> `GET /api/invoices` (overdue flag por invoice).
- Overdue detection depende de timezone del usuario.

### Story Complexity Analysis

**Overall Complexity:** Medium

- Business logic complexity: Medium — calculo de overdue depende de timezone y dias.
- Integration complexity: Medium — afecta listado, dashboard y badges.
- Data validation complexity: Medium — boundary de due_date = hoy.
- UI complexity: Medium — badge, row highlight, alert banner, sort.

**Estimated Test Effort:** Medium
**Rationale:** Multiples puntos de UI afectados y logica de fechas con edge cases de timezone.

### Epic-Level Context (from EPIC-SQ-38 FTP)

**Critical Risks Inherited:**

- Risk: Inconsistencia en logica de overdue (timezone no definida).
  - **Relevance:** Directa — esta story es la que implementa overdue detection.
- Risk: Combinacion filtro + sort + paginacion produce resultados incorrectos.
  - **Relevance:** Sort by urgency se combina con filtros existentes.

**PO Decisions Already Confirmed (precedentes):**

- Timezone: Usar timezone del usuario para calculos de overdue.
- Paginacion: 20 items por pagina, paginacion tradicional.
- Overdue detection: `status='sent' AND due_date < CURRENT_DATE` (no hay status 'overdue' en DB, es derivado).

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: Overdue es status real o derivado?**

- **Location in Story:** AC 2 dice "Overdue badge instead of Sent".
- **Question for PO/Dev:** El status en DB cambia a 'overdue' o se calcula al vuelo?
- **PO/Dev Decision (proposed):** Derivado al vuelo. El DB schema define `invoice_status` enum con 'overdue', pero la deteccion es por calculo (`status='sent' AND due_date < CURRENT_DATE`). El status en DB permanece 'sent'; el frontend/API muestra "Overdue" como derivado. Esto evita cron jobs y race conditions.

**Ambiguity 2: Timezone para calculo de overdue.**

- **Location in Story:** Scope dice "Overdue detection: status='sent' AND due_date < CURRENT_DATE" pero no define timezone.
- **PO/Dev Decision (proposed):** Usar timezone del usuario (confirmado como precedente PO). El backend recibe timezone del cliente o la infiere del perfil.

**Ambiguity 3: Sort by urgency — criterio exacto.**

- **Location in Story:** AC 5 dice "sort by urgency" sin definir orden.
- **PO/Dev Decision (proposed):** Sort by urgency = overdue first (ordenados por dias vencidos desc), luego sent por due_date asc (proximas a vencer primero).

### Missing Information / Gaps

**Gap 1: Formato exacto de dias vencidos.**

- **Suggested Addition:** "1 day overdue", "7 days overdue", "30+ days overdue" (sin truncar).
- **PO/Dev Decision (proposed):** Formato: `N days overdue` donde N = dias desde due_date. Sin limite superior.

**Gap 2: Alert banner — copy y ubicacion.**

- **Suggested Addition:** Banner: "You have N overdue invoices" con link a filtro overdue.
- **PO/Dev Decision (proposed):** Banner en header del dashboard: "N overdue invoice(s)" con CTA para filtrar.

### Edge Cases NOT Covered in Original Story

**Edge Case 1: Invoice con due_date = hoy.**

- **Scenario:** due_date es CURRENT_DATE exactamente.
- **Expected Behavior:** NO es overdue (es el ultimo dia para pagar). Overdue = due_date < today.
- **Criticality:** Critical

**Edge Case 2: Invoice due_date = ayer.**

- **Scenario:** due_date = CURRENT_DATE - 1.
- **Expected Behavior:** Overdue con "1 day overdue".
- **Criticality:** High

**Edge Case 3: Invoice sin due_date.**

- **Scenario:** Factura sent sin due_date asignada.
- **Expected Behavior:** No se marca como overdue (no hay fecha de referencia).
- **Criticality:** Medium

**Edge Case 4: Cambio de dia (midnight transition).**

- **Scenario:** Factura con due_date = hoy, mañana se vuelve overdue.
- **Expected Behavior:** Al recargar dashboard al dia siguiente, aparece como overdue.
- **Criticality:** Medium

### Testability Validation

**Is this story testable as written?** ⚠️ Partially

**Recommendations:** Cerrar si overdue es derivado o status real, y definir timezone antes de implementar.

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Overdue visual indicator on list row

**Type:** Positive
**Priority:** Critical

- **Given:** factura `INV-2026-0042` con status `sent` y `due_date = 2026-03-24` (7 dias vencida).
- **When:** usuario ve el listado de facturas.
- **Then:** la fila tiene highlight visual (background rojo/naranja).
- **And:** badge muestra "Overdue" en lugar de "Sent".

### Scenario 2: Days overdue display

**Type:** Positive
**Priority:** Critical

- **Given:** factura overdue con `due_date = 2026-03-24`, hoy es `2026-03-31`.
- **When:** usuario ve la fila.
- **Then:** muestra "7 days overdue" en la columna correspondiente.

### Scenario 3: Dashboard alert banner

**Type:** Positive
**Priority:** High

- **Given:** usuario con 3 facturas overdue.
- **When:** ve el dashboard.
- **Then:** banner muestra "3 overdue invoices" con accion para filtrar.

### Scenario 4: Sort by urgency — overdue first

**Type:** Positive
**Priority:** High

- **Given:** usuario con facturas sent, overdue y paid.
- **When:** selecciona sort by urgency.
- **Then:** overdue aparecen primero (mayor dias vencidos primero), luego sent por proximidad de vencimiento.

### Scenario 5: Due date = today is NOT overdue

**Type:** Boundary
**Priority:** Critical

- **Given:** factura con `due_date = CURRENT_DATE` y status `sent`.
- **When:** usuario ve el listado.
- **Then:** NO muestra badge "Overdue", muestra "Sent" normal.
- **And:** no se cuenta en overdue alert banner.

### Scenario 6: Due date = yesterday IS overdue

**Type:** Boundary
**Priority:** Critical

- **Given:** factura con `due_date = CURRENT_DATE - 1` y status `sent`.
- **When:** usuario ve el listado.
- **Then:** muestra badge "Overdue" con "1 day overdue".

### Scenario 7: Paid invoices never show as overdue

**Type:** Negative
**Priority:** High

- **Given:** factura con `status = 'paid'` y `due_date` en el pasado.
- **When:** usuario ve el listado.
- **Then:** muestra "Paid", NO "Overdue".

### Scenario 8: Invoice without due_date

**Type:** Boundary
**Priority:** Medium

- **Given:** factura con `status = 'sent'` y `due_date = NULL`.
- **When:** usuario ve el listado.
- **Then:** muestra "Sent" normal, no se marca como overdue.

### Scenario 9: RLS — overdue count isolated per user

**Type:** Negative/Security
**Priority:** Critical

- **Given:** User A tiene 2 overdue; User B tiene 5 overdue.
- **When:** User A ve el dashboard.
- **Then:** alert banner muestra "2 overdue invoices", no 7.

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 11

- Positive: 4
- Negative: 2
- Boundary: 3
- Integration: 1
- API: 1

**Rationale:** Multiples puntos de UI (badge, row, banner, sort) + logica de fechas con boundaries criticos.

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Group 1: Due date offsets and expected overdue status**

| due_date offset | Status in DB | Expected Display | Days Overdue |
| --- | --- | --- | --- |
| today + 5 days | sent | "Sent" (normal) | N/A |
| today | sent | "Sent" (normal) | N/A |
| today - 1 | sent | "Overdue" | "1 day overdue" |
| today - 7 | sent | "Overdue" | "7 days overdue" |
| today - 30 | sent | "Overdue" | "30 days overdue" |
| today - 1 | paid | "Paid" | N/A |

### Test Outlines

#### Validar badge Overdue y highlight visual en fila de factura vencida

- **Type:** Positive | **Priority:** Critical | **Level:** UI + API
- **Parametrized:** ✅ Yes (Group 1)
- **Expected:** Badge "Overdue" rojo + row highlight para facturas con `due_date < today AND status = 'sent'`.

#### Validar calculo y display de dias vencidos

- **Type:** Positive | **Priority:** Critical | **Level:** UI
- **Expected:** "N days overdue" correcto segun diferencia de fechas.

#### Validar alert banner con count de overdue en dashboard

- **Type:** Positive | **Priority:** High | **Level:** UI + API
- **Expected:** "N overdue invoices" coincide con count real de facturas overdue del usuario.

#### Validar sort by urgency ordena overdue primero

- **Type:** Positive | **Priority:** High | **Level:** UI + API
- **Expected:** Overdue (mayor dias primero), luego sent (proximas a vencer primero).

#### Validar que due_date = hoy NO es overdue (boundary)

- **Type:** Boundary | **Priority:** Critical | **Level:** API + UI
- **Expected:** Status "Sent" normal, no en overdue count.

#### Validar que due_date = ayer SI es overdue (boundary)

- **Type:** Boundary | **Priority:** Critical | **Level:** API + UI
- **Expected:** "Overdue" con "1 day overdue".

#### Validar que factura sin due_date no se marca overdue

- **Type:** Boundary | **Priority:** Medium | **Level:** API + UI
- **Expected:** Status "Sent" normal.

#### Validar que facturas paid no se muestran como overdue

- **Type:** Negative | **Priority:** High | **Level:** UI + API
- **Expected:** Badge "Paid", sin highlight overdue.

#### Validar aislamiento RLS del overdue count

- **Type:** Negative/Security | **Priority:** Critical | **Level:** API
- **Expected:** Cada usuario ve solo su propio count de overdue.

#### Validar API de dashboard incluye overdue count

- **Type:** API Contract | **Priority:** High | **Level:** API
- **Expected:** `GET /api/invoices/dashboard` retorna `overdue_count` (number >= 0), status 200.

#### Validar refresh de overdue tras marcar pago

- **Type:** Integration | **Priority:** High | **Level:** E2E
- **Expected:** Tras pagar factura overdue, desaparece de overdue count y pierde highlight.

---

## Integration Test Cases

### Integration 1: Overdue detection + dashboard alert + list highlight

- **Integration Point:** API detection -> Dashboard banner + list row styling.
- **Expected:** Count en banner = cantidad de filas con badge "Overdue" en listado.

### Integration 2: Payment flow -> overdue removal

- **Integration Point:** Payment API -> overdue status refresh.
- **Expected:** Factura pagada ya no aparece como overdue al refrescar.

---

## Edge Cases Summary

| Edge Case | Covered in Story | Added Here | Priority |
| --- | --- | --- | --- |
| due_date = today (boundary) | ❌ No | ✅ Yes (Scenario 5) | Critical |
| due_date = yesterday (boundary) | ❌ No | ✅ Yes (Scenario 6) | Critical |
| Invoice without due_date | ❌ No | ✅ Yes (Scenario 8) | Medium |
| Paid + past due_date | ❌ No | ✅ Yes (Scenario 7) | High |
| RLS isolation of count | ❌ No | ✅ Yes (Scenario 9) | Critical |
| Midnight transition | ❌ No | Noted | Medium |

---

## Critical Questions for PO/Dev

1. **Overdue derivado o status real?** Proposed: Derivado al vuelo, DB mantiene 'sent'.
2. **Timezone para overdue?** Proposed: Timezone del usuario.
3. **Sort by urgency criteria?** Proposed: Overdue (mayor dias desc) > sent (due_date asc).
4. **due_date = today es overdue?** Proposed: No, overdue = `due_date < CURRENT_DATE` (estricto).

---

## Next Steps

1. PO/Dev validan decisiones propuestas.
2. Dev implementa deteccion overdue como derivado.
3. QA ejecuta test cases con enfasis en boundaries de fecha.

---

_Archivo generado para Fase 5 (Shift-Left Testing)._
_Last sync mirror: 2026-03-31_
