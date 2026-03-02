# DEFECT: UAO | The user cannot log out after refreshing the page several times.

**Jira Key:** [SQ-74](https://upexgalaxy65.atlassian.net/browse/SQ-74)
**Related Story:** [SQ-3](https://upexgalaxy65.atlassian.net/browse/SQ-3) - User Login with Credentials
**Priority:** Highest
**Status:** Ready For QA
**Components:** None
**Severity:** Crítica
**Error Type:** Functional
**Test Environment:** Staging
**Fix Type:** Bugfix

---

## Description

Prerequisites:

- The user has created a new account.

1. Open the website: [SoloQ - Facturación para Freelancers](https://staging-upexsoloq.vercel.app/)

1. Click on “Sign in.”
2. Enter your credentials and log in.
3. Refresh the page several times until you see the username change to “Usuario.”
4. Click on the profile and click “Cerrar Sesión”.

---

## 🐞 Actual Result

After restarting the website several times, the username changes to “Usuario” and when the user tries to log out, it does not work.

Note: I cannot display the “Network” section using Chrome Dev Tools because it does not reproduce. It is as if it were related to a desync, because when the page is restarted, the username reappears correctly, allowing the user to log out.

---

## ✅ Expected Result

The session should close correctly and redirect the user to the “Log in” section.

---

## 🔍 Root Cause

**Category:** Code Error

---

## 🚩 Workaround

Refresh the page until the correct username appears.

---

## 🧫 Evidence





---

## Related Issues

- blocks: [SQ-3](https://upexgalaxy65.atlassian.net/browse/SQ-3) - User Login with Credentials

---

## Metadata

- **Created:** 2/9/2026
- **Updated:** 3/2/2026
- **Reporter:** Joel Armando Ramírez Rodríguez
- **Assignee:** Joel Armando Ramírez Rodríguez
- **Labels:** SignOut, usuario

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T21:26:24.162Z_
