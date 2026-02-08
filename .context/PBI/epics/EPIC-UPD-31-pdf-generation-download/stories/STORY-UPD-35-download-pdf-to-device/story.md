# As a user, I want to download the PDF to my device to save it or send it manually

**Jira Key:** UPD-35
**Epic:** UPD-31 (PDF Generation & Download)
**Priority:** High
**Story Points:** 1
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** freelancer
**I want to** download the generated invoice PDF to my computer or mobile device
**So that** I can save it for my records or send it manually to my clients via other channels.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A "Download PDF" button available on the invoice detail page or after successful invoice creation/update.
- Clicking this button will trigger a file download in the user's browser.
- The downloaded file should have a clear and descriptive name (e.g., "Invoice-INV-2026-0042-ClientName.pdf").

### Out of Scope

- Options to specify the download location or file name beyond the default.
- Downloading multiple PDFs at once.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Successfully download an invoice PDF

- **Given:** I am on the details page of a completed invoice.
- **When:** I click the "Download PDF" button.
- **Then:** My browser initiates a download of the invoice as a PDF file.
- **And:** The downloaded file is named appropriately (e.g., "Invoice-INV-2026-0042-ClientName.pdf").

### Scenario 2: Downloaded PDF is valid and viewable

- **Given:** I have downloaded an invoice PDF.
- **When:** I open the downloaded file with a PDF viewer.
- **Then:** The PDF opens correctly and displays the full content of my invoice without errors.

---

## Technical Notes

### Frontend

- The "Download PDF" button will make a request to the `GET /api/invoices/[invoiceId]/pdf` endpoint.
- The browser will handle the download automatically due to the `Content-Disposition` header set by the backend.
- The button should indicate loading state while the PDF is being generated/fetched.

### Backend

- The `GET /api/invoices/[invoiceId]/pdf` endpoint (from UPD-32) will be leveraged directly.
- Ensure the `Content-Disposition` header in the response is set to `attachment` and includes a dynamic `filename`.

---

## Dependencies

### Blocked By

- UPD-32 (Generate PDF with professional design)

### Blocks

- Provides flexibility to the user for local archival and manual distribution.

---

## Definition of Done

- [ ] "Download PDF" button is implemented and functional.
- [ ] The downloaded file has a user-friendly name.
- [ ] E2E tests verify the download action and file validity.
- [ ] All acceptance criteria are met.
