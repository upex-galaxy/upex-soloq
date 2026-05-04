# UI Exploratory Session Notes - SQ-51

**Date:** 2026-04-12
**Story:** SQ-51 - Search invoices by client or number
**Environment:** Staging (`https://staging-upexsoloq.vercel.app`)
**Execution:** Playwright browser automation (headless)

---

## Summary

- **Overall status:** PASSED with known UX defect context
- **Tooling:** Playwright script (`qa/scripts/sq51-ui-exploratory.mjs`)
- **Evidence screenshot:** `qa/artifacts/sq51-ui-exploratory-2026-04-12.png`

---

## Scenarios Executed

1. Search input visible on invoices page -> PASS
2. Exact invoice search (`INV-2026-20354`) -> PASS
3. No-results state rendered with active search (`zzzz-not-found`) -> PASS (rendered)
4. Clear search restores list -> PASS

---

## Observations

- No-results container text captured by Playwright:
  - `No tienes facturas aún Crea tu primera factura para comenzar a facturar a tus clientes. Crear primera factura`
- This remains consistent with `SQ-169` (no-results path still using empty-account copy).

---

## Recommendation

- Keep story in `In Test` until `SQ-169` is fixed and retested for Scenario 5 copy/state separation.
