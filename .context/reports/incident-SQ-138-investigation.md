# Incident Investigation: SQ-138

## Metadata
- **Key:** SQ-138
- **Type:** Bug
- **Priority:** High
- **Status:** In Review (yellow / In Progress category) — PR already merged to `staging`
- **Assignee:** Ely (elyermad@gmail.com)
- **Summary:** `[SQ-32] Payment methods ausentes del PDF — API no incluye payment_methods en el response`
- **Related tickets:**
  - Parent feature: SQ-32 (Generate Professional PDF Invoice) — QA Approved. The bug was observed while testing TC-32-02 of SQ-32.
  - Superseding story: SQ-34 (Include Payment Methods in PDF) — still in Shift-Left QA, assigned to Arkaitz. Described in the same functional area but owned as a proper user story rather than a regression fix.
  - Related already-shipped work: SQ-44 (Payment Methods in email body) — wired up `payment_methods` for email sending but never for the PDF pipeline.
- **Environment:** Staging (`https://staging-upexsoloq.vercel.app`).
- **Evidence data (test invoice):** `INV-2026-0001` (`0eac7dff-d55b-4c6c-8123-eb7e74e7005c`), user "AHR Consultoria" with one active method ("PayPal Empresarial", `{"email":"alfonso.qaeng@gmail.com"}`, `is_active: true`).

## Summary
`GET /api/invoices/[id]` and `GET /api/invoices/[id]/pdf` never queried the `payment_methods` table, so the PDF renderer received no payment-method data and the "Métodos de Pago" footer section was absent from 100 % of PDFs on staging. The fix — PR #82, `fix(SQ-138): add payment methods to PDF generation`, merged to `staging` on 2026-03-28 as `e83d455` — adds an explicit Supabase query for active payment methods in all three invoice endpoints (`[id]`, `[id]/pdf`, `[id]/send`), extends the `InvoiceWithDetails` type with a `payment_methods` array, and renders a new E2 section in `invoice-document.tsx` with per-type value formatting (bank / PayPal / MercadoPago / cash). The fix is code-complete, present on HEAD of `staging`, and structurally matches the bug's suggested fix and SQ-34's Scenario 1 AC. The ticket status "In Review" is a Jira-workflow artefact (Shift-Left QA review of the fix) rather than an indication of unresolved code.

## Context

### Feature affected
- **Parent story (SQ-32):** "Generate Professional PDF Invoice" — the PDF generation pipeline built on `@react-pdf/renderer`. Per its AC, Scenario 2 ("Footer Section: Payment methods (from user's configured methods)") was never met in the shipped build even though SQ-32 was marked QA Approved.
- **Business impact:** Every invoice PDF sent to a client lacked payment instructions; the recipient cannot see where to pay. In a billing SaaS, that directly prevents the core conversion event (invoice → cobro). Severity matches the "High" priority on the ticket.

### Overlap with SQ-32 and SQ-34
- **SQ-32** defined the PDF template including the footer payment-methods block, but the actual wiring of payment-method data was scoped out of the implementation that shipped. A `// E2: Payment Methods placeholder` comment was left in the PDF template (see pre-fix `invoice-document.tsx`), which is the literal audit trail of the missed scope.
- **SQ-34** is a dedicated story — "Include Payment Methods in PDF" — still in Shift-Left QA. SQ-138 was filed as a High-priority bug to unblock the SQ-32 QA loop without waiting for SQ-34 to go through the full estimation → implementation workflow. The PR #82 change functionally delivers what SQ-34 requires (fetch active methods, render label + formatted value in E2), so SQ-34 is now at risk of being duplicated work. See "Additional notes" for disposition.

### Pre-fix evidence (from the reporter)
API response inspected directly on staging had `items`, `client`, `business_profile`, and no `payment_methods` key. The DevTools Network tab showed no request to the `payment_methods` table while the invoice detail page was loading. The DB confirmed that the test user owned an active method. All three facts together isolate the defect to the API layer — the data existed, the UI expected it, but the route handler never fetched it.

## Related files / code

