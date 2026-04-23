-- SQ-142 hardening: pin search_path on recompute_invoice_subtotal().
-- Closes the function_search_path_mutable WARN raised by the Supabase linter
-- after the trigger function was introduced by
-- 20260420232700_sq142_recompute_invoice_subtotal_trigger. Without this,
-- an attacker who can create objects in a schema earlier on the session
-- search_path could shadow the SUM() or COALESCE() lookups.

ALTER FUNCTION public.recompute_invoice_subtotal()
  SET search_path = public, pg_temp;
