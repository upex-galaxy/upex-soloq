# Comments for SQ-35

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-35)

---

### Dedwison - 2/3/2026, 4:28:05 PM

## 🧪 Shift-Left Test Cases - Generated 2026-02-03

***Status:*** Draft - Pending PO/Dev Review

## 

# Test Cases: [https://upexgalaxy65.atlassian.net/browse/SQ-35#icft=SQ-35](https://upexgalaxy65.atlassian.net/browse/SQ-35#icft=SQ-35) - Download PDF to Device

***Fecha:*** 2026-02-03
***Story Jira Key:*** [https://upexgalaxy65.atlassian.net/browse/SQ-35#icft=SQ-35](https://upexgalaxy65.atlassian.net/browse/SQ-35#icft=SQ-35)
***Epic:*** [https://upexgalaxy65.atlassian.net/browse/SQ-31#icft=SQ-31](https://upexgalaxy65.atlassian.net/browse/SQ-31#icft=SQ-31) - PDF Generation & Download
***Status:*** Draft

## 

## 📋 Critical Analysis

### Business Context

***User Personas Affected:***

- ***Primary:*** Carlos (Diseñador) - Descarga PDFs para enviar manualmente por WhatsApp
- ***Secondary:*** Valentina (Desarrolladora), Andrés (Consultor) - Guardan PDFs como backup

***Business Value:***

- Contribuye al KPI "Time to First Invoice < 10 min"
- Permite control total sobre el archivo PDF

***Related User Journey:*** "Registro y Primera Factura" (Steps 12-14)

## 

### Technical Context

***API Endpoint:*** `GET /invoices/{invoiceId}/pdf` (FR-018)
***Libraries:*** file-saver, @react-pdf/renderer
***Integration:*** Frontend → API → PDF Generator → File download

## 

## 🧪 Test Cases Summary

| ***TC ID **** | ****Test Case **** | ****Type **** | ****Priority *** |
| --- | --- | --- | --- |
| TC-35-01  | Descarga exitosa desde detalle  | Positive  | Critical  |
| TC-35-02  | Descarga desde lista sin abrir detalle  | Positive  | High  |
| TC-35-03  | Descarga desde preview  | Positive  | High  |
| TC-35-04  | Filename con caracteres especiales  | Boundary  | High  |
| TC-35-05  | Descarga en iOS Safari  | Compatibility  | High  |
| TC-35-06  | Descarga en Android Chrome  | Compatibility  | High  |
| TC-35-07  | Error 404 - factura no existe  | Negative  | High  |
| TC-35-08  | Seguridad - factura de otro usuario  | Security  | Critical  |
| TC-35-09  | Descarga de factura draft  | Positive  | Medium  |
| TC-35-10  | Truncado de nombre largo  | Boundary  | Medium  |
| TC-35-11  | Prevención doble-click  | Edge Case  | Medium  |
| TC-35-12  | Headers de respuesta API  | API Contract  | High  |

## 

## 📝 Test Case Details

### TC-35-01: Validar descarga exitosa de PDF desde detalle de factura

***Type:**** Positive | ****Priority:**** Critical | ****Level:*** E2E

***Preconditions:***

- User authenticated
- Invoice INV-2026-0001 exists with client "Acme Corp"
- User is owner of the invoice

***Steps:***

1. Navigate to invoice detail page
2. Click download button (data-testid="btn-download-pdf")
3. Verify download initiates

***Expected:***

- File downloaded: `Invoice-INV-2026-0001-Acme-Corp.pdf`
- Status: 200 OK
- Content-Type: application/pdf

### TC-35-02: Validar descarga desde lista sin abrir detalle

***Type:**** Positive | ****Priority:**** High | ****Level:*** E2E

***Steps:***

1. Navigate to invoices list
2. Click download icon on row (data-testid="btn-download-pdf-list")
3. Verify user remains on list page

***Expected:***

- PDF downloads without navigation
- Loading indicator shown
- Success toast appears

### TC-35-03: Validar descarga desde preview

***Type:**** Positive | ****Priority:**** High | ****Level:*** E2E

***Steps:***

1. Open invoice preview modal
2. Click download button
3. Verify preview remains open

***Expected:***

- PDF downloads
- Modal stays open

### TC-35-04: Validar filename con caracteres especiales (Parametrized)

***Type:**** Boundary | ****Priority:**** High | ****Level:*** API

***Test Data:***

| ***Client Name **** | ****Expected Filename *** |
| --- | --- |
| Acme Corp  | Invoice-INV-2026-0001-Acme-Corp.pdf  |
| Diseño & Cía.  | Invoice-INV-2026-0002-Diseno-Cia.pdf  |
| John's "Company"  | Invoice-INV-2026-0003-Johns-Company.pdf  |

***Expected:***

- Content-Disposition header has sanitized filename
- Special chars replaced with hyphen

### TC-35-05: Validar descarga en iOS Safari

***Type:**** Compatibility | ****Priority:**** High | ****Level:*** Manual

***Steps:***

1. Open invoice on iOS Safari
2. Tap download button
3. Verify PDF opens in native viewer
4. Save to Files app

***Expected:***

- PDF opens in Safari viewer
- Can save with correct filename

### TC-35-06: Validar descarga en Android Chrome

***Type:**** Compatibility | ****Priority:**** High | ****Level:*** Manual

***Steps:***

1. Open invoice on Android Chrome
2. Tap download button
3. Check Downloads folder

***Expected:***

- Download notification appears
- PDF saved to Downloads

### TC-35-07: Validar error 404 cuando factura no existe

***Type:**** Negative | ****Priority:**** High | ****Level:*** API

***Steps:***

1. Call GET /invoices/non-existent-uuid/pdf

***Expected:***

- Status: 404 Not Found
- Response: `{"success": false, "error": {"code": "NOT_FOUND", "message": "Invoice not found"`}}

