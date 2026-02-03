# Test Cases: STORY-SQ-29 - Add Notes and Terms to Invoice

**Fecha:** 2026-02-03
**QA Engineer:** AI-Generated
**Story Jira Key:** SQ-29
**Epic:** EPIC-SQ-20 - Invoice Creation
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Diseñador Organizado) - Necesita proyectar profesionalismo y comunicar detalles adicionales en la factura.
- **Secondary:** Andres (Consultor Tradicional) - Requiere terminos claros para clientes corporativos.

**Business Value:**

- **Value Proposition:** Permite comunicar instrucciones de pago o notas personalizadas, aumentando claridad y profesionalismo.
- **Business Impact:** Reduce friccion en cobro y mejora percepcion de marca.

**Related User Journey:**

- Journey: J1 Registro y Primera Factura / J4 Edicion de Factura
- Step: Creacion y edicion antes de enviar

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: Formulario de factura, campos Notes/Terms, contador de caracteres, preview/PDF
- Pages/Routes: flujo de creacion/edicion de factura
- State Management: React Hook Form + Zod

**Backend:**

- API Endpoints: `POST /api/invoices`, `PUT /api/invoices/{invoiceId}`, `GET /api/invoices/{invoiceId}/pdf`
- Services: Invoice CRUD, PDF generation
- Database: `invoices` (campos notes, terms)

**External Services:**

- PDF renderer: @react-pdf/renderer

**Integration Points:**

- Frontend <-> Backend API
- Backend <-> DB
- Backend <-> PDF renderer

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic complexity: Medium - reglas de prefill, limites, guardado
- Integration complexity: Medium - UI <-> API <-> PDF
- Data validation complexity: Medium - limites, sanitizacion, caracteres especiales
- UI complexity: Medium - contador, comportamiento al borrar, warnings al salir

**Estimated Test Effort:** Medium
**Rationale:** varios escenarios con validacion y rendering en PDF

---

### Epic-Level Context (From Feature Test Plan in Jira)

**⚠️ BLOQUEADO:** No existe `feature-test-plan.md` para EPIC-SQ-20 y no hay acceso MCP Jira.

- Critical Risks: TBD
- Integration Points: TBD
- Critical Questions: TBD
- Test Strategy: TBD
- Updates: TBD

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Guardado de notas/terminos

- **Location in Story:** AC Scenarios
- **Question for PO/Dev:** Se guardan automaticamente al escribir o solo al guardar la factura?
- **Impact on Testing:** No se define el trigger de persistencia.
- **Suggested Clarification:** Definir explicitamente el mecanismo de guardado (autosave vs manual).

**Ambiguity 2:** Comportamiento al borrar

- **Location in Story:** Notas sugeridas
- **Question for PO/Dev:** Al borrar queda string vacio o se elimina el campo (null)?
- **Impact on Testing:** Cambia validaciones y rendering en PDF.
- **Suggested Clarification:** Definir el estado persistido al borrar.

**Ambiguity 3:** Limite de caracteres (hard vs soft)

- **Location in Story:** Scenario 4 (Character limit)
- **Question for PO/Dev:** Bloquea tipeo o permite exceder con error?
- **Impact on Testing:** Diferentes validaciones UI/API.
- **Suggested Clarification:** Definir hard limit con counter vs soft limit con error.

**Ambiguity 4:** Sanitizacion de HTML

- **Location in Story:** Notas sugeridas
- **Question for PO/Dev:** Se sanitiza HTML/scripts o se permite texto plano unicamente?
- **Impact on Testing:** Seguridad/XSS y rendering PDF.
- **Suggested Clarification:** Definir sanitizacion en UI y API.

**Ambiguity 5:** Emojis/caracteres especiales

- **Location in Story:** Notas sugeridas
- **Question for PO/Dev:** Se permiten emojis y caracteres especiales?
- **Impact on Testing:** Rendering en PDF.
- **Suggested Clarification:** Definir soporte Unicode.

---

### Missing Information / Gaps

**Gap 1:** Limite real para notes/terms

