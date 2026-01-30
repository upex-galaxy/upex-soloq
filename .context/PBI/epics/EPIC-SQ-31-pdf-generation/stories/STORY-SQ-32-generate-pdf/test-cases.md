# Test Cases: STORY-SQ-32 - Generate Professional PDF Invoice

**Fecha:** 2026-01-30
**QA Engineer:** Alfonso Hernandez
**Story Jira Key:** [SQ-32](https://upexgalaxy64.atlassian.net/browse/SQ-32)
**Epic:** EPIC-SQ-31 - PDF Generation & Download
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Diseñador) - Necesita PDFs profesionales que reflejen su imagen creativa ante clientes premium
- **Primary:** Valentina (Desarrolladora) - Necesita precisión en cálculos para clientes internacionales
- **Secondary:** Andrés (Consultor) - Necesita un documento formal para cobrar a empresas medianas

**Business Value:**

- **Value Proposition:** El PDF es el entregable final al cliente. Sin un PDF profesional, la factura no tiene valor como documento de cobro. La calidad del PDF refleja directamente la profesionalidad del freelancer.
- **Business Impact:**
  - Habilitador crítico para KPI "Facturas enviadas por email: 1,500/mes"
  - Impacta directamente el NPS (>40) - un PDF de mala calidad reduce satisfacción
  - Bloquea el epic de Invoice Sending (EPIC 6)

**Related User Journey:**

- **Journey:** J1 - Registro y Primera Factura
- **Steps:** 12-14 (Preview, Send Invoice, Confirmation)
- Esta story es el paso previo crítico antes de poder enviar la factura por email

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: `InvoicePDFDocument`, `PDFViewer`, `PDFDownloadButton`
- Pages/Routes: `/invoices/[id]` (preview modal), `/invoices/[id]/pdf` (direct download)
- Libraries: `@react-pdf/renderer` para generación client-side

**Backend:**

- API Endpoint: `GET /api/invoices/{invoiceId}/pdf` (según api-contracts.yaml)
- Services: Invoice service, Business profile service, Payment methods service
- Data required: Invoice + items, Client, Business profile, Payment methods

**External Services:**

- Supabase Storage (para logos)
- No servicios externos adicionales para PDF

**Integration Points:**

- Invoice data ← invoices + invoice_items tables
- Business data ← business_profiles table
- Logo image ← Supabase Storage bucket `logos`
- Payment methods ← payment_methods table

---

### Story Complexity Analysis

**Overall Complexity:** Medium-High

**Complexity Factors:**

- Business logic complexity: **Medium** - Cálculos ya definidos en Invoice Creation, aquí solo se renderiza
- Integration complexity: **High** - Múltiples fuentes de datos (invoice, client, business, payments)
- Data validation complexity: **Medium** - Verificar que todos los datos existan antes de renderizar
- UI complexity: **High** - Layout profesional con logo, tablas, totales, footer

**Estimated Test Effort:** High
**Rationale:** La generación de PDF involucra múltiples integraciones, requiere tests de performance (<3000ms), tests visuales de layout, y tests de seguridad para verificar autorización.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**

- **Risk 1:** Performance: PDF generation > 3000ms
  - **Relevance to This Story:** Directamente aplicable - esta story implementa la generación core
- **Risk 2:** Logo rendering issues (PNG transparency)
  - **Relevance to This Story:** Parcialmente - el logo es parte del PDF pero se detalla en SQ-33
- **Risk 3:** Mobile download incompatibility
  - **Relevance to This Story:** Se detalla en SQ-35, pero el PDF debe ser compatible

**Integration Points from Epic Analysis:**

- **API: GET /invoices/{invoiceId}/pdf**
  - **Applies to This Story:** ✅ Yes - Endpoint principal de esta story
- **Storage: Supabase Storage (logo images)**
  - **Applies to This Story:** ✅ Yes - Para incluir logo en PDF
- **Libraries: @react-pdf/renderer, file-saver**
  - **Applies to This Story:** ✅ Yes - Core tech stack

**Critical Questions Already Asked at Epic Level:**

**Questions for PO:**

- Q1: What happens if user has no logo?
  - **Status:** ⏳ Pending
  - **Impact on This Story:** Debemos definir layout alternativo sin logo
