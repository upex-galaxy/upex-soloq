# Assign Unique Invoice Number

**Jira Key:** [SQ-27](https://upexgalaxy65.atlassian.net/browse/SQ-27)
**Epic:** [SQ-20](https://upexgalaxy65.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** Medium
**Story Points:** 7
**Status:** Ready For QA

---

## User Story

## User Story

***As a*** user
***I want to*** assign a unique invoice number
***So that*** I can keep track of my numbering

## Acceptance Criteria

### Scenario 1: Auto-generate invoice number

- ***Given:*** I am creating a new invoice
- ***When:*** The invoice is saved
- ***Then:*** System auto-assigns next sequential number

### Scenario 2: Custom invoice number

- ***Given:*** I want to use my own numbering
- ***When:*** I edit the invoice number field
- ***Then:*** My custom number is used

### Scenario 3: Prevent duplicates

- ***Given:*** I try to use an existing invoice number
- ***When:*** I save the invoice
- ***Then:*** I see an error about duplicate number

## Technical Notes

- Format: USER_PREFIX-XXXX (e.g., INV-0001)
- Auto-increment per user
- Configurable prefix in settings
- Unique constraint per user

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

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 2/11/2026
- **Reporter:** Ely
- **Assignee:** Froylan Rodriguez

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:51.863Z_
