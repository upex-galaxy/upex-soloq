# Implementation Plan: STORY-SQ-35 - Download PDF to Device

**Epic:** [SQ-31](https://upexgalaxy64.atlassian.net/browse/SQ-31) (PDF Generation)
**Story:** [SQ-35](https://upexgalaxy64.atlassian.net/browse/SQ-35)
**Created:** 2026-02-09
**Story Points:** 2

---

## Overview

Mejorar la funcionalidad de descarga de PDF para usar un formato de nombre de archivo profesional y prevenir descargas duplicadas.

**Acceptance Criteria:**

- AC1: Download from detail with filename `Invoice-{number}-{client}.pdf` ✅
- AC2: Download from list - **OUT OF SCOPE** (lista no implementada aún)
- AC3: Download from preview ✅ (ya funciona)
- AC4: Mobile download ✅ (browser maneja esto)
- AC5/AC6: Error handling ✅ (ya implementado con 404)

---

## Test Cases Coverage (from Jira)

| TC ID    | Test Case                          | Status             | Notes                |
| -------- | ---------------------------------- | ------------------ | -------------------- |
| TC-35-01 | Descarga exitosa desde detalle     | ✅ Implementar     | Mejorar filename     |
| TC-35-02 | Descarga desde lista               | ⏳ Out of scope    | Lista no existe      |
| TC-35-03 | Descarga desde preview             | ✅ Ya funciona     | -                    |
| TC-35-04 | Filename con caracteres especiales | ✅ Implementar     | Sanitización         |
| TC-35-05 | Descarga en iOS Safari             | ✅ Browser         | -                    |
| TC-35-06 | Descarga en Android Chrome         | ✅ Browser         | -                    |
| TC-35-07 | Error 404                          | ✅ Ya implementado | -                    |
| TC-35-08 | Seguridad - otro usuario           | ✅ Ya implementado | RLS en Supabase      |
| TC-35-09 | Descarga factura draft             | ✅ Ya funciona     | -                    |
| TC-35-10 | Truncado nombre largo              | ✅ Implementar     | Max 50 chars         |
| TC-35-11 | Prevención doble-click             | ✅ Implementar     | Loading state        |
| TC-35-12 | Headers API                        | N/A                | Client-side download |

---

## Technical Approach

**Current implementation:**

- `handleDownload` in `invoice-preview.tsx` uses simple filename: `${invoice.invoice_number}.pdf`
- No loading state during download
- No protection against double-clicks

**Changes needed:**

1. Add `sanitizeFilename()` helper in `pdf-utils.ts`
2. Add `generateInvoiceFilename()` helper
3. Update `handleDownload` to use new filename format
4. Add `isDownloading` state to prevent double-clicks
5. Show loading state on button during download

---

## Implementation Steps

### Step 1: Add filename sanitization helpers

**File:** `src/lib/utils/pdf-utils.ts`

**New functions:**

```typescript
/**
 * Sanitize text for use in filename
 * - Remove accents (á → a)
 * - Replace special chars with hyphen
 * - Remove consecutive hyphens
 * - Trim and limit length
 */
function sanitizeFilename(text: string, maxLength = 50): string;

/**
 * Generate invoice filename
 * Format: Invoice-{number}-{client}.pdf
 */
function generateInvoiceFilename(invoiceNumber: string, clientName: string): string;
```

**Test cases covered:** TC-35-04, TC-35-10

**Estimated time:** 20 min

---

### Step 2: Update handleDownload with new filename

**File:** `src/app/(app)/invoices/[id]/components/invoice-preview.tsx`

**Changes:**

1. Import new helpers from pdf-utils
2. Update filename generation to use `generateInvoiceFilename()`
3. Pass client name from invoice data

**Test cases covered:** TC-35-01, TC-35-03

**Estimated time:** 10 min

---

### Step 3: Add download loading state and debounce

**File:** `src/app/(app)/invoices/[id]/components/invoice-preview.tsx`

**Changes:**

1. Add `isDownloading` state
2. Set to true when download starts, false after complete
3. Disable button when `isDownloading` is true
4. Show Loader2 icon during download

**Test cases covered:** TC-35-11

**Estimated time:** 15 min

---

### Step 4: Lint, typecheck, build

**Commands:**

```bash
bun run lint
bun run typecheck
bun run build
```

**Estimated time:** 10 min

---

## Files to Modify

| File                                                         | Change                                                |
| ------------------------------------------------------------ | ----------------------------------------------------- |
| `src/lib/utils/pdf-utils.ts`                                 | Add `sanitizeFilename()`, `generateInvoiceFilename()` |
| `src/app/(app)/invoices/[id]/components/invoice-preview.tsx` | Update `handleDownload`, add `isDownloading` state    |

---

## Estimated Effort

| Step                     | Time       |
| ------------------------ | ---------- |
| 1. Filename helpers      | 20 min     |
| 2. Update handleDownload | 10 min     |
| 3. Loading state         | 15 min     |
| 4. Lint/Build            | 10 min     |
| **Total**                | **55 min** |

**Story points:** 2 (matches story.md)

---

## Definition of Done

- [ ] Filename format: `Invoice-{number}-{client}.pdf`
- [ ] Client name sanitized (no accents, special chars)
- [ ] Long names truncated (max 50 chars)
- [ ] Double-click prevented (loading state)
- [ ] Linting passes
- [ ] Build passes

---

_Created: 2026-02-09_
_Author: Claude Code_
