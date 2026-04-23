# Final Bug-Fix Decision Matrix — Sprint 2

**Fecha:** 2026-04-20
**Alcance:** 16 incidencias investigadas (4 Bugs + 11 Defects + 1 Improvement) del Sprint activo `SoloQ Sprint 2`
**Metodología:** 4 batches de 4 subagents en paralelo, investigación read-only + Supabase MCP para evidencia DB
**Inputs:** `.context/reports/incident-SQ-*-investigation.md` (16 archivos)

---

## 🎯 TL;DR

- **7 de 16 tickets ya no requieren código** — 3 fixes ya mergeados en staging, 2 inválidos, 1 duplicado, 1 Cannot Reproduce correctamente triaged. Pendiente: acción administrativa en Jira.
- **9 de 16 tickets requieren código nuevo** — 1 XSS latente (alta), 6 bugs de integridad/UX confirmados, 1 a11y de una línea, 1 enhancement data-layer.
- **Ningún PR fantasma**: el estado "In Review" en SoloQ no equivale a PR abierto — es una etapa del workflow QA. Verificar PR real antes de asumir que hay fix en curso.
- **Hallazgo estructural #1:** tres bugs del dashboard (SQ-142, SQ-174, SQ-176) comparten el mismo anti-patrón: cálculos derivados que se "almacenan" en columnas en vez de derivarse en cada lectura, con la app olvidándose de actualizar la columna. Candidato a refactor transversal.
- **Hallazgo estructural #2:** SQ-34 (Shift-Left QA) quedó **duplicado funcionalmente** por el hotfix de SQ-138 — coordinar con PO para reescope o cierre.

---

## 📋 Matriz de Decisión

