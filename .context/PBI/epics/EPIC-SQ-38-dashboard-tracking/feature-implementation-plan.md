# Feature Implementation Plan: EPIC-SQ-38 - Invoice Dashboard & Tracking

## Overview

Esta feature transforma la página de facturas existente en un dashboard completo con métricas financieras, filtros por estado con conteos, búsqueda en tiempo real, highlighting de facturas vencidas y resumen mensual de ingresos.

**Alcance:**

- [SQ-47]: Dashboard base list (tabla de facturas con columnas, paginación, empty state)
- [SQ-48]: Filtrar facturas por status con tabs y conteos
- [SQ-49]: Total pendiente de cobro (summary card)
- [SQ-50]: Highlighting de facturas vencidas con días de retraso
- [SQ-51]: Búsqueda de facturas por cliente o número
- [SQ-52]: Resumen mensual de ingresos con tendencia

**Stack técnico:**

- Frontend: Next.js 16 (App Router) + React + TanStack Query
- Backend: Next.js API Routes + Supabase (PostgreSQL)
- Styling: Tailwind CSS v4 + shadcn/ui (New York)
- Charts: Recharts (ya en dependencias o agregar ligero)
- Testing: Playwright (E2E), Vitest (Unit)

---

## Technical Decisions

### Decision 1: Arquitectura del Dashboard — Dos endpoints vs uno

**Options considered:**

- A) Un solo endpoint `GET /api/invoices` que devuelva todo (lista + métricas)
- B) Dos endpoints separados: `GET /api/invoices` (lista) + `GET /api/invoices/dashboard` (métricas)
- C) Un endpoint con parámetro `?include=summary`

**Chosen:** B) Dos endpoints separados

**Reasoning:**

- ✅ Sigue el contrato API definido en `api-contracts.yaml` (FR-020 y FR-021)
- ✅ Las métricas del dashboard no dependen de filtros/paginación — se calculan sobre TODAS las facturas
- ✅ Permite cachear métricas independientemente de la lista filtrada
- ✅ Menor complejidad por endpoint
- ❌ Trade-off: Dos requests al cargar la página (mitigado con TanStack Query paralelo)

**Implementation notes:**

- `GET /api/invoices` — ya existe, ampliar con `search`, `sortBy`, `sortOrder`
- `GET /api/invoices/dashboard` — nuevo endpoint para `DashboardSummary`
- Ambos se llaman en paralelo via `useQuery` con keys independientes

---

### Decision 2: Filtros por status — Tabs vs Select dropdown

**Options considered:**

- A) Mantener el `<Select>` dropdown actual
- B) Reemplazar con `<Tabs>` de shadcn/ui con conteos por estado
- C) Botones toggle group

**Chosen:** B) Tabs con conteos

**Reasoning:**

- ✅ Visibilidad inmediata de cuántas facturas hay en cada estado
- ✅ shadcn/ui `Tabs` ya está instalado — no requiere nuevo componente
- ✅ Patrón UX estándar para dashboards de este tipo
- ✅ Los conteos vienen del endpoint `/api/invoices/dashboard`
- ❌ Trade-off: Ocupa más espacio horizontal que un dropdown (responsive con scroll)

**Implementation notes:**

- Tab "Todas" (default) + tabs por cada status (Borrador, Enviada, Pagada, Vencida)
- Cada tab muestra el conteo: `Enviadas (5)`
- En mobile: tabs con scroll horizontal
- No incluir `cancelled` en tabs (rara vez se filtra por canceladas)

---

### Decision 3: Búsqueda — Implementación server-side con debounce client-side

**Options considered:**

- A) Filtrado client-side (buscar en datos ya cargados)
- B) Server-side con query param `?search=` y debounce 300ms en frontend
- C) Full-text search con extensión PostgreSQL

**Chosen:** B) Server-side con debounce

**Reasoning:**

- ✅ Sigue decisión PO: live search con debounce 300ms + Enter
- ✅ Funciona con datasets grandes (paginación server-side)
- ✅ Supabase `ilike` es suficiente para partial match en `invoice_number`, `client.name`, `client.email`
- ✅ Consistente con el contrato API (`?search=` param ya definido en api-contracts.yaml)
- ❌ Trade-off: Requiere modificar el endpoint `GET /api/invoices` para soportar `search`

**Implementation notes:**

- Frontend: Hook `useDebouncedValue(query, 300)` + `useInvoices({ search })`
- Backend: `ilike` en `invoice_number`, join con `clients` para `name` e `email`
- Precedencia PO: mantener filtro status activo + resetear paginación a página 1 al buscar
- Trim automático del query, query vacía = clear search

---

### Decision 4: Cálculo de overdue — Dinámico en backend

**Options considered:**

- A) Campo `is_overdue` materializado en DB (trigger/cron)
- B) Cálculo dinámico en el query backend comparando `due_date` con fecha actual
- C) Cálculo en frontend

