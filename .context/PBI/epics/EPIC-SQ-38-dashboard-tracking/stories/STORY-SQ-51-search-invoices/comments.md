# Comments for SQ-51

[View in Jira](https://upexgalaxy67.atlassian.net/browse/SQ-51)

---

### Fernando Javier Masci - 2026-03-25T03:17:15.235Z

Shift Left

- ACs tiene los bullets un poco raros. Corregir

Scenario 1: Search box visible

- ***Given:*** I am on the dashboard
- ***When:*** I look at the header
- ***Then:*** I see a search box
  - Notas: Hay un solo tipo de usuario en cuanto a permisos de visibildad?

Scenario 2: Search by invoice number

- ***Given:*** I type an invoice number (e.g., "INV-2026-0042")
- ***When:*** I submit the search
- ***Then:*** I see invoices matching that number
  - Notas: Hay reglas de validacion de formato de invoice number? Probar valores invalidos

Scenario 3: Search by client name

- ***Given:*** I type a client's name
- ***When:*** I submit the search
- ***Then:*** I see all invoices for that client
  - Notas: El campo de busqueda admite **Búsqueda difusa (Fuzzy Search / Fuzzy Matching)**?

Scenario 4: Partial match

- ***Given:*** I type partial text (e.g., "John")
- ***When:*** I search
- ***Then:*** I see results that contain the search term
  - Probar cantidad de resultados, validar que los muestre todos.

Scenario 5: No results

- ***Given:*** I search for something that doesn't exist
- ***When:*** I view the results
- ***Then:*** I see a "No results found" message
  - Notas: Relacionado al Fuzzy Matching, probar valores limites, o hasta donde admite “fuzzy”

Scenario 6: Clear search

- ***Given:*** I have an active search
- ***When:*** I clear the search box
- ***Then:*** I see all invoices again
  - Notas: Antes de borrar el search box también mostraba todos los invoices?

---

### Fernando Javier Masci - 2026-03-28T21:11:39.399Z

## Table Summary

| **Item** | **Details** |
| --- | --- |
| Objective | Validate invoice search from the dashboard with focus on UX, correctness, performance, and data consistency. |
| In Scope | Search box visibility, fixed header behavior, invoice_number, client.name/client.email, partial/case-insensitive match, 300ms debounce, no-results, clear search, `?search={query`}. |
| Out of Scope | Advanced search syntax, search by amount, search by date range, saved searches, full-text indexing. |
| Key Risks | Ambiguous search trigger (live vs submit), precedence with filters/pagination, invalid input handling, large dataset performance. |
| Test Types | UI, API, DB, UX, performance-functional checks. |
| Open Questions | Live vs submit, exact searchable fields, debounce threshold, precedence with filters/pagination. |
| Dev SP | 8 |
| QA SP | 5 |

## Objective

Validate invoice search from the dashboard with focus on UX, correctness, performance, and data consistency.

## Scope

- Search box visibility on dashboard load
- Fixed vs modal/popup behavior
- Search by invoice number and client name
- Case-insensitive and partial matches
- Search while typing vs search on submit
- Clear search and return to default list
- Empty state and no-results state

## Non-Functional Coverage

- Search response time for small and large datasets
- Debounce timing while typing
- Fast repeated submit actions
- Behavior under slow network or delayed API responses
- Database query correctness and filtering consistency

## Test Dimensions

- UI: visibility, placement, accessibility, focus behavior
- API: query param handling, search results, empty results
- DB: invoice_number and client joins, match accuracy
- UX: loading state, no-results message, clear action

## Suggested Scenarios

- Search box is visible when entering the dashboard
- Search box is fixed in the header and not rendered as a popup
- Typing a client name returns matching invoices after debounce
- Clicking submit returns the same result set as typed search
- Invalid invoice-number formats are handled consistently
- Partial matches return expected results
- Clearing the field restores the full invoice list
- Slow responses show a loading state without duplicate requests
- Results remain consistent with the backend query and database data

## Open Questions

- Is the search triggered live, on submit, or both?
- Which fields are searchable exactly?
- What is the expected timeout or debounce threshold?

---

### Fernando Javier Masci - 2026-03-29T04:50:18.068Z

Acceptance Test Plan (Shift-Left) - Local Mirror actualizado.

Este comentario contiene el ATP completo y las preguntas criticas pendientes para PO/Dev.

```
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
```

Action required: responder preguntas criticas para cerrar el ATP y habilitar implementacion.

---

### Fernando Javier Masci - 2026-03-29T04:51:12.143Z

**Proposed defaults for open questions (SQ-51)**

Propuesta de cierre para desbloquear implementacion. Requiere confirmacion PO/Dev.

- Search trigger: live search con debounce de 300ms y soporte Enter opcional.
- Campos buscables: invoice_number, client.name, client.email (case-insensitive, partial).
- Precedencia: mantener filtro de estado activo y resetear paginacion a pagina 1 al cambiar query.
- Normalizacion: aplicar trim al query y tratar query vacia como clear search.
- No-results: mensaje dedicado y separado de empty-state inicial.

Estado: pendiente confirmacion final del equipo.

---

### Automation for Jira - 2026-04-01T05:20:54.977Z

🔎 Pull Request created. Task is pending to ANALYZE and REVIEW by the team. Waiting for PR Approval.

---

### Automation for Jira - 2026-04-01T05:21:09.251Z

✅ Pull Request is successfully MERGED. Task is Done.

---

### Fernando Javier Masci - 2026-04-03T02:02:35.257Z

