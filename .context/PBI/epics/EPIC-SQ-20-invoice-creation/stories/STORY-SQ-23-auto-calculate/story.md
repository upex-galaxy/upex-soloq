# Automatic Subtotal and Total Calculation

**Jira Key:** [SQ-23](https://upexgalaxy65.atlassian.net/browse/SQ-23)
**Epic:** [SQ-20](https://upexgalaxy65.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** Medium
**Story Points:** 8
**Status:** QA Approved

---

## User Story

## User Story

***As a*** user
***I want to*** the system to automatically calculate subtotal and total
***So that*** I avoid calculation errors

## Acceptance Criteria

### Scenario 1: Calculate line totals

- ***Given:*** I enter qty=2 and price=100
- ***When:*** I move to next field
- ***Then:*** Line total shows 200

### Scenario 2: Calculate subtotal

- ***Given:*** I have multiple line items
- ***When:*** I look at the subtotal
- ***Then:*** It shows the sum of all line totals

### Scenario 3: Calculate grand total

- ***Given:*** I have subtotal, tax, and discount
- ***When:*** I look at the total
- ***Then:*** It shows subtotal + tax - discount

### Scenario 4: Handle decimals correctly

- ***Given:*** I enter price=99.99 and qty=3
- ***When:*** Calculation runs
- ***Then:*** Total is 299.97 (not floating point errors)

## Technical Notes

- Use decimal arithmetic (not float)
- Round to 2 decimal places
- Real-time updates
- Formula: total = (subtotal * (1 + tax_rate)) - discount

## Story Points

3

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
- **Updated:** 2/26/2026
- **Reporter:** Ely
- **Assignee:** Raúl González

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:50.166Z_
