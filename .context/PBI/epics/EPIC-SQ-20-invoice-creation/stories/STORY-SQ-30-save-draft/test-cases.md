# Test Cases: STORY-SQ-30 - Save Invoice as Draft

**Fecha:** 2026-02-07
**QA Engineer:** AI-Generated (Shift-Left Analysis)
**Story Jira Key:** [SQ-30](https://upexgalaxy64.atlassian.net/browse/SQ-30)
**Epic:** EPIC-SQ-20 - Invoice Creation
**Status:** Draft | Pending Review

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Diseñador Organizado) - Crea facturas frecuentemente, necesita poder pausar y retomar sin perder trabajo. Con 5-8 clientes activos, es probable que tenga múltiples drafts simultáneos.
- **Secondary:** Andrés (Consultor Tradicional) - Menos tech-savvy, necesita que el guardado sea automático y transparente. En Journey 4, detecta errores y necesita editar drafts.

**Business Value:**

- **Value Proposition:** Prevenir pérdida de datos durante la creación de facturas. Permitir flujos de trabajo interrumpidos (teléfono, reunión, browser crash).
- **Business Impact:** Reduce fricción en el flujo de facturación. Sin drafts, los usuarios deben completar facturas en una sola sesión, lo cual es unrealistic para freelancers multitasking. Impacta directamente el KPI "Time to First Invoice < 10 min" al permitir creación progresiva.

**Related User Journey:**

- Journey: J1 - Registro y Primera Factura (Carlos)
- Step: Steps 8-14 (creación de factura) - El draft permite pausar entre steps
- Journey: J4 - Edición de Factura (Andrés) - Detecta error, vuelve a editar draft

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: InvoiceForm, SaveDraftButton, AutoSaveIndicator, DraftBadge, DeleteDraftDialog
- Pages/Routes: `/invoices/create`, `/invoices/[id]/edit`, `/invoices` (list with filter)
- State Management: React Hook Form state + auto-save hook (useAutoSave)

**Backend:**

- API Endpoints:
  - `POST /api/invoices` - Crear factura con status "draft" (FR-015)
  - `PUT /api/invoices/:id` - Actualizar factura draft (FR-016)
  - `DELETE /api/invoices/:id` - Eliminar draft (FR-016)
  - `GET /api/invoices?status=draft` - Listar drafts (FR-021)
- Services: Invoice CRUD, auto-save debounce logic

**Database:**

- Tables: `invoices` (status='draft'), `invoice_items`, `invoice_events`
- Key columns: `invoices.status` (enum: draft, sent, paid, overdue, cancelled), `invoices.updated_at`
- RLS: Users can only CRUD their own invoices

**Integration Points:**

- Frontend auto-save → PUT /api/invoices/:id (debounce 2s)
- Invoice status transition: draft → sent (requires validation)
- Invoice list filtering by status=draft
- Delete draft → CASCADE delete invoice_items

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic complexity: Medium - Auto-save con debounce, validación diferenciada (save vs send), status transitions
- Integration complexity: Medium - Auto-save requiere coordinación frontend-backend, status management
- Data validation complexity: Medium - Reglas diferentes para guardar draft (laxo) vs enviar (estricto)
- UI complexity: Medium - Auto-save indicators, draft badges, unsaved changes warning, delete confirmation

**Estimated Test Effort:** Medium
**Rationale:** La story tiene múltiples scenarios (save, auto-save, resume, filter, delete, convert) con reglas de validación diferenciadas. El auto-save agrega complejidad de timing y edge cases de concurrencia.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**

- Risk 1: Errores de cálculo en totales
  - **Relevance to This Story:** Medium - Al guardar draft con cálculos parciales, los totales deben recalcularse correctamente al reanudar
- Risk 2: Condiciones de carrera en numeración
  - **Relevance to This Story:** High - Auto-save genera invoice number al crear primer draft. Race conditions posibles si auto-save dispara múltiples requests
