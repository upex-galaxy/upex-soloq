# As a user, I want to add discounts (percentage or fixed amount) to offer promotions to clients

**Jira Key:** UPD-25
**Epic:** UPD-20 (Invoice Creation)
**Priority:** Could Have
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** add a discount, either as a fixed amount or a percentage, to an invoice
**So that** I can offer special pricing or promotions to my clients.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Input fields on the invoice form for a "Discount" value and its "Type".
- The "Type" can be toggled between "Percentage (%)" and "Fixed ($)".
- The discount is subtracted from the subtotal _before_ tax is calculated.
- The calculated discount amount is displayed on the invoice.
- The discount value and type are saved with the invoice data.

### Out of Scope

- Applying discounts to individual line items. The discount applies to the entire invoice subtotal.
- Discount codes or coupons.
- Time-limited discounts.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Apply a percentage-based discount

- **Given:** I am creating an invoice with a subtotal of $500.
- **When:** I enter "10" in the discount value field.
- **And:** I select "Percentage" as the discount type.
- **Then:** The form displays a discount amount of "$50.00".
- **And:** The invoice `Total` is updated to "$450.00" (assuming no tax).

### Scenario 2: Apply a fixed amount discount

- **Given:** I am creating an invoice with a subtotal of $500.
- **When:** I enter "75" in the discount value field.
- **And:** I select "Fixed" as the discount type.
- **Then:** The form displays a discount amount of "$75.00".
- **And:** The invoice `Total` is updated to "$425.00" (assuming no tax).

### Scenario 3: Discount value cannot be greater than the subtotal

- **Given:** I am creating an invoice with a subtotal of $500.
- **When:** I try to apply a fixed discount of $600.
- **Then:** An error message is displayed: "Discount cannot be greater than the subtotal."
- **And:** The discount is not applied.

---

## Technical Notes

### Frontend

- Add a number input for `discountValue` and a toggle/select for `discountType` (`percentage` or `fixed`).
- Integrate these fields into the real-time calculation logic.
- The validation schema (`zod`) should ensure the discount value is a positive number and handle the check against the subtotal.

### Backend

- `discountValue` and `discountType` will be part of the payload to the invoice API.
- The backend must validate the discount and include it in its authoritative calculation of the final total.

### Database

- `invoices.discount_value` (decimal), `invoices.discount_type` (enum: 'percentage', 'fixed') columns will be populated.

---

## Dependencies

### Blocked By

- UPD-22 (Add line items)

### Blocks

- UPD-23 (Auto-calculate totals)

---

## Definition of Done

- [ ] Frontend form has functional discount inputs.
- [ ] Invoice total is correctly recalculated when the discount changes.
- [ ] Backend saves the discount value and type correctly.
- [ ] E2E test for applying both types of discounts and verifying the final total is passing.
- [ ] All acceptance criteria are met.
