# As a user, I want to upload my logo to customize my invoices

**Jira Key:** UPD-9
**Epic:** UPD-7 (Business Profile Management)
**Priority:** Medium
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** upload my business logo
**So that** my invoices look more professional and are aligned with my brand.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A file upload component in the "Business Profile" settings page.
- The component should accept common image formats (PNG, JPG, WEBP).
- File size limit of 2MB.
- A preview of the currently uploaded logo.
- A button to remove the existing logo.
- The uploaded logo should appear on all invoice previews and generated PDFs.

### Out of Scope

- In-app image editing (cropping, resizing).
- Support for vector formats like SVG in the MVP.
- Storing a history of previous logos.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: User uploads a valid logo

- **Given:** I am on the "Business Profile" settings page.
- **When:** I select a valid image file (e.g., `my_logo.png`, < 2MB).
- **And:** The upload completes.
- **Then:** A preview of my logo is displayed on the settings page.
- **And:** When I create or view an invoice, my logo is visible.

### Scenario 2: User tries to upload an invalid file type

- **Given:** I am on the "Business Profile" settings page.
- **When:** I attempt to select a non-image file (e.g., `document.pdf`).
- **Then:** The file selection dialog filters out the invalid file, or if selected, an error message "Invalid file type. Please use PNG, JPG, or WEBP." is shown.

### Scenario 3: User tries to upload a file that is too large

- **Given:** I am on the "Business Profile" settings page.
- **When:** I select an image file that is larger than 2MB.
- **Then:** An error message "File is too large. Maximum size is 2MB." is displayed.

### Scenario 4: User removes an existing logo

- **Given:** I have already uploaded a logo and it is visible in my settings.
- **When:** I click the "Remove Logo" button.
- **Then:** The logo preview disappears.
- **And:** The logo is no longer displayed on any new or existing invoices.

---

## Technical Notes

### Frontend

- Use a library like `react-dropzone` for a user-friendly file upload experience.
- Implement client-side checks for file type and size before uploading.
- On successful upload, display the image using its public URL from Supabase Storage.
- The component will call the `POST /api/profile/logo` endpoint.

### Backend

- The `POST /api/profile/logo` endpoint receives the image file.
- It will use the Supabase client to upload the file to the `logos` bucket in Supabase Storage.
- The file should be stored under a path associated with the user's ID to prevent conflicts (e.g., `user_id/logo.png`).
- After uploading, the public URL is saved to the `logo_url` field in the user's `business_profiles` record.

### Database

- `business_profiles.logo_url` (string) will be updated.
- `storage.objects` will contain the image file in the `logos` bucket.

---

## Dependencies

### Blocked By

- UPD-8 (Configure Business Name) - The UI for the profile page.

### Blocks

- A key part of the professional look for invoices and PDFs.

---

## Definition of Done

- [ ] File upload component is implemented and functional.
- [ ] Backend API handles file upload, storage, and database update correctly.
- [ ] E2E test for uploading, viewing, and removing a logo is passing.
- [ ] The logo appears correctly on generated PDF invoices.
- [ ] All acceptance criteria are met.
