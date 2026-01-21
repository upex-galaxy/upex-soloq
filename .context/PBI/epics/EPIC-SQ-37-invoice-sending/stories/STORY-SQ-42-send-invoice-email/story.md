# Send Invoice by Email with One Click

**Jira Key:** [SQ-42](https://upexgalaxy64.atlassian.net/browse/SQ-42)
**Epic:** [SQ-37](https://upexgalaxy64.atlassian.net/browse/SQ-37) (Invoice Sending)
**Priority:** High
**Story Points:** 3
**Status:** Backlog

---

## User Story

**As a** user
**I want to** send the invoice by email to the client with one click
**So that** I can save time

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Send invoice

- **Given:** I have a complete invoice
- **When:** I click "Send"
- **Then:** The invoice is sent to the client's email

### Scenario 2: Quick send from list

- **Given:** I am on the invoices list
- **When:** I click the send icon on a draft invoice
- **Then:** The invoice is sent without additional steps

### Scenario 3: Status update

- **Given:** I send an invoice
- **When:** The email is sent successfully
- **Then:** The invoice status changes to "sent"

### Scenario 4: Send confirmation

- **Given:** I send an invoice
- **When:** The process completes
- **Then:** I see a success message

### Scenario 5: Error handling

- **Given:** I send an invoice
- **When:** The email fails to send
- **Then:** I see an error message and can retry

---

## Technical Notes

- Use Resend for email delivery
- Update invoice: status = 'sent', sent_at = now()
- Log email in email_logs table
- Retry logic for failed sends

---

## Definition of Done

- [ ] Send functionality working
- [ ] Status update working
- [ ] Success message displayed
- [ ] Error handling implemented
- [ ] Email logged
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-37-invoice-sending/epic.md`
