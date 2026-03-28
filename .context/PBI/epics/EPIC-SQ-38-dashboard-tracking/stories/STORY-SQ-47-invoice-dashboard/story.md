# As a user, I want to see a dashboard with all my invoices so that I have a general view

**Jira Key:** [SQ-47](https://upexgalaxy65.atlassian.net/browse/SQ-47)
**Epic:** [SQ-38](https://upexgalaxy65.atlassian.net/browse/SQ-38) (Invoice Dashboard & Tracking)
**Priority:** Medium
**Story Points:** 3
**Status:** Ready For Dev

---

## User Story

As a user, I want to see a dashboard with all my invoices, so that I have a general view. Story Points: 3

---

## ✅ Acceptance Criteria (Refined — Shift-Left QA 2026-03-24)

***AC-1:*** Given I am logged in, When I navigate to `/invoices`, Then the invoice dashboard page loads and the invoice list container is visible.

***AC-2:*** Given I have invoices, When I view the dashboard, Then I see a list of all my invoices with the following columns per row: invoice number, client name, amount (total), date (issue_date), and status.

***AC-3:*** Given I view the invoice list, When I look at each row, Then I see: `invoice*number`, `client*name`, `total` (formatted as currency), `issue_date` (human-readable format), and `status` (badge/label).

***AC-4:*** Given I have no invoices, When I view the dashboard, Then I see an empty state component with a call-to-action button to create my first invoice. On click, the CTA navigates to the invoice creation flow.

***AC-5:**** Given I have more than 20 invoices, When I view the dashboard, Then invoices are paginated (20 per page) or infinitely scrolled. ⚠️ ****PENDING:*** Dev must confirm pagination vs infinite scroll implementation before testing.

***AC-6 [NEW]:*** Given I view the invoice list with no sort applied, Then invoices are sorted by creation date descending (newest first) by default.

---

## ⚠️ Open Questions (Must resolve before dev)

1. ***@Dev:*** Pagination vs infinite scroll — which is implemented? AC-5 has "OR" which blocks UI test design.
2. ***@PO:*** Empty state CTA — exact button text and destination route?
3. ***@PO:*** Does the base list show invoices of ALL statuses (including draft and cancelled) by default?

---

## 📋 Scope

***In scope:***

- Dashboard page with invoice list at `/invoices`
- Display columns: `invoice*number`, `client*name`, `total`, `issue_date`, `status`
- Default sort: newest first (`created_at DESC`)
- Pagination with 20 items per page OR infinite scroll (TBD)
- Empty state with CTA to create invoice
- Responsive design for mobile
- `data-testid` attributes on: invoice-list, invoice-row, invoice-empty-state, pagination controls

***Out of scope:***

- Advanced analytics/charts (SQ-52)
- Export to CSV/Excel
- Bulk actions
- Filter by status (SQ-48), search (SQ-51)
- Error state handling (gap — add as AC if possible)

---

## Acceptance Criteria

1.
  1.
    1. Scenario 1: Dashboard loads

- ****Given:**** I am logged in
- ****When:**** I navigate to invoices
- ****Then:**** I see a dashboard with my invoices

1.
  1.
    1. Scenario 2: Invoice list

- ****Given:**** I have invoices
- ****When:**** I view the dashboard
- ****Then:**** I see a list of all my invoices

1.
  1.
    1. Scenario 3: Invoice details visible

- ****Given:**** I view the invoice list
- ****When:**** I look at each row
- ****Then:**** I see invoice number, client, amount, date, and status

1.
  1.
    1. Scenario 4: Empty state

- ****Given:**** I have no invoices
- ****When:**** I view the dashboard
- ****Then:**** I see an empty state with a call-to-action to create first invoice

1.
  1.
    1. Scenario 5: Pagination

- ****Given:**** I have more than 20 invoices
- ****When:**** I view the dashboard
- ****Then:**** Invoices are paginated (20 per page) or infinitely scrolled

---

## Scope

1.
  1.
    1. In Scope

- Dashboard page with invoice list
- Display columns: invoice*number, client*name, total, issue_date, status
- Default sort: newest first (created_at DESC)
- Pagination with 20 items per page or infinite scroll
- Empty state with CTA to create invoice
- Responsive design for mobile

1.
  1.
    1. Out of Scope

- Advanced analytics/charts (separate story)
- Export to CSV/Excel
- Bulk actions (select multiple)
- Drag-and-drop ordering

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 20/1/2026
- **Updated:** 24/3/2026
- **Reporter:** Ely
- **Assignee:** Alfonso Hernandez
- **Labels:** shift-left-reviewed

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-28T21:41:10.283Z_
