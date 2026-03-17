# As a user, I want to see a dashboard with all my invoices so that I have a general view

**Jira Key:** [SQ-47](https://upexgalaxy65.atlassian.net/browse/SQ-47)
**Epic:** [SQ-38](https://upexgalaxy65.atlassian.net/browse/SQ-38) (Invoice Dashboard & Tracking)
**Priority:** Medium
**Story Points:** 3
**Status:** Backlog

---

## User Story

As a user, I want to see a dashboard with all my invoices, so that I have a general view. Story Points: 3

---

## Acceptance Criteria

1. 

- ****Given:**** I am logged in
- ****When:**** I navigate to invoices
- ****Then:**** I see a dashboard with my invoices

1. 

- ****Given:**** I have invoices
- ****When:**** I view the dashboard
- ****Then:**** I see a list of all my invoices

1. 

- ****Given:**** I view the invoice list
- ****When:**** I look at each row
- ****Then:**** I see invoice number, client, amount, date, and status

1. 

- ****Given:**** I have no invoices
- ****When:**** I view the dashboard
- ****Then:**** I see an empty state with a call-to-action to create first invoice

1. 

- ****Given:**** I have more than 20 invoices
- ****When:**** I view the dashboard
- ****Then:**** Invoices are paginated (20 per page) or infinitely scrolled

---

## Scope

1. 

- Dashboard page with invoice list
- Display columns: invoice*number, client*name, total, issue_date, status
- Default sort: newest first (created_at DESC)
- Pagination with 20 items per page or infinite scroll
- Empty state with CTA to create invoice
- Responsive design for mobile

1. 

- Advanced analytics/charts (separate story)
- Export to CSV/Excel
- Bulk actions (select multiple)
- Drag-and-drop ordering

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 3/2/2026
- **Reporter:** Ely
- **Assignee:** Unassigned

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:54:01.567Z_
