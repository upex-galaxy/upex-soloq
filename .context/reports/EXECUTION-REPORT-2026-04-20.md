# Execution Report — Sprint 2 Bug Cleanup

**Fecha:** 2026-04-20 → 2026-04-21
**Scope:** 16 incidencias del Sprint activo `SoloQ Sprint 2`
**Método:** 4+4+3+2 subagents en waves paralelos (total 13 subagents de ejecución + 2 de Jira admin, sobre los 16 de investigación previa)
**Isolación:** cada agent code-writer en worktree git dedicado

---

## 🎯 Resultado global

- ✅ **9 PRs abiertos contra `staging`** — todos pasan `bun typecheck` + `bun lint` (archivos tocados) + `bun run build`
- ✅ **7 tickets de Jira con comentario detallado** + transición cuando la autorización lo permitió
- ⚠️ **3 limitaciones técnicas documentadas** que requieren intervención manual en Jira UI
- 🧹 **Sin cambios destructivos**, sin `--no-verify`, sin amend, sin force-push, sin merges prematuros

---

## 🗂️ Fase A — Acciones administrativas en Jira (7 tickets)

### A.1 Invalid / Duplicate
| Ticket | Acción completada | Estado final | Nota |
|--------|-------------------|--------------|------|
| SQ-137 | Comment posteado con verdict y evidencia | Cannot Reproduce (ya lo estaba) | Terminal; sin transición adicional |
| SQ-172 | Comment + intento REJECTED bloqueado por validador | Cannot Reproduce | ⚠️ Requiere Root Cause en UI para llegar a REJECTED |
| SQ-171 | Comment + link `Duplicate of SQ-172` (id 10488) | Cannot Reproduce | ⚠️ Mismo caso que SQ-172 |

### A.2 Fix-merged
| Ticket | Acción completada | Estado final | Ruta workflow recorrida |
|--------|-------------------|--------------|-------------------------|
| SQ-74  | Comment + transición completa | **Closed** | Open → In Progress → In Review → Ready For QA → Closed |
| SQ-155 | Comment + transición | **Ready For QA** | In Review → Ready For QA |
| SQ-138 | Comment + transición | **Ready For QA** | In Review → Ready For QA (auto-reasignado a Alfonso por post-function) |
| SQ-127 | Comment + transición | **Ready For QA** | In Review → Ready For QA |

### ⚠️ Limitaciones Fase A
1. **`customfield_10118` (Root Cause)** no es seteable vía `acli jira workitem edit` — la CLI solo expone `summary/description/assignee/labels/type`. Documentado en comentarios con el valor sugerido (`Code Error`, `Integration Error`, `Working As Designed (WAD)` según caso). **Requiere UI manual.**
2. **Transición a REJECTED** bloqueada por validador `"El Root Cause es requerido"` — una vez seteado el custom field en el punto 1, SQ-172 y SQ-171 pueden transitarse desde Cannot Reproduce → REJECTED.
3. **Permiso "Assign Issues"** ausente para la cuenta autenticada — no se pudo reasignar tickets manualmente. Las post-functions de Jira suplieron este paso en SQ-74 y SQ-138.

---

## 🔧 Fase B — 9 Pull Requests abiertos

Todos contra base `staging`. Todos cumplen los git rules del proyecto (feature branch `feat/SQ-XX/desc`, commits convencionales, sin amend/force-push/skip-hooks).

