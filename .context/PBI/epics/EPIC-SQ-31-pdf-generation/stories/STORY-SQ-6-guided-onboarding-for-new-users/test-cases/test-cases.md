# Test Cases: STORY-SQ-6 Guided Onboarding for New Users

**Story:** [SQ-6](https://upexgalaxy65.atlassian.net/browse/SQ-6)  
**Type:** Functional / Integration  
**Status:** Draft

---

## TC-SQ6-01 - Redirect to onboarding after email verification

**Priority:** Critical  
**Preconditions:** User just completed email verification successfully.

**Steps:**
1. Open verification link from email.
2. Complete verification flow.
3. Observe landing route.

**Expected Result:**
- User is redirected to onboarding (not dashboard).
- Step 1 of onboarding is displayed.

---

## TC-SQ6-02 - Complete required onboarding steps in sequence

**Priority:** Critical  
**Preconditions:** User is on onboarding step 1.

**Steps:**
1. Fill required fields in step 1 (business name) and continue.
2. Fill required fields in step 2 (contact info) and continue.
3. Fill required fields in step 4 (payment methods) and continue.

**Expected Result:**
- User can continue only after completing required fields.
- Progress indicator updates at each step.
- No blocking validation errors with valid data.

---

## TC-SQ6-03 - Navigate back/forward without losing saved data

**Priority:** High  
**Preconditions:** User has completed at least one step.

**Steps:**
1. Move from step 1 to step 2.
2. Click back to step 1.
3. Return to step 2.

**Expected Result:**
- Previously entered data remains available.
- Progress indicator remains consistent with current step.

---

## TC-SQ6-04 - Skip optional logo step

**Priority:** High  
**Preconditions:** User reaches optional logo upload step.

**Steps:**
1. Click `Skip for now` on logo step.
2. Continue to next onboarding step.

**Expected Result:**
- User advances to next step without uploading logo.
- Flow remains valid and completable.

---

## TC-SQ6-05 - Complete onboarding and redirect to dashboard

**Priority:** Critical  
**Preconditions:** User completed all required steps.

**Steps:**
1. Reach final onboarding step.
2. Click `Get Started`.

**Expected Result:**
- User is redirected to dashboard.
- Dashboard shows empty-state CTA to create first invoice.
- User is not prompted to redo onboarding.

---

## TC-SQ6-06 - Resume onboarding after session interruption

**Priority:** Critical  
**Preconditions:** User completed some steps but not all.

**Steps:**
1. Stop onboarding at step N (e.g., step 3).
2. Close browser/session.
3. Log in again.

**Expected Result:**
- User returns directly to step N.
- Previously saved data from prior steps is preserved.

---

## TC-SQ6-07 - Persist onboarding status in backend

**Priority:** High  
**Type:** Integration/API  
**Preconditions:** Test user in onboarding flow.

**Steps:**
1. Complete one step and continue.
2. Inspect persistence via API or DB.
3. Complete onboarding and inspect persistence again.

**Expected Result:**
- `onboarding_step` updates after each saved step.
- `onboarding_completed` remains `false` until final completion.
- `onboarding_completed` becomes `true` after final step.

---

## TC-SQ6-08 - Validation prevents progression on missing required data

**Priority:** High  
**Preconditions:** User on a required step.

**Steps:**
1. Leave required fields empty.
2. Click continue.

**Expected Result:**
- User stays on current step.
- Clear validation messages are shown.
- No invalid data is saved as completed step.

