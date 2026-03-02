# As a Pro user, I want to pause reminders for a specific invoice so that I can handle clients with special agreements

**Jira Key:** [SQ-62](https://upexgalaxy65.atlassian.net/browse/SQ-62)
**Epic:** [SQ-40](https://upexgalaxy65.atlassian.net/browse/SQ-40) (Automatic Reminders (Pro Feature))
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

As a Pro user, I want to pause reminders for a specific invoice, so that I can handle clients with special arrangements. Story Points: 2

---

## Acceptance Criteria

1. 

1. 

- ****Given:**** I am viewing an overdue invoice INV-2026-0042
- ****When:**** I click "Pause Reminders" for this invoice
- ****Then:**** The system pauses automatic reminders for this specific invoice
- ****And:**** Shows a visual indicator that reminders are paused
- ****And:**** A success message "Reminders paused for this invoice" is displayed

1. 

- ****Given:**** Invoice INV-2026-0042 has reminders paused
- ****When:**** The automatic reminder job runs
- ****Then:**** This invoice is skipped (no reminder sent)
- ****And:**** Other eligible invoices still receive reminders

1. 

- ****Given:**** Invoice INV-2026-0042 has reminders paused
- ****When:**** I click "Resume Reminders"
- ****Then:**** The system resumes automatic reminders for this invoice
- ****And:**** The pause indicator is removed
- ****And:**** The invoice becomes eligible for the next reminder cycle

1. 

- ****Given:**** I am viewing a draft invoice
- ****When:**** I look at available actions
- ****Then:**** The "Pause Reminders" option is not shown
- ****And:**** It's only available for sent/overdue invoices

1. 

- ****Given:**** I am pausing reminders for an invoice
- ****When:**** I see the pause dialog
- ****Then:**** I can optionally add a reason/note for pausing
- ****And:**** This note helps me remember why I paused (e.g., "Client on vacation until Mar 15")

1. 

- ****Given:**** I have multiple overdue invoices with some paused
- ****When:**** I view the invoice dashboard/list
- ****Then:**** Paused invoices show a "Reminders Paused" badge
- ****And:**** I can easily identify which invoices won't receive reminders

1. 

- ****Given:**** I am a Free user
- ****When:**** I view an overdue invoice
- ****Then:**** The pause reminders option is not available
- ****And:**** If automatic reminders are disabled, the option doesn't appear

---

## Scope

1. 

1. 

- Pause/Resume toggle per invoice
- Visual indicator for paused invoices
- Optional pause reason/note
- Filter paused invoices in reminder job
- Pro subscription check
- Store pause state (add reminders_paused boolean to invoices)

1. 

- Pause until specific date (auto-resume)
- Pause all reminders for a specific client
- Scheduled pause/resume
- Notification when manually resuming

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
_Last sync: 2026-03-02T19:54:08.937Z_