- Risk 3: UX confusa en selección de cliente
  - **Relevance to This Story:** Low - Drafts pueden guardarse sin cliente seleccionado

**Integration Points from Epic Analysis:**

- Frontend ↔ Backend API: **Applies:** Yes - Auto-save es un PUT constante al backend
- Invoice ↔ Client (FK): **Applies:** Yes - Draft puede no tener client_id (nullable para drafts)
- API ↔ Database (RLS): **Applies:** Yes - Solo el owner puede ver/editar sus drafts

**Critical Questions Already Asked at Epic Level:**

**Questions for PO:**

- Q1: ¿Impuesto sobre (subtotal - descuento)?
  - **Status:** Answered
  - **Answer:** Sí, impuesto sobre (subtotal - descuento)
  - **Impact on This Story:** Los drafts parciales pueden tener cálculos intermedios que deben ser consistentes

- Q3: ¿Auto-save guarda drafts incompletos?
  - **Status:** Answered
  - **Answer:** SÍ, auto-save guarda cualquier cambio (incluso parcial). Mínimo requerido: al menos 1 campo con datos
  - **Impact on This Story:** DIRECTA - Define el comportamiento core de esta story

**Questions for Dev:**

- Q3: Implementación del auto-save
  - **Status:** Answered
  - **Answer:** Debounce de 2 segundos. Draft puede tener campos vacíos. UI indicators: "Saving...", "Draft saved", timestamp, unsaved changes warning
  - **Impact on This Story:** Define la implementación técnica del auto-save

**Test Strategy from Epic:**

- Test Levels: Unit, Integration, E2E, API
- Tools: Playwright, Vitest, Faker.js
- **How This Story Aligns:** Necesita tests E2E para auto-save flow, API tests para CRUD de drafts, Integration tests para status transitions

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** Esta story implementa la persistencia de trabajo en progreso, habilitando el flujo iterativo de creación de facturas
- **Inherited Risks:** Race conditions en auto-save (del epic risk 2), cálculos parciales inconsistentes
- **Unique Considerations:** Auto-save timing, draft lifecycle management, delete behavior, status transition validation

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Discrepancia en frecuencia de auto-save

- **Location in Story:** Scenario 2 dice "every 30s" pero Dev response en epic dice "2 second debounce"
- **Question for PO/Dev:** ¿El auto-save es cada 30 segundos (timer) o con debounce de 2 segundos (después de cada cambio)?
- **Impact on Testing:** Cambia completamente cómo testear el auto-save (timer vs event-driven)
- **Suggested Clarification:** Usar debounce de 2s como dice Dev (más user-friendly). Actualizar story.

**Ambiguity 2:** Delete behavior - Soft vs Hard delete

- **Location in Story:** Technical Notes dice "Soft delete for drafts (or hard delete since no history needed)"
- **Question for PO/Dev:** ¿Los drafts se eliminan permanentemente (hard delete) o se marcan como eliminados (soft delete)?
- **Impact on Testing:** Define si hay que testear recovery/undo, si hay retención de datos, y qué pasa en DB
- **Suggested Clarification:** Hard delete para drafts (no necesitan historial). Soft delete solo para facturas sent/paid.

**Ambiguity 3:** Comportamiento de "Send" desde draft

- **Location in Story:** Scenario 6 dice "click Send" pero no especifica validación
- **Question for PO/Dev:** ¿Qué validaciones se ejecutan al convertir draft → sent? ¿Qué mensaje de error si el draft está incompleto?
- **Impact on Testing:** Define negative test cases para envío de draft incompleto
- **Suggested Clarification:** Según PO response en epic: cliente, al menos 1 line item, y fecha de vencimiento son requeridos para enviar.

---

### Missing Information / Gaps

**Gap 1:** Límite de drafts por usuario

- **Type:** Business Rule
- **Why It's Critical:** Sin límite, un usuario podría crear miles de drafts vacíos via auto-save
- **Suggested Addition:** Definir máximo de drafts simultáneos (ej: 50) o no limitar en MVP
- **Impact if Not Added:** Posible impacto en performance de DB y UX del listado

