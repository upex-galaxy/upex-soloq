# Comments for SQ-22

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-22)

---

### Ely - 2/18/2026, 4:50:42 AM

## 🧪 Acceptance Test Plan - Generated 2026-02-18

***QA Engineer:*** Ely (Shift-Left Analysis)
***Status:*** Draft - Pending PO/Dev Review

## 

## 📊 Test Coverage Summary

***Total Test Cases:*** 15

| ***Type **** | ****Count *** |
| --- | --- |
| Positive  | 6  |
| Negative  | 4  |
| Boundary  | 3  |
| Integration  | 2  |

***Complexity:*** High
***Estimated Effort:*** 2-3 days

## 

## 🎯 Test Outlines

### Positive Tests (6)

1. ***Validar agregar primer line item con datos válidos***
2. ***Validar agregar múltiples line items***
3. ***Validar cálculo automático de line total*** (Parametrized)
4. ***Validar edición de line item existente***
5. ***Validar eliminación de line item (múltiples items)***
6. ***Validar reordenar items via drag-and-drop*** (MVP Optional)

### Negative Tests (4)

1. ***Validar prevención de eliminar último item***
2. ***Validar error con descripción vacía*** (Parametrized)
3. ***Validar error con quantity inválido*** (Parametrized)
4. ***Validar error con precio negativo***

### Boundary Tests (3)

1. ***Validar límite de caracteres en descripción (500)***
2. ***Validar valores boundary en cálculos***
3. ***Validar precio $0 permitido***

### Integration Tests (2)

1. ***Validar integridad de datos al guardar factura con items***
2. ***Validar actualización de items existentes vía API***

## 🚨 Critical Questions for Team

### For PO:

***Q1:*** ¿Cuál es el máximo de line items por factura?

- **Impact:** Sin límite definido, no podemos probar boundary cases.
- **Suggestion:** 50 items (per Feature Test Plan)

***Q2:*** ¿Se permiten descripciones con solo espacios en blanco?

- **Impact:** Afecta validación negativa.
- **Suggestion:** No, requerir al menos 1 caracter no-whitespace.

### For Dev:

***Q3:*** ¿Quantity permite decimales? (ej: 2.5 horas)

- **Impact:** Afecta input type y validación.
- **Suggestion:** Sí, DB usa DECIMAL(10,2).

## 💡 Suggested Story Improvements

1. ***Add AC for minimum items:*** "Given 1 item, When delete attempted, Then prevent with message"
2. ***Add validation messages:*** Specify exact error messages for each validation
3. ***Clarify drag-and-drop:*** Confirm if MVP-optional or required

## 📢 Action Required

***@PO:***

- [ ] Answer Q1 and Q2 above
- [ ] Validate suggested story improvements

***@Dev:***

- [ ] Answer Q3 above
- [ ] Confirm validation behavior

***@QA Team:***

- [ ] Review test cases for completeness
- [ ] Prepare test data

## 📎 Documentation

***Local Test Plan:*** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-22-add-line-items/acceptance-test-plan.md`

## 

⚠️ ***BLOCKER:*** Dev should NOT start implementation until critical questions are answered.

---

### Ely - 2/18/2026, 5:05:04 AM

## 📣 Respuestas a Preguntas Críticas (PO/Dev)

***Fecha:*** 2026-02-18
***Respondido por:*** PO + Dev Lead

## 

### ✅ Q1 (PO): ¿Cuál es el máximo de line items por factura?

***Respuesta:**** ****50 items***

***Justificación:***

- El 95% de facturas de freelancers tienen entre 1-15 items
- 50 items cubre casos extremos (ej: horas detalladas por día, catálogo de productos)
- Referencia de mercado: QuickBooks permite 100, FreshBooks advierte después de 50
- Para MVP de freelancers latinoamericanos, 50 es más que suficiente
- Límite protege performance de UI (renderizado de tabla) y PDF generation

***Implementación:***

- Validación frontend: mostrar warning en item 45, bloquear en 50
- Validación backend: rechazar con error `MAX*ITEMS*EXCEEDED`
- Mensaje de error: "Máximo 50 items por factura"

### ✅ Q2 (PO): ¿Se permiten descripciones con solo espacios en blanco?

***Respuesta:**** ****No***

***Justificación:***

- Una descripción vacía o solo espacios no aporta valor al cliente
- Estándar de UX: `trim()` + validar `length > 0`
- Evita datos basura en DB y PDFs con líneas vacías

***Implementación:***

- Validación: `description.trim().length >= 1`
- Mensaje de error: "La descripción es requerida"
- UI: No permitir submit si campo está vacío o solo espacios

### ✅ Q3 (Dev): ¿Quantity permite valores decimales?

***Respuesta:**** ****Sí, hasta 2 decimales***

***Justificación:***

- Casos de uso reales:
- DB ya soporta: `DECIMAL(10,2)`
- Freelancers cobran frecuentemente por fracciones de tiempo

***Implementación:***

- Input type: `number` con `step="0.01"`
- Validación: `quantity > 0` (no permite 0 ni negativos)
- Precisión: 2 decimales máximo
- Display: Mostrar siempre 2 decimales en UI (ej: "2.50")

## 📋 Resumen de Reglas de Negocio Confirmadas

| ***Campo **** | ****Validación **** | ****Mensaje de Error *** |
| --- | --- | --- |
| description  | `trim().length >= 1` y `[= 500`  | "La descripción es requerida" / "Máximo 500 caracteres"  |
| quantity  | `] 0`, decimales permitidos (max 2)  | "La cantidad debe ser mayor a 0"  |
| unit_price  | `>= 0`, decimales permitidos (max 2)  | "El precio debe ser mayor o igual a 0"  |
| max_items  | `<= 50`  | "Máximo 50 items por factura"  |

## 

## ✅ Story Ready for Implementation

Con estas respuestas, la story [https://upexgalaxy65.atlassian.net/browse/SQ-22#icft=SQ-22](https://upexgalaxy65.atlassian.net/browse/SQ-22#icft=SQ-22) está lista para desarrollo.

***Checklist:***

- [x] Todas las preguntas críticas respondidas
- [x] Reglas de negocio definidas
- [x] Mensajes de error especificados
- [x] Edge cases cubiertos

***Next:*** Dev puede iniciar implementación. QA actualizará test plan con estas definiciones.

---

### Ely - 2/18/2026, 5:37:54 AM

✅ Shift-Left QA completado. ATP aprobado con todas las preguntas críticas resueltas. PR #55 mergeado a staging. Ready for implementation.

---

### Automation for Jira - 2/18/2026, 12:04:32 PM

🔎 Pull Request created. Task is pending to ANALYZE and REVIEW by the team. Waiting for PR Approval.

---

### Automation for Jira - 2/18/2026, 12:09:56 PM

✅ Pull Request is successfully MERGED. Task is Done.

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:50.166Z_
