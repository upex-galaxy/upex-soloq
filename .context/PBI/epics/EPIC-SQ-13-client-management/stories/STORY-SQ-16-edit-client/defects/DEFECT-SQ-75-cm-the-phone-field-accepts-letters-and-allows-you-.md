# DEFECT: CM | The “Phone” field accepts letters and allows you to save it without any errors.

**Jira Key:** [SQ-75](https://upexgalaxy65.atlassian.net/browse/SQ-75)
**Related Story:** [SQ-16](https://upexgalaxy65.atlassian.net/browse/SQ-16) - Edit Client Data
**Priority:** Medium
**Status:** CLOSED
**Components:** None
**Severity:** Moderada
**Error Type:** Functional
**Test Environment:** Staging
**Fix Type:** Bugfix

---

## Description

Prerequisites:

- The user has an account created on the website.

- The user has added a new customer.

1. Open the website: [SoloQ - Facturación para Freelancers](https://staging-upexsoloq.vercel.app/)

1. Log in to the website.

1. Go to the “Customers” section.

1. Click on the customer added previously.
2. Add letters in the “Teléfono” field and save the changes.

---

## 🐞 Actual Result

The “Phone” field accepts letters and allows you to save it without any errors.

---

## ✅ Expected Result

The “Phone” field should only accept the + prefix and numbers.

---

## 🔍 Root Cause

**Category:** Code Error

---

## 🚩 Workaround

N/A

---

## Related Issues

- blocks: [SQ-16](https://upexgalaxy65.atlassian.net/browse/SQ-16) - Edit Client Data

---

## Metadata

- **Created:** 2/9/2026
- **Updated:** 3/1/2026
- **Reporter:** Joel Armando Ramírez Rodríguez
- **Assignee:** Joel Armando Ramírez Rodríguez
- **Labels:** FIELD, PhoneField, editarcliente

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T21:26:24.163Z_
