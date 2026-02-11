# Acceptance Test Plan: STORY-SQ-18 - View Client Invoice History

**Fecha:** 2026-02-10
**QA Engineer:** AI-Generated (SoloQ Agent)
**Story Jira Key:** [SQ-18](https://upexgalaxy64.atlassian.net/browse/SQ-18)
**Epic:** EPIC-SQ-13 - Client Management
**Status:** Draft

---

## 📋 Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Valentina (Desarrolladora) - Necesita ver qué facturas le ha enviado a un cliente internacional para saber si hay patrones de morosidad o pagos pendientes antes de empezar un nuevo proyecto.
- **Secondary:** Andrés (Consultor) - Usa el historial para ver el volumen de negocio que ha tenido con un cliente a lo largo del año.

**Business Value:**

- **Value Proposition:** Proporciona transparencia y control sobre la relación financiera con el cliente. Evita que el freelancer trabaje para clientes con deudas acumuladas sin darse cuenta.
- **Business Impact:** Contribuye directamente a la métrica de "Reducción de tiempo de cobro" al permitir identificar facturas vencidas específicas de un cliente desde su perfil.

**Related User Journey:**

- Journey 2: "Seguimiento y Cobro de Factura" - Valentina identifica facturas vencidas y necesita el contexto histórico para decidir qué tan agresivo debe ser el recordatorio.

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: `ClientInvoiceHistory` (nuevo), `InvoiceStatusBadge` (existente), `TotalsSummaryCard` (nuevo).
- Pages/Routes: `/clients/[id]/history` o una pestaña dentro de `/clients/[id]`.
- State Management: React Query para fetching de la historia.

**Backend:**

- API Endpoints: `GET /api/clients/:clientId/invoices` (FR-014).
- Services: Invoice Service (agregaciones de totales).
- Database: Tabla `invoices` filtrada por `client_id` y `user_id`.

**Integration Points:**

- Frontend ↔ API: Validación de contrato OpenAPI para el listado de facturas.
- Client ↔ Invoice: Integridad referencial en base de datos.

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic complexity: Medium - El cálculo de totales (Invoiced, Paid, Pending) debe ser preciso y coherente con el estado de las facturas (excluyendo 'draft' o 'cancelled' según regla de negocio).
- Data validation complexity: Low.
- UI complexity: Medium - Mostrar una tabla responsive con estados y navegación fluida a la factura.

**Estimated Test Effort:** Medium
**Rationale:** Requiere validación de agregaciones de datos en DB y coherencia visual entre el listado y el detalle de la factura.

---

### Epic-Level Context (From Feature Test Plan)

**Critical Risks Already Identified at Epic Level:**

- **RLS Policies - Data Isolation Failure:**
  - **Relevance to This Story:** Es crítico que un usuario A no pueda ver el historial de facturas de un cliente del usuario B, incluso si conoce el `client_id`.
- **Soft Delete Integrity:**
  - **Relevance to This Story:** Si un cliente es marcado como `is_deleted`, el historial debería seguir siendo accesible si hay facturas asociadas, o bien manejar el estado de "cliente inactivo".

**Integration Points from Epic Analysis:**

- **Frontend ↔ Backend API:**
  - **Applies to This Story:** ✅ Yes - Endpoint `/api/clients/:id/invoices`.
- **Clients ↔ Invoices:**
  - **Applies to This Story:** ✅ Yes - Es la relación core de esta story.

---

## 🚨 Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Definición de "Total Invoiced"

- **Location in Story:** Scenario 3
- **Question for PO:** ¿El "Total Invoiced" incluye facturas en estado 'draft' o 'cancelled'?
- **Impact on Testing:** Sin esto, los cálculos del test pueden fallar contra la implementación si no hay criterio unificado.
- **Suggested Clarification:** "Total Invoiced" solo debe sumar facturas en estado 'sent', 'paid' y 'overdue'.

**Ambiguity 2:** Ordenamiento del Historial

- **Location in Story:** Scenario 1
- **Question for PO/Dev:** ¿Cuál es el orden por defecto? ¿Más recientes primero?
- **Impact on Testing:** No se puede validar el orden de la lista.
- **Suggested Clarification:** Orden cronológico descendente por `issue_date`.

---

### Missing Information / Gaps

**Gap 1:** Empty State

- **Type:** Acceptance Criteria
- **Why It's Critical:** No se define qué ve el usuario si un cliente no tiene facturas aún.
- **Suggested Addition:** Mostrar un mensaje amigable "Aún no hay facturas para este cliente" con un botón "Crear primera factura".

**Gap 2:** Paginación

- **Type:** Technical Details / UX
- **Why It's Critical:** Si un cliente tiene 100 facturas, la UI puede degradarse.
- **Suggested Addition:** El API y la UI deben soportar paginación (default 10-20 items).

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Cliente con facturas en diferentes monedas

- **Scenario:** El cliente tiene facturas en USD y otras en moneda local (si se permite).
- **Expected Behavior:** Mostrar totales por moneda o indicar la moneda principal.
- **Criticality:** Medium
- **Action Required:** Ask PO. Por ahora asumir USD como base según MVP scope.

**Edge Case 2:** Factura eliminada/anulada

- **Scenario:** Una factura asociada al cliente es eliminada (soft delete).
- **Expected Behavior:** No debe aparecer en el historial ni contar para los totales.
- **Criticality:** Medium
- **Action Required:** Add to test cases.

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues:**

- [ ] Los criterios de agregación para "totals" no son específicos (qué estados cuentan).
- [ ] No se especifica el formato de las fechas (DD/MM/YYYY esperado en LATAM).

---

## ✅ Paso 3: Refined Acceptance Criteria

### Scenario 1: View invoice list for client (Happy Path)

**Type:** Positive
**Priority:** Critical

- **Given:**
  - Estoy autenticado como el usuario "carlos@soloq.app".
  - Tengo un cliente "Acme Corp" (ID: `uuid-123`).
  - "Acme Corp" tiene 3 facturas: `#INV-001` (Sent), `#INV-002` (Paid), `#INV-003` (Draft).
- **When:**
  - Accedo a la pestaña "Historial" del cliente "Acme Corp".
- **Then:**
  - Veo una lista con 3 facturas (incluyendo draft para que el freelancer sepa qué tiene pendiente).
  - El orden es `#INV-003`, `#INV-002`, `#INV-001` (descendente por fecha/número).
  - Cada fila muestra: Número, Fecha, Monto total y un Badge con el estado.

### Scenario 2: See totals summary (Calculations)

**Type:** Positive
**Priority:** High

- **Given:**
  - El cliente tiene:
    - 1 factura `PAID` por $100.
    - 1 factura `SENT` por $50.
    - 1 factura `OVERDUE` por $50.
    - 1 factura `DRAFT` por $200.
    - 1 factura `CANCELLED` por $300.
- **When:**
  - Veo el resumen de totales en el historial.
- **Then:**
  - **Total Invoiced:** $200 (Suma de PAID + SENT + OVERDUE).
  - **Total Paid:** $100.
  - **Total Pending:** $100 (Suma de SENT + OVERDUE).
  - **Drafts:** $200 (Opcional, mostrado aparte o no incluido en el total principal).

---

## 🧪 Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 8

**Breakdown:**

- Positive: 3 (List view, Totals, Navigation)
- Negative: 2 (Unauthorized access, Client not found)
- Boundary: 1 (Empty state - 0 invoices)
- API: 2 (GET endpoint structure, RLS isolation)

---

### Test Outlines

#### **Validar listado de facturas exitoso con datos válidos**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** UI / E2E

**Preconditions:**

- Usuario logueado.
- Cliente existente con al menos 2 facturas en DB.

**Test Steps:**

1. Navegar a `/clients/[clientId]`.
2. Hacer click en pestaña/sección "Invoice History".
3. Verificar que la tabla muestra las facturas correctas.
   - **Data:** Check for Invoice Numbers: "INV-001", "INV-002".

**Expected Result:**

- **UI:** Lista visible con 2 filas. Estados mostrados con colores correctos (verde para Paid, azul para Sent).

---

#### **Validar cálculo de totales con múltiples estados**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** High
**Test Level:** API / Integration

**Preconditions:**

- Datos en DB inyectados con los estados mencionados en el AC refinado.

**Test Steps:**

1. Llamar al API `GET /api/clients/[id]/invoices`.
2. Verificar el objeto `summary` en el response.

**Expected Result:**

- **API Response:**

  ```json
  {
    "success": true,
    "summary": {
      "totalInvoiced": 200,
      "totalPaid": 100,
      "totalPending": 100
    }
  }
  ```

---

#### **Validar aislamiento de datos (RLS) en historial**

**Type:** Security
**Priority:** Critical
**Test Level:** API

**Preconditions:**

- Usuario A y Usuario B creados.
- Cliente X pertenece a Usuario A.

**Test Steps:**

1. Loguearse como Usuario B.
2. Intentar llamar a `GET /api/clients/[id-cliente-X]/invoices`.

**Expected Result:**

- **Status Code:** 403 Forbidden o 404 Not Found (según implementación de RLS para ocultar existencia).
- **Security:** Usuario B NO debe ver ninguna factura de un cliente que no le pertenece.

---

## 📊 Paso 8: Final QA Feedback Report

### 📊 Summary for PO/Dev

**Story Quality Assessment:** ✅ Good

**Key Findings:**

1. La story es clara en su objetivo pero ambigua en la lógica de agregación (qué facturas cuentan para el total).
2. Falta definir el comportamiento ante un estado de lista vacía.

---

### 🚨 Critical Questions for PO

**Question 1:** ¿Las facturas en estado 'Draft' deben sumarse al "Total Invoiced"?

- **Context:** Usualmente un 'Draft' no es una deuda real hasta que se envía.
- **Impact if not answered:** Inconsistencia en reportes financieros.
- **Suggested Answer:** No sumarlas al total, pero mostrarlas en el listado para conveniencia del usuario.

**Question 2:** ¿Qué sucede si el cliente es eliminado?

- **Context:** SoloQ usa soft delete (`is_deleted`).
- **Impact on Testing:** Determinar si el historial sigue siendo accesible desde reportes globales.

---

### 🎯 Next Steps

1. **PO:** Confirmar lógica de totales (estados incluidos).
2. **Dev:** Implementar el endpoint con RLS estricto.
3. **QA:** Ejecutar tests de integración API verificando los cálculos.

---

## 🔗 Related Documentation

- **Story:** `.context/PBI/epics/EPIC-SQ-13-client-management/stories/STORY-SQ-18-client-invoice-history/story.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml` (List Client Invoices)
- **Functional Specs:** `.context/SRS/functional-specs.md` (FR-014)
