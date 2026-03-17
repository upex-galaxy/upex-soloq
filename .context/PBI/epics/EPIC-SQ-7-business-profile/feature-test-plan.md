# Feature Test Plan: EPIC-SQ-7 - Business Profile Management

**Fecha:** 2026-03-11
**QA Lead:** AI-Generated
**Epic Jira Key:** SQ-7
**Status:** Draft

---

## Business Context Analysis

### Business Value

El perfil de negocio es la base de credibilidad profesional del freelancer en SoloQ. Una factura con logo, datos fiscales correctos y métodos de pago claros aumenta la confianza del cliente y facilita el cobro. Es la primera impresión del freelancer ante su cliente.

**Key Value Proposition:**

- Profesionalización instantánea: freelancers pasan de facturas manuales sin marca a documentos con logo, datos fiscales y métodos de pago estructurados
- Reducción de fricción en cobro: métodos de pago claros en la factura eliminan intercambios de "¿cómo te pago?"

**Success Metrics (KPIs):**

- Tasa de completitud del perfil de negocio > 80% de usuarios registrados
- Reducción del tiempo de primer cobro (métodos de pago claros en factura)
- Tasa de facturas con logo > 50% (indicador de engagement con branding)

**User Impact:**

- **Carlos (Designer, México):** Necesita proyectar profesionalismo con logo y RFC. Sus clientes esperan facturas con imagen de marca
- **Valentina (Developer, Colombia):** Trabaja con clientes internacionales. Necesita NIT y múltiples métodos de pago (PayPal + transferencia local)
- **Andrés (Consultant, Argentina):** Busca simplicidad. CUIT y CBU son sus prioridades. No quiere formularios complicados

**Critical User Journeys:**

- Journey 1 (Registration & First Invoice): Pasos de onboarding incluyen logo upload (paso 3), payment methods (paso 4). Este epic habilita completar el onboarding
- Journey 4 (Invoice Editing): El perfil alimenta datos que aparecen en la factura (header con logo/nombre, footer con métodos de pago)

---

## Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**

- Componentes: Business Profile Settings page, Business Name form, Logo Upload (drag & drop + file input), Contact Info form, Tax ID form (dynamic per country), Payment Methods CRUD
- Páginas/rutas: `/settings` (business profile section), integración con `/onboarding` flow (steps 1-4)
- State: React Hook Form + Zod validation per form section

**Backend:**

- API Endpoints (según api-contracts.yaml):
  - `GET /api/profile` - obtener perfil de negocio
  - `PUT /api/profile` - actualizar perfil de negocio
  - `POST /api/profile/logo` - subir logo
  - `GET /api/profile/payment-methods` - listar métodos de pago
  - `PUT /api/profile/payment-methods` - actualizar métodos de pago
- Servicios: Profile service, Storage service (logos)

**Database:**

- Tablas involucradas:
  - `business_profiles`: business_name, contact_email, contact_phone, address (TEXT), tax_id, logo_url, default_terms, invoice_prefix
  - `payment_methods`: user_id, type (enum: bank_transfer, paypal, mercado_pago, cash, other), label, value, is_default, sort_order
  - `profiles`: onboarding_completed, onboarding_step (1-5)
- RLS: Ambas tablas tienen RLS habilitado - user solo ve/edita sus datos

**External Services:**

- Supabase Storage: Bucket `logos` para almacenamiento de imágenes
- Supabase Auth: JWT tokens para autenticación de requests

### Integration Points (Critical for Testing)

**Internal Integration Points:**

- Frontend Settings Page ↔ Profile API (CRUD de todos los datos del perfil)
- Frontend Upload ↔ Supabase Storage (upload directo de logos con RLS)
- Profile API ↔ Database (business_profiles + payment_methods tables)
- Profile Data ↔ Invoice PDF Generation (logo, nombre, contacto, tax ID, payment methods deben renderizar en PDF)
- Profile Completion ↔ Onboarding Flow (onboarding_step tracking en profiles table)
- Payment Methods ↔ Invoice Creation (validación de al menos un método de pago)