**Gap 2:** Comportamiento offline / sin conexión

- **Type:** Technical Details
- **Why It's Critical:** Auto-save fallará sin internet. ¿Qué ve el usuario?
- **Suggested Addition:** Mostrar indicador de error "Could not save" con retry automático
- **Impact if Not Added:** Pérdida silenciosa de datos = frustración del usuario

**Gap 3:** Draft sin cambios - ¿se crea?

- **Type:** Business Rule
- **Why It's Critical:** Si usuario navega a "Create Invoice" y sale inmediatamente, ¿se crea un draft vacío?
- **Suggested Addition:** Según Dev response: "at least one field has data" para crear draft
- **Impact if Not Added:** Drafts fantasma en el listado

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Auto-save con request en progreso

- **Scenario:** Usuario hace cambios rápidos que generan múltiples auto-save requests simultáneos
- **Expected Behavior:** Debounce previene esto, pero si hay request lento, el siguiente debería cancelar o esperar
- **Criticality:** Medium
- **Action Required:** Add to test cases only

**Edge Case 2:** Browser crash / cierre accidental durante edición

- **Scenario:** Usuario cierra browser mientras edita un draft
- **Expected Behavior:** El último auto-save exitoso preserva los datos
- **Criticality:** High
- **Action Required:** Add to test cases only

**Edge Case 3:** Editar draft mientras otro tab tiene el mismo draft abierto

- **Scenario:** Usuario abre el mismo draft en dos tabs del browser
- **Expected Behavior:** El último save gana (last-write-wins) o detectar conflicto
- **Criticality:** Low
- **Action Required:** Ask PO (MVP: last-write-wins aceptable)

**Edge Case 4:** Eliminar draft que tiene auto-save pendiente

- **Scenario:** Usuario hace cambio (triggering auto-save debounce) e inmediatamente click "Delete"
- **Expected Behavior:** Delete debe cancelar el auto-save pendiente y eliminar el draft
- **Criticality:** Medium
- **Action Required:** Add to test cases only

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues:**

- [x] Acceptance criteria are vague or subjective (auto-save "periodically" no especifica timing)
- [x] Missing error scenarios (qué pasa si auto-save falla, si delete falla)
- [x] Missing test data examples (qué datos mínimos para un draft)

**Recommendations to Improve Testability:**

1. Especificar debounce time exacto (2s según Dev)
2. Definir campos mínimos para crear draft (al menos 1 campo según Dev)
3. Agregar error scenarios: auto-save failure, delete failure, send validation failure
4. Definir delete behavior definitivo (hard delete)

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Save as draft manually

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User is authenticated and on the invoice creation page (`/invoices/create`)
  - User has entered at least one field (e.g., selected a client)

- **When:**
  - User clicks "Save Draft" button

- **Then:**
  - Invoice is saved in DB with status "draft"
  - Invoice number is auto-generated (format: INV-XXX)
  - Success feedback shown: "Draft saved" toast
  - URL updates to `/invoices/[id]/edit` (without page reload)
  - `updated_at` timestamp is set
  - No email is sent to client
  - Invoice appears in invoices list with "Draft" badge

---

### Scenario 2: Auto-save while editing

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User is editing a draft invoice
  - Draft already exists in DB (has an ID)

- **When:**
  - User makes a change to any field (description, amount, client, etc.)
  - 2 seconds pass without further changes (debounce)

- **Then:**
  - Auto-save triggers PUT request to API
  - UI shows "Saving..." indicator during request
  - On success, UI shows "Draft saved" with timestamp
  - `updated_at` is updated in DB
  - No page reload or navigation

---

### Scenario 3: Filter and find drafts in list

**Type:** Positive
**Priority:** High

- **Given:**
  - User has multiple invoices with different statuses (draft, sent, paid)

- **When:**
  - User navigates to `/invoices` and filters by status "draft"

