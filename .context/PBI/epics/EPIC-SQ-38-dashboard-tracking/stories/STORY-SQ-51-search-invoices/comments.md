# Comments for SQ-51

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-51)

---

### Fernando Javier Masci - 2026-03-25T03:17:15.235Z

Shift Left

- ACs tiene los bullets un poco raros. Corregir

Scenario 1: Search box visible

- ***Given:*** I am on the dashboard
- ***When:*** I look at the header
- ***Then:*** I see a search box
  - Notas: Hay un solo tipo de usuario en cuanto a permisos de visibildad?

Scenario 2: Search by invoice number

- ***Given:*** I type an invoice number (e.g., "INV-2026-0042")
- ***When:*** I submit the search
- ***Then:*** I see invoices matching that number
  - Notas: Hay reglas de validacion de formato de invoice number? Probar valores invalidos

Scenario 3: Search by client name

- ***Given:*** I type a client's name
- ***When:*** I submit the search
- ***Then:*** I see all invoices for that client
  - Notas: El campo de busqueda admite **Búsqueda difusa (Fuzzy Search / Fuzzy Matching)**?

Scenario 4: Partial match

- ***Given:*** I type partial text (e.g., "John")
- ***When:*** I search
- ***Then:*** I see results that contain the search term
  - Probar cantidad de resultados, validar que los muestre todos.

Scenario 5: No results

- ***Given:*** I search for something that doesn't exist
- ***When:*** I view the results
- ***Then:*** I see a "No results found" message
  - Notas: Relacionado al Fuzzy Matching, probar valores limites, o hasta donde admite “fuzzy”

Scenario 6: Clear search

- ***Given:*** I have an active search
- ***When:*** I clear the search box
- ***Then:*** I see all invoices again
  - Notas: Antes de borrar el search box también mostraba todos los invoices?

---

### Fernando Javier Masci - 2026-03-28T21:11:39.399Z

# Feature Test Plan - SQ-51

## Objective

Validate invoice search from the dashboard with focus on UX, correctness, performance, and data consistency.

## Scope

- Search box visibility on dashboard load
- Fixed vs modal/popup behavior
- Search by invoice number and client name
- Case-insensitive and partial matches
- Search while typing vs search on submit
- Clear search and return to default list
- Empty state and no-results state

## Non-Functional Coverage

- Search response time for small and large datasets
- Debounce timing while typing
- Fast repeated submit actions
- Behavior under slow network or delayed API responses
- Database query correctness and filtering consistency

## Test Dimensions

- UI: visibility, placement, accessibility, focus behavior
- API: query param handling, search results, empty results
- DB: invoice_number and client joins, match accuracy
- UX: loading state, no-results message, clear action

## Suggested Scenarios

- Search box is visible when entering the dashboard
- Search box is fixed in the header and not rendered as a popup
- Typing a client name returns matching invoices after debounce
- Clicking submit returns the same result set as typed search
- Invalid invoice-number formats are handled consistently
- Partial matches return expected results
- Clearing the field restores the full invoice list
- Slow responses show a loading state without duplicate requests
- Results remain consistent with the backend query and database data

## Open Questions

- Is the search triggered live, on submit, or both?
- Which fields are searchable exactly?
- What is the expected timeout or debounce threshold?

---

_Synced from Jira by jira-sync_ _Last sync: 2026-03-28T21:11:54.573Z_

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-28T23:28:00.961Z_
