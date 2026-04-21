# Incident Investigation: SQ-176

## Metadata
- **Key:** SQ-176
- **Type:** Defect
- **Priority:** Medium
- **Status:** Open
- **Assignee:** Fernando Javier Masci
- **Reporter:** Fernando Javier Masci (implicit — exploratory coverage)
- **Sprint:** SoloQ Sprint 2 cluster
- **Linked US/items:** SQ-50 ("Overdue invoices highlighted") — parent story. Related sibling defects on the same dashboard/list surface: SQ-175 ("Monthly metrics semantic inconsistency", SQ-52), SQ-177 ("Status filter persistence", SQ-48). All three land on the same pair of routes (`/dashboard`, `/invoices`) and share a common root pattern: DB-stored status values diverging from the semantics the UI promises.

## Summary
Dashboard counters and list badges disagree about what "overdue" means because they use two different definitions. The dashboard tile counts rows **only** where `status = 'overdue'` is literally stored in Postgres; the invoices list derives the overdue flag at render time as `status = 'sent' AND due_date < today`. Since nothing in the codebase ever writes the `'overdue'` enum value to `invoices.status` (no cron, no trigger, no transition), the dashboard `overdue_count` is effectively stuck at 0 while the list correctly highlights past-due sent invoices in red. "Urgency ordering" (overdue first by days-overdue desc, then non-overdue sent by due_date asc) is not implemented anywhere — the list sorts by `created_at desc`.

## Context
This is a **data-semantic inconsistency**, not a crash. The two surfaces render against the same dataset but disagree on the predicate. SQ-50's intent is a derived overdue rule — the shared util `src/lib/utils/overdue.ts` correctly implements it as `status === 'sent' && due_date < startOfToday`, and the list uses it. The dashboard aggregation route was written as if `'overdue'` were a first-class stored status, which it never becomes because no writer sets it. Urgency sorting was never wired up on either side.

### Reporter observations (SQ-176 description)
1. Dashboard overdue counters remain zero while sent invoices are rendered as overdue in list rows.
2. Sort by urgency is not applied row-by-row even with an explicit overdue-boundary dataset.
3. Expected: overdue rule (`status=sent AND due_date<today`) reflected consistently in counters and the list; urgency sort = overdue first by days-overdue desc, then non-overdue sent by due_date asc.
4. Evidence screenshots (attached in Jira): `sq50-sent-tab-overdue-mismatch-2026-04-12.png`, `sq50-urgency-order-row-by-row-2026-04-12.png`.

## Related files / code
Two independent computation sites plus a shared (but only half-used) util:

- **Shared util (derived overdue, CORRECT):** `src/lib/utils/overdue.ts:12-19` — `isInvoiceOverdue(status, dueDate)` returns `status === 'sent' && due < startOfToday`; `due_date === today` is explicitly NOT overdue. `getDaysOverdue` at `:25-33` returns floor-days since due. No `urgencyScore` or comparator exists.
- **Invoices list page (uses the util, CORRECT for highlighting):** `src/app/(app)/invoices/page.tsx:13` imports `isInvoiceOverdue`, `getDaysOverdue`, `formatDaysOverdue`. `:308-351` computes `overdue` per row and renders the red row, the `overdue` badge, and `formatDaysOverdue` text. `:382` adds the "mark as paid" quick action for `sent | overdue | derived-overdue` rows. The tabs at `:55-61` include an `overdue` tab and read `getTabCount('overdue')` from `summary.status_counts.overdue` — which is the DB count, not the derived count, so the "Vencida" tab badge is also always 0.
- **Invoices list API (no urgency sort, no derived filter):** `src/app/api/invoices/route.ts:354-357,435` — valid sort fields are `created_at, updated_at, issue_date, due_date, total, invoice_number, status`. Default is `created_at desc`. `:439-441` filters `status` with `eq('status', status)`, so the `?status=overdue` link in the dashboard banner (`page.tsx:153` in dashboard) returns zero rows from DB.
- **Dashboard page (counts a DB status that is never set):** `src/app/(app)/dashboard/page.tsx:108` reads `summary.overdue_count`; `:140-159` renders the alert banner with that count; `:197-214` renders the "Facturas Vencidas" tile.
- **Dashboard API (WRONG — literal match on status):** `src/app/api/invoices/dashboard/route.ts:80-92` — the entire aggregation treats `'sent'` and `'overdue'` as disjoint stored statuses:
  ```
  if (status === 'sent' || status === 'overdue') pendingTotal += total;
  if (status === 'overdue') { overdueTotal += total; overdueCount++; }
  ```
  `status_counts` at `:64-70,76-78` likewise counts the literal enum values. `due_date` is not referenced.
