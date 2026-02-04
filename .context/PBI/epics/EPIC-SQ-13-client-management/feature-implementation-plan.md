# Feature Implementation Plan: EPIC-SQ-13 - Client Management

**Epic Jira Key:** [SQ-13](https://upexgalaxy64.atlassian.net/browse/SQ-13)
**Priority:** HIGH
**Total Story Points:** 15
**Date:** 2026-02-03

---

## Overview

Esta feature implementa el módulo completo de gestión de clientes para SoloQ, permitiendo a freelancers latinoamericanos organizar su base de clientes de forma profesional. La gestión de clientes es prerequisito fundamental para la creación de facturas (Epic 4).

**Alcance:**

- **SQ-14**: Agregar nuevo cliente (3 SP, HIGH)
- **SQ-15**: Listar todos los clientes (3 SP, HIGH)
- **SQ-16**: Editar datos del cliente (2 SP, MEDIUM)
- **SQ-17**: Agregar información fiscal (RFC/NIT/CUIT) (2 SP, MEDIUM)
- **SQ-18**: Ver historial de facturas del cliente (3 SP, MEDIUM)
- **SQ-19**: Eliminar cliente (2 SP, LOW)

**Stack técnico:**

- Frontend: Next.js 16 (App Router)
- Backend: Supabase (PostgreSQL + Auth + RLS)
- Database: PostgreSQL con Row Level Security
- Styling: Tailwind CSS 4 + shadcn/ui
- Forms: React Hook Form + Zod
- State Management: @tanstack/react-query

---

## Technical Decisions

### Decision 1: State Management para Server Data

**Options considered:**

- A) React Query (@tanstack/react-query)
- B) SWR (Stale-While-Revalidate)
- C) useState/useEffect manual

**Chosen:** React Query (@tanstack/react-query)

**Reasoning:**

- ✅ Caching automático con invalidación inteligente
- ✅ Background refetching para datos siempre frescos
- ✅ Optimistic updates para mejor UX en mutations
- ✅ DevTools incluidos para debugging
- ✅ Mejor soporte TypeScript que SWR
- ❌ Trade-off: Dependencia adicional (~12KB gzipped)

**Implementation notes:**

- Crear `QueryClientProvider` en el layout principal
- Custom hooks por entidad: `useClients()`, `useClient(id)`, `useCreateClient()`, etc.
- Configurar staleTime: 5 minutos para listas, 2 minutos para detalles

---

### Decision 2: Validación de Tax ID por País

**Options considered:**

- A) Sin validación (string libre)
- B) Validación con Regex por país
- C) Validación con API externa

**Chosen:** Validación con Regex por país

**Reasoning:**

- ✅ Valida formato correcto sin llamadas externas
- ✅ UX clara: feedback inmediato al usuario
- ✅ Cubre principales países LATAM (México, Argentina, Colombia, Chile)
- ✅ Fallback "OTHER" para países no soportados
- ❌ Trade-off: No valida si el Tax ID existe realmente (solo formato)

**Implementation notes:**

```typescript
// src/lib/validations/tax-id.ts
export const TAX_ID_PATTERNS = {
  RFC: /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/i, // México
  CUIT: /^[0-9]{2}-[0-9]{8}-[0-9]$/, // Argentina
  NIT: /^[0-9]{9,10}-[0-9]$/, // Colombia
  RUT: /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9Kk]$/, // Chile
  OTHER: /.*/, // Cualquier formato
};
```

---

### Decision 3: Búsqueda de Clientes

**Options considered:**

- A) Búsqueda exacta case-sensitive
- B) Búsqueda parcial case-insensitive (ILIKE)
- C) Full-text search con PostgreSQL

**Chosen:** Búsqueda parcial case-insensitive (ILIKE)

**Reasoning:**

- ✅ UX intuitiva: buscar "juan" encuentra "Juan García"
- ✅ Búsqueda en múltiples campos: nombre, email, empresa
- ✅ Implementación simple con Supabase `.ilike()`
- ✅ Performance adecuada para <1000 clientes por usuario
- ❌ Trade-off: No tolera typos (fuzzy search sería más complejo)

