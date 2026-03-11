# Implementation Plan: STORY-SQ-27 - Assign Unique Invoice Number

## Overview

Implementar funcionalidad para asignar números de factura únicos, con auto-generación secuencial, soporte para números custom, validación de duplicados en tiempo real, y prefijo configurable por usuario.

**Acceptance Criteria a cumplir:**

- AC1: Auto-generar número de factura al crear invoice
- AC2: Permitir números secuenciales (INV-0001 → INV-0002)
- AC3: Permitir editar número manualmente (custom)
- AC4: Prevenir números duplicados con error claro
- AC5: Seguir formato configurable (prefix + padding)

---

## Technical Approach

**Chosen approach:** Enhancer pattern sobre la implementación existente

El código actual ya tiene:

- `generateInvoiceNumber()` en `src/app/api/invoices/route.ts`
- Constraint `UNIQUE(user_id, invoice_number)` en DB
- Manejo de error 23505 para duplicados

**Enhancements necesarios:**

1. Agregar campo `invoice_prefix` a `business_profiles`
2. Crear endpoint `GET /api/invoices/next-number` para obtener siguiente número
3. Crear endpoint `GET /api/invoices/check-number` para validar duplicados
4. Agregar campo editable de invoice_number en el form de creación
5. Validación onBlur para duplicados en tiempo real
6. Actualizar schema Zod para aceptar invoice_number opcional

**Alternatives considered:**

- **Generación 100% client-side**: Rechazado - race conditions sin validación server
- **Número inmutable (solo auto)**: Rechazado - no cumple AC3 (custom number)

**Why this approach:**

- ✅ Reutiliza lógica existente de generación
- ✅ Mantiene integridad con constraint de DB
- ✅ UX fluida con validación en tiempo real
- ❌ Trade-off: Requiere 2 llamadas API adicionales (next-number, check-number)

---

## Test Cases Mapping (from Jira)

### Scenario 1: Auto-generate Invoice Number

| TC ID  | Test Case                                     | Implementation Coverage         |
| ------ | --------------------------------------------- | ------------------------------- |
| TC-1.1 | Crear invoice nuevo (primer invoice del user) | Step 3: generateInvoiceNumber() |
| TC-1.2 | Crear invoice cuando último fue INV-0005      | Step 3: Sequential logic        |
| TC-1.3 | Eliminar invoice INV-0003 y crear nuevo       | Step 3: No reutiliza gaps       |
| TC-1.4 | Cancelar invoice y crear nuevo                | Step 3: Continúa secuencia      |
| TC-1.5 | Verificar formato con padding                 | Step 3: padStart(4, '0')        |

### Scenario 2: Custom Invoice Number

| TC ID  | Test Case                               | Implementation Coverage     |
| ------ | --------------------------------------- | --------------------------- |
| TC-2.1 | Editar número antes de guardar          | Step 4: UI editable         |
| TC-2.2 | Usar caracteres especiales INV/2026/001 | Step 2: Validación regex    |
| TC-2.3 | Usar número más largo que límite        | Step 2: max 20 chars        |
| TC-2.4 | Dejar campo vacío                       | Step 2: Fallback a auto-gen |
| TC-2.5 | Editar invoice existente (draft)        | Step 6: Update API          |

### Scenario 3: Prevent Duplicates

| TC ID  | Test Case                            | Implementation Coverage             |
| ------ | ------------------------------------ | ----------------------------------- |
| TC-3.1 | Usar número existente                | Step 5: check-number API            |
| TC-3.2 | Validación en tiempo real (onBlur)   | Step 4: useCheckInvoiceNumber       |
| TC-3.3 | Intentar guardar con duplicado       | Step 2: Server validation           |
| TC-3.4 | User A y User B usan mismo número    | DB: UNIQUE(user_id, invoice_number) |
| TC-3.5 | 2 tabs mismo user guardan simultáneo | Step 2: Error 23505 handling        |
| TC-3.6 | Race condition en auto-generate      | Step 3: Retry logic                 |

### Scenario 4: Sequential Numbering

