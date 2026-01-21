# Choose PDF Template (Pro Feature)

**Jira Key:** [SQ-36](https://upexgalaxy64.atlassian.net/browse/SQ-36)
**Epic:** [SQ-31](https://upexgalaxy64.atlassian.net/browse/SQ-31) (PDF Generation)
**Priority:** Low
**Story Points:** 1
**Status:** Backlog

---

## User Story

**As a** Pro user
**I want to** choose between different invoice templates
**So that** I can customize my style

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Free user sees one template

- **Given:** I am a Free user
- **When:** I view template options
- **Then:** I only have access to the "Classic" template

### Scenario 2: Pro user sees all templates

- **Given:** I am a Pro user
- **When:** I view template options
- **Then:** I see multiple template options

### Scenario 3: Template preview

- **Given:** I am selecting a template
- **When:** I hover/click on a template
- **Then:** I see a preview of how my invoice would look

### Scenario 4: Save template preference

- **Given:** I select a template
- **When:** I save my preference
- **Then:** This template is used for future invoices

### Scenario 5: Change template per invoice

- **Given:** I have a default template
- **When:** I create a specific invoice
- **Then:** I can override the template for this invoice only

---

## Technical Notes

- Templates: classic, modern, minimal, professional
- Free: classic only
- Pro: all templates
- Template preference stored in business_profile
- Per-invoice override stored in invoice record

---

## Definition of Done

- [ ] Multiple templates implemented
- [ ] Pro gating working
- [ ] Template preview working
- [ ] Save preference working
- [ ] Per-invoice override working
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/epic.md`
- **Related:** SQ-41 (Subscription Management)