**Implementation notes:**

```typescript
// Supabase query pattern
.or(`name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%`)
```

- Debounce de 300ms en frontend para evitar queries excesivos

---

### Decision 4: Patrón de Componentes

**Chosen:** Componentes de dominio en `components/clients/` + shadcn/ui primitives

**Reasoning:**

- ✅ Separación clara entre UI base (shadcn) y lógica de negocio
- ✅ Reutilización del `ClientForm` entre create y edit
- ✅ Componentes testables de forma aislada
- ✅ Barrel exports para imports limpios

**Implementation notes:**

- `ClientForm`: Compartido entre SQ-14 (create) y SQ-16 (edit)
- `TaxIdInput`: Componente especializado con selector de país
- `DeleteClientDialog`: Confirmación con info de facturas asociadas

---

### Decision 5: Soft Delete vs Hard Delete

**Chosen:** Soft Delete con campo `deleted_at`

**Reasoning:**

- ✅ Preserva integridad referencial con facturas existentes
- ✅ Permite recuperación de datos accidentalmente borrados
- ✅ Auditoría de cuándo se eliminó el cliente
- ❌ Trade-off: Queries deben filtrar `deleted_at IS NULL`

**Implementation notes:**

- Campo `deleted_at TIMESTAMP` en tabla clients
- Filtro automático en todas las queries de listado
- Las facturas mantienen referencia al cliente incluso si está "eliminado"

---

## Types & Type Safety

**⚠️ IMPORTANTE:** Esta feature debe usar tipos del backend para garantizar type-safety consistente en todas las stories.

**Tipos disponibles:**

- `src/lib/types.ts` - Type helpers extraídos del backend
- `src/types/supabase.ts` - Tipos generados desde database schema

**Estrategia de tipos a nivel feature:**

1. **Entidades principales:**
   - `Client` - Row type de la tabla clients
   - `ClientInsert` - Para crear nuevos clientes
   - `ClientUpdate` - Para actualizar clientes existentes
   - `ClientWithStats` - Cliente con métricas de facturación

2. **Tipos adicionales a crear en `lib/types.ts`:**

```typescript
// Tax ID Types
export type TaxIdType = 'RFC' | 'NIT' | 'CUIT' | 'RUT' | 'OTHER';

export const TAX_ID_TYPE_OPTIONS: { value: TaxIdType; label: string; country: string }[] = [
  { value: 'RFC', label: 'RFC', country: 'México' },
  { value: 'NIT', label: 'NIT', country: 'Colombia' },
  { value: 'CUIT', label: 'CUIT', country: 'Argentina' },
  { value: 'RUT', label: 'RUT', country: 'Chile' },
  { value: 'OTHER', label: 'Otro', country: 'Otro' },
];

// Client with computed stats (para listados)
export interface ClientWithStats extends Client {
  invoice_count: number;
  total_billed: number;
  total_paid: number;
  total_pending: number;
}

// Pagination response genérica
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Invoice summary para historial de cliente
export interface ClientInvoiceSummary {
  total_invoiced: number;
  total_paid: number;
  total_pending: number;
  total_overdue: number;
  invoice_count: number;
}
```

3. **Directiva para todas las stories de esta feature:**
   - ✅ TODAS las stories deben importar tipos desde `@/lib/types`
   - ✅ TODAS las props de componentes tipadas con tipos del backend
   - ✅ Mock data type-safe que cumpla estructura de tipos
   - ✅ Zero type errors relacionados a entidades del backend

---

## UI/UX Design Strategy

**⚠️ IMPORTANTE:** Esta feature debe usar el Design System base definido en `.context/design-system.md`.

**Design System disponible:** `.context/design-system.md`

### Componentes shadcn/ui a usar:

