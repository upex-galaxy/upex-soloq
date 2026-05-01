# Feature Test Plan: QA Exploratory Trifuerza Update - SQ-50

Environment: `Staging`  
Date: `2026-04-12`

## Scope executed

- Exploratory flow aligned to Fase 10 (`smoke + UI + API + DB`).
- Existing records were reviewed first; targeted seed was applied only where needed.
- Seed tag used for traceability: `QA_SEED_STORY_SQ-50_RUN_A1`.
- Cleanup executed at the end (seed records removed).

## DB validation

- Seeded `sent` invoices with due dates at boundary: `yesterday`, `today`, `tomorrow`.
- DB check confirmed derived overdue rule input was correct:
  - `status='sent' AND due_date < CURRENT_DATE` -> exactly `1` seeded invoice qualifies as overdue.

## UI/API findings

- Invoices tab `Enviada` rendered seeded rows.
- UI showed overdue semantics inside sent tab rows (badge `Vencida` + `N days overdue`) for rows with past due date.
- API `/api/invoices?status=sent` included seeded sent invoices as expected.
- Dashboard API `/api/invoices/dashboard` returned `overdue_count: 0` and `overdue_total: 0` despite sent rows in overdue condition.

## Conclusion

- Result: `FAILED` for consistency of overdue aggregation/indicator behavior.
- Candidate defect type: `Data/Functional` inconsistency between list-level overdue rendering and dashboard overdue counters.

## Evidence

- Attached screenshot: `qa/artifacts/sq50-sent-tab-overdue-mismatch-2026-04-12.png`

## Status recommendation

- Keep `SQ-50` in `In Test` (do not move to `QA Approved`) until defect is triaged/fixed and retested.
