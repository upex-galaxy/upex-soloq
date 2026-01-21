# Add Payment Notes

**Jira Key:** [SQ-56](https://upexgalaxy64.atlassian.net/browse/SQ-56)
**Epic:** [SQ-39](https://upexgalaxy64.atlassian.net/browse/SQ-39) (Payment Tracking)
**Priority:** Low
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** add notes to the payment
**So that** I have context

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Notes field

- **Given:** I am recording a payment
- **When:** I fill the form
- **Then:** I see an optional notes textarea

### Scenario 2: Add note

- **Given:** I want to add context
- **When:** I type in the notes field
- **Then:** My notes are saved with the payment

### Scenario 3: Optional field

- **Given:** I don't need notes
- **When:** I leave the field empty
- **Then:** The payment saves without notes

### Scenario 4: View notes

- **Given:** I view a payment with notes
- **When:** I check the details
- **Then:** I see the notes I wrote

### Scenario 5: Character limit

- **Given:** I am writing notes
- **When:** I reach the limit
- **Then:** I see a counter (max 500 chars)

---

## Technical Notes

- Optional text field
- Max 500 characters
- Store in payments.notes
- Example uses: "Wire transfer ref #12345", "Cash at meeting"

---

## Definition of Done

- [ ] Notes textarea implemented
- [ ] Notes saved correctly
- [ ] Optional field working
- [ ] Notes displayed in history
- [ ] Character limit enforced
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-39-payment-tracking/epic.md`
