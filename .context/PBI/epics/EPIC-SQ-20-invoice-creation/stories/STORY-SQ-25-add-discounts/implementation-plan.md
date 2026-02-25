# Implementation Plan: STORY-SQ-25 - Add Discounts to Invoice

## Overview

Implementar funcionalidad de descuentos en facturas, permitiendo aplicar descuentos porcentuales o de monto fijo, con validaciones de límites y cálculo automático de totales.

**Acceptance Criteria a cumplir:**

- AC1: Descuento porcentual calcula correctamente (ej: 10% de $1000 = $100)
- AC2: Descuento fijo aplica monto exacto (ej: $50 fijo = $50)
- AC3: Descuento se limita al subtotal (no genera total negativo)
- AC4: Sin descuento = no se muestra línea de descuento
- AC5: Validación de valores inválidos (negativos, >100%)
- AC6: Recálculo automático al cambiar valores

---

## Technical Approach

**Chosen approach:** Componente DiscountInput similar a TaxInput existente, con selector de tipo (percentage/fixed) y input numérico. Reutilizar infraestructura de cálculos existente.

**Why this approach:**

- Consistencia: Sigue el patrón ya establecido por TaxInput
- Reutilización: Las funciones de cálculo ya manejan discountAmount
- Mínimo impacto: Solo agregar campos sin romper funcionalidad existente
- Type-safety: Los tipos de DB ya existen (`discount_type` enum)

**Alternatives considered:**

- Slider para porcentaje: Rechazado por menor precisión y no soporta fixed
- Campos separados sin toggle: Rechazado por UX confusa

---

## UI/UX Design

### Componentes del Design System a usar:

- Button (variant outline/default) - toggle tipo descuento
- Input - valor numérico
- Select - alternativa para tipo (descartado a favor de buttons)

### Componente custom a crear:

- **DiscountInput**
  - **Propósito:** Capturar tipo y valor de descuento
  - **Props:** `subtotal`, `discountType`, `discountValue`, `onChange`, `disabled`, `error`
  - **Diseño:** Toggle buttons (Porcentaje/Fijo) + Input numérico + suffix dinámico (%/$)
  - **Ubicación:** `src/components/invoices/discount-input.tsx`

### Layout en formulario:

```
┌──────────────────────────────────────┐
│ ... (campos existentes) ...          │
├──────────────────────────────────────┤
│ Impuesto (IVA)                       │
│ [TaxInput existente]                 │
├──────────────────────────────────────┤
│ Descuento (opcional)          ← NEW  │
│ [Porcentaje] [Fijo]  [___10__] %     │
│ ⚠️ Warning si excede subtotal        │
├──────────────────────────────────────┤
│ [InvoiceSummary con descuento]       │
└──────────────────────────────────────┘
```

### Estados de UI:

- **Default:** Input deshabilitado visualmente cuando value=0
- **Active:** Input activo con tipo seleccionado
- **Warning:** Mensaje amarillo cuando descuento excede subtotal
- **Error:** Borde rojo + mensaje para valores inválidos

---

## Types & Type Safety

**Tipos existentes en DB:**

```typescript
// Ya existe en types/supabase.ts
discount_type: 'percentage' | 'fixed' | null;
discount_value: number | null; // Valor almacenado es el AMOUNT calculado
```

**Nota importante sobre discount_value:**
Según el schema, `discount_value` almacena el **monto calculado** del descuento, no el valor ingresado.
Si el usuario ingresa 10% sobre $1000, se guarda discount_value=100 (no 10).

**Tipos a agregar en validaciones:**

```typescript
discountType: z.enum(['percentage', 'fixed']).optional().nullable();
discountValue: z.number().min(0).optional().nullable();
```

---

## Implementation Steps

### **Step 1: Agregar función de cálculo de descuento**

**Task:** Crear función `calculateDiscountAmount` en invoice-calculations.ts

**File:** `src/lib/utils/invoice-calculations.ts`

**Logic:**

```typescript
export function calculateDiscountAmount(
  subtotal: number,
  discountType: 'percentage' | 'fixed' | null,
  discountValue: number
): { amount: number; capped: boolean } {
  if (!discountType || discountValue <= 0) {
    return { amount: 0, capped: false };
  }

  let amount: number;
  if (discountType === 'percentage') {
    amount = roundCurrency(subtotal * (discountValue / 100));
  } else {
    amount = roundCurrency(discountValue);
  }

  // Cap at subtotal
  const capped = amount > subtotal;
  return {
    amount: capped ? subtotal : amount,
    capped,
  };
}
```

