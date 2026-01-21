# Save Invoice as Draft

**Jira Key:** [SQ-30](https://upexgalaxy64.atlassian.net/browse/SQ-30)
**Epic:** [SQ-20](https://upexgalaxy64.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** save an invoice as draft
**So that** I can finish it later

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Save as draft

- **Given:** I am creating an invoice
- **When:** I click "Save Draft"
- **Then:** The invoice is saved with status "draft"

### Scenario 2: Auto-save

- **Given:** I am editing an invoice
- **When:** I make changes
- **Then:** Changes are auto-saved periodically (every 30s)

### Scenario 3: Find drafts

- **Given:** I have saved drafts
- **When:** I go to my invoices list
- **Then:** I can filter to see only drafts

### Scenario 4: Continue editing

- **Given:** I have a draft invoice
- **When:** I click on it
- **Then:** I can continue editing where I left off

### Scenario 5: Delete draft

- **Given:** I have a draft I don't need
- **When:** I click delete
- **Then:** The draft is permanently deleted

### Scenario 6: Convert to sent

- **Given:** I have a complete draft
- **When:** I click "Send"
- **Then:** The status changes from "draft" to "sent"

---

## Technical Notes

- Status: 'draft' until sent
- Auto-save with debounce
- Drafts editable, sent invoices read-only
- Soft delete for drafts (or hard delete since no history needed)

---

## Definition of Done

- [ ] Save draft functionality working
- [ ] Auto-save implemented
- [ ] Draft filtering working
- [ ] Continue editing working
- [ ] Delete draft working
- [ ] Status transition to sent working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/epic.md`
