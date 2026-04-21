# Incident Investigation: SQ-137

## Metadata
- **Key:** SQ-137
- **Type:** Bug
- **Priority:** Highest
- **Status:** Cannot Reproduce (green / Done category)
- **Assignee:** Rodrigo Godoy
- **Reporter:** Rodrigo Godoy
- **Sprint:** SoloQ Sprint 2 (boardId 3, 2026-03-02 to 2026-03-30, active)
- **Linked US/items:**
  - Parent epic: SQ-13 (Client Management)
  - Blocks: SQ-18 (View Client Invoice History) - currently "Ready For QA"
- **Labels:** blocker, bug, client-management
- **Created:** 2026-03-22
- **Updated (last triage):** 2026-03-28

## Summary
The reporter observed during exploratory testing for SQ-18 that the frontend hit a "missing" client invoice history endpoint that returned 404 Not Found. In fact, the endpoint (`GET /api/clients/[id]/invoices`) has been implemented and shipped since 2026-02-25 (commit `1fd15ec`, merged via PR #58 as `f024ba7`), roughly one month before the bug was filed, and the previous triage on 2026-03-28 already confirmed the endpoint works on staging (HTTP 200, data rendered).

## Context
### Feature affected
- **User story:** SQ-18 - View Client Invoice History. A freelancer can open a client detail page (`/clients/[id]`), switch to the "Facturas" tab, and see the list of that client's invoices plus summary totals (Total Facturado, Total Pagado, Pendiente).
- **Business impact (claimed):** Blocker — if the endpoint truly 404'd, the Facturas tab on each client detail page would be non-functional, degrading the Client Management feature.
- **Actual impact:** None. The endpoint is present, deployed, and functional. The parent US SQ-18 is in "Ready For QA" precisely because the implementation is complete.

### Reporter observations
Description (Rodrigo Godoy, 2026-03-22):
> "Durante las pruebas exploratorias iniciales para la historia SQ-18, se identificó que el frontend intenta consumir un endpoint de historial por cliente que no ha sido implementado en el backend, devolviendo un error 404 Not Found."

No screenshots, network tab evidence, exact URL, or timestamp were attached. Custom fields (Actual Result, Expected Result, Error Type, Severity) were filled in. Labels and parent link were correctly set.

Triage comment (Ely, 2026-03-28, "Triage Result: Cannot Reproduce"):
- Verified on staging (https://staging-upexsoloq.vercel.app) with Playwright CLI.
- Endpoint `GET /api/clients/{id}/invoices` returned HTTP 200 for María García's record (22 invoices, summary totals correct).
- Code has existed since 2026-02-25 (commit `1fd15ec`), predating the bug report by ~1 month.
- Hypothesis: transient Vercel deployment state or tester observing a build that did not yet contain the SQ-18 feature branch.

## Related files / code
- `src/app/api/clients/[id]/invoices/route.ts:95` — GET handler for the "missing" endpoint. Authenticates the user, confirms client ownership via RLS, queries non-deleted invoices ordered by `issue_date DESC`, computes `{ totalInvoiced, totalPaid, totalPending }` via `calculateSummary` (`route.ts:35`) and returns them as JSON. Handles 401 (unauth), 404 (client not found), 500 (DB/unexpected).
- `src/hooks/clients/use-client-invoices.ts:44` — TanStack Query hook that performs `fetch('/api/clients/${clientId}/invoices')`. Returns `{ invoices, summary, isLoading, isError, error, refetch }`. Enabled only when `clientId` is truthy. `staleTime` 30s / `gcTime` 5m.
- `src/hooks/clients/index.ts:1` — Re-exports `useClientInvoices` (plus its `InvoiceHistorySummary` type) as part of the public `@/hooks/clients` barrel.
- `src/components/clients/client-invoice-history.tsx:1` — Client Component that renders three summary cards (`TotalsSummary`), the invoice table (status badges via `InvoiceStatusBadge`), empty state with "Crear Factura" CTA, error banner with retry, and skeleton loader. Uses the hook above.
- `src/app/(app)/clients/[id]/page.tsx:13,153,171` — Client detail page imports `ClientInvoiceHistory` and mounts it inside the "Facturas" tab of the detail view, passing `clientId={id}`.
- Git history: commit `1fd15ec` (2026-02-25) is the initial implementation; merged to `staging` via PR #58 as `f024ba7`. `git branch --contains 1fd15ec` shows `staging` as one of the containing branches. No subsequent deletions or reverts of these files.

## Reproduction attempt
### Steps
1. Verify file presence on disk: `src/app/api/clients/[id]/invoices/route.ts`, `src/hooks/clients/use-client-invoices.ts`, `src/components/clients/client-invoice-history.tsx`, `src/app/(app)/clients/[id]/page.tsx` — all present.
2. Inspect route handler — correct Next.js App Router dynamic segment (`[id]`), exports `async function GET`, uses `createServerFromRequest`.
3. Verify integration in the detail page — hook imported, component mounted on Facturas tab.
4. Check git log for SQ-18 commit and merge into `staging` — present (`1fd15ec` local + `f024ba7` merge).
5. Review the prior triage's live Playwright verification on staging (2026-03-28) — endpoint returned HTTP 200 with 22 rows for María García.

### Result
- Reproduced: NO
- Evidence:
  - File system: all four files exist in `staging`.
  - Git log: `feat(SQ-18): implement client invoice history view` committed 2026-02-25, merged to staging, present on current `staging` HEAD (`git branch --contains 1fd15ec` → `staging`).
  - Prior triage: Playwright Network tab showed `GET /api/clients/{id}/invoices` → `200 OK` with correct summary + 22 invoices.
  - No regressions in the code path between then and now (file unchanged since the original implementation commit).

### Data seed (if any)
none — investigation is purely static (code + git) plus reuse of the earlier staging Playwright evidence. No Supabase queries were required because the reported bug is an HTTP routing/deployment issue, not a data shape or RLS issue.

## Root Cause
Not a code defect. The endpoint `GET /api/clients/[id]/invoices` (handler at `src/app/api/clients/[id]/invoices/route.ts:95`) was implemented and deployed to staging ~4 weeks before the bug was filed and continues to function. The reporter most likely saw a stale Vercel preview (feature branch not yet deployed to their browser session), hit an unauthenticated request that was intercepted upstream, or mistyped/mis-pathed the URL during manual exploration. Because the original bug report contains no URL, no network screenshot, no timestamp, and no build SHA, the exact failure cannot be retroactively diagnosed. The live staging evidence plus the unchanged code path both demonstrate the feature works as specified.

## Decision
**Verdict:** NO-FIX (keep as Cannot Reproduce)
**Justification:** The ticket has already been correctly triaged to "Cannot Reproduce". The endpoint demonstrably exists on disk, on `staging`, and on the deployed environment; the prior Playwright run shows HTTP 200 with well-formed data. There is no code to change and no environment-level misconfiguration in scope of SoloQ. Reopening would require concrete evidence (exact URL, network tab screenshot, commit SHA of the deploy under test, timestamp) which the reporter has not provided.
**Jira custom field suggestion (Root Cause):** not-a-bug (alternative: environment — if the team wants to capture the "stale deployment" hypothesis explicitly).

## Recommended fix
- **Scope:** xs (no code change)
- **Files to touch:** none
- **Approach:** Keep the ticket in `Cannot Reproduce`. If the 404 resurfaces, the reporter should attach (a) the exact URL, (b) a DevTools Network tab screenshot including request headers and response body, (c) the Vercel deploy SHA / timestamp, and (d) whether the issue reproduces locally via `bun dev` + `curl`. Only then should the bug be reopened.
- **Edge cases to cover:** N/A (no change).
- **Tests needed:** Future regression coverage is already implicit in SQ-18 test cases (FTP-001..FTP-007). If desired, add a lightweight E2E in `qa/tests/` that hits `/api/clients/{id}/invoices` with an authenticated session and asserts status 200 + schema — but this is optional and belongs to SQ-18, not SQ-137.

## Additional notes
- The previous triage comment also includes a "Phase 8: Educational Feedback" block rating the bug report 7/10 and recommending the team require network-tab evidence for all 404-class bugs going forward. Codifying that as a QA checklist item would prevent similar CNR tickets.
- SQ-18 is currently "Ready For QA". When QA executes that story, they will exercise the exact same endpoint end-to-end; any real regression would surface there and can be filed as a fresh bug with proper evidence rather than reopening SQ-137.
- The route handler at `route.ts:121-123` returns a localized Spanish error ("Cliente no encontrado") on 404. If a future reporter sees a literal 404 without that payload, it likely originated from Next.js routing (i.e., the route file is missing from the deployed bundle) rather than from this handler — a useful diagnostic hint. This is another reason to insist on the response body in any future repro.
- No Supabase migrations, RLS policies, or schema changes are implicated; the handler relies on existing `clients` and `invoices` tables with the standard RLS model.
- Risk of leaving as CNR: low. If the bug is real and recurs, SQ-18's QA will catch it.
