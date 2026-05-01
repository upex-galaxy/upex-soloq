# Incident Investigation: SQ-171

## Metadata
- **Key:** SQ-171
- **Type:** Defect
- **Priority:** Highest (ticket summary prefixes `DC |`; inherited from the Delete Client cluster)
- **Status:** Open
- **Assignee:** Ronny Toro
- **Reporter:** Ronny Toro
- **Sprint:** SoloQ Sprint 2
- **Linked US/items:** Relates to SQ-19 ("Delete Client", Ready For QA); Parent Epic SQ-13 ("Client Management"); Labels: `DeleteClient`. Sibling defect: **SQ-172** (same claim for `paid` invoices — see `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/.context/reports/incident-SQ-172-investigation.md`).

## Summary
The defect claims that deleting a client "physically removes" the client record and leaves its draft invoices with `client_id = NULL`, creating orphan records. The claim is factually wrong on both counts. The app performs a soft delete (sets `clients.deleted_at`), the client row is preserved, and the FK `invoices.client_id → clients.id` has `ON DELETE RESTRICT` with `invoices.client_id` declared `NOT NULL`. The "becomes NULL" outcome is schema-impossible, and live DB state confirms no such row exists. The code path for client deletion has no branch on invoice status — drafts and paid invoices are treated identically (i.e., left untouched). SQ-171 is a duplicate of SQ-172 with the same root cause.

## Context
### Feature affected
- **User story:** SQ-19 "Delete Client" — mandates soft-delete semantics with preservation of invoice references.
- **Business impact:** Zero. Traceability is preserved. The purported "orphan records / reporting errors / logic failing on NULL `client_id`" impact rests on an observation that contradicts both the schema and the production data.

### Reporter observations
Ticket summary: `DC | SQ-19 - Client deletion with draft invoices leaves orphan invoices (client_id NULL)`.

Description states that after deleting a client that has at least one **draft** invoice:
1. "The system allows deletion and physically removes the client record" (claim).
2. "Associated invoices remain in the database with `client_id = NULL`" (claim).
3. Suggested evidence: `SELECT id, status, client_id FROM invoices WHERE client_id IS NULL;` → "Invoices found with NULL reference after deletion." (claim).

Reporter lists the impact as data integrity inconsistency, dashboard/reporting errors, orphan records, and future logic on `client_id` breaking.

## Related files / code
- `src/app/api/clients/[id]/route.ts:206-264` — `DELETE` handler performs a **soft delete** via `UPDATE clients SET deleted_at = now(), updated_at = now()`. No hard `DELETE` path exists; no branch on invoice status (drafts receive the same treatment as any other status).
- `src/app/api/clients/[id]/route.ts:56,110,143,229` — `is('deleted_at', null)` filter hides soft-deleted clients from UI lists (the only reason they "look" deleted).
- `src/hooks/clients/use-delete-client.ts:11-27` — React Query mutation hook that calls `DELETE /api/clients/[id]`. No alternative delete path. No invoice-status awareness.
- `src/components/clients/delete-client-dialog.tsx` — Confirmation dialog per SQ-19 Scenario 3.
- `src/app/api/invoices/[id]/route.ts:480-537` — **Unrelated** hard delete of draft invoices, triggered only by deleting an **invoice** (not a client). Cascades to `invoice_items`, never nulls `client_id` on other rows. Confirms the only hard-delete path in the client/invoice area is invoice-initiated, not client-initiated.
- `src/app/api/invoices/route.ts:370,424` — Invoice list uses `clients!inner(...)` without filtering `deleted_at`, so drafts pointing at a soft-deleted client still resolve their client join (traceability preserved).
- Grep confirmation: `Grep status.*draft|draft.*status` inside `src/app/api/clients/**` → zero matches. The client deletion endpoint never reads invoice status.
- DB schema (live):
  - `invoices.client_id UUID NOT NULL` with FK `invoices_client_id_fkey → clients(id) ON DELETE RESTRICT`.
  - `clients.deleted_at TIMESTAMPTZ NULL` (soft-delete flag; present live but without a dedicated migration — inherited tech debt, see SQ-172 Additional notes).
- Triggers on `clients` / `invoices`: only `update_*_updated_at` on UPDATE. No trigger touches `invoices.client_id` when a client row is updated/deleted.
- Migrations reviewed: `20260120204706_create_clients_table`, `20260120204741_add_invoices_tbl`, `20260120204833_add_rls_clients`.

## Reproduction attempt
### Steps
Attempted to reproduce exactly as described against staging DB `czuusjchqpgvanvbdrnz`, using the reporter's own account `rtoro@test.com` (`user_id = 74b68b11-72ab-4db0-add8-234dfb66f755`).
1. Ran the reporter's verbatim "database evidence" query: `SELECT id, status, client_id FROM invoices WHERE client_id IS NULL;`.
2. Ran a draft-specific variant: `SELECT COUNT(*) FROM invoices WHERE status = 'draft' AND client_id IS NULL;`.
3. Inspected rtoro's drafts and the state of their clients after his reproduction flow.
4. Verified FK delete rule, `NOT NULL` constraint, and absence of triggers modifying `invoices.client_id`.

