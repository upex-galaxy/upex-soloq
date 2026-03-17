# Edit Client Data

**Jira Key:** [SQ-16](https://upexgalaxy65.atlassian.net/browse/SQ-16)
**Epic:** [SQ-13](https://upexgalaxy65.atlassian.net/browse/SQ-13) (Client Management)
**Priority:** Medium
**Story Points:** 5
**Status:** QA Approved

---

## User Story

## User Story

**As a** user
**I want to** edit client data
**So that** I can keep information up to date

## Acceptance Criteria

### Scenario 1: Edit client name

- ***Given:*** I am viewing a client's details
- ***When:*** I edit the name and save
- ***Then:*** The new name is saved and displayed

### Scenario 2: Edit client email

- ***Given:*** I am editing a client
- ***When:*** I change the email to a valid new email
- ***Then:*** The new email is saved

### Scenario 3: Edit optional fields

- ***Given:*** I am editing a client
- ***When:*** I update company name, phone, or address
- ***Then:*** All changes are saved

### Scenario 4: Validation on edit

- ***Given:*** I am editing a client
- ***When:*** I enter invalid data (e.g., bad email format)
- ***Then:*** I see validation errors and changes are not saved

## Technical Notes

- API: PUT /api/clients/:id
- Same validation as create
- Audit trail: updated_at

## Story Points

2

## 

## QA Refinements (Shift-Left Analysis)

**Analysis Date:** 2026-02-03
**Status:** Refined by QA

### Refined Acceptance Criteria

#### Scenario 1: Edicion exitosa de datos basicos (Positive)

- ***Given:***
- ***When:***
- ***Then:***

#### Scenario 2: Edicion exitosa del email con valor valido (Positive)

- ***Given:***
- ***When:***
- ***Then:***

#### Scenario 3: Error por datos invalidos (Negative)

- ***Given:***
- ***When:***
- ***Then:***

#### Scenario 4: Email duplicado del mismo usuario (Negative)

- ***Given:***
- ***When:***
- ***Then:***

#### Scenario 5: Limites de longitud aceptados (Boundary)

- ***Given:***
- ***When:***
- ***Then:***

### Edge Cases Identified

- Email duplicado para el mismo usuario (debe rechazar con error claro)
- Guardar sin cambios (definir si actualiza updated_at)
- Limites maximos de longitud (aceptar en limite, rechazar excedente)

### Clarified Business Rules (Pending PO/Dev Confirmation)

- Definir mensajes de validacion esperados por campo
- Confirmar si PUT requiere payload completo o parcial
- Aclarar comportamiento al limpiar campos opcionales (null vs string vacio)
- Confirmar feedback post-guardado (toast, redirect, updated_at visible)

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

## References

- [External Link](https://staging-upexsoloq.vercel.app/clients)

---

## Traceability

### Tests (3)

- [SQ-103](https://upexgalaxy65.atlassian.net/browse/SQ-103): SQ-16: TC1: Validar guardado exitoso de datos básicos con valores válidos _(Candidate)_
- [SQ-104](https://upexgalaxy65.atlassian.net/browse/SQ-104): SQ-16: TC2: Validar rechazo por email duplicado del mismo usuario _(Candidate)_
- [SQ-105](https://upexgalaxy65.atlassian.net/browse/SQ-105): SQ-16: TC3: Validar integración de actualización cliente en flujo Frontend → API → DB _(Candidate)_

### Defects (2)

- [SQ-71](https://upexgalaxy65.atlassian.net/browse/SQ-71): CM | The breadcrumb displays the user_ID when editing a customer. _(CLOSED)_
- [SQ-75](https://upexgalaxy65.atlassian.net/browse/SQ-75): CM | The “Phone” field accepts letters and allows you to save it without any errors. _(CLOSED)_

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 3/1/2026
- **Reporter:** Ely
- **Assignee:** Joel Armando Ramírez Rodríguez
- **Labels:** shift-left-reviewed

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:45.114Z_
