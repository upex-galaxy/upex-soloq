# Acceptance Test Plan: STORY-SQ-47 - Invoice Dashboard Base List

**Date:** 2026-03-24
**QA Engineer:** Alfonso Hernandez
**Story Jira Key:** SQ-47
**Epic:** EPIC-SQ-38 - Invoice Dashboard & Tracking
**Status:** Draft

---

## 📋 Step 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Diseñador Organizado) — necesita vista consolidada para no perder seguimiento entre 5-8 clientes simultáneos. Este dashboard es su punto de entrada diario para saber qué cobrar.
- **Secondary:** Andrés (Consultor Tradicional) — requiere control simple y directo sin reportería compleja; la lista base le debe mostrar todo lo que necesita de un vistazo.
- **Tertiary:** Valentina (Desarrolladora Internacional) — aunque sus prioridades son filtros de urgencia, depende de este listado base para navegar al detalle de cada factura.

**Business Value:**

- **Value Proposition:** Provee visibilidad inmediata del estado financiero. El freelancer puede ver en segundos cuántas facturas tiene, en qué estado están y tomar acción sin fricción. Reduce el tiempo de "saber qué cobrar" de minutos a segundos.
- **Business Impact:** Es la base estructural del Journey 2 (Seguimiento y Cobro). Sin este dashboard funcional y confiable, ninguna de las historias de la épica SQ-38 puede agregar valor. Impacta directamente el MAU y la retención al ser la página más visitada del producto.

**Related User Journey:**

- **Journey 2:** Seguimiento y Cobro de Factura — esta story es el **punto de entrada** del journey: el usuario llega al dashboard para evaluar el estado de sus facturas antes de actuar.
- **Journey 1 (parcial):** Post-primera factura enviada — el dashboard vacío + CTA es la primera experiencia de seguimiento para usuarios nuevos.

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Route/Page: `/invoices` (App Router — `src/app/(app)/invoices/`)
- Components: Invoice list table, column headers (invoice_number, client_name, total, issue_date, status), empty state component, pagination component (or infinite scroll), responsive layout
- State: URL-based pagination params (`page`, `limit`), default sort applied on mount

**Backend:**

- API Endpoint: `GET /api/invoices`
- Params: `page` (default 1), `limit` (default 20), `sortBy` (default `created_at`), `sortOrder` (default `desc`)
- Response: `{ success, invoices[], total, page, totalPages }`
- RLS: Row Level Security — each user only sees their own invoices

**Database:**

- Tables: `invoices` (joined with `clients` for client_name column)
- Default query: `SELECT ... FROM invoices JOIN clients ON ... WHERE invoices.user_id = $1 ORDER BY created_at DESC LIMIT 20 OFFSET 0`

**External Services:** N/A for this story.

**Integration Points:**

- Frontend `/invoices` page → `GET /api/invoices` (base list fetch on page load)
- Supabase RLS policies → PostgreSQL `invoices` + `clients` tables

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic complexity: Low — no calculations, pure read/display
- Integration complexity: Medium — pagination metadata must match between API and UI; RLS must be validated
- Data validation complexity: Low — display-only, no input forms
- UI complexity: Medium — responsive design + empty state + pagination are distinct UI states

**Estimated Test Effort:** Medium
**Rationale:** 14 test cases estimated in Feature Test Plan. Multiple UI states (full list, empty, paginated), API contract validation, and RLS security checks make this Medium effort despite the low business logic complexity.

---

### Epic-Level Context (From Feature Test Plan in Jira — Comment by Joel, 2026-03-16)

**Critical Risks Already Identified at Epic Level:**

- **Risk: Paginación vs infinite scroll queda abierta en una misma story**
  - **Relevance to This Story:** DIRECT — AC 5 of SQ-47 explicitly uses "OR" between pagination and infinite scroll. This ambiguity is the most critical blocker for this story's testing. We cannot design deterministic UI test cases until Dev confirms the implementation.
- **Risk: UX ambigua en estados vacíos/no resultados**
  - **Relevance to This Story:** DIRECT — SQ-47 includes the empty state (AC 4). The epic flags that "sin datos" vs "sin coincidencias de búsqueda" are not formally differentiated. For this story (base list, no filters yet), only "sin datos" applies — but we must design the empty state AC precisely to avoid confusion with later filter stories.

**Integration Points from Epic Analysis:**

- Frontend dashboard ↔ `GET /api/invoices` (filtros, búsqueda, orden, paginación)
  - **Applies to This Story:** ✅ Yes — base list fetch without filters is the core of SQ-47
- Frontend summary cards ↔ `GET /api/invoices/dashboard`
  - **Applies to This Story:** ❌ No — summary cards belong to SQ-52 (Monthly Summary)
- Backend API ↔ PostgreSQL (invoices, clients) con RLS
  - **Applies to This Story:** ✅ Yes — RLS must be validated at API level

**Critical Questions Already Asked at Epic Level:**

**Questions for Dev:**