**External Integration Points:**

- Frontend ↔ Supabase Storage API (logo upload/delete/replace)
- Supabase Storage ↔ CDN (serving de imágenes para preview y PDF)

**Data Flow:**

```
User → Settings UI → Form Validation (Zod) → API Route → Supabase DB (business_profiles/payment_methods)
                   → File Upload → Client Resize → Supabase Storage → logo_url → DB
                                                                                    ↓
                                              Invoice PDF ← Profile Data ← DB Query
```

---

## Risk Analysis

### Technical Risks

#### Risk 1: Schema-Story Misalignment (DB vs Requirements)

- **Impact:** High
- **Likelihood:** High (CONFIRMED - gaps already identified)
- **Area Affected:** Database, Backend, Frontend
- **Details of Misalignment:**
  - `business_profiles.address` es TEXT plano, pero SQ-10 requiere campos estructurados (street, city, state, postal_code, country)
  - No existe columna `tax_id_type` en DB, pero SQ-11 necesita almacenar el tipo (RFC/NIT/CUIT)
  - No existe columna `country` en `business_profiles` para determinar reglas de validación de tax ID
  - No existe columna `is_active` en `payment_methods`, pero SQ-12 requiere toggle active/inactive
  - `payment_methods.value` es VARCHAR único - transferencias bancarias necesitan múltiples campos (banco, cuenta, CLABE/CBU)
- **Mitigation Strategy:**
  - Requiere migración de DB ANTES de implementación
  - Definir si `address` será JSON o columnas separadas
  - Agregar columnas: `tax_id_type`, `country`, `is_active` (payment_methods)
  - Definir strategy para `payment_methods`: ¿JSON en `value`? ¿columnas adicionales?
- **Test Coverage Required:** Validar que schema final soporta todos los escenarios de cada story

#### Risk 2: Client-Side Image Processing Reliability

- **Impact:** Medium
- **Likelihood:** Medium
- **Area Affected:** Frontend
- **Mitigation Strategy:**
  - Validar resize a 400x400px en múltiples browsers
  - Probar con imágenes de diferentes dimensiones, orientaciones (landscape, portrait, square)
  - Probar con imágenes corruptas o parcialmente cargadas
- **Test Coverage Required:** Tests de boundary con imágenes de distintos tamaños, formatos y calidades

#### Risk 3: Supabase Storage RLS y Bucket Configuration

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Backend, Security
- **Mitigation Strategy:**
  - Verificar que bucket `logos` existe y tiene RLS policies correctas
  - Validar que un usuario NO puede ver/modificar logos de otros usuarios
  - Probar límites de tamaño del bucket
- **Test Coverage Required:** Tests de seguridad de Storage + tests de isolation entre usuarios

---

### Business Risks

#### Risk 1: Complejidad de Tax ID por País Genera Fricción

- **Impact on Business:** Freelancers sin registro formal abandonan el onboarding si sienten que tax ID es obligatorio
- **Impact on Users:** Andrés (Argentina) y freelancers informales se frustran
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - Tax ID DEBE ser optional (confirmado en SQ-11 AC5)
  - UX clara indicando que es opcional
  - Validar que omitir tax ID NO bloquea creación de facturas
- **Acceptance Criteria Validation:** AC5 de SQ-11 cubre esto, pero falta claridad en la UI sobre "opcional"

#### Risk 2: Métodos de Pago Incompletos Bloquean Facturación

- **Impact on Business:** Si un freelancer no puede configurar su método de pago preferido, no puede facturar
- **Impact on Users:** Todos los personas - especialmente Valentina que usa PayPal para clientes internacionales
- **Likelihood:** Low
- **Mitigation Strategy:**
  - Método "other" (custom) como escape hatch para cualquier método no soportado
  - Al menos un método requerido - validar enforcement correcto
