# Edit Client Data

**Jira Key:** [SQ-16](https://upexgalaxy64.atlassian.net/browse/SQ-16)
**Epic:** [SQ-13](https://upexgalaxy64.atlassian.net/browse/SQ-13) (Client Management)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** edit client data
**So that** I can keep information up to date

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Edit client name

- **Given:** I am viewing a client's details
- **When:** I edit the name and save
- **Then:** The new name is saved and displayed

### Scenario 2: Edit client email

- **Given:** I am editing a client
- **When:** I change the email to a valid new email
- **Then:** The new email is saved

### Scenario 3: Validation on edit

- **Given:** I am editing a client
- **When:** I enter invalid data
- **Then:** I see validation errors

---

## Technical Notes

- API: PUT /api/clients/:id
- Same validation as create
- Audit trail: updated_at

---

## Definition of Done

- [ ] Edit functionality implemented
- [ ] Validation working
- [ ] API endpoint working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-13-client-management/epic.md`
