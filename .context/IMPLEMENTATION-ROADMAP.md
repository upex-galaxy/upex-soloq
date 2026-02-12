# Implementation Roadmap - SoloQ

> **Documento provisional** - Generado: 2026-02-07
> **Proposito:** Panorama completo del estado actual y plan de implementacion ordenado por dependencias.

---

## Instrucciones para Continuar (Contexto IA)

**Para retomar el desarrollo en un nuevo chat:**

1. **Workflow a seguir:** `.prompts/us-dev-workflow.md` (12 pasos)
2. **Test Cases:** Buscar primero en **comentarios de Jira** de la US (Acceptance Test Plan del QA)
3. **Siguiente tarea:** Ver sección "US en Trabajo Actual" abajo
4. **Si la US actual esta completa:** Tomar la siguiente de "Lista Estratégica de Implementación"

**Comando sugerido para iniciar:**

```
Continúa con el IMPLEMENTATION-ROADMAP.md siguiendo .prompts/us-dev-workflow.md
```

---

## Criterios de Transición de Estados

### User Stories

| Estado        | Requisito PR Shift-Left | Requisito PR Impl | Asignado a          |
| ------------- | ----------------------- | ----------------- | ------------------- |
| Ready For Dev | MERGED (o N/A)          | NO debe existir   | Ely (Dev)           |
| In Progress   | MERGED (o N/A)          | OPEN              | Ely (Dev)           |
| Ready For QA  | MERGED (o N/A)          | MERGED            | Tester (Shift-Left) |
| In Test       | MERGED (o N/A)          | MERGED            | Tester (QA)         |
| BLOCKED       | MERGED (o N/A)          | MERGED            | Dev (para fix)      |

### Defects/Bugs

| Estado       | Significado            | PR Fix    |
| ------------ | ---------------------- | --------- |
| OPEN         | Bug reportado, sin fix | NO existe |
| In Progress  | Fixing                 | OPEN      |
| In Review    | PR abierto             | OPEN      |
| Ready For QA | Fixeado y desplegado   | MERGED    |

---

## Auditoría de Assignees (2026-02-11) ✅ COMPLETADA

### Criterios de Asignación

| Status        | Debe estar asignado a         |
| ------------- | ----------------------------- |
| Ready For Dev | Ely (único desarrollador)     |
| In Progress   | Ely (único desarrollador)     |
| Ready For QA  | Tester que hizo Shift-Left    |
| In Test       | Tester de QA                  |
| Estimation    | Tester (status de transición) |
| Shift-Left QA | Tester (status de transición) |

### ✅ Correcciones Aplicadas

| Key   | Summary                         | Assignee Anterior | Assignee Corregido               | Método de Identificación             |
| ----- | ------------------------------- | ----------------- | -------------------------------- | ------------------------------------ |
| SQ-15 | List All Clients                | Ely ❌            | Marco Antonio Camacho ✅         | Changelog: participó en transiciones |
| SQ-24 | Add Taxes to Invoice            | Ely ❌            | Gloria Jesely Galindez Suárez ✅ | Changelog: participó en Shift-Left   |
| SQ-43 | Include PDF Attachment in Email | Ely ❌            | yxsinell acosta zambrano ✅      | Changelog: hizo Shift-Left           |
| SQ-34 | Include Payment Methods in PDF  | Sin asignar ❌    | Arkaitz ✅                       | Changelog: status anterior           |

### ⚠️ Caso Especial: SQ-21

| Key   | Summary                            | Assignee | Razón                                                  |
| ----- | ---------------------------------- | -------- | ------------------------------------------------------ |
| SQ-21 | Create Invoice by Selecting Client | Ely ✅   | Changelog muestra que Ely hizo todo (dev + Shift-Left) |

### ✅ Ready For QA con Assignee Correcto

