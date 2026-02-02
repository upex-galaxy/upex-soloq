# Feature Test Plan: STORY-SQ-33 - Include Logo and Business Data in PDF

**Fecha:** 2026-02-02  
**QA Lead:** Arkaitz  
**Story Jira Key:** [SQ-33](https://upexgalaxy64.atlassian.net/browse/SQ-33)  
**Epic:** [SQ-31](https://upexgalaxy64.atlassian.net/browse/SQ-31) - PDF Generation & Download  
**Status:** Ready for Review  
**Story Points (Dev):** 3  
**Story Points (QA):** 1

---

## 📋 Scope

**Esta historia cubre:**

- Renderizado de logo en PDF header (ya subido en business profile)
- Renderizado de business data en PDF (business_name, email, phone, address, tax_id)
- Fallback layout cuando logo no existe

**NO cubre:**

- Upload de logo → EPIC-SQ-7
- Edición de business data → EPIC-SQ-7
- Generación base del PDF → STORY-SQ-32
- Validaciones de campos → EPIC-SQ-7

---

## 📊 Test Cases Summary

| ID    | Test Case                          | AC Coverage     | Priority | Type        |
| ----- | ---------------------------------- | --------------- | -------- | ----------- |
| TC-01 | PDF con todos los campos completos | AC1+AC2+AC3+AC4 | Critical | Functional  |
| TC-02 | PDF sin logo (fallback layout)     | AC5             | Critical | Functional  |
| TC-03 | Tax ID con formatos LATAM          | AC4             | High     | Functional  |
| TC-04 | Business data con unicode LATAM    | AC2+AC3         | High     | Functional  |
| TC-05 | Logo URL inválida (fallback)       | AC5             | High     | Negative    |
| TC-06 | Campos opcionales vacíos           | AC2+AC4         | Medium   | Functional  |
| TC-07 | Fetch business data desde DB       | Todos           | High     | Integration |
| TC-08 | Logo con transparencia PNG         | AC1             | Medium   | Functional  |

**Total:** 8 test cases  
**Breakdown:** 6 Functional, 1 Negative, 1 Integration  
**Execution Time:** 1 día  
**AC Coverage:** 100% (5 AC validados)

---

## 🎯 Test Cases (8 casos - Esenciales)

### ✅ TC-01: PDF con todos los campos completos

**AC Coverage:** AC1 + AC2 + AC3 + AC4  
**Priority:** Critical

**Preconditions:**

- business_profile con:
  - logo_url válida (PNG)
  - business_name = "Diseño Gráfico Carlos"
  - tax_id = "CABC850101ABC"
  - address = "Calle Principal 123, CDMX"
  - email = "carlos@diseno.com"
  - phone = "+52 55 1234 5678"

**Steps:**

1. Generate PDF desde invoice

**Expected:**

- ✅ Logo aparece en header (AC1)
- ✅ business_name aparece prominentemente (AC2)
- ✅ email, phone, address aparecen (AC3)
- ✅ tax_id aparece (AC4)

---

### ✅ TC-02: PDF sin logo (fallback layout)

**AC Coverage:** AC5  
**Priority:** Critical

**Preconditions:**

- logo_url = null
- Resto de campos completos

**Steps:**

1. Generate PDF

**Expected:**

- ✅ Layout ajusta gracefully sin logo (AC5)
- ✅ Business data visible y bien alineado
- ✅ Sin espacio vacío donde iría logo

---

### ✅ TC-03: Tax ID con formatos LATAM

**AC Coverage:** AC4  
**Priority:** High

**Preconditions:**

- 3 profiles con:
  - MX: tax_id = "CABC850101ABC" (RFC)
  - CO: tax_id = "900123456-7" (NIT)
  - AR: tax_id = "20-12345678-9" (CUIT)

**Steps:**

1. Generate 3 PDFs

**Expected:**

- ✅ Los 3 Tax IDs se renderizan correctamente (AC4)
- ✅ Formato preservado

---

### ✅ TC-04: Business data con caracteres unicode LATAM

**AC Coverage:** AC2 + AC3  
**Priority:** High

**Preconditions:**

- business_name = "Diseño Ñoño & Co™"
- address = "Calle José María 123, São Paulo"

**Steps:**

1. Generate PDF

**Expected:**

- ✅ Caracteres ñ, á, é, í, ó, ú, ã se renderizan correctamente (AC2, AC3)
- ✅ Sin símbolos raros (�)

---

### ✅ TC-05: Logo URL inválida (fallback)

**AC Coverage:** AC5 (negative test)  
**Priority:** High

**Preconditions:**

- logo_url = "https://storage.supabase.co/deleted.png" (404)

**Steps:**

1. Generate PDF

**Expected:**

- ✅ PDF se genera con fallback layout (AC5)
- ✅ No crash
- ✅ Business data visible

---

### ✅ TC-06: Campos opcionales vacíos

**AC Coverage:** AC2 + AC3 (configuración mínima)  
**Priority:** Medium

**Preconditions:**

- Solo business_name + tax_id válidos
- logo_url = null
- address = null
- email = null
- phone = null

**Steps:**

1. Generate PDF

**Expected:**

- ✅ PDF se genera con business_name + tax_id (AC2 + AC4)
- ✅ Sin campos "null" visibles
- ✅ Layout mínimo pero profesional

---

### ✅ TC-07: Fetch business data desde DB

**AC Coverage:** Todos (integration)  
**Priority:** High

**Preconditions:**

- Invoice vinculada a user con business_profile completo

**Steps:**

1. Generate PDF → query business_profiles → render

**Expected:**

- ✅ Todos los campos DB aparecen en PDF
- ✅ Sin datos faltantes

---

### ✅ TC-08: Logo con transparencia PNG

**AC Coverage:** AC1 (technical notes)  
**Priority:** Medium

**Preconditions:**

- logo_url apunta a PNG con canal alpha

**Steps:**

1. Generate PDF

**Expected:**

- ✅ Logo se renderiza con transparencia (AC1 + Technical Notes)
- ✅ Fondo del PDF visible

---

## 🗂️ Test Data Requirements

### Business Profiles (6 perfiles)

| ID  | Logo         | business_name           | tax_id  | address          | email   | phone   | Test Cases   |
| --- | ------------ | ----------------------- | ------- | ---------------- | ------- | ------- | ------------ |
| P1  | ✅ PNG       | "Diseño Gráfico Carlos" | RFC MX  | Completo         | ✅      | ✅      | TC-01, TC-07 |
| P2  | ❌ null      | "Carlos Design"         | RFC MX  | Completo         | ✅      | ✅      | TC-02        |
| P3  | ✅ PNG       | "Carlos CO"             | NIT CO  | Completo         | ✅      | ✅      | TC-03        |
| P4  | ✅ PNG       | "Carlos AR"             | CUIT AR | Completo         | ✅      | ✅      | TC-03        |
| P5  | ✅ PNG       | "Diseño Ñoño™"          | RFC MX  | "José María 123" | ✅      | ✅      | TC-04        |
| P6  | 404 URL      | "Carlos"                | RFC MX  | Completo         | ✅      | ✅      | TC-05        |
| P7  | ❌ null      | "Carlos Minimal"        | RFC MX  | ❌ null          | ❌ null | ❌ null | TC-06        |
| P8  | ✅ PNG alpha | "Carlos Alpha"          | RFC MX  | Completo         | ✅      | ✅      | TC-08        |

### Logos (2 archivos)

- `logo-standard.png` (200x200px)
- `logo-alpha.png` (PNG con transparencia)

---

## ✅ Entry/Exit Criteria

### Entry Criteria

- [ ] STORY-SQ-32 (Generate PDF) completado
- [ ] EPIC-SQ-7 (Business Profile) completado
- [ ] 8 business profiles en staging DB
- [ ] 2 logos en Supabase Storage

### Exit Criteria

- [ ] 8/8 test cases ejecutados
- [ ] TC-01, TC-02, TC-07 (críticos) 100% passing
- [ ] TC-03, TC-04, TC-05 (high) 100% passing
- [ ] TC-06, TC-08 (medium) >=95% passing
- [ ] No bugs críticos o high abiertos

---

## 📅 Testing Timeline

**Estimated Duration:** 1 día

- **AM:** Test data prep (8 profiles + 2 logos)
- **AM:** TC-01, TC-02 (golden paths)
- **PM:** TC-03 a TC-08 (variaciones + negativos)

---

## 📊 AC Coverage

| AC                        | Test Cases          | Status  |
| ------------------------- | ------------------- | ------- |
| **AC1:** Logo display     | TC-01, TC-05, TC-08 | ✅ 100% |
| **AC2:** Business name    | TC-01, TC-04, TC-06 | ✅ 100% |
| **AC3:** Contact info     | TC-01, TC-04, TC-06 | ✅ 100% |
| **AC4:** Tax ID           | TC-01, TC-03, TC-06 | ✅ 100% |
| **AC5:** No logo fallback | TC-02, TC-05        | ✅ 100% |

---

## 📈 Story Points Analysis

### Development: 3 SP (~2-3 días)

**Justificación:**

- Setup PDF component + data fetching: 1 día
- Logo scaling + fallback layout: 1 día
- Unicode support + unit tests: 0.5 día

**Complejidad:** Medium (integración @react-pdf/renderer)

---

### Testing: 1 SP (~1 día)

**Justificación:**

- Test data prep: 0.25 día (8 profiles simples)
- Test execution: 0.5 día (8 casos rápidos)
- Bug fixing: 0.25 día

**Complejidad:** Low (8 casos straightforward, validación visual simple)

---

### Total Story: 4 SP (3 dev + 1 qa)

**Ratio Dev:QA:** 75% dev / 25% testing

**Justificación del ratio:**

- Feature straightforward (renderizado de datos)
- AC claros y verificables visualmente
- No requiere QA exploratorio extenso
- Validación mayormente visual (rápida)

---

**Documentation Status:** ✅ Listo (Mínimo Esencial)  
**Generated:** 2026-02-02 por Arkaitz (QA Lead)  
**Version:** 4.0 (Final - Solo Esenciales)  
**Test Cases:** 8 (reducido de 18, solo lo necesario para validar 5 AC)

---

_Feature Test Plan - SoloQ_  
_Spec-Driven Testing - Minimal Essential Coverage_
