# Implementation Roadmap - SoloQ

> **Documento provisional** - Generado: 2026-02-07 | **Ultima actualizacion:** 2026-03-31
> **Proposito:** Panorama completo del estado actual y plan de implementacion ordenado por dependencias.

---

## Instrucciones para Continuar (Contexto IA)

**Para retomar el desarrollo en un nuevo chat:**

1. **Leer progreso:** `.context/FIX-SESSION-PROGRESS.md` (tracking local git-ignored)
2. **Workflow a seguir:** `.prompts/us-dev-workflow.md` (12 pasos)
3. **Test Cases:** Buscar primero en **comentarios de Jira** de la US (Acceptance Test Plan del QA)
4. **Siguiente tarea:** Ver seccion "US en Trabajo Actual" abajo
5. **Si la US actual esta completa:** Tomar la siguiente de "Lista Estrategica de Implementacion"

**Comando sugerido para iniciar:**

```
Continua con el IMPLEMENTATION-ROADMAP.md siguiendo .prompts/us-dev-workflow.md
```

---

## Criterios de Transicion de Estados

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

## Estado Actual del Tablero Jira (2026-03-28)

### Epic: SQ-1 - User Authentication & Onboarding

| Key  | Story                                     | Status          | Priority | Assignee              | PR Shift-Left | PR Impl      |
| ---- | ----------------------------------------- | --------------- | -------- | --------------------- | ------------- | ------------ |
| SQ-2 | User Registration with Email and Password | **QA Approved** | Highest  | Samuel Amonzabel      | #5 (MERGED)   | -            |
| SQ-3 | User Login with Credentials               | **QA Approved** | Highest  | Joel Armando Ramirez  | #4 (MERGED)   | -            |
| SQ-4 | Password Recovery via Email               | **In Test**     | High     | Maxe Aguilera         | #12 (MERGED)  | #50 (MERGED) |
| SQ-5 | Secure Logout                             | Shift-Left QA   | High     | German Luchesi        | -             | -            |
| SQ-6 | Guided Onboarding for New Users           | Ready For QA    | Medium   | Juan Leites           | -             | #59 (MERGED) |

### Epic: SQ-13 - Client Management

| Key   | Story                                | Status          | Priority | Assignee              | PR Shift-Left | PR Impl      |
| ----- | ------------------------------------ | --------------- | -------- | --------------------- | ------------- | ------------ |
| SQ-14 | Add New Client                       | **QA Approved** | Medium   | Ely                   | -             | #21 (MERGED) |
| SQ-15 | List All Clients                     | Ready For QA    | Medium   | Marco Antonio Camacho | #2 (MERGED)   | #25 (MERGED) |
| SQ-16 | Edit Client Data                     | **QA Approved** | Medium   | Joel Armando Ramirez  | #14 (MERGED)  | #26 (MERGED) |
| SQ-17 | Add Client Tax Information           | Ready For QA    | Medium   | YENNY BARBOSA         | -             | #27 (MERGED) |
| SQ-18 | View Client Invoice History          | Ready For QA    | Medium   | Rodrigo Godoy         | #43 (MERGED)  | #58 (MERGED) |
| SQ-19 | Delete Client                        | Ready For QA    | Medium   | Ronny Toro            | -             | #28 (MERGED) |
| SQ-68 | Validate client email deliverability | **Ready For Dev** | Medium | Alfonso Hernandez     | -             | -            |

### Epic: SQ-20 - Invoice Creation

