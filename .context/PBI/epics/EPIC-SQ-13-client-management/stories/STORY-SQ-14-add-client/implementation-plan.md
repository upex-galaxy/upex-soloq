# Implementation Plan: STORY-SQ-14 - Add New Client

## Overview

Implementar el formulario de creación de nuevos clientes, permitiendo a los freelancers agregar clientes con datos básicos (nombre, email) y opcionales (empresa, teléfono, dirección) para poder facturarlos posteriormente.

**Acceptance Criteria a cumplir:**

- AC1: Agregar cliente con info básica (nombre + email)
- AC2: Validar formato de email
- AC3: Prevenir clientes duplicados (mismo email por usuario)
- AC4: Agregar campos opcionales (empresa, teléfono, dirección)

---

## Technical Approach

**⚠️ Verificación con Context7 MCP realizada:**

- ✅ TanStack React Query v5: `useMutation`, `useQueryClient`, `invalidateQueries`
- ✅ Optimistic updates pattern confirmado
- ✅ React Hook Form + Zod resolver pattern confirmado

**Chosen approach:** Server Actions + React Query Mutations

**Flujo técnico:**

1. Formulario con React Hook Form + Zod validation
2. Submit → API Route POST `/api/clients`
3. API valida con Zod server-side + verifica duplicados
4. Supabase insert con RLS (user_id automático)
5. Invalidar cache de React Query → redirect a `/clients`

**Alternatives considered:**

- A) Server Actions directas (Next.js): No elegida porque necesitamos invalidación de cache de React Query
- B) Formulario sin React Hook Form: No elegida porque perdemos validación type-safe y UX de errores

**Why this approach:**

- ✅ Validación client + server con mismo schema Zod
- ✅ React Query maneja loading/error states automáticamente
- ✅ Cache invalidation para actualizar lista de clientes
- ❌ Trade-off: Requiere API route adicional (vs Server Actions puras)

---

## UI/UX Design

**Design System disponible:** `.context/design-system.md`

### Componentes del Design System a usar:

**Componentes base (ya existen):**

- ✅ Button → `variant`: primary (Guardar), secondary (Cancelar)
- ✅ Card → Contenedor del formulario
- ✅ Input + Label → Campos del formulario
- ✅ Form → Wrapper con React Hook Form
- ✅ Sonner (Toast) → Notificaciones de éxito/error

### Componentes custom a crear:

**Componentes específicos del dominio (nuevos):**

- 🆕 **ClientForm**
  - **Propósito:** Formulario reutilizable para crear/editar clientes
  - **Props:** `defaultValues?: Partial<ClientFormData>`, `onSubmit: (data) => void`, `isLoading?: boolean`
  - **Diseño:** Card con campos en grid 2 columnas (desktop), 1 columna (mobile)
  - **Ubicación:** `src/components/clients/client-form.tsx`

### Wireframes/Layout:

**Estructura de la página `/clients/create`:**

