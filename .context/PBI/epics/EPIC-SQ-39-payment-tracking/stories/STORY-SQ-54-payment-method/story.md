# As a user, I want to record the payment method used so that I have a record

**Jira Key:** [SQ-54](https://upexgalaxy65.atlassian.net/browse/SQ-54)
**Epic:** [SQ-39](https://upexgalaxy65.atlassian.net/browse/SQ-39) (Payment Tracking)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

As a user, I want to record the payment method used, so that I have a record. Story Points: 2

---

## Acceptance Criteria

1.
  1.
    1. Scenario 1: Method selection

- ***Given:*** I am recording a payment
- ***When:*** I fill the form
- ***Then:*** I can select a payment method from a dropdown

1.
  1.
    1. Scenario 2: Method options

- ***Given:*** I view the method dropdown
- ***When:*** I see the options
- ***Then:*** I see: Bank Transfer, PayPal, MercadoPago, Cash, Other

1.
  1.
    1. Scenario 3: Default to configured methods

- ***Given:*** I have payment methods configured in my profile
- ***When:*** I see the dropdown
- ***Then:*** My configured methods appear first

1.
  1.
    1. Scenario 4: Method recorded

- ***Given:*** I select a payment method
- ***When:*** I save the payment
- ***Then:*** The method is stored in payments.payment_method

1.
  1.
    1. Scenario 5: View method in history

- ***Given:*** I view a payment record
- ***When:*** I check the details
- ***Then:*** I see which method was used

---

## Scope

1.
  1.
    1. In Scope

- Payment method dropdown selector
- Options: bank_transfer, paypal, mercado_pago, cash, other
- User's configured methods shown first
- Method stored in payments table
- Method displayed in payment history
- Optional field (can save without selecting)

1.
  1.
    1. Out of Scope

- Add new payment method during payment recording
- Payment method analytics/reports
- Method-specific fields (account numbers)
- Custom method types

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 2026-01-21T01:09:36.070Z
- **Updated:** 2026-03-11T03:26:36.829Z
- **Reporter:** Ely
- **Assignee:** Unassigned

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-28T23:41:48.707Z_