- ✅ **Button**: Acciones primarias (Guardar, Agregar Cliente) y secundarias (Cancelar)
- ✅ **Input + Label**: Campos del formulario de cliente
- ✅ **Select**: Selector de tipo de Tax ID (RFC/NIT/CUIT/RUT)
- ✅ **Form**: Wrapper con React Hook Form para validación
- ✅ **Table**: Lista de clientes con headers ordenables
- ✅ **Card**: Contenedor de información del cliente en vista detalle
- ✅ **Dialog**: Confirmación de eliminación, formularios modales
- ✅ **Badge**: Estado de facturas en historial (paid, sent, overdue)
- ✅ **Skeleton**: Loading states
- ✅ **Sonner (Toast)**: Notificaciones de éxito/error

### Componentes custom a nivel feature:

- 🆕 **ClientForm** (`components/clients/client-form.tsx`)
  - **Usado por stories:** SQ-14 (create), SQ-16 (edit), SQ-17 (tax info)
  - **Propósito:** Formulario unificado para crear/editar clientes
  - **Diseño base:** Card con campos organizados en grid 2 columnas (desktop)
  - **Ubicación:** `src/components/clients/`

- 🆕 **ClientsTable** (`components/clients/clients-table.tsx`)
  - **Usado por stories:** SQ-15 (list)
  - **Propósito:** Tabla de clientes con ordenamiento por headers
  - **Diseño base:** Table de shadcn con hover states y click to navigate
  - **Ubicación:** `src/components/clients/`

- 🆕 **ClientsSearch** (`components/clients/clients-search.tsx`)
  - **Usado por stories:** SQ-15 (list)
  - **Propósito:** Input de búsqueda con debounce 300ms
  - **Diseño base:** Input con icono Search a la izquierda
  - **Ubicación:** `src/components/clients/`

- 🆕 **TaxIdInput** (`components/clients/tax-id-input.tsx`)
  - **Usado por stories:** SQ-14, SQ-16, SQ-17
  - **Propósito:** Selector de país + input de Tax ID validado
  - **Diseño base:** Flex row con Select (país) + Input (valor)
  - **Ubicación:** `src/components/clients/`

- 🆕 **DeleteClientDialog** (`components/clients/delete-client-dialog.tsx`)
  - **Usado por stories:** SQ-19 (delete)
  - **Propósito:** Modal de confirmación con info de facturas asociadas
  - **Diseño base:** Dialog con AlertTriangle icon, mensaje y botones
  - **Ubicación:** `src/components/clients/`

- 🆕 **ClientInvoiceHistory** (`components/clients/client-invoice-history.tsx`)
  - **Usado por stories:** SQ-18 (invoice history)
  - **Propósito:** Lista de facturas del cliente con resumen de totales
  - **Diseño base:** Table con Badges de estado + summary cards arriba
  - **Ubicación:** `src/components/clients/`

### Consistencia visual:

**Paleta aplicada (del design system):**

- Primary: `bg-primary` - Botones de acción principal (Guardar, Agregar)
- Secondary: `bg-secondary` - Botones secundarios (Cancelar, Volver)
- Destructive: `bg-destructive` - Botón eliminar en dialog
- Muted: `text-muted-foreground` - Texto secundario, placeholders

**Patrones de diseño comunes:**

- **Páginas de lista:** Header con título + botón "Nuevo", barra de búsqueda, tabla paginada
- **Páginas de formulario:** Header con título + breadcrumb, Card con form, botones al final
- **Empty states:** Icono centrado + mensaje + CTA primario

### Flujos de UX:

**User journey 1: Agregar primer cliente**

1. Usuario navega a /clients → ve empty state con CTA "Agregar tu primer cliente"
2. Click en CTA → navega a /clients/create
3. Completa formulario → click Guardar
4. Toast de éxito → redirige a /clients con el nuevo cliente visible

**User journey 2: Buscar y editar cliente**

1. Usuario en /clients → escribe en barra de búsqueda
2. Lista se filtra en tiempo real (debounce 300ms)
3. Click en fila del cliente → navega a /clients/[id]
4. Click "Editar" → formulario editable
5. Modifica datos → click Guardar
6. Toast de éxito → permanece en vista detalle actualizada

