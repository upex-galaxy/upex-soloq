# Implementation Plan: SQ-28 - Set Invoice Due Date

**Fecha:** 2026-02-08
**Desarrollador:** Claude Code
**Story:** [SQ-28](https://upexgalaxy64.atlassian.net/browse/SQ-28)
**Branch:** `feat/SQ-28/due-date-picker`

---

## Resumen

Mejorar el campo de fecha de vencimiento en el formulario de creación de facturas añadiendo:

1. Presets rápidos (Today, 15 days, 30 days, 45 days, 60 days)
2. Warning visual para fechas pasadas (non-blocking)
3. Mantener el input nativo type="date" para compatibilidad cross-browser

---

## Análisis del Código Existente

### Lo que ya existe:

- `src/app/(app)/invoices/create/page.tsx`: Formulario con input type="date" básico
- `getDefaultDueDate()`: Ya calcula 30 días desde hoy
- Schema `createInvoiceSchema`: Valida fechas pero no advierte sobre pasadas
- Patrón `TaxInput`: Componente con presets a seguir

### Lo que falta:

- Componente `DueDatePicker` con presets
- Warning visual para fechas pasadas
- Data-testids específicos para cada preset

---

## Steps de Implementación

### Step 1: Crear utilidades de fecha

**Archivo:** `src/lib/utils/date-presets.ts`

- Crear constantes para presets de fecha
- Función helper para calcular fecha desde preset
- Función para detectar si una fecha está en el pasado

```typescript
export const DUE_DATE_PRESETS = [
  { label: 'Hoy', days: 0 },
  { label: '15 días', days: 15 },
  { label: '30 días', days: 30 },
  { label: '45 días', days: 45 },
  { label: '60 días', days: 60 },
];

export function calculateDueDate(daysFromNow: number): string;
export function isPastDate(dateString: string): boolean;
```

### Step 2: Crear componente DueDatePicker

**Archivo:** `src/components/invoices/due-date-picker.tsx`

Componente que incluye:

- Input type="date" nativo
- Botones de presets (similar a TaxInput)
- Warning visual cuando fecha < hoy
- Props: `value`, `onChange`, `disabled`, `error`

**Data-testids:**

- `due-date-input`: El input de fecha
- `due-date-preset-{days}`: Cada botón de preset
- `due-date-past-warning`: El mensaje de advertencia

### Step 3: Integrar en formulario de factura

**Archivo:** `src/app/(app)/invoices/create/page.tsx`

- Reemplazar Input type="date" por DueDatePicker
- Importar el nuevo componente
- Mantener la misma integración con react-hook-form

### Step 4: Exportar componente

**Archivo:** `src/components/invoices/index.ts`

- Añadir export de DueDatePicker

---

## Test Cases Mapeados

| Test Case                        | Step que lo cubre          |
| -------------------------------- | -------------------------- |
| TC-SQ28-01: Default 30 días      | Ya existe en código actual |
| TC-SQ28-02: Presets              | Step 2, 3                  |
| TC-SQ28-03: Fecha custom         | Input nativo               |
| TC-SQ28-04: Warning fecha pasada | Step 1, 2                  |
| TC-SQ28-05: Preset "Hoy"         | Step 2                     |
| TC-SQ28-06: Cerrar sin cambiar   | Input nativo               |

---

## Decisiones Técnicas

1. **Input nativo vs Calendar**: Usamos input type="date" nativo
   - Pro: Cross-browser, accesible, no dependencias extra
   - Con: Menos customizable visualmente
   - Decisión: Mantener nativo como ya existe

2. **Patrón de presets**: Siguiendo el patrón de `TaxInput`
   - Botones pequeños debajo del input
   - Variant "default" para el preset activo

3. **Warning non-blocking**: Texto naranja debajo del input
   - No impide el submit del formulario
   - Mensaje claro: "La fecha de vencimiento está en el pasado"

---

## Dependencias

- Ninguna nueva dependencia necesaria
- Usa componentes existentes: Button, Input de shadcn/ui

---

## Archivos a Modificar/Crear

| Archivo                                       | Acción    |
| --------------------------------------------- | --------- |
| `src/lib/utils/date-presets.ts`               | CREAR     |
| `src/components/invoices/due-date-picker.tsx` | CREAR     |
| `src/components/invoices/index.ts`            | MODIFICAR |
| `src/app/(app)/invoices/create/page.tsx`      | MODIFICAR |

---

## Criterios de Aceptación

- [x] Default 30 días funciona (ya existe)
- [ ] Presets: Today, 15 days, 30 days, 45 days, 60 days
- [ ] Fecha custom via input nativo
- [ ] Warning para fechas pasadas
- [ ] No bloquea el submit con fecha pasada
- [ ] Build y lint pasan

---

_Generado por Claude Code - 2026-02-08_
