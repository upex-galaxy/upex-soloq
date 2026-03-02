# As a user, I want to configure my business name so that it appears on my invoices

**Jira Key:** [SQ-8](https://upexgalaxy65.atlassian.net/browse/SQ-8)
**Epic:** [SQ-7](https://upexgalaxy65.atlassian.net/browse/SQ-7) (Business Profile Management)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

## User Story

***As a*** user
***I want to*** configure my business name
***So that*** it appears on my invoices

## Acceptance Criteria

### Scenario 1: Set business name for the first time

- ***Given:*** I am on the business profile settings page
- ***When:*** I enter my business name and click save
- ***Then:*** My business name is saved and displayed in the profile

### Scenario 2: Update business name

- ***Given:*** I have a business name configured
- ***When:*** I edit and save a new business name
- ***Then:*** The new name replaces the old one and appears on new invoices

### Scenario 3: Business name appears on invoice

- ***Given:*** I have configured my business name
- ***When:*** I create a new invoice
- ***Then:*** My business name appears prominently on the invoice header

## Technical Notes

- Max length: 100 characters
- Required field for creating invoices
- Stored in `business_profiles` table
- RLS policy: user can only edit their own profile

## Story Points

2

---

## Acceptance Criteria

1. 

- ****Given:**** I am on the business profile settings page
- ****When:**** I enter my business name and click save
- ****Then:**** My business name is saved and displayed in the profile

1. 

- ****Given:**** I have a business name configured
- ****When:**** I edit and save a new business name
- ****Then:**** The new name replaces the old one and appears on new invoices

1. 

- ****Given:**** I have configured my business name
- ****When:**** I create a new invoice
- ****Then:**** My business name appears prominently on the invoice header

1. 

- ****Given:**** I am entering my business name
- ****When:**** I try to enter more than 100 characters
- ****Then:**** I see a validation error indicating the maximum length

1. 

- ****Given:**** I have not configured a business name
- ****When:**** I try to create an invoice
- ****Then:**** I am redirected to complete my business profile first

---

## Scope

1. 

- Business name text input field with 100 character limit
- Real-time character counter
- Form validation (required, max length)
- API integration to save/update business name
- Display business name on invoice header
- Integration with onboarding flow (step 1)

1. 

- Multiple business profiles per user
- Business name history/versioning
- Auto-suggestions or business name search
- Localization of business name

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 3/2/2026
- **Reporter:** Ely
- **Assignee:** Unassigned

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:40.554Z_
