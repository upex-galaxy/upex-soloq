# Generate Professional PDF Invoice

**Jira Key:** [SQ-32](https://upexgalaxy64.atlassian.net/browse/SQ-32)
**Epic:** [SQ-31](https://upexgalaxy64.atlassian.net/browse/SQ-31) (PDF Generation)
**Priority:** High
**Story Points:** 5
**Status:** Backlog

---

## User Story

**As a** user
**I want to** generate a PDF of my invoice with professional design
**So that** I can send it to my client

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Generate PDF

- **Given:** I have a complete invoice
- **When:** I click "Generate PDF"
- **Then:** A PDF is generated with all invoice data

### Scenario 2: Professional layout

- **Given:** I view the generated PDF
- **When:** I examine the design
- **Then:** It has a clean, professional layout

### Scenario 3: All sections included

- **Given:** I view the generated PDF
- **When:** I check the content
- **Then:** I see header, client info, items, totals, and footer

### Scenario 4: Correct calculations

- **Given:** I view the PDF totals
- **When:** I verify the math
- **Then:** All calculations match the invoice editor

### Scenario 5: PDF quality

- **Given:** I print the PDF
- **When:** I view the output
- **Then:** The quality is suitable for professional use

---

## Technical Notes

- Use @react-pdf/renderer for generation
- A4 page size (or Letter for US)
- Proper margins and spacing
- Font: clean sans-serif (Inter, Roboto, etc.)
- Generate client-side for speed

---

## Definition of Done

- [ ] PDF generation working
- [ ] Professional template designed
- [ ] All invoice sections rendered
- [ ] Calculations verified
- [ ] Print quality acceptable
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/epic.md`