- Question: ¿Se implementa paginación tradicional (20 por página) o infinite scroll? ¿Cuál es el criterio final?
  - **Status:** ⏳ Pending (no response in epic comments as of 2026-03-24)
  - **Impact on This Story:** Blocks UI test case design for AC 5. API tests can proceed regardless, but UI pagination/scroll assertions need a definitive answer.

**Test Strategy from Epic:**

- Test Levels: Unit (Dev), Integration (QA+Dev), E2E (QA), API (QA)
- Tools: Playwright (E2E + API), Vitest/Jest (unit), Postman/Newman
- **How This Story Aligns:** SQ-47 requires API tests (GET /api/invoices contract + RLS), UI/E2E tests (3 states: list, empty, paginated), and integration tests (UI ↔ API data mapping).

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** Foundation layer. Every other story in SQ-38 builds on top of this invoice list. If this base list is broken, all filters (SQ-48), search (SQ-51), and summary (SQ-52) break too.
- **Inherited Risks:** Pagination ambiguity, empty-state/no-results confusion (for later stories), RLS cross-user access.
- **Unique Considerations:** This is the ONLY story where the empty state with CTA is tested. Also the only story defining the base column structure — column name mismatches here will cascade to all other stories.

---

## 🚨 Step 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** AC 5 says "Invoices are paginated (20 per page) **or** infinitely scrolled" — two mutually exclusive UX patterns.

- **Location in Story:** Acceptance Criteria 5, Scope item 4
- **Question for Dev:** ¿Cuál de los dos se implementa? ¿Paginación tradicional (botones prev/next, page numbers) o infinite scroll (auto-load on scroll)?
- **Impact on Testing:** Cannot write deterministic UI test cases for AC 5. Pagination tests check for page controls and URL params; infinite scroll tests check IntersectionObserver behavior. These are completely different test approaches.
- **Suggested Clarification:** Remove "or" from AC 5. Replace with the definitive chosen pattern and its specific UX details (e.g., "page controls show X/Y pages", or "next batch loads on scroll to bottom").

**Ambiguity 2:** AC 3 says column "amount" and "date" — but Scope defines columns as `total` and `issue_date`.

- **Location in Story:** AC 3 vs Scope section
- **Question for Dev/PO:** ¿El label visible en la UI es "Amount" (showing `total`) y "Date" (showing `issue_date`)? ¿O son otros labels? ¿Qué formato de fecha se muestra (ISO, DD/MM/YYYY, relative)?
- **Impact on Testing:** Column header assertions and data assertions depend on exact label names and date format.
- **Suggested Clarification:** Add to Scope: "Column headers: Invoice #, Client, Amount (total in USD), Date (issue_date, format: DD/MMM/YYYY), Status".

**Ambiguity 3:** AC 2 says "list of **all** my invoices" — does "all" mean all statuses (including `draft` and `cancelled`)?

- **Location in Story:** AC 2
- **Question for PO:** ¿El dashboard base muestra facturas de todos los estados (draft, sent, paid, overdue, cancelled)? ¿O hay algún estado excluido por defecto?
- **Impact on Testing:** We need to know whether to seed `cancelled` and `draft` invoices in the test dataset and assert they appear.
- **Suggested Clarification:** Add to Scope: "Default view shows invoices of all statuses unless filtered."

---

### Missing Information / Gaps

**Gap 1:** No error state defined for failed API call.

- **Type:** Acceptance Criteria — missing state
- **Why It's Critical:** Network failures and 5xx errors will happen in production. Without a defined error state, QA cannot test whether the UI degrades gracefully.
- **Suggested Addition:** Add AC: "Given an API error occurs loading invoices, Then I see an error message with a retry option."
- **Impact if Not Added:** Error handling behavior is undefined; may be inconsistent across browsers.

**Gap 2:** Empty state CTA label and destination not specified.

- **Type:** Acceptance Criteria / Business Rule
- **Why It's Critical:** The CTA test must assert a specific text and a specific navigation target (e.g., clicks → `/invoices/new`).
- **Suggested Addition:** Add to AC 4 Scope: "CTA button text: 'Create your first invoice'. On click: navigate to `/invoices/new`."
- **Impact if Not Added:** UI test for empty state CTA cannot have a deterministic expected result.

**Gap 3:** Default sort is only in Scope, not in Acceptance Criteria.

- **Type:** Missing AC
- **Why It's Critical:** Default sort is a testable observable behavior. Testers need an explicit AC to validate it.
- **Suggested Addition:** Add AC: "Given I view the invoice list, Then invoices are sorted by creation date descending (newest first) by default."

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** User has exactly 20 invoices (pagination boundary).

- **Scenario:** 20 invoices exist — exactly at the page limit. Should page 1 show all 20 and page controls appear?
- **Expected Behavior:** List shows 20 invoices. If paginated: shows "1 of 1 pages" or no next-page control. If infinite scroll: no additional load trigger.
- **Criticality:** High — boundary condition for pagination logic
- **Action Required:** Add to test cases; no story change needed.

