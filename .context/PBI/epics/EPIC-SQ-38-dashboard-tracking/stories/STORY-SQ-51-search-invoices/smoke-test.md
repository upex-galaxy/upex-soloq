# Smoke Test: STORY-SQ-51 - Search Invoices

**Staging URL:** https://staging-upexsoloq.vercel.app
**Date:** 2026-04-03
**QA:** AI-assisted
**Duration target:** 5-10 minutes

---

## Scope (Smoke Only)

- Validate dashboard/list access and search UI availability.
- Validate one minimal search happy path end-to-end.
- Validate basic API/search response behavior from Network tab.

---

## Smoke Checklist

### 1. Basic Access

- [x] Dashboard loads without blocker.
- [x] Invoices list page loads without blocker.
- [x] No critical console errors while opening dashboard/invoices.

### 2. Authentication

- [x] Login works with QA user (`demo@soloq.app`).
- [ ] Session persists after refresh. (not covered in this run)
- [ ] Logout works. (not covered in this run)

### 3. Story Happy Path (SQ-51)

- [x] Search input is visible on invoices context (`invoice-search-input`).
- [x] Entering valid queries works (`INV-2026-20354`, `test client`, `POSTMAN`).
- [x] List updates and shows expected matching invoices.
- [x] Clear search restores default list behavior (returns to `34 facturas encontradas`).

### 4. Backend Integration

- [x] Search request hits API endpoint successfully.
- [x] Response status is successful (all observed `200`).
- [x] UI results are consistent with API response payload for tested queries.

---

## Current Result

- **Status:** PASSED (Go for exploratory on SQ-51)
- **Observed issue (non-blocking for smoke, blocking for AC precision):** no-results query (`zzzz-not-found`) renders empty-account style message (`No tienes facturas aun`) instead of a differentiated no-results state.
- **Placement clarification (from manual cross-check):** search box is implemented in `/invoices`, not in `/dashboard` header.
- **Evidence highlights:**
  - `GET /api/invoices?search=INV-2026-20354...` -> `200`
  - `GET /api/invoices?search=test+client...` -> `200`
  - `GET /api/invoices?search=POSTMAN...` -> `200`
  - `GET /api/invoices?search=zzzz-not-found...` -> `200`
  - Console errors: `0`

### Scenario Cross-Check (Manual vs MCP)

- Scenario 1 (search box visible): **PASS with clarification** (visible in `Invoices`, not `Dashboard`).
- Scenario 2 (search by invoice number): **PASS**.
- Scenario 3 (search by client name): **PASS**.
- Scenario 4 (partial match): **PASS**.
- Scenario 5 (no results): **Functional PASS** (`0 facturas encontradas`) + **UX discrepancy** (empty-state style heading).
- Scenario 6 (clear search): **PASS**.

---

## Go / No-Go

- [x] **PASSED:** continue with SQ-51 exploratory decision matrix.
- [ ] **FAILED:** report blocker and pause SQ-51 exploratory.
