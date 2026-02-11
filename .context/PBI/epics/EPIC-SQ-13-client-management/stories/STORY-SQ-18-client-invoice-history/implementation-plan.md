# Implementation Plan: STORY-SQ-18 - View Client Invoice History

## Overview

Implementar la visualización del historial de facturas de un cliente específico, incluyendo un resumen de totales (facturado, pagado, pendiente) y un listado detallado con navegación a cada factura.

**Acceptance Criteria a cumplir:**

- [ ] Mostrar lista de todas las facturas enviadas al cliente (Scenario 1)
- [ ] Ver resumen de totales: Total facturado, Pagado y Pendiente (Scenario 3)
- [ ] Listado incluye: número, fecha, monto y estado (Scenario 2)
- [ ] Navegación funcional al detalle de la factura

---

## Technical Approach

**Chosen approach:**
Implementar una nueva sección/pestaña dentro del detalle del cliente que consuma el endpoint `GET /api/clients/:id/invoices`. Se utilizará **React Query** para el fetching y caching de los datos, y componentes de **shadcn/ui** para la visualización.

**Why this approach:**

- ✅ **Performance:** React Query maneja el estado de carga y cache eficientemente.
- ✅ **Consistency:** Uso de componentes existentes del Design System.
- ✅ **Security:** El endpoint aplicará RLS para asegurar que solo el dueño del cliente vea las facturas.

---

## UI/UX Design

**Design System:** `.context/design-system.md`
**Estilo visual:** Minimalista (Personalidad SoloQ)

### Componentes del Design System a usar:

- ✅ **Card:** Para el contenedor del resumen de totales.
- ✅ **Table:** Para el listado detallado de facturas.
- ✅ **Badge:** Para mostrar los estados (`InvoiceStatusBadge`).
- ✅ **Skeleton:** Para el estado de carga del historial.

### Componentes custom a crear:

- 🆕 `ClientInvoiceTotals`
  - **Propósito:** Mostrar las 3 métricas clave (Facturado, Pagado, Pendiente) en la parte superior.
  - **Ubicación:** `src/components/clients/client-invoice-totals.tsx`
- 🆕 `ClientInvoiceHistoryTable`
  - **Propósito:** Tabla especializada para el historial de facturas.
  - **Ubicación:** `src/components/clients/client-invoice-history-table.tsx`

### Wireframes/Layout:

```
┌──────────────────────────────────────┐
│ Header: Historial de Facturas        │
├──────────────────────────────────────┤
│ Totals Summary (3 Cards):            │
│ [Total: $X] [Pagado: $Y] [Pend: $Z]  │
├──────────────────────────────────────┤
│ Table:                               │
│ # Num  | Fecha | Monto | Estado      │
│ INV-01 | 10/02 | $500  | [Pagada]    │
│ INV-02 | 05/02 | $200  | [Enviada]   │
└──────────────────────────────────────┘
```

### Estados de UI:

- **Loading:** Skeleton rows en la tabla y skeleton cards para los totales.
- **Empty:** Ilustración simple + mensaje "Este cliente aún no tiene facturas" + botón "Crear Factura".
- **Error:** Alerta de error con botón de reintentar.

---

## Types & Type Safety

- ✅ Importar `Invoice` y `Client` desde `@/types/supabase`.
- ✅ Definir interface `InvoiceHistorySummary` para el objeto de agregación.

```typescript
interface InvoiceHistorySummary {
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
}
```

---

## Implementation Steps

### **Step 1: Backend - API Endpoint & Logic**

**Task:** Crear o actualizar el endpoint `GET /api/clients/:id/invoices`.

**Details:**

- Implementar query a Supabase `invoices` filtrando por `client_id` y `user_id`.
- Calcular agregaciones (sumas de totales según estado).
- Asegurar que RLS esté activo en la tabla `invoices`.

**Testing:**

- API Test: Verificar que el response contiene `invoices` y `summary` con valores correctos.

---

### **Step 2: Frontend - Components & Data Fetching**

**Task:** Crear componentes de UI y hook de data fetching.

**File:** `src/hooks/use-client-invoices.ts` y componentes en `src/components/clients/`.

**Logic:**

- `useClientInvoices(clientId)`: Hook usando `useQuery` para llamar al API.
- `ClientInvoiceTotals`: Renderiza el objeto `summary`.
- `ClientInvoiceHistoryTable`: Renderiza el array `invoices`.

**Testing:**

- Unit Test: Verificar que `ClientInvoiceTotals` muestra los números formateados correctamente.

---

### **Step 3: Integration - Client Details Page**

**Task:** Integrar el historial en la página de detalle del cliente.

**File:** `src/app/(app)/clients/[id]/page.tsx` (o ruta equivalente).

**Flow completo:**

1. El usuario entra al detalle del cliente.
2. Se cargan los datos básicos del cliente.
3. Se dispara el fetch del historial de facturas.
4. Se muestran los totales y la tabla una vez cargados.

**Testing:**

- E2E Test: Navegar a un cliente, verificar que el historial carga y que al hacer click en una factura redirige a `/invoices/[id]`.

---

## Dependencies

- [ ] `EPIC-SQ-13` - Estructura base de clientes.
- [ ] `invoices` table - Debe tener datos de prueba.

---

## Estimated Effort

| Step                          | Time |
| ----------------------------- | ---- |
| 1. API & Backend Logic        | 2h   |
| 2. UI Components & Fetching   | 3h   |
| 3. Integration & Refinement   | 2h   |
| 4. Unit & Integration Tests   | 2h   |
| **Total**                     | **9h** |

**Story points:** 3 (Coincide con story.md)
