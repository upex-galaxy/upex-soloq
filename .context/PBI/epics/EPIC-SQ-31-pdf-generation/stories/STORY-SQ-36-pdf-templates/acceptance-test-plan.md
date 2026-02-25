# Acceptance Test Plan: STORY-SQ-36 - Choose PDF Template (Pro Feature)

**Fecha:** 2026-02-14
**QA Engineer:** AI-Generated (Shift-Left Analysis)
**Story Jira Key:** [SQ-36](https://upexgalaxy64.atlassian.net/browse/SQ-36)
**Epic:** EPIC-SQ-31 - PDF Generation & Download
**Status:** Draft

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Disenador Grafico, 32 anos, CDMX) - Necesita templates profesionales para diferenciarse ante clientes creativos. Actualmente crea facturas en Canva (20-30 min cada una). Templates premium le dan imagen consistente sin esfuerzo de diseno.
- **Secondary:** Andres (Consultor, 41 anos, Buenos Aires) - Quiere facturas "bonitas" sin complicarse. El template clasico le basta, pero podria valorar opciones profesionales si son simples.

**Business Value:**

- **Value Proposition:** Templates premium son uno de los 3 diferenciadores clave del plan Pro ($9.99 USD/mes). Permiten al freelancer proyectar una imagen profesional personalizada sin esfuerzo de diseno.
- **Business Impact:** Contribuye directamente a conversion Free->Pro (target: 8% conversion rate). Templates premium junto con recordatorios automaticos y analytics son los pilares del modelo freemium.

**Related User Journey:**

- Journey: "Registro y Primera Factura" (Steps 12-14 - Preview y envio de PDF)
- Step: Template selection ocurre antes del Step 12 (previsualizacion), ya sea como preferencia global en settings o como override al crear/editar una factura especifica.

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: Template selector UI (grid/cards con previews), template preview modal
- Pages/Routes: `/settings` (preferencia global), `/invoices/create` y `/invoices/[id]/edit` (override por invoice)
- State Management: React Query para subscription status, React Hook Form para invoice template override

**Backend:**

- API Endpoints:
  - `GET /subscription` - Verificar plan del usuario (FR-027)
  - `PATCH /api/profile` - Guardar default_template en business_profiles
  - `PATCH /api/invoices/:id` - Guardar template_override en invoice
  - `GET /invoices/:id/pdf?template=X` - Generar PDF con template especifico
- Services: PDF Generator (@react-pdf/renderer), Subscription service
- Database:
  - `business_profiles.default_template` (varchar(20), default 'classic')
  - `invoices.template_override` (varchar(20), nullable)
  - `subscriptions` table (plan, status, current_period_end)

**External Services:**

- Stripe (via webhook) - Para determinar subscription status
- Supabase Storage - Para logos en templates

**Integration Points:**

- Subscription check (client-side + server-side validation)
- PDF renderer must support 4 template variants
- business_profiles update for default preference
- invoices update for per-invoice override

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic complexity: Medium - Pro gating requires both UI and server-side validation
- Integration complexity: Medium - Depends on subscription system (SQ-41), PDF renderer, and 2 DB tables
- Data validation complexity: Low - Template ID is a simple enum
- UI complexity: Medium - Template preview with thumbnails, Pro badges, upgrade prompts

**Estimated Test Effort:** Medium
**Rationale:** Multiple user roles (Free/Pro), subscription state transitions, persistence across two tables, and UI interactions (preview, selection, save) require diverse test coverage.

---

### Epic-Level Context (From Feature Test Plan)

**Critical Risks Already Identified at Epic Level:**

- Risk: "Pro feature gate bypass" (Medium risk in FTP)
  - **Relevance to This Story:** DIRECTLY applies - this is THE Pro-gated feature in the epic. Server-side validation of subscription status is critical to prevent revenue loss.
- Risk: "PDF generation > 3000ms" (High risk in FTP)
  - **Relevance to This Story:** Template rendering could add overhead if templates have different complexity levels. Performance testing needed per template.
- Risk: "Template selection confusion" (Low risk in FTP)
  - **Relevance to This Story:** DIRECTLY applies - UX must clearly label Pro templates and provide upgrade path for Free users.

