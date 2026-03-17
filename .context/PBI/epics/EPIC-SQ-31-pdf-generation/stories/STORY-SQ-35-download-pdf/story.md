# Download PDF to Device

**Jira Key:** [SQ-35](https://upexgalaxy65.atlassian.net/browse/SQ-35)
**Epic:** [SQ-31](https://upexgalaxy65.atlassian.net/browse/SQ-31) (PDF Generation & Download)
**Priority:** Medium
**Story Points:** 3
**Status:** Ready For QA

---

## User Story

## User Story

**As a** user
**I want to** download the PDF to my device
**So that** I can save it or send it manually

## Acceptance Criteria

### Scenario 1: Download PDF from invoice detail

- ***Given:*** I am viewing an invoice
- ***When:*** I click "Download PDF"
- ***Then:*** PDF is downloaded with filename "Invoice-{number}-{client}.pdf"

### Scenario 2: Download from invoice list

- ***Given:*** I am on the invoices list
- ***When:*** I click the download icon on an invoice row
- ***Then:*** PDF downloads without opening invoice detail

### Scenario 3: Download from preview

- ***Given:*** I am previewing an invoice
- ***When:*** I click download
- ***Then:*** PDF downloads and preview remains open

### Scenario 4: Mobile download

- ***Given:*** I am on a mobile device
- ***When:*** I download PDF
- ***Then:*** PDF opens in device's default viewer (iOS) or downloads to device (Android)

### Scenario 5: Error - Invoice not found

- ***Given:*** I try to download a non-existent invoice
- ***When:*** The system processes the request
- ***Then:*** I see error message "Invoice not found" with status 404

### Scenario 6: Security - Unauthorized access

- ***Given:*** I try to download another user's invoice
- ***When:*** The system processes the request
- ***Then:*** I see error "Invoice not found" (no information leak) with status 404

## Technical Notes

- Use file-saver or browser download API
- File naming: Invoice-{invoice*number}-{sanitized*client_name}.pdf
- Sanitize client name: replace special chars with hyphen, remove accents
- Handle mobile browser differences (iOS Safari opens viewer, Android downloads)

## Story Points

2

---

## Acceptance Criteria

Feature:

Background:
Given ...

Scenario: ...
Given ...
When ...
Then ...

---

## Scope

Download PDF

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 2/9/2026
- **Reporter:** Ely
- **Assignee:** Dedwison
- **Labels:** shift-left-reviewed

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:56.171Z_
