# Comments for SQ-47

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-47)

---

### Alfonso Hernandez - 2026-03-24T07:13:58.486Z

## 🧪 Shift-Left QA — Acceptance Test Plan

**Date:** 2026-03-24 | **QA:** Alfonso Hernandez | **Status:** Draft

---

## 📋 Step 1: Critical Analysis Summary

**Personas Affected:** Carlos (primary), Andrés, Valentina

**Business Value:** Entry point of Journey 2 (Seguimiento y Cobro). Foundation for all stories in SQ-38 — if this breaks, all filters, search and summary stories break too.

**API:** `GET /api/invoices` — params: page, limit, sortBy, sortOrder | Response: `{ success, invoices[], total, page, totalPages }`

---

## 🚨 Step 2: Story Quality Analysis

### Ambiguities

| # | Ambiguity | Impact | Owner |
| --- | --- | --- | --- |
| 1 | AC-5 says "paginated OR infinitely scrolled" — two mutually exclusive UX patterns | **Blocks** UI test design for AC-5 | @Dev |
| 2 | AC-3 says "amount/date" but Scope says `total/issue_date` — inconsistent naming | Column assertion mismatch risk | @Dev |
| 3 | AC-2 says "all my invoices" — unclear if `draft` and `cancelled` are included | Test dataset design blocked | @PO |

### Gaps

| # | Gap | Suggested Fix |
| --- | --- | --- |
| 1 | No error state AC for failed API call | Add AC: error state with retry button |
| 2 | Default sort only in Scope, not in AC | Promote to AC-6 (added in refinement) |
| 3 | Empty state CTA text and destination URL not specified | PO must define: text + target route |

### Edge Cases Added (not in original story)

- Exactly 20 invoices (boundary for pagination)
- Invoice with total = $0.00
- Unauthenticated redirect to login
- RLS cross-user isolation

---

## ✅ Step 3: Refined Acceptance Criteria

**AC-1 (refined):** Given logged in → navigate to `/invoices` → invoice list container visible (`data-testid="invoice-list"`), page loads HTTP 200.

**AC-2 (refined):** Given user has invoices → view dashboard → list shows all invoices with columns: invoice_number, client_name, total (currency format), issue_date (human-readable), status (badge).

**AC-3 (refined):** Given view invoice list → look at each row → exactly 5 columns visible and non-empty per row.

**AC-4 (refined):** Given 0 invoices → view dashboard → empty state component visible (`data-testid="invoice-empty-state"`), no rows rendered, CTA button present and navigates to invoice creation. ⚠️ Exact text/route pending PO.

**AC-5 (refined):** Given 21+ invoices → view dashboard → page 1 shows exactly 20 rows, 21st not visible, pagination/scroll mechanism present. ⚠️ Exact UI pattern pending Dev.

**AC-6 (NEW):** Given invoice list viewed with no sort applied → invoices sorted by `created_at DESC` (newest first).

---

## 🧪 Step 4: Test Outlines

**Total: 14 test cases** | Positive: 4 | Negative: 3 | Boundary: 2 | Integration: 3 | API: 2

---

### ✅ Positive Tests

**TC-P01 — Should display invoice dashboard with all required columns when user has invoices**

- **Priority:** Critical | **Level:** E2E (UI) | **Parametrized:** Yes (Group 1 — status variants)
- **Preconditions:** User has 5 invoices, one per status (draft, sent, paid, overdue, cancelled)
- **Steps:** Navigate to `/invoices` → wait for list → verify 5 rows with all 5 columns per row
- **Expected:** All columns non-empty; status badges display correctly per status
- **Test Data:**

```json
[
  { "invoice_number": "INV-T001", "client_name": "Acme Corp", "total": 1500.00, "issue_date": "2026-03-01", "status": "draft" },
  { "invoice_number": "INV-T002", "client_name": "Beta LLC", "total": 800.00, "issue_date": "2026-03-05", "status": "sent" },
  { "invoice_number": "INV-T003", "client_name": "Gamma SA", "total": 2400.00, "issue_date": "2026-03-10", "status": "paid" },
  { "invoice_number": "INV-T004", "client_name": "Delta Inc", "total": 350.00, "issue_date": "2026-02-01", "status": "overdue" },
  { "invoice_number": "INV-T005", "client_name": "Epsilon Co", "total": 0.00, "issue_date": "2026-01-15", "status": "cancelled" }
]
```

---

**TC-P02 — Should sort invoices newest first by default when no sort param is applied**

- **Priority:** High | **Level:** E2E (UI) + API
- **Preconditions:** User has 3 invoices: INV-A (2026-03-01), INV-B (2026-03-10), INV-C (2026-03-20)
- **Steps:** Navigate to `/invoices` without sort params → verify row 1 = INV-C, row 2 = INV-B, row 3 = INV-A
- **Expected:** Descending `created_at` order confirmed in both UI and API response

---

**TC-P03 — Should show empty state with CTA when user has no invoices**

- **Priority:** Critical | **Level:** E2E (UI)
- **Preconditions:** User has 0 invoices
- **Steps:** Navigate to `/invoices` → verify no rows → verify `data-testid="invoice-empty-state"` visible → verify CTA button visible → click CTA → verify navigation to invoice creation
- **Expected:** Empty state visible, CTA present and functional