**Integration Points from Epic Analysis:**

- Frontend <-> Backend API: **Applies** - Template selection UI calls profile/invoice APIs
- PDF Generator <-> Templates: **Applies** - Each template is a different React component for @react-pdf/renderer
- Subscription System: **Applies** - Must check plan before allowing template access

**Critical Questions Already Asked at Epic Level:**

**Questions for PO:**

- "How many Pro templates will be available at MVP launch?" - Status: Pending - Impact: Determines test matrix size. Story says 4 templates (classic, modern, minimal, professional).
- "What happens if user has no logo? Placeholder or adjusted layout?" - Status: Pending - Impact: Each template must handle no-logo gracefully.

**Questions for Dev:**

- "Will PDFs be cached or regenerated on each request?" - Status: Pending - Impact: If cached, template change must invalidate cache.
- "How will we handle font loading for PDF generation?" - Status: Pending - Impact: Different templates may use different fonts.

**Test Strategy from Epic:**

- Test Levels: Unit > 80%, Integration > 60%, E2E critical paths, API 100%
- Tools: Playwright (E2E), Vitest (unit), API tests
- **How This Story Aligns:** Needs UI E2E tests for template selection/preview, API tests for subscription gating, unit tests for template config validation.

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** SQ-36 is the ONLY Pro-gated feature in EPIC-SQ-31. It's low priority (1 SP) but introduces subscription-dependent behavior that adds complexity beyond basic PDF generation.
- **Inherited Risks:** Pro gate bypass (revenue impact), template selection UX confusion
- **Unique Considerations:** Subscription state management, persistence across two different DB tables (business_profiles for default, invoices for override), upgrade prompt UX for Free users

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Template list inconsistency between local and Jira

- **Location in Story:** Local story.md has 5 ACs (including "Template preview" and "Change template per invoice"). Jira has 3 ACs with different wording ("View available templates", "Select template", "Free user limitation").
- **Question for PO/Dev:** Which acceptance criteria set is authoritative? Should all 5 scenarios from local story.md be considered canonical?
- **Impact on Testing:** Cannot determine complete test scope without knowing which ACs are in scope.
- **Suggested Clarification:** Merge both sets - use local story.md as the more complete version (5 ACs cover all Jira ACs plus additional scenarios).

**Ambiguity 2:** "Multiple template options" is vague

- **Location in Story:** Scenario 2 says "I see multiple template options" without specifying exact templates.
- **Question for PO/Dev:** Are the 4 templates (classic, modern, minimal, professional) from Technical Notes the definitive list for MVP?
- **Impact on Testing:** Cannot validate completeness of template list without exact names.
- **Suggested Clarification:** Scenario should specify: "I see classic, modern, minimal, and professional templates."

**Ambiguity 3:** Template preview behavior undefined

- **Location in Story:** Scenario 3 says "hover/click on a template" and "preview of how my invoice would look."
- **Question for PO/Dev:** Is this a thumbnail preview, a full-size modal, or a live PDF render? Does it use real invoice data or sample data?
- **Impact on Testing:** Preview implementation affects performance testing and visual validation approach.
- **Suggested Clarification:** Define whether preview is a static thumbnail or live render with user's actual invoice data.

**Ambiguity 4:** Upgrade prompt behavior for Free users

- **Location in Story:** Jira Scenario 3 says "I see upgrade prompt" but local Scenario 1 says "I only have access to the Classic template."
- **Question for PO/Dev:** Can Free users SEE Pro templates (locked/grayed out with upgrade CTA) or do they only see Classic? What does the upgrade prompt look like?
- **Impact on Testing:** Completely different UI flows depending on approach.
- **Suggested Clarification:** Free users should see all templates but Pro ones show lock icon + "Upgrade to Pro" CTA.

---

### Missing Information / Gaps

**Gap 1:** No error handling scenarios

- **Type:** Acceptance Criteria
- **Why It's Critical:** What happens if subscription check fails? If template save fails? If selected template is removed in future?
- **Suggested Addition:** Add error scenarios for network failures, subscription API errors, and graceful degradation.
- **Impact if Not Added:** Untested error paths could lead to users selecting templates they can't use.

**Gap 2:** No subscription state transitions

