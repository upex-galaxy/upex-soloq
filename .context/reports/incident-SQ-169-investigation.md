# Incident Investigation: SQ-169

## Metadata
- **Key:** SQ-169
- **Summary:** "SQ-51: En búsqueda sin resultados se muestra copy de cuenta vacía en lugar de estado diferenciado de no resultados"
- **Type:** Defect
- **Priority:** Medium
- **Status:** Open
- **Assignee:** Fernando Javier Masci
- **Reporter:** (ticket description only — observed during SQ-51 smoke/exploratory)
- **Related US:** SQ-51 "Search invoices by client or number"
- **Environment:** https://staging-upexsoloq.vercel.app/invoices
- **Investigated on:** 2026-04-20

## Summary
Confirmed. When the user types a search query that matches no invoices (e.g. `zzzz-not-found`) on `/invoices`, the page renders the generic empty-account copy ("No tienes facturas aún" + the "Crear primera factura" CTA) instead of a differentiated "no results" state. The bug is a missing branch in the empty-state conditional at `src/app/(app)/invoices/page.tsx:262-289`: the JSX only switches on `statusFilter`, and completely ignores `debouncedSearch`. When the filter is `all` and the search returns 0 rows, the code falls into the "tienes facturas = 0 en tu cuenta" message, which is false and misleading — the account actually has invoices, none match the query. The exact same feature already exists and works correctly on `/clients` (see `ClientsEmptyState` with `isSearchResult` prop). A small JSX tweak on the invoices page closes the gap; no data-layer or API change is required.

## Context (UX impact)
- **User story affected:** SQ-51 "Search invoices by client or number". Its AC assumes a differentiated no-results state; SQ-169 documents the gap.
- **What the user sees today:**
  - Card heading still says "Todas las facturas".
  - `CardDescription` correctly displays `0 facturas encontradas` (honest, derived from `pagination.total`).
  - Body shows the "onboarding" empty state: big `FileText` icon, title **"No tienes facturas aún"**, subtitle **"Crea tu primera factura para comenzar a facturar a tus clientes."**, plus a **"Crear primera factura"** CTA that links to `/invoices/create`.
- **UX consequences:**
  - Cognitive dissonance: the user *knows* they have invoices (they were just looking at the list before typing), but the app claims otherwise.
  - Wrong primary action: the "Crear primera factura" CTA pushes new-invoice creation instead of the actually-helpful action (clear search / refine query).
  - Contradicts the card sub-line ("0 facturas encontradas"), which accurately describes the result but then gets drowned out by the big onboarding block.
  - Breaks SQ-51 acceptance criteria and the well-established pattern already used on `/clients`.
- **Impact scope:** presentation-only. Search itself (`useInvoices({ search })`) works fine — `pagination.total = 0` is returned correctly.

## Related files / code

### Primary defect site
- `src/app/(app)/invoices/page.tsx:80-135` — page state and query wiring:
  - `const [searchQuery, setSearchQuery] = useState('')` (line 83).
  - `const debouncedSearch = useDebounce(searchQuery, 300)` (line 84).
  - `const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')` (line 81).
  - `useInvoices({ status: statusFilter === 'all' ? undefined : statusFilter, search: debouncedSearch || undefined, ... })` (lines 99-111).
- `src/app/(app)/invoices/page.tsx:262-289` — the empty-state JSX. The branching logic *exists* but only on `statusFilter`, not on the active search term:

```tsx
{/* Empty state */}
{!isLoading && !isError && invoices.length === 0 && (
  <div
    className="flex flex-col items-center justify-center py-12 text-center"
    data-testid="invoice-empty-state"
  >
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
      <FileText className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-medium">
      {statusFilter === 'all'
        ? 'No tienes facturas aún'
        : `No hay facturas en estado "${INVOICE_STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}"`}
    </h3>
    <p className="text-muted-foreground max-w-md mb-4">
      {statusFilter === 'all'
        ? 'Crea tu primera factura para comenzar a facturar a tus clientes.'
        : 'Intenta con otro filtro o crea una nueva factura.'}
    </p>
    {statusFilter === 'all' && (
      <Button asChild className="shadow-sm hover:shadow-md transition-shadow" data-testid="create-first-invoice-button">
        <Link href="/invoices/create">
          <Plus className="mr-2 h-4 w-4" />
          Crear primera factura
        </Link>
      </Button>
    )}
  </div>
)}
```

Note: no reference to `searchQuery` / `debouncedSearch` anywhere inside the empty-state block — this is the bug.

### Good reference pattern (for parity)
- `src/app/(app)/clients/page.tsx:142-174` — the clients page builds:
  - `const hasSearch = debouncedSearch.length > 0;` (line 146)
  - `const showEmptyState = !isLoading && !hasClients;` (line 147)
  - Then `<ClientsEmptyState isSearchResult={hasSearch} onClearSearch={hasSearch ? handleClearSearch : undefined} />` (lines 170-173).
