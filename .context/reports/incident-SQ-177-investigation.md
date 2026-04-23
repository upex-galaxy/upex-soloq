# Incident Investigation — SQ-177

## Metadata

| Field            | Value                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------- |
| Ticket           | SQ-177                                                                                |
| Title            | [SQ-48] Filtro de estado no persiste en URL ni tras reload                            |
| Type             | Defect                                                                                |
| Priority         | Medium                                                                                |
| Status           | Open                                                                                  |
| Assignee         | Fernando Javier Masci                                                                 |
| Parent US        | SQ-48 (Filtro de estado en listado de facturas)                                       |
| Related tickets  | SQ-169 (empty-state copy on zero-results search), SQ-176 (overdue aggregation/ordering inconsistency) |
| Investigator     | AI incident analyst                                                                   |
| Investigation    | Read-only                                                                             |
| Date             | 2026-04-20                                                                            |
| Environment      | Staging (`https://staging-upexsoloq.vercel.app/invoices`)                             |

---

## Summary

The invoice status filter on `/invoices` (tabs `Todas / Borrador / Enviada / Pagada / Vencida`) is stored **purely in React local state** via `useState`. It is never mirrored to the URL, and the page never reads from `searchParams`. The effect is exactly what QA reported: the network call correctly fires with `?status=paid` (that query lives on the `/api/invoices` backend fetch, not on the browser address bar), but `window.location` stays at `/invoices` and a page reload resets `statusFilter` back to the initial `'all'`.

This breaks AC of SQ-48 (persistence by URL), deep-linking / sharing a filtered view, and browser back/forward navigation across filters. It also affects the search input (`searchQuery`), page (`currentPage`), sort (`sortBy`, `sortOrder`), and limit — none of those are in the URL either, so the entire filter/pagination state is volatile.

The fix is the idiomatic Next.js 16 App Router pattern: keep the page as a client component (or split into RSC + client control), read the initial value from `useSearchParams`, and on every tab change call `router.replace` with the new query string. No backend changes required — the API route already accepts `?status=...`.

---

## Context

- Parent US **SQ-48** defines status-filter UX for the invoices list and its ACs include filter persistence in URL so that reload and deep-links keep the selected status. This defect was raised during exploratory (UI + API + DB) validation in staging.
- The list page is a **single client component** (`'use client'` at the top) that composes a shadcn `Tabs` control with a TanStack Query hook.
- The hook `useInvoices({ status, search, page, limit, sortBy, sortOrder })` builds the request query string from its options and calls `GET /api/invoices?...`. The hook itself is fine — it is the caller's inputs that come from ephemeral `useState` instead of the URL.
- Next.js 16 supports `useSearchParams()` + `router.replace(pathname + '?' + params)` in client components, and `async function Page({ searchParams })` in RSCs. Either approach would satisfy the AC. The current code uses neither.

### Evidence observed by QA (from ticket)

- After selecting "Pagada", browser URL stays at `/invoices` (no `?status=paid`).
- Network tab: `GET /api/invoices?status=paid&page=1&limit=20&sortBy=created_at&sortOrder=desc` → `200`.
- Reload → active tab resets to `Todas`.

---

## Related files

- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/app/(app)/invoices/page.tsx` — buggy list page (client component, local state only).
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/hooks/invoices/use-invoices.ts` — data hook that accepts `status` and builds the API query string (correct).
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/app/api/invoices/route.ts` — API handler that accepts `status` search param (correct; no change needed).
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/hooks/use-debounce.ts` — used for `searchQuery`; same local-state problem, not persisted either.

---

## Reproduction attempt — code trace

### Initial mount

`src/app/(app)/invoices/page.tsx:80-84`

```tsx
export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
```

`statusFilter` initializes unconditionally to `'all'`. Nothing reads `useSearchParams()`. Even if the user lands on `/invoices?status=paid`, the component ignores the query and renders the "Todas" tab.

### Tab change

`src/app/(app)/invoices/page.tsx:113-116`

```tsx
const handleTabChange = (value: string) => {
  setStatusFilter(value as InvoiceStatus | 'all');
  setCurrentPage(1);
};
```

The handler updates **only** in-memory React state. It does not call `router.replace` / `router.push`, nor does it touch `history.pushState`. So the address bar never changes.