- **Acceptance Criteria Validation:** SQ-12 AC6 cubre el requerimiento de al menos uno

---

### Integration Risks

#### Integration Risk 1: Profile Data → Invoice PDF Rendering

- **Integration Point:** Business Profile Data ↔ PDF Generation
- **What Could Go Wrong:**
  - Logo no renderiza en PDF (URL inválida, imagen corrupta, formato incompatible con @react-pdf/renderer)
  - Caracteres especiales en business_name o tax_id rompen layout del PDF
  - Payment methods largos desbordan sección de pago en PDF
  - Datos de contacto incompletos dejan espacios vacíos en PDF
- **Impact:** High
- **Mitigation:**
  - Integration tests: crear perfil completo → generar PDF → verificar contenido
  - Boundary tests: nombres muy largos, tax IDs con caracteres especiales
  - Visual regression: comparar PDF output con datos de perfil

#### Integration Risk 2: Onboarding Flow ↔ Profile Completion

- **Integration Point:** Onboarding Steps ↔ business_profiles + payment_methods
- **What Could Go Wrong:**
  - Onboarding step tracker (profiles.onboarding_step) no se actualiza correctamente
  - Usuario puede crear facturas sin completar perfil mínimo
  - Datos parciales del onboarding se pierden si usuario abandona a mitad
- **Impact:** Medium
- **Mitigation:**
  - Tests E2E del flujo completo de onboarding
  - Validar que onboarding_step incrementa correctamente (1→2→3→4→5)
  - Probar abandono en cada paso y retorno posterior

---

## Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1:** Estructura de almacenamiento de dirección

- **Found in:** STORY-SQ-10 vs DB schema
- **Question for Dev:** ¿El campo `address` (TEXT) almacenará JSON estructurado o texto plano? La story requiere campos separados (street, city, state, postal_code, country) pero la DB tiene un solo campo TEXT
- **Impact if not clarified:** Si es texto plano, no se puede filtrar/buscar por país. Si es JSON, necesita parsing en frontend y backend

**Ambiguity 2:** Storage de datos de transferencia bancaria

- **Found in:** STORY-SQ-12 vs DB schema
- **Question for Dev:** `payment_methods.value` es VARCHAR único. ¿Cómo se almacenan múltiples campos de transferencia bancaria (banco, cuenta, CLABE/CBU)? ¿JSON en `value`? ¿Columnas adicionales?
- **Impact if not clarified:** Afecta diseño de formulario, validación y rendering en PDF

**Ambiguity 3:** País del usuario como driver de validación

- **Found in:** STORY-SQ-11 (Tax ID) y STORY-SQ-12 (Payment Methods - CLABE/CBU)
- **Question for PO/Dev:** ¿Dónde se configura el país del usuario? No existe columna `country` en `business_profiles`. ¿Se infiere del country code del teléfono (SQ-10)? ¿Es un campo separado? ¿O se selecciona en el formulario de Tax ID?
- **Impact if not clarified:** Sin país, no se puede determinar: qué regex usar para tax ID, qué label mostrar (RFC/NIT/CUIT), qué campos bancarios mostrar (CLABE/CBU)

---

### Missing Information

**Missing 1:** Columna `country` en business_profiles

- **Needed for:** Validación dinámica de tax ID y campos bancarios por país
- **Suggestion:** Agregar columna `country` (varchar o enum) a `business_profiles`

**Missing 2:** Columna `tax_id_type` en business_profiles

- **Needed for:** Almacenar el tipo de identificación fiscal (RFC, NIT, CUIT, RUT, RUC)
- **Suggestion:** Agregar columna `tax_id_type` (varchar) a `business_profiles`

**Missing 3:** Columna `is_active` en payment_methods

- **Needed for:** Toggle active/inactive sin eliminar (SQ-12 AC7)
- **Suggestion:** Agregar columna `is_active` (boolean, default true) a `payment_methods`

**Missing 4:** Constraint de largo en business_name

