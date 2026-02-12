# Implementation Plan: STORY-SQ-30 - Save Invoice as Draft

## Overview

Implementar funcionalidad completa de guardado de facturas como borrador, incluyendo auto-guardado, edición, listado con filtros, y eliminación de drafts.

**Acceptance Criteria a cumplir:**

- AC1: Guardar factura como draft manualmente
- AC2: Auto-save con debounce de 2 segundos
- AC3: Filtrar lista de facturas por status "draft"
- AC4: Retomar edición de draft con datos intactos
- AC5: Eliminar draft con confirmación
- AC6: Transición draft → sent con validación completa

---

## Technical Approach

**Chosen approach:** Implementación incremental backend-first con auto-save basado en React Hook Form + debounce

**Alternatives considered:**

- **Local Storage + Sync:** Guardar en localStorage y sincronizar - Rechazado: complejidad de conflictos, no funciona entre dispositivos
- **Real-time Supabase:** Usar Supabase real-time para auto-save - Rechazado: over-engineering para el caso de uso

**Why this approach:**

- ✅ Debounce de 2s previene requests excesivos
- ✅ React Query maneja cache y invalidación automáticamente
- ✅ Simplicidad: PUT endpoint + hook + dirty tracking
- ❌ Trade-off: Si usuario cierra browser durante debounce, pierde últimos 2s de cambios

---

## Test Cases Mapping (12 TCs from Shift-Left QA)

| TC    | Test Case                                  | Implementation Step |
| ----- | ------------------------------------------ | ------------------- |
| TC-01 | Save invoice as draft with manual button   | Steps 1, 5, 6       |
| TC-02 | Auto-save after 2s debounce                | Step 5              |
| TC-03 | Filter invoices list to show only drafts   | Steps 2, 7          |
| TC-04 | Resume editing draft with all data intact  | Steps 3, 6, 8       |
| TC-05 | Delete draft with confirmation             | Steps 4, 8          |
| TC-06 | Transition draft to sent with validation   | Step 9              |
| TC-07 | Reject sending incomplete draft            | Step 9              |
| TC-08 | Drafts not counted as pending in dashboard | N/A (no dashboard)  |
| TC-09 | Auto-save failure handling                 | Step 5              |
| TC-10 | No empty draft on page visit without data  | Step 5              |
| TC-11 | Unsaved changes warning                    | Step 5              |
| TC-12 | Prevent deleting non-draft invoices        | Step 4              |

---

## Implementation Steps

### **Step 1: GET /api/invoices - List invoices with filters**

**Task:** Crear endpoint para listar facturas del usuario con soporte de filtros por status

**File:** `src/app/api/invoices/route.ts` (agregar GET handler)

**Details:**

- Query params: `status` (optional), `page`, `limit`
- Returns: paginated list with client info
- RLS: solo facturas del usuario autenticado
- Sort: `updated_at` DESC (más recientes primero)

**Response format:**

```typescript
{
  success: true,
  invoices: InvoiceWithClient[],
  pagination: { page, limit, total, totalPages }
}
```

**Testing:** TC-03 (filter by draft status)

---

### **Step 2: PUT /api/invoices/[id] - Update invoice**

**Task:** Crear endpoint para actualizar facturas draft

**File:** `src/app/api/invoices/[id]/route.ts` (agregar PUT handler)

**Details:**

- Solo permite actualizar si `status === 'draft'`
- Valida que invoice pertenece al usuario
- Actualiza campos: clientId, dueDate, notes, terms, taxRate, invoiceNumber
- Recalcula subtotal, tax_amount, total si cambian items o tax_rate
- Actualiza `updated_at` timestamp

**Edge cases handled:**

- Invoice not found: 404
- Invoice not draft: 400 "Only draft invoices can be edited"
- Not owner: 403

**Testing:** TC-01, TC-02, TC-04

---

### **Step 3: DELETE /api/invoices/[id] - Delete draft**

**Task:** Crear endpoint para eliminar facturas draft

**File:** `src/app/api/invoices/[id]/route.ts` (agregar DELETE handler)

**Details:**

- Solo permite eliminar si `status === 'draft'`
- Hard delete (no soft delete para drafts)
- Cascade delete `invoice_items` automáticamente (FK constraint)