**Edge Case 2:** Very long client name or invoice number truncation.

- **Scenario:** Client name = 80+ chars, invoice_number = very long string.
- **Expected Behavior:** UI truncates with ellipsis; full value visible on hover (tooltip) or in detail view.
- **Criticality:** Medium — UX consistency
- **Action Required:** Add to test cases; may need PO confirmation on tooltip requirement.

**Edge Case 3:** Invoice list with `total = 0.00`.

- **Scenario:** A valid invoice exists with total = $0.00 (e.g., test/pro-bono invoice).
- **Expected Behavior:** Row displays "$0.00" in Amount column without error or blank.
- **Criticality:** Medium — edge amount value
- **Action Required:** Add to test cases.

**Edge Case 4:** API returns empty `invoices[]` but `total > 0` (data inconsistency).

- **Scenario:** Unlikely but possible race condition — API says total=5 but returns empty array.
- **Expected Behavior:** UI should not crash; should show empty state or handle gracefully.
- **Criticality:** Low — defensive robustness
- **Action Required:** Add as low-priority integration test note.

---

### Testability Validation

**Is this story testable as written?** ⚠️ Partially

**Testability Issues:**

- [x] Acceptance criteria are vague or subjective — AC 1 "I see a dashboard" is not specific; needs component-level assertions.
- [x] Expected results are not specific enough — column names, date format, CTA text not defined.
- [x] Missing error scenarios — no API failure state.
- [x] Cannot be tested in isolation — pagination/scroll ambiguity (Ambiguity 1) blocks one critical AC.

**Recommendations to Improve Testability:**

1. Resolve pagination vs infinite scroll before entering development (blocks AC 5).
2. Add explicit column definitions with headers and data format to Scope.
3. Add CTA destination URL to empty state AC.
4. Add error state AC.
5. Promote default sort from Scope to an explicit AC.

---

## ✅ Step 3: Refined Acceptance Criteria

### Scenario 1: Authenticated user navigates to invoices page

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User is logged in with valid session token
  - User account exists in `profiles` table
  - At least 1 invoice exists for this user in `invoices` table

- **When:**
  - User navigates to `/invoices`

- **Then:**
  - Page loads successfully (HTTP 200)
  - Invoice list container is visible (`data-testid="invoice-list"`)
  - Page title or heading contains "Invoices" or "Facturas"
  - At least 1 invoice row is displayed in the list

---

### Scenario 2: Invoice list displays all required columns per row

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User has at least 1 invoice with fields: `invoice_number="INV-2026-0001"`, `client_name="Acme Corp"`, `total=1500.00`, `issue_date="2026-03-15"`, `status="sent"`

- **When:**
  - User views the invoice list on `/invoices`

- **Then:**
  - Row for that invoice shows: invoice number "INV-2026-0001"
  - Row shows client name "Acme Corp"
  - Row shows total amount "$1,500.00" (or "1,500.00")
  - Row shows issue date in a human-readable format (e.g., "15 Mar 2026" or "03/15/2026")
  - Row shows status badge/label "sent" (or equivalent display text)

---

### Scenario 3: Invoices are sorted newest first by default

**Type:** Positive
**Priority:** High

- **Given:**
  - User has 3 invoices with `created_at`: Invoice A (2026-03-01), Invoice B (2026-03-10), Invoice C (2026-03-20)

- **When:**
  - User navigates to `/invoices` without applying any sort

- **Then:**
  - First row displays Invoice C (most recent, 2026-03-20)
  - Second row displays Invoice B (2026-03-10)
  - Third row displays Invoice A (oldest, 2026-03-01)

---

### Scenario 4: Empty state with CTA when user has no invoices

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User is authenticated
  - User has **zero** invoices in `invoices` table

- **When:**
  - User navigates to `/invoices`

- **Then:**
  - Empty state component is visible (`data-testid="invoice-empty-state"`)
  - No invoice rows are rendered
  - A call-to-action button is visible (e.g., "Create your first invoice" or similar)
  - CTA button is interactive and navigates to the invoice creation flow on click
  - **⚠️ NOTE:** Exact CTA button text and destination URL need PO/Dev confirmation.

---

### Scenario 5: Pagination triggers when user has more than 20 invoices

**Type:** Positive / Boundary
**Priority:** High

- **Given:**
  - User has **21** invoices sorted by `created_at DESC`

- **When:**
  - User navigates to `/invoices`

- **Then:**
  - First page shows exactly **20** invoice rows
  - 21st invoice is **not** visible on page 1
  - A pagination control OR scroll-triggered load mechanism is present
  - **⚠️ NOTE:** Exact UI component (prev/next buttons vs infinite scroll) depends on Dev decision — needs clarification before writing precise assertions.

---

### Scenario 6: Exactly 20 invoices — boundary for pagination

**Type:** Boundary
**Priority:** High

- **Given:**
  - User has **exactly 20** invoices

- **When:**
  - User navigates to `/invoices`

