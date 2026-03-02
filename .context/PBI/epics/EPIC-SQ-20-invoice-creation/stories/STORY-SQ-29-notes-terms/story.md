# Add Notes and Terms to Invoice

**Jira Key:** [SQ-29](https://upexgalaxy65.atlassian.net/browse/SQ-29)
**Epic:** [SQ-20](https://upexgalaxy65.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** Medium
**Story Points:** 8
**Status:** Ready For QA

---

## User Story

## User Story

***As a*** user
***I want to*** add notes or terms and conditions
***So that*** I can communicate additional information

## Acceptance Criteria

### Scenario 1: Add custom note

- ***Given:*** I am editing an invoice
- ***When:*** I type in the notes field
- ***Then:*** The note is saved with the invoice

### Scenario 2: Use default terms

- ***Given:*** I have default terms configured
- ***When:*** I create a new invoice
- ***Then:*** Default terms are pre-filled

### Scenario 3: Notes appear on invoice

- ***Given:*** I added notes
- ***When:*** I view/generate the invoice
- ***Then:*** Notes appear at the bottom of the invoice

## Technical Notes

- Fields: notes (text), terms (text)
- Default terms stored in business profile
- Rich text or plain text (v1: plain)

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

### Defect (1)

- [SQ-76](https://upexgalaxy65.atlassian.net/browse/SQ-76): SQ-29 | Business_profiles devuelve 406 en create invoice e impide validar prefill de términos _(Ready For QA)_

### Improvement (1)

- [SQ-77](https://upexgalaxy65.atlassian.net/browse/SQ-77): SQ-29 | Flujo incompleto en staging: módulo Facturas/preview no disponible para validar ACs de edición y visualización _(CLOSED)_

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 2/10/2026
- **Reporter:** Ely
- **Assignee:** Ximena Quintana

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:52.512Z_
