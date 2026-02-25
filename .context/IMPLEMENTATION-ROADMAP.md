# Implementation Roadmap - SoloQ

> **Documento provisional** - Generado: 2026-02-07 | **Última actualización:** 2026-02-25
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

## Estado Actual del Tablero Jira (2026-02-24)

### Epic: SQ-13 - Client Management

| Key   | Story                                | Status          | Priority | Assignee              | PR Shift-Left | PR Impl      |
| ----- | ------------------------------------ | --------------- | -------- | --------------------- | ------------- | ------------ |
| SQ-14 | Add New Client                       | **QA Approved** | Medium   | Ely                   | -             | #21 (MERGED) |
| SQ-15 | List All Clients                     | Ready For QA    | Medium   | Marco Antonio Camacho | #2 (MERGED)   | #25 (MERGED) |
| SQ-16 | Edit Client Data                     | **BLOCKED**     | Medium   | Ely                   | #14 (MERGED)  | #26 (MERGED) |
| SQ-17 | Add Client Tax Information           | Ready For QA    | Medium   | YENNY BARBOSA         | -             | #27 (MERGED) |
| SQ-18 | View Client Invoice History          | Ready For QA    | Medium   | Rodrigo Godoy         | #43 (MERGED)  | #58 (MERGED) |
| SQ-19 | Delete Client                        | Ready For QA    | Medium   | Ronny Toro            | -             | #28 (MERGED) |
| SQ-68 | Validate client email deliverability | Backlog         | Medium   | -                     | -             | -            |

### Epic: SQ-20 - Invoice Creation

| Key   | Story                                    | Status          | Priority | Assignee                      | PR Shift-Left | PR Impl      |
| ----- | ---------------------------------------- | --------------- | -------- | ----------------------------- | ------------- | ------------ |
| SQ-21 | Create Invoice by Selecting Client       | Ready For QA    | Medium   | Ely                           | #19 (MERGED)  | #29 (MERGED) |
| SQ-22 | Add Line Items to Invoice                | Ready For QA    | Medium   | Ely                           | #55 (MERGED)  | #56 (MERGED) |
| SQ-23 | Automatic Subtotal and Total Calculation | Ready For Dev   | Medium   | Raúl González                 | #53 (MERGED)  | -            |
| SQ-24 | Add Taxes to Invoice                     | **In Test**     | Medium   | Gloria Jesely Galindez Suárez | #9 (MERGED)   | #32 (MERGED) |
| SQ-25 | Add Discounts to Invoice                 | **In Test**     | Medium   | GENESIS OJOSE                 | #24 (MERGED)  | #51 (MERGED) |
| SQ-26 | Preview Invoice Before Sending           | Ready For Dev   | Medium   | Ely                           | #15 (MERGED)  | -            |
| SQ-27 | Assign Unique Invoice Number             | Ready For QA    | Medium   | Froylan Rodriguez             | #13 (MERGED)  | #46 (MERGED) |
| SQ-28 | Set Invoice Due Date                     | Ready For QA    | Medium   | Yaneth Quintero               | #10 (MERGED)  | #33 (MERGED) |
| SQ-29 | Add Notes and Terms to Invoice           | Ready For QA    | Medium   | Ximena Quintana               | #17 (MERGED)  | #34 (MERGED) |
| SQ-30 | Save Invoice as Draft                    | Ready For QA    | Medium   | Luis Eduardo Flores           | #30 (MERGED)  | #49 (MERGED) |

### Epic: SQ-1 - User Authentication & Onboarding

