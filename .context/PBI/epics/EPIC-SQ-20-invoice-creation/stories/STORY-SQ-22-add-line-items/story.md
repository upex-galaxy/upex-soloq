# Add Line Items to Invoice

**Jira Key:** [SQ-22](https://upexgalaxy65.atlassian.net/browse/SQ-22)
**Epic:** [SQ-20](https://upexgalaxy65.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** Medium
**Story Points:** 1
**Status:** Ready For QA

---

## User Story

## User Story

**As a** user
**I want to** add line items (description, quantity, unit price)
**So that** I can detail my services

## Acceptance Criteria

### Scenario 1: Add single line item

- ***Given:*** I am editing an invoice
- ***When:*** I add a line item with description, qty, and price
- ***Then:*** The line appears and subtotal updates

### Scenario 2: Add multiple line items

- ***Given:*** I have one line item
- ***When:*** I click "Add line"
- ***Then:*** A new empty line appears

### Scenario 3: Remove line item

- ***Given:*** I have multiple line items
- ***When:*** I click remove on a line
- ***Then:*** The line is removed and totals update

### Scenario 4: Edit line item

- ***Given:*** I have a line item
- ***When:*** I edit any field
- ***Then:*** Changes are reflected immediately

## Technical Notes

- Table: invoice_items
- Fields: description, quantity, unit*price, line*total
- Real-time calculation
- Minimum 1 line required

## Story Points

5

## 

## 🧪 QA Refinements (Shift-Left Analysis)

**Analysis Date:** 2026-02-18
**Status:** Refined by QA

### Refined Acceptance Criteria (Additional Scenarios)

#### Scenario 5: Line total automatic calculation

- ***Given:*** User is editing a line item
- ***When:*** User enters quantity and unit_price
- ***Then:*** Line total (quantity × price) calculates automatically in real-time

#### Scenario 6: Cannot delete last item

- ***Given:*** Invoice has exactly 1 line item
- ***When:*** User tries to delete it
- ***Then:*** System prevents deletion with message "Debe haber al menos 1 item"

#### Scenario 7: Validation - empty description

- ***Given:*** User is adding a line item
- ***When:*** User leaves description empty and tries to save
- ***Then:*** Error message "La descripción es requerida" is shown

#### Scenario 8: Validation - quantity must be > 0

- ***Given:*** User is adding a line item
- ***When:*** User enters quantity = 0 or negative
- ***Then:*** Error message "La cantidad debe ser mayor a 0" is shown

### Edge Cases Identified

- Delete last item → Must be prevented
- Quantity = 0 → Validation error
- Quantity with decimals (0.5 hours) → Should be allowed
- Description max 500 chars → Enforced (per FR-015)
- Price = $0 → Allowed (per FR-015: unit_price >= 0)

### Clarified Business Rules

- Minimum 1 line item required to SEND invoice (drafts can have 0)
- Line total = quantity × unit_price (calculated automatically)
- Subtotal = SUM(all line_totals)
- Reorder via drag-and-drop is ***optional for MVP***

### Open Questions

- ***Q1:*** Maximum items per invoice? (Suggested: 50)
- ***Q2:*** Whitespace-only descriptions allowed? (Suggested: No)

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

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 2/18/2026
- **Reporter:** Ely
- **Assignee:** Ely
- **Labels:** shift-left-reviewed, test-plan-ready

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:49.380Z_
