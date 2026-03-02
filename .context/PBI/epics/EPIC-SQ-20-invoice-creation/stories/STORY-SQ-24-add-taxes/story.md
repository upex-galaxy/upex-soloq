# Add Taxes to Invoice

**Jira Key:** [SQ-24](https://upexgalaxy65.atlassian.net/browse/SQ-24)
**Epic:** [SQ-20](https://upexgalaxy65.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** Medium
**Story Points:** 3
**Status:** In Test

---

## User Story

## User Story

***As a*** user
***I want to*** add taxes (VAT/percentage)
***So that*** I can comply with tax requirements

## Acceptance Criteria

### Scenario 1: Add tax percentage

- ***Given:*** I am editing an invoice
- ***When:*** I enter tax rate 16%
- ***Then:*** Tax amount is calculated and added to total

### Scenario 2: No tax option

- ***Given:*** I don't need to charge tax
- ***When:*** I leave tax at 0%
- ***Then:*** No tax is added

### Scenario 3: Tax appears on invoice

- ***Given:*** I added 16% tax
- ***When:*** I view/generate the invoice
- ***Then:*** Tax line shows "IVA 16%: $X.XX"

## Technical Notes

- Field: tax_rate (decimal, 0-100)
- Common presets: 16% (MX), 19% (CO), 21% (AR)
- Tax calculated on subtotal

## Story Points

2

---

## Acceptance Criteria

Feature:

Background:
Given ...

Scenario: ...
Given ...
When ...
Then ...

---

## Traceability

### Improvement (1)

- [SQ-87](https://upexgalaxy65.atlassian.net/browse/SQ-87): SQ-24|[DB] Agregar constraint para impedir tasas de impuesto negativas _(OPEN)_

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 2/25/2026
- **Reporter:** Ely
- **Assignee:** Gloria Jesely Galindez Suárez

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:50.485Z_
