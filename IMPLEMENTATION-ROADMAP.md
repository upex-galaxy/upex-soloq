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

## Estado Actual del Tablero Jira

### Epic: SQ-13 - Client Management

| Key   | Story                                | Status        | Priority | PR           |
| ----- | ------------------------------------ | ------------- | -------- | ------------ |
| SQ-14 | Add New Client                       | In Test       | Medium   | #21 (MERGED) |
| SQ-15 | List All Clients                     | Ready For QA  | Medium   | #25 (MERGED) |
| SQ-16 | Edit Client Data                     | Ready For QA  | Medium   | #26 (MERGED) |
| SQ-17 | Add Client Tax Information           | Ready For QA  | Medium   | #27 (MERGED) |
| SQ-18 | View Client Invoice History          | Shift-Left QA | Medium   | #20 (OPEN)   |
| SQ-19 | Delete Client                        | Ready For QA  | Medium   | #28 (MERGED) |
| SQ-68 | Validate client email deliverability | Backlog       | Medium   | -            |

### Epic: SQ-20 - Invoice Creation

| Key   | Story                                    | Status            | Priority | PR                        |
| ----- | ---------------------------------------- | ----------------- | -------- | ------------------------- |
| SQ-21 | Create Invoice by Selecting Client       | **Ready For Dev** | Medium   | #19 (MERGED - solo tests) |
| SQ-22 | Add Line Items to Invoice                | Backlog           | Medium   | -                         |
| SQ-23 | Automatic Subtotal and Total Calculation | Estimation        | Medium   | #16 (MERGED - solo tests) |
| SQ-24 | Add Taxes to Invoice                     | **Ready For Dev** | Medium   | #9 (MERGED - solo tests)  |
| SQ-25 | Add Discounts to Invoice                 | Shift-Left QA     | Medium   | #24 (OPEN)                |
| SQ-26 | Preview Invoice Before Sending           | Estimation        | Medium   | #15 (MERGED - solo tests) |
| SQ-27 | Assign Unique Invoice Number             | Estimation        | Medium   | #13 (MERGED - solo tests) |
| SQ-28 | Set Invoice Due Date                     | **Ready For Dev** | Medium   | #10 (MERGED - solo tests) |
| SQ-29 | Add Notes and Terms to Invoice           | **Ready For Dev** | Medium   | #17 (MERGED - solo tests) |
| SQ-30 | Save Invoice as Draft                    | Backlog           | Medium   | -                         |

### Epic: SQ-1 - User Authentication & Onboarding

| Key  | Story                                     | Status            | Priority | PR                        |
| ---- | ----------------------------------------- | ----------------- | -------- | ------------------------- |
| SQ-2 | User Registration with Email and Password | Shift-Left QA     | Highest  | #5 (MERGED - solo tests)  |
| SQ-3 | User Login with Credentials               | **Ready For Dev** | Highest  | #4 (MERGED - solo tests)  |
| SQ-4 | Password Recovery via Email               | Shift-Left QA     | High     | #12 (MERGED - solo tests) |
| SQ-5 | Secure Logout                             | Shift-Left QA     | High     | -                         |

### Epic: SQ-31 - PDF Generation & Download

| Key   | Story                                 | Status            | Priority | PR                        |
| ----- | ------------------------------------- | ----------------- | -------- | ------------------------- |
| SQ-32 | Generate Professional PDF Invoice     | **Ready For Dev** | Medium   | #8 (MERGED - solo tests)  |
| SQ-33 | Include Logo and Business Data in PDF | **Ready For Dev** | Medium   | -                         |
| SQ-34 | Include Payment Methods in PDF        | Shift-Left QA     | Medium   | -                         |
| SQ-35 | Download PDF to Device                | **Ready For Dev** | Medium   | #18 (MERGED - solo tests) |

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

### FASE 1: Client Management (Prioridad Maxima)

| Orden | Key   | Story                      | Status        | Implementable | Razon                 |
| ----- | ----- | -------------------------- | ------------- | ------------- | --------------------- |
| 1     | SQ-15 | List All Clients           | Ready For Dev | SI            | SQ-14 ya implementado |
| 2     | SQ-16 | Edit Client Data           | Ready For Dev | SI            | Despues de SQ-15      |
| 3     | SQ-17 | Add Client Tax Information | Ready For Dev | SI            | Despues de SQ-16      |
| 4     | SQ-19 | Delete Client              | Ready For Dev | SI            | Despues de SQ-15      |

**Nota:** SQ-18 (View Client Invoice History) esta en Shift-Left QA y ademas depende de tener facturas, se omite por ahora.

### FASE 2: Invoice Creation (Segunda Prioridad)

