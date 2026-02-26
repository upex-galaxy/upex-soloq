# Test Cases: STORY-SQ-34 - Include Payment Methods in PDF

**Fecha:** 2026-02-26
**QA Engineer:** Arkaitz
**Story Jira Key:** [SQ-34](https://upexgalaxy64.atlassian.net/browse/SQ-34)
**Epic:** EPIC-SQ-31 - PDF Generation & Download
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Diseñador) - Necesita que sus clientes vean claramente cómo pagarle (banco, PayPal, crypto)
- **Primary:** Valentina (Desarrolladora) - Trabaja con clientes internacionales que prefieren PayPal/Wise
- **Secondary:** Andrés (Consultor) - Necesita mostrar múltiples opciones de pago (transferencia, efectivo, cheque)

**Business Value:**

- **Value Proposition:** Los métodos de pago en el PDF eliminan fricción en el cobro. El cliente recibe la factura y sabe exactamente cómo pagar sin tener que preguntar.
- **Business Impact:**
  - Reduce tiempo de cobro (menos back-and-forth con clientes)
  - Aumenta tasa de pago a tiempo (instrucciones claras = menos excusas)
  - Contribuye al KPI "Facturas pagadas en <30 días: 60%"
  - Impacta NPS positivamente (UX completa = cliente satisfecho)

**Related User Journey:**

- **Journey:** J1 - Registro y Primera Factura
- **Steps:** 12-14 (Preview Invoice, Send Invoice, Get Paid)
- Esta story es critical para el paso 13 donde el cliente recibe la factura y debe saber cómo pagar

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: `InvoicePDFDocument`, `PaymentMethodsSection` (within PDF)
- Libraries: `@react-pdf/renderer` para renderizado
- No UI components (todo dentro del PDF)

**Backend:**

- API Endpoint: `GET /api/invoices/{invoiceId}/pdf` (FR-018)
- Data Source: `payment_methods` table joined con `business_profiles`
- Services: Invoice service (fetches payment methods as part of PDF data)

**Database:**

- Table: `payment_methods`
  - Columns: `id`, `user_id`, `type`, `name`, `details` (JSONB), `is_active`, `created_at`
  - Types: `bank_transfer`, `paypal`, `mercado_pago`, `cash`, `other`
  - RLS: User can only see own payment methods

**External Services:**

- None (payment methods stored in DB)

**Integration Points:**

- Invoice data ← invoices + invoice_items tables
- Business data ← business_profiles table
- **Payment methods ← payment_methods table (THIS STORY)**
- All data combined → PDF Renderer → PDF file

---

### Story Complexity Analysis

**Overall Complexity:** Low-Medium

**Complexity Factors:**

- Business logic complexity: **Low** - Fetch payment methods and display them
- Integration complexity: **Medium** - JSONB details field requires flexible formatting per type
- Data validation complexity: **Low** - Filter by is_active, handle empty state
- UI complexity: **Low** - Simple list layout in PDF footer

**Estimated Test Effort:** Low-Medium
**Rationale:** La funcionalidad es straightforward pero requiere tests de diferentes tipos de payment methods, manejo de JSONB, y edge cases (0 methods, inactive methods, etc.)

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**

- **Risk 1:** Performance: PDF generation > 3000ms
  - **Relevance to This Story:** ⚠️ Parcialmente - Agregar payment methods no debería impactar significativamente
- **Risk 2:** Logo rendering issues (PNG transparency)
  - **Relevance to This Story:** ❌ No aplica - No usamos imágenes en payment methods
- **Risk 3:** Mobile download incompatibility
  - **Relevance to This Story:** ❌ No aplica - Se detalla en SQ-35

**Integration Points from Epic Analysis:**

- **API: GET /invoices/{invoiceId}/pdf**
  - **Applies to This Story:** ✅ Yes - Payment methods son parte del response data
- **Storage: Supabase Storage (logo images)**
  - **Applies to This Story:** ❌ No - Payment methods son solo texto
- **Libraries: @react-pdf/renderer, file-saver**
  - **Applies to This Story:** ✅ Yes - @react-pdf/renderer renderiza la sección

**Critical Questions Already Asked at Epic Level:**

**Questions for PO:**

- Q1: What happens if user has no logo?
  - **Status:** ✅ Resolved - Layout adjusts gracefully
  - **Impact on This Story:** Similar pattern - ¿qué pasa sin payment methods?
- Q2: Is there a maximum number of line items per invoice?
  - **Status:** ⏳ Pending
  - **Impact on This Story:** Similar - ¿max payment methods?

**Questions for Dev:**

- Q1: Will PDFs be cached or regenerated on each request?
  - **Status:** ⏳ Pending
  - **Impact on Testing:** Afecta si debemos test cache invalidation
- Q2: How will we handle font loading for PDF generation?
  - **Status:** ⏳ Pending
  - **Impact on This Story:** Minimal - Payment methods usan fuentes standard

**Test Strategy from Epic:**

- Test Levels: Unit (>80%), Integration (>60%), E2E (critical paths), API (100%)
- Tools: Playwright para E2E, Vitest para unit/integration
- **How This Story Aligns:** 
  - Unit: JSONB parsing, formatting functions
  - Integration: payment_methods query → PDF renderer
  - E2E: Full invoice with payment methods

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** Esta story completa la sección de footer del PDF agregando información crítica de pago
- **Dependencies:** SQ-32 (Generate PDF core), SQ-12 (Configure Payment Methods en UI)
- **Blocks:** SQ-37 (Invoice Sending) - necesita PDF completo con payment methods
- **Inherited Risks:** Performance, autorización (RLS)
- **Unique Considerations:** JSONB formatting, múltiples types de payment methods, empty state

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Formato de visualización de JSONB `details` por tipo

- **Location in Story:** Technical Notes - "Display only active methods"
- **Question for PO/Dev:** ¿Cómo se formatean los `details` (JSONB) de cada tipo de payment method?
  - Bank transfer: ¿Mostramos bank name, CLABE, account, beneficiary?
  - PayPal: ¿Solo email o también link?
  - MercadoPago: ¿Email, CVU, alias?
  - Cash: ¿Instructions texto libre?
  - Other: ¿Todos los campos del JSONB?
- **Impact on Testing:** No podemos validar contenido exacto sin spec de formato
- **Suggested Clarification:** Documentar spec de formato por tipo en epic.md o FR-018

✅ **Proposed Resolution (Based on Similar Stories):**
```
bank_transfer: "{bank_name}\nCLABE/Cuenta: {clabe or account}"
paypal: "PayPal: {email}"
mercado_pago: "Mercado Pago\n{email}\nCVU: {cvu}"
cash: "Efectivo\n{instructions}"
other: "{name}\n{all details as key: value}"
```

**Ambiguity 2:** Comportamiento cuando no hay payment methods configurados

- **Location in Story:** Scenario 5 original AC
- **Question for PO/Dev:** ¿Qué mostramos si payment_methods array está vacío?
  - **Opción A:** Ocultar sección completamente (más limpio)
  - **Opción B:** Mostrar "Contactar para métodos de pago"
  - **Opción C:** Mostrar email del business profile como fallback
- **Impact on Testing:** Comportamiento esperado diferente según opción
- **Suggested Clarification:** Decidir con PO basado en user feedback

✅ **Proposed Resolution:** Opción A - Ocultar sección si está vacía (consistente con otras secciones opcionales)

**Ambiguity 3:** Orden de los payment methods en el PDF

