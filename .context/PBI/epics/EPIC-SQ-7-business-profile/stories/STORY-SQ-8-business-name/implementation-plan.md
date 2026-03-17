# Implementation Plan: STORY-SQ-8 - Configure Business Name

## Overview

Implementar la funcionalidad para que el usuario pueda configurar y editar su nombre de negocio desde la página de Settings. Este nombre aparece en el encabezado de las facturas.

**Esta story establece la estructura base del Settings page (Tabs layout) que las demás stories del epic reutilizarán.**

**Acceptance Criteria a cumplir:**

- AC1: Set business name for the first time
- AC2: Update existing business name
- AC3: Business name appears on invoice header

---

## Technical Approach

**Chosen approach:** Settings page con Tabs layout + BusinessNameForm con React Hook Form + Zod + `maxLength={100}` blocking + character counter en tiempo real. Mutation via `useMutation` + Supabase client.

**Alternatives considered:**

- Server Actions: No se eligió porque el proyecto usa hooks + Supabase client-side consistentemente
- Separate `/settings/profile` page: No se eligió - Tabs en una sola página es mejor UX

**Why this approach:**

- ✅ Consistente con patrones existentes (hooks/clients/, hooks/invoices/)
- ✅ `maxLength` blocking es mejor UX que validar después (decisión del Shift-Left Q&A)
- ✅ Character counter proporciona feedback visual inmediato
- ❌ Trade-off: Requiere crear la estructura de Tabs que beneficia a todas las stories

---

## UI/UX Design

### Componentes del Design System a usar:

- ✅ `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent`: Layout de settings
- ✅ `Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardContent`: Contenedor del form
- ✅ `Form` / `FormField` / `FormItem` / `FormLabel` / `FormControl` / `FormMessage`: Form structure
- ✅ `Input`: Campo de business name con `maxLength={100}`
- ✅ `Button`: Guardar cambios

### Componentes custom:

- 🆕 `BusinessNameForm` → `components/settings/business-name-form.tsx`
  - **Propósito:** Formulario para editar el nombre de negocio
  - **Props:** `businessProfile: BusinessProfile | null`, `onSuccess?: () => void`
  - **Ubicación:** `src/components/settings/business-name-form.tsx`

### Wireframe:

