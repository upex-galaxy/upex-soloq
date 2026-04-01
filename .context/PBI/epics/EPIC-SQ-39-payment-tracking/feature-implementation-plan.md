# Feature Implementation Plan: EPIC-SQ-39 - Payment Tracking

## Overview

Esta feature implementa el registro completo de pagos de facturas: formulario/modal de pago con método, monto, fecha y notas, actualización de estado de factura a "paid", y la capacidad de revertir pagos erróneos.

**Alcance:**

- [SQ-53]: Marcar factura como pagada (botón + modal + API endpoint + status transition)
- [SQ-54]: Registrar método de pago (dropdown con métodos configurados del usuario)
- [SQ-55]: Registrar monto recibido (prefill, validaciones, warnings partial/over)
- [SQ-56]: Agregar notas al pago (textarea opcional con counter)
- [SQ-57]: Registrar fecha de pago (date picker con validaciones)
- [SQ-58]: Revertir pago (confirmación + soft delete + status rollback)

**Stack técnico:**

- Frontend: Next.js 16 (App Router) + React + TanStack Query
- Backend: Next.js API Routes + Supabase (PostgreSQL)
- Styling: Tailwind CSS v4 + shadcn/ui (New York)
- Forms: React Hook Form + Zod
- Testing: Playwright (E2E), Vitest (Unit)

---

## Technical Decisions

### Decision 1: Payment UI — Dialog modal vs página separada

**Options considered:**

- A) Página separada `/invoices/[id]/pay`
- B) Dialog modal (shadcn `Dialog`) sobre la vista actual
- C) Sheet lateral (shadcn `Sheet`)

**Chosen:** B) Dialog modal

**Reasoning:**

- ✅ El formulario tiene pocos campos (5) — no requiere página completa
- ✅ AC de SQ-53 dice "payment form/modal opens" — la story especifica modal
- ✅ Mantiene contexto visual: el usuario ve la factura mientras completa el pago
- ✅ `Dialog` ya está instalado en shadcn/ui
- ✅ Pattern común en apps de facturación (Stripe, QuickBooks)
- ❌ Trade-off: espacio limitado en mobile (mitigado con Dialog full-screen en sm)

**Implementation notes:**

- Componente `PaymentFormDialog` con `open`/`onOpenChange` controlado
- Se dispara desde: botón "Marcar como Pagada" en detalle + icono en lista de facturas
- En mobile: Dialog usa `max-w-full` con scroll interno

---

### Decision 2: Validación — Single Zod schema con React Hook Form

**Options considered:**

- A) Validación manual con useState
- B) Zod schema + React Hook Form (patrón existente del proyecto)
- C) Zod solo en backend, frontend minimal

**Chosen:** B) Zod + React Hook Form

**Reasoning:**

- ✅ Consistente con el patrón existente del proyecto (invoice creation usa RHF + Zod)
- ✅ Un solo schema compartible entre frontend y backend
- ✅ Mensajes de error declarativos y type-safe
- ✅ `react-hook-form` ya es dependencia del proyecto
- ❌ Trade-off: schema debe cubrir edge cases de monto (resueltos por PO decisions)

**Implementation notes:**

- Schema: `paymentFormSchema` en `src/lib/validations/payment.ts`
- Required: `paymentMethod` (enum), `amountReceived` (number > 0, max 2 decimals)
- Default: `paymentDate` (today), `notes` (empty string)
- Frontend y backend usan el MISMO schema para validación consistente

---

### Decision 3: Warning de partial/overpayment — Informativo, NO bloqueante

**Options considered:**

- A) Warning bloquea el submit hasta que el usuario confirme
- B) Warning informativo que permite continuar (submit habilitado)
- C) Sin warning, aceptar cualquier monto

**Chosen:** B) Informativo, no bloqueante

**Reasoning:**

- ✅ Decisión PO confirmada: el warning informa pero no bloquea
- ✅ Reduce fricción para freelancers que reciben pagos parciales deliberadamente
- ✅ Mensajes claros: "El monto recibido es menor/mayor al total de la factura"
- ✅ El usuario decide si es correcto — la plataforma no juzga
- ❌ Trade-off: mayor riesgo de errores de dedo (mitigado con prefill del total)

**Implementation notes:**

- Comparar `amountReceived` vs `invoice.total` en el formulario (client-side)
- Partial: `amountReceived < invoice.total` → warning amarillo
- Over: `amountReceived > invoice.total` → notice azul
- Full: `amountReceived === invoice.total` → check verde
- Warning se muestra debajo del campo amount, no como modal separado

