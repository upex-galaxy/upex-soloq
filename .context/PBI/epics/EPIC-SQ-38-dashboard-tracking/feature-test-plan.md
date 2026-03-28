# Feature Test Plan: EPIC-SQ-38 - Invoice Dashboard & Tracking

**Fecha:** 2026-03-28
**QA Lead:** Fernando Javier Masci
**Epic Jira Key:** SQ-38
**Status:** Draft

---

## Business Context Analysis

### Business Value

Esta epica habilita el control operativo diario del flujo de cobro para freelancers LATAM. El dashboard reduce friccion en seguimiento de facturas, mejora visibilidad de deuda y acelera priorizacion de acciones de cobranza.

**Key Value Proposition:**
- Ver facturas, estados y montos en un solo lugar.
- Priorizar seguimiento de vencidas y pendientes con menos friccion.

**Success Metrics (KPIs):**
- Mayor uso recurrente del dashboard.
- Menor tiempo para identificar facturas vencidas o pendientes.

**User Impact:**
- Carlos (Disenador Organizado): vista consolidada para no perder seguimiento entre varios clientes.
- Valentina (Desarrolladora Internacional): identifica vencidas y pendientes con urgencia para mejorar cash flow.
- Andres (Consultor Tradicional): obtiene control simple sin reporteria compleja.

**Critical User Journeys:**
- Journey 1: Dashboard inicial para ver estado general.
- Journey 2: Seguimiento y cobro de facturas con foco en vencidas y busqueda puntual.

---

## Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**
- Pagina/ruta de dashboard de facturas en App Router.
- Componentes de listado, filtros, buscador, summary cards, empty state y paginacion.
- Estados UI para loading, no-results, empty-state y overdue highlight.

**Backend:**
- `GET /api/invoices`
- `GET /api/invoices/dashboard`
- Refresco posterior a cambios de pago sobre el dashboard.

**Database:**
- `invoices`
- `clients`
- Agregaciones por estado, fecha de vencimiento y resumen mensual.

**External Services:**
- No hay dependencias externas criticas para esta epica.

### Integration Points (Critical for Testing)

**Internal Integration Points:**
- Frontend dashboard ↔ `GET /api/invoices`
- Frontend summary cards ↔ `GET /api/invoices/dashboard`
- Backend API ↔ PostgreSQL (`invoices`, `clients`) con RLS por usuario
- Dashboard ↔ flujo de pagos para refrescar montos y estados

**Data Flow:**
```text
User -> Dashboard UI -> GET /api/invoices + GET /api/invoices/dashboard -> PostgreSQL
                                 ^
                                 | (status/search/sort/page)
```

---

## Risk Analysis

### Technical Risks

**Risk 1: Inconsistencia en overdue y summary mensual**
- Impact: High
- Likelihood: Medium
- Area Affected: Backend + Integration
- Mitigation:
  - Definir una sola fuente de verdad para overdue y periodo mensual.
  - Validar fechas limite y timezone.
- Test Coverage Required: API + DB con datos borde.

**Risk 2: Combinacion de filtros + busqueda + paginacion produce resultados incorrectos**
- Impact: High
- Likelihood: Medium
- Area Affected: Frontend + Backend
- Mitigation:
  - Cubrir combinaciones de query params.
  - Validar persistencia de estado en URL.
- Test Coverage Required: E2E + API parametrizados.

**Risk 3: Search lento o inconsistente en datasets grandes**
- Impact: Medium
- Likelihood: Medium
- Area Affected: Frontend + Backend + DB
- Mitigation:
  - Probar debounce, loading states y respuestas tardias.
  - Validar que el query filtre correctamente en DB.
- Test Coverage Required: performance funcional + DB validation.

### Business Risks

**Risk 1: Dashboard muestra montos errados y afecta decisiones de cobranza**
- Impact on Business: perdida de confianza y menor uso recurrente.
- Impact on Users: especialmente Carlos y Andres.
- Likelihood: Medium
- Mitigation:
  - Validaciones cruzadas entre resumen y listado.
  - Casos con pagos recientes, parciales y vencidas.
- Acceptance Criteria Validation: los AC deben definir reglas de calculo con claridad.

**Risk 2: UX ambigua en estados vacios/no resultados**
- Impact on Business: friccion en primer valor.
- Impact on Users: confusion entre sin datos y sin coincidencias.
- Likelihood: Medium
- Mitigation:
  - AC separados para empty-state y no-results.

### Integration Risks

**Integration Risk 1: Desalineacion entre `/invoices/dashboard` y `/invoices`**
- Integration Point: Frontend ↔ APIs de resumen/listado
- What Could Go Wrong: summary cards no coinciden con el listado.
- Impact: High
- Mitigation: integration tests con dataset controlado.