- **Then:**
  - Only invoices with status "draft" are displayed
  - Each draft shows: invoice number, client name (or "No client"), total (or $0.00), "Draft" badge, last updated date
  - Drafts are sorted by `updated_at` desc (most recent first)

---

### Scenario 4: Resume editing a draft

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User has a draft invoice with partial data (e.g., client selected, 1 item added, no due date)

- **When:**
  - User clicks on the draft from the invoices list

- **Then:**
  - Navigates to `/invoices/[id]/edit`
  - All previously saved data is loaded into the form
  - User can continue editing from where they left off
  - Auto-save resumes with debounce behavior
  - All calculations are correct (subtotal, tax, total based on existing items)

---

### Scenario 5: Delete a draft

**Type:** Positive
**Priority:** High

- **Given:**
  - User has a draft invoice they no longer need

- **When:**
  - User clicks "Delete" button on the draft

- **Then:**
  - Confirmation dialog appears: "Are you sure you want to delete this draft? This action cannot be undone."
  - On confirm: draft is permanently deleted (hard delete) from DB
  - Associated invoice_items are cascade deleted
  - User is redirected to invoices list
  - Success toast: "Draft deleted"
  - Draft no longer appears in list

---

### Scenario 6: Convert draft to sent (Send invoice)

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User has a complete draft (client selected, at least 1 line item, due date set)

- **When:**
  - User clicks "Send" button

- **Then:**
  - Validation runs: client required, at least 1 item required, due date required
  - Status changes from "draft" to "sent"
  - `sent_at` timestamp is set
  - Email is sent to client with PDF attached
  - Invoice becomes read-only (cannot be freely edited)
  - Invoice event logged (type: "sent")

---

### Scenario 7: Auto-save creates first draft automatically

**Type:** Positive
**Priority:** High
**Source:** Identified during critical analysis

- **Given:**
  - User is on `/invoices/create` (new invoice form, no draft ID yet)
  - User enters data in at least one field

- **When:**
  - Debounce timer (2s) expires after the change

- **Then:**
  - Auto-save creates a new invoice with status "draft" via POST
  - Invoice number is auto-generated
  - URL updates to `/invoices/[id]/edit` without page reload
  - Subsequent changes use PUT (update) instead of POST (create)

---

### Scenario 8: Attempt to send incomplete draft

**Type:** Negative
**Priority:** High

- **Given:**
  - User has a draft with missing required fields (e.g., no client, no items, or no due date)

- **When:**
  - User clicks "Send" button

- **Then:**
  - Validation error is displayed with specific missing fields
  - Error messages: "Please select a client", "Add at least one line item", "Set a due date"
  - Status remains "draft"
  - No email is sent
  - Draft data is not lost

---

### Scenario 9: Draft not counted as sent in dashboard

**Type:** Positive
**Priority:** Medium

- **Given:**
  - User has 3 draft invoices and 2 sent invoices

- **When:**
  - User views the dashboard

- **Then:**
  - Dashboard summary shows: drafts=3, sent=2
  - Drafts are NOT included in "totalPending" amount
  - Drafts have a distinct visual indicator (gray badge, not colored like sent/overdue)

---

### Scenario 10: Auto-save failure handling

**Type:** Negative
**Priority:** High
**Source:** Identified during critical analysis

- **Given:**
  - User is editing a draft
  - Network connection is lost or server returns error

- **When:**
  - Auto-save attempts to save

- **Then:**
  - UI shows error indicator: "Could not save" or "Save failed"
  - Data in the form is NOT lost (kept in client-side state)
  - Auto-save retries on next change or when connection is restored
  - User can still manually click "Save Draft" to retry

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 12

**Breakdown:**

- Positive: 6 test cases
- Negative: 3 test cases
- Boundary: 1 test case
- Integration: 2 test cases

**Rationale for This Number:** SQ-30 is a Medium complexity story with well-defined behaviors from PO/Dev responses. The auto-save mechanism and status transitions are the main testing areas. 12 test cases cover all scenarios plus critical edge cases identified.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** Yes

