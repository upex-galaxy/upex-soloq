# Implementation Plan: STORY-SQ-12 - Configure Payment Methods

## Overview

Implementar CRUD completo de métodos de pago: agregar, editar, eliminar, toggle active/inactive. Soporta 5 tipos (bank_transfer, paypal, mercado_pago, cash, other) con campos específicos por tipo. Bank transfer tiene campos country-dependent (CLABE para México, CBU para Argentina). Mínimo 1 método activo para crear facturas. Máximo 10 métodos por usuario.

**Esta es la historia más compleja del epic (8 SP re-estimado).**

**Acceptance Criteria a cumplir:**

- AC1: Add bank transfer with account details (CLABE/CBU per country)
- AC2: Add PayPal email (validated)
- AC3: Add custom payment method (name + instructions)
- AC4: All payment methods appear on invoice PDF
- AC5: Require at least one active payment method for invoice creation

**ACs adicionales del Shift-Left:**

- AC6: Toggle payment method active/inactive
- AC7: Edit existing payment method
- AC8: Delete payment method with confirmation

---

## Technical Approach

**Chosen approach:** DB migration `is_active` + CRUD hooks (usePaymentMethods, useCreatePaymentMethod, useUpdatePaymentMethod, useDeletePaymentMethod) + PaymentMethodsSection con lista + PaymentMethodFormDialog para add/edit + JSON en `value` field con Zod schemas per type.

**Alternatives considered:**

- Single form inline (como onboarding): Demasiado limitado para CRUD completo con edit/delete/toggle
- Server Actions: No consistente con patrón de hooks existente

**Why this approach:**

- ✅ Dialog para add/edit permite forms complejos (bank transfer tiene 3+ campos)
- ✅ Hooks separados por operación CRUD = single responsibility
- ✅ JSON en value = flexible por tipo sin cambiar schema
- ✅ is_active toggle = Switch component de shadcn
- ❌ Trade-off: Mayor cantidad de archivos/hooks, pero cada uno es simple

---

## UI/UX Design

### Componentes del Design System a usar:

- ✅ `Card` / `CardHeader` / `CardContent`: Contenedor de la sección
- ✅ `Dialog` / `DialogContent` / `DialogHeader` / `DialogTitle` / `DialogFooter`: Add/Edit form
- ✅ `Form` / `FormField` / `FormItem` / `FormLabel` / `FormControl` / `FormMessage`
- ✅ `Input`: Campos de texto por tipo
- ✅ `Select`: Payment type selector, country-specific bank fields
- ✅ `Button`: Add, Edit, Delete, Save
- ✅ `Switch`: Toggle active/inactive
- ✅ `Badge`: Tipo de pago, "Default"
- ✅ `AlertDialog`: Confirmación de eliminación
- ✅ `Separator`: Entre métodos en la lista

### Componentes custom:

- 🆕 `PaymentMethodsSection` → `src/components/settings/payment-methods-section.tsx`
  - Lista de métodos + botón "Agregar"
  - Props: `businessProfile: BusinessProfile | null`
- 🆕 `PaymentMethodCard` → `src/components/settings/payment-method-card.tsx`
  - Card individual por método con actions
  - Props: `method: PaymentMethod`, `onEdit`, `onDelete`, `onToggle`, `isLast: boolean`
- 🆕 `PaymentMethodFormDialog` → `src/components/settings/payment-method-form-dialog.tsx`
  - Dialog para add/edit con campos dinámicos por tipo
  - Props: `open`, `onClose`, `method?: PaymentMethod`, `country?: string`

### Wireframe (Tab "Métodos de Pago"):

