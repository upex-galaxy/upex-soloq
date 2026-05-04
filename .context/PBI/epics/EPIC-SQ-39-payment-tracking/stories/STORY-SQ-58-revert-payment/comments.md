# Comments for SQ-58

[View in Jira](https://upexgalaxy67.atlassian.net/browse/SQ-58)

---

### Ely - 3/31/2026, 6:52:43 PM

## Shift-Left QA — Acceptance Test Plan Summary

***Date:**** 2026-03-31 | ****QA:**** AI-Assisted | ****Epic:*** [https://upexgalaxy67.atlassian.net/browse/SQ-39#icft=SQ-39](https://upexgalaxy67.atlassian.net/browse/SQ-39#icft=SQ-39) (Payment Tracking)

### Test Coverage

- ***Total Test Cases:*** 10 (Positive: 3, Negative: 2, Boundary: 2, Integration: 3)
- ***Parametrized Groups:*** 1 (post-revert status: sent if not past due, overdue if past due)

### Key Decisions Proposed (PO/Dev)

1. Soft delete: set `deleted_at` on payment record (never hard delete)
2. Post-revert status determined by due*date: `sent` if due*date >= today, `overdue` if past
3. Invoice can be paid again after revert (full cycle: paid → revert → sent → paid)
4. Confirmation dialog required with "Cancel" and "Confirm Revert" buttons

### Ambiguities Identified

- Can user revert if invoice was already re-sent to client after payment?
- Audit event metadata format for "payment*revert" in invoice*events

### Edge Cases Added

- Revert then immediately mark as paid again, revert on invoice with due_date=today, concurrent revert attempts

***Full ATP:*** `.context/PBI/epics/EPIC-SQ-39-payment-tracking/stories/STORY-SQ-58-revert-payment/acceptance-test-plan.md`

---

### Automation for Jira - 4/1/2026, 2:25:15 AM

🔎 Pull Request created. Task is pending to ANALYZE and REVIEW by the team. Waiting for PR Approval.

---

### Automation for Jira - 4/1/2026, 2:25:26 AM

✅ Pull Request is successfully MERGED. Task is Done.

---


_Synced from Jira by jira-sync_
_Last sync: 2026-05-02T05:05:23.246Z_
