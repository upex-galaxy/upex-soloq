# Comments for SQ-48

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-48)

---

### Joel Armando Ramírez Rodríguez - 16/3/2026, 10:15:00

# Acceptance Test Plan: STORY-SQ-48 - Filter invoices by status

***Fecha:*** 2026-03-16  

***QA Engineer:*** AI-Generated  

***Story Jira Key:*** SQ-48  

***Epic:*** EPIC-SQ-38 - Invoice Dashboard & Tracking  

***Status:*** Draft - Pending PO/Dev Review

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

***User Persona Affected:***

- ***Primary:*** Carlos (Disenador Organizado) - necesita encontrar rapido facturas por estado para no perder seguimiento.
- ***Secondary:*** Valentina (Desarrolladora Internacional) - depende de identificar `sent` y `overdue` para acelerar cobros.

***Business Value:***

- ***Value Proposition:*** mejora visibilidad operativa diaria en el dashboard sin friccion.
- ***Business Impact:*** aporta a MAU y a reduccion de tiempo de cobro, al facilitar acciones sobre facturas pendientes/vencidas.

***Related User Journey:***

- Journey: ***Journey 2 - Seguimiento y Cobro de Factura***
- Step: ***Step 1-2*** (ver dashboard e identificar factura vencida)

---

### Technical Context of This Story

***Frontend:***

- Componentes: tabs de estado, badges de conteo, tabla/lista de facturas, estado vacio por filtro.
- Pages/Routes: `/(app)/dashboard` y persistencia de filtro en URL.

***Backend:***

- API Endpoints: `GET /api/invoices` (query `status`) y soporte de respuesta consistente con conteos.
- Services: logica de filtrado por estado y regla derivada de overdue.
- Database: tabla `invoices` (status, due*date, paid*at) + joins con `clients` para listado.

***Integration Points:***

- Frontend tabs ↔ `GET /api/invoices?status=...`
- Badges de tabs ↔ conteos retornados por backend o calculados en vista
- Regla overdue derivada: `status='sent' AND due_date < today`

---

### Story Complexity Analysis

***Overall Complexity:*** Medium

***Complexity Factors:***

- Business logic complexity: ***Medium*** - incluye estado derivado (`overdue`) y consistencia de conteos.
- Integration complexity: ***Medium*** - tabs, query params, render y persistencia URL.
- Data validation complexity: ***Medium*** - edge cases de fechas limite y combinaciones de estado.
- UI complexity: ***Low/Medium*** - interaccion simple, pero sensible a race conditions y feedback visual.

***Estimated Test Effort:*** Medium

---

### Epic-Level Context (From Jira Epic Comments)

***Critical Risks inherited from Epic SQ-38:***

- Riesgo de inconsistencia entre listado y resumen por reglas de overdue/timezone.
- Riesgo de resultados incorrectos en combinaciones de filtros + busqueda + paginacion.

***Integration Points from Epic Analysis that apply:***

- Frontend dashboard ↔ `GET /api/invoices` ✅ Yes
- Backend API ↔ DB con RLS ✅ Yes
- Payment flow refresh ↔ dashboard ⚠️ Parcial para SQ-48 (consistencia futura)

***Critical Questions already seen at Epic level (relevant):***

- Definicion de timezone para evaluar overdue.
- Diferencia funcional entre `pending` y `sent` en narrativa de producto.

***How this story fits the epic:***

- SQ-48 implementa la navegacion principal por estado dentro del dashboard (base para SQ-49, SQ-50, SQ-51 y SQ-52).

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

***Ambiguity 1: timezone de overdue no definido***

- ***Location in Story:*** AC de filtro `Overdue`.
- ***Question for PO/Dev:*** el corte usa timezone del usuario o UTC del servidor?
- ***Impact on Testing:*** cambia resultados frontera (`due_date = today`).

***Ambiguity 2: origen de conteos por tab***

- ***Location in Story:*** AC de count badges.
- ***Question for PO/Dev:*** los conteos se obtienen por endpoint dedicado, en la misma respuesta de listado o por calculo local?
- ***Impact on Testing:*** estrategia de validacion API/UI y riesgos de inconsistencia.

### Missing Information / Gaps