- **Type:** Acceptance Criteria / Business Rule
- **Why It's Critical:** SRS/OpenAPI indican `notes` max 2000; story indica 500/1000.
- **Suggested Addition:** Unificar limites y publicar en AC.
- **Impact if Not Added:** Tests inconsistentes y potenciales bugs de validacion.

**Gap 2:** Campo `terms` en API/OpenAPI

- **Type:** Technical Details
- **Why It's Critical:** OpenAPI/FR no incluyen `terms` en InvoiceInput.
- **Suggested Addition:** Actualizar API contracts o documentar origen.
- **Impact if Not Added:** Falta coverage API y persistencia incompleta.

**Gap 3:** Comportamiento al abandonar sin guardar

- **Type:** UX / Business Rule
- **Why It's Critical:** Riesgo de perdida de datos.
- **Suggested Addition:** Definir warning o auto-save.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Usuario pega HTML/script

- **Scenario:** `<script>alert(1)</script>`
- **Expected Behavior:** Sanitizar a texto plano (o rechazar).
- **Criticality:** High
- **Action Required:** Ask PO

**Edge Case 2:** Notas vacias despues de borrar

- **Scenario:** Guardar tras borrar contenido
- **Expected Behavior:** No mostrar seccion en invoice/pdf.
- **Criticality:** Medium
- **Action Required:** Add to story

**Edge Case 3:** Limite exacto +1

- **Scenario:** 501/1001/2001 chars
- **Expected Behavior:** Bloquear o error segun regla.
- **Criticality:** Medium
- **Action Required:** Add to story

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues (if any):**

- [x] Acceptance criteria are vague or subjective
- [x] Missing error scenarios
- [x] Missing test data examples

**Recommendations to Improve Testability:**

- Definir limites definitivos (notes/terms) y comportamiento hard/soft.
- Definir trigger de persistencia (autosave vs guardar).
- Definir sanitizacion y soporte Unicode.

---

## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: Add custom note (Edit invoice)

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Usuario autenticado con una factura existente en estado `draft` o `sent`.
  - Factura pertenece al usuario (RLS).

- **When:**
  - El usuario ingresa en `notes` el texto: `"Gracias por su preferencia.\nPago en 15 dias."`

- **Then:**
  - El valor se persiste en `invoices.notes` al momento definido (autosave o guardar).
  - Al reabrir la factura, el campo `notes` muestra el texto exacto.
  - En preview/PDF, la seccion de notas aparece al final respetando saltos de linea.

---

### Scenario 2: Use default terms

**Type:** Positive
**Priority:** High

- **Given:**
  - Usuario tiene `business_profile.default_terms` configurado (ej: `"Pago a 30 dias. Transferencia bancaria."`)

- **When:**
  - Crea una nueva factura

- **Then:**
  - El campo `terms` se pre-llena con el default.
  - Si el usuario edita `terms`, el valor guardado pertenece solo a esa factura.
  - El default en perfil NO se modifica.
  - Si no hay default, `terms` aparece vacio sin errores.

---

### Scenario 3: Notes appear on invoice

**Type:** Positive
**Priority:** High

- **Given:**
  - Una factura con `notes` guardadas

- **When:**
  - El usuario previsualiza o genera el PDF

- **Then:**
  - Las notas aparecen al final del documento.
  - Se respetan saltos de linea.
  - No hay truncamiento si esta dentro del limite.
  - Si `notes` esta vacio, no se muestra seccion ni espacio extra.

---

### Scenario 4: Character limit behavior

**Type:** Boundary
**Priority:** Medium

- **Given:**
  - El usuario esta escribiendo en `notes` o `terms`

- **When:**
  - Llega al limite maximo de caracteres

- **Then:**
  - Se muestra contador.
  - No puede exceder el limite (hard limit) **o**
  - Se permite exceder, pero se muestra error y no se permite guardar (soft limit).
  - **⚠️ NOTE:** requiere confirmacion de PO/Dev sobre hard/soft.

---

### Scenario 5: Sanitization

