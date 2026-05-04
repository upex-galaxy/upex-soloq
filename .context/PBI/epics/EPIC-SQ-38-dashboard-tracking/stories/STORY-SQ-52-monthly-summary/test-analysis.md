# Test Analysis Report

**User Story:** SQ-52 - Monthly summary  
**Epic:** SQ-38 - Invoice Dashboard & Tracking  
**Date:** 2026-05-04  
**Analyst:** AI Assistant

---

## Sources Analyzed

| Source | Issues/Docs | Key Insights |
| --- | --- | --- |
| User Story | SQ-52 | Monthly income summary, trend, and chart |
| Acceptance Test Plan | `acceptance-test-plan.md` | 11 refined scenarios with finance semantics |
| Story Comments | `comments.md` | Exploratory notes, semantic mismatch history |
| Related Bugs | SQ-175 | Prior semantic inconsistency risk area, now closed/verified |

---

## Identified Scenarios

### Critical Priority

| # | Scenario | Type | Automatable | Component of |
| --- | --- | --- | --- | --- |
| 1 | Validate monthly paid total when dashboard loads current month summary | Integration | Yes | Dashboard Financial E2E |
| 2 | Validate paid and pending monthly breakdown when mixed statuses exist | Integration | Yes | Dashboard Financial E2E |
| 3 | Validate summary refresh when a sent invoice is marked as paid | E2E | Yes | Payment-to-Dashboard E2E |
| 4 | Validate user isolation in monthly summary when another user has higher totals | Integration | Yes | Security/RLS regression |

### High Priority

| # | Scenario | Type | Automatable | Component of |
| --- | --- | --- | --- | --- |
| 5 | Validate month-over-month trend percentage when current month exceeds last month | Functional | Yes | Dashboard Financial E2E |
| 6 | Validate six-month chart values when historical paid data exists | Functional | Yes | Dashboard Financial E2E |
| 7 | Validate currency formatting when monthly values include thousands and decimals | Functional | Yes | Shared UI formatting checks |

### Medium Priority

| # | Scenario | Type | Automatable | Notes |
| --- | --- | --- | --- | --- |
| 8 | Validate zero-income rendering when current month has no paid invoices | Functional | Yes | Edge but useful |
| 9 | Validate first-month trend behavior when previous month is zero | Functional | Yes | Boundary-specific |
| 10 | Validate reduced chart horizon when fewer than six months are available | Functional | Yes | Nice-to-have stability check |

### Low Priority / Deferred

| # | Scenario | Reason to Defer |
| --- | --- | --- |
| 11 | Validate all wording variants for trend badges and empty chart helper copy | Mostly copy/UX, limited regression protection |

---

## Cross-Cutting Characteristics (NOT separate tests)

| Characteristic | How it is validated |
| --- | --- |
| Mobile responsive | Execute key summary scenarios in mobile viewport |
| API contract | Validate monthly summary response shape while running core scenarios |
| Accessibility | Verify chart/card labels while executing UI scenarios |

---

## Component Map (Lego)

Dashboard Financial E2E
- Validate monthly paid total when dashboard loads current month summary
- Validate paid and pending monthly breakdown when mixed statuses exist
- Validate month-over-month trend percentage when current month exceeds last month
- Validate six-month chart values when historical paid data exists

Payment-to-Dashboard E2E
- Validate summary refresh when a sent invoice is marked as paid
- Validate monthly paid total when dashboard loads current month summary

Security Regression
- Validate user isolation in monthly summary when another user has higher totals

---

## Candidate Summary

| Category | Count |
| --- | --- |
| Total real scenarios | 11 |
| Cross-cutting characteristics | 3 (NOT tests) |
| Regression candidates | 10 |
| With prior bugs (risk) | 3 |
| Automatable | 10 |
| Manual-only | 0 |
| Deferred | 1 |

---

## Prior Bug Analysis (Risk)

| Bug ID | Description | Affected Area | Related Scenario? | Higher Risk? |
| --- | --- | --- | --- | --- |
| SQ-175 | Monthly summary semantics inconsistent | Paid semantics, trend, chart | #1, #5, #6 | YES |

---

## Recommendations

- Keep semantic core tests mandatory in regression because `SQ-175` already proved fragility.
- Prioritize one payment-to-dashboard E2E to protect reactivity after payment.
- Include RLS isolation test due to high impact risk if broken.
- Defer copy-only trend/empty helper wording checks.

## Decision Point

Candidates identified. Proceed to `test-prioritization.md`.