***Gap 1: comportamiento sin resultados por filtro***

- ***Type:*** Acceptance Criteria
- ***Why It's Critical:*** asegura UX clara y evita falsos bugs.
- ***Suggested Addition:*** AC explicito para estado vacio por tab.

***Gap 2: concurrencia al cambiar tabs rapidamente***

- ***Type:*** Technical behavior
- ***Why It's Critical:*** evita que respuestas tardias sobreescriban el ultimo filtro activo.
- ***Suggested Addition:*** regla “last interaction wins”.

### Edge Cases NOT Covered in Original Story

1. `due_date = today` no debe entrar a `Overdue` (boundary).
2. Cambios rapidos de tabs no deben renderizar datos del tab anterior (UI race).
3. Usuario sin facturas: tabs visibles con conteo 0 y empty state global.
4. Dataset mixto: conteo del tab activo debe coincidir con filas renderizadas.

### Testability Validation

***Is this story testeable as written?*** ⚠️ Partially

- Faltan definiciones puntuales de timezone y comportamiento de concurrencia.

---

## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Tabs de estado visibles y seleccion por defecto

***Type:*** Positive  

***Priority:*** Critical

- ***Given:*** usuario autenticado en dashboard con acceso a sus facturas
- ***When:*** abre la vista de listado
- ***Then:*** visualiza tabs `All`, `Draft`, `Sent`, `Paid`, `Overdue`
- ***And:*** `All` queda activo por defecto

### Scenario 2: Filtrado correcto por Draft/Sent/Paid

***Type:*** Positive  

***Priority:*** High

- ***Given:*** dataset con facturas en estados mixtos
- ***When:*** selecciona cada tab (`Draft`, `Sent`, `Paid`)
- ***Then:*** solo se listan facturas del estado correspondiente

### Scenario 3: Regla de overdue derivada

***Type:*** Boundary  

***Priority:*** Critical

- ***Given:*** facturas `sent` con fechas de vencimiento en ayer/hoy/manana
- ***When:*** selecciona `Overdue`
- ***Then:*** aparecen solo `sent` con `due_date < today`
- ***And:*** facturas `paid` no aparecen en overdue

### Scenario 4: Conteos por tab consistentes

***Type:*** Integration  

***Priority:*** High

- ***Given:*** tabs con badge de conteo
- ***When:*** compara badge del tab activo vs filas listadas
- ***Then:*** ambos valores coinciden en todas las tabs

### Scenario 5: Persistencia de filtro en URL

***Type:*** Positive  

***Priority:*** Medium

- ***Given:*** filtro `paid` seleccionado
- ***When:*** recarga pagina o abre la URL en nueva pestana
- ***Then:*** se mantiene filtro activo y resultados correspondientes

### Scenario 6: No results por filtro

***Type:*** Negative  

***Priority:*** Medium

- ***Given:*** no existen facturas para un estado especifico (ej. `draft`)
- ***When:*** abre ese tab
- ***Then:*** muestra estado de “sin resultados” sin errores ni datos cruzados

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

***Total Test Cases Needed:*** 12

- Positive: 4
- Negative: 3
- Boundary: 2
- Integration: 2
- API: 1

### Parametrization Opportunities

***Parametrized Tests Recommended:*** ✅ Yes

***Parametrized Test Group 1: Mapeo tab → estado esperado***

| Tab | Query Param | Expected Dataset |
| --- | --- | --- |
| All | all | all invoices |
| Draft | draft | only draft |
| Sent | sent | only sent |
| Paid | paid | only paid |
| Overdue | overdue | sent and due_date < today |

***Parametrized Test Group 2: Boundary de overdue por fecha***

| due_date delta | expected in overdue |
| --- | --- |
| -1 day | yes |
| 0 day (today) | no |
| +1 day | no |

---

### Test Outlines

#### Validar tabs de estado visibles al cargar dashboard

***Related Scenario:*** Scenario 1  

***Type:*** Positive  

***Priority:*** Critical  

***Test Level:*** UI

***Preconditions:***

- Usuario autenticado
- Existe al menos 1 factura del usuario

***Test Steps:***

1. Abrir `/(app)/dashboard`
2. Observar barra de tabs
3. Verificar tab activo por defecto

