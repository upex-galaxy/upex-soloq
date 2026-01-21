# Include Attached PDF in Email

**Jira Key:** [SQ-43](https://upexgalaxy64.atlassian.net/browse/SQ-43)
**Epic:** [SQ-37](https://upexgalaxy64.atlassian.net/browse/SQ-37) (Invoice Sending)
**Priority:** High
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** user
**I want to** have the email include the attached PDF
**So that** the client has the invoice

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: PDF attachment

- **Given:** I send an invoice
- **When:** The client receives the email
- **Then:** The email has the invoice PDF attached

### Scenario 2: Attachment name

- **Given:** The client receives the email
- **When:** They view the attachment
- **Then:** The file is named Invoice-{number}.pdf

### Scenario 3: Attachment size

- **Given:** I send an invoice with a logo
- **When:** The PDF is attached
- **Then:** The file size is reasonable (< 5MB)

### Scenario 4: Attachment opens correctly

- **Given:** The client downloads the attachment
- **When:** They open the PDF
- **Then:** It displays correctly with all data

---

## Technical Notes

- Generate PDF server-side or client-side before sending
- Attach as base64 or buffer to email
- Optimize images to keep file size down
- Use proper MIME type: application/pdf

---

## Definition of Done

- [ ] PDF attachment working
- [ ] Correct file naming
- [ ] File size optimized
- [ ] PDF opens correctly
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-37-invoice-sending/epic.md`
- **Related:** SQ-32 (Generate PDF)
