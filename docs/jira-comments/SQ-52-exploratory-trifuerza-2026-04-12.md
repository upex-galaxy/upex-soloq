# Feature Test Plan: QA Exploratory Trifuerza Update - SQ-52

Environment: `Staging`  
Date: `2026-04-12`

## Scope executed

- Exploratory flow aligned to Fase 10 (`smoke + UI + API + DB`).
- Existing records were reviewed first; targeted seed was applied where historical coverage was missing.
- Seed tag used for traceability: `QA_SEED_STORY_SQ-52_RUN_A1`.
- Cleanup executed at the end (seed records removed).

## DB validation

- Seeded `paid` invoices across 6 months with non-null `paid_at`.
- DB expected monthly totals from `paid_at` seed:
  - 2025-11: `275.00`
  - 2025-12: `250.00`
  - 2026-01: `225.00`
  - 2026-02: `200.00`
  - 2026-03: `175.00`
  - 2026-04: `150.00`
- DB expected `paid_this_month` (by `paid_at`): `150.00`.

## UI/API findings

- Dashboard widgets and trend section rendered correctly at UI level.
- API `/api/invoices/dashboard` returned values inconsistent with `paid_at`-based expectation after seed:
  - `paid_this_month` reported a much higher value (`10949.27`) instead of expected `150.00` from seeded `paid_at` logic.
  - 6-month chart did not reflect seeded historical paid values (months prior to Apr rendered as zero).

## Conclusion

- Result: `FAILED` for monthly summary calculation semantics and trend data consistency.
- Candidate defect type: `Data/Functional` (aggregation source/rule mismatch vs expected `paid_at` behavior).

## Evidence

- Attached screenshot: `qa/artifacts/sq52-dashboard-summary-2026-04-12.png`

## Status recommendation

- Keep `SQ-52` in `In Test` (do not move to `QA Approved`) until defect is triaged/fixed and retested.
