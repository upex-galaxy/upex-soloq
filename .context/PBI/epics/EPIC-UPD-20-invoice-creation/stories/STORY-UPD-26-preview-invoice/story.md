# As a user, I want to preview the invoice before sending it to verify that everything is correct

**Jira Key:** UPD-26
**Epic:** UPD-20 (Invoice Creation)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** user
**I want to** preview the invoice exactly as the client will see it
**So that** I can double-check all the details for accuracy and professionalism before sending it.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A "Preview" button or mode in the invoice creation/editing form.
- The preview should render a component that looks identical to the final PDF invoice.
- It must display all invoice data: business profile info, logo, client info, line items, and all calculated totals.
- The preview should update in real-time as the user makes changes to the invoice form.

### Out of Scope

- Generating an actual PDF file for the preview (this can be slow). An HTML/CSS representation is sufficient.
- The preview being interactive (e.g., clicking links).

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Previewing a complete invoice

- **Given:** I am editing an invoice and have filled in the client, line items, tax, and discount.
- **When:** I look at the preview pane.
- **Then:** I see a visual representation of the invoice that includes my logo, my business details, the client's details, a table with all line items, and the correct subtotal, discount, tax, and final total.

### Scenario 2: Preview updates in real-time

- **Given:** I am viewing the invoice preview, which shows a total of $500.
- **When:** I change the quantity of a line item in the form, causing the total to become $600.
- **Then:** The `Total` in the preview pane updates to $600 almost instantly.

### Scenario 3: Preview reflects changes to business profile

- **Given:** I am viewing an invoice preview with my old business logo.
- **When:** I go to settings, upload a new logo, and return to the invoice.
- **Then:** The invoice preview now displays my new logo.

---

## Technical Notes

### Frontend

- Create a reusable React component (`InvoiceTemplate`) that takes invoice data as props and renders the invoice visually using HTML and CSS.
- This same component will be used by both the real-time preview and the PDF generation service (`@react-pdf/renderer`) to ensure consistency.
- The preview can be displayed in a side panel next to the form or in a modal.
- The component should get its data from the `react-hook-form` state, so it updates automatically on change.

### Backend

- The backend is not directly involved in the real-time preview, but it provides the initial data for the invoice being edited.

---

## Dependencies

### Blocked By

- Most other stories in this epic, as it needs all the data points to display.

### Blocks

- **EPIC-SOLOQ-005 (PDF Generation):** The preview component is the foundation for the PDF.
- Provides user confidence before sending an invoice.

---

## Definition of Done

- [ ] An HTML/CSS component that accurately represents the final invoice is created.
- [ ] This component is displayed on the invoice editing page.
- [ ] The preview updates in real-time as form fields are modified.
- [ ] The preview matches the generated PDF in layout and data.
- [ ] All acceptance criteria are met.
