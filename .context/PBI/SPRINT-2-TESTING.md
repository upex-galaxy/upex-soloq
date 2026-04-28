# Sprint 2 - In-Sprint Testing Tracker

> Purpose: track QA testing progress; provide AI context for resuming sessions.
> Sprint: 2 (id: 3) | QA: Ely | Started: 2026-03-02 | Last Updated: 2026-04-26 (initial generation)
> Sprint window: 2026-03-02 → 2026-03-30 (active, +27 días overrun a fecha de generación)

## Board Summary

| Status | Count | QA Relevant |
|--------|-------|-------------|
| Ready For QA | 33 | YES — Wave 1 (active testing queue) |
| In Test | 11 | YES — already mid-flight (Wave 1 — formal artifacts pending) |
| In Review | 4 | NO — devs reviewing (3 Bugs + 1 Improvement) |
| Open / Defects abiertos | 11 | NO — pending dev work |
| BLOCKED (Stories) | 2 | NO — dependency blocked |
| Ready For Dev | 1 | NO — pre-dev pipeline |
| Shift-Left QA | 3 | NO — QA design phase |
| Cannot Reproduce | 1 | NO — needs validation by reporter |
| Closed / QA Approved / Done | ~20 | NO — completed |
| Backlog | 12 | NO — not started |
| **Total Sprint 2 (foco)** | **~98** | |

> Source: `mcp__atlassian__jira_search` con JQL `project = SQ AND sprint = 3` filtrado por status. Status `Ready For QA` está OMITIDO en `.context/reports/sprint-report-2026-04-20.md` por filtro del report — este archivo es la referencia autoritativa para Wave 1.

---

## Testing Queue (Priority Order)

### Wave 1 - NOW IN READY FOR QA (2026-04-26)

> Queue priorizada para `/sprint-testing` batch. Orden: Critical bugs → Critical features → High → Medium → Low. Para single-ticket usar `continue-from <TICKET-ID>`.

