# Comments for SQ-28

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-28)

---

### Yaneth Quintero - 2/1/2026, 10:10:35 PM

## User Story

***As a*** user
***I want to*** set a due date
***So that*** I can define when I expect payment

## Acceptance Criteria

### Scenario 1: Set specific due date

- ***Given:*** I am creating an invoice
- ***When:*** I select a due date from the calendar
- ***Then:*** The due date is saved

***Notas:*** 

- ¿Los días para los preajustes son días calendario (incluyendo fines de semana y feriados) o días hábiles?
- ¿Es el campo due_date obligatorio para guardar una factura, o puede dejarse en blanco (sin vencimiento)?

### Scenario 2: Quick presets

- ***Given:*** I am setting a due date
- ***When:*** I click "Net 15" or "Net 30"
- ***Then:*** Due date is set to 15/30 days from today

***Notas:***

- En este **Escenario 2** se mencionan solo " 15 y 30", pero en las **Notas Técnicas** se listan "7, 15, 30, 60". ¿Cuáles debemos mostrar?

### Scenario 3: Due date appears on invoice

- ***Given:*** I set a due date
- ***When:*** I view/generate the invoice
- ***Then:*** Due date is clearly displayed

***Notas:***

- En el **Escenario 3**, ¿Qué formato de fecha debemos usar? (DD/MM/AAAA, MM/DD/AAAA, o formato amigable como "15 de Oct")?
-  Si selecciono "Net 30" y luego cambio manualmente la fecha en el calendario, ¿se desmarca el botón de "Net 30"?
- ¿Se puede modificar la fecha de vencimiento una vez que la factura ha sido enviada al cliente o marcada como "finalizada"?

### Scenario 4: Overdue detection

- ***Given:*** Due date has passed and invoice is unpaid
- ***When:*** System checks invoices
- ***Then:*** Invoice status changes to "overdue"

***Notas:***

- ¿El sistema debe permitir seleccionar una fecha de vencimiento anterior al día de hoy (en el pasado)?
- Cuando cambia el estado a "Overdue", ¿el sistema debe notificar a alguien (email al usuario o al cliente)? O solo es un cambio de estado.

## Technical Notes

- Field: due_date (date)
- Presets: Net 7, Net 15, Net 30, Net 60
- Cron job to mark overdue invoices

***Feature Test Plan:***

# Test Cases: STORY-SQ-28 - Set Invoice Due Date

***Fecha:*** 2026-02-02

***QA Engineer:*** Gemini

***Story Jira Key:*** [https://upexgalaxy65.atlassian.net/browse/SQ-28#icft=SQ-28](https://upexgalaxy65.atlassian.net/browse/SQ-28#icft=SQ-28)

***Epic:*** EPIC-SQ-20 - Invoice Creation

***Status:*** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

***User Persona Affected:***

- ***Primary:*** Carlos (Diseñador Organizado) - Quiere que sus facturas tengan fechas de vencimiento claras para proyectar profesionalismo y saber cuándo hacer seguimiento.
- ***Secondary:*** Valentina (Desarrolladora Internacional) - Necesita fechas de vencimiento precisas para que sus recordatorios automáticos funcionen correctamente.

***Business Value:***

- ***Value Proposition:*** Define claramente cuándo se espera el pago, reduciendo la ambigüedad y mejorando la predictibilidad del cash flow.
- ***Business Impact:*** Es un campo clave para habilitar el seguimiento de facturas vencidas (EPIC-007) y los recordatorios automáticos (EPIC-009), que son un diferenciador del plan Pro.

***Related User Journey:***

- ***Journey:*** Journey 1: Registro y Primera Factura
- ***Step:*** Step 11: Configurar Fecha y Número

---

### Technical Context of This Story

***Architecture Components:***

***Frontend:***

- ***Components:*** `InvoiceForm`, `DatePicker` (de shadcn/ui), `DueDatePresets` (nuevo componente).
- ***Pages/Routes:*** `/invoices/new`, `/invoices/[id]/edit`
- ***State Management:*** `react-hook-form` para manejar el estado del formulario de la factura.

***Backend:***

- ***API Endpoints:*** `POST /api/invoices`, `PUT /api/invoices/{invoiceId`}
- ***Services:*** El servicio de facturas que procesa la creación y actualización.
- ***Database:*** Tabla `invoices`, campo `due_date` (DATE).

