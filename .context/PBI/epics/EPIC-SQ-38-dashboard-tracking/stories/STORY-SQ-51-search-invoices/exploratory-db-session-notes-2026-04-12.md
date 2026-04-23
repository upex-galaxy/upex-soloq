# DB Exploratory Session Notes - SQ-51

**Date:** 2026-04-12
**Story:** SQ-51 - Search invoices by client or number
**Environment:** Staging database
**Execution mode:** Read-only SQL checks using project DB credentials (same source configured in `dbhub.toml`)

---

## Summary

- **Overall status:** PASSED
- **Goal:** Reconcile API search behavior with persisted data and relationships.

---

## Query Results

1. Total active invoices (`deleted_at is null`) -> `92`
2. Exact invoice `INV-2026-20354` exists with joined client -> found (`draft`, `Test Client Postman`)
3. Case-insensitive client/email search (`postman`) -> `3` matching rows
4. No-results control query (`zzzz-not-found`) -> `0` hits
5. Draft invoices count -> `82`
6. Draft + search (`20354`) -> expected row found (`INV-2026-20354`)
7. Data quality checks:
   - empty invoice numbers -> `0`
   - null client ids -> `0`
   - soft-deleted rows -> `0`

---

## Interpretation

- DB state is consistent with API exploratory outcomes for exact/partial/client/no-results/filter scenarios.
- No DB integrity anomaly found for this story scope.
- Current open issue (`SQ-169`) remains UI-copy/state behavior, not a DB issue.
