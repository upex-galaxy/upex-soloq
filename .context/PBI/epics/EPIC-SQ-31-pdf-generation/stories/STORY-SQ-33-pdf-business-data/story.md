# Include Logo and Business Data in PDF

**Jira Key:** [SQ-33](https://upexgalaxy64.atlassian.net/browse/SQ-33)
**Epic:** [SQ-31](https://upexgalaxy64.atlassian.net/browse/SQ-31) (PDF Generation)
**Priority:** High
**Story Points:** 3
**Status:** Backlog

---

## User Story

**As a** user
**I want to** have the PDF include my logo and business data
**So that** I project professionalism

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Logo display

- **Given:** I have uploaded a logo
- **When:** I view the PDF
- **Then:** My logo appears in the header

### Scenario 2: Business name

- **Given:** I have configured my business name
- **When:** I view the PDF
- **Then:** My business name appears prominently

### Scenario 3: Contact information

- **Given:** I have configured my contact info
- **When:** I view the PDF
- **Then:** My email, phone, and address appear

### Scenario 4: Tax ID

- **Given:** I have configured my tax ID
- **When:** I view the PDF
- **Then:** My tax ID (RFC/NIT/CUIT) appears

### Scenario 5: No logo fallback

- **Given:** I haven't uploaded a logo
- **When:** I view the PDF
- **Then:** The layout adjusts gracefully without a logo

---

## Technical Notes

- Logo: max dimensions, proper scaling
- Business data from business_profiles table
- Fallback layout when logo is missing
- Logo format: PNG, JPG (with transparency support)

---

## Definition of Done

- [ ] Logo rendering working
- [ ] Business name displayed
- [ ] Contact info displayed
- [ ] Tax ID displayed
- [ ] No-logo fallback working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/epic.md`
