# Smoke Test: STORY-SQ-55 - Payment Amount

**Staging URL:** https://staging-upexsoloq.vercel.app
**Date:** 2026-04-03
**QA:** AI-assisted
**Duration target:** 5-10 minutes

---

## Scope (Smoke Only)

- Validate deployment is reachable and stable.
- Validate login screen is available.
- Validate minimum happy path readiness for payment amount flow.
- Defer edge cases and deep validations to exploratory session.

---

## Smoke Checklist

### 1. Basic Access

- [x] Application loads without 500/404 blocker (`/` reachable).
- [x] Login route loads without blocker (`/login` reachable).
- [x] No console error detected during quick access check.

### 2. Authentication

- [x] Login with staging QA user (`demo@soloq.app`).
- [ ] Session persists after refresh. (not covered in this run)
- [ ] Logout works. (not covered in this run)

### 3. Happy Path Readiness (SQ-55)

- [x] Navigate to invoices list/dashboard after login.
- [ ] Open an invoice and access payment recording form.
- [ ] Confirm amount field is prefilled with invoice total.
- [ ] Submit full-payment amount and confirm successful flow.

### 4. Backend Integration

- [ ] Payment-related requests return success statuses.
- [ ] No failing API requests in Network tab during happy path.
- [ ] Data reflects correctly after page refresh.

---

## Current Result

- **Status:** BLOCKED (payment precondition unreachable in staging)
- **What passed:** access, login, invoices navigation, and baseline console/API health checks.
- **Blocker (updated):** in manual exploratory on `https://staging-upexsoloq.vercel.app/`, payment flow precondition is unreachable (`invoice` remains in `draft`; no reachable `draft -> sent` path observed), so payment dialog validations cannot be executed end-to-end.

### Additional Evidence (2026-04-03)

- Invoices tab counters show `Enviada: 0`, `Pagada: 0`, `Vencida: 0` for QA user.
- No invoice state eligible to expose `Marcar como Pagada` action.

### Manual Observations Captured (2026-04-02)

- Full payment exact (`total=1500`, `input=1500.00`): **blocked by precondition** (invoice not in `sent`).
- Partial payment: **blocked by precondition**.
- Overpayment: **blocked by precondition**.
- Invalid inputs (`0`, `0.00`, `-100`, `abc`): input control prevents invalid submission; no explicit validation message observed.
- Precision/normalization (`01000`, ` 1000 `, `1000.999`): input normalizes to valid value; no explicit validation message observed.

---

## Go / No-Go

- [ ] **PASSED:** proceed to SQ-55 exploratory testing (UI + API + DB).
- [x] **BLOCKED:** provide reachable `draft -> sent` route or seed `sent/overdue` invoices, then re-run.

---

## Decision Notes for Next Phase (SQ-55)

Once precondition is available, exploratory testing must explicitly capture implementation behavior for open gaps:

1. Partial/overpayment warning behavior (informative vs blocking).
2. Decimal precision and rounding rule.
3. Input normalization (`0`, `0.00`, `01000`, spaces).
4. Prefill rule and currency formatting consistency.
