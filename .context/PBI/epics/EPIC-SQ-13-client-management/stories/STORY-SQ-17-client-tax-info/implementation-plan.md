# Implementation Plan: SQ-17 - Add Client Tax Information

## Story Summary

**As a** user
**I want to** add client tax information (RFC/NIT/CUIT)
**So that** I can include it in invoices

## Acceptance Test Plan (from Jira)

### Core Test Cases (MVP Scope)

| TC ID    | Description                     | Expected Result                        |
| -------- | ------------------------------- | -------------------------------------- |
| TC-1.1   | Add valid tax_id                | Saved successfully, confirmation shown |
| TC-1.2   | Invalid tax_id format           | Error message, not saved               |
| TC-1.3   | Invalid tax_id length           | Error message, not saved               |
| TC-3.1   | Empty tax_id field              | No errors, saves without tax_id        |
| TC-5.3.1 | Edit existing tax_id            | Updates correctly, persists            |
| TC-5.3.3 | Clear tax_id (empty field)      | Removes tax_id from profile            |
| TC-5.5.1 | Clear validation error messages | Specific, informative errors           |
| TC-5.5.2 | Success confirmation message    | Toast "Información fiscal guardada"    |

### Out of Scope (Future Stories)

- TC-2.1: Tax ID appears on invoice (SQ-20 Invoice Epic)
- TC-5.2.x: Country-specific validation (RFC/NIT/CUIT) - Phase 2
- TC-5.4.1: Country change revalidation - Phase 2
- TC-5.6.x: Concurrency, interruptions - Non-functional

## Technical Analysis

### Current State

- **Database**: `clients.tax_id` column already exists (varchar, nullable)
- **Form**: `ClientForm` does NOT include tax_id field
- **Validation**: `clientFormSchema` does NOT include tax_id
- **API**: GET/PUT `/api/clients/[id]` already handles all client fields

### Implementation Steps

#### 1. Update Zod Validation Schema

**File**: `src/lib/validations/client.ts`

```typescript
// Add tax_id field (optional, max 30 chars)
tax_id: z.string()
  .max(30, 'El ID fiscal no puede exceder 30 caracteres')
  .optional()
  .or(z.literal(''));
```

#### 2. Update ClientForm Component

**File**: `src/components/clients/client-form.tsx`

Add tax_id input field:

- Position: After company/phone row
- Label: "ID Fiscal (RFC/NIT/CUIT)"
- Placeholder: "Ej: XAXX010101000"
- Optional field indicator
- data-testid: "client-taxid-input"

#### 3. Update API Route (Already Handles It)

**File**: `src/app/api/clients/[id]/route.ts`

The PUT handler already spreads `validationResult.data` which will include tax_id once added to schema. Only need to ensure the field is passed through:

```typescript
tax_id: tax_id || null,
```

#### 4. Regenerate TypeScript Types

Ensure `tax_id` field is properly typed from Supabase:

```bash
bun supabase:types
```

## Files to Modify

| File                                     | Change                           |
| ---------------------------------------- | -------------------------------- |
| `src/lib/validations/client.ts`          | Add tax_id to schema             |
| `src/components/clients/client-form.tsx` | Add tax_id input field           |
| `src/app/api/clients/[id]/route.ts`      | Ensure tax_id is handled in PUT  |
| `src/app/api/clients/route.ts`           | Ensure tax_id is handled in POST |

## Testing Checklist

- [ ] Add valid tax_id to new client
- [ ] Add valid tax_id to existing client (edit)
- [ ] Leave tax_id empty (optional)
- [ ] Clear existing tax_id
- [ ] Exceed max length (30 chars) - error shown
- [ ] Form preserves tax_id on page reload (edit mode)

## Dependencies

- SQ-14: Add New Client ✅ (MERGED)
- SQ-15: List All Clients ✅ (MERGED)
- SQ-16: Edit Client Data ✅ (MERGED)

---

_Generated: 2026-02-07_
