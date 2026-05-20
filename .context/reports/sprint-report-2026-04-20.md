# Sprint Report - SQ

**Fecha:** 2026-04-20
**Sprint Activo:** SoloQ Sprint 2 (id: 3)
**Ventana:** 2026-03-02 → 2026-03-30
**Estado:** active (overrun: +21 días respecto al endDate)

## Filtros aplicados

- Proyecto: `SQ`
- Scope: `sprint in openSprints()`
- Omitidos: status `Ready For QA`
- Foco primario: **Bugs / Defects abiertos** + **Stories en Ready For Dev**
- Tipos excluidos del detalle (solo en totales): `Test`, `Test Plan`, `Test Set`, `Test Execution`, `Re-Test Execution`, `Precondition`, `Task`

---

## Alertas Críticas

| # | Señal | Detalle |
|---|-------|---------|
| 1 | Sprint en overrun | El sprint terminó el 2026-03-30 y sigue abierto a 2026-04-20 (+21 días) |
| 2 | Defects Highest sin assignee rotación | SQ-172 y SQ-74 llevan abiertos y son prioridad máxima |
| 3 | Pipeline de Dev casi vacío | Solo 1 US en Ready For Dev (SQ-68); el resto del dev-work son Defects abiertos |
| 4 | 2 Stories BLOCKED | SQ-55 y SQ-43 (ambas en Ely) detenidas |
| 5 | Carga concentrada | Fernando Masci: 6 defects abiertos · Ely: 3 defects + 2 bugs In Review + 2 stories BLOCKED |
| 6 | Bug Highest "Cannot Reproduce" | SQ-137 (Rodrigo Godoy) — requiere validación antes de cerrar |

---

## 🔴 Defects — Open (11)

Todos son Defects de validación de US. Orden: prioridad DESC.

| Key | Priority | Assignee | Summary |
|-----|----------|----------|---------|
| SQ-172 | Highest | Ronny Toro | DC \| SQ-19 — Eliminación de cliente con facturas pagadas rompe trazabilidad contable |
| SQ-74  | Highest | Ely | UAO — Usuario no puede cerrar sesión tras varios refresh |
| SQ-171 | High    | Ronny Toro | DC \| SQ-19 — Eliminación de cliente con drafts deja facturas huérfanas (client_id NULL) |
| SQ-156 | High    | Ely | Falta sanitización al persistir `notes` en invoices |
| SQ-82  | High    | Ely | CM \| SQ-16 — Edit client: unicidad email case-insensitive y validaciones DB parciales |
| SQ-177 | Medium  | Fernando Masci | SQ-48 — Filtro de estado no persiste en URL ni tras reload |
| SQ-176 | Medium  | Fernando Masci | SQ-50 — Overdue aggregation y urgency ordering inconsistentes |
| SQ-175 | Medium  | Fernando Masci | SQ-52 — Monthly summary semantics inconsistentes (paid_at mismatch) |
| SQ-174 | Medium  | Fernando Masci | SQ-55 — Factura queda `paid` con `paid_at` null y sin evento |
| SQ-173 | Medium  | Fernando Masci | SQ-55 — A11y: label "Método de Pago" mal asociado en modal |
| SQ-169 | Medium  | Fernando Masci | SQ-51 — Copy de cuenta vacía en búsqueda sin resultados |

## 🐛 Bugs — In Review (3)

| Key | Priority | Assignee | Summary |
|-----|----------|----------|---------|
| SQ-155 | High   | Maxe Aguilera | UserAuth — Rate-limited forgot-password expone mensaje específico |
| SQ-138 | High   | Ely           | SQ-32 — Payment methods ausentes del PDF (API no los incluye) |
| SQ-142 | Medium | Ely           | SQ-32 — Subtotal almacenado ≠ suma de ítems (ghost subtotal) |

## 💡 Improvements — In Review (1)

| Key | Priority | Assignee | Summary |
|-----|----------|----------|---------|
| SQ-127 | Low | Samuel Amonzabel | UserAuth — Add password visibility toggle en Signup |

## 🐛 Bug — Cannot Reproduce (1, revisar)

| Key | Priority | Assignee | Summary |
|-----|----------|----------|---------|
| SQ-137 | Highest | Rodrigo Godoy | Backend endpoint missing for Client Invoice History (404) |

