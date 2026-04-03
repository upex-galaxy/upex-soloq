# Acceptance Test Plan: STORY-SQ-68 - Client Email Deliverability Validation

**Date:** 2026-03-24
**QA Engineer:** Alfonso Hernandez
**Story Jira Key:** SQ-68
**Epic:** EPIC-SQ-13 - Client Management
**Status:** Draft — ⚠️ MULTIPLE BLOCKERS (see Step 2)

---

## 📋 Step 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Valentina (Desarrolladora Internacional) — gestiona 3-5 clientes internacionales. Un invoice bounceado a un cliente internacional puede significar semanas de retraso en el cobro. Esta feature le da confianza de que su email llegará.
- **Secondary:** Carlos (Diseñador Organizado) — agrega clientes rápido antes de facturar. Cualquier fricción extra en el formulario (validaciones lentas, warnings confusos) puede frustrarle. El UX de "warn vs block" impacta directamente su adoption.
- **Tertiary:** Andrés (Consultor Tradicional) — 8-12 clientes, muchos corporativos con dominios internos. El riesgo de falsos positivos (empresa legítima flaggeada por no tener MX público) es alto para su caso de uso.

**Business Value:**

- **Value Proposition:** Reduce el porcentaje de facturas que nunca llegan al cliente por email inválido. Si el sistema detecta el problema antes del envío, el freelancer puede corregirlo sin perder días esperando un rebote.
- **Business Impact:** Impacta directamente el KPI de "facturas marcadas como pagadas". Una factura que no llega no se puede cobrar. También reduce churn causado por frustración de "envié la factura y nunca la recibieron".

**Related User Journey:**

- **Journey 1:** "Registro y Primera Factura" — Step 8 (Add client) y Step 9 (Create invoice) dependen de que el email del cliente sea válido para el envío.
- **Journey 2:** "Seguimiento y Cobro" — AC-6 y AC-7 aplican al momento de enviar/re-enviar factura a cliente existente.

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**
- Page/Form: `/clients/new` y `/clients/[id]/edit` (formulario de cliente)
- Components: `ClientForm` — campo `email` con validación inline
- UX states: loading indicator (mientras ocurre MX check), warning banner/toast, typo suggestion UI, confirmation dialog/checkbox para proceed

**Backend:**
- Validación de formato: Zod schema en `POST /api/clients` y `PUT /api/clients/:id`
- MX record lookup: lógica server-side (DNS query) — ⚠️ **SIN ENDPOINT DEDICADO EN api-contracts.yaml**
- Disposable domain detection: lista estática o servicio externo — ⚠️ **NO DEFINIDO**
- Typo suggestion: lógica de fuzzy matching contra dominios conocidos — ⚠️ **NO DEFINIDO**

**Database:**
- Tabla `clients`: campos actuales no incluyen `email_verification_status`, `email_verified_at` ni `last_successful_delivery_at` — ⚠️ **SCHEMA CHANGE REQUERIDO, NO DOCUMENTADO**
- Para AC-6 y AC-7 ("last successful email", "verified by previous delivery") se necesita tracking de entregas — ⚠️ **DEPENDENCIA DE RESEND WEBHOOKS O TABLA NUEVA**

**External Services:**
- DNS/MX lookup: built-in Node.js `dns.resolve` o servicio externo
- Disposable email list: static JSON (e.g. disposable-email-domains) o API externa
- ⚠️ Scope excluye explícitamente paid verification API (ZeroBounce, Hunter.io)

**Integration Points:**
- `POST /api/clients` → Zod validation → MX check (new logic) → DB insert
- `PUT /api/clients/:id` → misma cadena de validación
- Invoice send flow → check `clients.email_verification_status` before Resend call

---

### Story Complexity Analysis

**Overall Complexity:** High ⚠️ (Story Points: 3 — **SUBESTIMADO**)

**Complexity Factors:**

- Business logic complexity: High — 5 tipos de validación distintos con reglas de UX diferentes (block, warn+confirm, warn+ack, suggest, pass)
- Integration complexity: High — MX DNS lookup asíncrono, disposable list, typo detection, Resend delivery tracking
- Data validation complexity: High — múltiples caminos de validación con estados intermedios y fallbacks no definidos
- UI complexity: High — loading state durante MX check, 3 tipos de UX response (error blocking, warning modal, suggestion inline)

**Estimated Test Effort:** High
**Rationale:** 5 escenarios de validación distintos × variaciones de estado = alta cobertura necesaria. Además, los ACs 6 y 7 implican una integración con el flujo de envío de facturas (EPIC-SQ-38) que eleva la complejidad de integración a nivel cross-epic.

---

### Epic-Level Context (From Feature Test Plan en Jira — Comment de Ely, 2026-01-27)

**⚠️ IMPORTANTE:** SQ-68 fue creada el 2026-02-03, DESPUÉS del Feature Test Plan del epic (2026-01-27). Por lo tanto, esta historia **NO APARECE** en los estimados de test cases del epic (53 total). Es una adición posterior que introduce riesgos nuevos no evaluados a nivel de epic.

**Critical Risks Relevantes del Epic:**

- **RLS Policies — Data Isolation Failure (HIGH)**
  - **Relevance to This Story:** ✅ Aplica — los resultados de validación de email (warnings, estado de verificación) deben estar aislados por `user_id`. Un usuario no debe ver el estado de email de los clientes de otro.

