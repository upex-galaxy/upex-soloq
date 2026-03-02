# BUG: InvoiceCreation: Discounts: Porcentaje 60% se convierte en 600%

**Jira Key:** [SQ-96](https://upexgalaxy65.atlassian.net/browse/SQ-96)
**Priority:** High
**Status:** Ready For QA
**Components:** None
**Severity:** Moderada
**Error Type:** Functional
**Test Environment:** Staging
**Fix Type:** Bugfix

---

## Description

*RESUMEN*

Al crear una factura con descuento porcentual del 60%, la API devuelve discount_value=600 (monto) y el frontend lo interpreta como porcentaje. Al editar la factura, el request envía discountValue=600 y la API responde 400.

---

*STEPS TO REPRODUCE*

#### Login como usuario demo

#### Ir a /invoices/create

#### Crear item con subtotal USD 1,000 e IVA 16%

#### Seleccionar descuento porcentual e ingresar 60

#### Guardar como borrador y abrir la factura creada en edición

#### Observar que el porcentaje muestra 600% y el autosave envía discountValue=600 → 400

---

*TECHNICAL ANALYSIS*

- *Archivo:* Investigation needed
- *Función:* Investigation needed
- *Network:* POST /api/invoices retorna discount_value=600; PUT /api/invoices/{id} envía discountValue=600
- *Console:* Sin errores relevantes

---

*IMPACTO*

- La UI muestra porcentajes incorrectos (600%)
- La API rechaza el autosave por porcentaje >100%

---

*RELATED STORIES*

- Relacionado: SQ-25

---

## Metadata

- **Created:** 3/1/2026
- **Updated:** 3/1/2026
- **Reporter:** GENESIS OJOSE
- **Assignee:** GENESIS OJOSE
- **Labels:** bug, exploratory-testing

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T21:26:10.959Z_