```
┌──────────────────────────────────────────────────────┐
│ [Perfil] [Contacto] [Datos Fiscales] [Pagos ✓]       │
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐  │
│ │ Métodos de pago                        3/10      │  │
│ │ Define cómo tus clientes pueden pagarte.         │  │
│ │ Se mostrarán en el pie de tus facturas.          │  │
│ │                                                  │  │
│ │ ┌────────────────────────────────────────────┐   │  │
│ │ │ 🏦 BBVA México        [Default]  [●] Active│   │  │
│ │ │ CLABE: 0123 4567 8901 2345 67             │   │  │
│ │ │                        [Editar] [Eliminar] │   │  │
│ │ └────────────────────────────────────────────┘   │  │
│ │                                                  │  │
│ │ ┌────────────────────────────────────────────┐   │  │
│ │ │ 💳 PayPal              [●] Active          │   │  │
│ │ │ carlos@estudio.mx                          │   │  │
│ │ │                        [Editar] [Eliminar] │   │  │
│ │ └────────────────────────────────────────────┘   │  │
│ │                                                  │  │
│ │ ┌────────────────────────────────────────────┐   │  │
│ │ │ 📱 Mercado Pago        [○] Inactive        │   │  │
│ │ │ Alias: carlos.design                       │   │  │
│ │ │                        [Editar] [Eliminar] │   │  │
│ │ └────────────────────────────────────────────┘   │  │
│ │                                                  │  │
│ │            [+ Agregar método de pago]             │  │
│ └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Dialog Form (dinámico por tipo):

```
┌──────────────────────────────────────┐
│ Agregar método de pago               │
│                                      │
│ Tipo                                 │
│ [Transferencia bancaria ▼]           │
│                                      │
│ Nombre (label)                       │
│ [BBVA México                    ]    │
│                                      │
│ ── Datos de la transferencia ──      │
│                                      │
│ Nombre del banco                     │
│ [BBVA                           ]    │
│                                      │
│ Número de cuenta                     │
│ [0123456789                     ]    │
│                                      │
│ CLABE (18 dígitos)                   │
│ [012345678901234567              ]   │
│                                      │
│ ☐ Método preferido                   │
│                                      │
│           [Cancelar] [Guardar]       │
└──────────────────────────────────────┘
```

### Dynamic Fields per Payment Type:

| Type | Fields |
|------|--------|
| bank_transfer (MX) | bank_name, account_number, clabe (18 digits) |
| bank_transfer (AR) | bank_name, cbu (22 digits) |
| bank_transfer (other) | bank_name, account_number |
| paypal | email (valid format) |
| mercado_pago | alias or cvu |
| cash | instructions (textarea, optional) |
| other | name, instructions (textarea) |

### Estados de UI:

- **Empty:** Card con mensaje "No tienes métodos de pago configurados" + CTA "Agregar tu primer método"
- **Has methods:** Lista de PaymentMethodCards
- **Max reached (10):** Botón "Agregar" disabled con tooltip "Máximo 10 métodos"
- **Last active:** Switch disabled con tooltip "Debes tener al menos un método activo"
- **Loading:** Skeleton cards
- **Dialog open:** Form con campos dinámicos según tipo seleccionado

---

## Types & Type Safety

**Tipos nuevos en `lib/types.ts`:**

```typescript
// Payment value schemas (JSON in value field)
export interface BankTransferValue {
  bank_name: string;
  account_number?: string;
  clabe?: string;  // MX - 18 digits
  cbu?: string;    // AR - 22 digits
}

export interface PaypalValue {
  email: string;
}

export interface MercadoPagoValue {
  alias?: string;
  cvu?: string;
}

export interface OtherPaymentValue {
  name: string;
  instructions?: string;
}

export interface CashPaymentValue {
  instructions?: string;
}

export type PaymentMethodValue =
  | BankTransferValue
  | PaypalValue
  | MercadoPagoValue
  | OtherPaymentValue
  | CashPaymentValue;
```

**Zod schemas en `lib/validations/payment-method.ts`:**

```typescript
export const bankTransferValueSchema = z.object({
  bank_name: z.string().min(1, 'Nombre del banco requerido'),
  account_number: z.string().optional(),
  clabe: z.string().regex(/^\d{18}$/, 'CLABE debe tener 18 dígitos').optional(),
  cbu: z.string().regex(/^\d{22}$/, 'CBU debe tener 22 dígitos').optional(),
});

export const paypalValueSchema = z.object({
  email: z.string().email('Email de PayPal inválido'),
});

export const mercadoPagoValueSchema = z.object({
  alias: z.string().optional(),
  cvu: z.string().optional(),
}).refine(d => d.alias || d.cvu, 'Ingresa alias o CVU');

