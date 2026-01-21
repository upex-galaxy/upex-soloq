# Add Notes and Terms to Invoice

**Jira Key:** [SQ-29](https://upexgalaxy64.atlassian.net/browse/SQ-29)
**Epic:** [SQ-20](https://upexgalaxy64.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** Low
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** add notes or terms and conditions
**So that** I can communicate additional information

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Add notes

- **Given:** I am creating an invoice
- **When:** I enter text in the notes field
- **Then:** The notes appear on the invoice

### Scenario 2: Add terms

- **Given:** I am creating an invoice
- **When:** I enter terms and conditions
- **Then:** The terms appear at the bottom of the invoice

### Scenario 3: Default terms

- **Given:** I have saved default terms in my profile
- **When:** I create a new invoice
- **Then:** My default terms are pre-filled

### Scenario 4: Character limit

- **Given:** I am writing notes or terms
- **When:** I reach the character limit
- **Then:** I see a counter and cannot exceed the limit

### Scenario 5: Optional fields

- **Given:** I don't need notes or terms
- **When:** I leave these fields empty
- **Then:** These sections don't appear on the invoice

---

## Technical Notes

- Notes: personal message to client (500 chars max)
- Terms: legal/payment terms (1000 chars max)
- Default terms stored in business_profile
- Both fields optional

---

## Definition of Done

- [ ] Notes field implemented
- [ ] Terms field implemented
- [ ] Default terms pre-fill working
- [ ] Character limits enforced
- [ ] Conditional display on invoice
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/epic.md`