**Edge cases handled:**

- Invoice not found: 404
- Invoice not draft: 400 "Only draft invoices can be deleted" (TC-12)
- Not owner: 403

**Testing:** TC-05, TC-12

---

### **Step 4: useInvoices hook - List invoices**

**Task:** Crear hook para obtener lista de facturas con filtros

**File:** `src/hooks/invoices/use-invoices.ts`

**Details:**

```typescript
function useInvoices(options?: { status?: InvoiceStatus }) {
  return useQuery({
    queryKey: ['invoices', options?.status],
    queryFn: () => fetchInvoices(options),
    staleTime: 30_000,
  });
}
```

**Testing:** TC-03

---

### **Step 5: useUpdateInvoice hook - Update invoice**

**Task:** Crear hook para actualizar facturas

**File:** `src/hooks/invoices/use-update-invoice.ts`

**Details:**

```typescript
function useUpdateInvoice() {
  return useMutation({
    mutationFn: (data: { id: string; updates: Partial<Invoice> }) => updateInvoice(data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(['invoice', id]);
      queryClient.invalidateQueries(['invoices']);
    },
  });
}
```

**Testing:** TC-01, TC-02

---

### **Step 6: useDeleteInvoice hook - Delete draft**

**Task:** Crear hook para eliminar drafts

**File:** `src/hooks/invoices/use-delete-invoice.ts`

**Details:**

```typescript
function useDeleteInvoice() {
  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
    },
  });
}
```

**Testing:** TC-05

---

### **Step 7: useAutoSave hook - Debounced auto-save**

**Task:** Crear hook para auto-guardado con debounce de 2 segundos

**File:** `src/hooks/invoices/use-auto-save.ts`

**Details:**

```typescript
function useAutoSave(invoiceId: string | null, formValues: InvoiceFormData) {
  const { mutate: updateInvoice, isPending, isError } = useUpdateInvoice();
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Debounce de 2 segundos
  const debouncedSave = useDebouncedCallback(values => {
    if (invoiceId && isDirty) {
      updateInvoice(
        { id: invoiceId, updates: values },
        {
          onSuccess: () => {
            setIsDirty(false);
            setLastSaved(new Date());
          },
        }
      );
    }
  }, 2000);

  // Watch form changes
  useEffect(() => {
    if (invoiceId) {
      setIsDirty(true);
      debouncedSave(formValues);
    }
  }, [formValues]);

  return { isDirty, isSaving: isPending, isError, lastSaved };
}
```

**Edge cases handled:**

- TC-09: isError state shows "Save failed" indicator
- TC-10: No save if no invoiceId (new form without data)
- TC-11: isDirty tracks unsaved changes for navigation warning

**Testing:** TC-02, TC-09, TC-10, TC-11

---

### **Step 8: Invoices List Page - Full implementation**

**Task:** Implementar página de listado de facturas con filtros

**File:** `src/app/(app)/invoices/page.tsx` (reemplazar placeholder)

**Details:**

- Status filter dropdown: All, Draft, Sent, Paid, Overdue
- Table/cards showing: Invoice #, Client, Status badge, Total, Updated date
- Empty state por status filtrado
- Click on draft → `/invoices/[id]/edit`
- Click on sent/paid → `/invoices/[id]` (view only)

**Components to create:**

- `InvoiceStatusBadge` - Badge coloreado por status
- `InvoiceList` - Lista/tabla de invoices
- `InvoiceListFilters` - Filtros de status

**Testing:** TC-03

---

### **Step 9: Edit Invoice Page**

**Task:** Crear página para editar drafts existentes

**File:** `src/app/(app)/invoices/[id]/edit/page.tsx`

**Details:**

- Reutiliza componentes del create form
- Carga datos existentes con useInvoice hook
- Auto-save habilitado después de cargar datos
- "Save Draft" button (manual save)
- "Delete Draft" button con confirmación (dialog)
- "Send Invoice" button con validación

**States:**

- Loading: Skeleton del form
- Error: Error message + retry
- Ready: Form poblado con datos

**Auto-save indicators (TC-02):**

