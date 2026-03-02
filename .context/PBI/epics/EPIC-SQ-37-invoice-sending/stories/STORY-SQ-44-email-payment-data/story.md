# Include Payment Data in Email

**Jira Key:** [SQ-44](https://upexgalaxy65.atlassian.net/browse/SQ-44)
**Epic:** [SQ-37](https://upexgalaxy65.atlassian.net/browse/SQ-37) (Invoice Sending)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

As a user, I want the email to include my payment data, so that I can facilitate collection. 


***## Technical Notes***

- Pull payment methods from business_profile
- Format clearly in email template
- Consider "Pay Now" buttons for PayPal (future)
- Plain text fallback for email clients

***## Definition of Done***

- [ ] Payment data in email body
- [ ] Bank details formatted
- [ ] PayPal email displayed
- [ ] Copy-friendly format
- [ ] Unit tests > 80% coverage

***## Related Documentation***

- ***Epic:*** `.context/PBI/epics/EPIC-SQ-37-invoice-sending/epic.md`

---

## Acceptance Criteria

```markdown
### Scenario 1: Payment info in email body

- ***Given:*** I have configured payment methods
- ***When:*** The client receives the invoice email
- ***Then:*** Payment methods are visible in the email body

### Scenario 2: Bank transfer details

- ***Given:*** I have bank transfer configured
- ***When:*** The client views the email
- ***Then:*** They see bank name, account number, CLABE

### Scenario 3: PayPal visible

- ***Given:*** I have PayPal configured
- ***When:*** The client views the email
- ***Then:*** They see my PayPal email

### Scenario 4: Easy to copy

- ***Given:*** The client views payment details
- ***When:*** They want to copy account numbers
- ***Then:*** The format is easy to select and copy
```

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 2/22/2026
- **Reporter:** Ely
- **Assignee:** Alicia Juste

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:58.962Z_