**Parametrized Test Group 1:** Draft save with varying data completeness

- **Base Scenario:** Save draft with different levels of form completion
- **Parameters to Vary:** Fields populated

| Client | Items | Due Date | Notes | Expected Save | Expected Send |
| ------ | ----- | -------- | ----- | ------------- | ------------- |
| Yes | Yes (1) | Yes | Yes | Success | Success |
| Yes | Yes (1) | No | No | Success | Fail - missing due date |
| Yes | No | Yes | No | Success | Fail - missing items |
| No | Yes (1) | Yes | No | Success | Fail - missing client |
| No | No | No | No | Fail - no data | Fail - incomplete |
| Yes | Yes (3) | Yes | Yes | Success | Success |

**Total Tests from Parametrization:** 6 combinations
**Benefit:** Validates the differential validation rules (save=lax, send=strict) efficiently

---

### Test Outlines

#### **Should save invoice as draft with manual save button**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** No

---

**Preconditions:**

- User is authenticated
- User has at least 1 client in the system
- User is on `/invoices/create` page

---

**Test Steps:**

1. Select a client from the dropdown
   - **Data:** Client: "Acme Corp (acme@example.com)"
2. Add one line item
   - **Data:** Description: "Design services", Quantity: 1, Unit Price: 500.00
3. Click "Save Draft" button
   - **Verify:** Toast message "Draft saved" appears
4. Check URL changed to `/invoices/[id]/edit`
5. Navigate to `/invoices` and filter by "draft"
   - **Verify:** New draft appears in list with correct data

---

**Expected Result:**

- **UI:** "Draft saved" toast, URL updates, draft badge visible in list
- **API Response:**
  - Status Code: 201 Created
  - Response Body:

    ```json
    {
      "success": true,
      "invoice": {
        "id": "uuid",
        "invoiceNumber": "INV-001",
        "status": "draft",
        "clientId": "uuid",
        "subtotal": 500.00,
        "total": 500.00
      }
    }
    ```

- **Database:**
  - Table: `invoices`
  - Record created with status='draft', sent_at=NULL, paid_at=NULL
  - Table: `invoice_items` - 1 record with description="Design services"

---

**Test Data:**

```json
{
  "input": {
    "clientId": "existing-client-uuid",
    "items": [
      { "description": "Design services", "quantity": 1, "unitPrice": 500.00 }
    ]
  },
  "user": {
    "email": "testuser@example.com",
    "role": "authenticated"
  }
}
```

---

#### **Should auto-save draft after 2-second debounce**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** No

---

**Preconditions:**

- User is authenticated
- User has an existing draft invoice open in edit mode

---

**Test Steps:**

1. Change the description of a line item
   - **Data:** New description: "Updated design services"
2. Wait 2 seconds without making further changes
   - **Verify:** "Saving..." indicator appears
3. Wait for save to complete
   - **Verify:** "Draft saved" indicator with timestamp appears
4. Reload the page
   - **Verify:** Changed description persists after reload

---

**Expected Result:**

- **UI:** "Saving..." → "Draft saved [timestamp]" transition
- **API Response:**
  - Status Code: 200 OK (PUT update)
- **Database:**
  - `invoices.updated_at` is updated to current timestamp
  - `invoice_items.description` updated to "Updated design services"

---

#### **Should filter invoices list to show only drafts**

**Related Scenario:** Scenario 3
**Type:** Positive
**Priority:** High
**Test Level:** E2E
**Parametrized:** No

---

**Preconditions:**

- User has invoices with mixed statuses: 2 drafts, 1 sent, 1 paid

---

**Test Steps:**

1. Navigate to `/invoices`
   - **Verify:** All invoices displayed
2. Select "Draft" from status filter
   - **Verify:** Only 2 draft invoices are visible
3. Verify draft display format
   - **Verify:** Each draft shows: invoice number, client name, amount, "Draft" badge, last updated

---

**Expected Result:**