**User journey 3: Ver facturas de un cliente**

1. Usuario en /clients/[id] → ve summary de facturas (total facturado, pagado, pendiente)
2. Click "Ver historial de facturas" → navega a /clients/[id]/invoices
3. Ve lista completa de facturas con estado y acciones

**Estados globales de la feature:**

- **Loading:** Skeleton loaders en tabla y formularios
- **Empty:** Ilustración con Users icon + "Aún no tienes clientes" + CTA
- **Error:** Toast con mensaje + botón "Reintentar" en componente

### Personalidad UI/UX de la feature:

**Estilo visual a seguir:** Moderno/Profesional (del design system)

**Aplicar consistentemente en TODAS las stories de esta feature:**

- Bordes redondeados: `rounded-lg` (12px)
- Sombras: `shadow-sm` para cards, `shadow-md` en hover
- Espaciado: `p-6` en cards, `gap-4` en grids
- Hover effects: `hover:bg-accent` en filas de tabla
- Transiciones: `transition-colors duration-200`

**Validar a nivel feature:**

- ✅ Todas las stories usan `rounded-lg` para bordes
- ✅ Todas las stories usan sombras consistentes
- ✅ Todas las stories usan `gap-4` / `gap-6` en layouts
- ✅ Efectos hover/active coherentes en toda la feature

---

## Content Writing Strategy

**⚠️ CRÍTICO:** Esta feature debe usar Content Writing real basado en el contexto de SoloQ, NO texto genérico.

**Contexto de negocio (del PRD):**

- **Producto:** SoloQ - facturación para freelancers latinoamericanos
- **Problema:** Freelancers no tienen herramienta accesible para facturar y hacer seguimiento de cobros
- **Usuarios:** Carlos (diseñador), Valentina (dev), Andrés (consultor)
- **Tono:** Profesional pero accesible, sin tecnicismos innecesarios

**Vocabulario del dominio a usar:**

| Término genérico | Término SoloQ        |
| ---------------- | -------------------- |
| Contactos        | Clientes             |
| Recursos         | Clientes             |
| Documentos       | Facturas             |
| Eliminar         | Eliminar cliente     |
| Dashboard        | Panel de seguimiento |

**Ejemplos de copy contextual para esta feature:**

**Headers y títulos:**

- ❌ "Gestión de contactos"
- ✅ "Tus clientes"
- ✅ "Agregar cliente"
- ✅ "Editar cliente"

**Empty states:**

- ❌ "No hay datos para mostrar"
- ✅ "Aún no tienes clientes. Agrega tu primer cliente para empezar a facturar."

**Botones y CTAs:**

- ❌ "Submit"
- ✅ "Guardar cliente"
- ✅ "Agregar cliente"
- ✅ "Ver historial de facturas"

**Mensajes de éxito:**

- ❌ "Operación exitosa"
- ✅ "Cliente guardado correctamente"
- ✅ "Cliente eliminado"

**Mensajes de error:**

- ❌ "Error de validación"
- ✅ "Ya existe un cliente con este email"
- ✅ "El RFC ingresado no tiene el formato correcto"

**Placeholders:**

- ❌ "Ingrese valor..."
- ✅ "Nombre del cliente"
- ✅ "email@ejemplo.com"
- ✅ "Nombre de la empresa (opcional)"

**Labels de campos:**

- Nombre (requerido)
- Email (requerido)
- Empresa
- Teléfono
- Dirección
- RFC / NIT / CUIT (según país)
- Notas

**Resultado esperado:**
Todas las stories de esta feature usan vocabulario de facturación/clientes, reflejando el contexto de freelancers latinoamericanos.

---

## Shared Dependencies

**Todas las stories de esta feature requieren:**

1. **@tanstack/react-query**
   - Instalación: `bun add @tanstack/react-query`
   - Configuración: QueryClientProvider en layout.tsx

2. **Zod schemas para validación**
   - Ubicación: `src/lib/validations/client.ts`
   - Schemas: `clientSchema`, `clientSearchSchema`