### Route handlers (server)
- `src/app/api/invoices/[id]/route.ts:155-163` — Post-fix: fetches `payment_methods` filtered by `user_id`, `is_active = true`, ordered `is_default DESC, sort_order ASC`, limited to 3 rows. Maps to `{ type, label, value }` and stringifies `value` if it's a JSON object.
- `src/app/api/invoices/[id]/pdf/route.ts:127-135` — Same query pattern, injected right before the `InvoiceWithDetails` payload is passed to `renderToBuffer(InvoiceDocument(...))`.
- `src/app/api/invoices/[id]/send/route.ts:242-246` (post-fix) — Now spreads `payment_methods` into the `InvoiceWithDetails` passed to the PDF generator for the send-by-email flow (SQ-44 already fetched the array for the email body; the PR also forwards it to the PDF).

### Types / client hook
- `src/hooks/invoices/use-invoice.ts:4,41-45` — `InvoiceWithDetails` gains a required `payment_methods: Array<{ type: PaymentMethodType; label: string; value: string }>`. Because it's required (not optional), the TypeScript compiler forces every producer of `InvoiceWithDetails` to include it, which is how the preview util was caught (see below).
- `src/lib/utils/invoice-preview.ts:124-125` — Client-side preview builder now sets `payment_methods: []` to satisfy the type. Preview does not fetch methods because it runs before persistence; this is documented with a comment.

### PDF template
- `src/app/(app)/invoices/[id]/components/invoice-document.tsx:353-383` — New `formatPaymentMethodValue(type, valueStr)` helper. JSON-parses the `value` column and produces human-readable output per type (`bank_transfer` concatenates `bank_name | CLABE | CBU | Cuenta`; `paypal` shows email; `mercado_pago` shows `Alias | CVU`; `cash` shows `instructions`; `other` falls back to `instructions || name || valueStr`). Try/catch protects against malformed JSON by returning the raw string.
- `invoice-document.tsx:567-607` — Section E is now a 2-column `bottomSection`: E1 (Notas + Términos stacked) and E2 (Métodos de Pago with per-method `label` + formatted value on a grey pill). Gate condition is `notes || terms || (payment_methods && payment_methods.length > 0)`, so the whole block collapses when there's truly nothing to show. Uses `sanitizeForPDF` on both label and value to keep the existing PDF sanitation contract.
- `invoice-document.tsx:301-311` — Two new style rules (`paymentMethodLabel`, `paymentMethodValue`) that drive the E2 rendering.

### Schema verification (Supabase MCP)
`public.payment_methods` columns (live DB, `project_id=czuusjchqpgvanvbdrnz`):

| column | type | nullable |
|---|---|---|
| `id` | uuid | NO |
| `user_id` | uuid | NO |
| `type` | enum `payment_method_type` | NO |
| `label` | varchar | NO |
| `value` | varchar | NO |
| `is_default` | boolean | YES |
| `sort_order` | integer | YES |
| `created_at` | timestamptz | YES |
| `is_active` | boolean | NO |

Enum `payment_method_type`: `bank_transfer, paypal, mercado_pago, cash, other` — matches the five branches of `formatPaymentMethodValue` exactly. `value` is stored as `varchar` (JSON encoded as string), which is why the PR normalises via `typeof pm.value === 'string' ? pm.value : JSON.stringify(pm.value)` and then `JSON.parse`s on the render side.

### Git provenance
- PR: #82 `fix(SQ-138): add payment methods to PDF generation`, base `staging`, head `fix/SQ-138/pdf-payment-methods`, MERGED 2026-03-29T02:06:21Z.
- Merge commit: `e83d455dfbc349843a396b83a71d156adbde64f0`, present on local `staging` HEAD.
- File diff: 6 files, +121 / −13. Matches the description above.

## Reproduction attempt

### Pre-fix (what the reporter saw)
1. Configure ≥ 1 active payment method in Settings.
2. Open `GET /api/invoices/{id}` on staging → response JSON contains `data.items`, `data.client`, `data.business_profile` but no `data.payment_methods` key.
3. Open any invoice's PDF preview → footer shows only Notas / Términos blocks, "Métodos de Pago" header never renders.
4. DB query `SELECT * FROM payment_methods WHERE user_id = :u AND is_active` returns ≥ 1 row, confirming the data path is the only thing broken.

### Post-fix (structural, code-level reproduction)
Because the assignment is read-only and the fix is already on staging, this is a code audit rather than a live retest.

