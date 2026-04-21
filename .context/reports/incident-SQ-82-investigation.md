# Incident Investigation: SQ-82

## Metadata
- **Key:** SQ-82
- **Type:** Defect
- **Priority:** High
- **Status:** Open
- **Assignee:** Ely (elyermad@gmail.com)
- **Summary:** CM | SQ-16 edit client presenta inconsistencia de unicidad email (case-insensitive) y validaciones DB parciales
- **Parent US:** SQ-16 "Edit Client Data"
- **Origin:** Consolidated finding from exploratory DB testing on SQ-16 (Trifuerza DB layer).

## Summary
The originally reported behavior — DB allowing two clients of the same `user_id` to coexist with the same `lower(email)` but different casing — is **no longer reproducible**. Migration `20260217221850_add_clients_email_case_insensitive_unique` is already applied on the live DB and creates `idx_clients_user_email_lower UNIQUE (user_id, lower(email)) WHERE deleted_at IS NULL`; the app layer (`/src/app/api/clients/route.ts` and `/src/app/api/clients/[id]/route.ts`) also normalises to lowercase via `email.toLowerCase()` and pre-checks with `.ilike(...)`. However, the "validaciones DB parciales" portion of the ticket is **still valid**: the DB accepts empty `name` (`''`), syntactically invalid email, `address` > 500 chars and `notes` > 1000 chars when the API/UI is bypassed. The schema relies entirely on the Zod schema for content rules; only length caps of `VARCHAR(100/255/20/50)` hit the DB floor.

## Context
### Feature
- **User Story:** SQ-16 Edit Client Data — client CRUD for freelancer accounts.
- **Entity:** `public.clients` — one row per client per freelancer, unique by email per user.
- **Entry points:**
  - UI: `src/app/(app)/clients/[id]/page.tsx` (edit screen), `src/app/(app)/clients/create/page.tsx`.
  - API: `src/app/api/clients/route.ts` (POST), `src/app/api/clients/[id]/route.ts` (PUT / DELETE / GET).

### Business impact (data integrity)
- **Duplication risk (original finding):** two "logically identical" clients for the same freelancer cause duplicate invoicing, inconsistent reporting, and broken search-by-email. This is the primary concern of SQ-82.
- **DB-bypass risk (residual):** any process that writes to `clients` outside the Next.js API (future cron, background jobs, migrations, Supabase SQL console, service-role scripts) can bypass the Zod rules and insert empty names, invalid emails, or over-long text. Downstream consumers (invoices, emailing, PDF generation) assume those contracts already hold.

