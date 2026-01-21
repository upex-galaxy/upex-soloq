# Configure Tax ID (RFC/NIT/CUIT)

**Jira Key:** [SQ-11](https://upexgalaxy64.atlassian.net/browse/SQ-11)
**Epic:** [SQ-7](https://upexgalaxy64.atlassian.net/browse/SQ-7) (Business Profile Management)
**Priority:** High
**Story Points:** 3
**Status:** Backlog
**Assignee:** Unassigned

---

## User Story

**As a** user
**I want to** configure my tax ID (RFC/NIT/CUIT)
**So that** it appears on my invoices

---

## Description

Como freelancer en LATAM, necesito poder configurar mi identificación fiscal (RFC en México, NIT en Colombia, CUIT en Argentina, etc.) para que aparezca en mis facturas. Esto es importante para la formalidad fiscal y para que mis clientes puedan deducir gastos.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Configure tax ID for Mexico (RFC)

- **Given:** I am on the business profile settings and my country is Mexico
- **When:** I enter my RFC
- **Then:** The RFC format is validated (13 characters for personas físicas, 12 for morales)

### Scenario 2: Configure tax ID for Colombia (NIT)

- **Given:** I am on the business profile settings and my country is Colombia
- **When:** I enter my NIT
- **Then:** The NIT format is validated (9 digits + verification digit)

### Scenario 3: Configure tax ID for Argentina (CUIT)

- **Given:** I am on the business profile settings and my country is Argentina
- **When:** I enter my CUIT
- **Then:** The CUIT format is validated (11 digits with format XX-XXXXXXXX-X)

### Scenario 4: Tax ID appears on invoice

- **Given:** I have configured my tax ID
- **When:** I generate an invoice
- **Then:** My tax ID appears with the correct label (RFC, NIT, CUIT, etc.)

### Scenario 5: Skip tax ID configuration

- **Given:** I don't have a formal tax registration
- **When:** I leave the tax ID field empty
- **Then:** I can still create invoices (tax ID section omitted)

### Scenario 6: Dynamic label based on country

- **Given:** I am configuring my tax ID
- **When:** I select my country
- **Then:** The label changes to the appropriate term (RFC for MX, NIT for CO, etc.)

---

## Technical Notes

### Frontend

- Form fields:
  - Country selector (determines tax ID type)
  - Tax ID input (with dynamic validation)
- Dynamic label based on country
- Component: `TaxIdForm` or part of `BusinessProfileForm`
- Route: `/settings/profile`

### Backend

- API: `PUT /api/profile`
- Fields in `business_profiles`:
  - `tax_id` (optional, varchar(20))
  - `tax_id_type` (optional, enum: RFC, NIT, CUIT, RUT, RUC, etc.)

### Tax ID Validation by Country

```typescript
const taxIdValidators: Record<string, RegExp> = {
  // Mexico - RFC
  MX: /^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/,
  // Colombia - NIT
  CO: /^\d{9}-\d$/,
  // Argentina - CUIT
  AR: /^\d{2}-\d{8}-\d$/,
  // Chile - RUT
  CL: /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
  // Peru - RUC
  PE: /^\d{11}$/,
};

const taxIdLabels: Record<string, string> = {
  MX: 'RFC',
  CO: 'NIT',
  AR: 'CUIT',
  CL: 'RUT',
  PE: 'RUC',
};
```

### Database

- `business_profiles.tax_id` VARCHAR(20)
- `business_profiles.tax_id_type` VARCHAR(10)

---

## Dependencies

### Blocked By

- SQ-10 (Contact Info) - country selection may be done there

### Blocks

- EPIC 5 (PDF Generation) - displays tax ID on invoice

### Related Stories

- SQ-10: Contact Info (country selection)
- All invoice-related stories

---

## UI/UX Considerations

- Country selector updates tax ID label dynamically
- Input mask/formatting based on country
- Helper text showing expected format
- "I don't have a tax ID" checkbox option
- Validation errors specific to format

---

## Definition of Done

- [ ] Tax ID form field implemented
- [ ] Dynamic label based on country
- [ ] Validation per country working
- [ ] API endpoint working
- [ ] Data persists correctly
- [ ] Tax ID appears on invoice with label
- [ ] Skip option working
- [ ] Unit tests > 80% coverage
- [ ] Integration tests for API
- [ ] Code review approved (2 reviewers)
- [ ] Deployed to staging
- [ ] QA testing passed

---

## Testing Strategy

See: `test-cases.md` (Fase 5)

**Test Cases Expected:** 8+ detailed test cases covering:

- Valid RFC (Mexico)
- Valid NIT (Colombia)
- Valid CUIT (Argentina)
- Invalid format rejection
- Skip tax ID
- Display on invoice

---

## Implementation Plan

See: `implementation-plan.md` (Fase 6)

**Implementation Steps Expected:**

1. Create TaxIdForm component
2. Add country selector (or integrate with Contact Info)
3. Implement dynamic label logic
4. Create validation regex per country
5. Create/update API route
6. Integrate with database
7. Update invoice templates to show tax ID
8. Write tests

---

## Notes

- Some freelancers operate informally without tax registration
- Tax ID format varies significantly by country
- Consider adding "verify tax ID" API integration in v2
- Format helpers: auto-add dashes for CUIT/NIT

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-7-business-profile/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-007)
