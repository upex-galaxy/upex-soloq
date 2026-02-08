# As a user, I want to configure my accepted payment methods so my clients know how to pay me

**Jira Key:** UPD-12
**Epic:** UPD-7 (Business Profile Management)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** configure the payment methods I accept (like bank transfer, PayPal, etc.)
**So that** my clients have all the necessary information to pay me directly from the invoice.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A section in "Settings" to manage payment methods.
- Ability to add multiple payment methods.
- For each method, the user can specify a type (Bank, PayPal, Other), a descriptive label, and the value (e.g., bank account number, PayPal.me link).
- Ability to edit and delete existing payment methods.
- Ability to reorder payment methods.
- All configured payment methods will be listed clearly on the invoice PDF.

### Out of Scope

- Direct integration with payment gateways (e.g., Stripe, PayPal checkout). This is for displaying information only.
- QR code generation for payments.
- Automatically detecting when a payment is made.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: User adds a new bank transfer payment method

- **Given:** I am on the "Payment Methods" settings page.
- **When:** I click "Add New Method" and select "Bank Transfer".
- **And:** I enter "My Bank (USD)" as the label and my account details in the value field.
- **And:** I save the method.
- **Then:** The new payment method appears in my list.
- **And:** It is also displayed on any new invoice I create.

### Scenario 2: User adds a PayPal link

- **Given:** I am on the "Payment Methods" settings page.
- **When:** I add a new method of type "PayPal" with the value "https://paypal.me/myfreelance".
- **And:** I save the method.
- **Then:** The PayPal method is added to my profile.
- **And:** The invoice PDF shows the PayPal details, and the link should ideally be clickable.

### Scenario 3: User deletes a payment method

- **Given:** I have a "Cash" payment method that I no longer want to offer.
- **When:** I find the "Cash" method in my list and click the "Delete" icon.
- **And:** I confirm the deletion.
- **Then:** The "Cash" payment method is removed from my list.
- **And:** It no longer appears on any new invoices.

### Scenario 4: User reorders payment methods

- **Given:** I have three payment methods: [Bank, PayPal, Cash].
- **When:** I drag "PayPal" to be the first item in the list.
- **And:** I save the new order.
- **Then:** The list is updated to show [PayPal, Bank, Cash].
- **And:** The invoice PDF displays the payment methods in this new order.

---

## Technical Notes

### Frontend

- Create a dynamic form/list component to manage payment methods.
- Use a library like `react-beautiful-dnd` for drag-and-drop reordering.
- Each item in the list will have fields for `type`, `label`, `value`.
- The entire list of payment methods will be sent to the backend API via a `PUT` request to `/api/profile/payment-methods`.

### Backend

- The `PUT /api/profile/payment-methods` endpoint will receive an array of payment method objects.
- It should perform a "delete all and insert all" operation for the given user to handle additions, deletions, and reordering in one transaction.
- The `sort_order` field in the database should be populated based on the array index.

### Database

- The `payment_methods` table will store the configured methods, linked to the `user_id`. It will include a `sort_order` column to maintain the user-defined order.

---

## Dependencies

### Blocked By

- UPD-1 (Authentication Epic)

### Blocks

- A core component of making invoices actionable for clients, directly impacting the user's ability to get paid.

---

## Definition of Done

- [ ] User can add, edit, delete, and reorder payment methods.
- [ ] Backend API correctly updates the `payment_methods` table.
- [ ] E2E test for the full CRUD and reordering functionality is passing.
- [ ] Configured payment methods are correctly displayed in the specified order on the invoice PDF.
- [ ] All acceptance criteria are met.
