# List All Clients

**Jira Key:** [SQ-15](https://upexgalaxy64.atlassian.net/browse/SQ-15)
**Epic:** [SQ-13](https://upexgalaxy64.atlassian.net/browse/SQ-13) (Client Management)
**Priority:** High
**Story Points:** 3
**Status:** Backlog

---

## User Story

**As a** user
**I want to** see the list of all my clients
**So that** I can quickly find who I need to invoice

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: View client list

- **Given:** I have clients in my account
- **When:** I navigate to the clients page
- **Then:** I see a list of all my clients with name and email

### Scenario 2: Search clients

- **Given:** I have many clients
- **When:** I type in the search box
- **Then:** The list filters to show matching clients

### Scenario 3: Empty state

- **Given:** I have no clients yet
- **When:** I navigate to the clients page
- **Then:** I see an empty state with a CTA to add my first client

### Scenario 4: Sort clients

- **Given:** I am viewing my clients list
- **When:** I click on column headers
- **Then:** The list sorts by that column

---

## Technical Notes

- Paginated list (20 per page)
- Search by name and email
- Sort by name, created_at
- Component: ClientsList
- API: GET /api/clients

---

## Definition of Done

- [ ] Client list component implemented
- [ ] Search functionality working
- [ ] Pagination working
- [ ] Empty state implemented
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-13-client-management/epic.md`
