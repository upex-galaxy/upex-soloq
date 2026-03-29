# Comments for SQ-38

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-38)

---

### Joel Armando Ramírez Rodríguez - 2026-03-16T12:37:26.455Z

## 📋 Feature Test Plan - Generated 2026-03-16

**QA Lead:** AI-Generated

**Status:** Draft - Pending Team Review

---

# Feature Test Plan: EPIC-SQ-38 - Invoice Dashboard & Tracking

**Fecha:** 2026-03-16

**QA Lead:** AI-Generated

**Epic Jira Key:** SQ-38

**Status:** Draft

---

## 📋 Business Context Analysis

### Business Value

Esta epica habilita el control operativo diario del flujo de cobro para freelancers LATAM. El dashboard reduce friccion en seguimiento de facturas, mejora visibilidad de deuda y acelera priorizacion de acciones de cobranza. Es una pieza central para validar la promesa de valor de SoloQ: facturar rapido y cobrar mejor sin friccion social.

**Key Value Proposition:**

- Visibilidad inmediata de facturas pendientes, pagadas y vencidas para actuar con rapidez.
- Mejor percepcion de control financiero para sostener retencion y uso recurrente del producto.

**Success Metrics (KPIs):**

- MAU (usuarios que crean/envian/gestionan facturas) por mayor frecuencia de entrada al dashboard.
- Facturas marcadas como pagadas y reduccion de tiempo de cobro por mejor priorizacion de vencidas.

**User Impact:**

- Carlos (Disenador Organizado): gana vista consolidada para no perder seguimiento entre 5-8 clientes.
- Valentina (Desarrolladora Internacional): identifica vencidas y pendientes con urgencia para mejorar cash flow.
- Andres (Consultor Tradicional): obtiene control simple y claro sin usar reporteria compleja.

**Critical User Journeys:**

- Journey 2: Seguimiento y Cobro de Factura (identificacion de vencidas + registro de pago).
- Journey 1 (parcial): Dashboard tras primera factura enviada para validar estado y accion siguiente.

---

## 🏗️ Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**

- Pagina/ruta de facturas en App Router (dashboard de listado).
- Componentes de tabla/listado, tabs de estado, buscador, summary cards, empty state y paginacion.
- Estados UI para overdue highlight, no-results y zero-state de montos.

**Backend:**

- `GET /api/invoices/dashboard` para resumen de montos y conteos.
- `GET /api/invoices` con filtros (`status`, `search`, `sortBy`, `sortOrder`, paginacion).
- Integracion eventual con `POST /api/invoices/{invoiceId}/payments` para refrescar resumen tras pagos.

**Database:**

- Tabla principal `invoices` (status, due_date, total, paid_at, created_at).
- Join con `clients` para busqueda por cliente y render de columnas.
- Agregaciones por status/periodo mensual y calculo de overdue (`status='sent' AND due_date < CURRENT_DATE`).

**External Services:**

- No hay dependencia externa critica para esta epica (sin Resend/Stripe en flujo principal).

### Integration Points (Critical for Testing)

**Internal Integration Points:**

- Frontend dashboard ↔ `GET /api/invoices` (filtros, busqueda, orden, paginacion).
- Frontend summary cards ↔ `GET /api/invoices/dashboard` (pending/overdue/monthly).
- Backend API ↔ PostgreSQL (`invoices`, `clients`) con RLS por usuario.
- Dashboard ↔ flujo de pagos (consistencia de datos luego de marcar factura pagada).

**External Integration Points:**

- N/A para alcance principal de SQ-38.

**Data Flow:**

```text
User -> Dashboard UI -> GET /api/invoices + GET /api/invoices/dashboard -> PostgreSQL
                                 ^
                                 | (status/search/sort/page)
```

---

## 🚨 Risk Analysis

### Technical Risks

#### Risk 1: Inconsistencia en logica de overdue y monthly summary

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Backend + Integration
- **Mitigation Strategy:**
- Definir una sola fuente de verdad para overdue y periodo mensual (timezone explicita).
- Tests de contrato y agregacion con fechas limite (hoy, fin de mes, cambio de zona horaria).
- **Test Coverage Required:** API tests de dashboard/listado + integration tests DB con datos borde.

#### Risk 2: Combinacion de filtros + busqueda + paginacion produce resultados incorrectos

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Frontend + Backend
- **Mitigation Strategy:**
- Matriz de combinaciones prioritarias de query params.
- Validar persistencia en URL y restauracion de estado al navegar/recargar.
- **Test Coverage Required:** E2E de escenarios combinados + API tests parametrizados.