| TC ID  | Test Case                           | Implementation Coverage            |
| ------ | ----------------------------------- | ---------------------------------- |
| TC-4.1 | Último INV-001 → nuevo invoice      | Step 3: next-number API            |
| TC-4.2 | Gap en secuencia (001, 003) → nuevo | Step 3: MAX + 1, no fill gaps      |
| TC-4.3 | Número custom → siguiente           | Step 3: Ignora custom en secuencia |

### Scenario 5: Number Format

| TC ID  | Test Case                              | Implementation Coverage          |
| ------ | -------------------------------------- | -------------------------------- |
| TC-5.1 | Config prefix "FACT"                   | Step 1: invoice_prefix column    |
| TC-5.2 | Config con año "2026-"                 | Step 3: Prefix + year logic      |
| TC-5.3 | Sin configuración                      | Step 3: Default "INV"            |
| TC-5.4 | Cambiar prefix con invoices existentes | Step 3: Nuevos usan nuevo prefix |

### Edge Cases

| TC ID | Test Case                                | Implementation Coverage            |
| ----- | ---------------------------------------- | ---------------------------------- |
| TC-E1 | Invoice en draft editado múltiples veces | Step 6: Número se mantiene         |
| TC-E2 | Invoice sent → editable?                 | Step 6: Número inmutable post-sent |
| TC-E3 | Máximo secuencial alcanzado (9999)       | Step 3: Rollover a 10000           |
| TC-E4 | Número solo con espacios                 | Step 2: trim() + required          |

---

## UI/UX Design

### Componentes del Design System a usar:

**Componentes base (ya existen):**

- ✅ Input → Campo de invoice_number
- ✅ Label → "Número de factura"
- ✅ Button → Botón refresh para regenerar
- ✅ Badge → Estado de validación (ok/error)
- ✅ Skeleton → Loading state

### Componente custom a crear:

**🆕 InvoiceNumberInput**

- **Propósito:** Campo de número de factura con auto-generación y validación
- **Props:**
  - `value: string` - Número actual
  - `onChange: (value: string) => void`
  - `onValidate: (isValid: boolean, error?: string) => void`
  - `disabled?: boolean`
- **Features:**
  - Auto-populate con next number al montar
  - Editable por el usuario
  - Validación onBlur (debounced)
  - Botón refresh para regenerar
  - Indicador de estado (loading/valid/error)
- **Ubicación:** `src/components/invoices/invoice-number-input.tsx`

### Wireframe:

```
┌─────────────────────────────────────────────────────────┐
│ Número de factura                                       │
├─────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────┐ ┌───────┐ │
│ │ INV-2026-0001                       [✓]   │ │  ↻   │ │
│ └───────────────────────────────────────────┘ └───────┘ │
│ Se generará automáticamente si lo dejas vacío          │
└─────────────────────────────────────────────────────────┘

Estados:
- Loading: Skeleton en input
- Valid: Check verde [✓]
- Error: Borde rojo + mensaje "Este número ya existe"
- Empty: Gris + hint "Se auto-generará"
```

### Estados de UI:

- **Loading:** Skeleton loader mientras carga next-number
- **Empty:** Input vacío con placeholder "Se generará automáticamente"
- **Valid:** Check verde, borde normal
- **Error:** Borde rojo, mensaje de error debajo
- **Disabled:** Input gris (invoice sent/paid)

---

## Types & Type Safety

**Tipos a agregar en `lib/types.ts`:**

```typescript
// Ya existe Invoice con invoice_number: string

// Nuevo: Response del endpoint next-number
export interface NextInvoiceNumberResponse {
  invoiceNumber: string;
  prefix: string;
  sequence: number;
}

// Nuevo: Response del endpoint check-number
export interface CheckInvoiceNumberResponse {
  available: boolean;
  message?: string;
}
```

**Actualizar BusinessProfile:**

- Agregar `invoice_prefix?: string` después de migración

---

## Implementation Steps

### **Step 1: Database Migration - Add invoice_prefix**

**Task:** Agregar columna `invoice_prefix` a `business_profiles`

