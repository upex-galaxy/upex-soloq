# Comments for SQ-30

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-30)

---

### Luis Eduardo Flores Villarroel - 2/7/2026, 8:05:37 PM

## 📋 Shift-Left QA: Test Cases for [https://upexgalaxy65.atlassian.net/browse/SQ-30#icft=SQ-30](https://upexgalaxy65.atlassian.net/browse/SQ-30#icft=SQ-30) - Save Invoice as Draft

***Date:*** 2026-02-07
***QA Engineer:*** Luis Eduardo Flores Villarroel
***Status:*** Draft - Pending Review

## 

### Analysis Summary

***Story Complexity:*** Medium
***Total Test Cases:*** 12 (6 Positive, 3 Negative, 1 Boundary, 2 Integration)

### Critical Findings

***Ambiguities Detected (3):***

1. ***Auto-save timing discrepancy:**** Story says "every 30s" but Dev response in [https://upexgalaxy65.atlassian.net/browse/SQ-20#icft=SQ-20](https://upexgalaxy65.atlassian.net/browse/SQ-20#icft=SQ-20) says "2-second debounce". **Recommendation:* Use debounce 2s as Dev specified.
2. ***Delete behavior undefined:**** Story says "Soft delete (or hard delete)". **Recommendation:* Hard delete for drafts (no history needed).
3. ***Send validation not specified:**** Missing what happens when trying to send incomplete draft. **Recommendation:* Per PO response in [https://upexgalaxy65.atlassian.net/browse/SQ-20#icft=SQ-20](https://upexgalaxy65.atlassian.net/browse/SQ-20#icft=SQ-20): client + 1 item + due date required for send.

***Missing Gaps Identified (3):***

1. No limit on drafts per user
2. No offline/error handling for auto-save
3. No rule for empty form navigation (create → leave without data)

***Edge Cases Added (5):***

- Auto-save failure handling (offline)
- Empty form creates no draft
- Unsaved changes warning on navigation
- Prevent deleting non-draft invoices
- Browser crash recovery (via auto-save)

### Test Cases Summary Table

|  | ***Test Case **** | ****Type **** | ****Priority *** |
| --- | --- | --- |
| TC-01  | Save invoice as draft with manual button  | Positive  | Critical  |
| TC-02  | Auto-save after 2s debounce  | Positive  | Critical  |
| TC-03  | Filter invoices list to show only drafts  | Positive  | High  |
| TC-04  | Resume editing draft with all data intact  | Positive  | Critical  |
| TC-05  | Delete draft with confirmation  | Positive  | High  |
| TC-06  | Transition draft to sent with validation  | Positive  | Critical  |
| TC-07  | Reject sending incomplete draft  | Negative  | High  |
| TC-08  | Drafts not counted as pending in dashboard  | Positive  | Medium  |
| TC-09  | Auto-save failure handling  | Negative  | High  |
| TC-10  | No empty draft on page visit without data  | Boundary  | Medium  |
| TC-11  | Unsaved changes warning  | Positive  | Medium  |
| TC-12  | Prevent deleting non-draft invoices  | Negative  | High  |

### Integration Tests (2)

1. Auto-save → API → DB round-trip
2. Draft → Sent status transition with email

### Documentation

***Local:*** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-30-save-draft/test-cases.md`

***PR:*** Pending creation

## 

⚠️ ***Action Required:***

- @PO: Review 3 ambiguities and confirm recommendations
- @Dev: Confirm debounce timing and delete behavior

---

### Luis Eduardo Flores Villarroel - 2/7/2026, 8:58:38 PM

@@Ely ya esta listo el shift left capaz voy a necesitar una meetin para resolver este problema con el hook que fue el error que me dio al instalar las dependencias te pego el error que me arrojo la IA mientras hacia el shift left

”El pre-commit hook (husky/lint-staged) está fallando porque las dependencias no están instaladas correctamente (el problema de package.json que mencionaste). Voy a hacer el commit saltando el hook ya que    
este es un archivo de documentación .md que no necesita linting.”

---

### Luis Eduardo Flores Villarroel - 2/9/2026, 9:16:33 PM

## Estimación: 5 Story Points

**Fecha:** 2026-02-10
**Estimado por:** Luis Eduardo Flores Villarroel (con apoyo de análisis de código e IA)

## 

### Justificación

Se revisó el código actual del repositorio, la especificación en `.context/`, y el análisis Shift-Left QA (12 test cases). La estimación original de 2 SP subestima el alcance real de esta historia.

### Alcance real de desarrollo

El **Escenario 1 (Save as draft)** ya fue implementado en [https://upexgalaxy65.atlassian.net/browse/SQ-21#icft=SQ-21](https://upexgalaxy65.atlassian.net/browse/SQ-21#icft=SQ-21), por lo que el esfuerzo real de [https://upexgalaxy65.atlassian.net/browse/SQ-30#icft=SQ-30](https://upexgalaxy65.atlassian.net/browse/SQ-30#icft=SQ-30) se concentra en los escenarios 2-6:

**Backend (4 endpoints nuevos):**

- `GET /api/invoices` — Listar invoices con filtros por status, paginación
- `GET /api/invoices/[id]` — Obtener invoice individual
- `PUT /api/invoices/[id]` — Actualizar invoice (auto-save + edición manual)
- `DELETE /api/invoices/[id]` — Eliminar draft

**Frontend (2 páginas nuevas):**

- `/invoices` — Página de listado completa (actualmente es placeholder "Coming Soon"). Requiere tabla, filtros por status, empty states, skeleton loading
- `/invoices/[id]` — Página de detalle/edición con carga de datos existentes

**Hooks nuevos (4):**

- `useInvoices`, `useInvoice`, `useUpdateInvoice`, `useDeleteInvoice`

**Features técnicamente complejas:**

- Auto-save con debounce 2s (dirty state tracking, error recovery, race conditions, UX feedback)
- Diálogo de confirmación de eliminación
- Warning de "unsaved changes" al navegar

### Esfuerzo de testing (incluido en la estimación)

Del Shift-Left QA:

- ***12 test cases*** (6 positivos, 3 negativos, 1 boundary, 2 integración)
- ***5 edge cases*** adicionales (offline, empty form, crash recovery, unsaved changes)
- ***3 ambiguedades*** que podrían generar retrabajo
- El testing de auto-save es particularmente complejo por timing y estados intermedios

### Comparación con historias del mismo epic

| ***Story**** | ****SP**** | ****Scope*** |
| --- | --- | --- |
| [https://upexgalaxy65.atlassian.net/browse/SQ-21#icft=SQ-21](https://upexgalaxy65.atlassian.net/browse/SQ-21#icft=SQ-21) Create Invoice (Client Selection) | 3 | 1 API, 1 page, 2 components |
| [https://upexgalaxy65.atlassian.net/browse/SQ-22#icft=SQ-22](https://upexgalaxy65.atlassian.net/browse/SQ-22#icft=SQ-22) Add Line Items | 5 | CRUD de items, UI dinámica |
| **SQ-30 Save as Draft** | **5** | **4 APIs, 2 pages, auto-save, filtros, delete + 12 TCs** |

[https://upexgalaxy65.atlassian.net/browse/SQ-30#icft=SQ-30](https://upexgalaxy65.atlassian.net/browse/SQ-30#icft=SQ-30) tiene **más scope que SQ-21** (3 pts) y es comparable a [https://upexgalaxy65.atlassian.net/browse/SQ-22#icft=SQ-22](https://upexgalaxy65.atlassian.net/browse/SQ-22#icft=SQ-22) (5 pts).

### Alternativa para reducir a 3 SP

Si se desea reducir la estimación, se podría sacar el **auto-save (Escenario 2)** como historia separada, ya que es la feature con mayor complejidad técnica. Sin auto-save, el scope se reduce a CRUD básico de drafts ≈ 3 SP.

---

### Luis Eduardo Flores Villarroel - 2/9/2026, 9:18:37 PM

@@Ely listo Ely ya hice la estimación y de el resumen del análisis en los comentarios

---

### Automation for Jira - 2/12/2026, 1:05:25 PM

🔎 Pull Request created. Task is pending to ANALYZE and REVIEW by the team. Waiting for PR Approval.

---

### Automation for Jira - 2/12/2026, 1:23:28 PM

✅ Pull Request is successfully MERGED. Task is Done.

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:53.619Z_
