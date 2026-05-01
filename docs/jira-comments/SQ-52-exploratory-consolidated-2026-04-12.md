# Feature Test Plan: QA Exploratory Trifuerza + Coverage Extension - SQ-52

Environment: `Staging`  
Date: `2026-04-12`

## Scope executed

- Exploratory flow aligned to Fase 10 (`smoke + UI + API + DB`).
- Existing records were reviewed first; targeted seed was applied where data coverage was missing.
- Seed tags used for traceability: `QA_SEED_STORY_SQ-52_RUN_A1`, `QA_SEED_STORY_SQ-52_RUN_B1`.
- Cleanup executed at the end (seed records removed).

## DB validation

- Historical monthly seed with non-null `paid_at` across 6 months was created and validated.
- Expected monthly totals from `paid_at` seed:
  - 2025-11: `275.00`
  - 2025-12: `250.00`
  - 2026-01: `225.00`
  - 2026-02: `200.00`
  - 2026-03: `175.00`
  - 2026-04: `150.00`

## Findings - semantics and update behavior

1. **Monthly summary semantics mismatch**
   - API `/api/invoices/dashboard` values are inconsistent with `paid_at`-based expectation.
   - Prior seeded test showed `paid_this_month` and chart values not reflecting `paid_at` historical distribution.

2. **Update-after-payment coverage now completed**
   - Created `sent` invoice `S52B1P1901` (`$333.33`) and paid it through UI quick-pay flow.
   - Dashboard `paid_this_month` delta updated by `+333.33` (reactivity PASS).
   - Status counters updated (`sent` down, `paid` up).

3. **Additional semantic observation**
   - After UI payment, invoice status became `paid` but `paid_at` remained `null`.
   - Behavior suggests aggregation based on paid status totals instead of strict `paid_at` semantics described in ATP notes.

## Conclusion

- Coverage for `update after payment` is complete and passes reactivity.
- Story still fails on monthly summary semantic consistency vs expected `paid_at` rule.
- Candidate defect category: `Data/Functional`.

## Evidence

- `qa/artifacts/sq52-dashboard-summary-2026-04-12.png`
- `qa/artifacts/sq52-update-after-payment-dashboard-2026-04-12.png`

## Status recommendation

- Keep `SQ-52` in `In Test` until semantic inconsistency is fixed and retested.

## Defect registration

- Duplicate check performed before creation.
- Defect created: `SQ-175`.
- Link established: `SQ-52` relates to `SQ-175`.
- Defect parent epic: `SQ-38`.