**Testing:** Unit tests con casos edge (0, >100%, >subtotal)

---

### **Step 2: Actualizar schemas de validación**

**Task:** Agregar campos de descuento a los schemas Zod

**File:** `src/lib/validations/invoice.ts`

**Changes:**

```typescript
// En createInvoiceSchema
discountType: z.enum(['percentage', 'fixed']).optional().nullable(),
discountValue: z.number().min(0, 'El descuento no puede ser negativo').optional().nullable(),

// Validación condicional: si hay tipo, debe haber valor
.refine(data => {
  if (data.discountType && (data.discountValue === undefined || data.discountValue === null)) {
    return false;
  }
  return true;
}, { message: 'Ingresa un valor de descuento' })

// Validación: porcentaje no puede exceder 100
.refine(data => {
  if (data.discountType === 'percentage' && data.discountValue && data.discountValue > 100) {
    return false;
  }
  return true;
}, { message: 'El porcentaje no puede exceder 100%' })
```

**Testing:** Validar schemas con datos válidos/inválidos

---

### **Step 3: Crear componente DiscountInput**

**Task:** Crear componente de UI para capturar descuento

**File:** `src/components/invoices/discount-input.tsx`

**Structure:**

```typescript
interface DiscountInputProps {
  subtotal: number;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number;
  onChange: (type: 'percentage' | 'fixed' | null, value: number) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}
```

**Features:**

- Toggle buttons para tipo (Porcentaje/Fijo) con aria-pressed
- Input numérico con suffix dinámico (% o $)
- Warning visible si descuento > subtotal
- Preview del monto calculado
- data-testid para cada elemento interactivo

**Test Cases cubiertos:**

- TC1, TC2: Cálculo correcto según tipo
- TC3: Warning cuando excede subtotal
- TC4: Sin línea cuando value=0
- TC5: Validación de negativos y >100%

---

### **Step 4: Actualizar InvoiceSummary**

**Task:** Mejorar display de descuento mostrando tipo

**File:** `src/components/invoices/invoice-summary.tsx`

**Changes:**

- Agregar props: `discountType`, `discountValue` (opcional, para mostrar info adicional)
- Mostrar etiqueta contextual: "Descuento (10%)" o "Descuento (fijo)"

```typescript
{discountAmount > 0 && (
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">
      {discountType === 'percentage'
        ? `Descuento (${discountValue}%)`
        : 'Descuento'}
    </span>
    <span className="text-destructive">
      -{formatCurrency(discountAmount, currency)}
    </span>
  </div>
)}
```

---

### **Step 5: Actualizar formulario de creación**

**Task:** Integrar DiscountInput en create invoice page

**File:** `src/app/(app)/invoices/create/page.tsx`

**Changes:**

1. Agregar defaultValues: `discountType: null, discountValue: 0`
2. Watch discountType y discountValue para summary reactivo
3. Agregar FormField para descuento después de taxRate
4. Calcular discountAmount para pasar a InvoiceSummary
5. Pasar discountType/Value al API

---

### **Step 6: Actualizar formulario de edición**

**Task:** Integrar DiscountInput en edit invoice page

**File:** `src/app/(app)/invoices/[id]/edit/page.tsx`

**Changes:**

- Misma estructura que create
- Cargar valores existentes de la factura
- Auto-save incluye discount fields

---

### **Step 7: Actualizar API endpoints**

**Task:** Procesar y persistir descuentos en API

**Files:**

- `src/app/api/invoices/route.ts` (POST)
- `src/app/api/invoices/[id]/route.ts` (PUT)

**POST /api/invoices:**

```typescript
// Calcular discount amount antes de guardar
const { amount: discountAmount } = calculateDiscountAmount(
  subtotal,
  discountType,
  discountValue
);

// Guardar en DB
.insert({
  ...otherFields,
  discount_type: discountType,
  discount_value: discountAmount, // Guardamos el MONTO, no el valor input
  tax_amount: calculateTax(subtotal, discountAmount, taxRate),
  total: calculateTotal(subtotal, discountAmount, taxAmount),
})
```

**PUT /api/invoices/[id]:**

```typescript
// Si cambia discount, recalcular todo
if (discountType !== undefined || discountValue !== undefined) {
  const { amount: discountAmount } = calculateDiscountAmount(
    existingInvoice.subtotal ?? 0,
    discountType ?? existingInvoice.discount_type,
    discountValue ?? 0
  );

  updates.discount_type = discountType;
  updates.discount_value = discountAmount;
  // Recalcular tax y total
}
```

---

### **Step 8: Exportar componente**

**Task:** Agregar export del nuevo componente

