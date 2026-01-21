# Add Discounts to Invoice

**Jira Key:** [SQ-25](https://upexgalaxy64.atlassian.net/browse/SQ-25)
**Epic:** [SQ-20](https://upexgalaxy64.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** add discounts (percentage or fixed amount)
**So that** I can offer promotions to clients

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Add percentage discount

- **Given:** I am creating an invoice
- **When:** I select "percentage" and enter 10%
- **Then:** The discount is 10% of the subtotal

### Scenario 2: Add fixed discount

- **Given:** I am creating an invoice
- **When:** I select "fixed" and enter $50
- **Then:** The discount is exactly $50

### Scenario 3: Discount display

- **Given:** I have added a discount
- **When:** I view the invoice summary
- **Then:** I see the discount type, value, and calculated amount

### Scenario 4: Discount limit

- **Given:** I am adding a discount
- **When:** The discount exceeds the subtotal
- **Then:** I see a warning and the discount is capped

### Scenario 5: No discount

- **Given:** I don't want to give a discount
- **When:** I leave discount empty or at 0
- **Then:** No discount is applied

---

## Technical Notes

- discount_type: 'percentage' | 'fixed'
- discount_value: the entered value
- discount_amount: calculated amount (capped at subtotal)
- Discount applied before tax calculation

---

## Definition of Done

- [ ] Discount type selector implemented
- [ ] Percentage discount working
- [ ] Fixed discount working
- [ ] Discount cap validation working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/epic.md`