### Business Risks

#### Risk 1: Dashboard muestra montos errados y afecta decisiones de cobranza

- **Impact on Business:** degrada confianza, reduce adopcion recurrente, impacta MAU y conversion futura.
- **Impact on Users:** especialmente Carlos y Andres, que dependen de vista simple para operar.
- **Likelihood:** Medium
- **Mitigation Strategy:**
- Validaciones cruzadas entre tarjetas, listado y datos de base.
- Casos con pagos recientes/parciales y facturas vencidas.
- **Acceptance Criteria Validation:** AC actuales cubren visibilidad, pero no precisan reglas de calculo mensual/overdue.

#### Risk 2: UX ambigua en estados vacios/no resultados reduce eficiencia

- **Impact on Business:** menor uso de dashboard y mas friccion para primer valor.
- **Impact on Users:** frustracion al no distinguir "sin facturas" vs "sin resultados".
- **Likelihood:** Medium
- **Mitigation Strategy:**
- Tests UX para empty state, no-results y CTA contextual.

### Integration Risks

#### Integration Risk 1: Desalineacion entre `/invoices/dashboard` y `/invoices`

- **Integration Point:** Frontend ↔ APIs de resumen/listado
- **What Could Go Wrong:** tarjeta pending no coincide con listado filtrado sent/overdue.
- **Impact:** High
- **Mitigation:**
- Integration tests con dataset controlado.
- Contract validation de esquemas y campos monetarios.

#### Integration Risk 2: Actualizacion tardia tras registrar pago

- **Integration Point:** Payment flow ↔ Dashboard refresh
- **What Could Go Wrong:** usuario registra pago y sigue viendo monto pendiente anterior.
- **Impact:** Medium
- **Mitigation:**
- E2E con flujo pago -> retorno dashboard -> validacion inmediata de metricas.

---

## ⚠️ Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1:** Regla de overdue no define timezone de referencia.

- **Found in:** STORY-SQ-48 y STORY-SQ-50
- **Question for PO:** El corte de vencimiento usa timezone del usuario, del workspace o UTC?
- **Impact if not clarified:** conteos y badges distintos entre usuarios/regiones.

**Ambiguity 2:** Paginacion vs infinite scroll queda abierta en una misma story.

- **Found in:** STORY-SQ-47 scope
- **Question for Dev:** Se implementa paginacion tradicional (20 por pagina) o infinite scroll? Cual es criterio final?
- **Impact if not clarified:** cobertura de pruebas y UX inconsistente entre entornos.

**Ambiguity 3:** "Monthly income" y "paid vs pending" no define inclusion exacta por status/fecha.

- **Found in:** STORY-SQ-52
- **Question for PO/Dev:** "Ingreso mensual" incluye solo `paid_at` del mes o tambien `sent` del mes como proyeccion?
- **Impact if not clarified:** metricas de negocio y comparacion mensual potencialmente engañosas.

### Missing Information

**Missing 1:** Definicion de precedencia cuando coexisten filtro de status + search + sort por urgencia.

- **Needed for:** diseñar test matrix confiable y comportamiento deterministico.
- **Suggestion:** agregar regla explicita en story (orden de aplicacion y tie-breakers).

**Missing 2:** Criterio de fallback para chart de 6 meses sin suficientes datos.

- **Needed for:** validar UI vacia y consistencia visual.
- **Suggestion:** definir comportamiento con 0, 1, 2 meses y etiqueta de "insufficient data".

### Suggested Improvements (Before Implementation)

**Improvement 1:** Estabilizar terminos de estado (`sent` vs `pending`).

- **Story Affected:** STORY-SQ-49, STORY-SQ-52
- **Current State:** "pending" se usa en narrativa; `sent` en logica de datos.
- **Suggested Change:** documentar mapping oficial (`pending := sent unpaid`) en AC y scope.
- **Benefit:** reduce defectos de interpretacion entre QA/Dev/PO.

**Improvement 2:** Definir explicitamente UX de no-results vs empty-state.

- **Story Affected:** STORY-SQ-47, STORY-SQ-51
- **Current State:** ambos escenarios no estan diferenciados de forma formal.
- **Suggested Change:** agregar AC separados para "sin datos" y "sin coincidencias de busqueda".
- **Benefit:** mejora claridad de producto y cobertura de pruebas.

