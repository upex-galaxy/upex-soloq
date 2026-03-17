# Add Client Tax Information

**Jira Key:** [SQ-17](https://upexgalaxy65.atlassian.net/browse/SQ-17)
**Epic:** [SQ-13](https://upexgalaxy65.atlassian.net/browse/SQ-13) (Client Management)
**Priority:** Medium
**Story Points:** 13
**Status:** Ready For QA

---

## User Story

## User Story

***As a*** user
***I want to*** add client tax information (RFC/NIT)
***So that*** I can include it in invoices

## Acceptance Criteria

### Scenario 1: Add client tax ID

- ***Given:*** I am editing a client
- ***When:*** I add their tax ID (RFC/NIT/CUIT)
- ***Then:*** The tax ID is validated and saved

### Scenario 2: Tax ID appears on invoice

- ***Given:*** A client has a tax ID configured
- ***When:*** I create an invoice for that client
- ***Then:*** The client's tax ID appears on the invoice

### Scenario 3: Skip client tax ID

- ***Given:*** My client doesn't have a tax ID
- ***When:*** I leave the field empty
- ***Then:*** I can still invoice them (tax ID section omitted)

### Scenario 4: Dynamic validation by country

- ***Given:*** I am adding a client's tax ID
- ***When:*** I select their country
- ***Then:*** The tax ID validation changes accordingly

## Technical Notes

- Fields: tax*id, tax*id_type
- Same validation logic as business profile
- Optional field

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
- **Updated:** 2/7/2026
- **Reporter:** Ely
- **Assignee:** YENNY BARBOSA

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:45.923Z_
