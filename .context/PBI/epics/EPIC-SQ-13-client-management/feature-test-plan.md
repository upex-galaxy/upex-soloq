# Feature Test Plan: EPIC-SQ-13 - Client Management

**Fecha:** 2026-01-27
**QA Lead:** AI-Generated (TBD - asignar QA Lead)
**Epic Jira Key:** [SQ-13](https://upexgalaxy64.atlassian.net/browse/SQ-13)
**Status:** Draft - Pending Team Review

---

## Business Context Analysis

### Business Value

Esta epic es **fundamental** para el flujo de facturacion de SoloQ. Sin clientes, no hay facturas. El Client Management es el segundo paso critico despues de User Auth.

**Key Value Proposition:**

- Permite a freelancers organizar su base de clientes profesionalmente
- Reduce tiempo de creacion de facturas (no buscar datos cada vez)
- Proporciona visibilidad del historial con cada cliente

**Success Metrics (KPIs impactados):**

- Time to First Invoice: <10 min (depende de poder agregar cliente rapido)
- MAU: Usuarios que gestionan clientes = usuarios activos

**User Impact:**

- **Carlos (Disenador):** Necesita agregar clientes rapido sin perder contexto al facturar
- **Valentina (Desarrolladora):** Gestiona 3-5 clientes internacionales, necesita datos fiscales
- **Andres (Consultor):** 8-12 clientes, valora dashboard simple y busqueda rapida

**Critical User Journeys:**

- Journey 1: "Registro y Primera Factura" - Step 8 y 9 dependen de esta epic
- Journey 4: "Edicion de Factura" - Necesita cliente seleccionado

---

## Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**

- Paginas: `/clients`, `/clients/[id]`
- Componentes: `ClientsList`, `ClientForm`, `ClientDetails`, `ClientInvoiceHistory`
- Formularios: Add/Edit client con React Hook Form + Zod

**Backend - API Endpoints:**

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| GET    | `/api/clients`              | Listar clientes (FR-011)       |
| POST   | `/api/clients`              | Crear cliente (FR-010)         |
| GET    | `/api/clients/:id`          | Obtener cliente                |
| PUT    | `/api/clients/:id`          | Actualizar cliente (FR-012)    |
| DELETE | `/api/clients/:id`          | Eliminar cliente (FR-013)      |
| GET    | `/api/clients/:id/invoices` | Historial de facturas (FR-014) |

**Database:**

- Tabla principal: `clients`
- Campos: id, user_id, name, email, company, phone, address, tax_id, tax_id_type, notes, is_deleted, created_at, updated_at, deleted_at
- Constraint: `UNIQUE(user_id, email)`
- RLS Policy: `auth.uid() = user_id`

### Integration Points (Critical for Testing)

**Internal Integration Points:**

- Frontend <-> API `/api/clients/*` (6 endpoints)
- API <-> PostgreSQL (tabla `clients`)
- API <-> Supabase Auth (validacion de session, RLS)
- Clients <-> Invoices (foreign key `client_id`)

**Data Flow:**

```
User -> Frontend Form -> API Route -> Zod Validation -> Supabase Client -> PostgreSQL (RLS) -> Response
```

---

## Risk Analysis

### Technical Risks

| Risk                                  | Impact | Likelihood | Area                | Mitigation                                                                                            |
| ------------------------------------- | ------ | ---------- | ------------------- | ----------------------------------------------------------------------------------------------------- |
| RLS Policies - Data Isolation Failure | HIGH   | Medium     | Security            | Tests especificos de RLS con multiples usuarios, intentar acceso cross-user en todos los endpoints    |
| Unique Constraint per User            | Medium | Medium     | Database/Validation | Validar UNIQUE(user_id, email) funciona correctamente, probar User A y User B con mismo email cliente |
| Soft Delete Integrity                 | Medium | Low        | Business Logic      | Verificar soft-deleted no aparece en listas, facturas mantienen referencia                            |

### Business Risks

| Risk                      | Impact                 | Users Affected         | Mitigation                                                   |
| ------------------------- | ---------------------- | ---------------------- | ------------------------------------------------------------ |
| Usabilidad del Formulario | Abandono si dificil    | Carlos                 | Campos minimos requeridos, inline creation desde facturacion |
| Busqueda Ineficiente      | Tiempo perdido = churn | Andres (8-12 clientes) | Busqueda por nombre Y email, debounce 300ms                  |

### Integration Risks

| Integration Point           | What Could Go Wrong                                           | Mitigation                                                           |
| --------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| Client-Invoice Relationship | Eliminar cliente con facturas causa error, historial no carga | Tests de integracion cliente-factura, tests soft delete con facturas |

---

## Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1:** Validacion de Tax ID

- **Found in:** STORY-SQ-17
- **Question for PO:** Que formato de Tax ID debemos validar? RFC (Mexico), NIT (Colombia), CUIT (Argentina)?
- **Impact if not clarified:** Validaciones incorrectas frustran al usuario o permiten datos invalidos

**Ambiguity 2:** Limite de clientes

- **Found in:** EPIC-SQ-13 scope
- **Question for PO:** Hay limite de clientes por usuario en plan Free vs Pro?
- **Impact if not clarified:** Usuarios podrian crear miles de clientes sin restriccion

**Ambiguity 3:** Comportamiento de busqueda

- **Found in:** STORY-SQ-15
- **Question for Dev:** La busqueda es case-insensitive? Busca parciales o solo exactos?
- **Impact if not clarified:** Tests podrian tener expectativas incorrectas

### Missing Information

- **Empty state action:** Story SQ-15 menciona "CTA to add first client" pero no especifica texto/accion
- **Ordenamiento por defecto:** Alfabetico por nombre o por fecha de creacion?
- **Edicion con email duplicado:** Que pasa si edito cliente y pongo email que ya existe en otro?

### Suggested Improvements (Before Implementation)

| Improvement                  | Story | Current State                                | Suggested Change                           | Benefit                             |
| ---------------------------- | ----- | -------------------------------------------- | ------------------------------------------ | ----------------------------------- |
| Agregar notas internas       | SQ-14 | Campos: name, email, company, phone, address | Agregar campo `notes` (ya existe en DB)    | Freelancers pueden agregar contexto |
| Confirmacion mas informativa | SQ-19 | "Confirmation dialog appears"                | Dialog debe mostrar cuantas facturas tiene | Usuario toma decision informada     |

---

## Test Strategy

### Test Scope

**In Scope:**

- Functional testing (UI, API, Database)
- Integration testing (Client <-> API <-> DB, Client <-> Invoices)
- Security testing (RLS policies, data isolation)
- Validation testing (input formats, boundaries)
- Cross-browser (Chrome, Firefox, Safari)
- Mobile responsiveness

**Out of Scope (For This Epic):**

- Performance testing (load testing)
- Invoice creation flow (EPIC 4)
- Payment tracking (EPIC 8)

### Test Levels

| Level               | Coverage Goal          | Focus Areas                                         | Responsibility |
| ------------------- | ---------------------- | --------------------------------------------------- | -------------- |
| Unit Testing        | > 80% coverage         | Validacion Zod schemas, funciones formateo          | Dev team       |
| Integration Testing | All 6 API endpoints    | API <-> Supabase, RLS enforcement, FK constraints   | QA + Dev       |
| E2E Testing         | Critical user journeys | Add client -> appears in list, Search, Edit, Delete | QA team        |
| API Testing         | 100% endpoints         | Contract validation, status codes, error handling   | QA team        |

---

## Test Cases Summary by Story

| Story                       | Complexity | Positive | Negative | Boundary | Integration/API | Total |
| --------------------------- | ---------- | -------- | -------- | -------- | --------------- | ----- |
| SQ-14: Add New Client       | Medium     | 3        | 4        | 3        | 2               | 12    |
| SQ-15: List All Clients     | Medium     | 3        | 1        | 2        | 4               | 10    |
| SQ-16: Edit Client Data     | Low        | 2        | 3        | 2        | 1               | 8     |
| SQ-17: Add Client Tax Info  | Low        | 2        | 2        | 0        | 2               | 6     |
| SQ-18: View Invoice History | Medium     | 2        | 1        | 2        | 3               | 8     |
| SQ-19: Delete Client        | Medium     | 1        | 2        | 0        | 6               | 9     |

**TOTAL ESTIMATED TEST CASES: 53**

### Breakdown

- Positive: 13
- Negative: 13
- Boundary: 9
- Integration: 9
- API: 7
- Security: 2

---

## Test Data Requirements

### Test Data Strategy

**Valid Data Sets:**

- User: Carlos (designer) type client - "Empresa ABC", "cliente@empresa.com"
- User: Valentina (developer) type client - International names, emails
- User: Andres (consultant) type client - Corporate names, tax IDs

**Invalid Data Sets:**

- Email: "not-an-email", "missing@domain", "@nodomain.com"
- Name: "" (empty), null, 101+ characters
- Tax ID: "ABC" (too short), malformed formats

**Boundary Data Sets:**

- Name: 100 chars (max)
- Email: 254 chars (max RFC 5321)
- Phone: 20 chars (max)
- Address: 500 chars (max)

**Test Data Management:**

- Use Faker.js for realistic test data
- Create data factories for Client entity
- Clean up test data after test execution

### Test Environments

**Staging Environment:**

- URL: staging.soloq.app
- Database: soloq-staging
- Purpose: Primary testing environment

**Production Environment:**

- URL: soloq.app
- Purpose: ONLY smoke tests post-deployment
- Restrictions: NO destructive tests

---

## Entry/Exit Criteria

### Entry Criteria (Per Story)

- [ ] Story fully implemented and deployed to staging
- [ ] Code review approved by 2+ reviewers
- [ ] Unit tests exist and passing (>80% coverage)
- [ ] Dev smoke testing completed
- [ ] No blocker bugs in dependent stories

### Exit Criteria (Per Story)

- [ ] All test cases executed
- [ ] Critical/High priority tests: 100% passing
- [ ] Medium/Low priority tests: >=95% passing
- [ ] All critical/high bugs resolved
- [ ] Regression testing passed

### Epic Exit Criteria

- [ ] ALL stories meet individual exit criteria
- [ ] Integration testing across all stories complete
- [ ] E2E testing of "Add client from invoice flow" complete
- [ ] API contract testing complete (all 6 endpoints)
- [ ] RLS security testing complete
- [ ] Exploratory testing session completed
- [ ] No critical or high bugs open
- [ ] QA sign-off document created

---

## Non-Functional Requirements Validation

### Performance Requirements

**NFR-P-001:** API Response Time

- **Target:** CRUD operations < 300ms (p95)
- **Test Approach:** Measure response times in Playwright API tests
- **Tools:** Playwright, Lighthouse

### Security Requirements

**NFR-S-001:** Row Level Security

- **Requirement:** Users can only access their own clients
- **Test Approach:** Multi-user tests attempting cross-user access
- **Tools:** Playwright with different auth sessions

### Usability Requirements

**NFR-U-001:** Form Accessibility

- **Requirement:** WCAG 2.1 Level AA
- **Test Approach:** Lighthouse accessibility audit, keyboard navigation
- **Tools:** axe-core, Lighthouse

---

## Testing Timeline Estimate

**Estimated Duration:** 1.5 sprints (3 weeks)

| Phase                      | Duration           |
| -------------------------- | ------------------ |
| Test case design           | 2 days             |
| Test data preparation      | 1 day              |
| Test execution (per story) | 1-2 days per story |
| Regression testing         | 1 day              |
| Bug fixing cycles (buffer) | 2-3 days           |
| Exploratory testing        | 1 day              |

**Dependencies:**

- **Depends on:** EPIC-SQ-1 (User Auth) - necesita usuarios autenticados
- **Blocks:** EPIC 4 (Invoice Creation) - necesita clientes para crear facturas

---

## Tools & Infrastructure

**Testing Tools:**

- E2E Testing: Playwright
- API Testing: Postman/Newman or Playwright API
- Unit Testing: Vitest (frontend), Jest (backend)
- Test Data: Faker.js

**CI/CD Integration:**

- [ ] Tests run automatically on PR creation
- [ ] Tests run on merge to main branch
- [ ] Tests run on deployment to staging
- [ ] Smoke tests run on deployment to production

**Test Management:**

- Jira (test cases linked to stories)
- Test execution reports
- Bug tracking in Jira

---

## Action Required

**@Product Owner:**

- [ ] Review ambiguities and missing information (Critical Analysis section)
- [ ] Answer questions about Tax ID validation, client limits
- [ ] Validate risk analysis and business impact
- [ ] Confirm test scope is complete

**@Dev Lead:**

- [ ] Review technical risks and mitigation strategies
- [ ] Validate integration points identified
- [ ] Confirm architecture analysis is accurate
- [ ] Answer technical questions about search behavior

**@QA Team:**

- [ ] Review test strategy and estimates
- [ ] Validate test levels and types per story
- [ ] Confirm test data requirements
- [ ] Prepare test environments and tools

---

## Next Steps

1. Team discusses critical questions in refinement
2. PO/Dev provide answers and clarifications
3. QA begins test case design per story (use `story-test-cases.md` prompt)
4. Team validates entry/exit criteria before sprint starts
5. Dev starts implementation ONLY after critical questions resolved

---

> **BLOCKER:** Epic should NOT start implementation until critical questions (Tax ID validation, duplicate behavior on edit) are resolved.

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-13-client-management/epic.md`
- **Stories:** `.context/PBI/epics/EPIC-SQ-13-client-management/stories/STORY-*/story.md`
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/` (all files)
- **SRS:** `.context/SRS/` (all files)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`

---

_Documento generado como parte de Fase 5 - Shift-Left Testing_
_Ultima actualizacion: 2026-01-27_