### Result
- **Reproduced:** NO
- **Evidence:**
  - Reporter's SQL (`WHERE client_id IS NULL`) → `[]` (zero rows) across the entire database (97 invoices total, 84 drafts).
  - Draft-specific check → `draft_null_client = 0`.
  - rtoro's drafts after his "repro" run:
    | Invoice        | Status | client_id (present?) | Client name     | Client `deleted_at`         |
    | -------------- | ------ | -------------------- | --------------- | --------------------------- |
    | INV-2026-0005  | draft  | ff374aef-…           | Kevin Malone    | 2026-04-06 04:15:30+00 (soft-deleted) |
    | INV-2026-0004  | draft  | ecfba95f-…           | Andy Bernard    | NULL                        |
    | INV-2026-0002  | draft  | 719e0fcd-…           | Dwight Schrute  | 2026-04-06 03:44:22+00 (soft-deleted) |
    | INV-2026-0001  | draft  | e523f64d-…           | Jim Halpert     | NULL                        |
    The two drafts whose clients rtoro deleted (Kevin Malone, Dwight Schrute) have their `client_id` intact and resolvable to the soft-deleted client row. Zero NULLs. Globally, 2 drafts point at soft-deleted clients — all with non-NULL `client_id`, exactly as the design requires.
  - FK metadata: `invoices_client_id_fkey` → `clients(id)`, `delete_rule = RESTRICT`, `client_id` is `NOT NULL`. A hard DELETE of a client with any invoice row would be rejected at the DB level; a `SET NULL` outcome is impossible because the column is `NOT NULL` (no `ON DELETE SET NULL` clause exists either).
  - Triggers: only `update_updated_at_column` on UPDATE of `clients` / `invoices`. Nothing touches `invoices.client_id` on client deletion.
  - Source walk: `src/app/api/clients/[id]/route.ts` `DELETE` → single `UPDATE clients SET deleted_at = now()` call. No invoice-status branch, no cascading to `invoices`. React Query hook is the only caller from the UI.

### Data seed (if any)
None. rtoro's staging data already represents the scenario (two soft-deleted clients, two drafts pointing at them — full traceability preserved).

## Root Cause
No defect in code or data. The ticket rests on the same misread of observable state as SQ-172:
- The endpoint soft-deletes the client; the row is still in `public.clients` with `deleted_at` populated. UI filters (`is('deleted_at', null)`) hide it from the Clients page, which is the intended SQ-19 behaviour. Reporter interpreted the disappearance from the UI as "physically removed".
- `invoices.client_id` retains its original UUID. The reporter's `WHERE client_id IS NULL` query returns zero rows in production (verified live with MCP SELECT), directly contradicting "Invoices found with NULL reference after deletion."
- The schema makes the described outcome impossible: FK `RESTRICT` blocks cascading deletes, and `NOT NULL` blocks any `SET NULL` path (which the FK does not declare anyway).
- Draft-specific code paths **do not exist** for client deletion — `Grep` over `src/app/api/clients/**` finds no `draft`/`status` references. Drafts and paid invoices are handled identically (i.e., untouched) by the client DELETE endpoint. This rules out the hypothesis that drafts follow a different code path.
- Accounting traceability: the invoice list (`src/app/api/invoices/route.ts`) uses `clients!inner` without filtering `deleted_at`, so drafts like INV-2026-0005 still display with their client's name and data.

## Decision
**Verdict:** INVALID (duplicate of SQ-172, same root cause).

**Justification:** Live DB evidence refutes the reporter's core SQL claim (zero rows with `client_id IS NULL`, zero drafts with `client_id IS NULL`). The schema (FK RESTRICT + column NOT NULL) makes the described failure mode impossible, regardless of invoice status. The client DELETE handler has no branch on invoice status, so SQ-171 cannot diverge behaviourally from SQ-172 — the two tickets describe the same (non-existent) bug twice, once per invoice status. Behaviour observed matches SQ-19 Scenario 2 verbatim: "Delete client with invoices (soft delete) — the client is hidden from my list but invoices still reference them." No code change is warranted.

**Jira custom field suggestion (Root Cause):** `not-a-bug` (duplicate of SQ-172).

## Recommended fix
- **Scope:** xs (documentation / Jira admin only — no code change).
- **Files to touch:** none in `src/`. Close SQ-171 as Invalid/Duplicate of SQ-172 with a short reply citing this report and SQ-172's. If Product insists on an explicit "block client deletion when drafts exist" UX, that becomes a scope-change request on SQ-19 and contradicts its current Scenario 2 — handle separately.
- **Approach:** Link SQ-171 ↔ SQ-172 as duplicates in Jira and close one in favour of the other. Keep the soft-delete semantics as designed.
- **Edge cases:** If Product later wants soft-deleted clients' drafts filtered out of certain views (e.g., dashboards), that is a downstream filter change on `src/app/api/invoices/route.ts` and not relevant to this ticket.
- **Tests needed:** None new. SQ-19 manual tests already cover soft-delete + invoice retention.

## Additional notes
- **Duplicate relationship:** SQ-171 and SQ-172 are the same claim, differing only by invoice status (`draft` vs `paid`). Because client deletion has zero awareness of invoice status, there is no universe in which one would reproduce and the other wouldn't. They should be closed together (or SQ-171 closed as a duplicate of SQ-172) with a shared Jira comment.
- **Sample evidence in rtoro's data:** INV-2026-0005 (draft) and INV-2026-0002 (draft) are the most direct refutation — both reference soft-deleted clients via a populated `client_id`, exactly the outcome the ticket claims is absent.
- **Unmigrated `clients.deleted_at`:** Same tech debt observation as SQ-172 — `clients.deleted_at` is used live but has no dedicated migration in `supabase_migrations.schema_migrations`. Not a cause of this defect; worth filing as a separate tech-debt item to keep dev DBs in sync.
- **Read-only investigation:** All evidence gathered via Supabase MCP `SELECT` + `information_schema` queries. No mutations, no Jira changes. Supabase project: `czuusjchqpgvanvbdrnz`.
- **Cross-link:** Companion report `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/.context/reports/incident-SQ-172-investigation.md` (same author, same codebase state, same verdict).