export const otherValueSchema = z.object({
  name: z.string().min(1, 'Nombre del método requerido'),
  instructions: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

export const cashValueSchema = z.object({
  instructions: z.string().max(500).optional(),
});
```

---

## Content Writing

- Card title: "Métodos de pago"
- Card description: "Define cómo tus clientes pueden pagarte. Se mostrarán en el pie de tus facturas."
- Counter: "{count}/10"
- Empty state: "No tienes métodos de pago configurados."
- Empty CTA: "Agregar tu primer método de pago"
- Add button: "Agregar método de pago"
- Max reached: "Máximo 10 métodos de pago"
- Dialog title (add): "Agregar método de pago"
- Dialog title (edit): "Editar método de pago"
- Delete confirmation: "¿Eliminar este método de pago?"
- Delete description: "Esta acción no se puede deshacer."
- Last active warning: "Debes tener al menos un método de pago activo para crear facturas."
- Success toasts: "Método de pago agregado", "Método actualizado", "Método eliminado"
- Labels per type: "Transferencia bancaria", "PayPal", "Mercado Pago", "Efectivo", "Otro"

---

## Implementation Steps

### **Step 1: DB Migration - Add is_active column**

**Task:** Agregar columna `is_active` a `payment_methods`

**Details:**

- Supabase MCP `apply_migration`:
  ```sql
  ALTER TABLE payment_methods
  ADD COLUMN is_active boolean NOT NULL DEFAULT true;

  COMMENT ON COLUMN payment_methods.is_active IS
  'Whether this payment method is active and shown on invoices';
  ```
- Regenerar `types/supabase.ts`
- Todos los métodos existentes quedan activos por default

**Testing:**

- Column added, existing rows have `is_active = true`
- Can UPDATE to false/true

**Estimated time:** 15 min

---

### **Step 2: Add types and validation schemas**

**Task:** Agregar payment value types y Zod schemas

**Files:**
- `src/lib/types.ts` - Payment value interfaces
- `src/lib/validations/payment-method.ts` - Zod schemas per type

**Details:**

- Interfaces para cada tipo de payment method value (ver Types section)
- Zod schemas con validaciones específicas:
  - CLABE: 18 dígitos exactos
  - CBU: 22 dígitos exactos
  - PayPal email: formato válido
  - MercadoPago: alias o CVU requerido
  - Other: name required, instructions max 500 chars
- Helper function: `getValueSchemaForType(type: PaymentMethodType)`
- Helper function: `parsePaymentValue(value: string, type: PaymentMethodType): PaymentMethodValue`
- Helper function: `stringifyPaymentValue(value: PaymentMethodValue): string`

**Testing:**

- Each schema validates correct data
- Each schema rejects invalid data
- Parse/stringify round-trip works

**Estimated time:** 25 min

---

### **Step 3: Create payment methods hooks**

**Task:** CRUD hooks para payment methods

**Files:**
- `src/hooks/payment-methods/use-payment-methods.ts` - Fetch list
- `src/hooks/payment-methods/use-create-payment-method.ts` - Create
- `src/hooks/payment-methods/use-update-payment-method.ts` - Update
- `src/hooks/payment-methods/use-delete-payment-method.ts` - Delete
- `src/hooks/payment-methods/index.ts` - Re-exports

**Details:**

**usePaymentMethods:**
- `useQuery` with queryKey `['payment-methods']`
- Fetch all payment methods for current user, ordered by sort_order
- Returns `PaymentMethod[]`

**useCreatePaymentMethod:**
- `useMutation` with `.insert()` on `payment_methods`
- Validates max 10 methods before insert
- Serializes value object to JSON string
- Invalidates `['payment-methods']` on success
- Toast success/error

**useUpdatePaymentMethod:**
- `useMutation` with `.update()` by id
- Handles `is_active` toggle and field updates
- Prevents deactivating last active method
- Serializes value to JSON
- Invalidates cache

**useDeletePaymentMethod:**
- `useMutation` with `.delete()` by id
- Prevents deleting last active method
- Invalidates cache

**Testing:**

- Fetch returns all user's methods
- Create adds method, cache invalidates
- Update changes fields
- Toggle active/inactive works
- Delete removes method
- Max 10 enforced
- Last active protected

**Estimated time:** 40 min

---

### **Step 4: Create PaymentMethodCard component**

**Task:** Card individual para mostrar un payment method con actions

**File:** `src/components/settings/payment-method-card.tsx`

**Details:**

- Display: type icon + label + value summary + badges (Default, Active/Inactive)
- Actions: Edit button, Delete button, Active Switch
- Type icons: 🏦 bank_transfer, 💳 paypal, 📱 mercado_pago, 💵 cash, 📄 other
- Value display: parse JSON and show relevant fields
  - bank_transfer: "CLABE: XXXX...XXXX" or "CBU: XXXX...XXXX"
  - paypal: email
  - mercado_pago: alias or CVU
  - cash: instructions (truncated)
  - other: name + instructions (truncated)
- Switch disabled if `isLast` (last active method)
- Tooltip on disabled switch: "Debes tener al menos un método activo"
- data-testid: `payment-method-card-{index}`, `payment-method-toggle-{index}`, `payment-method-edit-{index}`, `payment-method-delete-{index}`

**Estimated time:** 35 min

---

### **Step 5: Create PaymentMethodFormDialog component**

**Task:** Dialog para agregar/editar payment method con campos dinámicos

**File:** `src/components/settings/payment-method-form-dialog.tsx`

**Details:**

- Dialog controlled por open/onClose props
- Form con React Hook Form + Zod (schema dinámico por tipo)
- Fields:
  - **Type selector** (Select): Muestra los 5 tipos con labels en español
  - **Label** (Input): Nombre display (ej: "BBVA México")
  - **Dynamic fields** (cambian al seleccionar tipo):
    - bank_transfer: bank_name, account_number, clabe/cbu (según country)
    - paypal: email
    - mercado_pago: alias, cvu
    - cash: instructions (textarea)
    - other: name, instructions (textarea)
  - **Default checkbox**: "Método preferido"
- Country from businessProfile.address.country:
  - MX: show CLABE field, hide CBU
  - AR: show CBU field, hide CLABE
  - Other/None: show generic account_number
- Edit mode: Pre-fill con datos existentes (parse JSON value)
- On save: serialize value to JSON, call create/update mutation
- Validation per type-specific Zod schema
- data-testid: `payment-type-select`, `payment-label-input`, `payment-save-button`, `payment-cancel-button`

**Edge cases handled:**

- Type change → reset dynamic fields
- Edit → pre-fill with parsed JSON value
- Country change doesn't affect existing methods (only new bank transfers)
- Max 10 check before showing dialog

**Estimated time:** 50 min

---

### **Step 6: Create PaymentMethodsSection component**

**Task:** Sección completa con lista + empty state + add button

**File:** `src/components/settings/payment-methods-section.tsx`

**Details:**

- Fetch payment methods con `usePaymentMethods()`
- Loading: Skeleton cards (3)
- Empty: Illustration/icon + "No tienes métodos de pago" + CTA button
- Has methods: List of PaymentMethodCards
- Header: Title + "{count}/10" counter
- Add button: Opens PaymentMethodFormDialog
- Delete: AlertDialog confirmation before deleting
- Toggle: Switch calls update mutation
- Prevent delete/deactivate last active method
- Calculate `isLast`: `methods.filter(m => m.is_active).length === 1 && method.is_active`
- data-testid: `payment-methods-section`, `add-payment-method-button`, `payment-methods-count`

**Estimated time:** 40 min

---

### **Step 7: Integrate with Settings page**

**Task:** Agregar PaymentMethodsSection al tab "Métodos de Pago"

**File:** `src/app/(app)/settings/page.tsx`

**Details:**

- Reemplazar placeholder del tab "Pagos" con PaymentMethodsSection
- Pasar businessProfile como prop (para country)

**Estimated time:** 10 min

---

### **Step 8: Integration & Verification**

**Task:** Verificar todos los flujos y test cases

**Details:**

1. Add bank transfer MX (CLABE 18 digits) → saved → shown on list
2. Add bank transfer AR (CBU 22 digits) → saved
3. Add PayPal (valid email) → saved
4. Add MercadoPago (alias) → saved
5. Add custom method → saved
6. Edit method → updated
7. Delete method (with confirmation) → removed
8. Toggle inactive → method hidden from invoices
9. Prevent deactivate last active → switch disabled
10. Prevent delete last active → button disabled or error
11. Reject invalid email for PayPal
12. Reject CLABE != 18 digits
13. Reject CBU != 22 digits
14. Max 10 methods → add button disabled
15. All methods on invoice PDF
16. Block invoice when no active methods
17. Multiple same type → allowed
18. Reactivate inactive method → switch on
19. `bun run lint && bun run build`

**Estimated time:** 30 min

---

## Test Cases Mapping

| TC# | Test Case | Step |
|-----|-----------|------|
| TC-1 | Add bank transfer CLABE (MX) | Step 5 + 6 |
| TC-2 | Add bank transfer CBU (AR) | Step 5 + 6 |
| TC-3 | Add PayPal valid email | Step 5 + 6 |
| TC-4 | Add MercadoPago alias | Step 5 + 6 |
| TC-5 | Add custom payment method | Step 5 + 6 |
| TC-6 | Reject invalid PayPal email | Step 2 + 5 |
| TC-7 | Display all active on invoice | Step 8 |
| TC-8 | Block invoice without active methods | Step 8 |
| TC-9 | Toggle inactive | Step 4 + 6 |
| TC-10 | Edit existing method | Step 5 + 6 |
| TC-11 | Delete with confirmation | Step 6 |
| TC-12 | Prevent delete/deactivate last active | Step 3 + 4 + 6 |
| TC-13 | Reject empty required fields | Step 2 + 5 |
| TC-14 | Validate CLABE 18 digits | Step 2 + 5 |
| TC-15 | Validate CBU 22 digits | Step 2 + 5 |
| TC-16 | Max length custom instructions | Step 2 + 5 |
| TC-17 | Multiple same type | Step 6 |
| TC-18 | Reactivate inactive | Step 4 + 6 |

---

## Dependencies

**Pre-requisitos técnicos:**

- [x] SQ-8 implementado (settings page structure)
- [x] SQ-10 implementado (country selector for bank fields) - **BLOCKER for country-specific bank fields**
- [x] `useBusinessProfile` hook (para leer country)
- [ ] Migration is_active column (Step 1)

**Nota:** SQ-12 puede implementarse sin SQ-10 si los bank transfer fields no son country-dependent. Pero la experiencia es mejor con country.

---

## Risks & Mitigations

**Risk 1:** JSON parsing failures en existing payment method values

- **Impact:** Medium
- **Mitigation:** try/catch en parsePaymentValue, fallback a `{value}` raw display

**Risk 2:** Race condition en delete/deactivate last active

- **Impact:** High
- **Mitigation:** Check count antes de operación + DB constraint optional

**Risk 3:** Dialog form complexity con campos dinámicos

- **Impact:** Medium
- **Mitigation:** Schema switch en useEffect cuando type cambia, reset fields on type change

**Risk 4:** Existing onboarding payment methods have plain text values (not JSON)

- **Impact:** Medium (onboarding writes value as plain text, SQ-12 expects JSON)
- **Mitigation:** parsePaymentValue handles plain text fallback gracefully

---

## Estimated Effort

| Step | Time |
|------|------|
| 1. DB Migration | 15 min |
| 2. Types & Schemas | 25 min |
| 3. CRUD Hooks (4) | 40 min |
| 4. PaymentMethodCard | 35 min |
| 5. PaymentMethodFormDialog | 50 min |
| 6. PaymentMethodsSection | 40 min |
| 7. Integration | 10 min |
| 8. Verification | 30 min |
| **Total** | **~4h 5min** |

**Story points:** 8 (re-estimado desde 5 por CRUD completo + dynamic forms + toggle logic)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los ACs pasando (AC1-AC8)
- [ ] **DB Migration:** is_active column added
- [ ] **Types:** PaymentMethodValue interfaces, Zod schemas per type
- [ ] **CRUD completo funcional:**
  - [ ] Create (5 tipos)
  - [ ] Read (list con parse JSON)
  - [ ] Update (edit + toggle)
  - [ ] Delete (with confirmation)
- [ ] **Business rules:**
  - [ ] Min 1 active method enforced
  - [ ] Max 10 methods enforced
  - [ ] Country-specific bank fields (CLABE/CBU)
  - [ ] `mercado_pago` (with underscore) used consistently
- [ ] **UI/UX minimalista profesional:**
  - [ ] Card list with type icons
  - [ ] Dialog form with dynamic fields
  - [ ] Switch toggle for active/inactive
  - [ ] Empty state with CTA
  - [ ] Toast notifications
- [ ] **Content Writing contextual:** Español LATAM
- [ ] **data-testid** en elementos interactivos
  - [ ] `payment-methods-section`, `add-payment-method-button`
  - [ ] `payment-method-card-{i}`, `payment-method-toggle-{i}`
  - [ ] `payment-method-edit-{i}`, `payment-method-delete-{i}`
  - [ ] `payment-type-select`, `payment-label-input`, `payment-save-button`
- [ ] **Test cases cubiertos:** TC-1 a TC-18
- [ ] `bun run lint && bun run build` sin errores

---

_Generado: 2026-03-11_
_Autor: Claude Code (Dev)_
