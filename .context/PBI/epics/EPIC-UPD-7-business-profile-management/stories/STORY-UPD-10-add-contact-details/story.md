# As a user, I want to add my contact details so my clients can contact me

**Jira Key:** UPD-10
**Epic:** UPD-7 (Business Profile Management)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** add my contact details (email, phone, address) to my profile
**So that** this information is automatically included in my invoices for my clients' reference.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Input fields for "Contact Email", "Contact Phone", and "Address" on the "Business Profile" settings page.
- "Contact Email" is a required field. Phone and Address are optional.
- Saving the form updates the corresponding fields in the `business_profiles` table.
- The contact information must appear in the header or footer of the generated invoice PDF.

### Out of Scope

- Validating the address against a postal service API.
- Adding multiple email addresses, phone numbers, or addresses.
- Clickable `mailto:` or `tel:` links within the PDF (though this may be a "nice to have" if the PDF renderer supports it easily).

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: User fills in all contact details

- **Given:** I am on the "Business Profile" settings page.
- **When:** I enter a valid email in "Contact Email", a number in "Contact Phone", and my physical address in "Address".
- **And:** I click "Save".
- **Then:** I see a success message.
- **And:** When I preview an invoice, all my contact details are correctly displayed.

### Scenario 2: User provides only the required contact detail

- **Given:** I am on the "Business Profile" settings page.
- **When:** I enter a valid email in "Contact Email" and leave the other contact fields blank.
- **And:** I click "Save".
- **Then:** The profile is saved successfully.
- **And:** The generated invoice PDF displays my contact email but not the phone or address sections.

### Scenario 3: User tries to save with an invalid email

- **Given:** I am on the "Business Profile" settings page.
- **When:** I enter "not-an-email" in the "Contact Email" field.
- **And:** I click "Save".
- **Then:** I see an error message: "Please enter a valid email address."
- **And:** The profile is not saved.

---

## Technical Notes

### Frontend

- Add `contactEmail`, `contactPhone`, and `address` (textarea) fields to the business profile form.
- Update the `zod` schema to include validation for these new fields (email format, required for email).
- The form will submit a `PUT` request to `/api/profile/business`.

### Backend

- The `PUT /api/profile/business` endpoint will validate and save the new fields.
- RLS policies on `business_profiles` will ensure data security.

### Database

- The following fields will be updated in the `business_profiles` table:
  - `contact_email` (string)
  - `contact_phone` (string, nullable)
  - `address` (text, nullable)

---

## Dependencies

### Blocked By

- UPD-8 (Configure Business Name) - Relies on the same settings page and form.

### Blocks

- A complete invoice that provides clients with necessary contact information.

---

## Definition of Done

- [ ] Frontend form includes the new fields with correct validation.
- [ ] Backend API correctly handles the new fields.
- [ ] E2E test for updating contact details and verifying them on an invoice PDF is passing.
- [ ] All acceptance criteria are met.
