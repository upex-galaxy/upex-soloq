# Acceptance Test Plan: STORY-SQ-10 - Contact Information

**Fecha:** 2026-03-11
**QA Engineer:** AI-Generated
**Story Jira Key:** SQ-10
**Epic:** EPIC-SQ-7 - Business Profile Management
**Status:** Draft

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Andrés (Consultant, Argentina) - Necesita que sus clientes corporativos puedan contactarlo fácilmente. La factura es su tarjeta de presentación
- **Secondary:** Valentina (Developer, Colombia) - Clientes internacionales necesitan email y teléfono con código de país

**Business Value:**

- **Value Proposition:** Información de contacto en factura facilita comunicación freelancer-cliente y proyecta profesionalismo
- **Business Impact:** Reduce fricción de cobro - cliente sabe cómo contactar si tiene dudas sobre la factura

**Related User Journey:**

- Journey 1: Onboarding paso 2 - contacto
- Journey 4: Datos de contacto en factura

### Technical Context of This Story

**Frontend:**

- Components: Email input, Phone input with country code selector, Address fields (street, city, state, postal, country)
- Validation: Email format (Zod), E.164 phone format, address fields optional

**Backend:**

- API: `PUT /api/profile` (update contact_email, contact_phone, address)
- Database: `business_profiles` - contact_email (varchar), contact_phone (varchar), address (TEXT)

**Integration Points:**

- Frontend Form → Profile API → business_profiles table
- Contact data → Invoice PDF rendering
- Email pre-fill from account email → contact_email field

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic: Low - standard CRUD
- Integration: Medium - phone country code + address structure
- Data validation: Medium - email format, E.164 phone, optional fields
- UI: Medium - country code selector, multiple address fields

---

### Epic-Level Context (From Feature Test Plan)

**Critical Risks Relevant:**

- Risk 1 (Schema Misalignment): `address` is TEXT in DB but story needs structured fields. **CRITICAL GAP**
- Risk 3 (Profile → PDF): Contact info must render on PDF

**Critical Questions from Epic:**
- Q3 (address storage): Directly affects this story - how are structured address fields stored in TEXT column?

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Address storage format

- **Location:** Technical Notes vs DB schema
- **Question for Dev:** `address` is TEXT column. ¿Cómo se almacenan 5 campos separados (street, city, state, postal_code, country)?
- **Impact on Testing:** Cannot validate DB state without knowing format
- **Suggested Clarification:** Define if JSON, pipe-delimited, or separate columns needed via migration

**Ambiguity 2:** Contact email pre-fill behavior

- **Location:** Scope - "Email pre-filled with account email (editable)"
- **Question for PO:** ¿Se pre-llena automáticamente al crear el perfil? ¿O solo se sugiere? ¿Puede ser diferente al email de login?
- **Impact on Testing:** Need to test pre-fill + edit + different email scenarios

### Missing Information / Gaps

**Gap 1:** No country selector for address

- **Type:** UI/Business Rule
- **Why Critical:** ¿Cómo selecciona el usuario su país? ¿Dropdown? ¿Free text? Esto afecta también a SQ-11 (Tax ID validation)
- **Suggested Addition:** Define country selection mechanism

**Gap 2:** No validation rules for address fields

- **Type:** Validation
- **Why Critical:** ¿Max length para street? ¿Postal code format? ¿Solo ciertos países?
- **Suggested Addition:** Define max lengths and format validations per field

### Edge Cases NOT Covered

**Edge Case 1:** Contact email different from account email

- **Scenario:** User login email is "carlos@gmail.com" but business contact is "info@estudio.mx"
- **Expected Behavior:** Should be allowed - they serve different purposes
- **Criticality:** Medium

**Edge Case 2:** International phone formats

- **Scenario:** User enters phone without country code, or with different formats (+52 1 55 1234 5678)
- **Expected Behavior:** Normalize to E.164 format
- **Criticality:** Medium

**Edge Case 3:** Partial address (only some fields filled)