**Chosen:** B) Cálculo dinámico en backend

**Reasoning:**

- ✅ Siempre actualizado — no requiere cron job
- ✅ Ya definido en api-contracts: `isOverdue: boolean`, `daysOverdue: integer`
- ✅ Simples: `status = 'sent' AND due_date < CURRENT_DATE`
- ✅ Timezone del usuario aplicable con header o parámetro
- ❌ Trade-off: Leve overhead en cada query (mínimo, es comparación de fechas)

**Implementation notes:**

- El campo `isOverdue` se calcula en el transform del response
- `daysOverdue = CURRENT_DATE - due_date` (solo cuando isOverdue=true)
- Timezone: usar UTC para consistencia, frontend formatea con locale del usuario

---

### Decision 5: Resumen mensual — Recharts para chart ligero

**Options considered:**

- A) Chart.js
- B) Recharts (React-native charts)
- C) Solo números sin chart visual
- D) Tremor (chart library para dashboards)

**Chosen:** B) Recharts

**Reasoning:**

- ✅ React-nativo, composable, SSR-friendly
- ✅ Ligero (~40KB gzipped)
- ✅ API declarativa que se integra bien con shadcn/ui styling
- ✅ Soporta responsive y dark mode
- ❌ Trade-off: Dependencia nueva (pero es la más usada con React)

**Implementation notes:**

- Chart de barras simple mostrando últimos 6 meses
- Cada barra: `totalPaid` del mes
- Tooltip con desglose
- Datos vienen del endpoint `/api/invoices/dashboard` con campo `monthlyTrend[]`

---

## Types & Type Safety

**Tipos disponibles:** `src/lib/types.ts`

**Entidades principales de esta feature:**

```typescript
// Ya existentes — NO crear duplicados
import type { Invoice, Client, InvoiceStatus, Payment } from '@/lib/types';
import type { InvoiceWithClient } from '@/lib/types'; // ya definido
```

**Tipos nuevos a agregar en `src/lib/types.ts`:**

```typescript
// === Dashboard Summary ===
export interface DashboardSummary {
  totalPending: number;    // sum of total where status in ('sent','overdue')
  totalOverdue: number;    // sum of total where overdue
  totalPaidThisMonth: number;
  counts: {
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
  };
  monthlyTrend: MonthlyTrendItem[];
}

export interface MonthlyTrendItem {
  month: string;       // "2026-01"
  label: string;       // "Ene"
  totalPaid: number;
  totalInvoiced: number;
  invoiceCount: number;
}

// === Invoice List Item (extended for dashboard) ===
export interface InvoiceListItem extends InvoiceWithClient {
  isOverdue: boolean;
  daysOverdue: number;
}
```

**Directiva para TODAS las stories:**

- ✅ Importar tipos desde `@/lib/types`
- ✅ Props de componentes tipadas con tipos del backend
- ✅ Response de APIs tipados con los interfaces definidos arriba
- ✅ Zero type errors

---

## UI/UX Design Strategy

**Design System:** `.context/design-system.md`
**Estilo visual:** Moderno/Bold (bordes redondeados, sombras, gradientes sutiles)

### Layout del Dashboard

```
┌─────────────────────────────────────────────────────┐
│ Header: "Facturas" + Botón "Nueva Factura"          │
├─────────────────────────────────────────────────────┤
│ Summary Cards (3): Pendiente | Vencido | Este Mes   │  ← SQ-49, SQ-50, SQ-52
├─────────────────────────────────────────────────────┤
│ Search Input [🔍 Buscar por cliente o número...]     │  ← SQ-51
├─────────────────────────────────────────────────────┤
│ Tabs: [Todas(20)] [Borrador(2)] [Enviadas(5)]...   │  ← SQ-48
├─────────────────────────────────────────────────────┤
│ Invoice Table (sortable, paginated)                  │  ← SQ-47
│ ┌──────┬──────────┬────────┬────────┬───────┬─────┐│
│ │ Nro  │ Cliente  │ Estado │ Total  │ Vence │ ... ││
│ ├──────┼──────────┼────────┼────────┼───────┼─────┤│
│ │ INV..│ John R.  │ 🔴Venc │ $1,500 │ Hace  │     ││  ← SQ-50 (highlight)
│ │      │          │  ida   │        │ 5 días│     ││
│ └──────┴──────────┴────────┴────────┴───────┴─────┘│
├─────────────────────────────────────────────────────┤
│ Pagination: « 1 2 3 ... 5 »                         │
├─────────────────────────────────────────────────────┤
│ Monthly Chart (6 meses)                              │  ← SQ-52
└─────────────────────────────────────────────────────┘
```

### Componentes compartidos entre stories

**Componentes shadcn/ui a usar:**