**Type:** Edge Case
**Priority:** High
**Source:** Identified during analysis

- **Given:**
  - Usuario ingresa HTML o script en `notes`

- **When:**
  - Guarda o previsualiza la factura

- **Then:**
  - El contenido se sanitiza y se renderiza como texto plano.
  - **⚠️ NOTE:** requiere confirmacion de PO/Dev.

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 12

**Breakdown:**

- Positive: 5
- Negative: 3
- Boundary: 2
- Integration: 2
- API: 0 (incompleto por falta de `terms` en OpenAPI)

**Rationale for This Number:** Complejidad media con rendering PDF y limites/validacion.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Limites de caracteres notes/terms

- **Base Scenario:** Validar comportamiento del limite
- **Parameters to Vary:** campo (notes/terms), longitud (0, 1, max-1, max, max+1)
- **Test Data Sets:**

| Field | Length | Expected Result |
| ----- | ------ | --------------- |
| notes | 0      | Seccion oculta  |
| notes | max-1  | Guarda OK       |
| notes | max    | Guarda OK       |
| notes | max+1  | Bloqueo o error |
| terms | 0      | Seccion oculta  |
| terms | max    | Guarda OK       |
| terms | max+1  | Bloqueo o error |

**Total Tests from Parametrization:** 7 combinaciones
**Benefit:** Cobertura completa con menos duplicacion.

---

## Test Outlines

#### **Validar guardado de notas al editar factura**

**Related Scenario:** Scenario 1 (Refined AC above)
**Type:** Positive
**Priority:** Critical
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Usuario autenticado
- Factura existente en `draft`
- Client e items validos

---

**Test Steps:**

1. Abrir factura existente en modo edicion.
   - **Data:** `notes`: "Gracias por su preferencia.\nPago en 15 dias."
2. Guardar factura (o esperar autosave, segun regla).
3. Reabrir la factura.

---

**Expected Result:**

- **UI:** Campo `notes` mantiene el texto guardado.
- **Database:** `invoices.notes` actualizado con el texto.
- **System State:** Preview/PDF muestra notas al final con saltos de linea.

---

**Test Data:**

```json
{
  "input": {
    "notes": "Gracias por su preferencia.\nPago en 15 dias."
  },
  "user": {
    "email": "qa.user@example.com",
    "role": "freelancer"
  }
}
```

---

**Post-conditions:**

- Factura mantiene `notes` actualizadas.

---

#### **Validar prefill de terminos por default en nueva factura**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Usuario autenticado
- `business_profile.default_terms` configurado

---

**Test Steps:**

1. Crear nueva factura.
2. Verificar que el campo `terms` se pre-llena.
3. Editar `terms` con texto personalizado y guardar.

---

**Expected Result:**

- **UI:** `terms` aparece con default al crear.
- **Database:** Factura guarda el nuevo valor; el default no cambia.

---

**Test Data:**

```json
{
  "profile": {
    "default_terms": "Pago a 30 dias. Transferencia bancaria."
  },
  "input": {
    "terms": "Pago a 15 dias."
  }
}
```

---

**Post-conditions:**

- Default terms en perfil permanece igual.

---

#### **Validar ausencia de seccion si notes/terms vacio**

**Related Scenario:** Scenario 3
**Type:** Positive
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

---

**Preconditions:**

- Factura con `notes`/`terms` vacios

---

**Test Steps:**

1. Generar preview/PDF.
2. Verificar que no se muestra seccion ni espacio extra.

---

**Expected Result:**

- **UI:** No hay seccion de notas/terminos.

---

**Post-conditions:**

- Sin cambios en DB.

---

#### **Validar limite de caracteres en notes**

**Related Scenario:** Scenario 4
**Type:** Boundary
**Priority:** Medium
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

---

**Preconditions:**

- Limite definido para notes

---

**Test Steps:**

1. Pegar texto con longitud `max`.
2. Intentar agregar 1 caracter extra.

---

**Expected Result:**

- **UI:** Hard limit bloquea tipeo o soft limit muestra error.

---

#### **Validar sanitizacion de HTML en notes**

