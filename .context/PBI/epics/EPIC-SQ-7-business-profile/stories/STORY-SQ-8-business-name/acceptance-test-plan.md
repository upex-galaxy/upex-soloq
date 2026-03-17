# Acceptance Test Plan: STORY-SQ-8 - Business Name Configuration

**Fecha:** 2026-03-11
**QA Engineer:** AI-Generated
**Story Jira Key:** SQ-8
**Epic:** EPIC-SQ-7 - Business Profile Management
**Status:** Draft

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Designer, México) - Su nombre de negocio "Studio Creativo" es su marca. Necesita que aparezca profesionalmente en facturas
- **Secondary:** Andrés (Consultant, Argentina) - "Consultoría Fernández" es su identidad empresarial ante clientes corporativos

**Business Value:**

- **Value Proposition:** El business name es el primer elemento de branding en la factura. Sin él, la factura parece genérica e informal
- **Business Impact:** Directamente impacta percepción profesional → confianza del cliente → tasa de cobro

**Related User Journey:**

- Journey 1 (Registration & First Invoice): Paso de onboarding donde configura business name (step 1)
- Journey 4 (Invoice Editing): Business name aparece en header de factura

### Technical Context of This Story

**Frontend:**

- Components: Business Name text input con character counter, form section en Settings page
- Pages/Routes: `/settings` (business profile section), `/onboarding` (step 1)

**Backend:**

- API Endpoints: `PUT /api/profile` (actualizar business_name)
- Database: `business_profiles.business_name` (varchar, no CHECK constraint actualmente)

**Integration Points:**

- Frontend Form → Profile API → business_profiles table
- business_name → Invoice PDF header rendering
- Onboarding step 1 completion → profiles.onboarding_step update

### Story Complexity Analysis

**Overall Complexity:** Low

**Complexity Factors:**

- Business logic: Low - simple text field CRUD
- Integration: Low - standard API call
- Data validation: Low - max length + required
- UI: Low - text input + counter

**Estimated Test Effort:** Low

---

### Epic-Level Context (From Feature Test Plan)

**Critical Risks Relevant to This Story:**

- Risk 1 (Schema Misalignment): `business_name` lacks CHECK constraint for 100 chars - minor, but should be enforced at DB level
- Risk 3 (Profile → PDF): Business name must render correctly on invoice header

**Integration Points from Epic:**

- Frontend ↔ Profile API: ✅ Applies - CRUD of business_name
- Profile Data ↔ Invoice PDF: ✅ Applies - name on header

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Character counter behavior at limit

- **Location:** AC4 - "I see a validation error indicating the maximum length"
- **Question for PO/Dev:** ¿El input se bloquea al llegar a 100 chars (no permite escribir más) o permite escribir y muestra error?
- **Impact on Testing:** Diferentes approaches requieren diferentes test cases
- **Suggested Clarification:** Definir si es blocking (maxLength HTML) o validating (error message)

### Missing Information / Gaps

**Gap 1:** No AC for special characters or emojis in business name

- **Type:** Business Rule
- **Why Critical:** Un freelancer podría poner "Studio 🎨 Creativo" o "José & María's Design"
- **Suggested Addition:** AC que defina caracteres permitidos o explícitamente permita cualquiera
- **Impact if Not Added:** Caracteres especiales podrían romper PDF rendering

**Gap 2:** No AC for whitespace-only input

- **Type:** Validation Rule
- **Why Critical:** "   " (only spaces) pasaría validación de required pero es inválido
- **Suggested Addition:** Agregar validación de trimmed length > 0

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Business name with only whitespace

- **Scenario:** User enters "     " (5 spaces)
- **Expected Behavior:** Should show error - name cannot be only whitespace
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 2:** Business name with special/unicode characters

- **Scenario:** User enters "Diseño & Fotografía – Ñoño LLC™"
- **Expected Behavior:** Should be accepted and render correctly on PDF
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 3:** Concurrent editing from two tabs

- **Scenario:** User opens settings in two browser tabs, edits name in both, saves both
- **Expected Behavior:** Last save wins, no data corruption
- **Criticality:** Low
- **Action Required:** Add to test cases only

### Testability Validation

**Is this story testeable as written?** ✅ Yes - clear and well-defined with minor gaps

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Set business name for the first time

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User is authenticated and on business profile settings page
  - Business name field is empty (first time)

