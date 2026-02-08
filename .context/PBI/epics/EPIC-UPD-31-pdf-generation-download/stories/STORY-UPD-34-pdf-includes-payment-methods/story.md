# As a user, I want the PDF to include my configured payment methods so the client knows how to pay me

**Jira Key:** UPD-34
**Epic:** UPD-31 (PDF Generation & Download)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** have my configured payment methods clearly displayed on the invoice PDF
**So that** my clients can easily see how they can pay me and choose their preferred option.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- The generated PDF will include a dedicated section for "Payment Methods".
- This section will list all payment methods configured by the user in their business profile.
- Each method will show its label and value (e.g., "Bank Transfer: CLABE 1234567890" or "PayPal: paypal.me/myname").
- The payment methods should be displayed in the order configured by the user.

### Out of Scope

- Dynamic formatting of payment method values (e.g., auto-linking PayPal URLs; simple text display is sufficient).
- Displaying payment methods specific to a client.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: PDF includes all configured payment methods

- **Given:** I have configured three payment methods (Bank Transfer, PayPal, Cash) in my business profile.
- **When:** I generate a PDF for any invoice.
- **Then:** The PDF includes a "Payment Methods" section.
- **And:** All three of my configured payment methods are listed in that section, showing their label and value.

### Scenario 2: PDF displays payment methods in the correct order

- **Given:** I have configured payment methods in a specific order (e.g., PayPal, then Bank Transfer).
- **When:** I generate a PDF for an invoice.
- **Then:** The payment methods are listed in the PDF exactly in the order I configured them.

### Scenario 3: PDF generated when no payment methods are configured

- **Given:** I have not configured any payment methods.
- **When:** I generate a PDF for an invoice.
- **Then:** The PDF is generated successfully.
- **And:** The "Payment Methods" section is either omitted or displays a message like "No payment methods configured."

---

## Technical Notes

### Frontend

- The React component for PDF rendering must include a section to iterate through the list of `paymentMethods` and display them.
- It should handle the styling for this section.

### Backend

- The API endpoint for PDF generation must fetch the `payment_methods` associated with the authenticated user.
- This data will be passed to the `@react-pdf/renderer` component.

### Database

- Queries to the `payment_methods` table, sorted by `sort_order`.

---

## Dependencies

### Blocked By

- UPD-32 (Generate PDF with professional design)
- UPD-12 (Configure payment methods)

### Blocks

- Clients knowing how to pay the freelancer.

---

## Definition of Done

- [ ] PDF rendering logic is updated to include payment methods.
- [ ] The generated PDF correctly displays all configured payment methods in the right order.
- [ ] E2E tests verify the presence and correct formatting of payment methods in the PDF.
- [ ] All acceptance criteria are met.