| Key   | Summary                           | Assignee             | PR Shift-Left |
| ----- | --------------------------------- | -------------------- | ------------- |
| SQ-2  | User Registration                 | Samuel Amonzabel ✅  | #5 (MERGED)   |
| SQ-17 | Add Client Tax Information        | YENNY BARBOSA ✅     | N/A           |
| SQ-19 | Delete Client                     | Ronny Toro ✅        | N/A           |
| SQ-28 | Set Invoice Due Date              | Yaneth Quintero ✅   | #10 (MERGED)  |
| SQ-29 | Add Notes and Terms to Invoice    | Ximena Quintana ✅   | #17 (MERGED)  |
| SQ-32 | Generate Professional PDF Invoice | Alfonso Hernandez ✅ | #8 (MERGED)   |
| SQ-33 | Include Logo and Business Data    | Arkaitz ✅           | N/A           |
| SQ-35 | Download PDF to Device            | Dedwison ✅          | #18 (MERGED)  |

---

## Estado Actual del Tablero Jira

### Epic: SQ-13 - Client Management

| Key   | Story                                | Status        | Priority | Assignee              | PR Shift-Left | PR Impl      |
| ----- | ------------------------------------ | ------------- | -------- | --------------------- | ------------- | ------------ |
| SQ-14 | Add New Client                       | In Test       | Medium   | Ely                   | -             | #21 (MERGED) |
| SQ-15 | List All Clients                     | Ready For QA  | Medium   | Marco Antonio Camacho | #2 (MERGED)   | #25 (MERGED) |
| SQ-16 | Edit Client Data                     | **In Test**   | Medium   | Ely                   | #14 (MERGED)  | #26 (MERGED) |
| SQ-17 | Add Client Tax Information           | Ready For QA  | Medium   | YENNY BARBOSA         | -             | #27 (MERGED) |
| SQ-18 | View Client Invoice History          | Ready For Dev | Medium   | Ely                   | #43 (MERGED)  | -            |
| SQ-19 | Delete Client                        | Ready For QA  | Medium   | Ronny Toro            | -             | #28 (MERGED) |
| SQ-68 | Validate client email deliverability | Backlog       | Medium   | -                     | -             | -            |

### Epic: SQ-20 - Invoice Creation

| Key   | Story                                    | Status        | Priority | Assignee                      | PR Shift-Left | PR Impl      |
| ----- | ---------------------------------------- | ------------- | -------- | ----------------------------- | ------------- | ------------ |
| SQ-21 | Create Invoice by Selecting Client       | Ready For QA  | Medium   | Ely                           | #19 (MERGED)  | #29 (MERGED) |
| SQ-22 | Add Line Items to Invoice                | Backlog       | Medium   | Carlos Arevalo                | -             | -            |
| SQ-23 | Automatic Subtotal and Total Calculation | Estimation    | Medium   | Raúl González                 | #16 (MERGED)  | -            |
| SQ-24 | Add Taxes to Invoice                     | Ready For QA  | Medium   | Gloria Jesely Galindez Suárez | #9 (MERGED)   | #32 (MERGED) |
| SQ-25 | Add Discounts to Invoice                 | Ready For Dev | Medium   | Ely                           | #24 (MERGED)  | -            |
| SQ-26 | Preview Invoice Before Sending           | Estimation    | Medium   | Marianela Portas              | #15 (MERGED)  | -            |
| SQ-27 | Assign Unique Invoice Number             | Ready For QA  | Medium   | Ely                           | #13 (MERGED)  | #46 (MERGED) |
| SQ-28 | Set Invoice Due Date                     | Ready For QA  | Medium   | Yaneth Quintero               | #10 (MERGED)  | #33 (MERGED) |
| SQ-29 | Add Notes and Terms to Invoice           | Ready For QA  | Medium   | Ximena Quintana               | #17 (MERGED)  | #34 (MERGED) |
| SQ-30 | Save Invoice as Draft                    | In Progress   | Medium   | Ely                           | #30 (MERGED)  | #49 (OPEN)   |

### Epic: SQ-1 - User Authentication & Onboarding

| Key  | Story                                     | Status           | Priority | Assignee        | PR Shift-Left | PR Impl |
| ---- | ----------------------------------------- | ---------------- | -------- | --------------- | ------------- | ------- |
| SQ-2 | User Registration with Email and Password | **Ready For QA** | Highest  | Samuel Amonzabe | #5 (MERGED)   | -       |
| SQ-3 | User Login with Credentials               | **In Test**      | Highest  | Ely             | #4 (MERGED)   | -       |
| SQ-4 | Password Recovery via Email               | Ready For Dev    | High     | Ely             | #12 (MERGED)  | -       |
| SQ-5 | Secure Logout                             | Shift-Left QA    | High     | German Luchesi  | -             | -       |

