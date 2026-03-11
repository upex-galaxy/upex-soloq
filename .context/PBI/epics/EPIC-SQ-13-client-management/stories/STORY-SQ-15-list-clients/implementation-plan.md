# Implementation Plan: STORY-SQ-15 - List All Clients

**Jira Key:** [SQ-15](https://upexgalaxy64.atlassian.net/browse/SQ-15)
**Epic:** EPIC-SQ-13 - Client Management
**Story Points:** 3
**Date:** 2026-02-07

---

## Overview

Implementar la funcionalidad completa de listado de clientes con busqueda, ordenamiento y paginacion. Esta story transforma el placeholder actual en una pagina funcional que permite a los freelancers ver, buscar y ordenar su base de clientes.

**Acceptance Criteria a cumplir:**

- Ver lista de todos los clientes con nombre y email
- Buscar clientes por nombre o email (case-insensitive, partial match)
- Empty state con CTA cuando no hay clientes
- Ordenar por columnas (nombre, fecha creacion)
- Paginacion (20 por pagina)
- Solo mostrar clientes del usuario autenticado (RLS)
- No mostrar clientes soft-deleted

---

## Technical Approach

**Chosen approach:** Server-side data fetching con API Routes + React Query para cache y mutations

**Alternatives considered:**

- A) Server Components con data fetching directo: No elegido porque necesitamos client-side interactivity (search, sort, pagination)
- B) Full client-side filtering: No elegido porque no escala con muchos clientes

**Why this approach:**

- React Query para cache inteligente y background refetching
- Server-side filtering/sorting/pagination para performance
- API Route reutilizable para otros consumers
- Trade-off: Mas complejidad inicial pero mejor UX y performance

---

## UI/UX Design

**Design System disponible:** `.context/design-system.md`

### Componentes del Design System a usar:

- **Table** - Lista de clientes con headers ordenables
- **Input** - Search box con debounce
- **Button** - CTA "Nuevo Cliente", acciones de fila
- **Card** - Contenedor de la tabla
- **Skeleton** - Loading state
- **Badge** - (futuro) indicadores de estado

### Componentes custom a crear:

**1. ClientsTable** (`components/clients/clients-table.tsx`)

- **Proposito:** Tabla de clientes con sorting en headers
- **Props:** `clients: Client[]`, `sortBy`, `sortOrder`, `onSort`
- **Columnas:** Nombre, Email, Empresa (opcional), Fecha creacion, Acciones
- **Ubicacion:** `src/components/clients/`

**2. ClientsSearch** (`components/clients/clients-search.tsx`)

- **Proposito:** Input de busqueda con debounce 300ms
- **Props:** `value`, `onChange`, `placeholder`
- **Ubicacion:** `src/components/clients/`

**3. ClientsEmptyState** (`components/clients/clients-empty-state.tsx`)

- **Proposito:** Estado vacio con CTA para agregar primer cliente
- **Props:** `isSearchResult?: boolean`
- **Ubicacion:** `src/components/clients/`

**4. ClientsPagination** (`components/clients/clients-pagination.tsx`)

- **Proposito:** Controles de paginacion
- **Props:** `page`, `totalPages`, `onPageChange`
- **Ubicacion:** `src/components/clients/`

### Wireframe/Layout:

```
+----------------------------------------------------------+
| Header: "Clientes" + descripcion   | [+ Nuevo Cliente]  |
+----------------------------------------------------------+
| [Search: Buscar clientes...]                             |
+----------------------------------------------------------+
| Table:                                                    |
| | Nombre (v) | Email        | Empresa    | Creado  | ... |
| |------------|--------------|------------|---------|-----|
| | Alpha Inc  | a@alpha.com  | Alpha Inc  | 01/02   | ... |
| | Beta LLC   | b@beta.com   | -          | 01/01   | ... |
+----------------------------------------------------------+
| Pagination: < 1 2 3 >  |  Mostrando 1-20 de 45           |
+----------------------------------------------------------+
```

### Estados de UI:

