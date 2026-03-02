# List All Clients

**Jira Key:** [SQ-15](https://upexgalaxy65.atlassian.net/browse/SQ-15)
**Epic:** [SQ-13](https://upexgalaxy65.atlassian.net/browse/SQ-13) (Client Management)
**Priority:** Medium
**Story Points:** 5
**Status:** Ready For QA

---

## User Story

## User Story

**As a** user
**I want to** see the list of all my clients
**So that** I can quickly find who I need to invoice

## Acceptance Criteria

### Scenario 1: View client list

- ***Given:*** I have clients in my account
- ***When:*** I navigate to the clients page
- ***Then:*** I see a list of all my clients with name and email

### Scenario 2: Search clients

- ***Given:*** I have many clients
- ***When:*** I type in the search box
- ***Then:*** The list filters to show matching clients (by name or email)

### Scenario 3: Empty state

- ***Given:*** I have no clients yet
- ***When:*** I navigate to the clients page
- ***Then:*** I see an empty state with a CTA to add my first client

### Scenario 4: Sort clients

- ***Given:*** I am viewing my clients list
- ***When:*** I click on column headers
- ***Then:*** The list sorts by that column (name, created date)

## Technical Notes

- Paginated list (20 per page)
- Search by name and email
- Sort by name, created_at
- Component: ClientsList

## Story Points

3

## 

## QA Refinements (Shift-Left Analysis)

**Analysis Date:** 2026-01-27
**Status:** Refined by QA

### Refined Acceptance Criteria

#### Scenario 1: View client list - Happy Path

- ***Given:*** Usuario autenticado con 5+ clientes en su cuenta, ninguno soft-deleted
- ***When:*** Usuario navega a /clients
- ***Then:***

#### Scenario 4: Search - No Results

- ***Given:*** Usuario tiene clientes, ninguno tiene "xyz" en nombre ni email
- ***When:*** Usuario escribe "xyz" en search box
- ***Then:***

#### Scenario 5: Pagination

- ***Given:*** Usuario tiene 45 clientes
- ***When:*** Navega a /clients
- ***Then:***

#### Scenario 6: RLS Security

- ***Given:*** User A y User B tienen clientes diferentes
- ***When:*** User A navega a /clients
- ***Then:*** SOLO ve sus propios clientes (RLS enforced)

### Edge Cases Identified

- Busqueda sin resultados (no estaba en story original)
- Caracteres especiales en busqueda (seguridad)
- Pagina invalida en URL (?page=999)
- Clientes soft-deleted NO deben aparecer
- Busqueda con espacios (trim required)

### Clarified Business Rules

- Busqueda debe ser case-insensitive y partial match
- Orden por defecto: alfabetico por nombre (A-Z)
- Soft-deleted clients: NO mostrar en lista
- Paginacion: 20 items por pagina

### Critical Questions (Pending)

- Texto exacto del CTA en empty state?
- La busqueda es debounced? (300ms sugerido)
- Controles de paginacion: numeros o prev/next?

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
- **Updated:** 2/11/2026
- **Reporter:** Ely
- **Assignee:** Marco Antonio Camacho
- **Labels:** shift-left-reviewed

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:44.359Z_