```
┌──────────────────────────────────────────────────────┐
│ Configuración                                         │
│ Personaliza tu perfil de negocio y preferencias.      │
├──────────────────────────────────────────────────────┤
│ [Perfil] [Contacto] [Datos Fiscales] [Métodos Pago]  │
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐  │
│ │ Nombre del negocio                               │  │
│ │ Este nombre aparecerá en el encabezado de tus    │  │
│ │ facturas.                                        │  │
│ │                                                  │  │
│ │ Nombre del negocio                               │  │
│ │ ┌──────────────────────────────────┐ 26/100      │  │
│ │ │ Diseño Creativo García           │             │  │
│ │ └──────────────────────────────────┘             │  │
│ │ Máximo 100 caracteres.                           │  │
│ │                                                  │  │
│ │                        [Guardar cambios]         │  │
│ └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Estados de UI:

- **Loading:** Skeleton en el input field
- **Empty/First time:** Input vacío con placeholder "Ej: Diseño Creativo García"
- **Filled:** Input con valor actual del perfil
- **Saving:** Button disabled "Guardando..."
- **Success:** Toast "Nombre de negocio actualizado"
- **Error:** Toast de error + FormMessage si validación falla

### Validaciones visuales:

- **Business name vacío:** FormMessage "El nombre es requerido"
- **Menos de 2 chars:** FormMessage "El nombre debe tener al menos 2 caracteres"
- **Counter:** `{length}/100` - normal (muted), warning naranja a 90+, rojo a 100
- **maxLength:** Input blocking - no permite escribir más de 100 chars

### Personalidad UI/UX: Minimalista Profesional

- ✅ Espaciado generoso (`p-6`, `space-y-6`)
- ✅ Sombras sutiles (`shadow-sm`)
- ✅ Bordes suaves (`rounded-lg`)
- ✅ Colores profesionales

---

## Types & Type Safety

**Tipos existentes a usar:**

```typescript
import type { BusinessProfile, BusinessProfileUpdate } from '@/lib/types';
```

**Zod schema para el form:**

```typescript
// lib/validations/business-profile.ts
const businessNameSchema = z.object({
  businessName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .refine(val => val.trim().length >= 2, 'El nombre no puede ser solo espacios en blanco'),
});
```

---

## Content Writing

Textos contextuales para SoloQ:

- Page title: "Configuración"
- Page description: "Personaliza tu perfil de negocio y preferencias."
- Card title: "Nombre del negocio"
- Card description: "Este nombre aparecerá en el encabezado de tus facturas."
- Label: "Nombre del negocio"
- Placeholder: "Ej: Diseño Creativo García"
- FormDescription: "Máximo 100 caracteres."
- Submit button: "Guardar cambios"
- Success toast: "Nombre de negocio actualizado"
- Error toast: "Error al guardar. Intenta de nuevo."

---

## Implementation Steps

### **Step 1: DB Migration - CHECK constraint on business_name**

**Task:** Agregar CHECK constraint para limitar business_name a 100 caracteres a nivel DB (safety net).

**Details:**

- Usar Supabase MCP `apply_migration` para ejecutar:
  ```sql
  ALTER TABLE business_profiles
  ADD CONSTRAINT business_name_max_length CHECK (length(business_name) <= 100);
  ```
- Regenerar tipos: `mcp__supabase__generate_typescript_types`
- Actualizar `src/types/supabase.ts` con los tipos regenerados

**Testing:**

- Verificar que INSERT/UPDATE con >100 chars falla a nivel DB
- Verificar que datos existentes no violan el constraint

**Estimated time:** 15 min

---

### **Step 2: Create validation schema**

**Task:** Crear Zod schema para business name validation

**File:** `src/lib/validations/business-profile.ts`

**Details:**

- Schema con min 2, max 100, trim whitespace
- Refine para rechazar whitespace-only input
- Exportar schema y tipo inferido

**Testing:**

- Schema rechaza string vacío, <2 chars, >100 chars, whitespace-only

**Estimated time:** 10 min

---

### **Step 3: Create useUpdateBusinessProfile hook**

**Task:** Hook de mutation para actualizar el business profile

**File:** `src/hooks/business-profile/use-update-business-profile.ts`

**Details:**

- `useMutation` con Supabase `.update()` en `business_profiles`
- `onSuccess`: invalidar queryKey `['business-profile']`
- `onSuccess`: invalidar queryKey `['auth']` si auth context usa perfil
- Toast de éxito/error con sonner
- Exportar desde `hooks/business-profile/index.ts`

**Edge cases handled:**

- User sin perfil: El hook debe hacer upsert o verificar que el perfil existe
- Error de red: Toast de error, no crash

**Testing:**

- Hook actualiza business_name correctamente
- Cache se invalida y UI refleja cambio

**Estimated time:** 20 min

---

### **Step 4: Create Settings page structure with Tabs**

**Task:** Transformar el placeholder settings page en layout con Tabs

**File:** `src/app/(app)/settings/page.tsx`

**Details:**

- Import Tabs, TabsList, TabsTrigger, TabsContent de shadcn/ui
- 4 tabs: "Perfil", "Contacto", "Datos Fiscales", "Métodos de Pago"
- Solo el tab "Perfil" tiene contenido en esta story
- Otros 3 tabs muestran "Próximamente" placeholder
- Fetch business profile con `useBusinessProfile()`
- Pasar profile data al BusinessNameForm
- Page header: título + descripción
- data-testid en elementos interactivos

**Testing:**

- Page renderiza con 4 tabs
- Tab "Perfil" está activo por defecto
- Loading state muestra skeleton

**Estimated time:** 30 min

---

### **Step 5: Create BusinessNameForm component**

**Task:** Componente de formulario para business name

**File:** `src/components/settings/business-name-form.tsx`

**Details:**

- React Hook Form con Zod resolver (schema de Step 2)
- Input con `maxLength={100}` (blocking)
- Character counter: `{length}/100` con colores dinámicos:
  - Normal: `text-muted-foreground`
  - Warning (90+): `text-amber-500`
  - Max (100): `text-destructive`
- Pre-fill con valor actual del `businessProfile.business_name`
- Submit llama a `useUpdateBusinessProfile` mutation
- Button disabled durante saving
- data-testid: `business-name-input`, `char-counter`, `save-business-name-button`

**Edge cases handled:**

- Whitespace-only: Rechazado por Zod refine
- Special chars (Ñ, ™, &): Aceptados, validación solo por longitud
- Form pristine (sin cambios): Button habilitado pero no hace nada si valor es igual

**Testing:**

- Renderiza con valor pre-filled
- Character counter actualiza en tiempo real
- No permite >100 chars
- Save actualiza correctamente
- Toast de éxito aparece

**Estimated time:** 40 min

---

### **Step 6: Integration & Verification**

**Task:** Verificar integración completa

**Details:**

1. Settings page carga perfil existente
2. BusinessNameForm muestra nombre actual
3. Editar nombre → Guardar → Toast éxito → Nombre actualizado en DB
4. Primera vez (perfil nuevo) → Form vacío → Guardar → Nombre creado
5. Invoice header refleja nombre actualizado (verificación visual si invoice page existe)
6. `bun run lint && bun run build` pasan sin errores

**Testing:**

- E2E: Navegación a /settings → editar nombre → guardar → verificar en DB
- Todos los test cases del Acceptance Test Plan cubiertos

**Estimated time:** 20 min

---

## Test Cases Mapping (del Acceptance Test Plan)

| TC# | Test Case | Step que lo cubre |
|-----|-----------|-------------------|
| TC-1 | Save business name first time | Step 5 + 6 |
| TC-2 | Update existing business name | Step 5 + 6 |
| TC-3 | Validation error >100 chars (blocking) | Step 5 (maxLength) |
| TC-4 | Reject whitespace-only | Step 2 + 5 (Zod refine) |
| TC-5 | Block invoice without business name | Outside scope (invoice creation) |
| TC-6 | Special characters preserved | Step 5 (no char restriction) |
| TC-7 | Business name on invoice PDF | Step 6 (verification) |

---

## Technical Decisions (Story-specific)

### Decision 1: maxLength blocking vs validation error

**Chosen:** `maxLength={100}` en el HTML input + character counter

**Reasoning:**

- ✅ Decidido en Shift-Left Q&A - mejor UX que permitir escribir y mostrar error
- ✅ Counter proporciona feedback visual proactivo
- ❌ Trade-off: TC-3 verifica que input NO acepta char 101, no que muestra error

---

## Dependencies

**Pre-requisitos técnicos:**

- [x] Auth funcional (login/signup) - ya implementado
- [x] `business_profiles` table existe - ya implementado
- [x] `useBusinessProfile` hook existe - ya implementado
- [x] shadcn/ui Tabs component instalado - ya disponible

---

## Risks & Mitigations

**Risk 1:** Settings page Tabs structure puede cambiar si stories posteriores requieren layout diferente

- **Impact:** Low
- **Mitigation:** Diseño con tabs es flexible, se puede ajustar en stories posteriores sin breaking changes

**Risk 2:** Upsert vs Update - usuario podría no tener perfil

- **Impact:** Medium
- **Mitigation:** Usar `.upsert()` o verificar existencia antes de `.update()`

---

## Estimated Effort

| Step | Time |
|------|------|
| 1. DB Migration | 15 min |
| 2. Validation Schema | 10 min |
| 3. Mutation Hook | 20 min |
| 4. Settings Page Structure | 30 min |
| 5. BusinessNameForm | 40 min |
| 6. Integration | 20 min |
| **Total** | **~2h 15min** |

**Story points:** 2

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando (AC1, AC2, AC3)
- [ ] **Tipos del backend usados correctamente**
  - [ ] Import BusinessProfile desde `@/lib/types`
  - [ ] Props tipadas correctamente
  - [ ] Zero type errors
- [ ] **UI/UX minimalista profesional**
  - [ ] Tabs layout funcional con 4 tabs
  - [ ] Character counter con colores dinámicos
  - [ ] maxLength=100 blocking
  - [ ] Toast notifications
- [ ] **Content Writing contextual**
  - [ ] Español LATAM, vocabulario SoloQ
  - [ ] Sin frases placeholder
- [ ] **data-testid** en elementos interactivos
  - [ ] `business-name-input`
  - [ ] `char-counter`
  - [ ] `save-business-name-button`
- [ ] **Test cases cubiertos:** TC-1 a TC-7
- [ ] **Build y linting pasando**
  - [ ] `bun run lint` sin errores
  - [ ] `bun run build` exitoso
  - [ ] Zero TypeScript errors

---

_Generado: 2026-03-11_
_Autor: Claude Code (Dev)_