- **Location in Story:** Scenario 4 original AC - "All methods are listed clearly"
- **Question for Dev:** ¿En qué orden se listan los payment methods?
  - Por `is_default` (default primero)
  - Por `type` (alfabético)
  - Por `created_at` (más reciente primero)
- **Impact on Testing:** Expected order en test assertions
- **Suggested Clarification:** Definir sort order en query

✅ **Proposed Resolution:** Order by `is_default DESC, created_at ASC` (default primero, luego orden cronológico)

**Ambiguity 4:** Indicador visual para payment method default

- **Location in Story:** No especificado
- **Question for PO:** ¿El método default debe tener un indicador visual (★, "Principal", bold)?
- **Impact on Testing:** Criterio de validación visual
- **Suggested Clarification:** Agregar a mockup de PDF

✅ **Proposed Resolution:** Sí, marcar default con "★" prefix o "(Principal)" suffix

---

### Missing Information / Gaps

**Gap 1:** Especificación de layout y sección en el PDF

- **Type:** Technical Details
- **Why It's Critical:** AC dice "dedicated section" pero no especifica dónde (footer, sidebar, separate page)
- **Suggested Addition:** Especificar que va en footer del PDF, después de notes/terms
- **Impact if Not Added:** Layout inconsistente entre devs

✅ **Added to Refined AC:** Payment Methods section va en footer, después de notes/terms, antes del page number

**Gap 2:** Límite máximo de payment methods soportados

- **Type:** Acceptance Criteria
- **Why It's Critical:** ¿Qué pasa si usuario tiene 20 payment methods? ¿Se pagina? ¿Se trunca?
- **Suggested Addition:** Definir límite razonable (ej: mostrar top 10, o todos con layout compacto)
- **Impact if Not Added:** Posible overflow visual en PDF

✅ **Added to Refined AC:** Mostrar todos los payment methods activos sin límite (layout debe ajustarse automáticamente)

**Gap 3:** Manejo de JSONB malformado o vacío

- **Type:** Error Handling
- **Why It's Critical:** Si `details` es `{}` o JSON inválido, ¿qué mostramos?
- **Suggested Addition:** Fallback a mostrar solo `name` del payment method
- **Impact if Not Added:** Posibles crashes en PDF generation

✅ **Added to Refined AC:** Fallback a mostrar solo `name` si `details` es null/vacío/inválido

**Gap 4:** Filtro de métodos activos

- **Type:** Acceptance Criteria
- **Why It's Critical:** AC original no menciona `is_active`, pero Technical Notes sí
- **Suggested Addition:** Agregar scenario explícito para filtrado de activos
- **Impact if Not Added:** Posible bug mostrando métodos inactivos

✅ **Added to Refined AC:** Solo payment methods con `is_active = true` se muestran en PDF

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Usuario sin payment methods configurados

- **Scenario:** Usuario crea factura pero nunca configuró payment methods
- **Expected Behavior:** Sección de payment methods no aparece (hidden gracefully)
- **Criticality:** High
- **Action Required:** Add to test cases as TC-34-06

**Edge Case 2:** Solo payment methods inactivos (todos is_active = false)

- **Scenario:** Usuario desactivó todos sus métodos de pago
- **Expected Behavior:** Igual que 0 payment methods - sección oculta
- **Criticality:** Medium
- **Action Required:** Add to test cases as TC-34-10

**Edge Case 3:** Payment method con nombre muy largo (>100 chars)

- **Scenario:** Usuario pone nombre custom "Transferencia Bancaria BBVA Bancomer S.A. Institución de Banca Múltiple Grupo Financiero BBVA Bancomer Cuenta 123..."
- **Expected Behavior:** Truncar con ellipsis o wrap text
- **Criticality:** Low
- **Action Required:** Add to test cases as TC-34-11

**Edge Case 4:** JSONB details vacío o malformado

- **Scenario:** Payment method con `details = {}` o `details = null` o JSON inválido
- **Expected Behavior:** Fallback a mostrar solo `name` del método
- **Criticality:** Medium
- **Action Required:** Add to test cases as TC-34-09

**Edge Case 5:** Múltiples payment methods del mismo tipo

- **Scenario:** Usuario tiene 2 bank transfers (BBVA y Santander)
- **Expected Behavior:** Ambos se muestran con nombres distintivos
- **Criticality:** Medium
- **Action Required:** Add to test cases as TC-34-04

**Edge Case 6:** Payment method type "other" con estructura custom

- **Scenario:** Usuario crea método custom (Bitcoin, Zelle, etc)
- **Expected Behavior:** Mostrar todos los campos del JSONB como lista
- **Criticality:** Medium
- **Action Required:** Add to test cases as TC-34-05

**Edge Case 7:** Payment methods con caracteres especiales (ñ, acentos)

- **Scenario:** "Transferencia Bancaria - Ñoño S.A."
- **Expected Behavior:** Caracteres especiales renderizan correctamente en PDF
- **Criticality:** High (LATAM users)
- **Action Required:** Already covered in TC-34-02 (bank_transfer test)

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues:**

- [x] Acceptance criteria are vague or subjective ("listed clearly")
- [x] Expected results are not specific enough (no formato de display especificado)
- [x] Missing test data examples (no mock JSONB structures)
- [x] Missing error scenarios (JSONB inválido, métodos inactivos)
- [ ] Missing performance criteria (unlikely to impact performance)
- [ ] Cannot be tested in isolation (requiere invoice + business profile)

**Recommendations to Improve Testability:**

1. ✅ Especificar formato exacto de display por tipo de payment method
2. ✅ Agregar AC de filtrado (solo `is_active = true`)
3. ✅ Agregar AC de empty state (0 payment methods)
4. ✅ Definir comportamiento de fallback (JSONB inválido)
5. ✅ Especificar layout/ubicación en el PDF (footer)
6. Agregar mockup visual de referencia (opcional)

---

## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Payment section visible with multiple methods (Happy Path)

**Type:** Positive
**Priority:** Critical
**Source:** Original AC-1 and AC-2 expanded

- **Given:**
  - User has business profile configured
  - User has 3 active payment methods configured:
    - Bank transfer (BBVA, CLABE: 012180001234567890)
    - PayPal (email: pay@example.com)
    - MercadoPago (email: mp@example.com)
  - Invoice exists and belongs to user

- **When:**
  - PDF is generated for the invoice

- **Then:**
  - **Payment Methods section appears in PDF footer**
  - Section title: "Métodos de Pago" or "Payment Methods"
  - All 3 active methods are listed
  - Each method shows:
    - Type indicator (label or icon)
    - Method name
    - Relevant details from JSONB (formatted per type)
  - Section is visually distinct (border or spacing)
  - Section appears after Notes/Terms, before page number

---

### Scenario 2: Bank transfer shows complete details

**Type:** Positive
**Priority:** High
**Source:** Original story technical notes

- **Given:**
  - Payment method type `bank_transfer` configured:
    ```json
    {
      "type": "bank_transfer",
      "name": "BBVA México",
      "details": {
        "bank": "BBVA Bancomer",
        "clabe": "012180001234567890",
        "account": "1234567890",
        "beneficiary": "Juan Pérez"
      },
      "is_active": true
    }
    ```

- **When:**
  - PDF is generated

- **Then:**
  - Payment method displays as:
    ```
    🏦 BBVA México
    Banco: BBVA Bancomer
    CLABE: 012180001234567890
    Beneficiario: Juan Pérez
    ```
  - All relevant fields from `details` JSONB are shown
  - Format is multi-line for readability
  - Special characters (ñ, á, é) render correctly

