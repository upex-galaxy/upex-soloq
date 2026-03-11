# Acceptance Test Plan: STORY-SQ-12 - Payment Methods Configuration

**Fecha:** 2026-03-11
**QA Engineer:** AI-Generated
**Story Jira Key:** SQ-12
**Epic:** EPIC-SQ-7 - Business Profile Management
**Status:** Draft

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Valentina (Developer, Colombia) - Necesita PayPal para clientes internacionales Y transferencia local para clientes colombianos. Múltiples métodos son esenciales
- **Primary:** Andrés (Consultant, Argentina) - CBU/MercadoPago son sus métodos principales. Necesita que aparezcan claros en factura
- **Secondary:** Carlos (Designer, México) - CLABE bancaria es su método principal, complementado con PayPal

**Business Value:**

- **Value Proposition:** Métodos de pago claros en factura eliminan la barrera #1 de cobro: "¿cómo te pago?". Reduce tiempo de cobro significativamente
- **Business Impact:** Directamente impacta KPI de "tiempo promedio de cobro". Métodos claros = cobro más rápido = mejor cash flow

**Related User Journey:**

- Journey 1: Onboarding paso 4 - configurar métodos de pago
- Journey 2 (Invoice Tracking): Cliente ve métodos de pago en factura y paga
- Journey 4: Métodos de pago en sección de pago de factura

### Technical Context of This Story

**Frontend:**

- Components: Payment method form (dynamic fields per type), method list, edit/delete actions, toggle active/inactive, add button
- Dynamic fields: bank_transfer (bank name, account, CLABE/CBU), paypal (email), mercadopago (alias/CVU), other (name, instructions)
- Pages/Routes: `/settings` (payment methods section), `/onboarding` (step 4)

**Backend:**

- API Endpoints:
  - `GET /api/profile/payment-methods` - list all
  - `PUT /api/profile/payment-methods` - update (add/edit/delete/toggle)
  - Individual CRUD operations on `payment_methods` table
- Database: `payment_methods` table - id, user_id, type (enum), label, value, is_default, sort_order

**Critical DB Schema Issues:**

- `payment_methods.value` is single VARCHAR - how to store multi-field bank transfer data (bank name, account number, CLABE/CBU)?
- No `is_active` column for toggle active/inactive
- `type` enum: `mercado_pago` (DB) vs `mercadopago` (story) - naming inconsistency

**Integration Points:**

- Frontend Form → Payment Methods API → payment_methods table
- Payment methods → Invoice PDF (all active methods in payment section)
- Payment methods count → Invoice creation validation (at least 1 required)
- Country selection (from SQ-10/SQ-11) → Dynamic bank transfer fields (CLABE for MX, CBU for AR)

### Story Complexity Analysis

**Overall Complexity:** High

**Complexity Factors:**

- Business logic: High - 4 payment types, each with different validation, CRUD operations, toggle state, default selection
- Integration: High - invoice PDF, invoice creation validation, country-dependent fields
- Data validation: High - email format (PayPal), bank details per country, custom method fields
- UI: High - dynamic forms, list management, active/inactive toggle, reorder

**Estimated Test Effort:** High

---

### Epic-Level Context (From Feature Test Plan)

**Critical Risks Relevant:**

- Risk 1 (Schema Misalignment): `value` VARCHAR for multi-field data, missing `is_active` column
- Risk 3 (Profile → PDF): All active payment methods must render on invoice
- Business Risk 2: Incomplete methods block facturación

**Critical Questions from Epic:**

- Q4: How are bank transfer fields stored in `payment_methods.value`? ⏳ Pending
- Q5: Migration needed for `is_active` column? ⏳ Pending

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Storage format for bank transfer details

- **Location:** Technical Notes + DB schema
- **Question for Dev:** `payment_methods.value` is VARCHAR. Bank transfer has 3 fields (bank name, account number, CLABE/CBU). ¿JSON en `value`? ¿Columnas separadas? ¿Label = bank name, Value = account details?
- **Impact on Testing:** Cannot validate DB state without knowing format
- **Suggested Clarification:** Define storage format explicitly

