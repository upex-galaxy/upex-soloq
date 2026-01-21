# Search Invoices by Client or Number

**Jira Key:** [SQ-51](https://upexgalaxy64.atlassian.net/browse/SQ-51)
**Epic:** [SQ-38](https://upexgalaxy64.atlassian.net/browse/SQ-38) (Dashboard & Tracking)
**Priority:** Medium
**Story Points:** 3
**Status:** Backlog

---

## User Story

**As a** user
**I want to** search invoices by client or number
**So that** I can find a specific one

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Search box

- **Given:** I am on the dashboard
- **When:** I look at the header
- **Then:** I see a search box

### Scenario 2: Search by invoice number

- **Given:** I type an invoice number
- **When:** I submit the search
- **Then:** I see invoices matching that number

### Scenario 3: Search by client name

- **Given:** I type a client's name
- **When:** I submit the search
- **Then:** I see invoices for that client

### Scenario 4: Partial match

- **Given:** I type partial text
- **When:** I search
- **Then:** I see results that contain the search term

### Scenario 5: No results

- **Given:** I search for something that doesn't exist
- **When:** I view the results
- **Then:** I see a "No results" message

### Scenario 6: Clear search

- **Given:** I have an active search
- **When:** I clear the search
- **Then:** I see all invoices again

---

## Technical Notes

- Search fields: invoice_number, client.name, client.email
- Case-insensitive, partial match
- Debounce search input (300ms)
- API: GET /api/invoices?search={query}

---

## Definition of Done

- [ ] Search box implemented
- [ ] Invoice number search working
- [ ] Client name search working
- [ ] Partial match working
- [ ] No results state shown
- [ ] Clear search working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-38-dashboard-tracking/epic.md`
