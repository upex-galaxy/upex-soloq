# Add Discounts to Invoice

**Jira Key:** [SQ-25](https://upexgalaxy65.atlassian.net/browse/SQ-25)
**Epic:** [SQ-20](https://upexgalaxy65.atlassian.net/browse/SQ-20) (Invoice Creation)
**Priority:** Medium
**Story Points:** 2
**Status:** In Test

---

## User Story

## User Story

**As a** user
**I want to** add discounts (percentage or fixed amount)
**So that** I can offer promotions to clients

## Acceptance Criteria

### Scenario 1: Add percentage discount

- ***Given:*** Subtotal is $1000
- ***When:*** I add 10% discount
- ***Then:*** Discount shows $100 and total is reduced

### Scenario 2: Add fixed amount discount

- ***Given:*** Subtotal is $1000
- ***When:*** I add $50 discount
- ***Then:*** Discount shows $50 and total is $950

### Scenario 3: No discount

- ***Given:*** I don't want to give a discount
- ***When:*** I leave discount at 0
- ***Then:*** No discount line appears on invoice

## Technical Notes

- Fields: discount*type (percentage|fixed), discount*value
- Discount applied before tax or after (configurable)
- Show discount line on invoice

## Story Points

2

## 🧪 QA Refinements (Shift-Left Analysis)

**Analysis Date:** 2026-02-05
**Status:** Refined by QA

### Refined Acceptance Criteria

- ***Scenario 1:*** Subtotal $1,000.00, tax 16%, descuento 10% ⇒ descuento $100.00, base $900.00, impuesto $144.00, total $1,044.00.
- ***Scenario 2:*** Subtotal $1,000.00, tax 16%, descuento fijo $50 ⇒ base $950.00, impuesto $152.00, total $1,102.00.
- ***Scenario 3:*** Descuento fijo > subtotal ⇒ descuento se limita al subtotal, total mínimo $0.00 y warning visible.
- ***Scenario 4:*** Descuento vacío o 0 ⇒ no se aplica y no se muestra línea.
- ***Scenario 5:*** Valores inválidos (negativos, porcentaje > 100) ⇒ error de validación y bloqueo de guardado.

### Edge Cases Identified

- Descuento fijo mayor al subtotal (cap + warning).
- Porcentaje > 100 o negativo (validation).
- Subtotal = 0 con descuento (total debe ser 0).
- Recalcular descuento al cambiar items.

### Clarified Business Rules

- Impuesto se calcula sobre (subtotal - descuento) según PO 2026-02-03.
- Descuento no puede generar total negativo (cap al subtotal).
- Falta definir política de redondeo a 2 decimales.

**Label:** shift-left-reviewed

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

## Traceability

### Bug (1)

- [SQ-97](https://upexgalaxy65.atlassian.net/browse/SQ-97): InvoiceCreation: Discounts: Porcentaje >100 no bloquea _(Ready For QA)_

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 3/2/2026
- **Reporter:** Ely
- **Assignee:** GENESIS OJOSE
- **Labels:** shift-left-reviewed

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:51.237Z_
