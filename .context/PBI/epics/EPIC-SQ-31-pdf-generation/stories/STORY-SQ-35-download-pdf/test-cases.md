# Test Cases: SQ-35 - Download PDF to Device

**Fecha:** 2026-02-03
**Story Jira Key:** [SQ-35](https://upexgalaxy64.atlassian.net/browse/SQ-35)
**Epic:** [SQ-31](https://upexgalaxy64.atlassian.net/browse/SQ-31) - PDF Generation & Download
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Diseñador) - Necesita descargar PDFs para enviarlos manualmente por WhatsApp a clientes
- **Secondary:** Valentina (Desarrolladora) - Descarga facturas para sus registros personales
- **Secondary:** Andrés (Consultor) - Guarda PDFs localmente como backup

**Business Value:**

- **Value Proposition:** Permite al freelancer tener control total sobre el archivo PDF para guardarlo o enviarlo por canales alternativos (WhatsApp, drive, etc.)
- **Business Impact:** Contribuye al KPI "Time to First Invoice < 10 min" y al objetivo de 2,000 facturas creadas en 3 meses

**Related User Journey:**

- Journey: "Registro y Primera Factura"
- Step: Step 12-14 (Previsualizar y Enviar/Descargar Factura)

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: `DownloadButton`, `InvoicePreview`, `InvoiceListItem`
- Pages/Routes: `/invoices`, `/invoices/[id]`, `/invoices/[id]/preview`
- Libraries: `file-saver` (client-side download)

**Backend:**

- API Endpoint: `GET /invoices/{invoiceId}/pdf` (FR-018)
- Response: PDF file stream con headers correctos
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="Invoice-{number}-{client}.pdf"`

**Integration Points:**

- Frontend → API endpoint → PDF Generator (@react-pdf/renderer) → File download

---

### Story Complexity Analysis

**Overall Complexity:** Low-Medium

**Complexity Factors:**

- Business logic complexity: **Low** - Descargar archivo es straightforward
- Integration complexity: **Medium** - Diferencias entre browsers y mobile
- Data validation complexity: **Low** - Solo sanitizar nombre de archivo
- UI complexity: **Low** - Botón de descarga simple

**Estimated Test Effort:** Low-Medium
**Rationale:** La funcionalidad es simple pero requiere testing de compatibilidad cross-browser y mobile

---

### Epic-Level Context (From Feature Test Plan)

**Critical Risks Already Identified at Epic Level:**

- Risk: **Mobile download incompatibility**
  - **Relevance to This Story:** ✅ Directamente relacionado - iOS Safari y Android Chrome manejan descargas diferente

- Risk: **Performance: PDF generation > 3000ms**
  - **Relevance to This Story:** ⚠️ Parcialmente - El usuario espera mientras se genera el PDF para descarga

**Integration Points from Epic Analysis:**

- `GET /invoices/{invoiceId}/pdf` - **Applies to This Story:** ✅ Yes - Es el endpoint principal

**Test Strategy from Epic:**

- Test Levels: Unit, Integration, E2E, API
- Tools: Playwright, Vitest
- **How This Story Aligns:** E2E tests para flujo de descarga + API tests para endpoint

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Reglas exactas de sanitización del nombre del cliente

- **Location in Story:** Technical Notes
- **Question for Dev:** ¿Qué caracteres específicos se reemplazan? ¿Se trunca si es muy largo?
- **Impact on Testing:** Necesitamos expected filenames exactos
- **Suggested Clarification:** Documentar regex o función de sanitización

✅ **Resolved:** Formato de filename clarificado como `Invoice-{invoice_number}-{sanitized_client_name}.pdf`

---

### Missing Information / Gaps

✅ **Gap Resolved:** Escenarios de error agregados al Acceptance Criteria (Scenarios 5 y 6)

**Gap Remaining:** Longitud máxima del filename

- **Type:** Technical Details
- **Why It's Critical:** Sistemas operativos tienen límites (255 chars típicamente)
- **Suggested Addition:** Especificar truncado a 100 chars si excede
- **Impact if Not Added:** Posibles errores en clientes con nombres muy largos

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Cliente con nombre muy largo (> 100 chars)

- **Scenario:** Nombre de archivo excede límite del sistema operativo
- **Expected Behavior:** Truncar nombre del cliente, mantener número de factura
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 2:** Descargar factura mientras PDF está generándose (doble click)

- **Scenario:** Usuario hace doble click en download button
- **Expected Behavior:** Debounce o deshabilitar botón durante generación
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 3:** Factura en estado "draft"

- **Scenario:** Usuario intenta descargar factura que aún está en borrador
- **Expected Behavior:** Descarga debe funcionar (permitir preview antes de enviar)
- **Criticality:** Low
- **Action Required:** Add to test cases

---

### Testability Validation

**Is this story testeable as written?** ✅ Yes (después de mejoras)

**Testability Issues Resolved:**

- ✅ Formato de filename clarificado
- ✅ Escenarios de error agregados
- ✅ Comportamiento mobile especificado por plataforma

---

## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Download PDF from Invoice Detail (Happy Path)

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User is authenticated
  - User is viewing invoice INV-2026-0001 for client "Acme Corp"
  - Invoice belongs to the authenticated user

- **When:**
  - User clicks "Download PDF" button

- **Then:**
  - PDF file downloads to user's device
  - Filename is `Invoice-INV-2026-0001-Acme-Corp.pdf`
  - File is a valid PDF document
  - Download completes within 5 seconds

---

### Scenario 2: Download from Invoice List

**Type:** Positive
**Priority:** High

- **Given:**
  - User is on the invoices list page
  - Invoice row displays download icon

- **When:**
  - User clicks the download icon on invoice row

- **Then:**
  - PDF downloads without opening invoice detail
  - Loading indicator shows during download
  - User remains on list page

---

### Scenario 3: Download from Preview

**Type:** Positive
**Priority:** High

- **Given:**
  - User is viewing the invoice preview modal

- **When:**
  - User clicks download button within preview

- **Then:**
  - PDF downloads immediately
  - Preview remains open after download

---

### Scenario 4: Filename with Special Characters

**Type:** Boundary
**Priority:** High

- **Given:**
  - Invoice exists for client named "Diseño & Cía. S.A."

- **When:**
  - User downloads the PDF

- **Then:**
  - Filename is sanitized: `Invoice-INV-2026-0002-Diseno-Cia-SA.pdf`
  - Special characters replaced with hyphen or removed
  - Filename is valid for Windows, Mac, and Linux

---

### Scenario 5: Mobile Download - iOS Safari

**Type:** Compatibility
**Priority:** High

- **Given:**
  - User is on iOS Safari (iPhone/iPad)

- **When:**
  - User taps download button

- **Then:**
  - PDF opens in Safari's native PDF viewer
  - User can tap "Share" to save to Files app
  - Filename is preserved when saving

---

### Scenario 6: Mobile Download - Android Chrome

**Type:** Compatibility
**Priority:** High

- **Given:**
  - User is on Android Chrome

- **When:**
  - User taps download button

- **Then:**
  - PDF downloads to Downloads folder
  - Download notification appears in Android
  - User can open PDF in default viewer

---

### Scenario 7: Error - Invoice Not Found

**Type:** Negative
**Priority:** High

- **Given:**
  - User attempts to download invoice with non-existent ID

- **When:**
  - API request is made

- **Then:**
  - Status Code: 404 Not Found
  - Response: `{ "success": false, "error": { "code": "NOT_FOUND", "message": "Invoice not found" } }`
  - UI shows appropriate error message to user

---

### Scenario 8: Security - Unauthorized Access

**Type:** Security
**Priority:** Critical

- **Given:**
  - User A is authenticated
  - Invoice ID belongs to User B

- **When:**
  - User A attempts to download User B's invoice

- **Then:**
  - Status Code: 404 Not Found (not 403 to prevent enumeration)
  - Same error response as Scenario 7
  - No information leaked about invoice existence

---

### Scenario 9: Download Invoice in Draft Status

**Type:** Positive
**Priority:** Medium

- **Given:**
  - Invoice exists with status "draft"
  - User is the owner

- **When:**
  - User clicks download

- **Then:**
  - PDF downloads successfully
  - Allows user to preview before sending

---

### Scenario 10: Long Client Name Truncation

**Type:** Boundary
**Priority:** Medium

- **Given:**
  - Client name is "Very Long International Consulting Services Corporation Limited"

- **When:**
  - User downloads the PDF

- **Then:**
  - Filename is truncated to stay within filesystem limits
  - Invoice number is always preserved in filename
  - File downloads successfully

---

### Scenario 11: Double-Click Prevention

**Type:** Edge Case
**Priority:** Medium

- **Given:**
  - User is viewing invoice detail

- **When:**
  - User rapidly double-clicks download button

- **Then:**
  - Only ONE download initiates
  - Button shows loading state during first request
  - No duplicate API calls

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 12

**Breakdown:**

- Positive: 5 test cases
- Negative: 2 test cases
- Boundary: 2 test cases
- Compatibility: 2 test cases
- Edge Case: 1 test case

**Rationale:** Story es de complejidad baja-media con escenarios de error bien definidos. Cobertura incluye happy paths, error handling, seguridad, y compatibilidad mobile.

---

### Parametrization Opportunities

**Parametrized Test Group 1:** Filename Sanitization

| Client Name         | Invoice Number | Expected Filename                             |
| ------------------- | -------------- | --------------------------------------------- |
| `Acme Corp`         | INV-2026-0001  | `Invoice-INV-2026-0001-Acme-Corp.pdf`         |
| `Diseño & Cía.`     | INV-2026-0002  | `Invoice-INV-2026-0002-Diseno-Cia.pdf`        |
| `John's "Company"`  | INV-2026-0003  | `Invoice-INV-2026-0003-Johns-Company.pdf`     |
| `Cliente/Test\Name` | INV-2026-0004  | `Invoice-INV-2026-0004-Cliente-Test-Name.pdf` |

**Total Tests from Parametrization:** 4 data sets
**Benefit:** Cubre múltiples edge cases de sanitización en un solo test

---

### Test Outlines

#### **TC-35-01: Validar descarga exitosa de PDF desde detalle de factura**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E

**Preconditions:**

- User authenticated with email: `testuser@example.com`
- Invoice `INV-2026-0001` exists with client "Acme Corp"
- Invoice status: `sent`
- User is owner of the invoice

**Test Steps:**

1. Navigate to `/invoices/[invoice-id]`
   - **Verify:** Invoice detail page loads
2. Locate download button (`data-testid="btn-download-pdf"`)
   - **Verify:** Button is visible and enabled
3. Click download button
   - **Verify:** Download initiates

**Expected Result:**

- **UI:** Download indicator appears
- **File:** `Invoice-INV-2026-0001-Acme-Corp.pdf` downloaded
- **API Response:** Status 200, Content-Type: application/pdf

**Test Data:**

```json
{
  "invoice": {
    "id": "uuid-invoice-001",
    "invoiceNumber": "INV-2026-0001",
    "clientName": "Acme Corp",
    "status": "sent"
  }
}
```

---

#### **TC-35-02: Validar descarga desde lista de facturas sin abrir detalle**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** High
**Test Level:** E2E

**Preconditions:**

- User on `/invoices` list page
- At least one invoice exists

**Test Steps:**

1. Navigate to invoices list
2. Locate download icon on invoice row (`data-testid="btn-download-pdf-list"`)
3. Click download icon
4. Verify user remains on list page

**Expected Result:**

- **UI:** Loading indicator, success toast on complete
- **File:** PDF downloads
- **Navigation:** User stays on `/invoices`

---

#### **TC-35-03: Validar descarga desde preview manteniendo modal abierto**

**Related Scenario:** Scenario 3
**Type:** Positive
**Priority:** High
**Test Level:** E2E

**Preconditions:**

- Invoice preview modal is open

**Test Steps:**

1. Open invoice preview (`data-testid="pdf-preview-container"`)
2. Click download button within preview
3. Verify preview remains open after download

**Expected Result:**

- **UI:** Preview stays open
- **File:** PDF downloaded correctly

---

#### **TC-35-04: Validar formato de nombre de archivo con caracteres especiales**

**Related Scenario:** Scenario 4
**Type:** Boundary
**Priority:** High
**Test Level:** API + Unit
**Parametrized:** ✅ Yes

**Preconditions:**

- Invoices exist with various client names containing special characters

**Test Steps:**

1. Call `GET /invoices/{id}/pdf` for each test data set
2. Verify Content-Disposition header has correct sanitized filename

**Expected Result:**

- **API Response:** Status 200
- **Header:** Filename sanitized correctly per test data

**Test Data:** See Parametrization Table

---

#### **TC-35-05: Validar descarga en iOS Safari**

**Related Scenario:** Scenario 5
**Type:** Compatibility
**Priority:** High
**Test Level:** Manual / Cross-browser

**Preconditions:**

- iOS device with Safari
- User authenticated

**Test Steps:**

1. Navigate to invoice detail on iOS Safari
2. Tap download button
3. Verify PDF opens in native viewer
4. Tap Share > Save to Files

**Expected Result:**

- **UI:** PDF opens in Safari PDF viewer
- **File:** Can be saved with correct filename

---

#### **TC-35-06: Validar descarga en Android Chrome**

**Related Scenario:** Scenario 6
**Type:** Compatibility
**Priority:** High
**Test Level:** Manual / Cross-browser

**Preconditions:**

- Android device with Chrome
- User authenticated

**Test Steps:**

1. Navigate to invoice detail on Android Chrome
2. Tap download button
3. Check Downloads folder

**Expected Result:**

- **UI:** Download notification appears
- **File:** PDF in Downloads folder with correct name

---

#### **TC-35-07: Validar error 404 cuando factura no existe**

**Related Scenario:** Scenario 7
**Type:** Negative
**Priority:** High
**Test Level:** API

**Preconditions:**

- User authenticated

**Test Steps:**

1. Call `GET /invoices/00000000-0000-0000-0000-000000000000/pdf`

**Expected Result:**

- **Status Code:** 404 Not Found
- **Response Body:**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Invoice not found"
  }
}
```

---

#### **TC-35-08: Validar seguridad - denegar descarga de factura de otro usuario**

**Related Scenario:** Scenario 8
**Type:** Security
**Priority:** Critical
**Test Level:** API

**Preconditions:**

- User A authenticated (testuser-a@example.com)
- Invoice belongs to User B

**Test Steps:**

1. Authenticate as User A
2. Call `GET /invoices/{user-b-invoice-id}/pdf`

**Expected Result:**

- **Status Code:** 404 Not Found (NOT 403)
- **Response:** Same as TC-35-07
- **Security:** No enumeration vulnerability

---

#### **TC-35-09: Validar descarga de factura en estado draft**

**Related Scenario:** Scenario 9
**Type:** Positive
**Priority:** Medium
**Test Level:** E2E

**Preconditions:**

- Invoice exists with status "draft"
- User is owner

**Test Steps:**

1. Navigate to draft invoice detail
2. Click download button

**Expected Result:**

- **File:** PDF downloads successfully
- **Content:** Shows invoice data correctly

---

#### **TC-35-10: Validar truncado de nombre de cliente muy largo**

**Related Scenario:** Scenario 10
**Type:** Boundary
**Priority:** Medium
**Test Level:** API

**Preconditions:**

- Client name: "Very Long International Consulting Services Corporation Limited Partnership"

**Test Steps:**

1. Create invoice with very long client name
2. Call download endpoint

**Expected Result:**

- **Filename:** Truncated but includes invoice number
- **File:** Downloads successfully

---

#### **TC-35-11: Validar prevención de doble descarga (debounce)**

**Related Scenario:** Scenario 11
**Type:** Edge Case
**Priority:** Medium
**Test Level:** E2E

**Preconditions:**

- User viewing invoice detail

**Test Steps:**

1. Rapidly double-click download button
2. Monitor network requests

**Expected Result:**

- **API Calls:** Only ONE request sent
- **UI:** Button disabled/loading during request
- **File:** Single download

---

#### **TC-35-12: Validar headers de respuesta del endpoint PDF**

**Related Scenario:** All scenarios
**Type:** API Contract
**Priority:** High
**Test Level:** API

**Preconditions:**

- Valid invoice exists

**Test Steps:**

1. Call `GET /invoices/{id}/pdf`
2. Inspect response headers

**Expected Result:**

- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="Invoice-{number}-{client}.pdf"`
- **Cache-Control:** `private, max-age=300`

