# See Email Delivery Confirmation

**Jira Key:** [SQ-46](https://upexgalaxy64.atlassian.net/browse/SQ-46)
**Epic:** [SQ-37](https://upexgalaxy64.atlassian.net/browse/SQ-37) (Invoice Sending)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** see if the email was sent successfully
**So that** I have certainty it arrived

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Sent status

- **Given:** I send an invoice
- **When:** The email is sent
- **Then:** I see a "Sent" confirmation

### Scenario 2: Delivery tracking

- **Given:** I have sent an invoice
- **When:** I view the invoice details
- **Then:** I see when it was sent

### Scenario 3: Failed notification

- **Given:** I send an invoice
- **When:** The email fails to deliver
- **Then:** I see a failure notification

### Scenario 4: Resend option

- **Given:** An email failed to send
- **When:** I view the invoice
- **Then:** I can click "Resend"

### Scenario 5: Email history

- **Given:** I have sent multiple emails for an invoice
- **When:** I view the invoice
- **Then:** I see a log of all email attempts

---

## Technical Notes

- Use Resend webhooks for delivery status
- Store in email_logs: sent_at, status, message_id
- Statuses: pending, sent, delivered, bounced, failed
- Webhook endpoint: POST /api/webhooks/resend

---

## Definition of Done

- [ ] Sent confirmation displayed
- [ ] Delivery timestamp shown
- [ ] Failure notification working
- [ ] Resend functionality working
- [ ] Email history visible
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-37-invoice-sending/epic.md`
