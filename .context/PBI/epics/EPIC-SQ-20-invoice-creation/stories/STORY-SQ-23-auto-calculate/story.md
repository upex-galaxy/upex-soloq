# Automatic Subtotal and Total Calculation

**Jira Key:** [SQ-23](https://upexgalaxy64.atlassian.net/browse/SQ-23)
**Epic:** [SQ-20](https://upexgalaxy64.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** High
**Story Points:** 3
**Status:** Backlog

---

## User Story

**As a** user
**I want to** have the system automatically calculate subtotal and total
**So that** I avoid calculation errors

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Subtotal calculation

- **Given:** I have multiple line items
- **When:** I view the invoice summary
- **Then:** The subtotal is the sum of all line totals

### Scenario 2: Total with tax

- **Given:** I have a subtotal and tax rate
- **When:** I view the total
- **Then:** Total = subtotal + tax amount

### Scenario 3: Total with discount

- **Given:** I have a subtotal and discount
- **When:** I view the total
- **Then:** Total = subtotal - discount + tax

### Scenario 4: Real-time updates

- **Given:** I modify any value (item, tax, discount)
- **When:** The value changes
- **Then:** All calculations update in real-time

### Scenario 5: Precision handling

- **Given:** I have calculations with decimals
- **When:** I view the totals
- **Then:** Values are rounded to 2 decimal places

---

## Technical Notes

- Formula: total = (subtotal - discount_amount) + tax_amount
- Tax calculated on: subtotal (before discount) OR subtotal - discount (configurable)
- Currency formatting based on locale
- All calculations client-side for responsiveness

---

## Definition of Done

- [ ] Subtotal calculation working
- [ ] Tax calculation working
- [ ] Discount calculation working
- [ ] Real-time updates working
- [ ] Precision handling correct
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/epic.md`