- **Invoice status badge (dumb renderer):** `src/components/invoices/invoice-status-badge.tsx` just maps the passed `status` to a colour. The list passes `effectiveStatus = overdue ? 'overdue' : invoice.status`, so badges are correct visually without needing to know the underlying DB status.
- **Dashboard summary hook / types:** `src/hooks/invoices/use-dashboard-summary.ts`, `src/lib/types.ts` — both sides of the `DashboardSummary` contract are consistent; no bug in the transport, only in the server-side computation.
- **Schema:** `invoices.status` enum `{draft, sent, paid, overdue, cancelled}` exists, but the codebase never transitions a row to `'overdue'`. No Supabase migration, no `pg_cron` job, no API handler writes it. Grep for `status: 'overdue'` / `.update({ status: 'overdue'...})` across `src/` and migrations returns no writer.

## Reproduction attempt
### Steps
1. Pull the full dashboard + list contract against the live staging DB (`czuusjchqpgvanvbdrnz`).
2. Count invoices grouped by `status` and bucket by `due_date` vs `CURRENT_DATE`.
3. Diff the two formulas side-by-side on the same dataset.

### Result
Reproduced: **YES**. The two surfaces disagree deterministically on the current data.

Single live query (staging, 2026-04-20):

```sql
SELECT
  status,
  COUNT(*) AS count,
  COUNT(*) FILTER (WHERE due_date < CURRENT_DATE) AS past_due,
  COUNT(*) FILTER (WHERE due_date = CURRENT_DATE) AS due_today,
  COUNT(*) FILTER (WHERE due_date > CURRENT_DATE) AS future
FROM invoices
WHERE deleted_at IS NULL
GROUP BY status;
```

| status | count | past_due | due_today | future |
| ------ | ----- | -------- | --------- | ------ |
| draft  | 80    | 71       | 1         | 8      |
| sent   | 3     | 2        | 0         | 1      |
| paid   | 9     | 5        | 0         | 4      |

Zero rows have `status = 'overdue'` stored. Two rows have `status = 'sent' AND due_date < CURRENT_DATE` — those are the ones the list highlights in red.

### Two formulas side-by-side (same dataset)

```
DASHBOARD (src/app/api/invoices/dashboard/route.ts:89-92)
  overdue_count = COUNT(*) WHERE status = 'overdue'
                = 0   (never gets written)

LIST (src/app/(app)/invoices/page.tsx:309 → src/lib/utils/overdue.ts:12-19)
  isOverdue(row) = row.status === 'sent' AND startOfDay(row.due_date) < startOfDay(today)
                 = 2   (the two past-due sent rows)
```

The `/invoices?status=overdue` link in the dashboard banner (`dashboard/page.tsx:153`) ALSO relies on the dashboard's definition — the server applies `eq('status','overdue')` and returns zero rows, producing an empty "Vencida" tab even while list rows elsewhere render the red overdue style. The "Vencida" tab badge counter in `invoices/page.tsx:134 → summary.status_counts.overdue` is the same zero, for the same reason.

### Urgency ordering
Not reproducible because not implemented. `src/app/(app)/invoices/page.tsx` never calls `useInvoices({ sortBy: 'urgency' })` (and `'urgency'` is not a valid sort field — `src/app/api/invoices/route.ts:354`). The list keeps the default `created_at desc` regardless of overdue state. Ripgrep for `urgency` across `src/` returns no hits.

### Data seed (if any)
None. Reporter's staging dataset already contains overdue-boundary rows (two `sent` invoices past `due_date`) that expose the divergence directly.

