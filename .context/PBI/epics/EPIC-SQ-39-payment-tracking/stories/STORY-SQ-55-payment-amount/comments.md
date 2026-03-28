# Comments for SQ-55

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-55)

---

### Fernando Javier Masci - 25/3/2026, 00:30:51

Shift Left:

- Resolver indentación/bullets de los ACs



Acceptance Criteria (Gherkin)

1. Scenario 1: Record full payment amount

- ****Given:**** I am on the payment recording form for invoice INV-2026-0042 with total $1,500.00
- ****When:**** I enter amount received as 1500.00
- ****Then:**** The system accepts the amount and shows it matches the invoice total
- ****And:**** The amount is displayed with proper currency formatting ($1,500.00)
  - Note: revisar reglas de validacion de formato
  - Note2: acepta diferentes currency?

Scenario 2: Record partial payment amount

- ****Given:**** I am recording a payment for an invoice with total $2,000.00
- ****When:**** I enter amount received as 1000.00
- ****Then:**** The system accepts the partial amount
- ****And:**** Shows a warning that the amount received ($1,000.00) is less than the invoice total ($2,000.00)
  - Notes: Hay algun limite en donde el warning sea restrictivo? Es decir impida al user continuar
- ****And:**** Allows me to proceed with the partial payment

Scenario 3: Record overpayment amount

- ****Given:**** I am recording a payment for an invoice with total $500.00
- ****When:**** I enter amount received as 550.00
- ****Then:**** The system accepts the overpayment
- ****And:**** Shows a notice that the amount received ($550.00) exceeds the invoice total ($500.00)
  - Note: es restrictivo o igual le permite continuar?

Scenario 4: Validate required amount field

- ****Given:**** I am on the payment recording form
- ****When:**** I try to submit without entering an amount
- ****Then:**** The system shows a validation error "Amount received is required"
- ****And:**** The form is not submitted
  - Note: Que pasa por formatos invalidos?

Scenario 5: Validate positive amount

- ****Given:**** I am on the payment recording form
- ****When:**** I enter a negative amount (-100)
- ****Then:**** The system shows a validation error "Amount must be greater than 0"
  - Note: admite “ceros” por delante? 01000



1. Scenario 7: Amount field pre-filled with invoice total

- ****Given:**** I open the payment recording form for invoice with total $750.00
- ****When:**** The form loads
- ****Then:**** The amount field is pre-filled with 750.00
- ****And:**** I can modify the amount if needed
  - Note: El pre-filled es siempre por default? Si hay mas de un payment? cual aparece primero? como ordena? por fecha? por monto?

---

### Fernando Javier Masci - 28/3/2026, 18:11:39

# Feature Test Plan - SQ-55

## Objective

Validate amount-received entry against the invoice total with strong coverage for formatting, validation, warnings, and prefill behavior.

## Scope

- Amount field visibility and default state
- Prefill with invoice total
- Numeric, decimal, and currency formatting
- Required, positive, and invalid value validation
- Partial payment, full payment, and overpayment behavior
- Warning/notice messaging and whether it blocks or allows continuation

## Non-Functional Coverage

- Validation feedback timing while typing and on submit
- Formatting consistency across locale/currency display
- Behavior under slow form load or API delay

## Test Dimensions

- UI: field state, helper text, warnings, error messages
- API: payload validation and accepted formats
- DB: amount persistence and relation to invoice totals
- UX: prefill clarity, editability, visual cues for partial/over amounts

## Suggested Scenarios

- Amount field is visible and prefilled when opening the form
- Prefill shows the invoice total using the correct currency format
- User can edit the prefilled amount manually
- Full payment is accepted and shown as matching the invoice total
- Partial payment is accepted and warning is non-blocking unless specified otherwise
- Overpayment is accepted and notice behavior is explicit
- Empty amount is rejected with a required-field error
- Negative values are rejected
- Values with leading zeros are handled consistently
- Non-numeric input is rejected or normalized according to the product rule

## Open Questions

- Are 2 decimals mandatory, optional, or rounded automatically?
- Does the warning block submit or only inform the user?
- What happens with values like `0`, `0.00`, `01000`, or whitespace?

---

*Synced from Jira by jira-sync* *Last sync: 2026-03-28T21:11:54.870Z*

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-28T21:41:11.078Z_
