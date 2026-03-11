# BUG: UserAuth: Signup: Validaciones solo frontend sin rechazo backend

**Jira Key:** [SQ-102](https://upexgalaxy65.atlassian.net/browse/SQ-102)
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

Las validaciones del registro dependen del frontend y el backend no rechaza entradas invalidas (ej. password debil), permitiendo crear cuentas con datos que no cumplen criterios.

---

*STEPS TO REPRODUCE*

#### Ir a https://staging-upexsoloq.vercel.app/signup

#### Enviar un password debil (ej: "soloq123")

#### Observar que el backend responde 200 y se crea la cuenta

---

*TECHNICAL ANALYSIS*

- *Network:* POST https://czuusjchqpgvanvbdrnz.supabase.co/auth/v1/signup (200)
- *Observacion:* No hay validacion server-side de reglas de password

---

*IMPACTO*

- Seguridad debilitada; validaciones pueden bypassarse
- Riesgo de datos de baja calidad

---

*RELATED STORIES*

- Relacionado: SQ-2

---

## 🐞 Actual Result

El backend acepta datos que no cumplen reglas (p.ej. password debil) y crea la cuenta.

---

## ✅ Expected Result

El backend debe validar reglas de registro y rechazar datos invalidos aunque el frontend falle.

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