- **Unique Constraint per User (`UNIQUE(user_id, email)`) (MEDIUM)**
  - **Relevance to This Story:** ✅ Aplica — la validación de deliverability ocurre antes de la inserción; si el email falla MX check pero pasa formato, ¿se inserta igual? ¿Se guarda el estado de advertencia? Esto interactúa con el constraint.

**Integration Points del Epic Relevantes:**

- Frontend ↔ `POST /api/clients`
  - **Applies to This Story:** ✅ Yes — la validación de deliverability está embedida en este flujo
- API ↔ PostgreSQL con RLS
  - **Applies to This Story:** ✅ Yes — si se agrega campo de `email_verification_status` al schema

**Nuevos Riesgos Introducidos por SQ-68 (NO en Feature Test Plan):**

- **External service dependency (MX lookup):** Si el servicio de DNS falla o tiene latencia alta, el formulario de cliente queda bloqueado → impacta a TODOS los usuarios que agregan clientes.
- **False positive rate:** Clientes corporativos con dominios internos (sin MX público) serían flaggeados incorrectamente — impacta a Andrés que maneja clientes enterprise.
- **Cross-epic dependency (AC-6/AC-7):** Requiere que el flujo de invoice sending registre entregas exitosas — esto es una dependencia de EPIC-SQ-38 (Send Invoice) que puede no estar implementada aún.

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** Extensión del flujo de Add/Edit Client (SQ-14 y SQ-16) con una capa de validación avanzada de email. No es una story independiente — modifica el comportamiento de todos los formularios de cliente.
- **Inherited Risks:** RLS isolation, unique constraint interaction.
- **Unique Considerations:** Es la única story del epic con dependencia de servicios externos (DNS) y con cross-epic dependency (delivery tracking). Si se bloquea por arquitectura, retrasa también SQ-14 y SQ-16.

---

## 🚨 Step 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Timing de la validación — ¿cuándo se ejecuta el MX check?

- **Location in Story:** No especificado en ningún AC ni scope
- **Question for Dev:** ¿La validación de MX ocurre en tiempo real (on blur del campo email), al hacer submit del formulario, o mediante un endpoint dedicado de pre-validación? Los MX lookups pueden tardar 100-3000ms — el UX varía enormemente.
- **Impact on Testing:** Sin saber el timing, no podemos diseñar tests de loading state, timeout, ni flujo de UX secuencial.
- **Suggested Clarification:** Definir en scope: "MX check occurs on form submit (not real-time). Loading state shown during check. Timeout: Xms."

**Ambiguity 2:** Mecánica exacta de "confirmation" (AC-3) y "acknowledgment" (AC-4).

- **Location in Story:** AC-3: "Allows me to proceed if I confirm" / AC-4: "Allows me to proceed with acknowledgment"
- **Question for PO/Dev:** ¿Qué UI implementa la confirmación? ¿Un modal con botón "Proceed anyway"? ¿Un checkbox "I understand this may be a disposable email"? ¿El mismo botón de submit se convierte en "Save anyway"?
- **Impact on Testing:** Los test steps de UI no pueden ser determinísticos sin saber qué elemento hacer clic para "confirmar" vs "cancelar".
- **Suggested Clarification:** Agregar AC específico con el componente UI: "A modal dialog appears with options: 'Cancel' and 'Save anyway'."

**Ambiguity 3:** ¿La validación aplica también al flujo de EDIT (PUT /api/clients/:id)?

- **Location in Story:** Todos los ACs dicen "I am adding a new client" — ninguno menciona editar.
- **Question for PO:** Si un cliente existente tiene email inválido y el usuario lo edita, ¿se re-valida el email? ¿Se re-ejecuta el MX check aunque el email no haya cambiado?
- **Impact on Testing:** Sin esta respuesta, el scope de pruebas se duplica (o se reduce) significativamente.
- **Suggested Clarification:** Agregar AC: "When editing a client, email deliverability is re-validated only if the email field is modified."

**Ambiguity 4:** Comportamiento cuando el servicio de MX lookup no está disponible (timeout/error).

- **Location in Story:** No cubierto en ningún AC ni en scope
- **Question for Dev:** Si el DNS lookup falla (timeout, network error), ¿qué ocurre? ¿Se bloquea el formulario? ¿Se permite submit con un warning genérico? ¿Se silencia el error y se procede?
- **Impact on Testing:** Sin un fallback definido, cualquier test de MX check es frágil (puede pasar o fallar según disponibilidad del servicio externo en staging).
- **Suggested Clarification:** Add to scope: "If MX lookup fails/times out (>Xms), the system proceeds with format validation only and logs the failure silently."

**Ambiguity 5:** Fuente de "last successful email" y "verified by previous delivery" (ACs 6 y 7).

- **Location in Story:** AC-6: "Shows last successful email to this client (if any)" / AC-7: "verified by previous successful delivery"
- **Question for Dev:** ¿Dónde se persiste esta información? ¿Hay un campo `email_verified_at` o `last_delivery_at` en la tabla `clients`? ¿O se consulta contra logs de Resend? Esta información no existe en el schema actual documentado.
- **Impact on Testing:** No podemos testear AC-6/7 sin saber qué dato leer de la DB para preparar el precondition.
- **Suggested Clarification:** Definir schema change: "Add `email_delivery_confirmed_at` (timestamp, nullable) to `clients` table. Set by Resend webhook on successful delivery."