---

### Decision 4: Revert payment — Soft delete + smart status rollback

**Options considered:**

- A) Hard delete del payment record
- B) Soft delete (set `deleted_at`) + status rollback inteligente
- C) Nuevo estado "reverted" en el enum

**Chosen:** B) Soft delete + smart rollback

**Reasoning:**

- ✅ AC de SQ-58 dice "payment record is soft-deleted (deleted_at timestamp set)"
- ✅ Mantiene audit trail completo — el pago existió y fue revertido
- ✅ Status rollback inteligente: si `due_date < today` → "overdue", else → "sent"
- ✅ Evento registrado en `invoice_events` para trazabilidad
- ❌ Trade-off: queries de payments deben filtrar `WHERE deleted_at IS NULL`

**Implementation notes:**

- `DELETE /api/invoices/{invoiceId}/payments` — revertir último pago
- Backend: `UPDATE payments SET deleted_at = NOW() WHERE invoice_id = ?`
- Backend: `UPDATE invoices SET status = ?, paid_at = NULL WHERE id = ?`
- Status se calcula: `due_date < CURRENT_DATE ? 'overdue' : 'sent'`
- Frontend: Dialog de confirmación antes de revertir

---

### Decision 5: Optimistic UI vs refetch después de mutación

**Options considered:**

- A) Optimistic update (actualizar UI inmediatamente, revertir si falla)
- B) Refetch queries after mutation (invalidar cache, re-fetch)
- C) Manual state update + eventual refetch

**Chosen:** B) Refetch after mutation

**Reasoning:**

- ✅ Más simple y confiable — la data siempre refleja el estado real del backend
- ✅ TanStack Query `invalidateQueries` invalida tanto invoices como dashboard summary
- ✅ Evita inconsistencias cuando múltiples queries dependen del mismo dato
- ✅ La mutación es rápida (<500ms) — el usuario no nota la diferencia
- ❌ Trade-off: flash breve de loading state al cerrar modal (mitigado con Skeleton inline)

**Implementation notes:**

- `useMutation` + `onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] })`
- También invalidar `['dashboard-summary']` para que las métricas se actualicen
- Toast de éxito/error con Sonner

---

## Types & Type Safety

**Tipos disponibles:** `src/lib/types.ts`

**Entidades principales de esta feature:**

```typescript
// Ya existentes — NO crear duplicados
import type { Invoice, Payment, PaymentInsert, PaymentMethodType } from '@/lib/types';
import type { InvoiceWithClient, InvoiceWithDetails } from '@/lib/types';
```

**Tipos nuevos a agregar en `src/lib/types.ts`:**

```typescript
// === Payment Form Input ===
export interface PaymentFormInput {
  paymentMethod: PaymentMethodType;
  amountReceived: number;
  paymentDate: string;  // ISO date string "YYYY-MM-DD"
  notes?: string;
  reference?: string;
}

// === Payment with comparison context ===
export interface PaymentComparisonResult {
  type: 'full' | 'partial' | 'overpayment';
  difference: number;  // positive = underpaid, negative = overpaid
}

// === API Response types ===
export interface RegisterPaymentResponse {
  success: boolean;
  payment: Payment;
  invoice: Invoice;
}

export interface RevertPaymentResponse {
  success: boolean;
  invoice: Invoice;
}
```

**Directiva para TODAS las stories:**

- ✅ Importar tipos desde `@/lib/types`
- ✅ Props de componentes tipadas
- ✅ Response de APIs tipados con los interfaces definidos
- ✅ Zod schema alineado con los tipos TypeScript
- ✅ Zero type errors

---

## UI/UX Design Strategy

**Design System:** `.context/design-system.md`
**Estilo visual:** Moderno/Bold (bordes redondeados, sombras, gradientes sutiles)

### Payment Form Layout (Dialog Modal)