- Q2: Is there a maximum number of line items per invoice?
  - **Status:** ⏳ Pending
  - **Impact on This Story:** Afecta tests de performance y paginación

**Questions for Dev:**

- Q1: Will PDFs be cached or regenerated on each request?
  - **Status:** ⏳ Pending
  - **Impact on Testing:** Afecta strategy de performance testing
- Q2: How will we handle font loading for PDF generation?
  - **Status:** ⏳ Pending
  - **Impact on Testing:** Podría afectar tiempos de generación

**Test Strategy from Epic:**

- Test Levels: Unit (>80%), Integration (>60%), E2E (critical paths), API (100%)
- Tools: Playwright para E2E, Jest/Vitest para unit/integration
- **How This Story Aligns:** Necesita todos los niveles - unit para formatting, integration para data flow, E2E para user flow completo

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** Esta es la story CORE del epic - implementa la generación del PDF que todas las demás stories extienden (logo, payments, download, templates)
- **Inherited Risks:** Performance (<3000ms), precisión de cálculos, autorización
- **Unique Considerations:** Layout A4/Letter, calidad de impresión (300 DPI equiv), handling de caracteres especiales

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** "Professional layout" no está definido específicamente

- **Location in Story:** Scenario 2 - "It has a clean, professional layout"
- **Question for PO/Dev:** ¿Qué elementos específicos definen "profesional"? ¿Hay mockups de referencia?
- **Impact on Testing:** No podemos validar "profesional" objetivamente sin criterios claros
- **Suggested Clarification:** Definir checklist: logo arriba, datos alineados, tabla con bordes, totales destacados, colores corporativos

**Ambiguity 2:** Comportamiento con datos faltantes no definido

- **Location in Story:** No especificado
- **Question for PO/Dev:** ¿Qué pasa si falta el logo? ¿Y si faltan métodos de pago? ¿Y si no hay notas?
- **Impact on Testing:** No sabemos qué comportamiento validar para estados parciales
- **Suggested Clarification:** Definir fallbacks: sin logo = solo nombre, sin métodos = sección oculta, sin notas = footer reducido

**Ambiguity 3:** Tamaño de página no es claro

- **Location in Story:** Technical Notes dice "A4 page size (or Letter for US)"
- **Question for PO/Dev:** ¿Cómo se determina? ¿Por locale del usuario? ¿Por configuración?
- **Impact on Testing:** Debemos probar ambos formatos o solo uno
- **Suggested Clarification:** MVP: A4 fijo. Post-MVP: configurable por usuario

---

### Missing Information / Gaps

**Gap 1:** Especificación de secciones del PDF

- **Type:** Technical Details
- **Why It's Critical:** AC dice "header, client info, items, totals, footer" pero no detalla qué campos exactos en cada sección
- **Suggested Addition:** Listar campos exactos por sección según InvoicePDF interface del epic
- **Impact if Not Added:** Implementación inconsistente, tests incompletos

**Gap 2:** Manejo de errores

- **Type:** Acceptance Criteria
- **Why It's Critical:** No hay AC para errores (invoice no existe, no autorizado, datos incompletos)
- **Suggested Addition:** Agregar scenarios negativos: invoice not found, unauthorized access
- **Impact if Not Added:** Edge cases no testeados, vulnerabilidades de seguridad

**Gap 3:** Especificación de performance

- **Type:** Non-Functional Requirement
- **Why It's Critical:** NFR dice <3000ms pero no está en AC de la story
- **Suggested Addition:** Agregar AC: "PDF generation completes in less than 3 seconds"
- **Impact if Not Added:** Performance no se valida formalmente

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Factura con muchos items (50+)

- **Scenario:** Usuario genera PDF de factura con 50+ line items
- **Expected Behavior:** PDF debe paginar correctamente, totales en última página
- **Criticality:** High
- **Action Required:** Add to test cases, verify with Dev pagination logic

**Edge Case 2:** Caracteres especiales y emojis

- **Scenario:** Invoice con descripción "Diseño de logo 🎨 para café ñoño"
- **Expected Behavior:** Caracteres especiales y acentos deben renderizar correctamente
- **Criticality:** High (LATAM users con ñ, acentos)
- **Action Required:** Add to test cases

