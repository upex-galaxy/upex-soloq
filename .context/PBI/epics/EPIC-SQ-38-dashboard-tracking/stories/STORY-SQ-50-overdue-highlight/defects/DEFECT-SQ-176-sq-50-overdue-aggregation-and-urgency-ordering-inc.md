# DEFECT: SQ-50: Overdue aggregation and urgency ordering inconsistent in invoices dashboard/list

**Jira Key:** [SQ-176](https://upexgalaxy65.atlassian.net/browse/SQ-176)
**Related Story:** [SQ-50](https://upexgalaxy65.atlassian.net/browse/SQ-50) - As a user, I want to see overdue invoices highlighted so that I can prioritize follow-up
**Priority:** Medium
**Status:** OPEN
**Components:** None
**Severity:** Mayor
**Error Type:** Functional
**Test Environment:** Staging
**Fix Type:** Bugfix

---

## Description

Exploratory coverage for SQ-50 confirms two issues in Staging: (1) dashboard overdue counters remain zero while sent invoices are rendered as overdue in list rows, and (2) urgency ordering is not applied row-by-row even with explicit overdue boundary dataset.

Expected: overdue derived rule (status=sent and due_date<today) must be reflected consistently in dashboard counters, and sort by urgency must order overdue first by days overdue desc, then non-overdue sent by due_date asc.

Evidence files: sq50-sent-tab-overdue-mismatch-2026-04-12.png, sq50-urgency-order-row-by-row-2026-04-12.png

---

## 🐞 Actual Result

Sent invoices with past due dates are shown as overdue in list rows (badge + days overdue), but dashboard API returns overdue_count=0 and overdue_total=0; row order does not follow urgency rule.

---

## ✅ Expected Result

Dashboard overdue counters must match derived overdue condition, and list/API urgency sorting must place overdue first by days overdue desc then sent by due_date asc.

---

## 🔍 Root Cause

**Category:** Code Error

---

## Related Issues

- relates to: [SQ-50](https://upexgalaxy65.atlassian.net/browse/SQ-50) - As a user, I want to see overdue invoices highlighted so that I can prioritize follow-up

---

## Metadata

- **Created:** 2026-04-12T19:31:14.288Z
- **Updated:** 2026-04-12T19:33:47.468Z
- **Reporter:** Fernando Javier Masci
- **Assignee:** Fernando Javier Masci

---

_Synced from Jira by jira-sync_
_Last sync: 2026-04-12T19:36:23.847Z_