---

### Missing Information / Gaps

**Gap 1:** No hay endpoint dedicado de email validation en api-contracts.yaml.

- **Type:** Technical Details / API Contract
- **Why It's Critical:** No sabemos si la validación es parte de `POST /api/clients` (síncrona, bloquea el submit) o si hay un endpoint `POST /api/clients/validate-email` (pre-validation, on blur). El contract testing depende de esto.
- **Suggested Addition:** Agregar endpoint a api-contracts.yaml o documentar que la validación está embebida en el request de creación.
- **Impact if Not Added:** No podemos escribir API tests de deliverability de forma aislada.

**Gap 2:** No hay schema change documentado para tracking de verificación en tabla `clients`.

- **Type:** Technical Details / Database Schema
- **Why It's Critical:** ACs 6 y 7 requieren persistir el estado de "email verified by delivery". Sin schema change, no hay precondition posible para estos tests.
- **Suggested Addition:** Documentar en SRS: `clients.email_verified_at`, `clients.email_verification_status` (enum: unverified, format_valid, mx_valid, delivery_confirmed, warned_disposable, warned_no_mx).
- **Impact if Not Added:** ACs 6 y 7 son imposibles de testear.

**Gap 3:** No hay AC para el escenario donde la validación de format pasa pero el dominio es corporativo sin MX público.

- **Type:** Edge Case / Business Rule
- **Why It's Critical:** Andrés tiene clientes enterprise (john@acme.internal, john@bigcorp.local). Estos son emails reales y válidos que fallarían el MX check. Si el sistema los bloquea/advierte, Andrés no puede usarlo para sus clientes más importantes.
- **Suggested Addition:** AC: "Given I enter an email with a corporate internal domain that has no public MX records, the warning message should acknowledge that corporate email servers may not be publicly discoverable."

**Gap 4:** No hay AC para el flujo de send invoice (AC-6 está incompleto — falta el happy path cuando la entrega previa fue exitosa y el nuevo envío también pasa).

- **Type:** Acceptance Criteria — incomplete coverage
- **Why It's Critical:** AC-6 solo cubre el caso de fallo. AC-7 cubre el caso de éxito previo. Pero no está claro si ambas ACs aplican al mismo flujo (send invoice) o si AC-7 aplica al formulario de cliente (add/edit).
- **Suggested Addition:** Clarify that AC-6 applies during invoice send, AC-7 applies during invoice send AND client form edit.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Email con subaddress (john+invoice@gmail.com).

- **Scenario:** El usuario ingresa una dirección de subaddress válida (RFC permitida). El dominio gmail.com tiene MX válido. ¿Se trata igual que john@gmail.com? ¿O el `+tag` dispara algún falso positivo en la detección de disposable?
- **Expected Behavior:** Aceptado sin warnings — subaddressing es RFC-válido y Gmail lo soporta.
- **Criticality:** Medium
- **Action Required:** Add to test cases.

**Edge Case 2:** Dominio con typo muy similar a disposable (tempmai.com, gmial.com).

- **Scenario:** "gmial.com" no es un dominio real pero tampoco está en la lista de disposables. ¿Aparece la sugerencia de typo (AC-5) Y/O la advertencia de no-MX (AC-4) al mismo tiempo?
- **Expected Behavior:** Solo una advertencia a la vez (typo suggestion tiene prioridad sobre no-MX). Needs PO clarification.
- **Criticality:** Medium — conflicto entre AC-4 y AC-5
- **Action Required:** Ask PO: precedencia entre warnings cuando múltiples condiciones aplican simultáneamente.

**Edge Case 3:** El mismo email, distintos usuarios (UNIQUE constraint interaction).

- **Scenario:** User A tiene cliente con email "john@acme.com". User B intenta crear cliente con el mismo email. La validación de deliverability pasa (MX válido) pero... ¿el UNIQUE constraint es por `user_id`, por lo que User B SÍ puede crear el cliente? Confirmar.
- **Expected Behavior:** User B puede crear cliente con email "john@acme.com" (UNIQUE es por `user_id + email`, no solo `email`).
- **Criticality:** High — puede causar confusión si el dev implementa UNIQUE global.
- **Action Required:** Validar en test de integración.

**Edge Case 4:** Typo correction aceptada pero el email sugerido también falla MX check.

- **Scenario:** Usuario tiene "john@gmial.com". Sistema sugiere "john@gmail.com". Usuario acepta la sugerencia. ¿Se re-ejecuta el MX check del email corregido antes de guardar?
- **Expected Behavior:** Sí — al aceptar la sugerencia, el sistema re-valida el nuevo email.
- **Criticality:** Medium
- **Action Required:** Add to test cases.

**Edge Case 5:** El usuario deja el campo email vacío (required vs optional).

- **Scenario:** ¿El campo email es obligatorio en el formulario de cliente? El scope y ACs asumen que siempre hay un email. Pero la tabla `clients` podría permitir null (freelancers que solo tienen WhatsApp de su cliente).
- **Expected Behavior:** Needs PO clarification — ¿es email required en el formulario?
- **Criticality:** High — si email es opcional, toda la lógica de deliverability tiene que manejar el estado "no email provided".
- **Action Required:** Ask PO urgently.

---

### Testability Validation

