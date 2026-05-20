# Incident Investigation — SQ-174

## Metadata

| Field                | Value                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| Jira key             | SQ-174                                                                                             |
| Title                | [SQ-55][Data] Factura queda paid con paid_at null y sin evento paid tras registrar pago            |
| Type                 | Defect                                                                                             |
| Priority             | Medium                                                                                             |
| Status               | Open                                                                                               |
| Assignee             | Fernando Javier Masci                                                                              |
| Reporter / Source    | Exploratory testing on SQ-55 (Staging)                                                              |
| Related stories      | SQ-53 (Mark as Paid), SQ-54/55/56/57 (payment sub-fields), SQ-58 (Revert payment), SQ-52 (Summary) |
| Environment          | Staging — https://staging-upexsoloq.vercel.app                                                     |
| Repo                 | /home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq (branch: staging)                        |
| Supabase project     | czuusjchqpgvanvbdrnz                                                                               |
| Investigation date   | 2026-04-20                                                                                         |
| Investigator         | Claude (read-only)                                                                                 |
| Verdict              | Confirmed real bug — application-layer (two missing writes inside the payment flow)                |

---

## Summary

When a user registers a payment on a `sent` / `overdue` invoice via `POST /api/invoices/[id]/payments`, the server-side route creates the `payments` row and flips `invoices.status` to `'paid'`, **but it never writes `invoices.paid_at` and never inserts an `invoice_events` row with `event_type = 'paid'`**. This is not a race, not a trigger failure, and not a frontend sync issue: the logic was simply never coded. The `invoice_event_type` enum already contains the `'paid'` label and the `invoice_events` table exists and receives the `'sent'` event correctly from the send-invoice route — the pattern is present elsewhere and was omitted here.

The defect is reproducible deterministically and has already contaminated production-adjacent data: 8 of 9 `paid` invoices in Staging have `paid_at IS NULL` and there are **zero** `invoice_events` rows with `event_type = 'paid'` in the entire database.

---

## Context / Impact on adjacent work

- **SQ-55 (Record amount received)** — currently BLOCKED by this defect; flagged during its exploratory testing.
- **SQ-53 (Mark as Paid)** — Acceptance Criterion 4 ("Paid timestamp recorded") is effectively **unmet in production**, even though the story is in Backlog. The regression comes from the implementation that supports SQ-55 writing to the same endpoint without respecting SQ-53 AC4.
- **SQ-58 (Revert Payment)** — spec explicitly says "Clear paid_at timestamp on invoice" on revert. With `paid_at` never populated, the revert is a no-op for that field — masking the bug further (no divergence visible after a revert).
- **SQ-52 (Monthly summary / dashboard)** — any aggregation that relies on `paid_at` (e.g. "amount collected this month", payment velocity, DSO) will under-report or silently exclude all Staging paid invoices. The only dependable timestamp today is the `payments.payment_date` / `payments.created_at`, not `invoices.paid_at`.
- **Audit trail / invoice_events timeline** — completely missing the `paid` event, so the invoice history UI (when built) will jump from `sent` to `paid` without a timeline entry.

---

## Related files

- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/app/api/invoices/[id]/payments/route.ts` — **root cause lives here** (lines 88–122).
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/app/api/invoices/[id]/revert-payment/route.ts` — symmetric defect: on revert it does NOT clear `paid_at` and does NOT emit an `invoice_events` row (related but separate fix surface).
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/app/api/invoices/[id]/send/route.ts` — reference implementation that correctly updates a timestamp (`sent_at`) and inserts into `invoice_events` (lines 345–382).
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/hooks/invoices/use-mark-as-paid.ts` — client-side mutation; invalidates cache but does not compensate for missing backend writes.
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/types/supabase.ts` — confirms `paid_at` column and `invoice_events` table exist in generated types.
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/.context/PBI/epics/EPIC-SQ-39-payment-tracking/stories/STORY-SQ-53-mark-as-paid/story.md` — AC4 explicitly requires `paid_at`.
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/.context/PBI/epics/EPIC-SQ-39-payment-tracking/stories/STORY-SQ-58-revert-payment/story.md` — specifies clearing `paid_at` and audit-trail via `invoice_events`.
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/supabase/migrations/` — only one unrelated migration (tax_rate check constraint); no trigger or backfill exists for `paid_at` or `invoice_events.paid`.

---

## Reproduction & SQL evidence (read-only)

The Jira description already shows a concrete repro on invoice `a5039370-3ade-4e42-b6db-414d6876c1a1` (`INV-2026-203783346`). Evidence was confirmed directly against the `czuusjchqpgvanvbdrnz` Supabase DB.

### 1. Global divergence counters