## Root Cause
**Two independent implementations of "overdue", neither of which references the other, plus a missing urgency comparator.**

1. The dashboard aggregation (`src/app/api/invoices/dashboard/route.ts`) was written against the *stored* enum value `invoices.status = 'overdue'`. That value is part of the schema but no part of the app writes it — there is no scheduled job, trigger, or API path that transitions `sent → overdue` when `due_date` passes. The dashboard is therefore computing against a status that exists in the enum but never in the data, so it always returns 0 overdue, 0 overdue_total, and `status_counts.overdue = 0`.
2. The invoices list (`src/app/(app)/invoices/page.tsx`) correctly treats overdue as a *derived* state via `src/lib/utils/overdue.ts`, but only for the per-row visual badge + row styling. It does not push that definition back to the server, so the `?status=overdue` query param and the status-tab counter still ask the server about the stored enum.
3. The shared util `src/lib/utils/overdue.ts` is the right abstraction but is consumed on only one side (list). The dashboard route.ts does not import it and could not use it as-is because it runs server-side over an aggregated SQL query, not over rows.
4. "Urgency ordering" has no implementation at all — no `urgencyScore(invoice)` util, no `sortBy=urgency` branch, no ORDER BY combination in the SQL. The expected behaviour in the ticket (overdue-first by days-overdue desc, then non-overdue sent by due_date asc) is simply missing.

So the defect is genuine on both axes: a data-semantic inconsistency caused by two sources of truth for overdue, and a pure missing-feature for urgency sort. The two together look like one bug because they manifest on the same screens.

## Decision
**Verdict:** VALID
**Justification:** The ticket's two claims are both reproducible against live staging data: dashboard `overdue_count = 0` while the list correctly flags two sent-past-due rows as overdue, and the list ordering is `created_at desc` instead of the contracted urgency order. The underlying cause is architectural (no single source of truth for the derived `overdue` predicate, no urgency comparator) rather than a typo or timezone edge case, so a real code change is required.
**Jira custom field suggestion (Root Cause):** logic-error (primary: two divergent implementations of the same derived predicate). Secondary aspect: missing-feature (urgency sort never wired up).

## Recommended fix
- **Scope:** m
- **Files to touch:**
  - `src/lib/utils/overdue.ts` — extend with a server-safe boundary + urgency helpers:
    - `overdueBoundaryISODate(): string` — returns `YYYY-MM-DD` for "today" in the app's TZ, usable as a `.lt('due_date', boundary)` filter.
    - `urgencyScore(invoice): number` — combines days-overdue (desc) with `due_date` (asc) to a single orderable key, mirroring the `isInvoiceOverdue` semantics.
    - Export both alongside the existing `isInvoiceOverdue`, `getDaysOverdue`, `getEffectiveStatus`, `formatDaysOverdue`.
  - `src/app/api/invoices/dashboard/route.ts:60-93` — replace the literal `status === 'overdue'` branches with a derived computation: count/summate rows where `status = 'sent' AND due_date < <boundary>` for `overdue_*`; keep `pending_total` as `status = 'sent'` (since derived-overdue is a subset of sent); recompute `status_counts.overdue` as the same derived count and subtract it from `status_counts.sent` so the tabs add up. Use `overdueBoundaryISODate()` to get the cutoff.
  - `src/app/api/invoices/route.ts:354-441` — (a) add `'urgency'` as a sort option; when requested, order by a SQL expression equivalent to `urgencyScore` (e.g. `ORDER BY (status = 'sent' AND due_date < CURRENT_DATE) DESC, due_date ASC` — overdue rows first, oldest due first). (b) Optionally, translate `?status=overdue` to the derived filter `status='sent' AND due_date < boundary` server-side, so the dashboard banner link and the "Vencida" tab both land on the same rows the list highlights.
  - `src/app/(app)/invoices/page.tsx:99-111` — pass `sortBy: 'urgency'` as the default (or expose it in a sort dropdown per SQ-50 AC).
  - Optional DB hardening (preferred long-term):
    - Add a Postgres **generated column** `is_overdue BOOLEAN GENERATED ALWAYS AS (status = 'sent' AND due_date < CURRENT_DATE) STORED`, or better a **view** `invoices_with_effective_status` exposing `effective_status` and `days_overdue`. Both sides then query the view. This removes the possibility of future drift.
    - Decide whether to keep the `'overdue'` enum value at all. It is a trap: it exists but nothing writes it. Either (a) keep it and add a cron/trigger that transitions `sent → overdue` at midnight user-TZ, or (b) deprecate it from the enum and use only the derived `is_overdue` computed column. Option (b) is cleaner and aligns with `src/lib/utils/overdue.ts`'s existing docstring ("Overdue is a derived status, not stored in DB").