---

## 🎯 Test Strategy

### Test Scope

**In Scope:**

- Functional testing (UI, API, DB) para dashboard, filtros, busqueda, overdue y summary mensual.
- Integration testing entre listado, resumen y flujo de pagos.
- Non-functional checks aplicables: performance web, accesibilidad AA, seguridad de acceso por RLS.
- Cross-browser: Chrome, Firefox, Safari.
- Mobile responsiveness: iOS Safari, Android Chrome.
- API contract validation para `/invoices` y `/invoices/dashboard`.

**Out of Scope (For This Epic):**

- Export CSV/Excel y analytics avanzados no incluidos en stories.
- Pen testing profundo y load testing extremo (fuera de sprint de feature).
- Integraciones Pro de recordatorios automaticos (EPIC-SQ-40).

### Test Levels

#### Unit Testing

- **Coverage Goal:** >80%
- **Focus Areas:** calculo de overdue/dias vencido, funciones de agregacion mensual, formatters monetarios, parseo de query params.
- **Responsibility:** Dev team (QA valida calidad y cobertura).

#### Integration Testing

- **Coverage Goal:** Todos los integration points identificados.
- **Focus Areas:** API + DB agregaciones, sincronizacion resumen/listado, refresco tras pago.
- **Responsibility:** QA + Dev.

#### End-to-End (E2E) Testing

- **Coverage Goal:** Journeys criticos de monitoreo y cobranza.
- **Tool:** Playwright
- **Focus Areas:**
- Journey de seguimiento y priorizacion de vencidas.
- Busqueda/filtro/combinaciones con recarga y persistencia URL.
- **Responsibility:** QA team.

#### API Testing

- **Coverage Goal:** 100% endpoints de alcance de la epica.
- **Tool:** Postman/Newman o Playwright API
- **Focus Areas:** contrato, codigos HTTP, query params, seguridad de acceso, errores de validacion.
- **Responsibility:** QA team.

### Test Types per Story

**Positive Test Cases:** happy paths, variaciones validas de filtros/busqueda/orden.

**Negative Test Cases:** query params invalidos, estados no permitidos, acceso no autorizado, combinaciones contradictorias.

**Boundary Test Cases:** fechas limite, montos 0, listas vacias, limites de paginacion, texto parcial/case-insensitive.

**Exploratory Testing:**

- Exploracion de usabilidad de dashboard en datasets mixtos (alto volumen, estados cruzados).
- Exploracion de claridad visual de urgencia (badges, orden por urgencia, contraste y legibilidad).

---

## 📊 Test Cases Summary by Story

### STORY-SQ-47: Invoice Dashboard Base List

**Complexity:** Medium

**Estimated Test Cases:** 14

- Positive: 4
- Negative: 3
- Boundary: 2
- Integration: 3
- API: 2

**Rationale for estimate:** listado base, empty state, paginacion, campos obligatorios y consistencia con backend.

**Parametrized Tests Recommended:** Yes (status/date/page-size permutations).

### STORY-SQ-48: Filter by Status

**Complexity:** Medium

**Estimated Test Cases:** 12

- Positive: 4
- Negative: 3
- Boundary: 2
- Integration: 2
- API: 1

**Rationale for estimate:** cinco tabs con conteos y regla overdue derivada.

**Parametrized Tests Recommended:** Yes (tab/status mapping + count assertions).

### STORY-SQ-49: Pending Total

**Complexity:** Medium

**Estimated Test Cases:** 9

- Positive: 3
- Negative: 2
- Boundary: 2
- Integration: 1
- API: 1

**Rationale for estimate:** depende de agregacion monetaria y refresco tras cambios de estado.

**Parametrized Tests Recommended:** Yes (monto/currency formatting).

### STORY-SQ-50: Overdue Highlight

**Complexity:** Medium

**Estimated Test Cases:** 11

- Positive: 3
- Negative: 3
- Boundary: 2
- Integration: 2
- API: 1

**Rationale for estimate:** urgencia visual, dias vencidos y orden por prioridad exigen validacion funcional + UX.

**Parametrized Tests Recommended:** Yes (due_date offsets and expected labels).

### STORY-SQ-51: Search Invoices

**Complexity:** Medium

**Estimated Test Cases:** 12

- Positive: 4
- Negative: 3
- Boundary: 3
- Integration: 1
- API: 1