```sql
SELECT
  COUNT(*) FILTER (WHERE paid_at IS NULL)     AS paid_without_paid_at,
  COUNT(*) FILTER (WHERE paid_at IS NOT NULL) AS paid_with_paid_at,
  COUNT(*)                                    AS total_paid
FROM invoices
WHERE status = 'paid';
```

Result:

| paid_without_paid_at | paid_with_paid_at | total_paid |
| -------------------- | ----------------- | ---------- |
| **8**                | 1                 | 9          |

The single "good" row (`INV-2026-0003`, `paid_at = 2026-04-06 04:30:10`) has **zero active payments** and `sent_at = NULL` — it predates the `/payments` endpoint and was seeded/marked manually, so it is not a counter-example.

### 2. Per-invoice view

```sql
SELECT i.id, i.invoice_number, i.status, i.paid_at, i.sent_at,
  (SELECT COUNT(*) FROM invoice_events e
     WHERE e.invoice_id = i.id AND e.event_type = 'paid') AS paid_events,
  (SELECT COUNT(*) FROM payments p
     WHERE p.invoice_id = i.id AND p.deleted_at IS NULL) AS active_payments
FROM invoices i
WHERE i.status = 'paid'
ORDER BY i.updated_at DESC;
```

Excerpt (9 rows total): every `paid` invoice that went through `/payments` has `paid_at = NULL`, `paid_events = 0`, and `active_payments >= 1` — the exact divergence SQ-174 reports.

### 3. invoice_events audit

```sql
SELECT event_type, COUNT(*) FROM invoice_events GROUP BY event_type;
```

| event_type | count |
| ---------- | ----- |
| sent       | 12    |

**No `paid` rows exist in `invoice_events` at all.** The `invoice_event_type` enum, however, does declare `'paid'` (confirmed via `pg_enum`), so the DB is ready to receive it — the application simply never inserts it.

### 4. Triggers on invoices / payments / invoice_events

```sql
SELECT trigger_name, event_manipulation, event_object_table, action_timing, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN ('invoices','payments','invoice_events');
```

Only trigger found:

| trigger | table    | timing | action                                   |
| ------- | -------- | ------ | ---------------------------------------- |
| update_invoices_updated_at | invoices | BEFORE UPDATE | `update_updated_at_column()` |

No trigger auto-populates `paid_at` on status transition to `paid`, and no trigger emits `invoice_events` rows. So the DB is not expected to fix this implicitly.

### 5. Column definition

`invoices.paid_at` is `timestamp with time zone NULL` with no default — it is purely application-managed.

### 6. Source-code smoking gun

`src/app/api/invoices/[id]/payments/route.ts` lines 110-122:

```ts
// Update invoice status to 'paid'
const { error: updateError } = await supabase
  .from('invoices')
  .update({ status: 'paid' as const })   // <-- no paid_at, no updated_at
  .eq('id', invoiceId);
```

There is no subsequent `.from('invoice_events').insert(...)` call. The `send` route (line 367) does exactly that pattern for the `'sent'` event; it was not replicated here.

Symmetric omission in `src/app/api/invoices/[id]/revert-payment/route.ts` lines 84-87:

```ts
const { error: updateError } = await supabase
  .from('invoices')
  .update({ status: newStatus })  // <-- does not clear paid_at, no event emitted
  .eq('id', invoiceId);
```

---

## Root Cause

Multi-layered, but primarily a **single application-layer gap** with a knock-on on the revert flow:

1. **Primary (payments POST)** — `src/app/api/invoices/[id]/payments/route.ts` updates `invoices.status = 'paid'` without also setting `paid_at = now()` and without inserting `invoice_events (event_type = 'paid', ...)`. The columns and enum exist; the code is incomplete.
2. **Secondary (revert POST)** — `revert-payment/route.ts` does not clear `paid_at` nor emit a `cancelled` / revert event. Masks the primary bug (state still looks "coherent" after revert because `paid_at` was always NULL) and is itself a violation of SQ-58 spec.
3. **No DB-level safety net** — no trigger keeps `paid_at` in sync with `status`, and no trigger auto-emits `invoice_events`. So the application is solely responsible for these two writes, which it does not do.
4. **Contract-level** — the TypeScript Supabase types in `src/types/supabase.ts` correctly list `paid_at` as writable, so there is no type-system friction that would have flagged the omission. Pure behavioral defect.

**Not** a frontend sync issue (React Query invalidation is fine, there is simply nothing to re-fetch), **not** a RLS issue (`invoice_events` does accept `sent` inserts with the same auth context), **not** a DB trigger failure (none exists to fail).

---

## Decision & Jira "Root Cause" field