- **UI:** Only drafts visible, distinct "Draft" badge styling
- **API Response:**
  - `GET /api/invoices?status=draft`
  - Status Code: 200 OK
  - Returns only invoices where status='draft'

---

#### **Should resume editing a draft with all data intact**

**Related Scenario:** Scenario 4
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** No

---

**Preconditions:**

- User has a draft with: client="Acme Corp", 2 line items, tax_rate=16%, no due date

---

**Test Steps:**

1. Navigate to `/invoices` and click on the draft
   - **Verify:** Navigates to `/invoices/[id]/edit`
2. Verify all fields are populated
   - **Verify:** Client dropdown shows "Acme Corp"
   - **Verify:** 2 line items displayed with correct descriptions, quantities, prices
   - **Verify:** Tax rate shows 16%
   - **Verify:** Due date is empty (was not set)
3. Verify calculations are correct
   - **Verify:** Subtotal = sum of line items, tax calculated on subtotal, total correct
4. Make a change and wait for auto-save
   - **Verify:** Auto-save works after resuming edit

---

**Expected Result:**

- **UI:** Form fully populated with saved data, calculations correct
- **Database:** No changes until user edits (read-only load)

---

#### **Should permanently delete a draft with confirmation**

**Related Scenario:** Scenario 5
**Type:** Positive
**Priority:** High
**Test Level:** E2E
**Parametrized:** No

---

**Preconditions:**

- User has a draft invoice with 2 line items

---

**Test Steps:**

1. Navigate to the draft invoice
2. Click "Delete" button
   - **Verify:** Confirmation dialog appears
3. Click "Cancel" on dialog
   - **Verify:** Draft is NOT deleted, dialog closes
4. Click "Delete" again, then "Confirm"
   - **Verify:** Draft is deleted, redirect to invoices list
5. Check invoices list
   - **Verify:** Deleted draft no longer appears

---

**Expected Result:**

- **UI:** Confirmation dialog, success toast "Draft deleted", redirect
- **API Response:**
  - Status Code: 200 OK (DELETE)
- **Database:**
  - `invoices` record removed (hard delete)
  - `invoice_items` cascade deleted

---

#### **Should transition draft to sent with full validation**

**Related Scenario:** Scenario 6
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** No

---

**Preconditions:**

- User has a complete draft: client selected, 1+ items, due date set
- User has business profile configured (for PDF generation)
- User has at least 1 payment method configured

---

**Test Steps:**

1. Open the complete draft
2. Click "Send" button
   - **Verify:** Send confirmation modal appears
3. Confirm send
   - **Verify:** Status changes from "draft" to "sent"
   - **Verify:** Success message shown
4. Try to edit the sent invoice
   - **Verify:** Invoice is now read-only (or limited editable)

---

**Expected Result:**

- **UI:** Status badge changes to "Sent", edit restrictions applied
- **API Response:**
  - POST `/api/invoices/:id/send` - Status 200
- **Database:**
  - `invoices.status` = 'sent'
  - `invoices.sent_at` = current timestamp
  - `invoice_events` record created (type: 'sent')

---

#### **Should reject sending incomplete draft**

**Related Scenario:** Scenario 8
**Type:** Negative
**Priority:** High
**Test Level:** E2E
**Parametrized:** Yes (Group 1)

---

**Preconditions:**

- User has a draft with missing required send fields

---

**Test Steps:**

1. Open a draft with no client selected
2. Click "Send" button
   - **Verify:** Error: "Please select a client"
3. Select a client but leave items empty
4. Click "Send" button
   - **Verify:** Error: "Add at least one line item"
5. Add an item but leave due date empty
6. Click "Send" button
   - **Verify:** Error: "Set a due date"

---

**Expected Result:**

- **UI:** Specific validation error messages per missing field
- **Database:** Status remains 'draft', no email sent, no invoice_event created

---

#### **Should not count drafts as pending in dashboard**

**Related Scenario:** Scenario 9
**Type:** Positive
**Priority:** Medium
**Test Level:** API
**Parametrized:** No

---

**Preconditions:**