**Is this story testable as written?** ⚠️ Partially — con los ACs actuales de la story.md local. El Jira tiene "To be refined" como AC.

**Testability Issues:**

- [x] Acceptance criteria are vague or subjective — "confirmation" y "acknowledgment" no tienen definición de componente UI
- [x] Expected results are not specific enough — no hay error messages exactos para ACs 3, 4, 5
- [x] Missing technical details — no API endpoint definido para deliverability check aislado
- [x] Cannot be tested in isolation — ACs 6 y 7 dependen de infrastructure de delivery tracking (Resend webhooks) que puede no estar implementada
- [x] Missing error scenarios — no fallback behavior para MX service timeout

**⚠️ BLOCKER RECOMMENDATION:** Esta story tiene al menos **3 blockers arquitectónicos** que deben resolverse antes de entrar a development. Se recomienda llevarla a refinement con Dev Lead y PO antes de moverla a Ready for Dev.

---

## ✅ Step 3: Refined Acceptance Criteria

### Scenario 1: Valid email with valid MX domain is accepted

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User is authenticated and on the Add Client form
  - Network is available for DNS lookup

- **When:**
  - User enters email `"john@validcompany.com"` (domain with valid MX records)
  - User submits the form

- **Then:**
  - Format validation passes
  - MX record check returns valid
  - Client is saved successfully (`201 Created` from API)
  - No warning or suggestion is shown
  - User is redirected to client detail or client list

---

### Scenario 2: Invalid email format (no TLD) is blocked

**Type:** Negative
**Priority:** Critical

- **Given:**
  - User is on the Add Client form

- **When:**
  - User enters email `"john@invalid"` (no TLD, malformed)
  - User attempts to submit the form

- **Then:**
  - Form submission is **blocked** (cannot proceed)
  - Inline error shown: `"Please enter a valid email address"`
  - No MX check is performed (format validation fails fast)
  - No client is created in the database
  - API response (if reached): `400 Bad Request`

---

### Scenario 3: Disposable email detected — warning + optional proceed

**Type:** Negative / Warning
**Priority:** High

- **Given:**
  - User is on the Add Client form
  - `"tempmail.com"` is in the disposable email domain list

- **When:**
  - User enters email `"client@tempmail.com"`
  - User submits the form

- **Then:**
  - Format validation passes
  - System detects domain is in disposable list
  - Warning UI appears: `"This appears to be a temporary email address"`
  - Form is **NOT permanently blocked** — a proceed option is available
  - **⚠️ NOTE:** Exact UI for "confirmation" (modal, checkbox, button change) pending Dev decision.
  - If user proceeds with confirmation: client is saved, email stored with `email_verification_status = 'warned_disposable'`
  - If user cancels: form remains open, no save

---

### Scenario 4: Domain has no MX records — warning + optional proceed

**Type:** Negative / Warning
**Priority:** High

- **Given:**
  - User is on the Add Client form
  - Domain `"nodomain.xyz"` resolves but has no MX records in DNS

- **When:**
  - User enters email `"client@nodomain.xyz"` and submits

- **Then:**
  - Format validation passes
  - MX lookup returns no MX records for domain
  - Warning shown: `"This email domain may not receive emails"`
  - User can proceed with acknowledgment (same mechanic as Scenario 3 — ⚠️ pending Dev)
  - If proceeds: client saved with `email_verification_status = 'warned_no_mx'`

---

### Scenario 5: Common typo suggestion shown and user can accept or keep original

**Type:** Positive (UX enhancement)
**Priority:** Medium

- **Given:**
  - User is on the Add Client form

- **When:**
  - User enters email `"client@gmial.com"` (typo of gmail.com)
  - User submits or blurs the email field (⚠️ trigger timing pending Dev)

- **Then:**
  - System detects `"gmial.com"` is a common typo of `"gmail.com"`
  - Inline suggestion appears: `"Did you mean client@gmail.com?"`
  - Two options visible: `"Yes, use gmail.com"` and `"No, keep gmial.com"`
  - If user accepts: email field updated to corrected address, MX re-validated
  - If user keeps original: form proceeds with original (MX check runs on original)

---

### Scenario 6: Invoice send warning when client email fails deliverability

**Type:** Negative / Warning
**Priority:** Medium

- **Given:**
  - User has a client with email that fails current MX check
  - Client has no prior successful delivery recorded (`email_delivery_confirmed_at` is null)

- **When:**
  - User attempts to send an invoice to this client

- **Then:**
  - System performs deliverability check on client's email
  - Warning shown before send: `"This email may not be deliverable"`
  - If client has no prior successful delivery: no additional info shown
  - If client has prior successful delivery: shows `"Last successful delivery: [date]"`
  - User can proceed or cancel the send
  - **⚠️ NOTE:** This AC depends on `email_delivery_confirmed_at` being tracked — architectural dependency pending.

---

### Scenario 7: No warning shown for client with prior successful delivery

**Type:** Positive
**Priority:** Medium

- **Given:**
  - Client exists with `email_delivery_confirmed_at` set (e.g., `"2026-03-10T10:00:00Z"`)

- **When:**
  - User creates a new invoice and sends it to this client

- **Then:**
  - No deliverability warning is shown
  - Invoice send proceeds directly
  - **⚠️ NOTE:** Depends on delivery tracking infrastructure — pending architecture decision.

