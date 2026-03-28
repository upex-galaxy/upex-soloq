# As a user, I want to add notes to my payment so that I have context for future reference

**Jira Key:** [SQ-56](https://upexgalaxy65.atlassian.net/browse/SQ-56)
**Epic:** [SQ-39](https://upexgalaxy65.atlassian.net/browse/SQ-39) (Payment Tracking)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

As a user, I want to add notes to the payment, so that I have context. Story Points: 1

---

## Acceptance Criteria

1.
  1. Acceptance Criteria (Gherkin)

1.
  1.
    1. Scenario 1: Add payment notes with reference number

- ***Given:*** I am on the payment recording form
- ***When:*** I enter notes "Transfer reference: TRF-2026-001234"
- ***Then:*** The notes are saved with the payment record
- ***And:*** The notes are visible when viewing the payment details

1.
  1.
    1. Scenario 2: Add payment notes with client context

- ***Given:*** I am recording a payment for client ABC Corp
- ***When:*** I add notes "Payment includes late fee waiver per agreement on call 02/15"
- ***Then:*** The contextual notes are saved successfully
- ***And:*** Help me remember the circumstances of this payment

1.
  1.
    1. Scenario 3: Notes field is optional

- ***Given:*** I am on the payment recording form
- ***When:*** I submit the payment without entering any notes
- ***Then:*** The payment is recorded successfully
- ***And:*** The notes field shows as empty/null

1.
  1.
    1. Scenario 4: Validate notes maximum length

- ***Given:*** I am on the payment recording form
- ***When:*** I enter notes exceeding 500 characters
- ***Then:*** The system shows a validation error "Notes cannot exceed 500 characters"
- ***Or:*** The input is truncated with a character counter showing remaining chars

1.
  1.
    1. Scenario 5: View payment notes in invoice details

- ***Given:*** I have recorded a payment with notes "Wire transfer from Chase account"
- ***When:*** I view the invoice details
- ***Then:*** I can see the payment notes in the payment section

1.
  1.
    1. Scenario 6: Multiline notes support

- ***Given:*** I am on the payment recording form
- ***When:*** I enter notes with multiple lines:
  "Reference: TRF-001234
  Bank: Chase
  Confirmed by: John"
- ***Then:*** The multiline format is preserved when saved and displayed

1.
  1.
    1. Scenario 7: Special characters in notes

- ***Given:*** I am on the payment recording form
- ***When:*** I enter notes with special characters "Payment $1,500 @ 3% discount (agreed)"
- ***Then:*** The special characters are preserved correctly

---

## Scope

1.
  1. Scope

1.
  1.
    1. In Scope

- Optional textarea field for payment notes
- Support for multiline text
- Character limit of 500 characters with counter
- Special characters support
- Display notes in payment/invoice details view
- Store notes in payments table (notes column)

1.
  1.
    1. Out of Scope

- Rich text formatting (bold, italic, links)
- File attachments to payment notes
- Note templates or quick-insert options
- Search within payment notes

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 2026-01-21T01:09:36.984Z
- **Updated:** 2026-03-11T03:26:37.233Z
- **Reporter:** Ely
- **Assignee:** Unassigned

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-28T23:27:59.777Z_