3. **Tax ID validation**
   - Ubicación: `src/lib/validations/tax-id.ts`
   - Patterns: RFC, CUIT, NIT, RUT, OTHER

4. **Environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: API key pública
   - (Ya configuradas en el proyecto)

5. **External services:**
   - Supabase Auth: Autenticación de usuarios
   - Supabase Database: PostgreSQL con RLS

6. **Database requirements:**
   - Tabla `clients` con RLS habilitado
   - Campo `tax_id_type` (verificar si necesita migración)

---

## Architecture Notes

### Folder Structure

```
src/
├── app/
│   ├── api/
│   │   └── clients/
│   │       ├── route.ts                    # GET (list), POST (create)
│   │       └── [id]/
│   │           ├── route.ts                # GET, PUT, DELETE
│   │           └── invoices/
│   │               └── route.ts            # GET (invoice history)
│   │
│   └── (app)/
│       └── clients/
│           ├── page.tsx                    # List clients (SQ-15)
│           ├── loading.tsx                 # Loading skeleton
│           ├── error.tsx                   # Error boundary
│           ├── create/
│           │   └── page.tsx                # Create client (SQ-14)
│           └── [id]/
│               ├── page.tsx                # Client detail/edit (SQ-16, SQ-17)
│               ├── loading.tsx
│               └── invoices/
│                   └── page.tsx            # Invoice history (SQ-18)
│
├── components/
│   └── clients/
│       ├── index.ts                        # Barrel exports
│       ├── client-form.tsx                 # Shared form (create/edit)
│       ├── clients-table.tsx               # Table view component
│       ├── clients-search.tsx              # Search input with debounce
│       ├── clients-pagination.tsx          # Pagination controls
│       ├── clients-empty-state.tsx         # Empty state CTA
│       ├── client-invoice-history.tsx      # Invoice history list
│       ├── client-invoice-summary.tsx      # Invoice totals summary
│       ├── delete-client-dialog.tsx        # Delete confirmation modal
│       └── tax-id-input.tsx                # Tax ID input with country select
│
├── hooks/
│   └── clients/
│       ├── index.ts                        # Barrel exports
│       ├── use-clients.ts                  # List/search clients
│       ├── use-client.ts                   # Single client by ID
│       ├── use-create-client.ts            # Create mutation
│       ├── use-update-client.ts            # Update mutation
│       ├── use-delete-client.ts            # Soft delete mutation
│       └── use-client-invoices.ts          # Invoice history
│
└── lib/
    └── validations/
        ├── client.ts                       # Zod schemas for client
        └── tax-id.ts                       # Tax ID validation patterns
```

### Design Patterns

1. **React Query Pattern**: Custom hooks que encapsulan queries y mutations
2. **Optimistic Updates**: Actualizar UI inmediatamente, revertir si falla
3. **Form Pattern**: React Hook Form + Zod resolver + controlled components
4. **API Routes Pattern**: Next.js route handlers con validación Zod en server

### Third-party Libraries

- **@tanstack/react-query**: ^5.x - Server state management
- **zod**: ^3.x (existente) - Schema validation
- **react-hook-form**: ^7.x (existente) - Form handling
- **@hookform/resolvers**: ^3.x (existente) - Zod integration

---

## Implementation Order

**Recomendado:**

1. **SQ-14: Agregar nuevo cliente** (base para todo)
   - Razón: Establece el formulario base, validaciones Zod, API POST
   - Entregables: ClientForm, POST /api/clients, /clients/create page

2. **SQ-15: Listar todos los clientes** (depende de SQ-14)
   - Razón: Necesita clientes existentes para mostrar; valida el CRUD completo
   - Entregables: ClientsTable, ClientsSearch, GET /api/clients, /clients page

3. **SQ-16: Editar datos del cliente** (depende de SQ-14, SQ-15)
   - Razón: Reutiliza ClientForm, necesita navegación desde lista
   - Entregables: GET/PUT /api/clients/[id], /clients/[id] page

