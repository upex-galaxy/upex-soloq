# Feature Test Plan - SQ-55

## Review Table

| Area | Details |
| --- | --- |
| Objective | Validate amount-received entry against the invoice total with strong coverage for formatting, validation, warnings, and prefill behavior. |
| In Scope | Amount field visibility, prefill with invoice total, 2-decimal support, currency formatting, required/positive/numeric validation, partial/full/overpayment, warning/notice behavior. |
| Out of Scope | Multiple partial payments tracking, currency conversion, bank reconciliation, payment plans/installments. |
| Key Risks | Ambiguous warning behavior, precision/rounding rules, invalid values like `0`, `0.00`, `01000`, whitespace, and currency formatting mismatch. |
| Test Types | UI, API, DB, UX, validation and boundary checks. |
| Open Questions | 2-decimal rule, warning blocks vs informs, value normalization, prefill source/ordering. |
| Dev SP | 5 |
| QA SP | 5 |

## Notes

- Amount input should remain numeric only.
- Partial and overpayment warnings need explicit blocking rules.
- Prefill must be deterministic if multiple payments exist.