---

## 📗 Stories — Ready For Dev (1)

| Key | Priority | Assignee | Summary |
|-----|----------|----------|---------|
| SQ-68 | Medium | Alfonso Hernandez | Validar entregabilidad de email de cliente antes de enviar factura |

> **Hallazgo:** pipeline de desarrollo casi vacío. Si se cierran los defects actuales no hay historias preparadas para que los devs tomen de inmediato.

## 🔴 Stories — BLOCKED (2)

| Key | Priority | Assignee | Summary |
|-----|----------|----------|---------|
| SQ-55 | Medium | Ely | Record amount received so I can verify against total invoiced |
| SQ-43 | Medium | Ely | Include PDF Attachment in Email |

---

## Contexto adicional (no foco, informativo)

### 🟣 Shift-Left QA (3)

| Key | Priority | Assignee | Summary |
|-----|----------|----------|---------|
| SQ-5  | High   | German Luchesi | Secure Logout |
| SQ-46 | Medium | Miguel Millan  | View Email Send Confirmation |
| SQ-34 | Medium | Arkaitz        | Include Payment Methods in PDF |

### 🟠 Stories In Test (11)

Predominantemente en Fernando Masci (dashboard/list): SQ-47, SQ-48, SQ-49, SQ-50, SQ-51, SQ-52, SQ-53. Resto: SQ-4 (Maxe), SQ-33/SQ-30 (Arkaitz / Luis Flores), SQ-6 (Juan Leites).

### 📦 Backlog (12 Stories)

11 de 12 sin assignee. Foco pendiente: épica de subscripciones / reminders Pro (SQ-59 a SQ-67) + email (SQ-42, SQ-45) + templates (SQ-36).

---

## 📊 Resumen por Status (foco del reporte)

| Status | Stories | Bugs | Defects | Improvements | Total |
|--------|---------|------|---------|--------------|-------|
| BLOCKED         | 2  | 0 | 0  | 0 | 2  |
| Ready For Dev   | 1  | 0 | 0  | 0 | 1  |
| Shift-Left QA   | 3  | 0 | 0  | 0 | 3  |
| In Test         | 11 | 0 | 0  | 0 | 11 |
| In Review       | 0  | 3 | 0  | 1 | 4  |
| Open (Defects)  | 0  | 0 | 11 | 0 | 11 |
| Cannot Reproduce| 0  | 1 | 0  | 0 | 1  |
| Backlog         | 12 | 0 | 0  | 0 | 12 |
| **Total foco**  | **29** | **4** | **11** | **1** | **45** |

> `Ready For QA` omitido por filtro. `QA Approved` (7 stories, 2 defects) y `Closed` (11 bugs, 2 defects) también se dejan fuera del detalle.

## 📈 Métricas clave

| Métrica | Valor |
|---------|-------|
| 🔴 Defects abiertos | **11** (2 Highest, 3 High, 6 Medium) |
| 🐛 Bugs en review | 3 |
| 🔴 Stories BLOCKED | 2 |
| 📗 Stories Ready For Dev | **1** ⚠️ pipeline bajo |
| 🟣 Shift-Left QA pending | 3 |
| 🟠 In Test | 11 |
| Assignees con mayor carga (Defects+Bugs abiertos/review) | Fernando Masci (6), Ely (5), Ronny Toro (2) |

---

## Recomendaciones (según reglas del prompt)

1. **Defects > features:** 11 defects abiertos (> umbral de 5); priorizar cierre antes de iniciar SQ-68.
2. **Desbloquear Ely:** tiene 5 ítems activos + 2 stories BLOCKED; revisar dependencias antes de asignarle más.
3. **Rellenar Ready For Dev:** promover al menos 2-3 stories del Backlog a Shift-Left QA → Ready For Dev para no quedar sin pipeline.
4. **Cerrar el sprint:** está 21 días overrun; decidir si se cierra formalmente y se abre Sprint 3, o se extiende con un objetivo ajustado.
5. **Validar SQ-137:** si es Cannot Reproduce pero Highest, documentar reproduction steps o cerrar con `Rejected`.

---

**Generado con:** `acli jira workitem search` sobre sprint activo `SoloQ Sprint 2`.
**Fuente:** upexgalaxy67.atlassian.net · proyecto `SQ` · 2026-04-20.