4. **SQ-19: Eliminar cliente** (depende de SQ-15, SQ-16)
   - Razón: Necesita lista y detalle para probar el flujo completo
   - Entregables: DeleteClientDialog, DELETE /api/clients/[id]

5. **SQ-17: Información fiscal** (puede ir en paralelo con SQ-19)
   - Razón: Extiende ClientForm con TaxIdInput, validación por país
   - Entregables: TaxIdInput, tax-id.ts validations

6. **SQ-18: Historial de facturas** (última, requiere tabla invoices)
   - Razón: Depende de que existan facturas en el sistema
   - Entregables: ClientInvoiceHistory, GET /api/clients/[id]/invoices

---

## Risks & Mitigations

### Risk 1: Bypass de RLS (seguridad)

**Impact:** High
**Likelihood:** Low (si se implementa correctamente)
**Mitigation:**

- Verificar `auth.uid()` en todas las policies de RLS
- Tests multi-usuario para verificar aislamiento de datos
- Code review enfocado en seguridad para API routes

### Risk 2: Email duplicado entre usuarios

**Impact:** Medium
**Likelihood:** Medium
**Mitigation:**

- Constraint UNIQUE en (user_id, email) no en email global
- Manejo de error 409 con mensaje user-friendly
- Validación client-side antes de submit

### Risk 3: Soft delete con facturas huérfanas

**Impact:** Medium
**Likelihood:** Low
**Mitigation:**

- FK constraint previene hard delete cuando hay facturas
- Soft delete preserva referencia
- UI muestra advertencia si cliente tiene facturas

### Risk 4: Performance en listas grandes

**Impact:** Medium
**Likelihood:** Low (mayoría usuarios <100 clientes)
**Mitigation:**

- Paginación de 20 items por página
- Índices en campos de búsqueda (name, email)
- Debounce de 300ms en search

### Risk 5: Migración de tax_id_type

**Impact:** Low
**Likelihood:** Medium
**Mitigation:**

- Verificar si columna existe antes de implementar SQ-17
- Preparar migración SQL si es necesaria
- Campo nullable para backwards compatibility

---

## Success Criteria

**Esta feature estará completa cuando:**

- [ ] Todas las stories implementadas y deployed
- [ ] **Tipos del backend aplicados consistentemente**
  - [ ] Todas las stories usan tipos desde `@/lib/types`
  - [ ] Zero type errors relacionados a entidades del backend
  - [ ] Props de componentes tipadas correctamente en todas las stories
- [ ] **Personalidad UI/UX consistente en toda la feature**
  - [ ] Todas las stories aplican estilo Moderno/Profesional
  - [ ] Bordes `rounded-lg`, sombras `shadow-sm/md` coherentes
  - [ ] Paleta de colores aplicada (bg-primary, bg-secondary, etc.)
- [ ] **Content Writing contextual (NO genérico)**
  - [ ] Vocabulario de facturación/clientes en todas las stories
  - [ ] Sin frases placeholder en ninguna story
  - [ ] Tono profesional y accesible
- [ ] **Protección de rutas**
  - [ ] Middleware protege /clients/\* como rutas privadas
  - [ ] Redirección a login si no autenticado
- [ ] **100% de test cases críticos pasando**
  - [ ] CRUD operations funcionan correctamente
  - [ ] Search y pagination funcionan
  - [ ] RLS aísla datos entre usuarios
- [ ] **Performance targets alcanzados**
  - [ ] List queries < 300ms (p95)
  - [ ] Create/Update < 500ms (p95)
  - [ ] Search con debounce no genera queries excesivos
- [ ] **Build y linting pasando**
  - [ ] `bun run build` exitoso
  - [ ] Zero TypeScript errors en toda la feature
  - [ ] Linting passes en todas las stories

---

**Formato:** Markdown estructurado
**Ubicación:** `.context/PBI/epics/EPIC-SQ-13-client-management/feature-implementation-plan.md`
**Última actualización:** 2026-02-03