- **Loading:** Skeleton loaders en tabla (5 filas)
- **Empty (sin clientes):** Ilustracion Users + "No tienes clientes aun" + CTA
- **Empty (busqueda):** "No se encontraron clientes" + "Limpiar busqueda"
- **Error:** Toast con error + boton reintentar
- **Success:** Tabla con datos

### Responsividad:

- **Mobile (< 768px):** Tabla scrollable horizontalmente, columnas reducidas (nombre, email, acciones)
- **Desktop:** Tabla completa con todas las columnas

---

## Types & Type Safety

**Tipos existentes en `lib/types.ts`:**

- `Client` - Row type de la tabla clients
- `ClientWithStats` - Cliente con invoice_count y total_billed

**Tipos adicionales a crear:**

```typescript
// En lib/types.ts o inline
export interface ClientsListParams {
  search?: string;
  sortBy?: 'name' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ClientsListResponse {
  clients: Client[];
  total: number;
  page: number;
  totalPages: number;
}
```

---

## Content Writing

**Textos contextuales (NO genericos):**

- Header: "Clientes" / "Administra tu base de clientes y su historial de facturacion."
- Empty state: "No tienes clientes aun" / "Agrega tu primer cliente para comenzar a facturar."
- Empty search: "No se encontraron clientes" / "Intenta con otros terminos de busqueda"
- Search placeholder: "Buscar por nombre o email..."
- Pagination: "Mostrando {start}-{end} de {total} clientes"

---

## Implementation Steps

### **Step 1: Agregar GET endpoint a API**

**Task:** Implementar GET /api/clients con query params

**File:** `src/app/api/clients/route.ts`

**Details:**

- Query params: `search`, `sortBy`, `sortOrder`, `page`, `limit`
- Filtrar por `user_id = auth.uid()` (RLS)
- Filtrar `deleted_at IS NULL`
- Search con ILIKE en name, email, company
- Ordenamiento por name o created_at
- Paginacion con offset/limit
- Response: `{ clients, total, page, totalPages }`

**Edge cases:**

- Pagina invalida (>totalPages): retornar ultima pagina valida o array vacio
- Search con caracteres especiales: escapar para SQL
- Sin resultados: retornar array vacio con total=0

**Testing:**

- API test: GET sin params retorna todos los clientes
- API test: GET con search filtra correctamente
- API test: GET con sort ordena correctamente
- API test: GET sin auth retorna 401

---

### **Step 2: Crear hook useClients**

**Task:** Custom hook con React Query para obtener clientes

**File:** `src/hooks/clients/use-clients.ts`

**Details:**

- useQuery con queryKey: ['clients', params]
- Fetch a /api/clients con query params
- staleTime: 5 minutos
- Exportar tambien invalidateClients para mutations

**Testing:**

- Hook retorna loading, data, error correctamente
- Cache funciona entre navegaciones

---

### **Step 3: Crear componentes UI**

**Task:** Crear ClientsTable, ClientsSearch, ClientsEmptyState, ClientsPagination

**Files:**

- `src/components/clients/clients-table.tsx`
- `src/components/clients/clients-search.tsx`
- `src/components/clients/clients-empty-state.tsx`
- `src/components/clients/clients-pagination.tsx`
- `src/components/clients/index.ts` (barrel exports)

**Details:**

**ClientsTable:**

- Headers clickeables para sorting
- Indicador visual de sort direction
- Hover effect en filas
- Click en fila navega a /clients/[id]
- data-testid="clients-table"

**ClientsSearch:**

- Input con icono Search
- Debounce 300ms
- data-testid="clients-search"

**ClientsEmptyState:**

- Dos variantes: sin clientes vs busqueda sin resultados
- data-testid="clients-empty-state"

**ClientsPagination:**

- Botones Previous/Next
- Numeros de pagina
- Contador "Mostrando X-Y de Z"
- data-testid="clients-pagination"

---

### **Step 4: Actualizar pagina /clients**

**Task:** Reemplazar placeholder con implementacion real

**File:** `src/app/(app)/clients/page.tsx`

**Details:**

