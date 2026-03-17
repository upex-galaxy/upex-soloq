# Acceptance Test Plan: STORY-SQ-44 - Include Payment Data in Email

**Fecha:** 2026-03-05
**QA Engineer:** Gemini CLI
**Story Jira Key:** SQ-44
**Epic:** EPIC-SQ-37 - Invoice Sending
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**
- **Primary:** Carlos (Freelance Designer) - Needs to project professionalism and ensure clients have no excuse for late payments by providing clear bank details.
- **Secondary:** Valentina (Frontend Developer) - Works with international clients and needs her PayPal email to be clearly visible and easy to copy.

**Business Value:**
- **Value Proposition:** Reduces payment friction by placing actionable payment information directly in the client's inbox.
- **Business Impact:** Contributes to the KPI of reducing collection time (DSO - Days Sales Outstanding) by >30% for Pro users.

**Related User Journey:**
- Journey 1: Registro y Primera Factura (Step 13: Enviar Factura).
- Journey 2: Seguimiento y Cobro (Step 4: Enviar Recordatorio Manual).

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**
- `InvoiceDetail` page: The "Send" action triggers the backend process.
- `EmailPreview` component: Should show a preview of how payment data will look.

**Backend:**
- `POST /api/invoices/{id}/send`: The endpoint responsible for gathering data and triggering Resend.
- **Data Fetching:** Must query the `payment_methods` table (NOT `business_profile`) filtered by `user_id`.

**Database:**
- `payment_methods`: Table containing the types (bank_transfer, paypal, etc.), labels, and values. **Source of truth for this story.**
- `business_profiles`: Table containing general business info (Name, Logo, Tax ID).

**Integration Points:**
- Backend ↔ Resend (via React Email templates).
- Backend ↔ Database (fetching `payment_methods`).

---

### Story Complexity Analysis

**Overall Complexity:** Low

**Complexity Factors:**
- Business logic complexity: Low - Mostly a data formatting and injection task.
- Integration complexity: Medium - Requires correct mapping between DB fields and Email Template.
- Data validation complexity: Low.

**Estimated Test Effort:** Low
**Rationale:** The scope is limited to data display and formatting in a single output channel (Email).

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**
- **Risk:** Incorrect or illegible payment data.
- **Relevance to This Story:** Directly addressed here. If formatting is poor, the business value is lost.

**Integration Points from Epic Analysis:**
- Backend ↔ Resend API: Used to send the final email containing the payment data.

**Critical Questions Already Asked at Epic Level:**
- **Ambiguity 5:** `payment_methods` only has `label/value`; how to represent “bank name/CLABE”?
- **Relevance:** This is the core technical challenge for SQ-44.

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Data Source Error (RESOLVED)
- **Location in Story:** Technical Notes.
- **Issue:** The original note says "Pull payment methods from business_profile".
- **QA Finding:** According to `src/types/supabase.ts`, payment methods are stored in the `payment_methods` table.
- **Instruction for Dev:** Ignore the note in the original story. Fetch data from the `payment_methods` table joined by `user_id`.

**Ambiguity 2:** "Format clearly"
- **Location in Story:** Technical Notes.
- **Question for PO:** Should it be a simple list, a table, or something more "styled"?
- **Impact on Testing:** Verification of "correctness" is subjective without a mockup.

---

### Missing Information / Gaps

**Gap 1:** Multiple Payment Methods
- **Type:** Business Rule.
- **Why It's Critical:** If a user has 5 methods, including all in the email might clutter it.
- **Suggested Addition:** Only include methods marked as `is_default` or a maximum of 3.

**Gap 2:** No Payment Methods Case
- **Type:** Acceptance Criteria / UX.
- **Why It's Critical:** What happens if the user hasn't configured any?
- **Suggested Addition:** Add a warning during the "Send" flow if no payment methods are found.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Special characters in payment values.
- **Scenario:** Bank details containing symbols like `#`, `-`, or long links for Mercado Pago.
- **Expected Behavior:** They should render correctly without breaking the email layout.