| Key   | Story                                    | Status          | Priority | Assignee                      | PR Shift-Left | PR Impl      |
| ----- | ---------------------------------------- | --------------- | -------- | ----------------------------- | ------------- | ------------ |
| SQ-21 | Create Invoice by Selecting Client       | Ready For QA    | Medium   | Ely                           | #19 (MERGED)  | #29 (MERGED) |
| SQ-22 | Add Line Items to Invoice                | Ready For QA    | Medium   | Ely                           | #55 (MERGED)  | #56 (MERGED) |
| SQ-23 | Automatic Subtotal and Total Calculation | **QA Approved** | Medium   | Raul Gonzalez                 | #53 (MERGED)  | ✅           |
| SQ-24 | Add Taxes to Invoice                     | **QA Approved** | Medium   | Gloria Jesely Galindez Suarez | #9 (MERGED)   | #32 (MERGED) |
| SQ-25 | Add Discounts to Invoice                 | **QA Approved** | Medium   | GENESIS OJOSE                 | #24 (MERGED)  | #51 (MERGED) |
| SQ-26 | Preview Invoice Before Sending           | Ready For QA    | Medium   | Marianela Portas              | #15 (MERGED)  | #60 (MERGED) |
| SQ-27 | Assign Unique Invoice Number             | Ready For QA    | Medium   | Froylan Rodriguez             | #13 (MERGED)  | #46 (MERGED) |
| SQ-28 | Set Invoice Due Date                     | **In Test**     | Medium   | Yaneth Quintero               | #10 (MERGED)  | #33 (MERGED) |
| SQ-29 | Add Notes and Terms to Invoice           | Ready For QA    | Medium   | Ximena Quintana               | #17 (MERGED)  | #34 (MERGED) |
| SQ-30 | Save Invoice as Draft                    | **In Test**     | Medium   | Luis Eduardo Flores           | #30 (MERGED)  | #49 (MERGED) |

### Epic: SQ-31 - PDF Generation & Download

| Key   | Story                                 | Status          | Priority | Assignee          | PR Shift-Left | PR Impl      |
| ----- | ------------------------------------- | --------------- | -------- | ----------------- | ------------- | ------------ |
| SQ-32 | Generate Professional PDF Invoice     | **QA Approved** | Medium   | Alfonso Hernandez | #8 (MERGED)   | #35 (MERGED) |
| SQ-33 | Include Logo and Business Data in PDF | **In Test**     | Medium   | Arkaitz           | -             | #36 (MERGED) |
| SQ-34 | Include Payment Methods in PDF        | Shift-Left QA   | Medium   | Arkaitz           | -             | -            |
| SQ-35 | Download PDF to Device                | Ready For QA    | Medium   | Dedwison          | #18 (MERGED)  | #37 (MERGED) |

### Epic: SQ-37 - Invoice Sending

| Key   | Story                              | Status          | Priority | Assignee                 | PR Shift-Left | PR Impl      |
| ----- | ---------------------------------- | --------------- | -------- | ------------------------ | ------------- | ------------ |
| SQ-42 | Send Invoice by Email with 1 Click | Backlog         | Medium   | -                        | -             | -            |
| SQ-43 | Include PDF Attachment in Email    | **In Test**     | Medium   | yxsinell acosta zambrano | #40 (MERGED)  | #62 (MERGED) |
| SQ-44 | Include Payment Data in Email      | **Ready For QA**| Medium   | Alicia Juste             | -             | -            |
| SQ-46 | View Email Send Confirmation       | Shift-Left QA   | Medium   | Miguel Millan            | -             | -            |

### Epic: SQ-38 - Invoice Dashboard & Tracking

| Key   | Story                              | Status            | Priority | Assignee          | PR Shift-Left  | PR Impl |
| ----- | ---------------------------------- | ----------------- | -------- | ----------------- | -------------- | ------- |
| SQ-47 | Dashboard with all invoices        | **Ready For Dev** | Medium   | Alfonso Hernandez | #92 (MERGED)   | -       |
| SQ-48 | Filter invoices by status          | **Ready For Dev** | Medium   | Ely               | #92 (MERGED)   | -       |
| SQ-49 | Total pending amount               | **Ready For Dev** | Medium   | Unassigned        | #92 (MERGED)   | -       |
| SQ-50 | Overdue invoice highlighting       | **Ready For Dev** | Medium   | Unassigned        | #92 (MERGED)   | -       |
| SQ-51 | Search invoices by client/number   | **Ready For Dev** | Medium   | Fernando J. Masci | #88 (MERGED)   | -       |
| SQ-52 | Monthly income summary             | **Ready For Dev** | Medium   | Unassigned        | #92 (MERGED)   | -       |

**FIP:** ✅ Created — `.context/PBI/epics/EPIC-SQ-38-dashboard-tracking/feature-implementation-plan.md`
**Implementation Order:** SQ-47 → SQ-49 → SQ-48 → SQ-50 → SQ-51 → SQ-52

### Epic: SQ-39 - Payment Tracking