**Ambiguity 2:** Country-specific bank fields

- **Location:** AC1 - "CLABE/CBU"
- **Question for PO:** ¿CLABE se muestra solo para México y CBU solo para Argentina? ¿Cómo se determina qué campos mostrar? ¿Depende del country de SQ-10/SQ-11?
- **Impact on Testing:** Need to test field visibility per country

**Ambiguity 3:** "At least one" validation scope

- **Location:** AC6 - "at least one payment method"
- **Question for PO:** ¿Al menos uno activo o al menos uno existente? Si hay 2 pero ambos están inactivos, ¿puede crear factura?
- **Impact on Testing:** Affects toggle and delete validation logic

### Missing Information / Gaps

**Gap 1:** No `is_active` column in payment_methods

- **Type:** BLOCKER
- **Why Critical:** Story requires toggle active/inactive but column doesn't exist
- **Suggested Addition:** Add `is_active BOOLEAN DEFAULT true` to payment_methods

**Gap 2:** No AC for MercadoPago specific validation

- **Type:** Business Rule
- **Why Critical:** MercadoPago alias format and CVU format have specific rules
- **Suggested Addition:** Define MercadoPago validation (alias: alphanumeric, CVU: 22 digits)

**Gap 3:** No max limit on payment methods

- **Type:** Boundary
- **Why Critical:** User could add 50 methods, affecting invoice layout
- **Suggested Addition:** Define reasonable max (e.g., 10 methods)

### Edge Cases NOT Covered

**Edge Case 1:** Delete last active payment method

- **Scenario:** User has 1 active method, tries to delete or deactivate it
- **Expected Behavior:** Block deletion/deactivation - "At least one active payment method required"
- **Criticality:** High

**Edge Case 2:** Duplicate payment methods

- **Scenario:** User adds two bank transfer methods with same details
- **Expected Behavior:** Allow (user may have different bank accounts) or warn
- **Criticality:** Low

**Edge Case 3:** Very long custom instructions

- **Scenario:** User enters 2000+ characters in custom method instructions
- **Expected Behavior:** Should have max length limit
- **Criticality:** Medium

**Edge Case 4:** Sort order persistence

- **Scenario:** User reorders payment methods
- **Expected Behavior:** Order persists and reflects on invoice
- **Criticality:** Low (if reorder is in scope)

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially - DB schema gaps (`is_active`, `value` format) are blockers

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Add bank transfer (Mexico - CLABE)

**Type:** Positive
**Priority:** Critical

- **Given:** User on payment methods, country is Mexico
- **When:** User selects "Bank Transfer", enters Bank: "BBVA México", Account: "0123456789", CLABE: "012345678901234567" (18 digits)
- **Then:**
  - Payment method saved with type: bank_transfer
  - Details stored correctly in DB
  - Method appears in payment methods list

### Scenario 2: Add bank transfer (Argentina - CBU)

**Type:** Positive
**Priority:** High

- **Given:** User on payment methods, country is Argentina
- **When:** User selects "Bank Transfer", enters Bank: "Banco Nación", CBU: "0110012345678901234567" (22 digits)
- **Then:**
  - Saved with correct country-specific fields
  - CBU field shown instead of CLABE

### Scenario 3: Add PayPal method

**Type:** Positive
**Priority:** Critical

- **Given:** User on payment methods
- **When:** User selects "PayPal", enters email "valentina@dev.co"
- **Then:**
  - PayPal email validated (email format)
  - Saved with type: paypal
  - Label: "PayPal", Value: "valentina@dev.co"

### Scenario 4: Add MercadoPago method

**Type:** Positive
**Priority:** High

- **Given:** User on payment methods
- **When:** User selects "MercadoPago", enters alias "val.dev" or CVU
- **Then:**
  - Saved with type: mercado_pago
  - Details stored correctly

### Scenario 5: Add custom payment method

**Type:** Positive
**Priority:** High

- **Given:** User on payment methods
- **When:** User selects "Other", enters Name: "Wise Transfer", Instructions: "Send to account ending in 1234, reference: invoice number"
- **Then:**
  - Saved with type: other
  - Both name and instructions stored