```
┌─────────────────────────────────────────────┐
│ Dialog Header: "Registrar Pago"        [X]  │
├─────────────────────────────────────────────┤
│                                             │
│ Invoice context:                            │
│ ┌─────────────────────────────────────────┐ │
│ │ INV-2026-0042 · ClientName             │ │
│ │ Total: $1,500.00                       │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Monto Recibido *                            │
│ ┌──────────────────────────────────────┐    │
│ │ $ 1,500.00                           │    │  ← SQ-55 (prefill + validation)
│ └──────────────────────────────────────┘    │
│ ✅ Coincide con el total de la factura      │  ← SQ-55 (comparison feedback)
│                                             │
│ Método de Pago *                            │
│ ┌──────────────────────────────────────┐    │
│ │ ▼ Transferencia bancaria             │    │  ← SQ-54 (method dropdown)
│ └──────────────────────────────────────┘    │
│                                             │
│ Fecha de Pago *                             │
│ ┌──────────────────────────────────────┐    │
│ │ 📅 Mar 31, 2026                      │    │  ← SQ-57 (date picker)
│ └──────────────────────────────────────┘    │
│                                             │
│ Notas (Opcional)                            │
│ ┌──────────────────────────────────────┐    │
│ │                                      │    │  ← SQ-56 (textarea)
│ │                                      │    │
│ └──────────────────────────────────────┘    │
│                                 0/500 chars  │
│                                             │
├─────────────────────────────────────────────┤
│          [Cancelar]    [Registrar Pago]     │  ← SQ-53 (submit)
└─────────────────────────────────────────────┘
```

### Revert Payment Dialog (SQ-58)

```
┌─────────────────────────────────────────────┐
│ Dialog Header: "Revertir Pago"         [X]  │
├─────────────────────────────────────────────┤
│                                             │
│ ⚠️ ¿Estás seguro de que quieres revertir   │
│    este pago?                               │
│                                             │
│ Esto marcará la factura como no pagada y    │
│ eliminará el registro de pago.              │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ INV-2026-0042 · $1,500.00 · Pagada     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
├─────────────────────────────────────────────┤
│          [Cancelar]   [Confirmar Reversión] │
└─────────────────────────────────────────────┘
```

### Entry Points for "Mark as Paid"

1. **Invoice Detail Page** (`/invoices/[id]`):
   - Botón "Marcar como Pagada" en el header, al lado del título
   - Solo visible cuando `status === 'sent' || status === 'overdue'`
   - Disabled/hidden cuando `status === 'paid'`

2. **Invoice List Row** (dashboard, via EPIC-SQ-38):
   - Icono de acción rápida en la columna de acciones de la tabla
   - Solo para facturas con status `sent` o `overdue`

### Componentes shadcn/ui a usar

- ✅ `Dialog` — payment form modal y revert confirmation
- ✅ `Form` — React Hook Form integration (ya existe)
- ✅ `Input` — campo de monto
- ✅ `Select` — dropdown de método de pago
- ✅ `Button` — submit, cancel, trigger
- ✅ `Label` — labels de formulario
- ✅ `Badge` — status badge (ya existe InvoiceStatusBadge)
- 🆕 Necesario: `Calendar` + `Popover` para date picker (instalar via shadcn CLI)

### Estados del formulario

- **Loading (submit):** Botón "Registrar Pago" muestra spinner + disabled
- **Success:** Toast "Pago registrado exitosamente" + cerrar dialog + invalidar queries
- **Error:** Toast "Error al registrar pago" + mantener dialog abierto
- **Validation errors:** Mensajes inline debajo de cada campo

### Personalidad UI/UX

**Estilo: Moderno/Bold** (del design system)

- Bordes: `rounded-lg` en dialog, `rounded-md` en inputs
- Invoice context card: `bg-muted/50` con `rounded-md` y `p-4`
- Warning partial: `text-amber-600` + `bg-amber-50` + icono AlertTriangle
- Notice overpayment: `text-blue-600` + `bg-blue-50` + icono Info
- Match full: `text-green-600` + icono CheckCircle2
- Confirm Revert button: `variant="destructive"`

---

## Content Writing Strategy

**Vocabulario del dominio SoloQ:**

| Término UI | Contexto |
|------------|----------|
| "Registrar Pago" | Título del dialog y botón submit |
| "Marcar como Pagada" | Botón trigger en detail page |
| "Monto Recibido" | Label del campo amount |
| "Método de Pago" | Label del dropdown |
| "Fecha de Pago" | Label del date picker |
| "Notas" | Label del textarea |
| "Revertir Pago" | Acción de undo en facturas pagadas |
| "Pago registrado exitosamente" | Toast de éxito |
| "El monto recibido es menor al total de la factura" | Warning parcial |
| "El monto recibido excede el total de la factura" | Notice sobrepago |
| "Coincide con el total de la factura" | Feedback de match |

**Formato monetario:** USD `$X,XXX.XX` (decisión PO confirmada)

**Tono:** Profesional pero cercano — confirmaciones claras, warnings no alarmantes.

---

## Shared Dependencies

**Todas las stories requieren:**