- **Scenario:** User fills only city and country, leaves street/state/postal empty
- **Expected Behavior:** Should be saved since address is optional
- **Criticality:** Medium

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially - address storage format ambiguity blocks DB validation testing

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Add valid contact email

**Type:** Positive
**Priority:** Critical

- **Given:** User on business profile settings, contact email empty
- **When:** User enters "info@estudio.mx" and clicks Save
- **Then:**
  - Email validated (correct format)
  - Saved to `business_profiles.contact_email`
  - Displayed in profile

### Scenario 2: Reject invalid email format

**Type:** Negative
**Priority:** High

- **Given:** User on business profile settings
- **When:** User enters "not-an-email" in contact email field
- **Then:**
  - Validation error: "Please enter a valid email address"
  - Email NOT saved

### Scenario 3: Add phone with country code

**Type:** Positive
**Priority:** High

- **Given:** User on business profile settings
- **When:** User selects country code (+52 México) and enters "5512345678"
- **Then:**
  - Phone normalized to E.164 format: "+525512345678"
  - Saved to `business_profiles.contact_phone`

### Scenario 4: Reject invalid phone format

**Type:** Negative
**Priority:** Medium

- **Given:** User on business profile settings
- **When:** User enters "abc" or only 3 digits in phone field
- **Then:**
  - Validation error for invalid phone number
  - Phone NOT saved

### Scenario 5: Add complete business address

**Type:** Positive
**Priority:** High

- **Given:** User on business profile settings
- **When:** User fills: Street: "Av. Reforma 123", City: "CDMX", State: "CDMX", Postal: "06600", Country: "México"
- **Then:**
  - All fields saved to `business_profiles.address`
  - Address displayed in profile

### Scenario 6: Save partial address (optional fields)

**Type:** Edge Case
**Priority:** Medium

- **Given:** User on business profile settings
- **When:** User fills only City: "Buenos Aires" and Country: "Argentina", leaves rest empty
- **Then:**
  - Partial address is accepted and saved (address is optional)
  - Only filled fields displayed

### Scenario 7: Contact info appears on invoice

**Type:** Integration
**Priority:** Critical

- **Given:** User has contact email, phone, and address configured
- **When:** User generates invoice PDF
- **Then:**
  - Email, phone, and address appear in contact section of invoice
  - Formatting is professional and readable

### Scenario 8: Edit existing contact information

**Type:** Positive
**Priority:** High

- **Given:** User has existing contact info saved
- **When:** User changes email from "old@email.com" to "new@email.com" and saves
- **Then:**
  - New email replaces old
  - Other fields (phone, address) unchanged

### Scenario 9: Email pre-filled with account email

**Type:** Positive
**Priority:** Medium

- **Given:** User created account with "carlos@gmail.com", first time on profile settings
- **When:** User navigates to contact information section
- **Then:**
  - Contact email field pre-filled with "carlos@gmail.com"
  - User can edit to different email

### Scenario 10: Contact email different from account email

**Type:** Edge Case
**Priority:** Medium

- **Given:** User login email is "carlos@gmail.com"
- **When:** User sets contact email to "info@estudio.mx" and saves
- **Then:**
  - Different email accepted and saved
  - "info@estudio.mx" appears on invoices (NOT login email)

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 10

- Positive: 4 (add email, add phone, add address, edit info)
- Negative: 2 (invalid email, invalid phone)
- Boundary: 1 (partial address)
- Integration: 1 (contact on invoice)
- Edge: 2 (pre-fill from account, different email from account)

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Email validation

| Email Input | Expected Result |
|-------------|-----------------|
| "info@estudio.mx" | ✅ Valid |
| "user@domain.com" | ✅ Valid |
| "val+tag@dev.co" | ✅ Valid |
| "not-an-email" | ❌ Invalid |
| "@missing.com" | ❌ Invalid |
| "user@" | ❌ Invalid |
| "" (empty) | ❌ Required field |

