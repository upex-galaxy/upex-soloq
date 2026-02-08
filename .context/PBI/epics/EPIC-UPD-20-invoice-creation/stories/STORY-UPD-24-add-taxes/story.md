# As a user, I want to add taxes (VAT/percentage) to comply with tax requirements

**Jira Key:** UPD-24
**Epic:** UPD-20 (Invoice Creation)
**Priority:** Should Have
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** be able to add a tax rate (e.g., VAT) to my invoice
**So that** I can comply with my local tax regulations and charge my clients correctly.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A single input field on the invoice form for "Tax Rate (%)".
- The user can enter a percentage value (e.g., "16" for 16%).
- This tax rate is applied to the subtotal _after_ any discount has been subtracted.
- The calculated tax amount is displayed separately on the invoice.
- The tax rate and calculated amount are saved with the invoice data.

### Out of Scope

- Multiple or compound taxes (e.g., state tax + federal tax).
- Different tax rates for different line items.
- Pre-configured tax rates based on country. The user must enter the rate manually.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Add a tax rate to an invoice

- **Given:** I am creating an invoice with a subtotal of $1000.
- **When:** I enter "16" into the "Tax Rate (%)" field.
- **Then:** The form displays a "Tax" amount of "$160.00".
- **And:** The invoice `Total` is updated to "$1160.00".

### Scenario 2: Tax is calculated after a discount

- **Given:** I have an invoice with a subtotal of $1000 and a fixed discount of $100.
- **When:** I enter "10" into the "Tax Rate (%)" field.
- **Then:** The tax is calculated on the discounted amount ($900).
- **And:** The form displays a "Tax" amount of "$90.00".
- **And:** The final `Total` is $990.00 ($900 + $90).

### Scenario 3: Remove the tax rate

- **Given:** I have an invoice with a 16% tax rate applied.
- **When:** I clear the "Tax Rate (%)" field or set it to "0".
- **Then:** The "Tax" amount on the form becomes "$0.00".
- **And:** The invoice `Total` is recalculated without tax.

---

## Technical Notes

### Frontend

- Add a number input for `taxRate` to the invoice form.
- Integrate this field into the real-time calculation logic.
- The `zod` schema should validate that the tax rate is a number between 0 and 100.

### Backend

- The `taxRate` will be part of the payload to the invoice API endpoints.
- The backend must include the `taxRate` in its authoritative calculation of the final total before saving.

### Database

- `invoices.tax_rate` (decimal) and `invoices.tax_amount` (decimal) columns will be populated.

---

## Dependencies

### Blocked By

- UPD-22 (Add line items)

### Blocks

- UPD-23 (Auto-calculate totals)

---

## Definition of Done

- [ ] Frontend form has a functional tax rate input.
- [ ] The invoice total is correctly recalculated when the tax rate changes.
- [ ] Backend saves the tax rate and calculated amount correctly.
- [ ] E2E test for adding tax and verifying the final total is passing.
- [ ] All acceptance criteria are met.
