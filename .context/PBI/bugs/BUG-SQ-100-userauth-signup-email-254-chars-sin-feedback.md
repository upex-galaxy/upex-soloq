# BUG: UserAuth: Signup: Email 254 chars sin feedback

**Jira Key:** [SQ-100](https://upexgalaxy65.atlassian.net/browse/SQ-100)
**Priority:** Medium
**Status:** Enhancement
**Components:** None
**Severity:** Moderada
**Error Type:** Functional
**Test Environment:** Staging
**Fix Type:** Bugfix

---

## Description

*RESUMEN*

Al ingresar un email con longitud maxima valida (254 caracteres) el formulario no responde ni muestra error al enviar.

---

*STEPS TO REPRODUCE*

#### Ir a https://staging-upexsoloq.vercel.app/signup

#### Ingresar un email de 254 caracteres

#### Ingresar password "Soloq123" y confirmar

#### Hacer clic en "Crear cuenta gratis"

---

*TECHNICAL ANALYSIS*

- *Observacion:* No se muestra feedback ni error
- *Network:* No se observa llamada de signup

---

*IMPACTO*

- Usuarios con emails largos no pueden registrarse
- Bloqueo silencioso del flujo

---

*RELATED STORIES*

- Relacionado: SQ-2

---

## 🐞 Actual Result

Con un email de 254 caracteres, al enviar no ocurre nada y no se muestra error.

---

## ✅ Expected Result

El sistema debe aceptar el email maximo valido o mostrar un error claro si no se permite.

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
_Last sync: 2026-03-02T21:26:10.960Z_
