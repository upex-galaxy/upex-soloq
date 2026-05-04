# DEFECT: SQ-52: Monthly summary semantics inconsistent (paid_at mismatch and trend data)

**Jira Key:** [SQ-175](https://upexgalaxy65.atlassian.net/browse/SQ-175)
**Related Story:** [SQ-52](https://upexgalaxy65.atlassian.net/browse/SQ-52) - As a user, I want to see a summary of monthly income so that I can track my progress
**Priority:** Medium
**Status:** OPEN
**Components:** None
**Severity:** Mayor
**Error Type:** Data
**Test Environment:** Staging
**Fix Type:** Bugfix

---

## Description

Exploratory coverage for SQ-52 in Staging shows semantic inconsistency in monthly metrics: dashboard values do not align with paid_at-based expectations and historical chart points remain zero despite seeded paid_at records.

Update-after-payment reactivity was covered and passes (+333.33 after quick pay), but invoice paid_at remains null after payment and metric source appears to use paid status totals rather than paid_at semantics expected in ATP notes.

Evidence files: sq52-dashboard-summary-2026-04-12.png, sq52-update-after-payment-dashboard-2026-04-12.png

---

## 🐞 Actual Result

Dashboard monthly summary values and trend chart are inconsistent with paid_at-based seeded dataset; after payment, invoice status updates but paid_at remains null.

---

## ✅ Expected Result

Monthly summary and trend should follow agreed paid_at semantics; paid_at should be populated on payment and chart totals should reflect paid_at history.

---

## 🔍 Root Cause

**Category:** Code Error

---

## Related Issues

- relates to: [SQ-52](https://upexgalaxy65.atlassian.net/browse/SQ-52) - As a user, I want to see a summary of monthly income so that I can track my progress

---

## Metadata

- **Created:** 2026-04-12T19:31:14.274Z
- **Updated:** 2026-04-12T19:33:47.507Z
- **Reporter:** Fernando Javier Masci
- **Assignee:** Fernando Javier Masci

---

_Synced from Jira by jira-sync_
_Last sync: 2026-04-12T19:36:23.714Z_
