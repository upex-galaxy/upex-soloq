# Implementation Plan: SQ-19 - Delete Client

## Story Summary

**As a** user
**I want to** delete a client I no longer use
**So that** I can keep my list clean

## Acceptance Test Plan (from Jira)

### Main Flow

| TC ID     | Description                                  | Expected Result                                  |
| --------- | -------------------------------------------- | ------------------------------------------------ |
| TC-DC-001 | Delete client successfully with confirmation | Client deleted, success message with ID and name |
| TC-DC-002 | Show confirmation modal                      | Modal displayed before deletion                  |

### Cancellation & Navigation

| TC ID     | Description                     | Expected Result                  |
| --------- | ------------------------------- | -------------------------------- |
| TC-DC-003 | Cancel deletion from modal      | Modal closes, client not deleted |
| TC-DC-004 | Navigate back before confirming | No deletion executed             |

### Concurrency

| TC ID     | Description                         | Expected Result             |
| --------- | ----------------------------------- | --------------------------- |
| TC-DC-005 | Client deleted by another user      | Error message, UI refreshes |
| TC-DC-006 | Retry delete already deleted client | Graceful handling, no crash |

### Negative Scenarios

| TC ID     | Description          | Expected Result                   |
| --------- | -------------------- | --------------------------------- |
| TC-DC-007 | Backend error        | Error message, client not deleted |
| TC-DC-008 | Network failure      | User informed, client unchanged   |
| TC-DC-009 | Unauthorized attempt | Permission error shown            |

### UX & Messaging

| TC ID     | Description                      | Expected Result                           |
| --------- | -------------------------------- | ----------------------------------------- |
| TC-DC-010 | Success message with client info | Shows ID and name                         |
| TC-DC-011 | Loading state on confirm         | Button shows loading, prevents duplicates |

## Technical Analysis

### Current State

- **Database**: `clients.deleted_at` column exists (soft delete pattern)
- **API**: GET and PUT exist, DELETE route needed
- **Hooks**: `useClients`, `useClient`, `useUpdateClient` exist
- **UI**: Client list and edit page exist

### Implementation Steps

#### 1. Add DELETE API Route

**File**: `src/app/api/clients/[id]/route.ts`

```typescript
export async function DELETE(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  // Auth check
  // Verify client exists
  // Soft delete: SET deleted_at = now()
  // Return 200 with client info for success message
}
```

#### 2. Create useDeleteClient Hook

**File**: `src/hooks/clients/use-delete-client.ts`

```typescript
export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
```

#### 3. Create DeleteClientDialog Component

**File**: `src/components/clients/delete-client-dialog.tsx`

- AlertDialog from shadcn/ui
- Shows client name in confirmation
- Loading state on confirm button
- Cancel and Delete actions

#### 4. Add Delete Button to Client List

**File**: `src/app/(app)/clients/page.tsx`

- Add delete button (Trash2 icon) to each row
- Wire up DeleteClientDialog

## Files to Create/Modify

| File                                              | Change                     |
| ------------------------------------------------- | -------------------------- |
| `src/app/api/clients/[id]/route.ts`               | Add DELETE handler         |
| `src/hooks/clients/use-delete-client.ts`          | New hook                   |
| `src/hooks/clients/index.ts`                      | Export new hook            |
| `src/components/clients/delete-client-dialog.tsx` | New component              |
| `src/app/(app)/clients/page.tsx`                  | Add delete button + dialog |

## Testing Checklist

- [ ] Delete client from list
- [ ] Confirm dialog appears
- [ ] Cancel keeps client
- [ ] Success toast shows client name
- [ ] Error handling works
- [ ] Loading state on button
- [ ] List refreshes after delete

## Dependencies

- SQ-14: Add New Client ✅
- SQ-15: List All Clients ✅ (where delete button will be)

---

_Generated: 2026-02-07_
