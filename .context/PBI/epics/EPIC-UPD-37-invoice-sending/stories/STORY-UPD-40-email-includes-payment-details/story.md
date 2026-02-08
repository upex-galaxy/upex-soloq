# As a user, I want the email to include my payment details to facilitate the cobro

**Jira Key:** UPD-40
**Epic:** UPD-37 (Invoice Sending)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** ensure the body of the email sent with the invoice includes my payment details
**So that** my client can easily see how to pay me without even having to open the PDF.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- The email template used for sending invoices must have a dedicated section for "Payment Methods".
- This section will list all the payment methods the user has configured in their business profile.
- The information displayed should be the same as what appears on the PDF (label and value).
- The payment methods should be listed in the order defined by the user.

### Out of Scope

- "Pay Now" buttons that link directly to a payment gateway.
- Logic to show/hide certain payment methods based on the client or invoice currency.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Email body contains payment details

- **Given:** I have configured my PayPal and Bank Transfer details in my profile.
- **And:** I send an invoice to a client.
- **When:** The client receives and opens the email.
- **Then:** The body of the email contains a clearly marked section with my PayPal and Bank Transfer information.

### Scenario 2: Email reflects the correct order of payment methods

- **Given:** I have set my Bank Transfer details to appear before my PayPal details in my profile.
- **When:** An invoice email is sent.
- **Then:** The payment methods are listed in that same order (Bank Transfer, then PayPal) in the email body.

---

## Technical Notes

### Frontend

- No direct frontend changes, but the "customize email" modal (UPD-41) should show the default template which includes these details.

### Backend

- The email template component (built with React Email) must be updated.
- The `POST /api/invoices/[invoiceId]/send` endpoint will need to fetch the user's `payment_methods` from the database.
- This data will be passed as props to the React Email component to be rendered in the email's HTML body.

### Database

- Requires a query to the `payment_methods` table, ordered by `sort_order`.

---

## Dependencies

### Blocked By

- UPD-12 (Configure payment methods)
- UPD-38 (Send invoice by email with one click)

### Blocks

- Reduces friction for the client to make a payment, which is a key goal of the product.

---

## Definition of Done

- [ ] The React Email template is updated to include a payment methods section.
- [ ] The backend endpoint provides the necessary data to the template.
- [ ] E2E tests (using a mail catcher) verify that the received email body contains the correct payment information.
- [ ] All acceptance criteria are met.
