# View Invoice Dashboard

**Jira Key:** [SQ-47](https://upexgalaxy64.atlassian.net/browse/SQ-47)
**Epic:** [SQ-38](https://upexgalaxy64.atlassian.net/browse/SQ-38) (Dashboard & Tracking)
**Priority:** High
**Story Points:** 3
**Status:** Backlog

---

## User Story

**As a** user
**I want to** see a dashboard with all my invoices
**So that** I have a general view

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Dashboard loads

- **Given:** I am logged in
- **When:** I navigate to invoices
- **Then:** I see a dashboard with my invoices

### Scenario 2: Invoice list

- **Given:** I have invoices
- **When:** I view the dashboard
- **Then:** I see a list of all my invoices

### Scenario 3: Invoice details visible

- **Given:** I view the invoice list
- **When:** I look at each row
- **Then:** I see invoice number, client, amount, date, and status

### Scenario 4: Empty state

- **Given:** I have no invoices
- **When:** I view the dashboard
- **Then:** I see an empty state with a call-to-action

### Scenario 5: Pagination

- **Given:** I have many invoices
- **When:** I view the dashboard
- **Then:** Invoices are paginated or infinitely scrolled

---

## Technical Notes

- Default sort: newest first (created_at DESC)
- Show: invoice_number, client_name, total, issue_date, status
- Pagination: 20 per page or infinite scroll
- API: GET /api/invoices

---

## Definition of Done

- [ ] Dashboard page created
- [ ] Invoice list rendered
- [ ] Invoice details visible
- [ ] Empty state implemented
- [ ] Pagination working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-38-dashboard-tracking/epic.md`
