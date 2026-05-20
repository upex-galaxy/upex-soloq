# Incident Investigation — SQ-175

## Metadata

| Field            | Value                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------- |
| Ticket           | SQ-175                                                                                |
| Title            | SQ-52: Monthly summary semantics inconsistent (paid_at mismatch and trend data)       |
| Type             | Defect                                                                                |
| Priority         | Medium                                                                                |
| Status           | Open                                                                                  |
| Assignee         | Fernando Javier Masci                                                                 |
| Parent US        | SQ-52 (Monthly income summary)                                                        |
| Related tickets  | SQ-174 (paid_at NULL bug), SQ-47 (dashboard), SQ-176 (overdue inconsistency)          |
| Investigator     | AI incident analyst                                                                   |
| Investigation    | Read-only                                                                             |
| Date             | 2026-04-20                                                                            |
| Evidence (Jira)  | `sq52-dashboard-summary-2026-04-12.png`, `sq52-update-after-payment-dashboard-2026-04-12.png` |

---

## Summary

The dashboard Monthly Income summary (card + 6-month trend chart + trend badge) does
**not** use `paid_at` (the date the invoice was paid) for monthly bucketing. It uses
`updated_at` instead. Combined with SQ-174 (paid_at is never written by the
mark-as-paid flow, so the column is almost always NULL), this produces two visible
defects reported by QA on 2026-04-12:

1. "Cobrado este mes" and "Ingreso Mensual" totals do not match a paid_at-based
   expectation (they reflect whenever an invoice row was last updated, not when it
   was paid).
2. The 6-month trend chart shows zeros for every historical month even though
   paid invoices with issue dates in those months exist in Staging, because all
   of those rows were bulk-updated into April via a seed/backfill and therefore
   collapse into the current month under `updated_at` semantics.