1. **React Hook Form** — ya instalado, para formulario de pago
2. **Zod** — ya instalado, para validación
3. **TanStack Query** — ya instalado, para mutations + cache invalidation
4. **Sonner** — ya instalado, para toast notifications
5. **Lucide Icons** — ya instalado (DollarSign, Calendar, CheckCircle2, AlertTriangle, Info, RotateCcw)

**Nuevas dependencias shadcn/ui a instalar:**

- `Calendar` — para date picker de SQ-57
- `Popover` — contenedor del calendar

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
│   │       ├── [id]/
│   │       │   └── page.tsx              # MODIFICAR — agregar botón "Marcar como Pagada"
│   │       └── page.tsx                  # MODIFICAR — agregar acción rápida en tabla (tras SQ-38)
│   └── api/
│       └── invoices/
│           └── [id]/
│               └── payments/
│                   └── route.ts          # NUEVO — POST (registrar) + DELETE (revertir)
│
├── components/
│   └── invoices/
│       ├── invoice-status-badge.tsx      # YA EXISTE — no modificar
│       ├── payment-form-dialog.tsx       # NUEVO — modal de registro de pago
│       └── revert-payment-dialog.tsx     # NUEVO — dialog de confirmación de reversión
│
├── hooks/
│   └── invoices/
│       ├── use-register-payment.ts       # NUEVO — mutation hook
│       └── use-revert-payment.ts         # NUEVO — mutation hook
│
└── lib/
    ├── types.ts                          # MODIFICAR — agregar PaymentFormInput types
    └── validations/
        └── payment.ts                    # NUEVO — Zod schema de payment form
```

### Design Patterns

1. **Form-in-Dialog** — Dialog controla open/close, Form controla validación y submit
2. **Mutation + Invalidation** — `useMutation` para POST/DELETE, `invalidateQueries` para refresh
3. **Controlled Dialog** — parent gestiona `isOpen` state, dialog recibe `invoice` como prop
4. **Shared validation** — Zod schema usado en frontend (RHF resolver) y backend (parseBody)

### API Endpoint Design

**`POST /api/invoices/[id]/payments`** (SQ-53 + SQ-54 + SQ-55 + SQ-56 + SQ-57)

```
Request:
  Body: PaymentInput (Zod validated)
  Auth: Required (Supabase server client)

Processing:
  1. Parse + validate body with paymentFormSchema
  2. Verify invoice exists, belongs to user (RLS), status in ['sent', 'overdue']
  3. Insert into payments table
  4. Update invoices: status = 'paid', paid_at = NOW()
  5. Insert into invoice_events: type = 'paid'

Response:
  201: { success: true, payment: Payment, invoice: Invoice }
  400: Invoice already paid / validation errors
  404: Invoice not found
```

**`DELETE /api/invoices/[id]/payments`** (SQ-58)

```
Request:
  No body
  Auth: Required (Supabase server client)

Processing:
  1. Verify invoice exists, belongs to user (RLS), status = 'paid'
  2. Soft delete payment: SET deleted_at = NOW()
  3. Calculate new status: due_date < TODAY ? 'overdue' : 'sent'
  4. Update invoices: status = new_status, paid_at = NULL
  5. Insert into invoice_events: type = 'updated', metadata = { action: 'payment_reverted' }

Response:
  200: { success: true, invoice: Invoice }
  400: Invoice is not paid
  404: Invoice not found