### Scenario 6: Reject invalid PayPal email

**Type:** Negative
**Priority:** High

- **Given:** User adding PayPal method
- **When:** User enters "not-an-email" as PayPal address
- **Then:**
  - Error: "Please enter a valid PayPal email address"
  - Method NOT saved

### Scenario 7: All active methods appear on invoice

**Type:** Integration
**Priority:** Critical

- **Given:** User has 3 active methods: Bank Transfer, PayPal, MercadoPago
- **When:** User generates invoice PDF
- **Then:**
  - All 3 methods displayed in payment section of invoice
  - Each method shows its details (bank: CLABE, PayPal: email, etc.)

### Scenario 8: Require at least one method for invoicing

**Type:** Negative
**Priority:** Critical

- **Given:** User has NO payment methods configured
- **When:** User tries to create an invoice
- **Then:**
  - Blocked with message: "Add at least one payment method before creating invoices"
  - Redirect to payment methods settings

### Scenario 9: Toggle method inactive

**Type:** Positive
**Priority:** High

- **Given:** User has 3 active payment methods
- **When:** User toggles PayPal to inactive
- **Then:**
  - PayPal marked as inactive (is_active = false)
  - PayPal does NOT appear on new invoices
  - PayPal still visible in settings (grayed out or marked)
  - Not deleted from DB

### Scenario 10: Edit existing payment method

**Type:** Positive
**Priority:** High

- **Given:** User has bank transfer with CLABE "012345678901234567"
- **When:** User edits CLABE to "987654321098765432" and saves
- **Then:**
  - Updated CLABE saved
  - Other fields (bank name, etc.) unchanged
  - New invoices show updated details

### Scenario 11: Delete payment method with confirmation

**Type:** Positive
**Priority:** High

- **Given:** User has 3 payment methods
- **When:** User clicks delete on PayPal, confirms in dialog
- **Then:**
  - PayPal permanently removed from DB
  - List updated without PayPal
  - User still has 2 methods (above minimum)

### Scenario 12: Block delete of last active method

**Type:** Negative
**Priority:** Critical

- **Given:** User has only 1 active payment method (bank transfer)
- **When:** User tries to delete or deactivate it
- **Then:**
  - Error: "You must have at least one active payment method"
  - Method NOT deleted/deactivated

### Scenario 13: Reject empty required fields

**Type:** Negative
**Priority:** High

- **Given:** User adding new bank transfer method
- **When:** User leaves bank name or account number empty
- **Then:**
  - Validation error: required fields must be filled
  - Method NOT saved

### Scenario 14: CLABE validation (18 digits, Mexico)

**Type:** Boundary
**Priority:** High

- **Given:** User adding bank transfer, country Mexico
- **When:** User enters CLABE with wrong length (17 or 19 digits)
- **Then:**
  - Error: "CLABE must be 18 digits"

### Scenario 15: CBU validation (22 digits, Argentina)

**Type:** Boundary
**Priority:** High

- **Given:** User adding bank transfer, country Argentina
- **When:** User enters CBU with wrong length (21 or 23 digits)
- **Then:**
  - Error: "CBU must be 22 digits"

### Scenario 16: Very long custom instructions

**Type:** Boundary
**Priority:** Medium

- **Given:** User adding custom payment method
- **When:** User enters 2000+ characters in instructions field
- **Then:**
  - Max length enforced (truncated or error)
  - If accepted, doesn't break invoice PDF layout

### Scenario 17: Multiple methods of same type

**Type:** Edge Case
**Priority:** Medium

- **Given:** User has one bank transfer method
- **When:** User adds another bank transfer (different bank)
- **Then:**
  - Second bank transfer allowed
  - Both appear in list and on invoices

### Scenario 18: Inactive methods not on invoice but active on reactivation

**Type:** Edge Case
**Priority:** Medium

- **Given:** User has PayPal toggled inactive
- **When:** User re-toggles PayPal to active
- **Then:**
  - PayPal appears on new invoices again
  - All original details preserved

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 18