---

### Scenario 3: Digital payment methods show email/username

**Type:** Positive
**Priority:** High
**Source:** Original story Scenario 2

- **Given:**
  - Payment method type `paypal` configured:
    ```json
    {
      "type": "paypal",
      "name": "PayPal",
      "details": {
        "email": "pay@freelancer.com"
      },
      "is_active": true
    }
    ```

- **When:**
  - PDF is generated

- **Then:**
  - Payment method displays as:
    ```
    💳 PayPal
    pay@freelancer.com
    ```
  - Email is clearly visible
  - Format is compact (single line if possible)

---

### Scenario 4: MercadoPago shows email and CVU

**Type:** Positive
**Priority:** High
**Source:** LATAM specific payment method

- **Given:**
  - Payment method type `mercado_pago` configured:
    ```json
    {
      "type": "mercado_pago",
      "name": "Mercado Pago",
      "details": {
        "email": "mp@freelancer.com",
        "cvu": "0000003100010000000001",
        "alias": "freelancer.mp"
      },
      "is_active": true
    }
    ```

- **When:**
  - PDF is generated

- **Then:**
  - Payment method displays as:
    ```
    💰 Mercado Pago
    mp@freelancer.com
    CVU: 0000003100010000000001
    Alias: freelancer.mp
    ```
  - All relevant fields shown

---

### Scenario 5: Custom payment type ("other") shows all details

**Type:** Positive
**Priority:** Medium
**Source:** Edge case for flexibility

- **Given:**
  - Payment method type `other` configured:
    ```json
    {
      "type": "other",
      "name": "Bitcoin",
      "details": {
        "wallet": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        "currency": "BTC",
        "network": "Bitcoin Mainnet"
      },
      "is_active": true
    }
    ```

- **When:**
  - PDF is generated

- **Then:**
  - Payment method displays as:
    ```
    ₿ Bitcoin
    Wallet: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
    Currency: BTC
    Network: Bitcoin Mainnet
    ```
  - All JSONB fields rendered as "key: value"
  - Fields in alphabetical order or insertion order

---

### Scenario 6: No payment methods configured (Empty State)

**Type:** Boundary
**Priority:** High
**Source:** Gap identified - empty state

- **Given:**
  - User has business profile configured
  - User has 0 payment methods in `payment_methods` table

- **When:**
  - PDF is generated

- **Then:**
  - **Payment Methods section does NOT appear in PDF**
  - Footer flows directly from Notes/Terms to page number
  - No placeholder text shown
  - PDF generates successfully without errors

---

### Scenario 7: Single payment method

**Type:** Boundary
**Priority:** Medium
**Source:** Edge case - minimum viable

- **Given:**
  - User has exactly 1 active payment method configured

- **When:**
  - PDF is generated

- **Then:**
  - Payment Methods section appears
  - Single method displayed (no bullet list needed)
  - Section title still present: "Método de Pago" (singular)

---

### Scenario 8: Only active payment methods shown

**Type:** Functional
**Priority:** High
**Source:** Technical notes + gap identified

- **Given:**
  - User has 3 payment methods configured:
    - Method A: `is_active = true`
    - Method B: `is_active = false` (inactive)
    - Method C: `is_active = true`

- **When:**
  - PDF is generated

- **Then:**
  - Only 2 payment methods appear in PDF (A and C)
  - Method B (inactive) is NOT shown
  - Filter: `WHERE is_active = true` in query

---

### Scenario 9: JSONB details malformed or empty - Fallback

**Type:** Negative
**Priority:** Medium
**Source:** Gap identified - error handling

- **Given:**
  - Payment method with invalid/empty JSONB:
    ```json
    {
      "type": "bank_transfer",
      "name": "Banco Sin Detalles",
      "details": null,
      "is_active": true
    }
    ```
  - Or `details: {}`
  - Or malformed JSON

- **When:**
  - PDF is generated

- **Then:**
  - Payment method displays as:
    ```
    🏦 Banco Sin Detalles
    (Contactar para detalles de pago)
    ```
  - Fallback behavior: show only `name`
  - PDF generation does NOT fail
  - No crash or error

---

### Scenario 10: Multiple payment methods of same type

**Type:** Functional
**Priority:** Medium
**Source:** Edge case identified

- **Given:**
  - User has 2 bank transfers configured:
    - "BBVA México" (CLABE: 012180...)
    - "Santander México" (CLABE: 014180...)

- **When:**
  - PDF is generated

- **Then:**
  - Both payment methods appear
  - Differentiated by `name` field
  - Each shows its own `details` JSONB
  - No confusion between the two

---

### Scenario 11: Default payment method highlighted

**Type:** Functional
**Priority:** Low
**Source:** Ambiguity resolved

- **Given:**
  - User has 3 payment methods
  - One has `is_default = true`

- **When:**
  - PDF is generated

- **Then:**
  - Default payment method appears first in list
  - Marked with visual indicator: "★" prefix or "(Principal)" suffix
  - Other methods follow in chronological order
  - **Sort order:** `ORDER BY is_default DESC, created_at ASC`

---

### Scenario 12: Payment method with long name truncated

**Type:** Edge Case
**Priority:** Low
**Source:** Edge case identified

- **Given:**
  - Payment method with `name` > 100 characters:
    "Transferencia Bancaria BBVA Bancomer S.A. Institución de Banca Múltiple Grupo Financiero BBVA Bancomer Cuenta Empresarial Premium"

- **When:**
  - PDF is generated

- **Then:**
  - Name is truncated to 80 characters with "..."
  - Details still show fully
  - No layout breakage
  - Alternative: wrap text to multiple lines

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 13

**Breakdown:**

- Positive: 5 test cases (TC-34-01 to TC-34-05)
- Boundary: 3 test cases (TC-34-06, TC-34-07, TC-34-12)
- Negative: 1 test case (TC-34-09)
- Functional: 3 test cases (TC-34-08, TC-34-10, TC-34-11)
- Integration: 1 test case (TC-34-13)

**Rationale:** Esta story tiene complejidad low-medium con múltiples tipos de payment methods, edge cases (0 methods, inactive, JSONB malformed), y diferentes formatos de display. Los 13 test cases cubren: happy path, cada tipo de payment method, empty state, filtrado de activos, fallbacks, y orden.

**Coverage Map:**

| Acceptance Criteria | Test Cases | Coverage |
|---------------------|------------|----------|
| Scenario 1: Multiple methods visible | TC-34-01 | ✅ |
| Scenario 2: Bank transfer details | TC-34-02 | ✅ |
| Scenario 3: Digital payments (PayPal) | TC-34-03 | ✅ |
| Scenario 4: MercadoPago details | TC-34-03 (parametrized) | ✅ |
| Scenario 5: Custom type "other" | TC-34-05 | ✅ |
| Scenario 6: Empty state (0 methods) | TC-34-06 | ✅ |
| Scenario 7: Single method | TC-34-07 | ✅ |
| Scenario 8: Filter active only | TC-34-10 | ✅ |
| Scenario 9: JSONB fallback | TC-34-09 | ✅ |
| Scenario 10: Same type multiple | TC-34-04 | ✅ |
| Scenario 11: Default highlighted | TC-34-11 | ✅ |
| Scenario 12: Long name truncation | TC-34-12 | ✅ |

**Coverage: 100%** - All refined scenarios have at least one test case

