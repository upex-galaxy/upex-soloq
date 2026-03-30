# As a user, I want to record the amount received so that I can verify against the total invoiced

**Jira Key:** [SQ-55](https://upexgalaxy65.atlassian.net/browse/SQ-55)
**Epic:** [SQ-39](https://upexgalaxy65.atlassian.net/browse/SQ-39) (Payment Tracking)
**Priority:** Medium
**Story Points:** 8
**Status:** Shift-Left QA

---

## User Story

As a user, I want to record the amount received, so that I can verify against the invoiced total.

---

## Acceptance Criteria

1.
  1. Acceptance Criteria (Gherkin)

1.
  1.
    1. Scenario 1: Record full payment amount

- ***Given:*** I am on the payment recording form for invoice INV-2026-0042 with total $1,500.00
- ***When:*** I enter amount received as 1500.00
- ***Then:*** The system accepts the amount and shows it matches the invoice total
- ***And:*** The amount is displayed with proper currency formatting ($1,500.00)

1.
  1.
    1. Scenario 2: Record partial payment amount

- ***Given:*** I am recording a payment for an invoice with total $2,000.00
- ***When:*** I enter amount received as 1000.00
- ***Then:*** The system accepts the partial amount
- ***And:*** Shows a warning that the amount received ($1,000.00) is less than the invoice total ($2,000.00)
- ***And:*** Allows me to proceed with the partial payment

1.
  1.
    1. Scenario 3: Record overpayment amount

- ***Given:*** I am recording a payment for an invoice with total $500.00
- ***When:*** I enter amount received as 550.00
- ***Then:*** The system accepts the overpayment
- ***And:*** Shows a notice that the amount received ($550.00) exceeds the invoice total ($500.00)

1.
  1.
    1. Scenario 4: Validate required amount field

- ***Given:*** I am on the payment recording form
- ***When:*** I try to submit without entering an amount
- ***Then:*** The system shows a validation error "Amount received is required"
- ***And:*** The form is not submitted

1.
  1.
    1. Scenario 5: Validate positive amount

- ***Given:*** I am on the payment recording form
- ***When:*** I enter a negative amount (-100)
- ***Then:*** The system shows a validation error "Amount must be greater than 0"

1.
  1.
    1. Scenario 6: Validate numeric input

- ***Given:*** I am on the payment recording form
- ***When:*** I enter non-numeric characters ("abc")
- ***Then:*** The system prevents non-numeric input or shows validation error

1.
  1.
    1. Scenario 7: Amount field pre-filled with invoice total

- ***Given:*** I open the payment recording form for invoice with total $750.00
- ***When:*** The form loads
- ***Then:*** The amount field is pre-filled with 750.00
- ***And:*** I can modify the amount if needed

---

## Scope

1.
  1. Scope

1.
  1.
    1. In Scope

- Amount input field with numeric validation
- Pre-fill with invoice total amount
- Support decimal values (2 decimal places)
- Currency formatting display
- Validation for required, positive, numeric values
- Visual feedback for partial/full/over payments
- Integration with payment recording form

1.
  1.
    1. Out of Scope

- Multiple partial payments tracking (single payment per marking paid)
- Currency conversion
- Automatic reconciliation with bank statements
- Payment plans or installments

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 2026-01-21T01:09:36.510Z
- **Updated:** 2026-03-29T01:22:14.172Z
- **Reporter:** Ely
- **Assignee:** Fernando Javier Masci

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-29T01:22:25.075Z_
