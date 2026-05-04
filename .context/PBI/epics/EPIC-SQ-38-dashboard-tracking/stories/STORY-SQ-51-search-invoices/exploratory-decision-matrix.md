# SQ-51 Exploratory Decision Matrix

**Story:** SQ-51 (Search Invoices)
**Objective:** close open behavior gaps with evidence from UI + API (+ data consistency check).

---

## Decision Rules

- **PASS-DEFAULT:** implementation matches AC intent and proposed defaults.
- **PO-DECISION:** implementation is consistent, but rule remains product-ambiguous.
- **BUG:** implementation contradicts AC or creates inconsistent UX/API behavior.

---

## Gap Matrix

| Gap | UI Verification | API Verification | Data/Consistency Check | Expected Evidence | Decision |
| --- | --- | --- | --- | --- | --- |
| Search trigger behavior | Query updates results without pressing Enter (`INV-2026-20354`, `POSTMAN`) | `GET /api/invoices?search=...` fired automatically while typing | Latest query reflected in result count; no stale flash observed | MCP run + request log | PASS-DEFAULT |
| Filter + pagination precedence | On page 2, applying search returns filtered set | Request changed from `page=2` to `search=...&page=1`; with filter tab active it sent `status=sent&search=...&page=1` | Status filter retained while search applied; pagination reset to page 1 | Request log with `status=sent` and `page=1` | PASS-DEFAULT |
| Query normalization | `"  INV-2026-20354  "` returns same result as trimmed query | Outgoing URL preserves spaces (`search=++INV-...++`), backend still returns match | Effective normalization occurs server-side (`trim`) | Result count remains `1 factura encontrada` | PASS-DEFAULT |
| No-results vs empty-state | `zzzz-not-found` shows `0 facturas encontradas` but displays heading `No tienes facturas aun` | API returns `200` with empty set | UX copy is not differentiated from first-use empty account state | Snapshot + response status 200 | BUG |

---

## Suggested Execution Order

1. Baseline search by invoice number (exact and partial).
2. Search by client name/email (case-insensitive).
3. Trigger/debounce/race behavior.
4. Filter + pagination precedence checks.
5. No-results and clear-search restoration.

---

## Exit Criteria

- All four open gaps classified with evidence.
- At least one verified path each for number, name, and email searches.
- Any mismatch logged as bug with AC traceability.
- Final recommendation ready for PO/TL confirmation if behavior is ambiguous.

---

## Exploratory Verdict (Current)

- **Overall:** PARTIAL PASS
- **Passed gaps:** trigger behavior, filter/pagination precedence, query normalization.
- **Open defect candidate:** no-results vs empty-state messaging (classification `BUG`).
- **Bug tracking:** `SQ-169` (created and linked to `SQ-51`).
- **Recommended action:** create/track bug linked to SQ-51 and re-validate UX copy/state separation after fix.
