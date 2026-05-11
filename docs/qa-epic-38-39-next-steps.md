# QA Next Steps - EPIC SQ-38 and SQ-39

## Sequence Agreed

1. Execute SQ-55 smoke test (go/no-go).
2. Execute SQ-55 exploratory testing (UI + API + DB, decision-oriented).
3. Execute SQ-51 smoke/exploratory testing with same decision-oriented approach.

---

## Current Execution Status

- **SQ-55:** BLOCKED in staging by unreachable precondition (`draft -> sent`).
- **SQ-51:** UNBLOCKED and promoted as active QA stream while SQ-55 is pending TL/owner guidance.

### Active External Risk (non-blocking for current scope)

- A staging smoke run failed in `SQ-90` (`createClient.test.ts`) after successful auth/environment checks.
- Disposition: **non-blocking for SQ-55 and SQ-51** unless client-creation is required as precondition for test data.
- Action: keep `SQ-90` under parallel triage while QA continues with payment/search stories using existing seeded data.

---

## SQ-51 Plan (after SQ-55)

### Smoke (short)

- Access dashboard and invoice list.
- Validate search input appears and is interactive.
- Validate one simple search happy path works end-to-end.

### Exploratory Decision Focus

- Search trigger behavior (debounced live vs submit/enter).
- Filter/pagination precedence when query changes.
- Query normalization (`trim`, empty query handling).
- No-results vs empty-state behavior.

### Evidence Package

- UI screenshots for each rule.
- Network captures for `GET /api/invoices?search=` behavior.
- Data checks for expected matching fields (`invoice_number`, `client.name`, `client.email`).

---

## After SQ-51: Full EPIC Closure Steps

Given all stories in EPIC-SQ-38 and EPIC-SQ-39 are reportedly implemented, run closure in this order:

1. **Story-level QA verdicts**
   - PASS/FAIL/BLOCKED for each story in both epics.
   - Link evidence and bugs to each Jira story.

2. **Cross-story integration sweep**
   - SQ-38 dashboard/search/filter + SQ-39 payment updates reflected in list/status.
   - Validate end-to-end invoice lifecycle transitions.

3. **Bug triage + retest loop**
   - Prioritize by severity/business impact.
   - Re-test fixed tickets with focused smoke + regression slices.

4. **QA documentation and readiness**
   - Finalize exploratory notes and decision logs.
   - Promote ATPs from Draft where ambiguity is resolved by implementation + PO/TL confirmation.

5. **Automation intake (next stage)**
   - Nominate high-ROI scenarios for Stage 4 automation.
   - Prioritize critical flows: payment amount validations, dashboard search consistency, and status refresh.

---

## Technical Debt (deferred until QA thread closes)

- Branch hygiene cleanup is intentionally deferred to avoid disrupting active QA execution.
- Cleanup scope after QA closure:
  - prune merged local branches,
  - refresh local `staging` tracking,
  - remove temporary QA-only branches/worktrees no longer needed.
