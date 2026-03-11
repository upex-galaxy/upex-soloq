# As a Pro user, I want to view reminder history so that I know how many times I've contacted the client

**Jira Key:** [SQ-63](https://upexgalaxy65.atlassian.net/browse/SQ-63)
**Epic:** [SQ-40](https://upexgalaxy65.atlassian.net/browse/SQ-40) (Automatic Reminders (Pro Feature))
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

As a Pro user, I want to see the history of sent reminders, so that I know how many times I've contacted the client. Story Points: 2

---

## Acceptance Criteria

1. 

1. 

- ****Given:**** Invoice INV-2026-0042 has received 3 reminders
- ****When:**** I view the invoice details
- ****Then:**** I see a "Reminder History" section
- ****And:**** Each reminder shows: date sent, recipient email
- ****And:**** Reminders are ordered most recent first

1. 

- ****Given:**** An overdue invoice has received 2 of 5 max reminders
- ****When:**** I view the invoice in the list or details
- ****Then:**** I see "2/5 reminders sent" indicator
- ****And:**** This helps me understand follow-up status at a glance

1. 

- ****Given:**** An invoice that just became overdue today
- ****When:**** I view the reminder history
- ****Then:**** I see "No reminders sent yet"
- ****And:**** The reminder count shows "0/X reminders sent"

1. 

- ****Given:**** I manually sent the invoice once and 2 automatic reminders were sent
- ****When:**** I view the reminder history
- ****Then:**** All 3 sends are shown in the history
- ****And:**** Each entry indicates if it was "Manual" or "Automatic"

1. 

- ****Given:**** I see a reminder in the history
- ****When:**** I click on a reminder entry
- ****Then:**** I can see more details like subject line used
- ****And:**** Whether it was successfully delivered (if tracking available)

1. 

- ****Given:**** An invoice has reached max reminders (e.g., 3/3)
- ****When:**** I view the invoice
- ****Then:**** I see a clear indication "Max reminders reached"
- ****And:**** The system won't send more automatic reminders

1. 

- ****Given:**** I am on the invoice dashboard
- ****When:**** I look at filter options
- ****Then:**** I can filter by "Awaiting reminder", "Max reminders reached", "Reminders paused"

---

## Scope

1. 

1. 

- Reminder history list per invoice
- Show date, recipient, type (manual/automatic)
- Reminder count display (X/Y sent)
- Max reminders reached indication
- Query invoice*events where type = 'reminder*sent' or 'sent'
- Basic filtering by reminder status

1. 

- Email open/click tracking
- Resend specific reminder
- Export reminder history
- Reminder analytics/reports
- Bounce/delivery status (depends on email provider)

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
_Last sync: 2026-03-02T19:54:09.237Z_
