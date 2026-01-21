# Add Client Tax Information

**Jira Key:** [SQ-17](https://upexgalaxy64.atlassian.net/browse/SQ-17)
**Epic:** [SQ-13](https://upexgalaxy64.atlassian.net/browse/SQ-13) (Client Management)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** add client tax information (RFC/NIT)
**So that** I can include it in invoices

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Add client tax ID

- **Given:** I am editing a client
- **When:** I add their tax ID (RFC/NIT/CUIT)
- **Then:** The tax ID is validated and saved

### Scenario 2: Tax ID appears on invoice

- **Given:** A client has a tax ID configured
- **When:** I create an invoice for that client
- **Then:** The client's tax ID appears on the invoice

### Scenario 3: Skip client tax ID

- **Given:** My client doesn't have a tax ID
- **When:** I leave the field empty
- **Then:** I can still invoice them

---

## Technical Notes

- Fields: tax_id, tax_id_type
- Same validation logic as business profile (SQ-11)
- Optional field

---

## Definition of Done

- [ ] Tax ID field implemented
- [ ] Validation per country working
- [ ] Display on invoice working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-13-client-management/epic.md`
- **Related:** SQ-11 (Business Tax ID)