| Key  | Story                                     | Status          | Priority | Assignee         | PR Shift-Left | PR Impl      |
| ---- | ----------------------------------------- | --------------- | -------- | ---------------- | ------------- | ------------ |
| SQ-2 | User Registration with Email and Password | Ready For QA    | Highest  | Samuel Amonzabel | #5 (MERGED)   | -            |
| SQ-3 | User Login with Credentials               | **BLOCKED**     | Highest  | Ely              | #4 (MERGED)   | -            |
| SQ-4 | Password Recovery via Email               | **In Test**     | High     | Maxe Aguilera    | #12 (MERGED)  | #50 (MERGED) |
| SQ-5 | Secure Logout                             | Shift-Left QA   | High     | German Luchesi   | -             | -            |
| SQ-6 | Guided Onboarding for New Users           | Ready For Dev   | Medium   | Ely              | -             | -            |

### Epic: SQ-31 - PDF Generation & Download

| Key   | Story                                 | Status        | Priority | Assignee          | PR Shift-Left | PR Impl      |
| ----- | ------------------------------------- | ------------- | -------- | ----------------- | ------------- | ------------ |
| SQ-32 | Generate Professional PDF Invoice     | Ready For QA  | Medium   | Alfonso Hernandez | #8 (MERGED)   | #35 (MERGED) |
| SQ-33 | Include Logo and Business Data in PDF | Ready For QA  | Medium   | Arkaitz           | -             | #36 (MERGED) |
| SQ-34 | Include Payment Methods in PDF        | Shift-Left QA | Medium   | Arkaitz           | -             | -            |
| SQ-35 | Download PDF to Device                | Ready For QA  | Medium   | Dedwison          | #18 (MERGED)  | #37 (MERGED) |

### Epic: SQ-37 - Invoice Sending

| Key   | Story                              | Status        | Priority | Assignee       | PR Shift-Left | PR Impl |
| ----- | ---------------------------------- | ------------- | -------- | -------------- | ------------- | ------- |
| SQ-42 | Send Invoice by Email with 1 Click | Backlog       | Medium   | -              | -             | -       |
| SQ-43 | Include PDF Attachment in Email    | Ready For Dev | Medium   | Ely            | #40 (MERGED)  | -       |
| SQ-46 | View Email Send Confirmation       | Shift-Left QA | Medium   | Miguel Millan  | -             | -       |

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
| 14    | SQ-30 | Save Invoice as Draft       | Ready For QA  | Luis E.  | #30 (MERGED)  | #49 (MERGED) |
| 15    | SQ-4  | Password Recovery via Email | Ready For QA  | Maxe A.  | #12 (MERGED)  | #50 (MERGED) |
| 16    | SQ-25 | Add Discounts to Invoice    | Ready For QA  | GENESIS  | #24 (MERGED)  | #51 (MERGED) |
| 17    | SQ-18 | View Client Invoice History | Ready For QA  | Rodrigo  | #43 (MERGED)  | #58 (MERGED) |

### FASE 5: US en Ready For Dev (2026-02-25)

| Orden | Key   | Story                            | Status        | Assignee      | PR Shift-Left | PR Impl |
| ----- | ----- | -------------------------------- | ------------- | ------------- | ------------- | ------- |
| 18    | SQ-6  | Guided Onboarding for New Users  | Ready For Dev | Ely           | -             | -       |
| 19    | SQ-23 | Auto Subtotal/Total Calculation  | Ready For Dev | Raúl González | #53 (MERGED)  | -       |
| 20    | SQ-26 | Preview Invoice Before Send      | Ready For Dev | Ely           | #15 (MERGED)  | -       |
| 21    | SQ-43 | Include PDF Attachment in Email  | Ready For Dev | Ely           | #40 (MERGED)  | -       |

### OMITIDAS (No Ready For Dev o Dependencias Bloqueadas)

| Key   | Story                  | Status        | Assignee         | Razon de Omision                            |
| ----- | ---------------------- | ------------- | ---------------- | ------------------------------------------- |
| SQ-2  | User Registration      | Ready For QA  | Samuel Amonzabel | Implementado - gaps documentados en Jira    |
| SQ-3  | User Login             | **BLOCKED**   | Ely              | Bug SQ-81 (Ready For QA - pendiente retest) |
| SQ-16 | Edit Client Data       | **BLOCKED**   | Ely              | Bug SQ-82 (Ready For QA - pendiente retest) |
| SQ-22 | Add Line Items         | Ready For QA  | Ely              | ✅ Implementado - PR #56 (MERGED)          |
| SQ-34 | Payment Methods in PDF | Shift-Left QA | Arkaitz          | No Ready For Dev                            |
| SQ-42 | Send Invoice by Email  | Backlog       | -                | Regresó a Backlog                           |

