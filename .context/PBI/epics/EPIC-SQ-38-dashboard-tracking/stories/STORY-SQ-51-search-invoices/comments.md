# Feature Test Plan - SQ-51

## Review Table

| Area | Details |
| --- | --- |
| Objective | Validate invoice search from the dashboard with focus on UX, correctness, performance, and data consistency. |
| In Scope | Search box visibility, fixed header behavior, `invoice_number`, `client.name`, `client.email`, case-insensitive partial match, 300ms debounce, no-results, clear search, `?search={query}`. |
| Out of Scope | Advanced search syntax, search by amount, search by date range, saved searches, full-text indexing. |
| Key Risks | Live vs submit ambiguity, precedence with filters/pagination, invalid input handling, large dataset performance. |
| Test Types | UI, API, DB, UX, performance-functional checks. |
| Open Questions | Live vs submit, exact searchable fields, debounce threshold, precedence with filters/pagination. |
| Dev SP | 8 |
| QA SP | 5 |

## Notes

- Search should remain case-insensitive.
- No fuzzy/advanced search in this scope.
- Empty state must be differentiated from no-results.
