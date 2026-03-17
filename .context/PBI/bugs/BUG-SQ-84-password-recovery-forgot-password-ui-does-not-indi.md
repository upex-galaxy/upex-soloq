# BUG: Password Recovery: Forgot Password UI does not indicate when email rate limit is exceeded.

**Jira Key:** [SQ-84](https://upexgalaxy65.atlassian.net/browse/SQ-84)
**Priority:** Medium
**Status:** Enhancement
**Components:** None
**Severity:** Moderada
**Error Type:** Functional
**Test Environment:** Staging
**Fix Type:** Bugfix

---

## Description

_No description provided_

---

## 🐞 Actual Result

Al exceder el límite de solicitudes de recuperación de contraseña por email (3/hora), la UI continúa mostrando el mensaje genérico "Si existe una cuenta para [email], enviamos un link de recuperación." en lugar de un mensaje específico de límite de tasa.

---

## ✅ Expected Result

Se debería mostrar un mensaje genérico que indique que la solicitud no puede ser procesada en este momento.

---

## 🔍 Root Cause

**Category:** Config/Env Error 

---

## Metadata

- **Created:** 2/19/2026
- **Updated:** 2/19/2026
- **Reporter:** Maxe Aguilera
- **Assignee:** Maxe Aguilera

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T21:26:10.956Z_