```
┌──────────────────────────────────────────────────────┐
│ Breadcrumb: Clientes > Nuevo Cliente                 │
├──────────────────────────────────────────────────────┤
│ Header: "Agregar cliente"                            │
│ Subtitle: "Ingresa los datos de tu nuevo cliente"   │
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐ │
│ │ Card: Formulario                                 │ │
│ │ ┌─────────────────┐ ┌─────────────────┐         │ │
│ │ │ Nombre *        │ │ Email *         │         │ │
│ │ └─────────────────┘ └─────────────────┘         │ │
│ │ ┌─────────────────┐ ┌─────────────────┐         │ │
│ │ │ Empresa         │ │ Teléfono        │         │ │
│ │ └─────────────────┘ └─────────────────┘         │ │
│ │ ┌─────────────────────────────────────┐         │ │
│ │ │ Dirección                           │         │ │
│ │ └─────────────────────────────────────┘         │ │
│ │ ┌─────────────────────────────────────┐         │ │
│ │ │ Notas (opcional)                    │         │ │
│ │ └─────────────────────────────────────┘         │ │
│ │                                                  │ │
│ │ [Cancelar]                    [Guardar cliente] │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Estados de UI:

**Estados visuales a implementar:**

- **Loading:** Button "Guardar cliente" con spinner + disabled
- **Error (validation):** Inputs con `border-destructive` + mensaje debajo
- **Error (server):** Toast con mensaje de error
- **Success:** Toast "Cliente guardado correctamente" + redirect a `/clients`

### Validaciones visuales (Formularios):

**Campos y validaciones:**

| Campo   | Tipo     | Requerido | Validación                      | Mensaje error                                                     |
| ------- | -------- | --------- | ------------------------------- | ----------------------------------------------------------------- |
| name    | text     | ✅        | min 2, max 100 chars            | "El nombre debe tener entre 2 y 100 caracteres"                   |
| email   | email    | ✅        | email válido, único por usuario | "Ingresa un email válido" / "Ya existe un cliente con este email" |
| company | text     | ❌        | max 100 chars                   | "La empresa no puede exceder 100 caracteres"                      |
| phone   | text     | ❌        | max 20 chars                    | "El teléfono no puede exceder 20 caracteres"                      |
| address | textarea | ❌        | max 500 chars                   | "La dirección no puede exceder 500 caracteres"                    |
| notes   | textarea | ❌        | max 1000 chars                  | "Las notas no pueden exceder 1000 caracteres"                     |

**Estados visuales:**

- Error: `border-destructive` + mensaje en `text-destructive text-sm`
- Focus: `ring-ring`
- Valid: default border

### Responsividad:

**Breakpoints a considerar:**

- **Mobile (< 768px):** Grid 1 columna, campos full-width
- **Desktop (≥ 768px):** Grid 2 columnas para name/email y company/phone

### Personalidad UI/UX aplicada:

**Estilo visual a seguir:** Moderno/Profesional (del design system)

- Bordes: `rounded-lg` (12px)
- Sombras: `shadow-sm` para Card
- Espaciado: `p-6` en Card, `gap-4` en grid
- Transiciones: `transition-colors duration-200` en buttons

---

## Types & Type Safety

**Tipos disponibles en `src/lib/types.ts`:**

```typescript
// Ya existen - USAR estos:
export type Client = Tables<'clients'>;
export type ClientInsert = TablesInsert<'clients'>;
export type ClientUpdate = TablesUpdate<'clients'>;
```

**Tipos adicionales a crear en `src/lib/validations/client.ts`:**

```typescript
import { z } from 'zod';