---

## 📊 Test Summary

| TC ID    | Test Case                              | Type          | Priority |
| -------- | -------------------------------------- | ------------- | -------- |
| TC-35-01 | Descarga exitosa desde detalle         | Positive      | Critical |
| TC-35-02 | Descarga desde lista sin abrir detalle | Positive      | High     |
| TC-35-03 | Descarga desde preview                 | Positive      | High     |
| TC-35-04 | Filename con caracteres especiales     | Boundary      | High     |
| TC-35-05 | Descarga en iOS Safari                 | Compatibility | High     |
| TC-35-06 | Descarga en Android Chrome             | Compatibility | High     |
| TC-35-07 | Error 404 - factura no existe          | Negative      | High     |
| TC-35-08 | Seguridad - factura de otro usuario    | Security      | Critical |
| TC-35-09 | Descarga de factura draft              | Positive      | Medium   |
| TC-35-10 | Truncado de nombre largo               | Boundary      | Medium   |
| TC-35-11 | Prevención doble-click                 | Edge Case     | Medium   |
| TC-35-12 | Headers de respuesta API               | API Contract  | High     |

---

## 🔧 Technical Questions for Dev (Pending)

1. ¿Cuál es la longitud máxima permitida para el filename antes de truncar?
2. ¿Se implementará debounce en el botón o se deshabilitará durante la request?
3. ¿Los caracteres con acento (á, é, í, ó, ú, ñ) se reemplazan o se mantienen?

---

## ✅ Definition of Done (QA Perspective)

- [ ] All 12 test cases executed and passing
- [ ] Critical/High test cases: 100% passing
- [ ] Medium test cases: ≥95% passing
- [ ] Mobile compatibility verified (iOS Safari, Android Chrome)
- [ ] Security test (TC-35-08) verified
- [ ] No critical or high bugs open
- [ ] API contract validated (TC-35-12)

---

## 📎 Related Documentation

- **Story:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/stories/STORY-SQ-35-download-pdf/story.md`
- **Epic:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/feature-test-plan.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`

---

## 📋 Test Execution Tracking

[Esta sección se completa durante ejecución]

**Test Execution Date:** [TBD]
**Environment:** Staging
**Executed By:** [Nombre]

**Results:**

- Total Tests: 12
- Passed: [TBD]
- Failed: [TBD]
- Blocked: [TBD]

**Bugs Found:**

- [Bug ID 1]: [Descripción breve]

**Sign-off:** [Nombre QA] - [Fecha]

---

_Generated via Shift-Left QA Analysis_
_Jira Comment ID: 47050_
