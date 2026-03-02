# Delete Client

**Jira Key:** [SQ-19](https://upexgalaxy65.atlassian.net/browse/SQ-19)
**Epic:** [SQ-13](https://upexgalaxy65.atlassian.net/browse/SQ-13) (Client Management)
**Priority:** Medium
**Story Points:** 10
**Status:** Ready For QA

---

## User Story

## User Story

***As a*** user
***I want to*** delete a client I no longer use
***So that*** I can keep my list clean

## Acceptance Criteria

### Scenario 1: Delete client without invoices

- ***Given:*** I have a client with no invoices
- ***When:*** I click delete and confirm
- ***Then:*** The client is removed from my list

### Scenario 2: Delete client with invoices (soft delete)

- ***Given:*** I have a client with existing invoices
- ***When:*** I click delete and confirm
- ***Then:*** The client is hidden from my list but invoices still reference them

### Scenario 3: Confirmation dialog

- ***Given:*** I click delete on a client
- ***When:*** The confirmation dialog appears
- ***Then:*** I must confirm before the client is deleted

### Scenario 4: Restore deleted client (future)

- ***Given:*** I accidentally deleted a client
- ***When:*** I go to "Deleted Clients"
- ***Then:*** I can restore them (v2 feature)

## Technical Notes

- Soft delete: is_deleted = true
- Hide from list but keep for invoice references
- Confirmation required
- API: DELETE /api/clients/:id

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
- **Updated:** 3/2/2026
- **Reporter:** Ely
- **Assignee:** Ronny Toro

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:47.047Z_