### Data fetch

`src/app/(app)/invoices/page.tsx:99-111`

```tsx
const { data: invoices, pagination, isLoading, isError, error, refetch } = useInvoices({
  status: statusFilter === 'all' ? undefined : statusFilter,
  search: debouncedSearch || undefined,
  page: currentPage,
  limit: 20,
});
```

The hook (`use-invoices.ts:66-75`) composes `URLSearchParams` and issues `fetch('/api/invoices?...')`. That is why the **network** request includes `status=paid` while the **browser URL** does not — QA captured both halves of the discrepancy.

### Reload

On `F5`, the component tree is reconstructed and `useState<InvoiceStatus | 'all'>('all')` runs again with its default. No source of truth outside the component survives the reload, so the UI snaps back to "Todas".

### Pagination / Search — same class of bug

- `currentPage` (local state, `setCurrentPage` from `<PaginationControls onPageChange />`) also does not hit the URL.
- `searchQuery` (local state + 300ms debounce) also does not hit the URL.
- Consequently, sharing a link to "page 3 of paid invoices matching ACME" is impossible and a reload resets all three.

---

## Root Cause

**Missing URL synchronization for client-side filter/pagination state.**

Concretely, in `src/app/(app)/invoices/page.tsx`:

1. `statusFilter` is owned by a local `useState` call (line 81) whose initial value is hard-coded to `'all'`.
2. No `useSearchParams()` hook is used anywhere in `src/app/(app)/invoices/` (verified via grep — zero matches).
3. `handleTabChange` (line 113) never calls `router.replace` / `router.push`, so `window.location.search` is never updated.
4. The page never receives or consumes the `searchParams` prop that Next.js 16 passes to server-rendered pages.

The API layer and the TanStack Query hook are both correct — they already understand `status` as an option and forward it. The defect is confined to how the page component manages UI state.

This is a textbook case of "state that should live in the URL lives in `useState`". The Next.js 16 idiom (and the practical fix) is: URL is the source of truth, React state is derived from `useSearchParams()`, and any change is written back via `router.replace` so browser history and deep-linking both work.

---

## Decision + Jira Root Cause custom field

**Decision:** Valid defect. Breaks an explicit AC of SQ-48 (URL persistence / deep-linking) and degrades UX for all filter/pagination interactions on `/invoices`. Fix is small, low-risk, and self-contained to one client component.

**Suggested Jira Root Cause value:** `Frontend state management / URL synchronization` — the bug is in the list page's client-side state design, not in the API, DB, or data hook. No server-side or schema change is required.

Scope note: fixing only `statusFilter` would partially close SQ-177 but leave the same pattern for search + pagination + sort. Recommendation is to fix all four together since the diff is ~20 lines and they are bound to the same `router.replace` call.

---

## Recommended fix — Next.js 16 `searchParams` pattern

Minimal, in-place fix that keeps the existing single-client-component shape (no split needed because this page has lots of client-only UX — framer-motion, dialogs, debounced search — that makes RSC migration a larger refactor).

### 1. Add the Next.js hooks and derive state from the URL

`src/app/(app)/invoices/page.tsx:1-12` — add imports:

```tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
// ...existing imports
```

`src/app/(app)/invoices/page.tsx:80-84` — replace the four `useState` lines:

```tsx
export default function InvoicesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse + validate URL → typed values (fall back to safe defaults)
  const VALID_STATUSES = new Set<InvoiceStatus>(['draft', 'sent', 'paid', 'overdue', 'cancelled']);
  const rawStatus = searchParams.get('status');
  const statusFilter: InvoiceStatus | 'all' =
    rawStatus && VALID_STATUSES.has(rawStatus as InvoiceStatus)
      ? (rawStatus as InvoiceStatus)
      : 'all';
  const currentPage = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const urlSearch = searchParams.get('q') ?? '';

  // Search stays as local state so typing feels instant; URL is written on debounce.
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchQuery, 300);
```

### 2. Single helper that writes the URL

Just above the handlers:

```tsx
const updateSearchParams = useCallback(
  (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === '' || value === 'all') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    // Reset page whenever filters change (but not for a bare page change).
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  },
  [pathname, router, searchParams],
);
```

### 3. Rewrite the handlers

`src/app/(app)/invoices/page.tsx:113-121`:

