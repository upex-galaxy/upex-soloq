-- SQ-156: Strip HTML/script payloads from existing invoices.notes and invoices.terms
--
-- Context: Investigation (see .context/reports/incident-SQ-156-investigation.md)
-- found that the invoice create/update schemas only enforced `.max(N)` on the
-- `notes` and `terms` fields. No sanitization or HTML stripping was applied,
-- and two staging rows (INV-2026-0009, INV-2026-0002) already contain
-- `<script>` payloads. Although no code path currently renders those fields
-- as HTML (React auto-escapes JSX, @react-pdf/renderer renders Text literal,
-- email templates don't interpolate notes), the persisted payloads become a
-- live stored-XSS vector the moment any future feature renders the field as
-- HTML.
--
-- This migration backfills existing rows by stripping any substring matching
-- `<...>` from `notes` and `terms`. Going forward, the Zod schemas in
-- src/lib/validations/invoice.ts apply sanitize-html with a strict allowlist
-- (no tags, no attributes) at the write boundary, so new writes cannot
-- reintroduce HTML into these columns.
--
-- Safe to run on all environments: operates only on rows that currently
-- contain a `<` character, leaving clean rows untouched.

UPDATE invoices
SET notes = regexp_replace(notes, '<[^>]*>', '', 'g')
WHERE notes IS NOT NULL
  AND notes ~ '<';

UPDATE invoices
SET terms = regexp_replace(terms, '<[^>]*>', '', 'g')
WHERE terms IS NOT NULL
  AND terms ~ '<';
