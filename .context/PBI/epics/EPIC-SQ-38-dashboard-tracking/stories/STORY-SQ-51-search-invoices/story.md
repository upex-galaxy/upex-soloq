# As a user, I want to search invoices by client or number so that I can find a specific one

**Jira Key:** [SQ-51](https://upexgalaxy65.atlassian.net/browse/SQ-51)
**Epic:** [SQ-38](https://upexgalaxy65.atlassian.net/browse/SQ-38) (Invoice Dashboard & Tracking)
**Priority:** Medium
**Story Points:** 13
**Status:** Ready For QA

---

## User Story

As a user, I want to search invoices by client or number, so that I can find a specific one. Story Points: 2

---

## Acceptance Criteria

1.
  1.
    1. Scenario 1: Search box visible

- ***Given:*** I am on the dashboard
- ***When:*** I look at the header
- ***Then:*** I see a search box

1.
  1.
    1. Scenario 2: Search by invoice number

- ***Given:*** I type an invoice number (e.g., "INV-2026-0042")
- ***When:*** I submit the search
- ***Then:*** I see invoices matching that number

1.
  1.
    1. Scenario 3: Search by client name

- ***Given:*** I type a client's name
- ***When:*** I submit the search
- ***Then:*** I see all invoices for that client

1.
  1.
    1. Scenario 4: Partial match

- ***Given:*** I type partial text (e.g., "John")
- ***When:*** I search
- ***Then:*** I see results that contain the search term

1.
  1.
    1. Scenario 5: No results

- ***Given:*** I search for something that doesn't exist
- ***When:*** I view the results
- ***Then:*** I see a "No results found" message

1.
  1.
    1. Scenario 6: Clear search

- ***Given:*** I have an active search
- ***When:*** I clear the search box
- ***Then:*** I see all invoices again

---

## Scope

1.
  1.
    1. In Scope

- Search input box on dashboard
- Search by invoice_number
- Search by client.name and client.email
- Case-insensitive, partial match
- Debounced input (300ms)
- No results state
- Clear search functionality
- API query parameter: ?search={query}

1.
  1.
    1. Out of Scope

- Advanced search syntax
- Search by amount
- Search by date range
- Save recent searches
- Full-text search indexing

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 2026-01-21T01:09:31.468Z
- **Updated:** 2026-04-01T05:34:55.114Z
- **Reporter:** Ely
- **Assignee:** Fernando Javier Masci
- **Labels:** shift-left-reviewed, test-plan-ready

---

_Synced from Jira by jira-sync_
_Last sync: 2026-04-02T19:25:24.577Z_
