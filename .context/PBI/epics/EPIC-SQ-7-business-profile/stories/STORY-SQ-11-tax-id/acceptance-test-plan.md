# Acceptance Test Plan: STORY-SQ-11 - Tax ID Configuration

**Fecha:** 2026-03-11
**QA Engineer:** AI-Generated
**Story Jira Key:** SQ-11
**Epic:** EPIC-SQ-7 - Business Profile Management
**Status:** Draft

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Designer, México) - Necesita RFC para facturas formales ante SAT
- **Primary:** Andrés (Consultant, Argentina) - CUIT es requerido por clientes corporativos
- **Secondary:** Valentina (Developer, Colombia) - NIT para facturación a startups colombianas

**Business Value:**

- **Value Proposition:** Datos fiscales correctos dan legitimidad legal a la factura. Sin tax ID, algunos clientes no aceptan facturas
- **Business Impact:** Reduce barreras legales/formales de facturación en LATAM, donde cada país tiene su formato

**Related User Journey:**

- Journey 1: No es parte explícita del onboarding, pero tax ID se configura en settings
- Journey 4: Tax ID aparece en la factura junto al nombre del negocio

### Technical Context of This Story

**Frontend:**

- Components: Country selector, Tax ID input with dynamic label, input mask per country, validation per country
- Dynamic behavior: seleccionar país cambia label (RFC/NIT/CUIT), validation regex, input mask

**Backend:**

- API: `PUT /api/profile` (update tax_id, tax_id_type)
- Database: `business_profiles.tax_id` (varchar) - **NO existe `tax_id_type` ni `country`**

**Integration Points:**

- Country selection → Dynamic label + validation rules
- Tax ID → Invoice PDF (with correct label per country)
- Country → also affects SQ-12 (payment method fields like CLABE/CBU)

### Story Complexity Analysis

**Overall Complexity:** High

**Complexity Factors:**

- Business logic: High - country-specific validation rules (3+ countries, different formats)
- Integration: Medium - standard CRUD but dynamic validation
- Data validation: High - regex patterns per country (RFC 12/13 chars, NIT 9+1 digits, CUIT 11 digits)
- UI: High - dynamic label, input mask, country-dependent behavior

---

### Epic-Level Context (From Feature Test Plan)

**Critical Risks Relevant:**

- Risk 1 (Schema Misalignment): **CRITICAL** - No `tax_id_type` column, no `country` column in DB
- Q5 from Epic: Migration needed for these columns BEFORE implementation

**Critical Questions from Epic (status):**

- Q3 (country field): ⏳ Pending - where does country come from?
- Q5 (migration): ⏳ Pending - BLOCKER for this story

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Country selection mechanism

- **Location:** AC - "my country is Mexico/Colombia/Argentina"
- **Question for PO/Dev:** ¿Cómo selecciona el usuario su país? ¿Es un dropdown en esta story? ¿Se seleccionó antes en SQ-10 (address)? ¿Se detecta automáticamente?
- **Impact on Testing:** Afecta todo el flujo - country drives validation rules, labels, and input masks
- **Suggested Clarification:** Add explicit AC for country selection

**Ambiguity 2:** What happens for unsupported countries?

- **Location:** Story only mentions MX, CO, AR
- **Question for PO:** ¿Qué pasa si un freelancer es de Chile (RUT), Perú (RUC), o un país sin formato específico? ¿Free text?
- **Impact on Testing:** Need to test generic/fallback validation
- **Suggested Clarification:** Define behavior for countries outside MX/CO/AR

**Ambiguity 3:** RFC personas físicas vs morales

- **Location:** AC1 - "13 characters for personas físicas, 12 for morales"
- **Question for PO:** ¿Cómo sabe el sistema si es persona física o moral? ¿User selects? ¿Se infiere del largo?
- **Impact on Testing:** Validation must accept both 12 and 13 chars for MX

### Missing Information / Gaps

**Gap 1:** DB columns `tax_id_type` and `country` don't exist

- **Type:** Technical/BLOCKER
- **Why Critical:** Cannot store tax ID type or determine validation rules without these
- **Suggested Addition:** DB migration to add columns BEFORE implementation
- **Impact if Not Added:** Story CANNOT be implemented correctly

**Gap 2:** No AC for changing country after entering tax ID

- **Type:** Edge Case
- **Why Critical:** If user enters RFC (MX) then changes to Colombia, the RFC is invalid for NIT
- **Suggested Addition:** AC: "When user changes country, tax ID field is cleared and re-validated"

**Gap 3:** No specific error messages per validation failure

- **Type:** UX
- **Why Critical:** "Invalid tax ID" is not helpful - should say what's wrong
- **Suggested Addition:** Country-specific error messages (e.g., "RFC must be 12 or 13 alphanumeric characters")

### Edge Cases NOT Covered

**Edge Case 1:** Change country after entering valid tax ID

- **Scenario:** User enters valid RFC, then changes country to Colombia
- **Expected Behavior:** Clear tax ID field, change label to NIT, require new validation
- **Criticality:** High

**Edge Case 2:** Tax ID with lowercase letters

