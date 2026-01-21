# Customize Email Subject and Message

**Jira Key:** [SQ-45](https://upexgalaxy64.atlassian.net/browse/SQ-45)
**Epic:** [SQ-37](https://upexgalaxy64.atlassian.net/browse/SQ-37) (Invoice Sending)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** customize the subject and message of the email
**So that** I can communicate better with my client

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Default subject

- **Given:** I am sending an invoice
- **When:** I don't modify the subject
- **Then:** A default subject is used: "Invoice {number} from {business}"

### Scenario 2: Custom subject

- **Given:** I am sending an invoice
- **When:** I edit the subject
- **Then:** My custom subject is used

### Scenario 3: Default message

- **Given:** I am sending an invoice
- **When:** I don't modify the message
- **Then:** A default professional message is sent

### Scenario 4: Custom message

- **Given:** I am sending an invoice
- **When:** I write a custom message
- **Then:** My message appears in the email body

### Scenario 5: Variables in message

- **Given:** I am writing a message
- **When:** I use variables like {client_name}
- **Then:** Variables are replaced with actual values

---

## Technical Notes

- Subject: max 100 chars
- Message: max 1000 chars
- Variables: {client_name}, {invoice_number}, {amount}, {due_date}
- Save last used message as suggestion

---

## Definition of Done

- [ ] Default subject working
- [ ] Custom subject working
- [ ] Default message working
- [ ] Custom message working
- [ ] Variable replacement working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-37-invoice-sending/epic.md`