- **When:**
  - User enters "Studio Creativo de Carlos" (26 chars) and clicks Save

- **Then:**
  - Business name is saved to `business_profiles.business_name`
  - Profile page shows "Studio Creativo de Carlos" in the field
  - Success toast/message confirms save
  - API returns 200 OK

---

### Scenario 2: Update existing business name

**Type:** Positive
**Priority:** High

- **Given:**
  - User has business name "Studio Creativo" already saved

- **When:**
  - User clears field and enters "Carlos Méndez Design Studio" and clicks Save

- **Then:**
  - New name replaces old one in DB
  - Profile shows updated name
  - New invoices created AFTER update show new name
  - Existing invoices are NOT affected (maintain original name)

---

### Scenario 3: Business name appears on invoice header

**Type:** Integration
**Priority:** Critical

- **Given:**
  - User has business name "Studio Creativo de Carlos" configured

- **When:**
  - User creates and generates a new invoice PDF

- **Then:**
  - "Studio Creativo de Carlos" appears prominently in invoice header
  - Name is readable and properly formatted

---

### Scenario 4: Validation error for exceeding 100 characters

**Type:** Negative
**Priority:** High

- **Given:**
  - User is on business profile settings page

- **When:**
  - User attempts to enter a name longer than 100 characters

- **Then:**
  - Character counter shows current/max (e.g., "101/100")
  - Validation error displayed: max length exceeded
  - Save button is disabled or save attempt returns error
  - Name is NOT saved to DB

---

### Scenario 5: Required field validation for invoice creation

**Type:** Negative
**Priority:** Critical

- **Given:**
  - User has NOT configured a business name (field is empty)

- **When:**
  - User attempts to create an invoice

- **Then:**
  - User is redirected/prompted to complete business profile
  - Invoice creation is blocked until business name is configured

---

### Scenario 6: Whitespace-only input rejected (Edge Case)

**Type:** Negative
**Priority:** Medium
**Source:** Identified during critical analysis

- **Given:**
  - User is on business profile settings page

- **When:**
  - User enters "     " (only whitespace) and clicks Save

- **Then:**
  - Validation error: business name cannot be empty/whitespace
  - Name is NOT saved

---

### Scenario 7: Special characters accepted

**Type:** Boundary
**Priority:** Medium
**Source:** Identified during critical analysis

- **Given:**
  - User is on business profile settings page

- **When:**
  - User enters "José & María's Design – Ñoño LLC™" and clicks Save

- **Then:**
  - Name is accepted and saved correctly
  - Special characters preserved in DB and on invoice PDF

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 7

**Breakdown:**

- Positive: 2 (set name, update name)
- Negative: 3 (>100 chars, empty/whitespace, no name blocks invoice)
- Boundary: 1 (special characters)
- Integration: 1 (name on invoice PDF)

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ❌ No
Scenarios are distinct enough that parametrization doesn't add value for this simple story.

---

### Test Outlines

#### **Should save business name successfully when setting for the first time**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E

**Preconditions:**

- User authenticated, on `/settings` page
- business_profiles record exists with empty business_name

**Test Steps:**

1. Navigate to business profile settings section
2. Enter "Studio Creativo de Carlos" in business name field
   - **Data:** business_name: "Studio Creativo de Carlos"
3. Click Save button
4. **Verify:** Success message appears, field shows saved value

**Expected Result:**

- **UI:** Success toast, field displays "Studio Creativo de Carlos", character counter shows "26/100"
- **API Response:** Status 200, `{ success: true, data: { business_name: "Studio Creativo de Carlos" } }`
- **Database:** `business_profiles.business_name` = "Studio Creativo de Carlos"

**Test Data:**

```json
{
  "input": { "business_name": "Studio Creativo de Carlos" },
  "user": { "email": "testuser@example.com" }
}
```

---

#### **Should update existing business name with new value**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** High
**Test Level:** E2E

**Preconditions:**

- User has existing business_name "Studio Creativo"

**Test Steps:**

1. Navigate to business profile settings
2. Clear existing name, enter "Carlos Méndez Design Studio"
3. Click Save
4. **Verify:** New name saved, old name replaced

**Expected Result:**

- **UI:** Updated name displayed
- **Database:** `business_profiles.business_name` = "Carlos Méndez Design Studio"

---

#### **Should display validation error when business name exceeds 100 characters**

**Related Scenario:** Scenario 4
**Type:** Negative
**Priority:** High
**Test Level:** UI

