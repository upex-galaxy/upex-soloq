# Incident Investigation: SQ-172

## Metadata
- **Key:** SQ-172
- **Type:** Defect
- **Priority:** Highest
- **Status:** Open
- **Assignee:** Ronny Toro
- **Reporter:** Ronny Toro
- **Sprint:** SoloQ Sprint 2
- **Linked US/items:** Relates to SQ-19 ("Delete Client" user story, Ready For QA); Parent Epic SQ-13 ("Client Management"); Labels: `DeleteClient`. Cross-related sibling defect: SQ-171 (same claim for `draft` invoices).

## Summary
The defect claims client deletion nulls out `client_id` on paid invoices and physically removes the client row. The claim is factually incorrect: the app performs a soft delete (sets `clients.deleted_at`), the client row is preserved, and the FK `invoices.client_id → clients.id` has `ON DELETE RESTRICT` with `invoices.client_id` declared `NOT NULL`, so the "becomes NULL" outcome is schema-impossible.

## Context
### Feature affected
- **User story:** SQ-19 "Delete Client" — specifies soft-delete semantics.
- **Business impact:** Zero. Traceability is preserved. Reporter's perceived impact (audit risk, revenue inconsistency) is based on a false premise.

### Reporter observations
Description states that after deleting a client with a paid invoice:
1. "Client is physically removed" (claim)
2. "Paid invoice remains" (correct)
3. "`client_id` becomes NULL" (claim)

Reporter proposes FK `ON DELETE RESTRICT`, backend validation, soft delete, explicit block for paid invoices.

All four of those "recommendations" are already implemented except for an explicit block before soft-deleting, which the SQ-19 acceptance criteria intentionally does NOT require.

## Related files / code
- `src/app/api/clients/[id]/route.ts:206-264` — `DELETE` handler performs a soft delete via `UPDATE clients SET deleted_at = now()` (no hard DELETE, no FK modification).
- `src/app/api/clients/[id]/route.ts:56,110,143,229` — `is('deleted_at', null)` filter keeps soft-deleted clients out of queries.
- `src/app/api/clients/route.ts:73,176` — List and duplicate-email checks exclude soft-deleted rows.
- `src/hooks/clients/use-delete-client.ts:11-27` — Client hook hits the DELETE API; no hard delete path exists.
- `src/components/clients/delete-client-dialog.tsx:1-91` — Confirmation dialog (Scenario 3 of SQ-19).
- `src/app/api/invoices/route.ts:370,424` — Invoice list uses `client:clients!inner(...)`. This does NOT filter `deleted_at`, so invoices with soft-deleted clients are still returned with full `client` data (verified below in reproduction).
- `src/app/api/clients/[id]/invoices/route.ts` — Per-client invoice history route remains usable because the client row still exists.
- DB schema (queried live, no migration file for `deleted_at`):
  - `clients.deleted_at TIMESTAMPTZ NULL` (added out-of-band; no migration in `supabase_migrations.schema_migrations` — see Additional notes).
  - `invoices.client_id UUID NOT NULL` with FK `invoices_client_id_fkey → clients(id) ON DELETE RESTRICT`.
- Migrations reviewed: `20260120204706_create_clients_table`, `20260120204741_add_invoices_tbl`, `20260120204833_add_rls_clients`.

## Reproduction attempt
### Steps
Attempted to reproduce exactly as described in the ticket against the staging database (`czuusjchqpgvanvbdrnz`), using reporter's own data for `rtoro@test.com` (user_id `74b68b11-72ab-4db0-add8-234dfb66f755`).
1. Query the `invoices` table for paid rows with `client_id IS NULL` (the "database evidence" in the ticket).
2. Inspect all rtoro's clients and invoices to verify actual state after his deletion flow.
3. Verify FK delete rule and NOT NULL constraint on `invoices.client_id`.