### Epic: SQ-31 - PDF Generation & Download

| Key   | Story                                 | Status        | Priority | Assignee          | PR Shift-Left | PR Impl      |
| ----- | ------------------------------------- | ------------- | -------- | ----------------- | ------------- | ------------ |
| SQ-32 | Generate Professional PDF Invoice     | Ready For QA  | Medium   | Alfonso Hernandez | #8 (MERGED)   | #35 (MERGED) |
| SQ-33 | Include Logo and Business Data in PDF | Ready For QA  | Medium   | Arkaitz           | -             | #36 (MERGED) |
| SQ-34 | Include Payment Methods in PDF        | Shift-Left QA | Medium   | Arkaitz           | -             | -            |
| SQ-35 | Download PDF to Device                | Ready For QA  | Medium   | Dedwison          | #18 (MERGED)  | #37 (MERGED) |

### Epic: SQ-37 - Invoice Sending

| Key   | Story                              | Status        | Priority | Assignee                 | PR Shift-Left | PR Impl |
| ----- | ---------------------------------- | ------------- | -------- | ------------------------ | ------------- | ------- |
| SQ-42 | Send Invoice by Email with 1 Click | Shift-Left QA | Medium   | Marian Sánchez           | #39 (OPEN)    | -       |
| SQ-43 | Include PDF Attachment in Email    | Estimation    | Medium   | yxsinell acosta zambrano | #40 (OPEN)    | -       |
| SQ-46 | View Email Send Confirmation       | Shift-Left QA | Medium   | Miguel Millan            | -             | -       |

---

## Analisis de Dependencias

```
SQ-1 (Auth Epic)
├── SQ-3: User Login ────────────────────┐
│                                        │ Prerequisito para todo
└────────────────────────────────────────┘

SQ-13 (Client Management Epic)
├── SQ-14: Add New Client ─────────────── YA IMPLEMENTADO (In Test)
│   │
│   ├── SQ-15: List All Clients ──────── Depende de SQ-14
│   │   │
│   │   ├── SQ-16: Edit Client Data ──── Depende de SQ-15
│   │   │   │
│   │   │   └── SQ-17: Add Client Tax ── Depende de SQ-16
│   │   │
│   │   └── SQ-19: Delete Client ─────── Depende de SQ-15
│   │
│   └── SQ-18: View Client History ────── Depende de SQ-15 + Invoices

SQ-20 (Invoice Creation Epic)
├── SQ-21: Create Invoice by Client ───── Depende de SQ-13 (Client Management)
│   │
│   ├── SQ-24: Add Taxes ─────────────── Depende de SQ-21
│   ├── SQ-28: Set Due Date ──────────── Depende de SQ-21
│   └── SQ-29: Add Notes/Terms ────────── Depende de SQ-21

SQ-31 (PDF Generation Epic)
├── SQ-32: Generate PDF ───────────────── Depende de SQ-20 (tener invoices)
│   │
│   ├── SQ-33: Include Logo/Data ──────── Depende de SQ-32
│   └── SQ-35: Download PDF ───────────── Depende de SQ-32
```

---

## Lista Estrategica de Implementacion

### FASE 1: Client Management ✅ COMPLETADA

| Orden | Key   | Story                      | Status       | Assignee              | PR Shift-Left | PR Impl      |
| ----- | ----- | -------------------------- | ------------ | --------------------- | ------------- | ------------ |
| 1     | SQ-15 | List All Clients           | Ready For QA | Marco Antonio Camacho | #2 (MERGED)   | #25 (MERGED) |
| 2     | SQ-16 | Edit Client Data           | **In Test**  | Ely                   | #14 (MERGED)  | #26 (MERGED) |
| 3     | SQ-17 | Add Client Tax Information | Ready For QA | YENNY BARBOSA         | -             | #27 (MERGED) |
| 4     | SQ-19 | Delete Client              | Ready For QA | Ronny Toro            | -             | #28 (MERGED) |

**Nota:** SQ-18 (View Client Invoice History) esta en Shift-Left QA y ademas depende de tener facturas.

### FASE 2: Invoice Creation ✅ COMPLETADA

