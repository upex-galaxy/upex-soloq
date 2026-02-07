# Implementation Plan: STORY-SQ-16 - Edit Client Data

## Overview

Implementar funcionalidad para editar datos de clientes existentes, reutilizando el `ClientForm` existente de SQ-14.

**Acceptance Criteria a cumplir (desde Jira - QA Refinements):**

1. Edición exitosa de datos básicos (name, email, company, phone, address, notes)
2. Edición exitosa del email con validación de formato
3. Error por datos inválidos (email malformado, name vacío)
4. Rechazo por email duplicado del mismo usuario (409 Conflict)
5. Límites de longitud aceptados (name: 100, email: 254, phone: 20, address: 500, notes: 1000)

---

## Technical Approach

**Chosen approach:** Reutilizar `ClientForm` existente en modo edición con nueva página y API endpoint.

**Alternatives considered:**

- Modal inline edit: Descartado por UX inconsistente con create
- Separate edit form component: Descartado, ClientForm ya soporta `defaultValues`

**Why this approach:**

- ✅ Reutiliza 100% del ClientForm existente
- ✅ Misma validación Zod client/server
- ✅ UX consistente entre create y edit
- ✅ Menos código nuevo, menos bugs potenciales

---

## Test Cases Coverage (desde Jira Comments)

| TC    | Escenario                              | Tipo        | Prioridad | Cubierto por Step |
| ----- | -------------------------------------- | ----------- | --------- | ----------------- |
| TC-01 | Guardado exitoso de datos básicos      | Positive    | Critical  | Step 3, 4         |
| TC-02 | Cambio de email con formato válido     | Positive    | High      | Step 3, 4         |
| TC-03 | Error de validación con email inválido | Negative    | High      | Step 2 (Zod)      |
| TC-04 | Error cuando el nombre está vacío      | Negative    | High      | Step 2 (Zod)      |
| TC-05 | Rechazo por email duplicado            | Negative    | High      | Step 2            |
| TC-06 | Aceptación de límites de longitud      | Boundary    | Medium    | Step 2 (Zod)      |
| TC-07 | Rechazo al exceder límites             | Boundary    | Medium    | Step 2 (Zod)      |
| TC-08 | Integration Frontend -> API -> DB      | Integration | High      | Step 2, 3, 4      |

---

## Implementation Steps

### **Step 1: Create API Route `/api/clients/[id]/route.ts`**

**Task:** Crear endpoint para GET (single client) y PUT (update client)

**File:** `src/app/api/clients/[id]/route.ts`

**Details:**

- GET `/api/clients/[id]`: Retorna un cliente por ID
  - Verificar autenticación
  - RLS maneja aislamiento de usuarios
  - 404 si no existe o está deleted

- PUT `/api/clients/[id]`: Actualiza cliente existente
  - Validar body con `clientFormSchema`
  - Verificar email duplicado (excluyendo el cliente actual)
  - Actualizar `updated_at` automáticamente
  - Retornar 200 con cliente actualizado

**Edge cases handled:**

- Email duplicado: 409 Conflict con mensaje "Ya existe un cliente con este email"
- Cliente no encontrado: 404 Not Found
- Cliente de otro usuario: RLS lo filtra automáticamente → 404

**Testing:**

- TC-02, TC-05, TC-08 cubiertos

---

### **Step 2: Create Hook `use-client.ts`**

**Task:** Hook para obtener un cliente por ID

**File:** `src/hooks/clients/use-client.ts`

**Structure:**

```typescript
export function useClient(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => fetchClient(id),
    enabled: !!id,
  });
}
```

**Testing:**

- Soporta TC-01, TC-02 (cargar datos para edición)

---

### **Step 3: Create Hook `use-update-client.ts`**

**Task:** Mutation hook para actualizar cliente

**File:** `src/hooks/clients/use-update-client.ts`

**Structure:**

```typescript
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateClient(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
```

**Testing:**

- TC-01, TC-02, TC-05, TC-08 cubiertos

---

### **Step 4: Create Page `/clients/[id]/page.tsx`**

**Task:** Página de detalle/edición de cliente

**File:** `src/app/(app)/clients/[id]/page.tsx`

**Structure:**

- Fetch cliente con `useClient(id)`
- Mostrar `ClientForm` con `defaultValues` del cliente
- Loading state con skeleton
- Error state con mensaje y retry
- On submit: `useUpdateClient` mutation
- Toast de éxito/error
- Mantener en página después de guardar (no redirect)

**UI States:**

- **Loading:** Skeleton del formulario
- **Error:** Card con mensaje + botón reintentar
- **Success:** Toast "Cliente actualizado correctamente"
- **Validation Error:** Mensajes inline en campos (ya manejado por form)

**Testing:**

- TC-01, TC-02, TC-03, TC-04, TC-06, TC-07 cubiertos

---

### **Step 5: Add loading.tsx and error.tsx for [id] route**

**Task:** Crear loading y error states para la ruta dinámica

**Files:**

- `src/app/(app)/clients/[id]/loading.tsx`
- `src/app/(app)/clients/[id]/error.tsx`

**Testing:**

- UX consistente con el resto de la app

---

### **Step 6: Update barrel exports**

**Task:** Exportar nuevos hooks desde index

**Files:**

- `src/hooks/clients/index.ts` - agregar `use-client`, `use-update-client`

---

### **Step 7: Add navigation from ClientsTable**

**Task:** Hacer que click en fila de ClientsTable navegue a `/clients/[id]`

**File:** `src/components/clients/clients-table.tsx`

**Details:**

- Ya existe `onClick` handler que navega a `/clients/${client.id}`
- Verificar que funciona correctamente

---

## Dependencies

**Pre-requisitos técnicos:**

- [x] ClientForm con prop `defaultValues` (SQ-14)
- [x] clientFormSchema con validaciones (SQ-14)
- [x] `/api/clients/route.ts` con patrón establecido (SQ-14)
- [x] React Query configurado (SQ-15)

---

## Estimated Effort

| Step      | Description            | Time      |
| --------- | ---------------------- | --------- |
| 1         | API Route GET/PUT      | 30min     |
| 2         | use-client hook        | 10min     |
| 3         | use-update-client hook | 15min     |
| 4         | Edit page              | 30min     |
| 5         | Loading/Error states   | 10min     |
| 6         | Barrel exports         | 5min      |
| 7         | Verify navigation      | 5min      |
| **Total** |                        | **~1.5h** |

**Story points:** 2 (matches story.md)

---

## Definition of Done Checklist

- [ ] API endpoint GET/PUT `/api/clients/[id]` funciona
- [ ] Hook `useClient` obtiene cliente por ID
- [ ] Hook `useUpdateClient` actualiza cliente
- [ ] Página `/clients/[id]` muestra formulario con datos
- [ ] Edición guarda correctamente (200 OK)
- [ ] Email duplicado rechazado (409 Conflict)
- [ ] Validación client-side funciona
- [ ] Límites de longitud respetados
- [ ] Loading y error states implementados
- [ ] Toast de éxito/error mostrado
- [ ] Navigation desde tabla funciona
- [ ] Linting passes (`bun run lint`)
- [ ] Build passes (`bun run build`)
- [ ] Zero TypeScript errors

---

**Output:** Archivo listo para implementación
**Última actualización:** 2026-02-07
