# Delete Client

**Jira Key:** [SQ-19](https://upexgalaxy64.atlassian.net/browse/SQ-19)
**Epic:** [SQ-13](https://upexgalaxy64.atlassian.net/browse/SQ-13) (Client Management)
**Priority:** Low
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** delete a client I no longer use
**So that** I can keep my list clean

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Delete client without invoices

- **Given:** I have a client with no invoices
- **When:** I click delete and confirm
- **Then:** The client is removed from my list

### Scenario 2: Delete client with invoices (soft delete)

- **Given:** I have a client with existing invoices
- **When:** I click delete and confirm
- **Then:** The client is hidden but invoices still reference them

### Scenario 3: Confirmation dialog

- **Given:** I click delete on a client
- **When:** The confirmation dialog appears
- **Then:** I must confirm before the client is deleted

---

## Technical Notes

- Soft delete: is_deleted = true
- Hide from list but keep for invoice references
- Confirmation required
- API: DELETE /api/clients/:id

---

## Definition of Done

- [ ] Delete functionality implemented
- [ ] Soft delete working
- [ ] Confirmation dialog implemented
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-13-client-management/epic.md`