1. `git branch --contains e83d455` → `staging` appears. Fix is present in the current staging HEAD.
2. `src/app/api/invoices/[id]/route.ts` lines 155-189 contain the new `payment_methods` fetch and the new field in the response payload.
3. `src/app/api/invoices/[id]/pdf/route.ts` lines 127-161 contain the same pattern feeding the `InvoiceDocument` renderer.
4. `src/app/(app)/invoices/[id]/components/invoice-document.tsx:567-607` now renders E2. The placeholder comment from SQ-32 is gone.
5. Live DB (`czuusjchqpgvanvbdrnz`) confirms the table, columns, and enum values the fix relies on.
6. Functional retest on staging (recommended, not performed — read-only) would repeat the original 3 steps; Section E2 should now appear with label + formatted value.

### Data seed
None required for the investigation. The existing "AHR Consultoria" test account already carries an active PayPal method, which matches the `paypal` branch of `formatPaymentMethodValue` and renders as the email string — easy to eyeball visually on the PDF preview.

## In-flight fix assessment (PR #82)

### What the fix does right
- Reads from the correct table (`payment_methods`), with the correct filter (`is_active = true`), in the correct order (`is_default DESC, sort_order ASC`) — matches SQ-34's Scenario 1 ordering expectation.
- Applies the fetch in **all three** endpoints that feed the PDF: detail (`/[id]`), standalone PDF (`/[id]/pdf`), and send-by-email (`/[id]/send`). This closes every path through which the PDF is generated.
- `formatPaymentMethodValue` exhaustively handles the enum (`bank_transfer`, `paypal`, `mercado_pago`, `cash`, `other`), with a try/catch fallback that returns the raw string if the JSON is malformed. No method type will crash the renderer.
- Type-level safety: by making `payment_methods` required on `InvoiceWithDetails`, every consumer is forced through the compiler — this is how `invoice-preview.ts` was caught and patched.
- Preserves existing `sanitizeForPDF` sanitisation on both label and value.
- Gates the E2 block correctly so users without any method still see a clean PDF.

### Risk / gaps I would flag during review
- **`.limit(3)` is a silent cap.** A freelancer with 4+ active methods will have the overflow omitted from the PDF with no indication. Reasonable for visual layout, but worth noting in SQ-34's AC or as a UX copy (e.g. "showing 3 of N"). Not a blocker.
- **`value` is stored as `varchar` containing JSON**, not `jsonb`. The fix copes with this (stringify if object, try/catch parse), but a future migration to `jsonb` would let the API return structured objects and remove the stringify/parse dance. Out of scope for SQ-138.
- **No unit / integration test** was added for `formatPaymentMethodValue` or for the new API field. SQ-34's test cases (already in the `.context/PBI/.../test-cases.md` for SQ-34) can subsume this coverage, but a small Vitest/Jest test over the formatter would pin the branches.
- **`is_default` ordering only matters if the freelancer has multiple methods.** The `.limit(3)` combined with `is_default DESC` guarantees the default method is always shown first, which is good.
- **Preview mode** intentionally sets `payment_methods: []`. Users previewing a draft in the builder will not see their methods until the invoice is persisted and re-fetched. Again, reasonable, but worth mentioning in SQ-34 UX review.

### Does it fully resolve the bug?
Yes. All three reproduction steps in the ticket are structurally broken by the fix: the API now returns `payment_methods`, the PDF template now renders the E2 block, and the gate condition on `notes || terms || payment_methods.length > 0` means the section appears whenever there's something to show. "In Review" status is waiting on SQA verification, not on additional dev work.

## Root Cause
The invoice-detail / PDF / send endpoints were written without a `payment_methods` query. SQ-32's PDF template already had a placeholder region (E2) for the section, but the server-side fetch that would populate it was never added. SQ-44 did add the fetch, but only in the email-sending flow (for the email body), never in the PDF-generation path. The `InvoiceWithDetails` shared type also lacked a `payment_methods` field, so the compiler did not catch the missing data on any consumer. Net effect: a silent data-shape gap between three API endpoints and a PDF template that was already expecting the data.

Classified as: `implementation-gap` (AC was defined in SQ-32 Scenario 2, but never implemented; caught by exploratory QA post-approval).

## Decision

**Verdict:** FIX-MERGED — recommend closing SQ-138 as Fixed once SQA retests on staging.

