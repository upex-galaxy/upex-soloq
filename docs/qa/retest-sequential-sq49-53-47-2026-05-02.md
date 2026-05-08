# Retest Sequential Execution - SQ-49, SQ-53, SQ-47

Date: 2026-05-02
Executor: OpenCode
Mode: Sequential single-user dataset (DB-first)

## 1) Jira/Xray revalidation (SQ-54, SQ-56, SQ-57, SQ-58)

- Tenant/API revalidated against `upexgalaxy67.atlassian.net` using Jira REST.
- Stories are reachable and in `QA Approved`.
- `SQ-197`..`SQ-205` exist as issue type `Test` (not subtasks).
- `SQ-196` exists as issue type `Test Set`.

### Link audit result

- Initial state found `Relates` links between stories and tests.
- Corrective action executed: added `Test` link type from each story to its expected tests.

Coverage after fix:

- `SQ-54` -> `SQ-197`, `SQ-198` (`Test` links present)
- `SQ-56` -> `SQ-199`, `SQ-200` (`Test` links present)
- `SQ-57` -> `SQ-201`, `SQ-202` (`Test` links present)
- `SQ-58` -> `SQ-203`, `SQ-204`, `SQ-205` (`Test` links present)

Note: `SQ-196` (`Test Set`) was reachable but did not expose direct membership via Jira REST issue links in this execution.

## 2) SQ-49 controlled dataset and validation

User scope: single QA user.

Dataset created:

- `S49-SENT-260502` status=`sent` total=`120.50`
- `S49-OVD-260502` status=`overdue` total=`230.00`

Validation query result:

- `sent` total: `120.50`
- `overdue` total: `230.00`
- pending total (`sent + overdue`): `350.50`

## 3) SQ-53 transition on same user (no contamination)

Cleanup/prep:

- Soft-deleted the `overdue` SQ-49 record and a legacy active paid invoice.
- Kept one target invoice (`S49-SENT-260502`) as scenario input.

Mark as paid simulation result:

- Invoice `S49-SENT-260502` transitioned to `paid` with `paid_at` set.
- Payment record inserted with matching amount `120.50`.

## 4) SQ-47 final cleanup and zero-invoice state

Cleanup executed:

- Soft-deleted all remaining active invoices for the same QA user.

Validation result:

- Active invoices count: `0`

This leaves the user in correct precondition for empty-state validation (`SQ-47`).