export const clientFormSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z
    .string()
    .email('Ingresa un email válido')
    .max(255, 'El email no puede exceder 255 caracteres'),
  company: z
    .string()
    .max(100, 'La empresa no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'La dirección no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;
```

**Directiva para componentes:**

- ✅ Importar tipos desde `@/lib/types`
- ✅ Usar `ClientFormData` para props del formulario
- ✅ Usar `ClientInsert` para el payload a Supabase
- ✅ Usar `z.infer<typeof clientFormSchema>` para form data

---

## Content Writing

**⚠️ CRÍTICO:** Usar vocabulario de SoloQ, NO texto genérico.

**Textos a implementar:**

| Elemento             | Texto                                            |
| -------------------- | ------------------------------------------------ |
| Page title           | "Agregar cliente"                                |
| Page subtitle        | "Ingresa los datos de tu nuevo cliente"          |
| Breadcrumb           | "Clientes > Nuevo Cliente"                       |
| Label: name          | "Nombre"                                         |
| Placeholder: name    | "Nombre del cliente"                             |
| Label: email         | "Email"                                          |
| Placeholder: email   | "email@ejemplo.com"                              |
| Label: company       | "Empresa"                                        |
| Placeholder: company | "Nombre de la empresa (opcional)"                |
| Label: phone         | "Teléfono"                                       |
| Placeholder: phone   | "+52 55 1234 5678"                               |
| Label: address       | "Dirección"                                      |
| Placeholder: address | "Dirección de facturación (opcional)"            |
| Label: notes         | "Notas"                                          |
| Placeholder: notes   | "Notas internas sobre el cliente (opcional)"     |
| Button: cancel       | "Cancelar"                                       |
| Button: submit       | "Guardar cliente"                                |
| Button: loading      | "Guardando..."                                   |
| Toast: success       | "Cliente guardado correctamente"                 |
| Toast: error generic | "Error al guardar el cliente. Intenta de nuevo." |
| Toast: duplicate     | "Ya existe un cliente con este email"            |

---

## Implementation Steps

### **Step 1: Crear Zod Schema de Validación**

**Task:** Crear el schema de validación para el formulario de cliente

**File:** `src/lib/validations/client.ts`

**Details:**

- Crear `clientFormSchema` con validaciones
- Exportar `ClientFormData` type
- Mensajes de error en español

**Testing:**

- Unit test: Validar casos válidos e inválidos del schema

---

### **Step 2: Crear API Route POST /api/clients**

**Task:** Crear endpoint para crear clientes

**File:** `src/app/api/clients/route.ts`

**Details:**

- Validar request body con `clientFormSchema`
- Verificar autenticación (user de sesión)
- Verificar email duplicado para el usuario
- Insert en Supabase con RLS
- Retornar cliente creado o error

**Edge cases handled:**

- Email duplicado → 409 Conflict con mensaje específico
- Usuario no autenticado → 401 Unauthorized
- Validación fallida → 400 Bad Request con errores
- Error de DB → 500 Internal Server Error

**Response format:**

```typescript
// Success: 201
{ data: Client }

// Error: 400 | 401 | 409 | 500
{ error: string, details?: ZodError }
```

**Testing:**

- Integration test: POST con datos válidos
- Integration test: POST con email duplicado
- Integration test: POST sin autenticación

---

### **Step 3: Crear Hook useCreateClient**

**Task:** Crear custom hook para mutation de crear cliente

**File:** `src/hooks/clients/use-create-client.ts`

**Details:**

- Usar `useMutation` de TanStack Query
- Invalidar query `['clients']` on success
- Manejar loading, error, success states

**Structure:**

```typescript
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear cliente');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
```

**Testing:**

- Unit test: Mock fetch y verificar invalidación

---

### **Step 4: Crear Componente ClientForm**

**Task:** Crear formulario reutilizable de cliente

**File:** `src/components/clients/client-form.tsx`

**Details:**

- React Hook Form con zodResolver
- Grid responsive (2 cols desktop, 1 col mobile)
- Todos los campos con labels y placeholders
- Botones Cancelar y Guardar
- Loading state en botón submit
- data-testid en elementos interactivos

**Props interface:**

```typescript
interface ClientFormProps {
  defaultValues?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**data-testid attributes:**

- `client-form` - form element
- `client-name-input` - name field
- `client-email-input` - email field
- `client-company-input` - company field
- `client-phone-input` - phone field
- `client-address-input` - address field
- `client-notes-input` - notes field
- `client-form-cancel` - cancel button
- `client-form-submit` - submit button

**Testing:**

- Unit test: Render con defaultValues
- Unit test: Validación de campos requeridos
- Unit test: Submit con datos válidos

---

### **Step 5: Crear Página /clients/create**

**Task:** Crear página de creación de cliente

**File:** `src/app/(app)/clients/create/page.tsx`

**Details:**

- Breadcrumb navigation
- Header con título y subtítulo
- ClientForm integrado
- useCreateClient hook
- Toast notifications
- Redirect a /clients on success

**Flow:**

1. Usuario llega a página
2. Completa formulario
3. Click "Guardar cliente"
4. Loading state
5. Success → Toast + redirect a `/clients`
6. Error → Toast con mensaje

**Testing:**

- E2E test: Flujo completo de creación

---

### **Step 6: Crear Barrel Exports**

**Task:** Crear archivos index para imports limpios

**Files:**

- `src/components/clients/index.ts`
- `src/hooks/clients/index.ts`

**Details:**

```typescript
// src/components/clients/index.ts
export { ClientForm } from './client-form';

// src/hooks/clients/index.ts
export { useCreateClient } from './use-create-client';
```

---

### **Step 7: Configurar QueryClientProvider**

**Task:** Verificar/agregar QueryClientProvider en layout

**File:** `src/app/(app)/layout.tsx` (si no existe ya)

**Details:**

- Verificar si ya existe QueryClientProvider
- Si no existe, agregarlo wrapping el children
- Configurar defaultOptions si es necesario

**Note:** Este paso puede no ser necesario si ya está configurado.

---

### **Step 8: Integration Testing**

**Task:** Probar flujo completo de creación

**Testing scenarios:**

1. ✅ Crear cliente con datos mínimos (name + email)
2. ✅ Crear cliente con todos los campos
3. ❌ Intentar crear con email duplicado
4. ❌ Intentar crear con email inválido
5. ❌ Intentar crear sin autenticación
6. ✅ Verificar que aparece en lista después de crear

---

## Technical Decisions (Story-specific)

### Decision 1: Form Library

**Chosen:** React Hook Form + Zod resolver

**Reasoning:**

- ✅ Uncontrolled inputs = mejor performance
- ✅ Zod integrado = validación type-safe
- ✅ Ya usado en el proyecto (consistencia)
- ❌ Trade-off: Curva de aprendizaje inicial

### Decision 2: API vs Server Actions

**Chosen:** API Route + React Query

**Reasoning:**

- ✅ Cache invalidation automática
- ✅ Loading/error states manejados
- ✅ Reutilizable desde cualquier componente
- ❌ Trade-off: Más código que Server Actions puras

### Decision 3: Ubicación de Validación

**Chosen:** Validación client + server con mismo schema

**Reasoning:**

- ✅ UX inmediata (client-side)
- ✅ Seguridad garantizada (server-side)
- ✅ Single source of truth (mismo schema)
- ❌ Trade-off: Schema importado en ambos lados

---

## Dependencies

**Pre-requisitos técnicos:**

- [x] Tabla `clients` existe en Supabase (verificado en schema)
- [x] RLS habilitado en tabla `clients`
- [x] Tipos generados en `src/types/supabase.ts`
- [x] Tipos helper en `src/lib/types.ts`
- [ ] @tanstack/react-query instalado → `bun add @tanstack/react-query`
- [ ] QueryClientProvider configurado en layout

**Instalación requerida:**

```bash
bun add @tanstack/react-query
```

---

## Risks & Mitigations

**Risk 1:** Email duplicado no detectado correctamente

- **Impact:** Medium
- **Mitigation:** Query explícito antes de insert, constraint UNIQUE(user_id, email) en DB

**Risk 2:** RLS bypass permitiendo ver clientes de otros usuarios

- **Impact:** High
- **Mitigation:** Verificar policy RLS, tests multi-usuario

**Risk 3:** Formulario no accesible (a11y)

- **Impact:** Medium
- **Mitigation:** Labels asociados, error messages vinculados, keyboard navigation

---

## Estimated Effort

| Step                      | Time      |
| ------------------------- | --------- |
| 1. Zod Schema             | 15 min    |
| 2. API Route POST         | 45 min    |
| 3. Hook useCreateClient   | 20 min    |
| 4. Componente ClientForm  | 60 min    |
| 5. Página /clients/create | 30 min    |
| 6. Barrel Exports         | 5 min     |
| 7. QueryClientProvider    | 10 min    |
| 8. Integration Testing    | 30 min    |
| **Total**                 | **~3.5h** |

**Story points:** 3 (match con estimación en story.md)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando
  - [ ] AC1: Crear cliente con name + email funciona
  - [ ] AC2: Validación de email funciona
  - [ ] AC3: Duplicados prevenidos con mensaje claro
  - [ ] AC4: Campos opcionales se guardan correctamente
- [ ] **Tipos del backend usados correctamente**
  - [ ] Imports desde `@/lib/types` en componentes
  - [ ] Props de componentes tipadas con ClientFormData
  - [ ] Zero type errors relacionados a Client
- [ ] **Personalidad UI/UX aplicada consistentemente**
  - [ ] Bordes `rounded-lg` en Card
  - [ ] Sombras `shadow-sm` en Card
  - [ ] Grid responsive (2 cols desktop, 1 col mobile)
  - [ ] Button loading state con spinner
- [ ] **Content Writing contextual (NO genérico)**
  - [ ] Todos los textos según tabla de Content Writing
  - [ ] Sin frases placeholder
  - [ ] Mensajes de error en español y específicos
- [ ] **data-testid implementados**
  - [ ] `client-form`
  - [ ] `client-name-input`
  - [ ] `client-email-input`
  - [ ] `client-form-submit`
  - [ ] `client-form-cancel`
- [ ] Tests unitarios escritos
  - [ ] Zod schema validation
  - [ ] ClientForm component
  - [ ] useCreateClient hook
- [ ] Tests de integración pasando
  - [ ] API POST /api/clients
- [ ] Tests E2E (referencia: test-cases.md pendiente)
  - [ ] TC-001: Crear cliente con datos mínimos
  - [ ] TC-002: Crear cliente con todos los campos
  - [ ] TC-003: Validación de email inválido
  - [ ] TC-004: Prevención de duplicados
- [ ] Code review aprobado
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run build` passes
  - [ ] `bun run typecheck` passes
- [ ] Manual smoke test
  - [ ] Formulario se ve correcto en desktop
  - [ ] Formulario se ve correcto en mobile
  - [ ] Flujo completo funciona (crear → toast → redirect)

---

**Formato:** Markdown estructurado
**Ubicación:** `.context/PBI/epics/EPIC-SQ-13-client-management/stories/STORY-SQ-14-add-client/implementation-plan.md`
**Última actualización:** 2026-02-03