***Expected Result:***

- Se muestran `All`, `Draft`, `Sent`, `Paid`, `Overdue`
- `All` aparece seleccionado por defecto

---

#### Validar filtrado por estado Draft/Sent/Paid

***Related Scenario:*** Scenario 2  

***Type:*** Positive  

***Priority:*** High  

***Test Level:*** UI/API

***Preconditions:***

- Dataset con al menos 1 factura por estado (`draft`, `sent`, `paid`)

***Test Steps:***

1. Seleccionar tab `Draft`
2. Verificar filas listadas
3. Repetir para `Sent` y `Paid`

***Expected Result:***

- Cada tab muestra solo su estado correspondiente
- No hay mezcla de estados en resultados

---

#### Validar filtro overdue con regla derivada

***Related Scenario:*** Scenario 3  

***Type:*** Boundary  

***Priority:*** Critical  

***Test Level:*** API/Integration

***Preconditions:***

- Factura A: `sent`, `due_date = yesterday`
- Factura B: `sent`, `due_date = today`
- Factura C: `sent`, `due_date = tomorrow`
- Factura D: `paid`, `due_date = yesterday`

***Test Steps:***

1. Ejecutar `GET /api/invoices?status=overdue`
2. Abrir tab `Overdue` en UI

***Expected Result:***

- Solo factura A aparece en overdue
- Facturas B/C/D no aparecen en overdue

---

#### Validar consistencia entre badges y filas renderizadas

***Related Scenario:*** Scenario 4  

***Type:*** Integration  

***Priority:*** High  

***Test Level:*** UI/Integration

***Expected Result:***

- Badge del tab activo == cantidad de filas en tabla
- No se observan diferencias entre tabs en el mismo dataset

---

#### Validar persistencia de filtro en URL

***Related Scenario:*** Scenario 5  

***Type:*** Positive  

***Priority:*** Medium  

***Test Level:*** UI/E2E

***Expected Result:***

- Filtro seleccionado se conserva tras refresh
- URL y estado visual quedan sincronizados

---

#### Validar empty state por filtro sin coincidencias

***Related Scenario:*** Scenario 6  

***Type:*** Negative  

***Priority:*** Medium  

***Test Level:*** UI

***Expected Result:***

- Mensaje claro de sin resultados para ese estado
- Sin errores de render y sin datos de otro tab

---

## 🔗 Integration Test Cases

### Integration Test 1: Tabs UI ↔ API listInvoices

- ***Integration Point:*** Frontend tabs → `GET /api/invoices?status=...`
- ***Contract Validation:*** status query param acepta `all,draft,sent,paid,overdue`
- ***Expected Result:*** respuesta API y render UI consistentes

### Integration Test 2: Conteos ↔ listado final

- ***Integration Point:*** badges de tabs ↔ dataset final mostrado
- ***Expected Result:*** sin desfase entre conteo y filas

---

## 📊 Edge Cases Summary

| Edge Case | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
| --- | --- | --- | --- | --- |
| due_date = today no overdue | No | Yes (Scenario 3) | Overdue boundary | High |
| cambio rapido de tabs | No | Yes (Paso 2) | Tab race condition | High |
| no results por filtro | Partial | Yes (Scenario 6) | Empty by filter | Medium |
| badge != filas | No | Yes (Scenario 4) | Count consistency | High |

---

## 📝 Action Required

***@ProductOwner:***

- Confirmar timezone oficial para overdue (`user timezone` vs `UTC`).
- Confirmar copy esperado para empty state por filtro.

***@DevLead:***

- Confirmar estrategia de obtencion de conteos por tab.
- Confirmar manejo de respuestas fuera de orden al alternar tabs rapidamente.

***@QATeam:***

- Preparar dataset con bordes de fecha (ayer/hoy/manana).
- Preparar suite parametrizada tab→estado y overdue boundary.

---

## 📋 Test Execution Tracking

***Test Execution Date:*** TBD  

***Environment:*** Staging  

***Executed By:*** TBD

***Results:***

- Total Tests: 12
- Passed: TBD
- Failed: TBD
- Blocked: TBD

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-28T21:41:11.762Z_