- User has: 2 drafts (total $1500), 3 sent (total $5000), 1 paid (total $2000)

---

**Test Steps:**

1. Call `GET /api/invoices/dashboard`
   - **Verify:** Response contains correct counts and amounts

---

**Expected Result:**

- **API Response:**

  ```json
  {
    "success": true,
    "summary": {
      "totalPending": 5000.00,
      "totalOverdue": 0,
      "totalPaidThisMonth": 2000.00,
      "counts": {
        "draft": 2,
        "sent": 3,
        "paid": 1,
        "overdue": 0
      }
    }
  }
  ```

- Drafts counted separately, NOT included in totalPending

---

#### **Should handle auto-save failure gracefully**

**Related Scenario:** Scenario 10
**Type:** Negative
**Priority:** High
**Test Level:** E2E
**Parametrized:** No

---

**Preconditions:**

- User is editing a draft
- Network connection is simulated as unavailable (or API returns 500)

---

**Test Steps:**

1. Make a change to a field while offline/error state
2. Wait for debounce (2s)
   - **Verify:** "Save failed" or error indicator appears
3. Verify form data is NOT lost
   - **Verify:** Changed data still visible in form
4. Restore connection / fix error
5. Make another change
   - **Verify:** Auto-save succeeds on retry

---

**Expected Result:**

- **UI:** Error indicator, data preserved in form, retry on next change
- **Database:** Data NOT updated during failure, updated after retry

---

#### **Should not create empty draft when user visits create page and leaves**

**Related Scenario:** Edge Case 3 (from Gap 3)
**Type:** Boundary
**Priority:** Medium
**Test Level:** E2E
**Parametrized:** No

---

**Preconditions:**

- User navigates to `/invoices/create`

---

**Test Steps:**

1. Navigate to `/invoices/create`
2. Do NOT enter any data in any field
3. Navigate away (click "Invoices" in sidebar)
   - **Verify:** No new draft is created

---

**Expected Result:**

- **Database:** No new invoice record created
- **UI:** No "unsaved changes" warning (since there are no changes)

---

#### **Should warn user about unsaved changes when navigating away**

**Related Scenario:** Edge Case from Dev response
**Type:** Positive
**Priority:** Medium
**Test Level:** E2E
**Parametrized:** No

---

**Preconditions:**

- User is editing a draft
- User has made changes that haven't been auto-saved yet (within 2s debounce)

---

**Test Steps:**

1. Make a change to a field
2. Immediately try to navigate away (before debounce completes)
   - **Verify:** Browser/app shows "You have unsaved changes" warning
3. Choose to stay
   - **Verify:** Changes are preserved, auto-save completes
4. Try to navigate away again after auto-save completes
   - **Verify:** No warning (changes already saved)

---

**Expected Result:**

- **UI:** "Unsaved changes" warning only when there are pending unsaved changes
- Changes preserved if user stays

---

#### **Should prevent deleting non-draft invoices**

**Related Scenario:** Edge Case - status protection
**Type:** Negative
**Priority:** High
**Test Level:** API
**Parametrized:** No

---

**Preconditions:**

- User has an invoice with status "sent"

---

**Test Steps:**

1. Attempt `DELETE /api/invoices/:id` on a sent invoice
   - **Verify:** API returns error

---

**Expected Result:**

- **API Response:**
  - Status Code: 400 Bad Request
  - Response Body:

    ```json
    {
      "success": false,
      "error": {
        "code": "INVOICE_NOT_DELETABLE",
        "message": "Only draft invoices can be deleted"
      }
    }
    ```

- **Database:** Invoice NOT deleted, status unchanged

---

## Integration Test Cases

### Integration Test 1: Auto-save → API → Database round-trip

**Integration Point:** Frontend auto-save → PUT /api/invoices/:id → PostgreSQL
**Type:** Integration
**Priority:** High

**Preconditions:**

- Draft exists in DB
- User is authenticated

**Test Flow:**