---

### Scenario 8: Subaddressed email is accepted without warnings

**Type:** Boundary / Edge Case
**Priority:** Medium

- **Given:**
  - User enters `"john+invoices@gmail.com"` (RFC-valid subaddress)

- **When:**
  - User submits the Add Client form

- **Then:**
  - Format validation passes (subaddressing is RFC 5321 compliant)
  - MX check validates `gmail.com` domain → passes
  - No disposable warning (gmail.com is not disposable)
  - No typo suggestion (gmail.com is not a typo)
  - Client saved successfully

---

### Scenario 9: International domain email accepted without false positive warnings

**Type:** Boundary
**Priority:** Medium

- **Given:**
  - User enters `"contacto@empresa.com.mx"` (Mexican company domain with valid MX)

- **When:**
  - User submits Add Client form

- **Then:**
  - MX check resolves the `.com.mx` domain correctly
  - No false warning about "international domain"
  - Client saved successfully

---

### Scenario 10: MX check service timeout — fallback behavior

**Type:** Edge Case / Negative
**Priority:** High

- **Given:**
  - DNS lookup service is unavailable or times out (simulated via test environment)

- **When:**
  - User enters a valid format email and submits

- **Then:**
  - System handles timeout gracefully
  - **⚠️ Expected behavior PENDING Dev decision:** Either (a) proceeds with format-only validation and logs failure, or (b) shows generic warning "Email deliverability could not be verified"
  - Form does NOT crash or hang indefinitely
  - User is NOT permanently blocked

---

### Scenario 11: Multiple validation conditions — precedence handling

**Type:** Edge Case
**Priority:** Medium

- **Given:**
  - User enters `"client@gmial.com"` (typo) AND the domain has no MX records

- **When:**
  - User submits form

- **Then:**
  - Only ONE warning/suggestion is shown (not multiple stacked)
  - Typo suggestion takes precedence over no-MX warning (⚠️ pending PO confirmation)
  - **⚠️ NOTE:** Behavior when both conditions apply simultaneously is not defined in story.

---

## 🧪 Step 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 15

**Breakdown:**
- Positive: 4 test cases
- Negative: 4 test cases
- Boundary: 3 test cases
- Integration: 2 test cases
- API: 2 test cases

**Rationale:** 5 validation paths (format, MX, disposable, typo, delivery history) × múltiples estados de UX (block, warn, suggest, pass). Alta complejidad para 3 story points. ACs 6 y 7 tienen dependencia de delivery tracking que limita test coverage hasta resolver la arquitectura.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

---

**Parametrized Test Group 1:** Email format validation — valid vs invalid formats

- **Base Scenario:** POST /api/clients with different email formats → verify expected HTTP status
- **Parameters:** email input, expected status, expected error (if any)

| Email Input              | Expected Status | Blocked? | Notes                          |
|--------------------------|-----------------|----------|--------------------------------|
| `john@validcompany.com`  | 201 Created     | No       | Happy path                     |
| `john@gmail.com`         | 201 Created     | No       | Common domain                  |
| `john+tag@gmail.com`     | 201 Created     | No       | Subaddress — RFC valid         |
| `contacto@empresa.com.mx`| 201 Created     | No       | International domain           |
| `john@invalid`           | 400 Bad Request | Yes      | No TLD                         |
| `@nodomain.com`          | 400 Bad Request | Yes      | Missing local part             |
| `john@`                  | 400 Bad Request | Yes      | Empty domain                   |
| `notanemail`             | 400 Bad Request | Yes      | No @ symbol                    |
| `john@.com`              | 400 Bad Request | Yes      | Domain starts with dot         |

**Total Tests from Parametrization:** 9 dataset rows → 1 parametrized API test
**Benefit:** Cubre todos los casos de formato con un único test parametrizado; fácil de extender.

---

**Parametrized Test Group 2:** Warning type by email characteristic

- **Base Scenario:** Submit form with different email categories → verify warning shown or clean acceptance
- **Parameters:** email domain category, expected UI behavior, proceed allowed

| Email                    | Category         | Expected UI Response      | Can Proceed? |
|--------------------------|------------------|---------------------------|--------------|
| `john@validcompany.com`  | Valid MX         | No warning                | Yes (direct) |
| `john@tempmail.com`      | Disposable       | Warning + confirm dialog  | Yes (confirm)|
| `john@nodomain.xyz`      | No MX records    | Warning + acknowledge     | Yes (ack)    |
| `john@gmial.com`         | Typo             | Suggestion shown          | Yes (choice) |
| `john@invalid`           | Format error     | Inline error, blocked     | No           |

**Total Tests from Parametrization:** 5 dataset rows → 1 parametrized E2E test
**Benefit:** Valida todos los tipos de respuesta UX en un solo test función, asegurando coherencia entre scenarios.

---

### Test Outlines

---

#### Should accept client with valid email and MX-verified domain

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E (UI) + API
**Parametrized:** ✅ Yes (Group 1 — valid rows)

---

**Preconditions:**
- User `test-valentina@soloq.app` is authenticated
- Network/DNS is available for MX lookup in staging
- No existing client with this email for this user

**Test Steps:**
1. Navigate to `/clients/new`
2. Fill name: `"Empresa Acme"`, email: `"john@validcompany.com"`
3. Submit form
4. Wait for MX check (max Xms loading state)
   - **Verify:** No warning banner or dialog shown
