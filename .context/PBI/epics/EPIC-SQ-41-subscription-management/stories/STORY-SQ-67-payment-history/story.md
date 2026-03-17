# As a Pro user, I want to view my subscription payment history so that I have records for my accounting

**Jira Key:** [SQ-67](https://upexgalaxy65.atlassian.net/browse/SQ-67)
**Epic:** [SQ-41](https://upexgalaxy65.atlassian.net/browse/SQ-41) (Subscription Management)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

As a Pro user, I want to see my subscription payment history, so that I have records. Story Points: 2

---

## Acceptance Criteria

1. 

1. 

- ****Given:**** I am a Pro user on the subscription page
- ****When:**** I look at the payment history section
- ****Then:**** I see a list of all subscription payments:
- Date: "Feb 15, 2026"
- Amount: "$9.99"
- Status: "Paid"
- Invoice number

1. 

- ****Given:**** I see a payment in the history
- ****When:**** I click "Download Receipt"
- ****Then:**** A PDF receipt is downloaded
- ****And:**** It includes all billing details for my records

1. 

- ****Given:**** I am on the subscription page
- ****When:**** I click "View Billing History" 
- ****Then:**** I am redirected to Stripe Customer Portal
- ****And:**** I can view and download all invoices there

1. 

- ****Given:**** A payment attempt failed last month
- ****When:**** I view payment history
- ****Then:**** I see the failed payment entry:
- Date: "Feb 15, 2026"
- Amount: "$9.99"
- Status: "Failed"
- Action: "Retry Payment"

1. 

- ****Given:**** I am a Free user
- ****When:**** I view the subscription page
- ****Then:**** I see "No payment history" or "Upgrade to Pro"
- ****And:**** No payment history section is shown

1. 

- ****Given:**** I have multiple subscription payments
- ****When:**** I view the payment history
- ****Then:**** Payments are sorted most recent first
- ****And:**** I can see payments from previous months/years

1. 

- ****Given:**** I am viewing payment history
- ****When:**** I look at the current period payment
- ****Then:**** It's visually distinguished (e.g., "Current Period")
- ****And:**** Shows next payment date

---

## Scope

1. 

1. 

- Payment history list on subscription page
- Basic payment info: date, amount, status
- Link to Stripe Customer Portal for full invoices
- Failed payment indication
- Sort by date descending
- Redirect to Stripe for receipt/invoice download

1. 

- In-app invoice PDF generation (use Stripe's)
- Payment history export to CSV
- Integration with accounting software
- Displaying payment method used (privacy)

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
_Last sync: 2026-03-02T19:54:11.917Z_