**Justification:** PR #82 is merged to `staging` as of 2026-03-28 and is present on HEAD. The code change is structurally correct, covers all three PDF code paths, uses the right DB columns and enum branches (verified against live schema), and aligns with both SQ-32 AC Scenario 2 and SQ-34 AC Scenario 1. No further code change is needed to resolve the reported defect.

**Jira custom field — Root Cause:** `implementation-gap` (alternative, if the field taxonomy uses a different label: `missing-code` or `incomplete-implementation`). The reasoning: the AC existed in SQ-32 but the data-fetch half of the feature was never written — this is a gap, not a regression, not an environment issue, and not "not-a-bug".

## Recommended fix
- **Scope:** none — fix is already merged.
- **Files to touch:** N/A.
- **Approach:**
  1. QA: retest on staging using the ticket's 3 reproduction steps with the AHR Consultoria account and `INV-2026-0001`. Verify Section E2 renders with "PayPal Empresarial" + email.
  2. QA: additionally smoke-test a `bank_transfer` method (label + CLABE/CBU composite) and an `other` method (fallback path) to exercise the formatter branches.
  3. QA: confirm the email-send flow (SQ-44) also attaches the updated PDF and the email body + PDF now agree on which methods are listed.
  4. Transition SQ-138 to the tester who did Shift-Left per the CLAUDE.md workflow, then to Done once validated.
  5. Decide SQ-34's disposition (see Additional notes).
- **Edge cases already handled by the fix:** JSON-parse failure on `value`, empty `payment_methods` array (E2 hidden), missing `notes`/`terms` (full `bottomSection` hidden), more than 3 methods (capped).
- **Edge cases to still verify in QA:**
  - Method with a non-standard `type` value somehow bypassing the enum (shouldn't happen; DB enum enforces it) → formatter's `default` branch is the safety net.
  - Method with empty `label` → `sanitizeForPDF('')` renders nothing; worth confirming the view does not collapse awkwardly.
  - `value` that is plain text (not JSON) → `JSON.parse` throws, falls back to raw `valueStr`; visual rendering should still be acceptable.

## Additional notes
- **Cross-reference with SQ-34:** SQ-34 is in Shift-Left QA, assigned to Arkaitz, with user story "As a user, I want the PDF to include my configured payment methods so that the client knows how to pay me" — i.e. functionally identical to what PR #82 just shipped. Recommended disposition: either (a) close SQ-34 as "Done by SQ-138" and fold its test cases into the SQ-138 regression pack, or (b) keep SQ-34 open but scope it to the polish items PR #82 did not cover (limit-of-3 UX copy, preview-mode handling, unit tests over `formatPaymentMethodValue`, a potential `jsonb` migration of `payment_methods.value`). Option (a) is cleaner and avoids duplicate implementation; option (b) preserves the sprint's estimation and uses SQ-34 as the polish ticket. This should be decided by the PO with input from Arkaitz.
- **SQ-32 "QA Approved" status revisited:** SQ-32 passed QA despite missing AC Scenario 2. The test cases for SQ-32 should be audited — either TC-32-02 was skipped or its passing criteria didn't cover the missing E2 block. The team may want a retrospective item to harden the AC-to-TC traceability so "no missing payment methods" isn't found only during a secondary sweep.
- **SQ-44 parallel:** SQ-44 already proves the pattern: fetch active methods for the given `user_id`, include in the outbound payload. The fact that the pattern wasn't reused for the PDF path is the kind of cross-surface gap that a shared `fetchActivePaymentMethods(userId)` helper in `src/lib/` would have prevented. Worth a small refactor ticket after SQ-34 closes.
- **Data-shape migration candidate:** `payment_methods.value` stored as `varchar` but parsed as JSON by the formatter is a latent bug vector. If the team ever writes an admin tool or a bulk import that puts a non-JSON value in there, the PDF will render the raw string. A one-line migration to `jsonb` (plus a `USING value::jsonb` cast) would make the invariant explicit and remove the try/catch. Not required to close SQ-138.
- **No Supabase RLS changes** were needed by this fix — the existing `payment_methods` RLS (user reads own rows) already scopes the query by `user_id = user.id` in the server handler.
- **Testing infra:** `qa/` Playwright tests should grow a PDF smoke that downloads `/api/invoices/[id]/pdf`, parses the PDF text with `pdf-parse`, and asserts the method label + value strings are present. That protects the fix against regressions if someone later refactors `invoice-document.tsx` and accidentally drops E2.