- **Type:** Business Rule
- **Why It's Critical:** What happens if a Pro user downgrades to Free AFTER setting a non-classic template? Do existing invoices keep their template? Does default revert to classic?
- **Suggested Addition:** Add AC: "When Pro user downgrades, default_template reverts to 'classic' and future invoices use classic. Existing invoices retain their template_override."
- **Impact if Not Added:** Data inconsistency and potential PDF rendering errors for downgraded users.

**Gap 3:** Story points mismatch

- **Type:** Technical Details
- **Why It's Critical:** Local story says 1 SP, Jira description says 3 SP. This affects sprint planning.
- **Suggested Addition:** Align story points across both sources.
- **Impact if Not Added:** Sprint capacity misalignment.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Pro subscription expires while user has non-classic default template

- **Scenario:** User is Pro, sets "modern" as default, subscription expires/cancels.
- **Expected Behavior:** System should revert default_template to "classic" OR show warning when generating PDF.
- **Criticality:** High
- **Action Required:** Ask PO - define downgrade behavior

**Edge Case 2:** Per-invoice template override with Free user (API bypass attempt)

- **Scenario:** Free user sends API request to set template_override to "modern" on an invoice.
- **Expected Behavior:** Server rejects with 403 Forbidden. Invoice keeps classic template.
- **Criticality:** High
- **Action Required:** Add to test cases - security validation

**Edge Case 3:** Template applied to invoice with incomplete data

- **Scenario:** User selects "professional" template but has no logo, no tax_id, no payment methods.
- **Expected Behavior:** Template renders gracefully with missing sections hidden/adjusted.
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 4:** Concurrent template preference saves

- **Scenario:** User changes default template in two browser tabs simultaneously.
- **Expected Behavior:** Last write wins, no data corruption.
- **Criticality:** Low
- **Action Required:** Add to test cases only

**Edge Case 5:** Invalid template ID in database

- **Scenario:** Database contains template value not in enum (e.g., due to migration or manual edit).
- **Expected Behavior:** System falls back to "classic" template gracefully.
- **Criticality:** Medium
- **Action Required:** Add to test cases

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues:**

- [x] Acceptance criteria are vague or subjective ("multiple template options", "preview of how my invoice would look")
- [x] Expected results are not specific enough (no template names, no UI element specs)
- [ ] Missing test data examples
- [x] Missing error scenarios
- [ ] Missing performance criteria (if NFR applies)
- [ ] Cannot be tested in isolation (missing dependencies info)

**Recommendations to Improve Testability:**

1. Specify exact template names: classic, modern, minimal, professional
2. Define preview behavior: thumbnail vs full render vs modal
3. Add error scenarios for subscription check failures
4. Define Free user UX: locked templates with upgrade CTA vs hidden templates
5. Define downgrade behavior when Pro expires

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Free user sees only Classic template available

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User is logged in with a Free subscription (subscriptions.plan = 'free')
  - User navigates to template selection area (settings or invoice creation)

- **When:**
  - User views template options

- **Then:**
  - "Classic" template is shown as active/selected
  - Pro templates (modern, minimal, professional) are visible but locked with a Pro badge/icon
  - Each locked template shows an "Upgrade to Pro" CTA
  - User cannot select locked templates

---

### Scenario 2: Pro user sees and can select all templates

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User is logged in with an active Pro subscription (subscriptions.plan = 'pro', status = 'active')
  - User navigates to template selection area

- **When:**
  - User views template options

- **Then:**
  - All 4 templates are visible and selectable: classic, modern, minimal, professional
  - No lock icons or upgrade prompts are shown
  - Currently selected template is visually highlighted

---

### Scenario 3: Template preview shows invoice appearance

**Type:** Positive
**Priority:** High

- **Given:**
  - User is viewing template options (Pro user)

- **When:**
  - User hovers over or clicks on a template card