- **Scenario:** User enters RFC in lowercase: "mecc920101abc"
- **Expected Behavior:** Accept and convert to uppercase, or reject with guidance
- **Criticality:** Medium

**Edge Case 3:** Country not in supported list (Chile, Peru, etc.)

- **Scenario:** User selects Chile as country
- **Expected Behavior:** Show generic "Tax ID" label with no specific validation
- **Criticality:** Medium

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially - Country selection mechanism and DB migration are blockers

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Configure valid RFC (Mexico - persona física)

**Type:** Positive
**Priority:** Critical

- **Given:** User on business profile settings, country set to Mexico
- **When:** User enters RFC "MECC920101ABC" (13 characters)
- **Then:**
  - RFC format validated (alphanumeric, 13 chars for persona física)
  - Saved to `business_profiles.tax_id`
  - Tax ID type saved as "RFC" in `business_profiles.tax_id_type`
  - Label shows "RFC"

### Scenario 2: Configure valid RFC (Mexico - persona moral)

**Type:** Positive
**Priority:** High

- **Given:** User on business profile settings, country set to Mexico
- **When:** User enters RFC "MEC920101AB" (12 characters, persona moral)
- **Then:**
  - RFC format validated (12 chars for persona moral)
  - Saved successfully

### Scenario 3: Configure valid NIT (Colombia)

**Type:** Positive
**Priority:** Critical

- **Given:** User on business profile settings, country set to Colombia
- **When:** User enters NIT "900123456-7" (9 digits + verification digit)
- **Then:**
  - NIT format validated
  - Label shows "NIT"
  - Saved to DB

### Scenario 4: Configure valid CUIT (Argentina)

**Type:** Positive
**Priority:** Critical

- **Given:** User on business profile settings, country set to Argentina
- **When:** User enters CUIT "20-12345678-9" (format XX-XXXXXXXX-X)
- **Then:**
  - CUIT format validated (11 digits, specific format)
  - Label shows "CUIT"
  - Saved to DB

### Scenario 5: Reject invalid RFC format

**Type:** Negative
**Priority:** High

- **Given:** Country is Mexico
- **When:** User enters "ABC" (too short) or "12345678901234" (too long)
- **Then:**
  - Specific error: "RFC must be 12 or 13 alphanumeric characters"
  - NOT saved

### Scenario 6: Reject invalid NIT format

**Type:** Negative
**Priority:** High

- **Given:** Country is Colombia
- **When:** User enters "ABC" (non-numeric) or "12345" (too short)
- **Then:**
  - Specific error: "NIT must be 9 digits followed by a verification digit"
  - NOT saved

### Scenario 7: Reject invalid CUIT format

**Type:** Negative
**Priority:** High

- **Given:** Country is Argentina
- **When:** User enters "12345" (too short) or "AB-12345678-9" (non-numeric prefix)
- **Then:**
  - Specific error: "CUIT must follow format XX-XXXXXXXX-X (11 digits)"
  - NOT saved

### Scenario 8: Tax ID appears on invoice with correct label

**Type:** Integration
**Priority:** Critical

- **Given:** User has RFC "MECC920101ABC" configured, country Mexico
- **When:** User generates invoice PDF
- **Then:**
  - Invoice shows "RFC: MECC920101ABC" (not just the number, includes label)

### Scenario 9: Skip tax ID (optional field)

**Type:** Positive
**Priority:** High

- **Given:** User on business profile settings
- **When:** User leaves tax ID field empty and saves
- **Then:**
  - Profile saved without tax ID
  - User can create invoices (tax ID section omitted from invoice)
  - No validation error

### Scenario 10: Dynamic label changes with country

**Type:** Positive
**Priority:** High

- **Given:** User on business profile settings
- **When:** User selects Mexico → label shows "RFC", then changes to Colombia → label shows "NIT", then Argentina → "CUIT"
- **Then:**
  - Label updates dynamically without page reload
  - Input mask/validation adapts to selected country

### Scenario 11: Change country clears existing tax ID (Edge Case)

**Type:** Edge Case
**Priority:** High

- **Given:** User has valid RFC "MECC920101ABC" for Mexico
- **When:** User changes country to Colombia
- **Then:**
  - Tax ID field cleared (RFC is invalid for NIT)
  - Label changes to "NIT"
  - User prompted to enter new tax ID
  - ⚠️ Needs PO confirmation

### Scenario 12: Tax ID with lowercase input

**Type:** Boundary
**Priority:** Medium

- **Given:** Country is Mexico
- **When:** User enters "mecc920101abc" (lowercase)
- **Then:**
  - Accepted and auto-converted to "MECC920101ABC", OR
  - Validation hint: "RFC should be in uppercase"

### Scenario 13: Unsupported country fallback

**Type:** Edge Case
**Priority:** Medium

- **Given:** User selects Chile as country
- **When:** User sees tax ID section
- **Then:**
  - Label shows "RUT" or generic "Tax ID"
  - No specific format validation (free text accepted)
  - OR: informative message about supported countries

### Scenario 14: Input mask formatting (CUIT)