**Preconditions:**

- User on business profile settings page

**Test Steps:**

1. Enter a string of 101 characters in business name field
   - **Data:** "A" repeated 101 times
2. **Verify:** Character counter shows "101/100" in error state
3. Attempt to click Save

**Expected Result:**

- **UI:** Character counter in red/error state, validation error message displayed
- **Database:** NO changes - name NOT saved

---

#### **Should reject whitespace-only business name**

**Related Scenario:** Scenario 6
**Type:** Negative
**Priority:** Medium
**Test Level:** UI + API

**Preconditions:**

- User on business profile settings page

**Test Steps:**

1. Enter "     " (5 spaces) in business name field
2. Click Save

**Expected Result:**

- **UI:** Validation error - name cannot be empty
- **API:** 400 Bad Request if submitted
- **Database:** NO changes

---

#### **Should block invoice creation when no business name configured**

**Related Scenario:** Scenario 5
**Type:** Negative
**Priority:** Critical
**Test Level:** E2E

**Preconditions:**

- User has no business_name in business_profiles (null or empty)

**Test Steps:**

1. Navigate to invoice creation page
2. **Verify:** Redirect or prompt to complete business profile

**Expected Result:**

- **UI:** Redirect to settings or modal prompting to add business name
- **System State:** Invoice creation blocked

---

#### **Should accept and preserve special characters in business name**

**Related Scenario:** Scenario 7
**Type:** Boundary
**Priority:** Medium
**Test Level:** E2E

**Preconditions:**

- User on business profile settings page

**Test Steps:**

1. Enter "José & María's Design – Ñoño LLC™"
2. Click Save
3. **Verify:** Name saved with all special characters intact

**Expected Result:**

- **UI:** Name displayed with special characters preserved
- **Database:** Characters stored correctly (UTF-8)
- **PDF:** Special characters render correctly on invoice

**Test Data:**

```json
{
  "input": { "business_name": "José & María's Design – Ñoño LLC™" }
}
```

---

#### **Should display business name correctly on invoice PDF header**

**Related Scenario:** Scenario 3
**Type:** Integration
**Priority:** Critical
**Test Level:** E2E

**Preconditions:**

- User has business_name "Studio Creativo de Carlos" configured
- User has at least one client and required profile data for invoicing

**Test Steps:**

1. Create a new invoice
2. Generate/preview PDF
3. **Verify:** "Studio Creativo de Carlos" appears in invoice header

**Expected Result:**

- **PDF:** Business name prominently displayed in header
- **Formatting:** Readable, properly sized text

---

## Edge Cases Summary

| Edge Case | Covered in Original Story? | Added to Refined AC? | Test Outline | Priority |
|-----------|---------------------------|---------------------|-------------|----------|
| Whitespace-only input | ❌ No | ✅ Yes (Scenario 6) | TC-4 | Medium |
| Special characters/unicode | ❌ No | ✅ Yes (Scenario 7) | TC-6 | Medium |
| Concurrent editing (2 tabs) | ❌ No | ❌ Low priority | N/A | Low |

---

## Test Data Summary

| Data Type | Count | Purpose | Examples |
|-----------|-------|---------|----------|
| Valid data | 3 | Positive tests | "Studio Creativo", "Carlos Méndez Design", "V Dev LLC" |
| Invalid data | 3 | Negative tests | "", "     ", "A"×101 |
| Boundary values | 2 | Boundary tests | "A"×100, "A"×1 |
| Special chars | 2 | Edge case tests | "José & María's™", "Diseño Ñoño – LLC" |

---

## Definition of Done (QA Perspective)

- [ ] All 7 test cases executed and passing
- [ ] Critical tests (TC-1, TC-5, TC-7): 100% passing
- [ ] Character counter works correctly (real-time update)
- [ ] Business name renders on invoice PDF
- [ ] No blocking bugs open
- [ ] Regression: existing invoices not affected by name update

---

## Test Execution Tracking

**Test Execution Date:** [TBD]
**Environment:** Staging
**Executed By:** [TBD]

**Results:**

- Total Tests: 7
- Passed: [TBD]
- Failed: [TBD]
- Blocked: [TBD]

---

## Related Documentation

- **Story:** `.context/PBI/epics/EPIC-SQ-7-business-profile/stories/STORY-SQ-8-business-name/story.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-SQ-7-business-profile/feature-test-plan.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`