- Positive: 7 (add bank MX, add bank AR, add PayPal, add MercadoPago, add custom, edit, toggle active/reactivate)
- Negative: 4 (invalid PayPal email, empty fields, no methods blocks invoice, block delete last)
- Boundary: 3 (CLABE 18 digits, CBU 22 digits, long instructions)
- Integration: 1 (all active on invoice)
- Edge: 3 (delete with confirm, multiple same type, inactive not on invoice)

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Add payment method per type

| Type | Label | Value/Details | Validation |
|------|-------|---------------|------------|
| bank_transfer (MX) | "BBVA México" | CLABE: 012345678901234567 | 18 digits |
| bank_transfer (AR) | "Banco Nación" | CBU: 0110012345678901234567 | 22 digits |
| paypal | "PayPal" | valentina@dev.co | Email format |
| mercado_pago | "MercadoPago" | alias: val.dev | Alphanumeric |
| other | "Wise Transfer" | Instructions text | Free text |

**Parametrized Test Group 2:** Country-specific bank fields

| Country | Field Shown | Field Hidden | Validation |
|---------|------------|-------------|------------|
| Mexico | CLABE | CBU | 18 digits |
| Argentina | CBU | CLABE | 22 digits |
| Colombia | Account Number | CLABE, CBU | Generic |

---

### Test Outlines

#### **Should add bank transfer with CLABE for Mexico**

**Type:** Positive | **Priority:** Critical | **Test Level:** E2E

**Preconditions:** User authenticated, country set to Mexico

**Test Steps:**
1. Navigate to payment methods settings
2. Click "Add Payment Method"
3. Select "Bank Transfer"
4. Fill: Bank: "BBVA México", Account: "0123456789", CLABE: "012345678901234567"
5. Click Save

**Expected Result:**
- **UI:** Method appears in list with bank name and masked CLABE
- **Database:** `payment_methods` row with type: bank_transfer, label: "BBVA México"

**Test Data:**
```json
{
  "type": "bank_transfer",
  "label": "BBVA México",
  "details": {
    "account": "0123456789",
    "clabe": "012345678901234567"
  }
}
```

---

#### **Should add PayPal with valid email**

**Type:** Positive | **Priority:** Critical | **Test Level:** E2E

**Test Steps:**
1. Add Payment Method → Select PayPal
2. Enter email: "valentina@dev.co"
3. Save

**Expected Result:**
- **Database:** type: paypal, value: "valentina@dev.co"

---

#### **Should reject invalid PayPal email**

**Type:** Negative | **Priority:** High | **Test Level:** UI

**Test Steps:**
1. Add PayPal method
2. Enter "not-an-email"
3. **Verify:** Validation error

---

#### **Should display all active methods on invoice PDF**

**Type:** Integration | **Priority:** Critical | **Test Level:** E2E

**Preconditions:** User has 3 active methods configured

**Test Steps:**
1. Create invoice
2. Generate PDF
3. **Verify:** All 3 methods displayed with their details

---

#### **Should block invoice creation when no payment methods**

**Type:** Negative | **Priority:** Critical | **Test Level:** E2E

**Preconditions:** User has 0 payment methods

**Test Steps:**
1. Navigate to create invoice
2. **Verify:** Blocked, prompted to add payment method

---

#### **Should toggle payment method inactive**

**Type:** Positive | **Priority:** High | **Test Level:** E2E

**Test Steps:**
1. With active PayPal method
2. Click toggle to deactivate
3. **Verify:** Method grayed out, not on new invoices

---

#### **Should prevent deleting/deactivating last active method**

**Type:** Negative | **Priority:** Critical | **Test Level:** E2E

**Preconditions:** User has exactly 1 active method

**Test Steps:**
1. Try to delete or deactivate the only method
2. **Verify:** Error message, action blocked

---

#### **Should edit existing payment method details**

**Type:** Positive | **Priority:** High | **Test Level:** E2E

**Test Steps:**
1. Edit bank transfer CLABE
2. Save
3. **Verify:** Updated in DB, new value on next invoice

---

#### **Should delete payment method with confirmation**

**Type:** Positive | **Priority:** High | **Test Level:** E2E

