# As a Pro user, I want to choose between different invoice templates to personalize my style

**Jira Key:** UPD-36
**Epic:** UPD-31 (PDF Generation & Download)
**Priority:** Pro Feature
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Pro user
**I want to** select from a gallery of different professional invoice templates
**So that** I can personalize the visual style of my invoices to better match my brand or preference.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A "Templates" section in the user's settings or invoice creation flow.
- This section will display a gallery of 3-5 pre-designed professional PDF templates.
- A Pro user can select and apply a template to their account.
- The chosen template will be used for all subsequent PDF generations.
- This feature is gated behind a Pro subscription.

### Out of Scope

- A visual editor to create or customize templates from scratch.
- Uploading custom templates.
- Templates for different parts of the invoice (e.g., separate header/footer templates).

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Pro user selects a different template

- **Given:** I am a Pro user.
- **When:** I navigate to the "Templates" section.
- **And:** I select "Modern Minimal" from the available templates.
- **Then:** My invoices are now generated using the "Modern Minimal" template.
- **And:** The visual style of the generated PDF reflects the chosen template.

### Scenario 2: Free user tries to access Pro templates

- **Given:** I am a Free user.
- **When:** I navigate to the "Templates" section.
- **Then:** I see the available templates.
- **And:** I see a clear indication that "Template selection is a Pro feature" or that other templates are "Pro Only".
- **And:** I cannot select any template other than the default one.

### Scenario 3: Preview of a selected template

- **Given:** I am a Pro user and have selected a specific template.
- **When:** I create or edit an invoice and go to the preview.
- **Then:** The invoice preview reflects the design of my chosen template.

---

## Technical Notes

### Frontend

- A new UI section for template selection.
- This section will display thumbnails or previews of available templates.
- The selected template ID will be saved to the user's `business_profiles` or `profiles` table.
- A check on the user's subscription status will gate the feature.

### Backend

- The API endpoint for PDF generation will need to accept a `templateId` parameter or fetch it from the user's profile.
- `@react-pdf/renderer` components will need to be structured to accept different template configurations or render different top-level template components based on the `templateId`.

### Database

- A new column `preferred_invoice_template` (string, nullable) in `business_profiles` or `profiles` table to store the ID of the selected template.

---

## Dependencies

### Blocked By

- UPD-32 (Generate PDF with professional design) - Needs PDF generation to exist first.
- EPIC-SOLOQ-010 (Subscription Management) - To identify Pro users.

### Blocks

- None. This is an enhancing Pro feature.

---

## Definition of Done

- [ ] Multiple PDF templates are defined and renderable by `@react-pdf/renderer`.
- [ ] UI for selecting templates is implemented and gated for Pro users.
- [ ] Backend logic correctly fetches and applies the chosen template.
- [ ] E2E tests for Pro user template selection and Free user restrictions are passing.
- [ ] All acceptance criteria are met.