5. Verify success: client list shows new client OR redirect to client detail
   - **Verify:** Client appears in list with correct email

**Expected Result:**
- **UI:** Form submits cleanly, no warnings, success state shown
- **API Response:** `201 Created` with `{ success: true, client: { email: "john@validcompany.com", ... } }`
- **Database:** New row in `clients` with `email_verification_status = 'mx_valid'` (or equivalent)

**Test Data:**
```json
{ "name": "Empresa Acme", "email": "john@validcompany.com" }
```

---

#### Should block form submission when email format is invalid

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** Critical
**Test Level:** E2E (UI) + API
**Parametrized:** ✅ Yes (Group 1 — invalid rows)

---

**Preconditions:**
- User is authenticated and on `/clients/new`

**Test Steps:**
1. Enter email: `"john@invalid"` (no TLD)
2. Attempt to submit form
   - **Verify:** Submit button is disabled OR form shows inline error
3. Assert error message: `"Please enter a valid email address"` (or equivalent)
   - **Verify:** Error is inline on email field, not a generic toast
4. Verify no MX check was triggered (no loading state)
5. Verify no client was created (GET /api/clients returns same count)

**Expected Result:**
- **UI:** Inline error on email field, form cannot be submitted
- **API Response:** `400 Bad Request` (if submit reaches API)
- **Database:** NO new row in `clients`

---

#### Should show disposable email warning and allow proceed with confirmation

**Related Scenario:** Scenario 3
**Type:** Negative / Warning
**Priority:** High
**Test Level:** E2E (UI)
**Parametrized:** ✅ Yes (Group 2 — disposable row)

---

**Preconditions:**
- `"tempmail.com"` is in the disposable domain list used by the system
- User is on `/clients/new`

**Test Steps:**
1. Enter email: `"client@tempmail.com"`, fill other required fields
2. Submit form
3. Assert: warning UI appears with message about temporary/disposable email
   - **Verify:** Warning text contains "temporary" or "disposable" keyword
4. Assert: proceed option is visible (button, checkbox, or equivalent)
5. Click proceed/confirm
   - **Verify:** Client is saved successfully (201 or success UI state)
   - **Verify:** No second warning appears after confirmation

**Expected Result:**
- **UI:** Warning visible, proceed option functional, client saves after confirmation
- **API Response:** `201 Created` after user confirms proceed
- **Database:** Client saved with `email_verification_status = 'warned_disposable'` (⚠️ field name pending schema)

**⚠️ NOTE:** Steps 4-5 are partially blocked until Dev confirms exact UI component for "confirmation".

---

#### Should show no-MX-records warning and allow proceed with acknowledgment

**Related Scenario:** Scenario 4
**Type:** Negative / Warning
**Priority:** High
**Test Level:** E2E (UI) + API
**Parametrized:** ✅ Yes (Group 2 — no MX row)

---

**Preconditions:**
- DNS returns no MX records for test domain `"nodomain-test.xyz"` (use a domain known to have no MX in staging)

**Test Steps:**
1. Enter email: `"client@nodomain-test.xyz"`
2. Submit form
3. Assert warning: message about domain not receiving emails
4. Assert proceed option available
5. Click acknowledge/proceed
   - **Verify:** Client saved with warning status

**Expected Result:**
- **UI:** Warning shown, acknowledgment option present, saves after acknowledgment
- **Database:** `email_verification_status = 'warned_no_mx'`

---

#### Should suggest typo correction and re-validate on acceptance

**Related Scenario:** Scenario 5
**Type:** Positive (UX)
**Priority:** Medium
**Test Level:** E2E (UI)
**Parametrized:** ❌ No

---

**Preconditions:**
- `"gmial.com"` is in the typo detection list, mapped to `"gmail.com"`

**Test Steps:**
1. Enter email: `"client@gmial.com"`
2. Submit (or blur, depending on trigger — ⚠️ pending Dev)
   - **Verify:** Suggestion appears: `"Did you mean client@gmail.com?"`
3. Click "Yes, use gmail.com"
   - **Verify:** Email field updates to `"client@gmail.com"`
   - **Verify:** MX check re-runs on corrected email
4. Verify clean submission (gmail.com has valid MX)
   - **Verify:** Client saved with corrected email

**Expected Result:**
- **UI:** Suggestion shown inline, accepted, field updated, clean save
- **Database:** Client saved with `email = "client@gmail.com"` (corrected)

---

#### Should return 400 for invalid email format via API

**Related Scenario:** Scenario 2 (API layer)
**Type:** Negative
**Priority:** Critical
**Test Level:** API
**Parametrized:** ✅ Yes (Group 1 — invalid format rows)

---

**Preconditions:**
- User is authenticated with valid Bearer token

**Test Steps:**
1. `POST /api/clients` with body `{ "name": "Test Client", "email": "john@invalid" }`
   - **Verify:** `400 Bad Request`
2. Check response body for validation error on `email` field

