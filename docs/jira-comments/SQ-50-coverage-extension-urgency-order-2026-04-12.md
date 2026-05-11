# Feature Test Plan: SQ-50 Coverage Extension - Explicit Urgency Row Order

Environment: `Staging`  
Date: `2026-04-12`

## Objective covered

- Complete pending coverage for explicit row-by-row urgency ordering.

## Controlled data setup

- Seed tag: `QA_SEED_STORY_SQ-50_RUN_B1`.
- `sent` invoices created with due_date offsets: `-10`, `-2`, `-1`, `0`, `+1` days.
- Cleanup executed after validation.

## Expected order (from ATP rule)

- Overdue first, ordered by `days overdue DESC`, then non-overdue sent by `due_date ASC`.
- Expected seeded order:
  1. `S50B1A1901` (11 days overdue)
  2. `S50B1B1901` (3 days overdue)
  3. `S50B1C1901` (2 days overdue)
  4. `S50B1D1901` (1 day overdue / boundary)
  5. `S50B1E1901` (not overdue)

## Actual UI/API behavior

- UI list with search `S50B1` rendered order:
  1. `S50B1E1901` (not overdue)
  2. `S50B1D1901` (1 day overdue)
  3. `S50B1C1901` (2 days overdue)
  4. `S50B1B1901` (3 days overdue)
  5. `S50B1A1901` (11 days overdue)
- This is inverse/created_at-like ordering, not urgency ordering.
- No visible UI control for `Sort by urgency` found in Invoices page.
- API call with `sortBy=urgency` did not produce urgency ordering either.

## Conclusion

- Pending coverage item is now covered and fails.
- Recommendation: create Defect for missing/incorrect urgency sorting implementation (if no existing duplicate is found).

## Evidence

- `qa/artifacts/sq50-urgency-order-row-by-row-2026-04-12.png`
