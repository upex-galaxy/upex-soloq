# Configure Business Name

**Jira Key:** [SQ-8](https://upexgalaxy64.atlassian.net/browse/SQ-8)
**Epic:** [SQ-7](https://upexgalaxy64.atlassian.net/browse/SQ-7) (Business Profile Management)
**Priority:** High
**Story Points:** 2
**Status:** Backlog
**Assignee:** Unassigned

---

## User Story

**As a** user
**I want to** configure my business name
**So that** it appears on my invoices

---

## Description

Como freelancer que usa SoloQ, necesito poder configurar el nombre de mi negocio o marca personal para que aparezca en todas las facturas que genere. Este es un campo fundamental que da identidad profesional a mis documentos de facturación.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Set business name for the first time

- **Given:** I am on the business profile settings page
- **When:** I enter my business name and click save
- **Then:** My business name is saved and displayed in the profile

### Scenario 2: Update business name

- **Given:** I have a business name configured
- **When:** I edit and save a new business name
- **Then:** The new name replaces the old one and appears on new invoices

### Scenario 3: Business name appears on invoice

- **Given:** I have configured my business name
- **When:** I create a new invoice
- **Then:** My business name appears prominently on the invoice header

### Scenario 4: Validate business name length

- **Given:** I am entering my business name
- **When:** I try to enter more than 100 characters
- **Then:** I see a validation error indicating the maximum length

### Scenario 5: Business name is required for invoicing

- **Given:** I have not configured a business name
- **When:** I try to create an invoice
- **Then:** I am redirected to complete my business profile first

---

## Technical Notes

### Frontend

- Form field: Text input with max 100 characters
- Real-time character counter
- Component: `BusinessNameForm` or part of `BusinessProfileForm`
- Route: `/settings/profile` or `/onboarding` (step 1)

### Backend

- API: `PUT /api/profile`
- Field: `business_name` (required, varchar(100))
- Validation: Not empty, max 100 chars, trimmed

### Database

- Table: `business_profiles`
- Column: `business_name VARCHAR(100) NOT NULL`

---

## Dependencies

### Blocked By

- SQ-6 (Guided Onboarding) - this is step 1 of onboarding

### Blocks

- All invoice creation features

### Related Stories

- SQ-6: Guided Onboarding (configures during onboarding)
- All EPIC 4 stories (Invoice Creation)

---

## UI/UX Considerations

- Clean text input with label "Business Name" or "Nombre de Negocio"
- Helper text: "This will appear on your invoices"
- Character counter showing X/100
- Save button with loading state
- Success toast on save

---

## Definition of Done

- [ ] Business name form field implemented
- [ ] Validation for required and max length
- [ ] API endpoint working
- [ ] Data persists correctly
- [ ] Name appears on invoice preview
- [ ] Unit tests > 80% coverage
- [ ] Integration tests for API
- [ ] Code review approved (2 reviewers)
- [ ] Deployed to staging
- [ ] QA testing passed

---

## Testing Strategy

See: `test-cases.md` (Fase 5)

**Test Cases Expected:** 5+ detailed test cases covering:

- Set name for first time
- Update existing name
- Validation errors
- Display on invoice

---

## Implementation Plan

See: `implementation-plan.md` (Fase 6)

**Implementation Steps Expected:**

1. Create/update BusinessProfileForm component
2. Add business_name field with validation
3. Create/update API route
4. Integrate with database
5. Add to onboarding flow
6. Write tests

---

## Notes

- Consider auto-capitalizing first letter of each word
- Placeholder could suggest format: "John's Design Studio"

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-7-business-profile/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-007)
