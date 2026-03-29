# Acceptance Test Plan: STORY-SQ-51 - Search Invoices

**Fecha:** 2026-03-29
**QA Engineer:** AI-Generated
**Story Jira Key:** [SQ-51](https://upexgalaxy65.atlassian.net/browse/SQ-51)
**Epic:** [SQ-38](https://upexgalaxy65.atlassian.net/browse/SQ-38) - Invoice Dashboard & Tracking
**Status:** Draft - Pending PO/Dev Clarification

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Disenador Organizado) - necesita encontrar facturas rapido para gestionar cobros.
- **Secondary:** Andres (Consultor Tradicional) - usa busqueda para operar con volumen sin friccion.

**Business Value:**

- Reduce tiempo operativo en seguimiento de facturas.
- Mejora adopcion del dashboard al permitir encontrar resultados en segundos.

**Related User Journey:**

- Journey 2 - Seguimiento y Cobro de Factura (paso de localizacion y accion sobre factura).

### Technical Context of This Story

**Frontend:**

- Search input en encabezado del dashboard/listado.
- Estado de `query`, debounce 300ms, estado `no-results` y clear action.

**Backend:**

- `GET /api/invoices?search={query}`
- Interaccion con filtros de status y paginacion del listado.

**Database:**

- Busqueda por `invoice_number`, `clients.name`, `clients.email`.
- Matching parcial, case-insensitive.

### Epic-Level Context (from EPIC-SQ-38 FTP)

- Riesgos heredados: combinacion filtro + search + paginacion; diferencia empty-state vs no-results.
- Integration point heredado: Dashboard UI <-> `GET /api/invoices`.
- Estrategia heredada: cobertura UI + API + DB + checks funcionales de performance.

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: Search trigger (live vs submit).**

- **Question for PO/Dev:** la busqueda se ejecuta al escribir (debounced) o solo al submit/enter?
- **Impact on Testing:** cambia el flujo E2E y criterios de usabilidad.

**Ambiguity 2: Precedencia con filtros y paginacion.**

- **Question for PO/Dev:** al aplicar busqueda, se resetea pagina a 1? el filtro vigente se mantiene?
- **Impact on Testing:** sin regla clara se generan resultados inconsistentes entre UI y API.

**Ambiguity 3: Campos buscables exactos.**

- **Question for PO/Dev:** confirmar que son solo `invoice_number`, `client.name`, `client.email`.
- **Impact on Testing:** define datasets, contract tests y casos negativos.

### Missing Information / Gaps

- Falta copy final para no-results y reglas de i18n.
- Falta max-length/normalizacion del query (`trim`, espacios duplicados).
- Falta criterio de performance esperado para datasets medianos/altos.

### Edge Cases NOT Covered in Original Story

- Query vacia o solo espacios.
- Query con caracteres especiales (`INV-2026-0042/1`, `john+test`).
- Cambio rapido de query (race condition de respuestas viejas).
- Query valida sin coincidencias con filtro activo pero con coincidencias globales.

### Testability Validation

**Is this story testable as written?** ⚠️ Partially

**Recommendations:** cerrar trigger de busqueda, precedencia con filtros/paginacion y normalizacion de query antes de implementar.

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Search input visible and usable

**Type:** Positive
**Priority:** Critical

- **Given:** usuario autenticado en dashboard con listado de facturas.
- **When:** visualiza el header principal.
- **Then:** ve un campo de busqueda con placeholder claro y accion de clear disponible cuando hay texto.

### Scenario 2: Search by invoice number (exact and partial)

**Type:** Positive
**Priority:** Critical

- **Given:** existe factura `INV-2026-0042`.
- **When:** usuario busca `INV-2026-0042` o `0042`.
- **Then:** el listado muestra resultados que contienen el valor buscado.

### Scenario 3: Search by client name or email

**Type:** Positive
**Priority:** High

- **Given:** existe cliente `John Rivera` con email `john@acme.com`.
- **When:** usuario busca `john` o `acme.com`.
- **Then:** aparecen facturas relacionadas al cliente por nombre o email.

### Scenario 4: No results state

**Type:** Negative
**Priority:** High

- **Given:** hay facturas en el sistema.
- **When:** usuario busca `zzzz-not-found`.
- **Then:** se muestra estado de no resultados y no se confunde con empty state de cuenta nueva.

### Scenario 5: Clear search restores list

**Type:** Positive
**Priority:** High

- **Given:** hay busqueda activa con resultados filtrados.
- **When:** usuario limpia el campo (clear o borrado completo).
- **Then:** vuelve el listado completo respetando filtros activos definidos por producto.

### Scenario 6: Debounced live search

**Type:** Boundary
**Priority:** High

- **Given:** usuario escribe en el input.
- **When:** deja de escribir por >= 300ms.
- **Then:** se dispara una unica busqueda para el ultimo valor ingresado.
- **Note:** confirmar con PO/Dev si tambien se permite submit con Enter.

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 12

- Positive: 5
- Negative: 3
- Boundary: 2
- Integration: 1
- API: 1

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Group 1: Query variations**

| Query | Dataset | Expected Result |
| --- | --- | --- |
| `INV-2026-0042` | invoice_number exact | 1+ matching invoice |
| `0042` | invoice_number partial | includes target invoice |
| `john` | client.name partial | all invoices from John |
| `ACME.COM` | client.email case-insensitive | all invoices from that domain |

### Test Outlines

#### Validar busqueda por numero con coincidencia exacta y parcial

- **Type:** Positive
- **Priority:** Critical
- **Level:** UI + API
- **Expected:** resultados correctos y consistentes en UI/API.

#### Validar busqueda por cliente (nombre y email) sin sensibilidad a mayusculas

- **Type:** Positive
- **Priority:** High
- **Level:** UI + API
- **Expected:** coincidencias correctas para nombre/email en distintos formatos.

#### Validar estado de no resultados sin mezclarlo con empty state

- **Type:** Negative
- **Priority:** High
- **Level:** UI
- **Expected:** mensaje "No results found" y CTA de limpieza.

#### Validar clear search y restauracion de listado

- **Type:** Positive
- **Priority:** High
- **Level:** UI
- **Expected:** listado vuelve a estado base definido.

#### Validar debounce de 300ms en tipeo rapido

- **Type:** Boundary
- **Priority:** High
- **Level:** Integration
- **Expected:** una sola consulta efectiva por ultimo valor.

---

## Integration Test Cases

### Integration 1: Search + status filter + pagination

- **Integration Point:** Dashboard filters <-> `GET /api/invoices`
- **Flow:** aplicar filtro `sent`, navegar a pagina 2, buscar por query.
- **Expected:** reglas de precedencia consistentes (definir con PO/Dev si pagina se resetea a 1).

---

## Edge Cases Summary

| Edge Case | Covered in Story | Added Here | Priority |
| --- | --- | --- | --- |
| Query con espacios | No | Yes | Medium |
| Race condition por tipeo rapido | No | Yes | High |
| Query especial (`+`, `/`) | No | Yes | Medium |
| Filtro activo sin resultados | Partial | Yes | High |

---

## Critical Questions for PO/Dev

1. La busqueda es live debounced, submit-only, o ambas?
2. Al buscar, se conserva filtro y se resetea pagina a 1?
3. Se aplica `trim` automatico al query?
4. Mensaje final y comportamiento de no-results vs empty-state?

---

## Next Steps

1. PO/Dev responden preguntas criticas.
2. QA actualiza este ATP con las reglas cerradas.
3. Dev implementa con AC refinados.
4. QA ejecuta casos y reporta coverage final.

---

_Archivo generado para Fase 5 (Shift-Left Testing)._