**Related Scenario:** Scenario 5
**Type:** Edge Case
**Priority:** High
**Test Level:** UI/Integration
**Parametrized:** ❌ No

---

**Preconditions:**

- Factura editable

---

**Test Steps:**

1. Ingresar `<script>alert(1)</script>` en notes.
2. Guardar o previsualizar.

---

**Expected Result:**

- **UI/PDF:** Se renderiza como texto plano, sin ejecucion.

---

#### **Validar prefill solo en creacion, no en edicion**

**Related Scenario:** Scenario 2
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ❌ No

---

**Preconditions:**

- Factura existente con `terms` personalizados

---

**Test Steps:**

1. Abrir factura existente.
2. Verificar que `terms` no se sobrescribe con default.

---

**Expected Result:**

- **UI:** Se mantiene el valor de la factura.

---

#### **Validar caracteres especiales y emojis en PDF**

**Related Scenario:** Scenario 3
**Type:** Edge Case
**Priority:** Medium
**Test Level:** UI/Integration
**Parametrized:** ❌ No

---

**Preconditions:**

- Factura editable

---

**Test Steps:**

1. Ingresar `"Senor Perez - envio manana"` y un emoji si aplica.
2. Generar PDF.

---

**Expected Result:**

- **PDF:** Render correcto de caracteres especiales (si permitido).

---

## 🔗 Integration Test Cases (If Applicable)

### Integration Test 1: Frontend <-> API <-> DB (Notes)

**Integration Point:** Frontend -> Backend API
**Type:** Integration
**Priority:** High

**Preconditions:**

- Backend API disponible
- Usuario autenticado

**Test Flow:**

1. UI guarda notas.
2. API `PUT /api/invoices/{id}` responde 200.
3. DB refleja `invoices.notes`.

**Expected Result:**

- Integracion exitosa, datos persistidos.

---

### Integration Test 2: Backend <-> PDF renderer

**Integration Point:** API -> PDF Generator
**Type:** Integration
**Priority:** High

**Preconditions:**

- Servicio PDF activo

**Test Flow:**

1. API genera PDF.
2. PDF incluye notes/terms al final con formato.

**Expected Result:**

- Contenido integro, sin truncamiento.

---

## 📊 Edge Cases Summary

| Edge Case             | Covered in Original Story? | Added to Refined AC? | Test Case      | Priority |
| --------------------- | -------------------------- | -------------------- | -------------- | -------- |
| HTML/script injection | ❌ No                      | ✅ Yes (Scenario 5)  | Sanitizacion   | High     |
| Vacio tras borrar     | ❌ No                      | ✅ Yes               | Seccion oculta | Medium   |
| max+1 chars           | ❌ No                      | ✅ Yes (Scenario 4)  | Limite         | Medium   |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type       | Count | Purpose  | Examples                  |
| --------------- | ----- | -------- | ------------------------- |
| Valid data      | 4     | Positive | Texto normal, multi-linea |
| Invalid data    | 2     | Negative | max+1, HTML               |
| Boundary values | 4     | Boundary | 0, 1, max-1, max          |
| Edge case data  | 2     | Edge     | emojis, n/acentos         |

### Data Generation Strategy

**Static Test Data:**

- `"Gracias por su preferencia.\nPago en 15 dias."`
- `"<script>alert(1)</script>"`

**Dynamic Test Data (using Faker.js):**

- Texto de longitud N usando generador
- Emojis / Unicode

**Test Data Cleanup:**

- ✅ No requiere limpieza especial (updates en invoices).

---

## 📋 Test Execution Tracking

[Esta seccion se completa durante ejecucion]

**Test Execution Date:** [TBD]
**Environment:** Staging
**Executed By:** [Nombre]

**Results:**

- Total Tests: [X]
- Passed: [Y]
- Failed: [Z]
- Blocked: [W]

**Bugs Found:**

- [Bug ID 1]: [Descripcion breve]
- [Bug ID 2]: [Descripcion breve]

**Sign-off:** [Nombre QA] - [Fecha]