```

---

## Implementation Order

**Recomendado (por dependencias):**

1. **SQ-53: Mark as Paid** — FUNDACIÓN
   - Razón: Crea TODO el flujo completo: botón trigger, Dialog modal, formulario con todos los campos, API endpoint `POST /api/invoices/[id]/payments`, status transition, Zod schema, mutation hook. Es el 60% del trabajo de esta epic.

2. **SQ-55: Amount received** — Segundo
   - Razón: Enhances el campo de monto con prefill del total de la factura, comparación visual (full/partial/over), warnings informativos, y validación avanzada de decimales. Es la story más compleja (8SP) y tiene las decisiones PO más críticas ya confirmadas.

3. **SQ-54: Payment method** — Tercero
   - Razón: Enhances el dropdown de método de pago para mostrar los métodos configurados del usuario primero. Requiere integrar con `use-payment-methods` hook existente para priorizar opciones.

4. **SQ-57: Payment date** — Cuarto
   - Razón: Enhances el campo de fecha con calendar picker (shadcn), validación de no-futuro, y warning si la fecha es anterior a la fecha de emisión. Requiere instalar `Calendar` + `Popover` de shadcn.

5. **SQ-56: Payment notes** — Quinto
   - Razón: Enhances el textarea de notas con character counter (0/500), soporte multiline, y preservación de caracteres especiales. Es la story más simple (2SP).

6. **SQ-58: Revert payment** — Último
   - Razón: Flujo separado e independiente. Crea el endpoint `DELETE`, el dialog de confirmación, el mutation hook, y la lógica de rollback inteligente de status. Se beneficia de que todo el flujo de pago ya está funcionando para probar end-to-end.

---

## Risks & Mitigations

### Risk 1: Estado de invoice no se sincroniza tras registrar pago

**Impact:** High
**Likelihood:** Medium
**Mitigation:**

- `invalidateQueries` invalida TODOS los queries que dependen de invoices
- Keys a invalidar: `['invoices']`, `['invoice', invoiceId]`, `['dashboard-summary']`
- Toast de éxito solo se muestra DESPUÉS de que la mutación fue exitosa
- E2E test: registrar pago → verificar status badge actualizado inmediatamente

### Risk 2: Validación inconsistente de monto entre frontend y backend

**Impact:** High
**Likelihood:** Medium
**Mitigation:**

- Zod schema compartido: `src/lib/validations/payment.ts`
- Frontend usa `zodResolver(paymentFormSchema)` con React Hook Form
- Backend usa `paymentFormSchema.parse(body)` antes de cualquier operación
- Tests parametrizados con los mismos edge cases en ambos lados

### Risk 3: Race condition en status transition

**Impact:** Medium
**Likelihood:** Low
**Mitigation:**

- Backend verifica status ANTES de insertar payment (guard clause)
- Si la factura ya está pagada, retornar 400 sin efectos secundarios
- Usar transacción de Supabase (RPC o `supabase.rpc`) si la atomicidad es crítica
- Frontend deshabilita el botón mientras la mutación está en progreso

### Risk 4: Date picker no disponible (Calendar + Popover no instalados)

**Impact:** Low
**Likelihood:** Certain (no están instalados)
**Mitigation:**

- Instalar `Calendar` y `Popover` de shadcn al inicio de SQ-57
- Fallback: Input type="date" nativo si hay issues con el calendar
- Comando: `bunx shadcn@latest add calendar popover`

### Risk 5: Soft delete de payments no filtrado en queries existentes

**Impact:** Medium
**Likelihood:** Medium
**Mitigation:**

- Agregar `WHERE deleted_at IS NULL` en todas las queries de payments
- Alternativamente: RLS policy en Supabase que oculte deleted records
- Verificar que el dashboard summary solo cuente payments activos

---

## PO Decisions Confirmed

Estas decisiones fueron confirmadas durante el Shift-Left QA y se aplican a toda la epic:

| Decision | Story | Detail |
|----------|-------|--------|
| Warning behavior | SQ-55 | Informativo, NO bloqueante. El usuario puede continuar con partial/overpayment |
| Currency format | SQ-55 | USD `$X,XXX.XX` |
| Amount prefill | SQ-55 | Siempre usa `invoice.total` actual |
| Decimal precision | SQ-55 | 2 decimales, normalización automática |
| Minimum amount | SQ-55 | `0.01` (API contract) — `0` y `0.00` rechazados |
| Leading zeros | SQ-55 | Normalizados automáticamente (`01000` → `1000`) |

---

## Success Criteria

**Esta feature estará completa cuando:**

- [ ] Todas las 6 stories implementadas y deployed en staging
- [ ] **Tipos del backend aplicados consistentemente**
  - [ ] `PaymentFormInput`, `PaymentComparisonResult` tipos definidos
  - [ ] Zero type errors
  - [ ] Props de componentes tipadas
- [ ] **Personalidad UI/UX consistente**
  - [ ] Dialog modal funcional y responsive
  - [ ] Warnings visuales diferenciados (amber/blue/green)
  - [ ] Date picker con calendar
  - [ ] Character counter en notas
  - [ ] Revert con confirmación destructive
- [ ] **Content Writing contextual**
  - [ ] Vocabulario de pagos (monto recibido, método, revertir)
  - [ ] Mensajes de validación claros en español
  - [ ] Tono profesional-cercano
- [ ] **Endpoints API funcionando:**
  - [ ] `POST /api/invoices/[id]/payments` con validación Zod
  - [ ] `DELETE /api/invoices/[id]/payments` con soft delete + smart rollback
- [ ] 100% de test cases críticos de los ATPs pasando
- [ ] Performance: dialog abre < 200ms, submit < 1s
- [ ] Build y linting pasando sin errores
