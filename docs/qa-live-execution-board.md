# QA Live Execution Board

**Source:** Jira live query (2026-04-02)
**Environment under test:** `https://staging-upexsoloq.vercel.app/`

---

## EPIC-SQ-38 (Dashboard Tracking)

| Story | Status Jira  | QA Status   | Notes                                            |
| ----- | ------------ | ----------- | ------------------------------------------------ |
| SQ-47 | Ready For QA | Pending     | Candidate after SQ-51                            |
| SQ-48 | Ready For QA | Pending     | Candidate after SQ-51                            |
| SQ-49 | Ready For QA | Pending     | Candidate after SQ-51                            |
| SQ-50 | Ready For QA | Pending     | Candidate after SQ-51                            |
| SQ-51 | In Test      | In Progress | Exploratory partial pass; bug logged as `SQ-169` |
| SQ-52 | Ready For QA | Pending     | Candidate after SQ-51                            |

## EPIC-SQ-39 (Payment Tracking)

| Story | Status Jira  | QA Status | Notes                                                               |
| ----- | ------------ | --------- | ------------------------------------------------------------------- |
| SQ-53 | Ready For QA | Blocked   | Needs reachable `sent` invoice precondition                         |
| SQ-54 | Ready For QA | Blocked   | Depends on payment registration flow                                |
| SQ-55 | BLOCKED      | Blocked   | Precondition `draft -> sent` not reachable in observed staging path |
| SQ-56 | Ready For QA | Blocked   | Depends on payment registration flow                                |
| SQ-57 | Ready For QA | Blocked   | Depends on payment registration flow                                |
| SQ-58 | Ready For QA | Blocked   | Depends on `paid` invoice to test revert                            |

---

## Execution Order (Non-blocked first)

1. SQ-51 smoke + exploratory decision matrix.
2. SQ-47, SQ-48, SQ-49, SQ-50, SQ-52 (EPIC-SQ-38) in that order.
3. Resume EPIC-SQ-39 stories once TL/owner unblocks precondition path or seeds `sent/overdue` data.

### SQ-51 Immediate Test Script (manual)

1. Login and open `/invoices`.
2. Validate search input visible (`invoice-search-input`) and clear action (`search-clear-button`).
3. Query by invoice number exact and partial.
4. Query by client name and email token (case-insensitive).
5. Apply status filter, then search and verify precedence behavior.
6. Validate no-results message and then clear search.
7. Capture Network requests for `GET /api/invoices?search=` and attach evidence.

---

## External Risks Tracked in Parallel

- `SQ-90` smoke fail (create->search consistency) tracked as non-blocking for current stream.
- `SQ-12` finding: multiple methods can be marked as preferred; expected single preferred method.
- `SQ-169` created from SQ-51 exploratory: no-results vs empty-state mismatch.
