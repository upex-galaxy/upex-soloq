# Create Invoice by Selecting Client

**Jira Key:** [SQ-21](https://upexgalaxy65.atlassian.net/browse/SQ-21)
**Epic:** [SQ-20](https://upexgalaxy65.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** Medium
**Story Points:** 8
**Status:** Ready For QA

---

## User Story

## User Story

**As a** user
**I want to** create a new invoice by selecting a client
**So that** I can start billing

## Acceptance Criteria

### Scenario 1: Start new invoice

- ***Given:*** I am on the invoices page
- ***When:*** I click "New Invoice"
- ***Then:*** I see a client selection dropdown

### Scenario 2: Select existing client

- ***Given:*** I am creating a new invoice
- ***When:*** I select a client from my list
- ***Then:*** Client details are pre-filled on the invoice

### Scenario 3: Quick add new client

- ***Given:*** I am creating an invoice and the client is not in my list
- ***When:*** I click "Add new client"
- ***Then:*** I can create a new client inline and continue

## Technical Notes

- Client selector with search
- Pre-fill client name, email, tax ID
- Quick client creation modal

## Story Points

3

## 

## 🧪 QA Refinements (Shift-Left Analysis)

**Analysis Date:** 2026-02-03
**Status:** Refined by QA

### Refined Acceptance Criteria

#### Scenario 1: Navigate to invoice creation form

- ***Given:*** Usuario autenticado en `/invoices` con al menos 1 cliente existente
- ***When:*** Usuario hace click en "Create Invoice" o "New Invoice"
- ***Then:***

#### Scenario 2: Select existing client from dropdown

- ***Given:*** Usuario tiene clientes: "Acme Corp" (email: acme@corp.com, taxId: RFC123), "Beta Inc" (email: beta@inc.com)
- ***When:*** Usuario abre dropdown y selecciona "Acme Corp"
- ***Then:***

#### Scenario 3: Search and filter clients in dropdown

- ***Given:*** Usuario tiene 10+ clientes
- ***When:*** Usuario escribe "Acme" en campo de búsqueda del dropdown
- ***Then:***

#### Scenario 4: Quick add new client inline

- ***Given:*** Usuario está creando factura y su cliente no existe
- ***When:*** Usuario hace click en "Add new client"
- ***Then:***

#### Scenario 5: Invoice created with client association

- ***Given:*** Usuario ha seleccionado cliente "Acme Corp"
- ***When:*** Usuario guarda la factura (como draft o enviada)
- ***Then:***

### Edge Cases Identified

- Usuario sin clientes intenta crear factura → debe poder crear cliente inline
- Búsqueda con caracteres especiales → debe sanitizarse
- Cliente eliminado después de seleccionarlo → debe manejar gracefully
- Doble-click en "Add client" → prevenir duplicados
- Creación de cliente falla → mantener contexto de factura

### Clarified Business Rules

- Invoice siempre requiere un cliente (clientId es required según API contract)
- Invoice inicia en status 'draft' por defecto
- Client data se auto-popula pero NO se sincroniza después (snapshot at creation time)
- Búsqueda de clientes debe ser debounced (300ms sugerido)

### Critical Questions (Pending)

- ***For PO:*** ¿Qué campos del cliente mostrar en el dropdown? (solo nombre, o nombre + email?)
- ***For PO:*** ¿El cliente puede cambiar después de crear la factura en draft?
- ***For Dev:*** ¿La búsqueda es client-side o server-side para >100 clientes?
- ***For Dev:*** ¿Qué pasa si el cliente se elimina mientras la factura está en draft?

---

## Acceptance Criteria

Feature:

Background:
Given ...

Scenario: ...
Given ...
When ...
Then ...

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 2/7/2026
- **Reporter:** Ely
- **Assignee:** Ely
- **Labels:** invoice-creation, mvp, shift-left-reviewed

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:49.011Z_
