# Add Contact Information

**Jira Key:** [SQ-10](https://upexgalaxy64.atlassian.net/browse/SQ-10)
**Epic:** [SQ-7](https://upexgalaxy64.atlassian.net/browse/SQ-7) (Business Profile Management)
**Priority:** High
**Story Points:** 2
**Status:** Backlog
**Assignee:** Unassigned

---

## User Story

**As a** user
**I want to** add my contact information
**So that** my clients can contact me

---

## Description

Como freelancer, necesito agregar mi información de contacto (email, teléfono, dirección) a mi perfil de negocio para que aparezca en mis facturas. Esto facilita que mis clientes puedan comunicarse conmigo para cualquier consulta sobre el trabajo o el pago.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Add contact email

- **Given:** I am on the business profile settings page
- **When:** I enter my business contact email
- **Then:** The email is validated (format) and saved

### Scenario 2: Add phone number

- **Given:** I am on the business profile settings page
- **When:** I enter my phone number with country code
- **Then:** The phone is validated and saved

### Scenario 3: Add business address

- **Given:** I am on the business profile settings page
- **When:** I enter my business address (street, city, state, postal code, country)
- **Then:** The address is saved

### Scenario 4: Contact info appears on invoice

- **Given:** I have configured my contact information
- **When:** I generate an invoice
- **Then:** My contact details appear on the invoice

### Scenario 5: Update contact information

- **Given:** I have existing contact information
- **When:** I edit and save new information
- **Then:** The new information replaces the old one

---

## Technical Notes

### Frontend

- Form fields:
  - Contact Email (required): Email input with validation
  - Phone (optional): Phone input with country code selector
  - Address fields (optional): Street, City, State, Postal Code, Country dropdown
- Component: `ContactInfoForm` or part of `BusinessProfileForm`
- Route: `/settings/profile` or `/onboarding` (step 2)

### Backend

- API: `PUT /api/profile`
- Fields in `business_profiles`:
  - `contact_email` (required, valid email)
  - `contact_phone` (optional, with country code)
  - `address_street` (optional)
  - `address_city` (optional)
  - `address_state` (optional)
  - `address_postal_code` (optional)
  - `address_country` (optional, ISO 3166-1 alpha-2)

### Validation

```typescript
const contactInfoSchema = z.object({
  contact_email: z.string().email('Invalid email format'),
  contact_phone: z
    .string()
    .optional()
    .refine(
      val => !val || /^\+[1-9]\d{1,14}$/.test(val),
      'Phone must include country code (e.g., +52...)'
    ),
  address_street: z.string().max(200).optional(),
  address_city: z.string().max(100).optional(),
  address_state: z.string().max(100).optional(),
  address_postal_code: z.string().max(20).optional(),
  address_country: z.string().length(2).optional(), // ISO code
});
```

---

## Dependencies

### Blocked By

- SQ-8 (Configure Business Name) - profile must exist first

### Blocks

- EPIC 4 & 5 (Invoice Creation & PDF) - needs contact info for invoices

### Related Stories

- SQ-6: Guided Onboarding (step 2)
- All invoice-related stories

---

## UI/UX Considerations

- Email field pre-filled with account email (editable)
- Phone input with country code dropdown (default based on locale)
- Collapsible address section (optional fields)
- Country dropdown with LATAM countries first
- Clear labels in Spanish/English

---

## Definition of Done

- [ ] Contact email field implemented and validated
- [ ] Phone field with country code implemented
- [ ] Address fields implemented
- [ ] API endpoint working
- [ ] Data persists correctly
- [ ] Info appears on invoice preview
- [ ] Unit tests > 80% coverage
- [ ] Integration tests for API
- [ ] Code review approved (2 reviewers)
- [ ] Deployed to staging
- [ ] QA testing passed

---

## Testing Strategy

See: `test-cases.md` (Fase 5)

**Test Cases Expected:** 6+ detailed test cases covering:

- Add valid email
- Invalid email validation
- Add phone with country code
- Add full address
- Update existing info
- Display on invoice

---

## Implementation Plan

See: `implementation-plan.md` (Fase 6)

**Implementation Steps Expected:**

1. Create ContactInfoForm component
2. Add email field with validation
3. Add phone input with country code selector
4. Add address fields (collapsible)
5. Create/update API route
6. Integrate with database
7. Add to onboarding flow
8. Write tests

---

## Notes

- Contact email can be different from account email
- Consider address autocomplete (Google Places API) in v2
- Phone format: E.164 standard (+[country][number])

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-7-business-profile/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-007)