- **Then:**
  - All 20 invoices are visible on page 1
  - No "next page" control is visible (or scroll does not trigger additional load)
  - Total count indicator (if present) shows "20"

---

### Scenario 7: Single invoice displays correctly

**Type:** Boundary
**Priority:** Medium

- **Given:**
  - User has **exactly 1** invoice

- **When:**
  - User navigates to `/invoices`

- **Then:**
  - List shows 1 row (no empty state shown)
  - No pagination controls visible
  - All 5 required columns are populated

---

### Scenario 8: Invoice with zero total amount displays correctly

**Type:** Boundary / Edge Case
**Priority:** Medium

- **Given:**
  - User has an invoice with `total = 0.00`

- **When:**
  - User views the invoice list

- **Then:**
  - Amount column shows `$0.00` (not blank, not null, not an error)

---

### Scenario 9: Unauthenticated user cannot access invoice page (UI redirect)

**Type:** Negative
**Priority:** Critical

- **Given:**
  - No valid session exists (user is logged out)

- **When:**
  - User navigates to `/invoices`

- **Then:**
  - User is redirected to `/login` (or equivalent auth page)
  - Invoice list is **not** rendered

---

### Scenario 10: GET /api/invoices returns 401 for unauthenticated request

**Type:** Negative
**Priority:** Critical

- **Given:**
  - No `Authorization: Bearer <token>` header in API request

- **When:**
  - `GET /api/invoices` is called without authentication

- **Then:**
  - Response status: `401 Unauthorized`
  - Response body: `{ "success": false, "error": { "code": "UNAUTHORIZED", ... } }`
  - No invoice data is returned

---

### Scenario 11: User cannot access another user's invoices via API (RLS)

**Type:** Negative
**Priority:** Critical

- **Given:**
  - User A and User B both have invoices
  - User A is authenticated with their valid token

- **When:**
  - `GET /api/invoices` is called with User A's token

- **Then:**
  - Response includes **only** User A's invoices
  - User B's invoices are **not** present in the response
  - Response status: `200 OK` (not an error — just properly scoped results)

---

### Scenario 12: Invalid `status` query parameter returns error

**Type:** Negative
**Priority:** Medium

- **Given:**
  - User is authenticated

- **When:**
  - `GET /api/invoices?status=invalid_status` is called

- **Then:**
  - Response status: `400 Bad Request` or `422 Unprocessable Entity`
  - Response body contains error description for invalid enum value

---

---

## 🧪 Step 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 14

**Breakdown:**

- Positive: 4 test cases
- Negative: 3 test cases
- Boundary: 2 test cases
- Integration: 3 test cases
- API: 2 test cases

**Rationale for This Number:**
Aligned with Feature Test Plan estimate for SQ-47. The story is display-only with no complex business logic, so fewer negatives than a form story. Integration tests cover the critical UI↔API data mapping. API tests cover contract and RLS. The two pending ambiguities (pagination type, column format) will generate additional test cases when resolved.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

---

**Parametrized Test Group 1:** Invoice row column rendering by status

- **Base Scenario:** Each invoice row must display all 5 columns correctly regardless of invoice status
- **Parameters to Vary:** `status` value and expected display text/badge color

| invoice_number   | total   | status      | Expected Status Display |
|-----------------|---------|-------------|-------------------------|
| INV-2026-0001   | 1500.00 | draft       | "Draft" / grey badge    |
| INV-2026-0002   | 800.00  | sent        | "Sent" / blue badge     |
| INV-2026-0003   | 2400.00 | paid        | "Paid" / green badge    |
| INV-2026-0004   | 350.00  | overdue     | "Overdue" / red badge   |
| INV-2026-0005   | 0.00    | cancelled   | "Cancelled" / grey badge|

**Total Tests from Parametrization:** 5 (combined into 1 parametrized test)
**Benefit:** Validates all status variants with one test function instead of 5 separate tests. Also ensures status badge color mapping is correct.

---

**Parametrized Test Group 2:** Pagination boundary values for GET /api/invoices

- **Base Scenario:** API returns correct count and pagination metadata
- **Parameters to Vary:** number of invoices vs expected `totalPages`

| Total Invoices | page | limit | Expected items returned | Expected totalPages |
|---------------|------|-------|------------------------|---------------------|
| 0             | 1    | 20    | 0                      | 0 (or 1)            |
| 1             | 1    | 20    | 1                      | 1                   |
| 20            | 1    | 20    | 20                     | 1                   |
| 21            | 1    | 20    | 20                     | 2                   |
| 21            | 2    | 20    | 1                      | 2                   |
| 40            | 1    | 20    | 20                     | 2                   |

**Total Tests from Parametrization:** 6 dataset rows → 1 parametrized API test
**Benefit:** Covers all critical pagination boundary conditions systematically.

---

### Test Outlines

---

#### Should display invoice dashboard with all required columns when user has invoices

**Related Scenario:** Scenarios 1 + 2
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E (UI)
**Parametrized:** ✅ Yes (Group 1 — status variants)

---

**Preconditions:**