**Preconditions:** User has 2+ methods

**Test Steps:**
1. Click delete on one method
2. Confirm in dialog
3. **Verify:** Method removed permanently

---

#### **Should validate CLABE is exactly 18 digits**

**Type:** Boundary | **Priority:** High | **Test Level:** UI

**Test Steps:**
1. Add bank transfer for Mexico
2. Enter CLABE with 17 digits
3. **Verify:** Error - "CLABE must be 18 digits"
4. Enter CLABE with 18 digits
5. **Verify:** Accepted

---

#### **Should validate CBU is exactly 22 digits**

**Type:** Boundary | **Priority:** High | **Test Level:** UI

**Test Steps:**
1. Add bank transfer for Argentina
2. Enter CBU with 21 digits
3. **Verify:** Error
4. Enter CBU with 22 digits
5. **Verify:** Accepted

---

#### **Should add custom payment method**

**Type:** Positive | **Priority:** High | **Test Level:** E2E

**Test Steps:**
1. Select "Other"
2. Enter Name: "Wise", Instructions: "Transfer to account..."
3. Save
4. **Verify:** Saved with type: other

---

#### **Should add MercadoPago with alias**

**Type:** Positive | **Priority:** High | **Test Level:** E2E

**Test Steps:**
1. Select "MercadoPago"
2. Enter alias: "val.dev"
3. Save
4. **Verify:** Saved with type: mercado_pago

---

#### **Should allow multiple methods of same type**

**Type:** Edge Case | **Priority:** Medium | **Test Level:** E2E

**Test Steps:**
1. Add bank transfer "BBVA"
2. Add another bank transfer "Banorte"
3. **Verify:** Both appear in list

---

#### **Should reactivate inactive method**

**Type:** Edge Case | **Priority:** Medium | **Test Level:** E2E

**Test Steps:**
1. Deactivate PayPal
2. Reactivate PayPal
3. **Verify:** Appears on new invoices again with original details

---

#### **Should enforce max length on custom instructions**

**Type:** Boundary | **Priority:** Medium | **Test Level:** UI

**Test Steps:**
1. Add custom method
2. Enter 2000+ characters in instructions
3. **Verify:** Max length enforced or accepted gracefully

---

## Edge Cases Summary

| Edge Case | Covered in Original Story? | Added to Refined AC? | Priority |
|-----------|---------------------------|---------------------|----------|
| Delete last active method | ❌ No | ✅ Yes (Scenario 12) | Critical |
| Duplicate methods (same type) | ❌ No | ✅ Yes (Scenario 17) | Medium |
| Very long instructions | ❌ No | ✅ Yes (Scenario 16) | Medium |
| Reactivate inactive method | ❌ No | ✅ Yes (Scenario 18) | Medium |
| Country-specific bank fields | ⚠️ Partial | ✅ Yes (Scenario 1, 2) | High |

---

## Test Data Summary

| Data Type | Count | Purpose | Examples |
|-----------|-------|---------|----------|
| Valid methods | 5 | Positive tests | Bank MX, Bank AR, PayPal, MercadoPago, Custom |
| Invalid data | 3 | Negative tests | Bad email, empty fields, 0 methods |
| Boundary values | 3 | Boundary tests | CLABE 17/18/19 digits, CBU 21/22/23, long text |
| Edge case data | 3 | Edge case tests | Last method, duplicate type, reactivate |

---

## Definition of Done (QA Perspective)

- [ ] All 18 test cases executed
- [ ] All 4 payment types (bank, PayPal, MercadoPago, custom) working
- [ ] CRUD operations (create, read, update, delete) verified
- [ ] Toggle active/inactive working
- [ ] At least one method required for invoicing
- [ ] Country-specific bank fields (CLABE/CBU) working
- [ ] All active methods render on invoice PDF
- [ ] DB migration applied (is_active column)
- [ ] Enum consistency verified (mercado_pago)

---

## Related Documentation

- **Story:** `.context/PBI/epics/EPIC-SQ-7-business-profile/stories/STORY-SQ-12-payment-methods/story.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-SQ-7-business-profile/feature-test-plan.md`