| # | Ticket | Type | Title | Priority | Dev | Project | Platform | ATP | ATR | TCs | Status |
|---|--------|------|-------|----------|-----|---------|----------|-----|-----|-----|--------|
| 1  | SQ-168 | Bug         | InvoiceSending: No existe acción "Enviar factura" en listado/detalle | Highest | yxsinell acosta zambrano | invoice-sending | Web · API | - | - | - | PENDING |
| 2  | SQ-138 | Bug         | [SQ-32] Payment methods ausentes del PDF — API no incluye payment_methods en el response | High | Alfonso Hernandez | invoice-pdf | API · DB | - | - | - | PENDING |
| 3  | SQ-155 | Bug         | UserAuth: Rate-limited forgot-password flow expone mensaje específico | High | Maxe Aguilera | user-auth | Web · API | - | - | - | PENDING |
| 4  | SQ-156 | Defect      | Falta sanitización al persistir `notes` en invoices | High | Ximena Quintana | invoice-creation | API · DB | - | - | - | PENDING |
| 5  | SQ-82  | Defect      | CM \| SQ-16 — Edit client: unicidad email case-insensitive y validaciones DB parciales | High | Joel Armando Ramírez | client-management | API · DB | - | - | - | PENDING |
| 6  | SQ-126 | Improvement | Refactorización completa del preview de factura PDF con vista split en tiempo real | High | Ely | invoice-preview | Web | - | - | - | PENDING |
| 7  | SQ-142 | Bug         | [SQ-32] Subtotal almacenado ≠ suma de items — ghost subtotal en factura sin ítems | Medium | Alfonso Hernandez | invoice-pdf | DB · API | - | - | - | PENDING |
| 8  | SQ-124 | Bug         | Configuración Métodos de pago: no valida formato ni longitud de cuenta bancaria | Medium | Arkaitz | payment-methods | Web · API | - | - | - | PENDING |
| 9  | SQ-122 | Bug         | InvoiceCreation Draft Edit: sin advertencia al navegar con cambios no guardados | Medium | Luis Eduardo Flores | invoice-creation | Web | - | - | - | PENDING |
| 10 | SQ-177 | Defect      | [SQ-48] Filtro de estado no persiste en URL ni tras reload | Medium | Fernando Javier Masci | invoices-list | Web | - | - | - | PENDING |
| 11 | SQ-176 | Defect      | [SQ-50] Overdue aggregation y urgency ordering inconsistentes en invoices dashboard/list | Medium | Fernando Javier Masci | invoices-list | Web · API | - | - | - | PENDING |
| 12 | SQ-175 | Defect      | [SQ-52] Monthly summary semantics inconsistentes (paid_at mismatch + trend data) | Medium | Fernando Javier Masci | dashboard | API · DB | - | - | - | PENDING |
| 13 | SQ-174 | Defect      | [SQ-55] Factura queda `paid` con `paid_at` null y sin evento `paid` tras registrar pago | Medium | Fernando Javier Masci | record-payment | DB · API | - | - | - | PENDING |
| 14 | SQ-173 | Defect      | [SQ-55][A11y] Label "Método de Pago" no asociado correctamente en modal Registrar Pago | Medium | Fernando Javier Masci | record-payment | Web | - | - | - | PENDING |
| 15 | SQ-169 | Defect      | [SQ-51] En búsqueda sin resultados se muestra copy de cuenta vacía | Medium | Fernando Javier Masci | invoices-list | Web | - | - | - | PENDING |
| 16 | SQ-87  | Improvement | [SQ-24][DB] Agregar constraint para impedir tasas de impuesto negativas | Medium | Gloria Galindez | invoice-tax | DB · API | - | - | - | PENDING |
| 17 | SQ-8   | Story       | As a user, I want to configure my business name so that it appears on my invoices | Medium | Ely | business-profile | Web · API · DB | - | - | - | PENDING |
| 18 | SQ-9   | Story       | As a user, I want to upload my logo so that I can personalize my invoices | Medium | Ely | business-profile | Web · API · DB | - | - | - | PENDING |
| 19 | SQ-10  | Story       | As a user, I want to add my contact information so that my clients can contact me | Medium | Ely | business-profile | Web · API · DB | - | - | - | PENDING |
| 20 | SQ-11  | Story       | As a user, I want to configure my tax ID (RFC/NIT/CUIT) so that it appears on my invoices | Medium | Ely | business-profile | Web · API · DB | - | - | - | PENDING |
| 21 | SQ-12  | Story       | As a user, I want to configure my accepted payment methods so that my clients know how to pay me | Medium | Ely | payment-methods | Web · API · DB | - | - | - | PENDING |
| 22 | SQ-15  | Story       | List All Clients | Medium | Marco Antonio Camacho | client-management | Web · API | - | - | - | PENDING |
| 23 | SQ-17  | Story       | Add Client Tax Information | Medium | YENNY BARBOSA | client-management | Web · API · DB | - | - | - | PENDING |
| 24 | SQ-18  | Story       | View Client Invoice History | Medium | Rodrigo Godoy | client-management | Web · API | - | - | - | PENDING |
| 25 | SQ-19  | Story       | Delete Client | Medium | Ronny Toro | client-management | Web · API · DB | - | - | - | PENDING |
| 26 | SQ-21  | Story       | Create Invoice by Selecting Client | Medium | Ely | invoice-creation | Web · API · DB | - | - | - | PENDING |
| 27 | SQ-22  | Story       | Add Line Items to Invoice | Medium | Ely | invoice-creation | Web · API · DB | - | - | - | PENDING |
| 28 | SQ-26  | Story       | Preview Invoice Before Sending | Medium | Marianela Portas | invoice-preview | Web | - | - | - | PENDING |
| 29 | SQ-27  | Story       | Assign Unique Invoice Number | Medium | Froylan Rodriguez | invoice-numbering | API · DB | - | - | - | PENDING |
| 30 | SQ-29  | Story       | Add Notes and Terms to Invoice | Medium | Ximena Quintana | invoice-creation | Web · API · DB | - | - | - | PENDING |
| 31 | SQ-35  | Story       | Download PDF to Device | Medium | Dedwison | pdf-download | Web · API | - | - | - | PENDING |
| 32 | SQ-178 | Story       | 🚀 As a Pro user, I want to view my subscription payment history so that I have records for my accounting | Medium | Pedro Torres | subscription-history | Web · API · DB | - | - | - | PENDING |
| 33 | SQ-127 | Improvement | UserAuth: Signup: Add password visibility toggle | Low | Samuel Amonzabel | user-auth | Web | - | - | - | PENDING |

