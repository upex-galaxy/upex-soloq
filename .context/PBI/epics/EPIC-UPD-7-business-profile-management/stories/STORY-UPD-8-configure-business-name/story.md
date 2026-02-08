# As a user, I want to set up my name or business name to appear on my invoices

**Jira Key:** UPD-8
**Epic:** UPD-7 (Business Profile Management)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** configure my name or the name of my business
**So that** it appears correctly as the issuer on all my invoices.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- An input field in the "Settings > Business Profile" page for "Business Name".
- This field is required and cannot be empty.
- Saving the form updates the `business_name` column in the `business_profiles` table.
- The saved name should be used by default in all new invoices.

### Out of Scope

- Managing multiple business names or aliases.
- Displaying a separate "legal name" vs. "trading name".

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: User sets their business name for the first time

- **Given:** I am an authenticated user on the "Business Profile" settings page.
- **And:** The "Business Name" field is empty.
- **When:** I enter "Carlos Design Co." into the "Business Name" field.
- **And:** I click the "Save" button.
- **Then:** I see a success notification: "Profile updated successfully."
- **And:** When I create a new invoice, "Carlos Design Co." is automatically shown as the issuer.

### Scenario 2: User updates an existing business name

- **Given:** I am an authenticated user and my current business name is "Carlos Design Co.".
- **When:** I change the "Business Name" field to "Carlos Méndez - Visual Designer".
- **And:** I click the "Save" button.
- **Then:** My business name is updated in the system.
- **And:** All subsequent invoices I create will use the new name.

### Scenario 3: User tries to save an empty business name

- **Given:** I am on the "Business Profile" settings page.
- **When:** I clear the "Business Name" field, leaving it empty.
- **And:** I click the "Save" button.
- **Then:** I see an error message: "Business Name is required."
- **And:** The profile is not saved.

---

## Technical Notes

### Frontend

- The input field will be part of a larger form managed by `react-hook-form`.
- The validation rule (required) will be defined in a `zod` schema.
- The form will submit a `PUT` request to `/api/profile/business`.

### Backend

- The `PUT /api/profile/business` endpoint will validate the incoming data.
- It will update the `business_name` for the authenticated user's record in the `business_profiles` table.
- RLS policy ensures the user can only update their own profile.

### Database

- `business_profiles.business_name` (string) will be updated.

---

## Dependencies

### Blocked By

- UPD-1 (Authentication Epic)

### Blocks

- The creation of any professional-looking invoice.

---

## Definition of Done

- [ ] Form field and validation implemented on the frontend.
- [ ] Backend API endpoint correctly updates the database.
- [ ] Unit tests for the form validation pass.
- [ ] E2E test for updating the business name and verifying it on a new invoice passes.
- [ ] All acceptance criteria are met.