- `src/components/clients/clients-empty-state.tsx:19-59` — canonical empty-state component with two branches:
  - **Search-result branch** (lines 23-39): `SearchX` icon, heading "No se encontraron clientes", copy "Intenta con otros términos de búsqueda", secondary "Limpiar búsqueda" button → calls `onClearSearch`.
  - **Onboarding branch** (lines 41-58): `Users` icon, heading "No tienes clientes aún", CTA "Agregar Primer Cliente".

## Reproduction attempt (code trace)

### Steps reproduced via source trace (no live browser)
1. User lands on `/invoices` with at least one invoice in account.
2. User types `zzzz-not-found` in the search input (`src/app/(app)/invoices/page.tsx:196-202`).
3. `handleSearchChange` fires → `setSearchQuery('zzzz-not-found')` and `setCurrentPage(1)` (lines 118-121).
4. `useDebounce(searchQuery, 300)` delivers `debouncedSearch = 'zzzz-not-found'` after 300 ms (line 84).
5. `useInvoices({ status: undefined, search: 'zzzz-not-found', page: 1, limit: 20 })` fires; backend returns `{ data: [], pagination: { total: 0, page: 1, totalPages: 0, limit: 20 } }`.
6. Render path:
   - `pagination?.total ?? invoices.length` → `0`, so the `CardDescription` prints **"0 facturas encontradas"** (line 228). Good.
   - Guard `!isLoading && !isError && invoices.length === 0` is **true** (line 262) → enter empty-state block.
   - Inside the block: `statusFilter === 'all'` is still `true` (tab untouched), so:
     - Title → `'No tienes facturas aún'`.
     - Copy → `'Crea tu primera factura para comenzar a facturar a tus clientes.'`.
     - CTA → `<Button>` link to `/invoices/create`.
7. **Observed result matches the ticket:** generic "empty account" copy, while the account is not empty and a search term is active.

### Why the branch is insufficient
The JSX never reads `debouncedSearch` / `searchQuery`. Both (search active, statusFilter === 'all') and (search empty, statusFilter === 'all') collapse into the same sub-branch. Status tabs have a second branch, but search has none.

### Secondary observation
- The `CardDescription` on line 228 already prints the correct "0 facturas encontradas", so the server/API contract is fine; the bug is strictly in the empty-state rendering below it.
- There is no `data-testid` that differentiates "search no-results" vs "empty onboarding" — test automation currently cannot distinguish them.

## Root Cause
**Missing conditional branch for `debouncedSearch.length > 0` inside the empty-state block at `src/app/(app)/invoices/page.tsx:262-289`.** The empty-state only considers `statusFilter`; it does not consider the active search term. When the search yields zero rows, the code falls through to the onboarding copy ("No tienes facturas aún" + "Crear primera factura") even though the account contains invoices.

This is a **presentation / state-derivation defect**, not a data defect. The backend correctly returns `total = 0`; the UI just picks the wrong message.

The same logic is implemented correctly for clients (`hasSearch` flag + `ClientsEmptyState` with `isSearchResult` prop). The invoices page was implemented before that pattern existed and never adopted it.

## Decision + Jira Root Cause custom field
- **Verdict:** Valid defect — ticket accurately describes the bug.
- **Severity:** Low (cosmetic + UX). No data loss, no broken flow. Easy workaround (user can clear the search), but it violates SQ-51 AC and the app's own design system (clients page already solves it).
- **Priority:** agrees with ticket (Medium).
- **Type of bug:** UI / State handling (missing conditional on derived state).
- **Jira Root Cause custom field (suggested value):** `Frontend - UI State` (alternatively `Frontend - Logic / Conditional rendering`) — choose whichever matches the project's taxonomy. Rationale string: *"Empty-state JSX at `src/app/(app)/invoices/page.tsx` branches only on `statusFilter`; it does not branch on the active search term, so a 0-result search falls through to the onboarding copy."*
- **Disposition:** Ready to fix under `fix/SQ-169/invoices-no-results-empty-state`. No migration, no API change. Pure component-level edit.

## Recommended fix (branching on filter presence — specific JSX)

### Option A — inline fix (minimum diff, keeps the existing component shape)

In `src/app/(app)/invoices/page.tsx`:

1. Just above the `return (`, derive filter flags (around line 136):

```ts
const hasSearch = debouncedSearch.trim().length > 0;
const hasStatusFilter = statusFilter !== 'all';
const hasFilters = hasSearch || hasStatusFilter;
```

2. Replace the existing empty-state block (lines 262-289) with a branch on `hasFilters`:

