# Implementation Plan: STORY-SQ-33 - Include Logo and Business Data in PDF

**Epic:** [SQ-31](https://upexgalaxy64.atlassian.net/browse/SQ-31) (PDF Generation)
**Story:** [SQ-33](https://upexgalaxy64.atlassian.net/browse/SQ-33)
**Created:** 2026-02-09
**Story Points:** 3

---

## Overview

Implementar el renderizado del logo de negocio y datos de empresa en el PDF de factura, con fallback graceful cuando no hay logo configurado.

**Acceptance Criteria a cumplir:**

- AC1: Logo aparece en el header del PDF cuando esta configurado
- AC2: Business name se muestra prominentemente
- AC3: Contact info (email, phone, address) se muestra correctamente
- AC4: Tax ID (RFC/NIT/CUIT) se muestra correctamente
- AC5: Layout se ajusta gracefully cuando no hay logo

---

## Test Cases Coverage (from Jira)

| TC ID | Test Case                                    | AC              | Priority |
| ----- | -------------------------------------------- | --------------- | -------- |
| TC-01 | PDF con todos los campos completos           | AC1+AC2+AC3+AC4 | Critical |
| TC-02 | PDF sin logo (fallback layout)               | AC5             | Critical |
| TC-03 | Tax ID con formatos LATAM (RFC/NIT/CUIT)     | AC4             | High     |
| TC-04 | Business data con unicode LATAM (ñ, acentos) | AC2+AC3         | High     |
| TC-05 | Logo URL invalida (fallback)                 | AC5             | High     |
| TC-06 | Campos opcionales vacios                     | AC2+AC4         | Medium   |
| TC-07 | Fetch business data desde DB                 | All             | High     |
| TC-08 | Logo con transparencia PNG                   | AC1             | Medium   |

---

## Technical Approach

**Chosen approach:** Agregar componente `Image` de `@react-pdf/renderer` al header del PDF existente

**What exists (from SQ-32):**

- `invoice-document.tsx` con template PDF completo
- Business profile data (name, tax_id, address, email, phone) ya renderizado
- Hook `useInvoice` ya trae `logo_url` en business_profile

**What needs to be added:**

- Import `Image` from `@react-pdf/renderer`
- Logo rendering in header with proper scaling
- Conditional layout based on logo presence
- Error handling for invalid logo URLs

**Why this approach:**

- ✅ Minimal changes to existing code (SQ-32 did most work)
- ✅ react-pdf Image component handles scaling automatically
- ✅ Conditional rendering already natural in React
- ❌ Trade-off: react-pdf Image doesn't support all formats (SVG not supported)

---

## Implementation Steps

### Step 1: Add Logo to Header

**Task:** Modificar el header del PDF para incluir el logo

**File:** `src/app/(app)/invoices/[id]/components/invoice-document.tsx`

**Changes:**

1. Import `Image` from `@react-pdf/renderer`
2. Add new styles for logo container:
   - `logoContainer`: Fixed width/height for consistent sizing
   - `logo`: Max dimensions with object-fit contain
3. Modify header structure:
   - When logo exists: Logo left, business name center, invoice info right
   - When no logo: Business name left, invoice info right (current layout)

**Logo specifications (from spec §8.1):**

- Max width: 120px
- Max height: 60px
- Scaling: Maintain aspect ratio (objectFit: contain)

**Edge cases handled:**

- TC-02: No logo → Current layout (already works)
- TC-05: Invalid URL → Catch error, show fallback
- TC-08: Transparency → PNG transparency supported by react-pdf

**Testing:**

- Visual: Logo appears correctly sized in PDF
- Visual: No logo shows business name in header

**Estimated time:** 45 min

---

### Step 2: Handle Logo Loading Errors

**Task:** Agregar manejo de errores para URLs de logo invalidas

**File:** `src/app/(app)/invoices/[id]/components/invoice-document.tsx`

**Logic:**

Since react-pdf Image component doesn't have onError prop, we need to:

1. Validate URL format before rendering
2. Use conditional rendering based on URL validity
3. Add helper function `isValidImageUrl(url)`

**Validation rules:**

- URL must start with `http://` or `https://`
- URL must not be empty or only whitespace
- Consider Supabase Storage URLs as valid

**Testing:**

- TC-05: Invalid URL shows fallback layout

**Estimated time:** 20 min

---

### Step 3: Verify Unicode and LATAM Characters

**Task:** Verificar que caracteres especiales LATAM se renderizan correctamente

**File:** `src/lib/utils/pdf-utils.ts`

**Current implementation:**

- `sanitizeForPDF()` removes emojis only
- Unicode characters (ñ, á, é, etc.) should pass through

**Testing:**

- TC-04: Business name "Café Señor López S.A." renders correctly
- Verify Helvetica font supports LATAM characters (it does)

**Estimated time:** 15 min (verification only)

---

### Step 4: Test All Acceptance Criteria

**Task:** Verificar todos los test cases

**Manual Testing Checklist:**

1. **TC-01:** Create invoice with complete business profile (logo, name, all fields)
   - Expected: All data visible in PDF

2. **TC-02:** Create invoice with business profile without logo
   - Expected: Layout adjusts, business name in header

3. **TC-03:** Set tax_id with LATAM formats (RFC: XAXX010101000, CUIT: 20-12345678-9)
   - Expected: Tax ID renders correctly

4. **TC-04:** Set business name with unicode: "Compañía de México S.A."
   - Expected: Characters render correctly

5. **TC-05:** Set logo_url to invalid URL
   - Expected: Fallback layout (no broken image)

6. **TC-06:** Leave optional fields empty (no address, no phone)
   - Expected: PDF generates without errors

7. **TC-07:** Verify data comes from DB (not hardcoded)
   - Expected: Different business profiles show different data

8. **TC-08:** Upload PNG logo with transparency
   - Expected: Logo renders with transparency intact

**Estimated time:** 30 min

---

### Step 5: Build and Lint Verification

**Task:** Verificar que el codigo pasa linting y build

**Commands:**

```bash
bun run lint
bun run typecheck
bun run build
```

**Estimated time:** 10 min

---

## Technical Decisions

### Decision 1: Logo Size Handling

**Chosen:** Fixed container size (120x60) with Image objectFit: contain

**Reasoning:**

- ✅ Consistent layout regardless of logo dimensions
- ✅ Prevents oversized logos from breaking layout
- ✅ Maintains aspect ratio
- ❌ Trade-off: Very wide or very tall logos will have whitespace

### Decision 2: Error Handling for Invalid URLs

**Chosen:** Client-side URL validation before rendering

**Reasoning:**

- ✅ Prevents react-pdf rendering errors
- ✅ Graceful fallback to no-logo layout
- ❌ Trade-off: Can't detect broken URLs (404s), only malformed ones

---

## Dependencies

**Pre-requisitos tecnicos:**

- [x] SQ-32 completado (PDF template base) - DONE
- [x] Business profile data available in useInvoice hook - DONE
- [x] @react-pdf/renderer installed - DONE

---

## Risks & Mitigations

**Risk 1:** Logo URL returns 404 or times out

- **Impact:** Medium
- **Mitigation:** React-pdf handles this gracefully, shows nothing

**Risk 2:** Very large logo images cause slow PDF generation

- **Impact:** Low
- **Mitigation:** Logo should be optimized on upload (future US)

---

## Estimated Effort

| Step                  | Time        |
| --------------------- | ----------- |
| 1. Add Logo to Header | 45 min      |
| 2. Handle Logo Errors | 20 min      |
| 3. Verify Unicode     | 15 min      |
| 4. Test All ACs       | 30 min      |
| 5. Build/Lint         | 10 min      |
| **Total**             | **2 hours** |

**Story points:** 3 (matches story.md)

---

## Definition of Done Checklist

- [ ] Logo renders in PDF header when available
- [ ] Fallback layout works when no logo
- [ ] Business name displays prominently
- [ ] Contact info (email, phone, address) displays
- [ ] Tax ID displays correctly
- [ ] Unicode LATAM characters render correctly
- [ ] Invalid logo URLs don't break PDF
- [ ] Linting passes
- [ ] Build passes
- [ ] Manual testing of all 8 test cases

---

## Files to Modify

| File                                                          | Change                                        |
| ------------------------------------------------------------- | --------------------------------------------- |
| `src/app/(app)/invoices/[id]/components/invoice-document.tsx` | Add Image import, logo styles, logo rendering |
| `src/lib/utils/pdf-utils.ts`                                  | Add `isValidImageUrl()` helper (optional)     |

---

_Created: 2026-02-09_
_Author: Claude Code_
