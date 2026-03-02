# DEFECT: CM | The breadcrumb displays the user_ID when editing a customer.

**Jira Key:** [SQ-71](https://upexgalaxy65.atlassian.net/browse/SQ-71)
**Related Story:** [SQ-16](https://upexgalaxy65.atlassian.net/browse/SQ-16) - Edit Client Data
**Priority:** High
**Status:** CLOSED
**Components:** None
**Severity:** Mayor
**Error Type:** Functional
**Test Environment:** Staging
**Fix Type:** Bugfix

---

## Description

Prerequisites:

- The user has an account created on the website.

- The user has added a new customer.

1. Open the website: [https://staging-upexsoloq.vercel.app/](https://staging-upexsoloq.vercel.app/) 

1. Log in to the website.

1. Go to the “Customers” section.

1. Click on the customer added previously.

---

## 🐞 Actual Result

The user_id assigned by the database is displayed in the customer breadcrumb , and is also displayed in the URL.

---

## ✅ Expected Result

The customer's name should appear in the breadcrumb trail and not be displayed in the website URL.

---

## 🔍 Root Cause

**Category:** Code Error

---

## 🚩 Workaround

N/A

---

## 🧫 Evidence





---

## Related Issues

- blocks: [SQ-16](https://upexgalaxy65.atlassian.net/browse/SQ-16) - Edit Client Data

---

## Metadata

- **Created:** 2/9/2026
- **Updated:** 3/2/2026
- **Reporter:** Joel Armando Ramírez Rodríguez
- **Assignee:** Joel Armando Ramírez Rodríguez
- **Labels:** Customer, Edit, PerfilDelCliente

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T21:26:24.162Z_
