# Assign Unique Invoice Number

**Jira Key:** [SQ-27](https://upexgalaxy64.atlassian.net/browse/SQ-27)
**Epic:** [SQ-20](https://upexgalaxy64.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** High
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** assign a unique invoice number
**So that** I can keep track of my numbering

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Auto-generated number

- **Given:** I am creating a new invoice
- **When:** The form loads
- **Then:** An invoice number is auto-generated

### Scenario 2: Sequential numbering

- **Given:** My last invoice was INV-001
- **When:** I create a new invoice
- **Then:** The suggested number is INV-002

### Scenario 3: Custom number

- **Given:** I am creating an invoice
- **When:** I want a different number
- **Then:** I can edit the invoice number manually

### Scenario 4: Duplicate prevention

- **Given:** I try to use an existing invoice number
- **When:** I save the invoice
- **Then:** I see an error about duplicate number

### Scenario 5: Number format

- **Given:** I am viewing invoice numbers
- **When:** I look at the format
- **Then:** Numbers follow my configured format (e.g., INV-001, 2024-001)

---

## Technical Notes

- Auto-increment based on user's last invoice
- Format: configurable prefix + padded number
- Unique constraint: (user_id, invoice_number)
- Default format: INV-XXX (3 digits, zero-padded)

---

## Definition of Done

- [ ] Auto-generation implemented
- [ ] Sequential logic working
- [ ] Manual edit allowed
- [ ] Duplicate validation working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/epic.md`