**Edge Case 3:** Factura con valores decimales largos

- **Scenario:** Items con precios como $33.333333 o cantidades 0.25
- **Expected Behavior:** Redondeo a 2 decimales, formato consistente
- **Criticality:** Medium
- **Action Required:** Add to test cases, validate currency formatting

**Edge Case 4:** Factura recién creada (sin items)

- **Scenario:** Usuario intenta generar PDF de draft sin items
- **Expected Behavior:** Error claro o bloqueo del botón
- **Criticality:** Medium
- **Action Required:** Ask PO - ¿permitir PDF de factura vacía?

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues:**

- [x] Acceptance criteria are vague or subjective ("professional layout")
- [x] Expected results are not specific enough (no campos exactos)
- [ ] Missing test data examples
- [x] Missing error scenarios
- [x] Missing performance criteria (no está en AC)
- [ ] Cannot be tested in isolation

**Recommendations to Improve Testability:**

1. Agregar mockup visual de referencia para "professional layout"
2. Especificar campos exactos por sección del PDF
3. Agregar AC de performance: "PDF generates in <3s"
4. Agregar AC de error handling: "Shows error if invoice not found"
5. Definir comportamiento para datos opcionales (logo, notes, terms)

---

## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Generate PDF from complete invoice (Happy Path)

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User is authenticated and has business profile configured
  - Invoice exists with ID "invoice-123" belonging to user
  - Invoice has status "draft" or "sent"
  - Invoice has at least 1 line item
  - Client data is complete (name, email)

- **When:**
  - User navigates to invoice detail page
  - User clicks "Generate PDF" button

- **Then:**
  - PDF is generated within 3 seconds
  - PDF opens in preview modal or downloads directly
  - PDF contains all invoice data (verified in TC-32-02)
  - API returns 200 OK with PDF content-type

---

### Scenario 2: PDF contains all required sections

**Type:** Positive
**Priority:** Critical

- **Given:**
  - PDF has been generated for a complete invoice

- **When:**
  - User views/opens the PDF

