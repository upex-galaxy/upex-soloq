# Feature Test Plan: STORY-SQ-6 Guided Onboarding for New Users

**Story:** [SQ-6](https://upexgalaxy65.atlassian.net/browse/SQ-6)  
**Epic:** SQ-31 - PDF Generation & Download  
**Prepared by:** QA  
**Status:** Draft

---

## 1. Objective

Validate that a new user can complete onboarding end-to-end, skip optional steps, resume incomplete onboarding, and be redirected correctly after completion.

---

## 2. In Scope

- Redirect to onboarding after email verification.
- Multi-step onboarding flow with progress indicator.
- Required and optional steps behavior.
- Save progress by step and resume on next login.
- Final redirect to dashboard with CTA.

## 3. Out of Scope

- Billing/subscription behavior.
- Advanced profile customization outside onboarding.
- Non-functional performance benchmarks not defined in story.

---

## 4. Risks

- Progress may not persist after browser close.
- Optional-step skip may block completion by mistake.
- Wrong redirect target after verification or completion.
- Step order inconsistencies between UI and persisted state.

---

## 5. Test Strategy

- **Functional E2E:** Core user flows in browser.
- **Integration:** API + DB persistence for `onboarding_step` and `onboarding_completed`.
- **Negative tests:** Missing required fields, stale session, navigation interruptions.
- **Regression focus:** Existing login/verification redirects.

---

## 6. Acceptance Coverage Matrix

| AC | Validation Focus | Covered By |
|---|---|---|
| AC1 Redirect after verification | Successful verification redirects to onboarding | TC-SQ6-01 |
| AC2 Complete step-by-step | User can move forward/back and sees progress | TC-SQ6-02, TC-SQ6-03 |
| AC3 Skip optional steps | Optional steps can be skipped without blocking | TC-SQ6-04 |
| AC4 Complete and reach dashboard | Final action redirects to dashboard with CTA | TC-SQ6-05 |
| AC5 Resume incomplete onboarding | User returns to last saved step on next login | TC-SQ6-06 |

---

## 7. Test Data

- New verified user with empty onboarding state.
- User with onboarding in progress at step 2 and step 3.
- User with onboarding completed.
- Business profile payloads with minimum required fields and optional fields omitted.

---

## 8. Environment and Dependencies

- Staging environment with auth + onboarding endpoints available.
- Seed scripts or fixtures for user states (new/in-progress/completed).
- Access to logs for redirect and persistence troubleshooting.

---

## 9. Exit Criteria

- All P1/P2 test cases pass.
- No open critical defects on redirect, persistence, or completion.
- Resume flow verified in at least one interrupted-session scenario.
- QA sign-off documented.

