# As a user, I want to configure my accepted payment methods so that my clients know how to pay me

**Jira Key:** [SQ-12](https://upexgalaxy65.atlassian.net/browse/SQ-12)
**Epic:** [SQ-7](https://upexgalaxy65.atlassian.net/browse/SQ-7) (Business Profile Management)
**Priority:** Medium
**Story Points:** 5
**Status:** Backlog

---

## User Story

## User Story

***As a*** user
***I want to*** configure my accepted payment methods
***So that*** my clients know how to pay me

## Acceptance Criteria

### Scenario 1: Add bank transfer details

- ***Given:*** I am on payment methods configuration
- ***When:*** I add bank transfer with account details (bank name, account number, CLABE/CBU)
- ***Then:*** The bank details are saved

### Scenario 2: Add PayPal account

- ***Given:*** I am on payment methods configuration
- ***When:*** I add my PayPal email
- ***Then:*** The PayPal email is validated and saved

### Scenario 3: Add other payment method

- ***Given:*** I am on payment methods configuration
- ***When:*** I add a custom payment method (name + instructions)
- ***Then:*** The custom method is saved

### Scenario 4: Payment methods appear on invoice

- ***Given:*** I have configured payment methods
- ***When:*** I generate an invoice
- ***Then:*** All my payment methods appear in the payment section

### Scenario 5: Require at least one payment method

- ***Given:*** I am trying to create an invoice
- ***When:*** I have no payment methods configured
- ***Then:*** I am prompted to add at least one payment method

## Technical Notes

- Separate table: `payment_methods`
- Types: bank_transfer, paypal, mercadopago, other
- Bank transfer fields vary by country (CLABE for Mexico, CBU for Argentina)
- At least one required for invoice creation
- Multiple payment methods allowed

## Story Points

5

---

## Acceptance Criteria

1. 

- ****Given:**** I am on payment methods configuration
- ****When:**** I add bank transfer with account details (bank name, account number, CLABE/CBU)
- ****Then:**** The bank details are saved

1. 

- ****Given:**** I am on payment methods configuration
- ****When:**** I add my PayPal email
- ****Then:**** The PayPal email is validated and saved

1. 

- ****Given:**** I am on payment methods configuration
- ****When:**** I add my MercadoPago alias or CVU
- ****Then:**** The MercadoPago details are saved

1. 

- ****Given:**** I am on payment methods configuration
- ****When:**** I add a custom payment method with name and instructions
- ****Then:**** The custom method is saved

1. 

- ****Given:**** I have configured payment methods
- ****When:**** I generate an invoice
- ****Then:**** All my active payment methods appear in the payment section

1. 

- ****Given:**** I am trying to create an invoice
- ****When:**** I have no payment methods configured
- ****Then:**** I am prompted to add at least one payment method

1. 

- ****Given:**** I have multiple payment methods
- ****When:**** I toggle one as inactive
- ****Then:**** It no longer appears on new invoices but is not deleted

1. 

- ****Given:**** I have a payment method I no longer use
- ****When:**** I delete it
- ****Then:**** It is permanently removed

---

## Scope

1. 

- Add payment method form (bank transfer, PayPal, MercadoPago, custom)
- Dynamic fields based on payment type
- List all configured payment methods
- Edit existing payment method
- Delete payment method with confirmation
- Toggle active/inactive status
- At least one required validation for invoicing
- Display all active methods on invoice PDF
- API CRUD endpoints

1. 

- Payment processing integration
- Direct payment links (Stripe, MercadoPago API)
- QR code generation
- International wire transfer details (SWIFT)
- Drag-to-reorder functionality

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 3/2/2026
- **Reporter:** Ely
- **Assignee:** Unassigned

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:42.167Z_
