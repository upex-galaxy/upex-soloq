# Add Line Items to Invoice

**Jira Key:** [SQ-22](https://upexgalaxy64.atlassian.net/browse/SQ-22)
**Epic:** [SQ-20](https://upexgalaxy64.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** High
**Story Points:** 5
**Status:** Backlog

---

## User Story

**As a** user
**I want to** add line items (description, quantity, unit price)
**So that** I can detail my services

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Add first line item

- **Given:** I am creating an invoice
- **When:** I fill in description, quantity, and unit price
- **Then:** The line item is added to the invoice

### Scenario 2: Add multiple line items

- **Given:** I have one line item
- **When:** I click "Add Item"
- **Then:** A new empty line item row appears

### Scenario 3: Line total calculation

- **Given:** I have a line item with quantity and price
- **When:** I view the line item
- **Then:** The line total (quantity × price) is calculated automatically

### Scenario 4: Edit line item

- **Given:** I have a line item
- **When:** I modify any field
- **Then:** The line total updates automatically

### Scenario 5: Remove line item

- **Given:** I have multiple line items
- **When:** I click delete on a line item
- **Then:** The item is removed and totals recalculate

### Scenario 6: Reorder line items

- **Given:** I have multiple line items
- **When:** I drag and drop a line item
- **Then:** The order is updated

---

## Technical Notes

- Dynamic form with array of items
- Real-time line total calculation
- Drag-and-drop reordering (optional for MVP)
- Minimum 1 line item required
- API: POST/PUT /api/invoices/:id/items

---

## Definition of Done

- [ ] Line item form implemented
- [ ] Add/remove items working
- [ ] Line total calculation working
- [ ] Edit items working
- [ ] Reorder items working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/epic.md`
