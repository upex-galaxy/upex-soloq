# View Pro Features and Limitations

**Jira Key:** [SQ-64](https://upexgalaxy64.atlassian.net/browse/SQ-64)
**Epic:** [SQ-41](https://upexgalaxy64.atlassian.net/browse/SQ-41) (Subscription Management)
**Priority:** High
**Story Points:** 2
**Status:** Backlog

---

## User Story

**As a** Free user
**I want to** see which features are limited to Pro
**So that** I understand the value of upgrading

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Pro badge on features

- **Given:** I am a Free user
- **When:** I see a Pro-only feature
- **Then:** It has a "Pro" badge

### Scenario 2: Feature comparison

- **Given:** I want to see all differences
- **When:** I visit the upgrade page
- **Then:** I see a comparison table (Free vs Pro)

### Scenario 3: Usage limits shown

- **Given:** I am a Free user
- **When:** I view my usage
- **Then:** I see my limits (e.g., 10 invoices/month)

### Scenario 4: Approaching limit warning

- **Given:** I am near my Free limit
- **When:** I create an invoice
- **Then:** I see a warning about approaching my limit

### Scenario 5: Limit reached

- **Given:** I reach my Free limit
- **When:** I try to create another invoice
- **Then:** I see an upgrade prompt

---

## Technical Notes

- Pro features: automatic reminders, custom templates, unlimited invoices
- Free limits: 10 invoices/month, 20 clients, 1 template
- Track usage: COUNT invoices WHERE DATE_TRUNC('month', created_at) = current_month
- Show limit: X/10 invoices this month

---

## Definition of Done

- [ ] Pro badges displayed
- [ ] Comparison table created
- [ ] Usage tracking working
- [ ] Warning at 80% limit
- [ ] Upgrade prompt at 100%
- [ ] Unit tests > 80% coverage

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-41-subscription-management/epic.md`
