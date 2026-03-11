# Comments for SQ-21

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-21)

---

### Ely - 2/3/2026, 6:14:39 PM

## 📢 PO Response - Critical Questions Clarification

**Date:** 2026-02-03
**Responded by:** Product Owner

## 

### Question 1: ¿Qué campos del cliente mostrar en el dropdown?

**Decision:** Mostrar ***nombre + email*** en el dropdown.

**Rationale:** 

- Muchos freelancers tienen clientes con nombres similares (ej: "Juan García" de diferentes empresas)
- El email es un identificador único que ayuda a diferenciar
- Formato: `{name} ({email})` - ej: "Acme Corp (acme@corp.com)"

### Question 2: ¿El cliente puede cambiar después de crear la factura en draft?

**Decision:** ***SÍ***, el cliente puede cambiarse mientras la factura esté en status `draft`.

**Rationale:**

- Es común equivocarse al seleccionar cliente
- Una vez la factura pasa a `sent`, el cliente NO puede cambiarse (la factura ya fue enviada a ese cliente)
- Business Rule: `status === 'draft'` → cliente editable, `status !== 'draft'` → cliente bloqueado

### Question 3: ¿La búsqueda es client-side o server-side para >100 clientes?

**Decision:** ***Híbrido*** - client-side hasta 50 clientes, server-side para más.

**Rationale:**

- Mayoría de usuarios MVP tendrán <20 clientes
- Client-side es más rápido para listas pequeñas
- Server-side necesario para escalar
- **Implementation note:** Cargar primeros 50 clientes, si hay más, hacer fetch con query param `?search=`

### Question 4: ¿Qué pasa si el cliente se elimina mientras la factura está en draft?

**Decision:** ***Mostrar warning y requerir seleccionar nuevo cliente***.

**Rationale:**

- No podemos enviar factura a un cliente que no existe
- Al abrir la factura draft, si `client_id` no existe, mostrar: "El cliente asociado fue eliminado. Por favor selecciona otro cliente."
- El dropdown debe estar en estado "sin selección" forzando al usuario a elegir
- **Alternative considered:** Soft-delete de clientes que mantiene referencia - descartado por complejidad MVP

### Decisiones Adicionales (proactivas)

**Empty State - Usuario sin clientes:**

- Si usuario no tiene clientes al crear factura, mostrar empty state amigable en dropdown
- Mensaje: "No tienes clientes aún. ¡Crea tu primer cliente!"
- CTA prominente "Add first client" que abre el modal inline
- NO bloquear el flujo de creación de factura

**Validación antes de guardar:**

- Si no hay cliente seleccionado y usuario intenta guardar: error inline "Please select a client"
- Prevent submit hasta que clientId sea válido

✅ **Status:** Questions resolved - Ready for test case finalization

@Ely @QATeam - Pueden proceder con los test cases finales basados en estas decisiones.

---

### Ely - 2/3/2026, 6:15:47 PM

## 🧪 Shift-Left Test Cases - Generated 2026-02-03

**QA Engineer:** AI-Generated
**Status:** Draft - Pending Review

## 

# Test Cases: [https://upexgalaxy65.atlassian.net/browse/SQ-21#icft=SQ-21](https://upexgalaxy65.atlassian.net/browse/SQ-21#icft=SQ-21) - Create Invoice by Selecting Client