#### Wave 1 Notes

- **SQ-168 (Highest)**: bug funcional crítico — bloquea el flujo `Enviar factura` end-to-end. Validar tanto UI (botón/acción) como API endpoint y posibles regresiones en `InvoiceSending` epic.
- **SQ-138 / SQ-142 (SQ-32 PDF)**: ambos relacionados a la misma US (`SQ-32 Generate PDF`). Conviene testear en orden: primero SQ-138 (payment methods en API) y después SQ-142 (ghost subtotal) — comparten test data (facturas con/sin items, con/sin payment methods).
- **SQ-126 (Refactor preview PDF)**: alta prioridad y refactor extenso → smoke test obligatorio + regresión en flujo Crear/Editar/Preview/Send. Adyacencia con SQ-138 y SQ-142.
- **Cluster Fernando Masci (SQ-177, 176, 175, 174, 173, 169)**: 6 defects todos relacionados al dashboard / invoices-list / record-payment. Pueden testearse en una sola sesión por proximidad de módulos. Verificar fix de SQ-175 con commit `97d4e68` (paid_at bucket).
- **SQ-156**: defect de seguridad (sanitización XSS en notes). Trifuerza obligatoria: UI (input) → API (validación) → DB (datos persistidos).
- **SQ-82**: case-insensitive uniqueness — requiere validación de DB constraint + comportamiento UI/API ante duplicados con distinto casing.
- **Stories SQ-8 a SQ-19 (Setup + ClientManagement)**: la mayoría son de Ely y forman el "core onboarding" del producto. Testear en orden de dependencia: SQ-8 (business name) → SQ-9 (logo) → SQ-10 (contact) → SQ-11 (tax id) → SQ-12 (payment methods) → SQ-15 (list clients) → SQ-17/18/19 (CRUD).
- **SQ-178 (Subscription history)**: única Story Pro/premium en Wave 1. ATP y ATR ya existen como issues de Xray (SQ-179 Test Set + SQ-180 Test Execution) — verificar antes de duplicar.
- **SQ-127 (Low)**: tester puede dejarlo para el final del sprint, es UX simple (toggle).

#### Wave 1 Dependencies

- **SQ-138, SQ-142, SQ-126** todos relacionados a la US SQ-32 (Generate PDF). Si el smoke test de PDF falla en cualquiera, los otros dos quedan bloqueados.
- **SQ-21, SQ-22, SQ-29** corresponden a la creación de facturas — testear en orden ya que cada uno asume el anterior.
- **SQ-15, SQ-17, SQ-18, SQ-19** son CRUD de clientes — SQ-15 (list) es prerequisito visual para los otros tres.
- **Cluster Fernando Masci (Defects)** depende de las stories `In Test` SQ-47, SQ-48, SQ-50, SQ-51, SQ-52, SQ-55. Si esas stories cambian de status durante el sprint, validar que los defects sigan reproduciéndose.

---

### In Test - Currently being tested (no formal artifacts) — 11 stories

> Estado intermedio. Probablemente requieren ATP/ATR formales si no los tienen. Promover a Wave 1 si bloquean el flujo. Estos NO se procesan automáticamente por la skill — el orchestrator escanea PENDING.

| Ticket | Type  | Title (resumen) | Priority | Assignee |
|--------|-------|-----------------|----------|----------|
| SQ-47  | Story | Invoices Dashboard / List (parent de varios defects)         | Medium | Fernando J. Masci |
| SQ-48  | Story | Filter invoices by status (parent de SQ-177)                 | Medium | Fernando J. Masci |
| SQ-49  | Story | -                                                            | Medium | Fernando J. Masci |
| SQ-50  | Story | Overdue tracking (parent de SQ-176)                          | Medium | Fernando J. Masci |
| SQ-51  | Story | Search invoices (parent de SQ-169)                           | Medium | Fernando J. Masci |
| SQ-52  | Story | Monthly summary (parent de SQ-175)                           | Medium | Fernando J. Masci |
| SQ-53  | Story | -                                                            | Medium | Fernando J. Masci |
| SQ-4   | Story | UserAuth — secure login                                      | Medium | Maxe Aguilera |
| SQ-33  | Story | Send invoice via Email                                       | Medium | Arkaitz |
| SQ-30  | Story | Email send confirmation                                      | Medium | Luis E. Flores |
| SQ-6   | Story | UserAuth — Password recovery                                 | Medium | Juan Leites |

