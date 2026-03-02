# As a Free user, I want to see which features are Pro-only so that I understand the value of upgrading

**Jira Key:** [SQ-64](https://upexgalaxy65.atlassian.net/browse/SQ-64)
**Epic:** [SQ-41](https://upexgalaxy65.atlassian.net/browse/SQ-41) (Subscription Management)
**Priority:** Medium
**Story Points:** 2
**Status:** Backlog

---

## User Story

As a Free user, I want to see which features are limited to Pro, so that I understand the value of upgrading. Story Points: 2

---

## Acceptance Criteria

1. 

1. 

- ****Given:**** I am a Free user
- ****When:**** I navigate to Settings > Automatic Reminders
- ****Then:**** I see the reminder settings interface
- ****And:**** Features are greyed out/disabled with a lock icon
- ****And:**** A banner shows "Upgrade to Pro to unlock automatic reminders"

1. 

- ****Given:**** I am a Free user on the dashboard
- ****When:**** I see the navigation sidebar
- ****Then:**** Pro-only features show a "PRO" badge
- ****And:**** Clicking them shows upgrade prompt instead of access denied

1. 

- ****Given:**** I am a Free user viewing a Pro-locked feature
- ****When:**** I try to interact with it (e.g., enable reminders)
- ****Then:**** A modal appears explaining the feature benefits
- ****And:**** Shows "Upgrade to Pro - $X/month" button
- ****And:**** Lists what Pro includes

1. 

- ****Given:**** I am a Free user
- ****When:**** I visit the subscription/pricing page
- ****Then:**** I see a clear comparison table:
  | Feature | Free | Pro |
  | Unlimited Invoices | Yes | Yes |
  | Automatic Reminders | No | Yes |
  | Custom Templates | No | Yes |

1. 

- ****Given:**** I am a Free user with overdue invoices
- ****When:**** I view my dashboard
- ****Then:**** I see a prompt "You have 3 overdue invoices. Upgrade to Pro for automatic reminders"

1. 

- ****Given:**** I am a Free user
- ****When:**** I hover over a locked Pro feature
- ****Then:**** A tooltip explains "This feature is available with Pro subscription"

1. 

- ****Given:**** I am a Pro user
- ****When:**** I navigate the app
- ****Then:**** All features are unlocked and accessible
- ****And:**** No "PRO" badges or upgrade prompts are shown

---

## Scope

1. 

1. 

- Visual indication of Pro features (badges, locks)
- Greyed out/disabled Pro features for Free users
- Upgrade CTA buttons in relevant locations
- Feature comparison table
- Pro feature tooltips
- Contextual upgrade prompts (e.g., overdue invoices teaser)

1. 

- Trial period for Pro features
- Feature-specific pricing (only one Pro tier)
- A/B testing of upgrade prompts
- Push notifications about Pro features

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
_Last sync: 2026-03-02T19:54:11.042Z_
