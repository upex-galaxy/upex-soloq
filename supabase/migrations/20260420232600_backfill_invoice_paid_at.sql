-- SQ-174: Backfill invoices.paid_at and synthesize 'paid' invoice_events
-- Ref: .context/reports/incident-SQ-174-investigation.md
--
-- Context: The /api/invoices/[id]/payments route flipped invoices.status to
-- 'paid' but never set paid_at and never inserted an invoice_events row with
-- event_type = 'paid'. On staging, 8 of 9 paid invoices had paid_at NULL and
-- zero 'paid' events existed in the timeline. This broke the income-metrics
-- dashboard (SQ-175) and left the invoice audit history incomplete.
--
-- The application-layer fix (this same commit) now writes paid_at and emits a
-- 'paid' invoice_events row whenever a payment is registered. This migration
-- repairs the historical rows that were written before the fix landed.
--
-- Strategy:
--   1. Set paid_at = updated_at for any invoice where status='paid' AND
--      paid_at IS NULL. updated_at is the closest available signal for when
--      the invoice was marked paid (the update that flipped status is the
--      last write that touched the row for the vast majority of cases).
--      Fall back to the most recent payment's payment_date if updated_at
--      is somehow NULL.
--   2. Insert synthetic 'paid' invoice_events rows for those invoices, tagged
--      with metadata.backfilled = true so the timeline and downstream audits
--      can distinguish them from events emitted by the fixed code path.
--
-- Idempotency: Both statements are guarded so re-running the migration is a
-- no-op. paid_at is only touched when NULL. Events are only inserted when no
-- 'paid' event exists for that invoice yet.

-- ---------------------------------------------------------------------------
-- Step 1: Backfill paid_at for historical paid invoices
-- ---------------------------------------------------------------------------

UPDATE invoices
SET paid_at = COALESCE(
  updated_at,
  (
    SELECT MAX(p.payment_date::timestamptz)
    FROM payments p
    WHERE p.invoice_id = invoices.id
      AND p.deleted_at IS NULL
  ),
  created_at
)
WHERE status = 'paid'
  AND paid_at IS NULL
  AND deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- Step 2: Synthesize historical 'paid' invoice_events for the backfilled rows
-- ---------------------------------------------------------------------------

INSERT INTO invoice_events (invoice_id, event_type, metadata, created_at)
SELECT
  i.id AS invoice_id,
  'paid'::invoice_event_type AS event_type,
  jsonb_build_object(
    'backfilled', true,
    'reason', 'SQ-174: historical paid invoice without paid event',
    'paid_at', i.paid_at,
    'source', 'backfill_migration_20260420'
  ) AS metadata,
  COALESCE(i.paid_at, i.updated_at, NOW()) AS created_at
FROM invoices i
WHERE i.status = 'paid'
  AND i.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM invoice_events e
    WHERE e.invoice_id = i.id
      AND e.event_type = 'paid'
  );
