# As a Pro user, I want the system to send automatic reminders for overdue invoices so that I don't have to do it manually

**Jira Key:** [SQ-59](https://upexgalaxy65.atlassian.net/browse/SQ-59)
**Epic:** [SQ-40](https://upexgalaxy65.atlassian.net/browse/SQ-40) (Automatic Reminders (Pro Feature))
**Priority:** Medium
**Story Points:** 5
**Status:** Backlog

---

## User Story

As a Pro user, I want the system to send automatic reminders for overdue invoices, so that I don't have to do it manually. Story Points: 5

---

## Acceptance Criteria

1. 

1. 

- ****Given:**** I am a Pro user with automatic reminders enabled
- ****And:**** I have an overdue invoice (due date passed)
- ****And:**** The reminder frequency is set to 7 days
- ****When:**** 7 days have passed since the invoice became overdue
- ****Then:**** The system automatically sends a reminder email to the client
- ****And:**** The invoice reminder_count is incremented
- ****And:**** A reminder*sent event is logged in invoice*events

1. 

- ****Given:**** I have max_reminders set to 3
- ****And:**** An overdue invoice has already received 3 reminders
- ****When:**** The system checks for reminders to send
- ****Then:**** No additional reminder is sent for this invoice
- ****And:**** The invoice is flagged as "max reminders reached"

1. 

- ****Given:**** An invoice was overdue but was marked as paid yesterday
- ****When:**** The reminder job runs
- ****Then:**** No reminder is sent for this paid invoice

1. 

- ****Given:**** I am a Free user with overdue invoices
- ****When:**** The reminder job runs
- ****Then:**** No automatic reminders are sent
- ****And:**** This feature is only available for Pro subscribers

1. 

- ****Given:**** A reminder is being sent for invoice INV-2026-0042
- ****When:**** The email is generated
- ****Then:**** The email includes invoice number, total amount, due date
- ****And:**** Includes the freelancer's business name and payment methods
- ****And:**** Has a professional, friendly reminder tone

1. 

- ****Given:**** Reminder frequency is 7 days
- ****And:**** The last reminder was sent on Feb 20
- ****When:**** The system checks on Feb 25
- ****Then:**** No reminder is sent (only 5 days passed)
- ****When:**** The system checks on Feb 27
- ****Then:**** A reminder is sent (7 days passed)

1. 

- ****Given:**** Invoice due date is Feb 15, 2026
- ****And:**** Today is Feb 16, 2026 (1 day overdue)
- ****And:**** Reminder frequency is 3 days
- ****When:**** The reminder job runs on Feb 18
- ****Then:**** The first reminder is sent (3 days after due date)

---

## Scope

1. 

1. 

- Background job/cron to process overdue invoices daily
- Check Pro subscription status before sending
- Respect reminder_settings configuration (frequency, max)
- Send reminder emails via Resend
- Track reminder_count on invoices table
- Log reminder*sent events in invoice*events
- Email includes invoice details and payment methods

1. 

- SMS/WhatsApp reminders
- Reminder scheduling UI (separate story)
- Manual reminder trigger (use existing send invoice)
- Reminder templates customization (separate story [https://upexgalaxy65.atlassian.net/browse/SQ-61#icft=SQ-61](https://upexgalaxy65.atlassian.net/browse/SQ-61#icft=SQ-61))
- Real-time reminder status updates

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
_Last sync: 2026-03-02T19:54:06.803Z_
