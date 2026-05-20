-- SQ-142: Enforce the invariant invoices.subtotal = SUM(invoice_items.quantity * invoice_items.unit_price)
--
-- Root cause (see .context/reports/incident-SQ-142-investigation.md):
--   POST /api/invoices wrote invoices.subtotal from the in-memory items array
--   and then performed a best-effort child insert into invoice_items. Any
--   failure on the child insert was swallowed ("log-and-continue"), leaving
--   the parent row with a subtotal that referenced items that were never
--   persisted — a "ghost subtotal".
--
-- Fix (Layer 2 — DB-level invariant):
--   An AFTER INSERT/UPDATE/DELETE trigger on invoice_items recomputes the
--   parent invoices.subtotal from the actual child rows. This eliminates
--   drift from any future code path (API, admin script, direct SQL, etc.)
--   without depending on application-layer discipline.
--
-- Scope:
--   The trigger updates `subtotal` only. It intentionally does NOT recompute
--   `tax_amount` or `total`, which remain application-derived (see
--   src/lib/utils/invoice-calculations.ts). Recomputing those at the DB
--   layer would require knowing the effective tax_rate, discount_type, and
--   discount_value at trigger time, all of which are maintained by the API
--   handlers alongside the subtotal write. Keeping this migration narrowly
--   scoped matches the incident (subtotal divergence) and avoids accidental
--   behavior changes in tax/discount math.
--
-- Data check performed before migration (2026-04-20):
--   SELECT i.id, i.subtotal, COALESCE((SELECT SUM(ii.quantity * ii.unit_price)
--                                        FROM invoice_items ii
--                                        WHERE ii.invoice_id = i.id), 0) AS derived
--   FROM invoices i
--   WHERE i.subtotal <> COALESCE(...);
--   → 0 rows. Safe to deploy: no unexpected backfill effects on existing data.
--
-- Layer 1 (server-side atomicity — compensating delete on child insert failure)
-- is implemented in src/app/api/invoices/route.ts (POST) and
-- src/app/api/invoices/[id]/route.ts (PUT). Option B was chosen over an RPC
-- because the invoice-number generation and client-ownership checks live in
-- TypeScript and duplicating them in PL/pgSQL would roughly double the
-- maintenance surface for a data path the Layer 2 trigger already protects.

CREATE OR REPLACE FUNCTION recompute_invoice_subtotal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  target_invoice_id uuid;
BEGIN
  -- On INSERT/UPDATE, NEW.invoice_id is defined.
  -- On DELETE, NEW is null and we read OLD.invoice_id.
  -- On UPDATE that moves a row between invoices (not expected, but defensive),
  -- recompute both the old and new parent rows.
  IF (TG_OP = 'UPDATE') AND (OLD.invoice_id IS DISTINCT FROM NEW.invoice_id) THEN
    UPDATE invoices
       SET subtotal = COALESCE(
             (SELECT SUM(ii.quantity * ii.unit_price)
                FROM invoice_items ii
               WHERE ii.invoice_id = OLD.invoice_id),
             0
           )
     WHERE id = OLD.invoice_id;
  END IF;

  target_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);

  UPDATE invoices
     SET subtotal = COALESCE(
           (SELECT SUM(ii.quantity * ii.unit_price)
              FROM invoice_items ii
             WHERE ii.invoice_id = target_invoice_id),
           0
         )
   WHERE id = target_invoice_id;

  RETURN NULL; -- AFTER trigger, return value ignored
END;
$$;

DROP TRIGGER IF EXISTS trg_invoice_items_recompute_subtotal ON invoice_items;

CREATE TRIGGER trg_invoice_items_recompute_subtotal
AFTER INSERT OR UPDATE OR DELETE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION recompute_invoice_subtotal();

COMMENT ON FUNCTION recompute_invoice_subtotal() IS
  'SQ-142: Maintains invoices.subtotal = SUM(invoice_items.quantity * invoice_items.unit_price). Scope: subtotal only. tax_amount/total remain app-layer derived.';

COMMENT ON TRIGGER trg_invoice_items_recompute_subtotal ON invoice_items IS
  'SQ-142: Recomputes parent invoices.subtotal on any change to invoice_items to eliminate ghost-subtotal drift.';