**Migration SQL:**

```sql
ALTER TABLE business_profiles
ADD COLUMN invoice_prefix VARCHAR(10) DEFAULT 'INV';

COMMENT ON COLUMN business_profiles.invoice_prefix IS 'Custom prefix for invoice numbers (default: INV)';
```

**Testing:**

- Verificar columna existe con default 'INV'
- Verificar usuarios existentes tienen prefix 'INV'

**Estimated time:** 10 min

---

### **Step 2: Update Validation Schema**

**Task:** Agregar `invoiceNumber` opcional al schema de creación

**File:** `src/lib/validations/invoice.ts`

**Changes:**

```typescript
export const createInvoiceSchema = z.object({
  // ... existing fields
  invoiceNumber: z
    .string()
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Za-z0-9\-_/]+$/, 'Solo letras, números, guiones y barras')
    .optional()
    .or(z.literal('')),
});
```

**Edge cases handled:**

- Vacío → auto-generado
- Solo espacios → trim + auto-generado
- Caracteres especiales permitidos: `-`, `_`, `/`
- Máximo 20 caracteres

**Testing:**

- Unit test: validación de formatos válidos/inválidos

**Estimated time:** 15 min

---

### **Step 3: API Endpoints**

**Task:** Crear endpoints para next-number y check-number

**Files:**

- `src/app/api/invoices/next-number/route.ts` (NEW)
- `src/app/api/invoices/check-number/route.ts` (NEW)
- `src/app/api/invoices/route.ts` (UPDATE)

#### GET /api/invoices/next-number

```typescript
// Returns: { invoiceNumber: "INV-2026-0001", prefix: "INV", sequence: 1 }
// Logic:
// 1. Get user's invoice_prefix from business_profiles (default: 'INV')
// 2. Get MAX sequence for this prefix
// 3. Return prefix + year + padded(sequence + 1)
```

#### GET /api/invoices/check-number?number=XXX

```typescript
// Returns: { available: true/false, message?: string }
// Logic:
// 1. Check if invoice_number exists for this user
// 2. Return availability
```

#### UPDATE POST /api/invoices

```typescript
// Changes:
// 1. Accept optional invoiceNumber in body
// 2. If provided and not empty: validate uniqueness, use it
// 3. If empty/not provided: auto-generate
// 4. Handle 23505 error with retry (existing)
```

**Testing:**

- API test: next-number returns sequential
- API test: check-number detects duplicates
- API test: custom number is saved correctly

**Estimated time:** 45 min

---

### **Step 4: Invoice Number Input Component**

**Task:** Crear componente de UI para el campo de invoice number

**File:** `src/components/invoices/invoice-number-input.tsx`

**Features:**

- Fetch next-number al montar
- Input editable
- Validación onBlur (debounce 300ms)
- Botón refresh para regenerar
- Estados visuales (loading/valid/error)

**Dependencies:**

- `useDebouncedCallback` from `use-debounce`
- React Query para fetching

**Testing:**

- Render con número auto-generado
- Editar número muestra estado loading → valid/error
- Refresh regenera número

**Estimated time:** 1 hour

---

### **Step 5: Create Custom Hook**

**Task:** Crear hook para lógica de invoice number

**File:** `src/hooks/invoices/use-invoice-number.ts`

**Hook API:**

```typescript
function useInvoiceNumber() {
  return {
    nextNumber: string,
    isLoadingNext: boolean,
    checkAvailability: (number: string) => Promise<boolean>,
    isChecking: boolean,
    error: string | null,
    refresh: () => void,
  }
}
```

**Estimated time:** 30 min

---

### **Step 6: Update Invoice Form**

**Task:** Integrar InvoiceNumberInput en el form de creación

**File:** `src/app/(app)/invoices/create/page.tsx` (o donde esté el form)

**Changes:**

1. Agregar InvoiceNumberInput al form
2. Pasar valor a la mutación de createInvoice
3. Deshabilitar campo si status !== 'draft'

**Testing:**

- E2E: Crear invoice con número auto
- E2E: Crear invoice con número custom
- E2E: Error al usar número duplicado