### TC-35-08: Validar seguridad - denegar descarga de factura de otro usuario

***Type:**** Security | ****Priority:**** Critical | ****Level:*** API

***Preconditions:***

- User A authenticated
- Invoice belongs to User B

***Steps:***

1. As User A, call GET /invoices/{user-b-invoice}/pdf

***Expected:***

- Status: 404 (NOT 403 - prevents enumeration)
- No information leak

### TC-35-09: Validar descarga de factura en estado draft

***Type:**** Positive | ****Priority:**** Medium | ****Level:*** E2E

***Steps:***

1. Navigate to draft invoice
2. Click download

***Expected:***

- PDF downloads successfully
- Allows preview before sending

### TC-35-10: Validar truncado de nombre de cliente muy largo

***Type:**** Boundary | ****Priority:**** Medium | ****Level:*** API

***Test Data:***

- Client: "Very Long International Consulting Services Corporation Limited"

***Expected:***

- Filename truncated to filesystem limits
- Invoice number always preserved

### TC-35-11: Validar prevención de doble-click (debounce)

***Type:**** Edge Case | ****Priority:**** Medium | ****Level:*** E2E

***Steps:***

1. Rapidly double-click download button
2. Monitor network requests

***Expected:***

- Only ONE API request sent
- Button shows loading state

### TC-35-12: Validar headers de respuesta del endpoint PDF

***Type:**** API Contract | ****Priority:**** High | ****Level:*** API

***Expected Headers:***

- Content-Type: application/pdf
- Content-Disposition: attachment; filename="Invoice-{number}-{client}.pdf"
- Cache-Control: private, max-age=300

## 🔧 Questions for Dev

1. ¿Longitud máxima permitida para filename antes de truncar?
2. ¿Se implementará debounce en botón o se deshabilitará durante request?
3. ¿Caracteres con acento (á, é, ñ) se reemplazan o mantienen?

