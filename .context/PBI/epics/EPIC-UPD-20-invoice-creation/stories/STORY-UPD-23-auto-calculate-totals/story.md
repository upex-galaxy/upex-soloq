# As a user, I want the system to automatically calculate subtotal and total to avoid calculation errors

**Jira Key:** UPD-23
**Epic:** UPD-20 (Invoice Creation)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want** the invoice subtotal, taxes, discounts, and final total to be calculated automatically
**So that** I can avoid manual math errors and save time.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Real-time calculation and display of invoice totals in the form.
- The calculation logic must be:
  1. `Subtotal` = Sum of all `(line_item.quantity * line_item.unit_price)`.
  2. `Discount Amount` = Calculated based on `Discount Value` and `Discount Type`.
  3. `Taxable Amount` = `Subtotal` - `Discount Amount`.
  4. `Tax Amount` = `Taxable Amount` \* (`Tax Rate` / 100).
  5. `Total` = `Taxable Amount` + `Tax Amount`.
- These calculations should update immediately whenever a line item, tax rate, or discount is changed.
- The final calculated amounts must be stored in the database, not just displayed on the frontend.

### Out of Scope

- Support for multiple different taxes on a single invoice.
- Compound taxes.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Automatic calculation of subtotal and total

- **Given:** I am creating an invoice with two line items: (10 hours _ $50/hr) and (1 project _ $300).
- **Then:** The `Subtotal` field on the invoice form automatically displays "$800.00".
- **And:** With no taxes or discounts, the `Total` field also displays "$800.00".

### Scenario 2: Calculation with a percentage discount

- **Given:** My invoice subtotal is $1000.
- **When:** I enter "10" in the discount value field and select "Percentage" as the discount type.
- **Then:** The form shows a discount amount of "$100.00".
- **And:** The `Total` is recalculated to "$900.00" (assuming no tax).

### Scenario 3: Calculation with a fixed discount and tax

- **Given:** My invoice subtotal is $1000.
- **When:** I apply a fixed discount of $50.
- **And:** I apply a tax rate of 16%.
- **Then:** The form shows:
  - Subtotal: $1000.00
  - Discount: -$50.00
  - Tax (16% on $950): $152.00
  - **Total: $1102.00**

---

## Technical Notes

### Frontend

- Implement the calculation logic in the frontend using JavaScript to provide immediate feedback to the user.
- A `useEffect` hook that watches for changes in line items, discount, and tax rate is a good approach to trigger recalculations.
- Ensure proper handling of floating-point numbers to avoid precision issues (e.g., work with cents or a library like `Decimal.js`).

### Backend

- **Crucially**, the backend must perform the exact same calculation upon receiving the invoice data via the API.
- The backend should not trust the total values sent from the client; it should recalculate them based on the raw items, discount, and tax rate to ensure data integrity.
- Store the calculated `subtotal`, `tax_amount`, and `total` in their respective columns in the `invoices` table.

---

## Dependencies

### Blocked By

- UPD-22 (Add line items)
- UPD-24 (Add taxes)
- UPD-25 (Add discounts)

### Blocks

- This is a core requirement for a functional and trustworthy invoicing tool.

---

## Definition of Done

- [ ] Frontend calculations update in real-time and are accurate.
- [ ] Backend recalculates and validates all totals before saving to the database.
- [ ] Unit tests are created for the calculation logic with various edge cases.
- [ ] E2E tests verify that the totals displayed on the form match what is saved and shown on the final PDF.
- [ ] All acceptance criteria are met.
