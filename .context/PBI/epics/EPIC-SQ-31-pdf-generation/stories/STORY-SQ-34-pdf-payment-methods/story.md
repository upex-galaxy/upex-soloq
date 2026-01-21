# Include Payment Methods in PDF

**Jira Key:** [SQ-34](https://upexgalaxy64.atlassian.net/browse/SQ-34)
**Epic:** [SQ-31](https://upexgalaxy64.atlassian.net/browse/SQ-31) (PDF Generation)
**Priority:** High
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** have the PDF include my configured payment methods
**So that** the client knows how to pay me

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Bank transfer details

- **Given:** I have configured bank transfer as payment
- **When:** I view the PDF
- **Then:** I see bank name, account number, and CLABE/routing

### Scenario 2: PayPal email

- **Given:** I have configured PayPal as payment
- **When:** I view the PDF
- **Then:** I see my PayPal email

### Scenario 3: Crypto wallet

- **Given:** I have configured crypto as payment
- **When:** I view the PDF
- **Then:** I see wallet address and currency type

### Scenario 4: Multiple methods

- **Given:** I have multiple payment methods
- **When:** I view the PDF
- **Then:** All methods are listed clearly

### Scenario 5: No payment methods

- **Given:** I haven't configured payment methods
- **When:** I view the PDF
- **Then:** The payment section shows a placeholder or is hidden

---

## Technical Notes

- Payment methods from payment_methods table
- Display only active methods
- Clear labeling for each method type
- Consider QR codes for crypto (future enhancement)

---

## Definition of Done

- [ ] Bank transfer details displayed
- [ ] PayPal details displayed
- [ ] Crypto details displayed
- [ ] Multiple methods handled
- [ ] Empty state handled
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/epic.md`