1. Frontend triggers auto-save after debounce
2. PUT request sent with partial form data
3. API validates and updates invoice
4. Response returned to frontend
5. Frontend updates UI indicators

**Contract Validation:**

- Request format: matches InvoiceInput schema (all fields optional for draft update)
- Response format: matches Invoice schema
- Status codes: 200 for success, 400 for validation error, 404 for not found

**Expected Result:**

- Auto-save completes within API response time target (< 300ms p95)
- Data consistency: what was sent equals what was saved
- No data loss or corruption

---

### Integration Test 2: Draft → Sent status transition with email

**Integration Point:** Frontend → PUT status → Backend → Email Service
**Type:** Integration
**Priority:** High

**Test Flow:**

1. User clicks "Send" on complete draft
2. Frontend sends POST /api/invoices/:id/send
3. Backend validates all required fields
4. Backend generates PDF (FR-018)
5. Backend sends email via Resend (FR-019)
6. Backend updates status to 'sent'
7. Backend logs event in invoice_events

**Expected Result:**

- Status transition: draft → sent (atomic)
- PDF generated correctly
- Email sent to client email
- Invoice event logged
- If email fails: status should NOT change to 'sent' (rollback)

---

## Edge Cases Summary

| Edge Case | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
| --------- | -------------------------- | -------------------- | --------- | -------- |
| Auto-save with concurrent requests | No | No (debounce handles) | N/A - handled by debounce | Medium |
| Browser crash during edit | No | Yes (Scenario 2) | TC auto-save | High |
| Same draft in two tabs | No | No | N/A - MVP: last-write-wins | Low |
| Delete with pending auto-save | No | No | TC delete | Medium |
| Empty form - no draft created | No | Yes (Scenario 10 edge) | TC boundary | Medium |
| Unsaved changes warning | No | Yes (new scenario) | TC unsaved warning | Medium |
| Delete non-draft invoice | No | Yes (new scenario) | TC API negative | High |
| Auto-save failure (offline) | No | Yes (Scenario 10) | TC error handling | High |

---

## Test Data Summary

### Data Categories

| Data Type | Count | Purpose | Examples |
| --------- | ----- | ------- | ------- |
| Valid data | 6 | Positive tests | Complete invoice, partial draft, minimal draft |
| Invalid data | 3 | Negative tests | Incomplete draft for send, non-draft delete, empty form |
| Boundary values | 1 | Boundary tests | Empty form navigation |
| Edge case data | 2 | Edge case tests | Offline auto-save, unsaved changes |

### Data Generation Strategy

**Static Test Data:**

- Client: "Acme Corp", email: "acme@example.com"
- Invoice items: "Design services" at $500.00
- Tax rate: 16% (standard LATAM IVA)

**Dynamic Test Data (using Faker.js):**

- Client data: `faker.company.name()`, `faker.internet.email()`
- Line items: `faker.commerce.productDescription()`, `faker.number.float({ min: 10, max: 10000 })`
- Dates: `faker.date.future()`

**Test Data Cleanup:**

- All test data is cleaned up after test execution
- Tests are idempotent (can run multiple times)
- Tests do not depend on execution order

---

## Definition of Done (QA Perspective)

Esta story se considera "Done" desde QA cuando:

- [ ] All ambiguities and questions from this document are resolved
- [ ] Story is updated with suggested improvements (if accepted by PO)
- [ ] All 12 test cases are executed and passing
- [ ] Critical/High test cases: 100% passing (8 cases)
- [ ] Medium/Low test cases: >= 95% passing (4 cases)
- [ ] All critical and high bugs resolved and verified
- [ ] Integration tests passing (2 tests)
- [ ] API contract validation passed
- [ ] Auto-save timing verified (2s debounce)
- [ ] Dashboard correctly excludes drafts from pending totals
- [ ] Regression tests passed (existing invoice functionality unaffected)
- [ ] Exploratory testing completed
- [ ] Test execution report generated

---

## Related Documentation

- **Story:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-30-save-draft/story.md`
- **Epic:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/feature-test-plan.md`
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
