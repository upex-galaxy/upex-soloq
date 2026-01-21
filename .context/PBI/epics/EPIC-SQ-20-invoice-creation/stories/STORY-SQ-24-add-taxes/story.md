# Add Taxes to Invoice

**Jira Key:** [SQ-24](https://upexgalaxy64.atlassian.net/browse/SQ-24)
**Epic:** [SQ-20](https://upexgalaxy64.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** High
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** add taxes (VAT/percentage)
**So that** I can comply with tax requirements

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Add tax percentage

- **Given:** I am creating an invoice
- **When:** I enter a tax percentage (e.g., 16%)
- **Then:** The tax amount is calculated on the subtotal

### Scenario 2: Tax amount display

- **Given:** I have added tax
- **When:** I view the invoice summary
- **Then:** I see the tax rate and calculated amount

### Scenario 3: Zero tax

- **Given:** I don't need to charge tax
- **When:** I leave tax at 0%
- **Then:** No tax is added to the total

### Scenario 4: Common tax presets

- **Given:** I am adding tax
- **When:** I click on tax field
- **Then:** I see common presets (0%, 8%, 16%, 19%, 21%)

---

## Technical Notes

- tax_amount = subtotal × (tax_rate / 100)
- Store both tax_rate and tax_amount
- Common LATAM rates: 16% (Mexico), 19% (Colombia), 21% (Argentina)
- Tax label configurable (IVA, VAT, etc.)

---

## Definition of Done

- [ ] Tax input field implemented
- [ ] Tax calculation working
- [ ] Tax presets available
- [ ] Tax display in summary working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/epic.md`
