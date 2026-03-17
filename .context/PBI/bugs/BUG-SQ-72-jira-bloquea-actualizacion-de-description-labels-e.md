# BUG: Jira bloquea actualizacion de description/labels en Epics (SQ-37)

**Jira Key:** [SQ-72](https://upexgalaxy65.atlassian.net/browse/SQ-72)
**Priority:** Medium
**Status:** Enhancement
**Components:** None
**Fix Type:** Bugfix

---

## Description

Contexto:
Al intentar actualizar el Epic [https://upexgalaxy65.atlassian.net/browse/SQ-37#icft=SQ-37](https://upexgalaxy65.atlassian.net/browse/SQ-37#icft=SQ-37) via API, Jira rechaza los campos `description` y `labels` con:

- "Field 'description' cannot be set. It is not on the appropriate screen, or unknown."
- "Field 'labels' cannot be set. It is not on the appropriate screen, or unknown."

Impacto:

El flujo QA "Jira-First → Local Mirror" no puede completar la actualizacion del epic ni sincronizar el feature test plan.

Expected:
En el issue type Epic del proyecto SQ, habilitar en la pantalla:

- Description
- Labels
- Customfield_10045 (Feature Test Plan QA), si aplica

Actual:

Los campos no estan en la pantalla correspondiente, por lo que la actualizacion falla.

Request:
Revisar Screen Scheme/Issue Type Screen Scheme y habilitar esos campos para Epic en SQ.

Relacionado:
Epic [https://upexgalaxy65.atlassian.net/browse/SQ-37#icft=SQ-37](https://upexgalaxy65.atlassian.net/browse/SQ-37#icft=SQ-37) (Invoice Sending).

---

## 🔍 Root Cause

**Category:** Working As Designed (WAD)

---

## Metadata

- **Created:** 2/9/2026
- **Updated:** 3/2/2026
- **Reporter:** yxsinell acosta zambrano
- **Assignee:** yxsinell acosta zambrano

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T21:26:10.955Z_