Root cause has two layers: (a) the API uses `updated_at` as a proxy for payment
date (semantic bug in SQ-52's implementation) and (b) SQ-174 means even the
correct column (`paid_at`) would be mostly NULL today (data-quality bug in the
mark-as-paid flow).

---

## Context — Business Impact

- The dashboard is the first screen a user lands on after login; "Cobrado este
  mes" and the Tendencia de Ingresos chart are the headline KPIs.
- Users see an inflated `paid_this_month` (because any invoice touched this
  month — including status changes, edits, or a backfill — is counted as
  "collected this month").
- The MoM trend badge (`+X%`, `-X%`, `flat`, `new`) is computed from the same
  flawed pair of windows, so the direction indicator itself can be wrong.
- The 6-month bar chart renders a flat/empty history, which defeats the entire
  purpose of SQ-52 (showing the user their income trend).
- On Staging today, the dashboard card reads **$42,267.27** for April while the
  canonical paid_at-based answer is **$270.00** — a 156x overstatement.

---

## Related Files

| File                                                                                 | Role                                                                                                                         |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/app/api/invoices/dashboard/route.ts` | API endpoint that computes `paid_this_month`, `trend_percentage`, `trend_label`, and `chart_data`. Uses `updated_at` for all three (lines 96-102, 121-127, 171-177). |
| `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/app/(app)/dashboard/page.tsx`        | UI. Labels the value as "Cobrado este Mes" / "Ingreso Mensual" / "Ingresos cobrados en los últimos 6 meses" — all of which imply paid_at semantics. |
| `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/components/invoices/monthly-income-chart.tsx` | Chart component. Tooltip label "Cobrado" reinforces the paid_at reading. |
| `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/hooks/invoices/use-dashboard-summary.ts`     | React-Query hook that consumes the API response verbatim. No client-side transformation. |
| `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/lib/types.ts`                        | `DashboardSummary` and `MonthlyChartData` type contracts.                                                                    |
| `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/types/supabase.ts`                   | Generated DB types — `paid_at: string \| null` is declared on the `invoices` row (lines 246, 270, 294) but it is **never referenced in application code**. |

Grep confirmation: `paid_at` appears only in the generated types file across the
entire `src/` tree. Not a single handler writes it (SQ-174) and not a single
query reads it (SQ-175).

---

## Reproduction — Concrete Numbers From Staging DB

Query on project `czuusjchqpgvanvbdrnz`, executed 2026-04-20 (reference date
identical to the on-screen "now" for the dashboard).

### Invoices in status=paid

| Metric                                                                   | Count |
| ------------------------------------------------------------------------ | ----- |
| Total paid invoices (deleted_at IS NULL)                                 | 9     |
| Paid with `paid_at IS NULL`                                              | **8** |
| Paid with `paid_at` populated                                            | 1     |
| Paid with `updated_at` in current month (what the dashboard counts)      | 9     |
| Paid with `paid_at`    in current month (canonical definition)           | 1     |
| Paid with `issue_date` in current month                                  | 4     |

8 of 9 paid invoices (**89%**) have `paid_at = NULL`. This is the SQ-174
data-quality bug surfacing here.

### Monetary impact — current month (April 2026)

| Bucketing semantics                                     | Total (USD) |
| ------------------------------------------------------- | ----------- |
| `updated_at` in April (what the dashboard renders today) | **$42,267.27** |
| `paid_at`    in April (canonical)                        | **$270.00**    |
| `issue_date` in April (among paid)                       | $33,143.00     |

The dashboard currently overstates "Cobrado este Mes" by **~$41,997** / **156x**
vs. the canonical paid_at-based answer.

### Six-month chart reconstruction

| Month    | Bucketed by `updated_at` (code) | Bucketed by `paid_at` (canonical) | Count (updated_at) | Count (paid_at) |
| -------- | ------------------------------- | ---------------------------------- | ------------------ | --------------- |
| Nov 2025 | $0.00                           | $0.00                              | 0                  | 0               |
| Dec 2025 | $0.00                           | $0.00                              | 0                  | 0               |
| Jan 2026 | $0.00                           | $0.00                              | 0                  | 0               |
| Feb 2026 | $0.00                           | $0.00                              | 0                  | 0               |
| Mar 2026 | **$0.00** (8 invoices issued in Mar collapsed into Apr) | $0.00 (paid_at NULL) | 0                  | 0               |
| Apr 2026 | $42,267.27                      | $270.00                            | 9                  | 1               |

This matches the QA observation exactly: "historical chart points remain zero
despite seeded paid_at records." They are zero because:

- The `updated_at` path collapses every row with a March `issue_date` into the
  April bucket (they were all bulk-updated 2026-04-13 14:14:28 UTC).
- The `paid_at` path would correctly bucket them to March — if SQ-174 were
  fixed. Today it can't, because 8/9 have NULL paid_at.

### Trend calculation impact

`paid_rows` in current month = 9 (updated_at), `paid_rows` in previous month =
0. `calculateTrend(current, 0)` returns `{ percentage: null, label: 'new' }`
(see route.ts:204-206), so the chip shows "Nuevo" instead of an actual MoM
percentage. Under canonical semantics the answer should be "Nuevo" for April
(1 paid, Mar=0) but with a $270 total, not $42,267.27.

---

## Root Cause

Two layered defects feed into the same visible symptom.

### Layer 1 — Semantic ambiguity (this ticket, SQ-175)

`src/app/api/invoices/dashboard/route.ts` uses `updated_at` as the bucketing
key for everything that claims to be "paid income":

- `paid_this_month` aggregation, lines 96-102, filter: `.gte('updated_at', monthStart).lte('updated_at', monthEnd)`
- Previous-month paid total for the trend calculation, lines 121-127, same pattern
- `getMonthlyChartData` helper, lines 171-177, same pattern

But the UI copy is unambiguously paid_at language:

- Card title: "Cobrado este Mes" (page.tsx:222)
- Card title: "Ingreso Mensual" + description "Resumen de ingresos del mes actual" (page.tsx:282-283)
- Chart title: "Tendencia de Ingresos" + description "Ingresos cobrados en los últimos 6 meses" (page.tsx:347-348)
- Chart tooltip: "Cobrado" (monthly-income-chart.tsx:52)

`updated_at` is a write-timestamp proxy for payment — it moves on **any**
mutation (edit, status change, backfill, future reminder_sent flags, etc.), so
it is not a correct substitute. This is the classic "we don't have the right
column yet, so let's use `updated_at` for MVP" shortcut, and it leaks out as
soon as any non-payment update happens.

The code comment on line 19 of the route even says "month-over-month paid
income change" and line 95 says "invoices with status 'paid' and updated_at in
current month" — the developer was aware of the proxy but shipped it.

### Layer 2 — Data quality (SQ-174)

The `invoices.paid_at` column exists in the schema (supabase.ts:246/270/294)
but **no handler in `src/app/api/invoices/**` reads or writes it** (zero grep
hits outside the generated types file). Whatever mark-as-paid endpoint exists
sets `status='paid'` without stamping `paid_at`. Result: 8 of the 9 paid
invoices on Staging have `paid_at = NULL`.

Consequence: even if SQ-175 is fixed in isolation by swapping `updated_at` →
`paid_at` in the API, the dashboard would collapse to `$270.00` / 1 invoice
for the current month because the remaining 8 paid invoices would be invisible
to any paid_at-based query. The fix must land in the correct order.

### Why SQ-174 and SQ-175 interact

- SQ-174 creates the NULLs.
- SQ-175 hides the NULLs by falling back to `updated_at`, which accidentally
  produces a plausible-looking (but semantically wrong) number.
- QA saw both symptoms on the same evidence screenshots and — correctly —
  filed them as two separate defects.

---

## Decision + Jira Root Cause Custom Field

**Verdict:** confirmed defect. Two independent root causes in the same code
path; both must be fixed for the dashboard to be correct.

- **Primary root cause category (SQ-175):** Semantic / domain-modeling error —
  using `updated_at` as a proxy for `paid_at`. Code bug.
- **Compounding root cause (cross-ref to SQ-174):** Missing side-effect —
  mark-as-paid flow does not stamp `paid_at`. Code bug.

Suggested value for the Jira **Root Cause** custom field on SQ-175:
`Code / Business Logic — incorrect date semantics (updated_at used as proxy for paid_at)`.
Leave cross-reference to SQ-174 in the ticket body so the two are co-resolved.

---

## Recommended Fix (for later — this investigation is read-only)

**Sequencing matters. Land SQ-174 first, or land both together.**

1. **SQ-174 first** — in the mark-as-paid handler, set `paid_at = now()` at the
   same moment `status` transitions to `'paid'`. Backfill existing paid rows
   where `paid_at IS NULL` from `updated_at` (one-time migration) so historical
   data is usable.

2. **SQ-175 (this ticket)** — in `src/app/api/invoices/dashboard/route.ts`
   replace the three `updated_at` windows with `paid_at`:
   - line 101-102 (`paid_this_month` query)
   - line 126-127 (previous-month query used by the trend calc)
   - line 176-177 (`getMonthlyChartData` per-month query)

   Also harden the queries: add `.not('paid_at', 'is', null)` so any residual
   NULL rows are excluded explicitly rather than silently (they are already
   excluded by the range filter, but the intent is clearer this way).

3. **Align UI copy with the canonical semantics** so the contract is visible:
   - If the product decision is paid_at = "cobrado", keep current UI copy and
     fix only the API. This is the most consistent reading of the AC in SQ-52.
   - If the product decides the card should mean "invoiced this month" (much
     less common), change the copy to "Facturado este Mes" and bucket by
     `issue_date`. Current numbers ($33,143.00 by that definition) would still
     not match the on-screen $42,267.27.

4. **Add a test** (covered by sprint-testing/TAE): seed 2 paid invoices with
   paid_at in the current month, 1 in the previous month, and 1 paid invoice
   with a distinct `updated_at` bump (e.g., a client-name edit) and assert the
   dashboard totals reflect paid_at, not updated_at.

5. **Alternative / stopgap** — if SQ-174 cannot land immediately, a defensible
   interim expression is
   `COALESCE(paid_at, CASE WHEN status='paid' THEN updated_at END)` in the
   dashboard queries, plus a TODO pointing at SQ-174. This preserves today's
   numbers (no regression) while allowing new correctly-stamped rows to be
   bucketed properly going forward. It is strictly a short-term bridge.

---

## Additional Notes

- The trend chip logic on `calculateTrend` (route.ts:196-217) is itself fine;
  the bug is purely in the upstream window definition. Once `paid_at` is
  adopted everywhere, the chip will start returning true MoM percentages
  instead of permanent "Nuevo".
- `monthly_pending` (sent/overdue issued this month) correctly uses
  `issue_date` — that is the right semantic for "invoiced this month and still
  unpaid," and it's inconsistent with the rest of the route only because the
  rest of the route is wrong.
- This bug is likely to resurface whenever the product adds any new mutation
  that touches paid invoices (e.g., SQ-168's `send invoice` action bumps
  `updated_at` and would distort the monthly total until this fix lands).
- Cross-reference SQ-176 (overdue inconsistency): similar category of bug —
  dashboard aggregations that rely on derived/proxy fields instead of the
  canonical timestamp. A broader audit of `src/app/api/invoices/dashboard/route.ts`
  for date-semantic drift is worth a follow-up ticket.
- Evidence timestamp sanity check: all 8 NULL-paid_at invoices have an
  identical `updated_at = 2026-04-13 14:14:28.387685+00`, which is the
  fingerprint of a bulk backfill/seed. This is why the chart looks "stuck in
  April" — it's mechanical, not a rendering glitch.

---

**End of investigation — read-only. No Jira modifications made. No code
changes made.**
