-- SQ-82: Add CHECK constraints to public.clients to close DB-level
-- validation gap exposed during SQ-16 exploratory DB testing.
--
-- Context: The primary case-insensitive email uniqueness bug was already
-- resolved by migration 20260217221850_add_clients_email_case_insensitive_unique
-- (partial unique index on (user_id, lower(email))). However, the clients
-- table has zero CHECK constraints, so any non-UI write path (direct SQL,
-- background jobs, migration scripts, service-role clients) bypasses the
-- Zod rules in src/lib/validations/client.ts and can persist malformed
-- rows (empty name, invalid email, oversized address/notes/phone, non-
-- canonical phone characters).
--
-- This migration adds five CHECK constraints that mirror the Zod contract:
--   * clients_name_not_empty         : name trim length >= 2 (Zod min(2))
--   * clients_email_format           : basic RFC-lite email regex (Zod .email)
--   * clients_address_max_length     : address <= 500 chars (Zod .max(500))
--   * clients_notes_max_length       : notes   <= 1000 chars (Zod .max(1000))
--   * clients_phone_format           : phone matches /^[0-9+\-\s()]*$/ (Zod regex)
--
-- Phone length (<=20) and name length (<=100) and email length (<=255) are
-- already enforced via VARCHAR(n) on the column definitions and do not need
-- duplicate CHECKs.
--
-- Staging audit (2026-04-21) against project czuusjchqpgvanvbdrnz showed:
--   active rows: bad_name=0, bad_email_format=0, bad_address=0, bad_notes=0,
--                bad_phone_format=1 (id=c905db0a-65bf-486e-9764-24b5abf51687
--                phone='erere' — test/junk data from user 214e31e0-... pruebaMale)
--   soft-deleted: 2 additional phone violators (phone='as', phone='+123aa'),
--                 both test rows on user ff82343a-...
--
-- Cleanup strategy: rather than deleting the rows (which could confuse
-- anyone who filed the test records), we NULL the phone column for any row
-- whose phone does not match the regex. `phone` is nullable, so setting it
-- to NULL is non-destructive (same meaning as "not provided"). This applies
-- to both active and soft-deleted rows because the CHECK constraint is
-- schema-wide.
--
-- See: .context/reports/incident-SQ-82-investigation.md

-- Step 1: sanitize existing non-conforming phone values.
-- Three known rows match as of 2026-04-21 (phones 'erere', 'as', '+123aa'):
--   c905db0a-65bf-486e-9764-24b5abf51687 (active)
--   eb0a0ace-870f-400b-9ecd-e25934887303 (soft-deleted)
--   61ca0d98-38fe-4e39-99a9-9dee48df88a4 (soft-deleted)
-- Setting to NULL preserves the row, loses only the un-parseable phone.
UPDATE public.clients
SET phone = NULL
WHERE phone IS NOT NULL
  AND phone <> ''
  AND phone !~ '^[0-9+\-\s()]*$';

-- Step 2: add CHECK constraints.
ALTER TABLE public.clients
  ADD CONSTRAINT clients_name_not_empty
    CHECK (char_length(btrim(name)) >= 2),
  ADD CONSTRAINT clients_email_format
    CHECK (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  ADD CONSTRAINT clients_address_max_length
    CHECK (address IS NULL OR char_length(address) <= 500),
  ADD CONSTRAINT clients_notes_max_length
    CHECK (notes IS NULL OR char_length(notes) <= 1000),
  ADD CONSTRAINT clients_phone_format
    CHECK (phone IS NULL OR phone = '' OR phone ~ '^[0-9+\-\s()]*$');

-- Notes
-- * PostgreSQL POSIX regex does not accept `\s`; we use the character class
--   `[:space:]` inside a bracket expression instead for the email pattern.
--   For the phone pattern we keep the app-level regex shape (`\s` is
--   supported as a shorthand inside `[]` in Postgres ERE only via
--   `[[:space:]]`). Using `\s` explicitly inside the bracket works in
--   Postgres ERE when the ESCAPE is unambiguous — the phone regex is
--   kept identical to the Zod source: `^[0-9+\-\s()]*$`.
-- * We do NOT drop the legacy `clients_user_id_email_key UNIQUE (user_id, email)`
--   in this migration — that cleanup is tracked separately and is outside
--   the SQ-82 scope.
