# Comments for SQ-33

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-33)

---

### Arkaitz - 2/2/2026, 12:01:45 PM

# ✅ Feature Test Plan - FINAL (Depurado)

## 📊 Resumen Ejecutivo

***Test Cases:*** 18 (depurado de 24, eliminando especulativos)  
***Duración:*** 2 días  
***Story Points (Dev):*** 3 SP  
***Story Points (QA):*** 2 SP  
***Ratio Dev:QA:*** 60% dev / 40% testing

## 

## 🎯 AC Coverage (100%)

| ***AC **** | ****Test Cases **** | ****Cobertura *** |
| --- | --- | --- |
| ***AC1*** Logo display  | TC-01, TC-07, TC-12, TC-15, TC-16, TC-17  | ✅ 6 casos  |
| ***AC2*** Business name  | TC-01, TC-02, TC-06, TC-08, TC-10  | ✅ 5 casos  |
| ***AC3*** Contact info  | TC-01, TC-03, TC-06, TC-09  | ✅ 4 casos  |
| ***AC4*** Tax ID  | TC-01, TC-04  | ✅ 2 casos  |
| ***AC5*** No logo fallback  | TC-05, TC-07, TC-11, TC-17  | ✅ 4 casos  |

## 

## 📝 Test Cases (18)

### ✅ Functional (6)

1. PDF con todos los campos completos
2. business_name al límite (100 chars)
3. address al límite (500 chars)
4. tax_id LATAM (RFC, NIT, CUIT)
5. PDF sin logo (fallback layout)
6. Business data con unicode LATAM

### ❌ Negative (5)

1. Logo URL 404
2. business_name excede límite
3. address excede límite
4. business_name con HTML tags (XSS)
5. Todos los campos opcionales vacíos

### 🔗 Integration (3)

1. Fetch logo desde Supabase Storage
2. Fetch business data desde DB
3. Regenerar PDF múltiples veces

### 📐 Visual (4)

1. Logo escalado (4000x4000px)
2. Logo escalado (50x50px)
3. Layout consistente con/sin logo
4. Logo con transparencia PNG

## ⚠️ Critical Blockers for PO/Dev

### Blocker 1: ¿business_name es required?

***Question:*** ¿Se puede generar PDF sin business_name?  
***Suggested:*** business_name = required

### Blocker 2: ¿Warning cuando logo no carga?

***Question:*** ¿PDF se genera silenciosamente con fallback o usuario ve warning?  
***Suggested:*** Generar PDF + mostrar warning en preview

## 

## 🗂️ Test Data Required

***Business Profiles:*** 10 perfiles en staging  
***Logos:*** 4 archivos en Supabase Storage

- logo-200x200.png
- logo-alpha.png (transparencia)
- logo-huge.png (4000x4000px)
- logo-tiny.png (50x50px)

## 📅 Execution Plan

***Day 1:***

- AM: Test data prep + TC-01, TC-05
- PM: TC-02 a TC-06 (functional)

***Day 2:***

- AM: TC-07 a TC-11 (negative)
- PM: TC-12 a TC-18 (integration + visual)

## 📈 Story Points Breakdown

### Development: 3 SP (~3 días)

- PDF component setup + data fetching: 1 día
- Logo scaling + fallback layout: 1 día
- Unicode support + edge cases: 0.5 día
- Unit tests (>80%): 0.5 día

### Testing: 2 SP (~2 días)

- Test data prep: 0.5 día
- Test execution (18 casos): 1 día
- Bug fixing + retest: 0.5 día

***Total Story:*** 5 SP (3 dev + 2 qa)

## 

📁 ***Feature Test Plan:*** `.context/PBI/epics/EPIC-SQ-31-pdf-generation/stories/STORY-SQ-33-pdf-business-data/feature-test-plan.md`

## 

cc: @PO - Por favor responder blockers antes de mover a "Ready for Dev"

---

### Automation for Jira - 2/9/2026, 2:30:08 AM

🔎 Pull Request created. Task is pending to ANALYZE and REVIEW by the team. Waiting for PR Approval.

---

### Ely - 2/9/2026, 2:30:26 AM

## 🔄 PR Creado - Implementación Completada

**PR:** [#36 - feat(invoices): add logo and business data to PDF](https://github.com/upex-galaxy/upex-soloq/pull/36)
**Branch:** feat/[https://upexgalaxy65.atlassian.net/browse/SQ-33#icft=SQ-33](https://upexgalaxy65.atlassian.net/browse/SQ-33#icft=SQ-33)/pdf-business-data
**Target:** staging

### Cambios Implementados

- Logo rendering en header del PDF (max 120x60px, aspect ratio preserved)
- Helper `isValidImageUrl()` para validar URLs antes de renderizar
- Fallback graceful cuando no hay logo o URL inválida
- Business data (name, tax_id, contact info) ya implementado en [https://upexgalaxy65.atlassian.net/browse/SQ-32#icft=SQ-32](https://upexgalaxy65.atlassian.net/browse/SQ-32#icft=SQ-32)

### Test Cases Cubiertos

| ***TC**** | ****Descripción**** | ****Status*** |
| --- | --- | --- |
| TC-01 | PDF con todos los campos completos | ✅ |
| TC-02 | PDF sin logo (fallback layout) | ✅ |
| TC-03 | Tax ID con formatos LATAM | ✅ |
| TC-04 | Business data con unicode LATAM | ✅ |
| TC-05 | Logo URL inválida (fallback) | ✅ |
| TC-06 | Campos opcionales vacíos | ✅ |
| TC-07 | Fetch business data desde DB | ✅ |
| TC-08 | Logo con transparencia PNG | ✅ |

**Estado:** Esperando code review

---

### Automation for Jira - 2/9/2026, 2:44:05 AM

✅ Pull Request is successfully MERGED. Task is Done.

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:55.838Z_
