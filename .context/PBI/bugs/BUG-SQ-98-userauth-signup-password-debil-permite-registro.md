# BUG: UserAuth: Signup: Password debil permite registro

**Jira Key:** [SQ-98](https://upexgalaxy65.atlassian.net/browse/SQ-98)
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

El registro acepta una contraseña debil (sin mayuscula) y crea la cuenta, lo que incumple los criterios de seguridad en el flujo de signup.

---

*STEPS TO REPRODUCE*

#### Ir a https://staging-upexsoloq.vercel.app/signup

#### Ingresar un email valido

#### Ingresar password "soloq123" (sin mayuscula) y confirmar

#### Hacer clic en "Crear cuenta gratis"

---

*TECHNICAL ANALYSIS*

- *Network:* POST https://czuusjchqpgvanvbdrnz.supabase.co/auth/v1/signup (200)
- *Observacion:* No se rechaza la complejidad de password

---

*IMPACTO*

- Usuarios pueden crear cuentas con contraseñas inseguras
- Riesgo de seguridad y cumplimiento de AC

---

*RELATED STORIES*

- Relacionado: SQ-2

---

## 🐞 Actual Result

Al enviar el formulario con password debil, el registro se completa y aparece el mensaje "¡Revisa tu email!". El backend responde 200.

---

## ✅ Expected Result

El sistema debe validar la complejidad minima (incluyendo mayuscula) y bloquear el registro mostrando un error claro.

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
