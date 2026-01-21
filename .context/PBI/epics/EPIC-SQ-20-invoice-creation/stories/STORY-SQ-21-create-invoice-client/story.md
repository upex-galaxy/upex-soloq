# Create Invoice by Selecting Client

**Jira Key:** [SQ-21](https://upexgalaxy64.atlassian.net/browse/SQ-21)
**Epic:** [SQ-20](https://upexgalaxy64.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** High
**Story Points:** 3
**Status:** Backlog

---

## User Story

**As a** user
**I want to** create a new invoice by selecting a client
**So that** I can start billing

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Start new invoice

- **Given:** I am on the invoices page
- **When:** I click "Create Invoice"
- **Then:** I see a form to create a new invoice

### Scenario 2: Select client from list

- **Given:** I am creating a new invoice
- **When:** I click on the client dropdown
- **Then:** I see a searchable list of my clients

### Scenario 3: Client data auto-filled

- **Given:** I have selected a client
- **When:** I view the invoice form
- **Then:** The client's name, email, and tax ID (if any) are pre-filled

### Scenario 4: Create invoice for new client

- **Given:** I am creating a new invoice
- **When:** My client doesn't exist yet
- **Then:** I can create a new client inline and continue

---

## Technical Notes

- Client selector with search/filter
- Auto-populate client fields from client record
- Invoice starts in 'draft' status
- API: POST /api/invoices with client_id

---

## Definition of Done

- [ ] Invoice creation form implemented
- [ ] Client selector with search working
- [ ] Client data auto-population working
- [ ] Inline client creation working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/epic.md`
