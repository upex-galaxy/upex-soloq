# BUG: UserAuth: Signup: Email invalido no muestra error

**Jira Key:** [SQ-99](https://upexgalaxy65.atlassian.net/browse/SQ-99)
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

El formulario de registro permite ingresar un email invalido y al enviar no se muestra mensaje de error ni feedback.

---

*STEPS TO REPRODUCE*

#### Ir a https://staging-upexsoloq.vercel.app/signup

#### Ingresar email "not-an-email"

#### Ingresar password "Soloq123" y confirmar

#### Hacer clic en "Crear cuenta gratis"

---

*TECHNICAL ANALYSIS*

- *Observacion:* No aparece error en UI
- *Network:* No se observa llamada de signup cuando el email es invalido

---

*IMPACTO*

- UX confusa; el usuario no sabe por que no avanza
- Riesgo de registros con datos invalidos si se bypassa validacion

---

*RELATED STORIES*

- Relacionado: SQ-2

---

## 🐞 Actual Result

Al enviar el formulario con email invalido, no se muestra mensaje de error ni feedback visible.

---

## ✅ Expected Result

El sistema debe mostrar un error claro de formato de email y bloquear el envio.

---

## 🔍 Root Cause

**Category:** Code Error

---

## Related Issues

- blocks: [SQ-2](https://upexgalaxy65.atlassian.net/browse/SQ-2) - User Registration with Email and Password

---

## Metadata

- **Created:** 3/1/2026
- **Updated:** 3/2/2026
- **Reporter:** Samuel Amonzabel
- **Assignee:** Samuel Amonzabel
- **Labels:** auth, bug, exploratory-testing, signup

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T21:26:10.959Z_