## ✅ Definition of Done (QA)

- [ ] All 12 test cases executed and passing
- [ ] Critical/High: 100% passing
- [ ] Medium: ≥95% passing
- [ ] Mobile compatibility verified
- [ ] Security test (TC-35-08) verified
- [ ] API contract validated

## 📢 Action Required

***@Dev Lead:***

- [ ] Review technical questions above
- [ ] Validate API contract expectations
- [ ] Confirm sanitization rules

***@QA Team:***

- [ ] Prepare test environment
- [ ] Create test data fixtures
- [ ] Schedule mobile testing

***Documentation:*** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/stories/STORY-SQ-35-download-pdf/test-cases.md`

---

### Automation for Jira - 2/9/2026, 2:49:10 AM

🔎 Pull Request created. Task is pending to ANALYZE and REVIEW by the team. Waiting for PR Approval.

---

### Ely - 2/9/2026, 2:49:19 AM

## 🔄 PR Creado - Implementación Completada

**PR:** [#37 - feat(invoices): improve PDF download with professional filename](https://github.com/upex-galaxy/upex-soloq/pull/37)
**Branch:** feat/[https://upexgalaxy65.atlassian.net/browse/SQ-35#icft=SQ-35](https://upexgalaxy65.atlassian.net/browse/SQ-35#icft=SQ-35)/download-pdf
**Target:** staging

### Cambios Implementados

- `sanitizeFilename()` - Remueve acentos y caracteres especiales
- `generateInvoiceFilename()` - Formato: `Invoice-{number}-{client}.pdf`
- Prevención de doble-click con loading state
- Feedback visual de descarga exitosa (checkmark)
- Truncado de nombres largos (max 40 chars)

### Test Cases

| ***TC**** | ****Status**** | ****Notas*** |
| --- | --- | --- |
| TC-35-01 | ✅ | Descarga desde detalle |
| TC-35-02 | ⏳ | Out of scope - lista no implementada |
| TC-35-03 | ✅ | Descarga desde preview |
| TC-35-04 | ✅ | Filename sanitizado |
| TC-35-05 | ✅ | iOS Safari (browser) |
| TC-35-06 | ✅ | Android Chrome (browser) |
| TC-35-07 | ✅ | Error 404 ya implementado |
| TC-35-08 | ✅ | Seguridad via RLS |
| TC-35-09 | ✅ | Draft invoice |
| TC-35-10 | ✅ | Truncado implementado |
| TC-35-11 | ✅ | Doble-click prevention |

**Estado:** Esperando code review

---

### Automation for Jira - 2/9/2026, 3:25:05 AM

✅ Pull Request is successfully MERGED. Task is Done.

---

### Ely - 2/9/2026, 3:26:47 AM

## ✅ Implementación Completada y Mergeada

**PR:** [#37 - feat(invoices): improve PDF download with professional filename](https://github.com/upex-galaxy/upex-soloq/pull/37) **(MERGED)**
**Branch:** feat/[https://upexgalaxy65.atlassian.net/browse/SQ-35#icft=SQ-35](https://upexgalaxy65.atlassian.net/browse/SQ-35#icft=SQ-35)/download-pdf → main
**Merge Commit:** 96c1994

### Funcionalidad Implementada

- Filename profesional: `Invoice-{number}-{client}.pdf`
- Sanitización de caracteres especiales y acentos
- Prevención de doble-click (loading state)
- Feedback visual de descarga exitosa
- Truncado de nombres largos (max 40 chars)

### Test Cases Coverage

- 10/12 TC implementados
- TC-35-02 marcado Out of Scope (lista de facturas aún no existe)
- TC-35-12 N/A (client-side download)

### Code Quality

- ✅ Lint: 0 errores
- ✅ Build: SUCCESS
- ✅ Vercel Preview: SUCCESS

**La funcionalidad está disponible en staging para testing.**

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:56.935Z_
