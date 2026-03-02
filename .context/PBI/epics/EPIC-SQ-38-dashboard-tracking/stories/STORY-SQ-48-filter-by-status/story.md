# As a user, I want to filter invoices by status (draft, sent, paid, overdue) so that I can find the ones I need

**Jira Key:** [SQ-48](https://upexgalaxy65.atlassian.net/browse/SQ-48)
**Epic:** [SQ-38](https://upexgalaxy65.atlassian.net/browse/SQ-38) (Invoice Dashboard & Tracking)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

As a user, I want to filter invoices by status (draft, sent, paid, overdue), so that I can find the ones I need. Story Points: 2

---

## Acceptance Criteria

1. 

- ****Given:**** I am on the dashboard
- ****When:**** I view the filter options
- ****Then:**** I see tabs for: All, Draft, Sent, Paid, Overdue

1. 

- ****Given:**** I click "Draft" filter
- ****When:**** The list updates
- ****Then:**** I only see invoices with status "draft"

1. 

- ****Given:**** I click "Sent" filter
- ****When:**** The list updates
- ****Then:**** I only see invoices with status "sent"

1. 

- ****Given:**** I click "Paid" filter
- ****When:**** The list updates
- ****Then:**** I only see invoices with status "paid"

1. 

- ****Given:**** I click "Overdue" filter
- ****When:**** The list updates
- ****Then:**** I only see invoices past due date and unpaid

1. 

- ****Given:**** I view the filter tabs
- ****When:**** I look at each tab
- ****Then:**** I see a count of invoices in each status

---

## Scope

1. 

- Filter tabs: All, Draft, Sent, Paid, Overdue
- Filter logic for each status
- Overdue detection: status='sent' AND due_date < today
- Count badges on each tab
- URL state persistence for filters
- API query parameter support

1. 

- Date range filters
- Client filters
- Amount range filters
- Custom saved filters
- Cancelled status filter

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
_Last sync: 2026-03-02T19:54:01.842Z_
