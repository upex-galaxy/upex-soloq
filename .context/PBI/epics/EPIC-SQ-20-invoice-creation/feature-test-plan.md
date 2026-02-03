# Feature Test Plan: EPIC-SQ-20 - Invoice Creation

**Fecha:** 2026-02-03
**QA Lead:** AI-Generated (Shift-Left Analysis)
**Epic Jira Key:** [SQ-20](https://upexgalaxy64.atlassian.net/browse/SQ-20)
**Status:** Draft - Pending Team Review

---

## 📋 Business Context Analysis

### Business Value

Esta épica representa el **core del producto SoloQ**. Sin la capacidad de crear facturas, la plataforma no tiene valor. La funcionalidad de facturación es el diferenciador clave que permite a los freelancers latinoamericanos facturar profesionalmente en menos de 2 minutos.

**Key Value Proposition:**

- Crear facturas profesionales en <2 minutos (vs 15-30 min en Word/Excel)
- Eliminar errores de cálculo con automatización
- Proyectar imagen profesional ante clientes

**Success Metrics (KPIs):**

- Time to First Invoice: <10 minutos (desde registro)
- Facturas creadas: 2,000 en primeros 3 meses
- Tiempo promedio de creación: <2 minutos

**User Impact:**

| Persona                        | Impacto                                                                  |
| ------------------------------ | ------------------------------------------------------------------------ |
| **Carlos (Diseñador)**         | Ahorra 20-30 min por factura. Templates profesionales mejoran su imagen. |
| **Valentina (Desarrolladora)** | Puede facturar clientes internacionales con formato profesional.         |
| **Andrés (Consultor)**         | Interface simple sin curva de aprendizaje. Precio accesible.             |

**Critical User Journeys:**

- **J1: Registro y Primera Factura** - Happy path completo (Steps 8-14)
- **J4: Edición de Factura** - Corrección de errores antes de enviar

---

## 🏗️ Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**

- Páginas/rutas: `/invoices`, `/invoices/new`, `/invoices/[id]`, `/invoices/[id]/edit`
- Componentes: InvoiceForm, ClientSelector, LineItemsTable, TaxCalculator, DiscountInput, DatePicker, InvoicePreview
- State: React Hook Form + Zod para validación

**Backend:**

- API Endpoints (según api-contracts.yaml):
  - `POST /api/invoices` - Crear factura
  - `GET /api/invoices` - Listar facturas
  - `GET /api/invoices/:id` - Obtener factura
  - `PUT /api/invoices/:id` - Actualizar factura
  - `DELETE /api/invoices/:id` - Eliminar factura
  - `GET /api/invoices/next-number` - Siguiente número
  - `GET /api/invoices/:id/pdf` - Descargar PDF

**Database:**

- Tablas involucradas:
  - `invoices` - Datos principales de factura
  - `invoice_items` - Líneas de items
  - `clients` - Referencia a cliente
  - `business_profiles` - Datos del negocio para header
  - `payment_methods` - Métodos de pago configurados
- Enums: `invoice_status` (draft, sent, paid, overdue, cancelled), `discount_type` (percentage, fixed)

**External Services:**

- Supabase Auth (verificar usuario autenticado)
- Supabase Storage (para PDFs generados - opcional cache)

### Integration Points (Critical for Testing)

**Internal Integration Points:**

- Frontend ↔ Backend API (validación client-side + server-side)
- Backend ↔ Database (RLS policies, cálculos)
- Invoice ↔ Client (relación FK, datos auto-poblados)
- Invoice ↔ Business Profile (datos para header)
- Invoice ↔ Payment Methods (métodos configurados)

**Data Flow:**

```
User → InvoiceForm → Validación Client-side (Zod)
                   ↓
              POST /api/invoices
                   ↓
         Validación Server-side (Zod)
                   ↓
         Supabase Client → PostgreSQL
                   ↓
         RLS Policy Check (auth.uid() = user_id)
                   ↓
         INSERT invoices + INSERT invoice_items
                   ↓
         Response → Update UI
```

---

## 🚨 Risk Analysis

### Technical Risks

#### Risk 1: Errores de cálculo en totales

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Frontend + Backend
- **Mitigation Strategy:**
  - Cálculos duplicados: client-side para UX, server-side para consistencia
  - Unit tests exhaustivos para fórmulas
  - Precisión decimal (2 decimales, redondeo correcto)
- **Test Coverage Required:** TC para todos los escenarios de cálculo (subtotal, tax, discount, total)

#### Risk 2: Condiciones de carrera en numeración de facturas

- **Impact:** High
- **Likelihood:** Low
- **Area Affected:** Database
- **Mitigation Strategy:**
  - Constraint UNIQUE(user_id, invoice_number)
  - Retry logic si hay conflicto
  - Generación atómica del número
- **Test Coverage Required:** Tests de concurrencia, validación de duplicados

#### Risk 3: Pérdida de datos en auto-save

- **Impact:** Medium
- **Likelihood:** Medium
- **Area Affected:** Frontend
- **Mitigation Strategy:**
  - Debounce de 30 segundos
  - Indicador visual de "guardando..."
  - Recuperación de drafts no guardados
- **Test Coverage Required:** Tests de auto-save, recovery scenarios

---

### Business Risks

#### Risk 1: UX confusa en selección de cliente

- **Impact on Business:** Abandono del flujo de facturación
- **Impact on Users:** Frustración, percepción de complejidad
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - Selector con búsqueda inline
  - Creación de cliente sin salir del flujo
  - Empty state amigable para usuarios nuevos
- **Acceptance Criteria Validation:** Scenarios 2, 3, 4 de SQ-21

#### Risk 2: Cálculos de impuestos incorrectos por país

- **Impact on Business:** Problemas legales/fiscales para usuarios
- **Impact on Users:** Facturas inválidas, pérdida de confianza
- **Likelihood:** Low (MVP no incluye facturación fiscal)
- **Mitigation Strategy:**
  - Presets de tasas comunes (16%, 19%, 21%)
  - Advertencia: "Solo para referencia, no es factura fiscal"
- **Acceptance Criteria Validation:** SQ-24 tax presets

---

### Integration Risks

#### Integration Risk 1: Cliente eliminado con factura draft asociada

- **Integration Point:** invoices.client_id → clients.id (soft delete)
- **What Could Go Wrong:** Factura queda con cliente inválido, UI rompe
- **Impact:** Medium
- **Mitigation:**
  - Detectar cliente eliminado al cargar factura
  - Mostrar warning y forzar selección de nuevo cliente
  - Test case específico (TC-10 en SQ-21)

#### Integration Risk 2: Inconsistencia entre cálculos frontend y backend

- **Integration Point:** Frontend calculations ↔ API validation
- **What Could Go Wrong:** Totales diferentes, usuario confundido
- **Impact:** High
- **Mitigation:**
  - Misma lógica de cálculo compartida (o duplicada exactamente)
  - Backend recalcula y retorna valores finales
  - Tests de integración que comparen ambos

---

## ⚠️ Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1:** Orden de aplicación de descuento vs impuesto

- **Found in:** SQ-23, SQ-24, SQ-25
- **Question for PO:** ¿El impuesto se calcula sobre (subtotal - descuento) o sobre subtotal antes del descuento?
- **Impact if not clarified:** Cálculos incorrectos, confusión del usuario

**Ambiguity 2:** Formato de número de factura configurable

- **Found in:** SQ-27
- **Question for Dev:** ¿El formato INV-YYYY-NNNN es fijo o el usuario puede configurar su propio formato?
- **Impact if not clarified:** Implementación incorrecta, usuarios que necesitan otros formatos

**Ambiguity 3:** Comportamiento de auto-save con errores de validación

- **Found in:** SQ-30
- **Question for Dev:** ¿El auto-save guarda aunque haya errores de validación (draft incompleto) o solo cuando el form es válido?
- **Impact if not clarified:** Pérdida de datos o drafts inválidos en DB

---

### Missing Information

**Missing 1:** Límites de caracteres para descripción de items

- **Needed for:** Validación correcta, UI responsive
- **Suggestion:** Agregar a SQ-22: "description max 500 chars"

**Missing 2:** Número máximo de line items por factura

- **Needed for:** Performance, UI handling
- **Suggestion:** Agregar límite (ej: 50 items max) o indicar "sin límite"

**Missing 3:** Comportamiento cuando usuario no tiene business profile configurado

- **Needed for:** Flujo completo de primera factura
- **Suggestion:** ¿Bloquear creación de factura? ¿Redirect a configuración? ¿Permitir sin header?

---

### Suggested Improvements (Before Implementation)

**Improvement 1:** Agregar validación de business profile antes de crear factura

- **Story Affected:** SQ-21
- **Current State:** No menciona validación de business profile
- **Suggested Change:** Agregar AC: "Given user has no business profile, When they try to create invoice, Then redirect to profile setup"
- **Benefit:** Evita facturas sin datos del negocio (headers incompletos)

**Improvement 2:** Especificar comportamiento de cambio de cliente en factura draft

- **Story Affected:** SQ-21
- **Current State:** No especifica si se puede cambiar cliente en draft existente
- **Suggested Change:** Agregar AC: "Given draft invoice, When user changes client, Then client data updates and invoice saves"
- **Benefit:** Claridad para dev y QA (ya cubierto en test-cases.md de SQ-21)

---

## 🎯 Test Strategy

### Test Scope

**In Scope:**

- Functional testing (UI forms, API endpoints, Database operations)
- Integration testing (Invoice ↔ Client, Invoice ↔ Business Profile)
- Calculation accuracy testing (subtotal, tax, discount, total)
- Validation testing (required fields, formats, limits)
- State management testing (draft → sent transitions)
- Cross-browser testing (Chrome, Firefox, Safari - últimas 2 versiones)
- Mobile responsiveness (iOS Safari, Android Chrome)

**Out of Scope (For This Epic):**

- PDF generation testing (EPIC-005)
- Email sending testing (EPIC-006)
- Payment tracking testing (EPIC-008)
- Performance/load testing (post-MVP)
- Security penetration testing (post-MVP)

---

### Test Levels

#### Unit Testing

- **Coverage Goal:** > 80% code coverage
- **Focus Areas:**
  - Calculation functions (subtotal, tax, discount, total)
  - Invoice number generation
  - Date formatting/validation
  - Zod schemas
- **Responsibility:** Dev team (QA valida que existan)

#### Integration Testing

- **Coverage Goal:** All API endpoints + DB operations
- **Focus Areas:**
  - POST /api/invoices (create with all variations)
  - PUT /api/invoices/:id (update draft, block sent)
  - GET /api/invoices/:id (with client data populated)
  - Cascade operations (delete client → invoice impact)
- **Responsibility:** QA + Dev (pair programming)

#### End-to-End (E2E) Testing

- **Coverage Goal:** Critical user journeys completos
- **Tool:** Playwright
- **Focus Areas:**
  - J1: Create first invoice (new user)
  - Happy path: Create → Preview → Save draft
  - Edit flow: Load draft → Modify → Save
  - Error scenarios: Missing client, invalid data
- **Responsibility:** QA team

#### API Testing

- **Coverage Goal:** 100% de endpoints de esta épica
- **Tool:** Playwright API o Postman
- **Focus Areas:**
  - Contract validation (request/response según OpenAPI)
  - Status codes correctos (201, 400, 404)
  - Error handling (validation errors, auth errors)
  - RLS policy enforcement
- **Responsibility:** QA team

---

### Test Types per Story

| Test Type       | Description                                 |
| --------------- | ------------------------------------------- |
| **Positive**    | Happy path, flujos exitosos                 |
| **Negative**    | Invalid input, missing fields, unauthorized |
| **Boundary**    | Min/max values, empty states, limits        |
| **Integration** | API + DB, cross-component                   |

---

## 📊 Test Cases Summary by Story

### SQ-21: Create Invoice by Selecting Client

**Complexity:** Medium
**Estimated Test Cases:** 12 (already defined in test-cases.md)

- Positive: 5 (TC-01 to TC-05, TC-08)
- Negative: 3 (TC-04, TC-07, TC-09)
- Boundary: 2 (TC-06, TC-10)
- Integration: 2 (TC-11, TC-12)

**Rationale:** Componente crítico con múltiples edge cases (usuario sin clientes, cliente eliminado, búsqueda, creación inline).

---

### SQ-22: Add Line Items to Invoice

**Complexity:** High
**Estimated Test Cases:** 15

- Positive: 6 (add item, multiple items, edit item, line total calc, reorder)
- Negative: 4 (empty description, negative quantity, negative price, zero quantity)
- Boundary: 3 (1 item min, max items, max description length)
- Integration: 2 (API create with items, update items)

**Rationale:** Formulario dinámico con arrays, cálculos en tiempo real, drag-and-drop.
**Parametrized Tests Recommended:** Yes - validaciones de campos (quantity > 0, price >= 0)

---

### SQ-23: Automatic Subtotal and Total Calculation

**Complexity:** High
**Estimated Test Cases:** 12

- Positive: 4 (subtotal sum, total with tax, total with discount, combined)
- Negative: 2 (invalid tax rate, discount > subtotal)
- Boundary: 4 (0 items, 1 item, decimal precision, large numbers)
- Integration: 2 (server-side recalculation, consistency check)

**Rationale:** Lógica de negocio crítica, múltiples fórmulas, precisión decimal.
**Parametrized Tests Recommended:** Yes - diferentes combinaciones de items, tax, discount

---

### SQ-24: Add Taxes to Invoice

**Complexity:** Low
**Estimated Test Cases:** 8

- Positive: 3 (add percentage, preset selection, zero tax)
- Negative: 2 (invalid rate > 100%, negative rate)
- Boundary: 2 (0%, 100%)
- Integration: 1 (tax in API payload)

**Rationale:** Funcionalidad simple, pero importante validar presets y límites.

---

### SQ-25: Add Discounts to Invoice

**Complexity:** Medium
**Estimated Test Cases:** 10

- Positive: 3 (percentage discount, fixed discount, no discount)
- Negative: 3 (percentage > 100%, fixed > subtotal, negative values)
- Boundary: 3 (0 discount, discount = subtotal, large discount)
- Integration: 1 (discount in API payload)

**Rationale:** Dos tipos de descuento, validación de caps, interacción con tax.
**Parametrized Tests Recommended:** Yes - percentage vs fixed con diferentes valores

---

### SQ-26: Preview Invoice Before Sending

**Complexity:** Medium
**Estimated Test Cases:** 8

- Positive: 4 (open preview, all data shown, return to edit, actions available)
- Negative: 1 (preview with invalid/incomplete data)
- Boundary: 2 (preview draft, preview sent)
- Integration: 1 (preview generates same as PDF)

**Rationale:** Componente visual, múltiples acciones disponibles.

---

### SQ-27: Assign Unique Invoice Number

**Complexity:** Medium
**Estimated Test Cases:** 10

- Positive: 4 (auto-generate, sequential, custom number, format display)
- Negative: 2 (duplicate number, invalid format)
- Boundary: 3 (first invoice, after gap, rollover year)
- Integration: 1 (GET /api/invoices/next-number)

**Rationale:** Lógica de secuencia, validación de unicidad, edge cases.

---

### SQ-28: Set Invoice Due Date

**Complexity:** Low
**Estimated Test Cases:** 8

- Positive: 4 (default 30 days, date picker, presets, custom date)
- Negative: 1 (past date warning)
- Boundary: 2 (today, far future)
- Integration: 1 (due_date in API payload)

**Rationale:** Funcionalidad simple con presets útiles.

---

### SQ-29: Add Notes and Terms to Invoice

**Complexity:** Low
**Estimated Test Cases:** 6

- Positive: 3 (add notes, add terms, default terms prefill)
- Negative: 1 (exceed character limit)
- Boundary: 2 (empty fields, max length)
- Integration: 0

**Rationale:** Campos opcionales simples.

---

### SQ-30: Save Invoice as Draft

**Complexity:** Medium
**Estimated Test Cases:** 10

- Positive: 5 (save draft, auto-save, find drafts, continue editing, convert to sent)
- Negative: 2 (delete draft, save incomplete draft)
- Boundary: 2 (first draft, many drafts)
- Integration: 1 (status transitions in API)

**Rationale:** Estado de factura, auto-save, filtrado.

---

### Total Estimated Test Cases for Epic

**Total:** 99 test cases

| Type        | Count |
| ----------- | ----- |
| Positive    | 41    |
| Negative    | 21    |
| Boundary    | 23    |
| Integration | 14    |

**Note:** SQ-21 ya tiene test-cases.md detallado con 12 TCs definidos.

---

## 🗂️ Test Data Requirements

### Test Data Strategy

**Valid Data Sets:**

```json
{
  "clients": [
    { "name": "Acme Corp", "email": "acme@corp.com", "taxId": "RFC123" },
    { "name": "Beta Inc", "email": "beta@inc.com" },
    { "name": "Gamma LLC", "email": "gamma@llc.com" }
  ],
  "invoiceItems": [
    { "description": "Web Development", "quantity": 10, "unitPrice": 150 },
    { "description": "Design Services", "quantity": 5, "unitPrice": 200 },
    { "description": "Consulting", "quantity": 1, "unitPrice": 500 }
  ],
  "taxRates": [0, 8, 16, 19, 21],
  "discounts": {
    "percentage": [5, 10, 15, 20],
    "fixed": [50, 100, 200, 500]
  }
}
```

**Invalid Data Sets:**

- Empty description, quantity = 0, negative prices
- Tax rate > 100%, negative tax
- Discount > subtotal
- Invalid client_id (non-existent, other user's)

**Boundary Data Sets:**

- 1 line item (minimum)
- 50 line items (suggested max)
- Description = 500 chars (max)
- Quantity = 0.01 (min positive)
- Large totals ($999,999.99)

**Test Data Management:**

- ✅ Use Faker.js for generating realistic test data
- ✅ Create data factories for invoices, clients, items
- ❌ NO hardcodear datos estáticos en tests
- ✅ Clean up test data after test execution (or use test user isolation)

---

### Test Environments

**Staging Environment:**

- URL: staging.soloq.app
- Database: soloq-staging (Supabase)
- External Services: Mocked where applicable
- **Purpose:** Primary testing environment

**Production Environment:**

- URL: soloq.app
- **Purpose:** ONLY smoke tests post-deployment
- **Restrictions:** NO destructive tests, NO test data creation

---

## ✅ Entry/Exit Criteria

### Entry Criteria (Per Story)

Testing can start when:

- [ ] Story is fully implemented and deployed to staging
- [ ] Code review is approved by 2+ reviewers
- [ ] Unit tests exist and are passing (>80% coverage)
- [ ] Dev has done smoke testing and confirms basic functionality works
- [ ] No blocker bugs exist in dependent stories
- [ ] Test data is prepared and available in staging
- [ ] API documentation is updated (if API changes)

### Exit Criteria (Per Story)

Story is considered "Done" from QA perspective when:

- [ ] All test cases are executed
- [ ] Critical/High priority test cases: 100% passing
- [ ] Medium/Low priority test cases: ≥95% passing
- [ ] All critical and high bugs are resolved and verified
- [ ] Medium bugs have mitigation plan or are scheduled
- [ ] Regression testing passed (if changes affect other features)
- [ ] Test execution report is generated and shared

### Epic Exit Criteria

Epic is considered "Done" from QA perspective when:

- [ ] ALL stories meet individual exit criteria
- [ ] Integration testing across all stories is complete
- [ ] E2E testing of critical user journeys is complete and passing
- [ ] API contract testing is complete (all endpoints validated)
- [ ] Exploratory testing session completed (findings documented)
- [ ] No critical or high bugs open
- [ ] QA sign-off document is created and approved

---

## 📝 Non-Functional Requirements Validation

### Performance Requirements

**NFR-P-001:** API Response Time

- **Target:** CRUD operations < 300ms (p95), < 500ms (p99)
- **Test Approach:** Measure response times during integration tests
- **Tools:** Playwright timing, Supabase logs

**NFR-P-002:** Page Load Performance

- **Target:** LCP < 2.0s, TTI < 3.0s
- **Test Approach:** Lighthouse audit on invoice creation page
- **Tools:** Lighthouse

### Security Requirements

**NFR-S-001:** Row Level Security

- **Requirement:** User can only access their own invoices
- **Test Approach:** API tests with different user tokens, attempt cross-user access
- **Tools:** Playwright API tests

**NFR-S-002:** Input Validation

- **Requirement:** All inputs validated server-side (Zod)
- **Test Approach:** Send malformed data via API, verify rejection
- **Tools:** API tests

### Usability Requirements

**NFR-U-001:** Time to Create Invoice

- **Target:** < 2 minutes for experienced user
- **Test Approach:** Timed E2E test with realistic data
- **Tools:** Playwright with timing assertions

---

## 🔄 Regression Testing Strategy

**Regression Scope:**

- [ ] Client Management (SQ-13): Creating invoice uses client selector
- [ ] Business Profile (SQ-7): Invoice header uses business data
- [ ] Authentication: Protected routes, session handling

**Regression Test Execution:**

- Run automated regression suite before starting epic testing
- Re-run after all stories are complete
- Focus on integration points identified in architecture analysis

---

## 📅 Testing Timeline Estimate

**Estimated Duration:** 2 sprints (4 weeks)

**Breakdown:**

- Test case design: 3 days (partially done for SQ-21)
- Test data preparation: 2 days
- Test execution (per story): 1-2 days per story
- Regression testing: 2 days
- Bug fixing cycles: 3-5 days (buffer)
- Exploratory testing: 2 days

**Dependencies:**

- Depends on: EPIC-SQ-13 (Client Management), EPIC-SQ-7 (Business Profile)
- Blocks: EPIC-005 (PDF Generation), EPIC-006 (Invoice Sending)

---

## 🛠️ Tools & Infrastructure

**Testing Tools:**

- E2E Testing: Playwright
- API Testing: Playwright API
- Unit Testing: Vitest
- Performance Testing: Lighthouse
- Test Data: Faker.js

**CI/CD Integration:**

- [ ] Tests run automatically on PR creation
- [ ] Tests run on merge to main branch
- [ ] Tests run on deployment to staging
- [ ] Smoke tests run on deployment to production

---

## 📊 Metrics & Reporting

**Test Metrics to Track:**

- Test cases executed vs. total
- Test pass rate
- Bug detection rate
- Bug fix rate
- Test coverage (code coverage from unit tests)
- Time to test (per story)

**Reporting Cadence:**

- Daily: Test execution status
- Per Story: Test completion report
- Per Epic: Comprehensive QA sign-off report

---

## 🎓 Notes & Assumptions

**Assumptions:**

- Usuario ya tiene cuenta y está autenticado
- Business profile configurado antes de crear factura (o redirect)
- Al menos un cliente existe (o se crea inline)
- Moneda default USD (sin conversión)

**Constraints:**

- MVP no incluye facturación electrónica fiscal
- MVP no incluye multi-moneda avanzada
- Límite de 50 items por factura (sugerido)

**Known Limitations:**

- Tax calculation es aproximado (no es factura fiscal)
- No hay validación de datos fiscales (RFC, NIT, etc.)

**Exploratory Testing Sessions:**

- Session 1: Flujo completo de primera factura (nuevo usuario)
- Session 2: Edge cases de cálculos (decimales, grandes números)
- Session 3: Mobile responsiveness del formulario

---

## 📎 Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/epic.md`
- **Stories:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-*/story.md`
- **Test Cases (SQ-21):** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-21-create-invoice-client/test-cases.md`
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/` (executive-summary, user-personas, user-journeys)
- **SRS:** `.context/SRS/` (functional-specs, non-functional-specs, architecture-specs)
- **API Contracts:** `.context/SRS/api-contracts.yaml`

---

## 📢 Action Required

**@Product Owner:**

- [ ] Review ambiguities and missing information (Critical Analysis section)
- [ ] Answer critical questions (discount vs tax order, invoice format, auto-save behavior)
- [ ] Validate risk analysis and business impact
- [ ] Confirm test scope is complete and correct

**@Dev Lead:**

- [ ] Review technical risks and mitigation strategies
- [ ] Validate integration points identified
- [ ] Confirm architecture analysis is accurate
- [ ] Answer technical questions (invoice format, auto-save logic)

**@QA Team:**

- [ ] Review test strategy and estimates
- [ ] Validate test levels and types per story
- [ ] Confirm test data requirements
- [ ] Prepare test environments and tools

---

**Next Steps:**

1. Team discusses critical questions and ambiguities in refinement
2. PO/Dev provide answers and clarifications
3. QA begins test case design per story (use story-test-cases.md prompt)
4. Team validates entry/exit criteria before sprint starts
5. Dev starts implementation ONLY after critical questions resolved

---

**⚠️ BLOCKER:** Epic should NOT start implementation until critical questions are resolved by PO/Dev.

---

_Documento generado como parte del Shift-Left Testing Analysis_
_Última actualización: 2026-02-03_
