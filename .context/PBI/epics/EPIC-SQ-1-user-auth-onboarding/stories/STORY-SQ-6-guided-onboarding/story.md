# Guided Onboarding for New Users

**Jira Key:** [SQ-6](https://upexgalaxy64.atlassian.net/browse/SQ-6)
**Epic:** [SQ-1](https://upexgalaxy64.atlassian.net/browse/SQ-1) (User Authentication & Onboarding)
**Priority:** Medium
**Story Points:** 5
**Status:** Backlog
**Assignee:** Unassigned

---

## User Story

**As a** new user
**I want to** complete a guided onboarding
**So that** I can configure my business profile

---

## Description

Como nuevo usuario que acaba de registrarse en SoloQ, necesito ser guiado a través de un proceso de onboarding que me ayude a configurar mi perfil de negocio (nombre, logo, datos de contacto, métodos de pago) antes de poder crear mi primera factura.

El onboarding es crucial para la activación de usuarios. Un usuario que completa el onboarding tiene toda la información necesaria para crear su primera factura en menos de 2 minutos, aumentando la probabilidad de conversión y retención.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: New user is redirected to onboarding after email verification

- **Given:** I just verified my email by clicking the link
- **When:** The verification is successful
- **Then:** I am redirected to the onboarding flow instead of the dashboard

### Scenario 2: Complete onboarding step by step

- **Given:** I am on the onboarding flow
- **When:** I complete each step (business name, contact info, payment methods)
- **Then:** I see a progress indicator, can navigate back/forward, and see helpful tips

### Scenario 3: Skip optional steps

- **Given:** I am on an optional step (like logo upload)
- **When:** I click "Skip for now"
- **Then:** I advance to the next step without filling that information

### Scenario 4: Complete onboarding and reach dashboard

- **Given:** I have completed all required onboarding steps
- **When:** I click "Get Started" on the final step
- **Then:** I am redirected to an empty dashboard with a CTA to create my first invoice

### Scenario 5: Resume incomplete onboarding

- **Given:** I started onboarding but closed the browser before completing
- **When:** I login again
- **Then:** I am taken back to the onboarding at the step where I left off

---

## Technical Notes

### Frontend

- Multi-step form with progress indicator
- Steps:
  1. Business Name (required)
  2. Contact Info (required: email, optional: phone, address)
  3. Logo Upload (optional)
  4. Payment Methods (at least one required)
- Skip buttons for optional steps
- Summary/confirmation step
- Components: `OnboardingFlow`, `OnboardingStep`, `ProgressIndicator`
- Route: `/onboarding`

### Backend

- API endpoints for each profile section (uses EPIC 2 endpoints)
- Save progress after each step
- Track onboarding completion status

### Database

- `profiles.onboarding_completed` (boolean)
- `profiles.onboarding_step` (integer, 1-4)
- `business_profiles` table (EPIC 2)
- `payment_methods` table (EPIC 2)

---

## Dependencies

### Blocked By

- SQ-2 (User Registration) - needs new user flow
- SQ-3 (User Login) - needs to handle onboarding redirect

### Blocks

- All dashboard features (users must complete onboarding first)

### Related Stories

- SQ-2: User Registration (triggers onboarding after verification)
- EPIC 2 stories (onboarding creates business profile data)

---

## UI/UX Considerations

- Clean, focused multi-step form
- Progress bar showing current step (1/4, 2/4, etc.)
- "Back" and "Next" navigation
- "Skip" button on optional steps
- Helpful tips/illustrations per step
- Mobile-responsive design
- Welcome message on first step
- Celebration/success message on completion
- Empty dashboard state with clear CTA after onboarding

---

## Definition of Done

- [ ] Multi-step onboarding flow implemented
- [ ] Progress indicator working
- [ ] All steps saving data correctly
- [ ] Skip functionality for optional steps
- [ ] Resume from last step working
- [ ] Redirect to dashboard after completion
- [ ] Empty dashboard state with CTA
- [ ] Error handling for all steps
- [ ] Unit tests > 80% coverage
- [ ] Integration tests for data persistence
- [ ] E2E test for full flow
- [ ] Code review approved (2 reviewers)
- [ ] Deployed to staging
- [ ] QA testing passed

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/stories/STORY-SQ-6-guided-onboarding/test-cases.md` (se crea en Fase 5)

**Test Cases Expected:** 10+ detailed test cases covering:

- Full onboarding completion
- Skip optional steps
- Resume incomplete onboarding
- Validation errors per step
- Navigation (back/forward)
- Data persistence
- Redirect logic

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/stories/STORY-SQ-6-guided-onboarding/implementation-plan.md` (se crea en Fase 6)

**Implementation Steps Expected:**

1. Create OnboardingFlow container component
2. Create step components (BusinessNameStep, ContactInfoStep, etc.)
3. Create ProgressIndicator component
4. Implement step navigation logic
5. Integrate with business profile API (EPIC 2)
6. Implement progress tracking (onboarding_step)
7. Add skip functionality
8. Add resume logic in auth flow
9. Create empty dashboard state
10. Write tests

---

## Notes

- Onboarding bridges EPIC 1 (Auth) and EPIC 2 (Business Profile)
- Consider A/B testing different step orders in v2
- Analytics: track drop-off at each step
- Consider adding "Complete later" option that goes to dashboard with limited functionality

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/epic.md`
- **PRD:** `.context/PRD/user-journeys.md` (Journey 1: Steps 4-7)
- **PRD:** `.context/PRD/user-personas.md` (Pain points about time)
- **SRS:** `.context/SRS/functional-specs.md`