| Orden | Key   | Story                              | Status       | Assignee                      | PR Shift-Left | PR Impl      |
| ----- | ----- | ---------------------------------- | ------------ | ----------------------------- | ------------- | ------------ |
| 5     | SQ-21 | Create Invoice by Selecting Client | Ready For QA | Ely                           | #19 (MERGED)  | #29 (MERGED) |
| 6     | SQ-24 | Add Taxes to Invoice               | Ready For QA | Gloria Jesely Galindez Suárez | #9 (MERGED)   | #32 (MERGED) |
| 7     | SQ-28 | Set Invoice Due Date               | Ready For QA | Yaneth Quintero               | #10 (MERGED)  | #33 (MERGED) |
| 8     | SQ-29 | Add Notes and Terms to Invoice     | Ready For QA | Ximena Quintana               | #17 (MERGED)  | #34 (MERGED) |

**Nota:** SQ-22, SQ-23, SQ-25, SQ-26, SQ-27, SQ-30 no estan en Ready For Dev.

### FASE 3: PDF Generation 🔶 EN PROGRESO (3/4)

| Orden | Key   | Story                             | Status        | Assignee          | PR Shift-Left | PR Impl      |
| ----- | ----- | --------------------------------- | ------------- | ----------------- | ------------- | ------------ |
| 9     | SQ-32 | Generate Professional PDF Invoice | Ready For QA  | Alfonso Hernandez | #8 (MERGED)   | #35 (MERGED) |
| 10    | SQ-33 | Include Logo and Business Data    | Ready For QA  | Arkaitz           | -             | #36 (MERGED) |
| 11    | SQ-35 | Download PDF to Device            | Ready For QA  | Dedwison          | #18 (MERGED)  | #37 (MERGED) |
| 12    | SQ-34 | Include Payment Methods in PDF    | Shift-Left QA | Arkaitz           | -             | ⏳ BLOQUEADA |

### FASE 4: Invoice Creation Avanzado 🔶 EN PROGRESO (1/6)

| Orden | Key   | Story                       | Status        | Assignee | PR Shift-Left | PR Impl      |
| ----- | ----- | --------------------------- | ------------- | -------- | ------------- | ------------ |
| 13    | SQ-27 | Assign Unique Invoice No.   | Ready For QA  | Ely      | #13 (MERGED)  | #46 (MERGED) |
| 14    | SQ-30 | Save Invoice as Draft       | In Progress   | Ely      | #30 (MERGED)  | #49 (OPEN)   |
| 15    | SQ-4  | Password Recovery via Email | Ready For Dev | Ely      | #12 (MERGED)  | -            |
| 16    | SQ-25 | Add Discounts to Invoice    | Ready For Dev | Ely      | #24 (MERGED)  | -            |
| 17    | SQ-18 | View Client Invoice History | Ready For Dev | Ely      | #43 (MERGED)  | -            |

### OMITIDAS (No Ready For Dev o Dependencias Bloqueadas)

| Key   | Story                  | Status        | Assignee         | Razon de Omision                         |
| ----- | ---------------------- | ------------- | ---------------- | ---------------------------------------- |
| SQ-2  | User Registration      | Ready For QA  | Samuel Amonzabel | Implementado - gaps documentados en Jira |
| SQ-3  | User Login             | In Test       | Ely              | Implementado - en testing                |
| SQ-22 | Add Line Items         | Backlog       | Carlos Arevalo   | No Ready For Dev                         |
| SQ-23 | Auto Calculation       | Estimation    | Raúl González    | No Ready For Dev                         |
| SQ-26 | Preview Invoice        | Estimation    | Marianela Portas | No Ready For Dev                         |
| SQ-34 | Payment Methods in PDF | Shift-Left QA | Arkaitz          | No Ready For Dev                         |

---

## Resumen Ejecutivo

### User Stories Implementadas