| Key   | Story                              | Status            | Priority | Assignee          | PR Shift-Left  | PR Impl |
| ----- | ---------------------------------- | ----------------- | -------- | ----------------- | -------------- | ------- |
| SQ-53 | Mark invoice as paid               | **Ready For Dev** | Medium   | Unassigned        | #93 (MERGED)   | -       |
| SQ-54 | Record payment method              | **Ready For Dev** | Medium   | Unassigned        | #93 (MERGED)   | -       |
| SQ-55 | Record amount received             | **Ready For Dev** | Medium   | Fernando J. Masci | #88 (MERGED)   | -       |
| SQ-56 | Add payment notes                  | **Ready For Dev** | Medium   | Unassigned        | #93 (MERGED)   | -       |
| SQ-57 | Record payment date                | **Ready For Dev** | Medium   | Unassigned        | #93 (MERGED)   | -       |
| SQ-58 | Revert payment                     | **Ready For Dev** | Medium   | Unassigned        | #93 (MERGED)   | -       |

**FIP:** ✅ Created — `.context/PBI/epics/EPIC-SQ-39-payment-tracking/feature-implementation-plan.md`
**Implementation Order:** SQ-53 → SQ-55 → SQ-54 → SQ-57 → SQ-56 → SQ-58

---

## Resumen Ejecutivo

### User Stories Implementadas

```
FASE 1 - Client Management ✅ COMPLETADA
  1. SQ-15: List All Clients ✅ (Ready For QA)
  2. SQ-16: Edit Client Data ✅ (QA Approved)
  3. SQ-17: Add Client Tax Information ✅ (Ready For QA)
  4. SQ-19: Delete Client ✅ (Ready For QA)

FASE 2 - Invoice Creation ✅ COMPLETADA
  5. SQ-21: Create Invoice by Selecting Client ✅ (Ready For QA)
  6. SQ-22: Add Line Items to Invoice ✅ (Ready For QA)
  7. SQ-23: Automatic Subtotal and Total Calculation ✅ (QA Approved)
  8. SQ-24: Add Taxes to Invoice ✅ (QA Approved)
  9. SQ-25: Add Discounts to Invoice ✅ (QA Approved)
  10. SQ-27: Assign Unique Invoice Number ✅ (Ready For QA)
  11. SQ-28: Set Invoice Due Date ✅ (In Test)
  12. SQ-29: Add Notes and Terms to Invoice ✅ (Ready For QA)
  13. SQ-30: Save Invoice as Draft ✅ (In Test)

FASE 3 - PDF Generation 🔶 EN PROGRESO (3/4)
  14. SQ-32: Generate Professional PDF Invoice ✅ (QA Approved)
  15. SQ-33: Include Logo and Business Data in PDF ✅ (In Test)
  16. SQ-35: Download PDF to Device ✅ (Ready For QA)
  17. SQ-34: Include Payment Methods in PDF ⏳ (Shift-Left QA)

FASE 4 - Auth & Recovery + Avanzado ✅ COMPLETADA
  18. SQ-3: User Login with Credentials ✅ (QA Approved)
  19. SQ-4: Password Recovery via Email ✅ (In Test)
  20. SQ-6: Guided Onboarding ✅ (Ready For QA)
  21. SQ-18: View Client Invoice History ✅ (Ready For QA)
  22. SQ-43: Include PDF Attachment in Email ✅ (In Test)
  23. SQ-26: Preview Invoice Before Sending ✅ (Ready For QA)

FASE 5 - Invoice Dashboard & Tracking (EPIC-SQ-38) ⏳ READY FOR DEV
  FIP: ✅ Created | FTP: ✅ Ready | ATPs: ✅ All 6 stories
  24. SQ-47: Dashboard with all invoices ⏳ (Ready For Dev)
  25. SQ-49: Total pending amount ⏳ (Ready For Dev)
  26. SQ-48: Filter invoices by status ⏳ (Ready For Dev)
  27. SQ-50: Overdue invoice highlighting ⏳ (Ready For Dev)
  28. SQ-51: Search invoices by client/number ⏳ (Ready For Dev)
  29. SQ-52: Monthly income summary ⏳ (Ready For Dev)

FASE 6 - Payment Tracking (EPIC-SQ-39) ⏳ READY FOR DEV
  FIP: ✅ Created | FTP: ✅ Ready | ATPs: ✅ All 6 stories
  30. SQ-53: Mark invoice as paid ⏳ (Ready For Dev)
  31. SQ-55: Record amount received ⏳ (Ready For Dev)
  32. SQ-54: Record payment method ⏳ (Ready For Dev)
  33. SQ-57: Record payment date ⏳ (Ready For Dev)
  34. SQ-56: Add payment notes ⏳ (Ready For Dev)
  35. SQ-58: Revert payment ⏳ (Ready For Dev)
```