- User `test-carlos@soloq.app` exists and is authenticated in staging
- 5 invoices exist for this user, one per status (draft, sent, paid, overdue, cancelled)
- Each invoice has: `invoice_number`, `client_name`, `total`, `issue_date`, `status` populated

---

**Test Steps:**

1. Navigate to `/invoices` as authenticated user `test-carlos@soloq.app`
2. Wait for invoice list to load (`data-testid="invoice-list"` is visible)
3. Verify 5 invoice rows are rendered
4. For each row, assert columns: invoice_number, client name, amount, date, status badge
   - **Verify:** All 5 columns are non-empty for each row

---

**Expected Result:**

- **UI:**
  - Invoice list visible with 5 rows
  - Each row shows correct invoice_number, client_name, formatted amount, formatted date, status label
  - Status badges: draft=grey, sent=blue, paid=green, overdue=red, cancelled=grey (or equivalent design)
- **API Response (underlying):**
  - Status Code: `200 OK`
  - `invoices` array contains 5 items with matching data

---

**Test Data:**

```json
{
  "user": { "email": "test-carlos@soloq.app" },
  "invoices": [
    { "invoice_number": "INV-2026-T001", "client_name": "Acme Corp", "total": 1500.00, "issue_date": "2026-03-01", "status": "draft" },
    { "invoice_number": "INV-2026-T002", "client_name": "Beta LLC", "total": 800.00, "issue_date": "2026-03-05", "status": "sent" },
    { "invoice_number": "INV-2026-T003", "client_name": "Gamma SA", "total": 2400.00, "issue_date": "2026-03-10", "status": "paid" },
    { "invoice_number": "INV-2026-T004", "client_name": "Delta Inc", "total": 350.00, "issue_date": "2026-02-01", "status": "overdue" },
    { "invoice_number": "INV-2026-T005", "client_name": "Epsilon Co", "total": 0.00, "issue_date": "2026-01-15", "status": "cancelled" }
  ]
}
```

---

**Post-conditions:**

- No test data changes (read-only test)
- Test user data cleaned up after suite

---

#### Should display invoices sorted newest first by default when no sort is applied

**Related Scenario:** Scenario 3
**Type:** Positive
**Priority:** High
**Test Level:** E2E (UI) + API
**Parametrized:** ❌ No

---

**Preconditions:**

- User has 3 invoices with different `created_at` timestamps:
  - Invoice A: `created_at = "2026-03-01T10:00:00Z"`
  - Invoice B: `created_at = "2026-03-10T10:00:00Z"`
  - Invoice C: `created_at = "2026-03-20T10:00:00Z"` (newest)

---

**Test Steps:**

1. Navigate to `/invoices` without any sort query params
2. Wait for invoice list to render
3. Read invoice_number from row 1, row 2, row 3
   - **Verify:** Row 1 = Invoice C (newest), Row 2 = Invoice B, Row 3 = Invoice A (oldest)

---

**Expected Result:**

- **UI:** Rows appear in descending `created_at` order
- **API Response:**
  - `GET /api/invoices` (no params) returns invoices with first item having latest `created_at`
  - Default `sortBy=created_at`, `sortOrder=desc` confirmed in response or from behavior

---

**Test Data:**

```json
{
  "user": { "email": "test-sort@soloq.app" },
  "invoices": [
    { "invoice_number": "INV-A", "created_at": "2026-03-01T10:00:00Z" },
    { "invoice_number": "INV-B", "created_at": "2026-03-10T10:00:00Z" },
    { "invoice_number": "INV-C", "created_at": "2026-03-20T10:00:00Z" }
  ]
}
```

---

**Post-conditions:** Read-only, no cleanup needed beyond test user.

---

#### Should show empty state with CTA when user has no invoices

**Related Scenario:** Scenario 4
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E (UI)
**Parametrized:** ❌ No

---

**Preconditions:**

- User `test-empty@soloq.app` is authenticated
- User has **zero** invoices in `invoices` table

---

**Test Steps:**

1. Navigate to `/invoices` as `test-empty@soloq.app`
2. Wait for page load
3. Assert: invoice list table/rows are **NOT** visible
   - **Verify:** `data-testid="invoice-empty-state"` is visible
4. Assert: CTA button is visible and has invoice creation label
5. Click the CTA button
   - **Verify:** URL changes to invoice creation route (e.g., `/invoices/new`)

---

**Expected Result:**

- **UI:**
  - Empty state component visible
  - No invoice rows rendered
  - CTA button present and functional
  - Click navigates to invoice creation

---

**Test Data:**

```json
{
  "user": { "email": "test-empty@soloq.app" },
  "invoices": []
}
```

---

**Post-conditions:** No changes made, read-only navigation test.

---

#### Should display only page 1 with 20 invoices when user has 21 invoices

**Related Scenario:** Scenarios 5 + 6
**Type:** Boundary
**Priority:** High
**Test Level:** E2E (UI) + API
**Parametrized:** ✅ Yes (Group 2 — pagination boundary values)

---

**Preconditions:**