**Estimated time:** 30 min

---

### **Step 7: Update Types**

**Task:** Regenerar tipos de Supabase y actualizar lib/types.ts

**Commands:**

```bash
bunx supabase gen types typescript --project-id czuusjchqpgvanvbdrnz > src/types/supabase.ts
```

**File:** `src/lib/types.ts` - Agregar nuevos tipos de response

**Estimated time:** 10 min

---

## Technical Decisions

### Decision 1: Formato de número por defecto

**Chosen:** `{PREFIX}-{YEAR}-{SEQUENCE}` (ej: INV-2026-0001)

**Reasoning:**

- ✅ Incluye año para fácil ordenamiento
- ✅ Prefix personalizable en settings
- ✅ 4 dígitos de secuencia (9999 facturas/año)
- ❌ Trade-off: Más largo que formatos simples

### Decision 2: Validación de duplicados

**Chosen:** Doble validación (client + server)

**Reasoning:**

- ✅ UX: Error inmediato en UI (onBlur)
- ✅ Integridad: DB constraint como respaldo
- ✅ Race conditions: Manejadas por retry logic

### Decision 3: Custom number no afecta secuencia

**Chosen:** La secuencia auto ignora números custom

**Reasoning:**

- ✅ Predecible: Usuario sabe qué número sigue
- ✅ Simple: No hay lógica compleja de gaps
- ❌ Trade-off: Posible confusión si mezclan mucho

---

## Dependencies

**Pre-requisitos técnicos:**

- [x] Constraint UNIQUE(user_id, invoice_number) - YA EXISTE
- [x] generateInvoiceNumber() base - YA EXISTE
- [ ] Migración invoice_prefix - CREAR
- [ ] Endpoints next-number, check-number - CREAR

---

## Risks & Mitigations

**Risk 1:** Race condition si 2 tabs crean invoice simultáneo

- **Impact:** Low (DB constraint previene duplicados)
- **Mitigation:** Error 23505 → retry con nuevo número

**Risk 2:** Usuario cambia prefix con facturas existentes

- **Impact:** Low (solo afecta nuevas)
- **Mitigation:** Documentar que nuevas usan nuevo prefix

---

## Estimated Effort

| Step      | Task                                                   | Time         |
| --------- | ------------------------------------------------------ | ------------ |
| 1         | DB Migration (invoice_prefix)                          | 10 min       |
| 2         | Update Validation Schema                               | 15 min       |
| 3         | API Endpoints (next-number, check-number, update POST) | 45 min       |
| 4         | InvoiceNumberInput Component                           | 1 hour       |
| 5         | useInvoiceNumber Hook                                  | 30 min       |
| 6         | Update Invoice Form                                    | 30 min       |
| 7         | Update Types                                           | 10 min       |
| **Total** |                                                        | **~3 hours** |

**Story points:** 2 (matches estimación en Jira)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando
- [ ] **Tipos del backend usados correctamente**
  - [ ] Imports desde `@/lib/types` en componentes
  - [ ] Props de componentes tipadas
  - [ ] Zero type errors
- [ ] **UI/UX según design system**
  - [ ] Bordes rounded-md en inputs
  - [ ] Colores de error (border-red-500)
  - [ ] Estados de loading con Skeleton
- [ ] Tests E2E pasando (referencia: Test Cases de Jira)
  - [ ] TC-1.1: Primer invoice genera INV-{YEAR}-0001
  - [ ] TC-1.2: Secuencia incrementa correctamente
  - [ ] TC-2.1: Número custom es aceptado
  - [ ] TC-3.1: Duplicado muestra error
  - [ ] TC-3.2: Validación en tiempo real funciona
  - [ ] TC-5.1: Prefix custom funciona
- [ ] Code review aprobado
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run build` passes
- [ ] Deployed to staging
- [ ] Manual smoke test en staging

---

**Autor:** Claude Code
**Fecha:** 2026-02-11
**Story:** [SQ-27](https://upexgalaxy64.atlassian.net/browse/SQ-27)