**Parametrized Test Group 2:** Phone validation

| Country Code | Number | Expected Result |
|-------------|--------|-----------------|
| +52 (MX) | "5512345678" | ✅ Valid → "+525512345678" |
| +57 (CO) | "3001234567" | ✅ Valid → "+573001234567" |
| +54 (AR) | "1112345678" | ✅ Valid → "+541112345678" |
| +52 | "abc" | ❌ Invalid |
| +52 | "123" | ❌ Invalid (too short) |

---

### Test Outlines

#### **Should save valid contact email**

**Type:** Positive | **Priority:** Critical | **Test Level:** E2E

**Test Steps:**
1. Navigate to contact info section in settings
2. Enter "info@estudio.mx" in email field
3. Click Save
4. **Verify:** Email saved and displayed

**Expected Result:**
- **Database:** `business_profiles.contact_email` = "info@estudio.mx"
- **UI:** Email displayed in field after save

---

#### **Should reject invalid email format**

**Type:** Negative | **Priority:** High | **Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Test Steps:**
1. Enter invalid email (e.g., "not-an-email")
2. **Verify:** Validation error displayed

---

#### **Should save phone with country code in E.164 format**

**Type:** Positive | **Priority:** High | **Test Level:** E2E

**Test Steps:**
1. Select country code (+52 México)
2. Enter "5512345678"
3. Click Save
4. **Verify:** Phone saved as "+525512345678"

**Expected Result:**
- **Database:** `business_profiles.contact_phone` = "+525512345678"

---

#### **Should reject invalid phone number**

**Type:** Negative | **Priority:** Medium | **Test Level:** UI

**Test Steps:**
1. Enter "abc" or "123" in phone field
2. **Verify:** Validation error

---

#### **Should save complete business address**

**Type:** Positive | **Priority:** High | **Test Level:** E2E

**Test Steps:**
1. Fill all address fields: Street, City, State, Postal Code, Country
2. Click Save
3. **Verify:** Address saved

**Expected Result:**
- **Database:** `business_profiles.address` contains all field data

---

#### **Should accept partial address (optional fields)**

**Type:** Edge Case | **Priority:** Medium | **Test Level:** E2E

**Test Steps:**
1. Fill only City and Country, leave Street/State/Postal empty
2. Click Save
3. **Verify:** Partial address accepted

---

#### **Should display contact info on invoice PDF**

**Type:** Integration | **Priority:** Critical | **Test Level:** E2E

**Test Steps:**
1. Configure complete contact info (email, phone, address)
2. Create and generate invoice PDF
3. **Verify:** All contact info visible on PDF

---

#### **Should update existing contact info**

**Type:** Positive | **Priority:** High | **Test Level:** E2E

**Test Steps:**
1. With existing email "old@email.com"
2. Change to "new@email.com" and save
3. **Verify:** New email saved, phone/address unchanged

---

#### **Should pre-fill contact email from account email**

**Type:** Positive | **Priority:** Medium | **Test Level:** E2E

**Test Steps:**
1. First visit to settings (no contact info set)
2. **Verify:** Contact email pre-filled with account registration email

---

#### **Should allow contact email different from account email**

**Type:** Edge Case | **Priority:** Medium | **Test Level:** E2E

**Test Steps:**
1. Account email: "carlos@gmail.com"
2. Set contact email: "info@estudio.mx"
3. **Verify:** "info@estudio.mx" saved and used on invoices

---

## Definition of Done (QA Perspective)

- [ ] All 10 test cases executed
- [ ] Email and phone validations working
- [ ] Address storage verified (format clarified with Dev)
- [ ] Contact info renders on invoice PDF
- [ ] E.164 phone format enforced
- [ ] Pre-fill from account email works

---

## Related Documentation

- **Story:** `.context/PBI/epics/EPIC-SQ-7-business-profile/stories/STORY-SQ-10-contact-info/story.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-SQ-7-business-profile/feature-test-plan.md`