- User has **21** invoices, all with different `created_at` values
- Invoice #21 (oldest) has a unique `invoice_number = "INV-OLDEST"`

---

**Test Steps:**

1. Navigate to `/invoices`
2. Count visible invoice rows
   - **Verify:** Exactly 20 rows visible
3. Assert invoice "INV-OLDEST" (21st) is **not** present on page 1
4. Assert pagination control is present (if pagination) OR scroll does not auto-load 21st invoice (if infinite scroll)

---

**Expected Result:**

- **UI:** 20 rows visible, 21st not shown, pagination/scroll mechanism present
- **API Response:**
  - `GET /api/invoices?page=1&limit=20` → `{ total: 21, page: 1, totalPages: 2, invoices: [20 items] }`

---

**Test Data:**

```json
{
  "user": { "email": "test-pagination@soloq.app" },
  "invoices_count": 21,
  "oldest_invoice_number": "INV-OLDEST"
}
```

---

**Post-conditions:** No changes, read-only.

---

#### Should return 401 when API is called without authentication token

**Related Scenario:** Scenario 10
**Type:** Negative
**Priority:** Critical
**Test Level:** API
**Parametrized:** ❌ No

---

**Preconditions:**

- No Authorization header set in request

---

**Test Steps:**

1. Send `GET /api/invoices` without `Authorization: Bearer <token>` header
2. Check response status code
   - **Verify:** `401 Unauthorized`
3. Check response body
   - **Verify:** `success: false`, error code indicates unauthorized

---

**Expected Result:**

- **API Response:**
  - Status Code: `401 Unauthorized`
  - Response Body:
    ```json
    {
      "success": false,
      "error": {
        "code": "UNAUTHORIZED",
        "message": "Authentication required"
      }
    }
    ```
- **Database:** No query executed (RLS blocks at auth level)

---

**Test Data:**

```json
{
  "request": {
    "headers": {}
  }
}
```

---

**Post-conditions:** No state changes.

---

#### Should return only the authenticated user's invoices and not other users' invoices (RLS)

**Related Scenario:** Scenario 11
**Type:** Negative (Security / RLS)
**Priority:** Critical
**Test Level:** API + Integration
**Parametrized:** ❌ No

---

**Preconditions:**

- User A (`test-user-a@soloq.app`) has 3 invoices with invoice numbers `INV-A-001`, `INV-A-002`, `INV-A-003`
- User B (`test-user-b@soloq.app`) has 2 invoices with invoice numbers `INV-B-001`, `INV-B-002`
- User A is authenticated (valid token available)

---

**Test Steps:**

1. Call `GET /api/invoices` with User A's Bearer token
2. Check response status
   - **Verify:** `200 OK`
3. Check `invoices` array in response
   - **Verify:** Contains only invoices with `user_id = User A's ID`
   - **Verify:** `invoices` array has exactly 3 items
4. Assert none of User B's invoice numbers appear
   - **Verify:** `INV-B-001` and `INV-B-002` are NOT in the response array

---

**Expected Result:**

- **API Response:**
  - Status Code: `200 OK`
  - `invoices` contains only INV-A-001, INV-A-002, INV-A-003
  - No cross-user data leakage
- **Database:** RLS policy `WHERE user_id = auth.uid()` enforced correctly

---

**Test Data:**

```json
{
  "userA": { "email": "test-user-a@soloq.app", "invoices": ["INV-A-001", "INV-A-002", "INV-A-003"] },
  "userB": { "email": "test-user-b@soloq.app", "invoices": ["INV-B-001", "INV-B-002"] }
}
```

---

**Post-conditions:** No changes, read-only security test.

---

#### Should return 400 when an invalid status enum value is passed as query param

**Related Scenario:** Scenario 12
**Type:** Negative
**Priority:** Medium
**Test Level:** API
**Parametrized:** ❌ No

---

**Preconditions:**

- User is authenticated

---

**Test Steps:**

1. Call `GET /api/invoices?status=hacked` with valid Bearer token
2. Check response status
   - **Verify:** `400 Bad Request` (or `422`)
3. Check response body for error details

---

**Expected Result:**

- **API Response:**
  - Status Code: `400 Bad Request`
  - Response Body:
    ```json
    {
      "success": false,
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid status value. Must be one of: all, draft, sent, paid, overdue"
      }
    }
    ```

---

**Test Data:**

```json
{
  "queryParams": { "status": "hacked" }
}
```

---

**Post-conditions:** No state changes.

---

#### Should return correct pagination metadata for boundary invoice counts

**Related Scenario:** Parametrized Group 2
**Type:** Boundary
**Priority:** High
**Test Level:** API
**Parametrized:** ✅ Yes (Group 2)

---

**Preconditions:**

- Test user seeded with invoice counts per row in parametrize table

---

**Test Steps (per parametrized row):**

1. Seed user with N invoices
2. Call `GET /api/invoices?page={page}&limit=20` with valid token
3. Assert `invoices` array length = expected items returned
4. Assert `total` = N
5. Assert `totalPages` = expected totalPages

