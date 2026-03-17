-- SQ-87: Add CHECK CONSTRAINT to prevent negative or invalid tax rates
-- Applied: 2026-03-12 via Supabase MCP
--
-- Context: During DB testing for SQ-24 (Add Taxes), it was discovered that
-- the tax_rate column in invoices accepts negative values at the database level.
-- Although the frontend validates (Zod: min(0).max(100)), direct SQL access
-- or API bypasses could insert invalid data.
--
-- This constraint ensures database-level integrity independent of application validation.

-- Step 1: Fix any existing invalid data
UPDATE invoices SET tax_rate = 0 WHERE tax_rate < 0;
UPDATE invoices SET tax_rate = 100 WHERE tax_rate > 100;

-- Step 2: Add CHECK CONSTRAINT for valid percentage range (0-100)
ALTER TABLE invoices
ADD CONSTRAINT check_tax_rate_valid_range
CHECK (tax_rate >= 0 AND tax_rate <= 100);