**Type:** Positive
**Priority:** Medium

- **Given:** Country is Argentina
- **When:** User types "20123456789"
- **Then:**
  - Input mask auto-formats to "20-12345678-9"
  - User sees formatted version while typing

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 14

- Positive: 5 (RFC física, RFC moral, NIT, CUIT, skip tax ID)
- Negative: 3 (invalid RFC, NIT, CUIT)
- Boundary: 1 (lowercase input)
- Integration: 1 (tax ID on invoice with label)
- Edge: 3 (change country, unsupported country, dynamic label)
- UI: 1 (input mask formatting)

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Tax ID validation per country

| Country | Tax ID Type | Valid Input | Invalid Input | Expected Label |
|---------|------------|-------------|---------------|----------------|
| Mexico | RFC | "MECC920101ABC" (13) | "ABC" | "RFC" |
| Mexico | RFC | "MEC920101AB" (12) | "12345678901234" (14) | "RFC" |
| Colombia | NIT | "900123456-7" | "ABCDEF" | "NIT" |
| Argentina | CUIT | "20-12345678-9" | "12345" | "CUIT" |

**Total Tests from Parametrization:** 8 (4 valid + 4 invalid)
**Benefit:** Same validation pattern, different data per country - ideal for parametrization

---

### Test Outlines

#### **Should validate and save RFC correctly for Mexico (persona física)**

**Type:** Positive | **Priority:** Critical | **Test Level:** E2E

**Preconditions:** User authenticated, country set to Mexico

**Test Steps:**
1. Navigate to tax ID section in settings
2. Verify label shows "RFC"
3. Enter "MECC920101ABC"
4. Click Save
5. **Verify:** RFC saved, displayed in profile

**Expected Result:**
- **Database:** `tax_id` = "MECC920101ABC", `tax_id_type` = "RFC"

---

#### **Should validate and save NIT correctly for Colombia**

**Type:** Positive | **Priority:** Critical | **Test Level:** E2E
**Parametrized:** ✅ Yes (Group 1)

**Test Steps:**
1. Set country to Colombia
2. Verify label shows "NIT"
3. Enter "900123456-7"
4. Click Save

---

#### **Should validate and save CUIT correctly for Argentina**

**Type:** Positive | **Priority:** Critical | **Test Level:** E2E

**Test Steps:**
1. Set country to Argentina
2. Verify label shows "CUIT"
3. Enter "20-12345678-9" (or "20123456789" if input mask formats automatically)
4. Click Save

---

#### **Should reject invalid tax ID format per country**

**Type:** Negative | **Priority:** High | **Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Test Steps:**
1. Select country
2. Enter invalid tax ID
3. **Verify:** Country-specific error message displayed

---

#### **Should display tax ID on invoice with correct label**

**Type:** Integration | **Priority:** Critical | **Test Level:** E2E

**Test Steps:**
1. Configure RFC "MECC920101ABC" for Mexico
2. Create and generate invoice PDF
3. **Verify:** Invoice shows "RFC: MECC920101ABC"

---

#### **Should allow skipping tax ID (optional)**

**Type:** Positive | **Priority:** High | **Test Level:** E2E

**Test Steps:**
1. Leave tax ID field empty
2. Save profile
3. Navigate to invoice creation
4. **Verify:** Can create invoice, tax ID section omitted from PDF

---

#### **Should change label dynamically when country changes**

**Type:** Positive | **Priority:** High | **Test Level:** UI

**Test Steps:**
1. Select Mexico → verify "RFC" label
2. Select Colombia → verify "NIT" label
3. Select Argentina → verify "CUIT" label
4. **Verify:** Changes happen without page reload

---

#### **Should clear tax ID when country changes (edge case)**

**Type:** Edge Case | **Priority:** High | **Test Level:** E2E

**Test Steps:**
1. Set country to Mexico, enter valid RFC
2. Change country to Colombia
3. **Verify:** Tax ID field cleared, label shows "NIT"

---

#### **Should handle lowercase tax ID input**

**Type:** Boundary | **Priority:** Medium | **Test Level:** UI

**Test Steps:**
1. Country: Mexico
2. Enter "mecc920101abc" (lowercase)
3. **Verify:** Auto-converts to uppercase OR shows guidance

---

#### **Should handle unsupported country gracefully**

**Type:** Edge Case | **Priority:** Medium | **Test Level:** UI

**Test Steps:**
1. Select Chile (or other unsupported country)
2. **Verify:** Generic label or "RUT", flexible validation

---

## Definition of Done (QA Perspective)

- [ ] All 14 test cases executed
- [ ] RFC, NIT, CUIT validation working correctly
- [ ] Dynamic label changes working
- [ ] Tax ID optional (can skip)
- [ ] Tax ID renders on invoice PDF with correct label
- [ ] DB migration applied (tax_id_type, country columns)

---

## Related Documentation

- **Story:** `.context/PBI/epics/EPIC-SQ-7-business-profile/stories/STORY-SQ-11-tax-id/story.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-SQ-7-business-profile/feature-test-plan.md`
