# Comments for SQ-50

[View in Jira](https://upexgalaxy67.atlassian.net/browse/SQ-50)

---

### Ely - 2026-03-31T21:42:29.300Z

## 🧪 Acceptance Test Plan - Generated 2026-03-31

**QA Engineer:** AI-Generated

**Status:** Draft - Pending PO/Dev Review

---

### Summary

- **Total Test Cases:** 11 (Positive: 4, Negative: 2, Boundary: 3, Integration: 1, API: 1)
- **Complexity:** Medium
- **Key Decisions Proposed:**

1. Overdue is derived (not DB status): `status='sent' AND due_date < CURRENT_DATE`

2. Timezone: user's timezone for overdue calculation

3. due_date = today is NOT overdue (strict `<`)

4. Sort by urgency: overdue first (most days desc), then sent by due_date asc

### Refined Acceptance Criteria

- Scenario 1: Overdue badge and row highlight
- Scenario 2: Days overdue display ("N days overdue")
- Scenario 3: Dashboard alert banner with count
- Scenario 4: Sort by urgency
- Scenario 5: due_date = today is NOT overdue (critical boundary)
- Scenario 6: due_date = yesterday IS overdue
- Scenario 7: Paid invoices never show as overdue
- Scenario 8: Invoice without due_date
- Scenario 9: RLS isolation

### Edge Cases Added

- due_date boundary (today vs yesterday)
- Invoice without due_date
- Paid + past due_date combination
- Midnight transition
- RLS isolation of overdue count

---

**Documentation:** `.context/PBI/epics/EPIC-SQ-38-dashboard-tracking/stories/STORY-SQ-50-overdue-highlight/acceptance-test-plan.md`

**@ProductOwner** please validate overdue detection rules and timezone decision.

**@DevLead** please confirm derived vs DB status approach.

---

### Automation for Jira - 2026-04-01T02:59:11.493Z

🔎 Pull Request created. Task is pending to ANALYZE and REVIEW by the team. Waiting for PR Approval.

---

### Automation for Jira - 2026-04-01T05:19:52.499Z

✅ Pull Request is successfully MERGED. Task is Done.

---

### Fernando Javier Masci - 2026-04-12T18:18:02.909Z

# Feature Test Plan: QA Exploratory Trifuerza + Coverage Extension - [https://upexgalaxy67.atlassian.net/browse/SQ-50#icft=SQ-50](https://upexgalaxy67.atlassian.net/browse/SQ-50#icft=SQ-50)

Environment: `Staging` Date: `2026-04-12`

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

---


_Synced from Jira by jira-sync_
_Last sync: 2026-04-22T05:00:15.314Z_