- "Saving..." durante request
- "Draft saved [timestamp]" on success
- "Save failed" on error (TC-09)

**Navigation warning (TC-11):**

- useBeforeUnload hook para prevenir navegación con cambios no guardados

**Testing:** TC-01, TC-02, TC-04, TC-05, TC-09, TC-11

---

### **Step 10: Send Invoice Flow (draft → sent)**

**Task:** Implementar transición de draft a sent con validación

**File:**

- `src/app/api/invoices/[id]/send/route.ts` (nuevo endpoint)
- Dialog en edit page

**Validation rules (TC-06, TC-07):**

- Client selected (clientId required)
- At least 1 line item (items.length > 0)
- Due date set (dueDate required)

**Error messages:**

- "Please select a client"
- "Add at least one line item"
- "Set a due date"

**On success:**

- Status changes to 'sent'
- `sent_at` timestamp set
- Invoice becomes read-only
- Redirect to detail page

**Testing:** TC-06, TC-07

---

## Dependencies

**Pre-requisitos técnicos:**

- [x] POST /api/invoices existe
- [x] GET /api/invoices/[id] existe
- [x] useCreateInvoice hook existe
- [x] useInvoice hook existe
- [ ] Line items (SQ-22) - **NOTA:** El send validation requiere items, pero SQ-22 no está implementado. Workaround: skip item validation o mock items para MVP.

**Packages a agregar:**

- `use-debounce` - Para debounce en auto-save (ya instalado o usar implementación manual)

---

## Risks & Mitigations

**Risk 1:** Line items (SQ-22) no implementado - Send validation requiere at least 1 item

- **Impact:** High
- **Mitigation:** Para MVP, permitir enviar sin items O crear items dummy al crear invoice

**Risk 2:** Race conditions en auto-save concurrente

- **Impact:** Medium
- **Mitigation:** Debounce de 2s previene mayoría de casos. Last-write-wins aceptable para MVP.

**Risk 3:** Browser crash pierde últimos 2s de cambios

- **Impact:** Low
- **Mitigation:** Auto-save frecuente minimiza pérdida. Documentar como limitación conocida.

---

## Estimated Effort

| Step | Description                  | Time    |
| ---- | ---------------------------- | ------- |
| 1    | GET /api/invoices (list)     | 30 min  |
| 2    | PUT /api/invoices/[id]       | 30 min  |
| 3    | DELETE /api/invoices/[id]    | 20 min  |
| 4    | useInvoices hook             | 15 min  |
| 5    | useUpdateInvoice hook        | 15 min  |
| 6    | useDeleteInvoice hook        | 10 min  |
| 7    | useAutoSave hook             | 45 min  |
| 8    | Invoices list page + filters | 60 min  |
| 9    | Edit invoice page            | 90 min  |
| 10   | Send invoice flow            | 45 min  |
|      | **Total**                    | **~6h** |

**Story points:** 5 (matches estimation from Shift-Left QA)

---

## Definition of Done Checklist

- [ ] GET /api/invoices returns paginated list with status filter
- [ ] PUT /api/invoices/[id] updates draft invoices only
- [ ] DELETE /api/invoices/[id] deletes draft invoices only (TC-12)
- [ ] useInvoices hook fetches invoices with filters
- [ ] useUpdateInvoice hook updates invoices
- [ ] useDeleteInvoice hook deletes drafts
- [ ] useAutoSave hook implements 2s debounce auto-save (TC-02)
- [ ] Invoices list page shows all invoices with status badges
- [ ] Status filter works (TC-03)
- [ ] Edit page loads existing draft data (TC-04)
- [ ] Manual save button works (TC-01)
- [ ] Auto-save indicators shown (TC-02)
- [ ] Delete with confirmation dialog (TC-05)
- [ ] Unsaved changes warning on navigation (TC-11)
- [ ] Empty form doesn't create draft (TC-10)
- [ ] Auto-save failure shows error (TC-09)
- [ ] Send validation: client, items, due date (TC-06, TC-07)
- [ ] Non-draft invoices cannot be deleted via API (TC-12)
- [ ] Linting passes
- [ ] Build passes
- [ ] Zero TypeScript errors

---

**Created:** 2026-02-12
**Author:** Claude Code
