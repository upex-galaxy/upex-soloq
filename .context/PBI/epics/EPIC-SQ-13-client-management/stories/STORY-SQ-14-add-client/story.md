# Add New Client

**Jira Key:** [SQ-14](https://upexgalaxy65.atlassian.net/browse/SQ-14)
**Epic:** [SQ-13](https://upexgalaxy65.atlassian.net/browse/SQ-13) (Client Management)
**Priority:** Medium
**Story Points:** 13
**Status:** QA Approved

---

## User Story

## User Story

***As a*** user
***I want to*** add a new client with name and email
***So that*** I can invoice them

## Acceptance Criteria

### Scenario 1: Add client with basic info

- ***Given:*** I am on the clients page
- ***When:*** I click "Add Client" and enter name and email
- ***Then:*** The client is saved and appears in my list

### Scenario 2: Validate email format

- ***Given:*** I am adding a new client
- ***When:*** I enter an invalid email format
- ***Then:*** I see a validation error

### Scenario 3: Prevent duplicate clients

- ***Given:*** I have a client with email "client@email.com"
- ***When:*** I try to add another client with the same email
- ***Then:*** I see a warning that a client with that email already exists

### Scenario 4: Add client with optional fields

- ***Given:*** I am adding a new client
- ***When:*** I fill in optional fields (company name, phone, address)
- ***Then:*** All information is saved

## Technical Notes

- Table: `clients`
- Required: name, email
- Optional: company_name, phone, address
- RLS: user can only see their own clients

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

## Traceability

### Tests (3)

- [SQ-90](https://upexgalaxy65.atlassian.net/browse/SQ-90): SQ-14: TC1: Validar creación de cliente con name y email válidos _(Candidate)_
- [SQ-91](https://upexgalaxy65.atlassian.net/browse/SQ-91): SQ-14: TC2: Validar warning de duplicado cuando email ya existe _(Candidate)_
- [SQ-92](https://upexgalaxy65.atlassian.net/browse/SQ-92): SQ-14: TC3: Validar warning de duplicado cuando email difiere en case _(Candidate)_

### Test Execution (1)

- [SQ-93](https://upexgalaxy65.atlassian.net/browse/SQ-93): Sanity Test Execution for SQ-14 _(ACTIVE)_

### Defects (2)

- [SQ-69](https://upexgalaxy65.atlassian.net/browse/SQ-69): CM | Duplicated email with case-sensitive is not bloking the client creation (getting 201 instead 409) _(CLOSED)_
- [SQ-70](https://upexgalaxy65.atlassian.net/browse/SQ-70): QA | CM | Displays misaligned fields when entering an invalid email address. _(CLOSED)_

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 2/24/2026
- **Reporter:** Ely
- **Assignee:** Ely

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:43.593Z_