- **Then:**
  - A preview of the invoice renders with that template's styling
  - Preview uses representative data (sample or user's actual data)
  - Preview loads within 2 seconds

---

### Scenario 4: Save default template preference

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User is a Pro user on the template selection in settings
  - User selects "modern" template

- **When:**
  - User saves the preference

- **Then:**
  - `business_profiles.default_template` is updated to "modern"
  - Success feedback is shown to user
  - All future invoices without override use "modern" template for PDF generation

---

### Scenario 5: Override template for specific invoice

**Type:** Positive
**Priority:** High

- **Given:**
  - Pro user has default template set to "modern"
  - User is creating or editing an invoice

- **When:**
  - User selects "minimal" template for this specific invoice

- **Then:**
  - `invoices.template_override` is set to "minimal" for this invoice
  - This invoice's PDF uses "minimal" template
  - Default template remains "modern" for other invoices
  - Other invoices without override still use "modern"

---

### Scenario 6: Free user sees upgrade prompt when clicking Pro template

**Type:** Positive
**Priority:** High

- **Given:**
  - User is a Free user
  - User sees locked Pro templates in the template selection

- **When:**
  - User clicks on a locked Pro template (e.g., "professional")

- **Then:**
  - An upgrade modal/prompt appears with Pro benefits
  - Modal includes CTA to upgrade (links to subscription checkout)
  - User's current template selection remains unchanged (classic)

---

### Scenario 7: Server rejects Pro template for Free user (API security)

**Type:** Negative
**Priority:** Critical
**Source:** Identified during critical analysis (Edge Case 2)

- **Given:**
  - User has a Free subscription
  - User attempts to set template via API (direct request or manipulated frontend)

- **When:**
  - API receives request to update default_template to "modern" OR invoice template_override to "professional"

- **Then:**
  - Server validates subscription status
  - Request is rejected with appropriate error (403 Forbidden or validation error)
  - Database values remain unchanged
  - **NOTE:** Server-side validation is critical - cannot rely on frontend-only gating

---

### Scenario 8: Pro subscription expires with non-classic default template

**Type:** Edge Case
**Priority:** High
**Source:** Identified during critical analysis (Edge Case 1)

- **Given:**
  - User was Pro with default_template = "modern"
  - Subscription expires or is cancelled (status changes to 'canceled' or 'past_due')

- **When:**
  - User generates a new invoice PDF

- **Then:**
  - PDF renders with "classic" template (fallback behavior)
  - Template selection UI shows only classic as available
  - Pro templates revert to locked state
  - **NOTE:** Needs PO confirmation on whether default_template column should be auto-reverted

---

### Scenario 9: Template renders gracefully with incomplete business data

**Type:** Boundary
**Priority:** Medium
**Source:** Identified during critical analysis (Edge Case 3)

- **Given:**
  - Pro user selects "professional" template
  - User has no logo uploaded, no tax_id configured, no payment methods

- **When:**
  - User generates a PDF with this template

- **Then:**
  - PDF renders successfully without errors
  - Missing sections (logo area, tax ID, payment methods) are handled gracefully (hidden or adjusted layout)
  - No blank spaces or broken layouts

---

### Scenario 10: Invalid template value fallback

**Type:** Boundary
**Priority:** Medium
**Source:** Identified during critical analysis (Edge Case 5)

- **Given:**
  - Database contains an invalid value in default_template or template_override (e.g., "deleted_template")

- **When:**
  - System attempts to generate PDF

- **Then:**
  - System falls back to "classic" template
  - PDF generates successfully
  - No error is shown to user (graceful degradation)

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 12

**Breakdown:**

- Positive: 5 test cases
- Negative: 2 test cases
- Boundary: 3 test cases
- Integration: 2 test cases

**Rationale for This Number:** Medium complexity story with Pro gating (requires Free/Pro user matrix), persistence across 2 tables, template preview UI, and critical security validation. 12 test cases provide adequate coverage without over-testing a 1 SP story.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** Yes

**Parametrized Test Group 1:** Template availability by subscription plan

- **Base Scenario:** User views template selection
- **Parameters to Vary:** Subscription plan, expected template access

| Plan | Template | Expected Access | Expected UI State |
| ---- | -------- | --------------- | ----------------- |
| free | classic | Selectable | Active/Available |
| free | modern | Locked | Pro badge + CTA |
| free | minimal | Locked | Pro badge + CTA |
| free | professional | Locked | Pro badge + CTA |
| pro | classic | Selectable | Available |
| pro | modern | Selectable | Available |
| pro | minimal | Selectable | Available |
| pro | professional | Selectable | Available |

**Total Tests from Parametrization:** 8 data points in 2 logical test cases
**Benefit:** Reduces 8 individual tests to 2 parametrized tests, ensures complete template x plan matrix coverage.

---

**Parametrized Test Group 2:** Template rendering with varying data completeness

- **Base Scenario:** Generate PDF with selected template
- **Parameters to Vary:** Template, data completeness

| Template | Has Logo | Has Tax ID | Has Payment Methods | Expected |
| -------- | -------- | ---------- | ------------------- | -------- |
| classic | Yes | Yes | Yes | Full render |
| modern | No | Yes | Yes | No-logo layout |
| minimal | Yes | No | No | Minimal sections |
| professional | No | No | No | Graceful empty |

**Total Tests from Parametrization:** 4 data points in 1 logical test case
**Benefit:** Ensures all templates handle missing data without breaking.

---

### Test Outlines

#### **Validar acceso a templates segun plan de suscripcion Free**

**Related Scenario:** Scenario 1, 6
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** Yes (Group 1 - Free plan rows)

---

**Preconditions:**

- User logged in with Free subscription (plan = 'free', status = 'active')
- At least one invoice exists (for preview context)

---

**Test Steps:**

1. Navigate to template selection area (Settings page or Invoice creation)
2. Observe template grid/list
   - **Verify:** "Classic" template is shown as active/selectable
   - **Verify:** "Modern", "Minimal", "Professional" templates show Pro badge/lock icon
3. Click on a locked Pro template (e.g., "Modern")
   - **Verify:** Upgrade modal/prompt appears with Pro benefits and CTA

---

**Expected Result:**

- **UI:** Classic template is selectable. Pro templates are visible but locked with Pro badges. Clicking locked template shows upgrade prompt.
- **Database:** No changes to business_profiles.default_template

---

**Test Data:**

```json
{
  "user": {
    "email": "freeuser@test.com",
    "subscription": { "plan": "free", "status": "active" }
  }
}
```

---

#### **Validar acceso completo a templates para usuario Pro**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** Yes (Group 1 - Pro plan rows)

---

**Preconditions:**

- User logged in with Pro subscription (plan = 'pro', status = 'active')
- At least one invoice exists

---

**Test Steps:**

1. Navigate to template selection area
2. Observe template grid/list
   - **Verify:** All 4 templates visible without locks: classic, modern, minimal, professional
   - **Verify:** No upgrade prompts shown
3. Click on each template
   - **Verify:** Each template can be selected without restrictions

---

**Expected Result:**

- **UI:** All templates selectable without lock icons. Currently selected template highlighted.
- **Database:** No changes until user saves preference

---

**Test Data:**

```json
{
  "user": {
    "email": "prouser@test.com",
    "subscription": { "plan": "pro", "status": "active" }
  }
}
```

---

#### **Validar preview de template al seleccionar**

**Related Scenario:** Scenario 3
**Type:** Positive
**Priority:** High
**Test Level:** E2E
**Parametrized:** No

---

**Preconditions:**

- Pro user logged in
- User has business profile with logo, business name, contact info
- At least one invoice with line items exists

---

**Test Steps:**

1. Navigate to template selection area
2. Hover over or click "Modern" template card
   - **Verify:** Preview renders showing invoice appearance with modern styling
3. Hover over or click "Minimal" template card
   - **Verify:** Preview updates to show minimal styling
   - **Verify:** Preview loads within 2 seconds

---

**Expected Result:**

- **UI:** Template preview shows representative invoice with the selected template's styling. Preview renders quickly (< 2s).
- **Performance:** Preview rendering < 2000ms

---

#### **Validar guardado de preferencia de template por defecto**

**Related Scenario:** Scenario 4
**Type:** Positive
**Priority:** Critical
**Test Level:** Integration
**Parametrized:** No

---

**Preconditions:**

- Pro user logged in
- Current default_template = 'classic' in business_profiles

---

**Test Steps:**

1. Navigate to Settings > Template Preferences
2. Select "Modern" template
   - **Data:** template = "modern"
3. Click save/confirm button
   - **Verify:** Success toast/notification appears
4. Refresh page
   - **Verify:** "Modern" is still shown as selected default
5. Create a new invoice and generate PDF
   - **Verify:** PDF uses "modern" template styling

---

**Expected Result:**

- **UI:** Success feedback shown. Selection persists after page refresh.
- **Database:** `business_profiles.default_template = 'modern'` for this user
- **PDF:** New invoices render with modern template

---

**Test Data:**

```json
{
  "input": { "default_template": "modern" },
  "user": {
    "email": "prouser@test.com",
    "subscription": { "plan": "pro", "status": "active" }
  }
}
```

---

#### **Validar override de template por factura individual**

**Related Scenario:** Scenario 5
**Type:** Positive
**Priority:** High
**Test Level:** Integration
**Parametrized:** No

---

**Preconditions:**

- Pro user with default_template = "modern"
- Invoice INV-2026-001 exists in draft status

---

**Test Steps:**

1. Open invoice INV-2026-001 for editing
2. In template selection, choose "Minimal" for this invoice
   - **Data:** template_override = "minimal"
3. Save invoice
   - **Verify:** Invoice saved successfully
4. Generate PDF for INV-2026-001
   - **Verify:** PDF uses "minimal" template (NOT default "modern")
5. Create a NEW invoice INV-2026-002
6. Generate PDF for INV-2026-002 (without setting override)
   - **Verify:** PDF uses "modern" template (the default)

---

**Expected Result:**

- **Database:**
  - `invoices.template_override = 'minimal'` for INV-2026-001
  - `invoices.template_override IS NULL` for INV-2026-002
  - `business_profiles.default_template = 'modern'` (unchanged)
- **PDF:** INV-2026-001 uses minimal, INV-2026-002 uses modern

---

#### **Validar rechazo de template Pro via API para usuario Free**

**Related Scenario:** Scenario 7
**Type:** Negative
**Priority:** Critical
**Test Level:** API
**Parametrized:** No

---

**Preconditions:**

- Free user authenticated with valid JWT
- User's subscription plan = 'free'

---

**Test Steps:**

1. Send PATCH request to update business_profiles with default_template = "modern"
   - **Data:** `{ "default_template": "modern" }`
2. Observe response
   - **Verify:** Request rejected (403 or 422)
3. Send PATCH request to update invoice with template_override = "professional"
   - **Data:** `{ "template_override": "professional" }`
4. Observe response
   - **Verify:** Request rejected (403 or 422)
5. Verify database
   - **Verify:** default_template remains "classic"
   - **Verify:** template_override remains null

---

**Expected Result:**

- **API Response:**
  - Status Code: 403 Forbidden (or 422 Unprocessable Entity)
  - Response Body: `{ "success": false, "error": { "code": "PRO_FEATURE", "message": "Template selection requires Pro subscription" } }`
- **Database:** NO changes to either table

---

**Test Data:**

```json
{
  "input": { "default_template": "modern" },
  "user": {
    "email": "freeuser@test.com",
    "subscription": { "plan": "free" }
  }
}
```

---

#### **Validar comportamiento cuando suscripcion Pro expira**

**Related Scenario:** Scenario 8
**Type:** Edge Case
**Priority:** High
**Test Level:** Integration
**Parametrized:** No

---

**Preconditions:**

- User was Pro with default_template = "modern"
- Subscription status changes to "canceled" or "past_due"

---

**Test Steps:**

1. Simulate subscription expiry (update subscription status to 'canceled')
2. User logs in and navigates to template selection
   - **Verify:** Pro templates are now locked again
   - **Verify:** Classic template is the only selectable option
3. User generates PDF for a new invoice
   - **Verify:** PDF renders with "classic" template (fallback)
4. User views an existing invoice that had template_override = "professional"
   - **Verify:** Existing invoice PDF still renders with "professional" (historical data preserved) OR falls back to classic

---

**Expected Result:**

- **UI:** Template selection reverts to Free-user behavior (only classic selectable)
- **PDF (new invoices):** Uses "classic" template regardless of stored default_template
- **PDF (existing invoices):** Behavior TBD - needs PO confirmation

---

#### **Validar renderizado de template con datos incompletos**

**Related Scenario:** Scenario 9
**Type:** Boundary
**Priority:** Medium
**Test Level:** E2E
**Parametrized:** Yes (Group 2)

---

**Preconditions:**

- Pro user logged in
- Business profile has minimal data (no logo, no tax_id, no payment methods)
- Invoice exists with line items

---

**Test Steps:**

1. Set template to "Professional"
2. Generate PDF for invoice
   - **Verify:** PDF generates without errors
   - **Verify:** Layout adjusts gracefully for missing data (no blank sections, no broken layout)
3. Repeat with each template: classic, modern, minimal
   - **Verify:** Each template handles missing data appropriately

---

**Expected Result:**

- **PDF:** All templates render successfully regardless of data completeness. No visual artifacts or broken layouts.
- **Performance:** PDF generation < 3000ms for all templates

---

#### **Validar fallback con valor de template invalido en DB**

**Related Scenario:** Scenario 10
**Type:** Boundary
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** No

---

**Preconditions:**

- Database manually set: `business_profiles.default_template = 'nonexistent_template'`
- User logged in as Pro

---

**Test Steps:**

1. Navigate to invoice preview or generate PDF
   - **Verify:** PDF generates with "classic" template (fallback)
   - **Verify:** No error shown to user
2. Navigate to template selection UI
   - **Verify:** "Classic" is shown as active (fallback applied)

---

**Expected Result:**

- **PDF:** Renders with classic template as fallback
- **UI:** No errors, graceful degradation
- **Logs:** Warning logged server-side about invalid template value

---

#### **Validar que template "classic" siempre esta disponible para Free users al generar PDF**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** High
**Test Level:** API
**Parametrized:** No

---

**Preconditions:**

- Free user logged in
- Invoice exists with complete data

---

**Test Steps:**

1. Generate PDF via API: `GET /invoices/:id/pdf`
   - **Verify:** PDF generates successfully with classic template
   - **Verify:** Response Content-Type is application/pdf
2. Generate PDF with explicit template: `GET /invoices/:id/pdf?template=classic`
   - **Verify:** Same result as above

---

**Expected Result:**

- **API Response:** Status 200, Content-Type: application/pdf
- **PDF:** Renders with classic template, all invoice data present

---

#### **Validar persistencia de template override al editar factura**

**Related Scenario:** Scenario 5
**Type:** Positive
**Priority:** Medium
**Test Level:** E2E
**Parametrized:** No

---

**Preconditions:**

- Pro user with invoice that has template_override = "minimal"

---

**Test Steps:**

1. Open invoice for editing
2. Edit a non-template field (e.g., change notes)
3. Save invoice
   - **Verify:** template_override remains "minimal" (not reset on edit)
4. Generate PDF
   - **Verify:** PDF still uses "minimal" template

---

**Expected Result:**

- **Database:** template_override = 'minimal' (unchanged after non-template edits)
- **PDF:** Renders with minimal template

---

#### **Validar que cambiar default template no afecta facturas existentes con override**

**Related Scenario:** Scenario 4, 5
**Type:** Integration
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** No

---

**Preconditions:**

- Pro user with:
  - default_template = "modern"
  - Invoice A: template_override = "minimal"
  - Invoice B: template_override = null

---

**Test Steps:**

1. Change default template to "professional"
   - **Verify:** default_template updated to "professional"
2. Generate PDF for Invoice A
   - **Verify:** Uses "minimal" (override takes precedence)
3. Generate PDF for Invoice B
   - **Verify:** Uses "professional" (new default)

---

**Expected Result:**

- **PDF Invoice A:** minimal template (override preserved)
- **PDF Invoice B:** professional template (new default applied)
- **Database:** Invoice A template_override unchanged

---

## Integration Test Cases

### Integration Test 1: Frontend Template Selection -> Backend Subscription Validation

**Integration Point:** Frontend -> Subscription API -> Profile API
**Type:** Integration
**Priority:** High

**Preconditions:**

- Application running with Supabase backend
- Test users with Free and Pro subscriptions exist

**Test Flow:**

1. Frontend requests subscription status (`GET /subscription`)
2. Based on response, frontend enables/disables template selection
3. When Pro user saves template, frontend sends update to profile API
4. Backend validates subscription again before persisting

**Contract Validation:**

- Request format matches business_profiles update schema
- Response format includes updated default_template
- Status codes: 200 (success), 403 (Free user), 401 (unauthenticated)

**Expected Result:**

- Full round-trip works: check subscription -> show templates -> save selection -> persist in DB
- Free user flow blocked correctly at both UI and API levels

---

### Integration Test 2: Template Selection -> PDF Generation

**Integration Point:** Template preference -> @react-pdf/renderer -> PDF output
**Type:** Integration
**Priority:** High

**Test Flow:**

1. User sets default_template or template_override
2. User requests PDF generation for invoice
3. PDF generator reads template preference (override > default > 'classic')
4. Correct template component is loaded and rendered
5. PDF output matches expected template styling

**Expected Result:**

- Template resolution logic works: override > default > classic fallback
- Each template produces visually distinct PDF output
- No template mixing (correct template applied end-to-end)

---

## Edge Cases Summary

| Edge Case | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
| --------- | -------------------------- | -------------------- | --------- | -------- |
| Pro subscription expires with non-classic default | No | Yes (Scenario 8) | TC-07 | High |
| Free user API bypass attempt | No | Yes (Scenario 7) | TC-06 | Critical |
| Template with incomplete business data | No | Yes (Scenario 9) | TC-08 | Medium |
| Invalid template value in DB | No | Yes (Scenario 10) | TC-09 | Medium |
| Concurrent template saves | No | No (Low priority) | - | Low |
| Default change doesn't affect overrides | No | Yes (Scenario 4+5) | TC-12 | Medium |

---

## Test Data Summary

### Data Categories

| Data Type | Count | Purpose | Examples |
| --------- | ----- | ------- | ------- |
| Valid data | 4 | Positive tests | template IDs: classic, modern, minimal, professional |
| Invalid data | 2 | Negative tests | Free user + Pro template, invalid template ID |
| Boundary values | 2 | Boundary tests | Empty business profile, null template_override |
| Edge case data | 2 | Edge case tests | Expired subscription, concurrent saves |

### Data Generation Strategy

**Static Test Data:**

- Template IDs: `['classic', 'modern', 'minimal', 'professional']`
- Free user subscription: `{ plan: 'free', status: 'active' }`
- Pro user subscription: `{ plan: 'pro', status: 'active' }`
- Expired subscription: `{ plan: 'pro', status: 'canceled' }`

**Dynamic Test Data (using Faker.js):**

- Invoice data: `faker.string.alphanumeric()` for invoice numbers
- Business profiles: `faker.company.name()`, `faker.internet.email()`

**Test Data Cleanup:**

- All test data is cleaned up after test execution
- Tests are idempotent (can run multiple times)
- Tests do not depend on execution order

---

## Definition of Done (QA Perspective)

Esta story se considera "Done" desde QA cuando:

- [ ] All ambiguities and questions from this document are resolved
- [ ] Story is updated with suggested improvements (if accepted by PO)
- [ ] All test cases are executed and passing
- [ ] Critical/High test cases: 100% passing
- [ ] Medium/Low test cases: >= 95% passing
- [ ] All critical and high bugs resolved and verified
- [ ] Integration tests passing
- [ ] Server-side subscription validation confirmed working
- [ ] NFRs validated (PDF generation < 3000ms per template)
- [ ] Regression tests passed
- [ ] Exploratory testing completed
- [ ] Test execution report generated

---

## Related Documentation

- **Story:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/stories/STORY-SQ-36-pdf-templates/story.md`
- **Epic:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/feature-test-plan.md`
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/` (all files)
- **SRS:** `.context/SRS/` (all files)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`

---

## Test Execution Tracking

[Esta seccion se completa durante ejecucion]

**Test Execution Date:** [TBD]
**Environment:** Staging
**Executed By:** [Nombre]

**Results:**

- Total Tests: 12
- Passed: [TBD]
- Failed: [TBD]
- Blocked: [TBD]

**Bugs Found:**

- [TBD]

**Sign-off:** [Nombre QA] - [Fecha]

---

_Generated via Shift-Left QA Analysis_
_Last updated: 2026-02-14_