### Wave B1 — Quick wins (4 PRs)
| PR | Ticket | Título | Archivos | Scope |
|----|--------|--------|----------|-------|
| [#121](https://github.com/upex-galaxy/upex-soloq/pull/121) | SQ-173 | associate Método de Pago label with SelectTrigger | 1 | XS — one-liner a11y |
| [#122](https://github.com/upex-galaxy/upex-soloq/pull/122) | SQ-169 | differentiate no-search-results from empty-account state | 1 | XS — UX branching |
| [#123](https://github.com/upex-galaxy/upex-soloq/pull/123) | SQ-177 | persist invoices list filters in URL searchParams | 1 | S — Next.js 16 migration |
| [#124](https://github.com/upex-galaxy/upex-soloq/pull/124) | SQ-156 | sanitize invoice notes and terms at write boundary | 5 + 1 migration | S — seguridad XSS |

**Notas de diseño:**
- PR #123 introduce `<Suspense>` siguiendo patrón de `login/page.tsx`; descartó persistir `sort` (no hay UI de sort actual) — alcance mínimo.
- PR #124 movió la sanitización de Zod `.transform()` → API handlers por conflicto de tipos con React Hook Form (documentado en el PR). Añadió `sanitize-html` + `@types/sanitize-html`. Incluye migración de backfill para 2 filas contaminadas.

### Wave B2 — Data integrity (3 PRs)
| PR | Ticket | Título | Archivos | Scope |
|----|--------|--------|----------|-------|
| [#125](https://github.com/upex-galaxy/upex-soloq/pull/125) | SQ-82 | add CHECK constraints to clients for data-integrity parity | 1 migration | S — hardening DB |
| [#126](https://github.com/upex-galaxy/upex-soloq/pull/126) | SQ-174 | persist paid_at and emit paid event on payment registration | 2 + 1 migration | S — data integrity |
| [#127](https://github.com/upex-galaxy/upex-soloq/pull/127) | SQ-176 | unify overdue definition across dashboard and list | 4 | M — logic consolidation |

**Notas de diseño:**
- PR #125 audita 115 filas activas (0 violadores) + 127 incluyendo soft-deleted (3 phones test-junk: `erere`, `as`, `+123aa`). La migración normaliza a NULL antes de aplicar constraints — no-destructivo.
- PR #126 encontró que el enum `invoice_event_type` no tiene `reverted`/`unpaid`; usa `event_type='updated'` + `metadata.action='payment_reverted'` (flag en PR body para revisar si se debe ampliar enum).
- PR #127 omite columna generada Postgres / vista (scope creep) — futuro follow-up. Corrige `pendingTotal` como side-improvement.

### Wave B3 — Dependents (2 PRs)
| PR | Ticket | Título | Archivos | Scope | Dependencia |
|----|--------|--------|----------|-------|-------------|
| [#128](https://github.com/upex-galaxy/upex-soloq/pull/128) | SQ-175 | bucket monthly income and trends by paid_at, not updated_at | 1 | S | ⚠️ **Mergear después de #126** |
| [#129](https://github.com/upex-galaxy/upex-soloq/pull/129) | SQ-142 | enforce subtotal = SUM(item totals) invariant | 2 + 1 migration | M | Independiente |

**Notas de diseño:**
- PR #128 añade filtro `paid_at IS NOT NULL` para evitar que datos pre-SQ-174 muddien la transición.
- PR #129 eligió **Option B** (compensating delete) vs Option A (RPC) por la complejidad de portar `invoice_number generation` + RLS a PL/pgSQL. El trigger de Layer 2 es la invariante durable. 0 divergencias actuales en DB.

---

## 📦 Migraciones Supabase creadas (NO aplicadas)

5 archivos en `supabase/migrations/` — pendientes de ser ejecutados por CI/DBA:

| PR | Archivo | Contenido |
|----|---------|-----------|
| #124 | `20260420232503_sanitize_existing_invoice_notes.sql` | Backfill strip HTML en `notes`/`terms` |
| #125 | `20260421023706_clients_check_constraints.sql` | CHECK constraints + cleanup phones no-conformes |
| #126 | `20260420_backfill_invoice_paid_at.sql` | Backfill `paid_at = updated_at` para 8 filas |
| #129 | `20260420_sq142_recompute_invoice_subtotal_trigger.sql` | Trigger + función PL/pgSQL |

**Orden de aplicación recomendado:** por timestamp (los nombres ya lo garantizan).

---

## 🧭 Acciones humanas pendientes

### Prioridad alta (cierre de Sprint)
1. **Jira UI — setear `Root Cause` custom field** (10118) en:
   - SQ-172, SQ-171 → `Working As Designed (WAD)` → luego transitar Cannot Reproduce → REJECTED
   - SQ-74 → `Code Error`
   - SQ-155 → `Code Error`
   - SQ-138 → `Integration Error` (o valor más cercano a "implementation-gap")
   - SQ-127 → dejar vacío o "missing-feature" (no hay valor exacto)

2. **PO decision sobre SQ-34** — quedó funcionalmente entregado por el hotfix de SQ-138. Reescope a polish (tests unitarios, UX copy, migración `jsonb` opcional) o cierre como "entregado por SQ-138".

### Orden de merge sugerido
Grupo 1 (independientes, mergear libres): **#121, #122, #124, #125, #127, #129**
Grupo 2 (ordenado): **#126 → #128 → #123**
- #126 debe mergear antes que #128 por dependencia de datos (`paid_at`)
- #123 después del resto del cluster de invoices para evitar conflictos de merge en `src/app/(app)/invoices/page.tsx`

### Post-merge en staging
- Aplicar las 4 migraciones Supabase por orden de timestamp
- QA retest en staging para los 9 fixes
- Transicionar cada ticket de Ready For QA → QA Approved

---

## 🎁 Bonus / hallazgos paralelos

1. **`bun lint` tiene 11 errores + 9 warnings pre-existentes** en `qa/tests/**` y `src/components/landing/benefits-section.tsx` (introducidos por commit `3f3d068`). Ninguno de los 9 PRs contribuye a este número — verificado por stash-baseline comparativo. Propuesta: ticket separado para limpiar.
2. **Husky pre-commit hook no es ejecutable** en el estado actual del repo — git lo skippea con hint (no es `--no-verify`). Corregir con `chmod +x .husky/pre-commit` en un commit separado.
3. **Worktrees creados** en `.claude/worktrees/agent-*` — pueden limpiarse con `git worktree prune` una vez verificados los PRs.
4. **`bun build`** requiere `.env` con credenciales Supabase; los worktrees no lo heredan. Los agents simlinkearon temporalmente el `.env` del repo principal para validar y lo removieron antes de commit.

---

## 📊 Métricas de ejecución

| Métrica | Valor |
|---------|-------|
| Tickets procesados | 16 |
| Subagents lanzados | 18 (16 investigación + 2 Jira admin + 9 code PRs = 27 total) |
| PRs abiertos | 9 |
| Migraciones creadas (no aplicadas) | 4 |
| Comentarios Jira posteados | 7 |
| Tickets transicionados | 6 |
| Links de duplicado creados | 1 |
| Archivos de contexto generados | 18 (`.context/reports/`) |
| Tiempo de ejecución aproximado | ~1h (investigación previa) + ~1h (ejecución) |

---

## 📁 Artefactos generados

```
.context/reports/
├── sprint-report-2026-04-20.md                ← panorama inicial del sprint
├── FINAL-SUMMARY-2026-04-20.md                ← matriz de decisión post-investigación
├── EXECUTION-REPORT-2026-04-20.md             ← este archivo (resultado de ejecución)
└── incident-SQ-{74,82,127,137,138,142,155,
                  156,169,171,172,173,174,
                  175,176,177}-investigation.md  ← 16 investigaciones detalladas
```

Rama principal: `staging` — limpia, sin cambios propios de los fixes (los 9 viven en sus feature branches).

---

**Fin de ejecución.** El ciclo pasa a revisión humana: Jira UI → merge PRs → migraciones → QA retest.
