# Feature Test Plan: QA Exploratory Trifuerza + Coverage Extension - SQ-50

Environment: `Staging`  
Date: `2026-04-12`

## Scope executed

- Exploratory flow aligned to Fase 10 (`smoke + UI + API + DB`).
- Existing records were reviewed first; targeted seed was applied only where needed.
- Seed tags used for traceability: `QA_SEED_STORY_SQ-50_RUN_A1`, `QA_SEED_STORY_SQ-50_RUN_B1`.
- Cleanup executed at the end (seed records removed).

## DB validation

- Derived overdue rule input validated: `status='sent' AND due_date < CURRENT_DATE`.
- Explicit boundary and ordering seed set validated with offsets `-10`, `-2`, `-1`, `0`, `+1` days.

## Findings - consistency and ordering

1. **Aggregation inconsistency**
   - Invoices tab rows show overdue semantics (`Vencida` + `N days overdue`) for past-due sent invoices.
   - Dashboard API `/api/invoices/dashboard` still reports `overdue_count: 0` and `overdue_total: 0` under same condition.

2. **Urgency order not implemented as expected**
   - ATP rule expected: overdue first (`days overdue DESC`), then non-overdue sent (`due_date ASC`).
   - Actual UI/API order with seeded set is inverse/created_at-like and does not match urgency criteria.
   - No visible UI control for `Sort by urgency` found in Invoices page.
   - API call with `sortBy=urgency` did not produce urgency ordering.

## Conclusion

- Result: `FAILED`.
- Coverage for explicit row-by-row urgency order is now complete and failing.
- Candidate defect category: `Data/Functional`.

## Evidence

- `qa/artifacts/sq50-sent-tab-overdue-mismatch-2026-04-12.png`
- `qa/artifacts/sq50-urgency-order-row-by-row-2026-04-12.png`

## Status recommendation

- Keep `SQ-50` in `In Test` until defect is fixed and retested.

## Defect registration

- Duplicate check performed before creation.
- Defect created: `SQ-176`.
- Link established: `SQ-50` relates to `SQ-176`.
- Defect parent epic: `SQ-38`.
