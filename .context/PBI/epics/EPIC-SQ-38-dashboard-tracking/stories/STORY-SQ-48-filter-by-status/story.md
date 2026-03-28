# As a user, I want to filter invoices by status (draft, sent, paid, overdue) so that I can find the ones I need

**Jira Key:** [SQ-48](https://upexgalaxy65.atlassian.net/browse/SQ-48)
**Epic:** [SQ-38](https://upexgalaxy65.atlassian.net/browse/SQ-38) (Invoice Dashboard & Tracking)
**Priority:** Medium
**Story Points:** 3
**Status:** Ready For Dev

---

## User Story

As a user, I want to filter invoices by status (draft, sent, paid, overdue), so that I can find the ones I need. Story Points: 2

---

## 🧪 QA Refinements (Shift-Left Analysis)

**Analysis Date:** 2026-03-16

**Status:** Refined by QA

### Refined Acceptance Criteria

1. **Tabs visibles y estado por defecto**

   - **Given** el usuario autenticado está en `/(app)/dashboard` con al menos 1 factura

   - **When** carga la vista de listado

   - **Then** ve tabs `All`, `Draft`, `Sent`, `Paid`, `Overdue`

   - **And** `All` está seleccionado por defecto

   - **And** la URL refleja el estado (`status=all` o sin parámetro según implementación final)

1. **Filtro Draft**

   - **Given** existen facturas en múltiples estados

   - **When** el usuario selecciona `Draft`

   - **Then** solo se muestran facturas con `status = draft`

   - **And** el contador de `Draft` coincide con el número de filas listadas

1. **Filtro Sent**

   - **Given** existen facturas `sent` y `paid`

   - **When** el usuario selecciona `Sent`

   - **Then** solo se muestran facturas con `status = sent`

   - **And** no se muestran `paid` ni `draft`

1. **Filtro Paid**

   - **Given** existen facturas `paid`

   - **When** el usuario selecciona `Paid`

   - **Then** solo se muestran facturas con `status = paid`

1. **Filtro Overdue (regla derivada)**

   - **Given** existen facturas `sent` con `due_date` pasada y no pagadas

   - **When** el usuario selecciona `Overdue`

   - **Then** solo se muestran facturas con regla `status = sent AND due_date < today`

   - **And** ninguna factura `paid` aparece en `Overdue`

1. **Contadores por tab**

   - **Given** el usuario visualiza la barra de filtros

   - **When** revisa los badges de cada tab

   - **Then** cada tab muestra un conteo correcto para su estado

   - **And** el conteo de `All` coincide con el total de facturas visibles para el usuario

1. **Persistencia de estado en URL**

   - **Given** el usuario tiene seleccionado un filtro (ej. `paid`)

   - **When** recarga la página o comparte/abre la URL

   - **Then** el filtro se conserva

   - **And** la lista se renderiza directamente en ese estado

1. **Estado vacío por filtro**

   - **Given** un filtro no tiene coincidencias (ej. sin facturas `draft`)

   - **When** el usuario entra a ese tab

   - **Then** se muestra estado de “sin resultados” claro y sin errores

### Edge Cases Identified

- **Boundary de fecha:** factura con `due_date = today` no debe aparecer en `Overdue`; con `due_date = yesterday` sí debe aparecer.
- **Concurrencia UI:** al cambiar rápidamente entre tabs, el resultado final debe corresponder al último tab seleccionado (sin race conditions visibles).
- **Dataset vacío total vs vacío por filtro:** diferenciar visualmente “no hay facturas” de “no hay facturas para este estado”.
- **Consistencia contador/lista:** el badge del tab activo debe ser consistente con la cantidad de filas renderizadas.

### Clarified Business Rules

- `Overdue` es un estado **derivado de consulta**, no un enum persistente nuevo para esta story.
- `Cancelled` queda explícitamente fuera de alcance para SQ-48.
- La semántica de `pending` para dashboard no aplica como tab en esta story; los tabs válidos son los del AC original.
- Se requiere soporte por query param `status` en API y persistencia en URL en frontend para trazabilidad de filtros.

---

## Acceptance Criteria

1.
  1.
    1. Scenario 1: Filter tabs visible

- ***Given:*** I am on the dashboard
- ***When:*** I view the filter options
- ***Then:*** I see tabs for: All, Draft, Sent, Paid, Overdue

1.
  1.
    1. Scenario 2: Filter by draft

- ***Given:*** I click "Draft" filter
- ***When:*** The list updates
- ***Then:*** I only see invoices with status "draft"

1.
  1.
    1. Scenario 3: Filter by sent

- ***Given:*** I click "Sent" filter
- ***When:*** The list updates
- ***Then:*** I only see invoices with status "sent"

1.
  1.
    1. Scenario 4: Filter by paid

- ***Given:*** I click "Paid" filter
- ***When:*** The list updates
- ***Then:*** I only see invoices with status "paid"

1.
  1.
    1. Scenario 5: Filter by overdue

- ***Given:*** I click "Overdue" filter
- ***When:*** The list updates
- ***Then:*** I only see invoices past due date and unpaid

1.
  1.
    1. Scenario 6: Count badges on tabs

- ***Given:*** I view the filter tabs
- ***When:*** I look at each tab
- ***Then:*** I see a count of invoices in each status

---

## Scope

1.
  1.
    1. In Scope

- Filter tabs: All, Draft, Sent, Paid, Overdue
- Filter logic for each status
- Overdue detection: status='sent' AND due_date < today
- Count badges on each tab
- URL state persistence for filters
- API query parameter support

1.
  1.
    1. Out of Scope

- Date range filters
- Client filters
- Amount range filters
- Custom saved filters
- Cancelled status filter

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 2026-01-21T01:09:30.154Z
- **Updated:** 2026-03-16T13:25:49.450Z
- **Reporter:** Ely
- **Assignee:** Ely
- **Labels:** shift-left-reviewed, test-plan-ready

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-28T23:41:49.192Z_
