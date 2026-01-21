# Add New Client

**Jira Key:** [SQ-14](https://upexgalaxy64.atlassian.net/browse/SQ-14)
**Epic:** [SQ-13](https://upexgalaxy64.atlassian.net/browse/SQ-13) (Client Management)
**Priority:** High
**Story Points:** 3
**Status:** Backlog

---

## User Story

**As a** user
**I want to** add a new client with name and email
**So that** I can invoice them

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Add client with basic info

- **Given:** I am on the clients page
- **When:** I click "Add Client" and enter name and email
- **Then:** The client is saved and appears in my list

### Scenario 2: Validate email format

- **Given:** I am adding a new client
- **When:** I enter an invalid email format
- **Then:** I see a validation error

### Scenario 3: Prevent duplicate clients

- **Given:** I have a client with email "client@email.com"
- **When:** I try to add another client with the same email
- **Then:** I see a warning that a client with that email already exists

### Scenario 4: Add client with optional fields

- **Given:** I am adding a new client
- **When:** I fill in optional fields (company name, phone, address)
- **Then:** All information is saved

---

## Technical Notes

- Table: `clients`
- Required: name, email
- Optional: company_name, phone, address
- RLS: user can only see their own clients
- API: POST /api/clients

---

## Definition of Done

- [ ] Add client form implemented
- [ ] Validation working
- [ ] API endpoint working
- [ ] Duplicate prevention working
- [ ] Unit tests > 80% coverage
- [ ] Code review approved

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-13-client-management/epic.md`