QA execution update: [https://upexgalaxy67.atlassian.net/browse/SQ-51#icft=SQ-51](https://upexgalaxy67.atlassian.net/browse/SQ-51#icft=SQ-51) promoted as active non-blocked stream while [https://upexgalaxy67.atlassian.net/browse/SQ-55#icft=SQ-55](https://upexgalaxy67.atlassian.net/browse/SQ-55#icft=SQ-55) remains blocked by staging precondition.

Next actions in progress: smoke check for search path and exploratory decision matrix focused on trigger behavior, filter and pagination precedence, query normalization, and no-results versus empty-state behavior.

Evidence package will include UI behavior, network request patterns, and consistency notes for PO/TL decision points.

---

### Fernando Javier Masci - 2026-04-03T02:28:15.080Z

[https://upexgalaxy67.atlassian.net/browse/SQ-51#icft=SQ-51](https://upexgalaxy67.atlassian.net/browse/SQ-51#icft=SQ-51) smoke execution update in staging: PASSED for go/no-go, with one important functional finding.

Smoke checks passed: login, invoices access, search input visibility, exact/partial query, clear search restore, API responses 200, no console errors.

Validated queries: INV-2026-20354, test client, POSTMAN.

Important finding: no-results query (zzzz-not-found) shows empty-account style copy (No tienes facturas aun) instead of differentiated no-results behavior.

This appears to conflict with expected no-results versus empty-state separation and should be triaged in exploratory as potential bug.

Network evidence: GET /api/invoices?search=... requests returned 200 for tested queries.

---

### Fernando Javier Masci - 2026-04-03T02:34:35.127Z

[https://upexgalaxy67.atlassian.net/browse/SQ-51#icft=SQ-51](https://upexgalaxy67.atlassian.net/browse/SQ-51#icft=SQ-51) exploratory update (staging): partial pass with one defect candidate.

PASS: search trigger works without submit (live behavior observed), filter plus pagination precedence is consistent (search keeps status filter and resets page to 1), query normalization is effective (spaced query still matches expected invoice).

BUG candidate: no-results vs empty-state is not differentiated. Query zzzz-not-found shows 0 facturas encontradas but heading renders No tienes facturas aun (first-use empty-account style).

Evidence: GET /api/invoices?search=INV-2026-20354 -> 200, search=test+client -> 200, search=POSTMAN -> 200, search=zzzz-not-found -> 200, status=sent&search=test+client&page=1 -> 200.

Recommendation: track this as UX/functional bug linked to [https://upexgalaxy67.atlassian.net/browse/SQ-51#icft=SQ-51](https://upexgalaxy67.atlassian.net/browse/SQ-51#icft=SQ-51) and retest after fix.

---

### Fernando Javier Masci - 2026-04-03T02:38:30.423Z

[https://upexgalaxy67.atlassian.net/browse/SQ-51#icft=SQ-51](https://upexgalaxy67.atlassian.net/browse/SQ-51#icft=SQ-51) reconciliation update (manual report vs MCP smoke):

Scenario 1: PASS with clarification. Search box is currently exposed in /invoices (not dashboard header).

Scenarios 2, 3, 4, 6: PASS (invoice number, client name, partial match, clear search).

Scenario 5: functional pass (0 results returned) but UX discrepancy remains: no-results path still shows empty-account style heading.

Disposition: smoke remains PASSED; keep exploratory bug candidate open for no-results vs empty-state separation.

---

### Fernando Javier Masci - 2026-04-03T02:40:20.727Z

QA follow-up: bug created for [https://upexgalaxy67.atlassian.net/browse/SQ-51#icft=SQ-51](https://upexgalaxy67.atlassian.net/browse/SQ-51#icft=SQ-51) no-results vs empty-state discrepancy.

Bug key: [https://upexgalaxy67.atlassian.net/browse/SQ-169#icft=SQ-169](https://upexgalaxy67.atlassian.net/browse/SQ-169#icft=SQ-169)

Link type: Relates

Scope: search query with zero matches shows empty-account style heading instead of differentiated no-results state.

Next step: prioritize fix and retest [https://upexgalaxy67.atlassian.net/browse/SQ-51#icft=SQ-51](https://upexgalaxy67.atlassian.net/browse/SQ-51#icft=SQ-51) acceptance criterion for no-results behavior.

---

### Fernando Javier Masci - 2026-04-03T03:05:02.316Z

QA workflow update: status transitioned from Ready For QA to In Test.

Reason: smoke and exploratory execution are actively in progress.

Current transitions available from In Test: QA Approved, Ready For QA, BLOCKED.

---

### Fernando Javier Masci - 2026-04-12T05:10:06.648Z

@@Ely 

QA update 2026-04-12. Trifuerza completed in this session: 

- UI Playwright plus API manual plus DB read-only SQL. UI confirms no-results copy discrepancy linked to [https://upexgalaxy67.atlassian.net/browse/SQ-169#icft=SQ-169](https://upexgalaxy67.atlassian.net/browse/SQ-169#icft=SQ-169).
- API and DB passed with no new defects.
- Recommendation: keep In Test until [https://upexgalaxy67.atlassian.net/browse/SQ-169#icft=SQ-169](https://upexgalaxy67.atlassian.net/browse/SQ-169#icft=SQ-169) fix and retest.

API Testing results (Postman run 2026-04-22):

- SQ-51: all API requests returned expected HTTP status; one assertion failed only due to dataset dependency (search_invoice_partial had no matching seeded invoice in the current dataset).

---


_Synced from Jira by jira-sync_
_Last sync: 2026-04-22T05:00:15.864Z_