---

**Expected Result (per row):** See Parametrized Test Group 2 table above.

---

#### Should render invoice list data consistent with GET /api/invoices response (Frontend ↔ API Integration)

**Related Scenario:** Integration — UI data mapping
**Type:** Integration
**Priority:** High
**Test Level:** Integration (UI + API)
**Parametrized:** ❌ No

---

**Preconditions:**

- User has 5 known invoices in staging DB
- Expected values for all 5 columns per row are documented in test data

---

**Test Flow:**

1. Call `GET /api/invoices` via API → capture full response body
2. Navigate to `/invoices` in browser
3. For each invoice in API response, find matching row in UI
4. Assert UI row values match API response field values (invoice_number, client_name, total, issue_date, status)

**Contract Validation (based on api-contracts.yaml `InvoiceListItem` schema):**

- Request format matches OpenAPI spec: ✅ Yes
- Response format matches OpenAPI spec: ✅ Yes
- Pagination fields present (`total`, `page`, `totalPages`): ✅ Yes

**Expected Result:**

- UI renders exactly what the API returns
- No data transformation errors (e.g., amount not accidentally doubled, dates not shifted by timezone)
- Status values map correctly to display labels

---

#### Should load invoice list from API and display within performance threshold

**Related Scenario:** NFR-P-001, NFR-P-002
**Type:** Integration (Non-functional)
**Priority:** Medium
**Test Level:** E2E + API Performance

---

**Preconditions:**

- Staging environment active
- User has 20 invoices (full first page)

---

**Test Steps:**

1. Measure `GET /api/invoices` response time (p95)
   - **Verify:** < 500ms
2. Load `/invoices` page and measure LCP via Lighthouse/Web Vitals
   - **Verify:** LCP < 2.0s, TTI < 3.0s

---

**Expected Result:**

- API p95 < 500ms for base list without filters
- LCP < 2.0s on desktop with 20 invoices loaded

---

#### Should display invoice list correctly on mobile viewport (Responsive)

**Related Scenario:** Scope — "Responsive design for mobile"
**Type:** Positive
**Priority:** Medium
**Test Level:** UI (Mobile)
**Parametrized:** ❌ No

---

**Preconditions:**

- Browser viewport: 375px × 812px (iPhone-like)
- User has 5 invoices

---

**Test Steps:**

1. Open `/invoices` at 375px viewport width
2. Verify list is visible and not horizontally overflowing
3. Check that all 5 required columns are either visible or accessible (e.g., card layout vs table)
4. Verify CTA (if empty state) is fully tappable (min 44px touch target)

---

**Expected Result:**

- **UI:** No horizontal scroll overflow
- All columns accessible (either in table or card format)
- No elements cut off or invisible

---

---

## 🔗 Integration Test Cases

### Integration Test 1: Frontend ↔ GET /api/invoices — Data Contract Validation

**Integration Point:** Frontend `/invoices` page → `GET /api/invoices`
**Type:** Integration
**Priority:** High

**Preconditions:**

- Backend API running in staging
- User has at least 3 known invoices

**Test Flow:**

1. Frontend renders `/invoices`, triggering `GET /api/invoices`
2. API responds with `{ success, invoices[], total, page, totalPages }`
3. Frontend maps `invoices[].invoice_number` → invoice number column
4. Frontend maps `invoices[].total` → amount column
5. Frontend maps `invoices[].issue_date` → date column
6. Frontend maps `invoices[].status` → status column

**Contract Validation:**

- Request format matches OpenAPI spec: ✅ Yes (`GET /api/invoices` with BearerAuth)
- Response format matches OpenAPI spec: ✅ Yes (InvoiceListItem schema)
- Status codes match spec: ✅ 200 for success, 401 for unauth

**Expected Result:**

- All field mappings correct — no field left empty due to key mismatch
- `totalPages` used to render pagination correctly

---

### Integration Test 2: RLS Enforcement — API + Database

**Integration Point:** `GET /api/invoices` → Supabase PostgreSQL with RLS
**Type:** Integration
**Priority:** Critical

**Test Flow:**

1. User A calls `GET /api/invoices` with their token
2. Supabase resolves `auth.uid()` from JWT
3. PostgreSQL executes query with implicit `WHERE user_id = auth.uid()`
4. API returns only User A's rows

**Expected Result:**

- Zero cross-user data leakage
- DB query plans confirm RLS filter applied

---

### Integration Test 3: Empty state consistency — API `total: 0` → UI empty state

**Integration Point:** API `total: 0` response → UI empty state render
**Type:** Integration
**Priority:** High

**Test Flow:**

1. User with 0 invoices calls `GET /api/invoices`
2. API returns `{ success: true, invoices: [], total: 0, page: 1, totalPages: 0 }`
3. Frontend receives `total: 0` / empty array
4. Frontend renders empty state component (not table)

**Expected Result:**

- `invoices: []` correctly triggers empty state — not a loading error
- No "undefined" or null rendering errors

---