- **Needed for:** Enforcement de 100 caracteres máximo a nivel DB
- **Suggestion:** Agregar CHECK constraint `length(business_name) <= 100`

---

### Suggested Improvements (Before Implementation)

**Improvement 1:** Agregar migración de DB como pre-requisito del epic

- **Story Affected:** Todas (SQ-8 a SQ-12)
- **Current State:** DB schema no tiene columnas necesarias para tax_id_type, country, is_active
- **Suggested Change:** Crear tarea técnica de migración que agregue columnas faltantes ANTES de stories
- **Benefit:** Evita refactoring durante implementación de stories

**Improvement 2:** Clarificar estructura de `address` en SQ-10

- **Story Affected:** STORY-SQ-10
- **Current State:** AC menciona campos separados pero DB tiene TEXT plano
- **Suggested Change:** Definir si address será JSONB (structured) o columnas separadas. Actualizar AC con formato específico
- **Benefit:** Dev sabe exactamente qué implementar, QA sabe qué validar

**Improvement 3:** Agregar AC de error handling en SQ-9 (Logo Upload)

- **Story Affected:** STORY-SQ-9
- **Current State:** ACs cubren happy path y validación básica, pero no errores de red/storage
- **Suggested Change:** Agregar AC para: upload falla por error de red (retry/error message), storage quota excedida, timeout
- **Benefit:** Mejor UX en condiciones adversas

---

## Test Strategy

### Test Scope

**In Scope:**

- Functional testing de cada campo del perfil (UI + API + DB)
- Validation testing (formatos, límites, required/optional)
- Integration testing (perfil ↔ factura PDF, perfil ↔ onboarding)
- File upload testing (logo: formatos, tamaños, resize)
- Security testing (RLS: user isolation, Storage bucket policies)
- Country-specific validation (tax ID formats: RFC, NIT, CUIT)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness (formularios adaptados)

**Out of Scope (For This Epic):**

- Tax ID verification via external APIs (SAT, DIAN, AFIP)
- Payment processing integration (Stripe, MercadoPago API)
- Multiple business profiles per user
- Image cropping functionality
- QR code generation for payment methods
- Address autocomplete (Google Places)

---

### Test Levels

#### Unit Testing

- **Coverage Goal:** > 80% code coverage
- **Focus Areas:**
  - Zod validation schemas (business name length, email format, phone E.164, tax ID regex per country)
  - Image resize utility function
  - Payment method type-specific validation logic
- **Responsibility:** Dev team

#### Integration Testing

- **Coverage Goal:** All 6 integration points identified above
- **Focus Areas:**
  - Frontend ↔ Profile API (all CRUD operations)
  - Frontend ↔ Supabase Storage (logo upload/delete)
  - Profile Data ↔ Invoice PDF rendering
  - Onboarding Step ↔ Profile Completion
- **Responsibility:** QA + Dev

#### End-to-End (E2E) Testing

- **Coverage Goal:** Complete onboarding flow + invoice with profile data
- **Tool:** Playwright
- **Focus Areas:**
  - Onboarding completo: business name → contact → logo → payment → summary
  - Settings page: editar todos los campos del perfil
  - Invoice generation con datos de perfil completos
- **Responsibility:** QA team

#### API Testing

- **Coverage Goal:** 100% de endpoints de profile y payment methods
- **Tool:** Playwright API
- **Focus Areas:**
  - Contract validation contra api-contracts.yaml
  - Status codes correctos (200, 201, 400, 401, 404)
  - Error handling y validation errors
  - RLS enforcement (user A no puede ver datos de user B)
- **Responsibility:** QA team

---

### Test Types per Story

**Positive Test Cases:**

- Happy path de cada operación CRUD
- Datos válidos para cada country (MX, CO, AR)
- Múltiples payment methods configurados

**Negative Test Cases:**

- Input inválido (email, phone, tax ID formats)
- Archivos no soportados para logo
- Archivos oversized (>2MB)
- Campos requeridos vacíos

**Boundary Test Cases:**