- ✅ `Card` — summary cards (SQ-49, SQ-50, SQ-52)
- ✅ `Tabs` — filtros por status (SQ-48)
- ✅ `Table` — listado de facturas (SQ-47, ya en uso)
- ✅ `Input` — búsqueda (SQ-51)
- ✅ `Badge` — status badges (ya existe `InvoiceStatusBadge`)
- ✅ `Skeleton` — loading states (ya en uso)
- ✅ `Button` — paginación y CTAs

**Componentes custom a crear:**

- 🆕 `DashboardSummaryCards` (`components/invoices/dashboard-summary-cards.tsx`)
  - Usado por: SQ-49, SQ-50, SQ-52
  - 3 cards: Total Pendiente, Facturas Vencidas, Ingreso del Mes
  - Usa `DashboardSummary` type

- 🆕 `InvoiceSearchInput` (`components/invoices/invoice-search-input.tsx`)
  - Usado por: SQ-51
  - Input con icono de búsqueda, clear button, debounce 300ms

- 🆕 `InvoiceStatusTabs` (`components/invoices/invoice-status-tabs.tsx`)
  - Usado por: SQ-48
  - Tabs con conteos por status, derivados de `DashboardSummary.counts`

- 🆕 `MonthlyIncomeChart` (`components/invoices/monthly-income-chart.tsx`)
  - Usado por: SQ-52
  - Chart de barras con Recharts, últimos 6 meses

- 🆕 `PaginationControls` (`components/invoices/pagination-controls.tsx`)
  - Usado por: SQ-47
  - Controles de paginación: anterior/siguiente + números de página

### Estados globales

- **Loading:** Skeletons para cada sección (cards, table, chart)
- **Empty (sin facturas):** Ilustración + CTA "Crea tu primera factura" + link a `/invoices/create`
- **No results (búsqueda/filtro):** "No se encontraron facturas" + botón limpiar búsqueda
- **Error:** Mensaje + botón Reintentar

### Personalidad UI/UX

**Estilo: Moderno/Bold** (del design system)

- Bordes: `rounded-lg` en cards, `rounded-md` en inputs
- Sombras: `shadow-sm` base, `shadow-md` en hover de cards
- Espaciado: `gap-6` entre secciones, `p-6` en cards
- Hover: `hover:shadow-md transition-shadow` en cards y rows
- Colores semánticos en summary cards:
  - Pendiente: `text-amber-600` + `bg-amber-50`
  - Vencido: `text-red-600` + `bg-red-50`
  - Pagado este mes: `text-green-600` + `bg-green-50`

---

## Content Writing Strategy

**Vocabulario del dominio SoloQ:**

| Término UI | Contexto |
|------------|----------|
| "Facturas" | Título de la página |
| "Pendiente de cobro" | Total de facturas sent + overdue |
| "Vencidas" | Facturas past due_date con status sent |
| "Hace X días" | Días de retraso de una factura overdue |
| "Ingreso del mes" | Total de facturas pagadas en el mes actual |
| "No se encontraron facturas" | Empty search results |
| "Crea tu primera factura" | Empty state CTA |

**Tono:** Profesional pero cercano — el freelancer es el usuario, no un corporativo.

---

## Shared Dependencies

**Todas las stories requieren:**

1. **TanStack Query** — ya instalado, para fetching y caching
2. **Framer Motion** — ya en uso en la página de facturas
3. **Lucide Icons** — ya instalado (Search, X, TrendingUp, Clock, DollarSign, etc.)
4. **Recharts** — NUEVA dependencia (solo para SQ-52)
5. **Custom hook `useDebouncedValue`** — crear en `src/hooks/use-debounced-value.ts`

**Environment variables:** Ninguna nueva requerida.

**External services:** Ninguno — toda la data viene de Supabase via API routes.

---

## Architecture Notes

### Folder Structure (cambios)

```
src/
├── app/
│   ├── (app)/
│   │   └── invoices/
│   │       └── page.tsx              # MODIFICAR — dashboard principal
│   └── api/
│       └── invoices/
│           ├── route.ts              # MODIFICAR — agregar search, sortBy, sortOrder
│           └── dashboard/
│               └── route.ts          # NUEVO — GET /api/invoices/dashboard
│
├── components/
│   └── invoices/
│       ├── invoice-status-badge.tsx  # YA EXISTE — no modificar
│       ├── dashboard-summary-cards.tsx  # NUEVO
│       ├── invoice-search-input.tsx     # NUEVO
│       ├── invoice-status-tabs.tsx      # NUEVO
│       ├── monthly-income-chart.tsx     # NUEVO
│       └── pagination-controls.tsx      # NUEVO
│
├── hooks/
│   ├── invoices/
│   │   ├── use-invoices.ts           # MODIFICAR — agregar search, sortBy, sortOrder
│   │   └── use-dashboard-summary.ts  # NUEVO
│   └── use-debounced-value.ts        # NUEVO
│
└── lib/
    └── types.ts                      # MODIFICAR — agregar DashboardSummary types
```