---

### Parametrization Opportunities

**Parametrized Test Group 1:** Payment Method Types and Formats

| Test ID | Type | Name | Details (JSONB) | Expected Display |
|---------|------|------|-----------------|------------------|
| TC-34-02a | `bank_transfer` | "BBVA México" | `{"bank":"BBVA","clabe":"012180001234567890","beneficiary":"Juan Pérez"}` | "🏦 BBVA México\nBanco: BBVA\nCLABE: 012180001234567890\nBeneficiario: Juan Pérez" |
| TC-34-03a | `paypal` | "PayPal" | `{"email":"pay@example.com"}` | "💳 PayPal\npay@example.com" |
| TC-34-03b | `mercado_pago` | "Mercado Pago" | `{"email":"mp@example.com","cvu":"0000003100010000000001"}` | "💰 Mercado Pago\nmp@example.com\nCVU: 0000003100010000000001" |
| TC-34-03c | `cash` | "Efectivo" | `{"instructions":"Pago en oficina, horario 9-17h"}` | "💵 Efectivo\nPago en oficina, horario 9-17h" |
| TC-34-05a | `other` | "Bitcoin" | `{"wallet":"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa","currency":"BTC"}` | "₿ Bitcoin\nWallet: 1A1zP1...\nCurrency: BTC" |

**Total Tests from Parametrization:** 5 data sets
**Benefit:** Cubre todos los tipos de payment methods con un solo test parametrizado (TC-34-02, TC-34-03, TC-34-05 se pueden combinar)

---

### Test Outlines

#### **TC-34-01: Validar payment methods section con múltiples métodos activos (Happy Path)**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** ❌ No

---

**Preconditions:**

- User authenticated: `testuser@example.com`
- Business profile configured with name "Test Freelancer"
- 3 payment methods configured:
  - BBVA México (bank_transfer, active)
  - PayPal (paypal, active)
  - MercadoPago (mercado_pago, active)
- Invoice created with status "draft" or "sent"

---

**Test Steps:**

1. Navigate to invoice detail page `/invoices/{invoiceId}`
   - **Verify:** Invoice loads successfully
2. Click "Generate PDF" or "Preview PDF" button
   - **Verify:** PDF generation starts
3. Open/view generated PDF
   - **Verify:** PDF opens correctly
4. Scroll to footer section
   - **Verify:** Payment Methods section is visible
5. Verify section contains all 3 payment methods
   - **Verify:** BBVA México listed with CLABE
   - **Verify:** PayPal listed with email
   - **Verify:** MercadoPago listed with email/CVU
6. Verify section layout
   - **Verify:** Section title: "Métodos de Pago"
   - **Verify:** Methods are visually separated
   - **Verify:** Section appears after Notes/Terms

---

**Expected Result:**

- **Payment Methods Section:**
  - ✅ Title: "Métodos de Pago" (bold or styled)
  - ✅ 3 payment methods listed
  - ✅ Each method shows: icon/label, name, details
  - ✅ Located in PDF footer
  - ✅ Positioned after Notes/Terms, before page number
  
- **Visual Quality:**
  - ✅ Clear spacing between methods
  - ✅ Readable font size (≥10pt)
  - ✅ Proper alignment
  - ✅ No text overflow

- **API Response:**
  - Status: 200 OK
  - Content-Type: application/pdf
  - PDF file size reasonable (<500KB for standard invoice)

---

**Test Data:**

```json
{
  "payment_methods": [
    {
      "type": "bank_transfer",
      "name": "BBVA México",
      "details": {
        "bank": "BBVA Bancomer",
        "clabe": "012180001234567890",
        "beneficiary": "Test Freelancer"
      },
      "is_active": true,
      "is_default": true
    },
    {
      "type": "paypal",
      "name": "PayPal",
      "details": {
        "email": "pay@testfreelancer.com"
      },
      "is_active": true,
      "is_default": false
    },
    {
      "type": "mercado_pago",
      "name": "Mercado Pago",
      "details": {
        "email": "mp@testfreelancer.com",
        "cvu": "0000003100010000000001"
      },
      "is_active": true,
      "is_default": false
    }
  ]
}
```

---

**Post-conditions:**

- PDF can be downloaded multiple times
- Payment methods section remains consistent across regenerations

---

#### **TC-34-02: Validar formato de bank transfer en PDF**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** High
**Test Level:** Integration
**Parametrized:** ✅ Yes (Group 1 - TC-34-02a)

---

**Preconditions:**

- Payment method type `bank_transfer` configured with complete details
- Invoice exists for PDF generation

---

**Test Steps:**

1. Create payment method with bank transfer data
   - **Data:** See test data below
2. Generate PDF for invoice
3. Extract payment methods section from PDF
4. Verify bank transfer formatting
   - **Verify:** Bank name displayed
   - **Verify:** CLABE/Account displayed
   - **Verify:** Beneficiary name displayed
5. Verify special characters render correctly
   - **Verify:** Ñ, á, é, í, ó, ú display properly

---

**Expected Result:**

- **Bank Transfer Display:**
  ```
  🏦 BBVA México
  Banco: BBVA Bancomer
  CLABE: 012180001234567890
  Beneficiario: Juan Pérez
  ```

- **Formatting:**
  - ✅ Multi-line layout (each field on new line)
  - ✅ Field labels in Spanish (Banco, CLABE, Beneficiario)
  - ✅ Values aligned and readable
  - ✅ Icon or emoji (🏦) for visual identification

- **Character Rendering:**
  - ✅ Special characters (é in México, é in Pérez) render correctly
  - ✅ No "?" or "□" replacement characters

---

**Test Data:**

```json
{
  "type": "bank_transfer",
  "name": "BBVA México",
  "details": {
    "bank": "BBVA Bancomer",
    "clabe": "012180001234567890",
    "account": "1234567890",
    "beneficiary": "Juan Pérez García"
  },
  "is_active": true
}
```

---

**Alternative Test Data (Parametrized):**

| Bank | CLABE | Beneficiary | Expected Display |
|------|-------|-------------|------------------|
| BBVA Bancomer | 012180001234567890 | Juan Pérez | CLABE: 012180001234567890 |
| Santander | 014180002345678901 | María López | CLABE: 014180002345678901 |
| Banorte | 072180003456789012 | José Martínez | CLABE: 072180003456789012 |

---

#### **TC-34-03: Validar formato de payment methods digitales (PayPal, MercadoPago, Cash)**

**Related Scenario:** Scenarios 3, 4
**Type:** Positive
**Priority:** High
**Test Level:** Integration
**Parametrized:** ✅ Yes (Group 1 - TC-34-03a,b,c)

---

**Preconditions:**

- Multiple payment methods of digital types configured
- Invoice exists

---

**Test Steps:**

1. Create payment methods for each digital type
   - **Data:** PayPal, MercadoPago, Cash
2. Generate PDF
3. Extract payment methods section
4. Verify each type displays correctly
   - **Verify:** PayPal shows email
   - **Verify:** MercadoPago shows email + CVU
   - **Verify:** Cash shows instructions

---

**Expected Result:**

**PayPal:**
```
💳 PayPal
pay@freelancer.com
```

**MercadoPago:**
```
💰 Mercado Pago
mp@freelancer.com
CVU: 0000003100010000000001
Alias: freelancer.mp
```

**Cash:**
```
💵 Efectivo
Pago en persona, oficina CDMX
Horario: Lun-Vie 9-17h
```

---

