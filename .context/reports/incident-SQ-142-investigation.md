# Incident Investigation: SQ-142

## Metadata
- **Key:** SQ-142
- **Type:** Bug
- **Priority:** Medium
- **Status:** In Review (yellow / In Progress category). In the SoloQ workflow, "In Review" is the stage where QA Automation reviews automation feasibility/ROI for an already-fixed or triaged ticket — it is **not** a GitHub "Ready for review" PR stage. As shown below, no code fix exists yet.
- **Assignee:** Ely (elyermad@gmail.com)
- **Reporter context:** Found during Exploratory DB Testing on 2026-03-22.
- **Summary:** `[SQ-32] Subtotal almacenado ≠ suma de ítems — ghost subtotal en factura sin ítems`
- **Related tickets:**
  - Parent feature: SQ-32 (Generate Professional PDF Invoice) — QA Approved but surfaced this DB integrity bug.
  - Sibling SQ-32 bugs: SQ-138 (payment methods on PDF — fixed PR #82), SQ-139 (discount formula — fixed PR #81), SQ-140 (empty business_profile header), SQ-141 (tax_amount=$0 with cap discount — fixed PR #84). SQ-142 is the only remaining SQ-32 bug with no PR on staging.
- **Environment:** Staging — Supabase project `czuusjchqpgvanvbdrnz`.
- **Reporter-provided evidence:** `INV-2026-0002`, `id = 4077bfc1-3cec-4d59-9150-ce3977574b87`, at report time had `subtotal = 10.00` + `item_count = 0` → $10 ghost.
- **Test case:** TC-DB-01 (Invoice integrity — stored subtotal must equal sum of items).

## Summary
The bug is an application-layer integrity gap: `invoices.subtotal` is written from in-memory values (`calculateSubtotal` on the API request) at POST/PUT time, and nothing in the database guarantees it stays in sync with the `invoice_items` rows. Three failure paths can produce a ghost subtotal — the most likely is the known best-effort items-insert in POST (`src/app/api/invoices/route.ts:282-293`) that logs-and-continues instead of aborting when the child insert fails, leaving an invoice row whose `subtotal` was computed from items that were never persisted. There is **no DB trigger**, **no CHECK constraint**, and **no PR in-flight** (searched all 120 PRs, all branches, and commit log). The specific row from the ticket has already been manually reset to `0.00` on 2026-03-29, so the ghost no longer reproduces in the current staging dataset, but nothing in the code prevents it from recurring. Verdict: **reported bug is valid; the In-Review state reflects the Jira workflow stage, not a code fix — no fix exists yet and the defect is still latent.**

## Context

### Business impact
- **PDF coherence:** Per the ticket evidence, the PDF renderer (post-SQ-138 fix) pulls `subtotal` straight from the `invoices` row (`src/app/api/invoices/[id]/pdf/route.ts` → `renderToBuffer(InvoiceDocument(...))`). With 0 items + non-zero subtotal the generated PDF would show an empty items table and a $10 line for subtotal/total — a visibly incoherent, non-defensible invoice toward the client.
- **Cash/A-R risk:** Because `total` is derived from `subtotal` at persist time, a ghost subtotal also inflates `total`, which feeds the payments workflow (`amount_received` validation in SQ-55 compares against `total`). That can cause phantom balances due or premature "overpayment" flags.
- **Data-quality test (TC-DB-01):** Any automated integrity check over `invoices ↔ invoice_items` (`ABS(subtotal - SUM(quantity*unit_price)) > 0.01`) fails as soon as one ghost row exists.

### How the SRS says this should behave
`src/lib/utils/invoice-calculations.ts:199` (`calculateSubtotal`) is the single source of truth for `Subtotal = Σ(quantity × unit_price)`. The business rule is explicit: no items → subtotal = 0. The calc util is correct; the problem is **who invokes it and when**.

## Related files / code

### Server-side subtotal persistence (current behaviour)
- `src/app/api/invoices/route.ts:213-247` — POST. Computes subtotal from the request `items` **before** inserting, writes the invoice row with that `subtotal`, then inserts items in a separate query.
- `src/app/api/invoices/route.ts:282-294` — The best-effort items insert. If `itemsError` occurs, the code path `console.error`s and falls through with `insertedItems = []`. The invoice stays persisted with the precomputed subtotal, but 0 items exist. This is a direct code-level reproducer of the ghost pattern described in the ticket.
- `src/app/api/invoices/[id]/route.ts:337-385` — PUT. Only recomputes subtotal **if the caller sent `items` in the payload** (`itemsChanged = items !== undefined`). Any partial update that omits `items` keeps the stored subtotal verbatim, so edits made via Supabase Studio, direct SQL, a buggy mobile client, or any future code path that sends only `taxRate`/`notes`/etc. can drift.
- `src/app/api/invoices/[id]/route.ts:341-352` — During PUT, items are deleted first, then re-inserted. If the re-insert fails, the code returns 500 but leaves the invoice with a new recomputed `subtotal` **and** zero items (same ghost, different vector).

### Client-side (not the culprit but relevant for evaluating fixes)
- `src/app/(app)/invoices/[id]/edit/page.tsx:127-141, 194-204` — Auto-save always sends the full form payload including `items`, so the normal happy path does keep them in sync via the PUT recompute branch. That is why most staging invoices are currently consistent.
- `src/hooks/invoices/use-auto-save.ts:84-136` — 2 s debounce, posts `form.getValues()`. Confirms `items` is always in the PUT body from the UI.

### Validations / schemas
- `src/lib/validations/invoice.ts:30-97` — `createInvoiceSchema` requires `items` (array, 1..50); **but** there is no min-length business rule for draft creation (items can be empty per the note at line 64). `updateInvoiceSchema` makes `items` optional for partial updates (line 162). So both payload shapes that produce a ghost are legal at the validation layer.

### Database layer (verified live)
```
triggers on invoices / invoice_items:
  invoices → update_invoices_updated_at (BEFORE UPDATE) ← generic updated_at trigger only
  invoice_items → (none)

constraints on invoices / invoice_items:
  invoices:
    check_tax_rate_valid_range  — tax_rate ∈ [0,100]
    chk_discount_percentage_max — percentage discount ≤ 100
    invoices_user_id_invoice_number_key (unique)
  invoice_items:
    invoice_items_quantity_check     — quantity > 0
    invoice_items_unit_price_check   — unit_price >= 0
    invoice_items_invoice_id_fkey    — ON DELETE CASCADE
```
**There is no trigger or constraint that keeps `invoices.subtotal` in sync with `SUM(invoice_items.quantity * invoice_items.unit_price)`.** Hard stop: the DB has zero defense in depth for this invariant.

## Reproduction attempt (SQL evidence)

### Current divergence snapshot on staging (project `czuusjchqpgvanvbdrnz`)
```sql
SELECT COUNT(*) total_invoices,
       COUNT(*) FILTER (WHERE ii_count = 0)                              AS zero_item_invoices,
       COUNT(*) FILTER (WHERE ii_count = 0 AND subtotal > 0)             AS ghost_subtotal,
       COUNT(*) FILTER (WHERE ii_count > 0
                        AND ABS(subtotal - items_sum) > 0.01)            AS divergence_with_items
FROM (
  SELECT i.id, i.subtotal, COUNT(ii.id) ii_count,
         COALESCE(SUM(ii.quantity*ii.unit_price),0) items_sum
  FROM invoices i LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
  GROUP BY i.id
) sub;
```
Result (2026-04-20):
| total_invoices | zero_item_invoices | ghost_subtotal | divergence_with_items |
|---|---|---|---|
| 97 | 14 | 0 | 0 |

### State of the specific ticket row
```sql
SELECT id, invoice_number, subtotal, tax_amount, total, status, created_at, updated_at
FROM invoices WHERE id = '4077bfc1-3cec-4d59-9150-ce3977574b87';
```
| id | invoice_number | subtotal | tax_amount | total | status | created_at | updated_at |
|---|---|---|---|---|---|---|---|
| 4077bfc1… | INV-2026-0002 | 0.00 | 0.00 | 0.00 | draft | 2026-03-08 | **2026-03-29 02:16:25** |

**Interpretation.** The ticket was filed on 2026-03-22 with `subtotal = 10.00`. The `updated_at` on the row is 2026-03-29 02:16 UTC, i.e. the row was touched a week after the report. No commit or PR correlates with that timestamp — the row was either manually edited via Supabase Studio/SQL or overwritten by a PUT from the UI after the user opened the draft. In either case, the ghost **was** present and is no longer, but the cleanup was data-only, not code.

### Remaining zero-item rows
There are 14 `item_count = 0` invoices in staging, all with `subtotal = 0.00` and `status = draft` (one of them is the ticket row). They are mostly fresh drafts created by the "Create invoice" flow before the user added items, which is expected behaviour. So the current divergence count is **0** rows — the defense-in-depth gap is still open, but the symptom is latent.

### Minimal code-level reproducer
POST a new invoice where the items payload would succeed validation (>=1 item, quantity>0, unit_price>=0) but the insert into `invoice_items` fails — e.g. an RLS race, a simulated network error, or a future column added without a default:
1. `src/app/api/invoices/route.ts:231-249` inserts the invoice with `subtotal = calculateSubtotal(items)`.
2. `:282-285` tries to insert the items; if `itemsError` is truthy the code logs and falls through (`:287-290`).
3. The endpoint still returns `201` with the invoice body, and the DB now holds a row with `subtotal > 0` and zero children — the exact ghost pattern in the ticket.

Because the code comment explicitly says *"Invoice was created but items failed - log but don't fail the request. Items can be added later via edit."*, this is a known, intentional branch — which is the most plausible root cause of the reported incident. A secondary vector is the PUT delete-then-insert (`:341-372`) if the re-insert fails between the two statements.

## In-flight fix review

No PR exists. Scope of the search:
- `gh pr list --state all --limit 200 --search "SQ-142 OR subtotal OR ghost OR recalc"` → 0 hits for SQ-142; the only subtotal-related PRs are PR #57 (SQ-23 auto-calculation) and PR #56 (SQ-22 line items), both merged long before the ticket was filed.
- `git log --all --grep="SQ-142|ghost|subtotal|recalc"` → 0 commits mention SQ-142.
- `git ls-remote --heads origin | grep -iE "142|ghost|subtotal|recalc"` → 0 remote branches.
- Repo-wide grep for `SQ-142` returns only `.context/IMPLEMENTATION-ROADMAP.md`, `.context/BUGFIX-ROADMAP.md`, and `.context/reports/sprint-report-2026-04-20.md` — all documentation, no code.

The roadmap entries in `.context/BUGFIX-ROADMAP.md:73` and `:195-198` list SQ-142 explicitly as **OPEN** and unfixed, contradicting the Jira "In Review" label and confirming that the Jira status is a workflow artefact, not evidence of a code fix. There is therefore nothing to evaluate — no approach, no trade-off, no merged/unmerged diff. This is the main finding of the investigation.

## Root Cause

**Classification:** Architectural / Data-Integrity defect. Missing invariant enforcement.

**Technical root cause (primary):** The write path `POST /api/invoices` computes `subtotal` from the in-memory `items` array and persists it to `invoices` before the child `invoice_items` rows are inserted. The child insert is best-effort: any failure is swallowed (logged and returned 201 with empty `items`). The consequence is a persisted parent row whose stored `subtotal` references rows that do not exist — "ghost subtotal". Reference: `src/app/api/invoices/route.ts:231-249` (insert) + `:282-294` (best-effort child insert). Secondary vector: the PUT handler computes a new subtotal from the incoming `items`, deletes existing items, then re-inserts; if the re-insert fails the function returns 500 but the invoice row is already mutated with the new subtotal and no children.

**Structural root cause:** The DB has no enforcement of the invariant `invoices.subtotal = SUM(invoice_items.quantity * invoice_items.unit_price)`. There is no trigger on `invoice_items` to recompute the parent subtotal on INSERT / UPDATE / DELETE, no `CHECK` constraint, and the column is not a generated column. The application layer is the only thing keeping them consistent, and it fails open on child-write errors.

**Why it slipped past SQ-22 / SQ-23 implementation:** SQ-22 added items, SQ-23 added auto-calc. Both stories scoped the write path on the happy path (items insert succeeds). The "items insert fails but invoice is already inserted" branch was intentionally left as a log-and-continue comment (see `src/app/api/invoices/route.ts:289`) under the assumption that the user would re-add items via edit. That assumption is load-bearing for integrity and was never tested by an AC in SQ-22/SQ-23.

## Decision + Jira Root Cause

- **Decision:** Valid bug. No fix in code. Do **not** transition the ticket; it is currently in "In Review" (QA-Automation ROI review) but no PR has been opened and there is no commit correlation. Ely (assignee) should pick it up as Ready For Dev once the ATP + implementation plan are finalized.
- **Recommended Jira Root Cause custom field value:** `Database Integrity / Missing Invariant Enforcement` (or nearest option such as `Data Integrity`, `Backend Logic`, or `Defensive Coding Gap` depending on the project's picklist). Supporting rationale: the defect is not a UI regression, not a 3rd-party integration failure, and not a perf issue — it is an unguarded invariant at the data-model boundary, exploitable via a foreseeable partial-failure path in the POST handler.
- **Report-only constraints honoured:** No Jira mutations, no Supabase migrations, no code edits.

## Recommended fix (defense-in-depth)

The right shape is **two coordinated layers**: application-level transactionality + database-level enforcement. Either one alone is fragile.

### Layer 1 — Server action: make POST/PUT atomic
Switch the two-step parent-then-child writes to a single transactional RPC. Options:

1. **Preferred — Postgres function + `supabase.rpc('create_invoice_with_items', ...)`.**
   - Wrap the parent INSERT + items INSERT + subtotal recompute in a single `BEGIN … COMMIT` server-side function. The function recomputes `subtotal` from the `items` JSON array it received and sets it atomically on the parent. If the items insert fails, the whole transaction rolls back — no orphan parent row.
   - Applies equally to PUT via a `rpc('update_invoice_with_items', ...)` helper that does DELETE + INSERT + RECOMPUTE in one transaction.
2. **Fallback if keeping JS logic — compensating delete.**
   - In `src/app/api/invoices/route.ts:287-290`, on `itemsError`, `await supabase.from('invoices').delete().eq('id', invoice.id)` before returning 500. Removes the swallow-and-continue branch. Same for the PUT re-insert path. Simpler to ship but still racey if the compensating delete itself fails (network drop).
3. **Normalize the read path.**
   - Have the response recompute `subtotal` from the actually-persisted items in the same request, so the value the UI sees is the source of truth even if a future bug reintroduces divergence.

### Layer 2 — Database trigger to enforce the invariant
Add an AFTER INSERT/UPDATE/DELETE trigger on `invoice_items` that re-derives `invoices.subtotal` from `SUM(quantity*unit_price)` on every mutation. Shape:

```sql
CREATE OR REPLACE FUNCTION recompute_invoice_subtotal() RETURNS trigger AS $$
DECLARE
  target_id uuid := COALESCE(NEW.invoice_id, OLD.invoice_id);
BEGIN
  UPDATE invoices i
     SET subtotal = COALESCE(
           (SELECT ROUND(SUM(ii.quantity * ii.unit_price)::numeric, 2)
              FROM invoice_items ii
             WHERE ii.invoice_id = target_id), 0),
         updated_at = NOW()
   WHERE i.id = target_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_items_recompute_subtotal
AFTER INSERT OR UPDATE OR DELETE ON invoice_items
FOR EACH ROW EXECUTE FUNCTION recompute_invoice_subtotal();
```
Notes:
- The trigger must not also recompute `total` (total depends on `discount_type/value` and `tax_rate` which live on `invoices`). Leave `total` / `tax_amount` to the application for now; optionally add a second AFTER UPDATE trigger on `invoices` that re-derives `tax_amount` + `total` from the column values. Keeping scope to `subtotal` minimises blast radius.
- The trigger creates one extra UPDATE per items mutation; acceptable at SoloQ's scale (max 50 items per invoice).
- Must ship as a Supabase migration (`apply_migration`) so it lives in `supabase_migrations.schema_migrations`.

### Layer 3 — Periodic integrity check (cheap belt-and-suspenders)
Add a scheduled query (via Supabase cron / `pg_cron` / a QA TAE job) that runs the HAVING query from the ticket once a day and emits to Sentry if it finds any row. Guards against drift introduced by future migrations, manual admin edits, or third-party data-sync jobs.

### Layer 4 — Data cleanup (one-shot)
For any currently-divergent row (0 in the snapshot above but will recur until layer 1+2 are shipped):
```sql
UPDATE invoices i SET subtotal = 0, total = 0, tax_amount = 0, updated_at = NOW()
 WHERE NOT EXISTS (SELECT 1 FROM invoice_items ii WHERE ii.invoice_id = i.id)
   AND (i.subtotal <> 0 OR i.total <> 0 OR i.tax_amount <> 0);
```
Run only after the trigger is deployed, so the trigger keeps it that way.

### Minimum viable fix if only one PR is possible
Layer 1 option 2 (compensating delete in POST + already-safe 500 return in PUT) is the smallest code change that closes the most probable vector. The DB trigger (Layer 2) is the correct long-term answer — it's ~20 lines of SQL, it closes **all** vectors including future ones, and it makes TC-DB-01 structurally impossible to fail. Ship both.

## Additional notes
- **In-Review ≠ in-code-review.** The SoloQ Jira workflow uses "In Review" for QA-Automation ROI analysis after a ticket is triaged. This differs from GitHub's sense of the phrase and is the reason a careful reader might expect a PR when there isn't one. Recommend future bug reports prefix ticket status with the workflow stage (e.g. `In Review / QA-Auto`) to avoid this confusion.
- **Sibling story SQ-34** (payment methods in PDF) was absorbed by SQ-138's fix. SQ-142 has no equivalent sibling story that would make it a duplicate.
- **Test authorship.** TC-DB-01 (DB integrity) should be promoted from a one-off exploratory check to a standing TAE test once the trigger is in place — automate the HAVING query as a DBHub assertion in the QA suite.
- **Validation gap.** Consider tightening `lineItemsArraySchema` (`src/lib/validations/invoice.ts:54-56`) to `min(1)` for the SEND (status transition draft→sent) path. Currently nothing prevents a user from sending a 0-item invoice, which would deliver the PDF ghost to a real recipient. Out of scope for SQ-142 but the same audit surfaced it.
- **Observation on scope creep.** Because `subtotal`, `tax_amount`, and `total` are all derived values stored in the parent row, the cleanest end-state would be to drop them from `invoices` entirely and make them computed on read (either in the API route or as a generated column / view). That is a larger refactor and should probably live in its own tech-debt ticket, not SQ-142.