**Rationale for estimate:** busqueda parcial/case-insensitive, debounce, no-results y clear-state.

**Parametrized Tests Recommended:** Yes (query variations by invoice/client/email fragments).

### STORY-SQ-52: Monthly Summary

**Complexity:** High

**Estimated Test Cases:** 14

- Positive: 4
- Negative: 3
- Boundary: 3
- Integration: 2
- API: 2

**Rationale for estimate:** agrega comparativa mensual + chart 6 meses + sincronizacion con pagos.

**Parametrized Tests Recommended:** Yes (month windows and trend calculation datasets).

### Total Estimated Test Cases for Epic

**Total:** 72

**Breakdown:**

- Positive: 22
- Negative: 17
- Boundary: 14
- Integration: 11
- API: 8

---

## 🗂️ Test Data Requirements

### Test Data Strategy

**Valid Data Sets:**

- Usuarios tipo Carlos/Valentina/Andres con 0, 5, 20, 50 facturas.
- Facturas multi-status (`draft`, `sent`, `paid`, `overdue`) con fechas distribuidas entre mes actual y 6 meses previos.
- Clientes con nombres/emailes parciales para busqueda textual.

**Invalid Data Sets:**

- `status` invalido en query param, `page/limit` fuera de rango, fechas invertidas (`dateFrom > dateTo`).
- Cadenas de busqueda con caracteres especiales y payloads basicos de seguridad para validar sanitizacion.

**Boundary Data Sets:**

- due_date = hoy, ayer, manana.
- Montos 0.00, valores altos, decimales largos.
- Query de busqueda vacia, 1 caracter, max esperado.

**Test Data Management:**

- ✅ Faker.js para datos realistas.
- ✅ Factories para invoice/client y seed por escenario.
- ❌ Sin hardcode estatico en suites automatizadas.
- ✅ Limpieza post-test y aislamiento por usuario.

### Test Environments

**Staging Environment:**

- URL: `https://staging.soloq.app`
- Database: `soloq-staging` (Supabase)
- External Services: no criticos para flujo principal de SQ-38
- **Purpose:** entorno primario de validacion funcional/integracion

**Production Environment:**

- URL: `https://soloq.app`
- **Purpose:** smoke tests post-deploy
- **Restrictions:** sin pruebas destructivas ni creacion de data de testing

---

## ✅ Entry/Exit Criteria

### Entry Criteria (Per Story)

- [ ] Story implementada y desplegada en staging
- [ ] PR aprobado (2+ reviewers)
- [ ] Unit tests disponibles y passing (>80%)
- [ ] Smoke test dev completado
- [ ] Sin blockers en stories dependientes
- [ ] Datos de prueba listos
- [ ] API docs actualizadas cuando aplique

### Exit Criteria (Per Story)

- [ ] Test cases ejecutados
- [ ] 100% passing en casos criticos/high
- [ ] >=95% passing en medium/low
- [ ] Bugs critical/high cerrados y verificados
- [ ] Regresion relevante ejecutada
- [ ] NFRs aplicables validados
- [ ] Reporte de ejecucion compartido

### Epic Exit Criteria

- [ ] Todas las stories cumplen exit criteria
- [ ] Integracion cross-story completada
- [ ] E2E de journeys criticos passing
- [ ] Contract/API validation completada
- [ ] NFRs clave validados
- [ ] Exploratory testing documentado
- [ ] Sin bugs critical/high abiertos

---

## 📝 Non-Functional Requirements Validation

### Performance Requirements

**NFR-P-001 (Web Vitals):**

- **Target:** LCP < 2.0s, TTI < 3.0s en dashboard de facturas.
- **Test Approach:** medicion en staging con dataset pequeno vs grande.
- **Tools:** Lighthouse + Web Vitals.

**NFR-P-002 (API):**

- **Target:** p95 < 500ms en list/search queries.
- **Test Approach:** pruebas API por status/search/paginacion.
- **Tools:** Postman/Newman.

### Security Requirements

**NFR-S-001 (Authorization/RLS):**

- **Requirement:** usuario solo accede a sus facturas.
- **Test Approach:** pruebas negativas con usuarios cruzados y tokens distintos.
- **Tools:** API tests autenticados + validacion DB.

### Usability Requirements

**NFR-U-001 (Accessibility AA):**