### Design Patterns

1. **Server-side filtering + client-side state** — URL search params sincronizan estado de filtros/búsqueda
2. **Parallel queries** — dashboard summary y lista de invoices se cargan en paralelo
3. **Optimistic UI** — tabs cambian inmediatamente mientras el query se ejecuta
4. **Debounce pattern** — búsqueda usa debounce de 300ms para evitar spam de requests

---

## Implementation Order

**Recomendado (por dependencias):**

1. **SQ-47: Dashboard base list** — FUNDACIÓN
   - Razón: Refactorizar la página existente como base. Agregar paginación UI, mejorar columnas, ampliar API con `sortBy`/`sortOrder`. Todo lo demás se monta sobre esta base.

2. **SQ-49: Pending total (summary cards)** — Segundo
   - Razón: Requiere crear el endpoint `GET /api/invoices/dashboard` que también provee los `counts` para SQ-48 y datos para SQ-52. Es más eficiente crearlo aquí.

3. **SQ-48: Filter by status (tabs)** — Tercero
   - Razón: Reemplaza el dropdown por tabs. Los conteos vienen del endpoint de dashboard (SQ-49). Modifica el hook `useInvoices` para sincronizar el tab activo con el query param `status`.

4. **SQ-50: Overdue highlight** — Cuarto
   - Razón: Agrega campos `isOverdue`/`daysOverdue` al response de la lista y aplica visual highlighting. Requiere que la tabla (SQ-47) y los filtros (SQ-48) ya estén funcionando.

5. **SQ-51: Search invoices** — Quinto
   - Razón: Agrega el input de búsqueda y modifica el endpoint para soportar `?search=`. Requiere la tabla base y los filtros para manejar la precedencia (mantener filtro + resetear paginación).

6. **SQ-52: Monthly summary** — Último
   - Razón: Agrega el chart de tendencia mensual. Es el componente más independiente y usa datos del endpoint de dashboard que ya existe desde SQ-49. Requiere instalar Recharts.

---

## Risks & Mitigations

### Risk 1: Performance del endpoint dashboard con muchas facturas

**Impact:** Medium
**Likelihood:** Low (freelancers individuales, <1000 facturas típicas)
**Mitigation:**

- Queries con `count()` de Supabase son eficientes
- Agregar índice en `invoices(user_id, status)` si necesario
- Cache de TanStack Query con `staleTime: 60s` para summary

### Risk 2: Combinación de filtros + búsqueda + paginación produce resultados inconsistentes

**Impact:** High
**Likelihood:** Medium
**Mitigation:**

- Regla clara: búsqueda resetea paginación a página 1
- Filtro de status se mantiene al buscar
- Tests parametrizados cubriendo combinaciones

### Risk 3: Formato de moneda inconsistente

**Impact:** Medium
**Likelihood:** Medium
**Mitigation:**

- Centralizar función `formatCurrency()` (ya existe en invoices/page.tsx, extraer a `lib/utils/format.ts`)
- Usar formato consistente: USD `$X,XXX.XX` según decisión PO
- Reusar en todas las stories

### Risk 4: Overdue calculation timezone mismatch

**Impact:** Medium
**Likelihood:** Low
**Mitigation:**

- Usar comparación de fechas sin hora (solo DATE)
- Backend calcula `isOverdue` usando `CURRENT_DATE` de PostgreSQL
- Frontend muestra "Hace X días" relativo

---

## Success Criteria

**Esta feature estará completa cuando:**

- [ ] Todas las 6 stories implementadas y deployed en staging
- [ ] **Tipos del backend aplicados consistentemente**
  - [ ] `DashboardSummary`, `InvoiceListItem` tipos definidos en `@/lib/types`
  - [ ] Zero type errors
  - [ ] Props de componentes tipadas
- [ ] **Personalidad UI/UX consistente**
  - [ ] Summary cards con colores semánticos (amber/red/green)
  - [ ] Tabs funcionales con conteos
  - [ ] Tabla con overdue highlighting
  - [ ] Search con debounce y estados claros
- [ ] **Content Writing contextual**
  - [ ] Vocabulario de facturación (pendiente, vencida, cobro)
  - [ ] Empty states diferenciados (sin datos vs sin resultados)
  - [ ] Tono profesional-cercano
- [ ] **Endpoints API funcionando:**
  - [ ] `GET /api/invoices` con search, sortBy, sortOrder
  - [ ] `GET /api/invoices/dashboard` con summary + counts + monthly trend
- [ ] 100% de test cases críticos de los ATPs pasando
- [ ] Performance: LCP < 2.0s, dashboard carga < 1s
- [ ] Build y linting pasando sin errores