**Integration Risk 2: Actualizacion tardia tras registrar pago**
- Integration Point: Payment flow ↔ Dashboard refresh
- What Could Go Wrong: el usuario ve datos viejos luego de un pago.
- Impact: Medium
- Mitigation: E2E del flujo pago -> regreso al dashboard.

---

## Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1:** Regla de overdue sin timezone de referencia.
- Found in: STORY-SQ-48 y STORY-SQ-50
- Question for PO: el corte usa timezone del usuario, workspace o UTC?
- Impact if not clarified: conteos y badges inconsistentes.

**Ambiguity 2:** Paginacion vs infinite scroll no esta cerrada.
- Found in: STORY-SQ-47 scope
- Question for Dev: se implementa paginacion tradicional o infinite scroll?
- Impact if not clarified: UX y cobertura de pruebas inconsistente.

**Ambiguity 3:** Search de invoices no deja totalmente claro si es submit, live o ambos.
- Found in: STORY-SQ-51
- Question for PO/Dev: la busqueda dispara al tipear, al submit, o en ambos casos?
- Impact if not clarified: riesgo de test incorrecto y comportamiento ambiguo.

**Ambiguity 4:** Monthly income no define inclusion exacta.
- Found in: STORY-SQ-52
- Question for PO/Dev: incluye solo `paid_at` o tambien facturas enviadas del mes?
- Impact if not clarified: metricas engañosas.

### Missing Information

**Missing 1:** Regla de precedencia entre status, search, sort y paginacion.
- Needed for: test matrix determinista.
- Suggestion: documentar orden de aplicacion.

**Missing 2:** Criterio de fallback para summary/empty chart con pocos datos.
- Needed for: validar UI vacia.
- Suggestion: definir comportamiento con 0, 1 y 2 meses.

**Missing 3:** Criterio de validacion del search term.
- Needed for: probar inputs invalidos o inesperados en SQ-51.
- Suggestion: definir si cualquier string es valido o si existe normalizacion.

**Missing 4:** Detalle exacto del comportamiento de search.
- Needed for: separar live search, submit search, fields buscados y orden de precedence.
- Suggestion: especificar si el buscador consulta `invoice_number`, `client.name`, `client.email` o solo algunos de ellos, y si el criterio es partial/case-insensitive/fuzzy.

### Suggested Improvements (Before Implementation)

**Improvement 1:** Estabilizar terminos de estado (`sent` vs `pending`).
- Story Affected: STORY-SQ-49, STORY-SQ-52
- Current State: lenguaje mixto en narrativa y datos.
- Suggested Change: documentar mapping oficial.
- Benefit: reduce defectos de interpretacion.

**Improvement 2:** Definir explicitamente UX de no-results vs empty-state.
- Story Affected: STORY-SQ-47, STORY-SQ-51
- Current State: ambos escenarios no estan formalizados.
- Suggested Change: agregar AC separados.
- Benefit: mejora claridad y cobertura.

**Improvement 3:** Cerrar la estrategia de search para SQ-51.
- Story Affected: STORY-SQ-51
- Current State: falta detalle sobre live search vs submit.
- Suggested Change: definir debounce, comportamiento y campo(s) buscados.
- Benefit: tests mas precisos y menos retrabajo.

**Improvement 4:** Formalizar prioridad entre search, filters y pagination.
- Story Affected: STORY-SQ-51
- Current State: no esta documentado el orden de aplicacion.
- Suggested Change: definir precedence y comportamiento ante combinaciones.
- Benefit: reduce ambiguedad y errores de backend/frontend.

---

## Test Strategy

### Test Scope

**In Scope:**
- Functional testing (UI, API, DB) para dashboard, filtros, busqueda, overdue y summary mensual.
- Integration testing entre listado, resumen y flujo de pagos.
- Cross-browser: Chrome, Firefox, Safari.
- Mobile responsiveness: iOS Safari, Android Chrome.
- API contract validation para `/invoices` y `/invoices/dashboard`.
- Performance funcional: loading, debounce, respuesta del search y refresco del dashboard.

**Out of Scope:**
- Export CSV/Excel y analytics avanzados.
- Pen testing profundo y load testing extremo.
- Integraciones Pro de recordatorios automaticos.
- Search avanzada por monto, fecha, historial guardado o texto libre fuera de los campos definidos.
- Cambios de permisos o roles fuera del acceso normal al dashboard.

### Test Levels

**Unit Testing**
- Coverage Goal: >80%
- Focus Areas: overdue, summary mensual, formatters, parseo de query params.