- Importar y usar useClients hook
- Estado local para search, sortBy, sortOrder, page
- Componer ClientsSearch + ClientsTable + ClientsPagination
- Mostrar Skeleton durante loading
- Mostrar empty state cuando corresponda

**Flow:**

1. Usuario llega a /clients
2. useClients fetch inicial (page 1, sin filtros)
3. Mostrar tabla con clientes
4. Usuario escribe en search → debounce → refetch
5. Usuario click en header → cambiar sort → refetch
6. Usuario click en pagina → cambiar page → refetch

---

### **Step 5: Crear loading.tsx y error.tsx**

**Task:** Loading skeleton y error boundary

**Files:**

- `src/app/(app)/clients/loading.tsx`
- `src/app/(app)/clients/error.tsx`

**Details:**

- Loading: Skeleton de tabla (5 filas)
- Error: Mensaje + boton reintentar

---

### **Step 6: Integration y Tests E2E**

**Task:** Verificar flujo completo

**Testing:**

- E2E: Usuario ve lista de clientes
- E2E: Usuario busca cliente existente
- E2E: Usuario busca sin resultados
- E2E: Usuario ordena por nombre
- E2E: Usuario navega paginacion
- E2E: Usuario nuevo ve empty state
- API: RLS previene ver clientes de otro usuario

---

## Technical Decisions (Story-specific)

### Decision 1: Debounce en frontend vs throttle

**Chosen:** Debounce 300ms en search input

**Reasoning:**

- UX optima: espera que usuario termine de escribir
- Reduce llamadas a API
- Trade-off: 300ms de delay visible

### Decision 2: URL state vs local state para filtros

**Chosen:** Local state con posible sync a URL (page only)

**Reasoning:**

- Simplicidad inicial
- URL para page permite compartir links
- Trade-off: search/sort no persiste en URL (puede agregarse despues)

---

## Dependencies

**Pre-requisitos tecnicos:**

- [x] React Query configurado (verificar si existe QueryClientProvider)
- [x] API route /api/clients existe (solo POST, agregar GET)
- [x] Tabla clients existe en DB con RLS
- [x] Tipos Client definidos en lib/types.ts

**Dependencias de paquetes:**

- `@tanstack/react-query` - Verificar si instalado
- `use-debounce` - Para debounce del search (o implementar custom)

---

## Risks & Mitigations

**Risk 1:** React Query no esta configurado

- **Impact:** Medium
- **Mitigation:** Verificar y agregar QueryClientProvider si falta

**Risk 2:** Performance con muchos clientes

- **Impact:** Low (mayoría <100 clientes)
- **Mitigation:** Server-side pagination, indices en DB

**Risk 3:** RLS bypass

- **Impact:** High
- **Mitigation:** Verificar policy existe y testear multi-user

---

## Estimated Effort

| Step      | Description        | Time         |
| --------- | ------------------ | ------------ |
| 1         | API GET endpoint   | 30 min       |
| 2         | useClients hook    | 20 min       |
| 3         | Componentes UI (4) | 60 min       |
| 4         | Actualizar pagina  | 30 min       |
| 5         | Loading/Error      | 15 min       |
| 6         | Integration tests  | 30 min       |
| **Total** |                    | **~3 horas** |

**Story points:** 3 (match con estimacion)

---

## Definition of Done Checklist

- [ ] GET /api/clients implementado con search, sort, pagination
- [ ] useClients hook funcionando con React Query
- [ ] Componentes UI creados con design system
- [ ] Pagina /clients muestra lista real
- [ ] Empty state implementado (sin clientes y sin resultados)
- [ ] Search con debounce funcionando
- [ ] Sorting por columnas funcionando
- [ ] Pagination funcionando
- [ ] Loading skeleton implementado
- [ ] Error handling implementado
- [ ] data-testid en elementos interactivos
- [ ] RLS verificado (solo clientes del usuario)
- [ ] Soft-deleted no aparecen
- [ ] Linting passes
- [ ] Build passes
- [ ] Manual smoke test en dev

---

**Output:** Archivo listo para implementacion
**Siguiente paso:** PASO 3 - Implementar el Plan