## 📊 Edge Cases Summary

| Edge Case                                    | Covered in Original Story? | Added to Refined AC?        | Test Case                                    | Priority |
|----------------------------------------------|-----------------------------|------------------------------|----------------------------------------------|----------|
| Exactly 20 invoices (pagination boundary)   | ❌ No                       | ✅ Yes (Scenario 6)          | Should display only page 1 with 20 invoices | High     |
| Zero-amount invoice ($0.00)                 | ❌ No                       | ✅ Yes (Scenario 8)          | Column rendering parametrized group 1       | Medium   |
| Long client name truncation                  | ❌ No                       | ⚠️ Needs PO confirmation    | TBD after design confirmation               | Medium   |
| API error / network failure                  | ❌ No                       | ⚠️ Needs PO/Dev (gap 1)     | TBD after error state AC added             | Medium   |
| Unauthenticated redirect to login            | ❌ No                       | ✅ Yes (Scenario 9)          | Should redirect when not authenticated      | Critical |
| RLS cross-user isolation                     | ❌ No                       | ✅ Yes (Scenario 11)         | RLS integration test                        | Critical |
| Pagination vs infinite scroll ambiguity     | ✅ Yes (via "OR")           | ⚠️ Pending Dev answer       | Scenario 5 (partial — needs clarification) | High     |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type       | Count | Purpose             | Examples                                                   |
|-----------------|-------|---------------------|------------------------------------------------------------|
| Valid data      | 5     | Positive tests      | One invoice per status, known invoice_number/client values |
| Invalid data    | 2     | Negative/API tests  | No auth token, invalid status="hacked"                    |
| Boundary values | 6     | Pagination/amount   | 0, 1, 20, 21 invoices; total=$0.00; total very large      |
| Edge case data  | 2     | Edge case tests     | Long client name (80+ chars), cross-user invoices (User B)|

### Data Generation Strategy

**Static Test Data:**
- Invoice numbers: `INV-2026-T001` through `INV-2026-T005` (known values for column assertions)
- Cross-user test users: `test-user-a@soloq.app`, `test-user-b@soloq.app`
- Pagination user: `test-pagination@soloq.app` with exactly 21 invoices

**Dynamic Test Data (using Faker.js):**
- Client names: `faker.company.name()`
- Issue dates: `faker.date.between({ from: '2026-01-01', to: '2026-03-24' })`
- Totals: `faker.number.float({ min: 0, max: 9999, fractionDigits: 2 })`

**Test Data Cleanup:**

- ✅ All test data is cleaned up after test execution
- ✅ Tests are idempotent (seed → test → teardown)
- ✅ Tests do not depend on execution order (each test seeds its own user/invoices)

---

## 📝 PART 2: Jira Actions

> **Step 5:** Story SQ-47 updated in Jira with refined AC and label `shift-left-reviewed`.
> **Step 6:** Test cases posted as comment on SQ-47 in Jira.

---

## 📢 Step 8: Final QA Feedback Report

### Executive Summary

SQ-47 is the **foundation story** of EPIC-SQ-38. It is 80% testable as written, but has **2 critical blockers** and **3 gaps** that must be resolved before development starts to avoid rework.

### Critical Blockers (Must Resolve Before Dev)

| # | Blocker | Action Required | Owner |
|---|---------|----------------|-------|
| 1 | Pagination vs infinite scroll unresolved (AC 5 uses "OR") | Dev must confirm implementation pattern | Dev Lead |
| 2 | CTA button text and destination URL not specified | PO must confirm exact text and route | PO |

### Gaps (Should Resolve Before Testing)

| # | Gap | Suggested Fix |
|---|-----|--------------|
| 1 | No error state for failed API call | Add AC for error state with retry button |
| 2 | Default sort not in AC (only in Scope) | Promote to explicit AC |
| 3 | Column name inconsistency (AC: "amount/date" vs Scope: "total/issue_date") | Standardize to Scope naming in AC |

### Test Coverage Ready

- **14 test outlines** designed covering: 4 positive, 3 negative, 2 boundary, 3 integration, 2 API
- **2 parametrized groups** for status variants and pagination boundaries
- RLS security test included as Critical priority
- Performance and mobile responsiveness included as Medium

### Dependencies

- Blocked by: EPIC-SQ-20 (invoice creation) — needs at least one invoice to exist for positive tests
- Blocks: SQ-48 (Filter by Status) — base list must work before filter stories

### Recommended Next Steps

1. Dev Lead confirms pagination vs infinite scroll → Unblocks AC 5 test design
2. PO confirms empty state CTA text + route → Unblocks AC 4 UI assertion
3. PO adds error state AC to story
4. QA prepares test data factories for 3 user personas (empty, 5 invoices, 21 invoices)
5. Story enters Ready for Dev only after blockers #1 and #2 resolved

---

**Documentation:** `.context/PBI/epics/EPIC-SQ-38-dashboard-tracking/stories/STORY-SQ-47-invoice-dashboard/acceptance-test-plan.md`
