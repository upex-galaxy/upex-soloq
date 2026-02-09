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

| Key   | Story                                    | Status        | Priority | PR                        |
| ----- | ---------------------------------------- | ------------- | -------- | ------------------------- |
| SQ-21 | Create Invoice by Selecting Client       | Ready For QA  | Medium   | #29 (MERGED)              |
| SQ-22 | Add Line Items to Invoice                | Backlog       | Medium   | -                         |
| SQ-23 | Automatic Subtotal and Total Calculation | Estimation    | Medium   | #16 (MERGED - solo tests) |
| SQ-24 | Add Taxes to Invoice                     | Ready For QA  | Medium   | #32 (MERGED)              |
| SQ-25 | Add Discounts to Invoice                 | Shift-Left QA | Medium   | #24 (OPEN)                |
| SQ-26 | Preview Invoice Before Sending           | Estimation    | Medium   | #15 (MERGED - solo tests) |
| SQ-27 | Assign Unique Invoice Number             | Estimation    | Medium   | #13 (MERGED - solo tests) |
| SQ-28 | Set Invoice Due Date                     | Ready For QA  | Medium   | #33 (MERGED)              |
| SQ-29 | Add Notes and Terms to Invoice           | Ready For QA  | Medium   | #34 (MERGED)              |
| SQ-30 | Save Invoice as Draft                    | Estimation    | Medium   | -                         |

### Epic: SQ-1 - User Authentication & Onboarding

| Key  | Story                                     | Status           | Priority | PR                        |
| ---- | ----------------------------------------- | ---------------- | -------- | ------------------------- |
| SQ-2 | User Registration with Email and Password | **Ready For QA** | Highest  | #5 (MERGED - solo tests)  |
| SQ-3 | User Login with Credentials               | **Ready For QA** | Highest  | #4 (MERGED - solo tests)  |
| SQ-4 | Password Recovery via Email               | Shift-Left QA    | High     | #12 (MERGED - solo tests) |
| SQ-5 | Secure Logout                             | Shift-Left QA    | High     | -                         |

### Epic: SQ-31 - PDF Generation & Download

| Key   | Story                                 | Status        | Priority | PR           |
| ----- | ------------------------------------- | ------------- | -------- | ------------ |
| SQ-32 | Generate Professional PDF Invoice     | Ready For QA  | Medium   | #35 (MERGED) |
| SQ-33 | Include Logo and Business Data in PDF | Ready For QA  | Medium   | #36 (MERGED) |
| SQ-34 | Include Payment Methods in PDF        | Shift-Left QA | Medium   | -            |
| SQ-35 | Download PDF to Device                | Ready For QA  | Medium   | #37 (MERGED) |

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

| Orden | Key   | Story                      | Status       | PR           |
| ----- | ----- | -------------------------- | ------------ | ------------ |
| 1     | SQ-15 | List All Clients           | Ready For QA | #25 (MERGED) |
| 2     | SQ-16 | Edit Client Data           | Ready For QA | #26 (MERGED) |
| 3     | SQ-17 | Add Client Tax Information | Ready For QA | #27 (MERGED) |
| 4     | SQ-19 | Delete Client              | Ready For QA | #28 (MERGED) |

**Nota:** SQ-18 (View Client Invoice History) esta en Shift-Left QA y ademas depende de tener facturas.

### FASE 2: Invoice Creation ✅ COMPLETADA

| Orden | Key   | Story                              | Status       | PR           |
| ----- | ----- | ---------------------------------- | ------------ | ------------ |
| 5     | SQ-21 | Create Invoice by Selecting Client | Ready For QA | #29 (MERGED) |
| 6     | SQ-24 | Add Taxes to Invoice               | Ready For QA | #32 (MERGED) |
| 7     | SQ-28 | Set Invoice Due Date               | Ready For QA | #33 (MERGED) |
| 8     | SQ-29 | Add Notes and Terms to Invoice     | Ready For QA | #34 (MERGED) |

**Nota:** SQ-22, SQ-23, SQ-25, SQ-26, SQ-27, SQ-30 no estan en Ready For Dev.

### FASE 3: PDF Generation 🔶 EN PROGRESO (3/4)

| Orden | Key   | Story                             | Status        | PR           |
| ----- | ----- | --------------------------------- | ------------- | ------------ |
| 9     | SQ-32 | Generate Professional PDF Invoice | Ready For QA  | #35 (MERGED) |
| 10    | SQ-33 | Include Logo and Business Data    | Ready For QA  | #36 (MERGED) |
| 11    | SQ-35 | Download PDF to Device            | Ready For QA  | #37 (MERGED) |
| 12    | SQ-34 | Include Payment Methods in PDF    | Shift-Left QA | ⏳ BLOQUEADA |

### OMITIDAS (No Ready For Dev o Dependencias Bloqueadas)

| Key   | Story                       | Status        | Razon de Omision                         |
| ----- | --------------------------- | ------------- | ---------------------------------------- |
| SQ-2  | User Registration           | Ready For QA  | Implementado - gaps documentados en Jira |
| SQ-3  | User Login                  | Ready For QA  | Implementado - gaps documentados en Jira |
| SQ-18 | View Client Invoice History | Shift-Left QA | No Ready + Depende de invoices           |
| SQ-22 | Add Line Items              | Backlog       | No Ready For Dev                         |
| SQ-23 | Auto Calculation            | Estimation    | No Ready For Dev                         |
| SQ-25 | Add Discounts               | Shift-Left QA | No Ready For Dev                         |
| SQ-26 | Preview Invoice             | Estimation    | No Ready For Dev                         |
| SQ-27 | Unique Invoice Number       | Estimation    | No Ready For Dev                         |
| SQ-30 | Save as Draft               | Estimation    | No Ready For Dev                         |
| SQ-34 | Payment Methods in PDF      | Shift-Left QA | No Ready For Dev                         |

---

## Resumen Ejecutivo

### User Stories Implementadas

```
FASE 1 - Client Management ✅ COMPLETADA
  1. SQ-15: List All Clients ✅
  2. SQ-16: Edit Client Data ✅
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

- **Total US implementadas:** 13/13 del roadmap (incluye Auth)
- **US en Ready For QA:** 13 (listas para testing)
- **US bloqueadas (Shift-Left QA):** 1 (SQ-34)
- **US en Ready For Dev:** 0

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

### ⚠️ Estado Actual: BLOQUEADO

**SQ-34 (Include Payment Methods in PDF)** está en **Shift-Left QA**.
No hay más US en "Ready For Dev" en el roadmap principal.

**Opciones disponibles:**

1. Esperar a que SQ-34 pase a Ready For Dev
2. Pasar a QA manual de las 13 US en Ready For QA

---

_Actualizado por Claude Code - 2026-02-09 (SQ-2 y SQ-3 movidos a Ready For QA)_