```tsx
{/* Empty state */}
{!isLoading && !isError && invoices.length === 0 && (
  <div
    className="flex flex-col items-center justify-center py-12 text-center"
    data-testid={hasFilters ? 'invoice-no-results-state' : 'invoice-empty-state'}
  >
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
      {hasSearch ? (
        <Search className="h-8 w-8 text-muted-foreground" />
      ) : (
        <FileText className="h-8 w-8 text-muted-foreground" />
      )}
    </div>

    {hasSearch ? (
      <>
        <h3 className="text-lg font-medium">No se encontraron facturas</h3>
        <p className="text-muted-foreground max-w-md mb-4">
          No hay resultados para &ldquo;{debouncedSearch}&rdquo;
          {hasStatusFilter
            ? ` en estado "${INVOICE_STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}"`
            : ''}
          . Intenta con otros términos o revisa los filtros.
        </p>
        <Button
          variant="outline"
          onClick={() => handleSearchChange('')}
          data-testid="invoice-clear-search-button"
        >
          Limpiar búsqueda
        </Button>
      </>
    ) : hasStatusFilter ? (
      <>
        <h3 className="text-lg font-medium">
          No hay facturas en estado &ldquo;
          {INVOICE_STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}
          &rdquo;
        </h3>
        <p className="text-muted-foreground max-w-md mb-4">
          Intenta con otro filtro o crea una nueva factura.
        </p>
      </>
    ) : (
      <>
        <h3 className="text-lg font-medium">No tienes facturas aún</h3>
        <p className="text-muted-foreground max-w-md mb-4">
          Crea tu primera factura para comenzar a facturar a tus clientes.
        </p>
        <Button
          asChild
          className="shadow-sm hover:shadow-md transition-shadow"
          data-testid="create-first-invoice-button"
        >
          <Link href="/invoices/create">
            <Plus className="mr-2 h-4 w-4" />
            Crear primera factura
          </Link>
        </Button>
      </>
    )}
  </div>
)}
```

Key points:
- Three mutually exclusive branches, in priority order: **search active > status filter active > truly empty account**.
- "Crear primera factura" CTA is shown **only** in the truly-empty branch (prevents pushing creation when the user is clearly searching).
- New `data-testid="invoice-no-results-state"` lets automation and the SQ-169 retest distinguish the two states. The existing `invoice-empty-state` testid is preserved for the onboarding case to avoid breaking existing tests.
- New `data-testid="invoice-clear-search-button"` mirrors the `clients-clear-search` pattern.
- Uses the already-imported `Search` icon (line 6) — no new imports needed beyond what's already there.

### Option B — factor out a shared component (recommended longer term)
Extract an `InvoicesEmptyState` component under `src/components/invoices/invoices-empty-state.tsx`, mirroring `ClientsEmptyState`'s API (`{ isSearchResult, onClearSearch, statusFilter }`). That aligns both lists on one pattern and makes future Sprint-6 features (e.g. payments list) trivially consistent. Safe to do as a follow-up; not required for SQ-169 to close.

### Test coverage to add
- UI E2E (Playwright): on `/invoices`, type `zzzz-not-found` → assert `[data-testid="invoice-no-results-state"]` visible, `[data-testid="invoice-clear-search-button"]` visible, `[data-testid="create-first-invoice-button"]` **not** visible, assert text contains `"zzzz-not-found"`.
- Onboarding regression: with a user that has zero invoices and an empty search → assert `[data-testid="invoice-empty-state"]` + `create-first-invoice-button` still visible.
- Status filter regression: select the `paid` tab on an account with no paid invoices and empty search → assert the existing "No hay facturas en estado 'Pagada'" copy is preserved.

## Additional notes

### Cross-reference: Clients list already has the correct pattern
- `/clients` implements exactly the differentiation SQ-169 asks for. See `src/app/(app)/clients/page.tsx:146-173` and `src/components/clients/clients-empty-state.tsx`. This is the **reference implementation**; the invoices fix should match its vocabulary (`isSearchResult`, `onClearSearch`) and component shape for codebase consistency. No bug exists on the Clients list today — only on Invoices.

### Is the same defect present anywhere else?
Searched for other list pages with a `useDebounce` search + empty-state pattern:
- `/invoices` — **buggy** (this ticket).
- `/clients` — correct.
- `/invoices/[id]` (detail) — not a list, N/A.
- `/settings`, `/dashboard` — no search UI.
No other list surfaces were found with the same pattern, so SQ-169 is isolated to the invoices list.

### Side-observations surfaced during the trace (not required for SQ-169 close-out, but worth logging)
- The `CardDescription` copy `${total} factura${total !== 1 ? 's' : ''} encontrada${total !== 1 ? 's' : ''}` (`src/app/(app)/invoices/page.tsx:228`) is technically correct but slightly odd when `total === 0` (`"0 facturas encontradas"`); the proposed fix's headline now takes over that role visually, which is fine.
- When a 0-result state is shown today, the "Limpiar búsqueda" affordance only exists as the small `X` inside the search input (lines 203-212). It is easy to miss. The proposed `invoice-clear-search-button` duplicates that action in the empty state for a better UX (same choice clients page made).
- There is no `data-testid` for the search input's clear button beyond `search-clear-button` on line 208 — keep that testid; add the new one for the empty-state variant.

### Suggested fix title / commit
- Branch: `fix/SQ-169/invoices-no-results-empty-state`
- Commit: `fix(SQ-169): differentiate no-results vs empty-account state on /invoices`
- PR base: `staging` (per project git rules).
