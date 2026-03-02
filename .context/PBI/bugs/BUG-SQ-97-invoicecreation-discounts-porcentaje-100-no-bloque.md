# BUG: InvoiceCreation: Discounts: Porcentaje >100 no bloquea

**Jira Key:** [SQ-97](https://upexgalaxy65.atlassian.net/browse/SQ-97)
**Priority:** High
**Status:** Ready For QA
**Components:** None
**Severity:** Mayor
**Error Type:** Functional
**Test Environment:** Staging
**Fix Type:** Bugfix

---

## Description

*RESUMEN*

Al ingresar un descuento porcentual mayor a 100 (ej. 110%), el sistema solo limita al subtotal con un warning pero no bloquea ni muestra error de validación. Esto incumple lo definido en la US.

---

*STEPS TO REPRODUCE*

#### Login como usuario demo

#### Ir a /invoices/create

#### Configurar subtotal USD 1,000 e IVA 16%

#### Seleccionar descuento porcentual e ingresar 110

#### Observar warning y que Guardar como borrador sigue habilitado

---

*TECHNICAL ANALYSIS*

- *Archivo:* Investigation needed
- *Función:* Investigation needed
- *Network:* N/A
- *Console:* Sin errores relevantes

---

*IMPACTO*

- Usuarios pueden aplicar porcentajes inválidos sin bloqueo
- Inconsistencia con validaciones definidas en la US

---

*RELATED STORIES*

- Relacionado: SQ-25

---

## Related Issues

- relates to: [SQ-25](https://upexgalaxy65.atlassian.net/browse/SQ-25) - Add Discounts to Invoice

---

## Metadata

- **Created:** 3/1/2026
- **Updated:** 3/2/2026
- **Reporter:** GENESIS OJOSE
- **Assignee:** GENESIS OJOSE
- **Labels:** bug, exploratory-testing

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T21:26:10.959Z_
