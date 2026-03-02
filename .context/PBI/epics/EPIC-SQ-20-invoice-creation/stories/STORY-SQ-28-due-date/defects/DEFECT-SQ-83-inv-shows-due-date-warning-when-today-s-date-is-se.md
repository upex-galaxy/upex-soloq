# DEFECT: INV | Shows due date warning when today's date is selected

**Jira Key:** [SQ-83](https://upexgalaxy65.atlassian.net/browse/SQ-83)
**Related Story:** [SQ-28](https://upexgalaxy65.atlassian.net/browse/SQ-28) - Set Invoice Due Date
**Priority:** Medium
**Status:** Ready For QA
**Components:** None
**Severity:** Moderada
**Error Type:** Functional
**Test Environment:** Staging
**Fix Type:** Bugfix

---

## Description

Validar selección de "Hoy" como vencimiento.

***Prerequisites:***

- Crear nueva factura habilitado.

1. Open the website: [SoloQ - Facturación para Freelancers](https://staging-upexsoloq.vercel.app/)
2. Click on “Sign in.”
3. Enter your credentials and log in
4. Select the Invoices menu.
5. Click on the "New Invoice" button.
6. Select Today's date from the presets or the calendar.

---

## 🐞 Actual Result

Shows due date warning when today's date is selected.

---

## ✅ Expected Result

Allows selecting the current date without showing warnings.

---

## Related Issues

- blocks: [SQ-28](https://upexgalaxy65.atlassian.net/browse/SQ-28) - Set Invoice Due Date

---

## Metadata

- **Created:** 2/17/2026
- **Updated:** 3/2/2026
- **Reporter:** Yaneth Quintero
- **Assignee:** Yaneth Quintero
- **Labels:** invoice-creation

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T21:26:24.164Z_