### Metricas (2026-03-31)

- **Total US implementadas:** 23 (PRs mergeados en staging)
- **US en QA Approved:** 8 (SQ-2, SQ-3, SQ-14, SQ-16, SQ-23, SQ-24, SQ-25, SQ-32)
- **US en In Test:** 5 (SQ-4, SQ-28, SQ-30, SQ-33, SQ-43)
- **US en Ready For QA:** 11 (listas para testing)
- **US en BLOCKED:** 0 ✅
- **US en Shift-Left QA:** 3 (SQ-5, SQ-34, SQ-46)
- **US en Ready For Dev:** 15 (SQ-47-52, SQ-53-58, SQ-68)
- **FIPs creados:** 2 (SQ-38 ✅, SQ-39 ✅)
- **Bugs OPEN:** 8
- **Bugs Ready For QA:** 4
- **Improvements activos:** 3 (1 OPEN, 2 Ready For QA)

---

## Analisis de Dependencias

```
SQ-1 (Auth Epic)
├── SQ-3: User Login ────────────────────┐
│                                        │ Prerequisito para todo
└────────────────────────────────────────┘

SQ-13 (Client Management Epic)
├── SQ-14: Add New Client ─────────────── YA IMPLEMENTADO (QA Approved)
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

## Proximas US en Ready For Dev (15 disponibles)

### EPIC-SQ-38: Invoice Dashboard & Tracking (Fase 5)

| Orden | Key   | Story                              | Status        | Assignee          |
| ----- | ----- | ---------------------------------- | ------------- | ----------------- |
| 1     | SQ-47 | Dashboard with all invoices        | Ready For Dev | Alfonso Hernandez |
| 2     | SQ-49 | Total pending amount               | Ready For Dev | Unassigned        |
| 3     | SQ-48 | Filter invoices by status          | Ready For Dev | Ely               |
| 4     | SQ-50 | Overdue invoice highlighting       | Ready For Dev | Unassigned        |
| 5     | SQ-51 | Search invoices by client/number   | Ready For Dev | Fernando J. Masci |
| 6     | SQ-52 | Monthly income summary             | Ready For Dev | Unassigned        |

### EPIC-SQ-39: Payment Tracking (Fase 6)

| Orden | Key   | Story                              | Status        | Assignee          |
| ----- | ----- | ---------------------------------- | ------------- | ----------------- |
| 7     | SQ-53 | Mark invoice as paid               | Ready For Dev | Unassigned        |
| 8     | SQ-55 | Record amount received             | Ready For Dev | Fernando J. Masci |
| 9     | SQ-54 | Record payment method              | Ready For Dev | Unassigned        |
| 10    | SQ-57 | Record payment date                | Ready For Dev | Unassigned        |
| 11    | SQ-56 | Add payment notes                  | Ready For Dev | Unassigned        |
| 12    | SQ-58 | Revert payment                     | Ready For Dev | Unassigned        |

### Otras

| Orden | Key   | Story                                    | Status        | Assignee          |
| ----- | ----- | ---------------------------------------- | ------------- | ----------------- |
| -     | SQ-68 | Validate client email deliverability     | Ready For Dev | Alfonso Hernandez |

---

## Bloqueos por Defects (2026-03-28)

> **Ver:** [BUGFIX-ROADMAP.md](./BUGFIX-ROADMAP.md) para tracking completo de bugs

### ✅ User Stories Desbloqueadas (Bugs Cerrados)

| Story | Summary          | Defect(s) Resueltos | Status Actual   |
| ----- | ---------------- | ------------------- | --------------- |
| SQ-3  | User Login       | SQ-81 ✅            | **QA Approved** |
| SQ-16 | Edit Client Data | SQ-82 ✅ (merged)   | **QA Approved** |
| SQ-30 | Save Draft       | SQ-121, SQ-123 ✅   | **In Test**     |
| SQ-2  | User Signup      | SQ-98, SQ-99 ✅     | **QA Approved** |
| SQ-25 | Add Discounts    | SQ-97, SQ-96 ✅     | **QA Approved** |

### Bugs OPEN (Requieren Fix)

| Bug    | Summary                                                   | Prioridad | Afecta a | Assignee      |
| ------ | --------------------------------------------------------- | --------- | -------- | ------------- |
| SQ-74  | Logout no funciona despues de refresh                     | Highest   | Prod     | Ely           |
| SQ-137 | Backend Endpoint Missing 404                              | Highest   | SQ-18    | Rodrigo Godoy |
| SQ-139 | Formula descuento PDF inconsistente                       | High      | SQ-32    | Ely           |
| SQ-138 | Payment methods ausentes del PDF                          | High      | SQ-32    | Ely           |
| SQ-155 | Rate-limit expone error message                           | High      | SQ-4     | Maxe Aguilera |
| SQ-142 | Ghost subtotal                                            | Medium    | SQ-32    | Ely           |
| SQ-141 | tax_amount $0 con descuento                               | Medium    | SQ-32    | Ely           |
| SQ-140 | PDF header vacio sin business_profile                     | Medium    | SQ-32    | Ely           |

### Bugs Ready For QA (Fixeados, esperan re-test)

| Bug    | Summary                                  | Prioridad | Assignee            |
| ------ | ---------------------------------------- | --------- | ------------------- |
| SQ-82  | Edit client unicidad email               | High      | Joel Ramirez        |
| SQ-76  | Business_profiles 406                    | Medium    | Ximena Quintana     |
| SQ-124 | Cuenta bancaria sin validacion           | Medium    | Arkaitz             |
| SQ-122 | Sin advertencia unsaved changes          | Medium    | Luis Eduardo Flores |

---

## Historial de Actualizaciones

| Fecha      | Cambios                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------- |
| 2026-03-31 | **FIPs creados**: EPIC-SQ-38 y EPIC-SQ-39. Synced a Jira con label `implementation-plan-ready`. |
| 2026-03-31 | **Shift-Left QA completo**: 12 stories ahora Ready For Dev. PRs #92, #93 merged (ATPs).   |
| 2026-03-31 | **Roadmap actualizado**: Fases 5 (Dashboard) y 6 (Payments) con orden de implementacion.  |
| 2026-03-28 | **Sync Jira completa**: 7 bugs cerrados (SQ-81,86,98,99,111,121,123). 8 bugs nuevos OPEN. |
| 2026-03-28 | **QA Approved nuevos**: SQ-2, SQ-25, SQ-32. **In Test nuevos**: SQ-33, SQ-43.             |
| 2026-03-28 | **Ready For Dev nuevos**: SQ-47, SQ-48, SQ-68. **SQ-44**: Ready For Dev → Ready For QA.   |
| 2026-03-28 | **Shift-Left QA nuevos**: SQ-51, SQ-55. **Creado FIX-SESSION-PROGRESS.md**.               |
| 2026-03-09 | **Sync Jira**: SQ-3, SQ-16, SQ-23, SQ-24 → QA Approved. SQ-2, SQ-28, SQ-30 → In Test.   |
| 2026-03-09 | **US desbloqueadas**: SQ-3 (User Login) y SQ-16 (Edit Client) ahora QA Approved ✅        |
| 2026-03-01 | **SQ-43 implementado** - PR #62 MERGED, Include PDF Attachment in Email ✅                 |
| 2026-02-25 | **SQ-18 implementado** - PR #58 MERGED, View Client Invoice History ✅                     |
| 2026-02-25 | **SQ-6: PR #59 MERGED** - Guided Onboarding implementado                                   |
| 2026-02-18 | SQ-22: **PR #56 MERGED** ✅ - Add Line Items to Invoice completado                        |
| 2026-02-12 | SQ-25: PR #51 MERGED, SQ-4: PR #50 MERGED, SQ-30: PR #49 MERGED, SQ-27: PR #46 MERGED   |

---

_Actualizado por Claude Code - 2026-03-31 (FIPs creados, Shift-Left completo, Roadmap Fases 5-6)_
