# SQ-55 Exploratory Decision Matrix

**Story:** SQ-55 (Payment Amount)
**Objective:** Resolve open behavior gaps against implemented feature using evidence from UI + API + DB.

---

## Decision Rules

- **PASS-DEFAULT:** implementation matches proposed default and AC intent.
- **PO-DECISION:** implementation is consistent but product rule remains ambiguous.
- **BUG:** implementation contradicts AC or causes data inconsistency.

---

## Gap Matrix

| Gap | UI Verification | API Verification | DB Verification | Expected Evidence | Decision |
| --- | --- | --- | --- | --- | --- |
| Partial/overpayment warning behavior | Submit partial and over amount; check warning text and submit allowed/blocked | Verify response status/payload for partial and overpayment | Verify payment row persists when submit succeeds | Screenshot + request/response + SQL row | PASS-DEFAULT / PO-DECISION / BUG |
| Decimal precision rule | Enter 2+ decimals and 3+ decimals (`1000.99`, `1000.999`) | Inspect payload sent; check rounding/rejection | Validate stored value precision | UI message + payload + stored value | PASS-DEFAULT / PO-DECISION / BUG |
| Input normalization | Try `0`, `0.00`, `01000`, ` 1000 `, `abc` | Validate backend rejects invalid or normalizes accepted values | Confirm no invalid rows persisted | Validation messages + API status + DB integrity | PASS-DEFAULT / PO-DECISION / BUG |
| Prefill and formatting | Open form from different invoices; verify default amount and currency format | Confirm invoice total fetched matches prefill | Verify payment amount aligns with invoice total rule | Prefill screenshot + fetch response + SQL check | PASS-DEFAULT / PO-DECISION / BUG |

---

## Suggested Execution Order

1. Full payment happy path (control sample).
2. Partial payment behavior.
3. Overpayment behavior.
4. Precision and normalization matrix.
5. Data integrity and refresh consistency.

---

## Exit Criteria

- All four gaps classified with evidence.
- No blocker in full payment happy path.
- Any mismatch logged as bug with AC traceability.
- Decision memo ready for PO/TL validation if needed.