**Integration Testing**
- Coverage Goal: all integration points.
- Focus Areas: API + DB, dashboard + payments.

**End-to-End (E2E) Testing**
- Coverage Goal: critical user journeys.
- Tool: Playwright.
- Focus Areas: dashboard base, filtros, search, empty/no-results, refresh despues de pago.

**API Testing**
- Coverage Goal: 100% endpoints in scope.
- Focus Areas: contract, status codes, filters, error handling, access control.

### Test Types per Story

**SQ-47: Dashboard base list**
- Complexity: Medium
- Estimated Test Cases: 14
- Positive: 4
- Negative: 3
- Boundary: 3
- Integration: 2
- API: 2
- Rationale: listado base, empty state, paginacion y coherencia con backend.
- Parametrized Tests Recommended: Yes

**SQ-48: Filter by status**
- Complexity: Medium
- Estimated Test Cases: 12
- Positive: 4
- Negative: 2
- Boundary: 2
- Integration: 2
- API: 2
- Rationale: combinaciones de filtros y persistencia de estado.
- Parametrized Tests Recommended: Yes

**SQ-49: Pending total**
- Complexity: Medium
- Estimated Test Cases: 10
- Positive: 3
- Negative: 2
- Boundary: 2
- Integration: 2
- API: 1
- Rationale: exactitud de calculo y visualizacion.
- Parametrized Tests Recommended: Yes

**SQ-50: Overdue highlight**
- Complexity: Medium
- Estimated Test Cases: 10
- Positive: 3
- Negative: 2
- Boundary: 2
- Integration: 2
- API: 1
- Rationale: fechas limite, timezone y visual highlight.
- Parametrized Tests Recommended: Yes

**SQ-51: Search invoices**
- Complexity: High
- Estimated Test Cases: 16
- Positive: 5
- Negative: 3
- Boundary: 3
- Integration: 3
- API: 2
- Rationale: search, debounce, partial match, empty/no-results, precedence with filters/pagination and performance.
- Parametrized Tests Recommended: Yes

**SQ-52: Monthly income summary**
- Complexity: Medium
- Estimated Test Cases: 12
- Positive: 4
- Negative: 2
- Boundary: 2
- Integration: 2
- API: 2
- Rationale: exactitud de resumen, charts y faltantes de datos.
- Parametrized Tests Recommended: Yes

### Test Data Requirements

**Valid Data Sets:**
- Invoices with statuses draft, sent, paid, overdue.
- Invoices with different due dates, including today and cutoff edges.
- Clients with simple and long names.
- Invoice numbers valid and matching the search pattern.

**Invalid / Boundary Data Sets:**
- Search terms with special characters and whitespace.
- Empty lists and single-item lists.
- Dates at month boundaries and timezone edges.
- Large datasets for search and filter checks.

### Entry / Exit Criteria

**Entry Criteria:**
- Story implemented in staging.
- Unit tests passing.
- API docs updated if needed.
- Test data prepared.

**Exit Criteria:**
- All critical/high tests passing.
- No open critical/high bugs.
- E2E and API validations complete.
- NFR checks completed for scope.

### NFR Validation

**Performance:**
- Search and dashboard interactions should feel responsive on moderate dataset sizes.
- Validate debounce and loading states.

**Security:**
- RLS must isolate user data by account.

**Usability:**
- Clear empty-state vs no-results.
- Search and filter states should be understandable and consistent.

### Regression Strategy

**Scope:**
- Dashboard list.
- Filters and search.
- Summary cards.
- Payment refresh behavior.

**Execution:**
- Run regression after each story and again at epic end.

### Timeline Estimate

**Estimated Duration:** 1 sprint for QA design + execution on this epic slice.

**Breakdown:**
- Test case design: 2 days
- Test data prep: 1 day
- Execution: 3 days
- Regression: 1 day
- Bug fix validation: 1 day buffer

### Tools & Infrastructure

- E2E: Playwright
- API: Postman/Newman or Playwright API
- Unit: Vitest/Jest
- Performance: Lighthouse
- Data: Faker.js

### Notes & Assumptions

- The search behavior for SQ-51 must be clarified before implementation.
- Story comments are used as shift-left input, not as final acceptance.
- The formal FTP should be reviewed by PO and Dev before sprint start.

## Action Required

**@PO**
- Review the critical questions and clarify search behavior, sorting precedence and metric definitions.

**@Dev Lead**
- Validate integration points, query behavior and performance assumptions.

**@QA Team**
- Review test scope, estimates and data requirements.

---

**Label suggested:** `test-plan-ready`
