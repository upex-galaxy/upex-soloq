# BUG: UserAuth: Signup: No hay icono para ver contrasena

**Jira Key:** [SQ-101](https://upexgalaxy65.atlassian.net/browse/SQ-101)
**Priority:** Low
**Status:** Enhancement
**Components:** None
**Severity:** Menor
**Error Type:** Visual
**Test Environment:** Staging
**Fix Type:** Bugfix

---

## Description

*RESUMEN*

En el formulario de registro no existe un icono de "ojo" para mostrar/ocultar la contraseña, lo que dificulta la entrada correcta.

---

*STEPS TO REPRODUCE*

#### Ir a https://staging-upexsoloq.vercel.app/signup

#### Revisar los campos de password y confirmar

#### Observar que no hay control para mostrar la contraseña

---

*TECHNICAL ANALYSIS*

- *UI:* Inputs tipo password sin toggle

---

*IMPACTO*

- Aumenta errores de tipeo en password
- Peor experiencia de usuario

---

*RELATED STORIES*

- Relacionado: SQ-2

---

## 🐞 Actual Result

Los campos de contraseña no ofrecen un toggle para visualizar el texto (icono ojo).

---

## ✅ Expected Result

Debe existir un control para mostrar/ocultar la contraseña en los campos de signup.

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
