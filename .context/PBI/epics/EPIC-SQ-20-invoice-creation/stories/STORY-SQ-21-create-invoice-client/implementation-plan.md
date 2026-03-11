# Implementation Plan: SQ-21 - Create Invoice by Selecting Client

## Story Summary

**As a** user
**I want to** create a new invoice by selecting a client
**So that** I can start billing

## Acceptance Test Plan Summary

| TC ID | Description                                       | Priority |
| ----- | ------------------------------------------------- | -------- |
| TC-01 | Access invoice form via Create Invoice button     | Critical |
| TC-02 | Auto-populate client data on selection            | Critical |
| TC-03 | Filter clients when typing in search              | High     |
| TC-04 | Show "Add new client" when search has no results  | High     |
| TC-05 | Create client inline without leaving invoice flow | Critical |
| TC-06 | Empty state when user has no clients              | High     |
| TC-07 | Validation error when saving without client       | High     |
| TC-11 | API POST /api/invoices with valid clientId        | Critical |
| TC-12 | API rejects invalid clientId                      | High     |

## Technical Analysis

### Current State

- **Database**: `invoices` table exists with all required columns
- **Types**: `Invoice`, `InvoiceInsert`, `InvoiceWithClient` defined in `src/lib/types.ts`
- **UI**: `/invoices` page exists (placeholder), `/invoices/create` does NOT exist
- **API**: No invoice API routes exist
- **Hooks**: No invoice hooks exist, `useClients` exists for client data

### PO Decisions Applied

| Decision                 | Implementation                              |
| ------------------------ | ------------------------------------------- |
| Dropdown format          | `{name} ({email})`                          |
| Client editable in draft | Yes, dropdown enabled when status = 'draft' |
| Search client/server     | Hybrid: client-side <50, server-side >50    |
| Deleted client           | Warning + force new selection               |

## Implementation Steps

### Step 1: Create Invoice Validation Schema

**File**: `src/lib/validations/invoice.ts`

```typescript
export const createInvoiceSchema = z.object({
  clientId: z.string().uuid('Selecciona un cliente'),
  dueDate: z.string().optional(),
  notes: z.string().max(2000).optional(),
});
```

### Step 2: Create POST /api/invoices API Route

**File**: `src/app/api/invoices/route.ts`

- Validate request with Zod schema
- Verify client belongs to user (RLS handles this)
- Generate invoice_number (INV-YYYY-NNNN format)
- Create invoice with status='draft'
- Return created invoice with client data

**Response**: 201 with invoice object

### Step 3: Create useCreateInvoice Hook

**File**: `src/hooks/invoices/use-create-invoice.ts`

```typescript
export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
```

### Step 4: Create ClientSelector Component

**File**: `src/components/invoices/client-selector.tsx`

Features:

- Combobox (shadcn/ui) with search input
- Format: `{name} ({email})`
- Filter clients case-insensitive
- Empty state: "No tienes clientes aún"
- No results: "No se encontraron clientes" + Add button
- "Add new client" button always visible

```
data-testid:
- client-selector
- client-search-input
- client-option-{id}
- add-client-button
- no-clients-message
```

### Step 5: Create CreateClientDialog Component

**File**: `src/components/invoices/create-client-dialog.tsx`

- Reuse existing client form validation
- Modal/Dialog from shadcn/ui
- On success: close dialog + return new client
- Parent selects new client automatically

```
data-testid:
- create-client-dialog
- create-client-form
- create-client-submit
- create-client-cancel
```

### Step 6: Create Invoice Creation Page

**File**: `src/app/(app)/invoices/create/page.tsx`

Layout:

```
┌────────────────────────────────────────┐
│ Crear Factura                    [Cancelar] │
├────────────────────────────────────────┤
│ Cliente *                              │
│ [Combobox: Selecciona un cliente ▼]    │
│ + Agregar nuevo cliente                │
├────────────────────────────────────────┤
│ Fecha de vencimiento                   │
│ [DatePicker: +30 días default]         │
├────────────────────────────────────────┤
│ Notas (opcional)                       │
│ [Textarea]                             │
├────────────────────────────────────────┤
│           [Guardar como borrador]      │
└────────────────────────────────────────┘
```

Features:

- React Hook Form + Zod validation
- ClientSelector component
- CreateClientDialog for inline creation
- Due date defaults to +30 days
- Save creates draft invoice
- Redirect to `/invoices/{id}` on success
- Toast notification on success/error

```
data-testid:
- create-invoice-form
- client-selector (from component)
- due-date-picker
- invoice-notes-input
- save-invoice-button
```

## Files to Create/Modify

| File                                               | Change          |
| -------------------------------------------------- | --------------- |
| `src/lib/validations/invoice.ts`                   | New - schema    |
| `src/app/api/invoices/route.ts`                    | New - POST      |
| `src/hooks/invoices/use-create-invoice.ts`         | New - hook      |
| `src/hooks/invoices/index.ts`                      | New - exports   |
| `src/components/invoices/client-selector.tsx`      | New - component |
| `src/components/invoices/create-client-dialog.tsx` | New - component |
| `src/components/invoices/index.ts`                 | New - exports   |
| `src/app/(app)/invoices/create/page.tsx`           | New - page      |

## Test Cases Coverage

| TC    | Covered By                                      |
| ----- | ----------------------------------------------- |
| TC-01 | `/invoices/create` page renders correctly       |
| TC-02 | ClientSelector populates on selection           |
| TC-03 | ClientSelector filters on search                |
| TC-04 | ClientSelector shows "Add client" on no results |
| TC-05 | CreateClientDialog + auto-select                |
| TC-06 | ClientSelector empty state                      |
| TC-07 | Form validation before submit                   |
| TC-11 | POST /api/invoices with valid clientId          |
| TC-12 | POST /api/invoices rejects invalid clientId     |

## Dependencies

- SQ-14: Add New Client ✅ (client creation exists)
- SQ-15: List All Clients ✅ (useClients hook exists)

## Out of Scope (Future Stories)

- TC-08: Change client in draft (SQ-21 creates new, edit is different)
- TC-09: Block client in sent (requires status transitions)
- TC-10: Warning for deleted client (requires edit flow)
- Line items (SQ-22)
- Tax calculation (SQ-24)
- Due date presets (SQ-28)

---

_Generated: 2026-02-07_