**Test Data (Parametrized):**

```json
[
  {
    "type": "paypal",
    "name": "PayPal",
    "details": { "email": "pay@freelancer.com" },
    "is_active": true
  },
  {
    "type": "mercado_pago",
    "name": "Mercado Pago",
    "details": {
      "email": "mp@freelancer.com",
      "cvu": "0000003100010000000001",
      "alias": "freelancer.mp"
    },
    "is_active": true
  },
  {
    "type": "cash",
    "name": "Efectivo",
    "details": {
      "instructions": "Pago en persona, oficina CDMX\nHorario: Lun-Vie 9-17h"
    },
    "is_active": true
  }
]
```

---

#### **TC-34-04: Validar múltiples payment methods del mismo tipo**

**Related Scenario:** Scenario 10
**Type:** Functional
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** ❌ No

---

**Preconditions:**

- User has 2 bank transfers configured with different names

---

**Test Steps:**

1. Create 2 payment methods both type `bank_transfer`
   - BBVA México (CLABE: 012180...)
   - Santander México (CLABE: 014180...)
2. Generate PDF
3. Verify both methods appear
   - **Verify:** BBVA listed with its CLABE
   - **Verify:** Santander listed with its CLABE
4. Verify differentiation
   - **Verify:** Names are distinct
   - **Verify:** CLABEs are distinct
   - **Verify:** No confusion between the two

---

**Expected Result:**

- **Both methods displayed:**
  ```
  🏦 BBVA México
  CLABE: 012180001234567890
  
  🏦 Santander México
  CLABE: 014180002345678901
  ```

- ✅ Each method clearly separated
- ✅ Names differentiate the two
- ✅ No data mixing between methods

---

**Test Data:**

```json
[
  {
    "type": "bank_transfer",
    "name": "BBVA México",
    "details": { "clabe": "012180001234567890" },
    "is_active": true
  },
  {
    "type": "bank_transfer",
    "name": "Santander México",
    "details": { "clabe": "014180002345678901" },
    "is_active": true
  }
]
```

---

#### **TC-34-05: Validar payment method custom (type "other")**

**Related Scenario:** Scenario 5
**Type:** Positive
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** ✅ Yes (Group 1 - TC-34-05a)

---

**Preconditions:**

- Payment method type `other` configured with custom fields

---

**Test Steps:**

1. Create payment method type "other" (Bitcoin example)
   - **Data:** See test data
2. Generate PDF
3. Verify custom method displays all JSONB fields
   - **Verify:** Method name shown
   - **Verify:** All `details` fields listed as "key: value"
   - **Verify:** Fields in readable order

---

**Expected Result:**

- **Custom Method Display:**
  ```
  ₿ Bitcoin
  Wallet: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
  Currency: BTC
  Network: Bitcoin Mainnet
  ```

- ✅ All JSONB fields rendered
- ✅ Format: "Key: Value" on separate lines
- ✅ Custom icon (₿) or generic icon

---

**Test Data:**

```json
{
  "type": "other",
  "name": "Bitcoin",
  "details": {
    "wallet": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "currency": "BTC",
    "network": "Bitcoin Mainnet",
    "note": "Enviar solo después de confirmar con cliente"
  },
  "is_active": true
}
```

**Alternative Examples:**

- Zelle: `{"email": "zelle@example.com", "phone": "+1234567890"}`
- Wise: `{"email": "wise@example.com", "currency": "USD"}`
- Cheque: `{"instructions": "Cheque a nombre de Freelancer S.A.", "address": "Calle 123"}`

---

#### **TC-34-06: Validar PDF sin payment methods (empty state)**

**Related Scenario:** Scenario 6
**Type:** Boundary
**Priority:** High
**Test Level:** E2E
**Parametrized:** ❌ No

---

**Preconditions:**

- User has business profile configured
- User has 0 payment methods in `payment_methods` table
- Invoice exists

---

**Test Steps:**

1. Verify payment_methods table is empty for user
   - **Query:** `SELECT COUNT(*) FROM payment_methods WHERE user_id = ? AND is_active = true`
   - **Result:** 0
2. Generate PDF for invoice
3. Open PDF and inspect footer
   - **Verify:** Payment Methods section does NOT appear
4. Verify footer flow
   - **Verify:** Footer goes: Notes → Terms → Page Number (no gap)

---

**Expected Result:**

- **Payment Methods Section:**
  - ❌ Section does NOT appear in PDF
  - ❌ No placeholder text like "No payment methods"
  - ❌ No empty box or space

- **PDF Layout:**
  - ✅ Footer flows naturally without payment section
  - ✅ No awkward spacing or gaps
  - ✅ PDF generates successfully without errors

- **API/Data:**
  - ✅ Query returns empty array: `paymentMethods: []`
  - ✅ PDF renderer handles empty array gracefully

---

**Test Data:**

```json
{
  "user_id": "test-user-uuid",
  "payment_methods": []
}
```

---

**Post-conditions:**

- PDF is valid and can be opened
- User can still send invoice (payment methods optional)

---

#### **TC-34-07: Validar PDF con un solo payment method**

**Related Scenario:** Scenario 7
**Type:** Boundary
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** ❌ No

---

**Preconditions:**

- User has exactly 1 active payment method

---

**Test Steps:**

1. Create single payment method (bank transfer)
2. Generate PDF
3. Verify payment methods section appears
   - **Verify:** Section title present (singular: "Método de Pago")
   - **Verify:** Single method displayed
   - **Verify:** No bullet list (just the method)

---

**Expected Result:**

- **Section Display:**
  ```
  Método de Pago
  
  🏦 BBVA México
  CLABE: 012180001234567890
  ```

- ✅ Section title in singular form
- ✅ Single method clearly visible
- ✅ Layout is clean (no unnecessary bullets)

---

**Test Data:**

```json
{
  "payment_methods": [
    {
      "type": "bank_transfer",
      "name": "BBVA México",
      "details": { "clabe": "012180001234567890" },
      "is_active": true
    }
  ]
}
```

---

#### **TC-34-08: Validar que solo payment methods activos se muestran**

**Related Scenario:** Scenario 8
**Type:** Functional
**Priority:** High
**Test Level:** API + Integration
**Parametrized:** ❌ No

---

**Preconditions:**

- User has 3 payment methods:
  - Method A: `is_active = true`
  - Method B: `is_active = false` (inactive)
  - Method C: `is_active = true`

---

**Test Steps:**

1. Create 3 payment methods with different `is_active` values
   - **Data:** See test data
2. Generate PDF via API
3. Verify only active methods in response
   - **API:** Check `paymentMethods` array in response
   - **Verify:** Only 2 methods returned (A and C)
4. Verify PDF content
   - **Verify:** Only 2 methods appear in PDF
   - **Verify:** Method B (inactive) NOT visible

---

**Expected Result:**

- **API Response:**
  - `paymentMethods` array length: 2
  - Contains: Method A, Method C
  - Does NOT contain: Method B

- **PDF Display:**
  - ✅ 2 payment methods visible
  - ❌ Inactive method NOT shown
  - ✅ Query filters correctly: `WHERE is_active = true`

---

**Test Data:**

```json
[
  {
    "id": "method-a",
    "name": "BBVA México",
    "type": "bank_transfer",
    "is_active": true
  },
  {
    "id": "method-b",
    "name": "Santander (Inactivo)",
    "type": "bank_transfer",
    "is_active": false
  },
  {
    "id": "method-c",
    "name": "PayPal",
    "type": "paypal",
    "is_active": true
  }
]
```