- Business name: 0, 1, 99, 100, 101 caracteres
- Logo: exactamente 2MB, just over 2MB
- Tax ID: largo exacto por país (13/12 chars RFC, 10 digits NIT, 11 digits CUIT)
- Payment methods: 0 (no allowed for invoicing), 1, muchos

**Exploratory Testing:**

- Flujo de onboarding con datos parciales y abandono/retorno
- Edición rápida de perfil mientras se genera un PDF
- Concurrencia: editar perfil desde dos pestañas simultáneamente

---

## Test Cases Summary by Story

### STORY-SQ-8: Business Name Configuration

**Complexity:** Low
**Estimated Test Cases:** 7

- Positive: 3 (set name, update name, name on invoice)
- Negative: 2 (empty name, >100 chars)
- Boundary: 2 (exactly 100 chars, 1 char)

**Rationale for estimate:** Simple text input with validation. Low integration complexity.
**Parametrized Tests Recommended:** No - scenarios are distinct enough

---

### STORY-SQ-9: Logo Upload

**Complexity:** Medium-High
**Estimated Test Cases:** 12

- Positive: 3 (upload PNG, upload JPG, logo on invoice PDF)
- Negative: 3 (invalid format, oversized file, corrupt image)
- Boundary: 3 (exactly 2MB, various dimensions, very small image)
- Integration: 3 (Supabase Storage upload, replace logo, delete logo + storage cleanup)

**Rationale for estimate:** File upload involves client-side processing, storage integration, and PDF rendering. Multiple failure modes.
**Parametrized Tests Recommended:** Yes - file format/size validation can be parametrized

---

### STORY-SQ-10: Contact Information

**Complexity:** Medium
**Estimated Test Cases:** 10

- Positive: 4 (add email, add phone, add address, contact on invoice)
- Negative: 3 (invalid email, invalid phone format, missing required email)
- Boundary: 2 (very long address, phone with different country codes)
- Integration: 1 (contact info rendering on PDF)

**Rationale for estimate:** Multiple fields with individual validations. Phone E.164 format adds complexity.
**Parametrized Tests Recommended:** Yes - email and phone validation with valid/invalid datasets

---

### STORY-SQ-11: Tax ID Configuration

**Complexity:** High
**Estimated Test Cases:** 14

- Positive: 4 (RFC Mexico, NIT Colombia, CUIT Argentina, tax ID on invoice)
- Negative: 4 (invalid RFC format, invalid NIT format, invalid CUIT format, wrong length)
- Boundary: 3 (RFC 12 vs 13 chars, NIT verification digit, CUIT format XX-XXXXXXXX-X)
- Edge: 3 (skip tax ID, change country after entering tax ID, dynamic label change)

**Rationale for estimate:** Country-specific validation is complex with 3+ regex patterns. Dynamic UI behavior based on country selection.
**Parametrized Tests Recommended:** Yes - tax ID validation per country is ideal for parametrization

---

### STORY-SQ-12: Payment Methods Configuration

**Complexity:** High
**Estimated Test Cases:** 18

- Positive: 5 (add bank transfer, add PayPal, add MercadoPago, add custom, methods on invoice)
- Negative: 4 (invalid PayPal email, empty required fields, delete last method, invalid bank details)
- Boundary: 2 (many payment methods, very long instructions)
- Integration: 4 (CRUD API, toggle active/inactive, at least one required for invoicing, country-specific bank fields)
- Edge: 3 (reorder methods, default method selection, method appears/disappears on invoice toggle)

**Rationale for estimate:** Most complex story (5 SP). Multiple payment types with different validation rules, CRUD operations, toggle state, and invoice integration.
**Parametrized Tests Recommended:** Yes - payment type creation can be parametrized across types

---

### Total Estimated Test Cases for Epic

**Total:** 61

**Breakdown:**

- Positive: 19
- Negative: 16
- Boundary: 12
- Integration: 8
- Edge: 6

---