***External Services:***

- Ninguno directamente.

***Integration Points:***

- ***UI ↔ React Hook Form:*** El DatePicker actualiza el estado del formulario.
- ***Frontend ↔ Backend API:*** El valor de `dueDate` se envía en el payload al crear/actualizar una factura.
- ***Backend API ↔ Database:*** El valor de `dueDate` se persiste en la columna `invoices.due_date`.

---

### Story Complexity Analysis

***Overall Complexity:*** Low

***Complexity Factors:***

- ***Business logic complexity:*** Low - La lógica principal es calcular fechas (hoy + X días).
- ***Integration complexity:*** Low - Es un campo estándar en el formulario de facturas.
- ***Data validation complexity:*** Medium - Incluye validación de fechas pasadas, lo que requiere una interacción específica (warning).
- ***UI complexity:*** Medium - Requiere un `DatePicker` con presets custom, lo que puede no ser estándar.

***Estimated Test Effort:*** Low

***Rationale:*** Aunque tiene varios escenarios, la funcionalidad está contenida en un solo componente y tiene un impacto limitado en el resto del sistema más allá de almacenar la fecha.

---

### Epic-Level Context (From Feature Test Plan in Jira)

***⚠️ IMPORTANTE:*** No se pudo acceder a los comentarios de Jira. Este análisis se basa en los archivos `.md` locales del epic.

***Critical Risks Already Identified at Epic Level:***

- No aplica directamente a esta story. Los riesgos del epic se centran en cálculos y consistencia de datos, la fecha de vencimiento es un input directo.

***Integration Points from Epic Analysis:***

- ***Integration Point 1:*** Frontend ↔ Backend API

***Critical Questions Already Asked at Epic Level:***

- No hay preguntas a nivel de epic que impacten directamente esta story.

***Test Strategy from Epic:***

- ***Test Levels:*** Unit, Integration, E2E
- ***Tools:*** Vitest, Playwright
- ***How This Story Aligns:***

***Summary: How This Story Fits in Epic:***

- ***Story Role in Epic:*** Implementa uno de los campos fundamentales de una factura, la fecha de vencimiento, completando los datos de cabecera de la factura.
- ***Inherited Risks:*** Hereda el riesgo general de consistencia de datos entre el frontend y el backend para el formulario de factura.
- ***Unique Considerations:*** La advertencia para fechas pasadas es un comportamiento único de este campo.

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

***Ambiguity 1:*** ¿Qué significa "I see a warning but can still proceed"?

- ***Location in Story:*** Acceptance Criteria, Scenario 5
- ***Question for PO/Dev:*** ¿Cómo es la advertencia? ¿Un toast? ¿Un mensaje debajo del campo? ¿Un modal de confirmación al guardar? El comportamiento "can still proceed" sugiere que no es un bloqueo, pero la implementación puede variar mucho.
- ***Impact on Testing:*** No se puede probar el mecanismo de advertencia sin saber cómo debe ser.
- ***Suggested Clarification:*** "Then: A non-blocking warning message appears below the date field, and the form can still be submitted."

***Ambiguity 2:*** ¿Qué zona horaria se usa para "today"?

- ***Location in Story:*** Acceptance Criteria, Scenario 1 & Technical Notes
- ***Question for PO/Dev:*** La nota técnica dice "user's local timezone", pero ¿cómo se asegura esto? ¿Se basa en el navegador del cliente o en la zona horaria del servidor?
- ***Impact on Testing:*** Podrían ocurrir errores de un día de diferencia si hay un mismatch de zona horaria entre el frontend y el backend al calcular "hoy + 30 días".
- ***Suggested Clarification:*** "The default due date is calculated as `new Date()` in the user's browser + 30 days. The backend should interpret the received date string correctly."

