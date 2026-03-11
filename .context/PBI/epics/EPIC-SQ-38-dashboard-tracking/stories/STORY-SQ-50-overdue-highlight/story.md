# As a user, I want to see overdue invoices highlighted so that I can prioritize follow-up

**Jira Key:** [SQ-50](https://upexgalaxy65.atlassian.net/browse/SQ-50)
**Epic:** [SQ-38](https://upexgalaxy65.atlassian.net/browse/SQ-38) (Invoice Dashboard & Tracking)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

As a user, I want to see overdue invoices highlighted, so that I can prioritize follow-up. Story Points: 2

---

## Acceptance Criteria

1. 

- ****Given:**** I have overdue invoices
- ****When:**** I view the invoice list
- ****Then:**** Overdue invoices have a visual indicator (red badge/row)

1. 

- ****Given:**** An invoice is past due
- ****When:**** I view its status
- ****Then:**** I see "Overdue" badge instead of "Sent"

1. 

- ****Given:**** An invoice is overdue
- ****When:**** I view the row
- ****Then:**** I see how many days overdue it is (e.g., "7 days overdue")

1. 

- ****Given:**** I have overdue invoices
- ****When:**** I view the dashboard
- ****Then:**** I see an alert banner or count of overdue invoices

1. 

- ****Given:**** I have mixed status invoices
- ****When:**** I sort by urgency
- ****Then:**** Overdue invoices appear at the top

---

## Scope

1. 

- Visual highlight for overdue rows (red/orange)
- "Overdue" status badge
- Days overdue calculation and display
- Dashboard alert/count for overdue
- Sort by urgency option
- Overdue detection: status='sent' AND due*date < CURRENT*DATE

1. 

- Automatic status change to 'overdue'
- Push notifications for overdue
- Severity levels (1-7 days vs 30+ days)
- Automatic escalation actions

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
_Last sync: 2026-03-02T19:54:02.398Z_
