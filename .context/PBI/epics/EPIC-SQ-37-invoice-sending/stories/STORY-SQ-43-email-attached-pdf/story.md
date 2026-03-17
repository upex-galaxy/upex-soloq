# Include PDF Attachment in Email

**Jira Key:** [SQ-43](https://upexgalaxy65.atlassian.net/browse/SQ-43)
**Epic:** [SQ-37](https://upexgalaxy65.atlassian.net/browse/SQ-37) (Invoice Sending)
**Priority:** Medium
**Story Points:** 5
**Status:** Ready For QA

---

## User Story

Como usuario, quiero que el email incluya el PDF adjunto, para que el cliente tenga la factura. Story Points: 2

## 

## Refinamientos QA (Shift-Left Analysis)

**Fecha de analisis:** 2026-02-09
**Estado:** Refinado por QA

### Acceptance Criteria refinados

- Escenario 1: PDF adjunto incluido al enviar
- Escenario 2: Nombre del adjunto usa numero de factura
- Escenario 3: Tamano del adjunto dentro del limite
- Escenario 4: El adjunto abre correctamente
- Escenario 5: Falla la generacion de PDF
- Escenario 6: PDF supera el limite

### Edge Cases identificados

- Logo grande + muchos items genera PDF mayor a 5MB
- Generador de PDF retorna archivo vacio/0 bytes
- Numero de factura con caracteres especiales (requiere confirmacion)

### Reglas de negocio por definir

- Confirmar patron de nombre (Invoice-{invoiceNumber}.pdf vs {invoiceNumber}.pdf)
- Definir enforcement del limite y error response
- Confirmar generacion de PDF server-side para envio

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
- **Updated:** 3/1/2026
- **Reporter:** Ely
- **Assignee:** yxsinell acosta zambrano
- **Labels:** shift-left-reviewed, test-plan-ready

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:58.643Z_