---

### Missing Information / Gaps

✅ Story has complete information for testing, asumiendo que las ambigüedades se clarifican.

---

### Edge Cases NOT Covered in Original Story

***Edge Case 1:*** Año bisiesto

- ***Scenario:*** Si la fecha de hoy es, por ejemplo, 29 de Enero y el preset es +30 días en un año no bisiesto, ¿el cálculo es correcto? (La mayoría de las librerías de fechas manejan esto, pero vale la pena un test).
- ***Expected Behavior:*** La librería de fechas debe calcular la fecha correcta.
- ***Criticality:*** Low
- ***Action Required:*** Add to test cases only.

***Edge Case 2:*** Selección de "Hoy" como fecha de vencimiento.

- ***Scenario:*** El usuario selecciona el preset "Today".
- ***Expected Behavior:*** La fecha de vencimiento es la fecha actual. El sistema debe permitirlo.
- ***Criticality:*** Medium
- ***Action Required:*** Add to refined AC and test cases.

***Edge Case 3:*** El usuario abre el selector y lo cierra sin seleccionar nada.

- ***Scenario:*** El usuario hace clic en el campo de fecha, se abre el selector, pero luego hace clic fuera sin cambiar la fecha.
- ***Expected Behavior:*** La fecha debe permanecer sin cambios (el valor por defecto si es una nueva factura, o el valor guardado si es una edición).
- ***Criticality:*** Medium
- ***Action Required:*** Add to test cases only.

---

### Testability Validation

***Is this story testeable as written?*** ⚠️ Partially

***Testability Issues (if any):***

- Acceptance criteria are vague or subjective (la naturaleza de la "advertencia").

***Recommendations to Improve Testability:***

- Definir explícitamente el comportamiento y la apariencia de la advertencia de fecha pasada. Ejemplo: "Un texto de ayuda de color amarillo/naranja aparecerá debajo del campo de fecha con el mensaje: 'La fecha de vencimiento está en el pasado'".

---

## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Default due date on new invoice

- ***Given:*** I am on the "new invoice" page
- ***When:*** The invoice form finishes loading
- ***Then:*** The "Due Date" field is populated with the date corresponding to today's date plus 30 days, calculated in the user's local timezone.

### Scenario 2: Open date picker

- ***Given:*** I am on the invoice creation/edition form
- ***When:*** I click on the "Due Date" input field
- ***Then:*** A calendar-based date picker appears, showing the currently selected month.

### Scenario 3: Use quick presets

- ***Given:*** The due date picker is open
- ***When:*** I view the available presets
- ***Then:*** I see buttons for "Today", "15 days", "30 days", "45 days", and "60 days".
- ***And When:*** I click the "15 days" preset
- ***Then:*** The date picker closes and the input field shows the date for today + 15 days.

### Scenario 4: Select a custom future date

- ***Given:*** The due date picker is open
- ***When:*** I navigate to the next month and select the 10th day
- ***Then:*** The date picker closes and the input field shows the selected date (e.g., March 10, 2026).

### Scenario 5: Select a past date (Refined)

- ***Given:*** I am creating an invoice and the due date defaults to 30 days in the future
- ***When:*** I open the date picker and select a date from last week
- ***Then:*** A non-blocking warning message appears below the date field stating "Warning: The due date is in the past."
- ***And When:*** I click the "Save Invoice" button
- ***Then:*** The invoice is saved successfully with the past due date.

### Scenario 6: Select "Today" as due date (Edge Case)

- ***Given:*** The due date picker is open
- ***When:*** I click the "Today" preset
- ***Then:*** The date picker closes and the input field shows today's date.
- ***And:*** No warning message is displayed.

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

***Total Test Cases Needed:*** 6

- Positive: 4
- Negative: 1 (la advertencia de fecha pasada)
- Boundary: 1

### Test Outlines

#### ***TC-SQ28-01: Validar fecha de vencimiento por defecto en nueva factura***