---

### Wave 2 - Pipeline (Dev Complete / In Review / Open)

#### In Review - Bugs + Improvements pendientes de merge (4)

| Ticket | Type        | Title (resumen) | Priority | Assignee |
|--------|-------------|-----------------|----------|----------|
| SQ-155 | Bug         | UserAuth — Rate-limited forgot-password (también listado en Wave 1 — verificar si avanzó a Ready For QA) | High   | Maxe Aguilera |
| SQ-138 | Bug         | SQ-32 Payment methods PDF (también en Wave 1)                       | High   | Ely / Alfonso |
| SQ-142 | Bug         | SQ-32 Ghost subtotal (también en Wave 1)                            | Medium | Ely / Alfonso |
| SQ-127 | Improvement | UserAuth password toggle (también en Wave 1)                        | Low    | Samuel Amonzabel |

> Nota: el reporte 2026-04-20 los marcaba `In Review` pero al 2026-04-26 ya están en `Ready For QA`.

#### Open - Defects abiertos (devs trabajando) — 11

> Solo informativo: NO se testean hasta que pasen a Ready For QA. Para visibilidad y tracking de cuándo entran al pipeline.

| Ticket | Priority | Assignee | Resumen |
|--------|----------|----------|---------|
| SQ-172 | Highest  | Ronny Toro | DC \| SQ-19 — Eliminación de cliente con facturas pagadas (status `REJECTED` actualizado) |
| SQ-74  | Highest  | Ely | UAO — Usuario no puede cerrar sesión tras varios refresh |
| SQ-171 | High     | Ronny Toro | DC \| SQ-19 — Eliminación de cliente con drafts deja facturas huérfanas (status `REJECTED`) |

> Para el listado completo de defects abiertos, ver `.context/reports/sprint-report-2026-04-20.md` (lines 31-48).

---

### Ready For Dev - Stories Pipeline (1)

| Ticket | Type  | Title | Priority | Assignee |
|--------|-------|-------|----------|----------|
| SQ-68  | Story | Validar entregabilidad de email de cliente antes de enviar factura | Medium | Alfonso Hernandez |

---

### BLOCKED — Stories detenidas (2)

| Ticket | Type  | Title | Priority | Assignee | Notas |
|--------|-------|-------|----------|----------|-------|
| SQ-55  | Story | Record amount received so I can verify against total invoiced | Medium | Ely | Defects SQ-173/174 dependen de esta US |
| SQ-43  | Story | Include PDF Attachment in Email                               | Medium | Ely | Bloquea pipeline de email send |

---

### Shift-Left QA - Stories en QA design (3)

| Ticket | Type  | Title | Priority | Assignee |
|--------|-------|-------|----------|----------|
| SQ-5   | Story | Secure Logout                  | High   | German Luchesi |
| SQ-46  | Story | View Email Send Confirmation   | Medium | Miguel Millan |
| SQ-34  | Story | Include Payment Methods in PDF | Medium | Arkaitz |

---

### Cannot Reproduce — Pendiente de validación (1)

| Ticket | Priority | Assignee | Resumen |
|--------|----------|----------|---------|
| SQ-137 | Highest | Rodrigo Godoy | Backend Endpoint Missing for Client Invoice History (404) — requiere documentar reproduction steps o cerrar `Rejected` |

---

### Backlog - 12 Stories (no testing yet)

> 11 de 12 sin assignee. Foco pendiente: épica de subscriptions / Pro reminders (SQ-59 a SQ-67) + email (SQ-42, SQ-45) + templates (SQ-36).

---

## Sprint 2 Stats

