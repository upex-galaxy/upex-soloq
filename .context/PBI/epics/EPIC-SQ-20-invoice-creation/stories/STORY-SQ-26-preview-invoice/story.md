# Preview Invoice Before Sending

**Jira Key:** [SQ-26](https://upexgalaxy64.atlassian.net/browse/SQ-26)
**Epic:** [SQ-20](https://upexgalaxy64.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** High
**Story Points:** 3
**Status:** Backlog

---

## User Story

**As a** user
**I want to** preview the invoice before sending
**So that** I can verify everything is correct

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Open preview

- **Given:** I am creating/editing an invoice
- **When:** I click "Preview"
- **Then:** I see a preview of how the invoice will look

### Scenario 2: Preview shows all data

- **Given:** I am viewing the preview
- **When:** I review the content
- **Then:** I see business data, client data, items, totals, and payment methods

### Scenario 3: Return to edit

- **Given:** I am viewing the preview
- **When:** I click "Edit" or close
- **Then:** I return to the invoice form with my data intact

### Scenario 4: Send from preview

- **Given:** I am viewing the preview
- **When:** I click "Send"
- **Then:** The invoice is sent to the client

### Scenario 5: Download from preview

- **Given:** I am viewing the preview
- **When:** I click "Download PDF"
- **Then:** The invoice PDF is downloaded

---

## Technical Notes

- Preview renders same template as PDF
- Modal or full-page preview
- Includes all invoice sections
- Quick actions: Edit, Send, Download

---

## Definition of Done

- [ ] Preview modal/page implemented
- [ ] All invoice data displayed correctly
- [ ] Edit navigation working
- [ ] Send from preview working
- [ ] Download from preview working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/epic.md`