- ***Related Scenario:*** Scenario 1 (Refined)
- ***Type:*** Positive
- ***Priority:*** Critical
- ***Test Level:*** E2E
- ***Preconditions:***
- ***Test Steps:***

1. Navegar a la página de "Crear Factura".

- ***Expected Result:***

#### ***TC-SQ28-02: Validar selección de fecha de vencimiento con presets***

- ***Related Scenario:*** Scenario 3 (Refined)
- ***Type:*** Positive
- ***Priority:*** High
- ***Test Level:*** E2E
- ***Preconditions:***
- ***Test Steps:***

1. Hacer clic en el campo "Due Date".

- ***Expected Result:***

#### ***TC-SQ28-03: Validar selección de fecha de vencimiento custom***

- ***Related Scenario:*** Scenario 4 (Refined)
- ***Type:*** Positive
- ***Priority:*** High
- ***Test Level:*** E2E
- ***Preconditions:***
- ***Test Steps:***

1. Hacer clic en el campo "Due Date".

- ***Expected Result:***

#### ***TC-SQ28-04: Validar advertencia al seleccionar fecha pasada***

- ***Related Scenario:*** Scenario 5 (Refined)
- ***Type:*** Negative
- ***Priority:*** High
- ***Test Level:*** E2E
- ***Preconditions:***
- ***Test Steps:***

1. Hacer clic en el campo "Due Date".

- ***Expected Result:***

#### ***TC-SQ28-05: Validar selección de "Hoy" como fecha de vencimiento***

- ***Related Scenario:*** Scenario 6 (Refined)
- ***Type:*** Boundary
- ***Priority:*** Medium
- ***Test Level:*** E2E
- ***Preconditions:***
- ***Test Steps:***

1. Hacer clic en el campo "Due Date".

- ***Expected Result:***

#### ***TC-SQ28-06: Validar que cerrar el picker no cambia la fecha***

- ***Related Scenario:*** Edge Case 3
- ***Type:*** Positive
- ***Priority:*** Medium
- ***Test Level:*** E2E
- ***Preconditions:***
- ***Test Steps:***

1. Hacer clic en el campo "Due Date" para abrir el picker.

- ***Expected Result:***

---

## 📝 PARTE 2: Integración y Output

### Paso 8: Final QA Feedback Report

---

## ✅ Shift-Left Test Cases - Execution Summary

