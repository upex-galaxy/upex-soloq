# Comments for SQ-15

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-15)

---

### Ely - 1/27/2026, 10:00:58 PM

## Shift-Left Test Cases - Generated 2026-01-27

***QA Engineer:*** AI-Generated
***Status:*** Draft - Pending PO/Dev Review

## 

## Test Coverage Summary

***Total Test Cases:*** 10

- Positive: 5
- Negative: 1
- Boundary: 2
- Security/RLS: 1
- API: 1

***Complexity:*** Medium
***Estimated Test Effort:*** Medium

## 

## Test Cases

### TC-01: Validar visualizacion de lista de clientes con datos existentes

- ***Type:**** Positive | ****Priority:**** Critical | ****Level:*** E2E
- ***Preconditions:*** Usuario autenticado con 5+ clientes
- ***Steps:*** Navegar a /clients, verificar lista
- ***Expected:*** Lista muestra todos los clientes ordenados A-Z por nombre

### TC-02: Validar busqueda de clientes con coincidencia parcial

- ***Type:**** Positive | ****Priority:**** High | ****Level:*** E2E + API
- ***Preconditions:*** Usuario con clientes "John Smith", "Johnny Walker", "Jane Doe"
- ***Steps:*** Escribir "john" en search box
- ***Expected:*** Lista filtra mostrando "John Smith" y "Johnny Walker"

### TC-03: Validar empty state cuando usuario no tiene clientes

- ***Type:**** Positive | ****Priority:**** Critical | ****Level:*** E2E
- ***Preconditions:*** Usuario nuevo sin clientes
- ***Steps:*** Navegar a /clients
- ***Expected:*** Empty state con CTA "Agregar cliente"

### TC-04: Validar mensaje cuando busqueda no tiene resultados

- ***Type:**** Negative | ****Priority:**** High | ****Level:*** E2E
- ***Preconditions:*** Usuario con clientes, ninguno tiene "xyz123"
- ***Steps:*** Buscar "xyz123"
- ***Expected:*** Mensaje "No se encontraron clientes" con opcion limpiar

### TC-05: Validar ordenamiento de clientes por nombre descendente

- ***Type:**** Positive | ****Priority:**** Medium | ****Level:*** E2E
- ***Preconditions:*** Usuario con clientes "Alpha", "Beta", "Zeta"
- ***Steps:*** Click en header "Name" para cambiar orden
- ***Expected:*** Lista muestra Zeta primero, Alpha ultimo

### TC-06: Validar paginacion con mas de 20 clientes

- ***Type:**** Boundary | ****Priority:**** High | ****Level:*** E2E + API
- ***Preconditions:*** Usuario con 45 clientes
- ***Steps:*** Navegar a /clients, verificar paginacion
- ***Expected:*** 20 clientes en pagina 1, controles visibles, "1-20 de 45"

### TC-07: Validar aislamiento de datos - RLS Security Test

- ***Type:**** Security | ****Priority:**** Critical | ****Level:*** API
- ***Preconditions:*** User A y User B con clientes diferentes
- ***Steps:*** User A accede a /api/clients
- ***Expected:*** SOLO retorna clientes de User A, NUNCA de User B

### TC-08: Validar que clientes soft-deleted no aparecen en lista

- ***Type:**** Positive | ****Priority:**** High | ****Level:*** API + E2E
- ***Preconditions:*** Usuario con 2 activos, 1 soft-deleted
- ***Steps:*** GET /api/clients
- ***Expected:*** Solo retorna 2 clientes activos

### TC-09: Validar API contract - GET /api/clients

- ***Type:**** API Contract | ****Priority:**** High | ****Level:*** API
- ***Steps:*** Probar endpoint con diferentes query params
- ***Expected:*** 200 con estructura correcta, 401 sin auth

### TC-10: Validar comportamiento con pagina invalida

- ***Type:**** Boundary | ****Priority:**** Medium | ****Level:*** API
- ***Preconditions:*** Usuario con 25 clientes (2 paginas)
- ***Steps:*** GET /api/clients?page=999
- ***Expected:*** 200 OK (no crash), comportamiento definido

## Edge Cases Identified (Not in Original Story)

| ***Edge Case **** | ****Criticality **** | ****Action *** |
| --- | --- | --- |
| Busqueda sin resultados  | High  | Added as TC-04  |
| Caracteres especiales en busqueda  | High  | Needs Dev clarification  |
| Clientes soft-deleted  | High  | Added as TC-08  |
| Pagina invalida  | Medium  | Added as TC-10  |
| Busqueda con espacios (trim)  | Medium  | Covered in parametrized tests  |

## 

## Critical Questions for Team

***For PO:***

- [ ] Texto exacto del CTA en empty state?
- [ ] Columnas a mostrar: solo Name/Email o tambien Company?

***For Dev:***

- [ ] Busqueda es case-insensitive? Partial match?
- [ ] Debounce en search? (sugerido 300ms)
- [ ] Comportamiento de pagina invalida?

## Action Required

***@Product Owner:***

- [ ] Validar edge cases identificados
- [ ] Responder preguntas criticas
- [ ] Confirmar expected behavior de empty state

***@Dev Lead:***

- [ ] Confirmar comportamiento de busqueda
- [ ] Validar approach de paginacion
- [ ] Confirmar RLS policy implementation

***@QA Team:***

- [ ] Preparar test data
- [ ] Configurar environment

## Next Steps

1. Team discute preguntas criticas
2. PO/Dev proveen respuestas
3. QA finaliza test cases
4. Dev implementa con criterios claros

***Documentation:*** Full test cases available at:
`.context/PBI/epics/EPIC-SQ-13-client-management/stories/STORY-SQ-15-list-clients/test-cases.md`

---

### Ely - 2/7/2026, 2:58:53 AM

Iniciando implementacion de List All Clients. Branch: feat/[https://upexgalaxy65.atlassian.net/browse/SQ-15#icft=SQ-15](https://upexgalaxy65.atlassian.net/browse/SQ-15#icft=SQ-15)/list-clients

---

### Ely - 2/7/2026, 3:42:23 AM

Feature implementada y desplegada a staging. PR #25 mergeado.

---

### Ely - 2/7/2026, 3:42:50 AM

## Feature Implementada y Desplegada a Staging

***PR:*** [#25](https://github.com/upex-galaxy/upex-soloq/pull/25) (MERGED)
***Branch:*** `feat/SQ-15/list-clients`

### Cambios Implementados

***API:***

- GET `/api/clients` con search, sort, pagination
- ILIKE search en name, email, company
- RLS y soft-delete filtering

***Frontend:***

- `useClients` hook con React Query (5min cache)
- `useDebounce` hook (300ms)
- `ClientsTable` - sortable columns
- `ClientsSearch` - search input
- `ClientsEmptyState` - 2 variantes
- `ClientsPagination` - números + prev/next

### Acceptance Criteria Verificados

- Ver lista de clientes con nombre y email
- Buscar case-insensitive y partial match
- Empty state con CTA
- Ordenar por columnas
- Paginación 20/página
- RLS (solo clientes del usuario)
- Soft-deleted excluidos

### Test Plan

- [ ] Navegar a /clients autenticado
- [ ] Verificar empty state sin clientes
- [ ] Agregar cliente y ver en lista
- [ ] Buscar por nombre/email
- [ ] Click en headers para ordenar
- [ ] Test paginación con >20 clientes

La funcionalidad está lista para pruebas en staging.

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:45.113Z_