```tsx
const handleTabChange = (value: string) => {
  updateSearchParams({ status: value, page: undefined }); // status change → reset page
};

const handleSearchChange = (value: string) => {
  setSearchQuery(value);
  // Write the search term to the URL on the debounced value (see effect below).
};

// Sync debounced search → URL (keeps typing snappy, URL settled).
useEffect(() => {
  if ((searchParams.get('q') ?? '') !== debouncedSearch) {
    updateSearchParams({ q: debouncedSearch || undefined, page: undefined });
  }
}, [debouncedSearch, searchParams, updateSearchParams]);
```

`<PaginationControls onPageChange={page => updateSearchParams({ page: String(page) })} />` instead of `setCurrentPage`.

### 4. Feed the hook with URL-derived values

```tsx
const { data: invoices, pagination, isLoading, isError, error, refetch } = useInvoices({
  status: statusFilter === 'all' ? undefined : statusFilter,
  search: debouncedSearch || undefined,
  page: currentPage,
  limit: 20,
});
```

### 5. Wrap the component in `<Suspense>` (Next.js 16 requirement)

`useSearchParams()` causes the route to opt out of prerendering unless it's inside a Suspense boundary. Either:

- Split the client work into an inner `InvoicesView` and wrap it in `<Suspense fallback={<InvoicesListSkeleton />}>` from the page (`page.tsx` can stay a client file or become a tiny RSC shell), **or**
- Keep the page fully client and rely on `force-dynamic` (existing behavior under `(app)/`); confirm the build does not regress CI. The cleaner option is the Suspense split.

### Verification checklist

- [ ] `/invoices?status=paid` → "Pagada" tab active on first paint, list filtered to paid.
- [ ] Click "Vencida" → URL becomes `/invoices?status=overdue`; reload preserves tab + list.
- [ ] Type in search → after 300ms URL shows `?q=...`; reload preserves input and results.
- [ ] Pagination click → URL shows `?page=2`; back/forward move between pages.
- [ ] Changing status resets `page` to 1.
- [ ] Invalid `?status=bogus` falls back to `'all'` (no crash, no API 400).
- [ ] `data-testid="status-filter-tabs"` and `status-tab-*` unchanged — existing E2E selectors keep working.

---

## Additional notes — related UX issues in the same area

Two other defects live in the same `/invoices` surface and should be considered together when planning remediation; fixing them alongside SQ-177 minimizes repeat QA passes.

### SQ-169 — empty-state copy shows "no invoices yet" on a search with zero results

`src/app/(app)/invoices/page.tsx:262-288` renders a single empty state keyed only on `statusFilter === 'all'`. When the user types a search term that returns zero rows, the UI still shows "No tienes facturas aún" / "Crea tu primera factura" — which is wrong. The empty state should branch on whether `debouncedSearch` is non-empty (or any filter is active) and show a "no results for '<term>'" variant with a "Clear filter" button. When SQ-177 is fixed, the URL will also encode the search term, so this empty state can read it straight from `searchParams.get('q')`.

### SQ-176 — overdue aggregation & urgency ordering inconsistency

Related via the same page but orthogonal mechanically. The row rendering in `page.tsx:308-319` derives `overdue` client-side (`isInvoiceOverdue(invoice.status, invoice.due_date)`) and paints those rows red, but the **dashboard counters** (`getTabCount` / `useDashboardSummary`) use server-side `status_counts` which do not include a derived overdue count in the same way — hence QA's observation that "sent" rows render as overdue while the overdue counter stays at 0. Also the default sort is `created_at desc` (hook default), so urgency ordering (overdue first by `days_overdue desc`, then sent by `due_date asc`) is never applied even when expected. Not in SQ-177's scope, but worth mentioning because (a) both bugs live in the same component and (b) once the URL carries `sortBy` / `sortOrder`, wiring an "Urgency" option becomes a 2-line addition.

### Broader opportunity

Every list view in the app that shows filters (`/clients`, `/invoices`, dashboard drilldowns) should follow the same Next.js 16 `useSearchParams` + `router.replace` idiom. Consider introducing a small `useUrlState(key, { parse, serialize, defaultValue })` hook in `src/hooks/` so the pattern is reused and consistent — scope for a follow-up ticket, not for SQ-177.