**Expected Result:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please enter a valid email address",
    "field": "email"
  }
}
```
- **Database:** NO row inserted

---

#### Should return 201 with deliverability metadata when email has no MX records but user proceeds

**Related Scenario:** Scenario 4 (API layer)
**Type:** Negative (warn + proceed)
**Priority:** High
**Test Level:** API
**Parametrized:** ❌ No

---

**Preconditions:**
- Domain `"nodomain-test.xyz"` has no MX records
- Request includes a flag/header indicating user has acknowledged the warning
  - **⚠️ NOTE:** The mechanism for "user acknowledged" at API level is not defined (body flag? header? two-step request?). Needs Dev input.

**Test Steps:**
1. `POST /api/clients` with `{ "email": "client@nodomain-test.xyz", "acknowledgedWarnings": true }` (⚠️ field name TBD)
   - **Verify:** `201 Created`
2. Check response: client created with warning metadata

**Expected Result:**
```json
{
  "success": true,
  "client": {
    "email": "client@nodomain-test.xyz",
    "email_verification_status": "warned_no_mx"
  },
  "warnings": ["EMAIL_NO_MX_RECORDS"]
}
```
**⚠️ NOTE:** Response schema for warnings not defined in api-contracts.yaml — needs to be added.

---

#### Should accept subaddressed email without false positive warnings

**Related Scenario:** Scenario 8
**Type:** Boundary
**Priority:** Medium
**Test Level:** API + UI
**Parametrized:** ❌ No

---

**Preconditions:**
- `gmail.com` has valid MX records

**Test Steps:**
1. Submit form with email `"john+invoices@gmail.com"`
2. Verify: no disposable warning (gmail.com is not disposable)
3. Verify: no typo suggestion (`+invoices` tag doesn't trigger fuzzy matching)
4. Verify: clean save — `201 Created`

---

#### Should accept international domain email without false warnings

**Related Scenario:** Scenario 9
**Type:** Boundary
**Priority:** Medium
**Test Level:** API + UI
**Parametrized:** ❌ No

---

**Preconditions:**
- `empresa.com.mx` has valid MX records

**Test Steps:**
1. Submit form with email `"contacto@empresa.com.mx"`
2. Verify no warning shown, client saved

---

#### Should handle MX lookup timeout gracefully without blocking user

**Related Scenario:** Scenario 10
**Type:** Edge Case
**Priority:** High
**Test Level:** Integration
**Parametrized:** ❌ No

---

**Preconditions:**
- DNS lookup service configured with test timeout (mock in staging environment)

**Test Steps:**
1. Configure MX lookup to simulate timeout (>Xms)
2. Submit form with valid format email
3. Verify: form does NOT hang indefinitely
4. Verify: expected fallback behavior (⚠️ pending Dev: either proceed or generic warning)
5. Verify: no crash, user can still take action

**Expected Result:**
- Form responds within reasonable time (< 5s)
- User is not permanently blocked
- Error logged server-side

---

#### Should enforce UNIQUE(user_id, email) — same email allowed across different users

**Related Scenario:** Edge Case 3
**Type:** Integration
**Priority:** High
**Test Level:** API + DB

---

**Preconditions:**
- User A has client with `email = "shared@acme.com"`
- User B is authenticated separately

**Test Steps:**
1. User B calls `POST /api/clients` with `{ "email": "shared@acme.com" }`
   - **Verify:** `201 Created` (NOT a 409 conflict — UNIQUE is per user_id)
2. User A calls same endpoint again with same email
   - **Verify:** `409 Conflict` (duplicate for SAME user)

**Expected Result:**
- Cross-user: same email allowed → `201`
- Same user, same email: blocked → `409`

---

## 🔗 Integration Test Cases

### Integration Test 1: Email validation embedded in POST /api/clients flow

**Integration Point:** Frontend form → `POST /api/clients` → Zod validation → MX check → DB
**Type:** Integration
**Priority:** Critical

**Test Flow:**
1. Form submits with email `"client@tempmail.com"`
2. API receives request
3. Zod validates format → passes
4. Disposable check triggers → domain found in list
5. API returns 422 (or 200 with warning — ⚠️ status code TBD) with warning payload
6. Frontend renders warning UI based on response

**Contract Validation:**
- Request format: matches `ClientInput` schema ✅
- Response format: ⚠️ Not defined in api-contracts.yaml — warning response schema missing
- Status codes: ⚠️ Not documented for deliverability warnings (200 vs 422 vs custom code)

**Expected Result:**
- Warning payload flows correctly from API to UI
- No data loss in validation pipeline

---

### Integration Test 2: Delivery tracking — invoice send updates email_verified_at (ACs 6 & 7)

**Integration Point:** Invoice send → Resend → webhook → `clients.email_delivery_confirmed_at`
**Type:** Integration
**Priority:** Medium (⚠️ Blocked until delivery tracking is implemented)

**Test Flow:**
1. Send invoice to client with `email_delivery_confirmed_at = null`
2. Resend delivers successfully → webhook fires
3. System updates `clients.email_delivery_confirmed_at = now()`
4. Next invoice send → no deliverability warning shown

**Expected Result:**
- Post-delivery webhook: `clients.email_delivery_confirmed_at` populated
- Subsequent sends: no warning

**⚠️ NOTE:** This test cannot be executed until Resend webhook integration is implemented and `clients` schema is updated.

---

## 📊 Edge Cases Summary

| Edge Case                                     | Covered in Story? | Added to Refined AC?         | Test Case            | Priority |
|-----------------------------------------------|-------------------|------------------------------|----------------------|----------|
| Subaddressed email (john+tag@gmail.com)       | ❌ No             | ✅ Yes (Scenario 8)          | TC boundary          | Medium   |
| International domain (.com.mx)                | ❌ No             | ✅ Yes (Scenario 9)          | TC boundary          | Medium   |
| MX check service timeout/unavailable          | ❌ No             | ✅ Yes (Scenario 10)         | TC edge              | High     |
| Typo + no-MX both apply — precedence conflict | ❌ No             | ✅ Yes (Scenario 11)         | ⚠️ Needs PO confirm  | Medium   |
| Same email, different users (UNIQUE scope)    | ❌ No             | ✅ Yes (Integration Test 2)  | TC integration       | High     |
| Empty email field (optional vs required)      | ❌ No             | ⚠️ Needs PO answer           | TBD                  | High     |
| Typo accepted → re-validate corrected email   | ❌ No             | ✅ Yes (Scenario 5 step 3)   | TC positive          | Medium   |
| ACs 6/7 delivery tracking dependency          | Partial (ACs)     | ⚠️ Blocked by architecture   | TBD after schema     | Medium   |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type        | Count | Purpose                    | Examples                                                           |
|------------------|-------|----------------------------|--------------------------------------------------------------------|
| Valid emails     | 4     | Positive / boundary        | `john@validcompany.com`, `john+tag@gmail.com`, `contacto@emp.mx`  |
| Invalid format   | 5     | Negative API (parametrized)| `john@invalid`, `@nodomain.com`, `notanemail`, `john@.com`        |
| Disposable       | 2     | Warning tests              | `client@tempmail.com`, `user@mailinator.com`                      |
| No-MX domain     | 1     | Warning tests              | `client@nodomain-test.xyz` (staging DNS controlled)               |
| Typo emails      | 2     | Suggestion tests           | `client@gmial.com`, `user@yahooo.com`                             |
| Cross-user       | 2     | UNIQUE constraint tests    | User A + User B with `shared@acme.com`                            |

### Data Generation Strategy

**Static Test Data (required — cannot use Faker for these):**
- Disposable domain: `"tempmail.com"` — must be in the system's disposable list
- No-MX domain: `"nodomain-test.xyz"` — staging DNS must be controlled (or mocked)
- Typo domain: `"gmial.com"` — must be in typo detection list

**Dynamic Test Data (Faker.js):**
- Client names: `faker.company.name()`
- Valid emails for positive tests: `faker.internet.email({ provider: 'validcompany.com' })`

**Test Data Cleanup:**
- ✅ All test clients created during tests are cleaned up via `DELETE /api/clients/:id`
- ✅ Each test uses isolated user account
- ⚠️ MX lookup results may be cached — tests should account for caching behavior

---

## 📝 PART 2: Jira Actions

> **Step 5:** SQ-68 actualizado en Jira con AC refinados y label `shift-left-reviewed`.
> **Step 6:** Test cases publicados como comment en SQ-68.

---

## 📢 Step 8: Final QA Feedback Report

### Executive Summary

SQ-68 es una historia de **alta complejidad real** (estimada en 3 SP, pero con implicaciones arquitectónicas de nivel medio-alto). Tiene **3 blockers arquitectónicos** y **2 blockers de producto** que deben resolverse en refinement antes de mover la historia a Ready for Dev.

### ⛔ Blockers Críticos (No puede entrar a Dev sin resolver)

| # | Blocker | Owner | Impact |
|---|---------|-------|--------|
| 1 | ¿Cuándo se ejecuta el MX check? (on blur, on submit, dedicated endpoint) | @Dev | Bloquea diseño de UX, tests de timing y API contract |
| 2 | ¿Qué UI implementa "confirmation" y "acknowledgment"? (modal, checkbox, button) | @Dev/@PO | Bloquea test steps de UI para ACs 3 y 4 |
| 3 | ¿Cómo se rastrea "last successful delivery"? ¿Schema change en `clients`? ¿Resend webhook? | @Dev | ACs 6 y 7 son 100% no-testables sin esto |

### ⚠️ Blockers de Producto (Debe responder PO antes de testing)

| # | Blocker | Owner |
|---|---------|-------|
| 4 | ¿El campo `email` es **required** en el formulario de cliente, o es opcional? | @PO |
| 5 | ¿Qué pasa cuando typo + no-MX aplican simultáneamente? ¿Cuál tiene precedencia? | @PO |

### Gaps de API Contract

- No hay respuesta de warnings definida en `api-contracts.yaml` para deliverability check
- No hay status code definido para "valid format but MX warning" (¿201 con warnings? ¿422 soft fail?)
- No hay endpoint dedicado para pre-validation (si se decide implementar uno)

### Test Coverage Ready (sin resolver blockers)

- **8 de 15 test outlines** pueden diseñarse hoy (format validation, subaddress, international domain, UNIQUE constraint, API 400)
- **7 test outlines** bloqueados hasta resolver arquitectura (confirmation UI, delivery tracking, timeout fallback)

### Recomendación

> Llevar a **refinement con Dev Lead y PO** antes de Shift-Left QA sign-off. Proponer resolución de los 5 puntos listados arriba en una sesión de 30 minutos. Después del refinement, completar los test cases bloqueados y mover a Ready for Dev.

---

**Documentation:** `.context/PBI/epics/EPIC-SQ-13-client-management/stories/STORY-SQ-68-as-a-user-i-want-the-system-to-validate-client-ema/acceptance-test-plan.md`