## Test Data Requirements

### Test Data Strategy

**Valid Data Sets:**

- User: Freelancer with complete auth (email verified, logged in)
- Business Name: "Studio Creativo de Carlos", "Valentina Dev LLC", "Consultoría Fernández & Asociados"
- Logo: PNG 200x200 (100KB), JPG 400x400 (1.5MB), PNG 800x600 (1.9MB)
- Contact: email: "carlos@estudio.mx", phone: "+5215512345678", address: "Av. Reforma 123, CDMX"
- Tax IDs: RFC "MECC920101ABC" (13 chars), NIT "900123456-7", CUIT "20-12345678-9"
- Payment Methods: bank_transfer (Banco: "BBVA", CLABE: "012345678901234567"), paypal ("val@dev.co"), mercado_pago (alias: "val.dev"), other (name: "Wise", instructions: "Transfer to...")

**Invalid Data Sets:**

- Email: "not-an-email", "@missing.com", "user@", ""
- Phone: "12345" (too short), "abc" (non-numeric), "+999999999999999" (too long)
- Tax ID: "ABC" (wrong format), "1234567890123456" (too long), "XX-XXXX-X" (invalid CUIT)
- Logo: PDF file, GIF file, 5MB PNG, 0-byte file, SVG file
- Business Name: "" (empty), "A" * 101 (too long), only spaces

**Boundary Data Sets:**

- Business Name: exactly 100 chars, exactly 1 char
- Logo: exactly 2,097,152 bytes (2MB), 2,097,153 bytes (2MB+1)
- RFC: 12 chars (moral), 13 chars (física)
- CUIT: exactly 11 digits
- NIT: 9 digits + 1 verification digit

**Test Data Management:**

- Use Faker.js for realistic data generation
- Create data factories for business profiles and payment methods
- Clean up test data after execution
- No hardcoded static data in automated tests

---

### Test Environments

**Staging Environment:**

- URL: https://staging-upexsoloq.vercel.app
- Database: Supabase staging (czuusjchqpgvanvbdrnz)
- Storage: Supabase Storage staging bucket `logos`
- **Purpose:** Primary testing environment

**Local Environment:**

- URL: http://localhost:3000
- **Purpose:** Development testing and debugging

---

## Entry/Exit Criteria

### Entry Criteria (Per Story)

- [ ] Story fully implemented and deployed to staging
- [ ] Code review approved
- [ ] Unit tests passing (>80% coverage)
- [ ] Dev smoke testing confirms basic functionality
- [ ] DB migrations applied (schema gaps resolved)
- [ ] Supabase Storage bucket `logos` configured with RLS
- [ ] API documentation updated

### Exit Criteria (Per Story)

- [ ] All test cases executed
- [ ] Critical/High priority: 100% passing
- [ ] Medium/Low priority: ≥95% passing
- [ ] All critical/high bugs resolved and verified
- [ ] Regression testing passed
- [ ] NFRs validated (performance, security)

### Epic Exit Criteria

- [ ] ALL stories meet individual exit criteria
- [ ] Integration testing across all stories complete (profile → invoice PDF)
- [ ] E2E testing of onboarding flow complete
- [ ] API contract testing complete
- [ ] Security testing complete (RLS, storage isolation)
- [ ] Exploratory testing session completed
- [ ] No critical/high bugs open
- [ ] QA sign-off approved

---

## Non-Functional Requirements Validation

### Performance Requirements

**NFR-P-001:** Page load < 2s (LCP)

- **Target:** Settings page loads in < 2s
- **Test Approach:** Lighthouse audit on settings page
- **Tools:** Lighthouse, WebPageTest

**NFR-P-002:** API response < 500ms (p95)

- **Target:** Profile CRUD API endpoints respond in < 500ms
- **Test Approach:** Measure response times across multiple requests
- **Tools:** Playwright API timing

**NFR-P-003:** Logo upload < 3s

