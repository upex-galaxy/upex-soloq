# Test Prioritization Report

**Feature:** SQ-48 - Filter invoices by status  
**Date:** 2026-05-04  
**Initial Total Candidates:** 7  
**Candidates that passed filter:** 6

---

## Phase 0: Critical Questions Filter

| # | Scenario | Protects future? | Prior bug? | Feature level? | Passes filter? |
| --- | --- | --- | --- | --- | --- |
| 1 | Validate status tabs visibility when invoices dashboard loads | YES | NO | YES | Pass |
| 2 | Validate overdue derivation when due date is before today | YES | NO | YES | Pass |
| 3 | Validate filter persistence when user reloads a URL with status param | YES | YES (SQ-177) | YES | Pass |
| 4 | Validate filtered rows when user selects Draft, Sent, and Paid tabs | YES | NO | YES | Pass |
| 5 | Validate tab badge count consistency when active tab data is rendered | YES | NO | YES | Pass |
| 6 | Validate empty state messaging when selected status has no matching invoices | YES | NO | YES | Pass |
| 7 | Validate final tab consistency when user switches tabs rapidly | NO (lower future signal vs cost) | NO | YES | Fail |

**Result:** 6 of 7 candidates pass the initial filter.

---

## ROI Analysis (Strict)

Formula: `ROI = (Frequency x Impact x Stability) / (Effort x Dependencies)`

| # | Scenario | Freq | Impact | Stab | Effort | Deps | ROI | Prior Bug | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Validate status tabs visibility when invoices dashboard loads | 4 | 4 | 4 | 2 | 1 | 32.0 | - | AUTOMATE |
| 2 | Validate overdue derivation when due date is before today | 3 | 5 | 3 | 2 | 2 | 11.3 | - | AUTOMATE |
| 3 | Validate filter persistence when user reloads a URL with status param | 4 | 5 | 3 | 2 | 2 | 15.0 | SQ-177 | AUTOMATE |
| 4 | Validate filtered rows when user selects Draft, Sent, and Paid tabs | 3 | 4 | 4 | 2 | 2 | 12.0 | - | AUTOMATE |
| 5 | Validate tab badge count consistency when active tab data is rendered | 3 | 4 | 3 | 3 | 2 | 6.0 | - | AUTOMATE |
| 6 | Validate empty state messaging when selected status has no matching invoices | 2 | 3 | 4 | 2 | 1 | 12.0 | - | AUTOMATE WITH CAUTION |

---

## Final Decision

### For Automated Regression

| # | Scenario | ROI | Justification |
| --- | --- | --- | --- |
| 1 | Validate filter persistence when user reloads a URL with status param | 15.0 | Prior bug (`SQ-177`) + direct regression protection |
| 2 | Validate overdue derivation when due date is before today | 11.3 | High business impact + date-boundary risk |
| 3 | Validate filtered rows when user selects Draft, Sent, and Paid tabs | 12.0 | Core functional flow |
| 4 | Validate tab badge count consistency when active tab data is rendered | 6.0 | Prevents silent mismatch defects |

### Manual Regression (if needed)

| # | Scenario | Reason |
| --- | --- | --- |
| 5 | Validate status tabs visibility when invoices dashboard loads | Could be included in smoke pack instead of dedicated full regression test |

### Deferred

| # | Scenario | Reason to defer |
| --- | --- | --- |
| 6 | Validate final tab consistency when user switches tabs rapidly | Lower ROI in current stability window; can be absorbed by targeted exploratory |

---

## Summary

| Metric | Before (candidates) | After (regression) | Reduction |
| --- | --- | --- | --- |
| Total | 7 | 4 automated (+1 optional manual) | 43% |

| Track | Count | Justification |
| --- | --- | --- |
| Automated Regression | 4 | Essential coverage only |
| Manual Regression | 1 (optional) | Smoke/visibility check |
| Deferred | 2 | Lower protection value vs maintenance |

---

## For Test Documentation (next step when Xray CLI is active)

| Scenario | Path | Final Nomenclature |
| --- | --- | --- |
| URL persistence | Candidate | `SQ-48: TC1: Validate filter persistence when user reloads a URL with status param` |
| Overdue derivation | Candidate | `SQ-48: TC2: Validate overdue derivation when due date is before today` |
| Draft/Sent/Paid filter | Candidate | `SQ-48: TC3: Validate filtered rows when user selects Draft, Sent, and Paid tabs` |
| Badge consistency | Candidate | `SQ-48: TC4: Validate tab badge count consistency when active tab data is rendered` |