---

## ✅ SQ-22 - Add Line Items to Invoice - IMPLEMENTADO

### Estado Actual

| Campo              | Valor                              |
| ------------------ | ---------------------------------- |
| **Status**         | Ready For QA                       |
| **Assignee**       | Ely (Dev)                          |
| **PR Shift-Left**  | #55 (MERGED)                       |
| **PR Impl**        | #56 (MERGED)                       |
| **Fecha**          | 2026-02-18                         |

### Implementación Completada

**Archivos creados/modificados (8 archivos, +1186/-30 líneas):**

- `src/components/invoices/line-items-table.tsx` (NEW) - Tabla editable con useFieldArray
- `src/lib/validations/invoice.ts` - Schemas lineItemSchema, lineItemsArraySchema
- `src/lib/utils/invoice-calculations.ts` - calculateLineTotal, calculateSubtotal
- `src/app/api/invoices/route.ts` - POST con items
- `src/app/api/invoices/[id]/route.ts` - PUT/GET con items
- `src/app/(app)/invoices/create/page.tsx` - Integración LineItemsTable
- `src/app/(app)/invoices/[id]/edit/page.tsx` - Integración LineItemsTable

**Test Cases cubiertos (15/15):**

- TC-01 a TC-06: CRUD operations (add, edit, remove items)
- TC-07 a TC-12: Validation rules (description, quantity, price)
- TC-13 a TC-15: Edge cases (max 50 items, empty invoice)

### Integración con SQ-25 (Discounts)

✅ **Ahora integrado**: El subtotal se calcula automáticamente desde line items y los descuentos se aplican correctamente sobre el subtotal calculado.

---

## Resumen Ejecutivo

### User Stories Implementadas

```
FASE 1 - Client Management ✅ COMPLETADA
  1. SQ-15: List All Clients ✅
  2. SQ-16: Edit Client Data ✅ (BLOCKED - pendiente retest)
  3. SQ-17: Add Client Tax Information ✅
  4. SQ-19: Delete Client ✅

FASE 2 - Invoice Creation ✅ COMPLETADA
  5. SQ-21: Create Invoice by Selecting Client ✅
  6. SQ-22: Add Line Items to Invoice ✅
  7. SQ-24: Add Taxes to Invoice ✅ (In Test)
  8. SQ-25: Add Discounts to Invoice ✅ (In Test)
  9. SQ-27: Assign Unique Invoice Number ✅
  10. SQ-28: Set Invoice Due Date ✅
  11. SQ-29: Add Notes and Terms to Invoice ✅
  12. SQ-30: Save Invoice as Draft ✅

FASE 3 - PDF Generation 🔶 EN PROGRESO (3/4)
  13. SQ-32: Generate Professional PDF Invoice ✅
  14. SQ-33: Include Logo and Business Data in PDF ✅
  15. SQ-35: Download PDF to Device ✅
  16. SQ-34: Include Payment Methods in PDF ⏳ (Shift-Left QA)

FASE 4 - Auth & Recovery ✅ COMPLETADA
  17. SQ-4: Password Recovery via Email ✅ (In Test)
```

### Metricas (2026-02-25)

