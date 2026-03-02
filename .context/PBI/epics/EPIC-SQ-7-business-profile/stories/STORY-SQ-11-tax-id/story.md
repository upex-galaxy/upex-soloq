# As a user, I want to configure my tax ID (RFC/NIT/CUIT) so that it appears on my invoices

**Jira Key:** [SQ-11](https://upexgalaxy65.atlassian.net/browse/SQ-11)
**Epic:** [SQ-7](https://upexgalaxy65.atlassian.net/browse/SQ-7) (Business Profile Management)
**Priority:** Medium
**Story Points:** 3
**Status:** Backlog

---

## User Story

## User Story

***As a*** user
***I want to*** configure my tax ID (RFC/NIT/CUIT)
***So that*** it appears on my invoices

## Acceptance Criteria

### Scenario 1: Configure tax ID for Mexico (RFC)

- ***Given:*** I am on the business profile settings and my country is Mexico
- ***When:*** I enter my RFC
- ***Then:*** The RFC format is validated (13 characters for personas físicas, 12 for morales)

### Scenario 2: Configure tax ID for Colombia (NIT)

- ***Given:*** I am on the business profile settings and my country is Colombia
- ***When:*** I enter my NIT
- ***Then:*** The NIT format is validated (9 digits + verification digit)

### Scenario 3: Configure tax ID for Argentina (CUIT)

- ***Given:*** I am on the business profile settings and my country is Argentina
- ***When:*** I enter my CUIT
- ***Then:*** The CUIT format is validated (11 digits)

### Scenario 4: Tax ID appears on invoice

- ***Given:*** I have configured my tax ID
- ***When:*** I generate an invoice
- ***Then:*** My tax ID appears in the appropriate section

### Scenario 5: Skip tax ID configuration

- ***Given:*** I don't have a tax ID
- ***When:*** I leave the field empty
- ***Then:*** I can still create invoices without tax ID

## Technical Notes

- Validation regex per country
- Dynamic label based on country (RFC, NIT, CUIT, RUT, etc.)
- Optional field (some freelancers may not have formal registration)
- Stored in `business*profiles.tax*id` and `business*profiles.tax*id_type`

## Story Points

3

---

## Acceptance Criteria

1. 

- ****Given:**** I am on the business profile settings and my country is Mexico
- ****When:**** I enter my RFC
- ****Then:**** The RFC format is validated (13 characters for personas fisicas, 12 for morales)

1. 

- ****Given:**** I am on the business profile settings and my country is Colombia
- ****When:**** I enter my NIT
- ****Then:**** The NIT format is validated (9 digits + verification digit)

1. 

- ****Given:**** I am on the business profile settings and my country is Argentina
- ****When:**** I enter my CUIT
- ****Then:**** The CUIT format is validated (11 digits with format XX-XXXXXXXX-X)

1. 

- ****Given:**** I have configured my tax ID
- ****When:**** I generate an invoice
- ****Then:**** My tax ID appears with the correct label (RFC, NIT, CUIT, etc.)

1. 

- ****Given:**** I don't have a formal tax registration
- ****When:**** I leave the tax ID field empty
- ****Then:**** I can still create invoices (tax ID section omitted)

1. 

- ****Given:**** I am configuring my tax ID
- ****When:**** I select my country
- ****Then:**** The label changes to the appropriate term (RFC for MX, NIT for CO, etc.)

---

## Scope

1. 

- Tax ID input with dynamic validation per country
- Country selector that determines tax ID type
- Dynamic label (RFC, NIT, CUIT, RUT, RUC)
- Format validation per country regex
- Optional field (skip allowed)
- Display tax ID with correct label on invoice
- Input mask/formatting by country

1. 

- Tax ID verification via external APIs
- Historical tax ID tracking
- Multiple tax IDs per user
- Official tax registry integration

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
- **Assignee:** Unassigned

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:41.878Z_