- **Target:** Upload + resize + storage save completes in < 3s for 2MB file
- **Test Approach:** Measure end-to-end upload time with 2MB file
- **Tools:** Playwright timing

### Security Requirements

**NFR-S-001:** Row Level Security

- **Requirement:** User A cannot see/edit User B's business profile or payment methods
- **Test Approach:** Create 2 users, attempt cross-user data access via API
- **Tools:** Playwright API with different auth tokens

**NFR-S-002:** Storage Bucket Security

- **Requirement:** User A cannot access User B's logos in Supabase Storage
- **Test Approach:** Attempt to access logo URL with different user's JWT
- **Tools:** Direct Supabase Storage API calls

### Usability Requirements

**NFR-U-001:** WCAG 2.1 Level AA

- **Requirement:** All forms accessible via keyboard, proper ARIA labels, 4.5:1 contrast
- **Test Approach:** Keyboard navigation testing, axe-core audit
- **Tools:** axe-core, manual testing

---

## Regression Testing Strategy

**Regression Scope:**

- [ ] Authentication flow: login/logout should work with profile changes
- [ ] Invoice creation: existing invoices should not be affected by profile updates
- [ ] Onboarding: changes to profile should correctly update onboarding step
- [ ] Dashboard: profile completion status should reflect correctly

**Regression Test Execution:**

- Run automated regression suite before starting epic testing
- Re-run after all stories complete
- Focus on invoice generation with profile data

---

## Testing Timeline Estimate

**Estimated Duration:** 1.5 sprints

**Breakdown:**

- Test case design (this document + ATPs): 2 days
- Test data preparation: 1 day
- Test execution (per story): 1-2 days per story (5 stories = 5-10 days)
- Regression testing: 1 day
- Bug fixing cycles: 2 days (buffer)
- Exploratory testing: 1 day

**Dependencies:**

- Depends on: EPIC-SQ-1 (Authentication) - user must be able to login
- Blocks: EPIC-SQ-13 (Invoice Creation) - invoices need profile data

---

## Tools & Infrastructure

**Testing Tools:**

- E2E Testing: Playwright
- API Testing: Playwright API
- Unit Testing: Vitest
- Performance Testing: Lighthouse
- Security Testing: Manual RLS validation
- Test Data: Faker.js

**CI/CD Integration:**

- [ ] Tests run on PR creation
- [ ] Tests run on merge to staging
- [ ] Smoke tests post-deployment

**Test Management:**

- Jira (test cases linked to stories via comments)
- Local mirror files (acceptance-test-plan.md per story)

---

## Metrics & Reporting

**Test Metrics to Track:**

- Test cases executed vs. total
- Test pass rate
- Bug detection rate
- Time to test per story

**Reporting Cadence:**

- Per Story: Test completion report
- Per Epic: Comprehensive QA sign-off report

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-7-business-profile/epic.md`
- **Stories:** `.context/PBI/epics/EPIC-SQ-7-business-profile/stories/STORY-*/story.md`
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/` (all files)
- **SRS:** `.context/SRS/` (all files)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`

---

## Notes & Assumptions

**Assumptions:**

- DB schema gaps will be resolved via migration BEFORE story implementation
- Supabase Storage bucket `logos` will be created and configured
- User authentication is already working (EPIC-SQ-1 dependency)
- Invoice PDF generation is available for integration testing (EPIC-SQ-13 or mock)

**Constraints:**

- MVP: Only Spanish (LATAM), USD currency
- Tax ID: Local validation only (no external API verification)
- Image processing: Client-side only (no server-side processing)

**Known Limitations:**

- Cannot validate tax IDs against government databases (SAT, DIAN, AFIP)
- Cannot test logo rendering in PDF without PDF generation being implemented
- Payment method validation is format-only, not connectivity

**Exploratory Testing Sessions:**

- Recommended: 2 sessions
  - Session 1: Complete onboarding flow with different country profiles (MX, CO, AR)
  - Session 2: Edit all profile sections and verify invoice PDF updates correctly