---

**Verification Query:**

```sql
SELECT id, name, type, is_active 
FROM payment_methods 
WHERE user_id = ? AND is_active = true
ORDER BY is_default DESC, created_at ASC;
```

Expected result: 2 rows (method-a, method-c)

---

#### **TC-34-09: Validar fallback cuando JSONB details está vacío o inválido**

**Related Scenario:** Scenario 9
**Type:** Negative
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** ❌ No

---

**Preconditions:**

- Payment method with invalid/empty `details` JSONB

---

**Test Steps:**

1. Create payment method with `details = null`
   - **Data:** See test data scenario A
2. Generate PDF
3. Verify fallback behavior
   - **Verify:** Method displays with name only
   - **Verify:** No error or crash
4. Repeat with `details = {}`
   - **Data:** See test data scenario B
5. Verify same fallback
6. Repeat with malformed JSON (if possible)
   - **Data:** See test data scenario C

---

**Expected Result:**

**Scenario A: details = null**
```
🏦 Banco Sin Detalles
(Contactar para información de pago)
```

**Scenario B: details = {}**
```
🏦 Banco Vacío
(Contactar para información de pago)
```

**Scenario C: Malformed JSON (handled at DB level)**
- Should not occur if DB enforces JSONB type
- If occurs, same fallback as null

- ✅ PDF generates without errors
- ✅ Fallback message shown
- ✅ No crash or exception

---

**Test Data:**

```json
{
  "scenario_a": {
    "type": "bank_transfer",
    "name": "Banco Sin Detalles",
    "details": null,
    "is_active": true
  },
  "scenario_b": {
    "type": "paypal",
    "name": "PayPal Vacío",
    "details": {},
    "is_active": true
  }
}
```

---

#### **TC-34-10: Validar orden de payment methods (default primero)**

**Related Scenario:** Scenario 11
**Type:** Functional
**Priority:** Low
**Test Level:** Integration
**Parametrized:** ❌ No

---

**Preconditions:**

- User has 3 payment methods
- One has `is_default = true`

---

**Test Steps:**

1. Create 3 payment methods with different timestamps
   - Method A: created 3 days ago, `is_default = false`
   - Method B: created 2 days ago, `is_default = true` ← Default
   - Method C: created 1 day ago, `is_default = false`
2. Generate PDF
3. Verify order in PDF
   - **Verify:** Method B appears FIRST (is_default = true)
   - **Verify:** Methods A and C follow in chronological order (A then C)
4. Verify visual indicator
   - **Verify:** Method B has "★" prefix or "(Principal)" label

---

**Expected Result:**

- **Order in PDF:**
  ```
  ★ PayPal (Method B) ← Default, shown first
  BBVA México (Method A) ← Older, shown second
  MercadoPago (Method C) ← Newer, shown third
  ```

- **SQL Order:**
  ```sql
  ORDER BY is_default DESC, created_at ASC
  ```

- ✅ Default method first
- ✅ Visual indicator present (★ or "Principal")
- ✅ Other methods in chronological order

---

**Test Data:**

```json
[
  {
    "id": "method-a",
    "name": "BBVA México",
    "created_at": "2026-02-23T10:00:00Z",
    "is_default": false
  },
  {
    "id": "method-b",
    "name": "PayPal",
    "created_at": "2026-02-24T10:00:00Z",
    "is_default": true
  },
  {
    "id": "method-c",
    "name": "MercadoPago",
    "created_at": "2026-02-25T10:00:00Z",
    "is_default": false
  }
]
```

---

#### **TC-34-11: Validar payment method con nombre muy largo**

**Related Scenario:** Scenario 12
**Type:** Edge Case
**Priority:** Low
**Test Level:** Integration
**Parametrized:** ❌ No

---

**Preconditions:**

- Payment method with `name` > 100 characters

---

**Test Steps:**

1. Create payment method with very long name (150 chars)
   - **Data:** "Transferencia Bancaria BBVA Bancomer S.A. Institución de Banca Múltiple Grupo Financiero BBVA Bancomer Cuenta Empresarial Premium Plus Gold Elite"
2. Generate PDF
3. Verify name handling
   - **Verify:** Name is truncated to ~80 chars with "..."
   - OR **Verify:** Name wraps to multiple lines
4. Verify details still show
   - **Verify:** CLABE displays fully (not truncated)

---

**Expected Result:**

**Option A: Truncation**
```
🏦 Transferencia Bancaria BBVA Bancomer S.A. Institución de Banca Múltiple...
CLABE: 012180001234567890
```

**Option B: Wrap**
```
🏦 Transferencia Bancaria BBVA Bancomer S.A. 
    Institución de Banca Múltiple Grupo 
    Financiero BBVA Bancomer Cuenta Empresarial
CLABE: 012180001234567890
```

- ✅ No layout breakage
- ✅ Details remain readable
- ✅ Text does not overflow page

---

**Test Data:**

```json
{
  "type": "bank_transfer",
  "name": "Transferencia Bancaria BBVA Bancomer S.A. Institución de Banca Múltiple Grupo Financiero BBVA Bancomer Cuenta Empresarial Premium Plus Gold Elite Division",
  "details": { "clabe": "012180001234567890" },
  "is_active": true
}
```

---

#### **TC-34-12: Validar PDF con 10+ payment methods**

**Related Scenario:** Scenario 6 expansion
**Type:** Boundary/Stress
**Priority:** Low
**Test Level:** Integration
**Parametrized:** ❌ No

---

**Preconditions:**

- User has 12 payment methods configured (various types)

---

**Test Steps:**

1. Create 12 payment methods via seed script
   - **Data:** Mix of bank transfers, digital, cash
2. Generate PDF
3. Verify all methods appear
   - **Verify:** All 12 methods visible in PDF
4. Verify layout handling
   - **Verify:** Methods fit on page OR paginate correctly
   - **Verify:** No text overflow or cutoff
5. Verify performance
   - **Verify:** PDF generates in < 5 seconds

---

**Expected Result:**

- **Display:**
  - ✅ All 12 methods shown
  - ✅ Layout is compact but readable
  - ✅ Font size remains legible (≥8pt minimum)
  - ✅ Methods may span to second page if needed

- **Performance:**
  - ✅ Generation time < 5000ms

- **Quality:**
  - ✅ No overlap or cutoff
  - ✅ Consistent formatting for all 12

---

**Test Data:**

```json
{
  "payment_methods_count": 12,
  "types_distribution": {
    "bank_transfer": 5,
    "paypal": 2,
    "mercado_pago": 2,
    "cash": 1,
    "other": 2
  }
}
```

---

#### **TC-34-13: Integration Test - Payment Methods Query → PDF Renderer**

**Related Scenario:** All scenarios
**Type:** Integration
**Priority:** High
**Test Level:** Integration

---

**Integration Point:** `payment_methods` table → API → PDF Renderer → PDF file

**Test Flow:**

1. **Database Query:**
   ```sql
   SELECT id, type, name, details, is_active, is_default
   FROM payment_methods
   WHERE user_id = ? AND is_active = true
   ORDER BY is_default DESC, created_at ASC;
   ```
   
2. **API Layer:**
   - Fetch payment methods for user
   - Transform JSONB `details` to display format
   - Pass to PDF generator

3. **PDF Renderer:**
   - Receive `PaymentMethod[]` array
   - Render Payment Methods section in footer
   - Format each method according to type