- **Approach:**
  1. Extract the derived predicate into the shared util with both a row-level (`isInvoiceOverdue`) and an SQL-level (`overdueBoundaryISODate`) flavour.
  2. Rewrite the dashboard aggregation to use the derived formula. Ship behind a typed contract — `DashboardSummary.status_counts.overdue` becomes "derived overdue count" explicitly in the type comment.
  3. Add `urgency` as a first-class sort key in the list API and make it the default for the invoices page. Mirror the SQL in a reusable helper so tests can assert it.
  4. Add unit tests for `isInvoiceOverdue` (due_date < today, = today, > today, status != sent, null due_date, TZ boundary case), `getDaysOverdue`, and `urgencyScore` (all three orderings: overdue vs overdue, overdue vs sent, sent vs sent).
  5. Add an integration test that seeds a `sent` invoice with `due_date = CURRENT_DATE - 1` and asserts both `/api/invoices/dashboard.overdue_count === 1` AND the `/api/invoices?sortBy=urgency` list returns it first with the red badge.
  6. Long-term: introduce the generated column/view and collapse both callers to read `effective_status` / `is_overdue` directly, at which point `src/lib/utils/overdue.ts` becomes a thin client-side reflection of the DB truth.
- **Tests to add:**
  - Unit: `src/lib/utils/overdue.test.ts` — boundary conditions above.
  - Integration: `src/app/api/invoices/dashboard/route.test.ts` — seeded row with sent/past-due appears in `overdue_count`.
  - E2E (KATA): extend SQ-50 spec with a scenario that creates a boundary-overdue invoice and asserts the dashboard tile, banner, list row style, list tab count, `?status=overdue` URL, and urgency ordering are all consistent.

## Additional notes
- **SQ-175 relationship.** Same anti-pattern on the same route. SQ-175 is "dashboard monthly metrics use paid-status totals instead of `paid_at` semantics"; this report is "dashboard overdue uses stored status instead of derived status". Both boil down to `src/app/api/invoices/dashboard/route.ts` computing aggregations over columns that don't match the product's semantic contract (`status`-only vs. status+timestamp). It would be efficient to fix SQ-175 and SQ-176 together since both changes touch the same handler and both benefit from the same "derive, don't store" approach (generated columns / view).
- **SQ-177 relationship.** SQ-177 is filter persistence for the `/invoices` status tabs. If SQ-176's recommendation (translate `?status=overdue` to the derived filter on the server) is accepted, SQ-177's persisted-state URL needs no change because the URL shape stays `?status=overdue` — only the server interpretation changes. Worth coordinating so SQ-177's tests assert the derived rows, not the (currently empty) stored-enum rows.
- **Cluster observation.** SQ-175 / SQ-176 / SQ-177 are symptoms of the same architectural gap: the `invoices` table models status as a stored enum while the product treats it as a derivation of `status + due_date + paid_at`. A small migration that introduces `effective_status` + `is_overdue` generated columns (or an `invoices_effective` view) would collapse the three bugs into one coherent shared contract and prevent a fourth variant from appearing.
- **Enum trap.** The `'overdue'` value in the `invoice_status` enum is a code smell: present in the schema, referenced across filters and status counts, and yet never written. Either promote it to a real state (schedule a transition job, set it at send-time + expire, store it) or retire it. Leaving it half-implemented is exactly what caused this defect.
- **Scoping note.** The fix is strictly server-side + util extraction; the list page already does the right thing visually, so no regression risk on row rendering. Main review focus: the dashboard aggregation rewrite and the `urgency` SQL expression.