- **Then:**
  - **Header Section:**
    - Business logo (if configured)
    - Business name
    - Business address
    - Business tax ID (if configured)
  - **Invoice Meta:**
    - Invoice number (e.g., "INV-2026-0042")
    - Issue date (format DD/MM/YYYY)
    - Due date (format DD/MM/YYYY)
  - **Client Section:**
    - Client name
    - Client company (if configured)
    - Client email
    - Client tax ID (if configured)
  - **Items Table:**
    - Description column
    - Quantity column
    - Unit price column
    - Line total column
    - All items from invoice
  - **Totals Section:**
    - Subtotal
    - Discount (if applied)
    - Tax amount (if applied)
    - **Total (prominently displayed)**
  - **Footer Section:**
    - Payment methods (from user's configured methods)
    - Notes (if added to invoice)
    - Terms (if added to invoice)

---

### Scenario 3: Calculations match invoice editor exactly

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Invoice with following data:
    - Item 1: "Logo Design" x 1 @ $500.00 = $500.00
    - Item 2: "Brand Guide" x 2 @ $250.00 = $500.00
    - Subtotal: $1,000.00
    - Tax rate: 16%
    - Tax amount: $160.00
    - Total: $1,160.00

- **When:**
  - PDF is generated

- **Then:**
  - PDF shows exact same values as invoice editor
  - Subtotal = $1,000.00
  - Tax (16%) = $160.00
  - Total = $1,160.00
  - No rounding errors or discrepancies

---

### Scenario 4: Unauthorized user cannot generate PDF

**Type:** Negative (Security)
**Priority:** Critical

- **Given:**
  - User A is authenticated
  - Invoice belongs to User B (different user)

- **When:**
  - User A attempts to access GET /api/invoices/{invoiceId}/pdf

- **Then:**
  - API returns 404 Not Found (no revela existencia)
  - PDF is NOT generated
  - No invoice data is exposed
  - **⚠️ SECURITY:** RLS policy enforces user isolation

---

### Scenario 5: PDF generation with minimum required data

**Type:** Boundary
**Priority:** High

- **Given:**
  - Invoice has only required fields:
    - 1 line item with description, quantity, unit_price
    - Client with name and email only
    - Business profile with name and email only
    - No logo, no tax, no discount, no notes

- **When:**
  - PDF is generated

- **Then:**
  - PDF generates successfully
  - Layout adjusts gracefully (no empty boxes)
  - Optional sections are hidden or show placeholder
  - Total displays correctly (subtotal = total when no tax/discount)

---

### Scenario 6: PDF generation with maximum data (Stress Test)

**Type:** Boundary/Performance
**Priority:** High
**Source:** Edge case identified in Paso 2

- **Given:**
  - Invoice with 50 line items
  - Each item has long description (200 chars)
  - Client has all optional fields filled
  - Business profile has logo, address, tax ID
  - Invoice has notes (500 chars) and terms (500 chars)

- **When:**
  - PDF is generated

- **Then:**
  - PDF generates in < 5 seconds (stress scenario)
  - PDF paginates correctly (items span multiple pages)
  - Totals appear on final page
  - All data is readable (no truncation)

---

### Scenario 7: PDF with special characters

**Type:** Functional
**Priority:** High
**Source:** Edge case for LATAM users

- **Given:**
  - Invoice with:
    - Business name: "Diseño Ñoño S.A."
    - Item description: "Logotipo café ☕ con ñ y acentós"
    - Client name: "José García Muñoz"

- **When:**
  - PDF is generated

- **Then:**
  - All special characters render correctly
  - ñ, á, é, í, ó, ú display properly
  - Emojis display or gracefully fallback
  - No "?" or "□" replacement characters

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 10

**Breakdown:**

- Positive: 4 test cases
- Negative: 2 test cases
- Boundary: 2 test cases
- Performance: 2 test cases

**Rationale:** Esta story tiene complejidad medium-high con múltiples integraciones. Los 10 test cases cubren: happy path, secciones del PDF, cálculos, seguridad, datos mínimos/máximos, performance, y casos especiales (caracteres).

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Invoice data variations

- **Base Scenario:** Generate PDF and verify calculations
- **Parameters to Vary:** Items count, tax rate, discount

| Items | Tax Rate | Discount | Expected Total |
| ----- | -------- | -------- | -------------- |
| 1     | 0%       | $0       | $500.00        |
| 3     | 16%      | $0       | $1,740.00      |
| 2     | 19%      | 10%      | $1,071.00      |
| 5     | 21%      | $100     | $5,445.00      |

**Total Tests from Parametrization:** 4 combinations
**Benefit:** Valida precisión de cálculos con múltiples escenarios fiscales LATAM

---

### Test Outlines

#### **TC-32-01: Validar generación exitosa de PDF desde factura completa**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** ❌ No

---

**Preconditions:**

- Usuario autenticado con email "testuser@soloq.app"
- Business profile configurado con nombre "Test Freelancer"
- Cliente existente: "Acme Corp" (acme@example.com)
- Factura creada con 2 line items, status "draft"

---

**Test Steps:**

1. Navegar a `/invoices/{invoiceId}`
   - **Data:** invoiceId del invoice creado
2. Click en botón "Generate PDF" o "Preview PDF"
   - **Verify:** Botón está habilitado
3. Esperar generación del PDF
   - **Verify:** Loading indicator aparece
4. Verificar PDF se muestra/descarga
   - **Verify:** Modal de preview aparece O archivo .pdf se descarga

---

**Expected Result:**

- **UI:** Modal de preview muestra PDF renderizado O archivo descargado
- **API Response:**
  - Status Code: 200 OK
  - Content-Type: application/pdf
  - Content-Disposition: attachment; filename="INV-2026-XXXX.pdf"
- **Performance:** Response time < 3000ms
- **PDF File:** Archivo válido que se puede abrir en cualquier PDF reader

---

**Test Data:**

```json
{
  "invoice": {
    "invoiceNumber": "INV-2026-0001",
    "status": "draft",
    "items": [
      { "description": "Logo Design", "quantity": 1, "unitPrice": 500 },
      { "description": "Brand Guide", "quantity": 2, "unitPrice": 250 }
    ],
    "subtotal": 1000,
    "taxRate": 16,
    "taxAmount": 160,
    "total": 1160
  },
  "client": {
    "name": "Acme Corp",
    "email": "acme@example.com"
  }
}
```

---

**Post-conditions:**

- PDF generado puede ser descargado múltiples veces
- Invoice status no cambia por generar PDF

---

#### **TC-32-02: Validar que PDF contiene todas las secciones requeridas**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** Critical
**Test Level:** Integration
**Parametrized:** ❌ No

---

**Preconditions:**

- Invoice completa con todos los datos opcionales:
  - Logo configurado
  - Tax ID de negocio
  - Dirección de negocio
  - Notes y Terms en invoice

---

**Test Steps:**

1. Generar PDF de la factura completa
   - **Data:** Invoice con todos los campos
2. Abrir PDF generado
   - **Verify:** PDF se abre correctamente
3. Verificar sección Header
   - **Verify:** Logo visible, business name, address, tax ID
4. Verificar sección Invoice Meta
   - **Verify:** Invoice number, issue date, due date
5. Verificar sección Client
   - **Verify:** Client name, company, email, tax ID
6. Verificar tabla de Items
   - **Verify:** Todas las columnas, todos los items
7. Verificar sección Totals
   - **Verify:** Subtotal, discount, tax, TOTAL
8. Verificar Footer
   - **Verify:** Payment methods, notes, terms

---

**Expected Result:**

- **PDF Content Checklist:**
  - [ ] Header: Logo aparece en esquina superior
  - [ ] Header: Business name prominente
  - [ ] Header: Address y Tax ID visibles
  - [ ] Meta: Invoice number formato INV-YYYY-NNNN
  - [ ] Meta: Dates formato DD/MM/YYYY
  - [ ] Client: Todos los datos del cliente
  - [ ] Items: Tabla con 4 columnas
  - [ ] Items: Cada item con valores correctos
  - [ ] Totals: Subtotal, Tax (con %), Total destacado
  - [ ] Footer: Lista de payment methods
  - [ ] Footer: Notes y Terms si existen

---

**Test Data:**

```json
{
  "businessProfile": {
    "businessName": "Diseño Profesional LATAM",
    "contactEmail": "contact@design.lat",
    "address": "Av. Reforma 123, CDMX",
    "taxId": "RFC123456ABC"
  },
  "invoice": {
    "invoiceNumber": "INV-2026-0042",
    "issueDate": "2026-01-30",
    "dueDate": "2026-02-28",
    "notes": "Gracias por su preferencia",
    "terms": "Pago a 30 días"
  },
  "paymentMethods": [
    { "type": "bank_transfer", "label": "BBVA", "value": "CLABE: 012180001234567890" },
    { "type": "paypal", "label": "PayPal", "value": "pay@design.lat" }
  ]
}
```

---

#### **TC-32-03: Validar que cálculos del PDF coinciden con editor de factura**

**Related Scenario:** Scenario 3
**Type:** Positive
**Priority:** Critical
**Test Level:** Integration
**Parametrized:** ✅ Yes (Group 1)

---

**Preconditions:**

- Invoice creada con valores específicos para validar cálculos

---

**Test Steps:**

1. Crear invoice con datos específicos
   - **Data:** Ver tabla de parametrización
2. Guardar invoice y verificar totales en UI
   - **Verify:** Totales correctos en editor
3. Generar PDF
4. Extraer valores del PDF
5. Comparar valores PDF vs Editor
   - **Verify:** Valores idénticos

---

**Expected Result:**

- PDF Subtotal === Editor Subtotal
- PDF Tax Amount === Editor Tax Amount
- PDF Discount === Editor Discount
- PDF Total === Editor Total
- Diferencia máxima permitida: $0.00 (exacto)

---

**Test Data (Parametrizado):**

| Test ID | Items | Subtotal | Tax Rate | Tax Amount | Discount | Total |
| ------- | ----- | -------- | -------- | ---------- | -------- | ----- |
| TC-32-03a | 1 x $500 | $500.00 | 0% | $0.00 | $0 | $500.00 |
| TC-32-03b | 3 items | $1,500.00 | 16% | $240.00 | $0 | $1,740.00 |
| TC-32-03c | 2 items | $1,000.00 | 19% | $171.00 | 10% | $1,071.00 |
| TC-32-03d | 5 items | $5,000.00 | 21% | $945.00 | $500 | $5,445.00 |

---

#### **TC-32-04: Validar que PDF tiene dimensiones A4 y márgenes correctos**

**Related Scenario:** Scenario 2 (layout)
**Type:** Visual
**Priority:** Medium
**Test Level:** Unit/Integration
**Parametrized:** ❌ No

---

**Preconditions:**

- PDF generado disponible

---

**Test Steps:**

1. Generar PDF de factura standard
2. Abrir PDF en visor que muestre propiedades
3. Verificar dimensiones de página
   - **Verify:** 210mm x 297mm (A4) o 8.5in x 11in (Letter)
4. Verificar márgenes visuales
   - **Verify:** Contenido no toca bordes de página
5. Verificar orientación
   - **Verify:** Portrait (vertical)

---

**Expected Result:**

- **Page Size:** A4 (595 x 842 points) o Letter (612 x 792 points)
- **Margins:** Mínimo 20mm en cada lado
- **Orientation:** Portrait
- **Content:** Centrado y bien distribuido

---

#### **TC-32-05: Validar generación de PDF con máximo de items (50+)**

**Related Scenario:** Scenario 6
**Type:** Performance/Boundary
**Priority:** High
**Test Level:** Performance
**Parametrized:** ❌ No

---

**Preconditions:**

- Invoice creada con 50 line items
- Cada item con descripción de 200 caracteres

---

**Test Steps:**

1. Crear invoice con 50 items via API/Seed
   - **Data:** 50 items con descripciones largas
2. Medir tiempo actual
3. Generar PDF
4. Medir tiempo final
5. Verificar paginación
   - **Verify:** PDF tiene múltiples páginas
6. Verificar totales en última página
   - **Verify:** Total visible y correcto

---

**Expected Result:**

- **Performance:** Generation time < 5000ms (stress scenario)
- **Pagination:** PDF spans 3-5 pages (depending on layout)
- **Data Integrity:** All 50 items visible in PDF
- **Totals:** Appear on last page, sum correctly
- **Memory:** No memory leaks (browser stable)

---

**Test Data:**

```json
{
  "items": [
    // 50 items generados con faker
    { "description": "Service item 1 with detailed description...", "quantity": 1, "unitPrice": 100 },
    // ... 49 more
  ],
  "expectedSubtotal": 5000.00,
  "expectedTaxAmount": 800.00,
  "expectedTotal": 5800.00
}
```

---

#### **TC-32-06: Validar tiempo de respuesta de generación de PDF < 3000ms**

**Related Scenario:** Scenario 1 + NFR
**Type:** Performance
**Priority:** Critical
**Test Level:** API
**Parametrized:** ❌ No

---

**Preconditions:**

- Invoice standard (5-10 items)
- Server en estado normal (no cold start)

---

**Test Steps:**

1. Hacer request GET /api/invoices/{id}/pdf
2. Medir tiempo de respuesta
3. Repetir 10 veces
4. Calcular p95

---

**Expected Result:**

- **p50:** < 1500ms
- **p95:** < 3000ms
- **p99:** < 5000ms
- **Status:** 200 OK en todos los requests

---

**Test Data:**

```bash
# Comando para test de performance
for i in {1..10}; do
  curl -w "%{time_total}\n" -o /dev/null -s \
    -H "Authorization: Bearer $TOKEN" \
    "https://api.soloq.app/invoices/$INVOICE_ID/pdf"
done
```

---

#### **TC-32-07: Validar calidad de impresión del PDF**

**Related Scenario:** Scenario 5 original
**Type:** Visual
**Priority:** Medium
**Test Level:** Manual
**Parametrized:** ❌ No

---

**Preconditions:**

- PDF generado con logo y texto
- Impresora disponible (o PDF a printer virtual)

---

**Test Steps:**

1. Generar PDF de factura con logo
2. Imprimir PDF en papel (o print preview)
3. Verificar calidad del logo
   - **Verify:** Logo nítido, sin pixelación
4. Verificar legibilidad del texto
   - **Verify:** Texto claro, tamaño adecuado
5. Verificar alineación
   - **Verify:** Elementos alineados, tabla recta

---

**Expected Result:**

- **Logo:** Resolución aparente ~300 DPI, sin artifacts
- **Text:** Font size mínimo 10pt, alto contraste
- **Table:** Líneas rectas, columnas alineadas
- **Overall:** Presentable para enviar a cliente profesional

---

#### **TC-32-08: Validar renderizado de caracteres especiales LATAM**

**Related Scenario:** Scenario 7
**Type:** Functional
**Priority:** High
**Test Level:** Integration
**Parametrized:** ❌ No

---

**Preconditions:**

- Invoice con datos que incluyen caracteres especiales

---

**Test Steps:**

1. Crear invoice con caracteres especiales
   - **Data:** ñ, á, é, í, ó, ú, ü, emojis
2. Generar PDF
3. Abrir PDF y buscar cada carácter
   - **Verify:** Todos los caracteres visibles correctamente
4. Verificar NO hay caracteres de reemplazo
   - **Verify:** Sin "?", "□", o espacios en blanco

---

**Expected Result:**

- **Spanish chars:** ñ, á, é, í, ó, ú, ü renderizados correctamente
- **Symbols:** $, €, % renderizados
- **Emojis:** Renderizan o se omiten gracefully (no □)
- **Encoding:** UTF-8 preservado en PDF

---

**Test Data:**

```json
{
  "businessName": "Diseño Ñoño S.A. de C.V.",
  "clientName": "José García Muñoz",
  "items": [
    { "description": "Diseño de logotipo café ☕", "quantity": 1, "unitPrice": 500 },
    { "description": "Guía de marca para piñata niños", "quantity": 1, "unitPrice": 300 }
  ]
}
```

---

#### **TC-32-09: Validar generación con datos mínimos requeridos**

**Related Scenario:** Scenario 5
**Type:** Boundary
**Priority:** High
**Test Level:** Integration
**Parametrized:** ❌ No

---

**Preconditions:**

- Invoice con solo campos obligatorios:
  - 1 line item (description, qty, price)
  - Client con name y email
  - Business profile con name y email
  - Sin: logo, tax, discount, notes, terms, payment methods

---

**Test Steps:**

1. Crear invoice minimal
2. Generar PDF
3. Verificar PDF se genera sin errores
4. Verificar layout se adapta
   - **Verify:** Sin espacios vacíos awkward
5. Verificar total = subtotal (sin tax)

---

**Expected Result:**

- **Generation:** Exitosa, sin errores
- **Layout:** Limpio, secciones opcionales ocultas o colapsadas
- **Header:** Solo business name y email (sin logo/address)
- **Footer:** Sin payment methods section o con "Not configured"
- **Totals:** Subtotal = Total cuando no hay tax/discount

---

#### **TC-32-10: Validar que usuario no autorizado no puede generar PDF de otro usuario**

**Related Scenario:** Scenario 4
**Type:** Security
**Priority:** Critical
**Test Level:** API
**Parametrized:** ❌ No

---

**Preconditions:**

- User A autenticado
- Invoice pertenece a User B

---

**Test Steps:**

1. Login como User A
2. Obtener token de User A
3. Intentar GET /api/invoices/{invoiceId_UserB}/pdf
   - **Data:** Invoice ID de User B
4. Verificar respuesta

---

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
- **Security:** NO revela que la factura existe
- **Data Exposure:** Cero datos de User B expuestos
- **PDF:** NO se genera

---

**Test Data:**

```json
{
  "userA": {
    "email": "usera@test.com",
    "token": "jwt_token_user_a"
  },
  "userB_invoiceId": "uuid-of-user-b-invoice"
}
```

---

## 🔗 Integration Test Cases

### Integration Test 1: Invoice Data → PDF Renderer → File Output

**Integration Point:** Frontend/API → @react-pdf/renderer → PDF file
**Type:** Integration
**Priority:** High

**Preconditions:**

- Invoice exists with complete data
- @react-pdf/renderer configured correctly

**Test Flow:**

1. API fetches invoice data (invoice + items + client + business profile + payment methods)
2. Data is passed to PDF component
3. @react-pdf/renderer generates PDF buffer
4. PDF buffer is returned as file response

**Contract Validation:**

- Invoice data matches InvoicePDF interface: ✅
- All required fields present: ✅
- PDF output is valid PDF format: ✅

**Expected Result:**

- Data flows correctly through all layers
- No data loss or transformation errors
- PDF file is valid and complete

---

### Integration Test 2: Supabase Storage → Logo in PDF

**Integration Point:** Supabase Storage bucket → PDF renderer
**Type:** Integration
**Priority:** High

**Test Flow:**

1. Fetch logo URL from business_profiles.logo_url
2. Fetch actual image from Supabase Storage
3. Include image in PDF render
4. Verify image appears in final PDF

**Expected Result:**

- Logo loads from Supabase Storage
- Logo renders at correct size in PDF
- Fallback works if logo URL is broken

---

## 📊 Edge Cases Summary

| Edge Case | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
| --------- | -------------------------- | -------------------- | --------- | -------- |
| 50+ line items | ❌ No | ✅ Yes (Scenario 6) | TC-32-05 | High |
| Special chars (ñ, acentos) | ❌ No | ✅ Yes (Scenario 7) | TC-32-08 | High |
| Minimum data | ❌ No | ✅ Yes (Scenario 5) | TC-32-09 | High |
| Unauthorized access | ❌ No | ✅ Yes (Scenario 4) | TC-32-10 | Critical |
| Performance <3000ms | ⚠️ In NFR only | ✅ Added | TC-32-06 | Critical |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type | Count | Purpose | Examples |
| --------- | ----- | ------- | -------- |
| Valid data | 5 | Positive tests | Complete invoice, minimal invoice |
| Invalid data | 2 | Negative tests | Other user's invoice, non-existent ID |
| Boundary values | 2 | Boundary tests | 50 items, empty optional fields |
| Edge case data | 2 | Edge case tests | Special chars, long descriptions |

### Data Generation Strategy

**Static Test Data:**
- Invoice numbers: INV-2026-0001, INV-2026-0042
- Specific amounts for calculation verification: $500, $1000, $1160

**Dynamic Test Data (using Faker.js):**
- Client names: `faker.person.fullName()`
- Email: `faker.internet.email()`
- Descriptions: `faker.commerce.productDescription()`
- 50 items for stress test: loop with faker

**Test Data Cleanup:**

- ✅ All test invoices are cleaned up after test execution
- ✅ Tests are idempotent (can run multiple times)
- ✅ Tests do not depend on execution order

---

## 🎯 Definition of Done (QA Perspective)

Esta story se considera "Done" desde QA cuando:

- [ ] All ambiguities and questions from this document are resolved
- [ ] TC-32-01 to TC-32-10 executed and passing
- [ ] Critical test cases (01, 02, 03, 06, 10): 100% passing
- [ ] High/Medium test cases: ≥95% passing
- [ ] Performance benchmark met: PDF generation < 3000ms (p95)
- [ ] Security test passed: No unauthorized access
- [ ] Visual verification: PDF looks professional
- [ ] Integration tests passing
- [ ] No P1/P2 bugs open
- [ ] Exploratory testing completed

---

## 📎 Related Documentation

- **Story:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/stories/STORY-SQ-32-generate-pdf/story.md`
- **Epic:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/epic.md`
- **Feature Test Plan:** Comentario en Epic SQ-31 en Jira
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/` (all files)
- **SRS:** `.context/SRS/functional-specs.md` (FR-018)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml` (GET /invoices/{id}/pdf)

---

## 📋 Test Execution Tracking

[Esta sección se completa durante ejecución]

**Test Execution Date:** [TBD]
**Environment:** Staging
**Executed By:** [Nombre]

**Results:**

- Total Tests: 10
- Passed: [Y]
- Failed: [Z]
- Blocked: [W]

**Bugs Found:**

- [Bug ID 1]: [Descripción breve]
- [Bug ID 2]: [Descripción breve]

**Sign-off:** [Nombre QA] - [Fecha]

---

_Generated via Shift-Left QA Analysis_
_Mirror of Jira comment on SQ-32_