***Story:*** [https://upexgalaxy65.atlassian.net/browse/SQ-28#icft=SQ-28](https://upexgalaxy65.atlassian.net/browse/SQ-28#icft=SQ-28) - Set Invoice Due Date

***Analysis Date:*** 2026-02-02

---

### 📊 Summary for PO/Dev

***Story Quality Assessment:*** ✅ Good

***Key Findings:***

1. La story es clara, pero el comportamiento de la "advertencia" para fechas pasadas necesita ser definido con más precisión para asegurar una implementación y testing correctos.
2. Se identificó un edge case importante: la selección de "Hoy" como fecha de vencimiento, que debería ser un comportamiento válido y sin advertencias.

---

### 🚨 Critical Questions for PO

***Question 1:*** ¿Cuál debe ser el diseño y comportamiento exacto de la "advertencia" cuando se selecciona una fecha de vencimiento en el pasado?

- ***Context:*** El AC dice "I see a warning but can still proceed". Esto puede ser un texto debajo del campo, un toast, o un popover.
- ***Impact if not answered:*** El equipo de desarrollo puede implementar una solución que no se alinee con la experiencia de usuario deseada, y el equipo de QA no puede escribir un test preciso para validarlo.
- ***Suggested Answer:*** "Un texto de ayuda de color naranja aparecerá debajo del campo de fecha con el mensaje: 'La fecha de vencimiento está en el pasado'. No debe impedir que el formulario se guarde."

---

### 🔧 Technical Questions for Dev

***Question 1:*** ¿Cómo nos aseguraremos de que el cálculo de fechas por defecto (hoy + X días) es consistente entre el frontend y el backend, considerando las zonas horarias?

- ***Context:*** El AC de la story menciona "user's local timezone". Si el frontend calcula la fecha y la envía como un string (e.g., "2026-03-04"), ¿cómo se asegura el backend de interpretarla correctamente sin que la zona horaria del servidor cause un error de un día?
- ***Impact on Testing:*** Los tests automatizados que corran en un servidor de CI (posiblemente en UTC) podrían fallar si no se maneja bien la zona horaria.

---

### ✅ What Was Done

***Jira Updates:***

- ⚠️ No se pudo actualizar Jira ya que no tengo acceso a las herramientas MCP de Atlassian. El contenido refinado y los test cases están listos para ser copiados.
- Se recomienda añadir el label `shift-left-reviewed`.

***Local Files:***

- ✅ `test-cases.md` creado en: `.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-28-due-date/`

***Test Coverage:***

- Total test cases designed: 6

---

### 🎯 Next Steps (Team Action Required)

1. ***PO:*** Review critical questions y definir el comportamiento de la advertencia.
2. ***Dev:*** Confirmar la estrategia de manejo de zonas horarias para las fechas.
3. ***QA:*** Una vez clarificadas las preguntas, finalizar los detalles de los test cases.

---

***⚠️ BLOCKER:*** Dev should NOT start implementation until the "warning" behavior is clarified by the PO.

***Local Test Cases:*** `.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-28-due-date/test-cases.md`

---

### Ely - 2/8/2026, 12:19:44 AM

Feature implementada y desplegada en staging.

***PR:*** [#33](https://github.com/upex-galaxy/upex-soloq/pull/33) (MERGED)
***Branch:*** feat/[https://upexgalaxy65.atlassian.net/browse/SQ-28#icft=SQ-28](https://upexgalaxy65.atlassian.net/browse/SQ-28#icft=SQ-28)/due-date-picker

***Cambios implementados:***

- DueDatePicker component con presets rápidos (Hoy, 15, 30, 45, 60 días)
- Warning visual para fechas pasadas (non-blocking)
- Input nativo type="date" para compatibilidad cross-browser
- Data-testids para todos los elementos interactivos

@Yaneth Quintero La funcionalidad está lista para pruebas en staging.

---

### Yaneth Quintero - 2/17/2026, 3:45:56 PM

@@Ely  se reportó el defecto  [https://upexgalaxy65.atlassian.net/browse/SQ-74](https://upexgalaxy65.atlassian.net/browse/SQ-74) 

| ***ID**** | ****Test Case**** | ****Status**** | ****Evidence*** |
| --- | --- | --- | --- |
| ***TC-SQ28-01*** | Validar fecha de vencimiento por defecto | :check*mark: PASSED | El campo due*date debe mostrar hoy + 30 días al cargar. |
| ***TC-SQ28-02*** | Validar el uso de Presets rápidos (15, 30, 45, 60) | :check_mark: PASSED | La fecha se calcula como hoy + 15/30 días. Se muestran los 4 botones definidos en notas técnicas. |
| ***TC-SQ28-03*** | Validar la selección manual vía calendario | :check_mark: PASSED | El campo se actualiza a la fecha seleccionada y se guarda correctamente. |
| ***TC-SQ28-04*** | Validar advertencia al seleccionar fecha pasada | :check_mark: PASSED | Aparece el mensaje "Warning: The due date is in the past". |
| ***TC-SQ28-05*** | Validar selección de "Hoy" como vencimiento |  :x: FAILED | Permite seleccionar la fecha actual sin mostrar advertencias. |
| ***TC-SQ28-06*** | Validar persistencia al cerrar el picker | :check_mark: PASSED | Hacer clic fuera del picker no debe resetear el valor del campo. |
| ***TC-SQ28-07*** | Validar desmarcar preset al cambio manual | :check_mark: PASSED | El botón de preset "Net 30" se desmarca visualmente al no coincidir ya con la fecha. |

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:52.512Z_