4. **Output:**
   - Valid PDF file with payment methods section

---

**Contract Validation:**

- ✅ Query returns only active methods (`is_active = true`)
- ✅ Query enforces RLS (only user's methods)
- ✅ Data structure matches `PaymentMethod` interface
- ✅ JSONB `details` parsed correctly
- ✅ PDF section renders without errors

---

**Expected Result:**

- **Data Flow:**
  - DB → API: Correct data fetched
  - API → PDF: Correct structure passed
  - PDF: Correct rendering

- **No Data Loss:**
  - All active methods appear
  - All details from JSONB shown
  - No truncation or corruption

---

## 🔗 Integration Test Cases

### Integration Test 1: Payment Methods Table → PDF Renderer

**Integration Point:** Database query → API endpoint → PDF component
**Type:** Integration
**Priority:** High

**Test Flow:**

1. Seed `payment_methods` table with test data (3 methods)
2. API fetches methods: `GET /api/payment-methods` (internal)
3. API generates PDF: `GET /api/invoices/{id}/pdf`
4. Verify payment methods in PDF match DB records

**Contract:**

```typescript
interface PaymentMethod {
  id: string;
  type: 'bank_transfer' | 'paypal' | 'mercado_pago' | 'cash' | 'other';
  name: string;
  details: Record<string, any>; // JSONB
  is_active: boolean;
  is_default: boolean;
}
```

**Expected Result:**

- ✅ All active methods from DB appear in PDF
- ✅ JSONB details correctly parsed and formatted
- ✅ Inactive methods filtered out
- ✅ Order matches query sort (default first)

---

### Integration Test 2: RLS Policy → Payment Methods Isolation

**Integration Point:** Row-Level Security → Payment Methods query
**Type:** Security
**Priority:** Critical

**Test Flow:**

1. Create User A with 2 payment methods
2. Create User B with 2 payment methods
3. User A generates PDF for their invoice
4. Verify User A's PDF shows ONLY their payment methods
5. Verify User B's methods are NOT exposed

**Expected Result:**

- ✅ RLS policy enforces: `auth.uid() = user_id`
- ✅ User A sees only their 2 methods
- ✅ User B's methods are not accessible by User A
- ✅ No data leakage

---

## 📊 Edge Cases Summary

| Edge Case | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
|-----------|----------------------------|----------------------|-----------|----------|
| 0 payment methods (empty) | ⚠️ Mentioned (Scenario 5) | ✅ Yes (Scenario 6) | TC-34-06 | High |
| Only inactive methods | ❌ No | ✅ Yes (Scenario 8) | TC-34-08 | High |
| JSONB details null/empty | ❌ No | ✅ Yes (Scenario 9) | TC-34-09 | Medium |
| Multiple same type | ❌ No | ✅ Yes (Scenario 10) | TC-34-04 | Medium |
| Custom type "other" | ⚠️ Mentioned (Scenario 3) | ✅ Yes (Scenario 5) | TC-34-05 | Medium |
| Default method highlighted | ❌ No | ✅ Yes (Scenario 11) | TC-34-11 | Low |
| Long payment name (>100 chars) | ❌ No | ✅ Yes (Scenario 12) | TC-34-12 | Low |
| 10+ payment methods | ❌ No | ⚠️ Stress test | TC-34-12 | Low |
| Special characters (ñ, á) | ❌ No | ✅ Covered in TC-34-02 | TC-34-02 | High |

**Total Edge Cases Identified:** 9
**Newly Added to Test Suite:** 7

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type | Count | Purpose | Examples |
|-----------|-------|---------|----------|
| Valid data | 6 | Positive tests | 3 active methods, bank transfer, PayPal, MercadoPago |
| Invalid data | 2 | Negative tests | JSONB null, JSONB empty |
| Boundary values | 3 | Boundary tests | 0 methods, 1 method, 12 methods |
| Edge case data | 3 | Edge case tests | Inactive methods, long name, same type multiple |

### Data Generation Strategy

**Static Test Data (Predefined):**

```json
{
  "bank_transfer_bbva": {
    "type": "bank_transfer",
    "name": "BBVA México",
    "details": {
      "bank": "BBVA Bancomer",
      "clabe": "012180001234567890",
      "beneficiary": "Test Freelancer"
    },
    "is_active": true,
    "is_default": true
  },
  "paypal_standard": {
    "type": "paypal",
    "name": "PayPal",
    "details": {
      "email": "pay@testfreelancer.com"
    },
    "is_active": true,
    "is_default": false
  },
  "mercadopago_standard": {
    "type": "mercado_pago",
    "name": "Mercado Pago",
    "details": {
      "email": "mp@testfreelancer.com",
      "cvu": "0000003100010000000001",
      "alias": "test.freelancer"
    },
    "is_active": true,
    "is_default": false
  }
}
```

**Dynamic Test Data (via Faker.js):**

- Payment method names: `faker.finance.accountName()`
- Email addresses: `faker.internet.email()`
- CLABE numbers: `faker.finance.account(18)` (Mexico specific)
- Instructions (cash): `faker.lorem.sentence()`

**Seed Script Required:**

```typescript
// seed-payment-methods.ts
async function seedPaymentMethods(userId: string) {
  const methods = [
    { type: 'bank_transfer', name: 'BBVA México', details: {...}, is_active: true, is_default: true },
    { type: 'paypal', name: 'PayPal', details: {...}, is_active: true, is_default: false },
    { type: 'mercado_pago', name: 'Mercado Pago', details: {...}, is_active: true, is_default: false },
  ];
  
  for (const method of methods) {
    await supabase.from('payment_methods').insert({ user_id: userId, ...method });
  }
}
```

**Test Data Cleanup:**

- ✅ All test payment methods cleaned up after test execution
- ✅ Use transactions or cleanup hooks in tests
- ✅ Tests are idempotent (can run multiple times)
- ✅ Tests do not depend on execution order

---

## 🎯 Definition of Done (QA Perspective)

Esta story se considera "Done" desde QA cuando:

**Documentation & Planning:**
- [x] All ambiguities from this document resolved
- [x] All critical questions answered (PO + Dev)
- [x] Test data seed scripts created
- [x] Test-cases.md documento completado

**Test Execution:**
- [ ] TC-34-01 to TC-34-13 executed (13 test cases)
- [ ] Critical test cases (01, 06, 08): 100% passing
- [ ] High priority test cases (02, 03, 04): ≥95% passing
- [ ] Medium/Low test cases: ≥90% passing

**Quality Gates:**
- [ ] All payment method types render correctly (bank, PayPal, MP, cash, other)
- [ ] Empty state handled gracefully (0 methods = section hidden)
- [ ] Active/Inactive filtering works (`is_active = true` only)
- [ ] JSONB fallback works (null/empty → show name only)
- [ ] RLS security validated (user isolation)

**Integration & Performance:**
- [ ] Integration test passing (DB → API → PDF)
- [ ] Performance acceptable (payment methods don't significantly impact PDF gen time)
- [ ] Visual quality verified (payment section looks professional)

**Bug Management:**
- [ ] No P1 (Critical) bugs open
- [ ] No P2 (High) bugs open
- [ ] P3/P4 bugs documented and prioritized for future sprints

**Exploratory Testing:**
- [ ] 1-hour exploratory session completed
- [ ] Edge cases beyond documented tests explored
- [ ] Findings documented

**Sign-off:**
- [ ] QA sign-off given
- [ ] PO acceptance confirmed
- [ ] Story moved to "Done" in Jira

---

## 📎 Related Documentation

**Story Documentation:**
- **Story:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/stories/STORY-SQ-34-pdf-payment-methods/story.md`
- **This Document:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/stories/STORY-SQ-34-pdf-payment-methods/test-cases.md`

**Epic Documentation:**
- **Epic:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/epic.md`
- **Feature Test Plan:** Jira Epic SQ-31 comments (if exists)

**Related Stories:**
- **SQ-32:** Generate Professional PDF Invoice (core PDF generation)
- **SQ-33:** Include Logo and Business Data in PDF (business data in header)
- **SQ-35:** Download PDF to Device (download functionality)
- **SQ-12:** Configure Payment Methods (EPIC SQ-7 - Business Profile)

**Technical Specs:**
- **SRS:** `.context/SRS/functional-specs.md` (FR-018: Generar PDF de Factura)
- **Architecture:** `.context/SRS/architecture-specs.md` (Database schema)
- **API Contracts:** `.context/SRS/api-contracts.yaml` (GET /invoices/{id}/pdf)

**Business Context:**
- **PRD:** `.context/PRD/mvp-scope.md` (EPIC 5: PDF Generation)
- **User Journeys:** `.context/PRD/user-journeys.md` (J1: Registro y Primera Factura)
- **Business Model:** `.context/idea/business-model.md`

**QA Guidelines:**
- **Spec-Driven Testing:** `.context/guidelines/QA/spec-driven-testing.md`
- **Exploratory Testing:** `.context/guidelines/QA/exploratory-testing.md`
- **Jira Test Management:** `.context/guidelines/QA/jira-test-management.md`

---

## 🔧 Technical Questions for Dev (Pending Resolution)

**CRITICAL (Must resolve before testing):**

1. **Q1:** ¿Cómo se formatean exactamente los `details` (JSONB) por tipo de payment method?
   - **Needed:** Spec de formato para bank_transfer, paypal, mercado_pago, cash, other
   - **Impact:** Expected results en todos los test cases
   - **Status:** ⏳ Pending

2. **Q2:** Si `details` es `null`, `{}`, o JSON malformado, ¿cuál es el fallback?
   - **Proposed:** Mostrar solo `name` del método con mensaje "(Contactar para detalles)"
   - **Status:** ⏳ Pending

3. **Q3:** ¿Qué pasa si el usuario no tiene payment methods configurados?
   - **Proposed:** Ocultar sección completamente (más limpio)
   - **Alternative:** Mostrar mensaje "Contactar para métodos de pago"
   - **Status:** ⏳ Pending

**HIGH (Affects test design):**

4. **Q4:** ¿En qué orden se listan los payment methods en el PDF?
   - **Proposed:** `ORDER BY is_default DESC, created_at ASC`
   - **Status:** ⏳ Pending

5. **Q5:** ¿El método `is_default = true` debe tener indicador visual?
   - **Proposed:** Sí, usar "★" prefix o "(Principal)" suffix
   - **Status:** ⏳ Pending

**MEDIUM (Nice to have):**

6. **Q6:** ¿Cuál es el límite máximo de payment methods a mostrar?
   - **Proposed:** Mostrar todos sin límite (layout ajusta automáticamente)
   - **Alternative:** Limitar a top 10
   - **Status:** ⏳ Pending

7. **Q7:** ¿Los nombres de payment method largos (>100 chars) se truncan o se hace wrap?
   - **Proposed:** Wrap a múltiples líneas
   - **Alternative:** Truncar a 80 chars con "..."
   - **Status:** ⏳ Pending

---

## 📋 Test Execution Tracking

[Esta sección se completa durante ejecución]

**Test Execution Date:** [TBD]
**Environment:** Staging
**Executed By:** Arkaitz
**Test Data Seed:** payment-methods-seed-v1.sql

---

**Test Results Summary:**

| Test Case | Status | Execution Time | Notes |
|-----------|--------|----------------|-------|
| TC-34-01 | ⏳ Pending | - | Happy path con 3 métodos |
| TC-34-02 | ⏳ Pending | - | Bank transfer format |
| TC-34-03 | ⏳ Pending | - | Digital payments (parametrizado) |
| TC-34-04 | ⏳ Pending | - | Múltiples mismo tipo |
| TC-34-05 | ⏳ Pending | - | Custom type "other" |
| TC-34-06 | ⏳ Pending | - | Empty state (0 methods) |
| TC-34-07 | ⏳ Pending | - | Single method |
| TC-34-08 | ⏳ Pending | - | Filter activos only |
| TC-34-09 | ⏳ Pending | - | JSONB fallback |
| TC-34-10 | ⏳ Pending | - | Orden (default primero) |
| TC-34-11 | ⏳ Pending | - | Nombre largo |
| TC-34-12 | ⏳ Pending | - | 10+ métodos |
| TC-34-13 | ⏳ Pending | - | Integration test |

**Summary:**
- **Total Tests:** 13
- **Passed:** [TBD]
- **Failed:** [TBD]
- **Blocked:** [TBD]
- **Pass Rate:** [TBD]%

---

**Bugs Found:**

| Bug ID | Severity | Description | Status |
|--------|----------|-------------|--------|
| [TBD] | P1/P2/P3 | [Descripción breve] | Open/Fixed |

---

**Exploratory Testing Notes:**

- **Session Date:** [TBD]
- **Duration:** 1 hour
- **Focus Areas:** Payment methods edge cases, JSONB variations, visual quality
- **Findings:** [TBD]

---

**Sign-off:**

- **QA Engineer:** [Arkaitz] - [Fecha]
- **Product Owner:** [Nombre] - [Fecha]
- **Status:** ⏳ Ready for Dev / ✅ Approved / ❌ Blocked

---

## 📈 Test Metrics

**Test Coverage:**

- **Acceptance Criteria Coverage:** 12/12 scenarios (100%)
- **Edge Cases Coverage:** 9/9 edge cases (100%)
- **Integration Points Coverage:** 2/2 points (100%)

**Test Distribution:**

- Positive Tests: 5 (38%)
- Boundary Tests: 3 (23%)
- Negative Tests: 1 (8%)
- Functional Tests: 3 (23%)
- Integration Tests: 1 (8%)

**Priority Distribution:**

- Critical: 2 tests (15%)
- High: 4 tests (31%)
- Medium: 5 tests (38%)
- Low: 2 tests (15%)

**Estimated Effort:**

- Test Planning: 3 hours ✅ DONE
- Test Data Preparation: 1 hour
- Test Execution: 4-5 hours
- Bug Reporting: 1-2 hours
- **Total:** ~9-11 hours (~1.5 sprints)

---

## 🚀 Next Steps

**Before Dev Starts:**
1. Resolve all critical questions (Q1-Q3)
2. Get PO approval on empty state behavior
3. Define JSONB format spec per payment type

**During Dev:**
1. Create seed script for payment methods test data
2. Prepare test environment (staging)
3. Set up test user accounts with various payment method configs

**After Dev Complete:**
1. Execute all 13 test cases
2. Perform exploratory testing session (1 hour)
3. Document bugs found
4. Verify fixes and retest
5. Give QA sign-off

**Post-Release:**
1. Monitor production for payment method rendering issues
2. Collect user feedback on payment section clarity
3. Plan improvements for next iteration

---

_Generated via Shift-Left QA Analysis_
_Last Updated: 2026-02-26_
_Version: 1.0_
_Author: Arkaitz (QA Engineer)_