| Key | Tipo | Prio | Verdict | Jira Root Cause | Fix Scope | Acción |
|-----|------|------|---------|-----------------|-----------|--------|
| SQ-137 | Bug     | Highest | **NO-FIX** (keep as Cannot Reproduce) | not-a-bug / environment | — | Cerrar. Exigir evidencia (URL + DevTools + SHA) si se reabre |
| SQ-172 | Defect  | Highest | **INVALID** | not-a-bug | — | Cerrar. Reporter confundió soft-delete con hard-delete |
| SQ-171 | Defect  | High    | **INVALID / DUPLICATE of SQ-172** | duplicate | — | Cerrar como duplicado |
| SQ-74  | Defect  | Highest | **FIX-MERGED** (staging `f8de82b`) | code-defect | — | Pedir RTX a Joel y cerrar |
| SQ-155 | Bug     | High    | **FIX-MERGED** (staging `d7a2c83`, PR #83) | code-defect | — | QA sign-off pendiente; luego cerrar |
| SQ-138 | Bug     | High    | **FIX-MERGED** (staging `e83d455`, PR #82) | code-defect | — | QA sign-off pendiente. ⚠️ SQ-34 queda duplicado |
| SQ-127 | Improv. | Low     | **FIX-MERGED** (staging `88db7ce`, PR #89) | missing-feature | — | Cerrar. Follow-up opcional: PasswordInput reutilizable |
| SQ-156 | Defect  | High    | **FIX** — XSS latente | code-defect | **S** | Zod `.transform` con `sanitize-html` + backfill 2 filas + defense-in-depth en email template |
| SQ-82  | Defect  | High    | **PARTIAL-FIX (fix-forward)** | data-defect | **S** | Primary ya cerrado. Falta migración con CHECK constraints |
| SQ-142 | Bug     | Medium  | **FIX** — no hay PR | code-defect | **M** | Server-side transaction (RPC) + DB trigger recomputa subtotal |
| SQ-174 | Defect  | Medium  | **FIX** — 8/9 paid con `paid_at` NULL | code-defect | **S** | Actualizar `paid_at` + emitir evento `paid` en `payments/route.ts`. Mirror en revert-payment |
| SQ-175 | Defect  | Medium  | **FIX** — bloqueado por SQ-174 | logic-error | **S** | Cambiar 3 ventanas de `updated_at` → `paid_at`. Hacer DESPUÉS de SQ-174 |
| SQ-176 | Defect  | Medium  | **FIX** | logic-error | **M** | Single-source-of-truth `isOverdue` + `urgencyScore` util; opcional: columna derivada en Postgres |
| SQ-177 | Defect  | Medium  | **FIX** | code-defect (state) | **S** | Migrar filtros a `useSearchParams` + `router.replace` (Next.js 16 idiomático) |
| SQ-173 | Defect  | Medium  | **FIX** — one-liner | code-defect (a11y) | **XS** | Añadir `id="payment_method"` al `<SelectTrigger>` en `mark-as-paid-dialog.tsx` |
| SQ-169 | Defect  | Medium  | **FIX** | code-defect (UX) | **XS** | Branch empty-state por presencia de filtros (patrón ya existe en `/clients`) |

---

## 🗂️ Grupo A — Cerrar en Jira, sin código (7 tickets)

Estos tickets no requieren cambios de código. Solo workflow administrativo.

### A.1 Cerrar como INVALID / NOT-A-BUG
| Key | Acción | Razón |
|-----|--------|-------|
| SQ-137 | Cerrar (mantener Cannot Reproduce) | Endpoint funciona desde `1fd15ec` (2026-02-25). Reporter sin evidencia |
| SQ-172 | Cerrar como Invalid | Schema-impossible. FK RESTRICT + soft-delete. 0 filas con `client_id NULL` |
| SQ-171 | Cerrar como Duplicate of SQ-172 | Mismo flujo, distinta status de factura — idéntico root cause |

### A.2 Cerrar porque el fix ya está mergeado en staging
| Key | PR / Commit | Pendiente |
|-----|-------------|-----------|
| SQ-74  | commit `f8de82b` | RTX de Joel (tester asignado). Confirmado "no longer reproducible" el 2026-03-31 |
| SQ-155 | PR #83 / merge `d7a2c83` | QA sign-off sobre staging. Respuesta 200 con delay 0-200ms |
| SQ-138 | PR #82 / merge `e83d455` | QA sign-off. ⚠️ Revisar scope de SQ-34 con PO (quedó duplicado) |
| SQ-127 | PR #89 / merge `88db7ce` | Cerrar directo. Follow-up opcional: extender toggle a `/login` |

### ⚠️ Side-effect importante
**SQ-34** ("Include Payment Methods in PDF", Shift-Left QA) fue entregado funcionalmente por el hotfix de SQ-138. Recomendación: reescope a tareas de polish (tests unitarios del formatter, UX copy del límite de 3, migración opcional de `payment_methods.value` a `jsonb`) o cerrar como "entregado con SQ-138".

---

## 🔨 Grupo B — Fix real requerido (9 tickets)

Ordenado por prioridad operativa (impact × effort).

### B.1 🔴 Crítico por seguridad — SQ-156 (XSS)
- **Evidencia:** `<script>alert(1)</script>` persiste verbatim en `public.invoices.notes`. 2 filas en staging ya lo contienen (INV-2026-0009, INV-2026-0002).
- **Exposición actual:** cero (ningún render actual es sink de HTML).
- **Riesgo:** cualquier feature futura que renderice `notes` como HTML convierte la data persistida en stored-XSS activo.
- **Fix:** S — Zod `.transform` con `sanitize-html` en `src/lib/validations/invoice.ts` (aplicar a `notes` Y `terms`, ambos schemas create/update) + backfill SQL de las 2 filas existentes + escape defensivo en `email-service.ts` para `clientName`/`businessName`.
- **Files:** `src/lib/validations/invoice.ts`, `src/app/api/invoices/route.ts`, `src/app/api/invoices/[id]/route.ts`, `src/lib/services/email-service.ts`.

### B.2 🔶 Integridad de datos — SQ-174 + SQ-175 (cluster, hacer en orden)
**SQ-174 primero**, luego SQ-175.

**SQ-174** — 8 de 9 invoices `paid` tienen `paid_at NULL`; 0 eventos `paid` emitidos (pero sí 12 `sent`).
- **Fix:** S — en `src/app/api/invoices/[id]/payments/route.ts:110-114`, además de flip `status='paid'`, actualizar `paid_at = now()` y insertar row en `invoice_events` con `event_type='paid'`. Espejo en `revert-payment/route.ts` (limpiar `paid_at`, emitir evento reverso).
- **Patrón referencia:** `send/route.ts:345-382` ya hace el emit correcto para `sent`.
- **Backfill:** SQL para las 8 filas divergentes + crear eventos históricos sintéticos.

**SQ-175** — dashboard agrupa `updated_at` (incorrecto) en lugar de `paid_at` (correcto). Overestima "Cobrado este Mes" 156x en staging ($42K vs $270 real).
- **Fix:** S — cambiar 3 ventanas en `src/app/api/invoices/dashboard/route.ts` (líneas 96-102, 121-127, 171-177) de `updated_at` a `paid_at`.
- **Bloqueado por SQ-174:** si se aplica sin backfill de `paid_at`, el número colapsa. Secuenciar.

### B.3 🔶 Integridad de datos — SQ-142 (Subtotal ghost)
- **Estado:** latente (0 divergencias actuales porque un admin hizo cleanup manual el 2026-03-29), pero la falla estructural permanece.
- **Root cause:** `POST /api/invoices:282-294` escribe `subtotal` desde el array en memoria y luego hace insert "best-effort" de `invoice_items` (log-and-continue). Si el child falla, el parent queda con subtotal que referencia items inexistentes.
- **Fix:** M — (1) mover a RPC de Supabase con transacción parent+items; (2) trigger `AFTER INSERT/UPDATE/DELETE` en `invoice_items` que recomputa `invoices.subtotal = SUM(quantity*unit_price)`.
- **No hay PR en curso** a pesar del estado "In Review" en Jira.

### B.4 🟡 Lógica de UI — SQ-176 (Overdue dual-truth)
- **Evidencia:** dashboard cuenta `status='overdue'` (nunca se escribe en DB → `overdue_count` permanentemente 0). Lista usa util `isInvoiceOverdue()` correcto. Staging: 0 con status='overdue', 2 realmente overdue.
- **Fix:** M — extender `src/lib/utils/overdue.ts` con comparator server-safe, reescribir `src/app/api/invoices/dashboard/route.ts:80-92` para usar predicate derivado, añadir `urgency` como sort key en API de lista. Opcional: columna generada en Postgres.
- **Relación con SQ-175:** mismo anti-patrón "store derived vs derive on read". Mismo handler. Hacer juntos.

### B.5 🟡 Data-layer hardening — SQ-82 (fix-forward)
- **Primary (case-insensitive email):** ✅ ya resuelto por migración `20260217221850_add_clients_email_case_insensitive_unique`.
- **Gap remanente:** `public.clients` sin CHECK constraints → writes directos en DB (no-UI) bypassean reglas Zod (name empty, email inválido, length caps).
- **Fix:** S — nueva migración con CHECK constraints (`name_not_empty`, `email_format`, `address_max_len`, `notes_max_len`, `phone_format`).

### B.6 🟢 UI / UX — SQ-177, SQ-169, SQ-173 (rápidos)

**SQ-177** — filtros no persisten en URL (state local).
- **Fix:** S — migrar a patrón Next.js 16: `useSearchParams` + `router.replace(pathname + '?' + params, { scroll: false })`. Files: `src/app/(app)/invoices/page.tsx`.

**SQ-169** — búsqueda vacía muestra copy de cuenta nueva.
- **Fix:** XS — branch empty-state por presencia de `debouncedSearch` en `src/app/(app)/invoices/page.tsx:262-289`. El patrón correcto ya existe en `/clients` (`clients-empty-state.tsx`).

**SQ-173** — label a11y roto en modal Registrar Pago.
- **Fix:** XS — añadir `id="payment_method"` al `<SelectTrigger>` en `src/components/invoices/mark-as-paid-dialog.tsx:161-165`. One-liner. Los otros 3 labels del mismo archivo están bien.

---

## 📈 Resumen por root-cause (para custom field en Jira)

| Root Cause | Count | Tickets |
|------------|-------|---------|
| `code-defect` | 10 | SQ-74, SQ-155, SQ-156, SQ-138, SQ-142, SQ-174, SQ-177, SQ-173, SQ-169 (+ SQ-82 primary já resolto) |
| `logic-error` | 2 | SQ-175, SQ-176 |
| `data-defect` | 1 | SQ-82 (layer DB pendiente) |
| `not-a-bug` / `environment` | 2 | SQ-137, SQ-172 |
| `duplicate` | 1 | SQ-171 |
| `missing-feature` | 1 | SQ-127 |

---

## 🗓️ Plan de ejecución sugerido (3-5 días)

**Día 1 — Limpieza administrativa en Jira (0 código)**
- Cerrar SQ-137, SQ-172, SQ-171 (not-a-bug / duplicate)
- Pedir RTX a Joel (SQ-74), coordinar QA sign-off de SQ-155, SQ-138, SQ-127
- Sincronizar con PO sobre reescope/cierre de SQ-34

**Día 2 — Seguridad (S)**
- SQ-156: sanitización de `notes`/`terms` + backfill

**Día 3 — Data integrity cluster (S+S+M)**
- SQ-174 primero (update paid_at + event emission)
- SQ-175 inmediatamente después (cambio `updated_at` → `paid_at`)
- SQ-142 en paralelo si hay banda (transaction + trigger)

**Día 4 — UI semantics (M+S)**
- SQ-176 y SQ-177 juntos (misma route `dashboard` + `invoices/page.tsx`)

**Día 5 — Polish (XS+XS+S)**
- SQ-173 (one-liner)
- SQ-169 (empty-state branching)
- SQ-82 fase 2 (migración CHECK constraints)

---

## 📚 Archivos generados

```
.context/reports/
├── sprint-report-2026-04-20.md            ← estado general del sprint (base)
├── FINAL-SUMMARY-2026-04-20.md            ← este archivo (decisión ejecutiva)
└── incident-SQ-XXX-investigation.md       ← 16 reportes detallados (uno por ticket)
```

Cada `incident-SQ-XXX-investigation.md` contiene: metadata del ticket, contexto del feature, archivos relacionados con `file:line`, reproducción (con evidencia DB cuando aplica), root cause técnico, veredicto + sugerencia de Jira custom field, y plan de fix recomendado.

---

**Generado por:** orquestación de 4 batches × 4 subagents (16 agentes read-only en total) + Supabase MCP para evidencia DB + `acli` para lectura de Jira.
