# As a user, I want to record the payment date so that I have an accurate payment history

**Jira Key:** [SQ-57](https://upexgalaxy65.atlassian.net/browse/SQ-57)
**Epic:** [SQ-39](https://upexgalaxy65.atlassian.net/browse/SQ-39) (Payment Tracking)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

As a user, I want to record the payment date, so that I have accurate history. Story Points: 1

---

## Acceptance Criteria

1. 

1. 

- ****Given:**** I open the payment recording form
- ****When:**** The form loads
- ****Then:**** The payment date field is pre-filled with today's date
- ****And:**** The date is displayed in a user-friendly format (e.g., "Mar 02, 2026")

1. 

- ****Given:**** I am recording a payment received yesterday
- ****When:**** I select yesterday's date from the date picker
- ****Then:**** The payment is recorded with yesterday's date
- ****And:**** This reflects accurately in the invoice payment history

1. 

- ****Given:**** I am on the payment recording form
- ****When:**** I try to select a date in the future (tomorrow or later)
- ****Then:**** The system shows a validation error "Payment date cannot be in the future"
- ****Or:**** Future dates are disabled in the date picker

1. 

- ****Given:**** I am recording a payment for an invoice issued on Feb 01, 2026
- ****When:**** I select a payment date of Jan 15, 2026 (before issue date)
- ****Then:**** The system shows a warning "Payment date is before the invoice issue date"
- ****And:**** Allows me to proceed if I confirm (edge case: prepayment)

1. 

- ****Given:**** I am on the payment recording form
- ****When:**** I click on the payment date field
- ****Then:**** A calendar date picker opens
- ****And:**** I can easily navigate between months
- ****And:**** Today's date is highlighted

1. 

- ****Given:**** I have recorded a payment with date Feb 28, 2026
- ****When:**** I view the invoice details
- ****Then:**** I can see the payment date displayed as "Feb 28, 2026"

1. 

- ****Given:**** I am on the payment recording form
- ****When:**** I clear the payment date and try to submit
- ****Then:**** The system shows a validation error "Payment date is required"

---

## Scope

1. 

1. 

- Date input field with calendar picker
- Default to current date
- Validation: required, not in future
- Warning for dates before invoice issue date
- User-friendly date format display
- Store payment_date in payments table

1. 

- Time of payment (only date, not datetime)
- Timezone handling (use server timezone)
- Recurring payment date patterns
- Date format customization per user locale

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
_Last sync: 2026-03-02T19:54:05.481Z_