### Result
- **Reproduced:** NO
- **Evidence:**
  - `SELECT COUNT(*) FROM invoices WHERE status = 'paid' AND client_id IS NULL;` → `0` rows across the entire DB (97 invoices total).
  - rtoro's data after he executed the "repro":
    - Client `Michael Scott` (id `e16527ee-...`) → `deleted_at = 2026-04-06 04:37:15+00` (soft-deleted, NOT removed).
    - Invoice `INV-2026-0003` → `status=paid`, `client_id = e16527ee-...` (intact, points at the soft-deleted client).
    - Inner join `invoices → clients` returns the Michael Scott row with `deleted_at` populated.
  - FK metadata: `invoices.client_id` → `clients.id`, `delete_rule = RESTRICT`; column `client_id` is `NOT NULL`. A hard DELETE of a client with any invoices would be rejected at the DB level; a SET NULL outcome is impossible because the column is NOT NULL.
  - Every relevant source line (`route.ts` DELETE handler, migration FK declaration) corroborates soft-delete semantics — no code path hard-deletes clients.

### Data seed (if any)
None. Reporter's own staging data (Michael Scott + INV-2026-0003) already represents the scenario from the ticket.

## Root Cause
No defect in code or data. The ticket rests on a misread of observable state:
- `src/app/api/clients/[id]/route.ts:237-243` does `UPDATE clients SET deleted_at = now()`, not `DELETE`. After deletion, the client row is still present in the DB; only `clients_select_own` + application filters (`is('deleted_at', null)`) hide it from the UI list. Seeing the client disappear from the Clients page is the intended behaviour per SQ-19 Scenario 2.
- `invoices.client_id` remains the original UUID. The reporter's SQL snippet in the ticket (`WHERE status = 'paid' AND client_id IS NULL`) returns zero rows in production (verified live), contradicting "Invoices found without client reference after client deletion."
- The FK is already `ON DELETE RESTRICT` and the column is `NOT NULL`, so the worst-case described by the reporter is schema-impossible.
- Accounting traceability is intact: joins from `invoices` to `clients` still resolve (inner join succeeds). `src/app/api/invoices/route.ts:370,424` already returns full client payload for invoices belonging to soft-deleted clients.

## Decision
**Verdict:** INVALID
**Justification:** Behaviour matches SQ-19 acceptance criteria verbatim ("Scenario 2: Delete client with invoices (soft delete) — The client is hidden from my list but invoices still reference them"). The asserted database evidence (`client_id IS NULL`) does not exist in the database and cannot exist given the schema (FK RESTRICT + NOT NULL). No code change is warranted.
**Jira custom field suggestion (Root Cause):** not-a-bug

## Recommended fix
- **Scope:** xs (documentation only — no code change)
- **Files to touch:** none in `src/`. Optional: add a reply on SQ-172 clarifying soft-delete semantics; optionally open a tech-debt ticket to formalise the missing migration for `clients.deleted_at` (see Additional notes).
- **Approach:** Close SQ-172 as Invalid/Won't Fix with the evidence from this report. If Product still wants an explicit "block delete when there are paid invoices" UX, that is a new scope-change request against SQ-19 (current AC says the opposite — soft delete should succeed).
- **Edge cases:** If Product later wants to hide deleted clients' invoice rows in reports, the invoice list inner join already returns them; a downstream filter would be the place. Not part of this defect.
- **Tests needed:** None new. Existing assumptions (soft delete preserves `client_id`, invoice list keeps returning invoices for deleted clients) are already exercised by SQ-19 manual tests.

## Additional notes
- **Sibling ticket SQ-171** makes the identical "`client_id = NULL` after deletion" claim for `draft` invoices. Same root cause, same verdict — both tickets rest on a wrong assertion about the DB. They should be closed together with a shared explanation.
- **Unmigrated schema change:** `clients.deleted_at` is present on the live DB (used heavily across `src/app/api/**`) but does not appear in `supabase_migrations.schema_migrations` (no migration named for a `deleted_at` / soft-delete addition — migrations only cover the original `create_clients_table` and later unrelated ALTERs). This is not the cause of SQ-172 but is a separate tech-debt item worth filing so local/dev DBs stay in sync.
- **Join behaviour worth noting (not a bug for this ticket):** `src/app/api/invoices/route.ts:370,424` uses `clients!inner` without filtering `clients.deleted_at`. That means invoices belonging to soft-deleted clients DO show up in the invoice list with the client's original name — which is the correct behaviour for traceability and matches SQ-19 Scenario 2. If Product ever changes its mind and wants those invoices hidden, that becomes a new story, not a fix for SQ-172.
- **Supabase project:** `czuusjchqpgvanvbdrnz`. Evidence was gathered via read-only `SELECT` through the Supabase MCP; no mutations were issued.
