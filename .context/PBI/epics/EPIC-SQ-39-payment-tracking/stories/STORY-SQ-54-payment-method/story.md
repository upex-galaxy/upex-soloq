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

- ****Given:**** I am recording a payment
- ****When:**** I fill the form
- ****Then:**** I can select a payment method from a dropdown

1. 

- ****Given:**** I view the method dropdown
- ****When:**** I see the options
- ****Then:**** I see: Bank Transfer, PayPal, MercadoPago, Cash, Other

1. 

- ****Given:**** I have payment methods configured in my profile
- ****When:**** I see the dropdown
- ****Then:**** My configured methods appear first

1. 

- ****Given:**** I select a payment method
- ****When:**** I save the payment
- ****Then:**** The method is stored in payments.payment_method

1. 

- ****Given:**** I view a payment record
- ****When:**** I check the details
- ****Then:**** I see which method was used

---

## Scope

1. 

- Payment method dropdown selector
- Options: bank*transfer, paypal, mercado*pago, cash, other
- User's configured methods shown first
- Method stored in payments table
- Method displayed in payment history
- Optional field (can save without selecting)

1. 

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

- **Created:** 1/20/2026
- **Updated:** 3/2/2026
- **Reporter:** Ely
- **Assignee:** Unassigned

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:54:04.290Z_
