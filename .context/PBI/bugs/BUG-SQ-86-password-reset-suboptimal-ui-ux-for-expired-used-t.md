# BUG: Password Reset: Suboptimal UI/UX for expired/used tokens.

**Jira Key:** [SQ-86](https://upexgalaxy65.atlassian.net/browse/SQ-86)
**Priority:** High
**Status:** Ready For QA
**Components:** None
**Severity:** Mayor
**Error Type:** Visual
**Test Environment:** Staging
**Fix Type:** Bugfix

---

## Description

_No description provided_

---

## 🐞 Actual Result

Al navegar a un enlace de restablecimiento de contraseña caducado o usado, la UI no muestra un mensaje explícito ni una opción para solicitar un nuevo enlace. La página solo muestra el formulario deshabilitado, lo que confunde al usuario.

---

## ✅ Expected Result

Debería mostrarse un modal o mensaje explícito informando al usuario sobre el estado del enlace y ofreciendo una opción directa para solicitar un nuevo enlace.

---

## 🧫 Evidence

URL [https://staging-upexsoloq.vercel.app/reset-password?error=access*denied&error*code=otp*expired&error*descriptio](https://staging-upexsoloq.vercel.app/reset-password?error=access*denied&error*code=otp*expired&error*descriptio) 
     n=Email+link+is+invalid+or+has+expired#error=access*denied&error*code=otp*expired&error*description=Email+link+
     is+invalid+or+has+expired&sb=



Screenshot: 



---

## Metadata

- **Created:** 2/19/2026
- **Updated:** 3/2/2026
- **Reporter:** Maxe Aguilera
- **Assignee:** Maxe Aguilera
- **Labels:** PasswordRecovery

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T21:26:10.958Z_