**Fecha:** 2026-02-03
**Story Jira Key:** [https://upexgalaxy65.atlassian.net/browse/SQ-21#icft=SQ-21](https://upexgalaxy65.atlassian.net/browse/SQ-21#icft=SQ-21)
**Epic:** [https://upexgalaxy65.atlassian.net/browse/SQ-20#icft=SQ-20](https://upexgalaxy65.atlassian.net/browse/SQ-20#icft=SQ-20) - Invoice Creation
**Status:** Draft

## 

## 📊 Test Coverage Summary

**Total Test Cases:** 12

- Positive: 5
- Negative: 3
- Boundary: 2
- Integration: 2

**Complexity:** Medium
**Estimated Test Effort:** Medium

## 

## 🧪 Test Cases

### TC-01: Validar navegación a formulario de creación de factura

**Type:** Positive | **Priority:** Critical | **Level:** E2E

**Preconditions:**

- Usuario autenticado
- Al menos 1 cliente existente

**Test Steps:**

# Navegar a `/invoices`

# Click en botón "Create Invoice" o "New Invoice"

# Verificar formulario

**Expected Result:**

- Formulario de creación visible
- Dropdown de clientes con placeholder "Select a client"
- Campo de búsqueda disponible
- Botón "Add new client" visible
- Invoice status default = 'draft'

### TC-02: Validar selección de cliente existente y auto-población

**Type:** Positive | **Priority:** Critical | **Level:** E2E

**Preconditions:**

- Usuario con cliente "Acme Corp" (email: acme@corp.com, taxId: RFC123)

**Test Steps:**

# Abrir formulario de creación de factura

# Click en dropdown de clientes

# Seleccionar "Acme Corp (acme@corp.com)"

**Expected Result:**

- Dropdown muestra "Acme Corp (acme@corp.com)" seleccionado
- Campos auto-populados visibles en factura
- client_id asociado correctamente al draft

**Test Data:**

```json
{
  "client": {
    "name": "Acme Corp",
    "email": "acme@corp.com",
    "taxId": "RFC123"
  }
}
```

## 

### TC-03: Validar búsqueda y filtrado de clientes (case-insensitive)

**Type:** Positive | **Priority:** High | **Level:** E2E

**Preconditions:**

- Usuario con clientes: "Acme Corp", "Acme Studios", "Beta Inc", "Gamma LLC"

**Test Steps:**

# Abrir dropdown de clientes

# Escribir "acme" en campo de búsqueda

# Verificar lista filtrada

**Expected Result:**

- Lista muestra solo "Acme Corp" y "Acme Studios"
- "Beta Inc" y "Gamma LLC" NO aparecen
- Búsqueda funciona case-insensitive

### TC-04: Validar búsqueda sin resultados muestra opción de crear cliente

**Type:** Negative | **Priority:** High | **Level:** E2E

**Preconditions:**

- Usuario con clientes que NO contienen "xyz"

**Test Steps:**

# Abrir dropdown de clientes

# Escribir "xyz123" en campo de búsqueda

# Verificar estado vacío

**Expected Result:**

- Mensaje "No clients found"
- Opción/botón "Add new client" visible
- Usuario puede crear cliente desde este estado

### TC-05: Validar creación inline de cliente sin salir del flujo

**Type:** Positive | **Priority:** Critical | **Level:** E2E

**Preconditions:**

- Usuario en formulario de creación de factura

**Test Steps:**

# Click en "Add new client"

# Completar: name="New Client", email="new@client.com"

# Click en "Save" o "Create"

# Verificar selección automática

**Expected Result:**

- Modal/drawer de creación se abre
- Al guardar, cliente se crea exitosamente
- Cliente nuevo aparece seleccionado automáticamente en dropdown
- Usuario permanece en formulario de factura (NO redirigido)
- Formato en dropdown: "New Client (new@client.com)"

### TC-06: Validar empty state cuando usuario no tiene clientes

**Type:** Boundary | **Priority:** High | **Level:** E2E

**Preconditions:**

- Usuario nuevo SIN clientes

**Test Steps:**

# Navegar a crear factura

# Abrir dropdown de clientes

**Expected Result:**

- Mensaje amigable: "No tienes clientes aún. ¡Crea tu primer cliente!"
- CTA prominente "Add first client"
- Flujo de factura NO bloqueado
- Click en CTA abre modal de creación

### TC-07: Validar error al intentar guardar sin cliente seleccionado

**Type:** Negative | **Priority:** High | **Level:** E2E

**Preconditions:**

- Usuario en formulario con items pero SIN cliente seleccionado

**Test Steps:**

# Agregar line items a la factura

# Intentar guardar/enviar sin seleccionar cliente

# Verificar validación

**Expected Result:**

- Error inline: "Please select a client"
- Submit bloqueado
- Focus en dropdown de clientes
- Factura NO se crea

### TC-08: Validar cambio de cliente en factura draft

**Type:** Positive | **Priority:** Medium | **Level:** E2E

**Preconditions:**

- Factura en status 'draft' con cliente "Acme Corp" seleccionado
- Otro cliente "Beta Inc" existe

**Test Steps:**

# Abrir factura draft existente

# Click en dropdown de clientes

# Cambiar a "Beta Inc"

# Guardar factura

**Expected Result:**

- Dropdown permite cambio (NO está bloqueado)
- Al cambiar, datos se actualizan a "Beta Inc"
- Factura guarda con nuevo client_id
- Historial/audit NO afectado (es draft)

### TC-09: Validar cliente NO editable después de enviar factura

**Type:** Negative | **Priority:** High | **Level:** E2E

**Preconditions:**

- Factura en status 'sent' con cliente "Acme Corp"

**Test Steps:**

# Abrir factura enviada

# Intentar cambiar cliente

**Expected Result:**

- Dropdown de cliente deshabilitado o no visible
- Tooltip/mensaje: "Cannot change client on sent invoice"
- Cliente permanece "Acme Corp"

### TC-10: Validar warning cuando cliente fue eliminado

**Type:** Boundary | **Priority:** High | **Level:** E2E

**Preconditions:**

- Factura draft asociada a cliente "Deleted Corp"
- Cliente "Deleted Corp" fue eliminado (soft delete)

**Test Steps:**

# Abrir factura draft

# Verificar estado del selector de cliente

**Expected Result:**

- Warning visible: "El cliente asociado fue eliminado. Por favor selecciona otro cliente."
- Dropdown en estado "sin selección"
- Usuario forzado a seleccionar nuevo cliente antes de continuar
- No puede guardar hasta seleccionar cliente válido

### TC-11: Validar API POST /api/invoices con clientId válido

**Type:** Integration | **Priority:** Critical | **Level:** API

**Preconditions:**

- Usuario autenticado con Bearer token
- Cliente existente con UUID conocido

**Test Steps:**

# POST `/api/invoices` con body:

```json
{
  "clientId": "valid-uuid-here",
  "dueDate": "2026-03-03",
  "items": [
    {"description": "Service", "quantity": 1, "unitPrice": 100}
  ]
}
```

**Expected Result:**

- Status: 201 Created
- Response contiene invoice con client object poblado
- invoice.status = 'draft'
- invoice.client.name, invoice.client.email presentes

### TC-12: Validar API POST /api/invoices con clientId inválido

**Type:** Integration | **Priority:** High | **Level:** API

**Preconditions:**

- Usuario autenticado

**Test Steps:**

# POST `/api/invoices` con clientId inexistente o de otro usuario

**Expected Result:**

- Status: 400 Bad Request o 404 Not Found
- Error code: CLIENT*NOT*FOUND o INVALID_CLIENT
- Invoice NO se crea

## 📊 Edge Cases Summary

| ***Edge Case **** | ****Covered? **** | ****Test Case **** | ****Priority *** |
| --- | --- | --- | --- |
| Usuario sin clientes  | ✅ Yes  | TC-06  | High  |
| Búsqueda sin resultados  | ✅ Yes  | TC-04  | High  |
| Cliente eliminado  | ✅ Yes  | TC-10  | High  |
| Cambio cliente en draft  | ✅ Yes  | TC-08  | Medium  |
| Cliente bloqueado en sent  | ✅ Yes  | TC-09  | High  |
| Doble-click en "Add client"  | ⚠️ Manual  |  | Low  |

## 

## 📢 Action Required

**@Ely (Assignee):**

- [ ] Review test cases for completeness
- [ ] Validate edge cases coverage
- [ ] Confirm PO decisions are reflected

**@Dev Lead:**

- [ ] Confirm API contract alignment
- [ ] Validate client-side/server-side search approach

**@QA Team:**

- [ ] Prepare test data
- [ ] Configure test environment

**Next Steps:**

# Review test cases

# Update based on feedback

# Transition to Ready For Dev

## 

**Documentation:** Full test cases available at:
`.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-21-create-invoice-client/test-cases.md`

---

### Ely - 2/3/2026, 6:43:44 PM

Shift-Left QA Analysis completed. Story is ready for development.

***Summary:***

- 12 test cases designed (5 positive, 3 negative, 2 boundary, 2 integration)
- PO clarifications obtained and documented
- Edge cases identified and covered
- Test cases committed to repository

***Artifacts:***

- Jira: QA Refinements added to description
- Jira: Test cases in comments
- Repo: `.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-21-create-invoice-client/test-cases.md`
- Branch: `test/SQ-21/create-invoice-client`

***Next:*** Dev can start implementation with full test coverage visibility.

---

### Ely - 2/3/2026, 6:47:30 PM

## 🔄 Test Cases - Nomenclatura Refinada

**Fecha:** 2026-02-03
**Motivo:** Ajuste de títulos según estándar Shift-Left Testing

### Formato aplicado: `Validar [CORE] [CONDITIONAL]`

Donde:

- ***CORE*** = Comportamiento principal (verbo + objeto)
- ***CONDITIONAL*** = Condición o contexto que hace único el escenario

## 📋 Test Cases con Nomenclatura Corregida

| ***TC **** | ****Título Refinado **** | ****Type **** | ****Priority *** |
| --- | --- | --- | --- |
| TC-01  | Validar acceso al formulario de factura al hacer click en Create Invoice  | Positive  | Critical  |
| TC-02  | Validar auto-poblacion de datos cuando se selecciona un cliente existente  | Positive  | Critical  |
| TC-03  | Validar filtrado de clientes cuando se escribe en el campo de busqueda  | Positive  | High  |
| TC-04  | Validar opcion de crear cliente cuando la busqueda no tiene resultados  | Negative  | High  |
| TC-05  | Validar creacion de cliente inline sin abandonar el flujo de factura  | Positive  | Critical  |
| TC-06  | Validar mensaje de empty state cuando el usuario no tiene clientes  | Boundary  | High  |
| TC-07  | Validar error de validacion cuando se intenta guardar sin cliente seleccionado  | Negative  | High  |
| TC-08  | Validar cambio de cliente cuando la factura esta en estado draft  | Positive  | Medium  |
| TC-09  | Validar bloqueo de cliente cuando la factura fue enviada  | Negative  | High  |
| TC-10  | Validar mensaje de warning cuando el cliente asociado fue eliminado  | Boundary  | High  |
| TC-11  | Validar creacion de factura via API cuando el clientId es valido  | Integration  | Critical  |
| TC-12  | Validar rechazo de factura via API cuando el clientId es invalido  | Integration  | High  |

## 

### Cambios Realizados

| ***Anterior **** | ****Refinado **** | ****Mejora *** |
| --- | --- | --- |
| `Validar navegacion a formulario...`  | `Validar acceso al formulario... al hacer click en Create Invoice`  | Agregado CONDITIONAL específico  |
| `Validar busqueda y filtrado (case-insensitive)`  | `Validar filtrado de clientes cuando se escribe en el campo de busqueda`  | Removido paréntesis, formato correcto  |
| `Validar busqueda sin resultados muestra opcion...`  | `Validar opcion de crear cliente cuando la busqueda no tiene resultados`  | CORE y CONDITIONAL separados  |
| `Validar API POST /api/invoices con clientId valido`  | `Validar creacion de factura via API cuando el clientId es valido`  | CORE describe comportamiento, no endpoint  |

## 

### Referencia de Nomenclatura

**Patrón:**

```java
Validar [CORE: comportamiento principal] [CONDITIONAL: condición específica]
```

**Ejemplos correctos:**

- Validar ***login exitoso**** **con credenciales válidas*
- Validar ***error de autenticación**** **cuando el password es incorrecto*
- Validar ***límite de caracteres**** **al ingresar exactamente 50 chars*

**Anti-patrones evitados:**

- ❌ `Test de login` → Falta CORE y CONDITIONAL
- ❌ `Validar API POST /endpoint` → El endpoint no es el CORE
- ❌ `Validar busqueda (case-insensitive)` → Paréntesis no es formato correcto

**Documentación actualizada en:**
`.context/PBI/epics/EPIC-SQ-20-invoice-creation/stories/STORY-SQ-21-create-invoice-client/test-cases.md`

---

### Ely - 2/7/2026, 4:01:47 PM

PR creado y listo para code review: [https://github.com/upex-galaxy/upex-soloq/pull/29](https://github.com/upex-galaxy/upex-soloq/pull/29)

***Implementación completada:***

- Página de creación de facturas `/invoices/create`
- Selector de clientes con búsqueda y filtrado
- Diálogo para crear cliente inline sin salir del flujo
- Endpoint POST /api/invoices con generación automática de número
- Formato de factura: INV-YYYY-NNNN
- Fecha de vencimiento por defecto: +30 días
- Estado inicial: draft

***Archivos nuevos:***

- `src/lib/validations/invoice.ts`
- `src/app/api/invoices/route.ts`
- `src/hooks/invoices/use-create-invoice.ts`
- `src/components/invoices/client-selector.tsx`
- `src/components/invoices/create-client-dialog.tsx`
- `src/app/(app)/invoices/create/page.tsx`

---

### Ely - 2/7/2026, 4:03:05 PM

PR #29 mergeado a staging. Listo para QA.

***Ubicación de cambios:***

- Página: `/invoices/create`
- API: `POST /api/invoices`

***Test Cases a ejecutar:***

- TC-01 a TC-12 según el Acceptance Test Plan

***Ambiente:*** staging branch

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:49.380Z_