- **Requirement:** filtros, tabla y estados accesibles por teclado y contraste adecuado.
- **Test Approach:** auditoria axe + navegacion keyboard-only.

---

## 🔄 Regression Testing Strategy

**Regression Scope:**

- [ ] Feature de invoices list base (orden, columnas, navegacion)
- [ ] Flujo de registrar pago y retorno al dashboard
- [ ] Empty states y CTA de crear factura

**Regression Test Execution:**

- Correr suite automatizada antes de validar SQ-38.
- Re-ejecutar luego de completar todas las stories de la epica.
- Priorizar puntos de integracion y calculos monetarios.

---

## 📅 Testing Timeline Estimate

**Estimated Duration:** 2 sprints (aprox. 2 semanas QA activas + buffer)

**Breakdown:**

- Test case design: 3 dias
- Test data preparation: 1 dia
- Test execution per story: 1 dia promedio por story (6 dias)
- Regression testing: 2 dias
- Bug fixing cycles buffer: 3 dias
- Exploratory testing: 1 dia

**Dependencies:**

- Depends on: EPIC-SQ-20 (invoice creation), EPIC-SQ-39 (payment tracking) para escenarios completos.
- Blocks: EPIC-SQ-40 (automatic reminders) para priorizacion de vencidas con base confiable.

---

## 🛠️ Tools & Infrastructure

**Testing Tools:**

- E2E: Playwright
- API: Postman/Newman o Playwright API
- Unit: Vitest/Jest
- Performance: Lighthouse
- Accessibility: axe-core
- Test Data: Faker.js

**CI/CD Integration:**

- [ ] Tests en PR creation
- [ ] Tests en merge a `staging`
- [ ] Tests en deploy a staging
- [ ] Smoke tests en deploy a produccion

**Test Management:**

- Jira/Xray para trazabilidad de casos y ejecuciones.
- Bugs y follow-up en Jira con linkage por story.

---

## 📊 Metrics & Reporting

**Test Metrics to Track:**

- Ejecutados vs total
- Pass rate
- Deteccion de bugs por story
- Tiempo medio de correccion
- Cobertura unitaria reportada
- Tiempo de test por story

**Reporting Cadence:**

- Diario: estado de ejecucion y blockers.
- Por story: reporte de cierre QA.
- Por epica: QA sign-off consolidado.

---

## 📢 Action Required

**@ProductOwner:**

- [ ] Revisar ambiguedades y missing info (seccion Critical Analysis)
- [ ] Responder preguntas criticas de negocio
- [ ] Validar alcance y riesgos de impacto a KPIs

**@DevLead:**

- [ ] Confirmar reglas tecnicas de overdue/monthly summary
- [ ] Validar integration points y refresh post-payment
- [ ] Acordar decision final: paginacion vs infinite scroll

**@QATeam:**

- [ ] Revisar estimaciones y matriz de cobertura
- [ ] Preparar data factories y ambientes de prueba
- [ ] Iniciar diseno de casos detallados tras clarificaciones

---

**Next Steps:**

1. Refinement de preguntas criticas con PO/Dev.
2. Ajustar stories con reglas faltantes (timezone, precedencias, definiciones de metricas).
3. Disenar acceptance test plan por story.
4. Validar entry criteria antes de iniciar implementacion.

---

**Documentation:**

`.context/PBI/epics/EPIC-SQ-38-dashboard-tracking/feature-test-plan.md`

---

### Fernando Javier Masci - 2026-03-28T21:33:20.937Z

```markdown
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

| Story | Complexity | Est. TC | Pos | Neg | Bound | Int | API | Focus |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| SQ-47 Dashboard base list | Medium | 14 | 4 | 3 | 3 | 2 | 2 | list rendering, empty state, pagination |
| SQ-48 Filter by status | Medium | 12 | 4 | 2 | 2 | 2 | 2 | tab/status mapping, URL state |
| SQ-49 Pending total | Medium | 10 | 3 | 2 | 2 | 2 | 1 | amount aggregation, formatting |
| SQ-50 Overdue highlight | Medium | 10 | 3 | 2 | 2 | 2 | 1 | due-date edges, urgency highlight |
| SQ-51 Search invoices | High | 16 | 5 | 3 | 3 | 3 | 2 | debounce, precedence, no-results |
| SQ-52 Monthly income summary | Medium | 12 | 4 | 2 | 2 | 2 | 2 | monthly aggregation, chart data |

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
```

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-29T01:11:12.817Z_
