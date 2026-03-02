# As a Pro user, I want to customize the reminder message so that I maintain my communication tone

**Jira Key:** [SQ-61](https://upexgalaxy65.atlassian.net/browse/SQ-61)
**Epic:** [SQ-40](https://upexgalaxy65.atlassian.net/browse/SQ-40) (Automatic Reminders (Pro Feature))
**Priority:** Medium
**Story Points:** 3
**Status:** Backlog

---

## User Story

As a Pro user, I want to customize the reminder message, so that I maintain my communication tone. Story Points: 2

---

## Acceptance Criteria

1. 

1. 

- ****Given:**** I am a Pro user on the reminder settings page
- ****When:**** I enter a custom subject "Friendly reminder: Invoice {invoiceNumber} is pending"
- ****Then:**** The system saves my custom subject
- ****And:**** Future reminders use this subject with variables replaced

1. 

- ****Given:**** I am on the reminder settings page
- ****When:**** I enter a custom message:
  "Hi {clientName},

  
This is a gentle reminder that invoice {invoiceNumber} for {total} is still outstanding.

Please let me know if you have any questions.

Best regards"

- ****Then:**** The system saves my custom message template

1. 

- ****Given:**** I have entered custom subject and message
- ****When:**** I click "Preview"
- ****Then:**** I see a preview with sample data filled in:
- {clientName} → "ABC Corporation"
- {invoiceNumber} → "INV-2026-0042"
- {total} → "$1,500.00"
- {dueDate} → "Feb 15, 2026"

1. 

- ****Given:**** I have not customized the reminder message
- ****When:**** A reminder is sent
- ****Then:**** The system uses the default professional template

1. 

- ****Given:**** I am customizing the reminder subject
- ****When:**** I enter a subject exceeding 200 characters
- ****Then:**** The system shows error "Subject cannot exceed 200 characters"

1. 

- ****Given:**** I am customizing the reminder message
- ****When:**** I enter a message exceeding 2000 characters
- ****Then:**** The system shows error "Message cannot exceed 2000 characters"

1. 

- ****Given:**** I have customized subject and message
- ****When:**** I click "Reset to Default"
- ****Then:**** The fields are cleared and show placeholder for default
- ****And:**** Future reminders will use the default template

---

## Scope

1. 

1. 

- Custom subject field (max 200 chars)
- Custom message body field (max 2000 chars)
- Available variables: {clientName}, {invoiceNumber}, {total}, {dueDate}, {businessName}
- Preview with sample data
- Reset to default option
- Store in reminder*settings (custom*subject, custom_message)

1. 

- Rich text/HTML formatting in message
- Multiple templates per reminder sequence
- Different templates for different clients
- Template version history
- Attachments customization

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
_Last sync: 2026-03-02T19:54:08.229Z_
