# Test Prioritization Report

**Feature:** SQ-52 - Monthly summary  
**Date:** 2026-05-04  
**Initial Total Candidates:** 10  
**Candidates that passed filter:** 8

---

## Phase 0: Critical Questions Filter

| # | Scenario | Protects future? | Prior bug? | Feature level? | Passes filter? |
| --- | --- | --- | --- | --- | --- |
| 1 | Validate monthly paid total when dashboard loads current month summary | YES | YES (SQ-175) | YES | Pass |
| 2 | Validate paid and pending monthly breakdown when mixed statuses exist | YES | YES (SQ-175) | YES | Pass |
| 3 | Validate summary refresh when a sent invoice is marked as paid | YES | NO | YES | Pass |
| 4 | Validate user isolation in monthly summary when another user has higher totals | YES | NO | YES | Pass |
| 5 | Validate month-over-month trend percentage when current month exceeds last month | YES | YES (SQ-175) | YES | Pass |
| 6 | Validate six-month chart values when historical paid data exists | YES | YES (SQ-175) | YES | Pass |
| 7 | Validate currency formatting when monthly values include thousands and decimals | YES | NO | Mostly APP-level formatter reuse | Fail |
| 8 | Validate zero-income rendering when current month has no paid invoices | YES | NO | YES | Pass |
| 9 | Validate first-month trend behavior when previous month is zero | YES | NO | YES | Pass |
| 10 | Validate reduced chart horizon when fewer than six months are available | NO (lower future signal) | NO | YES | Fail |

**Result:** 8 of 10 candidates pass the initial filter.

---

## ROI Analysis (Strict)

Formula: `ROI = (Frequency x Impact x Stability) / (Effort x Dependencies)`

| # | Scenario | Freq | Impact | Stab | Effort | Deps | ROI | Prior Bug | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Validate monthly paid total when dashboard loads current month summary | 4 | 5 | 3 | 2 | 2 | 15.0 | SQ-175 | AUTOMATE |
| 2 | Validate paid and pending monthly breakdown when mixed statuses exist | 4 | 5 | 3 | 2 | 2 | 15.0 | SQ-175 | AUTOMATE |
| 3 | Validate summary refresh when a sent invoice is marked as paid | 3 | 5 | 3 | 3 | 3 | 5.0 | - | AUTOMATE WITH CAUTION |
| 4 | Validate user isolation in monthly summary when another user has higher totals | 3 | 5 | 4 | 3 | 3 | 6.7 | - | AUTOMATE |
| 5 | Validate month-over-month trend percentage when current month exceeds last month | 3 | 4 | 3 | 2 | 2 | 9.0 | SQ-175 | AUTOMATE |
| 6 | Validate six-month chart values when historical paid data exists | 2 | 4 | 3 | 3 | 3 | 2.7 | SQ-175 | INCLUDE (prior bug override) |
| 8 | Validate zero-income rendering when current month has no paid invoices | 2 | 3 | 4 | 2 | 2 | 6.0 | - | AUTOMATE |
| 9 | Validate first-month trend behavior when previous month is zero | 2 | 3 | 3 | 3 | 2 | 3.0 | - | AUTOMATE WITH CAUTION |

---

## Final Decision

### For Automated Regression

| # | Scenario | ROI | Justification |
| --- | --- | --- | --- |
| 1 | Validate monthly paid total when dashboard loads current month summary | 15.0 | Core financial metric + prior bug area |
| 2 | Validate paid and pending monthly breakdown when mixed statuses exist | 15.0 | Core business breakdown + prior bug area |
| 3 | Validate month-over-month trend percentage when current month exceeds last month | 9.0 | High product visibility + prior bug area |
| 4 | Validate summary refresh when a sent invoice is marked as paid | 5.0 | Cross-module E2E protection |
| 5 | Validate user isolation in monthly summary when another user has higher totals | 6.7 | Security/RLS high impact |
| 6 | Validate six-month chart values when historical paid data exists | 2.7 | Included due to prior bug relevance in chart semantics |

### Manual Regression (optional)

| # | Scenario | Reason |
| --- | --- | --- |
| 7 | Validate first-month trend behavior when previous month is zero | Boundary check that can stay manual if automation bandwidth is limited |

### Deferred

| # | Scenario | Reason to defer |
| --- | --- | --- |
| 8 | Validate currency formatting when monthly values include thousands and decimals | Better covered in shared formatting suite/component tests |
| 9 | Validate reduced chart horizon when fewer than six months are available | Lower failure probability after initial stabilization |

---

## Summary

| Metric | Before (candidates) | After (regression) | Reduction |
| --- | --- | --- | --- |
| Total | 10 | 6 automated (+1 optional manual) | 30% |

| Track | Count | Justification |
| --- | --- | --- |
| Automated Regression | 6 | Protects financial semantics and high-risk areas |
| Manual Regression | 1 (optional) | Boundary economics |
| Deferred | 3 | Lower ROI or app-level coverage |

---

## For Test Documentation (next step when Xray CLI is active)

| Scenario | Path | Final Nomenclature |
| --- | --- | --- |
| Monthly paid total | Candidate | `SQ-52: TC1: Validate monthly paid total when dashboard loads current month summary` |
| Paid vs pending breakdown | Candidate | `SQ-52: TC2: Validate paid and pending monthly breakdown when mixed statuses exist` |
| MoM trend | Candidate | `SQ-52: TC3: Validate month-over-month trend percentage when current month exceeds last month` |
| Update after payment | Candidate | `SQ-52: TC4: Validate summary refresh when a sent invoice is marked as paid` |
| RLS isolation | Candidate | `SQ-52: TC5: Validate user isolation in monthly summary when another user has higher totals` |
| Six-month chart | Candidate | `SQ-52: TC6: Validate six-month chart values when historical paid data exists` |