- **Total US implementadas:** 17 (PRs mergeados en staging)
- **US en QA Approved:** 1 (SQ-14 ✅)
- **US en In Test:** 3 (SQ-4, SQ-24, SQ-25)
- **US en Ready For QA:** 12 (listas para testing)
- **US en BLOCKED:** 2 (SQ-3, SQ-16 - pendientes re-test)
- **US en Shift-Left QA:** 3 (SQ-5, SQ-34, SQ-46)
- **US en Ready For Dev:** 4 (SQ-6, SQ-23, SQ-26, SQ-43)
- **Bugs Abiertos:** 4 (1 Highest, 2 High, 1 Medium)
- **Bugs Ready For QA:** 4 (SQ-75, SQ-76, SQ-81, SQ-82 - todos fixeados ✅)
- **PRs de Bug Fix:** Todos mergeados (#41, #44, #45, #54) ✅
- **PRs de Shift-Left:** ✅ Todos mergeados (#40, #48, #52, #53)

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

### US Completada: SQ-30 - Save Invoice as Draft ✅

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
| 8    | Completado | **PR #49 MERGED** ✅                        |
| 9-11 | Completado | Ready For QA, asignado a Luis Eduardo       |

**Implementación incluye:**

- API: GET /api/invoices, PUT /api/invoices/[id], DELETE /api/invoices/[id]
- Hooks: useInvoices, useUpdateInvoice, useDeleteInvoice, useAutoSave
- Componentes: InvoiceStatusBadge, InvoiceNumberInput (updated)
- Pages: /invoices (list con filtros), /invoices/[id]/edit (auto-save)

---

### 🎉 FASE 4 COMPLETADA - Invoice Creation Avanzado (4/4)

US de FASE 4 implementadas:

- SQ-27: Assign Unique Invoice Number ✅ (PR #46)
- SQ-30: Save Invoice as Draft ✅ (PR #49 MERGED)
- SQ-4: Password Recovery via Email ✅ (PR #50 MERGED)
- SQ-25: Add Discounts to Invoice ✅ (PR #51 MERGED)

---

### 🚀 PRÓXIMAS US EN READY FOR DEV (4 disponibles)

1. **SQ-6** - Guided Onboarding for New Users (Ely) - Auth & Onboarding
2. **SQ-23** - Automatic Subtotal and Total Calculation (Raúl González) - Invoice Creation
3. **SQ-26** - Preview Invoice Before Sending (Ely) - Invoice Creation
4. **SQ-43** - Include PDF Attachment in Email (Ely) - Invoice Sending

---

## PRs Pendientes de Revisión (2026-02-24)

### 🔧 PRs de Bug Fixes (Todos Mergeados ✅)

| PR # | Rama                             | Bug   | Summary                           | Autor    | Estado |
| ---- | -------------------------------- | ----- | --------------------------------- | -------- | ------ |
| #54  | fix/SQ-81-SQ-82/auth-client-fixes | SQ-81, SQ-82 | Resolve auth & client blocking bugs | saiotest | MERGED ✅ |
| #45  | fix/SQ-76/business-profiles-406  | SQ-76 | Use maybeSingle() for optional profile | saiotest | MERGED ✅ |
| #44  | fix/SQ-75/phone-validation       | SQ-75 | Add phone field format validation | saiotest | MERGED ✅ |

### 📝 PRs de Shift-Left QA / Documentación ✅ (Todos Mergeados)

| PR # | Rama                          | US    | Tipo       | Autor          | Score | Estado     |
| ---- | ----------------------------- | ----- | ---------- | -------------- | ----- | ---------- |
| #53  | test/SQ-23/auto-calculate     | SQ-23 | Shift-Left | GaslessQA      | 4.5/5 | MERGED ✅  |
| #52  | test/SQ-36/pdf-templates      | SQ-36 | Shift-Left | marian-sanchez | 4/5   | MERGED ✅  |
| #48  | docs/SQ-37/feature-test-plan  | SQ-37 | Docs       | yxsinell       | 4/5   | MERGED ✅  |
| #40  | test/SQ-43/include-pdf-attach | SQ-43 | Shift-Left | yxsinell       | 3.5/5 | MERGED ✅  |

### ✅ PRs de Implementación Recientemente Mergeados (saiotest)

| PR # | Rama                         | US    | Summary                        | Fecha Merge  |
| ---- | ---------------------------- | ----- | ------------------------------ | ------------ |
| #56  | feat/SQ-22/add-line-items    | SQ-22 | Add Line Items to Invoice      | 2026-02-18   |
| #55  | test/SQ-22/add-line-items    | SQ-22 | Shift-Left for Line Items      | 2026-02-18   |
| #51  | feat/SQ-25/add-discounts     | SQ-25 | Add Discounts to Invoice       | 2026-02-12   |
| #50  | feat/SQ-4/password-recovery  | SQ-4  | Password Recovery via Email    | 2026-02-12   |
| #49  | feat/SQ-30/save-draft        | SQ-30 | Save Invoice as Draft          | 2026-02-12   |
| #46  | feat/SQ-27/invoice-number    | SQ-27 | Assign Unique Invoice Number   | 2026-02-12   |

### PRs Cerrados (No Mergeados)

| PR # | Rama                            | Razón                                         |
| ---- | ------------------------------- | --------------------------------------------- |
| #38  | feature/add-new-client          | CLOSED - SQ-14 ya implementado, tarea no cumplida |
| #47  | docs/SQ-37/git-flow-conventions | CLOSED (superseded)                           |
| #39  | feat/SQ-37/feature-test-plan    | CLOSED (superseded by #48)                    |
| #31  | feature/add-new-client          | CLOSED (superseded)                           |

---

## Bloqueos por Defects (2026-02-24)

> **Ver:** [BUGFIX-ROADMAP.md](./BUGFIX-ROADMAP.md) para tracking completo de bugs

### 🔴 User Stories Actualmente BLOQUEADAS

| Story | Summary          | Defect | Prioridad | Descripción del Bug                              | PR Fix        |
| ----- | ---------------- | ------ | --------- | ------------------------------------------------ | ------------- |
| SQ-3  | User Login       | SQ-81  | Highest   | last_login_at no actualiza, business_profiles 406 | #54 (MERGED) |
| SQ-16 | Edit Client Data | SQ-82  | High      | Inconsistencia unicidad email (case-insensitive) | #54 (MERGED) |

**Nota:** Bugs SQ-81 y SQ-82 fueron fixeados (PR #54 MERGED), pero las US permanecen BLOCKED pendientes de re-test por QA.

### 🟢 Bugs Fixeados - Ready For QA

| Bug   | Summary                                  | Prioridad | PR Fix        | Estado       |
| ----- | ---------------------------------------- | --------- | ------------- | ------------ |
| SQ-81 | Login: last_login_at + business_profiles | Highest   | #54 (MERGED)  | Ready For QA |
| SQ-82 | Edit client: email case-insensitive      | High      | #54 (MERGED)  | Ready For QA |
| SQ-76 | Business_profiles devuelve 406           | Medium    | #45 (MERGED)  | Ready For QA |
| SQ-75 | Phone field accepts letters              | Medium    | #44 (MERGED)  | Ready For QA |

### 🟠 Bugs Abiertos (Sin PR)

| Bug   | Summary                                   | Prioridad | Afecta a |
| ----- | ----------------------------------------- | --------- | -------- |
| SQ-74 | User cannot log out after refresh         | Highest   | SQ-5     |
| SQ-86 | Password Reset: UI/UX for expired tokens  | High      | SQ-4     |
| SQ-71 | Breadcrumb displays user_ID in edit       | High      | SQ-16    |
| SQ-83 | Due date warning when today selected      | Medium    | SQ-28    |
| SQ-72 | Jira bloquea update en Epics              | Medium    | -        |

### ✅ Bugs Cerrados/Enhancement

| Bug   | Summary                                   | Estado      | PR Fix       |
| ----- | ----------------------------------------- | ----------- | ------------ |
| SQ-69 | Duplicated email case-sensitive           | CLOSED      | #41 (MERGED) |
| SQ-70 | Misaligned fields on invalid email        | CLOSED      | #41 (MERGED) |
| SQ-84 | Forgot Password rate limit indication     | Enhancement | -            |
| SQ-85 | Password strength feedback                | Enhancement | -            |

---

### US Completada: SQ-4 - Password Recovery via Email ✅

| Paso | Estado     | Notas                                  |
| ---- | ---------- | -------------------------------------- |
| 0    | Completado | Precondiciones verificadas             |
| 1    | Completado | Jira transitado a In Progress          |
| 2    | Completado | Plan de implementación creado          |
| 3    | Completado | Implementación completa (6 archivos)   |
| 4    | Completado | PR #50 creado                          |
| 5    | N/A        | E2E/UI testing por usuario             |
| 6    | Completado | Code review (self)                     |
| 7    | Completado | Documentación actualizada              |
| 8    | Completado | **PR #50 MERGED** ✅                   |
| 9-11 | Completado | Ready For QA, asignado a Maxe Aguilera |

**Implementación incluye:**

- Page: `/forgot-password` (formulario de solicitud)
- API: `/api/auth/forgot-password` (rate limiting IP + email)
- Page: `/reset-password` (formulario de nueva contraseña)
- Component: `PasswordStrengthIndicator` (validación en tiempo real)
- Update: `/login` (mensaje de éxito post-reset)

**Test Cases cubiertos (19/19):**
FT-SQ4-01 a FT-SQ4-19 (ver PR #50 para detalles)

---

### US Completada: SQ-25 - Add Discounts to Invoice ✅

| Paso | Estado     | Notas                                  |
| ---- | ---------- | -------------------------------------- |
| 0    | Completado | Precondiciones verificadas             |
| 1    | Completado | Jira transitado a In Progress          |
| 2    | Completado | Plan de implementación creado          |
| 3    | Completado | Implementación completa (9 archivos)   |
| 4    | Completado | PR #51 creado                          |
| 5    | N/A        | E2E/UI testing por usuario             |
| 6    | Completado | Code review (self)                     |
| 7    | Completado | Documentación actualizada              |
| 8    | Completado | **PR #51 MERGED** ✅                   |
| 9-11 | Completado | Ready For QA, asignado a GENESIS OJOSE |

**Implementación incluye:**

- Utility: `calculateDiscountAmount` en `invoice-calculations.ts`
- Component: `DiscountInput` (toggle buttons + numeric input + warning)
- Validación: `discountType/discountValue` schemas con refinements
- UI: InvoiceSummary muestra tipo de descuento (e.g., "Descuento (10%)")
- API: POST/PUT routes calculan y persisten discount_amount

**Test Cases cubiertos (7/7):**

- TC-01: No discount by default
- TC-02: Percentage discount calculation
- TC-03: Fixed amount discount
- TC-04: Discount capped at subtotal (+ warning)
- TC-05: Tax on (subtotal - discount)
- TC-06: Reject percentage > 100%
- TC-07: Reject negative values

---

### US Completada: SQ-22 - Add Line Items to Invoice ✅

| Paso | Estado     | Notas                                    |
| ---- | ---------- | ---------------------------------------- |
| 0    | Completado | Precondiciones verificadas               |
| 1    | Completado | Jira transitado a In Progress            |
| 2    | Completado | Plan de implementación creado            |
| 3    | Completado | Implementación completa (8 archivos)     |
| 4    | Completado | PR #56 creado                            |
| 5    | N/A        | E2E/UI testing por usuario               |
| 6    | Completado | Code review (self)                       |
| 7    | Completado | Documentación actualizada                |
| 8    | Completado | **PR #56 MERGED** ✅                     |
| 9-11 | Completado | Ready For QA                             |

---

### US Completada: SQ-18 - View Client Invoice History ✅

| Paso | Estado     | Notas                                    |
| ---- | ---------- | ---------------------------------------- |
| 0    | Completado | Precondiciones verificadas               |
| 1    | Completado | Jira transitado a In Progress            |
| 2    | Completado | Plan de implementación N/A (claro scope) |
| 3    | Completado | Implementación completa (5 archivos)     |
| 4    | Completado | PR #58 creado                            |
| 5    | N/A        | E2E/UI testing por usuario               |
| 6    | Completado | Code review (self)                       |
| 7    | Completado | Documentación actualizada                |
| 8    | Completado | **PR #58 MERGED** ✅                     |
| 9-11 | Completado | Ready For QA, asignado a Rodrigo Godoy   |

**Implementación incluye:**

- API: `GET /api/clients/[id]/invoices` con totales calculados
- Hook: `useClientInvoices` (React Query)
- Component: `ClientInvoiceHistory` con TotalsSummary, InvoiceTable, EmptyState
- Page: `/clients/[id]` con tabs (Datos + Facturas)

**Test Cases cubiertos (7/15 - P0/P1):**

- FTP-001: Ver historial con facturas existentes
- FTP-002: Status badges con colores correctos
- FTP-003: Click para navegar al detalle
- FTP-004: Empty state con CTA
- FTP-005: Total Invoiced (sent + paid + overdue)
- FTP-006: Total Paid
- FTP-007: Total Pending (sent + overdue)

---

## Historial de Actualizaciones

| Fecha      | Cambios                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------- |
| 2026-02-25 | **SQ-18 implementado** - PR #58 MERGED, View Client Invoice History ✅ (5 archivos)        |
| 2026-02-25 | **PRs Shift-Left mergeados** - #53 (4.5/5), #52 (4/5), #48 (4/5), #40 (3.5/5) ✅           |
| 2026-02-25 | **0 PRs pendientes** - Todos los PRs de implementación, bugs y shift-left mergeados        |
| 2026-02-25 | **Limpieza de PRs completada** - Todos los bug fixes mergeados ✅                           |
| 2026-02-25 | PR #44 (SQ-75 phone validation) mergeado, SQ-75 → Ready For QA                             |
| 2026-02-25 | PR #38 cerrado con feedback (tarea no cumplida, SQ-14 ya implementado)                     |
| 2026-02-25 | SQ-76 transitado a Ready For QA (PR #45 ya estaba mergeado)                                |
| 2026-02-25 | PRs de Shift-Left (#40, #48, #52, #53) quedan pendientes de revisión exhaustiva            |
| 2026-02-24 | **Sincronización completa del tablero Jira y GitHub PRs**                                   |
| 2026-02-24 | SQ-4, SQ-24, SQ-25: Cambiaron de Ready For QA → **In Test** (testing activo)               |
| 2026-02-24 | SQ-23: Cambió de Estimation → **Ready For Dev** (disponible para implementar)              |
| 2026-02-24 | SQ-42: Regresó de Shift-Left QA → **Backlog**                                              |
| 2026-02-24 | Bugs SQ-81/SQ-82: **Fixeados** con PR #54 MERGED, ahora Ready For QA                       |
| 2026-02-24 | Bug SQ-76: **Fixeado** con PR #45 MERGED                                                   |
| 2026-02-24 | Nuevos bugs reportados: SQ-83 (due date warning), SQ-86 (password reset UX)                |
| 2026-02-24 | US Ready For Dev actuales: SQ-6, SQ-18, SQ-23, SQ-26, SQ-43 (5 disponibles)                |
| 2026-02-18 | SQ-22: **PR #56 MERGED** ✅ - Add Line Items to Invoice completado (8 archivos, +1186/-30) |
| 2026-02-17 | Sincronización completa: SQ-14 QA Approved, SQ-3/SQ-16 BLOCKED, nuevos bugs SQ-81/SQ-82    |
| 2026-02-12 | SQ-25: PR #51 MERGED - Add Discounts to Invoice completado ✅                              |

---

_Actualizado por Claude Code - 2026-02-25 (PRs Shift-Left review completo)_