```
FASE 1 - Client Management ✅ COMPLETADA
  1. SQ-15: List All Clients ✅
  2. SQ-16: Edit Client Data ✅ (In Test)
  3. SQ-17: Add Client Tax Information ✅
  4. SQ-19: Delete Client ✅

FASE 2 - Invoice Creation ✅ COMPLETADA
  5. SQ-21: Create Invoice by Selecting Client ✅
  6. SQ-24: Add Taxes to Invoice ✅
  7. SQ-28: Set Invoice Due Date ✅
  8. SQ-29: Add Notes and Terms to Invoice ✅

FASE 3 - PDF Generation 🔶 EN PROGRESO (3/4)
  9.  SQ-32: Generate Professional PDF Invoice ✅
  10. SQ-33: Include Logo and Business Data in PDF ✅
  11. SQ-35: Download PDF to Device ✅
  12. SQ-34: Include Payment Methods in PDF ⏳ (BLOQUEADA)
```

### Metricas

- **Total US implementadas:** 14/14 del roadmap (incluye Auth + SQ-27)
- **US en Ready For QA:** 12 (listas para testing, incluye SQ-27)
- **US en In Test:** 3 (SQ-3, SQ-14, SQ-16)
- **US bloqueadas (Shift-Left QA):** 1 (SQ-34)
- **US en In Progress:** 1 (SQ-30 - PR #49 OPEN)
- **US en Ready For Dev:** 4 (SQ-4, SQ-18, SQ-25)

---

## Tracking de Progreso

### US Completada: SQ-15 - List All Clients ✅

| Paso | Estado     | Notas                       |
| ---- | ---------- | --------------------------- |
| 0-11 | Completado | PR #25 MERGED, Ready For QA |

---

### US Completada: SQ-16 - Edit Client Data ✅

| Paso | Estado     | Notas                            |
| ---- | ---------- | -------------------------------- |
| 0-11 | Completado | PR #26 MERGED, In Test (re-test) |

---

### US Completada: SQ-17 - Add Client Tax Information ✅

| Paso | Estado     | Notas                       |
| ---- | ---------- | --------------------------- |
| 0-11 | Completado | PR #27 MERGED, Ready For QA |

---

### US Completada: SQ-19 - Delete Client ✅

| Paso | Estado     | Notas                       |
| ---- | ---------- | --------------------------- |
| 0-11 | Completado | PR #28 MERGED, Ready For QA |

---

### 🎉 FASE 1 COMPLETADA - Client Management

Todas las US de FASE 1 implementadas:

- SQ-15: List All Clients ✅
- SQ-16: Edit Client Data ✅ (In Test)
- SQ-17: Add Client Tax Information ✅
- SQ-19: Delete Client ✅

---

### US Completada: SQ-21 - Create Invoice by Selecting Client ✅

| Paso | Estado     | Notas                       |
| ---- | ---------- | --------------------------- |
| 0-11 | Completado | PR #29 MERGED, Ready For QA |

---

### 🎉 FASE 2 COMPLETADA - Invoice Creation

Todas las US de FASE 2 implementadas:

- SQ-21: Create Invoice by Selecting Client ✅ (PR #29)
- SQ-24: Add Taxes to Invoice ✅ (PR #32)
- SQ-28: Set Invoice Due Date ✅ (PR #33)
- SQ-29: Add Notes and Terms to Invoice ✅ (PR #34)

---

### US Completada: SQ-32 - Generate Professional PDF Invoice ✅

| Paso | Estado     | Notas                       |
| ---- | ---------- | --------------------------- |
| 0-11 | Completado | PR #35 MERGED, Ready For QA |

---

### US Completada: SQ-33 - Include Logo and Business Data in PDF ✅

| Paso | Estado     | Notas                       |
| ---- | ---------- | --------------------------- |
| 0-11 | Completado | PR #36 MERGED, Ready For QA |

---

### US Completada: SQ-35 - Download PDF to Device ✅

| Paso | Estado     | Notas                       |
| ---- | ---------- | --------------------------- |
| 0-11 | Completado | PR #37 MERGED, Ready For QA |

---

### 🎉 FASE 3 EN PROGRESO - PDF Generation (3/4)

US de FASE 3 implementadas:

- SQ-32: Generate Professional PDF Invoice ✅ (PR #35)
- SQ-33: Include Logo and Business Data in PDF ✅ (PR #36)
- SQ-35: Download PDF to Device ✅ (PR #37)
- SQ-34: Include Payment Methods in PDF ⏳ (Shift-Left QA - BLOQUEADA)

---

### US Completada: SQ-27 - Assign Unique Invoice Number ✅

| Paso | Estado     | Notas                                               |
| ---- | ---------- | --------------------------------------------------- |
| 0    | Completado | Precondiciones verificadas                          |
| 1    | Completado | Jira transitado a In Progress                       |
| 2    | Completado | Plan de implementación creado                       |
| 3    | Completado | 7 steps implementados (API, hooks, component, form) |
| 4    | Completado | PR #46 creado                                       |
| 5    | N/A        | E2E/UI testing por usuario                          |
| 6    | Completado | Code review (self)                                  |
| 7    | Completado | Documentación actualizada                           |
| 8    | Completado | **PR #46 MERGED** ✅                                |
| 9-11 | Completado | Ready For QA                                        |

---

### US En Progreso: SQ-30 - Save Invoice as Draft 🔶

| Paso | Estado     | Notas                                       |
| ---- | ---------- | ------------------------------------------- |
| 0    | Completado | Precondiciones verificadas                  |
| 1    | Completado | Jira transitado a In Progress               |
| 2    | Completado | Plan de implementación creado               |
| 3    | Completado | Implementación completa (API, hooks, pages) |
| 4    | Completado | PR #49 creado                               |
| 5    | N/A        | E2E/UI testing por usuario                  |
| 6    | Completado | Code review (self)                          |
| 7    | Completado | Documentación actualizada                   |
| 8    | Pendiente  | PR #49 pendiente de merge                   |
| 9-11 | Pendiente  | Verificar transición y sincronizar          |

**Implementación incluye:**

- API: GET /api/invoices, PUT /api/invoices/[id], DELETE /api/invoices/[id]
- Hooks: useInvoices, useUpdateInvoice, useDeleteInvoice, useAutoSave
- Componentes: InvoiceStatusBadge, InvoiceNumberInput (updated)
- Pages: /invoices (list con filtros), /invoices/[id]/edit (auto-save)

---

### 🎉 FASE 4 EN PROGRESO - Invoice Creation Avanzado (2/5)

US de FASE 4 implementadas:

- SQ-27: Assign Unique Invoice Number ✅ (PR #46)
- SQ-30: Save Invoice as Draft 🔶 (PR #49 - OPEN)
- SQ-4: Password Recovery via Email ⏳ (Ready For Dev)
- SQ-25: Add Discounts to Invoice ⏳ (Ready For Dev)
- SQ-18: View Client Invoice History ⏳ (Ready For Dev)

**Próximas US en Ready For Dev (4 disponibles):**

1. **SQ-4** - Password Recovery via Email (Ely) - Auth
2. **SQ-25** - Add Discounts to Invoice (Ely) - Invoice Creation
3. **SQ-18** - View Client Invoice History (Ely) - Client Management

---

## PRs Pendientes de Revisión

> **Nota:** Todos los PRs abiertos son de documentación/Shift-Left QA (solo modifican `.context/`)

| PR # | Rama                          | Estado | US    | Autor        | Archivos                      |
| ---- | ----------------------------- | ------ | ----- | ------------ | ----------------------------- |
| #40  | test/SQ-43/include-pdf-attach | OPEN   | SQ-43 | yxsinell     | Solo .context/ (test plan)    |
| #39  | feat/SQ-37/feature-test-plan  | OPEN   | SQ-37 | yxsinell     | Solo .context/ (feature plan) |
| #38  | feature/add-new-client        | OPEN   | SQ-14 | MiguelMillan | Solo .context/ (docs update)  |

---

## Bloqueos por Defects

> **Ver:** [BUGFIX-ROADMAP.md](./BUGFIX-ROADMAP.md) para tracking completo de bugs

### User Stories Anteriormente Bloqueadas (RESUELTAS)

| Story | Summary          | Defect | Estado Defect | Estado US   | PR Fix       |
| ----- | ---------------- | ------ | ------------- | ----------- | ------------ |
| SQ-3  | User Login       | SQ-74  | Ready For QA  | **In Test** | #41 (MERGED) |
| SQ-16 | Edit Client Data | SQ-71  | Ready For QA  | **In Test** | #41 (MERGED) |

**Nota:** Los fixes ya están mergeados y las US fueron movidas a In Test para re-testing.

---

_Actualizado por Claude Code - 2026-02-12 (SQ-30: PR #49 creado - Save Invoice as Draft en progreso)_
