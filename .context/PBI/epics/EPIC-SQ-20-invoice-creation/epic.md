# EPIC: Invoice Creation

**Jira Key:** [SQ-20](https://upexgalaxy65.atlassian.net/browse/SQ-20)
**Priority:** Medium
**Status:** Backlog
**Total Story Points:** 55

---

## Description

## Description

Creación y gestión de facturas. Incluye selección de cliente, líneas de items, cálculos automáticos, impuestos, descuentos, preview, numeración y fechas.

## Business Value

El core del producto. Sin la capacidad de crear facturas, SoloQ no tiene valor. Esta funcionalidad debe ser intuitiva, rápida y libre de errores de cálculo.

## Acceptance Criteria

- Usuario puede crear factura seleccionando cliente
- Usuario puede agregar líneas de items (descripción, cantidad, precio)
- Sistema calcula subtotal y total automáticamente
- Usuario puede agregar impuestos (IVA/porcentaje)
- Usuario puede agregar descuentos
- Usuario puede previsualizar factura antes de enviar
- Sistema asigna número único de factura
- Usuario puede establecer fecha de vencimiento
- Usuario puede agregar notas o términos
- Usuario puede guardar factura como borrador

## Technical Considerations

- Tabla invoices con estado (draft, sent, paid, overdue)
- Tabla invoice_items para líneas
- Cálculos precisos con decimales
- Numeración secuencial por usuario
- Detección automática de vencimiento

## Priority

CRITICAL

## Phase

Core Features (Sprint 3-4)

## 

## 🧪 QA Test Strategy - Shift-Left Analysis

**Analysis Date:** 2026-02-03
**Status:** Test Plan Ready

### Critical Risks Identified

- ***Risk 1 (High):*** Errores de cálculo en totales - Cálculos duplicados client/server side, precision testing
- ***Risk 2 (High):*** Condiciones de carrera en numeración - UNIQUE constraint, retry logic
- ***Risk 3 (Medium):*** UX confusa en selección de cliente - Selector con búsqueda, creación inline

### Test Coverage Summary

- ***Total Estimated Test Cases:*** 99
- ***Integration Points:*** 5 (Invoice↔Client, Invoice↔BusinessProfile, Invoice↔PaymentMethods, Frontend↔API, API↔DB)
- ***Critical User Journeys:*** 2 (First Invoice, Edit Flow)
- ***Test Complexity:*** High

### Critical Questions for Team

Ver comentario con test plan completo para detalles sobre:

- Orden de aplicación descuento vs impuesto
- Formato de número de factura configurable
- Comportamiento de auto-save con errores

### Test Strategy

- ***Levels:*** Unit, Integration, E2E, API
- ***Tools:*** Playwright, Vitest, Faker.js
- ***Timeline:*** 2 sprints (4 weeks) estimated

---

## User Stories

| Key | Story | Points | Priority | Status |
| --- | ----- | ------ | -------- | ------ |
| [SQ-21](https://upexgalaxy65.atlassian.net/browse/SQ-21) | Create Invoice by Selecting Client | 8 | Medium | Ready For QA |
| [SQ-22](https://upexgalaxy65.atlassian.net/browse/SQ-22) | Add Line Items to Invoice | 1 | Medium | Ready For QA |
| [SQ-23](https://upexgalaxy65.atlassian.net/browse/SQ-23) | Automatic Subtotal and Total Calculation | 8 | Medium | QA Approved |
| [SQ-24](https://upexgalaxy65.atlassian.net/browse/SQ-24) | Add Taxes to Invoice | 3 | Medium | In Test |
| [SQ-25](https://upexgalaxy65.atlassian.net/browse/SQ-25) | Add Discounts to Invoice | 2 | Medium | In Test |
| [SQ-26](https://upexgalaxy65.atlassian.net/browse/SQ-26) | Preview Invoice Before Sending | 8 | Medium | Ready For QA |
| [SQ-27](https://upexgalaxy65.atlassian.net/browse/SQ-27) | Assign Unique Invoice Number | 7 | Medium | Ready For QA |
| [SQ-28](https://upexgalaxy65.atlassian.net/browse/SQ-28) | Set Invoice Due Date | 5 | Medium | Ready For QA |
| [SQ-29](https://upexgalaxy65.atlassian.net/browse/SQ-29) | Add Notes and Terms to Invoice | 8 | Medium | Ready For QA |
| [SQ-30](https://upexgalaxy65.atlassian.net/browse/SQ-30) | Save Invoice as Draft | 5 | Medium | Ready For QA |

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 2/7/2026
- **Reporter:** Ely
- **Assignee:** Unassigned
- **Labels:** test-plan-ready

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:49.011Z_
