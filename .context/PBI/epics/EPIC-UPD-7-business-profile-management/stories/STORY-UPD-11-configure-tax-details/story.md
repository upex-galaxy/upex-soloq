# As a user, I want to configure my tax details (RFC/NIT/CUIT) to appear on my invoices

**Jira Key:** UPD-11
**Epic:** UPD-7 (Business Profile Management)
**Priority:** Should Have
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer in LATAM
**I want to** add my tax identification number (like RFC, NIT, CUIT) to my profile
**So that** it is included in my invoices to comply with local business practices and requirements.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- An optional input field for "Tax ID" on the "Business Profile" settings page.
- The label should be generic enough (e.g., "Tax ID / RFC / NIT / CUIT") to be understood across LATAM.
- The saved Tax ID should be displayed on the generated invoice PDF, usually near the freelancer's name and address.

### Out of Scope

- Validation of the Tax ID format against specific country rules (e.g., checksum validation).
- Integration with any government tax authority (this is for display purposes only).
- Automatically adding taxes based on the Tax ID.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: User adds their Tax ID

- **Given:** I am on the "Business Profile" settings page.
- **When:** I enter my Tax ID, for example, "MEMC890101ABC", into the "Tax ID" field.
- **And:** I click "Save".
- **Then:** My profile is updated successfully.
- **And:** When I preview a new invoice, my Tax ID "MEMC890101ABC" is clearly visible.

### Scenario 2: User leaves the Tax ID field blank

- **Given:** I am on the "Business Profile" settings page.
- **When:** I leave the "Tax ID" field blank and save my profile.
- **Then:** The profile is saved successfully.
- **And:** The Tax ID section does not appear on my invoices.

### Scenario 3: User edits their Tax ID

- **Given:** My currently saved Tax ID is "OLDTAXID123".
- **When:** I change the value in the "Tax ID" field to "NEWTAXID456".
- **And:** I click "Save".
- **Then:** My profile is updated with the new Tax ID.
- **And:** All future invoices will display "NEWTAXID456".

---

## Technical Notes

### Frontend

- Add an optional `taxId` text input field to the business profile form.
- Add helper text to the field to give examples (e.g., "e.g., RFC, NIT, CUIT").
- Update the `zod` schema to include the optional `taxId` string.

### Backend

- The `PUT /api/profile/business` endpoint will handle saving the optional `taxId` field.

### Database

- The `business_profiles.tax_id` (string, nullable) field will be updated.

---

## Dependencies

### Blocked By

- UPD-8 (Configure Business Name) - Part of the same settings form.

### Blocks

- Formal invoicing for clients who require a Tax ID on the document.

---

## Definition of Done

- [ ] Frontend form includes the optional Tax ID field.
- [ ] Backend API correctly handles the new field.
- [ ] E2E test for adding/editing a Tax ID and verifying it on an invoice PDF is passing.
- [ ] All acceptance criteria are met.