- **Verdict:** Confirmed bug. Reproducible (8 rows already divergent in Staging DB).
- **Suggested Jira Root Cause custom field value:** `Application logic` (or `Backend / API`) — the server-side route is missing two required writes. Secondary classification: `Data integrity / Audit trail`.
- **Priority assessment:** The current Medium rating is arguably low. `paid_at` is on the critical path for SQ-52 (dashboard monthly summary) and reporting; if SQ-52 ships before this is fixed it will display wrong numbers. Recommend re-rating to High if SQ-52 is in the same milestone.

---

## Recommended fix

Keep both writes in the same logical transaction as the status update so a partial failure cannot leave the divergence state we see today.

### Option A — Application fix only (preferred, minimal surface)

In `src/app/api/invoices/[id]/payments/route.ts`, replace the status-only update with a full transition and add the event insert:

```ts
const now = new Date().toISOString();

// 1. Update invoice — status + paid_at + updated_at together
const { error: updateError } = await supabase
  .from('invoices')
  .update({
    status: 'paid',
    paid_at: now,
    updated_at: now,
  })
  .eq('id', invoiceId);

if (updateError) { /* existing rollback/log path */ }

// 2. Emit audit event (best-effort, non-blocking like send/route.ts)
const { error: eventError } = await supabase.from('invoice_events').insert({
  invoice_id: invoiceId,
  event_type: 'paid',
  metadata: {
    paid_at: now,
    paid_by: user.id,
    payment_id: payment.id,
    amount_received,
    payment_method,
    payment_date,
  },
});
if (eventError) console.error('Error creating invoice event (paid):', eventError);
```

Mirror the symmetric fix in `revert-payment/route.ts`:

- Update invoice with `{ status: newStatus, paid_at: null, updated_at: now }`.
- Insert `invoice_events` row. The enum does not contain a `reverted`/`unpaid` value, so either (a) add it via migration, or (b) reuse `updated` with a discriminating `metadata.action = 'payment_reverted'`. Option (a) is cleaner.

### Option B — DB-level safety net (defense-in-depth, additive)

Add a migration with a `BEFORE UPDATE` trigger on `invoices` that, when `OLD.status <> 'paid' AND NEW.status = 'paid'`, sets `NEW.paid_at := COALESCE(NEW.paid_at, now())`, and when `OLD.status = 'paid' AND NEW.status <> 'paid'` clears `NEW.paid_at`. Optionally an `AFTER UPDATE` trigger that inserts into `invoice_events` on status transitions.

This alone does NOT replace Option A for the event insert, because the trigger would run with the DB role (not `user.id`) and cannot easily populate the rich `metadata` (payment_id, payment_method). Keep Option A as the primary fix; consider Option B as belt-and-braces.

### Backfill for Staging

After deploying the fix, run a one-off data-repair (document SQL, require explicit approval):

```sql
-- Backfill paid_at from the latest non-deleted payment for each divergent invoice
UPDATE invoices i
SET    paid_at = p.fixed_at, updated_at = now()
FROM ( SELECT invoice_id, MAX(COALESCE(payment_date::timestamptz, created_at)) AS fixed_at
       FROM payments WHERE deleted_at IS NULL
       GROUP BY invoice_id ) p
WHERE i.id = p.invoice_id
  AND i.status = 'paid'
  AND i.paid_at IS NULL;

-- Synthesize missing 'paid' events (flag as backfill in metadata)
INSERT INTO invoice_events (invoice_id, event_type, metadata)
SELECT i.id, 'paid', jsonb_build_object('backfill', true, 'paid_at', i.paid_at)
FROM invoices i
WHERE i.status = 'paid'
  AND NOT EXISTS (SELECT 1 FROM invoice_events e
                  WHERE e.invoice_id = i.id AND e.event_type = 'paid');
```

### Tests to add (once fix is coded)

- Unit/API test: POST `/api/invoices/:id/payments` sets `paid_at` and inserts one `invoice_events (event_type='paid')`.
- Unit/API test: POST `/api/invoices/:id/revert-payment` clears `paid_at` and emits a revert-class event.
- DB invariant test (regression): `SELECT count(*) FROM invoices WHERE status='paid' AND paid_at IS NULL` must be 0.
- DB invariant test: every `paid` invoice has at least one `invoice_events (event_type='paid')`.

---

## Additional notes

- The current Staging data (8 divergent rows, payment ids/invoice numbers listed above) is the perfect regression fixture for the eventual automated suite.
- The existing hook `useMarkAsPaid` already invalidates the right React Query keys, so once the backend sets `paid_at`, the detail and list UIs will pick it up without frontend changes.
- The `payments` route also silently drops a chance to set `invoices.updated_at`; the `update_invoices_updated_at` BEFORE-UPDATE trigger keeps it correct today, but adding `updated_at: now` explicitly (as `send/route.ts` does) makes the intent explicit and less dependent on trigger presence.
- No mutations were performed during this investigation; all queries were SELECTs.
