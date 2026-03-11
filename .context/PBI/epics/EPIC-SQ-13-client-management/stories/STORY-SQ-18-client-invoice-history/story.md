# View Client Invoice History

**Jira Key:** [SQ-18](https://upexgalaxy65.atlassian.net/browse/SQ-18)
**Epic:** [SQ-13](https://upexgalaxy65.atlassian.net/browse/SQ-13) (Client Management)
**Priority:** Medium
**Story Points:** 2
**Status:** Ready For QA

---

## User Story

## User Story

***As a*** user
***I want to*** see a client's invoice history
***So that*** I have context of our relationship

## Acceptance Criteria

### Scenario 1: View invoice list for client

- ***Given:*** I am viewing a client's details
- ***When:*** I click on "Invoice History"
- ***Then:*** I see all invoices I've sent to this client

### Scenario 2: See invoice summary

- ***Given:*** I am viewing a client's invoice history
- ***When:*** I look at the list
- ***Then:*** I see invoice number, date, amount, and status for each

### Scenario 3: Navigate to invoice

- ***Given:*** I am viewing a client's invoice history
- ***When:*** I click on an invoice
- ***Then:*** I am taken to the invoice details page

### Scenario 4: See totals

- ***Given:*** I am viewing a client's invoice history
- ***When:*** I look at the summary
- ***Then:*** I see total invoiced, total paid, and total pending

## Technical Notes

- Join invoices table by client_id
- Aggregate totals
- Link to invoice details

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
- **Updated:** 2/25/2026
- **Reporter:** Ely
- **Assignee:** Rodrigo Godoy

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:46.707Z_
