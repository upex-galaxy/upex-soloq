# As a user, I want the system to validate client email deliverability so that I avoid sending invoices to invalid addresses

**Jira Key:** [SQ-68](https://upexgalaxy65.atlassian.net/browse/SQ-68)
**Epic:** [SQ-13](https://upexgalaxy65.atlassian.net/browse/SQ-13) (Client Management)
**Priority:** Medium
**Story Points:** 3
**Status:** Backlog

---

## User Story

## User Story

**As a** freelancer
**I want to** verify that my client's email is valid and can receive emails
**So that** my invoices are delivered successfully

## Context

Currently, the system only validates email format (syntax). We need to validate that the email actually exists and can receive messages, since invoices are sent via email.

## Acceptance Criteria

**To be refined**

## Technical Notes

Consider:

- MX record validation
- Email verification service (ZeroBounce, Hunter.io, etc.)
- Confirmation email flow
- UX: block vs warn

---

## Acceptance Criteria

1. 

1. 

- ****Given:**** I am adding a new client
- ****When:**** I enter email "john@validcompany.com"
- ****Then:**** The email passes format validation
- ****And:**** The system verifies the domain has MX records
- ****And:**** The email is accepted

1. 

- ****Given:**** I am adding a new client
- ****When:**** I enter email "john@invalid" (no TLD)
- ****Then:**** The system shows error "Please enter a valid email address"
- ****And:**** The form cannot be submitted

1. 

- ****Given:**** I am adding a new client
- ****When:**** I enter a disposable email like "client@tempmail.com"
- ****Then:**** The system shows a warning "This appears to be a temporary email address"
- ****And:**** Allows me to proceed if I confirm

1. 

- ****Given:**** I am adding a client
- ****When:**** I enter an email with a domain that has no MX records
- ****Then:**** The system shows warning "This email domain may not receive emails"
- ****And:**** Allows me to proceed with acknowledgment

1. 

- ****Given:**** I am adding a client
- ****When:**** I enter "client@gmial.com" (typo of gmail.com)
- ****Then:**** The system suggests "Did you mean client@gmail.com?"
- ****And:**** I can click to accept the suggestion or keep original

1. 

- ****Given:**** I am sending an invoice to a client
- ****When:**** The client's email fails deliverability check
- ****Then:**** The system warns "This email may not be deliverable"
- ****And:**** Shows last successful email to this client (if any)

1. 

- ****Given:**** I have a client who has successfully received invoices before
- ****When:**** I create a new invoice for them
- ****Then:**** No deliverability warning is shown
- ****And:**** The email is considered verified by previous successful delivery

---

## Scope

1. 

1. 

- Email format validation (RFC 5321)
- MX record lookup for domain validation
- Disposable email domain detection (using known list)
- Common typo suggestions (gmail, yahoo, hotmail variants)
- Warning UI with proceed option
- Track verified emails (successful past deliveries)

1. 

- Real-time SMTP verification (too slow/unreliable)
- Paid email verification API integration
- Email bounce tracking and automatic flagging
- Bulk email list validation
- Client-side only validation (server validation required)

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 2/3/2026
- **Updated:** 3/2/2026
- **Reporter:** Ely
- **Assignee:** Unassigned

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:47.460Z_
