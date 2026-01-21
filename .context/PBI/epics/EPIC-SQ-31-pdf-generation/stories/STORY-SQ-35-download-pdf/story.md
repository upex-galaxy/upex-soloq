# Download PDF to Device

**Jira Key:** [SQ-35](https://upexgalaxy64.atlassian.net/browse/SQ-35)
**Epic:** [SQ-31](https://upexgalaxy64.atlassian.net/browse/SQ-31) (PDF Generation)
**Priority:** High
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** download the PDF to my device
**So that** I can save it or send it manually

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Download button

- **Given:** I am viewing an invoice
- **When:** I click "Download PDF"
- **Then:** The PDF downloads to my device

### Scenario 2: File name

- **Given:** I download a PDF
- **When:** I check the file name
- **Then:** It follows format: Invoice-{number}-{client}.pdf

### Scenario 3: Download from preview

- **Given:** I am previewing an invoice
- **When:** I click download
- **Then:** The PDF downloads immediately

### Scenario 4: Download from list

- **Given:** I am on the invoices list
- **When:** I click the download icon on an invoice row
- **Then:** The PDF downloads without opening preview

### Scenario 5: Mobile download

- **Given:** I am on a mobile device
- **When:** I click download
- **Then:** The PDF downloads or opens in browser viewer

---

## Technical Notes

- Use file-saver or browser download API
- File naming: Invoice-{invoice_number}-{client_name}.pdf
- Sanitize client name for file system
- Handle mobile browser differences

---

## Definition of Done

- [ ] Download functionality working
- [ ] Correct file naming
- [ ] Download from preview working
- [ ] Quick download from list working
- [ ] Mobile compatibility verified
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/epic.md`