| Orden | Key   | Story                              | Status        | Implementable | Razon                      |
| ----- | ----- | ---------------------------------- | ------------- | ------------- | -------------------------- |
| 5     | SQ-21 | Create Invoice by Selecting Client | Ready For Dev | SI            | Requiere FASE 1 completada |
| 6     | SQ-24 | Add Taxes to Invoice               | Ready For Dev | SI            | Despues de SQ-21           |
| 7     | SQ-28 | Set Invoice Due Date               | Ready For Dev | SI            | Despues de SQ-21           |
| 8     | SQ-29 | Add Notes and Terms to Invoice     | Ready For Dev | SI            | Despues de SQ-21           |

**Nota:** SQ-22, SQ-23, SQ-25, SQ-26, SQ-27, SQ-30 no estan en Ready For Dev.

### FASE 3: PDF Generation (Tercera Prioridad)

| Orden | Key   | Story                             | Status        | Implementable | Razon                      |
| ----- | ----- | --------------------------------- | ------------- | ------------- | -------------------------- |
| 9     | SQ-32 | Generate Professional PDF Invoice | Ready For Dev | SI            | Requiere FASE 2 completada |
| 10    | SQ-33 | Include Logo and Business Data    | Ready For Dev | SI            | Despues de SQ-32           |
| 11    | SQ-35 | Download PDF to Device            | Ready For Dev | SI            | Despues de SQ-32           |

### OMITIDAS (No Ready For Dev o Dependencias Bloqueadas)

| Key   | Story                       | Status        | Razon de Omision                             |
| ----- | --------------------------- | ------------- | -------------------------------------------- |
| SQ-3  | User Login                  | Ready For Dev | Auth ya funciona, baja prioridad vs features |
| SQ-18 | View Client Invoice History | Shift-Left QA | No Ready + Depende de invoices               |
| SQ-22 | Add Line Items              | Backlog       | No Ready For Dev                             |
| SQ-23 | Auto Calculation            | Estimation    | No Ready For Dev                             |
| SQ-25 | Add Discounts               | Shift-Left QA | No Ready For Dev                             |
| SQ-26 | Preview Invoice             | Estimation    | No Ready For Dev                             |
| SQ-27 | Unique Invoice Number       | Estimation    | No Ready For Dev                             |
| SQ-30 | Save as Draft               | Backlog       | No Ready For Dev                             |
| SQ-34 | Payment Methods in PDF      | Shift-Left QA | No Ready For Dev                             |

---

## Resumen Ejecutivo

### User Stories Implementables en Orden

```
FASE 1 - Client Management
  1. SQ-15: List All Clients
  2. SQ-16: Edit Client Data
  3. SQ-17: Add Client Tax Information
  4. SQ-19: Delete Client

FASE 2 - Invoice Creation
  5. SQ-21: Create Invoice by Selecting Client
  6. SQ-24: Add Taxes to Invoice
  7. SQ-28: Set Invoice Due Date
  8. SQ-29: Add Notes and Terms to Invoice

FASE 3 - PDF Generation
  9.  SQ-32: Generate Professional PDF Invoice
  10. SQ-33: Include Logo and Business Data in PDF
  11. SQ-35: Download PDF to Device
```

### Metricas

- **Total US en Ready For Dev:** 11
- **Total US implementables consecutivamente:** 11
- **US bloqueadas por dependencias:** 0
- **US omitidas (no Ready For Dev):** 8

---

## Tracking de Progreso

### US Completada: SQ-15 - List All Clients ✅

| Paso | Estado     | Notas                       |
| ---- | ---------- | --------------------------- |
| 0-11 | Completado | PR #25 MERGED, Ready For QA |

---

### US Completada: SQ-16 - Edit Client Data ✅

| Paso | Estado     | Notas                       |
| ---- | ---------- | --------------------------- |
| 0-11 | Completado | PR #26 MERGED, Ready For QA |

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
- SQ-16: Edit Client Data ✅
- SQ-17: Add Client Tax Information ✅
- SQ-19: Delete Client ✅

---

### US en Trabajo Actual: SQ-21 - Create Invoice by Selecting Client

| Paso                      | Estado    | Notas                        |
| ------------------------- | --------- | ---------------------------- |
| 0. Precondiciones Epic    | Pendiente | Verificar feature-test-plan  |
| 1. Jira In Progress       | Pendiente |                              |
| 2. Implementation Plan    | Pendiente |                              |
| 3. Implementacion         | Pendiente |                              |
| 4. PR Creado              | Pendiente |                              |
| 5. Jira In Review         | Pendiente |                              |
| 6. Code Review            | Pendiente |                              |
| 7. Docs Actualizados      | Pendiente |                              |
| 8. Merge PR               | Pendiente |                              |
| 9. Jira Ready For QA      | Pendiente |                              |
| 10. Comentario Jira       | Pendiente |                              |
| 11. Preparar Siguiente US | Pendiente | Siguiente: SQ-24 (Add Taxes) |

**Siguiente paso:** PASO 0 - Verificar precondiciones del Epic SQ-20

---

_Generado por Claude Code - 2026-02-07_
