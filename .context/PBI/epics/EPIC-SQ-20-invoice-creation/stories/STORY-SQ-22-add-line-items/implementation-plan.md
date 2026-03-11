# Implementation Plan: STORY-SQ-22 - Add Line Items to Invoice

**Fecha:** 2026-02-18
**Developer:** Claude Code
**Story Jira Key:** [SQ-22](https://upexgalaxy64.atlassian.net/browse/SQ-22)
**Epic:** EPIC-SQ-20 - Invoice Creation
**Story Points:** 5

---

## Overview

Implementar funcionalidad de agregar, editar, eliminar y visualizar line items (descripción, cantidad, precio unitario) en facturas, con cálculo automático de totales.

**Acceptance Criteria a cumplir:**

- AC1: Usuario puede agregar primer line item con descripción, cantidad y precio
- AC2: Usuario puede agregar múltiples line items (hasta 50)
- AC3: Line total se calcula automáticamente (quantity × unit_price)
- AC4: Usuario puede editar cualquier campo de un line item
- AC5: Usuario puede eliminar line items (excepto el último)
- AC6: (Opcional MVP) Usuario puede reordenar line items via drag-and-drop

---

## Technical Approach

**Chosen approach:** React Hook Form `useFieldArray` para formulario dinámico con validación Zod

**Alternatives considered:**

- **Alternativa A (State local + useReducer):** Más control pero duplicación de lógica de validación
- **Alternativa B (Tanstack Table editable):** Overkill para esta funcionalidad, más complejo de integrar con RHF

**Why this approach:**

- ✅ `useFieldArray` ya integrado con React Hook Form existente en el proyecto
- ✅ Validación declarativa con Zod (ya usado en proyecto)
- ✅ Performance optimizado con re-renders controlados
- ✅ Sync con schema de validación existente en `invoice.ts`
- ❌ Trade-off: Drag-and-drop requiere librería adicional (dnd-kit) - opcional para MVP

---

## UI/UX Design

**Design System disponible:** `.context/design-system.md`

### Componentes del Design System a usar:

**Componentes base (ya existen):**

- ✅ Button → `variant`: outline (agregar), ghost (eliminar), con iconos
- ✅ Input → Para description, quantity, unit_price
- ✅ Table → shadcn/ui Table para estructura de items
- ✅ FormField/FormMessage → Para validación inline

### Componentes custom a crear:

**Componentes específicos del dominio (nuevos):**

- 🆕 `LineItemsTable`
  - **Propósito:** Contenedor principal de la tabla de items
  - **Props:** `control: Control<CreateInvoiceFormData>`, `errors: FieldErrors`
  - **Ubicación:** `src/components/invoices/line-items-table.tsx`

- 🆕 `LineItemRow`
  - **Propósito:** Fila individual editable
  - **Props:** `index: number`, `onRemove: () => void`, `canRemove: boolean`
  - **Ubicación:** Inline dentro de LineItemsTable

### Wireframes/Layout:

**Estructura del componente LineItemsTable:**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Line Items                                                   [+ Agregar] │
├──────────────────────────────────────────────────────────────────────────┤
│ Descripción          │ Cantidad │ Precio Unitario │   Total   │ Acción  │
├──────────────────────┼──────────┼─────────────────┼───────────┼─────────┤
│ [Input text_______ ] │ [  1   ] │ [$   500.00   ] │  $500.00  │  [🗑️]   │
│ [Input text_______ ] │ [ 2.5  ] │ [$    80.00   ] │  $200.00  │  [🗑️]   │
├──────────────────────┴──────────┴─────────────────┼───────────┴─────────┤
│                                         Subtotal: │  $700.00            │
└───────────────────────────────────────────────────┴─────────────────────┘
```

### Estados de UI:

**Estados visuales a implementar:**

- **Empty:** Tabla con 1 fila vacía inicial + mensaje hint
- **With items:** Tabla poblada con items
- **Error:** Input con border-red-500 + mensaje de error debajo
- **Max items (50):** Botón "Agregar" deshabilitado + warning en item 45

### Validaciones visuales (Formularios):

- **description:** `trim().length >= 1 && <= 500` → "La descripción es requerida" / "Máximo 500 caracteres"
- **quantity:** `> 0` (decimales hasta 2) → "La cantidad debe ser mayor a 0"
- **unit_price:** `>= 0` (decimales hasta 2) → "El precio debe ser mayor o igual a 0"

**Estados visuales:**

- Error: `border-destructive` + mensaje en `text-destructive`
- Focus: `ring-ring`

### Responsividad:

- **Mobile (< 768px):** Layout stacked (description arriba, qty/price abajo)
- **Tablet/Desktop:** Tabla horizontal completa

### Personalidad UI/UX aplicada:

**Estilo visual a seguir:** Minimalista (shadcn/ui New York)

- Espacios generosos
- Bordes sutiles (`rounded-md`)
- Sombras mínimas
- Inputs limpios con placeholder descriptivo

---

## Types & Type Safety

**Tipos disponibles:**

- `src/lib/types.ts` → `InvoiceItem`, `InvoiceWithDetails`
- `src/lib/validations/invoice.ts` → Schemas Zod existentes

**Tipos a definir/extender:**

```typescript
// En invoice.ts validations - ACTUALIZAR schema de items
export const lineItemSchema = z.object({
  id: z.string().uuid().optional(), // Para items existentes
  description: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(500, 'Máximo 500 caracteres')
    .transform(val => val.trim()),
  quantity: z
    .number()
    .positive('La cantidad debe ser mayor a 0')
    .multipleOf(0.01, 'Máximo 2 decimales'),
  unit_price: z
    .number()
    .min(0, 'El precio debe ser mayor o igual a 0')
    .multipleOf(0.01, 'Máximo 2 decimales'),
});

export const lineItemsArraySchema = z
  .array(lineItemSchema)
  .max(50, 'Máximo 50 items por factura');
```

---

## Test Cases Coverage Matrix

| TC# | Test Case | Implementation Step |
|-----|-----------|---------------------|
| TC-01 | Agregar primer line item | Step 3 (UI), Step 5 (Integration) |
| TC-02 | Agregar múltiples items | Step 3 (UI), Step 4 (API) |
| TC-03 | Cálculo automático line total | Step 2 (Utils), Step 3 (UI) |
| TC-04 | Edición de line item | Step 3 (UI auto-recálculo) |
| TC-05 | Eliminación de line item | Step 3 (UI remove logic) |
| TC-06 | Prevenir eliminar último item | Step 3 (UI canRemove check) |
| TC-07 | Error descripción vacía | Step 1 (Validation) |
| TC-08 | Error descripción whitespace | Step 1 (Validation transform) |
| TC-09 | Error quantity 0 o negativo | Step 1 (Validation) |
| TC-10 | Límite 500 chars descripción | Step 1 (Validation) |
| TC-11 | Decimal quantity permitido | Step 1 (Validation), Step 3 (UI) |
| TC-12 | Price $0 permitido | Step 1 (Validation) |
| TC-13 | Límite máximo 50 items | Step 1 (Validation), Step 3 (UI) |
| TC-14 | API: Crear factura con items | Step 4 (API POST) |
| TC-15 | API: Actualizar items existentes | Step 4 (API PUT) |

---

## Implementation Steps

### **Step 1: Actualizar Validation Schemas**

**Task:** Extender schemas de validación para line items

**File:** `src/lib/validations/invoice.ts`

**Changes:**

1. Crear `lineItemSchema` con validaciones de business rules
2. Crear `lineItemsArraySchema` con límite de 50 items
3. Integrar en `createInvoiceSchema` y `updateInvoiceSchema`
4. Asegurar transformación `trim()` en description

**Test Cases Covered:** TC-07, TC-08, TC-09, TC-10, TC-11, TC-12, TC-13

**Testing:**

- Unit test: Validar cada campo con valores válidos e inválidos
- Unit test: Verificar mensaje de error en español

---

### **Step 2: Agregar Funciones de Cálculo**

**Task:** Agregar funciones para calcular line total y subtotal

**File:** `src/lib/utils/invoice-calculations.ts`

**Functions to add:**

```typescript
/**
 * Calculate line item total: quantity × unit_price
 */
export function calculateLineTotal(quantity: number, unitPrice: number): number

/**
 * Calculate subtotal from array of line items
 */
export function calculateSubtotal(items: Array<{ quantity: number; unit_price: number }>): number
```

**Test Cases Covered:** TC-03

**Testing:**

- Unit test: Cálculos con valores normales
- Unit test: Cálculos con decimales (2.5 × 80 = 200)
- Unit test: Cálculos con precio $0

---

### **Step 3: Crear Componente LineItemsTable**

**Task:** Implementar componente de UI para gestión de line items

**File:** `src/components/invoices/line-items-table.tsx`

**Structure:**

```typescript
interface LineItemsTableProps {
  control: Control<CreateInvoiceFormData>;
  errors: FieldErrors<CreateInvoiceFormData>;
  onSubtotalChange: (subtotal: number) => void;
}
```

**Features:**

1. `useFieldArray` para manejo dinámico de items
2. Inputs controlados para description, quantity, unit_price
3. Cálculo en tiempo real de line_total por fila
4. Cálculo en tiempo real de subtotal total
5. Botón "Agregar item" (disabled en 50 items)
6. Botón eliminar por fila (disabled si solo 1 item)
7. Warning visual en item 45
8. Mensajes de error inline por campo

**Edge cases handled:**

- Último item no se puede eliminar (TC-06)
- Máximo 50 items (TC-13)
- Recálculo inmediato al editar (TC-04)

**Test Cases Covered:** TC-01, TC-02, TC-03, TC-04, TC-05, TC-06, TC-13

**Testing:**

- Component test: Render con 0 items
- Component test: Agregar item
- Component test: Eliminar item
- Component test: Intentar eliminar último item (debe fallar)
- Component test: Intentar agregar item 51 (debe fallar)

---

### **Step 4: Actualizar API Routes**

**Task:** Modificar POST y PUT para manejar items

**Files:**
- `src/app/api/invoices/route.ts` (POST)
- `src/app/api/invoices/[id]/route.ts` (PUT, GET ya funciona)

**POST Changes:**

1. Extraer `items` del body validado
2. Calcular subtotal desde items
3. Insertar invoice
4. Insertar items en `invoice_items` con `sort_order`
5. Retornar invoice con items incluidos

**PUT Changes:**

1. Recibir `items` opcionales
2. Si items presentes: DELETE existentes + INSERT nuevos (más simple que diff)
3. Recalcular subtotal, tax_amount, total
4. Retornar invoice actualizado con items

**Test Cases Covered:** TC-14, TC-15

**Testing:**

- API test: POST con items válidos
- API test: POST sin items (debe funcionar, draft)
- API test: PUT con items actualizados
- API test: PUT sin items (no cambiar items existentes)

---

### **Step 5: Integrar en Páginas Create/Edit**

**Task:** Conectar LineItemsTable con formularios existentes

**Files:**
- `src/app/(app)/invoices/create/page.tsx`
- `src/app/(app)/invoices/[id]/edit/page.tsx`

**Changes Create Page:**

1. Importar LineItemsTable
2. Agregar `items: [{ description: '', quantity: 1, unit_price: 0 }]` como default
3. Conectar `onSubtotalChange` para actualizar cálculos de invoice
4. Pasar control y errors al componente

**Changes Edit Page:**

1. Cargar items existentes del invoice
2. Popular `defaultValues.items` con datos del servidor
3. Manejar edición y recálculo

**Test Cases Covered:** TC-01 a TC-15 (integración E2E)

**Testing:**

- E2E: Flujo completo de crear invoice con items
- E2E: Flujo de editar invoice existente
- E2E: Validaciones visuales en formulario

---

### **Step 6: Actualizar InvoiceSummary**

**Task:** Conectar subtotal dinámico con componente de resumen

**File:** `src/components/invoices/invoice-summary.tsx`

**Changes:**

- Ya recibe `subtotal` como prop (revisar que se use correctamente)
- Asegurar que recálculo de tax y total funcione con subtotal dinámico

---

## Technical Decisions

### Decision 1: Estrategia de actualización de items en PUT

**Chosen:** DELETE all + INSERT all (replace strategy)

**Reasoning:**

- ✅ Más simple que diff complejo
- ✅ Evita bugs de sincronización de IDs
- ✅ Mantiene sort_order consistente
- ❌ Trade-off: No preserva IDs de items (aceptable para MVP)

### Decision 2: Cálculo client-side vs server-side

**Chosen:** Ambos (client para UX, server para persistencia)

**Reasoning:**

- ✅ UX fluida con cálculo instantáneo en client
- ✅ Server valida y recalcula antes de guardar (source of truth)
- ❌ Trade-off: Código duplicado (mitigado con función compartida)

### Decision 3: Drag-and-drop para reordenar

**Chosen:** Defer para post-MVP

**Reasoning:**

- ✅ Story.md indica "(optional for MVP)"
- ✅ Reduce scope inicial
- ✅ Implementar con dnd-kit en futura iteración
- ❌ Trade-off: UX menos rica inicialmente

---

## Dependencies

**Pre-requisitos técnicos:**

- [x] Tabla `invoice_items` existe (verificado via Supabase MCP)
- [x] Schema Zod base existe en `invoice.ts`
- [x] React Hook Form + Zod configurados en proyecto
- [x] shadcn/ui Table y Input disponibles

**Nuevas dependencias (ninguna):**

- No se requieren nuevos paquetes npm

---

## Risks & Mitigations

**Risk 1:** Errores de cálculo de totales (High - del Epic)

- **Impact:** High
- **Mitigation:**
  - Cálculos duplicados client/server
  - Unit tests exhaustivos para funciones de cálculo
  - Precision testing con decimales

**Risk 2:** Performance con muchos items

- **Impact:** Medium
- **Mitigation:**
  - useFieldArray optimiza re-renders
  - Máximo 50 items limita problema
  - Memoización de cálculos si necesario

**Risk 3:** Race condition en auto-save de edit page

- **Impact:** Low
- **Mitigation:**
  - Debounce existente en edit page
  - Server es source of truth

---

## Estimated Effort

| Step | Description | Time |
|------|-------------|------|
| 1 | Validation Schemas | 30 min |
| 2 | Calculation Functions | 20 min |
| 3 | LineItemsTable Component | 2 hours |
| 4 | API Routes Update | 1 hour |
| 5 | Pages Integration | 1 hour |
| 6 | InvoiceSummary Update | 15 min |
| 7 | Testing & Polish | 1 hour |
| **Total** | | **~6 hours** |

**Story points:** 5 (matches estimation)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando
- [ ] **Tipos del backend usados correctamente**
  - [ ] Imports desde `@/lib/types` en componentes
  - [ ] Props de componentes tipadas
  - [ ] Zero type errors
- [ ] **Test Cases cubiertos (del Acceptance Test Plan)**
  - [ ] TC-01: Agregar primer line item
  - [ ] TC-02: Agregar múltiples items
  - [ ] TC-03: Cálculo automático line total
  - [ ] TC-04: Edición de line item
  - [ ] TC-05: Eliminación de line item
  - [ ] TC-06: Prevenir eliminar último item
  - [ ] TC-07: Error descripción vacía
  - [ ] TC-08: Error descripción whitespace
  - [ ] TC-09: Error quantity 0 o negativo
  - [ ] TC-10: Límite 500 chars descripción
  - [ ] TC-11: Decimal quantity permitido
  - [ ] TC-12: Price $0 permitido
  - [ ] TC-13: Límite máximo 50 items
  - [ ] TC-14: API: Crear factura con items
  - [ ] TC-15: API: Actualizar items existentes
- [ ] **Personalidad UI/UX aplicada**
  - [ ] Design system shadcn/ui New York
  - [ ] Bordes y espaciado consistentes
  - [ ] Mensajes de error en español
- [ ] Code review aprobado
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run typecheck` passes
  - [ ] `bun run build` passes
- [ ] Manual smoke test en local
  - [ ] Crear invoice con items funciona
  - [ ] Editar invoice con items funciona
  - [ ] Validaciones visuales correctas
  - [ ] Cálculos correctos

---

**Fecha creación:** 2026-02-18
**Status:** Ready for Implementation
