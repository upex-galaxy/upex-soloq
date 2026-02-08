# As a user, I want to add line items (description, quantity, unit price) to detail my services

**Jira Key:** UPD-22
**Epic:** UPD-20 (Invoice Creation)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** add multiple line items with description, quantity, and unit price
**So that** I can detail the services or products I'm charging for.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- An editable table or dynamic list for invoice items in the invoice form.
- Each row represents a line item and must have fields for "Description", "Quantity", and "Unit Price".
- A "Line Total" column that automatically calculates `Quantity * Unit Price` for each row.
- Buttons to "Add a new line" and "Delete" an existing line.
- Ability to reorder lines (drag and drop is a nice-to-have, but arrow buttons are sufficient).

### Out of Scope

- Saving line items to a product/service library for reuse.
- Complex units (e.g., hours, days, sqm). Quantity is just a number.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Add multiple line items

- **Given:** I am editing an invoice.
- **When:** I fill in the first line with "Web Design", quantity 10 (hours), and unit price 50.
- **Then:** The line total for this row shows 500.
- **When:** I click "Add a new line".
- **And:** I fill in the second line with "Hosting", quantity 1, and unit price 200.
- **Then:** The line total for the second row shows 200.
- **And:** The invoice's subtotal is updated to 700.

### Scenario 2: Delete a line item

- **Given:** I have an invoice with three line items.
- **When:** I click the "Delete" button for the second line item.
- **Then:** The line item is removed from the form.
- **And:** The invoice's subtotal is immediately recalculated based on the remaining two items.

### Scenario 3: Attempt to save with an invalid line item

- **Given:** I am editing an invoice.
- **When:** I add a line item but leave the "Description" blank.
- **And:** I try to save the invoice.
- **Then:** An error message "Description is required for all items" is displayed.
- **And:** The invoice is not saved.

---

## Technical Notes

### Frontend

- This is a key component. Use `react-hook-form`'s `useFieldArray` hook to manage the dynamic list of items.
- Implement client-side calculations for line totals and the invoice subtotal for immediate feedback.
- The UI must be intuitive for adding, deleting, and editing rows.

### Backend

- The `items` array will be part of the payload for `POST /api/invoices` and `PUT /api/invoices/[invoiceId]`.
- The backend must validate that the `items` array is not empty and that each item has the required fields.
- When updating an invoice, the backend should delete the old `invoice_items` and insert the new ones to simplify the logic.

### Database

- Records will be created/updated in the `public.invoice_items` table.

---

## Dependencies

### Blocked By

- UPD-21 (Create new invoice)

### Blocks

- A meaningful invoice cannot be created without this.

---

## Definition of Done

- [ ] Dynamic form for line items is fully functional (add, edit, delete).
- [ ] Backend API correctly processes the array of items.
- [ ] Calculations are accurate and update in real-time on the frontend.
- [ ] E2E test for adding and deleting multiple line items is passing.
- [ ] All acceptance criteria are met.
