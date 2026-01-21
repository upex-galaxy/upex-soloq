# View Client Invoice History

**Jira Key:** [SQ-18](https://upexgalaxy64.atlassian.net/browse/SQ-18)
**Epic:** [SQ-13](https://upexgalaxy64.atlassian.net/browse/SQ-13) (Client Management)
**Priority:** Medium
**Story Points:** 3
**Status:** Backlog

---

## User Story

**As a** user
**I want to** see a client's invoice history
**So that** I have context of our relationship

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: View invoice list for client

- **Given:** I am viewing a client's details
- **When:** I click on "Invoice History"
- **Then:** I see all invoices I've sent to this client

### Scenario 2: See invoice summary

- **Given:** I am viewing a client's invoice history
- **When:** I look at the list
- **Then:** I see invoice number, date, amount, and status

### Scenario 3: See totals

- **Given:** I am viewing a client's invoice history
- **When:** I look at the summary
- **Then:** I see total invoiced, paid, and pending

---

## Technical Notes

- Join invoices table by client_id
- Aggregate totals
- Link to invoice details
- API: GET /api/clients/:id/invoices

---

## Definition of Done

- [ ] Invoice history view implemented
- [ ] Totals calculation working
- [ ] Navigation to invoice working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-13-client-management/epic.md`
