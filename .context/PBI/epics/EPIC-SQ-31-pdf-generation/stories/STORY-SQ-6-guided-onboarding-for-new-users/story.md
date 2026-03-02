# Guided Onboarding for New Users

**Jira Key:** [SQ-6](https://upexgalaxy65.atlassian.net/browse/SQ-6)
**Epic:** [SQ-31](https://upexgalaxy65.atlassian.net/browse/SQ-31) (PDF Generation & Download)
**Priority:** Medium
**Story Points:** 13
**Status:** Ready For QA

---

## User Story

## User Story

***As a*** new user
***I want to*** complete a guided onboarding
***So that*** I can configure my business profile

## 

## Description

Como nuevo usuario que acaba de registrarse en SoloQ, necesito ser guiado a través de un proceso de onboarding que me ayude a configurar mi perfil de negocio (nombre, logo, datos de contacto, métodos de pago) antes de poder crear mi primera factura.

## 

## Acceptance Criteria (Gherkin format)

### Scenario 1: New user is redirected to onboarding after email verification

- ***Given:*** I just verified my email by clicking the link
- ***When:*** The verification is successful
- ***Then:*** I am redirected to the onboarding flow instead of the dashboard

### Scenario 2: Complete onboarding step by step

- ***Given:*** I am on the onboarding flow
- ***When:*** I complete each step (business name, contact info, payment methods)
- ***Then:*** I see a progress indicator, can navigate back/forward, and see helpful tips

### Scenario 3: Skip optional steps

- ***Given:*** I am on an optional step (like logo upload)
- ***When:*** I click "Skip for now"
- ***Then:*** I advance to the next step without filling that information

### Scenario 4: Complete onboarding and reach dashboard

- ***Given:*** I have completed all required onboarding steps
- ***When:*** I click "Get Started" on the final step
- ***Then:*** I am redirected to an empty dashboard with a CTA to create my first invoice

### Scenario 5: Resume incomplete onboarding

- ***Given:*** I started onboarding but closed the browser before completing
- ***When:*** I login again
- ***Then:*** I am taken back to the onboarding at the step where I left off

## Technical Notes

### Frontend

- Multi-step form with progress indicator
- Steps: 1) Business Name 2) Contact Info 3) Logo (optional) 4) Payment Methods
- Skip buttons for optional steps
- Summary/confirmation step

### Backend

- Save progress after each step
- API endpoints for each profile section
- Track onboarding completion status

### Database

- profiles.onboarding_completed (boolean)
- profiles.onboarding_step (number)
- business_profiles table
- payment_methods table

## Definition of Done

- [ ] Multi-step onboarding flow implemented
- [ ] Progress indicator working
- [ ] All steps saving data correctly
- [ ] Skip functionality for optional steps
- [ ] Resume from last step working
- [ ] Redirect to dashboard after completion
- [ ] Error handling
- [ ] Unit tests > 80% coverage
- [ ] E2E test for full flow
- [ ] Code review approved

## Related Documentation

- ***Epic:*** [https://upexgalaxy65.atlassian.net/browse/SQ-1#icft=SQ-1](https://upexgalaxy65.atlassian.net/browse/SQ-1#icft=SQ-1) - User Authentication & Onboarding
- ***PRD:*** `.context/PRD/user-journeys.md` (Journey 1)
- ***SRS:*** `.context/SRS/functional-specs.md`

---

## Acceptance Criteria

Feature:

Background:
Given ...

Scenario: ...
Given ...
When ...
Then ...

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 2/25/2026
- **Reporter:** Ely
- **Assignee:** Juan Leites
- **Labels:** mvp, onboarding, should-have

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:54.755Z_