**Edge Case 2:** Extremely long labels.
- **Scenario:** A user names a method "Transferencia Banco Internacional del Sureste con Sucursal en CDMX".
- **Expected Behavior:** Text should wrap gracefully.

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Recommendations to Improve Testability:**
- Define the exact mapping between `payment_methods` table and the email template placeholders.
- Define a "No methods configured" behavior.

---

## ✅ Paso 3: Refined Acceptance Criteria (Aligned with Story)

### Scenario 1: Payment info in email body
**Type:** Positive | **Priority:** Critical
- **Given:** I have configured payment methods in my profile.
- **When:** The client receives the invoice email.
- **Then:** Payment methods are clearly visible in the email body section "Información de Pago".

### Scenario 2: Bank transfer details
**Type:** Positive | **Priority:** High
- **Given:** I have a bank transfer method configured (Label: "BBVA", Value: "Cuenta: 123456, CLABE: 0123456789").
- **When:** The client views the email.
- **Then:** They see the bank name (BBVA), account number (123456), and CLABE (0123456789) correctly formatted.

### Scenario 3: PayPal visible
**Type:** Positive | **Priority:** High
- **Given:** I have a PayPal method configured (Label: "PayPal", Value: "carlos.m@example.com").
- **When:** The client views the email.
- **Then:** They see my PayPal email address (carlos.m@example.com).

### Scenario 4: Easy to copy
**Type:** Positive | **Priority:** High
- **Given:** The client views payment details in the email.
- **When:** They want to copy account numbers or links.
- **Then:** The format (monospaced or plain text) makes it easy to select and copy without extra UI elements or icons interfering.

---

## 🧪 Paso 4: Test Design

### Test Outlines

#### **Validar inclusión de datos de transferencia bancaria (SC1 + SC2)**
**Related Scenario:** Scenario 1 & 2
**Type:** Positive | **Priority:** Critical

**Test Steps:**
1. Configure a payment method: `type: bank_transfer`, `label: "Santander"`, `value: "Cuenta: 98765, CLABE: 0123456789"`.
2. Send an invoice email.
3. Verify the email body contains: "Santander: Cuenta: 98765, CLABE: 0123456789".

#### **Validar inclusión de datos de PayPal (SC1 + SC3)**
**Related Scenario:** Scenario 1 & 3
**Type:** Positive | **Priority:** High

**Test Steps:**
1. Configure a payment method: `type: paypal`, `label: "PayPal"`, `value: "pago@freelance.com"`.
2. Send an invoice email.
3. Verify the email body contains: "PayPal: pago@freelance.com".

#### **Validar formato fácil de copiar (SC4)**
**Related Scenario:** Scenario 4
**Type:** Positive | **Priority:** High

**Test Steps:**
1. Open the received email with payment details.
2. Manually select and copy the CLABE/Account value.
3. Paste it into a text editor.
4. Verify there are no hidden characters, icons, or strange line breaks in the pasted text.

#### **Validar advertencia cuando no hay métodos de pago configurados (Edge Case)**
**Related Scenario:** Extra (Missing Information Gap)
**Type:** Negative/UX | **Priority:** Medium

**Test Steps:**
1. User with 0 payment methods clicks "Enviar por email".
2. Verify a warning appears: "No has configurado métodos de pago...".

---

## 📊 Edge Cases Summary

| Edge Case | Covered in Original Story? | Added to Refined AC? | Priority |
|-----------|----------------------------|----------------------|----------|
| Multiple methods | ❌ No | ✅ Yes (Scenario 1) | High |
| No methods configured | ❌ No | ✅ Yes (Scenario 3) | Medium |
| Extremely long labels | ❌ No | ❌ (Test case only) | Low |

---

## 🎯 Next Steps (Team Action Required)

1. **PO:** Confirm the source of truth for payment methods (Business Profile vs Payment Methods table).
2. **PO:** Approve the "No methods configured" warning.
3. **Dev:** Confirm that the email template uses a monospaced font for payment values to aid copying.
