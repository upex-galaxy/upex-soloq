# Comments for SQ-52

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-52)

---

### Ely - 2026-03-31T21:42:34.980Z

## 🧪 Acceptance Test Plan - Generated 2026-03-31

**QA Engineer:** AI-Generated

**Status:** Draft - Pending PO/Dev Review

---

### Summary

- **Total Test Cases:** 14 (Positive: 5, Negative: 2, Boundary: 4, Integration: 2, API: 1)
- **Complexity:** High
- **Key Decisions Proposed:**

  1. "Total income this month" = SUM of invoices with `paid_at` in current month (confirmed payments only)

  2. Breakdown: Paid = paid_at in month, Pending = issue_date in month with status sent/overdue

  3. MoM comparison based on paid income (not projected)

  4. Chart shows paid income per month (bar chart)

  5. Chart with < 6 months: show only available months

  6. MoM when last month = 0: show "New" badge

### Refined Acceptance Criteria

- Scenario 1: Monthly income = paid total
- Scenario 2: Breakdown paid vs pending
- Scenario 3: Month-over-month comparison
- Scenario 4: 6-month chart
- Scenario 5: Zero income month
- Scenario 6: First month (no comparison)
- Scenario 7: Division by zero MoM
- Scenario 8: Chart with insufficient months
- Scenario 9: Summary updates after payment
- Scenario 10: RLS isolation
- Scenario 11: Currency formatting

### Edge Cases Added

- Division by zero in MoM calculation
- First month without comparison data
- Chart with less than 6 months
- Zero income month
- Payment at end of month boundary
- RLS isolation

---

**Documentation:** `.context/PBI/epics/EPIC-SQ-38-dashboard-tracking/stories/STORY-SQ-52-monthly-summary/acceptance-test-plan.md`

**@ProductOwner** please validate income definition (paid_at only) and MoM calculation base.

**@DevLead** please confirm monthly period boundaries and timezone handling.

---

### Automation for Jira - 2026-04-01T05:21:44.948Z

🔎 Pull Request created. Task is pending to ANALYZE and REVIEW by the team. Waiting for PR Approval.

---

### Automation for Jira - 2026-04-01T05:21:52.178Z

✅ Pull Request is successfully MERGED. Task is Done.

---

### Fernando Javier Masci - 2026-04-12T18:18:03.140Z

# Feature Test Plan: QA Exploratory Trifuerza + Coverage Extension - SQ-52

Environment: `Staging` Date: `2026-04-12`

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

---


_Synced from Jira by jira-sync_
_Last sync: 2026-04-12T19:36:25.538Z_