## Related files / code
### Application layer
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/lib/validations/client.ts`
  - `clientFormSchema` (Zod): `name.min(2).max(100)`, `email.email().max(255)`, `company.max(100)`, `phone.max(20).regex(...)`, `address.max(500)`, `notes.max(1000)`, `tax_id.max(30)`. This is the **only** source of content validation today.
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/app/api/clients/route.ts` (POST)
  - Lines 167–168: `const normalizedEmail = email.toLowerCase();`
  - Lines 170–177: duplicate check via `.ilike('email', normalizedEmail)` + `user_id` + `deleted_at IS NULL`.
  - Lines 184–197: INSERT persists `email: normalizedEmail`.
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/app/api/clients/[id]/route.ts` (PUT)
  - Lines 133–134: normalisation to lowercase.
  - Lines 136–148: `.ilike('email', normalizedEmail).neq('id', id)` duplicate pre-check (409).
  - Lines 150–165: UPDATE persists lowercase email.
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/hooks/clients/use-update-client.ts` and `use-create-client.ts` — thin React-Query wrappers; rely entirely on the API route's validation response.
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/components/clients/client-form.tsx` — RHF + Zod `clientFormSchema`.

### Database layer
- Migration `20260120204706_create_clients_table` — original DDL; `UNIQUE(user_id, email)` (case-sensitive).
- Migration `20260210050613_normalize_client_emails_lowercase` — one-shot data fix: soft-deletes case-duplicates per user, then `UPDATE clients SET email = LOWER(email)`.
- Migration `20260217221850_add_clients_email_case_insensitive_unique` — SQ-82 fix: soft-deletes residual duplicates, then `CREATE UNIQUE INDEX idx_clients_user_email_lower ON clients (user_id, LOWER(email)) WHERE deleted_at IS NULL`. Applied and live.
- Trigger `update_clients_updated_at` (BEFORE UPDATE) — keeps `updated_at = now()`.

### DB indexes currently on `public.clients`
- `clients_pkey (id)`
- `clients_user_id_email_key UNIQUE (user_id, email)` — *case-sensitive legacy UNIQUE still present*.
- `idx_clients_user_email_lower UNIQUE (user_id, lower(email)) WHERE deleted_at IS NULL` — the SQ-82 fix.
- `idx_clients_user_id`, `idx_clients_email`, `idx_clients_user_deleted`, `idx_clients_deleted_at`.

### Constraints on `public.clients`
- `PRIMARY KEY (id)`, `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`, `UNIQUE (user_id, email)`.
- **Zero `CHECK` constraints** — no format check, no non-empty check, no >500 / >1000 guard.

## Reproduction attempt
All queries executed via Supabase MCP (`mcp__supabase__execute_sql`) against project `czuusjchqpgvanvbdrnz`. Test rows were inserted on user `5f833d4f-37e6-4c66-95b6-8786758a3af1` and cleaned up at the end.

### Finding 1 — Case-insensitive uniqueness: **FIXED**
- Baseline duplicate search returned zero rows:
  ```sql
  SELECT user_id, lower(email), COUNT(*), array_agg(email)
  FROM clients WHERE deleted_at IS NULL
  GROUP BY user_id, lower(email) HAVING COUNT(*) > 1;
  -- []  (no case-insensitive duplicates exist on the live DB)
  ```
- INSERT `sq82.repro@example.com` → OK (row id `4715ef97-...`).
- INSERT same user + `SQ82.REPRO@example.com` (different casing) → **FAILED** with:
  ```
  ERROR 23505: duplicate key value violates unique constraint "idx_clients_user_email_lower"
  DETAIL: Key (user_id, lower(email::text))=(5f833d4f-..., sq82.repro@example.com) already exists.
  ```
- Verdict: DB now blocks the exact scenario in the ticket's repro steps. The underlying `idx_clients_user_email_lower` was created by migration `20260217221850` already tagged with "SQ-82" in its header comment.

### Finding 2 — DB accepts empty `name` ('') — **STILL REPRODUCIBLE**
```sql
INSERT INTO clients (user_id, name, email)
VALUES ('5f833d4f-...', '', 'sq82.emptyname@example.com') RETURNING id, length(name);
-- id=60795e27-..., len=0   -- SUCCESS, bypasses Zod's .min(2)
```
`NOT NULL` only guards against NULL, not empty string.

### Finding 3 — DB accepts invalid email format — **STILL REPRODUCIBLE**
```sql
INSERT INTO clients (user_id, name, email)
VALUES ('5f833d4f-...', 'SQ-82 bad email', 'not-an-email') RETURNING id, email;
-- id=142427cd-..., email='not-an-email'   -- SUCCESS, bypasses Zod's .email()
```

### Finding 4 — DB accepts `address` > 500 chars — **STILL REPRODUCIBLE**
`address` column is `TEXT` with no CHECK:
```sql
INSERT INTO clients (user_id, name, email, address)
VALUES ('5f833d4f-...', 'SQ-82 long addr', 'sq82.longaddr@example.com', repeat('a', 600))
RETURNING id, length(address);
-- address_len=600   -- SUCCESS, bypasses Zod's .max(500)
```

### Finding 5 — DB accepts `notes` > 1000 chars — **STILL REPRODUCIBLE**
`notes` column is `TEXT` with no CHECK:
```sql
INSERT INTO clients (user_id, name, email, notes)
VALUES ('5f833d4f-...', 'SQ-82 long notes', 'sq82.longnotes@example.com', repeat('b', 1200))
RETURNING id, length(notes);
-- notes_len=1200   -- SUCCESS, bypasses Zod's .max(1000)
```

### Cleanup
All five repro rows were removed via `DELETE FROM clients WHERE user_id='5f833d4f-...' AND email IN (...) RETURNING id, email;` (5 rows returned).

## Root Cause
Split into two layers, matching the ticket's two enumerated hallazgos.

### A. App-level gap (case-insensitive uniqueness) — resolved
- The edit/create flow originally compared emails with `.eq('email', value)` (case-sensitive) against a DB column that stored the freelancer's input verbatim. Users typing `Email@X.com` on edit vs `email@x.com` on create produced two rows both passing:
  1. the Zod email regex (case is not canonicalised),
  2. the `.eq` duplicate pre-check (different casing),
  3. the DB `UNIQUE (user_id, email)` constraint (different casing).
- Fixed by commits that normalise at the API and add the lowercased partial unique index on the DB. Current code (reviewed above) is consistent: both POST and PUT do `email.toLowerCase()` *and* `.ilike(...)` before write, and the DB backstop is `idx_clients_user_email_lower`.

### B. DB-level gap (partial validations) — still present
- `public.clients` only encodes **length ceilings** via `VARCHAR(n)` and **NOT NULL** on `name`/`email`. Every other Zod rule (non-empty `name`, email format, address ≤500, notes ≤1000, tax_id ≤30, phone regex) exists only in TypeScript.
- Contract is therefore asymmetric: any write path that does not go through `src/app/api/clients/*` (service-role scripts, future cron, Supabase SQL editor, migration scripts, incident fixes, imports) can persist rows that subsequent UI/API reads will show as malformed. `NOT NULL` on `name` is ineffective — `''` is a valid non-null string.

Both gaps together are "validaciones DB parciales" — the DB does not match the business contract declared in Zod. The ticket's expected outcome ("Validaciones críticas deben quedar protegidas en DB o claramente acotadas a API/UI con contrato consistente") is not yet met.

## Decision + Jira Root Cause (custom field)
- **Verdict:** PARTIALLY FIXED — fix-forward required.
- **Original primary symptom (case-insensitive email duplication):** already remediated at both app and DB layers. Covered by migration `20260217221850`.
- **Secondary finding (DB content validation gaps):** still reproducible via direct SQL.
- **Recommended Jira Root Cause:** **Data validation / contract mismatch** — "Schema-vs-application invariant mismatch: business rules enforced only in Zod (application layer); DB schema lacks CHECK constraints so any non-UI write path can persist data that violates the documented contract."
- **Suggested transition:** keep Open, narrow the scope to remaining finding #2 (add DB CHECK constraints), re-test per QA's existing test cases in `SQ-16`. The "email case-insensitive" line item in the ticket's *Hallazgos* can be ticked off / documented in a comment.

## Recommended fix

### 1. Application layer (already in place — verify, don't regress)
- Keep `email.toLowerCase()` + `.ilike(...)` pre-check in both POST and PUT routes.
- Add an **app test** that inserts then tries to update another client's email to a different casing of an existing email, asserting HTTP 409.
- Optionally add a Zod `.transform((s) => s.trim().toLowerCase())` on the `email` field so the contract is single-sourced.

### 2. Database layer (new migration required)
Add CHECK constraints so the DB backstop matches the Zod contract. Sketch:
```sql
-- supabase/migrations/<ts>_add_clients_content_check_constraints.sql
ALTER TABLE public.clients
  ADD CONSTRAINT clients_name_not_empty
    CHECK (char_length(btrim(name)) >= 2),
  ADD CONSTRAINT clients_email_format
    CHECK (email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'),
  ADD CONSTRAINT clients_address_max_length
    CHECK (address IS NULL OR char_length(address) <= 500),
  ADD CONSTRAINT clients_notes_max_length
    CHECK (notes IS NULL OR char_length(notes) <= 1000),
  ADD CONSTRAINT clients_phone_format
    CHECK (phone IS NULL OR phone ~ '^[0-9+\-\s()]*$');
```
Before applying in production, run a staging audit:
```sql
SELECT COUNT(*) FILTER (WHERE char_length(btrim(name)) < 2) AS bad_name,
       COUNT(*) FILTER (WHERE email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$') AS bad_email,
       COUNT(*) FILTER (WHERE char_length(COALESCE(address,'')) > 500) AS bad_address,
       COUNT(*) FILTER (WHERE char_length(COALESCE(notes,'')) > 1000) AS bad_notes,
       COUNT(*) FILTER (WHERE phone IS NOT NULL AND phone !~ '^[0-9+\-\s()]*$') AS bad_phone
FROM public.clients WHERE deleted_at IS NULL;
```
If non-zero, soft-delete the offending rows (or `UPDATE ... SET notes = substr(notes, 1, 1000)`), then apply the ADD CONSTRAINT.

### 3. Cleanup (optional)
- Drop the redundant legacy `clients_user_id_email_key UNIQUE (user_id, email)` (case-sensitive) — it is superseded by the partial unique index on `lower(email)` and currently wastes a write-time B-tree update on every INSERT/UPDATE. Keeping it is harmless correctness-wise but it is dead code at the schema level.
- Consider `phone VARCHAR(20)` vs the existing `phone VARCHAR(20)` (already bounded); no change needed.

## Additional notes
- **SQ-82 is mis-titled relative to current state.** The "inconsistencia de unicidad email (case-insensitive)" half is already fixed; leaving the title untouched will create ambiguity in future retros. A comment summarising which half remains is recommended before transitioning.
- **Shift-Left QA tester:** not reviewed as part of this investigation (READ-ONLY, no Jira changelog pulled). When transitioning to "Ready For QA", follow the standard workflow in `CLAUDE.md` — fetch changelog and assign to the original Shift-Left tester.
- **Test evidence left for QA:** `idx_clients_user_email_lower` now blocks Finding 1; the five repro queries in this report (Findings 2–5) reproduce in < 1s each and can be reused as DB test cases for the `SQ-16` test suite.
- **No mutations left in the DB** — the five repro rows were DELETEd; the DELETE returned 5 rows confirming full cleanup.