| Métrica | Valor |
|---------|-------|
| Total Sprint 2 Tickets (foco) | ~98 |
| Wave 1 — Ready For QA | 33 |
| Wave 1 Tested (PASSED) | 0/33 |
| Currently In Test | 11 |
| In Review (devs) | 4 |
| Open (Defects abiertos) | 11 |
| BLOCKED Stories | 2 |
| Ready For Dev | 1 |
| Shift-Left QA | 3 |
| Cannot Reproduce | 1 |
| Backlog | 12 |
| Carryovers from Sprint 1 | (no `previous_sprint_file` provided — skip detection) |
| Total Tested So Far | 0 |

### Wave 1 by Priority

| Priority | Count |
|----------|-------|
| Highest  | 1 (SQ-168) |
| High     | 5 (SQ-138, SQ-155, SQ-156, SQ-82, SQ-126) |
| Medium   | 26 |
| Low      | 1 (SQ-127) |
| **Total** | **33** |

### Wave 1 by Type

| Type        | Count |
|-------------|-------|
| Story       | 16 |
| Defect      | 8  |
| Bug         | 6  |
| Improvement | 3  |
| **Total**   | **33** |

### Wave 1 by Assignee (top contributors)

| Assignee | Tickets |
|----------|---------|
| Ely | 8 (mostly Setup stories SQ-8 a SQ-12, SQ-21, SQ-22, SQ-126) |
| Fernando Javier Masci | 6 (cluster defects dashboard/list/record-payment) |
| Alfonso Hernandez | 2 (SQ-138, SQ-142 — ambos PDF) |
| Otros | 17 distribuidos |

---

## Session Log

### 2026-04-26 - Sprint 2 Setup & Triage

- Queried Jira via `mcp__atlassian__jira_search` con JQL `project = SQ AND sprint = 3 AND status = "Ready For QA"` → 33 tickets identificados.
- Cross-referenced con `.context/reports/sprint-report-2026-04-20.md` que omitía explícitamente `Ready For QA` (filtro de PM/EM, no apto como input para `/sprint-testing`).
- Sprint 2 está en overrun: ventana 2026-03-02 → 2026-03-30, sigue activo a 2026-04-26 (+27 días).
- Distribución Wave 1: 1 Highest, 5 High, 26 Medium, 1 Low. Tipos: 16 Stories, 8 Defects, 6 Bugs, 3 Improvements.
- Ningún ticket asignado al QA (Ely) específicamente como tester — la asignación se hará en Stage 3 del workflow per ticket.
- Created SPRINT-2-TESTING.md tracker.
- **Next step (recomendado para single-ticket flow)**: invocar `/sprint-testing` con `sprint-file=.context/PBI/SPRINT-2-TESTING.md` y `continue-from=<TICKET-ID>` para arrancar con un ticket específico (ej. `SQ-168` por ser el único Highest).

---

## Notas para resumir sesión / continue-from

- El orchestrator escanea la columna **Status** en Wave 1 buscando `PENDING`. Para single-ticket usar `continue-from <TICKET-ID>`.
- Los estados válidos para `Status`: `PENDING`, `PASSED`, `FAILED`, `BLOCKED`, `DEFERRED`, `SKIPPED`.
- Las columnas **ATP / ATR / TCs** se inicializan en `-` y se llenan AFTER Stage 3 (Reporting) — el orchestrator hace el update.
- Para arrancar el flujo en una nueva sesión: abrir Claude Code en este directorio e invocar `/sprint-testing` indicando el sprint file. La skill detecta automáticamente el siguiente PENDING.

---

## Referencias

- **Reporte gerencial complementario**: `.context/reports/sprint-report-2026-04-20.md` (defects abiertos, BLOCKED, In Test, etc — no para Wave 1).
- **Skill workflow**: `.claude/skills/sprint-testing/SKILL.md` y `references/sprint-orchestration.md`.
- **PBI folder por ticket**: se creará en `.context/PBI/{module-name}/SQ-{N}-{brief-title}/` durante Session Start.
- **Project context (load on session start)**: `.context/business-data-map.md`, `.context/api-architecture.md`, `.context/project-test-guide.md`.
