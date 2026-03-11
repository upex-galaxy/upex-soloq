# Test Cases: SQ-21 - Create Invoice by Selecting Client

**Story Jira Key:** [SQ-21](https://upexgalaxy64.atlassian.net/browse/SQ-21)
**Epic:** [SQ-20](https://upexgalaxy64.atlassian.net/browse/SQ-20) - Invoice Creation
**Generated:** 2026-02-03
**QA Engineer:** AI-Generated (Shift-Left Analysis)
**Status:** Draft - Pending Review

---

## Test Coverage Summary

| Metric                    | Value  |
| ------------------------- | ------ |
| **Total Test Cases**      | 12     |
| Positive                  | 5      |
| Negative                  | 3      |
| Boundary                  | 2      |
| Integration               | 2      |
| **Complexity**            | Medium |
| **Estimated Test Effort** | Medium |

---

## Test Cases

### TC-01: Validar acceso al formulario de factura al hacer click en Create Invoice

| Attribute    | Value    |
| ------------ | -------- |
| **Type**     | Positive |
| **Priority** | Critical |
| **Level**    | E2E      |

**Preconditions:**

- Usuario autenticado
- Al menos 1 cliente existente

**Test Steps:**

1. Navegar a `/invoices`
2. Click en boton "Create Invoice" o "New Invoice"
3. Verificar formulario

**Expected Result:**

- Formulario de creacion visible
- Dropdown de clientes con placeholder "Select a client"
- Campo de busqueda disponible
- Boton "Add new client" visible
- Invoice status default = 'draft'

---

### TC-02: Validar auto-poblacion de datos cuando se selecciona un cliente existente

| Attribute    | Value    |
| ------------ | -------- |
| **Type**     | Positive |
| **Priority** | Critical |
| **Level**    | E2E      |

**Preconditions:**

- Usuario con cliente "Acme Corp" (email: acme@corp.com, taxId: RFC123)

**Test Steps:**

1. Abrir formulario de creacion de factura
2. Click en dropdown de clientes
3. Seleccionar "Acme Corp (acme@corp.com)"

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

---

### TC-03: Validar filtrado de clientes cuando se escribe en el campo de busqueda

| Attribute    | Value    |
| ------------ | -------- |
| **Type**     | Positive |
| **Priority** | High     |
| **Level**    | E2E      |

**Preconditions:**

- Usuario con clientes: "Acme Corp", "Acme Studios", "Beta Inc", "Gamma LLC"

**Test Steps:**

1. Abrir dropdown de clientes
2. Escribir "acme" en campo de busqueda
3. Verificar lista filtrada

**Expected Result:**

- Lista muestra solo "Acme Corp" y "Acme Studios"
- "Beta Inc" y "Gamma LLC" NO aparecen
- Busqueda funciona case-insensitive

---

### TC-04: Validar opcion de crear cliente cuando la busqueda no tiene resultados

| Attribute    | Value    |
| ------------ | -------- |
| **Type**     | Negative |
| **Priority** | High     |
| **Level**    | E2E      |

**Preconditions:**

- Usuario con clientes que NO contienen "xyz"

**Test Steps:**

1. Abrir dropdown de clientes
2. Escribir "xyz123" en campo de busqueda
3. Verificar estado vacio

**Expected Result:**

- Mensaje "No clients found"
- Opcion/boton "Add new client" visible
- Usuario puede crear cliente desde este estado

---

### TC-05: Validar creacion de cliente inline sin abandonar el flujo de factura

| Attribute    | Value    |
| ------------ | -------- |
| **Type**     | Positive |
| **Priority** | Critical |
| **Level**    | E2E      |

**Preconditions:**

- Usuario en formulario de creacion de factura

**Test Steps:**

1. Click en "Add new client"
2. Completar: name="New Client", email="new@client.com"
3. Click en "Save" o "Create"
4. Verificar seleccion automatica

**Expected Result:**

- Modal/drawer de creacion se abre
- Al guardar, cliente se crea exitosamente
- Cliente nuevo aparece seleccionado automaticamente en dropdown
- Usuario permanece en formulario de factura (NO redirigido)
- Formato en dropdown: "New Client (new@client.com)"

---

### TC-06: Validar mensaje de empty state cuando el usuario no tiene clientes

| Attribute    | Value    |
| ------------ | -------- |
| **Type**     | Boundary |
| **Priority** | High     |
| **Level**    | E2E      |

**Preconditions:**

- Usuario nuevo SIN clientes

**Test Steps:**

1. Navegar a crear factura
2. Abrir dropdown de clientes

**Expected Result:**

- Mensaje amigable: "No tienes clientes aun. Crea tu primer cliente!"
- CTA prominente "Add first client"
- Flujo de factura NO bloqueado
- Click en CTA abre modal de creacion

---

### TC-07: Validar error de validacion cuando se intenta guardar sin cliente seleccionado

| Attribute    | Value    |
| ------------ | -------- |
| **Type**     | Negative |
| **Priority** | High     |
| **Level**    | E2E      |

**Preconditions:**

- Usuario en formulario con items pero SIN cliente seleccionado

**Test Steps:**

1. Agregar line items a la factura
2. Intentar guardar/enviar sin seleccionar cliente
3. Verificar validacion

**Expected Result:**

- Error inline: "Please select a client"
- Submit bloqueado
- Focus en dropdown de clientes
- Factura NO se crea

---

### TC-08: Validar cambio de cliente cuando la factura esta en estado draft

| Attribute    | Value    |
| ------------ | -------- |
| **Type**     | Positive |
| **Priority** | Medium   |
| **Level**    | E2E      |

**Preconditions:**

- Factura en status 'draft' con cliente "Acme Corp" seleccionado
- Otro cliente "Beta Inc" existe

**Test Steps:**

1. Abrir factura draft existente
2. Click en dropdown de clientes
3. Cambiar a "Beta Inc"
4. Guardar factura

**Expected Result:**

- Dropdown permite cambio (NO esta bloqueado)
- Al cambiar, datos se actualizan a "Beta Inc"
- Factura guarda con nuevo client_id
- Historial/audit NO afectado (es draft)

---

### TC-09: Validar bloqueo de cliente cuando la factura fue enviada

| Attribute    | Value    |
| ------------ | -------- |
| **Type**     | Negative |
| **Priority** | High     |
| **Level**    | E2E      |

**Preconditions:**

- Factura en status 'sent' con cliente "Acme Corp"

**Test Steps:**

1. Abrir factura enviada
2. Intentar cambiar cliente

**Expected Result:**

- Dropdown de cliente deshabilitado o no visible
- Tooltip/mensaje: "Cannot change client on sent invoice"
- Cliente permanece "Acme Corp"

---

### TC-10: Validar mensaje de warning cuando el cliente asociado fue eliminado

| Attribute    | Value    |
| ------------ | -------- |
| **Type**     | Boundary |
| **Priority** | High     |
| **Level**    | E2E      |

**Preconditions:**

- Factura draft asociada a cliente "Deleted Corp"
- Cliente "Deleted Corp" fue eliminado (soft delete)

**Test Steps:**

1. Abrir factura draft
2. Verificar estado del selector de cliente

**Expected Result:**

- Warning visible: "El cliente asociado fue eliminado. Por favor selecciona otro cliente."
- Dropdown en estado "sin seleccion"
- Usuario forzado a seleccionar nuevo cliente antes de continuar
- No puede guardar hasta seleccionar cliente valido

---

### TC-11: Validar creacion de factura via API cuando el clientId es valido

| Attribute    | Value       |
| ------------ | ----------- |
| **Type**     | Integration |
| **Priority** | Critical    |
| **Level**    | API         |

**Preconditions:**

- Usuario autenticado con Bearer token
- Cliente existente con UUID conocido

**Test Steps:**

1. POST `/api/invoices` con body:

```json
{
  "clientId": "valid-uuid-here",
  "dueDate": "2026-03-03",
  "items": [{ "description": "Service", "quantity": 1, "unitPrice": 100 }]
}
```

**Expected Result:**

- Status: 201 Created
- Response contiene invoice con client object poblado
- invoice.status = 'draft'
- invoice.client.name, invoice.client.email presentes

---

### TC-12: Validar rechazo de factura via API cuando el clientId es invalido

| Attribute    | Value       |
| ------------ | ----------- |
| **Type**     | Integration |
| **Priority** | High        |
| **Level**    | API         |

**Preconditions:**

- Usuario autenticado

**Test Steps:**

1. POST `/api/invoices` con clientId inexistente o de otro usuario

**Expected Result:**

- Status: 400 Bad Request o 404 Not Found
- Error code: CLIENT_NOT_FOUND o INVALID_CLIENT
- Invoice NO se crea

---

## Edge Cases Coverage Matrix

| Edge Case                   | Covered? | Test Case | Priority |
| --------------------------- | -------- | --------- | -------- |
| Usuario sin clientes        | Yes      | TC-06     | High     |
| Busqueda sin resultados     | Yes      | TC-04     | High     |
| Cliente eliminado           | Yes      | TC-10     | High     |
| Cambio cliente en draft     | Yes      | TC-08     | Medium   |
| Cliente bloqueado en sent   | Yes      | TC-09     | High     |
| Doble-click en "Add client" | Manual   | -         | Low      |

---

## PO Clarifications Applied

| Question                  | Decision                                  |
| ------------------------- | ----------------------------------------- |
| Campos en dropdown        | `{name} ({email})`                        |
| Cliente editable en draft | Si, editable mientras status = 'draft'    |
| Busqueda client/server    | Hibrido: client-side <50, server-side >50 |
| Cliente eliminado         | Warning + forzar nueva seleccion          |

---

## Traceability

| Test Case | Acceptance Criteria | API Contract          |
| --------- | ------------------- | --------------------- |
| TC-01     | Scenario 1          | -                     |
| TC-02     | Scenario 2          | POST /api/invoices    |
| TC-03     | Scenario 3          | -                     |
| TC-04     | Scenario 3          | -                     |
| TC-05     | Scenario 4          | POST /api/clients     |
| TC-06     | Edge Case           | -                     |
| TC-07     | Business Rule       | POST /api/invoices    |
| TC-08     | PO Clarification Q2 | PUT /api/invoices/:id |
| TC-09     | PO Clarification Q2 | PUT /api/invoices/:id |
| TC-10     | PO Clarification Q4 | GET /api/invoices/:id |
| TC-11     | Scenario 5          | POST /api/invoices    |
| TC-12     | Error Handling      | POST /api/invoices    |

---

## Notes for Test Automation

- **data-testid conventions:**
  - `client-dropdown`: Client selector dropdown
  - `client-search-input`: Search input in dropdown
  - `client-option-{id}`: Individual client option
  - `add-client-button`: Button to add new client
  - `client-modal`: Modal for inline client creation
  - `save-invoice-button`: Save invoice button
  - `client-warning`: Warning message for deleted client

- **Test Data Requirements:**
  - User with 0 clients (for TC-06)
  - User with 4+ clients (for TC-03)
  - User with draft invoice (for TC-08, TC-10)
  - User with sent invoice (for TC-09)
