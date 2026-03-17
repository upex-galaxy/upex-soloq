# Save Invoice as Draft

**Jira Key:** [SQ-30](https://upexgalaxy65.atlassian.net/browse/SQ-30)
**Epic:** [SQ-20](https://upexgalaxy65.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** Medium
**Story Points:** 5
**Status:** Ready For QA

---

## User Story

## User Story

***As a*** user
***I want to*** save an invoice as draft
***So that*** I can finish it later

## Acceptance Criteria

### Scenario 1: Save as draft

- ***Given:*** I am creating an invoice
- ***When:*** I click "Save Draft"
- ***Then:*** Invoice is saved with status "draft"

### Scenario 2: Resume draft

- ***Given:*** I have a draft invoice
- ***When:*** I click on it from my list
- ***Then:*** I can continue editing

### Scenario 3: Draft not sent to client

- ***Given:*** I have a draft invoice
- ***When:*** I look at my dashboard
- ***Then:*** Draft is clearly marked and not counted as sent

### Scenario 4: Delete draft

- ***Given:*** I have a draft I no longer need
- ***When:*** I delete it
- ***Then:*** Draft is removed

## Technical Notes

- Status: draft, sent, paid, overdue, cancelled
- Drafts don't send emails
- Drafts can be edited freely

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
- **Updated:** 2/12/2026
- **Reporter:** Ely
- **Assignee:** Luis Eduardo Flores Villarroel

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:52.856Z_
