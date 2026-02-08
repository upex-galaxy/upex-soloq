# As a Pro user, I want to pause reminders for a specific invoice for clients with special agreements

**Jira Key:** UPD-61
**Epic:** UPD-57 (Automatic Reminders)
**Priority:** Medium
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** Pro user
**I want to** be able to pause or disable automatic reminders for a single, specific invoice
**So that** I can handle special cases or agreements with certain clients without disabling my entire reminder system.

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- A toggle or button on the invoice detail page to "Pause Automatic Reminders" for that specific invoice.
- This setting overrides the global reminder configuration for this invoice only.
- If reminders are paused, the daily background process should skip this invoice.
- The user should be able to "Resume Automatic Reminders" for the invoice.

### Out of Scope

- Pausing reminders for a client entirely (the setting is per-invoice).
- A detailed log of when reminders were paused or resumed.

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Pause reminders for an overdue invoice

- **Given:** I am a Pro user with global reminders activated.
- **And:** I have an overdue invoice for which I have a special payment agreement with the client.
- **When:** I go to the detail page for that invoice and click "Pause Reminders".
- **Then:** The UI indicates that reminders are now paused for this invoice.
- **And:** When the daily reminder process runs, no reminder is sent for this specific invoice.

### Scenario 2: Other invoices are still sent reminders

- **Given:** I have paused reminders for invoice #123.
- **And:** I have another overdue invoice, #124, for which reminders are not paused.
- **When:** The daily reminder process runs.
- **Then:** A reminder is sent for invoice #124, but not for #123.

### Scenario 3: Resume reminders for an invoice

- **Given:** I have an invoice for which reminders are currently paused.
- **When:** I click "Resume Reminders" on the invoice detail page.
- **Then:** The UI indicates that reminders are active again.
- **And:** The invoice is now eligible to be included in the next daily reminder run, if it is still overdue.

---

## Technical Notes

### Frontend

- Add a toggle/button component to the invoice detail page.
- The component's state (paused/active) is determined by a new field on the invoice record.
- Clicking the toggle will call a new API endpoint to update this state.

### Backend

- Create a new endpoint, e.g., `PUT /api/invoices/[invoiceId]/reminders`, that accepts a boolean `paused` status.
- This endpoint will update a new `reminders_paused` column on the `invoices` table.
- The daily reminder background process must be updated to add `AND reminders_paused = false` to its main query.

### Database

- Add a new boolean column `reminders_paused` to the `public.invoices` table, defaulting to `false`.

---

## Dependencies

### Blocked By

- UPD-58 (System sends automatic reminders)

### Blocks

- Provides critical flexibility, making the feature more practical for real-world use.

---

## Definition of Done

- [ ] UI toggle to pause/resume reminders on a per-invoice basis is implemented.
- [ ] Backend API correctly updates the `reminders_paused` status for an invoice.
- [ ] The daily reminder process correctly skips invoices that have reminders paused.
- [ ] E2E tests verify that pausing reminders for one invoice does not affect others.
- [ ] All acceptance criteria are met.
