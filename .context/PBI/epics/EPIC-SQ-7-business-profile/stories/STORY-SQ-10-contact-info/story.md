# As a user, I want to add my contact information so that my clients can contact me

**Jira Key:** [SQ-10](https://upexgalaxy65.atlassian.net/browse/SQ-10)
**Epic:** [SQ-7](https://upexgalaxy65.atlassian.net/browse/SQ-7) (Business Profile Management)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

## User Story

***As a*** user
***I want to*** add my contact information
***So that*** my clients can contact me

## Acceptance Criteria

### Scenario 1: Add contact email

- ***Given:*** I am on the business profile settings page
- ***When:*** I enter my business contact email
- ***Then:*** The email is validated and saved

### Scenario 2: Add phone number

- ***Given:*** I am on the business profile settings page
- ***When:*** I enter my phone number with country code
- ***Then:*** The phone is validated and saved

### Scenario 3: Add business address

- ***Given:*** I am on the business profile settings page
- ***When:*** I enter my business address (street, city, state, postal code, country)
- ***Then:*** The address is saved

### Scenario 4: Contact info appears on invoice

- ***Given:*** I have configured my contact information
- ***When:*** I generate an invoice
- ***Then:*** My contact details appear on the invoice

## Technical Notes

- Email: Required, must be valid email format
- Phone: Optional, validate with country code
- Address: Optional, structured fields (street, city, state, postal_code, country)
- Stored in `business_profiles` table

## Story Points

2

---

## Acceptance Criteria

1. 

- ****Given:**** I am on the business profile settings page
- ****When:**** I enter my business contact email
- ****Then:**** The email is validated (format) and saved

1. 

- ****Given:**** I am on the business profile settings page
- ****When:**** I enter my phone number with country code
- ****Then:**** The phone is validated and saved

1. 

- ****Given:**** I am on the business profile settings page
- ****When:**** I enter my business address (street, city, state, postal code, country)
- ****Then:**** The address is saved

1. 

- ****Given:**** I have configured my contact information
- ****When:**** I generate an invoice
- ****Then:**** My contact details appear on the invoice

1. 

- ****Given:**** I have existing contact information
- ****When:**** I edit and save new information
- ****Then:**** The new information replaces the old one

---

## Scope

1. 

- Contact email field (required, valid email format)
- Phone field with country code selector (optional)
- Address fields: Street, City, State, Postal Code, Country (optional)
- Email pre-filled with account email (editable)
- E.164 phone format validation
- Display contact info on invoice
- Integration with onboarding (step 2)

1. 

- Multiple addresses
- Address autocomplete (Google Places)
- Phone number verification (SMS)
- International format auto-detection

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
_Last sync: 2026-03-02T19:53:41.554Z_
