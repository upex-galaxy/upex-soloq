# As a user, I want the PDF to include my logo and business data to project professionalism

**Jira Key:** UPD-33
**Epic:** UPD-31 (PDF Generation & Download)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** ensure my business logo and contact information are included in the generated PDF invoices
**So that** my invoices look professional, reinforce my brand, and provide clients with my contact details.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- The generated PDF will prominently display the user's uploaded logo (if available) in the header.
- The PDF will also include the business name, contact email, phone, address, and tax ID (if provided) from the user's business profile.
- The layout of these elements in the PDF header/footer will be clean and professional.

### Out of Scope

- Responsive design for the PDF layout (PDFs are generally fixed-layout).
- Different positions or sizes for the logo based on user preference.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: PDF includes logo and business data

- **Given:** I have configured my business profile with a logo, name, email, phone, address, and tax ID.
- **When:** I generate a PDF for any invoice.
- **Then:** The PDF header clearly shows my business logo.
- **And:** My business name, contact email, phone, address, and tax ID are present and correctly formatted in the PDF.

### Scenario 2: PDF generated when no logo is uploaded

- **Given:** I have not uploaded a business logo in my profile.
- **When:** I generate a PDF for an invoice.
- **Then:** The PDF is generated successfully.
- **And:** The space where the logo would be is either empty or gracefully handled, and my business text data is still present.

---

## Technical Notes

### Frontend

- The React component used for PDF rendering (from UPD-32) must be designed to fetch and display the logo and business profile data.
- It needs to handle cases where the logo URL is `null` or invalid.

### Backend

- The API endpoint responsible for PDF generation (`GET /api/invoices/[invoiceId]/pdf`) must fetch the `business_profiles` data associated with the authenticated user.
- It will pass this data, including the `logo_url`, to the `@react-pdf/renderer` component.

### Database

- Queries to `business_profiles` table to retrieve data.
- Access to Supabase Storage for the logo image.

---

## Dependencies

### Blocked By

- UPD-32 (Generate PDF with professional design)
- UPD-9 (Upload Logo)
- UPD-8 (Configure Business Name)
- UPD-10 (Add Contact Details)
- UPD-11 (Configure Tax Details)

### Blocks

- A key part of projecting professionalism.

---

## Definition of Done

- [ ] PDF rendering logic is updated to include business logo and data.
- [ ] The generated PDF correctly displays the logo and business details.
- [ ] E2E tests verify the presence and correct formatting of these elements in the PDF.
- [ ] All acceptance criteria are met.
