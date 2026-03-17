# As a Pro user, I want to configure the reminder frequency so that I can adjust it to my collection needs

**Jira Key:** [SQ-60](https://upexgalaxy65.atlassian.net/browse/SQ-60)
**Epic:** [SQ-40](https://upexgalaxy65.atlassian.net/browse/SQ-40) (Automatic Reminders (Pro Feature))
**Priority:** Medium
**Story Points:** 3
**Status:** Backlog

---

## User Story

As a Pro user, I want to configure reminder frequency (every X days), so that I can adjust to my needs. Story Points: 2

---

## Acceptance Criteria

1. 

1. 

- ****Given:**** I am a Pro user on the reminder settings page
- ****When:**** I set frequency to 7 days
- ****Then:**** The system saves the frequency setting
- ****And:**** Reminders will be sent every 7 days for overdue invoices

1. 

- ****Given:**** I am on the reminder settings page
- ****When:**** I try to set frequency to 0 days
- ****Then:**** The system shows error "Frequency must be at least 1 day"
- ****When:**** I try to set frequency to 45 days
- ****Then:**** The system shows error "Frequency cannot exceed 30 days"

1. 

- ****Given:**** I am on the reminder settings page
- ****When:**** I set max reminders to 5
- ****Then:**** The system saves the setting
- ****And:**** Each overdue invoice will receive at most 5 reminders

1. 

- ****Given:**** I am on the reminder settings page
- ****When:**** I try to set max reminders to 0
- ****Then:**** The system shows error "Must send at least 1 reminder"
- ****When:**** I try to set max reminders to 15
- ****Then:**** The system shows error "Cannot exceed 10 reminders"

1. 

- ****Given:**** I am a Pro user with reminders disabled
- ****When:**** I toggle reminders to "Enabled"
- ****Then:**** The system activates automatic reminders
- ****And:**** Shows the frequency and max reminders options

1. 

- ****Given:**** I just upgraded to Pro subscription
- ****When:**** I visit the reminder settings page for the first time
- ****Then:**** I see default values: enabled=false, frequency=7 days, max=3

1. 

- ****Given:**** I have set frequency=5 and max=4
- ****When:**** I navigate away and return to settings
- ****Then:**** My previously saved settings are displayed correctly

---

## Scope

1. 

1. 

- Enable/disable toggle for automatic reminders
- Frequency input (1-30 days)
- Max reminders input (1-10)
- Default values: enabled=false, frequency=7, max=3
- Validation for all input ranges
- Save to reminder_settings table
- Pro subscription check before allowing access

1. 

- Per-invoice frequency override
- Different frequencies for different clients
- Schedule specific days/times for reminders
- Preview of next scheduled reminder

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
_Last sync: 2026-03-02T19:54:07.543Z_