---

**TC-P04 — Should display invoice list correctly on mobile viewport (375px)**

- **Priority:** Medium | **Level:** UI (Mobile)
- **Preconditions:** User has 5 invoices, viewport = 375×812px
- **Steps:** Open `/invoices` at 375px → verify no horizontal overflow → verify all columns accessible
- **Expected:** Responsive layout, no overflow, all data accessible

---

### ❌ Negative Tests

**TC-N01 — Should return 401 when API is called without authentication token**

- **Priority:** Critical | **Level:** API
- **Steps:** `GET /api/invoices` (no Authorization header) → verify 401
- **Expected:**

```json
{ "success": false, "error": { "code": "UNAUTHORIZED" } }
```

---

**TC-N02 — Should return only the authenticated user's invoices and not other users' invoices (RLS)**

- **Priority:** Critical | **Level:** API + Integration
- **Preconditions:** User A has INV-A-001/002/003; User B has INV-B-001/002
- **Steps:** Call `GET /api/invoices` with User A's token → verify 3 results → verify INV-B-001 and INV-B-002 are NOT in response
- **Expected:** `200 OK`, only User A's invoices, zero cross-user leakage

---

**TC-N03 — Should return 400 when invalid status enum value is passed as query param**

- **Priority:** Medium | **Level:** API
- **Steps:** `GET /api/invoices?status=hacked` with valid token → verify 400
- **Expected:**

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Invalid status value. Must be one of: all, draft, sent, paid, overdue" } }
```

---

### 🔢 Boundary Tests

**TC-B01 — Should display only page 1 with 20 invoices when user has 21 invoices**

- **Priority:** High | **Level:** E2E (UI) + API | **Parametrized:** Yes (Group 2)
- **Preconditions:** User has 21 invoices; oldest is "INV-OLDEST"
- **Steps:** Navigate to `/invoices` → count rows → verify exactly 20 → verify INV-OLDEST not visible → verify pagination/scroll mechanism present
- **API check:** `GET /api/invoices?page=1&limit=20` → `{ total: 21, page: 1, totalPages: 2 }`

| Total | page | limit | Expected items | Expected totalPages |
| --- | --- | --- | --- | --- |
| 0 | 1 | 20 | 0 | 0 or 1 |
| 1 | 1 | 20 | 1 | 1 |
| 20 | 1 | 20 | 20 | 1 |
| 21 | 1 | 20 | 20 | 2 |
| 21 | 2 | 20 | 1 | 2 |

---

**TC-B02 — Should display all 20 invoices on page 1 with no next-page control when user has exactly 20 invoices**

- **Priority:** High | **Level:** E2E (UI)
- **Preconditions:** User has exactly 20 invoices
- **Steps:** Navigate to `/invoices` → count 20 rows → verify no next-page control visible
- **Expected:** All 20 shown, no pagination trigger

---

### 🔗 Integration Tests

**TC-I01 — Should render invoice list data consistent with GET /api/invoices response (Frontend ↔ API)**

- **Priority:** High | **Level:** Integration
- **Steps:** Call `GET /api/invoices` → capture response → navigate to `/invoices` → assert each row matches API response fields
- **Expected:** invoice_number, client_name, total, issue_date, status all match between API and UI

---

**TC-I02 — Should return only authenticated user's invoices via RLS at DB level**

- **Priority:** Critical | **Level:** Integration (API + DB)
- **Steps:** User A calls API → verify Supabase RLS enforces `WHERE user_id = auth.uid()` → no cross-user rows
- **Expected:** Zero cross-user data leakage at DB level

---

**TC-I03 — Should render empty state when API returns total:0 and empty invoices array**

- **Priority:** High | **Level:** Integration
- **Steps:** User with 0 invoices → API returns `{ invoices: [], total: 0 }` → verify UI shows empty state (not error, not crash)
- **Expected:** Empty state component rendered correctly

---

## 📊 Parametrization Groups

**Group 1 — Status column display (5 parametrized rows):**

| status | Expected badge/label |
| --- | --- |
| draft | "Draft" / grey |
| sent | "Sent" / blue |
| paid | "Paid" / green |
| overdue | "Overdue" / red |
| cancelled | "Cancelled" / grey |

**Group 2 — Pagination boundaries (5 parametrized rows):** See TC-B01 table above.

---

## 📢 Action Required

| Owner | Action |
| --- | --- |
| **@Dev** | Confirm: pagination (prev/next controls) OR infinite scroll? |
| **@PO** | Confirm: empty state CTA button text + destination URL |
| **@PO** | Confirm: does base list include `draft` and `cancelled` status invoices? |
| **@Dev** | Add `data-testid` to: `invoice-list`, `invoice-row`, `invoice-empty-state`, pagination controls |
| **@PO/@Dev** | Add error state AC (network failure / API 5xx) |

---

*Shift-Left QA completed 2026-03-24 | acceptance-test-plan.md saved locally*

---

### Alfonso Hernandez - 2026-03-24T07:19:49.078Z

Notas adicionales:

- La paginacion sera (prev/next controls).
- Definir al momento del desarrollo el mejor y mas profesional texto de empty state.

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-28T23:27:58.492Z_