**File:** `src/components/invoices/index.ts`

```typescript
export { DiscountInput } from './discount-input';
```

---

### **Step 9: Integration Testing**

**Task:** Verificar flujo completo

**Test Flow:**

1. Crear factura con descuento porcentual 10%
2. Verificar cálculos en summary
3. Guardar y verificar persistencia
4. Editar factura, cambiar a descuento fijo
5. Verificar recálculo
6. Probar límite (descuento > subtotal)

---

## Test Cases Mapping (from Jira)

| Test Case | Scenario                             | Implementation Step |
| --------- | ------------------------------------ | ------------------- |
| TC-01     | Descuento porcentual 10% con tax 16% | Steps 1, 3, 5       |
| TC-02     | Descuento fijo $50 con tax 16%       | Steps 1, 3, 5       |
| TC-03     | Descuento > subtotal (cap + warning) | Steps 1, 3          |
| TC-04     | Sin descuento (no mostrar línea)     | Steps 3, 4          |
| TC-05     | Validación porcentaje > 100          | Steps 2, 3          |
| TC-06     | Validación valor negativo            | Steps 2, 3          |
| TC-07     | Recálculo al modificar items         | Step 5, 6           |
| TC-INT-01 | Crear factura con descuento (API)    | Step 7              |
| TC-INT-02 | Actualizar descuento en draft (API)  | Step 7              |

---

## Technical Decisions

### Decision 1: Almacenar monto calculado vs valor ingresado

**Chosen:** Almacenar el **monto calculado** en `discount_value`

**Reasoning:**

- Consistencia con tax_amount (también almacena monto calculado)
- Simplifica queries y reportes (no necesita recalcular)
- El tipo ya indica cómo se calculó

**Trade-off:** Perdemos el valor original ingresado, pero el tipo lo preserva implícitamente.

### Decision 2: UI de toggle buttons vs select

**Chosen:** Toggle buttons similar a TaxInput presets

**Reasoning:**

- Consistencia visual con TaxInput
- Solo 2 opciones (no justifica dropdown)
- Mejor accesibilidad (aria-pressed)

---

## Dependencies

**Pre-requisitos técnicos:**

- [x] Campos `discount_type` y `discount_value` en DB (ya existen)
- [x] Funciones de cálculo base (calculateTaxableBase, etc.)
- [x] InvoiceSummary ya soporta discountAmount

---

## Risks & Mitigations

**Risk 1:** Inconsistencia en cálculos frontend vs backend

- **Impact:** High
- **Mitigation:** Usar misma función `calculateDiscountAmount` en ambos lados

**Risk 2:** Pérdida de datos al editar factura sin descuento previo

- **Impact:** Medium
- **Mitigation:** Manejar null/undefined correctamente en update

---

## Estimated Effort

| Step      | Description                     | Time         |
| --------- | ------------------------------- | ------------ |
| 1         | Función calculateDiscountAmount | 15 min       |
| 2         | Actualizar schemas              | 20 min       |
| 3         | Crear DiscountInput             | 45 min       |
| 4         | Actualizar InvoiceSummary       | 15 min       |
| 5         | Actualizar create page          | 30 min       |
| 6         | Actualizar edit page            | 30 min       |
| 7         | Actualizar API                  | 30 min       |
| 8         | Export component                | 5 min        |
| 9         | Testing integración             | 30 min       |
| **Total** |                                 | **~3.5 hrs** |

**Story points:** 2 (matches estimation)

---

## Definition of Done Checklist

- [ ] Función calculateDiscountAmount implementada y probada
- [ ] Schemas Zod actualizados con validaciones
- [ ] DiscountInput component creado con:
  - [ ] Toggle tipo (percentage/fixed)
  - [ ] Input valor con suffix dinámico
  - [ ] Warning para exceso de subtotal
  - [ ] data-testid en elementos interactivos
- [ ] InvoiceSummary muestra tipo de descuento
- [ ] Create invoice form incluye descuento
- [ ] Edit invoice form incluye descuento
- [ ] API POST procesa descuento
- [ ] API PUT procesa descuento
- [ ] Todos los test cases cubiertos:
  - [ ] TC-01: Porcentual correcto
  - [ ] TC-02: Fijo correcto
  - [ ] TC-03: Cap + warning
  - [ ] TC-04: Sin línea cuando 0
  - [ ] TC-05: Error >100%
  - [ ] TC-06: Error negativo
- [ ] Linting passes
- [ ] Build passes
- [ ] Zero TypeScript errors

---

_Generado: 2026-02-12_
_Story: SQ-25 - Add Discounts to Invoice_
