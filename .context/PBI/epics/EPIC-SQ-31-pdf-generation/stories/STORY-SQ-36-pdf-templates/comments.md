# Comments for SQ-36

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-36)

---

### Marian Sánchez - 2/14/2026, 11:33:18 AM

## Acceptance Test Plan - Generated 2026-02-14

***QA Engineer:*** AI-Generated (Shift-Left Analysis)
***Status:*** Draft - Pending PO/Dev Review

## 

### Paso 1: Critical Analysis

***User Personas Affected:***

- ***Primary:*** Carlos (Disenador, CDMX) - Needs professional templates to match creative brand
- ***Secondary:*** Andres (Consultor, Buenos Aires) - Classic template sufficient but may value professional options

***Business Value:*** Templates premium are 1 of 3 key Pro differentiators ($9.99/month). Target: 8% Free-to-Pro conversion.

***Related Journey:*** "Registro y Primera Factura" (Steps 12-14), template selection before PDF preview.

***Complexity:*** Medium - Pro gating (UI + server), persistence across 2 DB tables, 4 template variants.

***Epic-Level Risks Applied:***

- Pro feature gate bypass (Medium risk) - DIRECTLY applies to this story
- PDF generation performance > 3000ms (High risk) - template complexity may add overhead
- Template selection confusion (Low risk) - UX must clearly label Pro vs Free

### Paso 2: Story Quality Analysis

***Ambiguities Identified:***

1. Local story.md has 5 ACs, Jira has 3 ACs (different wording) - merged for completeness
2. "Multiple template options" is vague - should specify: classic, modern, minimal, professional
3. Template preview behavior undefined (thumbnail vs full render vs modal)
4. Free user UX undefined (locked templates with CTA vs hidden templates)

***Gaps:***

1. No error handling scenarios (subscription check fails, template save fails)
2. No subscription downgrade behavior defined
3. Story points mismatch: local=1, Jira=3

***Edge Cases NOT in Original Story:***

1. Pro subscription expires with non-classic default (HIGH)
2. Free user API bypass attempt (CRITICAL)
3. Template with incomplete business data (MEDIUM)
4. Invalid template value in DB - fallback behavior (MEDIUM)
5. Default change doesn't affect invoices with override (MEDIUM)

### Paso 3: Refined Acceptance Criteria (10 Scenarios)

***Scenario 1:*** Free user sees Classic as active, Pro templates locked with badges and upgrade CTA
***Scenario 2:*** Pro user sees all 4 templates selectable without restrictions
***Scenario 3:*** Template preview shows invoice appearance ([ 2s load)
***Scenario 4:*** Save default template preference to business*profiles.default*template
***Scenario 5:*** Override template per invoice via invoices.template_override
***Scenario 6:*** Free user clicking locked template triggers upgrade modal
***Scenario 7:*** Server rejects Pro template API requests from Free users (403)
***Scenario 8:*** Pro subscription expires -] fallback to classic for new invoices
***Scenario 9:*** All templates render gracefully with incomplete business data
***Scenario 10:*** Invalid template value in DB -> graceful fallback to classic

***Template Resolution Logic:*** invoice.template*override > business*profiles.default_template > 'classic'

## 

### Paso 4: Test Design (12 Test Cases)

|  | ***Test Outline **** | ****Type **** | ****Priority **** | ****Level *** |
| --- | --- | --- | --- |
| 1  | Validar acceso a templates segun plan de suscripcion Free  | Positive  | Critical  | E2E  |
| 2  | Validar acceso completo a templates para usuario Pro  | Positive  | Critical  | E2E  |
| 3  | Validar preview de template al seleccionar  | Positive  | High  | E2E  |
| 4  | Validar guardado de preferencia de template por defecto  | Positive  | Critical  | Integration  |
| 5  | Validar override de template por factura individual  | Positive  | High  | Integration  |
| 6  | Validar rechazo de template Pro via API para usuario Free  | Negative  | Critical  | API  |
| 7  | Validar comportamiento cuando suscripcion Pro expira  | Edge Case  | High  | Integration  |
| 8  | Validar renderizado de template con datos incompletos  | Boundary  | Medium  | E2E  |
| 9  | Validar fallback con valor de template invalido en DB  | Boundary  | Medium  | Integration  |
| 10  | Validar template classic siempre disponible para Free users  | Positive  | High  | API  |
| 11  | Validar persistencia de template override al editar factura  | Positive  | Medium  | E2E  |
| 12  | Validar que cambiar default no afecta facturas con override  | Integration  | Medium  | Integration  |

***Parametrization:***

- Group 1: Template availability by subscription plan (8 data points across Free/Pro x 4 templates)
- Group 2: Template rendering with varying data completeness (4 templates x data states)

### Critical Questions

***For PO:***

1. Can Free users SEE Pro templates (locked) or are they hidden entirely?
2. What happens when Pro user downgrades? Revert default to classic or keep setting but restrict?
3. Do existing invoices with Pro template override keep rendering that template after downgrade?

***For Dev:***

1. Will template selection be in Settings page, Invoice creation page, or both?
2. Is subscription validation done on every PDF generation request or cached?
3. How will template components be structured? Separate React components per template?

### Action Required

***@Ely (PO):***

- [ ] Review and answer Critical Questions above
- [ ] Validate refined acceptance criteria (10 scenarios)
- [ ] Confirm expected behavior for edge cases (subscription expiry, API bypass)

***@Dev Team:***

- [ ] Review technical questions
- [ ] Validate template resolution logic: override > default > classic
- [ ] Confirm server-side subscription validation approach

***Documentation:*** Full test cases at:
`.context/PBI/epics/EPIC-SQ-31-pdf-generation/stories/STORY-SQ-36-pdf-templates/acceptance-test-plan.md`

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:57.247Z_
