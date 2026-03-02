# As a user, I want to see the total pending amount so that I know my financial situation

**Jira Key:** [SQ-49](https://upexgalaxy65.atlassian.net/browse/SQ-49)
**Epic:** [SQ-38](https://upexgalaxy65.atlassian.net/browse/SQ-38) (Invoice Dashboard & Tracking)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

As a user, I want to see the total pending amount, so that I know my financial situation. Story Points: 2

---

## Acceptance Criteria

1. 

- ****Given:**** I am on the dashboard
- ****When:**** I view the summary cards
- ****Then:**** I see my total pending amount prominently displayed

1. 

- ****Given:**** I have pending invoices
- ****When:**** I view the pending total
- ****Then:**** It equals the sum of all sent (unpaid) invoices

1. 

- ****Given:**** I view the pending total
- ****When:**** I look at the number
- ****Then:**** It is formatted with currency symbol and thousands separators

1. 

- ****Given:**** I mark an invoice as paid
- ****When:**** I return to the dashboard
- ****Then:**** The pending total is updated (decreased)

1. 

- ****Given:**** I have no pending invoices
- ****When:**** I view the pending total
- ****Then:**** It shows $0.00 with positive messaging

---

## Scope

1. 

- Pending total card on dashboard
- Sum calculation: WHERE status = 'sent'
- Currency formatting with locale
- Real-time or refresh on navigation
- Zero state handling
- Summary stats component

1. 

- Currency conversion
- Historical pending trends
- Breakdown by client
- Export pending summary

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
_Last sync: 2026-03-02T19:54:02.126Z_
