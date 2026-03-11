# Feature Test Plan: Preview Invoice Before Sending

**User Story:** [SQ-26](https://upexgalaxy64.atlassian.net/browse/SQ-26)
**Epic:** [SQ-20](https://upexgalaxy64.atlassian.net/browse/SQ-20) (Invoice Creation)
**Test Suite:** `Sanity: SQ-26: Preview Invoice Before Sending`
**Prepared for:** QA Manual + TAE (Automation)

---

## Test Summary

| Metric            | Value |
| ----------------- | ----- |
| Total Test Cases  | 15    |
| UI Layer (E2E)    | 8     |
| API Layer         | 4     |
| DB Layer          | 3     |
| Priority Critical | 3     |
| Priority High     | 6     |
| Priority Medium   | 4     |
| Priority Low      | 2     |
| Automation ROI+   | 12    |
| Manual Only       | 3     |

---

## Preconditions (Global)

```gherkin
Background:
  Given el usuario esta autenticado en la aplicacion
  And existe al menos un cliente registrado
  And existe un business_profile configurado para el usuario
  And el usuario tiene una factura en estado "draft" con items
```

### Precondition Data Requirements

| Entity              | Required Fields                                           |
| ------------------- | --------------------------------------------------------- |
| `profiles`          | user_id, email_verified = true                            |
| `business_profiles` | business_name, contact_email, at least one payment_method |
| `clients`           | name, email                                               |
| `invoices`          | status = 'draft', client_id, at least 1 item              |
| `invoice_items`     | description, quantity > 0, unit_price > 0                 |

---

## UI Layer Test Cases (E2E)

### TC1: Open Preview Modal/Page

**Jira Title:** `SQ-26: TC1: Validar apertura de preview cuando se hace click en boton Preview`

```gherkin
@critical @smoke @e2e @automation-candidate
Scenario: Open invoice preview successfully
  Given estoy en la pagina de edicion de factura "/invoices/{id}/edit"
  And la factura tiene datos completos (cliente, items, totales)
  When hago click en el boton "Preview"
  Then deberia ver el modal/pagina de preview de factura
  And el preview deberia mostrar el template de factura renderizado
  And deberia ver los botones de accion "Edit", "Send", "Download PDF"
```

| Attribute   | Value                                                                              |
| ----------- | ---------------------------------------------------------------------------------- |
| Priority    | Critical                                                                           |
| Labels      | `critical`, `smoke`, `e2e`, `automation-candidate`                                 |
| Test Type   | Positive                                                                           |
| Automation  | Yes (ROI: High frequency, stable flow)                                             |
| data-testid | `btn-preview`, `modal-invoice-preview`, `btn-edit`, `btn-send`, `btn-download-pdf` |

---

### TC2: Preview Shows All Invoice Data

**Jira Title:** `SQ-26: TC2: Validar que el preview muestra todos los datos de la factura correctamente`

```gherkin
@critical @regression @e2e @automation-candidate
Scenario: Preview displays complete invoice data
  Given estoy viendo el preview de una factura
  When reviso el contenido del preview
  Then deberia ver la seccion de datos del negocio:
    | Campo         | Valor esperado          |
    | business_name | [Desde business_profile] |
    | logo          | [Si existe logo_url]     |
    | tax_id        | [Si existe]              |
    | contact_email | [Desde business_profile] |
  And deberia ver la seccion de datos del cliente:
    | Campo   | Valor esperado     |
    | name    | [Desde client]     |
    | email   | [Desde client]     |
    | company | [Si existe]        |
  And deberia ver la lista de items con:
    | description | quantity | unit_price | subtotal |
  And deberia ver los totales:
    | subtotal | tax_amount | discount | total |
  And deberia ver los metodos de pago configurados
  And deberia ver las notas (si existen)
```

| Attribute   | Value                                                                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Priority    | Critical                                                                                                                                  |
| Labels      | `critical`, `regression`, `e2e`, `automation-candidate`                                                                                   |
| Test Type   | Positive                                                                                                                                  |
| Automation  | Yes (ROI: Critical validation, high impact)                                                                                               |
| data-testid | `preview-business-section`, `preview-client-section`, `preview-items-table`, `preview-totals`, `preview-payment-methods`, `preview-notes` |

---

### TC3: Return to Edit from Preview

**Jira Title:** `SQ-26: TC3: Validar retorno a edicion cuando se hace click en Edit desde preview`

```gherkin
@high @regression @e2e @automation-candidate
Scenario: Return to invoice editor preserving data
  Given estoy viendo el preview de una factura
  And la factura tiene los siguientes datos:
    | Campo          | Valor              |
    | client_name    | Cliente Test       |
    | item_count     | 3                  |
    | total          | 1500.00            |
  When hago click en el boton "Edit"
  Then deberia regresar a la pagina de edicion de factura
  And todos los datos de la factura deberian estar intactos:
    | Campo          | Valor              |
    | client_name    | Cliente Test       |
    | item_count     | 3                  |
    | total          | 1500.00            |
  And no deberia haber perdida de datos
```

| Attribute   | Value                                               |
| ----------- | --------------------------------------------------- |
| Priority    | High                                                |
| Labels      | `high`, `regression`, `e2e`, `automation-candidate` |
| Test Type   | Positive                                            |
| Automation  | Yes (ROI: Data integrity validation)                |
| data-testid | `btn-edit`, `form-invoice-edit`                     |

---

### TC4: Close Preview with X Button

**Jira Title:** `SQ-26: TC4: Validar cierre de preview cuando se hace click en boton X`

```gherkin
@high @regression @e2e @automation-candidate
Scenario: Close preview modal with X button
  Given estoy viendo el preview de una factura en modal
  When hago click en el boton de cerrar (X)
  Then el modal de preview deberia cerrarse
  And deberia regresar a la pagina de edicion
  And los datos de la factura deberian permanecer intactos
```

| Attribute   | Value                                               |
| ----------- | --------------------------------------------------- |
| Priority    | High                                                |
| Labels      | `high`, `regression`, `e2e`, `automation-candidate` |
| Test Type   | Positive                                            |
| Automation  | Yes                                                 |
| data-testid | `btn-close-preview`, `modal-invoice-preview`        |

---

### TC5: Send Invoice from Preview

**Jira Title:** `SQ-26: TC5: Validar envio de factura cuando se hace click en Send desde preview`

```gherkin
@critical @smoke @e2e @automation-candidate
Scenario: Send invoice successfully from preview
  Given estoy viendo el preview de una factura en estado "draft"
  And el cliente tiene un email valido
  When hago click en el boton "Send"
  Then deberia ver un indicador de carga/procesamiento
  And la factura deberia enviarse al cliente
  And deberia ver un mensaje de confirmacion "Factura enviada exitosamente"
  And el estado de la factura deberia cambiar a "sent"
  And deberia registrarse un evento "sent" en invoice_events
```

| Attribute   | Value                                              |
| ----------- | -------------------------------------------------- |
| Priority    | Critical                                           |
| Labels      | `critical`, `smoke`, `e2e`, `automation-candidate` |
| Test Type   | Positive                                           |
| Automation  | Yes (ROI: Core business flow)                      |
| data-testid | `btn-send`, `toast-success`, `loading-indicator`   |

---

### TC6: Download PDF from Preview

**Jira Title:** `SQ-26: TC6: Validar descarga de PDF cuando se hace click en Download PDF desde preview`

```gherkin
@high @regression @e2e @automation-candidate
Scenario: Download invoice PDF from preview
  Given estoy viendo el preview de una factura
  When hago click en el boton "Download PDF"
  Then deberia iniciarse la descarga de un archivo PDF
  And el nombre del archivo deberia seguir el formato "invoice_{invoice_number}.pdf"
  And el PDF deberia contener los mismos datos que el preview
```

| Attribute   | Value                                               |
| ----------- | --------------------------------------------------- |
| Priority    | High                                                |
| Labels      | `high`, `regression`, `e2e`, `automation-candidate` |
| Test Type   | Positive                                            |
| Automation  | Yes (ROI: Important feature, verifiable)            |
| data-testid | `btn-download-pdf`                                  |

---

### TC7: Preview with Missing Optional Data

**Jira Title:** `SQ-26: TC7: Validar preview cuando faltan datos opcionales como logo o notas`

```gherkin
@medium @regression @e2e @automation-candidate
Scenario: Preview handles missing optional data gracefully
  Given estoy editando una factura
  And el business_profile no tiene logo_url configurado
  And la factura no tiene notas
  And la factura no tiene descuento aplicado
  When hago click en el boton "Preview"
  Then el preview deberia mostrarse correctamente
  And la seccion de logo no deberia mostrarse o mostrar placeholder
  And la seccion de notas no deberia mostrarse
  And la linea de descuento no deberia aparecer en totales
```

| Attribute   | Value                                                 |
| ----------- | ----------------------------------------------------- |
| Priority    | Medium                                                |
| Labels      | `medium`, `regression`, `e2e`, `automation-candidate` |
| Test Type   | Edge Case                                             |
| Automation  | Yes                                                   |
| data-testid | `preview-logo-placeholder`, `preview-notes`           |

---

### TC8: Preview Button Disabled for Incomplete Invoice

**Jira Title:** `SQ-26: TC8: Validar que boton Preview esta deshabilitado cuando la factura esta incompleta`

```gherkin
@medium @regression @e2e @automation-candidate
Scenario: Preview button disabled when invoice is incomplete
  Given estoy en la pagina de creacion de factura
  And no he seleccionado un cliente
  Or no he agregado ningun item
  When verifico el estado del boton "Preview"
  Then el boton "Preview" deberia estar deshabilitado
  And deberia ver un tooltip indicando "Completa los campos requeridos"
```

| Attribute   | Value                                                 |
| ----------- | ----------------------------------------------------- |
| Priority    | Medium                                                |
| Labels      | `medium`, `regression`, `e2e`, `automation-candidate` |
| Test Type   | Negative                                              |
| Automation  | Yes                                                   |
| data-testid | `btn-preview`, `tooltip-preview-disabled`             |

---

## API Layer Test Cases (Integration)

### TC9: GET Invoice with Relations for Preview

**Jira Title:** `SQ-26: TC9: Validar endpoint GET invoice con relaciones retorna datos completos para preview`

```gherkin
@high @integration @api @automation-candidate
Scenario: Fetch invoice with all relations for preview
  Given tengo un token de autenticacion valido
  And existe una factura con id "{invoice_id}" del usuario
  When envio GET request a "/rest/v1/invoices?id=eq.{invoice_id}&select=*,client:clients(*),items:invoice_items(*)"
  Then el response status deberia ser 200
  And el response deberia contener:
    | Field           | Type     |
    | id              | UUID     |
    | invoice_number  | string   |
    | status          | enum     |
    | client.name     | string   |
    | client.email    | string   |
    | items           | array    |
    | subtotal        | number   |
    | total           | number   |
```

| Attribute  | Value                                                |
| ---------- | ---------------------------------------------------- |
| Priority   | High                                                 |
| Labels     | `high`, `integration`, `api`, `automation-candidate` |
| Test Type  | Positive                                             |
| Automation | Yes (ROI: Core data fetch)                           |
| Endpoint   | `GET /rest/v1/invoices`                              |

---

### TC10: PATCH Invoice Status to Sent

**Jira Title:** `SQ-26: TC10: Validar endpoint PATCH actualiza status a sent cuando se envia factura`

```gherkin
@high @integration @api @automation-candidate
Scenario: Update invoice status to sent
  Given tengo un token de autenticacion valido
  And existe una factura en estado "draft" con id "{invoice_id}"
  When envio PATCH request a "/rest/v1/invoices?id=eq.{invoice_id}" con body:
    """json
    {
      "status": "sent",
      "sent_at": "2026-02-03T12:00:00Z"
    }
    """
  Then el response status deberia ser 204
  And la factura deberia tener status "sent" en la base de datos
```

| Attribute  | Value                                                |
| ---------- | ---------------------------------------------------- |
| Priority   | High                                                 |
| Labels     | `high`, `integration`, `api`, `automation-candidate` |
| Test Type  | Positive                                             |
| Automation | Yes                                                  |
| Endpoint   | `PATCH /rest/v1/invoices`                            |

---

### TC11: POST Invoice Event on Send

**Jira Title:** `SQ-26: TC11: Validar endpoint POST crea evento sent en invoice_events al enviar`

```gherkin
@medium @integration @api @automation-candidate
Scenario: Create invoice event when invoice is sent
  Given tengo un token de autenticacion valido
  And acabo de enviar una factura con id "{invoice_id}"
  When envio POST request a "/rest/v1/invoice_events" con body:
    """json
    {
      "invoice_id": "{invoice_id}",
      "event_type": "sent",
      "metadata": {
        "sent_to": "cliente@email.com",
        "sent_at": "2026-02-03T12:00:00Z"
      }
    }
    """
  Then el response status deberia ser 201
  And el evento deberia quedar registrado en la base de datos
```

| Attribute  | Value                                                  |
| ---------- | ------------------------------------------------------ |
| Priority   | Medium                                                 |
| Labels     | `medium`, `integration`, `api`, `automation-candidate` |
| Test Type  | Positive                                               |
| Automation | Yes                                                    |
| Endpoint   | `POST /rest/v1/invoice_events`                         |

---

### TC12: API Unauthorized Access

**Jira Title:** `SQ-26: TC12: Validar que API retorna 401 cuando se accede sin autenticacion`

```gherkin
@low @integration @api @automation-candidate
Scenario: Reject unauthorized access to invoice data
  Given no tengo un token de autenticacion
  When envio GET request a "/rest/v1/invoices?id=eq.{invoice_id}&select=*"
  Then el response status deberia ser 401
  And el response deberia contener mensaje de error de autenticacion
```

| Attribute  | Value                                               |
| ---------- | --------------------------------------------------- |
| Priority   | Low                                                 |
| Labels     | `low`, `integration`, `api`, `automation-candidate` |
| Test Type  | Security/Negative                                   |
| Automation | Yes                                                 |
| Endpoint   | `GET /rest/v1/invoices`                             |

---

## DB Layer Test Cases (Data Verification)

### TC13: Invoice Data Integrity After Send

**Jira Title:** `SQ-26: TC13: Validar integridad de datos en DB despues de enviar factura`

```gherkin
@high @db @manual-only
Scenario: Verify database state after invoice is sent
  Given envie una factura con id "{invoice_id}" desde el preview
  When consulto la base de datos
  Then la tabla "invoices" deberia tener:
    | Column    | Expected Value         |
    | status    | 'sent'                 |
    | sent_at   | NOT NULL (timestamp)   |
    | updated_at| >= sent_at             |
  And la tabla "invoice_events" deberia tener un registro:
    | Column     | Expected Value         |
    | invoice_id | {invoice_id}           |
    | event_type | 'sent'                 |
    | created_at | NOT NULL               |
```

**SQL Verification Query:**

```sql
-- Verify invoice status
SELECT id, status, sent_at, updated_at
FROM invoices
WHERE id = '{invoice_id}';

-- Verify event was logged
SELECT * FROM invoice_events
WHERE invoice_id = '{invoice_id}'
AND event_type = 'sent'
ORDER BY created_at DESC
LIMIT 1;
```

| Attribute  | Value                                         |
| ---------- | --------------------------------------------- |
| Priority   | High                                          |
| Labels     | `high`, `db`, `manual-only`                   |
| Test Type  | Data Verification                             |
| Automation | No (requires DB access, better for manual QA) |

---

### TC14: Invoice Calculations Accuracy

**Jira Title:** `SQ-26: TC14: Validar que calculos de factura en preview coinciden con datos en DB`

```gherkin
@medium @db @manual-only
Scenario: Verify invoice calculations match database values
  Given tengo una factura con multiples items
  When comparo los valores en el preview con la base de datos
  Then el subtotal en preview deberia coincidir con:
    """sql
    SELECT SUM(subtotal) FROM invoice_items WHERE invoice_id = '{id}'
    """
  And el total en preview deberia coincidir con:
    """sql
    SELECT total FROM invoices WHERE id = '{id}'
    """
  And el tax_amount deberia ser correcto segun tax_rate aplicado
```

| Attribute  | Value                         |
| ---------- | ----------------------------- |
| Priority   | Medium                        |
| Labels     | `medium`, `db`, `manual-only` |
| Test Type  | Data Verification             |
| Automation | No (calculation verification) |

---

### TC15: RLS Policy Verification

**Jira Title:** `SQ-26: TC15: Validar que RLS policies permiten solo acceso a facturas propias`

```gherkin
@low @db @security @manual-only
Scenario: Verify Row Level Security for invoice access
  Given existen facturas de multiples usuarios en el sistema
  And estoy autenticado como usuario A
  When intento acceder a una factura del usuario B via API
  Then deberia recibir un array vacio o error 404
  And no deberia poder ver datos de facturas ajenas
```

**SQL Verification (as service role):**

```sql
-- Verify RLS policy exists
SELECT * FROM pg_policies
WHERE tablename = 'invoices';

-- Test as user A trying to access user B's invoice
SET request.jwt.claim.sub = '{user_a_id}';
SELECT * FROM invoices WHERE user_id = '{user_b_id}';
-- Should return empty
```

| Attribute  | Value                                  |
| ---------- | -------------------------------------- |
| Priority   | Low                                    |
| Labels     | `low`, `db`, `security`, `manual-only` |
| Test Type  | Security                               |
| Automation | No (security audit)                    |

---

## Test Data Requirements

### Test Users

| User Type      | Email              | Role | Notes                |
| -------------- | ------------------ | ---- | -------------------- |
| Primary Tester | tester@soloq.test  | User | Has business profile |
| Secondary      | tester2@soloq.test | User | For RLS testing      |

### Test Invoices

| Invoice ID | Status | Items | Client        | Total   |
| ---------- | ------ | ----- | ------------- | ------- |
| INV-001    | draft  | 3     | Cliente Alpha | 1500.00 |
| INV-002    | draft  | 1     | Cliente Beta  | 500.00  |
| INV-003    | draft  | 5     | Cliente Gamma | 3500.00 |

### Test Clients

| Name          | Email             | Company    |
| ------------- | ----------------- | ---------- |
| Cliente Alpha | alpha@cliente.com | Alpha Corp |
| Cliente Beta  | beta@cliente.com  | Beta LLC   |
| Cliente Gamma | gamma@cliente.com | NULL       |

---

## Automation Priority Matrix

| TC   | Frequency | Impact | Stability | Effort | ROI Score | Decision |
| ---- | --------- | ------ | --------- | ------ | --------- | -------- |
| TC1  | High      | High   | High      | Low    | 4.5       | Automate |
| TC2  | High      | High   | High      | Medium | 4.0       | Automate |
| TC3  | High      | High   | High      | Low    | 4.5       | Automate |
| TC4  | High      | Medium | High      | Low    | 3.5       | Automate |
| TC5  | High      | High   | Medium    | Medium | 3.5       | Automate |
| TC6  | Medium    | Medium | High      | Medium | 3.0       | Automate |
| TC7  | Medium    | Low    | High      | Low    | 2.5       | Automate |
| TC8  | Medium    | Medium | High      | Low    | 3.0       | Automate |
| TC9  | High      | High   | High      | Low    | 4.5       | Automate |
| TC10 | High      | High   | High      | Low    | 4.5       | Automate |
| TC11 | Medium    | Medium | High      | Low    | 3.0       | Automate |
| TC12 | Low       | Medium | High      | Low    | 2.5       | Automate |
| TC13 | Medium    | High   | Medium    | High   | 1.5       | Manual   |
| TC14 | Low       | Medium | Low       | High   | 1.0       | Manual   |
| TC15 | Low       | High   | Low       | High   | 1.2       | Manual   |

---

## KATA Component Mapping (for TAE)

| Test Case | Component Type | Component Name       | ATC Method                          |
| --------- | -------------- | -------------------- | ----------------------------------- |
| TC1-TC8   | UI             | `InvoicePreviewPage` | Various `@atc('SQ-26-TCx')` methods |
| TC9-TC12  | API            | `InvoicesApi`        | Various `@atc('SQ-26-TCx')` methods |
| TC13-TC15 | -              | Manual verification  | N/A                                 |

### Suggested UI Component Structure

```typescript
// tests/components/ui/InvoicePreviewPage.ts
export class InvoicePreviewPage extends UiBase {
  @atc('SQ-26-TC1')
  async openPreviewSuccessfully(invoiceId: string) {}

  @atc('SQ-26-TC2')
  async verifyPreviewShowsAllData(expectedData: InvoicePreviewData) {}

  @atc('SQ-26-TC3')
  async returnToEditSuccessfully() {}

  @atc('SQ-26-TC5')
  async sendInvoiceFromPreviewSuccessfully() {}

  @atc('SQ-26-TC6')
  async downloadPdfFromPreviewSuccessfully() {}
}
```

---

## Execution Strategy

### Phase 1: Smoke Tests (Pre-release)

- TC1: Open Preview
- TC5: Send from Preview

### Phase 2: Sanity Tests (Feature validation)

- TC1, TC2, TC3, TC5, TC6

### Phase 3: Regression Tests (Full suite)

- All TCs (TC1-TC15)

---

## Notes for Jira Import

1. Create Test Suite: `Sanity: SQ-26: Preview Invoice Before Sending`
2. Link all TCs to User Story SQ-26
3. Parent Epic: Test Repository (create if not exists)
4. Apply labels as specified per TC
5. Set initial status: `Draft`
6. Transition to `In Design` when documenting steps

---

**Last Updated:** 2026-02-03
**Author:** AI Assistant (Claude)
**Review Status:** Pending QA Lead Review
